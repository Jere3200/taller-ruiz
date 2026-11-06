import type { OrderStatus } from "../domain/status";
import type { WorkOrder } from "../domain/order";

type SeedRow = [id: string, code: string, customer: string, phone: string, brand: string, model: string, plate: string, status: OrderStatus, trail: OrderStatus[]];

const ROWS: SeedRow[] = [
  ["wo-001", "TR-1042", "Marcelo Paredes", "351-555-0101", "Ford", "Fiesta", "AB123CD", "diagnosing", ["received"]],
  ["wo-002", "TR-1043", "Lucía Fernández", "351-555-0102", "Volkswagen", "Gol Trend", "AC456EF", "repairing", ["received", "diagnosing", "awaiting_approval"]],
  ["wo-003", "TR-1044", "Jorge Almada", "351-555-0103", "Renault", "Kangoo", "AD789GH", "waiting_parts", ["received", "diagnosing", "awaiting_approval", "repairing"]],
  ["wo-004", "TR-1045", "Sofía Beltrán", "351-555-0104", "Toyota", "Corolla", "AE012IJ", "ready_for_pickup", ["received", "diagnosing", "awaiting_approval", "repairing"]],
  ["wo-005", "TR-1046", "Ramiro Ocampo", "351-555-0105", "Fiat", "Cronos", "AF345KL", "received", []],
  ["wo-006", "TR-1047", "Valeria Núñez", "351-555-0106", "Chevrolet", "Onix", "AG678MN", "awaiting_approval", ["received", "diagnosing"]],
  ["wo-007", "TR-1048", "Hugo Ledesma", "351-555-0107", "Peugeot", "208", "AH901OP", "delivered", ["received", "diagnosing", "awaiting_approval", "repairing", "ready_for_pickup"]],
  ["wo-008", "TR-1049", "Carla Ibáñez", "351-555-0108", "Nissan", "Versa", "AI234QR", "cancelled", ["received", "diagnosing"]],
];

const HOUR = 3_600_000;

/** Builds a fresh copy of the demo data. Timestamps are spaced backwards from `now`. */
export function createSeedOrders(now: Date = new Date()): WorkOrder[] {
  return ROWS.map(([id, code, customerName, customerPhone, brand, model, plate, status, trail], index) => {
    const path = [...trail, status];
    const end = now.getTime() - (index + 1) * 2 * HOUR;
    const history = path.map((to, i) => ({
      from: i === 0 ? null : (path[i - 1] as OrderStatus),
      to,
      changedAt: new Date(end - (path.length - 1 - i) * 3 * HOUR).toISOString(),
    }));
    return {
      id,
      code,
      customerName,
      customerPhone,
      vehicle: { brand, model, plate },
      status,
      updatedAt: new Date(end).toISOString(),
      history,
    };
  });
}
