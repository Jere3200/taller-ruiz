import { createSeedOrders } from "./data/seed";
import { loadConfig } from "./config";
import { createApp } from "./http/app";
import { InMemoryOrderRepository } from "./repositories/inMemoryOrderRepository";
import { createAuthService, hashPassword } from "./services/authService";
import { createOrderService } from "./services/orderService";

const config = loadConfig();

const app = createApp({
  orders: createOrderService(new InMemoryOrderRepository(createSeedOrders())),
  auth: createAuthService({
    jwtSecret: config.JWT_SECRET,
    users: [{ id: "u-1", name: "Daniel Ruiz", username: config.DEMO_USER, passwordHash: hashPassword(config.DEMO_PASSWORD) }],
  }),
  corsOrigin: config.CORS_ORIGIN,
  trustProxy: config.TRUST_PROXY,
  limits: { tracking: config.TRACKING_LIMIT },
});

app.listen(config.PORT, () => {
  console.log(`Taller Ruiz API (datos simulados en memoria) escuchando en http://localhost:${config.PORT}`);
});
