import { createRequire } from 'module';
import { fileURLToPath as __fileURLToPath } from 'url';
import { dirname as __dirname_fn } from 'path';
const require = createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_fn(__filename);
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/models/auth.ts
import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, boolean, text, integer } from "drizzle-orm/pg-core";
var sessions, users, userNotifications, passwordResetTokens, emailVerificationTokens;
var init_auth = __esm({
  "shared/models/auth.ts"() {
    "use strict";
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      clientId: varchar("client_id", { length: 8 }).unique(),
      // 8-digit numeric ID
      email: varchar("email").unique(),
      passwordHash: varchar("password_hash"),
      firstName: varchar("first_name"),
      lastName: varchar("last_name"),
      profileImageUrl: varchar("profile_image_url"),
      phone: varchar("phone"),
      address: text("address"),
      streetType: text("street_type"),
      city: text("city"),
      province: text("province"),
      postalCode: text("postal_code"),
      country: text("country"),
      businessActivity: text("business_activity"),
      idNumber: text("id_number"),
      idType: text("id_type"),
      birthDate: text("birth_date"),
      emailVerified: boolean("email_verified").notNull().default(false),
      isAdmin: boolean("is_admin").notNull().default(false),
      isActive: boolean("is_active").notNull().default(true),
      accountStatus: text("account_status").notNull().default("active"),
      // active (Verificado), pending (En revisión), deactivated (Desactivada), vip
      loginAttempts: integer("login_attempts").notNull().default(0),
      lockUntil: timestamp("lock_until"),
      internalNotes: text("internal_notes"),
      googleId: varchar("google_id"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    userNotifications = pgTable("user_notifications", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      orderId: integer("order_id"),
      orderCode: text("order_code"),
      ticketId: text("ticket_id").unique(),
      type: text("type").notNull(),
      title: text("title").notNull(),
      message: text("message").notNull(),
      isRead: boolean("is_read").notNull().default(false),
      actionUrl: text("action_url"),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("user_notifications_user_id_idx").on(table.userId),
      index("user_notifications_is_read_idx").on(table.isRead),
      index("user_notifications_ticket_id_idx").on(table.ticketId)
    ]);
    passwordResetTokens = pgTable("password_reset_tokens", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      token: varchar("token").notNull().unique(),
      expiresAt: timestamp("expires_at").notNull(),
      used: boolean("used").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    emailVerificationTokens = pgTable("email_verification_tokens", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      token: varchar("token").notNull().unique(),
      expiresAt: timestamp("expires_at").notNull(),
      used: boolean("used").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
  }
});

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  applicationDocuments: () => applicationDocuments,
  applicationDocumentsRelations: () => applicationDocumentsRelations,
  contactOtps: () => contactOtps,
  discountCodes: () => discountCodes,
  emailVerificationTokens: () => emailVerificationTokens,
  insertApplicationDocumentSchema: () => insertApplicationDocumentSchema,
  insertContactOtpSchema: () => insertContactOtpSchema,
  insertDiscountCodeSchema: () => insertDiscountCodeSchema,
  insertLlcApplicationSchema: () => insertLlcApplicationSchema,
  insertMaintenanceApplicationSchema: () => insertMaintenanceApplicationSchema,
  insertMessageReplySchema: () => insertMessageReplySchema,
  insertOrderEventSchema: () => insertOrderEventSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertProductSchema: () => insertProductSchema,
  llcApplications: () => llcApplications,
  llcApplicationsRelations: () => llcApplicationsRelations,
  maintenanceApplications: () => maintenanceApplications,
  maintenanceApplicationsRelations: () => maintenanceApplicationsRelations,
  messageReplies: () => messageReplies,
  messageRepliesRelations: () => messageRepliesRelations,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  newsletterSubscribers: () => newsletterSubscribers,
  orderEvents: () => orderEvents,
  orderEventsRelations: () => orderEventsRelations,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  passwordResetTokens: () => passwordResetTokens,
  products: () => products,
  sessions: () => sessions,
  userNotifications: () => userNotifications,
  users: () => users
});
import { pgTable as pgTable2, text as text2, serial, integer as integer2, boolean as boolean2, timestamp as timestamp2, jsonb as jsonb2, varchar as varchar2, index as index2 } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var products, orders, llcApplications, applicationDocuments, newsletterSubscribers, messages, contactOtps, orderEvents, messageReplies, maintenanceApplications, ordersRelations, orderEventsRelations, messagesRelations, messageRepliesRelations, llcApplicationsRelations, applicationDocumentsRelations, maintenanceApplicationsRelations, insertProductSchema, insertOrderSchema, insertLlcApplicationSchema, insertApplicationDocumentSchema, insertMaintenanceApplicationSchema, insertContactOtpSchema, insertOrderEventSchema, insertMessageReplySchema, discountCodes, insertDiscountCodeSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    init_auth();
    init_auth();
    products = pgTable2("products", {
      id: serial("id").primaryKey(),
      name: text2("name").notNull(),
      description: text2("description").notNull(),
      price: integer2("price").notNull(),
      // in cents
      features: jsonb2("features").$type().notNull()
    });
    orders = pgTable2("orders", {
      id: serial("id").primaryKey(),
      userId: varchar2("user_id").notNull().references(() => users.id),
      productId: integer2("product_id").notNull().references(() => products.id),
      status: text2("status").notNull().default("pending"),
      // pending, paid, processing, documents_ready, completed, cancelled
      stripeSessionId: text2("stripe_session_id"),
      amount: integer2("amount").notNull(),
      originalAmount: integer2("original_amount"),
      // original amount before discount
      discountCode: varchar2("discount_code", { length: 50 }),
      discountAmount: integer2("discount_amount").default(0),
      // discount in cents
      currency: varchar2("currency", { length: 3 }).notNull().default("EUR"),
      // USD or EUR
      isInvoiceGenerated: boolean2("is_invoice_generated").notNull().default(false),
      invoiceNumber: text2("invoice_number"),
      paymentLink: text2("payment_link"),
      // admin-set payment link URL
      paymentStatus: text2("payment_status").default("pending"),
      // pending, paid, overdue, cancelled
      paymentDueDate: timestamp2("payment_due_date"),
      paidAt: timestamp2("paid_at"),
      createdAt: timestamp2("created_at").defaultNow()
    }, (table) => ({
      userIdIdx: index2("orders_user_id_idx").on(table.userId),
      statusIdx: index2("orders_status_idx").on(table.status)
    }));
    llcApplications = pgTable2("llc_applications", {
      id: serial("id").primaryKey(),
      orderId: integer2("order_id").notNull().references(() => orders.id),
      requestCode: text2("request_code").unique(),
      ownerFullName: text2("owner_full_name"),
      ownerEmail: text2("owner_email"),
      ownerPhone: text2("owner_phone"),
      ownerBirthDate: text2("owner_birth_date"),
      ownerAddress: text2("owner_address"),
      ownerStreetType: text2("owner_street_type"),
      // Calle, Avenida, Paseo
      ownerCity: text2("owner_city"),
      ownerCountry: text2("owner_country"),
      ownerProvince: text2("owner_province"),
      ownerPostalCode: text2("owner_postal_code"),
      ownerIdNumber: text2("owner_id_number"),
      // DNI/Passport number
      ownerIdType: text2("owner_id_type"),
      // DNI or Passport
      idLater: boolean2("id_later").notNull().default(false),
      dataProcessingConsent: boolean2("data_processing_consent").notNull().default(false),
      termsConsent: boolean2("terms_consent").notNull().default(false),
      ageConfirmation: boolean2("age_confirmation").notNull().default(false),
      companyName: text2("company_name"),
      companyNameOption2: text2("company_name_option_2"),
      designator: text2("designator"),
      // LLC, L.L.C., Ltd.
      companyDescription: text2("company_description"),
      businessCategory: text2("business_category"),
      businessActivity: text2("business_activity"),
      businessCategoryOther: text2("business_category_other"),
      ownerNamesAlternates: text2("owner_names_alternates"),
      // Plan B, C, D names
      ownerCount: integer2("owner_count").default(1),
      ownerCountryResidency: text2("owner_country_residency"),
      idDocumentUrl: text2("id_document_url"),
      isSellingOnline: text2("is_selling_online"),
      // Yes, No, Not sure
      needsBankAccount: text2("needs_bank_account"),
      // Mercury, Relay, No, Yes
      willUseStripe: text2("will_use_stripe"),
      // Stripe, PayPal, Both, Other, Not yet
      wantsBoiReport: text2("wants_boi_report"),
      // Yes, No, Info
      wantsMaintenancePack: text2("wants_maintenance_pack"),
      // Yes, No, Info
      paymentMethod: text2("payment_method"),
      // transfer, link
      paymentStatus: text2("payment_status").notNull().default("unpaid"),
      // unpaid, paid
      notes: text2("notes"),
      state: text2("state"),
      status: text2("status").notNull().default("draft"),
      // draft, submitted, filed, rejected
      submittedAt: timestamp2("submitted_at"),
      lastUpdated: timestamp2("last_updated").defaultNow(),
      emailOtp: text2("email_otp"),
      emailOtpExpires: timestamp2("email_otp_expires"),
      emailVerified: boolean2("email_verified").notNull().default(false),
      // Important dates for calendar
      llcCreatedDate: timestamp2("llc_created_date"),
      agentRenewalDate: timestamp2("agent_renewal_date"),
      irs1120DueDate: timestamp2("irs_1120_due_date"),
      irs5472DueDate: timestamp2("irs_5472_due_date"),
      annualReportDueDate: timestamp2("annual_report_due_date")
    }, (table) => ({
      orderIdIdx: index2("llc_apps_order_id_idx").on(table.orderId),
      requestCodeIdx: index2("llc_apps_req_code_idx").on(table.requestCode),
      statusIdx: index2("llc_apps_status_idx").on(table.status)
    }));
    applicationDocuments = pgTable2("application_documents", {
      id: serial("id").primaryKey(),
      applicationId: integer2("application_id").references(() => llcApplications.id),
      orderId: integer2("order_id").references(() => orders.id),
      fileName: text2("file_name").notNull(),
      fileType: text2("file_type").notNull(),
      fileUrl: text2("file_url").notNull(),
      documentType: text2("document_type").notNull(),
      // passport, id, company_docs, tax_id, official_filing, other
      reviewStatus: text2("review_status").notNull().default("pending"),
      // pending, approved, rejected, action_required
      uploadedBy: varchar2("uploaded_by").references(() => users.id),
      uploadedAt: timestamp2("uploaded_at").defaultNow()
    }, (table) => ({
      applicationIdIdx: index2("app_docs_application_id_idx").on(table.applicationId),
      orderIdIdx: index2("app_docs_order_id_idx").on(table.orderId),
      uploadedByIdx: index2("app_docs_uploaded_by_idx").on(table.uploadedBy)
    }));
    newsletterSubscribers = pgTable2("newsletter_subscribers", {
      id: serial("id").primaryKey(),
      email: text2("email").notNull().unique(),
      subscribedAt: timestamp2("subscribed_at").defaultNow()
    });
    messages = pgTable2("messages", {
      id: serial("id").primaryKey(),
      userId: varchar2("user_id").references(() => users.id),
      name: text2("name"),
      email: text2("email").notNull(),
      phone: text2("phone"),
      contactByWhatsapp: boolean2("contact_by_whatsapp").default(false),
      subject: text2("subject"),
      content: text2("content").notNull(),
      encryptedContent: text2("encrypted_content"),
      status: text2("status").notNull().default("unread"),
      // unread, read, archived
      type: text2("type").notNull().default("contact"),
      // contact, support, system
      requestCode: text2("request_code"),
      messageId: text2("message_id").unique(),
      createdAt: timestamp2("created_at").defaultNow()
    }, (table) => ({
      userIdIdx: index2("messages_user_id_idx").on(table.userId),
      statusIdx: index2("messages_status_idx").on(table.status),
      emailIdx: index2("messages_email_idx").on(table.email)
    }));
    contactOtps = pgTable2("contact_otps", {
      id: serial("id").primaryKey(),
      email: text2("email").notNull(),
      otp: text2("otp").notNull(),
      otpType: text2("otp_type").notNull().default("contact"),
      // contact, password_change
      expiresAt: timestamp2("expires_at").notNull(),
      verified: boolean2("verified").notNull().default(false)
    }, (table) => ({
      emailIdx: index2("contact_otps_email_idx").on(table.email),
      expiresAtIdx: index2("contact_otps_expires_at_idx").on(table.expiresAt)
    }));
    orderEvents = pgTable2("order_events", {
      id: serial("id").primaryKey(),
      orderId: integer2("order_id").notNull().references(() => orders.id),
      eventType: text2("event_type").notNull(),
      description: text2("description").notNull(),
      createdAt: timestamp2("created_at").defaultNow(),
      createdBy: varchar2("created_by").references(() => users.id)
    }, (table) => ({
      orderIdIdx: index2("order_events_order_id_idx").on(table.orderId)
    }));
    messageReplies = pgTable2("message_replies", {
      id: serial("id").primaryKey(),
      messageId: integer2("message_id").notNull().references(() => messages.id),
      content: text2("content").notNull(),
      encryptedContent: text2("encrypted_content"),
      isAdmin: boolean2("is_admin").notNull().default(false),
      createdAt: timestamp2("created_at").defaultNow(),
      createdBy: varchar2("created_by").references(() => users.id)
    });
    maintenanceApplications = pgTable2("maintenance_applications", {
      id: serial("id").primaryKey(),
      orderId: integer2("order_id").notNull().references(() => orders.id),
      requestCode: text2("request_code").unique(),
      ownerFullName: text2("owner_full_name"),
      ownerEmail: text2("owner_email"),
      ownerPhone: text2("owner_phone"),
      companyName: text2("company_name"),
      ein: text2("ein"),
      state: text2("state"),
      creationSource: text2("creation_source"),
      creationYear: text2("creation_year"),
      bankAccount: text2("bank_account"),
      paymentGateway: text2("payment_gateway"),
      businessActivity: text2("business_activity"),
      expectedServices: text2("expected_services"),
      status: text2("status").notNull().default("draft"),
      submittedAt: timestamp2("submitted_at"),
      lastUpdated: timestamp2("last_updated").defaultNow(),
      emailOtp: text2("email_otp"),
      emailOtpExpires: timestamp2("email_otp_expires"),
      emailVerified: boolean2("email_verified").notNull().default(false),
      notes: text2("notes"),
      wantsDissolve: text2("wants_dissolve"),
      paymentMethod: text2("payment_method"),
      // transfer, link
      authorizedManagement: boolean2("authorized_management").notNull().default(false),
      termsConsent: boolean2("terms_consent").notNull().default(false),
      dataProcessingConsent: boolean2("data_processing_consent").notNull().default(false)
    }, (table) => ({
      orderIdIdx: index2("maint_apps_order_id_idx").on(table.orderId),
      requestCodeIdx: index2("maint_apps_req_code_idx").on(table.requestCode),
      statusIdx: index2("maint_apps_status_idx").on(table.status)
    }));
    ordersRelations = relations(orders, ({ one, many }) => ({
      user: one(users, { fields: [orders.userId], references: [users.id] }),
      product: one(products, { fields: [orders.productId], references: [products.id] }),
      application: one(llcApplications, { fields: [orders.id], references: [llcApplications.orderId] }),
      maintenanceApplication: one(maintenanceApplications, { fields: [orders.id], references: [maintenanceApplications.orderId] }),
      events: many(orderEvents)
    }));
    orderEventsRelations = relations(orderEvents, ({ one }) => ({
      order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] })
    }));
    messagesRelations = relations(messages, ({ many }) => ({
      replies: many(messageReplies)
    }));
    messageRepliesRelations = relations(messageReplies, ({ one }) => ({
      message: one(messages, { fields: [messageReplies.messageId], references: [messages.id] })
    }));
    llcApplicationsRelations = relations(llcApplications, ({ one, many }) => ({
      order: one(orders, { fields: [llcApplications.orderId], references: [orders.id] }),
      documents: many(applicationDocuments)
    }));
    applicationDocumentsRelations = relations(applicationDocuments, ({ one }) => ({
      application: one(llcApplications, { fields: [applicationDocuments.applicationId], references: [llcApplications.id] })
    }));
    maintenanceApplicationsRelations = relations(maintenanceApplications, ({ one }) => ({
      order: one(orders, { fields: [maintenanceApplications.orderId], references: [orders.id] })
    }));
    insertProductSchema = createInsertSchema(products).omit({ id: true });
    insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
    insertLlcApplicationSchema = createInsertSchema(llcApplications).omit({ id: true, lastUpdated: true });
    insertApplicationDocumentSchema = createInsertSchema(applicationDocuments).omit({ id: true, uploadedAt: true });
    insertMaintenanceApplicationSchema = createInsertSchema(maintenanceApplications).omit({ id: true, lastUpdated: true });
    insertContactOtpSchema = createInsertSchema(contactOtps).omit({ id: true });
    insertOrderEventSchema = createInsertSchema(orderEvents).omit({ id: true, createdAt: true });
    insertMessageReplySchema = createInsertSchema(messageReplies).omit({ id: true, createdAt: true });
    discountCodes = pgTable2("discount_codes", {
      id: serial("id").primaryKey(),
      code: varchar2("code", { length: 50 }).notNull().unique(),
      description: text2("description"),
      discountType: varchar2("discount_type", { length: 20 }).notNull().default("percentage"),
      // percentage or fixed
      discountValue: integer2("discount_value").notNull(),
      // percentage (0-100) or fixed amount in cents
      minOrderAmount: integer2("min_order_amount").default(0),
      // minimum order amount in cents
      maxUses: integer2("max_uses"),
      // null = unlimited
      usedCount: integer2("used_count").notNull().default(0),
      validFrom: timestamp2("valid_from").defaultNow(),
      validUntil: timestamp2("valid_until"),
      isActive: boolean2("is_active").notNull().default(true),
      createdAt: timestamp2("created_at").defaultNow()
    });
    insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({ id: true, createdAt: true, usedCount: true });
  }
});

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
var Pool, connectionString, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    ({ Pool } = pg);
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    connectionString = process.env.DATABASE_URL;
    if (!connectionString.includes("sslmode=")) {
      connectionString += (connectionString.includes("?") ? "&" : "?") + "sslmode=require";
    }
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 1e4,
      // 10s is safer for production startup
      idleTimeoutMillis: 1e4,
      max: 10
      // Sufficient pool size
    });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// server/lib/email.ts
var email_exports = {};
__export(email_exports, {
  getAccountDeactivatedTemplate: () => getAccountDeactivatedTemplate,
  getAccountLockedTemplate: () => getAccountLockedTemplate,
  getAccountReactivatedTemplate: () => getAccountReactivatedTemplate,
  getAccountUnderReviewTemplate: () => getAccountUnderReviewTemplate,
  getAccountVipTemplate: () => getAccountVipTemplate,
  getAdminLLCOrderTemplate: () => getAdminLLCOrderTemplate,
  getAdminMaintenanceOrderTemplate: () => getAdminMaintenanceOrderTemplate,
  getAdminNewRegistrationTemplate: () => getAdminNewRegistrationTemplate,
  getAdminNoteTemplate: () => getAdminNoteTemplate,
  getAutoReplyTemplate: () => getAutoReplyTemplate,
  getConfirmationEmailTemplate: () => getConfirmationEmailTemplate,
  getDocumentRequestTemplate: () => getDocumentRequestTemplate,
  getEmailFooter: () => getEmailFooter,
  getEmailHeader: () => getEmailHeader,
  getEmailQueueStatus: () => getEmailQueueStatus,
  getMessageReplyTemplate: () => getMessageReplyTemplate,
  getNewsletterWelcomeTemplate: () => getNewsletterWelcomeTemplate,
  getNoteReceivedTemplate: () => getNoteReceivedTemplate,
  getOrderCompletedTemplate: () => getOrderCompletedTemplate,
  getOrderEventTemplate: () => getOrderEventTemplate,
  getOrderUpdateTemplate: () => getOrderUpdateTemplate,
  getOtpEmailTemplate: () => getOtpEmailTemplate,
  getPasswordChangeOtpTemplate: () => getPasswordChangeOtpTemplate,
  getPaymentRequestTemplate: () => getPaymentRequestTemplate,
  getRegistrationOtpTemplate: () => getRegistrationOtpTemplate,
  getWelcomeEmailTemplate: () => getWelcomeEmailTemplate,
  queueEmail: () => queueEmail,
  sendEmail: () => sendEmail,
  sendTrustpilotEmail: () => sendTrustpilotEmail
});
import nodemailer from "nodemailer";
function getSimpleHeader() {
  return `
    <div style="background: linear-gradient(180deg, #0E1215 0%, #1a1f25 100%); padding: 35px 20px; text-align: center;">
      <a href="https://${domain}" target="_blank" style="text-decoration: none; display: inline-block;">
        <img src="https://${domain}/logo-email.png" alt="Easy US LLC" width="60" height="60" style="display: block; margin: 0 auto 12px; border-radius: 50%;" />
        <span style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 18px; font-weight: 800; color: #F7F7F5; letter-spacing: -0.5px;">Easy US LLC</span>
      </a>
    </div>
  `;
}
function getSimpleFooter() {
  return `
    <div style="background-color: #0E1215; padding: 35px 25px; text-align: center; color: #F7F7F5;">
      <div style="width: 40px; height: 3px; background: #6EDC8A; margin: 0 auto 20px; border-radius: 2px;"></div>
      <p style="margin: 0 0 15px 0; font-size: 12px; color: #9CA3AF; line-height: 1.7;">1209 Mountain Road Place Northeast, STE R<br>Albuquerque, NM 87110</p>
      <p style="margin: 0; font-size: 11px; color: #6B7280;">\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Easy US LLC</p>
    </div>
  `;
}
function getEmailWrapper(content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: #F7F7F5;">
      <div style="background-color: #F7F7F5; padding: 40px 15px;">
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: auto; border-radius: 24px; overflow: hidden; color: #0E1215; background-color: #ffffff; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          ${getSimpleHeader()}
          <div style="padding: 40px 35px;">
            ${content}
            <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 35px; padding-top: 25px; border-top: 1px solid #E6E9EC;">Si tienes cualquier duda, responde directamente a este correo.</p>
          </div>
          ${getSimpleFooter()}
        </div>
      </div>
    </body>
    </html>
  `;
}
function getOtpEmailTemplate(otp, name = "Cliente") {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 20px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 10px;">Gracias por continuar con tu proceso en Easy US LLC.</p>
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 30px;">Para garantizar la seguridad de tu cuenta, utiliza el siguiente c\xF3digo de verificaci\xF3n:</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 30px; border-radius: 16px; margin: 25px 0; text-align: center; border: 2px solid #6EDC8A;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #059669; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Tu c\xF3digo OTP:</p>
      <p style="margin: 0; font-size: 42px; font-weight: 900; color: #0E1215; letter-spacing: 12px; font-family: 'SF Mono', 'Consolas', monospace;">${otp}</p>
    </div>

    <div style="background: #F9FAFB; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: #0E1215; text-transform: uppercase;">Importante:</p>
      <ul style="margin: 0; padding-left: 18px; color: #444; font-size: 14px; line-height: 1.8;">
        <li style="margin-bottom: 6px;">Este c\xF3digo es personal y confidencial</li>
        <li style="margin-bottom: 6px;">Tiene una validez limitada a <strong>15 minutos</strong> por motivos de seguridad</li>
        <li>No lo compartas con nadie</li>
      </ul>
    </div>

    <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 25px;">Si no has solicitado este c\xF3digo, puedes ignorar este mensaje con total tranquilidad.</p>
  `;
  return getEmailWrapper(content);
}
function getWelcomeEmailTemplate(name = "Cliente") {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Gracias por registrarte en Easy US LLC.</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Tu cuenta ha sido creada correctamente. Desde tu panel podr\xE1s gestionar solicitudes, documentaci\xF3n y el estado de tus servicios en todo momento.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Acceder a Mi Panel</a>
    </div>
  `;
  return getEmailWrapper(content);
}
function getAccountUnderReviewTemplate(name = "Cliente") {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Te informamos de que tu cuenta se encuentra actualmente en revisi\xF3n.</p>
    
    <div style="background: #FEF3C7; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #F59E0B;">
      <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.7;">Durante este proceso de validaci\xF3n, no ser\xE1 posible realizar nuevos pedidos ni modificar informaci\xF3n existente en tu panel. Esta medida es temporal y forma parte de nuestros procedimientos de verificaci\xF3n.</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Nuestro equipo est\xE1 revisando la informaci\xF3n proporcionada y te notificaremos por este mismo medio en cuanto el proceso haya finalizado o si fuera necesario aportar documentaci\xF3n adicional.</p>
  `;
  return getEmailWrapper(content);
}
function getAccountVipTemplate(name = "Cliente") {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Tu cuenta ha sido actualizada al estado VIP.</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #6EDC8A;">
      <p style="margin: 0 0 15px 0; font-size: 15px; color: #0E1215; font-weight: 600;">Beneficios VIP:</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #444; line-height: 1.8;">
        <li>Atenci\xF3n prioritaria y gesti\xF3n acelerada</li>
        <li>Seguimiento preferente por nuestro equipo</li>
        <li>Acceso completo a todos los servicios</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Acceder a Mi Panel</a>
    </div>
  `;
  return getEmailWrapper(content);
}
function getAccountReactivatedTemplate(name = "Cliente") {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Tu cuenta ha sido reactivada correctamente.</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Ya puedes acceder a tu panel y utilizar todos nuestros servicios con normalidad.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Acceder a Mi Panel</a>
    </div>
  `;
  return getEmailWrapper(content);
}
function getConfirmationEmailTemplate(name, requestCode, details) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hemos recibido correctamente tu solicitud.</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #6EDC8A;">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Referencia:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0E1215;">#${requestCode}</td>
        </tr>
        ${details?.serviceType ? `<tr><td style="padding: 8px 0; color: #6B7280;">Servicio:</td><td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0E1215;">${details.serviceType}</td></tr>` : ""}
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Estado actual:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #059669;">En revisi\xF3n</td>
        </tr>
      </table>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Nuestro equipo est\xE1 validando la informaci\xF3n y te notificaremos cualquier actualizaci\xF3n directamente por email.</p>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Para cualquier duda relacionada con esta solicitud, responde a este correo indicando tu n\xFAmero de referencia.</p>
  `;
  return getEmailWrapper(content);
}
function getAutoReplyTemplate(ticketId, name = "Cliente") {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Tu mensaje ha sido recibido correctamente.</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #6EDC8A; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px;">N\xFAmero de ticket</p>
      <p style="margin: 0; font-size: 24px; font-weight: 900; color: #0E1215;">#${ticketId}</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Tiempo estimado de respuesta: <strong>24-48 horas laborables</strong></p>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Nuestro equipo revisar\xE1 tu consulta y te responder\xE1 lo antes posible. Si necesitas a\xF1adir informaci\xF3n adicional, responde directamente a este correo.</p>
  `;
  return getEmailWrapper(content);
}
function getOrderUpdateTemplate(name, orderNumber, newStatus, statusDescription) {
  const statusLabels = {
    pending: "Pendiente",
    processing: "En proceso",
    paid: "Pagado",
    filed: "Presentado",
    documents_ready: "Documentos listos",
    completed: "Completado",
    cancelled: "Cancelado"
  };
  const statusLabel = statusLabels[newStatus] || newStatus.replace(/_/g, " ");
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">El estado de tu pedido ha sido actualizado.</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Pedido:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0E1215;">#${orderNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Nuevo estado:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #059669;">${statusLabel}</td>
        </tr>
      </table>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${statusDescription}</p>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Para cualquier aclaraci\xF3n sobre esta actualizaci\xF3n, responde directamente a este correo.</p>
  `;
  return getEmailWrapper(content);
}
function getOrderCompletedTemplate(name, orderNumber) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Tu pedido ha sido completado correctamente.</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #6EDC8A;">
      <p style="margin: 0; font-size: 15px; color: #0E1215; line-height: 1.6;">Ya puedes acceder a toda la documentaci\xF3n desde tu panel de cliente.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Acceder a documentos</a>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Tu experiencia es importante para nosotros. Si lo deseas, puedes valorar nuestro servicio cuando recibas la invitaci\xF3n correspondiente.</p>
  `;
  return getEmailWrapper(content);
}
function getNoteReceivedTemplate(name, noteContent, orderNumber) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Tienes un nuevo mensaje de nuestro equipo${orderNumber ? ` relacionado con tu pedido <strong>#${orderNumber}</strong>` : ""}.</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0; font-size: 15px; color: #0E1215; line-height: 1.7; white-space: pre-wrap;">${noteContent}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Ver en Mi Panel</a>
    </div>
  `;
  return getEmailWrapper(content);
}
function getAdminNoteTemplate(name, title, message, ticketId) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #0E1215;">${title}</h2>
      <span style="font-size: 12px; color: #6B7280; background: #F3F4F6; padding: 6px 12px; border-radius: 20px;">Ticket: ${ticketId}</span>
    </div>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0; font-size: 15px; color: #0E1215; line-height: 1.7; white-space: pre-wrap;">${message}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Ver en Mi Panel</a>
    </div>
  `;
  return getEmailWrapper(content);
}
function getPaymentRequestTemplate(name, message, paymentLink, amount) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Se ha generado una solicitud de pago para continuar con tu tr\xE1mite${amount ? ` por un valor de <strong>${amount}</strong>` : ""}.</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #6B7280; text-transform: uppercase;">Mensaje:</p>
      <p style="margin: 0; font-size: 15px; color: #0E1215; line-height: 1.7;">${message}</p>
    </div>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${paymentLink}" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; padding: 16px 45px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Realizar Pago</a>
    </div>
    
    <p style="line-height: 1.5; font-size: 12px; color: #9CA3AF; text-align: center; margin-top: 20px;">Si el bot\xF3n no funciona, copia y pega este enlace:<br><a href="${paymentLink}" style="color: #6EDC8A; word-break: break-all;">${paymentLink}</a></p>
  `;
  return getEmailWrapper(content);
}
function getDocumentRequestTemplate(name, documentType, message, ticketId) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Nuestro equipo requiere que subas el siguiente documento:</p>
    
    <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FEF9C3 100%); padding: 20px 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #F59E0B; text-align: center;">
      <p style="margin: 0; font-size: 16px; font-weight: 700; color: #92400E;">${documentType}</p>
    </div>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #6B7280; text-transform: uppercase;">Mensaje:</p>
      <p style="margin: 0; font-size: 15px; color: #0E1215; line-height: 1.7;">${message}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 13px; color: #6B7280; margin-bottom: 25px;">Ticket de referencia: <strong>#${ticketId}</strong></p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Subir Documento</a>
    </div>
  `;
  return getEmailWrapper(content);
}
function getMessageReplyTemplate(name, content, ticketId) {
  const emailContent = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Hemos respondido a tu consulta (Ticket: <strong>#${ticketId}</strong>):</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0; font-size: 15px; color: #0E1215; line-height: 1.7; white-space: pre-wrap;">${content}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Ver en Mi Panel</a>
    </div>
  `;
  return getEmailWrapper(emailContent);
}
function getPasswordChangeOtpTemplate(name, otp) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Has solicitado cambiar tu contrase\xF1a. Usa este c\xF3digo para verificar tu identidad:</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 30px; border-radius: 16px; margin: 25px 0; text-align: center; border: 2px solid #6EDC8A;">
      <p style="margin: 0; font-size: 42px; font-weight: 900; color: #0E1215; letter-spacing: 12px; font-family: 'SF Mono', 'Consolas', monospace;">${otp}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Este c\xF3digo expira en <strong>10 minutos</strong>.</p>
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Si no solicitaste este cambio, ignora este mensaje.</p>
  `;
  return getEmailWrapper(content);
}
function getOrderEventTemplate(name, orderId, eventType, description) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Tu pedido <strong>#${orderId}</strong> tiene una actualizaci\xF3n:</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 700; color: #0E1215;">${eventType}</p>
      <p style="margin: 0; font-size: 14px; color: #6B7280; line-height: 1.6;">${description}</p>
    </div>
    
    <p style="line-height: 1.5; font-size: 13px; color: #9CA3AF;">Fecha: ${(/* @__PURE__ */ new Date()).toLocaleString("es-ES")}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Ver Detalles</a>
    </div>
  `;
  return getEmailWrapper(content);
}
function getAccountDeactivatedTemplate(name = "Cliente") {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Te informamos de que tu cuenta ha sido desactivada temporalmente.</p>
    
    <div style="background: #FEE2E2; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #EF4444;">
      <p style="margin: 0; font-size: 14px; color: #B91C1C; line-height: 1.7;">Mientras la cuenta permanezca desactivada no ser\xE1 posible realizar solicitudes ni acceder a formularios.</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Si consideras que se trata de un error o necesitas m\xE1s informaci\xF3n, responde directamente a este correo.</p>
  `;
  return getEmailWrapper(content);
}
function getNewsletterWelcomeTemplate() {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Tu suscripci\xF3n ha sido confirmada correctamente.</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Recibir\xE1s informaci\xF3n relevante sobre servicios, actualizaciones y novedades relacionadas con Easy US LLC.</p>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Puedes darte de baja en cualquier momento desde el enlace incluido en nuestros correos.</p>
  `;
  return getEmailWrapper(content);
}
function getRegistrationOtpTemplate(name, otp, clientId, expiryMinutes = 15) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Gracias por registrarte en Easy US LLC. Tu c\xF3digo de verificaci\xF3n es:</p>
    
    <div style="background-color: #0E1215; padding: 25px; text-align: center; border-radius: 16px; margin: 25px 0;">
      <span style="color: #6EDC8A; font-size: 36px; font-weight: 900; letter-spacing: 8px; font-family: monospace;">${otp}</span>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Este c\xF3digo expira en ${expiryMinutes} minutos.</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Tu ID de cliente es: <strong>${clientId}</strong></p>
  `;
  return getEmailWrapper(content);
}
function getAdminNewRegistrationTemplate(clientId, firstName, lastName, email, phone) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;"><strong>Nueva cuenta creada en el sistema.</strong></p>
    
    <div style="background-color: #F7F7F5; padding: 20px; border-radius: 16px; border-left: 4px solid #6EDC8A; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Cliente ID:</strong> ${clientId}</p>
      <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Nombre:</strong> ${firstName} ${lastName}</p>
      <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
      ${phone ? `<p style="margin: 0; font-size: 14px;"><strong>Tel\xE9fono:</strong> ${phone}</p>` : ""}
    </div>
  `;
  return getEmailWrapper(content);
}
function getAccountLockedTemplate(name, ticketId) {
  const baseUrl = process.env.BASE_URL || "https://app.easyusllc.com";
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Por su seguridad, su cuenta ha sido temporalmente bloqueada tras detectar m\xFAltiples intentos de acceso fallidos.</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Para desbloquear su cuenta y verificar su identidad, necesitamos que nos env\xEDe:</p>
    
    <div style="background-color: #FFF3E0; padding: 20px; border-radius: 16px; border-left: 4px solid #FF9800; margin: 25px 0;">
      <ul style="margin: 0; padding-left: 20px; color: #444;">
        <li style="margin-bottom: 8px;">Imagen del DNI/Pasaporte de alta resoluci\xF3n (ambas caras)</li>
        <li>Su fecha de nacimiento confirmada</li>
      </ul>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Su Ticket ID de referencia es: <strong>#${ticketId}</strong></p>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${baseUrl}/forgot-password" style="background-color: #6EDC8A; color: #0E1215; font-weight: 700; font-size: 15px; padding: 16px 40px; border-radius: 50px; text-decoration: none; display: inline-block; box-shadow: 0 4px 15px rgba(110, 220, 138, 0.3);">Restablecer contrase\xF1a</a>
    </div>
  `;
  return getEmailWrapper(content);
}
function getAdminLLCOrderTemplate(orderData) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;"><strong>Nuevo pedido LLC completado.</strong></p>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #6EDC8A; padding-bottom: 5px;">Informaci\xF3n del Propietario</h3>
    <div style="background: #F7F7F5; border-left: 4px solid #6EDC8A; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Nombre:</strong> ${orderData.ownerFullName || "N/A"}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Email:</strong> ${orderData.ownerEmail || "N/A"}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Tel\xE9fono:</strong> ${orderData.ownerPhone || "N/A"}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Fecha nacimiento:</strong> ${orderData.ownerBirthDate || "N/A"}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Documento:</strong> ${orderData.ownerIdType || "N/A"} - ${orderData.ownerIdNumber || "N/A"}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Direcci\xF3n:</strong> ${orderData.ownerAddress || "N/A"}, ${orderData.ownerCity || ""}, ${orderData.ownerProvince || ""} ${orderData.ownerPostalCode || ""}, ${orderData.ownerCountry || ""}</p>
    </div>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #6EDC8A; padding-bottom: 5px;">Informaci\xF3n de la Empresa</h3>
    <div style="background: #F7F7F5; border-left: 4px solid #6EDC8A; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Empresa:</strong> ${orderData.companyName || "N/A"} ${orderData.designator || ""}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Alternativo:</strong> ${orderData.companyNameOption2 || "N/A"}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Estado:</strong> ${orderData.state || "N/A"}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Categor\xEDa:</strong> ${orderData.businessCategory || "N/A"}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Actividad:</strong> ${orderData.businessActivity || "N/A"}</p>
    </div>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #6EDC8A; padding-bottom: 5px;">Servicios</h3>
    <div style="background: #F7F7F5; border-left: 4px solid #6EDC8A; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Vender\xE1 online:</strong> ${orderData.isSellingOnline || "N/A"}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Cuenta bancaria:</strong> ${orderData.needsBankAccount || "N/A"}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Pasarela:</strong> ${orderData.willUseStripe || "N/A"}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>BOI Report:</strong> ${orderData.wantsBoiReport || "N/A"}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Mantenimiento:</strong> ${orderData.wantsMaintenancePack || "N/A"}</p>
    </div>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 5px;">Pago</h3>
    <div style="background: #E8F5E9; border-left: 4px solid #4CAF50; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Referencia:</strong> ${orderData.orderIdentifier}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Importe:</strong> ${orderData.amount}\u20AC</p>
      <p style="margin: 0; font-size: 13px;"><strong>M\xE9todo:</strong> ${orderData.paymentMethod}</p>
    </div>
    
    ${orderData.notes ? `
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #FF9800; padding-bottom: 5px;">Notas del Cliente</h3>
    <div style="background: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0; font-size: 13px;">${orderData.notes}</p>
    </div>
    ` : ""}
  `;
  return getEmailWrapper(content);
}
function getAdminMaintenanceOrderTemplate(orderData) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;"><strong>Nuevo pedido de mantenimiento completado.</strong></p>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #6EDC8A; padding-bottom: 5px;">Informaci\xF3n del Propietario</h3>
    <div style="background: #F7F7F5; border-left: 4px solid #6EDC8A; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Nombre:</strong> ${orderData.ownerFullName || "N/A"}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Email:</strong> ${orderData.ownerEmail || "N/A"}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Tel\xE9fono:</strong> ${orderData.ownerPhone || "N/A"}</p>
    </div>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #6EDC8A; padding-bottom: 5px;">Informaci\xF3n de la Empresa</h3>
    <div style="background: #F7F7F5; border-left: 4px solid #6EDC8A; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Empresa:</strong> ${orderData.companyName || "N/A"}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>EIN:</strong> ${orderData.ein || "N/A"}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Estado:</strong> ${orderData.state || "N/A"}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Creado con:</strong> ${orderData.creationSource || "N/A"}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>A\xF1o creaci\xF3n:</strong> ${orderData.creationYear || "N/A"}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Cuenta bancaria:</strong> ${orderData.bankAccount || "N/A"}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Pasarela:</strong> ${orderData.paymentGateway || "N/A"}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Actividad:</strong> ${orderData.businessActivity || "N/A"}</p>
    </div>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #6EDC8A; padding-bottom: 5px;">Servicios Solicitados</h3>
    <div style="background: #F7F7F5; border-left: 4px solid #6EDC8A; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Servicios:</strong> ${orderData.expectedServices || "N/A"}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Disolver empresa:</strong> ${orderData.wantsDissolve || "No"}</p>
    </div>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 5px;">Pago</h3>
    <div style="background: #E8F5E9; border-left: 4px solid #4CAF50; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Referencia:</strong> ${orderData.orderIdentifier}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Importe:</strong> ${orderData.amount}\u20AC</p>
      <p style="margin: 0; font-size: 13px;"><strong>M\xE9todo:</strong> ${orderData.paymentMethod}</p>
    </div>
    
    ${orderData.notes ? `
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #FF9800; padding-bottom: 5px;">Notas del Cliente</h3>
    <div style="background: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0; font-size: 13px;">${orderData.notes}</p>
    </div>
    ` : ""}
  `;
  return getEmailWrapper(content);
}
function getEmailHeader(title = "Easy US LLC", metadata) {
  return getSimpleHeader();
}
function getEmailFooter() {
  return getSimpleFooter();
}
function generateEmailId() {
  return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function cleanupStaleEmails() {
  const now = Date.now();
  let removed = 0;
  while (emailQueue.length > 0 && emailQueue[0] && now - emailQueue[0].createdAt > EMAIL_TTL) {
    emailQueue.shift();
    removed++;
  }
  if (removed > 0) {
    console.log(`Cleaned up ${removed} stale emails from queue`);
  }
}
async function processEmailQueue() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    if (emailQueue.length > 0) {
      emailQueue.length = 0;
    }
    return;
  }
  if (isProcessingQueue || emailQueue.length === 0) return;
  const now = Date.now();
  if (now - lastProcessTime < 1e3) return;
  isProcessingQueue = true;
  lastProcessTime = now;
  try {
    cleanupStaleEmails();
    const job = emailQueue[0];
    if (!job) {
      isProcessingQueue = false;
      return;
    }
    const testEmail = "afortuny07@gmail.com";
    const originalTo = job.to;
    try {
      await transporter.sendMail({
        from: `"Easy US LLC" <no-reply@easyusllc.com>`,
        replyTo: job.replyTo || "hola@easyusllc.com",
        to: testEmail,
        subject: `[TEST - Para: ${originalTo}] ${job.subject}`,
        html: job.html
      });
      emailQueue.shift();
    } catch (error) {
      job.retries++;
      if (job.retries >= job.maxRetries) {
        emailQueue.shift();
        console.error(`Email failed after ${job.maxRetries} retries:`, job.id, job.to);
      } else {
        emailQueue.shift();
        emailQueue.push(job);
      }
    }
  } finally {
    isProcessingQueue = false;
  }
}
function queueEmail({ to, subject, html, replyTo }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  if (emailQueue.length >= MAX_QUEUE_SIZE) {
    console.warn(`Email queue full (${MAX_QUEUE_SIZE}), dropping email to: ${to}`);
    return null;
  }
  const job = {
    id: generateEmailId(),
    to,
    subject,
    html,
    replyTo,
    retries: 0,
    maxRetries: MAX_RETRIES,
    createdAt: Date.now()
  };
  emailQueue.push(job);
  return job.id;
}
function getEmailQueueStatus() {
  return {
    pending: emailQueue.length,
    isProcessing: isProcessingQueue
  };
}
async function sendEmail({ to, subject, html, replyTo }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return;
  }
  const testEmail = "afortuny07@gmail.com";
  const originalTo = to;
  try {
    const info = await transporter.sendMail({
      from: `"Easy US LLC" <no-reply@easyusllc.com>`,
      replyTo: replyTo || "hola@easyusllc.com",
      to: testEmail,
      subject: `[TEST - Para: ${originalTo}] ${subject}`,
      html
    });
    return info;
  } catch (error) {
    queueEmail({ to, subject, html, replyTo });
    return null;
  }
}
async function sendTrustpilotEmail({ to, name, orderNumber }) {
  if (!process.env.SMTP_PASS) {
    return;
  }
  const testEmail = "afortuny07@gmail.com";
  const originalTo = to;
  const trustpilotBcc = process.env.TRUSTPILOT_BCC_EMAIL || "easyusllc.com+62fb280c0a@invite.trustpilot.com";
  const html = getOrderCompletedTemplate(name, orderNumber);
  try {
    const info = await transporter.sendMail({
      from: `"Easy US LLC" <no-reply@easyusllc.com>`,
      replyTo: "hola@easyusllc.com",
      to: testEmail,
      bcc: trustpilotBcc,
      subject: `[TEST - Para: ${originalTo}] Pedido completado - Documentaci\xF3n disponible`,
      html
    });
    return info;
  } catch (error) {
    return null;
  }
}
var domain, appDomain, transporter, emailQueue, MAX_RETRIES, MAX_QUEUE_SIZE, EMAIL_TTL, QUEUE_PROCESS_INTERVAL, isProcessingQueue, lastProcessTime;
var init_email = __esm({
  "server/lib/email.ts"() {
    "use strict";
    domain = "easyusllc.com";
    appDomain = "app.easyusllc.com";
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ionos.es",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100
    });
    emailQueue = [];
    MAX_RETRIES = 3;
    MAX_QUEUE_SIZE = 100;
    EMAIL_TTL = 36e5;
    QUEUE_PROCESS_INTERVAL = 2e3;
    isProcessingQueue = false;
    lastProcessTime = 0;
    setInterval(processEmailQueue, QUEUE_PROCESS_INTERVAL);
  }
});

// server/lib/auth-service.ts
var auth_service_exports = {};
__export(auth_service_exports, {
  createPasswordResetOtp: () => createPasswordResetOtp,
  createUser: () => createUser,
  generateClientId: () => generateClientId,
  generateOtp: () => generateOtp,
  generateToken: () => generateToken,
  generateUniqueClientId: () => generateUniqueClientId,
  hashPassword: () => hashPassword,
  loginUser: () => loginUser,
  resendVerificationEmail: () => resendVerificationEmail,
  resetPasswordWithOtp: () => resetPasswordWithOtp,
  verifyEmailToken: () => verifyEmailToken,
  verifyPassword: () => verifyPassword,
  verifyPasswordResetOtp: () => verifyPasswordResetOtp
});
import bcrypt from "bcrypt";
import crypto from "crypto";
import { eq, and, gt, sql as sql4 } from "drizzle-orm";
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
function generateOtp() {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
}
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}
function generateClientId() {
  return Math.floor(1e7 + Math.random() * 9e7).toString();
}
async function generateUniqueClientId() {
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts < maxAttempts) {
    const clientId = generateClientId();
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.clientId, clientId)).limit(1);
    if (existing.length === 0) {
      return clientId;
    }
    attempts++;
  }
  return Date.now().toString().slice(-8);
}
async function createUser(data) {
  const existingUser = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (existingUser.length > 0) {
    throw new Error("El email ya est\xE1 registrado");
  }
  const passwordHash = await hashPassword(data.password);
  const isAdminEmail = data.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
  const [newUser] = await db.insert(users).values({
    id: data.clientId,
    clientId: data.clientId,
    email: data.email,
    passwordHash,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    businessActivity: data.businessActivity || null,
    emailVerified: false,
    isAdmin: isAdminEmail,
    accountStatus: "active"
  }).returning();
  const verificationToken = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1e3);
  await db.insert(emailVerificationTokens).values({
    userId: newUser.id,
    token: verificationToken,
    expiresAt
  });
  try {
    await sendEmail({
      to: data.email,
      subject: "Bienvenido a Easy US LLC - Verifica tu cuenta",
      html: getRegistrationOtpTemplate(data.firstName, verificationToken, data.clientId, OTP_EXPIRY_MINUTES)
    });
    const adminEmail = process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
    await sendEmail({
      to: adminEmail,
      subject: `[NUEVA CUENTA] ${data.firstName} ${data.lastName}`,
      html: getAdminNewRegistrationTemplate(data.clientId, data.firstName, data.lastName, data.email, data.phone)
    }).catch(() => {
    });
  } catch (emailError) {
  }
  return { user: newUser, verificationToken };
}
async function logActivity(title, data) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[AUTH] ${title}:`, data);
  }
}
async function verifyEmailToken(userId, token) {
  const [tokenRecord] = await db.select().from(emailVerificationTokens).where(
    and(
      eq(emailVerificationTokens.userId, userId),
      eq(emailVerificationTokens.token, token),
      eq(emailVerificationTokens.used, false),
      gt(emailVerificationTokens.expiresAt, /* @__PURE__ */ new Date())
    )
  ).limit(1);
  if (!tokenRecord) {
    return false;
  }
  await db.update(emailVerificationTokens).set({ used: true }).where(eq(emailVerificationTokens.id, tokenRecord.id));
  await db.update(users).set({
    emailVerified: true,
    accountStatus: "active",
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(users.id, userId));
  return true;
}
async function loginUser(email, password) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !user.passwordHash) {
    return null;
  }
  if (user.lockUntil && user.lockUntil > /* @__PURE__ */ new Date()) {
    const error = new Error("CUENTA BLOQUEADA TEMPORALMENTE. Por su seguridad su cuenta ha sido temporalmente desactivada, porfavor contacte con nuestro equipo o revise su email para desbloquear su cuenta.");
    error.locked = true;
    throw error;
  }
  if (user.isActive === false || user.accountStatus === "deactivated") {
    const error = new Error("Tu cuenta ha sido desactivada. Contacta con nuestro equipo de soporte para m\xE1s informaci\xF3n.");
    error.locked = true;
    error.status = 403;
    logActivity("Intento de Login en Cuenta Desactivada", { userId: user.id, email: user.email });
    throw error;
  }
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    const newAttempts = (user.loginAttempts || 0) + 1;
    const updates = { loginAttempts: newAttempts };
    if (newAttempts >= 5) {
      updates.lockUntil = new Date(Date.now() + 60 * 60 * 1e3);
      const msgId = Math.floor(1e7 + Math.random() * 9e7).toString();
      try {
        await sendEmail({
          to: user.email,
          subject: "Seguridad Easy US LLC - Cuenta Bloqueada Temporalmente",
          html: getAccountLockedTemplate(user.firstName || "Cliente", msgId)
        });
        await db.insert(messages).values({
          userId: user.id,
          name: "Claudia (Seguridad)",
          email: "seguridad@easyusllc.com",
          subject: "Cuenta Bloqueada - Verificaci\xF3n Requerida",
          content: `Cuenta desactivada temporalmente por seguridad. Se ha solicitado DNI y fecha de nacimiento. Ticket ID: ${msgId}`,
          status: "unread",
          type: "support",
          messageId: msgId
        });
      } catch (e) {
        console.error("Error handling account lock:", e);
      }
    }
    await db.update(users).set(updates).where(eq(users.id, user.id));
    return null;
  }
  if (user.loginAttempts > 0 || user.lockUntil) {
    await db.update(users).set({
      loginAttempts: 0,
      lockUntil: null,
      accountStatus: user.accountStatus,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, user.id));
  }
  return user;
}
async function createPasswordResetOtp(email) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    return { success: false };
  }
  const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1e3);
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token: otp,
    expiresAt
  });
  try {
    const { getEmailHeader: getEmailHeader2, getEmailFooter: getEmailFooter2, getOtpEmailTemplate: getOtpEmailTemplate2 } = await Promise.resolve().then(() => (init_email(), email_exports));
    await sendEmail({
      to: email,
      subject: "C\xF3digo de verificaci\xF3n - Easy US LLC",
      html: getOtpEmailTemplate2(otp)
    });
  } catch (emailError) {
  }
  return { success: true, userId: user.id };
}
async function verifyPasswordResetOtp(email, otp) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return false;
  const [tokenRecord] = await db.select().from(passwordResetTokens).where(
    and(
      eq(passwordResetTokens.userId, user.id),
      eq(passwordResetTokens.token, otp),
      eq(passwordResetTokens.used, false),
      gt(passwordResetTokens.expiresAt, /* @__PURE__ */ new Date())
    )
  ).orderBy(sql4`${passwordResetTokens.createdAt} DESC`).limit(1);
  return !!tokenRecord;
}
async function resetPasswordWithOtp(email, otp, newPassword) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return false;
  const [tokenRecord] = await db.select().from(passwordResetTokens).where(
    and(
      eq(passwordResetTokens.userId, user.id),
      eq(passwordResetTokens.token, otp),
      eq(passwordResetTokens.used, false),
      gt(passwordResetTokens.expiresAt, /* @__PURE__ */ new Date())
    )
  ).limit(1);
  if (!tokenRecord) {
    return false;
  }
  const passwordHash = await hashPassword(newPassword);
  await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, tokenRecord.id));
  await db.update(users).set({
    passwordHash,
    updatedAt: /* @__PURE__ */ new Date(),
    loginAttempts: 0,
    lockUntil: null,
    accountStatus: "active"
  }).where(eq(users.id, tokenRecord.userId));
  return true;
}
async function resendVerificationEmail(userId) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || !user.email) {
    return false;
  }
  const verificationToken = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1e3);
  await db.insert(emailVerificationTokens).values({
    userId: user.id,
    token: verificationToken,
    expiresAt
  });
  try {
    await sendEmail({
      to: user.email,
      subject: "Easy US LLC - C\xF3digo de verificaci\xF3n",
      html: getOtpEmailTemplate(verificationToken, user.firstName || "Cliente")
    });
  } catch (emailError) {
    return false;
  }
  return true;
}
var SALT_ROUNDS, OTP_EXPIRY_MINUTES;
var init_auth_service = __esm({
  "server/lib/auth-service.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_email();
    SALT_ROUNDS = 12;
    OTP_EXPIRY_MINUTES = 15;
  }
});

// server/utils/encryption.ts
var encryption_exports = {};
__export(encryption_exports, {
  decrypt: () => decrypt,
  encrypt: () => encrypt
});
import crypto2 from "crypto";
function encrypt(text3) {
  const iv = crypto2.randomBytes(IV_LENGTH);
  const cipher = crypto2.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let encrypted = cipher.update(text3);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}
function decrypt(text3) {
  const textParts = text3.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto2.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
var ALGORITHM, ENCRYPTION_KEY, IV_LENGTH;
var init_encryption = __esm({
  "server/utils/encryption.ts"() {
    "use strict";
    ALGORITHM = "aes-256-cbc";
    ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "fallback_key_at_least_32_chars_long!!";
    IV_LENGTH = 16;
  }
});

// server/lib/id-generator.ts
var id_generator_exports = {};
__export(id_generator_exports, {
  formatOrderDisplay: () => formatOrderDisplay,
  generate8DigitId: () => generate8DigitId,
  generateDocumentId: () => generateDocumentId,
  generateOrderCode: () => generateOrderCode,
  generateUniqueClientId: () => generateUniqueClientId2,
  generateUniqueMessageId: () => generateUniqueMessageId,
  generateUniqueOrderCode: () => generateUniqueOrderCode,
  generateUniqueTicketId: () => generateUniqueTicketId,
  getStatePrefix: () => getStatePrefix
});
import { eq as eq6 } from "drizzle-orm";
function generate8DigitId() {
  return Math.floor(1e7 + Math.random() * 9e7).toString();
}
async function generateUniqueClientId2() {
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts < maxAttempts) {
    const clientId = generate8DigitId();
    const existing = await db.select({ id: users.id }).from(users).where(eq6(users.clientId, clientId)).limit(1);
    if (existing.length === 0) {
      return clientId;
    }
    attempts++;
  }
  return Date.now().toString().slice(-8);
}
function generateOrderCode(state) {
  const statePrefix = getStatePrefix(state);
  const digits = generate8DigitId();
  return `${statePrefix}-${digits}`;
}
function getStatePrefix(state) {
  const stateMap = {
    "New Mexico": "NM",
    "new mexico": "NM",
    "nm": "NM",
    "Wyoming": "WY",
    "wyoming": "WY",
    "wy": "WY",
    "Delaware": "DE",
    "delaware": "DE",
    "de": "DE"
  };
  return stateMap[state] || stateMap[state.toLowerCase()] || "US";
}
async function generateUniqueOrderCode(state) {
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts < maxAttempts) {
    const code = generateOrderCode(state);
    const existingLlc = await db.select({ id: llcApplications.id }).from(llcApplications).where(eq6(llcApplications.requestCode, code)).limit(1);
    const existingMaint = await db.select({ id: maintenanceApplications.id }).from(maintenanceApplications).where(eq6(maintenanceApplications.requestCode, code)).limit(1);
    if (existingLlc.length === 0 && existingMaint.length === 0) {
      return code;
    }
    attempts++;
  }
  const timestamp3 = Date.now().toString().slice(-8);
  return `${getStatePrefix(state)}-${timestamp3}`;
}
async function generateUniqueTicketId() {
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts < maxAttempts) {
    const ticketId = generate8DigitId();
    const existingNotif = await db.select({ id: userNotifications.id }).from(userNotifications).where(eq6(userNotifications.ticketId, ticketId)).limit(1);
    if (existingNotif.length === 0) {
      return ticketId;
    }
    attempts++;
  }
  return Date.now().toString().slice(-8);
}
async function generateUniqueMessageId() {
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts < maxAttempts) {
    const messageId = generate8DigitId();
    const existing = await db.select({ id: messages.id }).from(messages).where(eq6(messages.messageId, messageId)).limit(1);
    if (existing.length === 0) {
      return messageId;
    }
    attempts++;
  }
  return Date.now().toString().slice(-8);
}
function generateDocumentId() {
  return generate8DigitId();
}
function formatOrderDisplay(requestCode) {
  if (requestCode) {
    return requestCode;
  }
  return "N/A";
}
var init_id_generator = __esm({
  "server/lib/id-generator.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path4 from "path";
var rootDir, vite_config_default;
var init_vite_config = __esm({
  "vite.config.ts"() {
    "use strict";
    rootDir = process.cwd();
    vite_config_default = defineConfig({
      plugins: [
        react()
      ],
      resolve: {
        alias: {
          "@": path4.resolve(rootDir, "client", "src"),
          "@shared": path4.resolve(rootDir, "shared"),
          "@assets": path4.resolve(rootDir, "client", "src", "assets")
        }
      },
      root: path4.resolve(rootDir, "client"),
      build: {
        outDir: path4.resolve(rootDir, "dist/public"),
        emptyOutDir: true,
        reportCompressedSize: false,
        chunkSizeWarningLimit: 1e3,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes("node_modules")) {
                if (id.includes("react-dom") || id.includes("react/") || id.includes("/react.")) return "react-vendor";
                if (id.includes("framer-motion")) return "framer-motion";
                if (id.includes("@radix-ui")) return "radix-ui";
                if (id.includes("lucide-react")) return "lucide";
                if (id.includes("@tanstack")) return "tanstack";
                if (id.includes("react-hook-form") || id.includes("@hookform")) return "forms";
                if (id.includes("zod") || id.includes("drizzle")) return "validation";
                if (id.includes("i18next")) return "i18n";
                if (id.includes("date-fns")) return "date-utils";
                return "vendor";
              }
              if (id.includes("/components/ui/")) return "ui-components";
            }
          }
        }
      },
      server: {
        fs: {
          strict: true,
          deny: ["**/.*"]
        },
        allowedHosts: true
      }
    });
  }
});

// node_modules/nanoid/url-alphabet/index.js
var urlAlphabet;
var init_url_alphabet = __esm({
  "node_modules/nanoid/url-alphabet/index.js"() {
    urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  }
});

// node_modules/nanoid/index.js
import crypto4 from "crypto";
var POOL_SIZE_MULTIPLIER, pool2, poolOffset, fillPool, nanoid;
var init_nanoid = __esm({
  "node_modules/nanoid/index.js"() {
    init_url_alphabet();
    POOL_SIZE_MULTIPLIER = 128;
    fillPool = (bytes) => {
      if (!pool2 || pool2.length < bytes) {
        pool2 = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
        crypto4.randomFillSync(pool2);
        poolOffset = 0;
      } else if (poolOffset + bytes > pool2.length) {
        crypto4.randomFillSync(pool2);
        poolOffset = 0;
      }
      poolOffset += bytes;
    };
    nanoid = (size = 21) => {
      fillPool(size |= 0);
      let id = "";
      for (let i = poolOffset - size; i < poolOffset; i++) {
        id += urlAlphabet[pool2[i] & 63];
      }
      return id;
    };
  }
});

// server/vite.ts
var vite_exports = {};
__export(vite_exports, {
  setupVite: () => setupVite
});
import { createServer as createViteServer, createLogger } from "vite";
import fs4 from "fs";
import path5 from "path";
async function setupVite(server, app2) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path5.resolve(
        rootDir2,
        "client",
        "index.html"
      );
      let template = await fs4.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
var rootDir2, viteLogger;
var init_vite = __esm({
  "server/vite.ts"() {
    "use strict";
    init_vite_config();
    init_nanoid();
    rootDir2 = process.cwd();
    viteLogger = createLogger();
  }
});

// server/index.ts
import express3 from "express";

// server/lib/custom-auth.ts
init_db();
init_auth();
init_schema();
init_email();
import session from "express-session";
import connectPg from "connect-pg-simple";
import express from "express";
import { eq as eq2 } from "drizzle-orm";

// server/lib/security.ts
init_db();
import { sql as sql3 } from "drizzle-orm";
var RATE_LIMITS = {
  login: { windowMs: 9e5, maxRequests: 5 },
  otp: { windowMs: 3e5, maxRequests: 3 },
  register: { windowMs: 36e5, maxRequests: 3 },
  passwordReset: { windowMs: 6e5, maxRequests: 3 },
  contact: { windowMs: 3e5, maxRequests: 5 },
  general: { windowMs: 6e4, maxRequests: 100 }
};
var rateLimitStore = /* @__PURE__ */ new Map();
Object.keys(RATE_LIMITS).forEach((key) => {
  rateLimitStore.set(key, /* @__PURE__ */ new Map());
});
function checkRateLimit(type, identifier) {
  const config = RATE_LIMITS[type];
  const store = rateLimitStore.get(type);
  const now = Date.now();
  const timestamps = store.get(identifier) || [];
  const validTimestamps = timestamps.filter((t) => now - t < config.windowMs);
  if (validTimestamps.length >= config.maxRequests) {
    const oldestValid = Math.min(...validTimestamps);
    const retryAfter = Math.ceil((config.windowMs - (now - oldestValid)) / 1e3);
    return { allowed: false, retryAfter };
  }
  validTimestamps.push(now);
  store.set(identifier, validTimestamps);
  return { allowed: true };
}
function cleanupRateLimits() {
  const now = Date.now();
  const storeEntries = Array.from(rateLimitStore.entries());
  for (let i = 0; i < storeEntries.length; i++) {
    const [type, store] = storeEntries[i];
    const config = RATE_LIMITS[type];
    const ipEntries = Array.from(store.entries());
    for (let j = 0; j < ipEntries.length; j++) {
      const [ip, timestamps] = ipEntries[j];
      const valid = timestamps.filter((t) => now - t < config.windowMs);
      if (valid.length === 0) {
        store.delete(ip);
      } else {
        store.set(ip, valid);
      }
    }
  }
}
setInterval(cleanupRateLimits, 3e5);
function sanitizeHtml(input) {
  if (!input || typeof input !== "string") return "";
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;").replace(/`/g, "&#96;").trim();
}
var auditLogs = [];
var MAX_AUDIT_LOGS = 1e4;
function logAudit(entry) {
  const logEntry = {
    ...entry,
    timestamp: /* @__PURE__ */ new Date()
  };
  auditLogs.push(logEntry);
  if (auditLogs.length > MAX_AUDIT_LOGS) {
    auditLogs.shift();
  }
  if (process.env.NODE_ENV === "development") {
    console.log(`[AUDIT] ${entry.action}:`, {
      userId: entry.userId,
      targetId: entry.targetId,
      details: entry.details
    });
  }
}
function getRecentAuditLogs(limit = 100) {
  return auditLogs.slice(-limit).reverse();
}
async function checkDatabaseHealth() {
  const start = Date.now();
  try {
    await db.execute(sql3`SELECT 1`);
    return { healthy: true, latencyMs: Date.now() - start };
  } catch (error) {
    return {
      healthy: false,
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function getSystemHealth() {
  const dbHealth = await checkDatabaseHealth();
  const memUsage = process.memoryUsage();
  const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const percentUsed = Math.round(memUsage.heapUsed / memUsage.heapTotal * 100);
  let status = "healthy";
  if (!dbHealth.healthy) {
    status = "unhealthy";
  } else if (dbHealth.latencyMs > 1e3 || percentUsed > 90) {
    status = "degraded";
  }
  return {
    status,
    database: { healthy: dbHealth.healthy, latencyMs: dbHealth.latencyMs },
    memory: { usedMB, totalMB, percentUsed },
    uptime: process.uptime()
  };
}
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
    return ip.trim();
  }
  return req.ip || "unknown";
}

// server/lib/custom-auth.ts
init_auth_service();
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  const isProduction = process.env.NODE_ENV === "production" || process.env.REPLIT_ENVIRONMENT === "production";
  return session({
    secret: process.env.SESSION_SECRET || "easy-us-llc-secret-key-2024",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      maxAge: sessionTtl,
      sameSite: isProduction ? "none" : "lax"
    }
  });
}
function setupCustomAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(express.json());
  app2.use(express.urlencoded({ extended: true }));
  app2.use(getSession());
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone, birthDate, businessActivity } = req.body;
      if (!email || !password || !firstName || !lastName || !phone) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "La contrase\xF1a debe tener al menos 8 caracteres" });
      }
      const clientId = Math.floor(1e7 + Math.random() * 9e7).toString();
      const { user } = await createUser({
        email,
        password,
        firstName,
        lastName,
        phone,
        birthDate,
        businessActivity,
        clientId
      });
      await db.insert(userNotifications).values({
        userId: user.id,
        title: "\xA1Bienvenido a Easy US LLC!",
        message: "Gracias por confiar en nosotros para crear tu empresa en EE.UU. Explora tu panel para comenzar.",
        type: "info",
        isRead: false
      });
      sendEmail({
        to: user.email,
        subject: "\xA1Bienvenido a Easy US LLC!",
        html: getWelcomeEmailTemplate(user.firstName || "Cliente")
      }).catch(() => {
      });
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.isAdmin = user.isAdmin;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Error al guardar la sesi\xF3n" });
        }
        res.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            emailVerified: user.emailVerified
          },
          message: "Cuenta creada. Revisa tu email para verificar tu cuenta."
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Error al crear la cuenta" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = checkRateLimit("login", ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({
          message: `Demasiados intentos. Espera ${rateCheck.retryAfter} segundos.`
        });
      }
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email y contrase\xF1a son obligatorios" });
      }
      const user = await loginUser(email, password);
      if (!user) {
        logAudit({ action: "user_login", ip, details: { email, success: false } });
        return res.status(401).json({ message: "Email o contrase\xF1a incorrectos" });
      }
      if (user.accountStatus === "deactivated") {
        return res.status(403).json({ message: "Tu cuenta ha sido desactivada. Contacta a nuestro servicio de atenci\xF3n al cliente para m\xE1s informaci\xF3n." });
      }
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.isAdmin = user.isAdmin;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Error al guardar la sesi\xF3n" });
        }
        logAudit({ action: "user_login", userId: user.id, ip, details: { email, success: true } });
        res.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            emailVerified: user.emailVerified,
            isAdmin: user.isAdmin
          }
        });
      });
    } catch (error) {
      if (error.locked) {
        logAudit({ action: "account_locked", ip: getClientIp(req), details: { reason: "too_many_attempts" } });
        return res.status(403).json({ message: error.message });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Error al iniciar sesi\xF3n" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Error al cerrar sesi\xF3n" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });
  app2.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });
  app2.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { code } = req.body;
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "No autenticado" });
      }
      const success = await verifyEmailToken(userId, code);
      if (!success) {
        return res.status(400).json({ message: "C\xF3digo inv\xE1lido o expirado" });
      }
      res.json({ success: true, message: "Email verificado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al verificar el email" });
    }
  });
  app2.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "No autenticado" });
      }
      const success = await resendVerificationEmail(userId);
      if (!success) {
        return res.status(400).json({ message: "Error al enviar el c\xF3digo" });
      }
      res.json({ success: true, message: "C\xF3digo enviado" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Error al enviar el c\xF3digo" });
    }
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email es obligatorio" });
      }
      await createPasswordResetOtp(email);
      res.json({
        success: true,
        message: "Si el email existe en nuestro sistema, recibir\xE1s un c\xF3digo de verificaci\xF3n"
      });
    } catch (error) {
      res.status(500).json({ message: "Error al procesar la solicitud" });
    }
  });
  app2.post("/api/auth/verify-reset-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ message: "Email y c\xF3digo son obligatorios" });
      }
      const isValid = await verifyPasswordResetOtp(email, otp);
      if (!isValid) {
        return res.status(400).json({ message: "C\xF3digo inv\xE1lido o expirado" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error al verificar el c\xF3digo" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, otp, password } = req.body;
      if (!email || !otp || !password) {
        return res.status(400).json({ message: "Email, c\xF3digo y contrase\xF1a son obligatorios" });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "La contrase\xF1a debe tener al menos 8 caracteres" });
      }
      const success = await resetPasswordWithOtp(email, otp, password);
      if (!success) {
        return res.status(400).json({ message: "C\xF3digo inv\xE1lido o expirado" });
      }
      res.json({ success: true, message: "Contrase\xF1a actualizada correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar la contrase\xF1a" });
    }
  });
  app2.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "No autenticado" });
      }
      const [user] = await db.select().from(users).where(eq2(users.id, userId)).limit(1);
      if (!user) {
        req.session.destroy(() => {
        });
        return res.status(401).json({ message: "Usuario no encontrado" });
      }
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        streetType: user.streetType,
        city: user.city,
        province: user.province,
        postalCode: user.postalCode,
        country: user.country,
        businessActivity: user.businessActivity,
        idNumber: user.idNumber,
        idType: user.idType,
        birthDate: user.birthDate,
        emailVerified: user.emailVerified,
        isAdmin: user.isAdmin,
        accountStatus: user.accountStatus,
        profileImageUrl: user.profileImageUrl,
        googleId: user.googleId ? true : false,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Error al obtener el usuario" });
    }
  });
  app2.patch("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "No autenticado" });
      }
      const { firstName, lastName, phone, address, businessActivity } = req.body;
      await db.update(users).set({
        firstName,
        lastName,
        phone,
        address,
        businessActivity,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(users.id, userId));
      const [updatedUser] = await db.select().from(users).where(eq2(users.id, userId)).limit(1);
      res.json({
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone,
          address: updatedUser.address,
          businessActivity: updatedUser.businessActivity,
          emailVerified: updatedUser.emailVerified
        }
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Error al actualizar el perfil" });
    }
  });
}
var isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "No autenticado" });
  }
  next();
};
var isAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "No autenticado" });
  }
  const [user] = await db.select().from(users).where(eq2(users.id, req.session.userId)).limit(1);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "No autorizado" });
  }
  next();
};

// server/storage.ts
init_db();
init_schema();
import { eq as eq3, desc } from "drizzle-orm";
var DatabaseStorage = class {
  // Products
  async getProducts() {
    return await db.select().from(products).orderBy(products.price);
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where(eq3(products.id, id));
    return product;
  }
  async createProduct(product) {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  // Orders
  async createOrder(order) {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }
  async getOrders(userId) {
    if (userId) {
      return await db.query.orders.findMany({
        where: eq3(orders.userId, userId),
        with: {
          product: true,
          application: true,
          maintenanceApplication: true
        },
        orderBy: desc(orders.createdAt)
      });
    }
    return await db.query.orders.findMany({
      with: {
        product: true,
        application: true,
        maintenanceApplication: true,
        user: true
      },
      orderBy: desc(orders.createdAt)
    });
  }
  async getOrder(id) {
    const result = await db.query.orders.findFirst({
      where: eq3(orders.id, id),
      with: {
        product: true,
        application: true,
        maintenanceApplication: true,
        user: true
      }
    });
    return result;
  }
  // LLC Applications
  async createLlcApplication(app2) {
    const [newApp] = await db.insert(llcApplications).values(app2).returning();
    return newApp;
  }
  async getLlcApplication(id) {
    const [app2] = await db.select().from(llcApplications).where(eq3(llcApplications.id, id));
    return app2;
  }
  async getLlcApplicationByOrderId(orderId) {
    const [app2] = await db.select().from(llcApplications).where(eq3(llcApplications.orderId, orderId));
    return app2;
  }
  async getLlcApplicationByRequestCode(code) {
    const result = await db.query.llcApplications.findFirst({
      where: eq3(llcApplications.requestCode, code),
      with: {
        documents: true
      }
    });
    return result;
  }
  async updateLlcApplication(id, updates) {
    const [updated] = await db.update(llcApplications).set({ ...updates, lastUpdated: /* @__PURE__ */ new Date() }).where(eq3(llcApplications.id, id)).returning();
    return updated;
  }
  // Documents
  async createDocument(doc) {
    const [newDoc] = await db.insert(applicationDocuments).values(doc).returning();
    return newDoc;
  }
  async getDocumentsByApplicationId(applicationId) {
    return await db.select().from(applicationDocuments).where(eq3(applicationDocuments.applicationId, applicationId));
  }
  async getDocumentsByOrderIds(orderIds) {
    const { inArray } = await import("drizzle-orm");
    if (orderIds.length === 0) return [];
    return await db.select().from(applicationDocuments).where(inArray(applicationDocuments.orderId, orderIds));
  }
  async deleteDocument(id) {
    await db.delete(applicationDocuments).where(eq3(applicationDocuments.id, id));
  }
  // Newsletter
  async subscribeToNewsletter(email) {
    const subscribed = await this.isSubscribedToNewsletter(email);
    if (!subscribed) {
      await db.insert(newsletterSubscribers).values({ email });
    }
  }
  async isSubscribedToNewsletter(email) {
    const [subscriber] = await db.select().from(newsletterSubscribers).where(eq3(newsletterSubscribers.email, email));
    return !!subscriber;
  }
  // Admin methods
  async getAllOrders() {
    return await db.query.orders.findMany({
      with: {
        product: true,
        application: true,
        maintenanceApplication: true,
        user: true
      },
      orderBy: desc(orders.createdAt)
    });
  }
  async updateOrderStatus(orderId, status) {
    const [updated] = await db.update(orders).set({ status }).where(eq3(orders.id, orderId)).returning();
    return updated;
  }
  // Messages
  async createMessage(message) {
    const { encrypt: encrypt2 } = await Promise.resolve().then(() => (init_encryption(), encryption_exports));
    const msgId = Math.floor(1e7 + Math.random() * 9e7).toString();
    const encryptedContent = encrypt2(message.content);
    const [newMessage] = await db.insert(messages).values({
      ...message,
      messageId: msgId,
      encryptedContent
    }).returning();
    return newMessage;
  }
  async getMessagesByUserId(userId) {
    return await db.select().from(messages).where(eq3(messages.userId, userId)).orderBy(desc(messages.createdAt));
  }
  async getAllMessages() {
    return await db.query.messages.findMany({
      orderBy: desc(messages.createdAt),
      with: {
        replies: true
      }
    });
  }
  async updateMessageStatus(id, status) {
    const [updated] = await db.update(messages).set({ status }).where(eq3(messages.id, id)).returning();
    return updated;
  }
};
var storage = new DatabaseStorage();

// shared/routes.ts
init_schema();
import { z } from "zod";
var errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional()
  }),
  notFound: z.object({
    message: z.string()
  }),
  internal: z.object({
    message: z.string()
  }),
  unauthorized: z.object({
    message: z.string()
  })
};
var api = {
  products: {
    list: {
      method: "GET",
      path: "/api/products",
      responses: {
        200: z.array(z.custom())
      }
    },
    get: {
      method: "GET",
      path: "/api/products/:id",
      responses: {
        200: z.custom(),
        404: errorSchemas.notFound
      }
    }
  },
  orders: {
    list: {
      method: "GET",
      path: "/api/orders",
      responses: {
        200: z.array(z.custom()),
        401: errorSchemas.unauthorized
      }
    },
    create: {
      method: "POST",
      path: "/api/orders",
      input: z.object({
        productId: z.number()
      }),
      responses: {
        201: z.custom(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    }
  },
  llc: {
    get: {
      method: "GET",
      path: "/api/llc/:id",
      responses: {
        200: z.custom(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    },
    update: {
      method: "PUT",
      path: "/api/llc/:id",
      input: insertLlcApplicationSchema.partial(),
      responses: {
        200: z.custom(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound
      }
    },
    getByCode: {
      method: "GET",
      path: "/api/llc/code/:code",
      responses: {
        200: z.custom(),
        404: errorSchemas.notFound
      }
    }
  },
  documents: {
    create: {
      method: "POST",
      path: "/api/documents",
      input: insertApplicationDocumentSchema,
      responses: {
        201: z.custom(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound
      }
    },
    delete: {
      method: "DELETE",
      path: "/api/documents/:id",
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound
      }
    }
  }
};

// server/routes.ts
init_db();
init_email();
init_schema();
import { z as z2 } from "zod";
import { and as and3, eq as eq7, gt as gt2, desc as desc2, sql as sql7 } from "drizzle-orm";

// server/lib/pdf-generator.ts
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var BRAND_GREEN = "#6EDC8A";
var BRAND_DARK = "#0E1215";
var BRAND_GRAY = "#6B7280";
var BRAND_LIGHT_GREEN = "#ECFDF5";
var BRAND_LIGHT_GRAY = "#F9FAFB";
var BANK_INFO = {
  name: "Column Bank NA",
  holder: "Fortuny Consulting LLC",
  routing: "121145433",
  account: "141432778929495",
  swift: "CLNOUS66MER",
  address: "1209 Mountain Road Place NE, STE R, Albuquerque, NM 87110"
};
var cachedLogoPath = null;
var logoChecked = false;
function getLogoPath() {
  if (logoChecked) return cachedLogoPath;
  const possiblePaths = [
    path.join(process.cwd(), "client/public/logo-icon.png"),
    path.join(process.cwd(), "dist/public/logo-icon.png"),
    path.join(__dirname, "../../client/public/logo-icon.png")
  ];
  for (const logoPath of possiblePaths) {
    if (fs.existsSync(logoPath)) {
      cachedLogoPath = logoPath;
      logoChecked = true;
      return logoPath;
    }
  }
  logoChecked = true;
  return null;
}
function formatCurrency(cents, currency) {
  const amount = (cents / 100).toFixed(2).replace(".", ",");
  return currency === "EUR" ? `${amount} \u20AC` : `$${amount}`;
}
function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return dateStr;
  }
}
function getStatusText(status) {
  const map = {
    "pending": "PENDIENTE",
    "paid": "PAGADO",
    "completed": "COMPLETADO",
    "cancelled": "CANCELADO",
    "refunded": "REEMBOLSADO"
  };
  return map[status] || status.toUpperCase();
}
function getPaymentMethodText(method) {
  if (!method) return "No especificado";
  const map = {
    "transfer": "Transferencia bancaria",
    "card": "Tarjeta",
    "stripe": "Stripe",
    "paypal": "PayPal",
    "link": "Enlace de pago",
    "other": "Otro"
  };
  return map[method] || method;
}
function generateInvoicePdf(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        bufferPages: false,
        info: { Title: `Factura ${data.orderNumber}`, Author: "Easy US LLC" }
      });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      doc.rect(0, 0, 595, 70).fill(BRAND_DARK);
      const logoPath = getLogoPath();
      if (logoPath) {
        try {
          doc.image(logoPath, 40, 10, { width: 45, height: 45 });
        } catch {
        }
      }
      doc.font("Helvetica-Bold").fontSize(18).fillColor("#FFFFFF").text("Easy US LLC", 95, 18);
      doc.font("Helvetica").fontSize(8).fillColor("#9CA3AF").text("Formacion de LLC en USA", 95, 38);
      doc.text("easyusllc.com | hola@easyusllc.com", 95, 50);
      doc.rect(420, 12, 135, 45).fill(BRAND_GREEN);
      doc.font("Helvetica").fontSize(8).fillColor(BRAND_DARK).text("FACTURA", 440, 18);
      doc.font("Helvetica-Bold").fontSize(12).text(data.orderNumber, 430, 32, { width: 115, align: "center" });
      let y = 85;
      doc.font("Helvetica").fontSize(9).fillColor(BRAND_GRAY);
      doc.text(`Fecha: ${formatDate(data.date)}`, 40, y);
      if (data.status === "paid" && data.paymentDate) {
        doc.text(`Pagado: ${formatDate(data.paymentDate)}`, 180, y);
      }
      y += 20;
      doc.rect(40, y, 250, 85).fillAndStroke(BRAND_LIGHT_GRAY, "#E5E7EB");
      doc.font("Helvetica-Bold").fontSize(8).fillColor(BRAND_DARK).text("CLIENTE", 50, y + 8);
      doc.font("Helvetica-Bold").fontSize(10).text(data.customer.name, 50, y + 22);
      let cy = y + 36;
      if (data.customer.idType && data.customer.idNumber) {
        doc.font("Helvetica").fontSize(8).fillColor(BRAND_GRAY).text(`${data.customer.idType}: ${data.customer.idNumber}`, 50, cy);
        cy += 11;
      }
      doc.font("Helvetica").fontSize(8).fillColor(BRAND_GRAY).text(data.customer.email, 50, cy);
      cy += 11;
      if (data.customer.phone) {
        doc.text(data.customer.phone, 50, cy);
        cy += 11;
      }
      if (data.customer.address) {
        const addr = [data.customer.streetType, data.customer.address, data.customer.postalCode, data.customer.city, data.customer.country].filter(Boolean).join(", ");
        doc.fontSize(7).text(addr, 50, cy, { width: 230 });
      }
      doc.rect(305, y, 250, 85).fillAndStroke(BRAND_LIGHT_GRAY, "#E5E7EB");
      doc.font("Helvetica-Bold").fontSize(8).fillColor(BRAND_DARK).text("EMISOR", 315, y + 8);
      doc.font("Helvetica-Bold").fontSize(9).text("Fortuny Consulting LLC", 315, y + 22);
      doc.font("Helvetica").fontSize(8).fillColor(BRAND_GRAY);
      doc.text("(operando como Easy US LLC)", 315, y + 34);
      doc.text("1209 Mountain Road Place NE, STE R", 315, y + 46);
      doc.text("Albuquerque, NM 87110, USA", 315, y + 58);
      doc.text("hola@easyusllc.com", 315, y + 70);
      y += 95;
      y += 10;
      doc.rect(40, y, 515, 22).fill("#1F2937");
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#FFFFFF");
      doc.text("CONCEPTO", 50, y + 7);
      doc.text("CANT", 360, y + 7);
      doc.text("PRECIO", 410, y + 7);
      doc.text("TOTAL", 480, y + 7);
      y += 22;
      for (const item of data.items) {
        doc.rect(40, y, 515, 28).fillAndStroke("#FFFFFF", "#E5E7EB");
        doc.font("Helvetica-Bold").fontSize(9).fillColor(BRAND_DARK).text(item.description, 50, y + 5, { width: 290 });
        if (item.details) {
          doc.font("Helvetica").fontSize(7).fillColor(BRAND_GRAY).text(item.details, 50, y + 16, { width: 290 });
        }
        doc.font("Helvetica").fontSize(9).fillColor(BRAND_DARK);
        doc.text(item.quantity.toString(), 368, y + 10);
        doc.text(formatCurrency(item.unitPrice, data.currency), 400, y + 10);
        doc.font("Helvetica-Bold").text(formatCurrency(item.total, data.currency), 470, y + 10);
        y += 28;
      }
      if (data.discount && data.discount.amount > 0) {
        doc.rect(40, y, 515, 22).fillAndStroke(BRAND_LIGHT_GREEN, "#10B981");
        doc.font("Helvetica-Bold").fontSize(8).fillColor("#059669");
        let discText = "Descuento";
        if (data.discount.code) discText += `: ${data.discount.code}`;
        if (data.discount.type === "percentage" && data.discount.value) discText += ` (${data.discount.value}%)`;
        doc.text(discText, 50, y + 7);
        doc.text(`-${formatCurrency(data.discount.amount, data.currency)}`, 470, y + 7);
        y += 27;
      }
      y += 5;
      const totalsX = 350;
      doc.rect(totalsX, y, 205, 50).fill(BRAND_LIGHT_GRAY);
      doc.font("Helvetica").fontSize(9).fillColor(BRAND_GRAY);
      doc.text("Subtotal:", totalsX + 10, y + 8);
      doc.text(formatCurrency(data.subtotal, data.currency), totalsX + 130, y + 8);
      if (data.discount && data.discount.amount > 0) {
        doc.fillColor("#059669").text("Descuento:", totalsX + 10, y + 22);
        doc.text(`-${formatCurrency(data.discount.amount, data.currency)}`, totalsX + 130, y + 22);
      }
      doc.rect(totalsX, y + 35, 205, 28).fill(BRAND_GREEN);
      doc.font("Helvetica-Bold").fontSize(10).fillColor(BRAND_DARK).text("TOTAL:", totalsX + 10, y + 43);
      doc.fontSize(14).text(formatCurrency(data.total, data.currency), totalsX + 100, y + 41);
      const statusColors = { pending: "#F59E0B", paid: "#10B981", cancelled: "#EF4444", refunded: "#8B5CF6" };
      const sColor = statusColors[data.status] || "#10B981";
      doc.rect(40, y + 8, 85, 25).fillAndStroke(data.status === "paid" ? BRAND_LIGHT_GREEN : "#FEF3C7", sColor);
      doc.font("Helvetica-Bold").fontSize(10).fillColor(sColor).text(getStatusText(data.status), 45, y + 15, { width: 75, align: "center" });
      y += 75;
      doc.rect(40, y, 250, 85).fillAndStroke("#FFFFFF", "#E5E7EB");
      doc.font("Helvetica-Bold").fontSize(8).fillColor(BRAND_DARK).text("DATOS DE PAGO", 50, y + 8);
      doc.font("Helvetica").fontSize(8).fillColor(BRAND_GRAY);
      doc.text(`Metodo: ${getPaymentMethodText(data.paymentMethod)}`, 50, y + 22);
      doc.text(`Banco: ${BANK_INFO.name}`, 50, y + 34);
      doc.text(`Titular: ${BANK_INFO.holder}`, 50, y + 46);
      doc.text(`Cuenta: ${BANK_INFO.account}`, 50, y + 58);
      doc.text(`Routing: ${BANK_INFO.routing} | SWIFT: ${BANK_INFO.swift}`, 50, y + 70);
      if (data.status === "pending" && data.paymentLink) {
        doc.rect(305, y, 250, 85).fillAndStroke("#FEF3C7", "#F59E0B");
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#92400E").text("ENLACE DE PAGO", 315, y + 10);
        doc.font("Helvetica").fontSize(8).fillColor("#78350F").text(data.paymentLink, 315, y + 26, { width: 230, link: data.paymentLink });
        doc.fontSize(7).text("Haz clic o copia el enlace para pagar.", 315, y + 50);
        doc.text("Valido por 7 dias desde la emision.", 315, y + 62);
      } else if (data.notes) {
        doc.rect(305, y, 250, 85).fillAndStroke("#FFFFFF", "#E5E7EB");
        doc.font("Helvetica-Bold").fontSize(8).fillColor(BRAND_DARK).text("NOTAS", 315, y + 8);
        doc.font("Helvetica").fontSize(8).fillColor(BRAND_GRAY).text(data.notes, 315, y + 22, { width: 230 });
      }
      doc.moveTo(40, 780).lineTo(555, 780).strokeColor("#E5E7EB").lineWidth(0.5).stroke();
      doc.font("Helvetica").fontSize(7).fillColor(BRAND_GRAY);
      doc.text("Documento oficial emitido por Fortuny Consulting LLC (Easy US LLC). Valido sin firma.", 40, 788, { align: "center", width: 515 });
      doc.text("hola@easyusllc.com | +34 614 91 69 10 | easyusllc.com", 40, 798, { align: "center", width: 515 });
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
function generateReceiptPdf(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        bufferPages: false,
        info: { Title: `Recibo ${data.requestCode}`, Author: "Easy US LLC" }
      });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      doc.rect(0, 0, 595, 70).fill(BRAND_DARK);
      const logoPath = getLogoPath();
      if (logoPath) {
        try {
          doc.image(logoPath, 40, 10, { width: 45, height: 45 });
        } catch {
        }
      }
      doc.font("Helvetica-Bold").fontSize(18).fillColor("#FFFFFF").text("Easy US LLC", 95, 18);
      doc.font("Helvetica").fontSize(8).fillColor("#9CA3AF").text("Formacion de LLC en USA", 95, 38);
      doc.text("easyusllc.com | hola@easyusllc.com", 95, 50);
      doc.rect(400, 12, 155, 45).fill(BRAND_GREEN);
      doc.font("Helvetica").fontSize(8).fillColor(BRAND_DARK).text(data.isMaintenance ? "MANTENIMIENTO" : "RECIBO", 430, 18);
      doc.font("Helvetica-Bold").fontSize(11).text(data.requestCode, 410, 34, { width: 135, align: "center" });
      let y = 85;
      doc.font("Helvetica").fontSize(9).fillColor(BRAND_GRAY);
      doc.text(`Fecha: ${formatDate(data.date)}`, 40, y);
      doc.text(`Pedido: ${data.orderNumber}`, 200, y);
      if (data.paymentDate) doc.text(`Pagado: ${formatDate(data.paymentDate)}`, 380, y);
      y += 25;
      doc.rect(40, y, 250, 90).fillAndStroke(BRAND_LIGHT_GRAY, "#E5E7EB");
      doc.font("Helvetica-Bold").fontSize(8).fillColor(BRAND_DARK).text("CLIENTE", 50, y + 8);
      doc.font("Helvetica-Bold").fontSize(10).text(data.customer.name, 50, y + 22);
      let cy = y + 36;
      if (data.customer.idType && data.customer.idNumber) {
        doc.font("Helvetica").fontSize(8).fillColor(BRAND_GRAY).text(`${data.customer.idType}: ${data.customer.idNumber}`, 50, cy);
        cy += 11;
      }
      doc.font("Helvetica").fontSize(8).fillColor(BRAND_GRAY).text(data.customer.email, 50, cy);
      cy += 11;
      if (data.customer.phone) doc.text(data.customer.phone, 50, cy);
      if (data.customer.address) {
        const addr = [data.customer.streetType, data.customer.address, data.customer.postalCode, data.customer.city].filter(Boolean).join(", ");
        doc.fontSize(7).text(addr, 50, y + 75, { width: 230 });
      }
      if (data.llcDetails && (data.llcDetails.companyName || data.llcDetails.state)) {
        doc.rect(305, y, 250, 90).fillAndStroke(BRAND_LIGHT_GREEN, "#86EFAC");
        doc.font("Helvetica-Bold").fontSize(8).fillColor(BRAND_DARK).text("DATOS DE LA LLC", 315, y + 8);
        let ly = y + 22;
        if (data.llcDetails.companyName) {
          doc.font("Helvetica-Bold").fontSize(10).text(`${data.llcDetails.companyName} ${data.llcDetails.designator || "LLC"}`, 315, ly);
          ly += 14;
        }
        doc.font("Helvetica").fontSize(8).fillColor(BRAND_GRAY);
        if (data.llcDetails.state) {
          doc.text(`Estado: ${data.llcDetails.state}`, 315, ly);
          ly += 11;
        }
        if (data.llcDetails.ein) {
          doc.text(`EIN: ${data.llcDetails.ein}`, 315, ly);
          ly += 11;
        }
        if (data.llcDetails.creationDate) {
          doc.text(`Constituida: ${formatDate(data.llcDetails.creationDate)}`, 315, ly);
          ly += 11;
        }
        if (data.llcDetails.registeredAgent) {
          doc.text(`Agente: ${data.llcDetails.registeredAgent}`, 315, ly);
        }
      }
      y += 100;
      doc.rect(40, y, 350, 75).fillAndStroke("#FFFFFF", "#E5E7EB");
      doc.font("Helvetica-Bold").fontSize(8).fillColor(BRAND_DARK).text("SERVICIO CONTRATADO", 50, y + 8);
      doc.font("Helvetica-Bold").fontSize(12).text(data.service.name, 50, y + 24);
      if (data.service.description) {
        doc.font("Helvetica").fontSize(8).fillColor(BRAND_GRAY).text(data.service.description, 50, y + 42, { width: 330 });
      }
      if (data.service.state) {
        doc.font("Helvetica").fontSize(8).fillColor(BRAND_GRAY).text(`Estado: ${data.service.state}`, 50, y + 60);
      }
      doc.rect(405, y, 150, 75).fill(BRAND_GREEN);
      doc.font("Helvetica").fontSize(9).fillColor(BRAND_DARK).text("TOTAL PAGADO", 420, y + 15);
      doc.font("Helvetica-Bold").fontSize(22).text(formatCurrency(data.amount, data.currency), 415, y + 35, { width: 130, align: "center" });
      y += 85;
      doc.rect(40, y, 250, 70).fillAndStroke("#FFFFFF", "#E5E7EB");
      doc.font("Helvetica-Bold").fontSize(8).fillColor(BRAND_DARK).text("DETALLES DEL PAGO", 50, y + 8);
      doc.font("Helvetica").fontSize(8).fillColor(BRAND_GRAY);
      doc.text(`Metodo: ${getPaymentMethodText(data.paymentMethod)}`, 50, y + 22);
      if (data.transactionId) doc.text(`ID: ${data.transactionId}`, 50, y + 34);
      doc.text(`Banco: ${BANK_INFO.name}`, 50, y + 46);
      doc.text(`Cuenta: ${BANK_INFO.account}`, 50, y + 58);
      doc.rect(305, y, 250, 70).fill(BRAND_LIGHT_GREEN);
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#059669").text("\xA1Gracias por confiar en Easy US LLC!", 315, y + 18, { width: 230, align: "center" });
      doc.font("Helvetica").fontSize(8).fillColor(BRAND_GRAY).text("Estamos procesando tu solicitud. Te mantendremos informado de cada avance.", 315, y + 38, { width: 230, align: "center" });
      y += 80;
      if (data.notes) {
        doc.font("Helvetica-Bold").fontSize(8).fillColor(BRAND_GRAY).text("Notas:", 40, y);
        doc.font("Helvetica").fontSize(8).text(data.notes, 40, y + 12, { width: 515 });
      }
      doc.moveTo(40, 780).lineTo(555, 780).strokeColor("#E5E7EB").lineWidth(0.5).stroke();
      doc.font("Helvetica").fontSize(7).fillColor(BRAND_GRAY);
      doc.text("Documento oficial emitido por Fortuny Consulting LLC (Easy US LLC).", 40, 788, { align: "center", width: 515 });
      doc.text("hola@easyusllc.com | +34 614 91 69 10 | easyusllc.com", 40, 798, { align: "center", width: 515 });
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
function generateOrderInvoice(orderData) {
  const app2 = orderData.application || orderData.maintenanceApplication;
  const llcApp = orderData.application;
  const customerName = app2?.ownerFullName || [orderData.user.firstName, orderData.user.lastName].filter(Boolean).join(" ") || orderData.user.email.split("@")[0];
  const invoiceData = {
    orderNumber: orderData.order.invoiceNumber || `ORD-${orderData.order.id.toString().padStart(8, "0")}`,
    date: orderData.order.createdAt?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
    customer: {
      name: customerName,
      email: app2?.ownerEmail || orderData.user.email,
      phone: app2?.ownerPhone || void 0,
      idType: llcApp?.ownerIdType || void 0,
      idNumber: llcApp?.ownerIdNumber || void 0,
      streetType: llcApp?.ownerStreetType || void 0,
      address: llcApp?.ownerAddress || void 0,
      city: llcApp?.ownerCity || void 0,
      province: llcApp?.ownerProvince || void 0,
      postalCode: llcApp?.ownerPostalCode || void 0,
      country: llcApp?.ownerCountry || void 0,
      clientId: orderData.user.email.split("@")[0].substring(0, 8).toUpperCase()
    },
    items: [{
      description: orderData.product.name,
      details: orderData.product.features?.slice(0, 3).join(" \u2022 ") || orderData.product.description.substring(0, 80),
      quantity: 1,
      unitPrice: orderData.order.originalAmount || orderData.order.amount,
      total: orderData.order.originalAmount || orderData.order.amount
    }],
    subtotal: orderData.order.originalAmount || orderData.order.amount,
    discount: orderData.order.discountAmount && orderData.order.discountAmount > 0 ? { code: orderData.order.discountCode || void 0, amount: orderData.order.discountAmount } : void 0,
    total: orderData.order.amount,
    currency: orderData.order.currency,
    status: orderData.order.status === "paid" || orderData.order.status === "completed" ? "paid" : "pending",
    paymentMethod: app2?.paymentMethod || void 0,
    paymentLink: orderData.paymentLink || void 0,
    notes: orderData.notes || void 0,
    isMaintenance: !!orderData.maintenanceApplication
  };
  return generateInvoicePdf(invoiceData);
}
function generateOrderReceipt(orderData) {
  const app2 = orderData.application;
  const maintApp = orderData.maintenanceApplication;
  const isMaintenance = !!maintApp;
  const currentApp = app2 || maintApp;
  const customerName = currentApp?.ownerFullName || [orderData.user.firstName, orderData.user.lastName].filter(Boolean).join(" ") || orderData.user.email.split("@")[0];
  const receiptData = {
    orderNumber: orderData.order.invoiceNumber || `ORD-${orderData.order.id.toString().padStart(8, "0")}`,
    requestCode: currentApp?.requestCode || `REQ-${orderData.order.id.toString().padStart(8, "0")}`,
    date: orderData.order.createdAt?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
    customer: {
      name: customerName,
      email: currentApp?.ownerEmail || orderData.user.email,
      phone: currentApp?.ownerPhone || void 0,
      idType: app2?.ownerIdType || void 0,
      idNumber: app2?.ownerIdNumber || void 0,
      streetType: app2?.ownerStreetType || void 0,
      address: app2?.ownerAddress || void 0,
      city: app2?.ownerCity || void 0,
      province: app2?.ownerProvince || void 0,
      postalCode: app2?.ownerPostalCode || void 0,
      country: app2?.ownerCountry || void 0
    },
    service: { name: orderData.product.name, description: orderData.product.features?.join(" \u2022 ") || orderData.product.description, state: app2?.state || maintApp?.state || void 0 },
    llcDetails: isMaintenance ? { companyName: maintApp?.companyName || void 0, state: maintApp?.state || void 0, ein: maintApp?.ein || void 0, creationDate: maintApp?.creationYear || void 0 } : app2 ? { companyName: app2.companyName || void 0, designator: app2.designator || void 0, state: app2.state || void 0, creationDate: app2.llcCreatedDate?.toISOString() || void 0, registeredAgent: "Easy US LLC" } : void 0,
    amount: orderData.order.amount,
    currency: orderData.order.currency,
    paymentMethod: currentApp?.paymentMethod || void 0,
    paymentDate: orderData.order.createdAt?.toISOString(),
    isMaintenance
  };
  return generateReceiptPdf(receiptData);
}

// server/oauth.ts
init_db();
init_schema();
import { OAuth2Client } from "google-auth-library";
import { eq as eq4 } from "drizzle-orm";
import crypto3 from "crypto";
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
var googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;
function generateClientId2() {
  return Math.floor(1e7 + Math.random() * 9e7).toString();
}
async function findOrCreateUserByGoogle(profile) {
  const existingByGoogle = await db.select().from(users).where(eq4(users.googleId, profile.googleId)).limit(1);
  if (existingByGoogle.length > 0) {
    return existingByGoogle[0];
  }
  const existingByEmail = await db.select().from(users).where(eq4(users.email, profile.email)).limit(1);
  if (existingByEmail.length > 0) {
    await db.update(users).set({
      googleId: profile.googleId,
      emailVerified: true,
      profileImageUrl: profile.profileImageUrl || existingByEmail[0].profileImageUrl,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq4(users.id, existingByEmail[0].id));
    return { ...existingByEmail[0], googleId: profile.googleId, emailVerified: true };
  }
  const newUser = await db.insert(users).values({
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    profileImageUrl: profile.profileImageUrl,
    googleId: profile.googleId,
    emailVerified: true,
    clientId: generateClientId2(),
    isActive: true,
    accountStatus: "active"
  }).returning();
  return newUser[0];
}
function setupOAuth(app2) {
  app2.get("/api/auth/google", async (req, res) => {
    const isConnect = req.query.connect === "true";
    if (isConnect && !req.session.userId) {
      return res.redirect("/login?error=login_required");
    }
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.redirect("/login?error=google_not_configured");
    }
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers.host || "localhost:5000";
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;
    const oauthState = crypto3.randomBytes(32).toString("hex");
    req.session.oauthState = oauthState;
    req.session.oauthAction = isConnect ? "connect" : "login";
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("state", oauthState);
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "select_account");
    return res.redirect(authUrl.toString());
  });
  app2.get("/api/auth/google/callback", async (req, res) => {
    try {
      const { code, state, error } = req.query;
      const expectedState = req.session.oauthState;
      const action = req.session.oauthAction;
      delete req.session.oauthState;
      delete req.session.oauthAction;
      if (error) {
        console.error("Google OAuth error:", error);
        return res.redirect("/login?error=oauth_denied");
      }
      if (!state || state !== expectedState) {
        console.error("OAuth state mismatch:", { state, expectedState });
        return res.redirect("/login?error=invalid_state");
      }
      if (!code || typeof code !== "string") {
        return res.redirect("/login?error=no_code");
      }
      if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return res.redirect("/login?error=google_not_configured");
      }
      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.headers.host || "localhost:5000";
      const redirectUri = `${protocol}://${host}/api/auth/google/callback`;
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri
        })
      });
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error("Token exchange failed:", errorData);
        return res.redirect("/login?error=token_exchange_failed");
      }
      const tokens = await tokenResponse.json();
      const idToken = tokens.id_token;
      if (!idToken) {
        return res.redirect("/login?error=no_id_token");
      }
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.redirect("/login?error=invalid_token");
      }
      const isConnect = action === "connect";
      if (isConnect && req.session.userId) {
        const [existingUser] = await db.select().from(users).where(eq4(users.id, req.session.userId)).limit(1);
        if (existingUser) {
          await db.update(users).set({
            googleId: payload.sub,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq4(users.id, existingUser.id));
          return res.redirect("/dashboard?connected=google");
        }
      }
      const user = await findOrCreateUserByGoogle({
        googleId: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        profileImageUrl: payload.picture
      });
      if (!user.isActive || user.accountStatus === "deactivated") {
        return res.redirect("/login?error=account_deactivated");
      }
      req.session.userId = user.id;
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      return res.redirect("/dashboard");
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      return res.redirect("/login?error=auth_failed");
    }
  });
  app2.post("/api/auth/google", async (req, res) => {
    try {
      const { credential } = req.body;
      if (!credential) {
        return res.status(400).json({ message: "Credencial de Google requerida" });
      }
      if (!googleClient || !GOOGLE_CLIENT_ID) {
        return res.status(503).json({ message: "Google OAuth no esta configurado" });
      }
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(400).json({ message: "Token de Google invalido" });
      }
      const user = await findOrCreateUserByGoogle({
        googleId: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        profileImageUrl: payload.picture
      });
      if (!user.isActive || user.accountStatus === "deactivated") {
        return res.status(403).json({ message: "Cuenta desactivada" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error("Error en login de Google:", err);
          return res.status(500).json({ message: "Error al iniciar sesion" });
        }
        return res.json({
          message: "Inicio de sesion exitoso",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
            clientId: user.clientId,
            isAdmin: user.isAdmin,
            emailVerified: user.emailVerified,
            googleId: user.googleId ? true : false
          }
        });
      });
    } catch (error) {
      console.error("Error en autenticacion de Google:", error);
      return res.status(401).json({ message: "Error al verificar credencial de Google" });
    }
  });
  app2.post("/api/auth/connect/google", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "No autenticado" });
      }
      const { credential } = req.body;
      if (!credential || !googleClient || !GOOGLE_CLIENT_ID) {
        return res.status(400).json({ message: "Credencial de Google requerida" });
      }
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      if (!payload) {
        return res.status(400).json({ message: "Token invalido" });
      }
      const existingUser = await db.select().from(users).where(eq4(users.googleId, payload.sub)).limit(1);
      if (existingUser.length > 0 && existingUser[0].id !== req.user.id) {
        return res.status(409).json({ message: "Esta cuenta de Google ya esta vinculada a otro usuario" });
      }
      await db.update(users).set({
        googleId: payload.sub,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq4(users.id, req.user.id));
      return res.json({ message: "Cuenta de Google vinculada exitosamente" });
    } catch (error) {
      console.error("Error conectando Google:", error);
      return res.status(500).json({ message: "Error al vincular cuenta de Google" });
    }
  });
  app2.post("/api/auth/disconnect/google", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "No autenticado" });
      }
      const userId = req.user.id;
      const user = await db.select().from(users).where(eq4(users.id, userId)).limit(1);
      if (user.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      if (!user[0].passwordHash) {
        return res.status(400).json({
          message: "Debes tener una contrasena configurada antes de desvincular Google"
        });
      }
      await db.update(users).set({
        googleId: null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq4(users.id, userId));
      return res.json({ message: "Cuenta de Google desvinculada exitosamente" });
    } catch (error) {
      console.error("Error desconectando Google:", error);
      return res.status(500).json({ message: "Error al desvincular cuenta de Google" });
    }
  });
}

// server/calendar-service.ts
init_db();
init_schema();
import { eq as eq5, and as and2, lte, gte, isNotNull, sql as sql6 } from "drizzle-orm";
function calculateComplianceDeadlines(formationDate, state) {
  const deadlines = [];
  const formationYear = formationDate.getFullYear();
  const irs1120DueDate = new Date(formationYear + 1, 3, 15);
  const irs1120ReminderDate = new Date(irs1120DueDate);
  irs1120ReminderDate.setDate(irs1120ReminderDate.getDate() - 60);
  deadlines.push({
    type: "irs_1120",
    dueDate: irs1120DueDate,
    reminderDate: irs1120ReminderDate,
    description: "Presentaci\xF3n del formulario IRS 1120 (Declaraci\xF3n de impuestos corporativos)"
  });
  const irs5472DueDate = new Date(formationYear + 1, 3, 15);
  const irs5472ReminderDate = new Date(irs5472DueDate);
  irs5472ReminderDate.setDate(irs5472ReminderDate.getDate() - 60);
  deadlines.push({
    type: "irs_5472",
    dueDate: irs5472DueDate,
    reminderDate: irs5472ReminderDate,
    description: "Presentaci\xF3n del formulario IRS 5472 (Declaraci\xF3n de transacciones con propietarios extranjeros)"
  });
  if (state === "wyoming" || state === "delaware" || state === "WY" || state === "DE") {
    const annualReportDueDate = new Date(formationDate);
    annualReportDueDate.setFullYear(annualReportDueDate.getFullYear() + 1);
    const annualReportReminderDate = new Date(annualReportDueDate);
    annualReportReminderDate.setDate(annualReportReminderDate.getDate() - 60);
    const stateLabel = state === "wyoming" || state === "WY" ? "Wyoming" : "Delaware";
    deadlines.push({
      type: "annual_report",
      dueDate: annualReportDueDate,
      reminderDate: annualReportReminderDate,
      description: `Informe Anual del estado de ${stateLabel}`,
      state: stateLabel
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
    description: "Renovaci\xF3n del Agente Registrado"
  });
  return deadlines;
}
async function updateApplicationDeadlines(applicationId, formationDate, state) {
  const deadlines = calculateComplianceDeadlines(formationDate, state);
  const irs1120Deadline = deadlines.find((d) => d.type === "irs_1120");
  const irs5472Deadline = deadlines.find((d) => d.type === "irs_5472");
  const annualReportDeadline = deadlines.find((d) => d.type === "annual_report");
  const agentRenewalDeadline = deadlines.find((d) => d.type === "agent_renewal");
  await db.update(llcApplications).set({
    llcCreatedDate: formationDate,
    irs1120DueDate: irs1120Deadline?.dueDate,
    irs5472DueDate: irs5472Deadline?.dueDate,
    annualReportDueDate: annualReportDeadline?.dueDate,
    agentRenewalDate: agentRenewalDeadline?.dueDate,
    lastUpdated: /* @__PURE__ */ new Date()
  }).where(eq5(llcApplications.id, applicationId));
  return deadlines;
}
async function checkAndSendReminders() {
  const today = /* @__PURE__ */ new Date();
  const reminderWindowStart = new Date(today);
  reminderWindowStart.setDate(reminderWindowStart.getDate() + 55);
  const reminderWindowEnd = new Date(today);
  reminderWindowEnd.setDate(reminderWindowEnd.getDate() + 65);
  const applicationsWithIRS1120 = await db.select({
    application: llcApplications,
    order: orders
  }).from(llcApplications).innerJoin(orders, eq5(llcApplications.orderId, orders.id)).where(
    and2(
      isNotNull(llcApplications.irs1120DueDate),
      gte(llcApplications.irs1120DueDate, reminderWindowStart),
      lte(llcApplications.irs1120DueDate, reminderWindowEnd)
    )
  );
  for (const { application, order } of applicationsWithIRS1120) {
    const daysUntilDue = Math.ceil((application.irs1120DueDate.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
    await createComplianceNotification(
      order.userId,
      order.id,
      application.requestCode || `LLC-${application.id}`,
      "irs_1120",
      `Recordatorio: Formulario IRS 1120 vence en ${daysUntilDue} d\xEDas`,
      `Tu declaraci\xF3n de impuestos corporativos (Form 1120) para ${application.companyName} vence el ${formatDate2(application.irs1120DueDate)}. No olvides presentarlo a tiempo.`
    );
  }
  const applicationsWithIRS5472 = await db.select({
    application: llcApplications,
    order: orders
  }).from(llcApplications).innerJoin(orders, eq5(llcApplications.orderId, orders.id)).where(
    and2(
      isNotNull(llcApplications.irs5472DueDate),
      gte(llcApplications.irs5472DueDate, reminderWindowStart),
      lte(llcApplications.irs5472DueDate, reminderWindowEnd)
    )
  );
  for (const { application, order } of applicationsWithIRS5472) {
    const daysUntilDue = Math.ceil((application.irs5472DueDate.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
    await createComplianceNotification(
      order.userId,
      order.id,
      application.requestCode || `LLC-${application.id}`,
      "irs_5472",
      `Recordatorio: Formulario IRS 5472 vence en ${daysUntilDue} d\xEDas`,
      `Tu declaraci\xF3n de transacciones (Form 5472) para ${application.companyName} vence el ${formatDate2(application.irs5472DueDate)}. Es obligatorio para propietarios extranjeros.`
    );
  }
  const applicationsWithAnnualReport = await db.select({
    application: llcApplications,
    order: orders
  }).from(llcApplications).innerJoin(orders, eq5(llcApplications.orderId, orders.id)).where(
    and2(
      isNotNull(llcApplications.annualReportDueDate),
      gte(llcApplications.annualReportDueDate, reminderWindowStart),
      lte(llcApplications.annualReportDueDate, reminderWindowEnd)
    )
  );
  for (const { application, order } of applicationsWithAnnualReport) {
    const daysUntilDue = Math.ceil((application.annualReportDueDate.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
    const stateLabel = application.state === "wyoming" || application.state === "WY" ? "Wyoming" : "Nuevo M\xE9xico";
    await createComplianceNotification(
      order.userId,
      order.id,
      application.requestCode || `LLC-${application.id}`,
      "annual_report",
      `Recordatorio: Informe Anual de ${stateLabel} vence en ${daysUntilDue} d\xEDas`,
      `El informe anual de tu empresa ${application.companyName} en ${stateLabel} vence el ${formatDate2(application.annualReportDueDate)}. Presentar tarde puede resultar en multas.`
    );
  }
  const applicationsWithAgentRenewal = await db.select({
    application: llcApplications,
    order: orders
  }).from(llcApplications).innerJoin(orders, eq5(llcApplications.orderId, orders.id)).where(
    and2(
      isNotNull(llcApplications.agentRenewalDate),
      gte(llcApplications.agentRenewalDate, reminderWindowStart),
      lte(llcApplications.agentRenewalDate, reminderWindowEnd)
    )
  );
  for (const { application, order } of applicationsWithAgentRenewal) {
    const daysUntilDue = Math.ceil((application.agentRenewalDate.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
    await createComplianceNotification(
      order.userId,
      order.id,
      application.requestCode || `LLC-${application.id}`,
      "agent_renewal",
      `Recordatorio: Renovaci\xF3n de Agente Registrado en ${daysUntilDue} d\xEDas`,
      `La renovaci\xF3n del agente registrado para ${application.companyName} vence el ${formatDate2(application.agentRenewalDate)}. Sin agente registrado activo, tu LLC puede perder su buen estado legal.`
    );
  }
  return { checked: true, timestamp: today };
}
async function createComplianceNotification(userId, orderId, orderCode, type, title, message) {
  const ticketId = `COMP-${type.toUpperCase()}-${orderId}-${Date.now()}`;
  const existing = await db.select().from(userNotifications).where(
    and2(
      eq5(userNotifications.userId, userId),
      eq5(userNotifications.orderId, orderId),
      sql6`${userNotifications.type} = ${"compliance_" + type}`,
      sql6`${userNotifications.createdAt} > NOW() - INTERVAL '30 days'`
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
    actionUrl: `/dashboard/orders/${orderId}`
  });
  return ticketId;
}
function formatDate2(date) {
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}
function getUpcomingDeadlinesForUser(applications) {
  const today = /* @__PURE__ */ new Date();
  const deadlines = [];
  for (const app2 of applications) {
    if (app2.llcCreatedDate) {
      const companyName = app2.companyName || "Tu LLC";
      if (app2.irs1120DueDate) {
        const daysUntil = Math.ceil((new Date(app2.irs1120DueDate).getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
        if (daysUntil > 0 && daysUntil <= 365) {
          deadlines.push({
            type: "irs_1120",
            title: "IRS Form 1120",
            description: `Declaraci\xF3n de impuestos para ${companyName}`,
            dueDate: app2.irs1120DueDate,
            daysUntil,
            urgency: daysUntil <= 30 ? "urgent" : daysUntil <= 60 ? "warning" : "normal",
            applicationId: app2.id
          });
        }
      }
      if (app2.irs5472DueDate) {
        const daysUntil = Math.ceil((new Date(app2.irs5472DueDate).getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
        if (daysUntil > 0 && daysUntil <= 365) {
          deadlines.push({
            type: "irs_5472",
            title: "IRS Form 5472",
            description: `Declaraci\xF3n de transacciones para ${companyName}`,
            dueDate: app2.irs5472DueDate,
            daysUntil,
            urgency: daysUntil <= 30 ? "urgent" : daysUntil <= 60 ? "warning" : "normal",
            applicationId: app2.id
          });
        }
      }
      if (app2.annualReportDueDate) {
        const daysUntil = Math.ceil((new Date(app2.annualReportDueDate).getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
        if (daysUntil > 0 && daysUntil <= 365) {
          const stateLabel = app2.state === "wyoming" || app2.state === "WY" ? "Wyoming" : "Nuevo M\xE9xico";
          deadlines.push({
            type: "annual_report",
            title: `Informe Anual (${stateLabel})`,
            description: `Informe anual del estado para ${companyName}`,
            dueDate: app2.annualReportDueDate,
            daysUntil,
            urgency: daysUntil <= 30 ? "urgent" : daysUntil <= 60 ? "warning" : "normal",
            applicationId: app2.id,
            state: stateLabel
          });
        }
      }
      if (app2.agentRenewalDate) {
        const daysUntil = Math.ceil((new Date(app2.agentRenewalDate).getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
        if (daysUntil > 0 && daysUntil <= 365) {
          deadlines.push({
            type: "agent_renewal",
            title: "Renovaci\xF3n Agente Registrado",
            description: `Renovaci\xF3n anual del agente para ${companyName}`,
            dueDate: app2.agentRenewalDate,
            daysUntil,
            urgency: daysUntil <= 30 ? "urgent" : daysUntil <= 60 ? "warning" : "normal",
            applicationId: app2.id
          });
        }
      }
    }
  }
  return deadlines.sort((a, b) => a.daysUntil - b.daysUntil);
}

// server/routes.ts
async function registerRoutes(httpServer2, app2) {
  const rateLimit = /* @__PURE__ */ new Map();
  const WINDOW_MS = 6e4;
  const MAX_REQUESTS = 100;
  const CLEANUP_INTERVAL = 3e5;
  const statsCache = /* @__PURE__ */ new Map();
  const STATS_CACHE_TTL = 3e4;
  function getCachedData(key) {
    const entry = statsCache.get(key);
    if (entry && Date.now() - entry.timestamp < STATS_CACHE_TTL) {
      return entry.data;
    }
    return null;
  }
  function setCachedData(key, data) {
    statsCache.set(key, { data, timestamp: Date.now() });
  }
  setInterval(() => {
    const now = Date.now();
    const entries = Array.from(rateLimit.entries());
    for (let i = 0; i < entries.length; i++) {
      const [ip, timestamps] = entries[i];
      const valid = timestamps.filter((t) => now - t < WINDOW_MS);
      if (valid.length === 0) {
        rateLimit.delete(ip);
      } else {
        rateLimit.set(ip, valid);
      }
    }
  }, CLEANUP_INTERVAL);
  setInterval(async () => {
    try {
      await db.delete(contactOtps).where(
        sql7`${contactOtps.expiresAt} < NOW()`
      );
    } catch (e) {
      console.error("OTP cleanup error:", e);
    }
  }, 6e5);
  app2.use("/api/", (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.headers["x-forwarded-for"]?.toString().split(",")[0] || "unknown";
    const timestamps = rateLimit.get(ip) || [];
    const validTimestamps = timestamps.filter((t) => now - t < WINDOW_MS);
    if (validTimestamps.length >= MAX_REQUESTS) {
      res.setHeader("Retry-After", "60");
      return res.status(429).json({ message: "Demasiadas peticiones. Por favor, espera un minuto." });
    }
    validTimestamps.push(now);
    rateLimit.set(ip, validTimestamps);
    next();
  });
  setupCustomAuth(app2);
  setupOAuth(app2);
  setInterval(async () => {
    try {
      await checkAndSendReminders();
    } catch (e) {
      console.error("Compliance reminder check error:", e);
    }
  }, 36e5);
  setTimeout(async () => {
    try {
      await checkAndSendReminders();
      console.log("Initial compliance reminder check completed");
    } catch (e) {
      console.error("Initial compliance reminder check error:", e);
    }
  }, 3e4);
  app2.get("/api/healthz", async (_req, res) => {
    try {
      const health = await getSystemHealth();
      if (health.status === "unhealthy") {
        return res.status(503).json(health);
      }
      res.status(200).json(health);
    } catch (error) {
      res.status(503).json({ status: "unhealthy", error: "Health check failed" });
    }
  });
  app2.get("/api/admin/audit-logs", isAdmin, async (_req, res) => {
    const logs = getRecentAuditLogs(500);
    res.json(logs);
  });
  const logActivity2 = async (title, data, _req) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[LOG] ${title}:`, data);
    }
  };
  const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  app2.post("/api/activity/track", async (req, res) => {
    const { action, details } = req.body;
    if (action === "CLICK_ELEGIR_ESTADO") {
      logActivity2("Selecci\xF3n de Estado", { "Detalles": details }, req);
    }
    res.json({ success: true });
  });
  app2.get("/api/admin/orders", isAdmin, async (req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      res.json(allOrders);
    } catch (error) {
      console.error("Admin orders error:", error);
      res.status(500).json({ message: "Error fetching orders" });
    }
  });
  app2.patch("/api/admin/orders/:id/status", isAdmin, asyncHandler(async (req, res) => {
    const orderId = Number(req.params.id);
    const { status } = z2.object({ status: z2.string() }).parse(req.body);
    const [updatedOrder] = await db.update(orders).set({ status }).where(eq7(orders.id, orderId)).returning();
    logAudit({
      action: "order_status_change",
      userId: req.session?.userId,
      targetId: String(orderId),
      details: { newStatus: status }
    });
    const order = await storage.getOrder(orderId);
    if (order?.user?.email) {
      const statusLabels = {
        pending: "Pendiente",
        processing: "En proceso",
        paid: "Pagado",
        filed: "Presentado",
        documents_ready: "Documentos listos",
        completed: "Completado",
        cancelled: "Cancelado"
      };
      const statusLabel = statusLabels[status] || status.replace(/_/g, " ");
      if (status === "completed" && order.userId) {
        await db.update(users).set({ accountStatus: "vip" }).where(eq7(users.id, order.userId));
        const orderCode2 = order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber || `#${order.id}`;
        sendTrustpilotEmail({
          to: order.user.email,
          name: order.user.firstName || "Cliente",
          orderNumber: orderCode2
        }).catch(() => {
        });
      }
      if (status === "filed" && order.application) {
        const formationDate = /* @__PURE__ */ new Date();
        const state = order.application.state || "new_mexico";
        await updateApplicationDeadlines(order.application.id, formationDate, state);
      }
      const orderCode = order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber || `#${order.id}`;
      await db.insert(userNotifications).values({
        userId: order.userId,
        orderId: order.id,
        orderCode,
        title: `Actualizaci\xF3n de pedido: ${statusLabel}`,
        message: `Tu pedido ${orderCode} ha cambiado a: ${statusLabel}.${status === "completed" ? " \xA1Enhorabuena, ahora eres cliente VIP!" : ""}`,
        type: "update",
        isRead: false
      });
      await db.insert(orderEvents).values({
        orderId: order.id,
        eventType: statusLabel,
        description: `El estado del pedido ha sido actualizado a ${statusLabel}.`,
        createdBy: req.session.userId
      });
      sendEmail({
        to: order.user.email,
        subject: `Actualizaci\xF3n de estado - Pedido ${order.invoiceNumber || `#${order.id}`}`,
        html: getOrderUpdateTemplate(
          order.user.firstName || "Cliente",
          order.invoiceNumber || `#${order.id}`,
          status,
          `Tu pedido ha pasado a estado: ${statusLabels[status] || status}. Puedes ver los detalles en tu panel de control.`
        )
      }).catch(() => {
      });
    }
    res.json(updatedOrder);
  }));
  app2.patch("/api/admin/orders/:id/payment-link", isAdmin, asyncHandler(async (req, res) => {
    const orderId = Number(req.params.id);
    const { paymentLink, paymentStatus, paymentDueDate } = z2.object({
      paymentLink: z2.string().url().optional().nullable(),
      paymentStatus: z2.enum(["pending", "paid", "overdue", "cancelled"]).optional(),
      paymentDueDate: z2.string().optional().nullable()
    }).parse(req.body);
    const updateData = {};
    if (paymentLink !== void 0) updateData.paymentLink = paymentLink;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (paymentDueDate !== void 0) updateData.paymentDueDate = paymentDueDate ? new Date(paymentDueDate) : null;
    if (paymentStatus === "paid") updateData.paidAt = /* @__PURE__ */ new Date();
    const [updatedOrder] = await db.update(orders).set(updateData).where(eq7(orders.id, orderId)).returning();
    if (!updatedOrder) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }
    logAudit({
      action: "payment_link_update",
      userId: req.session?.userId,
      targetId: String(orderId),
      details: { paymentLink, paymentStatus }
    });
    res.json(updatedOrder);
  }));
  app2.delete("/api/admin/orders/:id", isAdmin, asyncHandler(async (req, res) => {
    const orderId = Number(req.params.id);
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }
    await db.transaction(async (tx) => {
      await tx.delete(orderEvents).where(eq7(orderEvents.orderId, orderId));
      await tx.delete(applicationDocuments).where(eq7(applicationDocuments.orderId, orderId));
      if (order.userId) {
        await tx.delete(userNotifications).where(
          and3(
            eq7(userNotifications.userId, order.userId),
            sql7`${userNotifications.message} LIKE ${"%" + (order.invoiceNumber || `#${orderId}`) + "%"}`
          )
        );
      }
      if (order.application?.id) {
        await tx.delete(llcApplications).where(eq7(llcApplications.id, order.application.id));
      }
      await tx.delete(orders).where(eq7(orders.id, orderId));
    });
    res.json({ success: true, message: "Pedido eliminado correctamente" });
  }));
  app2.patch("/api/admin/llc/:appId/dates", isAdmin, asyncHandler(async (req, res) => {
    const appId = Number(req.params.appId);
    const { field, value } = z2.object({
      field: z2.enum(["llcCreatedDate", "agentRenewalDate", "irs1120DueDate", "irs5472DueDate", "annualReportDueDate"]),
      value: z2.string()
    }).parse(req.body);
    const dateValue = value ? new Date(value) : null;
    const updateData = {};
    updateData[field] = dateValue;
    if (field === "llcCreatedDate" && dateValue) {
      const creationDate = new Date(dateValue);
      const creationYear = creationDate.getFullYear();
      const nextYear = creationYear + 1;
      const agentRenewal = new Date(creationDate);
      agentRenewal.setFullYear(agentRenewal.getFullYear() + 1);
      updateData.agentRenewalDate = agentRenewal;
      updateData.irs1120DueDate = new Date(nextYear, 2, 15);
      updateData.irs5472DueDate = new Date(nextYear, 3, 15);
      const [app3] = await db.select({ state: llcApplications.state }).from(llcApplications).where(eq7(llcApplications.id, appId)).limit(1);
      if (app3?.state) {
        if (app3.state === "Wyoming") {
          const wyomingDate = new Date(creationDate);
          wyomingDate.setFullYear(wyomingDate.getFullYear() + 1);
          wyomingDate.setDate(1);
          updateData.annualReportDueDate = wyomingDate;
        } else if (app3.state === "Delaware") {
          updateData.annualReportDueDate = new Date(nextYear, 2, 1);
        }
      }
    }
    await db.update(llcApplications).set(updateData).where(eq7(llcApplications.id, appId));
    res.json({ success: true });
  }));
  app2.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users4 = await db.select().from(users).orderBy(desc2(users.createdAt));
      res.json(users4);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  app2.patch("/api/admin/users/:id", isAdmin, asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const updateSchema = z2.object({
      firstName: z2.string().min(1).max(100).optional(),
      lastName: z2.string().min(1).max(100).optional(),
      email: z2.string().email().optional(),
      phone: z2.string().max(30).optional().nullable(),
      address: z2.string().optional().nullable(),
      streetType: z2.string().optional().nullable(),
      city: z2.string().optional().nullable(),
      province: z2.string().optional().nullable(),
      postalCode: z2.string().optional().nullable(),
      country: z2.string().optional().nullable(),
      idNumber: z2.string().optional().nullable(),
      idType: z2.enum(["dni", "nie", "passport"]).optional().nullable(),
      birthDate: z2.string().optional().nullable(),
      businessActivity: z2.string().optional().nullable(),
      isActive: z2.boolean().optional(),
      isAdmin: z2.boolean().optional(),
      accountStatus: z2.enum(["active", "pending", "deactivated", "vip"]).optional(),
      internalNotes: z2.string().optional()
    });
    const data = updateSchema.parse(req.body);
    const [updated] = await db.update(users).set({
      ...data,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq7(users.id, userId)).returning();
    logAudit({
      action: "admin_user_update",
      userId: req.session?.userId,
      targetId: userId,
      details: { changes: Object.keys(data) }
    });
    if (data.accountStatus) {
      const [user] = await db.select().from(users).where(eq7(users.id, userId)).limit(1);
      if (user && user.email) {
        if (data.accountStatus === "deactivated") {
          await sendEmail({
            to: user.email,
            subject: "Notificaci\xF3n de estado de cuenta",
            html: getAccountDeactivatedTemplate(user.firstName || "Cliente")
          }).catch(() => {
          });
          await db.insert(userNotifications).values({
            userId,
            title: "Cuenta desactivada",
            message: "Tu cuenta ha sido desactivada. Contacta con soporte si tienes dudas.",
            type: "action_required",
            isRead: false
          });
        } else if (data.accountStatus === "vip") {
          await sendEmail({
            to: user.email,
            subject: "Tu cuenta ha sido actualizada a estado VIP",
            html: getAccountVipTemplate(user.firstName || "Cliente")
          }).catch(() => {
          });
          await db.insert(userNotifications).values({
            userId,
            title: "Estado VIP activado",
            message: "Tu cuenta ha sido actualizada al estado VIP con beneficios prioritarios.",
            type: "update",
            isRead: false
          });
        } else if (data.accountStatus === "active") {
          await sendEmail({
            to: user.email,
            subject: "Tu cuenta ha sido reactivada",
            html: getAccountReactivatedTemplate(user.firstName || "Cliente")
          }).catch(() => {
          });
          await db.insert(userNotifications).values({
            userId,
            title: "Cuenta reactivada",
            message: "Tu cuenta ha sido reactivada y ya puedes acceder a todos los servicios.",
            type: "update",
            isRead: false
          });
        }
      }
    }
    if (data.accountStatus || data.isActive !== void 0) {
      logActivity2("Cambio Cr\xEDtico de Cuenta", {
        userId,
        "Nuevo Estado": data.accountStatus,
        "Activo": data.isActive,
        adminId: req.session.userId
      }, req);
    }
    res.json(updated);
  }));
  app2.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      await db.delete(users).where(eq7(users.id, userId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error al eliminar usuario" });
    }
  });
  app2.post("/api/admin/users/create", isAdmin, asyncHandler(async (req, res) => {
    const schema = z2.object({
      firstName: z2.string().optional(),
      lastName: z2.string().optional(),
      email: z2.string().email(),
      phone: z2.string().optional(),
      password: z2.string().min(6)
    });
    const { firstName, lastName, email, phone, password } = schema.parse(req.body);
    const existing = await db.select().from(users).where(eq7(users.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ message: "El email ya est\xE1 registrado" });
    }
    const bcrypt2 = await import("bcrypt");
    const hashedPassword = await bcrypt2.hash(password, 10);
    const [newUser] = await db.insert(users).values({
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      phone: phone || null,
      passwordHash: hashedPassword,
      emailVerified: true,
      accountStatus: "active"
    }).returning();
    res.json({ success: true, userId: newUser.id });
  }));
  app2.post("/api/admin/orders/create", isAdmin, asyncHandler(async (req, res) => {
    const validStates = ["New Mexico", "Wyoming", "Delaware"];
    const schema = z2.object({
      userId: z2.string().uuid(),
      state: z2.enum(validStates),
      amount: z2.string().or(z2.number()).refine((val) => Number(val) > 0, { message: "El importe debe ser mayor que 0" })
    });
    const { userId, state, amount } = schema.parse(req.body);
    const [user] = await db.select().from(users).where(eq7(users.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const productMap = {
      "New Mexico": { id: 1, name: "LLC New Mexico" },
      "Wyoming": { id: 2, name: "LLC Wyoming" },
      "Delaware": { id: 3, name: "LLC Delaware" }
    };
    const product = productMap[state];
    const amountCents = Math.round(Number(amount) * 100);
    const statePrefix = state === "Wyoming" ? "WY" : state === "Delaware" ? "DE" : "NM";
    const year = (/* @__PURE__ */ new Date()).getFullYear().toString().slice(-2);
    const timestamp3 = Date.now().toString(36).toUpperCase().slice(-4);
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const invoiceNumber = `${statePrefix}-${year}${timestamp3}-${randomSuffix}`;
    const [order] = await db.insert(orders).values({
      userId,
      productId: product.id,
      amount: amountCents,
      status: "pending",
      invoiceNumber
    }).returning();
    await db.insert(orderEvents).values({
      orderId: order.id,
      eventType: "order_created",
      description: `Pedido ${invoiceNumber} creado por administrador`
    });
    await db.insert(userNotifications).values({
      userId,
      orderId: order.id,
      orderCode: invoiceNumber,
      title: "Nuevo pedido registrado",
      message: `Se ha registrado el pedido ${invoiceNumber} para ${product.name}`,
      type: "info",
      isRead: false
    });
    res.json({ success: true, orderId: order.id, invoiceNumber });
  }));
  app2.get("/api/admin/system-stats", isAdmin, async (req, res) => {
    try {
      const cached = getCachedData("system-stats");
      if (cached) {
        return res.json(cached);
      }
      const [
        salesResult,
        pendingSalesResult,
        userResult,
        orderResult,
        pendingOrdersResult,
        completedOrdersResult,
        processingOrdersResult,
        subscriberResult,
        pendingAccountsResult,
        activeAccountsResult,
        vipAccountsResult,
        deactivatedAccountsResult,
        messagesResult,
        pendingMessagesResult,
        docsResult,
        pendingDocsResult
      ] = await Promise.all([
        db.select({ total: sql7`COALESCE(sum(amount), 0)` }).from(orders).where(eq7(orders.status, "completed")),
        db.select({ total: sql7`COALESCE(sum(amount), 0)` }).from(orders).where(eq7(orders.status, "pending")),
        db.select({ count: sql7`count(*)` }).from(users),
        db.select({ count: sql7`count(*)` }).from(orders),
        db.select({ count: sql7`count(*)` }).from(orders).where(eq7(orders.status, "pending")),
        db.select({ count: sql7`count(*)` }).from(orders).where(eq7(orders.status, "completed")),
        db.select({ count: sql7`count(*)` }).from(orders).where(eq7(orders.status, "processing")),
        db.select({ count: sql7`count(*)` }).from(newsletterSubscribers),
        db.select({ count: sql7`count(*)` }).from(users).where(eq7(users.accountStatus, "pending")),
        db.select({ count: sql7`count(*)` }).from(users).where(eq7(users.accountStatus, "active")),
        db.select({ count: sql7`count(*)` }).from(users).where(eq7(users.accountStatus, "vip")),
        db.select({ count: sql7`count(*)` }).from(users).where(eq7(users.accountStatus, "deactivated")),
        db.select({ count: sql7`count(*)` }).from(messages),
        db.select({ count: sql7`count(*)` }).from(messages).where(eq7(messages.status, "pending")),
        db.select({ count: sql7`count(*)` }).from(applicationDocuments),
        db.select({ count: sql7`count(*)` }).from(applicationDocuments).where(eq7(applicationDocuments.reviewStatus, "pending"))
      ]);
      const totalSales = Number(salesResult[0]?.total || 0);
      const pendingSales = Number(pendingSalesResult[0]?.total || 0);
      const userCount = Number(userResult[0]?.count || 0);
      const orderCount = Number(orderResult[0]?.count || 0);
      const pendingOrders = Number(pendingOrdersResult[0]?.count || 0);
      const completedOrders = Number(completedOrdersResult[0]?.count || 0);
      const processingOrders = Number(processingOrdersResult[0]?.count || 0);
      const subscriberCount = Number(subscriberResult[0]?.count || 0);
      const pendingAccounts = Number(pendingAccountsResult[0]?.count || 0);
      const activeAccounts = Number(activeAccountsResult[0]?.count || 0);
      const vipAccounts = Number(vipAccountsResult[0]?.count || 0);
      const deactivatedAccounts = Number(deactivatedAccountsResult[0]?.count || 0);
      const totalMessages = Number(messagesResult[0]?.count || 0);
      const pendingMessages = Number(pendingMessagesResult[0]?.count || 0);
      const totalDocs = Number(docsResult[0]?.count || 0);
      const pendingDocs = Number(pendingDocsResult[0]?.count || 0);
      const conversionRate = userCount > 0 ? orderCount / userCount * 100 : 0;
      const statsData = {
        // Sales
        totalSales,
        pendingSales,
        // Orders
        orderCount,
        pendingOrders,
        completedOrders,
        processingOrders,
        // Users
        userCount,
        pendingAccounts,
        activeAccounts,
        vipAccounts,
        deactivatedAccounts,
        // Newsletter
        subscriberCount,
        // Messages
        totalMessages,
        pendingMessages,
        // Documents
        totalDocs,
        pendingDocs,
        // Metrics
        conversionRate: Number(conversionRate.toFixed(2))
      };
      setCachedData("system-stats", statsData);
      res.json(statsData);
    } catch (error) {
      console.error("System stats error:", error);
      res.status(500).json({ message: "Error fetching system stats" });
    }
  });
  app2.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const result = await db.select({ total: sql7`sum(amount)` }).from(orders).where(eq7(orders.status, "completed"));
      res.json({ totalSales: Number(result[0]?.total || 0) });
    } catch (error) {
      res.status(500).json({ message: "Error fetching stats" });
    }
  });
  app2.get("/api/admin/discount-codes", isAdmin, async (req, res) => {
    try {
      const codes = await db.select().from(discountCodes).orderBy(desc2(discountCodes.createdAt));
      res.json(codes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching discount codes" });
    }
  });
  app2.post("/api/admin/discount-codes", isAdmin, async (req, res) => {
    try {
      const { code, description, discountType, discountValue, minOrderAmount, maxUses, validFrom, validUntil, isActive } = req.body;
      if (!code || !discountValue) {
        return res.status(400).json({ message: "C\xF3digo y valor de descuento son requeridos" });
      }
      const [existing] = await db.select().from(discountCodes).where(eq7(discountCodes.code, code.toUpperCase())).limit(1);
      if (existing) {
        return res.status(400).json({ message: "Este c\xF3digo ya existe" });
      }
      const [newCode] = await db.insert(discountCodes).values({
        code: code.toUpperCase(),
        description,
        discountType: discountType || "percentage",
        discountValue: parseInt(discountValue),
        minOrderAmount: minOrderAmount ? parseInt(minOrderAmount) : 0,
        maxUses: maxUses ? parseInt(maxUses) : null,
        validFrom: validFrom ? new Date(validFrom) : /* @__PURE__ */ new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: isActive !== false
      }).returning();
      res.status(201).json(newCode);
    } catch (error) {
      res.status(500).json({ message: "Error creating discount code" });
    }
  });
  app2.patch("/api/admin/discount-codes/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { code, description, discountType, discountValue, minOrderAmount, maxUses, validFrom, validUntil, isActive } = req.body;
      const updateData = {};
      if (code) updateData.code = code.toUpperCase();
      if (description !== void 0) updateData.description = description;
      if (discountType) updateData.discountType = discountType;
      if (discountValue !== void 0) updateData.discountValue = parseInt(discountValue);
      if (minOrderAmount !== void 0) updateData.minOrderAmount = parseInt(minOrderAmount);
      if (maxUses !== void 0) updateData.maxUses = maxUses ? parseInt(maxUses) : null;
      if (validFrom) updateData.validFrom = new Date(validFrom);
      if (validUntil !== void 0) updateData.validUntil = validUntil ? new Date(validUntil) : null;
      if (isActive !== void 0) updateData.isActive = isActive;
      const [updated] = await db.update(discountCodes).set(updateData).where(eq7(discountCodes.id, id)).returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error updating discount code" });
    }
  });
  app2.delete("/api/admin/discount-codes/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(discountCodes).where(eq7(discountCodes.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting discount code" });
    }
  });
  app2.post("/api/discount-codes/validate", async (req, res) => {
    try {
      const { code, orderAmount } = req.body;
      if (!code) {
        return res.status(400).json({ valid: false, message: "C\xF3digo requerido" });
      }
      const [discountCode] = await db.select().from(discountCodes).where(eq7(discountCodes.code, code.toUpperCase())).limit(1);
      if (!discountCode) {
        return res.status(404).json({ valid: false, message: "C\xF3digo no encontrado" });
      }
      if (!discountCode.isActive) {
        return res.status(400).json({ valid: false, message: "C\xF3digo inactivo" });
      }
      const now = /* @__PURE__ */ new Date();
      if (discountCode.validFrom && new Date(discountCode.validFrom) > now) {
        return res.status(400).json({ valid: false, message: "C\xF3digo a\xFAn no v\xE1lido" });
      }
      if (discountCode.validUntil && new Date(discountCode.validUntil) < now) {
        return res.status(400).json({ valid: false, message: "C\xF3digo expirado" });
      }
      if (discountCode.maxUses && discountCode.usedCount >= discountCode.maxUses) {
        return res.status(400).json({ valid: false, message: "C\xF3digo agotado" });
      }
      if (discountCode.minOrderAmount && orderAmount && orderAmount < discountCode.minOrderAmount) {
        return res.status(400).json({ valid: false, message: `Pedido m\xEDnimo: ${(discountCode.minOrderAmount / 100).toFixed(2)}\u20AC` });
      }
      let discountAmount = 0;
      if (orderAmount) {
        if (discountCode.discountType === "percentage") {
          discountAmount = Math.round(orderAmount * discountCode.discountValue / 100);
        } else {
          discountAmount = discountCode.discountValue;
        }
      }
      res.json({
        valid: true,
        code: discountCode.code,
        discountType: discountCode.discountType,
        discountValue: discountCode.discountValue,
        discountAmount,
        description: discountCode.description
      });
    } catch (error) {
      res.status(500).json({ valid: false, message: "Error validating code" });
    }
  });
  app2.get("/api/admin/newsletter", isAdmin, async (req, res) => {
    try {
      const subscribers = await db.select().from(newsletterSubscribers).orderBy(desc2(newsletterSubscribers.subscribedAt));
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  });
  app2.post("/api/admin/newsletter/broadcast", isAdmin, asyncHandler(async (req, res) => {
    const { subject, message } = z2.object({
      subject: z2.string().min(1),
      message: z2.string().min(1)
    }).parse(req.body);
    const subscribers = await db.select().from(newsletterSubscribers);
    const html = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f7f7f5;">
        <div style="background: white; padding: 32px; border-radius: 16px;">
          <h1 style="font-size: 24px; font-weight: 900; color: #0E1215; margin: 0 0 24px 0;">${subject}</h1>
          <div style="font-size: 15px; line-height: 1.6; color: #333;">${message.replace(/\n/g, "<br>")}</div>
          <hr style="border: none; border-top: 1px solid #E6E9EC; margin: 32px 0;" />
          <p style="font-size: 12px; color: #6B7280; margin: 0;">Easy US LLC - Formaci\xF3n de empresas en USA</p>
        </div>
      </div>
    `;
    let sent = 0;
    for (const sub of subscribers) {
      try {
        await sendEmail({ to: sub.email, subject, html });
        sent++;
      } catch (e) {
      }
    }
    res.json({ success: true, sent, total: subscribers.length });
  }));
  app2.get("/api/admin/messages", isAdmin, async (req, res) => {
    try {
      const allMessages = await storage.getAllMessages();
      res.json(allMessages);
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  });
  app2.patch("/api/admin/messages/:id/archive", isAdmin, async (req, res) => {
    try {
      const updated = await storage.updateMessageStatus(Number(req.params.id), "archived");
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error al archivar mensaje" });
    }
  });
  app2.post("/api/admin/documents", isAdmin, async (req, res) => {
    try {
      const { orderId, fileName, fileUrl, documentType, applicationId } = req.body;
      const [doc] = await db.insert(applicationDocuments).values({
        orderId,
        applicationId,
        fileName,
        fileType: "application/pdf",
        fileUrl,
        documentType: documentType || "official_filing",
        reviewStatus: "approved",
        uploadedBy: req.session.userId
      }).returning();
      res.json(doc);
    } catch (error) {
      console.error("Upload doc error:", error);
      res.status(500).json({ message: "Error uploading document" });
    }
  });
  app2.get("/api/user/documents", isAuthenticated, async (req, res) => {
    try {
      const docs = await db.select().from(applicationDocuments).leftJoin(orders, eq7(applicationDocuments.orderId, orders.id)).where(eq7(orders.userId, req.session.userId)).orderBy(desc2(applicationDocuments.uploadedAt));
      res.json(docs.map((d) => d.application_documents));
    } catch (error) {
      res.status(500).json({ message: "Error fetching documents" });
    }
  });
  app2.delete("/api/user/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const docId = parseInt(req.params.id);
      const [user] = await db.select().from(users).where(eq7(users.id, userId)).limit(1);
      if (!user || user.accountStatus === "pending") {
        return res.status(403).json({ message: "No puedes eliminar documentos mientras tu cuenta est\xE1 en revisi\xF3n" });
      }
      const docs = await db.select().from(applicationDocuments).leftJoin(orders, eq7(applicationDocuments.orderId, orders.id)).where(and3(
        eq7(applicationDocuments.id, docId),
        eq7(orders.userId, userId)
      ));
      if (!docs.length) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }
      await db.delete(applicationDocuments).where(eq7(applicationDocuments.id, docId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Error al eliminar documento" });
    }
  });
  app2.post("/api/documents/upload", isAuthenticated, async (req, res) => {
    try {
      const { orderId, fileName, fileUrl, documentType, applicationId } = z2.object({
        orderId: z2.number(),
        applicationId: z2.number(),
        fileName: z2.string(),
        fileUrl: z2.string(),
        documentType: z2.string()
      }).parse(req.body);
      const [doc] = await db.insert(applicationDocuments).values({
        orderId,
        applicationId,
        fileName,
        fileType: "application/pdf",
        fileUrl,
        documentType,
        reviewStatus: "pending",
        uploadedBy: req.session.userId
      }).returning();
      logActivity2("Documento Subido por Cliente", {
        "Cliente ID": req.session.userId,
        "Pedido ID": orderId,
        "Tipo": documentType
      });
      res.json(doc);
    } catch (error) {
      res.status(500).json({ message: "Error al subir documento" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    const products3 = await storage.getProducts();
    res.json(products3);
  });
  app2.post("/api/seed-admin", isAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      const adminEmail = email || process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
      const [existingUser] = await db.select().from(users).where(eq7(users.email, adminEmail)).limit(1);
      if (!existingUser) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }
      await db.update(users).set({ isAdmin: true, accountStatus: "active" }).where(eq7(users.email, adminEmail));
      res.json({ success: true, message: "Rol de administrador asignado correctamente" });
    } catch (error) {
      console.error("Seed admin error:", error);
      res.status(500).json({ message: "Error al asignar rol de administrador" });
    }
  });
  app2.delete("/api/user/account", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { mode } = req.body;
      if (mode === "hard") {
        await db.delete(users).where(eq7(users.id, userId));
      } else {
        const [user] = await db.select().from(users).where(eq7(users.id, userId)).limit(1);
        await db.update(users).set({
          accountStatus: "deactivated",
          isActive: false,
          email: `deleted_${userId}_${user.email}`,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq7(users.id, userId));
      }
      req.session.destroy(() => {
      });
      res.json({ success: true, message: "Cuenta procesada correctamente" });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ message: "Error al procesar la eliminaci\xF3n de cuenta" });
    }
  });
  const updateProfileSchema = z2.object({
    firstName: z2.string().optional(),
    lastName: z2.string().optional(),
    phone: z2.string().optional(),
    businessActivity: z2.string().optional(),
    address: z2.string().optional(),
    streetType: z2.string().optional(),
    city: z2.string().optional(),
    province: z2.string().optional(),
    postalCode: z2.string().optional(),
    country: z2.string().optional(),
    idNumber: z2.string().optional(),
    idType: z2.string().optional(),
    birthDate: z2.string().optional()
  });
  app2.patch("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const validatedData = updateProfileSchema.parse(req.body);
      await db.update(users).set(validatedData).where(eq7(users.id, userId));
      const [updatedUser] = await db.select().from(users).where(eq7(users.id, userId)).limit(1);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Error updating profile" });
    }
  });
  app2.get("/api/user/deadlines", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const userOrders = await db.select({
        order: orders,
        application: llcApplications
      }).from(orders).leftJoin(llcApplications, eq7(orders.id, llcApplications.orderId)).where(eq7(orders.userId, userId));
      const applications = userOrders.filter((o) => o.application).map((o) => o.application);
      const deadlines = getUpcomingDeadlinesForUser(applications);
      res.json(deadlines);
    } catch (error) {
      console.error("Error fetching deadlines:", error);
      res.status(500).json({ message: "Error al obtener fechas de cumplimiento" });
    }
  });
  app2.post("/api/admin/applications/:id/set-formation-date", isAdmin, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { formationDate, state } = z2.object({
        formationDate: z2.string(),
        state: z2.string().optional()
      }).parse(req.body);
      const [app3] = await db.select().from(llcApplications).where(eq7(llcApplications.id, applicationId)).limit(1);
      if (!app3) {
        return res.status(404).json({ message: "Aplicaci\xF3n no encontrada" });
      }
      const deadlines = await updateApplicationDeadlines(
        applicationId,
        new Date(formationDate),
        state || app3.state || "new_mexico"
      );
      res.json({
        success: true,
        message: "Fechas de cumplimiento calculadas exitosamente",
        deadlines
      });
    } catch (error) {
      console.error("Error setting formation date:", error);
      res.status(500).json({ message: "Error al establecer fecha de constituci\xF3n" });
    }
  });
  app2.post("/api/admin/send-note", isAdmin, async (req, res) => {
    try {
      const { userId, title, message, type } = z2.object({
        userId: z2.string(),
        title: z2.string().min(1, "T\xEDtulo requerido"),
        message: z2.string().min(1, "Mensaje requerido"),
        type: z2.enum(["update", "info", "action_required"])
      }).parse(req.body);
      const [user] = await db.select().from(users).where(eq7(users.id, userId)).limit(1);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      const { generateUniqueTicketId: generateUniqueTicketId2 } = await Promise.resolve().then(() => (init_id_generator(), id_generator_exports));
      const ticketId = await generateUniqueTicketId2();
      await db.insert(userNotifications).values({
        userId,
        title,
        message,
        type,
        ticketId,
        isRead: false
      });
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: `${title} - Ticket #${ticketId}`,
          html: getAdminNoteTemplate(user.firstName || "Cliente", title, message, ticketId)
        });
      }
      res.json({ success: true, emailSent: !!user.email, ticketId });
    } catch (error) {
      console.error("Error sending note:", error);
      res.status(500).json({ message: "Error al enviar nota" });
    }
  });
  app2.post("/api/admin/send-payment-link", isAdmin, async (req, res) => {
    try {
      const { userId, paymentLink, message, amount } = z2.object({
        userId: z2.string(),
        paymentLink: z2.string().url(),
        message: z2.string(),
        amount: z2.string().optional()
      }).parse(req.body);
      const [user] = await db.select().from(users).where(eq7(users.id, userId)).limit(1);
      if (!user || !user.email) return res.status(404).json({ message: "Usuario o email no encontrado" });
      await sendEmail({
        to: user.email,
        subject: "Pago pendiente - Easy US LLC",
        html: getPaymentRequestTemplate(user.firstName || "Cliente", message, paymentLink, amount)
      });
      await db.insert(userNotifications).values({
        userId,
        title: "Pago Pendiente Solicitado",
        message: `Se ha enviado un enlace de pago por ${amount || "el tr\xE1mite"}. Revisa tu email.`,
        type: "action_required",
        isRead: false
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Send payment link error:", error);
      res.status(500).json({ message: "Error al enviar enlace de pago" });
    }
  });
  app2.patch("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order || order.userId !== req.session.userId) {
        return res.status(403).json({ message: "No autorizado" });
      }
      if (order.status !== "pending") {
        return res.status(400).json({ message: "El pedido ya est\xE1 en tr\xE1mite y no puede modificarse." });
      }
      const updateSchema = z2.object({
        companyNameOption2: z2.string().optional(),
        designator: z2.string().optional(),
        companyDescription: z2.string().optional(),
        ownerNamesAlternates: z2.string().optional(),
        notes: z2.string().optional()
      });
      const validatedData = updateSchema.parse(req.body);
      await db.update(llcApplications).set({ ...validatedData, lastUpdated: /* @__PURE__ */ new Date() }).where(eq7(llcApplications.orderId, orderId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar pedido" });
    }
  });
  app2.get("/api/user/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const notifs = await db.select().from(userNotifications).where(eq7(userNotifications.userId, userId)).orderBy(desc2(userNotifications.createdAt)).limit(50);
      res.json(notifs);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });
  app2.patch("/api/user/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      await db.update(userNotifications).set({ isRead: true }).where(and3(eq7(userNotifications.id, req.params.id), eq7(userNotifications.userId, req.session.userId)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  });
  app2.post("/api/user/request-password-otp", isAuthenticated, async (req, res) => {
    try {
      const [user] = await db.select().from(users).where(eq7(users.id, req.session.userId));
      if (!user?.email) {
        return res.status(400).json({ message: "Usuario no encontrado" });
      }
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1e3);
      await db.insert(contactOtps).values({
        email: user.email,
        otp,
        otpType: "password_change",
        expiresAt: expires,
        verified: false
      });
      await sendEmail({
        to: user.email,
        subject: "C\xF3digo de verificaci\xF3n - Cambio de contrase\xF1a",
        html: getPasswordChangeOtpTemplate(user.firstName || "Cliente", otp)
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Request password OTP error:", error);
      res.status(500).json({ message: "Error al enviar c\xF3digo" });
    }
  });
  app2.post("/api/user/change-password", isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword, otp } = z2.object({
        currentPassword: z2.string().min(1),
        newPassword: z2.string().min(8),
        otp: z2.string().length(6)
      }).parse(req.body);
      const [user] = await db.select().from(users).where(eq7(users.id, req.session.userId));
      if (!user?.email || !user?.passwordHash) {
        return res.status(400).json({ message: "No se puede cambiar la contrase\xF1a" });
      }
      const [otpRecord] = await db.select().from(contactOtps).where(and3(
        eq7(contactOtps.email, user.email),
        eq7(contactOtps.otp, otp),
        eq7(contactOtps.otpType, "password_change"),
        gt2(contactOtps.expiresAt, /* @__PURE__ */ new Date())
      ));
      if (!otpRecord) {
        return res.status(400).json({ message: "C\xF3digo de verificaci\xF3n inv\xE1lido o expirado" });
      }
      await db.delete(contactOtps).where(eq7(contactOtps.id, otpRecord.id));
      const { verifyPassword: verifyPassword2, hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth_service(), auth_service_exports));
      const isValid = await verifyPassword2(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ message: "Contrase\xF1a actual incorrecta" });
      }
      const newHash = await hashPassword2(newPassword);
      await db.update(users).set({ passwordHash: newHash, updatedAt: /* @__PURE__ */ new Date() }).where(eq7(users.id, req.session.userId));
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Datos inv\xE1lidos" });
      }
      console.error("Change password error:", error);
      res.status(500).json({ message: "Error al cambiar contrase\xF1a" });
    }
  });
  app2.post("/api/admin/request-document", isAdmin, async (req, res) => {
    try {
      const { email, documentType, message, userId } = z2.object({
        email: z2.string().email(),
        documentType: z2.string(),
        message: z2.string(),
        userId: z2.string().optional()
      }).parse(req.body);
      const msgId = Math.floor(1e7 + Math.random() * 9e7).toString();
      const docTypeLabels = {
        "passport": "Pasaporte / Documento de Identidad",
        "address_proof": "Comprobante de Domicilio",
        "tax_id": "Identificaci\xF3n Fiscal",
        "other": "Otro Documento"
      };
      const docTypeLabel = docTypeLabels[documentType] || documentType;
      await sendEmail({
        to: email,
        subject: `Acci\xF3n Requerida: Solicitud de Documentaci\xF3n`,
        html: getDocumentRequestTemplate("Cliente", docTypeLabel, message, msgId)
      });
      if (userId) {
        await db.insert(userNotifications).values({
          userId,
          title: "Acci\xF3n Requerida: Subir Documento",
          message: `Se ha solicitado el documento: ${docTypeLabel}. Revisa tu email para m\xE1s detalles.`,
          type: "action_required",
          isRead: false
        });
        const { encrypt: encrypt2 } = await Promise.resolve().then(() => (init_encryption(), encryption_exports));
        await db.insert(messages).values({
          userId,
          name: "Easy US LLC (Soporte)",
          email: "soporte@easyusllc.com",
          subject: `Solicitud de Documento: ${docTypeLabel}`,
          content: message,
          encryptedContent: encrypt2(message),
          type: "support",
          status: "unread",
          messageId: msgId
        });
      }
      res.json({ success: true, messageId: msgId });
    } catch (error) {
      console.error("Request doc error:", error);
      res.status(500).json({ message: "Error al solicitar documento" });
    }
  });
  app2.get(api.orders.list.path, async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const orders3 = await storage.getOrders(req.session.userId);
    res.json(orders3);
  });
  app2.get("/api/orders/:id/invoice", isAuthenticated, async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order || order.userId !== req.session.userId && !req.session.isAdmin) {
        return res.status(403).json({ message: "No autorizado" });
      }
      const [llcApp] = await db.select().from(llcApplications).where(eq7(llcApplications.orderId, orderId)).limit(1);
      const [maintApp] = await db.select().from(maintenanceApplications).where(eq7(maintenanceApplications.orderId, orderId)).limit(1);
      const pdfBuffer = await generateOrderInvoice({
        order: {
          id: order.id,
          invoiceNumber: order.invoiceNumber,
          amount: order.amount,
          originalAmount: order.originalAmount,
          discountCode: order.discountCode,
          discountAmount: order.discountAmount,
          currency: order.currency || "EUR",
          status: order.status,
          createdAt: order.createdAt
        },
        product: {
          name: order.product?.name || "Servicio LLC",
          description: order.product?.description || "",
          features: order.product?.features || []
        },
        user: {
          firstName: order.user?.firstName,
          lastName: order.user?.lastName,
          email: order.user?.email || ""
        },
        application: llcApp || null,
        maintenanceApplication: maintApp || null,
        paymentLink: order.paymentLink || void 0
      });
      const invoiceNumber = llcApp?.requestCode || maintApp?.requestCode || order.invoiceNumber || `INV-${orderId}`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="Factura-${invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Invoice Error:", error);
      res.status(500).send("Error al generar factura");
    }
  });
  app2.post("/api/admin/orders/:id/generate-invoice", isAdmin, async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const [order] = await db.select().from(orders).where(eq7(orders.id, orderId)).limit(1);
      if (!order) {
        return res.status(404).json({ message: "Pedido no encontrado" });
      }
      const updateData = { isInvoiceGenerated: true };
      if (req.body.amount) updateData.amount = req.body.amount;
      if (req.body.currency) updateData.currency = req.body.currency;
      const [updatedOrder] = await db.update(orders).set(updateData).where(eq7(orders.id, orderId)).returning();
      const [llcAppInv] = await db.select().from(llcApplications).where(eq7(llcApplications.orderId, orderId)).limit(1);
      const [maintAppInv] = await db.select().from(maintenanceApplications).where(eq7(maintenanceApplications.orderId, orderId)).limit(1);
      const displayInvoiceNumber = llcAppInv?.requestCode || maintAppInv?.requestCode || order.invoiceNumber;
      const existingDoc = await db.select().from(applicationDocuments).where(and3(eq7(applicationDocuments.orderId, orderId), eq7(applicationDocuments.documentType, "invoice"))).limit(1);
      if (existingDoc.length === 0) {
        await db.insert(applicationDocuments).values({
          orderId,
          fileName: `Factura ${displayInvoiceNumber}`,
          fileType: "application/pdf",
          fileUrl: `/api/orders/${orderId}/invoice`,
          documentType: "invoice",
          reviewStatus: "approved",
          uploadedBy: req.session.userId
        });
      }
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error generating invoice:", error);
      res.status(500).json({ message: "Error generating invoice" });
    }
  });
  app2.post("/api/admin/invoices/create", isAdmin, asyncHandler(async (req, res) => {
    const { userId, concept, amount, currency } = z2.object({
      userId: z2.string(),
      concept: z2.string().min(1),
      amount: z2.number().min(1),
      currency: z2.enum(["EUR", "USD"]).default("EUR")
    }).parse(req.body);
    const currencySymbol = currency === "USD" ? "$" : "\u20AC";
    const [user] = await db.select().from(users).where(eq7(users.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const invoiceNumber = `INV-${(/* @__PURE__ */ new Date()).getFullYear()}-${Date.now().toString().slice(-6)}`;
    const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Factura ${invoiceNumber}</title>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 40px; color: #0E1215; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: 900; color: #0E1215; }
    .logo span { color: #6EDC8A; }
    .invoice-title { font-size: 32px; font-weight: 900; text-align: right; }
    .invoice-number { font-size: 14px; color: #6B7280; text-align: right; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .section-title { font-size: 12px; color: #6B7280; text-transform: uppercase; margin-bottom: 8px; }
    .section-content { font-size: 14px; line-height: 1.6; }
    .items { margin: 40px 0; }
    .items-header { display: grid; grid-template-columns: 3fr 1fr 1fr; padding: 12px 0; border-bottom: 2px solid #0E1215; font-weight: 700; font-size: 12px; text-transform: uppercase; }
    .items-row { display: grid; grid-template-columns: 3fr 1fr 1fr; padding: 16px 0; border-bottom: 1px solid #E6E9EC; font-size: 14px; }
    .total-section { text-align: right; margin-top: 24px; }
    .total-row { font-size: 14px; margin-bottom: 8px; }
    .total-final { font-size: 24px; font-weight: 900; color: #0E1215; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #E6E9EC; font-size: 11px; color: #6B7280; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">EASY<span>US</span></div>
      <p style="font-size: 11px; color: #6B7280;">Fortuny Consulting LLC</p>
    </div>
    <div>
      <div class="invoice-title">FACTURA</div>
      <div class="invoice-number">${invoiceNumber}</div>
      <div class="invoice-number">${(/* @__PURE__ */ new Date()).toLocaleDateString("es-ES")}</div>
    </div>
  </div>
  <div class="details">
    <div>
      <div class="section-title">Facturado a</div>
      <div class="section-content">
        <strong>${user.firstName} ${user.lastName}</strong><br>
        ${user.email}<br>
        ${user.phone || ""}
      </div>
    </div>
    <div>
      <div class="section-title">Emitido por</div>
      <div class="section-content">
        <strong>Fortuny Consulting LLC</strong><br>
        1209 Mountain Road Pl NE Ste R<br>
        Albuquerque, NM 87110
      </div>
    </div>
  </div>
  <div class="items">
    <div class="items-header">
      <span>Concepto</span>
      <span style="text-align:right;">Cantidad</span>
      <span style="text-align:right;">Importe</span>
    </div>
    <div class="items-row">
      <span>${concept}</span>
      <span style="text-align:right;">1</span>
      <span style="text-align:right;">${(amount / 100).toFixed(2)} ${currencySymbol}</span>
    </div>
  </div>
  <div class="total-section">
    <div class="total-row">Subtotal: ${(amount / 100).toFixed(2)} ${currencySymbol}</div>
    <div class="total-row">IVA (0%): 0.00 ${currencySymbol}</div>
    <div class="total-final">Total: ${(amount / 100).toFixed(2)} ${currencySymbol}</div>
  </div>
  <div class="footer">
    <p>Fortuny Consulting LLC - EIN: 99-1877254</p>
    <p>1209 Mountain Road Pl NE Ste R, Albuquerque, NM 87110, USA</p>
    <p>hola@easyusllc.com | www.easyusllc.com</p>
  </div>
</body>
</html>`;
    const [userOrder] = await db.select().from(orders).where(eq7(orders.userId, userId)).limit(1);
    if (userOrder) {
      await db.insert(applicationDocuments).values({
        orderId: userOrder.id,
        fileName: `Factura ${invoiceNumber} - ${concept}`,
        fileType: "text/html",
        fileUrl: `data:text/html;base64,${Buffer.from(invoiceHtml).toString("base64")}`,
        documentType: "invoice",
        reviewStatus: "approved",
        uploadedBy: req.session.userId
      });
    }
    res.json({ success: true, invoiceNumber });
  }));
  app2.post(api.orders.create.path, async (req, res) => {
    try {
      const { productId, email, password, ownerFullName, paymentMethod, discountCode, discountAmount } = req.body;
      const parsedInput = api.orders.create.input.parse({ productId });
      let userId;
      let isNewUser = false;
      if (req.session?.userId) {
        const [currentUser] = await db.select().from(users).where(eq7(users.id, req.session.userId)).limit(1);
        if (currentUser && (currentUser.accountStatus === "pending" || currentUser.accountStatus === "deactivated")) {
          return res.status(403).json({ message: "Tu cuenta est\xE1 en revisi\xF3n o desactivada. No puedes realizar nuevos pedidos en este momento." });
        }
        userId = req.session.userId;
      } else {
        if (!email || !password) {
          return res.status(400).json({ message: "Se requiere email y contrase\xF1a para realizar un pedido." });
        }
        if (password.length < 8) {
          return res.status(400).json({ message: "La contrase\xF1a debe tener al menos 8 caracteres." });
        }
        const [existingUser] = await db.select().from(users).where(eq7(users.email, email)).limit(1);
        if (existingUser) {
          return res.status(400).json({ message: "Este email ya est\xE1 registrado. Por favor inicia sesi\xF3n." });
        }
        const [otpRecord] = await db.select().from(contactOtps).where(
          and3(
            eq7(contactOtps.email, email),
            eq7(contactOtps.otpType, "account_verification"),
            eq7(contactOtps.verified, true),
            gt2(contactOtps.expiresAt, new Date(Date.now() - 30 * 60 * 1e3))
            // Allow 30 min window after verification
          )
        ).orderBy(sql7`${contactOtps.expiresAt} DESC`).limit(1);
        if (!otpRecord) {
          return res.status(400).json({ message: "Por favor verifica tu email antes de continuar." });
        }
        const { hashPassword: hashPassword2, generateUniqueClientId: generateUniqueClientId3 } = await Promise.resolve().then(() => (init_auth_service(), auth_service_exports));
        const passwordHash = await hashPassword2(password);
        const clientId = await generateUniqueClientId3();
        const nameParts = ownerFullName?.split(" ") || ["Cliente"];
        const [newUser] = await db.insert(users).values({
          email,
          passwordHash,
          clientId,
          firstName: nameParts[0] || "Cliente",
          lastName: nameParts.slice(1).join(" ") || "",
          emailVerified: true,
          accountStatus: "active"
        }).returning();
        userId = newUser.id;
        isNewUser = true;
        req.session.userId = userId;
        sendEmail({
          to: email,
          subject: "Bienvenido a Easy US LLC - Acceso a tu panel",
          html: getWelcomeEmailTemplate(nameParts[0] || "Cliente")
        }).catch(console.error);
      }
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(400).json({ message: "Invalid product" });
      }
      let finalPrice = product.price;
      if (product.name.includes("New Mexico")) finalPrice = 73900;
      else if (product.name.includes("Wyoming")) finalPrice = 89900;
      else if (product.name.includes("Delaware")) finalPrice = 119900;
      let originalAmount = finalPrice;
      let appliedDiscountAmount = 0;
      let appliedDiscountCode = null;
      if (discountCode && discountAmount) {
        appliedDiscountCode = discountCode;
        appliedDiscountAmount = discountAmount;
        finalPrice = Math.max(0, finalPrice - discountAmount);
        await db.update(discountCodes).set({ usedCount: sql7`${discountCodes.usedCount} + 1` }).where(eq7(discountCodes.code, discountCode.toUpperCase()));
      }
      const order = await storage.createOrder({
        userId,
        productId,
        amount: finalPrice,
        originalAmount: appliedDiscountCode ? originalAmount : null,
        discountCode: appliedDiscountCode,
        discountAmount: appliedDiscountAmount || null,
        status: "pending",
        stripeSessionId: "mock_session_" + Date.now()
      });
      await db.insert(orderEvents).values({
        orderId: order.id,
        eventType: "Pedido Recibido",
        description: `Se ha registrado un nuevo pedido para ${product.name}.`,
        createdBy: userId
      });
      const application = await storage.createLlcApplication({
        orderId: order.id,
        status: "draft",
        state: product.name.split(" ")[0]
        // Extract state name correctly
      });
      if (userId && !userId.startsWith("guest_")) {
        await db.insert(userNotifications).values({
          userId,
          orderId: order.id,
          orderCode: application.requestCode || order.invoiceNumber,
          title: "Nuevo pedido registrado",
          message: `Tu pedido de ${product.name} ha sido registrado correctamente. Te mantendremos informado del progreso.`,
          type: "info",
          isRead: false
        });
      }
      const { generateUniqueOrderCode: generateUniqueOrderCode2 } = await Promise.resolve().then(() => (init_id_generator(), id_generator_exports));
      const appState = product.name.split(" ")[0] || "New Mexico";
      const requestCode = await generateUniqueOrderCode2(appState);
      const updatedApplication = await storage.updateLlcApplication(application.id, { requestCode });
      logActivity2("Nuevo Pedido Recibido", {
        "Referencia": requestCode,
        "Producto": product.name,
        "Importe": `${(finalPrice / 100).toFixed(2)}\u20AC`,
        "Usuario": userId,
        "IP": req.ip
      });
      res.status(201).json({ ...order, application: updatedApplication });
    } catch (err) {
      if (err instanceof z2.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Error creating order:", err);
      return res.status(500).json({ message: "Error creating order" });
    }
  });
  app2.get("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const userMessages = await storage.getMessagesByUserId(req.session.userId);
      res.json(userMessages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });
  app2.post("/api/messages", async (req, res) => {
    try {
      const { name, email, phone, contactByWhatsapp, subject, content, requestCode } = req.body;
      const userId = req.session?.userId || null;
      if (userId) {
        const [currentUser] = await db.select().from(users).where(eq7(users.id, userId)).limit(1);
        if (currentUser?.accountStatus === "deactivated") {
          return res.status(403).json({ message: "Tu cuenta est\xE1 suspendida. No puedes enviar mensajes." });
        }
      }
      const message = await storage.createMessage({
        userId,
        name,
        email,
        phone: phone || null,
        contactByWhatsapp: contactByWhatsapp || false,
        subject,
        content,
        requestCode,
        type: "contact"
      });
      const ticketId = message.messageId || String(message.id);
      sendEmail({
        to: email,
        subject: `Recibimos tu mensaje - Ticket #${ticketId}`,
        html: getAutoReplyTemplate(ticketId, name || "Cliente")
      }).catch(() => {
      });
      logActivity2("Nuevo Mensaje de Contacto", {
        "Nombre": name,
        "Email": email,
        "Tel\xE9fono": phone || "No proporcionado",
        "WhatsApp": contactByWhatsapp ? "S\xED" : "No",
        "Asunto": subject,
        "Mensaje": content,
        "Referencia": requestCode || "N/A"
      });
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Error sending message" });
    }
  });
  app2.post("/api/llc/claim-order", async (req, res) => {
    try {
      const { applicationId, email, password, ownerFullName, paymentMethod } = req.body;
      if (!applicationId || !email || !password) {
        return res.status(400).json({ message: "Se requiere email y contrase\xF1a." });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "La contrase\xF1a debe tener al menos 8 caracteres." });
      }
      const [existingUser] = await db.select().from(users).where(eq7(users.email, email)).limit(1);
      if (existingUser) {
        return res.status(400).json({ message: "Este email ya est\xE1 registrado. Por favor inicia sesi\xF3n." });
      }
      const [otpRecord] = await db.select().from(contactOtps).where(
        and3(
          eq7(contactOtps.email, email),
          eq7(contactOtps.otpType, "account_verification"),
          eq7(contactOtps.verified, true),
          gt2(contactOtps.expiresAt, new Date(Date.now() - 30 * 60 * 1e3))
        )
      ).orderBy(sql7`${contactOtps.expiresAt} DESC`).limit(1);
      if (!otpRecord) {
        return res.status(400).json({ message: "Por favor verifica tu email antes de continuar." });
      }
      const application = await storage.getLlcApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Solicitud no encontrada." });
      }
      const { hashPassword: hashPassword2, generateUniqueClientId: generateUniqueClientId3 } = await Promise.resolve().then(() => (init_auth_service(), auth_service_exports));
      const passwordHash = await hashPassword2(password);
      const clientId = await generateUniqueClientId3();
      const nameParts = ownerFullName?.split(" ") || ["Cliente"];
      const [newUser] = await db.insert(users).values({
        email,
        passwordHash,
        clientId,
        firstName: nameParts[0] || "Cliente",
        lastName: nameParts.slice(1).join(" ") || "",
        phone: application.ownerPhone || null,
        streetType: application.ownerStreetType || null,
        address: application.ownerAddress || null,
        city: application.ownerCity || null,
        province: application.ownerProvince || null,
        postalCode: application.ownerPostalCode || null,
        country: application.ownerCountry || null,
        birthDate: application.ownerBirthDate || null,
        businessActivity: application.businessActivity || null,
        emailVerified: true,
        accountStatus: "active"
      }).returning();
      await db.update(orders).set({ userId: newUser.id }).where(eq7(orders.id, application.orderId));
      if (paymentMethod) {
        await storage.updateLlcApplication(applicationId, { paymentMethod });
      }
      req.session.userId = newUser.id;
      sendEmail({
        to: email,
        subject: "Bienvenido a Easy US LLC - Acceso a tu panel",
        html: getWelcomeEmailTemplate(nameParts[0] || "Cliente")
      }).catch(console.error);
      res.json({ success: true, userId: newUser.id });
    } catch (error) {
      console.error("Error claiming order:", error);
      res.status(500).json({ message: "Error al crear la cuenta." });
    }
  });
  app2.post("/api/maintenance/claim-order", async (req, res) => {
    try {
      const { applicationId, email, password, ownerFullName, paymentMethod } = req.body;
      if (!applicationId || !email || !password) {
        return res.status(400).json({ message: "Se requiere email y contrase\xF1a." });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "La contrase\xF1a debe tener al menos 8 caracteres." });
      }
      const [existingUser] = await db.select().from(users).where(eq7(users.email, email)).limit(1);
      if (existingUser) {
        return res.status(400).json({ message: "Este email ya est\xE1 registrado. Por favor inicia sesi\xF3n." });
      }
      const [otpRecord] = await db.select().from(contactOtps).where(
        and3(
          eq7(contactOtps.email, email),
          eq7(contactOtps.otpType, "account_verification"),
          eq7(contactOtps.verified, true),
          gt2(contactOtps.expiresAt, new Date(Date.now() - 30 * 60 * 1e3))
        )
      ).orderBy(sql7`${contactOtps.expiresAt} DESC`).limit(1);
      if (!otpRecord) {
        return res.status(400).json({ message: "Por favor verifica tu email antes de continuar." });
      }
      const [application] = await db.select().from(maintenanceApplications).where(eq7(maintenanceApplications.id, applicationId)).limit(1);
      if (!application) {
        return res.status(404).json({ message: "Solicitud no encontrada." });
      }
      const { hashPassword: hashPassword2, generateUniqueClientId: generateUniqueClientId3 } = await Promise.resolve().then(() => (init_auth_service(), auth_service_exports));
      const passwordHash = await hashPassword2(password);
      const clientId = await generateUniqueClientId3();
      const nameParts = ownerFullName?.split(" ") || ["Cliente"];
      const [newUser] = await db.insert(users).values({
        email,
        passwordHash,
        clientId,
        firstName: nameParts[0] || "Cliente",
        lastName: nameParts.slice(1).join(" ") || "",
        emailVerified: true,
        accountStatus: "active"
      }).returning();
      await db.update(orders).set({ userId: newUser.id }).where(eq7(orders.id, application.orderId));
      if (paymentMethod) {
        await db.update(maintenanceApplications).set({ paymentMethod }).where(eq7(maintenanceApplications.id, applicationId));
      }
      req.session.userId = newUser.id;
      sendEmail({
        to: email,
        subject: "Bienvenido a Easy US LLC - Acceso a tu panel",
        html: getWelcomeEmailTemplate(nameParts[0] || "Cliente")
      }).catch(console.error);
      res.json({ success: true, userId: newUser.id });
    } catch (error) {
      console.error("Error claiming maintenance order:", error);
      res.status(500).json({ message: "Error al crear la cuenta." });
    }
  });
  app2.patch("/api/llc/:id/data", isAuthenticated, async (req, res) => {
    try {
      const appId = Number(req.params.id);
      const updates = req.body;
      const [updated] = await db.update(llcApplications).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq7(llcApplications.id, appId)).returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error updating application" });
    }
  });
  app2.get(api.llc.get.path, async (req, res) => {
    const appId = Number(req.params.id);
    const application = await storage.getLlcApplication(appId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(application);
  });
  app2.put(api.llc.update.path, async (req, res) => {
    try {
      const appId = Number(req.params.id);
      const updates = api.llc.update.input.parse(req.body);
      const application = await storage.getLlcApplication(appId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      const updatedApp = await storage.updateLlcApplication(appId, updates);
      if (updates.status === "submitted" && updatedApp.ownerEmail) {
        const orderIdentifier = updatedApp.requestCode || `#${updatedApp.id}`;
        const [order] = await db.select().from(orders).where(eq7(orders.id, updatedApp.orderId)).limit(1);
        const orderAmount = order ? (order.amount / 100).toFixed(2) : "N/A";
        const adminEmail = process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
        const paymentMethodLabel = updatedApp.paymentMethod === "transfer" ? "Transferencia Bancaria" : updatedApp.paymentMethod === "link" ? "Link de Pago" : "No especificado";
        sendEmail({
          to: adminEmail,
          subject: `[PEDIDO REALIZADO] ${orderIdentifier} - ${updatedApp.companyName}`,
          html: getAdminLLCOrderTemplate({
            orderIdentifier,
            amount: orderAmount,
            paymentMethod: paymentMethodLabel,
            ownerFullName: updatedApp.ownerFullName || void 0,
            ownerEmail: updatedApp.ownerEmail || void 0,
            ownerPhone: updatedApp.ownerPhone || void 0,
            ownerBirthDate: updatedApp.ownerBirthDate || void 0,
            ownerIdType: updatedApp.ownerIdType || void 0,
            ownerIdNumber: updatedApp.ownerIdNumber || void 0,
            ownerAddress: `${updatedApp.ownerStreetType || ""} ${updatedApp.ownerAddress || ""}`.trim() || void 0,
            ownerCity: updatedApp.ownerCity || void 0,
            ownerProvince: updatedApp.ownerProvince || void 0,
            ownerPostalCode: updatedApp.ownerPostalCode || void 0,
            ownerCountry: updatedApp.ownerCountry || void 0,
            companyName: updatedApp.companyName || void 0,
            companyNameOption2: updatedApp.companyNameOption2 || void 0,
            designator: updatedApp.designator || void 0,
            state: updatedApp.state || void 0,
            businessCategory: updatedApp.businessCategory === "Otra (especificar)" ? updatedApp.businessCategoryOther || void 0 : updatedApp.businessCategory || void 0,
            businessActivity: updatedApp.businessActivity || void 0,
            companyDescription: updatedApp.companyDescription || void 0,
            isSellingOnline: updatedApp.isSellingOnline || void 0,
            needsBankAccount: updatedApp.needsBankAccount || void 0,
            willUseStripe: updatedApp.willUseStripe || void 0,
            wantsBoiReport: updatedApp.wantsBoiReport || void 0,
            wantsMaintenancePack: updatedApp.wantsMaintenancePack || void 0,
            notes: updatedApp.notes || void 0
          })
        }).catch(() => {
        });
        sendEmail({
          to: updatedApp.ownerEmail,
          subject: `Solicitud recibida - Referencia ${orderIdentifier}`,
          html: getConfirmationEmailTemplate(updatedApp.ownerFullName || "Cliente", orderIdentifier, { companyName: updatedApp.companyName || void 0 })
        }).catch(() => {
        });
      }
      res.json(updatedApp);
    } catch (err) {
      if (err instanceof z2.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Error updating LLC application:", err);
      res.status(500).json({ message: "Error updating request" });
    }
  });
  app2.get(api.llc.getByCode.path, async (req, res) => {
    const code = req.params.code;
    const application = await storage.getLlcApplicationByRequestCode(code);
    if (!application) {
      return res.status(404).json({ message: "Solicitud no encontrada. Verifica el c\xF3digo ingresado." });
    }
    res.json(application);
  });
  app2.post(api.documents.create.path, async (req, res) => {
    try {
      const docData = api.documents.create.input.parse(req.body);
      if (docData.applicationId) {
        const application = await storage.getLlcApplication(docData.applicationId);
        if (!application) {
          return res.status(404).json({ message: "Application not found" });
        }
      }
      const document = await storage.createDocument(docData);
      res.status(201).json(document);
    } catch (err) {
      if (err instanceof z2.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  app2.patch("/api/admin/documents/:id/review", isAdmin, async (req, res) => {
    try {
      const docId = Number(req.params.id);
      const { reviewStatus } = z2.object({ reviewStatus: z2.enum(["pending", "approved", "rejected", "action_required"]) }).parse(req.body);
      const [updated] = await db.update(applicationDocuments).set({ reviewStatus }).where(eq7(applicationDocuments.id, docId)).returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error updating document review status" });
    }
  });
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  app2.post("/api/user/documents/upload", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "No autorizado" });
      }
      const userOrders = await storage.getOrders(userId);
      if (!userOrders.length) {
        return res.status(400).json({ message: "No tienes pedidos activos" });
      }
      const busboy = (await import("busboy")).default;
      const bb = busboy({
        headers: req.headers,
        limits: { fileSize: MAX_FILE_SIZE_BYTES }
      });
      let fileName = "";
      let fileBuffer = null;
      let fileTruncated = false;
      let documentType = "passport";
      let notes = "";
      bb.on("field", (name, val) => {
        if (name === "documentType") documentType = val;
        if (name === "notes") notes = val;
      });
      bb.on("file", (name, file, info) => {
        fileName = info.filename || `documento_${Date.now()}`;
        const chunks = [];
        file.on("data", (data) => chunks.push(data));
        file.on("limit", () => {
          fileTruncated = true;
        });
        file.on("end", () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });
      bb.on("finish", async () => {
        if (fileTruncated) {
          return res.status(413).json({ message: `El archivo excede el l\xEDmite de ${MAX_FILE_SIZE_MB}MB` });
        }
        if (!fileBuffer) {
          return res.status(400).json({ message: "No se recibi\xF3 ning\xFAn archivo" });
        }
        const fs5 = await import("fs/promises");
        const path7 = await import("path");
        const uploadDir = path7.join(process.cwd(), "uploads", "client-docs");
        await fs5.mkdir(uploadDir, { recursive: true });
        const safeFileName = `${userId}_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const filePath = path7.join(uploadDir, safeFileName);
        await fs5.writeFile(filePath, fileBuffer);
        const { generateUniqueMessageId: generateUniqueMessageId2 } = await Promise.resolve().then(() => (init_id_generator(), id_generator_exports));
        const ticketId = await generateUniqueMessageId2();
        const docTypeLabelsUpload = {
          "passport": "Pasaporte / Documento de Identidad",
          "address_proof": "Comprobante de Domicilio",
          "tax_id": "Identificaci\xF3n Fiscal",
          "other": "Otro Documento"
        };
        const docTypeLabel = docTypeLabelsUpload[documentType] || documentType;
        const doc = await db.insert(applicationDocuments).values({
          orderId: userOrders[0].id,
          fileName,
          fileType: fileName.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
          fileUrl: `/uploads/client-docs/${safeFileName}`,
          documentType,
          reviewStatus: "pending",
          uploadedBy: userId
        }).returning();
        const userData = await db.select().from(users).where(eq7(users.id, userId)).limit(1);
        const user = userData[0];
        if (user) {
          const { encrypt: encrypt2 } = await Promise.resolve().then(() => (init_encryption(), encryption_exports));
          const notesText = documentType === "other" && notes ? `

Notas del cliente: ${notes}` : "";
          const messageContent = `El cliente ha subido un nuevo documento.

Tipo: ${docTypeLabel}
Archivo: ${fileName}${notesText}

Archivo disponible en: ${doc[0].fileUrl}`;
          await db.insert(messages).values({
            userId,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Cliente",
            email: user.email || "sin-email@cliente.com",
            subject: `Documento Recibido: ${docTypeLabel}`,
            content: messageContent,
            encryptedContent: encrypt2(messageContent),
            type: "support",
            status: "unread",
            messageId: ticketId
          });
        }
        res.json({ success: true, document: doc[0], ticketId });
      });
      req.pipe(bb);
    } catch (error) {
      console.error("Client upload error:", error);
      res.status(500).json({ message: "Error al subir documento" });
    }
  });
  app2.delete("/api/admin/documents/:id", isAdmin, async (req, res) => {
    try {
      const docId = Number(req.params.id);
      await db.delete(applicationDocuments).where(eq7(applicationDocuments.id, docId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting document" });
    }
  });
  app2.post("/api/llc/:id/pay", async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      const application = await storage.getLlcApplication(appId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      if (application.orderId) {
        await storage.updateOrderStatus(application.orderId, "paid");
      }
      await storage.updateLlcApplication(appId, { status: "submitted", paymentStatus: "paid" });
      res.json({ success: true, message: "Payment successful" });
    } catch (error) {
      console.error("Payment error:", error);
      res.status(500).json({ message: "Payment processing failed" });
    }
  });
  app2.post("/api/maintenance/orders", async (req, res) => {
    try {
      const { productId, state, email, password, ownerFullName, paymentMethod, discountCode, discountAmount } = req.body;
      let userId;
      let isNewUser = false;
      if (req.session?.userId) {
        const [currentUser] = await db.select().from(users).where(eq7(users.id, req.session.userId)).limit(1);
        if (currentUser && (currentUser.accountStatus === "pending" || currentUser.accountStatus === "deactivated")) {
          return res.status(403).json({ message: "Tu cuenta est\xE1 en revisi\xF3n o desactivada. No puedes realizar nuevos pedidos en este momento." });
        }
        userId = req.session.userId;
      } else {
        if (!email || !password) {
          return res.status(400).json({ message: "Se requiere email y contrase\xF1a para realizar un pedido." });
        }
        if (password.length < 8) {
          return res.status(400).json({ message: "La contrase\xF1a debe tener al menos 8 caracteres." });
        }
        const [existingUser] = await db.select().from(users).where(eq7(users.email, email)).limit(1);
        if (existingUser) {
          return res.status(400).json({ message: "Este email ya est\xE1 registrado. Por favor inicia sesi\xF3n." });
        }
        const { hashPassword: hashPassword2, generateUniqueClientId: generateUniqueClientId3 } = await Promise.resolve().then(() => (init_auth_service(), auth_service_exports));
        const passwordHash = await hashPassword2(password);
        const clientId = await generateUniqueClientId3();
        const nameParts = ownerFullName?.split(" ") || ["Cliente"];
        const [newUser] = await db.insert(users).values({
          email,
          passwordHash,
          clientId,
          firstName: nameParts[0] || "Cliente",
          lastName: nameParts.slice(1).join(" ") || "",
          emailVerified: true,
          accountStatus: "active"
        }).returning();
        userId = newUser.id;
        isNewUser = true;
        req.session.userId = userId;
        sendEmail({
          to: email,
          subject: "Bienvenido a Easy US LLC - Acceso a tu panel",
          html: getWelcomeEmailTemplate(nameParts[0] || "Cliente")
        }).catch(console.error);
      }
      const product = await storage.getProduct(productId);
      if (!product) return res.status(400).json({ message: "Invalid product" });
      let finalPrice = product.price;
      if (state?.includes("New Mexico")) finalPrice = 53900;
      else if (state?.includes("Wyoming")) finalPrice = 69900;
      else if (state?.includes("Delaware")) finalPrice = 89900;
      let originalAmount = finalPrice;
      let appliedDiscountAmount = 0;
      let appliedDiscountCode = null;
      if (discountCode && discountAmount) {
        appliedDiscountCode = discountCode;
        appliedDiscountAmount = discountAmount;
        finalPrice = Math.max(0, finalPrice - discountAmount);
        await db.update(discountCodes).set({ usedCount: sql7`${discountCodes.usedCount} + 1` }).where(eq7(discountCodes.code, discountCode.toUpperCase()));
      }
      const order = await storage.createOrder({
        userId,
        productId,
        amount: finalPrice,
        originalAmount: appliedDiscountCode ? originalAmount : null,
        discountCode: appliedDiscountCode,
        discountAmount: appliedDiscountAmount || null,
        status: "pending",
        stripeSessionId: "mock_session_maint_" + Date.now()
      });
      const [application] = await db.insert(maintenanceApplications).values({
        orderId: order.id,
        status: "draft",
        state: state || product.name.split(" ")[0]
      }).returning();
      const { generateUniqueOrderCode: generateUniqueOrderCode2 } = await Promise.resolve().then(() => (init_id_generator(), id_generator_exports));
      const appState = state || product.name.split(" ")[0] || "New Mexico";
      const requestCode = await generateUniqueOrderCode2(appState);
      await db.update(maintenanceApplications).set({ requestCode }).where(eq7(maintenanceApplications.id, application.id));
      if (userId && !userId.startsWith("guest_")) {
        await db.insert(userNotifications).values({
          userId,
          orderId: order.id,
          orderCode: requestCode,
          title: "Nuevo pedido de mantenimiento",
          message: `Tu pedido de mantenimiento anual (${requestCode}) ha sido registrado. Te mantendremos informado del progreso.`,
          type: "info",
          isRead: false
        });
      }
      res.status(201).json({ ...order, application: { ...application, requestCode } });
    } catch (err) {
      console.error("Error creating maintenance order:", err);
      res.status(500).json({ message: "Error creating maintenance order" });
    }
  });
  app2.put("/api/maintenance/:id", async (req, res) => {
    try {
      const appId = Number(req.params.id);
      const updates = req.body;
      const [updatedApp] = await db.update(maintenanceApplications).set({ ...updates, lastUpdated: /* @__PURE__ */ new Date() }).where(eq7(maintenanceApplications.id, appId)).returning();
      if (!updatedApp) {
        return res.status(404).json({ message: "Solicitud no encontrada" });
      }
      if (updates.status === "submitted") {
        const orderIdentifier = updatedApp.requestCode || `MN-${updatedApp.id}`;
        const [order] = await db.select().from(orders).where(eq7(orders.id, updatedApp.orderId)).limit(1);
        const orderAmount = order ? (order.amount / 100).toFixed(2) : "N/A";
        const adminEmail = process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
        const maintPaymentMethodLabel = updatedApp.paymentMethod === "transfer" ? "Transferencia Bancaria" : updatedApp.paymentMethod === "link" ? "Link de Pago" : "No especificado";
        sendEmail({
          to: adminEmail,
          subject: `[PEDIDO REALIZADO] ${orderIdentifier} - Mantenimiento ${updatedApp.companyName}`,
          html: getAdminMaintenanceOrderTemplate({
            orderIdentifier,
            amount: orderAmount,
            paymentMethod: maintPaymentMethodLabel,
            ownerFullName: updatedApp.ownerFullName || void 0,
            ownerEmail: updatedApp.ownerEmail || void 0,
            ownerPhone: updatedApp.ownerPhone || void 0,
            companyName: updatedApp.companyName || void 0,
            ein: updatedApp.ein || void 0,
            state: updatedApp.state || void 0,
            creationSource: updatedApp.creationSource || void 0,
            creationYear: updatedApp.creationYear || void 0,
            bankAccount: updatedApp.bankAccount || void 0,
            paymentGateway: updatedApp.paymentGateway || void 0,
            businessActivity: updatedApp.businessActivity || void 0,
            expectedServices: updatedApp.expectedServices || void 0,
            wantsDissolve: updatedApp.wantsDissolve || void 0,
            notes: updatedApp.notes || void 0
          })
        }).catch(() => {
        });
        if (updatedApp.ownerEmail) {
          sendEmail({
            to: updatedApp.ownerEmail,
            subject: `Solicitud recibida - Referencia ${orderIdentifier}`,
            html: getConfirmationEmailTemplate(updatedApp.ownerFullName || "Cliente", orderIdentifier, { companyName: updatedApp.companyName || void 0, serviceType: "Mantenimiento Anual" })
          }).catch(() => {
          });
        }
      }
      res.json(updatedApp);
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar la solicitud" });
    }
  });
  app2.get("/api/newsletter/status", isAuthenticated, async (req, res) => {
    const isSubscribed = await storage.isSubscribedToNewsletter(req.session.email);
    res.json({ isSubscribed });
  });
  app2.post("/api/newsletter/unsubscribe", isAuthenticated, async (req, res) => {
    await db.delete(newsletterSubscribers).where(eq7(newsletterSubscribers.email, req.session.email));
    res.json({ success: true });
  });
  app2.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = z2.object({ email: z2.string().email().optional() }).parse(req.body);
      const targetEmail = email || req.session?.email || null;
      if (!targetEmail) {
        return res.status(400).json({ message: "Se requiere un email" });
      }
      const isSubscribed = await storage.isSubscribedToNewsletter(targetEmail);
      if (isSubscribed) {
        return res.json({ success: true, message: "Ya est\xE1s suscrito" });
      }
      await storage.subscribeToNewsletter(targetEmail);
      const [user] = await db.select().from(users).where(eq7(users.email, targetEmail)).limit(1);
      if (user) {
        await db.insert(userNotifications).values({
          userId: user.id,
          title: "Suscripci\xF3n confirmada",
          message: "Te has suscrito correctamente a nuestra newsletter. Recibir\xE1s las \xFAltimas noticias y ofertas.",
          type: "info",
          isRead: false
        });
      }
      await sendEmail({
        to: targetEmail,
        subject: "Confirmaci\xF3n de suscripci\xF3n a Easy US LLC",
        html: getNewsletterWelcomeTemplate()
      }).catch(() => {
      });
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z2.ZodError) {
        return res.status(400).json({ message: "Email inv\xE1lido" });
      }
      res.status(500).json({ message: "Error al suscribirse" });
    }
  });
  app2.get("/api/admin/invoice/:id", isAdmin, async (req, res) => {
    const orderId = Number(req.params.id);
    const order = await storage.getOrder(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.setHeader("Content-Type", "text/html");
    res.send(generateInvoiceHtml(order));
  });
  app2.get("/api/orders/:id/receipt", isAuthenticated, async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
      if (order.userId !== req.session.userId && !req.session.isAdmin) {
        return res.status(403).json({ message: "Acceso denegado" });
      }
      const [llcApp] = await db.select().from(llcApplications).where(eq7(llcApplications.orderId, orderId)).limit(1);
      const [maintApp] = await db.select().from(maintenanceApplications).where(eq7(maintenanceApplications.orderId, orderId)).limit(1);
      const requestCode = llcApp?.requestCode || maintApp?.requestCode || order.invoiceNumber || "";
      const pdfBuffer = await generateOrderReceipt({
        order: {
          id: order.id,
          invoiceNumber: order.invoiceNumber,
          amount: order.amount,
          currency: order.currency || "EUR",
          status: order.status,
          createdAt: order.createdAt
        },
        product: {
          name: order.product?.name || (maintApp ? "Mantenimiento LLC" : "Formaci\xF3n LLC"),
          description: order.product?.description || "",
          features: order.product?.features || []
        },
        user: {
          firstName: order.user?.firstName,
          lastName: order.user?.lastName,
          email: order.user?.email || ""
        },
        application: llcApp || null,
        maintenanceApplication: maintApp || null
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="Recibo-${requestCode}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Receipt Error:", error);
      res.status(500).send("Error al generar recibo");
    }
  });
  app2.get("/api/orders/:id/events", isAuthenticated, async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
      if (order.userId !== req.session.userId && !req.session.isAdmin) {
        return res.status(403).json({ message: "Acceso denegado" });
      }
      const events = await db.select().from(orderEvents).where(eq7(orderEvents.orderId, orderId)).orderBy(desc2(orderEvents.createdAt));
      res.json(events);
    } catch (error) {
      console.error("Error fetching order events:", error);
      res.status(500).json({ message: "Error al obtener eventos" });
    }
  });
  app2.post("/api/admin/orders/:id/events", isAdmin, async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const { eventType, description } = req.body;
      const [event] = await db.insert(orderEvents).values({
        orderId,
        eventType,
        description,
        createdBy: req.session.userId
      }).returning();
      const order = await storage.getOrder(orderId);
      if (order) {
        const [user] = await db.select().from(users).where(eq7(users.id, order.userId)).limit(1);
        if (user?.email) {
          sendEmail({
            to: user.email,
            subject: "Actualizaci\xF3n de tu pedido",
            html: getOrderEventTemplate(user.firstName || "Cliente", String(orderId), eventType, description)
          }).catch(() => {
          });
        }
      }
      res.json(event);
    } catch (error) {
      console.error("Error creating order event:", error);
      res.status(500).json({ message: "Error al crear evento" });
    }
  });
  app2.get("/api/messages/:id/replies", isAuthenticated, async (req, res) => {
    try {
      const messageId = Number(req.params.id);
      const replies = await db.select().from(messageReplies).where(eq7(messageReplies.messageId, messageId)).orderBy(messageReplies.createdAt);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching message replies:", error);
      res.status(500).json({ message: "Error al obtener respuestas" });
    }
  });
  app2.post("/api/messages/:id/reply", isAuthenticated, async (req, res) => {
    try {
      const messageId = Number(req.params.id);
      const { content } = req.body;
      if (!content || typeof content !== "string" || !content.trim()) {
        return res.status(400).json({ message: "El contenido de la respuesta es requerido" });
      }
      const [reply] = await db.insert(messageReplies).values({
        messageId,
        content,
        isAdmin: req.session.isAdmin || false,
        createdBy: req.session.userId
      }).returning();
      const [message] = await db.select().from(messages).where(eq7(messages.id, messageId)).limit(1);
      if (message?.email && req.session.isAdmin) {
        const ticketId = message.messageId || String(messageId);
        sendEmail({
          to: message.email,
          subject: `Nueva respuesta a tu consulta - Ticket #${ticketId}`,
          html: getMessageReplyTemplate(message.name?.split(" ")[0] || "Cliente", content, ticketId)
        }).catch(() => {
        });
        if (message.userId) {
          await db.insert(userNotifications).values({
            userId: message.userId,
            title: "Nueva respuesta a tu consulta",
            message: `Hemos respondido a tu mensaje (Ticket: #${ticketId}). Revisa tu email o tu \xE1rea de mensajes.`,
            type: "info",
            isRead: false
          });
        }
      }
      res.json(reply);
    } catch (error) {
      console.error("Error creating reply:", error);
      res.status(500).json({ message: "Error al crear respuesta" });
    }
  });
  function generateInvoiceHtml(order) {
    const requestCode = order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber;
    const userName = order.user ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() : "Cliente";
    const userEmail = order.user?.email || "";
    const userPhone = order.user?.phone || "";
    const userClientId = order.user?.clientId || "";
    const userAddress = order.user ? [
      order.user.streetType,
      order.user.address,
      order.user.city,
      order.user.province,
      order.user.postalCode,
      order.user.country
    ].filter(Boolean).join(", ") : "";
    const userIdNumber = order.user?.idNumber ? `${order.user.idType?.toUpperCase() || "ID"}: ${order.user.idNumber}` : "";
    const productName = order.product?.name || "Servicio de Constituci\xF3n LLC";
    const invoiceNumber = requestCode || order.invoiceNumber;
    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Factura ${invoiceNumber}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
          <style>
            @media print { 
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } 
              .no-print { display: none !important; }
              @page { margin: 1cm; }
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; color: #0E1215; line-height: 1.6; background: #fff; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 3px solid #6EDC8A; }
            .logo-section h1 { font-size: 28px; font-weight: 900; letter-spacing: -0.02em; }
            .logo-section .subtitle { color: #6B7280; font-size: 13px; margin-top: 4px; }
            .invoice-info { text-align: right; }
            .invoice-badge { background: linear-gradient(135deg, #6EDC8A 0%, #4eca70 100%); color: #0E1215; padding: 10px 20px; border-radius: 100px; font-weight: 900; font-size: 13px; display: inline-block; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
            .invoice-number { font-size: 20px; font-weight: 800; color: #0E1215; }
            .invoice-date { font-size: 13px; color: #6B7280; margin-top: 4px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-bottom: 50px; }
            .detail-box { background: #F7F7F5; padding: 25px; border-radius: 16px; }
            .detail-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6EDC8A; margin-bottom: 12px; letter-spacing: 0.08em; }
            .detail-content p { font-size: 14px; margin-bottom: 4px; }
            .detail-content strong { font-weight: 700; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .items-table thead th { text-align: left; padding: 16px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #6B7280; border-bottom: 2px solid #E6E9EC; }
            .items-table thead th:last-child { text-align: right; }
            .items-table tbody td { padding: 20px 12px; font-size: 15px; border-bottom: 1px solid #F7F7F5; }
            .items-table tbody td:last-child { text-align: right; font-weight: 600; }
            .totals-section { display: flex; justify-content: flex-end; margin-bottom: 50px; }
            .totals-box { background: linear-gradient(135deg, #F7F7F5 0%, #E6E9EC 100%); padding: 30px; border-radius: 20px; min-width: 280px; }
            .totals-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
            .totals-row.final { border-top: 2px solid #0E1215; padding-top: 15px; margin-top: 15px; margin-bottom: 0; }
            .totals-row.final .label { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280; }
            .totals-row.final .amount { font-size: 28px; font-weight: 900; color: #0E1215; }
            .footer { text-align: center; padding-top: 30px; border-top: 1px solid #E6E9EC; font-size: 12px; color: #6B7280; }
            .footer p { margin-bottom: 4px; }
            .print-controls { text-align: center; margin-bottom: 30px; }
            .print-btn { background: #6EDC8A; color: #0E1215; padding: 14px 35px; border: none; border-radius: 100px; font-weight: 800; cursor: pointer; font-size: 14px; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 15px rgba(110, 220, 138, 0.3); }
            .print-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(110, 220, 138, 0.4); }
          </style>
        </head>
        <body>
          <div class="print-controls no-print">
            <button class="print-btn" onclick="window.print()">Imprimir / Descargar PDF</button>
          </div>
          
          <div class="header">
            <div class="logo-section">
              <img src="https://easyusllc.com/logo-icon.png" alt="Easy US LLC" style="width: 60px; height: 60px; margin-bottom: 10px; border-radius: 12px;">
              <h1>Easy US LLC</h1>
              <p class="subtitle">Servicios de Constituci\xF3n Empresarial</p>
            </div>
            <div class="invoice-info">
              <div class="invoice-badge">Factura</div>
              <div class="invoice-number">${invoiceNumber}</div>
              <div class="invoice-date">Fecha: ${new Date(order.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}</div>
            </div>
          </div>
          
          <div class="details-grid">
            <div class="detail-box">
              <div class="detail-label">Datos del Emisor</div>
              <div class="detail-content">
                <p><strong>EASY US LLC</strong></p>
                <p>FORTUNY CONSULTING LLC</p>
                <p>1209 Mountain Road Place NE, STE R</p>
                <p>Albuquerque, NM 87110, USA</p>
                <p style="margin-top: 10px;">hola@easyusllc.com</p>
                <p>+34 614 91 69 10</p>
              </div>
            </div>
            <div class="detail-box">
              <div class="detail-label">Datos del Cliente</div>
              <div class="detail-content">
                <p><strong>${userName}</strong></p>
                ${userClientId ? `<p style="font-size: 12px; color: #6B7280;"><strong>ID Cliente:</strong> ${userClientId}</p>` : ""}
                ${userIdNumber ? `<p>${userIdNumber}</p>` : ""}
                <p>${userEmail}</p>
                ${userPhone ? `<p>${userPhone}</p>` : ""}
                ${userAddress ? `<p style="margin-top: 6px;">${userAddress}</p>` : ""}
                <p style="margin-top: 10px;"><strong>Ref. Pedido:</strong> ${requestCode}</p>
              </div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Descripci\xF3n del Servicio</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${productName}</strong><br><span style="color: #6B7280; font-size: 13px;">Servicio completo de constituci\xF3n empresarial en USA</span></td>
                <td>${((order.originalAmount || order.amount) / 100).toFixed(2)} \u20AC</td>
              </tr>
            </tbody>
          </table>
          
          <div class="totals-section">
            <div class="totals-box">
              <div class="totals-row">
                <span>Subtotal</span>
                <span>${((order.originalAmount || order.amount) / 100).toFixed(2)} \u20AC</span>
              </div>
              ${order.discountCode ? `
              <div class="totals-row" style="color: #16a34a;">
                <span>Descuento (${order.discountCode})</span>
                <span>-${(order.discountAmount / 100).toFixed(2)} \u20AC</span>
              </div>
              ` : ""}
              <div class="totals-row">
                <span>IVA (0%)</span>
                <span>0.00 \u20AC</span>
              </div>
              <div class="totals-row final">
                <span class="label">Total</span>
                <span class="amount">${(order.amount / 100).toFixed(2)} \u20AC</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>EASY US LLC</strong> \u2022 FORTUNY CONSULTING LLC</p>
            <p>1209 Mountain Road Place NE, STE R, Albuquerque, NM 87110, USA</p>
            <p>hola@easyusllc.com \u2022 +34 614 91 69 10 \u2022 www.easyusllc.com</p>
          </div>
        </body>
      </html>
    `;
  }
  function generateReceiptHtml(order, requestCode) {
    const receiptNumber = requestCode || order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber;
    const userName = order.user ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() : "Cliente";
    const userEmail = order.user?.email || "";
    const productName = order.product?.name || "Servicio de Constituci\xF3n LLC";
    const statusLabels = {
      "paid": "Pagado",
      "pending": "Pendiente",
      "processing": "En Proceso",
      "completed": "Completado"
    };
    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recibo ${receiptNumber}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
          <style>
            @media print { 
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff !important; } 
              .no-print { display: none !important; }
              .receipt-card { box-shadow: none !important; }
              @page { margin: 1cm; }
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; color: #0E1215; line-height: 1.6; background: #F7F7F5; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .print-controls { text-align: center; margin-bottom: 25px; }
            .print-btn { background: #6EDC8A; color: #0E1215; padding: 14px 35px; border: none; border-radius: 100px; font-weight: 800; cursor: pointer; font-size: 14px; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 15px rgba(110, 220, 138, 0.3); }
            .print-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(110, 220, 138, 0.4); }
            .receipt-card { background: white; max-width: 500px; width: 100%; padding: 50px; border-radius: 32px; box-shadow: 0 25px 50px rgba(0,0,0,0.08); }
            .receipt-header { text-align: center; margin-bottom: 35px; }
            .success-icon { width: 70px; height: 70px; background: linear-gradient(135deg, #6EDC8A 0%, #4eca70 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
            .success-icon svg { width: 35px; height: 35px; color: #0E1215; }
            .receipt-badge { background: #6EDC8A; color: #0E1215; padding: 8px 18px; border-radius: 100px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; display: inline-block; margin-bottom: 15px; }
            .receipt-title { font-size: 26px; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 8px; }
            .receipt-number { color: #6EDC8A; font-size: 18px; font-weight: 800; }
            .receipt-message { color: #6B7280; font-size: 14px; margin-top: 15px; padding: 0 20px; }
            .receipt-details { background: #F7F7F5; border-radius: 20px; padding: 25px; margin-bottom: 30px; }
            .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #E6E9EC; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
            .detail-value { font-size: 15px; font-weight: 600; color: #0E1215; text-align: right; }
            .detail-value.highlight { font-size: 22px; font-weight: 900; color: #6EDC8A; }
            .status-badge { background: #6EDC8A; color: #0E1215; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 800; }
            .status-badge.pending { background: #FEF3C7; color: #92400E; }
            .receipt-footer { text-align: center; padding-top: 25px; border-top: 1px solid #E6E9EC; font-size: 12px; color: #6B7280; }
            .receipt-footer p { margin-bottom: 4px; }
            .receipt-footer .company { font-weight: 700; color: #0E1215; }
          </style>
        </head>
        <body>
          <div class="print-controls no-print">
            <button class="print-btn" onclick="window.print()">Imprimir / Descargar PDF</button>
          </div>
          
          <div class="receipt-card">
            <div class="receipt-header">
              <img src="https://easyusllc.com/logo-icon.png" alt="Easy US LLC" style="width: 70px; height: 70px; margin: 0 auto 20px; display: block; border-radius: 12px;">
              <div class="receipt-badge">Recibo de Solicitud</div>
              <h1 class="receipt-title">Pedido Confirmado</h1>
              <div class="receipt-number">${receiptNumber}</div>
              <p class="receipt-message">Hemos recibido correctamente tu solicitud. Tu proceso de constituci\xF3n est\xE1 en marcha.</p>
            </div>
            
            <div class="receipt-details">
              <div class="detail-row">
                <span class="detail-label">Cliente</span>
                <span class="detail-value">${userName}</span>
              </div>
              ${userEmail ? `<div class="detail-row">
                <span class="detail-label">Email</span>
                <span class="detail-value">${userEmail}</span>
              </div>` : ""}
              <div class="detail-row">
                <span class="detail-label">Servicio</span>
                <span class="detail-value">${productName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Fecha</span>
                <span class="detail-value">${new Date(order.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Referencia</span>
                <span class="detail-value">${requestCode}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Estado</span>
                <span class="status-badge ${order.status === "pending" ? "pending" : ""}">${statusLabels[order.status] || order.status}</span>
              </div>
              ${order.discountCode ? `
              <div class="detail-row">
                <span class="detail-label">Subtotal</span>
                <span class="detail-value">${((order.originalAmount || order.amount) / 100).toFixed(2)} \u20AC</span>
              </div>
              <div class="detail-row" style="color: #16a34a;">
                <span class="detail-label">Descuento (${order.discountCode})</span>
                <span class="detail-value" style="color: #16a34a;">-${(order.discountAmount / 100).toFixed(2)} \u20AC</span>
              </div>
              ` : ""}
              <div class="detail-row">
                <span class="detail-label">Total</span>
                <span class="detail-value highlight">${(order.amount / 100).toFixed(2)} \u20AC</span>
              </div>
            </div>
            
            <div class="receipt-footer">
              <p>Conserva este recibo para tus registros.</p>
              <p class="company">EASY US LLC \u2022 FORTUNY CONSULTING LLC</p>
              <p>1209 Mountain Road Place NE, STE R, Albuquerque, NM 87110</p>
              <p>hola@easyusllc.com \u2022 +34 614 91 69 10</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
  app2.post("/api/contact/send-otp", async (req, res) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = checkRateLimit("contact", ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({
          message: `Demasiados intentos. Espera ${rateCheck.retryAfter} segundos.`
        });
      }
      const { email } = z2.object({ email: z2.string().email() }).parse(req.body);
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
      await db.insert(contactOtps).values({
        email,
        otp,
        expiresAt
      });
      await sendEmail({
        to: email,
        subject: "Tu c\xF3digo de verificaci\xF3n | Easy US LLC",
        html: getOtpEmailTemplate(otp, "Cliente")
      });
      res.json({ success: true });
    } catch (err) {
      console.error("Error sending contact OTP:", err);
      res.status(400).json({ message: "Error al enviar el c\xF3digo de verificaci\xF3n. Por favor, int\xE9ntalo de nuevo en unos minutos." });
    }
  });
  app2.post("/api/contact/verify-otp", async (req, res) => {
    try {
      const { email, otp } = z2.object({ email: z2.string().email(), otp: z2.string() }).parse(req.body);
      const [record] = await db.select().from(contactOtps).where(
        and3(
          eq7(contactOtps.email, email),
          eq7(contactOtps.otp, otp),
          gt2(contactOtps.expiresAt, /* @__PURE__ */ new Date())
        )
      ).limit(1);
      if (!record) {
        return res.status(400).json({ message: "C\xF3digo inv\xE1lido o caducado" });
      }
      await db.update(contactOtps).set({ verified: true }).where(eq7(contactOtps.id, record.id));
      res.json({ success: true });
    } catch (err) {
      console.error("Error verifying contact OTP:", err);
      res.status(400).json({ message: "Error al verificar el c\xF3digo" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const contactData = z2.object({
        nombre: z2.string(),
        apellido: z2.string(),
        email: z2.string().email(),
        telefono: z2.string().optional(),
        subject: z2.string(),
        mensaje: z2.string(),
        otp: z2.string()
      }).parse(req.body);
      const sanitizedData = {
        nombre: sanitizeHtml(contactData.nombre),
        apellido: sanitizeHtml(contactData.apellido),
        subject: sanitizeHtml(contactData.subject),
        mensaje: sanitizeHtml(contactData.mensaje),
        telefono: contactData.telefono ? sanitizeHtml(contactData.telefono) : void 0
      };
      const [otpRecord] = await db.select().from(contactOtps).where(
        and3(
          eq7(contactOtps.email, contactData.email),
          eq7(contactOtps.otp, contactData.otp),
          eq7(contactOtps.verified, true)
        )
      ).limit(1);
      if (!otpRecord) {
        return res.status(400).json({ message: "Email no verificado" });
      }
      const clientIp = getClientIp(req);
      const { generateUniqueMessageId: generateUniqueMessageId2 } = await Promise.resolve().then(() => (init_id_generator(), id_generator_exports));
      const ticketId = await generateUniqueMessageId2();
      logActivity2("Acci\xF3n Contacto", {
        "ID Ticket": ticketId,
        "Nombre": `${sanitizedData.nombre} ${sanitizedData.apellido}`,
        "Email": contactData.email,
        "Tel\xE9fono": sanitizedData.telefono || "No proporcionado",
        "Asunto": sanitizedData.subject,
        "Mensaje": sanitizedData.mensaje,
        "IP": clientIp
      });
      await sendEmail({
        to: contactData.email,
        subject: `Hemos recibido tu mensaje - Ticket #${ticketId}`,
        html: getAutoReplyTemplate(ticketId, sanitizedData.nombre)
      });
      logAudit({ action: "order_created", ip: clientIp, details: { ticketId, type: "contact" } });
      res.json({ success: true, ticketId });
    } catch (err) {
      console.error("Error processing contact form:", err);
      res.status(400).json({ message: "Error al procesar el mensaje" });
    }
  });
  app2.post("/api/auth/check-email", async (req, res) => {
    try {
      const { email } = z2.object({ email: z2.string().email() }).parse(req.body);
      const [existingUser] = await db.select().from(users).where(eq7(users.email, email)).limit(1);
      res.json({
        exists: !!existingUser,
        firstName: existingUser?.firstName || null
      });
    } catch (err) {
      res.status(400).json({ message: "Email inv\xE1lido" });
    }
  });
  app2.post("/api/register/send-otp", async (req, res) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = checkRateLimit("register", ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({
          message: `Demasiados intentos. Espera ${rateCheck.retryAfter} segundos.`
        });
      }
      const { email } = z2.object({ email: z2.string().email() }).parse(req.body);
      const [existingUser] = await db.select().from(users).where(eq7(users.email, email)).limit(1);
      if (existingUser) {
        return res.status(400).json({ message: "Este email ya est\xE1 registrado. Por favor inicia sesi\xF3n." });
      }
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
      await db.insert(contactOtps).values({
        email,
        otp,
        otpType: "account_verification",
        expiresAt
      });
      await sendEmail({
        to: email,
        subject: "Tu c\xF3digo de verificaci\xF3n | Easy US LLC",
        html: getOtpEmailTemplate(otp, "Cliente")
      });
      logAudit({ action: "user_register", ip, details: { email, step: "otp_sent" } });
      res.json({ success: true });
    } catch (err) {
      console.error("Error sending registration OTP:", err);
      res.status(400).json({ message: "Error al enviar el c\xF3digo de verificaci\xF3n." });
    }
  });
  app2.post("/api/register/verify-otp", async (req, res) => {
    try {
      const { email, otp } = z2.object({ email: z2.string().email(), otp: z2.string() }).parse(req.body);
      const [record] = await db.select().from(contactOtps).where(
        and3(
          eq7(contactOtps.email, email),
          eq7(contactOtps.otp, otp),
          eq7(contactOtps.otpType, "account_verification"),
          gt2(contactOtps.expiresAt, /* @__PURE__ */ new Date())
        )
      ).limit(1);
      if (!record) {
        return res.status(400).json({ message: "C\xF3digo inv\xE1lido o caducado" });
      }
      await db.update(contactOtps).set({ verified: true }).where(eq7(contactOtps.id, record.id));
      res.json({ success: true });
    } catch (err) {
      console.error("Error verifying registration OTP:", err);
      res.status(400).json({ message: "Error al verificar el c\xF3digo" });
    }
  });
  app2.post("/api/password-reset/send-otp", async (req, res) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = checkRateLimit("passwordReset", ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({
          message: `Demasiados intentos. Espera ${rateCheck.retryAfter} segundos.`
        });
      }
      const { email } = z2.object({ email: z2.string().email() }).parse(req.body);
      const [existingUser] = await db.select().from(users).where(eq7(users.email, email)).limit(1);
      if (!existingUser) {
        return res.json({ success: true });
      }
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
      await db.insert(contactOtps).values({
        email,
        otp,
        otpType: "password_reset",
        expiresAt
      });
      await sendEmail({
        to: email,
        subject: "Tu c\xF3digo de verificaci\xF3n | Easy US LLC",
        html: getOtpEmailTemplate(otp, existingUser?.firstName || "Cliente")
      });
      logAudit({ action: "password_reset", ip, details: { email } });
      res.json({ success: true });
    } catch (err) {
      console.error("Error sending password reset OTP:", err);
      res.status(400).json({ message: "Error al enviar el c\xF3digo de verificaci\xF3n." });
    }
  });
  app2.post("/api/password-reset/confirm", async (req, res) => {
    try {
      const { email, otp, newPassword } = z2.object({
        email: z2.string().email(),
        otp: z2.string(),
        newPassword: z2.string().min(8, "La contrase\xF1a debe tener al menos 8 caracteres")
      }).parse(req.body);
      const [record] = await db.select().from(contactOtps).where(
        and3(
          eq7(contactOtps.email, email),
          eq7(contactOtps.otp, otp),
          eq7(contactOtps.otpType, "password_reset"),
          gt2(contactOtps.expiresAt, /* @__PURE__ */ new Date()),
          eq7(contactOtps.verified, false)
        )
      ).limit(1);
      if (!record) {
        return res.status(400).json({ message: "C\xF3digo inv\xE1lido o caducado" });
      }
      const [user] = await db.select().from(users).where(eq7(users.email, email)).limit(1);
      if (!user) {
        return res.status(400).json({ message: "Usuario no encontrado" });
      }
      const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth_service(), auth_service_exports));
      const passwordHash = await hashPassword2(newPassword);
      await db.update(users).set({ passwordHash, updatedAt: /* @__PURE__ */ new Date() }).where(eq7(users.id, user.id));
      await db.update(contactOtps).set({ verified: true }).where(eq7(contactOtps.id, record.id));
      res.json({ success: true, message: "Contrase\xF1a actualizada correctamente" });
    } catch (err) {
      console.error("Error resetting password:", err);
      if (err.errors) {
        return res.status(400).json({ message: err.errors[0]?.message || "Error al restablecer la contrase\xF1a" });
      }
      res.status(400).json({ message: "Error al restablecer la contrase\xF1a" });
    }
  });
  await seedDatabase();
  app2.post("/api/admin/test-emails", isAdmin, async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requerido" });
    try {
      const ticketId = "12345678";
      const otp = "888999";
      const name = "Cliente de Prueba";
      const requestCode = "NM-12345678";
      const activityHtml = `
        <div style="background-color: #f9f9f9; padding: 20px 0;">
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
            ${getEmailHeader()}
            <div style="padding: 40px;">
              <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">Log de Actividad: Selecci\xF3n de Estado</h2>
              <div style="background: #f4f4f4; border-left: 4px solid #000; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Acci\xF3n:</strong> Clic en bot\xF3n elegir</p>
                <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Estado:</strong> New Mexico Pack</p>
          <p style="margin: 0; font-size: 14px;"><strong>Precio:</strong> 739\u20AC</p>
        </div>
        <p style="font-size: 12px; color: #999;">IP Origen: 127.0.0.1 | Fecha: ${(/* @__PURE__ */ new Date()).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p>
      </div>
      ${getEmailFooter()}
    </div>
  </div>
`;
      const orderHtml = `
  <div style="background-color: #f9f9f9; padding: 20px 0;">
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
      ${getEmailHeader()}
      <div style="padding: 40px;">
        <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">Detalles de la Notificaci\xF3n</h2>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 11px; text-transform: uppercase; color: #999; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; font-weight: 800;">Estado de la Transacci\xF3n</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Estado Pago:</strong> <span style="color: #0d9488; font-weight: 700;">CONFIRMADO (MOCK)</span></p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Fecha/Hora:</strong> ${(/* @__PURE__ */ new Date()).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Aceptaci\xF3n T\xE9rminos:</strong> S\xCD (Marcado en formulario)</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 11px; text-transform: uppercase; color: #999; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; font-weight: 800;">Informaci\xF3n del Propietario</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Nombre:</strong> ${name}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>DNI / Pasaporte:</strong> 12345678X (Test)</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Direcci\xF3n:</strong> Calle Falsa 123, 28001 Madrid, Espa\xF1a</p>
        </div>

        <div>
          <h3 style="font-size: 11px; text-transform: uppercase; color: #999; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; font-weight: 800;">Detalles de la Empresa</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Nombre LLC:</strong> Mi Nueva Empresa LLC</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Estado:</strong> New Mexico</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Actividad:</strong> Consultor\xEDa de Software y Marketing Digital</p>
          <p style="margin: 0; font-size: 14px;"><strong>Notas:</strong> Necesito el EIN urgente para abrir cuenta en Mercury.</p>
        </div>
      </div>
      ${getEmailFooter()}
    </div>
  </div>
`;
      await Promise.all([
        sendEmail({ to: email, subject: "TEST: Tu c\xF3digo de verificaci\xF3n", html: getOtpEmailTemplate(otp, name) }),
        sendEmail({ to: email, subject: "TEST: Log de Actividad (Admin)", html: activityHtml }),
        sendEmail({ to: email, subject: "TEST: Nueva Solicitud LLC (Admin)", html: orderHtml }),
        sendEmail({ to: email, subject: "TEST: Confirmaci\xF3n de Pedido (Cliente)", html: getConfirmationEmailTemplate(name, requestCode, { companyName: "Mi Nueva Empresa LLC" }) }),
        sendEmail({ to: email, subject: "TEST: Bienvenido a Easy US LLC", html: getWelcomeEmailTemplate(name) }),
        sendEmail({ to: email, subject: "TEST: Newsletter Bienvenida", html: getNewsletterWelcomeTemplate() }),
        sendEmail({ to: email, subject: "TEST: Confirmaci\xF3n de Mensaje (Auto-reply)", html: getAutoReplyTemplate(ticketId, name) })
      ]);
      res.json({ success: true, message: "Emails de prueba administrativos mejorados enviados" });
    } catch (error) {
      res.status(500).json({ message: "Error al enviar emails de prueba" });
    }
  });
  return httpServer2;
}
async function seedDatabase() {
  const existingProducts = await storage.getProducts();
  if (existingProducts.length === 0) {
    await storage.createProduct({
      name: "New Mexico LLC",
      description: "Constituci\xF3n r\xE1pida en el estado m\xE1s eficiente. Ideal para bajo coste de mantenimiento.",
      price: 73900,
      features: [
        "Tasas del estado pagadas",
        "Registered Agent (12 meses)",
        "Articles of Organization oficiales",
        "Operating Agreement profesional",
        "EIN del IRS",
        "BOI Report presentado",
        "Declaraciones fiscales a\xF1o 1",
        "Soporte completo 12 meses"
      ]
    });
    await storage.createProduct({
      name: "Wyoming LLC",
      description: "Constituci\xF3n premium en el estado m\xE1s prestigioso de USA. M\xE1xima privacidad y protecci\xF3n.",
      price: 89900,
      features: [
        "Tasas del estado pagadas",
        "Registered Agent (12 meses)",
        "EIN del IRS garantizado",
        "Articles of Organization oficiales",
        "Operating Agreement profesional",
        "BOI Report presentado",
        "Annual Report a\xF1o 1",
        "Declaraciones fiscales a\xF1o 1",
        "Soporte completo 12 meses"
      ]
    });
    await storage.createProduct({
      name: "Delaware LLC",
      description: "El est\xE1ndar para startups y empresas tecnol\xF3gicas. Reconocimiento legal global.",
      price: 119900,
      features: [
        "Tasas del estado pagadas",
        "Registered Agent (12 meses)",
        "Articles of Organization oficiales",
        "Operating Agreement profesional",
        "EIN del IRS",
        "BOI Report presentado",
        "Declaraciones fiscales a\xF1o 1",
        "Soporte completo 12 meses"
      ]
    });
  }
}

// server/static.ts
import express2 from "express";
import fs2 from "fs";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath, {
    maxAge: "1y",
    immutable: true,
    index: false,
    etag: true,
    lastModified: true
  }));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"), {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    });
  });
}

// server/index.ts
import { createServer } from "http";
import compression from "compression";
import path6 from "path";

// server/lib/sentry.ts
import * as Sentry from "@sentry/node";
var isInitialized = false;
function initServerSentry() {
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      beforeSend(event) {
        if (event.exception) {
          console.error("[Sentry Server] Captured exception");
        }
        return event;
      }
    });
    isInitialized = true;
    console.log("[Sentry] Server monitoring initialized");
  }
}

// server/lib/backup.ts
import { exec } from "child_process";
import { promisify } from "util";
import fs3 from "fs";
import path3 from "path";
var execAsync = promisify(exec);
var BACKUP_DIR = "/tmp/db-backups";
var MAX_BACKUPS = 7;
async function ensureBackupDir() {
  if (!fs3.existsSync(BACKUP_DIR)) {
    fs3.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}
async function cleanOldBackups() {
  const files = fs3.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".sql")).map((f) => ({
    name: f,
    path: path3.join(BACKUP_DIR, f),
    time: fs3.statSync(path3.join(BACKUP_DIR, f)).mtime.getTime()
  })).sort((a, b) => b.time - a.time);
  while (files.length > MAX_BACKUPS) {
    const oldest = files.pop();
    if (oldest) {
      fs3.unlinkSync(oldest.path);
      console.log(`[Backup] Deleted old backup: ${oldest.name}`);
    }
  }
}
async function createBackup() {
  try {
    await ensureBackupDir();
    const timestamp3 = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    const backupFile = path3.join(BACKUP_DIR, `backup-${timestamp3}.sql`);
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error("[Backup] DATABASE_URL not configured");
      return null;
    }
    const pgDumpCmd = `pg_dump "${databaseUrl}" --no-owner --no-acl -f "${backupFile}"`;
    await execAsync(pgDumpCmd);
    await cleanOldBackups();
    console.log(`[Backup] Created successfully: ${backupFile}`);
    return backupFile;
  } catch (error) {
    console.error("[Backup] Failed:", error);
    return null;
  }
}
function scheduleBackups() {
  const BACKUP_INTERVAL = 24 * 60 * 60 * 1e3;
  createBackup();
  setInterval(() => {
    createBackup();
  }, BACKUP_INTERVAL);
  console.log("[Backup] Scheduled daily backups");
}

// server/index.ts
initServerSentry();
var app = express3();
app.use("/uploads", express3.static(path6.join(process.cwd(), "uploads")));
var httpServer = createServer(app);
app.use(compression());
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://*.stripe.com; connect-src 'self' https://api.stripe.com wss://*.replit.dev; frame-src 'self' https://js.stripe.com; frame-ancestors 'self' https://*.replit.dev https://*.replit.app;");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  if (req.method === "GET") {
    const isAsset = req.path.startsWith("/assets/") || req.path.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff2|woff)$/);
    const isStaticFile = req.path.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|woff2|woff|ttf|eot)$/);
    const isSeoFile = req.path === "/robots.txt" || req.path.startsWith("/sitemap");
    if (isAsset) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Vary", "Accept-Encoding");
    } else if (isStaticFile) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    } else if (isSeoFile) {
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.setHeader("X-Robots-Tag", "all");
    }
    res.setHeader("X-DNS-Prefetch-Control", "on");
    res.setHeader("Link", "</logo-icon.png>; rel=preload; as=image, </favicon.png>; rel=icon");
  }
  const seoPages = ["/", "/servicios", "/faq", "/contacto", "/llc/formation", "/llc/maintenance"];
  if (seoPages.includes(req.path)) {
    res.setHeader("X-Robots-Tag", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    res.setHeader("Link", "<https://easyusllc.com" + req.path + '>; rel="canonical"');
  }
  const noindexPages = ["/dashboard", "/admin", "/auth/forgot-password"];
  if (noindexPages.some((p) => req.path.startsWith(p))) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
  }
  if (req.path.startsWith("/api/")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  next();
});
(async () => {
  await registerRoutes(httpServer, app);
  const { WebSocketServer } = await import("ws");
  const wss = new WebSocketServer({ noServer: true });
  httpServer.on("upgrade", (request, socket, head) => {
    const { pathname } = new URL(request.url, `http://${request.headers.host}`);
    if (pathname === "/ws/logs") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });
  const originalLog = console.log;
  console.log = (...args) => {
    originalLog(...args);
    const msg = args.map((arg) => typeof arg === "object" ? JSON.stringify(arg) : arg).join(" ");
    wss.clients.forEach((client) => {
      if (client.readyState === 1) client.send(msg);
    });
  };
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    console.error(`[Error ${status}]`, message, err.stack || "");
  });
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite: setupVite2 } = await Promise.resolve().then(() => (init_vite(), vite_exports));
    await setupVite2(httpServer, app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`serving on port ${port}`);
      if (process.env.NODE_ENV === "production") {
        scheduleBackups();
      }
    }
  );
})();
export {
  log
};
//# sourceMappingURL=index.js.map
