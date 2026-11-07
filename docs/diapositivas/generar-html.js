/**
 * Arma presentacion.html: una presentación interactiva en un solo archivo, que funciona sin internet.
 *
 * Uso:  node generar-html.js
 *
 * Toma plantilla.html y le incrusta: el logo del taller separado en partes para animarlo (la llave inglesa,
 * la tuerca y cada letra), las imágenes (en base64) y los datos de ../propuesta/datos.json.
 * Para cambiar textos o estilos se edita plantilla.html y se vuelve a correr este script.
 */
const fs = require("fs");
const path = require("path");

const AQUI = __dirname;
const DATOS = JSON.parse(fs.readFileSync(path.join(AQUI, "..", "propuesta", "datos.json"), "utf8"));
const LOGOS = path.join(AQUI, "..", "..", "web", "public");

/** Lee un logo SVG y devuelve sus <path> separados en { marca, llave, letras }. */
function partesDelLogo(archivo) {
  const svg = fs.readFileSync(path.join(LOGOS, archivo), "utf8");
  const paths = [...svg.matchAll(/<path\s+fill="(#[0-9A-Fa-f]{6})"\s+d="([^"]+)"\s*\/?>/g)].map((m) => ({
    fill: m[1],
    d: m[2],
    x: parseFloat(m[2].match(/^M\s*([\d.]+)/)[1]),
  }));
  if (paths.length !== 14) throw new Error(`${archivo}: se esperaban 14 trazos y hay ${paths.length}`);
  const marca = paths.filter((p) => p.x < 410);
  const letras = paths.filter((p) => p.x >= 410).sort((a, b) => a.x - b.x);
  // La llave inglesa son el mango (empieza en x=267) y la cabeza naranja; el resto es la tuerca.
  const llave = marca.filter((p) => p.fill.toUpperCase() === "#E46715" || Math.round(p.x) === 267);
  const tuerca = marca.filter((p) => !llave.includes(p));
  if (llave.length !== 2 || tuerca.length !== 2 || letras.length !== 10) {
    throw new Error(`${archivo}: no se pudo separar el logo (llave ${llave.length}, tuerca ${tuerca.length}, letras ${letras.length})`);
  }
  return { llave, tuerca, letras };
}

const tr = (p) => `<path fill="${p.fill}" d="${p.d}"/>`;

/** Logo animado: la llave se balancea sobre su ojal y las letras entran una a una. `solo` = solo la marca. */
function logoSvg(archivo, { solo = false, clase = "" } = {}) {
  const { llave, tuerca, letras } = partesDelLogo(archivo);
  const vb = solo ? "135 265 280 295" : "135 265 1010 295";
  const pivote = "170.4 526.9"; // ojal del mango
  const swing = `<animateTransform attributeName="transform" type="rotate" calcMode="spline" dur="4.2s" repeatCount="indefinite"
      values="0 ${pivote};-11 ${pivote};-11 ${pivote};0 ${pivote};0 ${pivote}" keyTimes="0;0.22;0.4;0.62;1"
      keySplines="0.4 0 0.2 1;0.5 0 0.5 1;0.4 0 0.2 1;0.5 0 0.5 1"/>`;
  const marca = `<g class="tuerca">${tuerca.map(tr).join("")}</g><g class="llave">${swing}${llave.map(tr).join("")}</g>`;
  const texto = solo ? "" : `<g class="letras">${letras.map((p, i) => `<g class="l" style="--i:${i}">${tr(p)}</g>`).join("")}</g>`;
  return `<svg class="logo ${clase}" viewBox="${vb}" role="img" aria-label="Taller Ruiz">${marca}${texto}</svg>`;
}

const base64 = (archivo) => fs.readFileSync(path.join(AQUI, "img", archivo)).toString("base64");

let html = fs.readFileSync(path.join(AQUI, "plantilla.html"), "utf8");
const reemplazos = {
  "{{LOGO_CLARO}}": logoSvg("logo-light.svg", { clase: "logo-grande" }),
  "{{LOGO_MARCA_CLARA}}": logoSvg("logo-light.svg", { solo: true, clase: "logo-marca" }),
  "{{LOGO_MARCA_OSCURA}}": logoSvg("logo.svg", { solo: true, clase: "logo-marca" }),
  "{{IMG_WIREFRAME}}": `data:image/png;base64,${base64("wireframe-tablero.png")}`,
  "{{IMG_PANEL}}": `data:image/png;base64,${base64("panel.png")}`,
  "{{IMG_DETALLE}}": `data:image/png;base64,${base64("detalle.png")}`,
  "/*DATOS*/null": JSON.stringify({
    consultora: DATOS.consultora,
    integrantes: DATOS.integrantes,
    moneda: DATOS.moneda,
    valorHora: DATOS.valor_hora,
    cotizacion: DATOS.cotizacion,
  }),
};
for (const [marca, valor] of Object.entries(reemplazos)) {
  if (!html.includes(marca)) throw new Error(`La plantilla no tiene ${marca}`);
  html = html.split(marca).join(valor);
}
if (html.includes(String.fromCharCode(183))) throw new Error("La plantilla tiene un punto medio");

const salida = path.join(AQUI, "presentacion.html");
fs.writeFileSync(salida, html);
console.log(`Generado: ${salida} (${(html.length / 1024).toFixed(0)} KB)`);
