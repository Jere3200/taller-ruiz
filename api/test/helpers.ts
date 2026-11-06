import request from "supertest";
import { createSeedOrders } from "../src/data/seed";
import { createApp, type AppDeps } from "../src/http/app";
import { InMemoryOrderRepository } from "../src/repositories/inMemoryOrderRepository";
import { createAuthService, hashPassword } from "../src/services/authService";
import { createOrderService } from "../src/services/orderService";

export const TEST_SECRET = "test-secret-with-at-least-32-characters-ok";
export const TEST_USER = "tester";
export const TEST_PASSWORD = "test-password-123";

export function buildApp(overrides: Partial<AppDeps> = {}) {
  const repo = new InMemoryOrderRepository(createSeedOrders(new Date("2026-11-06T12:00:00Z")));
  const auth = createAuthService({
    jwtSecret: TEST_SECRET,
    users: [{ id: "u-1", name: "Daniel Ruiz", username: TEST_USER, passwordHash: hashPassword(TEST_PASSWORD) }],
  });
  const app = createApp({
    orders: createOrderService(repo, () => new Date("2026-11-06T15:00:00Z")),
    auth,
    corsOrigin: "http://localhost:3000",
    logger: () => undefined,
    ...overrides,
  });
  return { app, repo, auth };
}

export async function loginToken(app: ReturnType<typeof buildApp>["app"]): Promise<string> {
  const res = await request(app).post("/api/auth/login").send({ username: TEST_USER, password: TEST_PASSWORD });
  return res.body.token as string;
}
