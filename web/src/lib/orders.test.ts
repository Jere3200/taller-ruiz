import { describe, expect, it } from "vitest";
import { countActive, countByGroup, filterOrders, sortByRecent } from "./orders";
import type { OrderStatus, OrderSummary } from "./types";

const order = (code: string, customerName: string, plate: string, status: OrderStatus): OrderSummary => ({
  id: code,
  code,
  customerName,
  vehicle: { brand: "Ford", model: "Fiesta", plate },
  status,
  updatedAt: "2026-11-06T12:00:00.000Z",
});

const ORDERS = [
  order("TR-1042", "Martina Sosa", "AE 482 KD", "repairing"),
  order("TR-1043", "Jorge Fernández", "NKL 512", "diagnosing"),
  order("TR-1044", "Ricardo Benítez", "AF 109 TR", "waiting_parts"),
  order("TR-1045", "Carolina Méndez", "AD 774 PL", "ready_for_pickup"),
  order("TR-1046", "Hugo Ledesma", "AH 901 OP", "delivered"),
  order("TR-1047", "Carla Ibáñez", "AI 234 QR", "cancelled"),
];

describe("filterOrders", () => {
  it("devuelve todo sin búsqueda ni filtro", () => {
    expect(filterOrders(ORDERS, "", "all")).toHaveLength(6);
  });

  it("busca por código ignorando mayúsculas", () => {
    expect(filterOrders(ORDERS, "tr-1043", "all").map((o) => o.code)).toEqual(["TR-1043"]);
  });

  it("busca por cliente ignorando acentos", () => {
    expect(filterOrders(ORDERS, "fernandez", "all").map((o) => o.code)).toEqual(["TR-1043"]);
  });

  it("busca por patente ignorando espacios y guiones", () => {
    expect(filterOrders(ORDERS, "ae482kd", "all").map((o) => o.code)).toEqual(["TR-1042"]);
    expect(filterOrders(ORDERS, "AE-482", "all").map((o) => o.code)).toEqual(["TR-1042"]);
  });

  it("filtra por estado", () => {
    expect(filterOrders(ORDERS, "", "waiting_parts").map((o) => o.code)).toEqual(["TR-1044"]);
  });

  it("combina búsqueda y estado", () => {
    expect(filterOrders(ORDERS, "martina", "diagnosing")).toEqual([]);
  });

  it("devuelve vacío cuando nada coincide", () => {
    expect(filterOrders(ORDERS, "zzz", "all")).toEqual([]);
  });

  it("no trata una búsqueda de solo espacios como una patente", () => {
    expect(filterOrders(ORDERS, "   ", "all")).toHaveLength(6);
  });
});

describe("countByGroup", () => {
  it("agrupa recibidas, en diagnóstico y esperando aprobación en un solo grupo", () => {
    const grouped = countByGroup([
      order("A", "x", "AAA", "received"),
      order("B", "x", "BBB", "diagnosing"),
      order("C", "x", "CCC", "awaiting_approval"),
    ]);

    expect(grouped[0]).toMatchObject({ label: "En diagnóstico", count: 3 });
  });

  it("cuenta cada grupo del resumen", () => {
    expect(countByGroup(ORDERS).map((g) => [g.label, g.count])).toEqual([
      ["En diagnóstico", 1],
      ["En reparación", 1],
      ["Esperando repuestos", 1],
      ["Listas para retirar", 1],
    ]);
  });
});

describe("sortByRecent", () => {
  it("ordena de la más reciente a la más antigua sin modificar el original", () => {
    const old = { ...order("A", "x", "AAA", "received"), updatedAt: "2026-11-01T10:00:00.000Z" };
    const recent = { ...order("B", "x", "BBB", "received"), updatedAt: "2026-11-05T10:00:00.000Z" };
    const input = [old, recent];

    const sorted = sortByRecent(input);

    expect(sorted.map((o) => o.code)).toEqual(["B", "A"]);
    expect(input.map((o) => o.code)).toEqual(["A", "B"]);
  });
});

describe("countActive", () => {
  it("excluye las órdenes entregadas y canceladas", () => {
    expect(countActive(ORDERS)).toBe(4);
  });
});
