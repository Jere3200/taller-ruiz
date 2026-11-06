import { formatDate } from "@/lib/format";
import { STATUS } from "@/lib/status";
import type { StatusChange } from "@/lib/types";
import { Icon } from "./icons";

interface HistoryTimelineProps {
  history: StatusChange[];
  /** `public` shows "Antes: X" under each step; `internal` shows "X > Y" on one line. */
  variant: "public" | "internal";
}

/** Newest change first. The entry with `from: null` is the intake of the order. */
export function HistoryTimeline({ history, variant }: HistoryTimelineProps) {
  const items = history.toReversed();

  return (
    <ol className="m-0 list-none p-0">
      {items.map((change, index) => {
        const to = STATUS[change.to];
        const from = change.from ? STATUS[change.from] : null;
        const last = index === items.length - 1;

        return (
          <li key={`${change.changedAt}-${change.to}`} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <span className="mt-1.5 size-3 shrink-0 rounded-full" style={{ background: to.dot }} />
              {!last && <span className="my-1 w-0.5 flex-1 bg-line" />}
            </div>
            <div className={last ? "pb-0" : "pb-5"}>
              {variant === "public" ? (
                <>
                  <div className="font-semibold">{to.label}</div>
                  <div className="text-sm text-muted">{from ? `Antes: ${from.label}` : "Ingreso al taller"}</div>
                  <div className="text-sm text-muted">{formatDate(change.changedAt)}</div>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2 font-semibold">
                    {from ? (
                      <>
                        <span className="font-medium text-muted">{from.label}</span>
                        <Icon name="arrowRight" size={16} className="text-faint" />
                      </>
                    ) : (
                      <span className="font-medium text-muted">Orden creada como</span>
                    )}
                    <span>{to.label}</span>
                  </div>
                  <div className="text-sm text-muted">{formatDate(change.changedAt)}</div>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
