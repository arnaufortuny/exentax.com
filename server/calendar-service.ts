import { db } from "./db";
import { llcApplications, orders, userNotifications, users, maintenanceApplications } from "@shared/schema";
import { eq, and, lte, gte, isNotNull, sql } from "drizzle-orm";
import { getRenewalReminderTemplate, queueEmail } from "./lib/email";

export interface ComplianceDeadline {
  type: "irs_1120" | "irs_5472" | "annual_report" | "agent_renewal";
  dueDate: Date;
  reminderDate: Date;
  description: string;
  state?: string;
}

export function calculateComplianceDeadlines(formationDate: Date, state: string): ComplianceDeadline[] {
  const deadlines: ComplianceDeadline[] = [];
  const formationYear = formationDate.getFullYear();

  const irs1120DueDate = new Date(formationYear + 1, 3, 15);
  const irs1120ReminderDate = new Date(irs1120DueDate);
  irs1120ReminderDate.setDate(irs1120ReminderDate.getDate() - 60);

  deadlines.push({
    type: "irs_1120",
    dueDate: irs1120DueDate,
    reminderDate: irs1120ReminderDate,
    description: "Presentación del formulario IRS 1120 (Declaración de impuestos corporativos)",
  });

  const irs5472DueDate = new Date(formationYear + 1, 3, 15);
  const irs5472ReminderDate = new Date(irs5472DueDate);
  irs5472ReminderDate.setDate(irs5472ReminderDate.getDate() - 60);

  deadlines.push({
    type: "irs_5472",
    dueDate: irs5472DueDate,
    reminderDate: irs5472ReminderDate,
    description: "Presentación del formulario IRS 5472 (Declaración de transacciones con propietarios extranjeros)",
  });

  if (state === "wyoming" || state === "delaware" || state === "WY" || state === "DE") {
    const annualReportDueDate = new Date(formationDate);
    annualReportDueDate.setFullYear(annualReportDueDate.getFullYear() + 1);
    const annualReportReminderDate = new Date(annualReportDueDate);
    annualReportReminderDate.setDate(annualReportReminderDate.getDate() - 60);

    const stateLabel = (state === "wyoming" || state === "WY") ? "Wyoming" : "Delaware";
    deadlines.push({
      type: "annual_report",
      dueDate: annualReportDueDate,
      reminderDate: annualReportReminderDate,
      description: `Informe Anual del estado de ${stateLabel}`,
      state: stateLabel,
    });
  }

  const agentRenewalDate = new Date(formationDate);
  agentRenewalDate.setFullYear(agentRenewalDate.getFullYear() + 1);
  const agentRenewalReminderDate = new Date(agentRenewalDate);
  agentRenewalReminderDate.setDate(agentRenewalReminderDate.getDate() - 60);

  deadlines.push({
    type: "agent_renewal",
    dueDate: agentRenewalDate,
    reminderDate: agentRenewalReminderDate,
    description: "Renovación del Agente Registrado",
  });

  return deadlines;
}

export async function updateApplicationDeadlines(applicationId: number, formationDate: Date, state: string) {
  const deadlines = calculateComplianceDeadlines(formationDate, state);

  const irs1120Deadline = deadlines.find(d => d.type === "irs_1120");
  const irs5472Deadline = deadlines.find(d => d.type === "irs_5472");
  const annualReportDeadline = deadlines.find(d => d.type === "annual_report");
  const agentRenewalDeadline = deadlines.find(d => d.type === "agent_renewal");

  await db.update(llcApplications).set({
    llcCreatedDate: formationDate,
    irs1120DueDate: irs1120Deadline?.dueDate,
    irs5472DueDate: irs5472Deadline?.dueDate,
    annualReportDueDate: annualReportDeadline?.dueDate,
    agentRenewalDate: agentRenewalDeadline?.dueDate,
    lastUpdated: new Date(),
  }).where(eq(llcApplications.id, applicationId));

  return deadlines;
}

export async function checkAndSendReminders() {
  const today = new Date();
  const reminderWindowStart = new Date(today);
  reminderWindowStart.setDate(reminderWindowStart.getDate() + 55);
  const reminderWindowEnd = new Date(today);
  reminderWindowEnd.setDate(reminderWindowEnd.getDate() + 65);

  const applicationsWithIRS1120 = await db.select({
    application: llcApplications,
    order: orders,
  })
  .from(llcApplications)
  .innerJoin(orders, eq(llcApplications.orderId, orders.id))
  .where(
    and(
      isNotNull(llcApplications.irs1120DueDate),
      gte(llcApplications.irs1120DueDate, reminderWindowStart),
      lte(llcApplications.irs1120DueDate, reminderWindowEnd)
    )
  );

  for (const { application, order } of applicationsWithIRS1120) {
    const daysUntilDue = Math.ceil((application.irs1120DueDate!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    await createComplianceNotification(
      order.userId,
      order.id,
      application.requestCode || `LLC-${application.id}`,
      "irs_1120",
      `Recordatorio: Formulario IRS 1120 vence en ${daysUntilDue} días`,
      `Tu declaración de impuestos corporativos (Form 1120) para ${application.companyName} vence el ${formatDate(application.irs1120DueDate!)}. No olvides presentarlo a tiempo.`
    );
  }

  const applicationsWithIRS5472 = await db.select({
    application: llcApplications,
    order: orders,
  })
  .from(llcApplications)
  .innerJoin(orders, eq(llcApplications.orderId, orders.id))
  .where(
    and(
      isNotNull(llcApplications.irs5472DueDate),
      gte(llcApplications.irs5472DueDate, reminderWindowStart),
      lte(llcApplications.irs5472DueDate, reminderWindowEnd)
    )
  );

  for (const { application, order } of applicationsWithIRS5472) {
    const daysUntilDue = Math.ceil((application.irs5472DueDate!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    await createComplianceNotification(
      order.userId,
      order.id,
      application.requestCode || `LLC-${application.id}`,
      "irs_5472",
      `Recordatorio: Formulario IRS 5472 vence en ${daysUntilDue} días`,
      `Tu declaración de transacciones (Form 5472) para ${application.companyName} vence el ${formatDate(application.irs5472DueDate!)}. Es obligatorio para propietarios extranjeros.`
    );
  }

  const applicationsWithAnnualReport = await db.select({
    application: llcApplications,
    order: orders,
  })
  .from(llcApplications)
  .innerJoin(orders, eq(llcApplications.orderId, orders.id))
  .where(
    and(
      isNotNull(llcApplications.annualReportDueDate),
      gte(llcApplications.annualReportDueDate, reminderWindowStart),
      lte(llcApplications.annualReportDueDate, reminderWindowEnd)
    )
  );

  for (const { application, order } of applicationsWithAnnualReport) {
    const daysUntilDue = Math.ceil((application.annualReportDueDate!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const stateLabel = application.state === "wyoming" || application.state === "WY" ? "Wyoming" : "Nuevo México";
    await createComplianceNotification(
      order.userId,
      order.id,
      application.requestCode || `LLC-${application.id}`,
      "annual_report",
      `Recordatorio: Informe Anual de ${stateLabel} vence en ${daysUntilDue} días`,
      `El informe anual de tu empresa ${application.companyName} en ${stateLabel} vence el ${formatDate(application.annualReportDueDate!)}. Presentar tarde puede resultar en multas.`
    );
  }

  const applicationsWithAgentRenewal = await db.select({
    application: llcApplications,
    order: orders,
  })
  .from(llcApplications)
  .innerJoin(orders, eq(llcApplications.orderId, orders.id))
  .where(
    and(
      isNotNull(llcApplications.agentRenewalDate),
      gte(llcApplications.agentRenewalDate, reminderWindowStart),
      lte(llcApplications.agentRenewalDate, reminderWindowEnd)
    )
  );

  for (const { application, order } of applicationsWithAgentRenewal) {
    const daysUntilDue = Math.ceil((application.agentRenewalDate!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    await createComplianceNotification(
      order.userId,
      order.id,
      application.requestCode || `LLC-${application.id}`,
      "agent_renewal",
      `Recordatorio: Renovación de Agente Registrado en ${daysUntilDue} días`,
      `La renovación del agente registrado para ${application.companyName} vence el ${formatDate(application.agentRenewalDate!)}. Sin agente registrado activo, tu LLC puede perder su buen estado legal.`
    );
  }

  // Also send renewal reminders for maintenance packages
  const renewalResult = await sendRenewalReminders();
  
  return { checked: true, timestamp: today, renewalRemindersSent: renewalResult.remindersSent };
}

async function createComplianceNotification(
  userId: string,
  orderId: number,
  orderCode: string,
  type: string,
  title: string,
  message: string
) {
  const ticketId = `COMP-${type.toUpperCase()}-${orderId}-${Date.now()}`;

  const existing = await db.select().from(userNotifications).where(
    and(
      eq(userNotifications.userId, userId),
      eq(userNotifications.orderId, orderId),
      sql`${userNotifications.type} = ${'compliance_' + type}`,
      sql`${userNotifications.createdAt} > NOW() - INTERVAL '30 days'`
    )
  ).limit(1);

  if (existing.length > 0) {
    return null;
  }

  await db.insert(userNotifications).values({
    userId,
    orderId,
    orderCode,
    ticketId,
    type: `compliance_${type}`,
    title,
    message,
    isRead: false,
    actionUrl: `/dashboard/orders/${orderId}`,
  });

  return ticketId;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

// Check for expired renewals - optimized with single query
export async function checkExpiredRenewals() {
  const today = new Date();
  
  // Get all completed LLC applications with renewal dates in the past
  const expiredApplications = await db.select({
    application: llcApplications,
    order: orders,
    user: users,
  })
  .from(llcApplications)
  .innerJoin(orders, eq(llcApplications.orderId, orders.id))
  .innerJoin(users, eq(orders.userId, users.id))
  .where(
    and(
      isNotNull(llcApplications.agentRenewalDate),
      lte(llcApplications.agentRenewalDate, today),
      eq(orders.status, "completed"),
      eq(users.accountStatus, "active") // Only check active users
    )
  );

  // Get all maintenance applications in a single query
  const allMaintenanceApps = await db.select({
    maintApp: maintenanceApplications,
    maintOrder: orders,
  })
  .from(maintenanceApplications)
  .innerJoin(orders, eq(maintenanceApplications.orderId, orders.id))
  .where(eq(orders.status, "completed"));

  const expiredList = [];
  
  for (const { application, order, user } of expiredApplications) {
    // Check if there's a maintenance app for the same state created within renewal window
    // (60 days before renewal date or any time after)
    const renewalDate = new Date(application.agentRenewalDate!);
    const sixtyDaysBeforeRenewal = new Date(renewalDate);
    sixtyDaysBeforeRenewal.setDate(sixtyDaysBeforeRenewal.getDate() - 60);
    
    const hasRenewal = allMaintenanceApps.some(({ maintApp, maintOrder }) => 
      maintOrder.userId === user.id &&
      maintApp.state === application.state &&
      new Date(maintOrder.createdAt!) >= sixtyDaysBeforeRenewal
    );
    
    if (!hasRenewal) {
      const daysSinceExpiry = Math.ceil((today.getTime() - new Date(application.agentRenewalDate!).getTime()) / (1000 * 60 * 60 * 24));
      expiredList.push({
        userId: user.id,
        clientId: user.clientId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: application.companyName,
        state: application.state,
        llcCreatedDate: application.llcCreatedDate,
        agentRenewalDate: application.agentRenewalDate,
        daysSinceExpiry,
        orderId: order.id,
        applicationId: application.id,
        accountStatus: user.accountStatus,
      });
    }
  }

  return expiredList;
}

// Get clients needing renewal (within 90 days of expiry or already expired) - optimized
export async function getClientsNeedingRenewal() {
  const today = new Date();
  const ninetyDaysFromNow = new Date(today);
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

  const applicationsNeedingRenewal = await db.select({
    application: llcApplications,
    order: orders,
    user: users,
  })
  .from(llcApplications)
  .innerJoin(orders, eq(llcApplications.orderId, orders.id))
  .innerJoin(users, eq(orders.userId, users.id))
  .where(
    and(
      isNotNull(llcApplications.agentRenewalDate),
      lte(llcApplications.agentRenewalDate, ninetyDaysFromNow),
      eq(orders.status, "completed"),
      eq(users.accountStatus, "active") // Only check active users
    )
  );

  // Get all maintenance applications in a single query
  const allMaintenanceApps = await db.select({
    maintApp: maintenanceApplications,
    maintOrder: orders,
  })
  .from(maintenanceApplications)
  .innerJoin(orders, eq(maintenanceApplications.orderId, orders.id))
  .where(eq(orders.status, "completed"));

  const result = [];
  
  for (const { application, order, user } of applicationsNeedingRenewal) {
    // Check if there's a maintenance app for the same state created within renewal window
    // (i.e., after formation date but meant to cover the renewal period)
    const renewalDate = new Date(application.agentRenewalDate!);
    const sixtyDaysBeforeRenewal = new Date(renewalDate);
    sixtyDaysBeforeRenewal.setDate(sixtyDaysBeforeRenewal.getDate() - 60);
    
    const hasRenewal = allMaintenanceApps.some(({ maintApp, maintOrder }) => 
      maintOrder.userId === user.id &&
      maintApp.state === application.state &&
      new Date(maintOrder.createdAt!) >= sixtyDaysBeforeRenewal // Renewal order created within renewal window
    );
    
    if (!hasRenewal) {
      const daysUntilExpiry = Math.ceil((new Date(application.agentRenewalDate!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      result.push({
        userId: user.id,
        clientId: user.clientId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: application.companyName,
        state: application.state,
        llcCreatedDate: application.llcCreatedDate,
        agentRenewalDate: application.agentRenewalDate,
        daysUntilExpiry,
        isExpired: daysUntilExpiry < 0,
        orderId: order.id,
        applicationId: application.id,
        accountStatus: user.accountStatus,
      });
    }
  }

  return result.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}

// Send renewal reminder notifications (called by scheduled job)
// Sends reminders at 60 days, 30 days, and 7 days before renewal date
export async function sendRenewalReminders() {
  const clientsNeedingRenewal = await getClientsNeedingRenewal();
  let remindersSent = 0;

  for (const client of clientsNeedingRenewal) {
    // Skip expired clients - they need different handling
    if (client.daysUntilExpiry < 0) continue;
    
    // Send reminders at 60 days, 30 days, and 7 days before expiry
    const reminderWindows = [
      { min: 55, max: 65, type: "renewal_60days", label: "60 días" },
      { min: 25, max: 35, type: "renewal_30days", label: "30 días" },
      { min: 5, max: 10, type: "renewal_7days", label: "una semana" },
    ];
    
    for (const window of reminderWindows) {
      if (client.daysUntilExpiry >= window.min && client.daysUntilExpiry <= window.max) {
        // Create in-app notification
        await createComplianceNotification(
          client.userId,
          client.orderId,
          `LLC-${client.applicationId}`,
          window.type,
          `Renovación pendiente en ${window.label}`,
          `Tu pack de mantenimiento para ${client.companyName} vence pronto (${formatDate(new Date(client.agentRenewalDate!))}). Contrata el pack de mantenimiento para mantener tu LLC activa y en cumplimiento legal.`
        );
        
        // Send email notification
        if (client.email) {
          const emailHtml = getRenewalReminderTemplate(
            client.firstName || "Cliente",
            client.companyName,
            window.label,
            formatDate(new Date(client.agentRenewalDate!)),
            client.state
          );
          queueEmail({
            to: client.email,
            subject: `Renovación LLC ${client.companyName} - Vence en ${window.label}`,
            html: emailHtml
          });
        }
        
        remindersSent++;
        break; // Only one reminder per window per client
      }
    }
  }

  return { remindersSent };
}

export function getUpcomingDeadlinesForUser(applications: any[]): any[] {
  const today = new Date();
  const deadlines: any[] = [];

  for (const app of applications) {
    if (app.llcCreatedDate) {
      const companyName = app.companyName || "Tu LLC";

      if (app.irs1120DueDate) {
        const daysUntil = Math.ceil((new Date(app.irs1120DueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil > 0 && daysUntil <= 365) {
          deadlines.push({
            type: "irs_1120",
            title: "IRS Form 1120",
            description: `Declaración de impuestos para ${companyName}`,
            dueDate: app.irs1120DueDate,
            daysUntil,
            urgency: daysUntil <= 30 ? "urgent" : daysUntil <= 60 ? "warning" : "normal",
            applicationId: app.id,
          });
        }
      }

      if (app.irs5472DueDate) {
        const daysUntil = Math.ceil((new Date(app.irs5472DueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil > 0 && daysUntil <= 365) {
          deadlines.push({
            type: "irs_5472",
            title: "IRS Form 5472",
            description: `Declaración de transacciones para ${companyName}`,
            dueDate: app.irs5472DueDate,
            daysUntil,
            urgency: daysUntil <= 30 ? "urgent" : daysUntil <= 60 ? "warning" : "normal",
            applicationId: app.id,
          });
        }
      }

      if (app.annualReportDueDate) {
        const daysUntil = Math.ceil((new Date(app.annualReportDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil > 0 && daysUntil <= 365) {
          const stateLabel = app.state === "wyoming" || app.state === "WY" ? "Wyoming" : "Nuevo México";
          deadlines.push({
            type: "annual_report",
            title: `Informe Anual (${stateLabel})`,
            description: `Informe anual del estado para ${companyName}`,
            dueDate: app.annualReportDueDate,
            daysUntil,
            urgency: daysUntil <= 30 ? "urgent" : daysUntil <= 60 ? "warning" : "normal",
            applicationId: app.id,
            state: stateLabel,
          });
        }
      }

      if (app.agentRenewalDate) {
        const daysUntil = Math.ceil((new Date(app.agentRenewalDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil > 0 && daysUntil <= 365) {
          deadlines.push({
            type: "agent_renewal",
            title: "Renovación Agente Registrado",
            description: `Renovación anual del agente para ${companyName}`,
            dueDate: app.agentRenewalDate,
            daysUntil,
            urgency: daysUntil <= 30 ? "urgent" : daysUntil <= 60 ? "warning" : "normal",
            applicationId: app.id,
          });
        }
      }
    }
  }

  return deadlines.sort((a, b) => a.daysUntil - b.daysUntil);
}
