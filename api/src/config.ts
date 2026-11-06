import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  // How many reverse proxies sit in front of the API. 0 = none: client IPs come from the TCP connection.
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  // Public tracking lookups allowed per client every 15 minutes.
  TRACKING_LIMIT: z.coerce.number().int().min(1).default(60),
  JWT_SECRET: z.string().min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
  DEMO_USER: z.string().min(1),
  DEMO_PASSWORD: z.string().min(8, "DEMO_PASSWORD debe tener al menos 8 caracteres"),
});

export type Config = z.infer<typeof schema>;

/** Fails fast: the server must not start with a missing or weak secret. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Configuración inválida (${problems}). Revisá .env.example.`);
  }
  return parsed.data;
}
