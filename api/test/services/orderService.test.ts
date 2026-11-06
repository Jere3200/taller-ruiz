import { createSeedOrders } from "../../src/data/seed";
import { InMemoryOrderRepository } from "../../src/repositories/inMemoryOrderRepository";
import { createOrderService } from "../../src/services/orderService";
import { maskPlate } from "../../src/services/views";

const NOW = new Date("2026-11-06T15:00:00Z");
const setup = () => {
  const repo = new InMemoryOrderRepository(createSeedOrders(NOW));
  return { repo, service: createOrderService(repo, () => NOW) };
};

describe("orderService.changeStatus", () => {
  it("applies a valid transition, records history and bumps updatedAt", async () => {
    const { service } = setup();
    const before = await service.getById("wo-006"); // awaiting_approval
    const after = await service.changeStatus("wo-006", "repairing");

    expect(after.status).toBe("repairing");
    expect(after.updatedAt).toBe(NOW.toISOString());
    expect(after.history).toHaveLength(before.history.length + 1);
    expect(after.history.at(-1)).toEqual({ from: "awaiting_approval", to: "repairing", changedAt: NOW.toISOString() });
    expect(after.allowedNextStatuses).toEqual(["waiting_parts", "ready_for_pickup", "cancelled"]);
  });

  it("rejects an invalid transition with the allowed list and leaves the order untouched", async () => {
    const { service } = setup();
    const before = await service.getById("wo-001"); // diagnosing

    await expect(service.changeStatus("wo-001", "ready_for_pickup")).rejects.toMatchObject({
      statusCode: 422,
      code: "INVALID_TRANSITION",
      extra: { allowed: ["awaiting_approval", "cancelled"] },
    });
    expect(await service.getById("wo-001")).toEqual(before);
  });

  it("rejects changes on final orders", async () => {
    const { service } = setup();
    await expect(service.changeStatus("wo-007", "received")).rejects.toMatchObject({ code: "INVALID_TRANSITION" });
  });

  it("applies only one of two simultaneous identical changes on the same order", async () => {
    const { service } = setup();

    const results = await Promise.allSettled([
      service.changeStatus("wo-005", "diagnosing"), // received
      service.changeStatus("wo-005", "diagnosing"),
    ]);

    const after = await service.getById("wo-005");
    expect(results.map((r) => r.status).sort()).toEqual(["fulfilled", "rejected"]);
    expect(after.history).toHaveLength(2); // intake + the single applied change
  });

  it("records a newly received order with only the intake entry", async () => {
    const { service } = setup();

    const order = await service.getById("wo-005"); // received, never changed

    expect(order.history).toEqual([{ from: null, to: "received", changedAt: expect.any(String) }]);
  });

  it("fails with ORDER_NOT_FOUND for an unknown id", async () => {
    const { service } = setup();
    await expect(service.changeStatus("nope", "diagnosing")).rejects.toMatchObject({
      statusCode: 404,
      code: "ORDER_NOT_FOUND",
    });
  });
});

describe("orderService.getTracking", () => {
  it("finds by code ignoring case and masks the plate", async () => {
    const { service } = setup();
    const view = await service.getTracking("tr-1042");
    expect(view.code).toBe("TR-1042");
    expect(view.vehicle.plateMasked).toBe("***3CD");
  });

  it("never exposes personal data", async () => {
    const { service } = setup();
    const json = JSON.stringify(await service.getTracking("TR-1042"));
    for (const forbidden of ["customerName", "customerPhone", "Marcelo", "351-555", "AB123CD", '"id"', "wo-001"]) {
      expect(json).not.toContain(forbidden);
    }
  });

  it("fails for an unknown code", async () => {
    const { service } = setup();
    await expect(service.getTracking("TR-0000")).rejects.toMatchObject({ code: "ORDER_NOT_FOUND" });
  });
});

describe("maskPlate", () => {
  it("keeps only the last three characters", () => {
    expect(maskPlate("AB123CD")).toBe("***3CD");
    expect(maskPlate("ABC123")).toBe("***123");
  });
});
