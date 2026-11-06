import { STATUS } from "@/lib/status";
import type { OrderStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: OrderStatus;
  /** `lg` is for the headline status of a page. */
  size?: "sm" | "lg";
}

/** The colour is never the only signal: the label is always printed next to the dot. */
export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const meta = STATUS[status];
  return (
    <span
      className={
        size === "lg"
          ? "inline-flex items-center gap-2.5 rounded-md px-3.5 py-2 text-base font-bold"
          : "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-semibold whitespace-nowrap"
      }
      style={{ background: meta.bg, color: meta.fg }}
    >
      <span className="size-2 shrink-0 rounded-full" style={{ background: meta.dot }} />
      {meta.label}
    </span>
  );
}
