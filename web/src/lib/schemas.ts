import { z } from "zod";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Ingresá tu usuario."),
  password: z.string().min(1, "Ingresá tu contraseña."),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type LoginErrors = Partial<Record<keyof LoginValues, string>>;

export type LoginValidation = { ok: true; values: LoginValues } | { ok: false; errors: LoginErrors };

/**
 * Client-side validation is only UX (it saves a round trip); the API validates again and is the one that counts.
 * The password is never trimmed.
 */
export function validateLogin(input: { username: string; password: string }): LoginValidation {
  const parsed = loginSchema.safeParse(input);
  if (parsed.success) return { ok: true, values: parsed.data };

  const errors: LoginErrors = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    if ((field === "username" || field === "password") && !errors[field]) errors[field] = issue.message;
  }
  return { ok: false, errors };
}
