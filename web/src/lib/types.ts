export const ORDER_STATUSES = [
  "received",
  "diagnosing",
  "awaiting_approval",
  "repairing",
  "waiting_parts",
  "ready_for_pickup",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Vehicle {
  brand: string;
  model: string;
  plate: string;
}

export interface StatusChange {
  /** `null` only in the first entry (intake of the order). */
  from: OrderStatus | null;
  to: OrderStatus;
  changedAt: string;
}

export interface OrderSummary {
  id: string;
  code: string;
  customerName: string;
  vehicle: Vehicle;
  status: OrderStatus;
  updatedAt: string;
}

export interface OrderDetail extends OrderSummary {
  customerPhone: string;
  history: StatusChange[];
  allowedNextStatuses: OrderStatus[];
}

export interface TrackingView {
  code: string;
  vehicle: { brand: string; model: string; plateMasked: string };
  status: OrderStatus;
  updatedAt: string;
  history: StatusChange[];
}

export interface SessionUser {
  id: string;
  name: string;
  role: "employee";
}

export interface Session {
  token: string;
  user: SessionUser;
}
