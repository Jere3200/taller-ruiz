import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import type { AuthService } from "../services/authService";
import type { OrderService } from "../services/orderService";
import { createErrorHandler, notFoundHandler, type Logger } from "./errorHandler";
import { limiter, parse, requireAuth } from "./middleware";
import { changeStatusBody, loginBody, trackingCode } from "./schemas";

export interface AppDeps {
  orders: OrderService;
  auth: AuthService;
  corsOrigin: string;
  logger?: Logger;
  /** Max requests per window, per client. Overridable so tests can hit the limit quickly. */
  limits?: { login?: number; tracking?: number; windowMs?: number };
}

export function createApp({ orders, auth, corsOrigin, logger = (m, e) => console.error(m, e), limits = {} }: AppDeps): Express {
  const windowMs = limits.windowMs ?? 15 * 60 * 1000;
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: corsOrigin, methods: ["GET", "POST", "PATCH"], allowedHeaders: ["Content-Type", "Authorization"] }));
  app.use(express.json({ limit: "10kb" }));

  app.post("/api/auth/login", limiter(limits.login ?? 10, windowMs), (req, res) => {
    const { username, password } = parse(loginBody, req.body, "Ingresá usuario y contraseña.");
    res.json(auth.login(username, password));
  });

  app.get("/api/tracking/:code", limiter(limits.tracking ?? 60, windowMs), async (req, res) => {
    const code = parse(trackingCode, req.params.code, "El código de seguimiento no es válido.");
    res.json(await orders.getTracking(code));
  });

  const internal = express.Router();
  internal.use(requireAuth(auth));

  internal.get("/", async (_req, res) => {
    res.json(await orders.list());
  });

  internal.get("/:id", async (req, res) => {
    res.json(await orders.getById(String(req.params.id)));
  });

  internal.patch("/:id/status", async (req, res) => {
    const { status } = parse(changeStatusBody, req.body, "El estado indicado no es válido.");
    res.json(await orders.changeStatus(String(req.params.id), status));
  });

  app.use("/api/orders", internal);

  app.use(notFoundHandler);
  app.use(createErrorHandler(logger));
  return app;
}
