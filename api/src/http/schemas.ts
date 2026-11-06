import { z } from "zod";
import { ORDER_STATUSES } from "../domain/status";

export const loginBody = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

export const changeStatusBody = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const trackingCode = z.string().min(1).max(32).regex(/^[A-Za-z0-9-]+$/);
