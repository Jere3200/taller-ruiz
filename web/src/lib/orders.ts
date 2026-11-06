import { normalizeText } from "./format";
import { SUMMARY_GROUPS } from "./status";
import type { OrderStatus, OrderSummary } from "./types";

export type StatusFilter = OrderStatus | "all";

const compact = (text: string) => normalizeText(text).replace(/[\s-]/g, "");

/** Search by code, customer name or plate (ignoring case, accents, spaces and dashes), plus an optional status filter. */
export function filterOrders(orders: OrderSummary[], search: string, status: StatusFilter): OrderSummary[] {
  const query = normalizeText(search.trim());
  const plateQuery = compact(search);

  return orders.filter((order) => {
    if (status !== "all" && order.status !== status) return false;
    if (!query) return true;
    return (
      normalizeText(order.code).includes(query) ||
      normalizeText(order.customerName).includes(query) ||
      (plateQuery !== "" && compact(order.vehicle.plate).includes(plateQuery))
    );
  });
}

/** Most recently updated first. Returns a new array. */
export function sortByRecent(orders: OrderSummary[]): OrderSummary[] {
  return orders.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function countByGroup(orders: OrderSummary[]) {
  return SUMMARY_GROUPS.map((group) => ({
    ...group,
    count: orders.filter((order) => group.statuses.includes(order.status)).length,
  }));
}

export function countActive(orders: OrderSummary[]): number {
  return orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled").length;
}
