import type { WorkOrder } from "../domain/order";
import type { OrderRepository } from "./orderRepository";

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, WorkOrder>();

  constructor(initial: WorkOrder[] = []) {
    for (const order of initial) this.orders.set(order.id, structuredClone(order));
  }

  async list(): Promise<WorkOrder[]> {
    return [...this.orders.values()].map((o) => structuredClone(o));
  }

  async findById(id: string): Promise<WorkOrder | undefined> {
    const order = this.orders.get(id);
    return order && structuredClone(order);
  }

  async findByCode(code: string): Promise<WorkOrder | undefined> {
    const wanted = code.toUpperCase();
    for (const order of this.orders.values()) {
      if (order.code.toUpperCase() === wanted) return structuredClone(order);
    }
    return undefined;
  }

  async save(order: WorkOrder): Promise<WorkOrder> {
    this.orders.set(order.id, structuredClone(order));
    return structuredClone(order);
  }
}
