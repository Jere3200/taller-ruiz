"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { OrderDetail } from "@/lib/types";
import { useResource } from "@/lib/useResource";
import { HistoryTimeline } from "../HistoryTimeline";
import { Icon } from "../icons";
import { StatusBadge } from "../StatusBadge";
import { StatusChanger } from "./StatusChanger";
import { TrackingLink } from "./TrackingLink";

const card = "rounded-[10px] border border-edge bg-white p-5.5";
const groupTitle = "m-0 text-sm font-bold tracking-[0.06em] text-muted uppercase";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-edge py-2.5 last:border-b-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="m-0 mt-0.5 font-semibold break-words">{children}</dd>
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/panel" className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-navy no-underline hover:underline">
      <Icon name="arrowLeft" size={18} />
      Volver a órdenes
    </Link>
  );
}

function Message({ title, text, alert = false, children }: { title: string; text: string; alert?: boolean; children: React.ReactNode }) {
  return (
    <div role={alert ? "alert" : undefined} className="mt-6 rounded-xl border border-edge bg-white p-8 text-center">
      <p className="m-0 text-lg font-bold">{title}</p>
      <p className="m-0 mt-1 text-muted">{text}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function DetailContent({ order, onChanged }: { order: OrderDetail; onChanged: (order: OrderDetail) => void }) {
  const intake = order.history[0];
  const vehicle = `${order.vehicle.brand} ${order.vehicle.model}`;

  return (
    <>
      <section className="mt-5 flex flex-wrap items-end justify-between gap-5 rounded-xl border border-edge bg-white p-6">
        <div>
          <div className="font-mono text-xs font-semibold tracking-[0.08em] text-muted uppercase">Orden {order.code}</div>
          <h1 className="m-0 mt-2 font-display text-[clamp(30px,4vw,42px)] leading-none font-extrabold text-navy font-stretch-[85%]">
            {vehicle}
          </h1>
          <div className="mt-2 text-sm text-muted">Última actualización: {formatDate(order.updatedAt)}</div>
        </div>
        <div>
          <div className="mb-1.5 text-xs font-semibold tracking-[0.06em] text-muted uppercase">Estado actual</div>
          <StatusBadge status={order.status} size="lg" />
        </div>
      </section>

      <div className="mt-5 grid grid-cols-1 items-start gap-5 min-[960px]:grid-cols-[1.35fr_1fr]">
        <div className="flex flex-col gap-5">
          <section className={`${card} grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-6`}>
            <div>
              <h2 className={groupTitle}>Orden</h2>
              <dl className="m-0 mt-1.5">
                <Field label="Código">{order.code}</Field>
                <Field label="Ingreso">{intake ? formatDate(intake.changedAt) : "Sin dato"}</Field>
              </dl>
            </div>
            <div>
              <h2 className={groupTitle}>Vehículo</h2>
              <dl className="m-0 mt-1.5">
                <Field label="Marca y modelo">{vehicle}</Field>
                <Field label="Patente">
                  <span className="rounded border-[1.5px] border-ink bg-white px-1.5 font-mono text-[13px]">{order.vehicle.plate}</span>
                </Field>
              </dl>
            </div>
            <div>
              <h2 className={groupTitle}>Cliente</h2>
              <dl className="m-0 mt-1.5">
                <Field label="Nombre">{order.customerName}</Field>
                <Field label="Teléfono">
                  <a href={`tel:${order.customerPhone.replace(/[^\d+]/g, "")}`} className="text-navy">
                    {order.customerPhone}
                  </a>
                </Field>
              </dl>
            </div>
          </section>

          <section className={card}>
            <h2 className="m-0 mb-4 text-lg font-bold">Historial de estados</h2>
            <HistoryTimeline history={order.history} variant="internal" />
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <StatusChanger order={order} onChanged={onChanged} />
          <TrackingLink code={order.code} />
        </div>
      </div>
    </>
  );
}

export function OrderDetailView({ id }: { id: string }) {
  const { api } = useAuth();
  const load = useCallback(() => api.getOrder(id), [api, id]);
  const { state, reload, setData } = useResource(load);

  // A 401 sends the visitor to /login; until the redirect lands, keep the loading state.
  const loading = state.status === "loading" || (state.status === "error" && state.error.status === 401);

  return (
    <main className="mx-auto w-full max-w-[1240px] px-[clamp(16px,3vw,32px)] pt-6 pb-12">
      <BackLink />

      {loading && (
        <div className="mt-5 space-y-3" aria-busy="true" aria-label="Cargando orden">
          <div className="anim-pulse h-28 rounded-xl bg-sand" />
          <div className="anim-pulse h-64 rounded-xl bg-sand" />
        </div>
      )}

      {state.status === "error" && state.error.status === 404 && (
        <Message title="No encontramos esta orden." text="Puede que el enlace esté mal o que la orden ya no exista.">
          <Link
            href="/panel"
            className="inline-flex h-11 items-center rounded-md bg-navy px-6 font-bold text-white no-underline hover:bg-navy-dark hover:text-white"
          >
            Ir a órdenes
          </Link>
        </Message>
      )}

      {state.status === "error" && state.error.status !== 404 && state.error.status !== 401 && (
        <Message alert title="No pudimos cargar la orden." text="Revisá la conexión con el servidor y probá de nuevo.">
          <button type="button" onClick={reload} className="h-11 cursor-pointer rounded-md border-0 bg-navy px-6 font-bold text-white hover:bg-navy-dark">
            Reintentar
          </button>
        </Message>
      )}

      {state.status === "ok" && <DetailContent order={state.data} onChanged={setData} />}
    </main>
  );
}
