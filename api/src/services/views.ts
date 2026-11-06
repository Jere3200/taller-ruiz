import type { StatusChange, WorkOrder } from "../domain/order";
import { allowedNext, type OrderStatus } from "../domain/status";

export interface OrderSummary {
  id: string;
  code: string;
  customerName: string;
  vehicle: WorkOrder["vehicle"];
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

/** Three asterisks followed by the last three characters of the plate. */
export function maskPlate(plate: string): string {
  return `***${plate.slice(-3)}`;
}

export const toSummary = (o: WorkOrder): OrderSummary => ({
  id: o.id,
  code: o.code,
  customerName: o.customerName,
  vehicle: o.vehicle,
  status: o.status,
  updatedAt: o.updatedAt,
});

export const toDetail = (o: WorkOrder): OrderDetail => ({
  ...toSummary(o),
  customerPhone: o.customerPhone,
  history: o.history,
  allowedNextStatuses: [...allowedNext(o.status)],
});

/** Explicit allow-list: nothing personal can leak by adding fields to WorkOrder. */
export const toTracking = (o: WorkOrder): TrackingView => ({
  code: o.code,
  vehicle: { brand: o.vehicle.brand, model: o.vehicle.model, plateMasked: maskPlate(o.vehicle.plate) },
  status: o.status,
  updatedAt: o.updatedAt,
  history: o.history,
});
