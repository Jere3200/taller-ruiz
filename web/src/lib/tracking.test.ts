import { describe, expect, it } from "vitest";
import { ApiError } from "./api";
import { normalizeCode, resolveTracking } from "./tracking";
import type { TrackingView } from "./types";

const VIEW: TrackingView = {
  code: "TR-1042",
  vehicle: { brand: "Ford", model: "Fiesta", plateMasked: "***3CD" },
  status: "diagnosing",
  updatedAt: "2026-11-06T12:00:00.000Z",
  history: [{ from: null, to: "received", changedAt: "2026-11-06T10:00:00.000Z" }],
};

const apiReturning = (outcome: TrackingView | ApiError) => ({
  getTracking: async (code: string) => {
    if (outcome instanceof ApiError) throw outcome;
    return { ...outcome, code };
  },
});

describe("normalizeCode", () => {
  it("devuelve undefined cuando el parámetro no está", () => {
    expect(normalizeCode(undefined)).toBeUndefined();
  });

  it("recorta espacios y pasa a mayúsculas", () => {
    expect(normalizeCode("  tr-1042 ")).toBe("TR-1042");
  });

  it("usa el primer valor cuando el parámetro viene repetido", () => {
    expect(normalizeCode(["tr-1042", "tr-1043"])).toBe("TR-1042");
  });

  it("devuelve cadena vacía para un código en blanco", () => {
    expect(normalizeCode("   ")).toBe("");
  });
});

describe("resolveTracking", () => {
  it("devuelve idle cuando todavía no se pidió ningún código", async () => {
    expect(await resolveTracking(apiReturning(VIEW), undefined)).toEqual({ kind: "idle" });
  });

  it("pide el código cuando se envió en blanco, sin llamar a la API", async () => {
    const api = { getTracking: async () => Promise.reject(new Error("no debería llamarse")) };

    expect(await resolveTracking(api, "")).toEqual({ kind: "empty" });
  });

  it("devuelve la orden cuando el código existe", async () => {
    const result = await resolveTracking(apiReturning(VIEW), "TR-1042");

    expect(result).toMatchObject({ kind: "ok", data: { code: "TR-1042" } });
  });

  it("trata un 404 como código inexistente", async () => {
    const result = await resolveTracking(apiReturning(new ApiError(404, { error: "ORDER_NOT_FOUND" })), "TR-9999");

    expect(result).toEqual({ kind: "notfound" });
  });

  it("trata un 400 de código mal formado como inexistente", async () => {
    const result = await resolveTracking(apiReturning(new ApiError(400, { error: "VALIDATION_ERROR" })), "TR 1; DROP");

    expect(result).toEqual({ kind: "notfound" });
  });

  it("avisa que hay que esperar cuando la API responde 429", async () => {
    const result = await resolveTracking(apiReturning(new ApiError(429, { error: "TOO_MANY_REQUESTS" })), "TR-1042");

    expect(result).toEqual({ kind: "ratelimited" });
  });

  it("devuelve un error genérico cuando la API no responde", async () => {
    const result = await resolveTracking(apiReturning(new ApiError(0, { error: "NETWORK_ERROR" })), "TR-1042");

    expect(result).toEqual({ kind: "error" });
  });

  it("devuelve un error genérico ante un 500", async () => {
    const result = await resolveTracking(apiReturning(new ApiError(500, {})), "TR-1042");

    expect(result).toEqual({ kind: "error" });
  });
});
