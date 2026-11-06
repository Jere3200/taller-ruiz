import { createSeedOrders } from "../../src/data/seed";
import { ORDER_STATUSES, allowedNext, canTransition, isOrderStatus, type OrderStatus } from "../../src/domain/status";

const VALID: Array<[OrderStatus, OrderStatus]> = [
  ["received", "diagnosing"],
  ["received", "cancelled"],
  ["diagnosing", "awaiting_approval"],
  ["diagnosing", "cancelled"],
  ["awaiting_approval", "repairing"],
  ["awaiting_approval", "cancelled"],
  ["repairing", "waiting_parts"],
  ["repairing", "ready_for_pickup"],
  ["repairing", "cancelled"],
  ["waiting_parts", "repairing"],
  ["waiting_parts", "cancelled"],
  ["ready_for_pickup", "delivered"],
];

describe("order status transitions", () => {
  it.each(VALID)("allows %s -> %s", (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  it("allows exactly the listed transitions and no others", () => {
    for (const from of ORDER_STATUSES) {
      for (const to of ORDER_STATUSES) {
        const expected = VALID.some(([f, t]) => f === from && t === to);
        expect({ from, to, ok: canTransition(from, to) }).toEqual({ from, to, ok: expected });
      }
    }
  });

  it("rejects skipping the process (diagnosing -> ready_for_pickup)", () => {
    expect(canTransition("diagnosing", "ready_for_pickup")).toBe(false);
  });

  it("rejects going backwards (repairing -> diagnosing)", () => {
    expect(canTransition("repairing", "diagnosing")).toBe(false);
  });

  it("rejects moving to the same status", () => {
    for (const s of ORDER_STATUSES) expect(canTransition(s, s)).toBe(false);
  });

  it("treats delivered and cancelled as final", () => {
    expect(allowedNext("delivered")).toEqual([]);
    expect(allowedNext("cancelled")).toEqual([]);
  });

  it("allows cancelling in the middle of the repair", () => {
    expect(canTransition("repairing", "cancelled")).toBe(true);
    expect(canTransition("waiting_parts", "cancelled")).toBe(true);
  });

  it("does not allow cancelling once the vehicle is ready for pickup", () => {
    expect(canTransition("ready_for_pickup", "cancelled")).toBe(false);
  });

  it("validates status values", () => {
    expect(isOrderStatus("repairing")).toBe(true);
    expect(isOrderStatus("REPAIRING")).toBe(false);
    expect(isOrderStatus(undefined)).toBe(false);
  });

  it("keeps every demo order history inside the allowed transitions", () => {
    const steps = createSeedOrders().flatMap((o) => o.history.slice(1));
    expect(steps.every((c) => c.from !== null && canTransition(c.from, c.to))).toBe(true);
  });

  it("starts every demo order history with the intake entry", () => {
    const first = createSeedOrders().map((o) => o.history[0]?.from);
    expect(first.every((from) => from === null)).toBe(true);
  });

  it("ends every demo order history at its current status", () => {
    const orders = createSeedOrders();
    expect(orders.every((o) => o.history.at(-1)?.to === o.status)).toBe(true);
  });

  it("keeps the demo order histories in chronological order", () => {
    const sorted = createSeedOrders().every((o) =>
      o.history.every((c, i) => i === 0 || (o.history[i - 1]?.changedAt ?? "") <= c.changedAt),
    );
    expect(sorted).toBe(true);
  });
});
