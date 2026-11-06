import { describe, expect, it } from "vitest";
import { ApiError } from "./api";
import { changeErrorMessage, confirmationCopy } from "./statusChange";

describe("changeErrorMessage", () => {
  it("muestra el mensaje de la API cuando la transición es inválida (422)", () => {
    const error = new ApiError(422, { error: "INVALID_TRANSITION", message: "No se puede pasar de A a B." });

    expect(changeErrorMessage(error)).toBe("No se puede pasar de A a B.");
  });

  it("usa un texto propio cuando el 422 no trae mensaje", () => {
    expect(changeErrorMessage(new ApiError(422, {}))).toBe("Ese cambio de estado no está permitido.");
  });

  it("avisa que la orden ya no existe ante un 404", () => {
    expect(changeErrorMessage(new ApiError(404, {}))).toBe("La orden ya no existe.");
  });

  it("avisa que no hay conexión cuando la API no responde", () => {
    expect(changeErrorMessage(new ApiError(0, {}))).toBe("No pudimos conectarnos con el servidor.");
  });

  it("no filtra detalles internos ante un error inesperado", () => {
    const error = new ApiError(500, { message: "stack trace at /srv/app" });

    expect(changeErrorMessage(error)).toBe("No pudimos actualizar el estado. Probá de nuevo.");
  });

  it("tolera un error que no es de la API", () => {
    expect(changeErrorMessage(new Error("boom"))).toBe("No pudimos actualizar el estado. Probá de nuevo.");
  });
});

describe("confirmationCopy", () => {
  it("advierte que cancelar es definitivo y nombra la orden", () => {
    const copy = confirmationCopy("cancelled", "TR-1042");

    expect(copy).toMatchObject({ tone: "danger", title: "¿Cancelar la orden TR-1042?", confirmLabel: "Sí, cancelar orden" });
    expect(copy.text).toContain("no se podrá cambiar más");
  });

  it("pide confirmar que el cliente retiró el vehículo al entregar", () => {
    const copy = confirmationCopy("delivered", "TR-1042");

    expect(copy).toMatchObject({ tone: "primary", title: "¿Marcar como entregado?" });
    expect(copy.text).toContain("retiró el vehículo");
  });
});
