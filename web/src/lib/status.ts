import type { OrderStatus } from "./types";

export interface StatusMeta {
  label: string;
  /** Shorter label for tight spaces */
  short?: string;
  fg: string;
  bg: string;
  dot: string;
  description: string;
}

/** Single source of truth for how each status looks and reads. Transitions are decided by the API. */
export const STATUS: Record<OrderStatus, StatusMeta> = {
  received: {
    label: "Recibido",
    fg: "#3F4A52",
    bg: "#E7EAEC",
    dot: "#6B7780",
    description: "Recibimos tu vehículo y está en espera para ser revisado.",
  },
  diagnosing: {
    label: "En diagnóstico",
    fg: "#1E4FA8",
    bg: "#E2EAF9",
    dot: "#2F6BDB",
    description: "Un mecánico está revisando el vehículo para encontrar la falla.",
  },
  awaiting_approval: {
    label: "Esperando aprobación del cliente",
    short: "Esperando aprobación",
    fg: "#8A4B00",
    bg: "#FCEFD6",
    dot: "#D98A0B",
    description: "Ya tenemos el presupuesto. Te vamos a contactar para que lo apruebes.",
  },
  repairing: {
    label: "En reparación",
    fg: "#0B5563",
    bg: "#DCEFF2",
    dot: "#0E7A8C",
    description: "Estamos trabajando en la reparación.",
  },
  waiting_parts: {
    label: "Esperando repuestos",
    fg: "#5B34A3",
    bg: "#ECE5F8",
    dot: "#7C55C9",
    description: "La reparación está en pausa hasta que lleguen los repuestos.",
  },
  ready_for_pickup: {
    label: "Listo para retirar",
    fg: "#14683A",
    bg: "#DBF1E3",
    dot: "#1E9150",
    description: "Tu vehículo está listo. Podés pasar a retirarlo en nuestro horario.",
  },
  delivered: {
    label: "Entregado",
    fg: "#2B3338",
    bg: "#E3E5E6",
    dot: "#4A545A",
    description: "Ya retiraste el vehículo. Gracias por confiar en nosotros.",
  },
  cancelled: {
    label: "Cancelado",
    fg: "#A4161E",
    bg: "#FBE1E1",
    dot: "#D02A31",
    description: "La orden fue cancelada.",
  },
};

/** Stages shown in the public progress indicator, in order. */
export const PROGRESS_FLOW: readonly OrderStatus[] = [
  "received",
  "diagnosing",
  "awaiting_approval",
  "repairing",
  "ready_for_pickup",
  "delivered",
];

/** Moving to these statuses closes the order, so the employee must confirm first. */
export function needsConfirmation(status: OrderStatus): boolean {
  return status === "cancelled" || status === "delivered";
}

export interface ProgressStage {
  status: OrderStatus;
  label: string;
  state: "done" | "current" | "todo";
}

export interface Progress {
  /** 1-based step for "Paso X de N" */
  step: number;
  total: number;
  stages: ProgressStage[];
}

/** Maps the current status to the public progress indicator. `waiting_parts` is a pause inside the repair stage. */
export function buildProgress(status: OrderStatus): Progress {
  const index = status === "waiting_parts" ? PROGRESS_FLOW.indexOf("repairing") : PROGRESS_FLOW.indexOf(status);
  const current = Math.max(0, index);
  const stages = PROGRESS_FLOW.map((flowStatus, i): ProgressStage => {
    const isCurrent = i === current;
    const done = i < current || (isCurrent && status === "delivered");
    const meta = STATUS[flowStatus];
    const label = isCurrent && status === "waiting_parts" ? STATUS.waiting_parts.label : (meta.short ?? meta.label);
    return { status: flowStatus, label, state: done ? "done" : isCurrent ? "current" : "todo" };
  });
  return { step: current + 1, total: PROGRESS_FLOW.length, stages };
}

export interface SummaryGroup {
  label: string;
  hint: string;
  statuses: readonly OrderStatus[];
  color: OrderStatus;
}

export const SUMMARY_GROUPS: readonly SummaryGroup[] = [
  {
    label: "En diagnóstico",
    hint: "Incluye recibidas y esperando aprobación",
    statuses: ["received", "diagnosing", "awaiting_approval"],
    color: "diagnosing",
  },
  { label: "En reparación", hint: "Trabajo en curso", statuses: ["repairing"], color: "repairing" },
  { label: "Esperando repuestos", hint: "En pausa hasta que lleguen", statuses: ["waiting_parts"], color: "waiting_parts" },
  {
    label: "Listas para retirar",
    hint: "Coordinar el retiro con el cliente",
    statuses: ["ready_for_pickup"],
    color: "ready_for_pickup",
  },
];
