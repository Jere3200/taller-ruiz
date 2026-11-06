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

/** Single source of truth for the repair process (see spec work-order-status). */
const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  received: ["diagnosing", "cancelled"],
  diagnosing: ["awaiting_approval", "cancelled"],
  awaiting_approval: ["repairing", "cancelled"],
  repairing: ["waiting_parts", "ready_for_pickup", "cancelled"],
  waiting_parts: ["repairing", "cancelled"],
  ready_for_pickup: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);
}

export function allowedNext(from: OrderStatus): readonly OrderStatus[] {
  return TRANSITIONS[from];
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}
