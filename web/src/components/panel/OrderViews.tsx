"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate, formatRelative } from "@/lib/format";
import { STATUS } from "@/lib/status";
import type { OrderStatus, OrderSummary } from "@/lib/types";
import { StatusBadge } from "../StatusBadge";

const detailHref = (order: OrderSummary) => `/panel/ordenes/${encodeURIComponent(order.id)}`;

function Plate({ plate }: { plate: string }) {
  return (
    <span className="inline-flex rounded border-[1.5px] border-t-[3px] border-ink border-t-navy bg-white px-1.5 pt-0.5 font-mono text-[13px] font-semibold tracking-[0.05em]">
      {plate}
    </span>
  );
}

function OrderCard({ order }: { order: OrderSummary }) {
  return (
    <Link
      href={detailHref(order)}
      className="block rounded-lg border border-edge bg-white p-3.5 text-ink no-underline shadow-sm transition-shadow hover:border-navy hover:text-ink hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[13px] font-semibold">{order.code}</span>
        <span className="text-xs text-muted">{formatRelative(order.updatedAt)}</span>
      </div>
      <div className="mt-2.5">
        <div className="font-bold">
          {order.vehicle.brand} {order.vehicle.model}
        </div>
        <div className="text-sm text-muted">{order.customerName}</div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <Plate plate={order.vehicle.plate} />
      </div>
    </Link>
  );
}

/** Read-only columns by status (no drag and drop: changes go through the detail screen). */
export function KanbanView({ orders, statuses }: { orders: OrderSummary[]; statuses: readonly OrderStatus[] }) {
  return (
    <div className="flex items-start gap-3.5 overflow-x-auto pb-3">
      {statuses.map((status) => {
        const items = orders.filter((order) => order.status === status);
        return (
          <section key={status} aria-label={STATUS[status].label} className="w-[280px] flex-none rounded-[10px] bg-sand p-2.5">
            <header className="flex items-center gap-2 px-1.5 pt-1.5 pb-3">
              <span className="size-2.5 rounded-full" style={{ background: STATUS[status].dot }} />
              <h2 className="m-0 flex-1 text-sm font-bold">{STATUS[status].label}</h2>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-muted">{items.length}</span>
            </header>
            <div className="flex flex-col gap-2">
              {items.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {items.length === 0 && (
                <div className="rounded-lg border border-dashed border-field px-3 py-5 text-center text-[13px] text-muted">
                  No hay órdenes con este estado
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

const th = "px-4 py-3 text-left text-xs font-semibold tracking-[0.06em] text-muted uppercase whitespace-nowrap";
const td = "px-4 py-3.5 align-middle";

export function TableView({ orders }: { orders: OrderSummary[] }) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-[10px] border border-edge bg-white">
      <table className="w-full border-collapse text-[15px]">
        <thead className="border-b border-edge bg-paper">
          <tr>
            <th scope="col" className={th}>Código</th>
            <th scope="col" className={th}>Vehículo</th>
            <th scope="col" className={th}>Patente</th>
            <th scope="col" className={th}>Cliente</th>
            <th scope="col" className={th}>Estado</th>
            <th scope="col" className={th}>Última actualización</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => router.push(detailHref(order))}
              className="cursor-pointer border-b border-edge last:border-b-0 hover:bg-paper"
            >
              <td className={td}>
                <Link href={detailHref(order)} onClick={(e) => e.stopPropagation()} className="font-mono text-sm font-semibold text-navy">
                  {order.code}
                </Link>
              </td>
              <td className={`${td} font-medium`}>
                {order.vehicle.brand} {order.vehicle.model}
              </td>
              <td className={td}>
                <Plate plate={order.vehicle.plate} />
              </td>
              <td className={td}>{order.customerName}</td>
              <td className={td}>
                <StatusBadge status={order.status} />
              </td>
              <td className={`${td} whitespace-nowrap text-muted`}>{formatDate(order.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
