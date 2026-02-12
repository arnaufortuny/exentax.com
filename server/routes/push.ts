import type { Express, Response } from "express";
import { z } from "zod";
import { asyncHandler, isAuthenticated } from "./shared";
import { saveSubscription, removeSubscription, getVapidPublicKey } from "../lib/push-service";

export function registerPushRoutes(app: Express) {
  app.get("/api/push/vapid-key", (_req: any, res: Response) => {
    const key = getVapidPublicKey();
    if (!key) {
      return res.status(503).json({ message: "Push notifications not configured" });
    }
    res.json({ publicKey: key });
  });

  app.post("/api/push/subscribe", isAuthenticated, asyncHandler(async (req: any, res: Response) => {
    const schema = z.object({
      endpoint: z.string().url(),
      keys: z.object({
        p256dh: z.string().min(1),
        auth: z.string().min(1),
      }),
    });

    const subscription = schema.parse(req.body);
    const userId = req.session.userId;

    await saveSubscription(userId, subscription);
    res.json({ success: true });
  }));

  app.post("/api/push/unsubscribe", isAuthenticated, asyncHandler(async (req: any, res: Response) => {
    const { endpoint } = z.object({ endpoint: z.string().url() }).parse(req.body);
    await removeSubscription(endpoint);
    res.json({ success: true });
  }));
}
