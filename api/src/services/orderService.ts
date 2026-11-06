import { invalidTransition, orderNotFound } from "../domain/errors";
import { allowedNext, canTransition, type OrderStatus } from "../domain/status";
import type { OrderRepository } from "../repositories/orderRepository";
import { toDetail, toSummary, toTracking, type OrderDetail, type OrderSummary, type TrackingView } from "./views";

export interface OrderService {
  list(): Promise<OrderSummary[]>;
  getById(id: string): Promise<OrderDetail>;
  changeStatus(id: string, to: OrderStatus): Promise<OrderDetail>;
  getTracking(code: string): Promise<TrackingView>;
}

/**
 * Runs `task` after any earlier task for the same key has settled, so the
 * read-check-write in changeStatus cannot interleave for one order.
 * Single-process only; with PostgreSQL this becomes a transaction with
 * optimistic locking (see design.md).
 */
function createKeyedQueue() {
  const tails = new Map<string, Promise<unknown>>();
  return async function run<T>(key: string, task: () => Promise<T>): Promise<T> {
    const previous = tails.get(key) ?? Promise.resolve();
    const current = previous.then(task, task);
    const tail = current.catch(() => undefined);
    tails.set(key, tail);
    try {
      return await current;
    } finally {
      if (tails.get(key) === tail) tails.delete(key);
    }
  };
}

export function createOrderService(repo: OrderRepository, now: () => Date = () => new Date()): OrderService {
  const serialize = createKeyedQueue();

  return {
    async list() {
      return (await repo.list()).map(toSummary);
    },

    async getById(id) {
      const order = await repo.findById(id);
      if (!order) throw orderNotFound();
      return toDetail(order);
    },

    changeStatus(id, to) {
      return serialize(id, async () => {
        const order = await repo.findById(id);
        if (!order) throw orderNotFound();
        if (!canTransition(order.status, to)) throw invalidTransition(allowedNext(order.status));

        const changedAt = now().toISOString();
        order.history.push({ from: order.status, to, changedAt });
        order.status = to;
        order.updatedAt = changedAt;
        return toDetail(await repo.save(order));
      });
    },

    async getTracking(code) {
      const order = await repo.findByCode(code);
      if (!order) throw orderNotFound();
      return toTracking(order);
    },
  };
}
