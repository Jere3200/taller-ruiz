import type { RequestHandler } from "express";
import { rateLimit } from "express-rate-limit";
import type { ZodType } from "zod";
import { unauthorized, validationError } from "../domain/errors";
import type { AuthService } from "../services/authService";

export function requireAuth(auth: AuthService): RequestHandler {
  return (req, _res, next) => {
    const header = req.header("authorization") ?? "";
    const [scheme, token] = header.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) return next(unauthorized());
    try {
      auth.verify(token);
      next();
    } catch (err) {
      next(err);
    }
  };
}

/** Parses with Zod; a failure becomes a 400 with a generic message. */
export function parse<T>(schema: ZodType<T>, data: unknown, message: string): T {
  const result = schema.safeParse(data);
  if (!result.success) throw validationError(message);
  return result.data;
}

export function limiter(limit: number, windowMs: number, options: { skipSuccessfulRequests?: boolean } = {}) {
  return rateLimit({
    limit,
    windowMs,
    skipSuccessfulRequests: options.skipSuccessfulRequests ?? false,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ error: "TOO_MANY_REQUESTS", message: "Demasiados intentos. Esperá un momento y volvé a probar." });
    },
  });
}
