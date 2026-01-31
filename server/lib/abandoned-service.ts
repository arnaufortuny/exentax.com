import { db } from "../db";
import { llcApplications, maintenanceApplications, orders, users } from "@shared/schema";
import { eq, and, lt, isNull, isNotNull, or } from "drizzle-orm";
import { sendEmail, getAbandonedApplicationReminderTemplate } from "./email";

const ABANDONMENT_THRESHOLD_HOURS = 48;
const REMINDER_INTERVAL_HOURS = 12;
const MAX_REMINDERS = 3;

async function markAsAbandoned() {
  const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  await db.update(llcApplications)
    .set({ abandonedAt: new Date() })
    .where(and(
      eq(llcApplications.status, "draft"),
      lt(llcApplications.lastUpdated, cutoffDate),
      isNull(llcApplications.abandonedAt)
    ));
  
  await db.update(maintenanceApplications)
    .set({ abandonedAt: new Date() })
    .where(and(
      eq(maintenanceApplications.status, "draft"),
      lt(maintenanceApplications.lastUpdated, cutoffDate),
      isNull(maintenanceApplications.abandonedAt)
    ));
}

async function sendReminders() {
  const now = new Date();
  const reminderCutoff = new Date(now.getTime() - REMINDER_INTERVAL_HOURS * 60 * 60 * 1000);
  const deletionThreshold = new Date(now.getTime() - ABANDONMENT_THRESHOLD_HOURS * 60 * 60 * 1000);
  
  const abandonedLlcApps = await db.select({
    id: llcApplications.id,
    ownerEmail: llcApplications.ownerEmail,
    ownerFullName: llcApplications.ownerFullName,
    state: llcApplications.state,
    abandonedAt: llcApplications.abandonedAt,
    remindersSent: llcApplications.remindersSent,
    lastReminderAt: llcApplications.lastReminderAt,
    orderId: llcApplications.orderId,
  })
  .from(llcApplications)
  .where(and(
    eq(llcApplications.status, "draft"),
    isNotNull(llcApplications.abandonedAt),
    lt(llcApplications.remindersSent, MAX_REMINDERS),
    or(
      isNull(llcApplications.lastReminderAt),
      lt(llcApplications.lastReminderAt, reminderCutoff)
    )
  ))
  .limit(20);
  
  for (const app of abandonedLlcApps) {
    if (!app.ownerEmail || !app.abandonedAt) continue;
    
    const hoursRemaining = Math.max(0, 
      ABANDONMENT_THRESHOLD_HOURS - ((now.getTime() - app.abandonedAt.getTime()) / (60 * 60 * 1000))
    );
    
    if (hoursRemaining <= 0) continue;
    
    const name = app.ownerFullName || "Cliente";
    const state = app.state || "EE.UU.";
    
    const html = getAbandonedApplicationReminderTemplate(name, 'llc', state, hoursRemaining);
    
    await sendEmail({
      to: app.ownerEmail,
      subject: `Tu solicitud de LLC está pendiente - Complétala ahora`,
      html,
    });
    
    await db.update(llcApplications)
      .set({ 
        remindersSent: (app.remindersSent || 0) + 1,
        lastReminderAt: now 
      })
      .where(eq(llcApplications.id, app.id));
  }
  
  const abandonedMaintApps = await db.select({
    id: maintenanceApplications.id,
    ownerEmail: maintenanceApplications.ownerEmail,
    ownerFullName: maintenanceApplications.ownerFullName,
    state: maintenanceApplications.state,
    abandonedAt: maintenanceApplications.abandonedAt,
    remindersSent: maintenanceApplications.remindersSent,
    lastReminderAt: maintenanceApplications.lastReminderAt,
    orderId: maintenanceApplications.orderId,
  })
  .from(maintenanceApplications)
  .where(and(
    eq(maintenanceApplications.status, "draft"),
    isNotNull(maintenanceApplications.abandonedAt),
    lt(maintenanceApplications.remindersSent, MAX_REMINDERS),
    or(
      isNull(maintenanceApplications.lastReminderAt),
      lt(maintenanceApplications.lastReminderAt, reminderCutoff)
    )
  ))
  .limit(20);
  
  for (const app of abandonedMaintApps) {
    if (!app.ownerEmail || !app.abandonedAt) continue;
    
    const hoursRemaining = Math.max(0, 
      ABANDONMENT_THRESHOLD_HOURS - ((now.getTime() - app.abandonedAt.getTime()) / (60 * 60 * 1000))
    );
    
    if (hoursRemaining <= 0) continue;
    
    const name = app.ownerFullName || "Cliente";
    const state = app.state || "EE.UU.";
    
    const html = getAbandonedApplicationReminderTemplate(name, 'maintenance', state, hoursRemaining);
    
    await sendEmail({
      to: app.ownerEmail,
      subject: `Tu solicitud de mantenimiento está pendiente - Complétala ahora`,
      html,
    });
    
    await db.update(maintenanceApplications)
      .set({ 
        remindersSent: (app.remindersSent || 0) + 1,
        lastReminderAt: now 
      })
      .where(eq(maintenanceApplications.id, app.id));
  }
}

async function cleanupAbandonedApplications() {
  const deletionThreshold = new Date(Date.now() - ABANDONMENT_THRESHOLD_HOURS * 60 * 60 * 1000);
  
  const llcToDelete = await db.select({ id: llcApplications.id, orderId: llcApplications.orderId })
    .from(llcApplications)
    .where(and(
      eq(llcApplications.status, "draft"),
      lt(llcApplications.abandonedAt, deletionThreshold)
    ));
  
  for (const app of llcToDelete) {
    await db.delete(llcApplications).where(eq(llcApplications.id, app.id));
    await db.delete(orders).where(eq(orders.id, app.orderId));
  }
  
  const maintToDelete = await db.select({ id: maintenanceApplications.id, orderId: maintenanceApplications.orderId })
    .from(maintenanceApplications)
    .where(and(
      eq(maintenanceApplications.status, "draft"),
      lt(maintenanceApplications.abandonedAt, deletionThreshold)
    ));
  
  for (const app of maintToDelete) {
    await db.delete(maintenanceApplications).where(eq(maintenanceApplications.id, app.id));
    await db.delete(orders).where(eq(orders.id, app.orderId));
  }
  
  if (llcToDelete.length > 0 || maintToDelete.length > 0) {
    console.log(`[Abandoned Cleanup] Deleted ${llcToDelete.length} LLC apps and ${maintToDelete.length} maintenance apps`);
  }
}

export async function processAbandonedApplications() {
  try {
    await markAsAbandoned();
    await sendReminders();
    await cleanupAbandonedApplications();
  } catch (error) {
    console.error("[Abandoned Service] Error:", error);
  }
}
