import type { OrderDetail, OrderStatus, OrderSummary, Session, TrackingView } from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface ErrorBody {
  error?: string;
  message?: string;
  allowed?: string[];
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ErrorBody = {},
  ) {
    super(body.message ?? `HTTP ${status}`);
    this.name = "ApiError";
  }
}

export interface ApiClientOptions {
  getToken: () => string | null;
  /** Called when a private request is answered with 401. */
  onUnauthorized: () => void;
  fetchImpl?: typeof fetch;
  baseUrl?: string;
}

export interface ApiClient {
  login(username: string, password: string): Promise<Session>;
  getOrders(): Promise<OrderSummary[]>;
  getOrder(id: string): Promise<OrderDetail>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<OrderDetail>;
  /** `clientIp` is the visitor address, forwarded so the API can rate-limit each visitor instead of the Next server. */
  getTracking(code: string, options?: { clientIp?: string }): Promise<TrackingView>;
}

/** The only place that talks HTTP: adds the token to private routes and centralises the 401 handling. */
export function createApiClient({
  getToken,
  onUnauthorized,
  fetchImpl = (...args) => fetch(...args),
  baseUrl = API_BASE_URL,
}: ApiClientOptions): ApiClient {
  async function request<T>(path: string, init: { method?: string; body?: unknown; auth?: boolean; headers?: Record<string, string> } = {}): Promise<T> {
    const { method = "GET", body, auth = false } = init;
    const headers: Record<string, string> = { "Content-Type": "application/json", ...init.headers };
    if (auth) {
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    let res: Response;
    try {
      res = await fetchImpl(baseUrl + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: "no-store",
      });
    } catch {
      throw new ApiError(0, { error: "NETWORK_ERROR", message: "No pudimos conectarnos con el servidor." });
    }

    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (res.status === 401 && auth) onUnauthorized();
    if (!res.ok) throw new ApiError(res.status, (data ?? {}) as ErrorBody);
    return data as T;
  }

  return {
    login: (username, password) => request<Session>("/auth/login", { method: "POST", body: { username, password } }),
    getOrders: () => request<OrderSummary[]>("/orders", { auth: true }),
    getOrder: (id) => request<OrderDetail>(`/orders/${encodeURIComponent(id)}`, { auth: true }),
    updateOrderStatus: (id, status) =>
      request<OrderDetail>(`/orders/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        body: { status },
        auth: true,
      }),
    getTracking: (code, options) =>
      request<TrackingView>(`/tracking/${encodeURIComponent(code)}`, {
        headers: options?.clientIp ? { "X-Forwarded-For": options.clientIp } : undefined,
      }),
  };
}
