import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),
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
