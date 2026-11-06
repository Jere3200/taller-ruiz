import { ApiError, type ApiClient } from "./api";
import type { TrackingView } from "./types";

export type TrackingOutcome =
  | { kind: "idle" }
  | { kind: "empty" }
  | { kind: "ok"; data: TrackingView }
  | { kind: "notfound" }
  | { kind: "ratelimited" }
  | { kind: "error" };

/** Reads the `codigo` query parameter: first value, trimmed, uppercase. `undefined` means it was not sent. */
export function normalizeCode(param: string | string[] | undefined): string | undefined {
  const value = Array.isArray(param) ? param[0] : param;
  return value === undefined ? undefined : value.trim().toUpperCase();
}

/** Turns an API answer into what the tracking page has to show. Never throws. */
export async function resolveTracking(api: Pick<ApiClient, "getTracking">, code: string | undefined): Promise<TrackingOutcome> {
  if (code === undefined) return { kind: "idle" };
  if (code === "") return { kind: "empty" };

  try {
    return { kind: "ok", data: await api.getTracking(code) };
  } catch (error) {
    if (error instanceof ApiError) {
      // A malformed code (400) reads the same to the visitor as one that does not exist.
      if (error.status === 404 || error.status === 400) return { kind: "notfound" };
      if (error.status === 429) return { kind: "ratelimited" };
    }
    return { kind: "error" };
  }
}
