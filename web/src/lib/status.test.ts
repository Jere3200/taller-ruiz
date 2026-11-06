import { describe, expect, it } from "vitest";
import { PROGRESS_FLOW, STATUS, buildProgress, needsConfirmation } from "./status";
import { ORDER_STATUSES } from "./types";

describe("STATUS", () => {
  it("tiene etiqueta y colores para los ocho estados de la API", () => {
    for (const status of ORDER_STATUSES) {
      expect(STATUS[status].label).not.toBe("");
      expect(STATUS[status].dot).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it("pinta cancelado en rojo y listo para retirar en verde", () => {
    expect(STATUS.cancelled.dot).toBe("#D02A31");
    expect(STATUS.ready_for_pickup.dot).toBe("#1E9150");
  });
});

describe("needsConfirmation", () => {
  it("pide confirmar solo al cancelar o entregar", () => {
    const confirmed = ORDER_STATUSES.filter(needsConfirmation);
    expect(confirmed).toEqual(["delivered", "cancelled"]);
  });
});

describe("buildProgress", () => {
  const states = (status: Parameters<typeof buildProgress>[0]) => buildProgress(status).stages.map((s) => s.state);

  it("marca la primera etapa como actual para una orden recibida", () => {
    const progress = buildProgress("received");

    expect(progress.step).toBe(1);
    expect(progress.total).toBe(6);
    expect(states("received")).toEqual(["current", "todo", "todo", "todo", "todo", "todo"]);
  });

  it("marca las etapas previas como hechas y la actual como actual", () => {
    expect(states("repairing")).toEqual(["done", "done", "done", "current", "todo", "todo"]);
  });

  it("trata esperando repuestos como una pausa dentro de la etapa de reparación", () => {
    const progress = buildProgress("waiting_parts");

    expect(progress.step).toBe(4);
    expect(progress.stages[3]).toMatchObject({ state: "current", label: "Esperando repuestos" });
  });

  it("completa todas las etapas cuando la orden fue entregada", () => {
    expect(states("delivered")).toEqual(["done", "done", "done", "done", "done", "done"]);
  });

  it("usa la etiqueta corta de esperando aprobación", () => {
    expect(buildProgress("awaiting_approval").stages[2]?.label).toBe("Esperando aprobación");
  });

  it("cubre en el flujo todos los estados menos cancelado y esperando repuestos", () => {
    expect([...PROGRESS_FLOW].sort()).toEqual(
      ORDER_STATUSES.filter((s) => s !== "cancelled" && s !== "waiting_parts").sort(),
    );
  });
});
