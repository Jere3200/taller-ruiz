import { describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient } from "./api";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function setup(response: Response | Error, token: string | null = "tok-123") {
  const fetchImpl = vi.fn<typeof fetch>(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
  const onUnauthorized = vi.fn();
  const api = createApiClient({ getToken: () => token, onUnauthorized, fetchImpl, baseUrl: "http://api.test/api" });
  const lastCall = () => {
    const [url, init] = fetchImpl.mock.calls.at(-1) ?? [];
    return { url: String(url), init: init as RequestInit & { headers: Record<string, string> } };
  };
  return { api, fetchImpl, onUnauthorized, lastCall };
}

describe("createApiClient", () => {
  it("agrega el token en las rutas privadas", async () => {
    const { api, lastCall } = setup(json(200, []));

    await api.getOrders();

    expect(lastCall().url).toBe("http://api.test/api/orders");
    expect(lastCall().init.headers.Authorization).toBe("Bearer tok-123");
  });

  it("no envía el token en el seguimiento público", async () => {
    const { api, lastCall } = setup(json(200, { code: "TR-1042" }));

    await api.getTracking("TR-1042");

    expect(lastCall().init.headers.Authorization).toBeUndefined();
  });

  it("no envía el token en el login", async () => {
    const { api, lastCall } = setup(json(200, { token: "t", user: {} }));

    await api.login("daniel", "secreto-123");

    expect(lastCall().init.headers.Authorization).toBeUndefined();
    expect(lastCall().init.method).toBe("POST");
    expect(lastCall().init.body).toBe(JSON.stringify({ username: "daniel", password: "secreto-123" }));
  });

  it("codifica el id y el código en la URL", async () => {
    const { api, lastCall } = setup(json(200, {}));

    await api.getOrder("a/b c");

    expect(lastCall().url).toBe("http://api.test/api/orders/a%2Fb%20c");
  });

  it("envía el nuevo estado por PATCH", async () => {
    const { api, lastCall } = setup(json(200, {}));

    await api.updateOrderStatus("wo-001", "repairing");

    expect(lastCall().init.method).toBe("PATCH");
    expect(lastCall().url).toBe("http://api.test/api/orders/wo-001/status");
    expect(lastCall().init.body).toBe(JSON.stringify({ status: "repairing" }));
  });

  it("avisa que la sesión venció cuando una ruta privada responde 401", async () => {
    const { api, onUnauthorized } = setup(json(401, { error: "UNAUTHORIZED", message: "x" }));

    await expect(api.getOrders()).rejects.toMatchObject({ status: 401 });

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("no trata como sesión vencida el 401 de un login con credenciales malas", async () => {
    const { api, onUnauthorized } = setup(json(401, { error: "INVALID_CREDENTIALS", message: "Usuario o contraseña incorrectos." }));

    await expect(api.login("daniel", "mal")).rejects.toMatchObject({ status: 401 });

    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("expone el mensaje y los estados permitidos de un 422", async () => {
    const { api } = setup(json(422, { error: "INVALID_TRANSITION", message: "No se puede.", allowed: ["repairing"] }));

    const error = await api.updateOrderStatus("wo-001", "delivered").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 422, message: "No se puede.", body: { allowed: ["repairing"] } });
  });

  it("convierte un fallo de red en un ApiError de estado 0", async () => {
    const { api } = setup(new TypeError("fetch failed"));

    await expect(api.getOrders()).rejects.toMatchObject({ status: 0, body: { error: "NETWORK_ERROR" } });
  });

  it("tolera una respuesta de error que no es JSON", async () => {
    const { api } = setup(new Response("<html>502</html>", { status: 502 }));

    await expect(api.getTracking("TR-1042")).rejects.toMatchObject({ status: 502, message: "HTTP 502" });
  });
});
