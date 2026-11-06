import type { WorkOrder } from "../domain/order";

/**
 * Persistence boundary. The PoC uses an in-memory implementation;
 * the full system would implement this with TypeORM + PostgreSQL.
 */
export interface OrderRepository {
  list(): Promise<WorkOrder[]>;
  findById(id: string): Promise<WorkOrder | undefined>;
  findByCode(code: string): Promise<WorkOrder | undefined>;
  save(order: WorkOrder): Promise<WorkOrder>;
}
