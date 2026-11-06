"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { STATUS, needsConfirmation } from "@/lib/status";
import { changeErrorMessage, confirmationCopy } from "@/lib/statusChange";
import type { OrderDetail, OrderStatus } from "@/lib/types";
import { Icon } from "../icons";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./ToastProvider";

interface StatusChangerProps {
  order: OrderDetail;
  /** Receives the order exactly as the API returned it. There is no optimistic update. */
  onChanged: (order: OrderDetail) => void;
}

type Closing = Extract<OrderStatus, "cancelled" | "delivered">;

/** Offers only what the API says is allowed. The server is the one that enforces the rules. */
export function StatusChanger({ order, onChanged }: StatusChangerProps) {
  const { api } = useAuth();
  const toast = useToast();
  const [changing, setChanging] = useState<OrderStatus | null>(null);
  const [confirming, setConfirming] = useState<Closing | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function apply(status: OrderStatus) {
    setConfirming(null);
    setChanging(status);
    setError(null);
    try {
      const updated = await api.updateOrderStatus(order.id, status);
      onChanged(updated);
      toast("ok", `Estado actualizado a "${STATUS[updated.status].label}".`);
    } catch (failure) {
      setError(changeErrorMessage(failure));
    } finally {
      setChanging(null);
    }
  }

  function request(status: OrderStatus) {
    if (changing) return;
    if (needsConfirmation(status)) setConfirming(status as Closing);
    else void apply(status);
  }

  const busy = changing !== null;
  const next = order.allowedNextStatuses;
  const copy = confirming ? confirmationCopy(confirming, order.code) : null;

  return (
    <section className="rounded-[10px] border border-edge bg-white p-5.5">
      <h2 className="m-0 text-lg font-bold">Cambiar estado</h2>

      {error && (
        <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-md bg-danger-bg px-3.5 py-3 text-sm font-semibold text-danger">
          <Icon name="warning" size={18} className="mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Cerrar aviso" className="cursor-pointer border-0 bg-transparent p-0.5 text-danger">
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      {next.length > 0 ? (
        <>
          <p className="m-0 mt-3 text-muted">Elegí el próximo estado de la orden.</p>
          <div className="mt-4 flex flex-col gap-2.5">
            {next.map((status) => {
              const danger = status === "cancelled";
              const loading = changing === status;
              return (
                <button
                  key={status}
                  type="button"
                  disabled={busy}
                  onClick={() => request(status)}
                  className="flex min-h-[52px] w-full items-center gap-3 rounded-md border-2 bg-white px-4 text-left text-base font-semibold hover:bg-paper disabled:cursor-default"
                  style={{
                    borderColor: danger ? "#E7A3A6" : "#D4D0C8",
                    color: danger ? "#A4161E" : "#14191C",
                    opacity: busy && !loading ? 0.55 : 1,
                  }}
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: STATUS[status].dot }} />
                  <span className="flex-1">Pasar a {STATUS[status].label}</span>
                  {loading ? (
                    <span className="anim-spin size-4.5 rounded-full border-2 border-field border-t-navy" role="status" aria-label="Guardando" />
                  ) : (
                    <Icon name="arrowRight" size={18} />
                  )}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="mt-4 flex items-center gap-3 rounded-md bg-sand px-4 py-3.5 text-muted">
          <Icon name="lock" size={22} />
          <div>
            <div className="font-bold text-ink">Orden finalizada</div>
            <div className="text-sm">Ya no admite cambios de estado.</div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirming !== null}
        title={copy?.title ?? ""}
        text={copy?.text ?? ""}
        confirmLabel={copy?.confirmLabel ?? ""}
        tone={copy?.tone ?? "primary"}
        onConfirm={() => confirming && void apply(confirming)}
        onCancel={() => setConfirming(null)}
      />
    </section>
  );
}
