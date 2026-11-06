"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/lib/auth";
import { countActive, countByGroup, filterOrders, sortByRecent, type StatusFilter } from "@/lib/orders";
import { STATUS } from "@/lib/status";
import { ORDER_STATUSES } from "@/lib/types";
import { useResource } from "@/lib/useResource";
import { Icon } from "../icons";
import { KanbanView, TableView } from "./OrderViews";

type View = "kanban" | "table";

function Skeleton() {
  return (
    <div className="space-y-2.5" aria-busy="true" aria-label="Cargando órdenes">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} className="anim-pulse h-14 rounded-lg bg-sand" />
      ))}
    </div>
  );
}

export function OrdersBoard() {
  const { api } = useAuth();
  const load = useCallback(() => api.getOrders(), [api]);
  const { state, reload } = useResource(load);
  const [view, setView] = useState<View>("kanban");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  // A 401 sends the visitor to /login; until the redirect lands, keep showing the loading state.
  const loading = state.status === "loading" || (state.status === "error" && state.error.status === 401);
  const orders = state.status === "ok" ? sortByRecent(state.data) : [];
  const filtered = filterOrders(orders, search, filter);
  const groups = countByGroup(orders);
  const active = countActive(orders);

  const emptyText =
    orders.length === 0
      ? "Todavía no hay órdenes cargadas."
      : search.trim()
        ? `No hay órdenes para "${search.trim()}".`
        : "No hay órdenes con ese criterio.";

  return (
    <main className="mx-auto w-full max-w-[1240px] px-[clamp(16px,3vw,32px)] pt-7 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 font-display text-4xl leading-none font-extrabold text-navy font-stretch-[85%]">Órdenes</h1>
          <p className="m-0 mt-2 text-muted">
            {state.status === "ok"
              ? `${active} ${active === 1 ? "orden activa" : "órdenes activas"} en el taller`
              : "Estado de los vehículos en el taller"}
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          disabled={loading}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-field bg-white px-4 text-sm font-semibold hover:bg-paper disabled:cursor-default disabled:opacity-60"
        >
          <Icon name="refresh" size={16} className={loading ? "anim-spin" : undefined} />
          Actualizar
        </button>
      </div>

      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
        {groups.map((group) => (
          <div key={group.label} className="rounded-[10px] border border-edge bg-white p-4.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted">
              <span className="size-2.5 rounded-full" style={{ background: STATUS[group.color].dot }} />
              {group.label}
            </div>
            {loading ? (
              <div className="anim-pulse mt-2 h-10 w-14 rounded bg-sand" />
            ) : (
              <div className="mt-1.5 font-display text-[44px] leading-none font-extrabold text-ink font-stretch-[85%]">
                {state.status === "ok" ? group.count : "-"}
              </div>
            )}
            <div className="mt-2 text-[13px] text-muted">{group.hint}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-[1_1_300px]">
          <Icon name="search" size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-faint" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por patente, código o cliente"
            aria-label="Buscar órdenes"
            className="h-11 w-full rounded-md border-2 border-field bg-white pr-3 pl-10 text-[15px] outline-none focus:border-navy"
          />
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as StatusFilter)}
          aria-label="Filtrar por estado"
          className="h-11 cursor-pointer rounded-md border-2 border-field bg-white px-3 text-[15px] outline-none focus:border-navy"
        >
          <option value="all">Todos los estados</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS[status].label}
            </option>
          ))}
        </select>
        <div role="group" aria-label="Vista" className="flex rounded-md bg-sand p-1">
          {(
            [
              ["kanban", "columns", "Columnas"],
              ["table", "rows", "Tabla"],
            ] as const
          ).map(([value, icon, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              onClick={() => setView(value)}
              className={`flex h-9 cursor-pointer items-center gap-2 rounded px-3.5 text-sm font-semibold ${view === value ? "bg-white text-ink shadow-sm" : "bg-transparent text-muted"}`}
            >
              <Icon name={icon} size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {loading && <Skeleton />}

        {state.status === "error" && state.error.status !== 401 && (
          <div role="alert" className="rounded-xl border border-edge bg-white p-8 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-danger-bg text-danger">
              <Icon name="warning" size={24} />
            </div>
            <p className="m-0 mt-3 text-lg font-bold">
              {state.error.status === 0 ? "No pudimos conectarnos con el servidor." : "No pudimos cargar las órdenes."}
            </p>
            <p className="m-0 mt-1 text-muted">Revisá la conexión con el servidor y probá de nuevo.</p>
            <button
              type="button"
              onClick={reload}
              className="mt-4 h-11 cursor-pointer rounded-md border-0 bg-navy px-6 font-bold text-white hover:bg-navy-dark"
            >
              Reintentar
            </button>
          </div>
        )}

        {state.status === "ok" && filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-field p-8 text-center">
            <p className="m-0 text-lg font-bold">{emptyText}</p>
            <p className="m-0 mt-1 text-muted">Probá con otro estado o borrá la búsqueda.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
              className="mt-4 h-11 cursor-pointer rounded-md border-2 border-field bg-white px-5 font-semibold hover:bg-paper"
            >
              Ver todas las órdenes
            </button>
          </div>
        )}

        {state.status === "ok" && filtered.length > 0 && view === "kanban" && (
          <KanbanView orders={filtered} statuses={filter === "all" ? ORDER_STATUSES : [filter]} />
        )}
        {state.status === "ok" && filtered.length > 0 && view === "table" && <TableView orders={filtered} />}
      </div>
    </main>
  );
}
