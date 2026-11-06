import request from "supertest";
import { TEST_PASSWORD, TEST_USER, buildApp, loginToken } from "../helpers";

describe("POST /api/auth/login", () => {
  it("returns a token and the user for valid credentials", async () => {
    const { app } = buildApp();

    const res = await request(app).post("/api/auth/login").send({ username: TEST_USER, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: "u-1", name: "Daniel Ruiz", role: "employee" });
    expect(typeof res.body.token).toBe("string");
  });

  it("never returns the password", async () => {
    const { app } = buildApp();

    const res = await request(app).post("/api/auth/login").send({ username: TEST_USER, password: TEST_PASSWORD });

    expect(JSON.stringify(res.body)).not.toContain(TEST_PASSWORD);
  });

  it("answers 401 with a generic message for a wrong password", async () => {
    const { app } = buildApp();

    const res = await request(app).post("/api/auth/login").send({ username: TEST_USER, password: "wrong" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("INVALID_CREDENTIALS");
  });

  it("answers the same 401 body for an unknown user", async () => {
    const { app } = buildApp();
    const wrongPassword = await request(app).post("/api/auth/login").send({ username: TEST_USER, password: "wrong" });

    const unknownUser = await request(app).post("/api/auth/login").send({ username: "ghost", password: "wrong" });

    expect(unknownUser.status).toBe(401);
    expect(unknownUser.body).toEqual(wrongPassword.body);
  });

  it("answers 400 when fields are missing", async () => {
    const { app } = buildApp();

    const res = await request(app).post("/api/auth/login").send({ username: TEST_USER });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("VALIDATION_ERROR");
  });

  it("answers 400 when a field is not a string", async () => {
    const { app } = buildApp();

    const res = await request(app).post("/api/auth/login").send({ username: { $ne: "" }, password: 1 });

    expect(res.status).toBe(400);
  });

  it("answers 400 for malformed JSON", async () => {
    const { app } = buildApp();

    const res = await request(app).post("/api/auth/login").set("Content-Type", "application/json").send("{not json");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("VALIDATION_ERROR");
  });

  it("answers 429 after too many attempts", async () => {
    const { app } = buildApp({ limits: { login: 3 } });
    const attempt = () => request(app).post("/api/auth/login").send({ username: TEST_USER, password: "wrong" });
    await attempt();
    await attempt();
    await attempt();

    const res = await attempt();

    expect(res.status).toBe(429);
    expect(res.body.error).toBe("TOO_MANY_REQUESTS");
  });
});

describe("protected /api/orders routes", () => {
  it.each([
    ["GET", "/api/orders"],
    ["GET", "/api/orders/wo-001"],
    ["PATCH", "/api/orders/wo-001/status"],
  ])("answers 401 on %s %s without a token", async (method, path) => {
    const { app } = buildApp();

    const res = await request(app)[method.toLowerCase() as "get" | "patch"](path).send({ status: "awaiting_approval" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("UNAUTHORIZED");
  });

  it("answers 401 for a malformed token", async () => {
    const { app } = buildApp();

    const res = await request(app).get("/api/orders").set("Authorization", "Bearer not-a-token");

    expect(res.status).toBe(401);
  });

  it("answers 401 for a non-bearer scheme", async () => {
    const { app } = buildApp();
    const token = await loginToken(app);

    const res = await request(app).get("/api/orders").set("Authorization", `Basic ${token}`);

    expect(res.status).toBe(401);
  });

  it("keeps the public routes open without a token", async () => {
    const { app } = buildApp();

    const res = await request(app).get("/api/tracking/TR-1042");

    expect(res.status).toBe(200);
  });
});

describe("GET /api/orders", () => {
  it("lists every order with the summary fields", async () => {
    const { app } = buildApp();
    const token = await loginToken(app);

    const res = await request(app).get("/api/orders").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(8);
    expect(Object.keys(res.body[0]).sort()).toEqual(["code", "customerName", "id", "status", "updatedAt", "vehicle"]);
  });
});

describe("GET /api/orders/:id", () => {
  it("returns the detail with history and allowed next statuses", async () => {
    const { app } = buildApp();
    const token = await loginToken(app);

    const res = await request(app).get("/api/orders/wo-002").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.customerPhone).toBe("351-555-0102");
    expect(res.body.allowedNextStatuses).toEqual(["waiting_parts", "ready_for_pickup", "cancelled"]);
    expect(res.body.history[0]).toMatchObject({ from: null, to: "received" });
  });

  it("returns an empty allowedNextStatuses for a final order", async () => {
    const { app } = buildApp();
    const token = await loginToken(app);

    const res = await request(app).get("/api/orders/wo-007").set("Authorization", `Bearer ${token}`);

    expect(res.body.allowedNextStatuses).toEqual([]);
  });

  it("answers 404 for an unknown order", async () => {
    const { app } = buildApp();
    const token = await loginToken(app);

    const res = await request(app).get("/api/orders/nope").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("ORDER_NOT_FOUND");
  });
});

describe("PATCH /api/orders/:id/status", () => {
  const patch = (app: ReturnType<typeof buildApp>["app"], token: string, id: string, body: unknown) =>
    request(app).patch(`/api/orders/${id}/status`).set("Authorization", `Bearer ${token}`).send(body as object);

  it("applies a valid transition and answers the updated order", async () => {
    const { app } = buildApp();
    const token = await loginToken(app);

    const res = await patch(app, token, "wo-006", { status: "repairing" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("repairing");
    expect(res.body.history.at(-1)).toMatchObject({ from: "awaiting_approval", to: "repairing" });
  });

  it("persists the change for later reads", async () => {
    const { app } = buildApp();
    const token = await loginToken(app);
    await patch(app, token, "wo-006", { status: "repairing" });

    const res = await request(app).get("/api/orders/wo-006").set("Authorization", `Bearer ${token}`);

    expect(res.body.status).toBe("repairing");
  });

  it("answers 422 with the allowed statuses for an invalid transition", async () => {
    const { app } = buildApp();
    const token = await loginToken(app);

    const res = await patch(app, token, "wo-001", { status: "ready_for_pickup" });

    expect(res.status).toBe(422);
    expect(res.body).toMatchObject({ error: "INVALID_TRANSITION", allowed: ["awaiting_approval", "cancelled"] });
  });

  it("does not modify the order after an invalid transition", async () => {
    const { app } = buildApp();
    const token = await loginToken(app);
    await patch(app, token, "wo-001", { status: "ready_for_pickup" });

    const res = await request(app).get("/api/orders/wo-001").set("Authorization", `Bearer ${token}`);

    expect(res.body.status).toBe("diagnosing");
  });

  it("answers 422 when the order is already in the requested status", async () => {
    const { app } = buildApp();
    const token = await loginToken(app);

    const res = await patch(app, token, "wo-001", { status: "diagnosing" });

    expect(res.status).toBe(422);
  });

  it("answers 400 for a status value that does not exist", async () => {
    const { app } = buildApp();
    const token = await loginToken(app);

    const res = await patch(app, token, "wo-001", { status: "exploded" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("VALIDATION_ERROR");
  });

  it("answers 400 when the body has no status", async () => {
    const { app } = buildApp();
    const token = await loginToken(app);

    const res = await patch(app, token, "wo-001", {});

    expect(res.status).toBe(400);
  });

  it("answers 404 for an unknown order", async () => {
    const { app } = buildApp();
    const token = await loginToken(app);

    const res = await patch(app, token, "nope", { status: "diagnosing" });

    expect(res.status).toBe(404);
  });
});

describe("GET /api/tracking/:code", () => {
  it("returns the tracking view for an existing code", async () => {
    const { app } = buildApp();

    const res = await request(app).get("/api/tracking/TR-1042");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      code: "TR-1042",
      status: "diagnosing",
      vehicle: { brand: "Ford", model: "Fiesta", plateMasked: "***3CD" },
    });
  });

  it("matches the code ignoring case", async () => {
    const { app } = buildApp();

    const res = await request(app).get("/api/tracking/tr-1042");

    expect(res.status).toBe(200);
  });

  it("does not leak personal data or internal fields", async () => {
    const { app } = buildApp();

    const res = await request(app).get("/api/tracking/TR-1042");

    expect(Object.keys(res.body).sort()).toEqual(["code", "history", "status", "updatedAt", "vehicle"]);
    expect(Object.keys(res.body.vehicle).sort()).toEqual(["brand", "model", "plateMasked"]);
    expect(JSON.stringify(res.body)).not.toMatch(/AB123CD|Marcelo|351-555|wo-001/);
  });

  it("answers 404 for an unknown code", async () => {
    const { app } = buildApp();

    const res = await request(app).get("/api/tracking/TR-9999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("ORDER_NOT_FOUND");
  });

  it("answers 400 for a code with invalid characters", async () => {
    const { app } = buildApp();

    const res = await request(app).get("/api/tracking/TR-1042%20OR%201=1");

    expect(res.status).toBe(400);
  });

  it("answers 429 after too many requests", async () => {
    const { app } = buildApp({ limits: { tracking: 2 } });
    await request(app).get("/api/tracking/TR-1042");
    await request(app).get("/api/tracking/TR-1042");

    const res = await request(app).get("/api/tracking/TR-1042");

    expect(res.status).toBe(429);
  });
});

describe("error handling", () => {
  it("answers 404 with a JSON body for an unknown route", async () => {
    const { app } = buildApp();

    const res = await request(app).get("/api/unknown");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("NOT_FOUND");
  });

  it("answers a generic 500 without stack traces when something unexpected fails", async () => {
    const failing = { list: () => Promise.reject(new Error("db password=secret at /srv/app/db.ts")) };
    const logged: unknown[] = [];
    const { app, auth } = buildApp({ logger: (_m, e) => logged.push(e) });
    const brokenApp = buildApp({
      orders: { ...failing, getById: failing.list, changeStatus: failing.list, getTracking: failing.list },
      auth,
      logger: (_m, e) => logged.push(e),
    }).app;
    const token = await loginToken(app);

    const res = await request(brokenApp).get("/api/orders").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "INTERNAL_ERROR", message: expect.any(String) });
    expect(JSON.stringify(res.body)).not.toMatch(/secret|\/srv|stack/);
  });

  it("sends security headers and hides the framework", async () => {
    const { app } = buildApp();

    const res = await request(app).get("/api/tracking/TR-1042");

    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("advertises only the configured CORS origin and never reflects the request origin", async () => {
    const { app } = buildApp();

    const res = await request(app).get("/api/tracking/TR-1042").set("Origin", "http://evil.example");

    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
  });
});
