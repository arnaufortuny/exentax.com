import type { Express, Response } from "express";
import { z } from "zod";
import { asyncHandler, isAuthenticated, getClientIp } from "./shared";
import { saveSubscription, removeSubscriptionForUser, getVapidPublicKey } from "../lib/push-service";
import { checkRateLimit } from "../lib/security";

export function registerPushRoutes(app: Express) {
  app.get("/api/push/vapid-key", (_req: any, res: Response) => {
    const key = getVapidPublicKey();
    if (!key) {
      return res.status(503).json({ message: "Push notifications not configured" });
    }
    res.json({ publicKey: key });
  });

  app.post("/api/push/subscribe", isAuthenticated, asyncHandler(async (req: any, res: Response) => {
    const ip = getClientIp(req);
    const rateCheck = await checkRateLimit("general", `push-sub:${ip}`);
    if (!rateCheck.allowed) {
      return res.status(429).json({ message: "Too many requests" });
    }

    const schema = z.object({
      endpoint: z.string().url().max(2048),
      keys: z.object({
        p256dh: z.string().min(1).max(512),
        auth: z.string().min(1).max(512),
      }),
    });

    const subscription = schema.parse(req.body);
    const userId = req.session.userId;

    await saveSubscription(userId, subscription);
    res.json({ success: true });
  }));

  app.post("/api/push/unsubscribe", isAuthenticated, asyncHandler(async (req: any, res: Response) => {
    const { endpoint } = z.object({ endpoint: z.string().url().max(2048) }).parse(req.body);
    const userId = req.session.userId;
    await removeSubscriptionForUser(userId, endpoint);
    res.json({ success: true });
  }));
}
