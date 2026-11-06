import type { OrderStatus } from "./status";

export interface Vehicle {
  brand: string;
  model: string;
  plate: string;
}

export interface StatusChange {
  /** `null` only in the first entry, which records the order's intake. */
  from: OrderStatus | null;
  to: OrderStatus;
  /** ISO 8601 */
  changedAt: string;
}

export interface WorkOrder {
  id: string;
  /** Public tracking code, e.g. TR-1042 */
  code: string;
  customerName: string;
  customerPhone: string;
  vehicle: Vehicle;
  status: OrderStatus;
  /** ISO 8601 */
  updatedAt: string;
  history: StatusChange[];
}
