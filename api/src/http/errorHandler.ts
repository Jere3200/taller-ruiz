import type { ErrorRequestHandler, RequestHandler } from "express";
import { AppError } from "../domain/errors";

export type Logger = (message: string, err?: unknown) => void;

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "NOT_FOUND", message: "La ruta solicitada no existe." });
};

/** Generic output to the client; details only go to the server log. */
export function createErrorHandler(log: Logger): ErrorRequestHandler {
  return (err, _req, res, next) => {
    if (res.headersSent) return next(err);

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.code, message: err.message, ...err.extra });
    }

    const type = (err as { type?: string } | null)?.type;
    if (type === "entity.parse.failed") {
      return res.status(400).json({ error: "VALIDATION_ERROR", message: "El cuerpo de la petición no es un JSON válido." });
    }
    if (type === "entity.too.large") {
      return res.status(413).json({ error: "PAYLOAD_TOO_LARGE", message: "El cuerpo de la petición es demasiado grande." });
    }

    log("Unhandled error", err);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Ocurrió un error inesperado. Intentá de nuevo más tarde." });
  };
}
