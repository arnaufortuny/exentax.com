import { db } from "../db";
import { llcApplications, maintenanceApplications, orders, users } from "@shared/schema";
import { eq, and, lt, isNull, isNotNull, or } from "drizzle-orm";
import { sendEmail, getAbandonedApplicationReminderTemplate } from "./email";
import type { EmailLanguage } from "./email-translations";
import { createLogger } from "./logger";

const log = createLogger('abandoned-service');

const ABANDONMENT_THRESHOLD_HOURS = 48;
const REMINDER_INTERVAL_HOURS = 12;
const MAX_REMINDERS = 3;

async function getUserLanguage(orderId: number): Promise<EmailLanguage> {
  try {
    const [order] = await db.select({ userId: orders.userId })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    if (order?.userId) {
      const [user] = await db.select({ preferredLanguage: users.preferredLanguage })
        .from(users)
        .where(eq(users.id, order.userId))
        .limit(1);
      if (user?.preferredLanguage) {
        return user.preferredLanguage as EmailLanguage;
      }
    }
  } catch {}
  return 'es';
}

const subjectByLang: Record<string, { llc: string; maintenance: string }> = {
  es: { llc: 'Tu solicitud de LLC está pendiente - Complétala ahora', maintenance: 'Tu solicitud de mantenimiento está pendiente - Complétala ahora' },
  en: { llc: 'Your LLC application is pending - Complete it now', maintenance: 'Your maintenance application is pending - Complete it now' },
  ca: { llc: 'La teva sol·licitud de LLC està pendent - Completa-la ara', maintenance: 'La teva sol·licitud de manteniment està pendent - Completa-la ara' },
  fr: { llc: 'Votre demande de LLC est en attente - Complétez-la maintenant', maintenance: 'Votre demande de maintenance est en attente - Complétez-la maintenant' },
  de: { llc: 'Ihr LLC-Antrag ist ausstehend - Vervollständigen Sie ihn jetzt', maintenance: 'Ihr Wartungsantrag ist ausstehend - Vervollständigen Sie ihn jetzt' },
  it: { llc: 'La tua richiesta di LLC è in sospeso - Completala ora', maintenance: 'La tua richiesta di manutenzione è in sospeso - Completala ora' },
  pt: { llc: 'O seu pedido de LLC está pendente - Complete-o agora', maintenance: 'O seu pedido de manutenção está pendente - Complete-o agora' },
};

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
    
    const lang = await getUserLanguage(app.orderId);
    const name = app.ownerFullName || (lang === 'en' ? "Client" : "Cliente");
    const state = app.state || (lang === 'en' ? "USA" : "EE.UU.");
    
    const html = getAbandonedApplicationReminderTemplate(name, 'llc', state, hoursRemaining, lang);
    const subjects = subjectByLang[lang] || subjectByLang.es;
    
    await sendEmail({
      to: app.ownerEmail,
      subject: subjects.llc,
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
    
    const lang = await getUserLanguage(app.orderId);
    const name = app.ownerFullName || (lang === 'en' ? "Client" : "Cliente");
    const state = app.state || (lang === 'en' ? "USA" : "EE.UU.");
    
    const html = getAbandonedApplicationReminderTemplate(name, 'maintenance', state, hoursRemaining, lang);
    const subjects = subjectByLang[lang] || subjectByLang.es;
    
    await sendEmail({
      to: app.ownerEmail,
      subject: subjects.maintenance,
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
    log.info(`Deleted ${llcToDelete.length} LLC apps and ${maintToDelete.length} maintenance apps`);
  }
}

export async function processAbandonedApplications() {
  try {
    await markAsAbandoned();
    await sendReminders();
    await cleanupAbandonedApplications();
  } catch (error) {
    log.error("Error processing abandoned applications", error);
  }
}
