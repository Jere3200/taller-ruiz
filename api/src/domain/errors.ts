/** Error with a stable HTTP mapping. Messages are safe to show to users. */
export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
    readonly extra: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const orderNotFound = () =>
  new AppError(404, "ORDER_NOT_FOUND", "No se encontró la orden solicitada.");

export const invalidTransition = (allowed: readonly string[]) =>
  new AppError(422, "INVALID_TRANSITION", "El cambio de estado no es válido para el estado actual de la orden.", {
    allowed,
  });

export const validationError = (message: string) => new AppError(400, "VALIDATION_ERROR", message);

export const invalidCredentials = () =>
  new AppError(401, "INVALID_CREDENTIALS", "Usuario o contraseña incorrectos.");

export const unauthorized = () =>
  new AppError(401, "UNAUTHORIZED", "Necesitás iniciar sesión para acceder a este recurso.");
