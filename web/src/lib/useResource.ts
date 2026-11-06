"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "./api";

export type Resource<T> = { status: "loading" } | { status: "ok"; data: T } | { status: "error"; error: ApiError };

/**
 * Loads data from the API on mount (and on `reload`). `load` must be stable (wrap it in useCallback),
 * because a new function triggers a new request. The panel loads on the client because the token lives
 * in sessionStorage, which the server cannot read.
 */
export function useResource<T>(load: () => Promise<T>) {
  const [state, setState] = useState<Resource<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    load().then(
      (data) => {
        if (!cancelled) setState({ status: "ok", data });
      },
      (error: unknown) => {
        if (!cancelled) setState({ status: "error", error: error instanceof ApiError ? error : new ApiError(0) });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [load, attempt]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((value) => value + 1);
  }, []);

  /** Replaces the loaded data with something the API just returned (for example after a PATCH). */
  const setData = useCallback((data: T) => setState({ status: "ok", data }), []);

  return { state, reload, setData };
}
