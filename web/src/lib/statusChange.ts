import { ApiError } from "./api";
import type { OrderStatus } from "./types";

/** What to tell the employee when a status change fails. Never shows internal error details. */
export function changeErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 422) return error.body.message ?? "Ese cambio de estado no está permitido.";
    if (error.status === 404) return "La orden ya no existe.";
    if (error.status === 0) return "No pudimos conectarnos con el servidor.";
  }
  return "No pudimos actualizar el estado. Probá de nuevo.";
}

export interface ConfirmationCopy {
  tone: "danger" | "primary";
  title: string;
  text: string;
  confirmLabel: string;
}

/** Text of the confirmation dialog for the two statuses that close an order. */
export function confirmationCopy(status: Extract<OrderStatus, "cancelled" | "delivered">, code: string): ConfirmationCopy {
  if (status === "cancelled") {
    return {
      tone: "danger",
      title: `¿Cancelar la orden ${code}?`,
      text: "La orden queda finalizada y no se podrá cambiar más. El cliente va a ver el aviso de cancelación en el seguimiento.",
      confirmLabel: "Sí, cancelar orden",
    };
  }
  return {
    tone: "primary",
    title: "¿Marcar como entregado?",
    text: "Confirmá que el cliente retiró el vehículo. La orden queda finalizada y no se podrá cambiar más.",
    confirmLabel: "Sí, marcar como entregado",
  };
}
