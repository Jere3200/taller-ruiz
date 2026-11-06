import { formatDate } from "@/lib/format";
import { SITE } from "@/lib/site";
import { STATUS, buildProgress } from "@/lib/status";
import type { TrackingView } from "@/lib/types";
import { HistoryTimeline } from "../HistoryTimeline";
import { Icon } from "../icons";

const NAVY = "#01225E";
const TRACK_TODO = "#E6E3DD";

function Progress({ status }: { status: TrackingView["status"] }) {
  const progress = buildProgress(status);
  const currentDot = STATUS[status].dot;
  const currentIndex = progress.stages.findIndex((stage) => stage.state === "current");

  return (
    <div className="border-t border-edge px-6 py-5.5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-lg font-bold">Progreso</h2>
        <span className="text-sm text-muted">{`Paso ${progress.step} de ${progress.total}`}</span>
      </div>

      <div className="mt-4 grid gap-1" style={{ gridTemplateColumns: `repeat(${progress.total}, 1fr)` }} aria-hidden="true">
        {progress.stages.map((stage, i) => (
          <span
            key={stage.status}
            className="h-1.5 rounded-[3px]"
            style={{ background: i < currentIndex ? NAVY : i === currentIndex ? currentDot : TRACK_TODO }}
          />
        ))}
      </div>

      <ol className="m-0 mt-5 list-none p-0">
        {progress.stages.map((stage, i) => {
          const last = i === progress.stages.length - 1;
          const filled = stage.state === "done";
          const current = stage.state === "current";
          return (
            <li key={stage.status} className="flex gap-3.5" aria-current={current ? "step" : undefined}>
              <div className="flex flex-col items-center">
                <span
                  className="grid size-5.5 shrink-0 place-items-center rounded-full border-2 text-white"
                  style={{
                    background: filled ? NAVY : current ? currentDot : "#fff",
                    borderColor: filled ? NAVY : current ? currentDot : "#C9C5BD",
                    boxShadow: current ? `0 0 0 5px ${STATUS[status].bg}` : undefined,
                  }}
                >
                  {filled && <Icon name="check" size={14} stroke={3} />}
                </span>
                {!last && <span className="w-0.5 flex-1" style={{ background: i < currentIndex ? NAVY : TRACK_TODO, minHeight: 20 }} />}
              </div>
              <div className={`flex items-center gap-2.5 ${last ? "" : "pb-4"}`} style={{ minHeight: 22 }}>
                <span className={stage.state === "todo" ? "text-faint" : "text-ink"} style={{ fontWeight: current ? 700 : 500 }}>
                  {stage.label}
                </span>
                {current && (
                  <span className="rounded bg-navy px-2 py-0.5 text-[11px] font-bold tracking-[0.04em] text-white uppercase">Ahora</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Public view of an order. It only receives the masked plate and never any personal data. */
export function TrackingResult({ data }: { data: TrackingView }) {
  const meta = STATUS[data.status];
  const cancelled = data.status === "cancelled";

  return (
    <>
      <article className="anim-in mt-8 overflow-hidden rounded-xl border border-edge bg-white shadow-[0_18px_40px_-28px_rgba(20,25,28,0.35)]">
        <div className="flex flex-wrap items-start justify-between gap-4 px-6 pt-6 pb-5">
          <div>
            <div className="font-mono text-xs font-semibold tracking-[0.08em] text-muted uppercase">Orden {data.code}</div>
            <h1 className="mt-2 font-display text-[34px] leading-none font-extrabold text-navy font-stretch-[85%]">
              {data.vehicle.brand} {data.vehicle.model}
            </h1>
          </div>
          <span
            aria-label={`Patente parcialmente oculta: ${data.vehicle.plateMasked}`}
            className="inline-flex rounded border-[1.5px] border-t-4 border-ink border-t-navy bg-white px-2.5 pt-1.5 pb-1 font-mono text-base font-semibold tracking-[0.06em]"
          >
            {data.vehicle.plateMasked}
          </span>
        </div>

        <div className="border-t border-edge px-6 py-5.5" style={{ background: meta.bg }}>
          <div className="text-xs font-semibold tracking-[0.06em] uppercase" style={{ color: meta.fg }}>
            Estado actual
          </div>
          <div className="mt-2 flex items-center gap-2.5 text-2xl font-bold" style={{ color: meta.fg }}>
            <span className="size-3 rounded-full" style={{ background: meta.dot }} />
            {meta.label}
          </div>
          <p className="m-0 mt-2 leading-normal" style={{ color: meta.fg }}>
            {meta.description}
          </p>
          <p className="m-0 mt-2 text-sm" style={{ color: meta.fg }}>
            Actualizado: {formatDate(data.updatedAt)}
          </p>
        </div>

        {cancelled ? (
          <div role="status" className="flex gap-3 border-t border-edge bg-danger-bg px-6 py-5 text-danger">
            <Icon name="warning" size={22} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-bold">Esta orden fue cancelada</div>
              <div className="mt-1 text-sm">
                No se van a realizar más trabajos. Si tenés dudas, comunicate al {SITE.phone}.
              </div>
            </div>
          </div>
        ) : (
          <Progress status={data.status} />
        )}

        <div className="border-t border-edge px-6 py-5.5">
          <h2 className="m-0 mb-4 text-lg font-bold">Historial</h2>
          <HistoryTimeline history={data.history} variant="public" />
        </div>
      </article>

      <p className="mt-6 text-center text-[15px] text-muted">
        ¿Dudas? Llamanos al{" "}
        <a href={SITE.phoneHref} className="font-semibold text-navy">
          {SITE.phone}
        </a>
        .
      </p>
    </>
  );
}
