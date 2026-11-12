/**
 * Starts the whole PoC locally for the demo: installs dependencies if missing, starts the API and the front,
 * checks the invalid-transition rule (422) and opens the browser.
 *
 * Usage: node scripts/demo.mjs   (or double-click "Iniciar demo.cmd" on Windows)
 *
 * No .env file is needed: a fresh JWT secret and demo password are generated on every run and printed on screen.
 * Data lives in memory, so every run starts from the sample orders.
 */
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createWriteStream, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API_DIR = path.join(ROOT, "api");
const WEB_DIR = path.join(ROOT, "web");
const API_URL = "http://localhost:4000";
const WEB_URL = "http://localhost:3000";
const IS_WINDOWS = process.platform === "win32";

const DEMO_USER = "daniel";
const DEMO_PASSWORD = `taller-${randomBytes(3).toString("hex")}`;
const JWT_SECRET = randomBytes(32).toString("hex");

const children = [];

function log(message = "") {
  process.stdout.write(`${message}\n`);
}

function fail(message) {
  log(`\nERROR: ${message}`);
  stopAll();
  process.exit(1);
}

function ensureDependencies(dir, name) {
  if (existsSync(path.join(dir, "node_modules"))) return;
  log(`Instalando dependencias de ${name} (solo la primera vez, tarda unos minutos)...`);
  const result = spawnSync("npm install", { cwd: dir, shell: true, stdio: "inherit" });
  if (result.status !== 0) fail(`no se pudieron instalar las dependencias de ${name}.`);
}

async function isUp(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    return response.status < 500;
  } catch {
    return false;
  }
}

async function waitFor(url, seconds, name, logFile) {
  const deadline = Date.now() + seconds * 1000;
  while (Date.now() < deadline) {
    if (await isUp(url)) return;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  fail(`${name} no respondió en ${seconds} segundos. Revisá el registro: ${logFile}`);
}

function start(name, command, cwd, env) {
  const logFile = path.join(tmpdir(), `taller-ruiz-${name}.log`);
  const out = createWriteStream(logFile);
  const child = spawn(command, { cwd, env: { ...process.env, ...env }, shell: true, detached: !IS_WINDOWS });
  child.stdout.pipe(out);
  child.stderr.pipe(out);
  child.on("exit", (code) => {
    if (!stopping) fail(`${name} se cerró (código ${code}). Revisá el registro: ${logFile}`);
  });
  children.push(child);
  return logFile;
}

let stopping = false;
function stopAll() {
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null) continue;
    if (IS_WINDOWS) spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    else {
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch {
        // already gone
      }
    }
  }
}

async function checkInvalidTransition() {
  const login = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: DEMO_USER, password: DEMO_PASSWORD }),
  });
  if (!login.ok) return { ok: false, detail: `el login respondió ${login.status}` };
  const { token } = await login.json();
  const patch = await fetch(`${API_URL}/api/orders/wo-001/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: "delivered" }),
  });
  const body = await patch.json();
  return { ok: patch.status === 422, token, detail: `${patch.status} ${body.error ?? ""}`, allowed: body.allowed ?? [] };
}

function openBrowser(url) {
  const command = IS_WINDOWS ? `start "" "${url}"` : process.platform === "darwin" ? `open "${url}"` : `xdg-open "${url}"`;
  spawn(command, { shell: true, stdio: "ignore", detached: true }).unref();
}

process.on("SIGINT", () => {
  log("\nCerrando la API y el front...");
  stopAll();
  process.exit(0);
});

log("Taller Ruiz: demo local de la prueba de concepto\n");

if ((await isUp(`${API_URL}/api/tracking/TR-1042`)) || (await isUp(WEB_URL))) {
  fail("los puertos 4000 o 3000 ya están en uso. Cerrá la demo anterior (o la ventana que la tiene abierta) y volvé a intentar.");
}

ensureDependencies(API_DIR, "la API");
ensureDependencies(WEB_DIR, "el front");

log("Levantando la API en el puerto 4000...");
const apiLog = start("api", "npx tsx src/server.ts", API_DIR, {
  PORT: "4000",
  CORS_ORIGIN: WEB_URL,
  TRUST_PROXY: "0",
  TRACKING_LIMIT: "600",
  JWT_SECRET,
  DEMO_USER,
  DEMO_PASSWORD,
});
await waitFor(`${API_URL}/api/tracking/TR-1042`, 60, "La API", apiLog);

log("Levantando el front en el puerto 3000 (la primera carga tarda un poco)...");
const webLog = start("web", "npm run dev", WEB_DIR, {});
await waitFor(WEB_URL, 180, "El front", webLog);
await isUp(`${WEB_URL}/seguimiento?codigo=TR-1042`);

const check = await checkInvalidTransition();
if (!check.ok) fail(`la comprobación del salto inválido no dio 422 (${check.detail}).`);

openBrowser(`${WEB_URL}/seguimiento?codigo=TR-1042`);

log(`
==================================================================
 LISTO. La demo está corriendo.

 Seguimiento del cliente:  ${WEB_URL}/seguimiento?codigo=TR-1042
 Panel de empleados:       ${WEB_URL}/login
   Usuario:     ${DEMO_USER}
   Contraseña:  ${DEMO_PASSWORD}

 Comprobación automática: un salto de "En diagnóstico" a "Entregado"
 respondió ${check.detail}, con permitidos: ${check.allowed.join(", ")}.

 Salto inválido en Postman o Thunder Client:
   PATCH ${API_URL}/api/orders/wo-001/status
   Header  Authorization: Bearer ${check.token}
   Body    {"status": "delivered"}
   Respuesta esperada: 422

 Para cerrar todo: Ctrl + C en esta ventana (o cerrarla).
 Al volver a abrir, las órdenes vuelven al estado inicial.
==================================================================
`);
