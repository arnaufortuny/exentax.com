import webpush from "web-push";
import { db } from "../db";
import { pushSubscriptions } from "@shared/schema";
import { eq } from "drizzle-orm";
import { createLogger } from "./logger";

const log = createLogger('push');

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:hola@exentax.com",
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function saveSubscription(userId: string, subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  const existing = await db.select().from(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }

  const [saved] = await db.insert(pushSubscriptions).values({
    userId,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  }).returning();

  return saved;
}

export async function removeSubscription(endpoint: string) {
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}

export async function sendPushToUser(userId: string, payload: { title: string; body: string; icon?: string; url?: string }) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return;
  }

  const subscriptions = await db.select().from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  const jsonPayload = JSON.stringify(payload);

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        jsonPayload
      );
    } catch (error: any) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        await removeSubscription(sub.endpoint);
        log.info(`Removed stale subscription for user ${userId}`);
      } else {
        log.warn("Push notification failed", { error: error?.message, userId });
      }
    }
  }
}

export function getVapidPublicKey(): string | undefined {
  return vapidPublicKey;
}
