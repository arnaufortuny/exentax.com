"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc13) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc13 = __getOwnPropDesc(from, key)) || desc13.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// shared/models/auth.ts
var import_drizzle_orm, import_pg_core, sessions, users, userNotifications, passwordResetTokens, emailVerificationTokens;
var init_auth = __esm({
  "shared/models/auth.ts"() {
    "use strict";
    import_drizzle_orm = require("drizzle-orm");
    import_pg_core = require("drizzle-orm/pg-core");
    sessions = (0, import_pg_core.pgTable)(
      "sessions",
      {
        sid: (0, import_pg_core.varchar)("sid").primaryKey(),
        sess: (0, import_pg_core.jsonb)("sess").notNull(),
        expire: (0, import_pg_core.timestamp)("expire").notNull()
      },
      (table) => [(0, import_pg_core.index)("IDX_session_expire").on(table.expire)]
    );
    users = (0, import_pg_core.pgTable)("users", {
      id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
      clientId: (0, import_pg_core.varchar)("client_id", { length: 8 }).unique(),
      // 8-digit numeric ID
      email: (0, import_pg_core.varchar)("email").unique(),
      passwordHash: (0, import_pg_core.varchar)("password_hash"),
      firstName: (0, import_pg_core.varchar)("first_name"),
      lastName: (0, import_pg_core.varchar)("last_name"),
      profileImageUrl: (0, import_pg_core.varchar)("profile_image_url"),
      phone: (0, import_pg_core.varchar)("phone"),
      address: (0, import_pg_core.text)("address"),
      streetType: (0, import_pg_core.text)("street_type"),
      city: (0, import_pg_core.text)("city"),
      province: (0, import_pg_core.text)("province"),
      postalCode: (0, import_pg_core.text)("postal_code"),
      country: (0, import_pg_core.text)("country"),
      businessActivity: (0, import_pg_core.text)("business_activity"),
      idNumber: (0, import_pg_core.text)("id_number"),
      idType: (0, import_pg_core.text)("id_type"),
      birthDate: (0, import_pg_core.text)("birth_date"),
      emailVerified: (0, import_pg_core.boolean)("email_verified").notNull().default(false),
      preferredLanguage: (0, import_pg_core.varchar)("preferred_language", { length: 5 }).default("es"),
      // es, en, ca
      isAdmin: (0, import_pg_core.boolean)("is_admin").notNull().default(false),
      isSupport: (0, import_pg_core.boolean)("is_support").notNull().default(false),
      isActive: (0, import_pg_core.boolean)("is_active").notNull().default(true),
      accountStatus: (0, import_pg_core.text)("account_status").notNull().default("active"),
      // active (Verificado), pending (En revisión), deactivated (Desactivada), vip
      loginAttempts: (0, import_pg_core.integer)("login_attempts").notNull().default(0),
      lockUntil: (0, import_pg_core.timestamp)("lock_until"),
      internalNotes: (0, import_pg_core.text)("internal_notes"),
      googleId: (0, import_pg_core.varchar)("google_id"),
      // Security tracking fields
      lastLoginIp: (0, import_pg_core.varchar)("last_login_ip"),
      loginCount: (0, import_pg_core.integer)("login_count").notNull().default(0),
      securityOtpRequired: (0, import_pg_core.boolean)("security_otp_required").notNull().default(false),
      lastSecurityOtpAt: (0, import_pg_core.timestamp)("last_security_otp_at"),
      pendingProfileChanges: (0, import_pg_core.jsonb)("pending_profile_changes"),
      pendingChangesExpiresAt: (0, import_pg_core.timestamp)("pending_changes_expires_at"),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    userNotifications = (0, import_pg_core.pgTable)("user_notifications", {
      id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
      userId: (0, import_pg_core.varchar)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      orderId: (0, import_pg_core.integer)("order_id"),
      orderCode: (0, import_pg_core.text)("order_code"),
      ticketId: (0, import_pg_core.text)("ticket_id").unique(),
      type: (0, import_pg_core.text)("type").notNull(),
      title: (0, import_pg_core.text)("title").notNull(),
      message: (0, import_pg_core.text)("message").notNull(),
      isRead: (0, import_pg_core.boolean)("is_read").notNull().default(false),
      actionUrl: (0, import_pg_core.text)("action_url"),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    }, (table) => [
      (0, import_pg_core.index)("user_notifications_user_id_idx").on(table.userId),
      (0, import_pg_core.index)("user_notifications_is_read_idx").on(table.isRead),
      (0, import_pg_core.index)("user_notifications_ticket_id_idx").on(table.ticketId)
    ]);
    passwordResetTokens = (0, import_pg_core.pgTable)("password_reset_tokens", {
      id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
      userId: (0, import_pg_core.varchar)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      token: (0, import_pg_core.varchar)("token").notNull().unique(),
      expiresAt: (0, import_pg_core.timestamp)("expires_at").notNull(),
      used: (0, import_pg_core.boolean)("used").notNull().default(false),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    emailVerificationTokens = (0, import_pg_core.pgTable)("email_verification_tokens", {
      id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
      userId: (0, import_pg_core.varchar)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      token: (0, import_pg_core.varchar)("token").notNull().unique(),
      expiresAt: (0, import_pg_core.timestamp)("expires_at").notNull(),
      used: (0, import_pg_core.boolean)("used").notNull().default(false),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
  }
});

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  accountingTransactions: () => accountingTransactions,
  applicationDocuments: () => applicationDocuments,
  applicationDocumentsRelations: () => applicationDocumentsRelations,
  auditLogs: () => auditLogs,
  calculatorConsultations: () => calculatorConsultations,
  consultationAvailability: () => consultationAvailability,
  consultationBlockedDates: () => consultationBlockedDates,
  consultationBookings: () => consultationBookings,
  consultationBookingsRelations: () => consultationBookingsRelations,
  consultationTypes: () => consultationTypes,
  consultationTypesRelations: () => consultationTypesRelations,
  contactOtps: () => contactOtps,
  discountCodes: () => discountCodes,
  documentAccessLogs: () => documentAccessLogs,
  emailVerificationTokens: () => emailVerificationTokens,
  encryptedFields: () => encryptedFields,
  guestVisitors: () => guestVisitors,
  insertAccountingTransactionSchema: () => insertAccountingTransactionSchema,
  insertApplicationDocumentSchema: () => insertApplicationDocumentSchema,
  insertAuditLogSchema: () => insertAuditLogSchema,
  insertConsultationAvailabilitySchema: () => insertConsultationAvailabilitySchema,
  insertConsultationBlockedDateSchema: () => insertConsultationBlockedDateSchema,
  insertConsultationBookingSchema: () => insertConsultationBookingSchema,
  insertConsultationTypeSchema: () => insertConsultationTypeSchema,
  insertContactOtpSchema: () => insertContactOtpSchema,
  insertDiscountCodeSchema: () => insertDiscountCodeSchema,
  insertDocumentAccessLogSchema: () => insertDocumentAccessLogSchema,
  insertGuestVisitorSchema: () => insertGuestVisitorSchema,
  insertLlcApplicationSchema: () => insertLlcApplicationSchema,
  insertMaintenanceApplicationSchema: () => insertMaintenanceApplicationSchema,
  insertMessageReplySchema: () => insertMessageReplySchema,
  insertOrderEventSchema: () => insertOrderEventSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPaymentAccountSchema: () => insertPaymentAccountSchema,
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
  paymentAccounts: () => paymentAccounts,
  products: () => products,
  rateLimitEntries: () => rateLimitEntries,
  sessions: () => sessions,
  userNotifications: () => userNotifications,
  users: () => users
});
var import_pg_core2, import_drizzle_zod, import_drizzle_orm2, products, orders, llcApplications, applicationDocuments, newsletterSubscribers, calculatorConsultations, messages, contactOtps, orderEvents, messageReplies, maintenanceApplications, ordersRelations, orderEventsRelations, messagesRelations, messageRepliesRelations, llcApplicationsRelations, applicationDocumentsRelations, maintenanceApplicationsRelations, insertProductSchema, insertOrderSchema, insertLlcApplicationSchema, insertApplicationDocumentSchema, insertMaintenanceApplicationSchema, insertContactOtpSchema, insertOrderEventSchema, insertMessageReplySchema, discountCodes, insertDiscountCodeSchema, rateLimitEntries, auditLogs, insertAuditLogSchema, documentAccessLogs, insertDocumentAccessLogSchema, encryptedFields, consultationTypes, consultationAvailability, consultationBlockedDates, consultationBookings, consultationTypesRelations, consultationBookingsRelations, insertConsultationTypeSchema, insertConsultationAvailabilitySchema, insertConsultationBlockedDateSchema, insertConsultationBookingSchema, accountingTransactions, insertAccountingTransactionSchema, guestVisitors, insertGuestVisitorSchema, paymentAccounts, insertPaymentAccountSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    init_auth();
    import_pg_core2 = require("drizzle-orm/pg-core");
    import_drizzle_zod = require("drizzle-zod");
    init_auth();
    import_drizzle_orm2 = require("drizzle-orm");
    products = (0, import_pg_core2.pgTable)("products", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      name: (0, import_pg_core2.text)("name").notNull(),
      description: (0, import_pg_core2.text)("description").notNull(),
      price: (0, import_pg_core2.integer)("price").notNull(),
      // in cents
      features: (0, import_pg_core2.jsonb)("features").$type().notNull()
    });
    orders = (0, import_pg_core2.pgTable)("orders", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      userId: (0, import_pg_core2.varchar)("user_id").notNull().references(() => users.id),
      productId: (0, import_pg_core2.integer)("product_id").notNull().references(() => products.id),
      status: (0, import_pg_core2.text)("status").notNull().default("pending"),
      // pending, paid, processing, documents_ready, completed, cancelled
      stripeSessionId: (0, import_pg_core2.text)("stripe_session_id"),
      amount: (0, import_pg_core2.integer)("amount").notNull(),
      originalAmount: (0, import_pg_core2.integer)("original_amount"),
      // original amount before discount
      discountCode: (0, import_pg_core2.varchar)("discount_code", { length: 50 }),
      discountAmount: (0, import_pg_core2.integer)("discount_amount").default(0),
      // discount in cents
      currency: (0, import_pg_core2.varchar)("currency", { length: 3 }).notNull().default("EUR"),
      // USD or EUR
      isInvoiceGenerated: (0, import_pg_core2.boolean)("is_invoice_generated").notNull().default(false),
      invoiceNumber: (0, import_pg_core2.text)("invoice_number"),
      paymentLink: (0, import_pg_core2.text)("payment_link"),
      // admin-set payment link URL
      paymentStatus: (0, import_pg_core2.text)("payment_status").default("pending"),
      // pending, paid, overdue, cancelled
      paymentDueDate: (0, import_pg_core2.timestamp)("payment_due_date"),
      paidAt: (0, import_pg_core2.timestamp)("paid_at"),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    }, (table) => ({
      userIdIdx: (0, import_pg_core2.index)("orders_user_id_idx").on(table.userId),
      statusIdx: (0, import_pg_core2.index)("orders_status_idx").on(table.status)
    }));
    llcApplications = (0, import_pg_core2.pgTable)("llc_applications", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      orderId: (0, import_pg_core2.integer)("order_id").notNull().references(() => orders.id),
      requestCode: (0, import_pg_core2.text)("request_code").unique(),
      ownerFullName: (0, import_pg_core2.text)("owner_full_name"),
      ownerEmail: (0, import_pg_core2.text)("owner_email"),
      ownerPhone: (0, import_pg_core2.text)("owner_phone"),
      ownerBirthDate: (0, import_pg_core2.text)("owner_birth_date"),
      ownerAddress: (0, import_pg_core2.text)("owner_address"),
      ownerStreetType: (0, import_pg_core2.text)("owner_street_type"),
      // Calle, Avenida, Paseo
      ownerCity: (0, import_pg_core2.text)("owner_city"),
      ownerCountry: (0, import_pg_core2.text)("owner_country"),
      ownerProvince: (0, import_pg_core2.text)("owner_province"),
      ownerPostalCode: (0, import_pg_core2.text)("owner_postal_code"),
      ownerIdNumber: (0, import_pg_core2.text)("owner_id_number"),
      // DNI/Passport number
      ownerIdType: (0, import_pg_core2.text)("owner_id_type"),
      // DNI or Passport
      idLater: (0, import_pg_core2.boolean)("id_later").notNull().default(false),
      dataProcessingConsent: (0, import_pg_core2.boolean)("data_processing_consent").notNull().default(false),
      termsConsent: (0, import_pg_core2.boolean)("terms_consent").notNull().default(false),
      ageConfirmation: (0, import_pg_core2.boolean)("age_confirmation").notNull().default(false),
      companyName: (0, import_pg_core2.text)("company_name"),
      companyNameOption2: (0, import_pg_core2.text)("company_name_option_2"),
      designator: (0, import_pg_core2.text)("designator"),
      // LLC, L.L.C., Ltd.
      companyDescription: (0, import_pg_core2.text)("company_description"),
      businessCategory: (0, import_pg_core2.text)("business_category"),
      businessActivity: (0, import_pg_core2.text)("business_activity"),
      businessCategoryOther: (0, import_pg_core2.text)("business_category_other"),
      ownerNamesAlternates: (0, import_pg_core2.text)("owner_names_alternates"),
      // Plan B, C, D names
      ownerCount: (0, import_pg_core2.integer)("owner_count").default(1),
      ownerCountryResidency: (0, import_pg_core2.text)("owner_country_residency"),
      idDocumentUrl: (0, import_pg_core2.text)("id_document_url"),
      isSellingOnline: (0, import_pg_core2.text)("is_selling_online"),
      // Yes, No, Not sure
      needsBankAccount: (0, import_pg_core2.text)("needs_bank_account"),
      // Mercury, Relay, No, Yes
      willUseStripe: (0, import_pg_core2.text)("will_use_stripe"),
      // Stripe, PayPal, Both, Other, Not yet
      wantsBoiReport: (0, import_pg_core2.text)("wants_boi_report"),
      // Yes, No, Info
      wantsMaintenancePack: (0, import_pg_core2.text)("wants_maintenance_pack"),
      // Yes, No, Info
      paymentMethod: (0, import_pg_core2.text)("payment_method"),
      // transfer, link
      paymentStatus: (0, import_pg_core2.text)("payment_status").notNull().default("unpaid"),
      // unpaid, paid
      notes: (0, import_pg_core2.text)("notes"),
      state: (0, import_pg_core2.text)("state"),
      status: (0, import_pg_core2.text)("status").notNull().default("draft"),
      // draft, submitted, filed, rejected
      submittedAt: (0, import_pg_core2.timestamp)("submitted_at"),
      lastUpdated: (0, import_pg_core2.timestamp)("last_updated").defaultNow(),
      emailOtp: (0, import_pg_core2.text)("email_otp"),
      emailOtpExpires: (0, import_pg_core2.timestamp)("email_otp_expires"),
      emailVerified: (0, import_pg_core2.boolean)("email_verified").notNull().default(false),
      // Important dates for calendar
      llcCreatedDate: (0, import_pg_core2.timestamp)("llc_created_date"),
      agentRenewalDate: (0, import_pg_core2.timestamp)("agent_renewal_date"),
      irs1120DueDate: (0, import_pg_core2.timestamp)("irs_1120_due_date"),
      irs5472DueDate: (0, import_pg_core2.timestamp)("irs_5472_due_date"),
      annualReportDueDate: (0, import_pg_core2.timestamp)("annual_report_due_date"),
      // Tax extension (6 months: April 15 -> October 15)
      hasTaxExtension: (0, import_pg_core2.boolean)("has_tax_extension").notNull().default(false),
      // EIN (Employer Identification Number) - set by admin when order completed
      ein: (0, import_pg_core2.text)("ein"),
      // Registration number from state (set by admin when filed)
      registrationNumber: (0, import_pg_core2.text)("registration_number"),
      // LLC registered address (set by admin)
      llcAddress: (0, import_pg_core2.text)("llc_address"),
      // Owner share/capital percentage (set by admin)
      ownerSharePercentage: (0, import_pg_core2.text)("owner_share_percentage"),
      // Registered agent status: active, pending_renewal, renewed, expired
      agentStatus: (0, import_pg_core2.text)("agent_status").default("active"),
      // BOI (Beneficial Ownership Information) status: pending, filed, update_required, exempt
      boiStatus: (0, import_pg_core2.text)("boi_status").default("pending"),
      boiFiledDate: (0, import_pg_core2.timestamp)("boi_filed_date"),
      // Abandoned application tracking
      abandonedAt: (0, import_pg_core2.timestamp)("abandoned_at"),
      remindersSent: (0, import_pg_core2.integer)("reminders_sent").notNull().default(0),
      lastReminderAt: (0, import_pg_core2.timestamp)("last_reminder_at")
    }, (table) => ({
      orderIdIdx: (0, import_pg_core2.index)("llc_apps_order_id_idx").on(table.orderId),
      requestCodeIdx: (0, import_pg_core2.index)("llc_apps_req_code_idx").on(table.requestCode),
      statusIdx: (0, import_pg_core2.index)("llc_apps_status_idx").on(table.status)
    }));
    applicationDocuments = (0, import_pg_core2.pgTable)("application_documents", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      applicationId: (0, import_pg_core2.integer)("application_id").references(() => llcApplications.id),
      orderId: (0, import_pg_core2.integer)("order_id").references(() => orders.id),
      userId: (0, import_pg_core2.varchar)("user_id").references(() => users.id),
      fileName: (0, import_pg_core2.text)("file_name").notNull(),
      fileType: (0, import_pg_core2.text)("file_type").notNull(),
      fileUrl: (0, import_pg_core2.text)("file_url").notNull(),
      documentType: (0, import_pg_core2.text)("document_type").notNull(),
      reviewStatus: (0, import_pg_core2.text)("review_status").notNull().default("pending"),
      uploadedBy: (0, import_pg_core2.varchar)("uploaded_by").references(() => users.id),
      uploadedAt: (0, import_pg_core2.timestamp)("uploaded_at").defaultNow(),
      isEncrypted: (0, import_pg_core2.boolean)("is_encrypted").default(false),
      encryptionIv: (0, import_pg_core2.text)("encryption_iv"),
      fileHash: (0, import_pg_core2.text)("file_hash"),
      originalSize: (0, import_pg_core2.integer)("original_size")
    }, (table) => ({
      applicationIdIdx: (0, import_pg_core2.index)("app_docs_application_id_idx").on(table.applicationId),
      orderIdIdx: (0, import_pg_core2.index)("app_docs_order_id_idx").on(table.orderId),
      userIdIdx: (0, import_pg_core2.index)("app_docs_user_id_idx").on(table.userId),
      uploadedByIdx: (0, import_pg_core2.index)("app_docs_uploaded_by_idx").on(table.uploadedBy)
    }));
    newsletterSubscribers = (0, import_pg_core2.pgTable)("newsletter_subscribers", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      email: (0, import_pg_core2.text)("email").notNull().unique(),
      subscribedAt: (0, import_pg_core2.timestamp)("subscribed_at").defaultNow()
    });
    calculatorConsultations = (0, import_pg_core2.pgTable)("calculator_consultations", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      email: (0, import_pg_core2.text)("email").notNull(),
      income: (0, import_pg_core2.integer)("income").notNull(),
      country: (0, import_pg_core2.text)("country").notNull(),
      activity: (0, import_pg_core2.text)("activity"),
      savings: (0, import_pg_core2.integer)("savings"),
      isRead: (0, import_pg_core2.boolean)("is_read").default(false),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    }, (table) => ({
      emailIdx: (0, import_pg_core2.index)("calc_consultations_email_idx").on(table.email),
      isReadIdx: (0, import_pg_core2.index)("calc_consultations_is_read_idx").on(table.isRead)
    }));
    messages = (0, import_pg_core2.pgTable)("messages", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      userId: (0, import_pg_core2.varchar)("user_id").references(() => users.id),
      name: (0, import_pg_core2.text)("name"),
      email: (0, import_pg_core2.text)("email").notNull(),
      phone: (0, import_pg_core2.text)("phone"),
      contactByWhatsapp: (0, import_pg_core2.boolean)("contact_by_whatsapp").default(false),
      subject: (0, import_pg_core2.text)("subject"),
      content: (0, import_pg_core2.text)("content").notNull(),
      encryptedContent: (0, import_pg_core2.text)("encrypted_content"),
      status: (0, import_pg_core2.text)("status").notNull().default("unread"),
      // unread, read, archived
      type: (0, import_pg_core2.text)("type").notNull().default("contact"),
      // contact, support, system
      requestCode: (0, import_pg_core2.text)("request_code"),
      messageId: (0, import_pg_core2.text)("message_id").unique(),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    }, (table) => ({
      userIdIdx: (0, import_pg_core2.index)("messages_user_id_idx").on(table.userId),
      statusIdx: (0, import_pg_core2.index)("messages_status_idx").on(table.status),
      emailIdx: (0, import_pg_core2.index)("messages_email_idx").on(table.email)
    }));
    contactOtps = (0, import_pg_core2.pgTable)("contact_otps", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      email: (0, import_pg_core2.text)("email").notNull(),
      otp: (0, import_pg_core2.text)("otp").notNull(),
      otpType: (0, import_pg_core2.text)("otp_type").notNull().default("contact"),
      // contact, password_change
      expiresAt: (0, import_pg_core2.timestamp)("expires_at").notNull(),
      verified: (0, import_pg_core2.boolean)("verified").notNull().default(false)
    }, (table) => ({
      emailIdx: (0, import_pg_core2.index)("contact_otps_email_idx").on(table.email),
      expiresAtIdx: (0, import_pg_core2.index)("contact_otps_expires_at_idx").on(table.expiresAt)
    }));
    orderEvents = (0, import_pg_core2.pgTable)("order_events", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      orderId: (0, import_pg_core2.integer)("order_id").notNull().references(() => orders.id),
      eventType: (0, import_pg_core2.text)("event_type").notNull(),
      description: (0, import_pg_core2.text)("description").notNull(),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow(),
      createdBy: (0, import_pg_core2.varchar)("created_by").references(() => users.id)
    }, (table) => ({
      orderIdIdx: (0, import_pg_core2.index)("order_events_order_id_idx").on(table.orderId)
    }));
    messageReplies = (0, import_pg_core2.pgTable)("message_replies", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      messageId: (0, import_pg_core2.integer)("message_id").notNull().references(() => messages.id),
      content: (0, import_pg_core2.text)("content").notNull(),
      encryptedContent: (0, import_pg_core2.text)("encrypted_content"),
      isAdmin: (0, import_pg_core2.boolean)("is_admin").notNull().default(false),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow(),
      createdBy: (0, import_pg_core2.varchar)("created_by").references(() => users.id)
    });
    maintenanceApplications = (0, import_pg_core2.pgTable)("maintenance_applications", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      orderId: (0, import_pg_core2.integer)("order_id").notNull().references(() => orders.id),
      requestCode: (0, import_pg_core2.text)("request_code").unique(),
      ownerFullName: (0, import_pg_core2.text)("owner_full_name"),
      ownerEmail: (0, import_pg_core2.text)("owner_email"),
      ownerPhone: (0, import_pg_core2.text)("owner_phone"),
      companyName: (0, import_pg_core2.text)("company_name"),
      ein: (0, import_pg_core2.text)("ein"),
      state: (0, import_pg_core2.text)("state"),
      creationSource: (0, import_pg_core2.text)("creation_source"),
      creationYear: (0, import_pg_core2.text)("creation_year"),
      bankAccount: (0, import_pg_core2.text)("bank_account"),
      paymentGateway: (0, import_pg_core2.text)("payment_gateway"),
      businessActivity: (0, import_pg_core2.text)("business_activity"),
      expectedServices: (0, import_pg_core2.text)("expected_services"),
      status: (0, import_pg_core2.text)("status").notNull().default("draft"),
      submittedAt: (0, import_pg_core2.timestamp)("submitted_at"),
      lastUpdated: (0, import_pg_core2.timestamp)("last_updated").defaultNow(),
      emailOtp: (0, import_pg_core2.text)("email_otp"),
      emailOtpExpires: (0, import_pg_core2.timestamp)("email_otp_expires"),
      emailVerified: (0, import_pg_core2.boolean)("email_verified").notNull().default(false),
      notes: (0, import_pg_core2.text)("notes"),
      wantsDissolve: (0, import_pg_core2.text)("wants_dissolve"),
      paymentMethod: (0, import_pg_core2.text)("payment_method"),
      // transfer, link
      authorizedManagement: (0, import_pg_core2.boolean)("authorized_management").notNull().default(false),
      termsConsent: (0, import_pg_core2.boolean)("terms_consent").notNull().default(false),
      dataProcessingConsent: (0, import_pg_core2.boolean)("data_processing_consent").notNull().default(false),
      // Abandoned application tracking
      abandonedAt: (0, import_pg_core2.timestamp)("abandoned_at"),
      remindersSent: (0, import_pg_core2.integer)("reminders_sent").notNull().default(0),
      lastReminderAt: (0, import_pg_core2.timestamp)("last_reminder_at")
    }, (table) => ({
      orderIdIdx: (0, import_pg_core2.index)("maint_apps_order_id_idx").on(table.orderId),
      requestCodeIdx: (0, import_pg_core2.index)("maint_apps_req_code_idx").on(table.requestCode),
      statusIdx: (0, import_pg_core2.index)("maint_apps_status_idx").on(table.status)
    }));
    ordersRelations = (0, import_drizzle_orm2.relations)(orders, ({ one, many }) => ({
      user: one(users, { fields: [orders.userId], references: [users.id] }),
      product: one(products, { fields: [orders.productId], references: [products.id] }),
      application: one(llcApplications, { fields: [orders.id], references: [llcApplications.orderId] }),
      maintenanceApplication: one(maintenanceApplications, { fields: [orders.id], references: [maintenanceApplications.orderId] }),
      events: many(orderEvents)
    }));
    orderEventsRelations = (0, import_drizzle_orm2.relations)(orderEvents, ({ one }) => ({
      order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] })
    }));
    messagesRelations = (0, import_drizzle_orm2.relations)(messages, ({ many }) => ({
      replies: many(messageReplies)
    }));
    messageRepliesRelations = (0, import_drizzle_orm2.relations)(messageReplies, ({ one }) => ({
      message: one(messages, { fields: [messageReplies.messageId], references: [messages.id] })
    }));
    llcApplicationsRelations = (0, import_drizzle_orm2.relations)(llcApplications, ({ one, many }) => ({
      order: one(orders, { fields: [llcApplications.orderId], references: [orders.id] }),
      documents: many(applicationDocuments)
    }));
    applicationDocumentsRelations = (0, import_drizzle_orm2.relations)(applicationDocuments, ({ one }) => ({
      application: one(llcApplications, { fields: [applicationDocuments.applicationId], references: [llcApplications.id] })
    }));
    maintenanceApplicationsRelations = (0, import_drizzle_orm2.relations)(maintenanceApplications, ({ one }) => ({
      order: one(orders, { fields: [maintenanceApplications.orderId], references: [orders.id] })
    }));
    insertProductSchema = (0, import_drizzle_zod.createInsertSchema)(products).omit({ id: true });
    insertOrderSchema = (0, import_drizzle_zod.createInsertSchema)(orders).omit({ id: true, createdAt: true });
    insertLlcApplicationSchema = (0, import_drizzle_zod.createInsertSchema)(llcApplications).omit({ id: true, lastUpdated: true });
    insertApplicationDocumentSchema = (0, import_drizzle_zod.createInsertSchema)(applicationDocuments).omit({ id: true, uploadedAt: true });
    insertMaintenanceApplicationSchema = (0, import_drizzle_zod.createInsertSchema)(maintenanceApplications).omit({ id: true, lastUpdated: true });
    insertContactOtpSchema = (0, import_drizzle_zod.createInsertSchema)(contactOtps).omit({ id: true });
    insertOrderEventSchema = (0, import_drizzle_zod.createInsertSchema)(orderEvents).omit({ id: true, createdAt: true });
    insertMessageReplySchema = (0, import_drizzle_zod.createInsertSchema)(messageReplies).omit({ id: true, createdAt: true });
    discountCodes = (0, import_pg_core2.pgTable)("discount_codes", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      code: (0, import_pg_core2.varchar)("code", { length: 50 }).notNull().unique(),
      description: (0, import_pg_core2.text)("description"),
      discountType: (0, import_pg_core2.varchar)("discount_type", { length: 20 }).notNull().default("percentage"),
      // percentage or fixed
      discountValue: (0, import_pg_core2.integer)("discount_value").notNull(),
      // percentage (0-100) or fixed amount in cents
      minOrderAmount: (0, import_pg_core2.integer)("min_order_amount").default(0),
      // minimum order amount in cents
      maxUses: (0, import_pg_core2.integer)("max_uses"),
      // null = unlimited
      usedCount: (0, import_pg_core2.integer)("used_count").notNull().default(0),
      validFrom: (0, import_pg_core2.timestamp)("valid_from").defaultNow(),
      validUntil: (0, import_pg_core2.timestamp)("valid_until"),
      isActive: (0, import_pg_core2.boolean)("is_active").notNull().default(true),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    });
    insertDiscountCodeSchema = (0, import_drizzle_zod.createInsertSchema)(discountCodes).omit({ id: true, createdAt: true, usedCount: true });
    rateLimitEntries = (0, import_pg_core2.pgTable)("rate_limit_entries", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      identifier: (0, import_pg_core2.text)("identifier").notNull(),
      limitType: (0, import_pg_core2.text)("limit_type").notNull(),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow().notNull()
    }, (table) => ({
      identifierIdx: (0, import_pg_core2.index)("rate_limit_identifier_idx").on(table.identifier),
      createdAtIdx: (0, import_pg_core2.index)("rate_limit_created_at_idx").on(table.createdAt)
    }));
    auditLogs = (0, import_pg_core2.pgTable)("audit_logs", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      action: (0, import_pg_core2.text)("action").notNull(),
      userId: (0, import_pg_core2.varchar)("user_id"),
      targetId: (0, import_pg_core2.text)("target_id"),
      ip: (0, import_pg_core2.text)("ip"),
      userAgent: (0, import_pg_core2.text)("user_agent"),
      details: (0, import_pg_core2.jsonb)("details").$type(),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow().notNull()
    }, (table) => ({
      actionIdx: (0, import_pg_core2.index)("audit_logs_action_idx").on(table.action),
      userIdIdx: (0, import_pg_core2.index)("audit_logs_user_id_idx").on(table.userId),
      createdAtIdx: (0, import_pg_core2.index)("audit_logs_created_at_idx").on(table.createdAt)
    }));
    insertAuditLogSchema = (0, import_drizzle_zod.createInsertSchema)(auditLogs).omit({ id: true, createdAt: true });
    documentAccessLogs = (0, import_pg_core2.pgTable)("document_access_logs", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      documentId: (0, import_pg_core2.integer)("document_id").notNull().references(() => applicationDocuments.id),
      userId: (0, import_pg_core2.varchar)("user_id").references(() => users.id),
      action: (0, import_pg_core2.text)("action").notNull(),
      // view, download, upload, delete
      ip: (0, import_pg_core2.text)("ip"),
      userAgent: (0, import_pg_core2.text)("user_agent"),
      success: (0, import_pg_core2.boolean)("success").notNull().default(true),
      errorMessage: (0, import_pg_core2.text)("error_message"),
      metadata: (0, import_pg_core2.jsonb)("metadata").$type(),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow().notNull()
    }, (table) => ({
      documentIdIdx: (0, import_pg_core2.index)("doc_access_logs_doc_id_idx").on(table.documentId),
      userIdIdx: (0, import_pg_core2.index)("doc_access_logs_user_id_idx").on(table.userId),
      actionIdx: (0, import_pg_core2.index)("doc_access_logs_action_idx").on(table.action),
      createdAtIdx: (0, import_pg_core2.index)("doc_access_logs_created_at_idx").on(table.createdAt)
    }));
    insertDocumentAccessLogSchema = (0, import_drizzle_zod.createInsertSchema)(documentAccessLogs).omit({ id: true, createdAt: true });
    encryptedFields = (0, import_pg_core2.pgTable)("encrypted_fields", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      entityType: (0, import_pg_core2.text)("entity_type").notNull(),
      // llc_application, user, maintenance
      entityId: (0, import_pg_core2.integer)("entity_id").notNull(),
      fieldName: (0, import_pg_core2.text)("field_name").notNull(),
      encryptedValue: (0, import_pg_core2.text)("encrypted_value").notNull(),
      iv: (0, import_pg_core2.text)("iv").notNull(),
      hash: (0, import_pg_core2.text)("hash").notNull(),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow().notNull(),
      updatedAt: (0, import_pg_core2.timestamp)("updated_at").defaultNow().notNull()
    }, (table) => ({
      entityIdx: (0, import_pg_core2.index)("encrypted_fields_entity_idx").on(table.entityType, table.entityId)
    }));
    consultationTypes = (0, import_pg_core2.pgTable)("consultation_types", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      name: (0, import_pg_core2.text)("name").notNull(),
      // Fiscal, Banking, Strategy, etc.
      nameEs: (0, import_pg_core2.text)("name_es").notNull(),
      nameEn: (0, import_pg_core2.text)("name_en").notNull(),
      nameCa: (0, import_pg_core2.text)("name_ca").notNull(),
      description: (0, import_pg_core2.text)("description"),
      descriptionEs: (0, import_pg_core2.text)("description_es"),
      descriptionEn: (0, import_pg_core2.text)("description_en"),
      descriptionCa: (0, import_pg_core2.text)("description_ca"),
      duration: (0, import_pg_core2.integer)("duration").notNull().default(30),
      // in minutes
      price: (0, import_pg_core2.integer)("price").notNull().default(0),
      // in cents (EUR)
      isActive: (0, import_pg_core2.boolean)("is_active").notNull().default(true),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    }, (table) => ({
      isActiveIdx: (0, import_pg_core2.index)("consultation_types_is_active_idx").on(table.isActive)
    }));
    consultationAvailability = (0, import_pg_core2.pgTable)("consultation_availability", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      dayOfWeek: (0, import_pg_core2.integer)("day_of_week").notNull(),
      // 0=Sunday, 1=Monday, etc.
      startTime: (0, import_pg_core2.text)("start_time").notNull(),
      // "09:00"
      endTime: (0, import_pg_core2.text)("end_time").notNull(),
      // "10:00"
      isActive: (0, import_pg_core2.boolean)("is_active").notNull().default(true),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    }, (table) => ({
      dayOfWeekIdx: (0, import_pg_core2.index)("consultation_avail_day_idx").on(table.dayOfWeek)
    }));
    consultationBlockedDates = (0, import_pg_core2.pgTable)("consultation_blocked_dates", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      date: (0, import_pg_core2.timestamp)("date").notNull(),
      reason: (0, import_pg_core2.text)("reason"),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    }, (table) => ({
      dateIdx: (0, import_pg_core2.index)("consultation_blocked_date_idx").on(table.date)
    }));
    consultationBookings = (0, import_pg_core2.pgTable)("consultation_bookings", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      bookingCode: (0, import_pg_core2.text)("booking_code").unique().notNull(),
      userId: (0, import_pg_core2.varchar)("user_id").notNull().references(() => users.id),
      consultationTypeId: (0, import_pg_core2.integer)("consultation_type_id").notNull().references(() => consultationTypes.id),
      scheduledDate: (0, import_pg_core2.timestamp)("scheduled_date").notNull(),
      scheduledTime: (0, import_pg_core2.text)("scheduled_time").notNull(),
      // "10:00"
      duration: (0, import_pg_core2.integer)("duration").notNull(),
      // in minutes
      status: (0, import_pg_core2.text)("status").notNull().default("pending"),
      // pending, confirmed, completed, cancelled, no_show, rescheduled
      // Pre-consultation questionnaire
      hasLlc: (0, import_pg_core2.text)("has_llc"),
      // yes, no
      llcState: (0, import_pg_core2.text)("llc_state"),
      estimatedRevenue: (0, import_pg_core2.text)("estimated_revenue"),
      countryOfResidence: (0, import_pg_core2.text)("country_of_residence"),
      mainTopic: (0, import_pg_core2.text)("main_topic"),
      additionalNotes: (0, import_pg_core2.text)("additional_notes"),
      // Admin notes
      adminNotes: (0, import_pg_core2.text)("admin_notes"),
      // Meeting info
      meetingLink: (0, import_pg_core2.text)("meeting_link"),
      // Timestamps
      confirmedAt: (0, import_pg_core2.timestamp)("confirmed_at"),
      completedAt: (0, import_pg_core2.timestamp)("completed_at"),
      cancelledAt: (0, import_pg_core2.timestamp)("cancelled_at"),
      cancelReason: (0, import_pg_core2.text)("cancel_reason"),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core2.timestamp)("updated_at").defaultNow()
    }, (table) => ({
      userIdIdx: (0, import_pg_core2.index)("consultation_bookings_user_id_idx").on(table.userId),
      typeIdIdx: (0, import_pg_core2.index)("consultation_bookings_type_id_idx").on(table.consultationTypeId),
      statusIdx: (0, import_pg_core2.index)("consultation_bookings_status_idx").on(table.status),
      scheduledDateIdx: (0, import_pg_core2.index)("consultation_bookings_date_idx").on(table.scheduledDate),
      bookingCodeIdx: (0, import_pg_core2.index)("consultation_bookings_code_idx").on(table.bookingCode)
    }));
    consultationTypesRelations = (0, import_drizzle_orm2.relations)(consultationTypes, ({ many }) => ({
      bookings: many(consultationBookings)
    }));
    consultationBookingsRelations = (0, import_drizzle_orm2.relations)(consultationBookings, ({ one }) => ({
      user: one(users, { fields: [consultationBookings.userId], references: [users.id] }),
      consultationType: one(consultationTypes, { fields: [consultationBookings.consultationTypeId], references: [consultationTypes.id] })
    }));
    insertConsultationTypeSchema = (0, import_drizzle_zod.createInsertSchema)(consultationTypes).omit({ id: true, createdAt: true });
    insertConsultationAvailabilitySchema = (0, import_drizzle_zod.createInsertSchema)(consultationAvailability).omit({ id: true, createdAt: true });
    insertConsultationBlockedDateSchema = (0, import_drizzle_zod.createInsertSchema)(consultationBlockedDates).omit({ id: true, createdAt: true });
    insertConsultationBookingSchema = (0, import_drizzle_zod.createInsertSchema)(consultationBookings).omit({ id: true, createdAt: true, updatedAt: true });
    accountingTransactions = (0, import_pg_core2.pgTable)("accounting_transactions", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      type: (0, import_pg_core2.text)("type").notNull(),
      // income, expense
      category: (0, import_pg_core2.text)("category").notNull(),
      // llc_formation, maintenance, consultation, state_fees, etc.
      amount: (0, import_pg_core2.integer)("amount").notNull(),
      // in cents (positive for income, negative for expenses)
      currency: (0, import_pg_core2.varchar)("currency", { length: 3 }).notNull().default("EUR"),
      description: (0, import_pg_core2.text)("description"),
      orderId: (0, import_pg_core2.integer)("order_id").references(() => orders.id),
      // optional link to order
      userId: (0, import_pg_core2.varchar)("user_id").references(() => users.id),
      // optional link to user/client
      reference: (0, import_pg_core2.text)("reference"),
      // invoice number, receipt, etc.
      transactionDate: (0, import_pg_core2.timestamp)("transaction_date").notNull().defaultNow(),
      createdBy: (0, import_pg_core2.varchar)("created_by").references(() => users.id),
      // admin who created it
      notes: (0, import_pg_core2.text)("notes"),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core2.timestamp)("updated_at").defaultNow()
    }, (table) => ({
      typeIdx: (0, import_pg_core2.index)("accounting_tx_type_idx").on(table.type),
      categoryIdx: (0, import_pg_core2.index)("accounting_tx_category_idx").on(table.category),
      dateIdx: (0, import_pg_core2.index)("accounting_tx_date_idx").on(table.transactionDate),
      orderIdIdx: (0, import_pg_core2.index)("accounting_tx_order_id_idx").on(table.orderId)
    }));
    insertAccountingTransactionSchema = (0, import_drizzle_zod.createInsertSchema)(accountingTransactions).omit({ id: true, createdAt: true, updatedAt: true });
    guestVisitors = (0, import_pg_core2.pgTable)("guest_visitors", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      email: (0, import_pg_core2.text)("email"),
      source: (0, import_pg_core2.text)("source").notNull(),
      ip: (0, import_pg_core2.text)("ip"),
      userAgent: (0, import_pg_core2.text)("user_agent"),
      language: (0, import_pg_core2.text)("language"),
      page: (0, import_pg_core2.text)("page"),
      referrer: (0, import_pg_core2.text)("referrer"),
      metadata: (0, import_pg_core2.text)("metadata"),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    }, (table) => ({
      emailIdx: (0, import_pg_core2.index)("guest_visitors_email_idx").on(table.email),
      sourceIdx: (0, import_pg_core2.index)("guest_visitors_source_idx").on(table.source)
    }));
    insertGuestVisitorSchema = (0, import_drizzle_zod.createInsertSchema)(guestVisitors).omit({ id: true, createdAt: true });
    paymentAccounts = (0, import_pg_core2.pgTable)("payment_accounts", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      label: (0, import_pg_core2.text)("label").notNull(),
      holder: (0, import_pg_core2.text)("holder").notNull(),
      bankName: (0, import_pg_core2.text)("bank_name").notNull(),
      accountType: (0, import_pg_core2.text)("account_type").notNull().default("checking"),
      accountNumber: (0, import_pg_core2.text)("account_number"),
      routingNumber: (0, import_pg_core2.text)("routing_number"),
      iban: (0, import_pg_core2.text)("iban"),
      swift: (0, import_pg_core2.text)("swift"),
      address: (0, import_pg_core2.text)("address"),
      isActive: (0, import_pg_core2.boolean)("is_active").notNull().default(true),
      sortOrder: (0, import_pg_core2.integer)("sort_order").notNull().default(0),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    });
    insertPaymentAccountSchema = (0, import_drizzle_zod.createInsertSchema)(paymentAccounts).omit({ id: true, createdAt: true });
  }
});

// server/db.ts
var import_node_postgres, import_pg, Pool, connectionString, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    import_node_postgres = require("drizzle-orm/node-postgres");
    import_pg = __toESM(require("pg"), 1);
    init_schema();
    ({ Pool } = import_pg.default);
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    connectionString = process.env.DATABASE_URL;
    if (!connectionString.includes("sslmode=")) {
      connectionString += (connectionString.includes("?") ? "&" : "?") + "sslmode=no-verify";
    }
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 15e3,
      idleTimeoutMillis: 6e4,
      max: 25,
      min: 2,
      allowExitOnIdle: false,
      keepAlive: true,
      keepAliveInitialDelayMillis: 1e4
    });
    pool.on("error", (err) => {
      console.error("Database pool error:", err.message);
    });
    pool.on("connect", () => {
      if (process.env.NODE_ENV === "development") {
        console.log("Database connection established");
      }
    });
    db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });
  }
});

// server/lib/email-translations.ts
function getEmailTranslations(lang = "es") {
  return translations[lang] || translations.es;
}
function getCommonDoubtsText(lang = "es") {
  const t = getEmailTranslations(lang);
  return t.common.doubts;
}
function getDefaultClientName(lang = "es") {
  const t = getEmailTranslations(lang);
  return t.common.client;
}
function getWelcomeEmailSubject(lang = "es") {
  const subjects = {
    es: "\xA1Bienvenido a Easy US LLC!",
    en: "Welcome to Easy US LLC!",
    ca: "Benvingut a Easy US LLC!",
    fr: "Bienvenue chez Easy US LLC !",
    de: "Willkommen bei Easy US LLC!",
    it: "Benvenuto in Easy US LLC!",
    pt: "Bem-vindo \xE0 Easy US LLC!"
  };
  return subjects[lang] || subjects.es;
}
function getRegistrationOtpSubject(lang = "es") {
  const subjects = {
    es: "Bienvenido a Easy US LLC - Verifica tu cuenta",
    en: "Welcome to Easy US LLC - Verify your account",
    ca: "Benvingut a Easy US LLC - Verifica el teu compte",
    fr: "Bienvenue chez Easy US LLC - V\xE9rifiez votre compte",
    de: "Willkommen bei Easy US LLC - Verifizieren Sie Ihr Konto",
    it: "Benvenuto in Easy US LLC - Verifica il tuo account",
    pt: "Bem-vindo \xE0 Easy US LLC - Verifique a sua conta"
  };
  return subjects[lang] || subjects.es;
}
function getOtpSubject(lang = "es") {
  const subjects = {
    es: "Tu c\xF3digo de verificaci\xF3n | Easy US LLC",
    en: "Your verification code | Easy US LLC",
    ca: "El teu codi de verificaci\xF3 | Easy US LLC",
    fr: "Votre code de v\xE9rification | Easy US LLC",
    de: "Ihr Verifizierungscode | Easy US LLC",
    it: "Il tuo codice di verifica | Easy US LLC",
    pt: "O seu c\xF3digo de verifica\xE7\xE3o | Easy US LLC"
  };
  return subjects[lang] || subjects.es;
}
function getSecurityOtpSubject(lang = "es") {
  const subjects = {
    es: "Verificaci\xF3n de seguridad - Easy US LLC",
    en: "Security verification - Easy US LLC",
    ca: "Verificaci\xF3 de seguretat - Easy US LLC",
    fr: "V\xE9rification de s\xE9curit\xE9 - Easy US LLC",
    de: "Sicherheitsverifizierung - Easy US LLC",
    it: "Verifica di sicurezza - Easy US LLC",
    pt: "Verifica\xE7\xE3o de seguran\xE7a - Easy US LLC"
  };
  return subjects[lang] || subjects.es;
}
function getPasswordResetSubject(lang = "es") {
  const subjects = {
    es: "C\xF3digo de verificaci\xF3n - Easy US LLC",
    en: "Verification code - Easy US LLC",
    ca: "Codi de verificaci\xF3 - Easy US LLC",
    fr: "Code de v\xE9rification - Easy US LLC",
    de: "Verifizierungscode - Easy US LLC",
    it: "Codice di verifica - Easy US LLC",
    pt: "C\xF3digo de verifica\xE7\xE3o - Easy US LLC"
  };
  return subjects[lang] || subjects.es;
}
function getVerifyEmailSubject(lang = "es") {
  const subjects = {
    es: "Verifica tu email - Easy US LLC",
    en: "Verify your email - Easy US LLC",
    ca: "Verifica el teu email - Easy US LLC",
    fr: "V\xE9rifiez votre email - Easy US LLC",
    de: "Verifizieren Sie Ihre E-Mail - Easy US LLC",
    it: "Verifica la tua email - Easy US LLC",
    pt: "Verifique o seu email - Easy US LLC"
  };
  return subjects[lang] || subjects.es;
}
var translations;
var init_email_translations = __esm({
  "server/lib/email-translations.ts"() {
    "use strict";
    translations = {
      es: {
        common: {
          greeting: "Hola",
          closing: "Saludos,",
          doubts: "Si tienes cualquier duda, responde directamente a este correo.",
          client: "Cliente"
        },
        otp: {
          thanks: "Gracias por continuar con tu proceso en Easy US LLC.",
          forSecurity: "Para garantizar la seguridad de tu cuenta, utiliza el siguiente c\xF3digo de verificaci\xF3n:",
          yourCode: "Tu c\xF3digo OTP:",
          important: "Importante:",
          personalAndConfidential: "Este c\xF3digo es personal y confidencial",
          validFor: "Tiene una validez limitada a <strong>15 minutos</strong> por motivos de seguridad",
          doNotShare: "No lo compartas con nadie",
          ignoreMessage: "Si no has solicitado este c\xF3digo, puedes ignorar este mensaje con total tranquilidad.",
          ipDetected: "Intento de acceso detectado desde la IP:"
        },
        welcome: {
          welcomeMessage: "\xA1Bienvenido a Easy US LLC! Nos alegra mucho tenerte con nosotros.",
          accountCreated: "Tu cuenta ha sido creada correctamente y ya puedes empezar a explorar todo lo que podemos hacer juntos. Desde tu \xC1rea Cliente tendr\xE1s acceso a:",
          accessFrom: "Desde tu \xC1rea Cliente tendr\xE1s acceso a:",
          realTimeTracking: "Seguimiento en tiempo real de tus solicitudes",
          documentCenter: "Centro de documentaci\xF3n para descargar todos tus archivos",
          professionalTools: "Herramientas profesionales como generador de facturas",
          fiscalCalendar: "Calendario fiscal con tus fechas importantes",
          directSupport: "Comunicaci\xF3n directa con nuestro equipo de soporte",
          hereToHelp: "Estamos aqu\xED para ayudarte en cada paso de tu aventura empresarial en Estados Unidos. Si tienes cualquier pregunta, no dudes en escribirnos.",
          exploreButton: "Explorar Mi \xC1rea Cliente"
        },
        accountPendingVerification: {
          accountCreatedBut: "Tu cuenta ha sido creada correctamente, pero necesitas verificar tu email para activarla completamente.",
          actionRequired: "Acci\xF3n requerida:",
          accessAndVerify: "Accede a tu \xC1rea Cliente y verifica tu email para activar tu cuenta y acceder a todas las funciones.",
          verifyButton: "Verificar mi email",
          whileUnverified: "Mientras tu email no est\xE9 verificado, tu cuenta permanecer\xE1 en estado de revisi\xF3n."
        },
        accountUnderReview: {
          underReview: "Queremos informarte de que tu cuenta ha entrado en un breve proceso de revisi\xF3n. No te preocupes, esto es algo completamente rutinario y forma parte de nuestros est\xE1ndares de seguridad para proteger tu informaci\xF3n y garantizar una experiencia segura.",
          whyReview: "\xBFPor qu\xE9 hacemos esto?",
          whyReviewText: "En Easy US LLC nos tomamos muy en serio la seguridad de nuestros clientes. Este proceso nos permite verificar que toda la informaci\xF3n est\xE1 correcta y que tu cuenta est\xE1 debidamente protegida.",
          duringProcess: "Durante este breve per\xEDodo, las funciones de tu cuenta estar\xE1n temporalmente limitadas. Esto significa que no podr\xE1s realizar nuevos pedidos ni modificar informaci\xF3n existente, pero no te preocupes: esta situaci\xF3n es temporal y no afectar\xE1 a ning\xFAn tr\xE1mite que ya est\xE9 en curso.",
          whatHappens: "\xBFQu\xE9 pasar\xE1 ahora?",
          step1: "Nuestro equipo revisar\xE1 la informaci\xF3n de tu cuenta (normalmente en 24-48 horas laborables)",
          step2: "Te notificaremos por este mismo correo en cuanto la revisi\xF3n haya finalizado",
          step3: "Si necesitamos alg\xFAn documento adicional, te lo haremos saber de forma clara y sencilla",
          teamReviewing: "Mientras tanto, si tienes cualquier pregunta o necesitas ayuda, no dudes en responder a este correo. Estamos aqu\xED para ayudarte en todo lo que necesites.",
          patience: "Gracias por tu paciencia y confianza. Sabemos que tu tiempo es valioso y haremos todo lo posible para resolver esto lo antes posible.",
          closing: "Un abrazo del equipo de Easy US LLC"
        },
        accountVip: {
          updatedToVip: "Tu cuenta ha sido actualizada al estado VIP.",
          benefits: "Beneficios VIP:",
          priorityAttention: "Atenci\xF3n prioritaria y gesti\xF3n acelerada",
          preferentialTracking: "Seguimiento preferente por nuestro equipo",
          fullAccess: "Acceso completo a todos los servicios",
          viewDashboard: "Ver Mi \xC1rea Cliente"
        },
        accountReactivated: {
          reactivated: "Tu cuenta ha sido reactivada correctamente.",
          canAccess: "Ya puedes acceder a tu \xC1rea Cliente y utilizar todos nuestros servicios con normalidad.",
          viewDashboard: "Ver Mi \xC1rea Cliente"
        },
        accountDeactivated: {
          deactivated: "Lamentamos informarte de que tu cuenta ha sido desactivada.",
          cannotAccess: "Mientras tu cuenta permanezca en este estado, no podr\xE1s acceder a tu \xC1rea Cliente ni realizar gestiones a trav\xE9s de nuestra plataforma.",
          contactSupport: "Si crees que esto es un error o deseas obtener m\xE1s informaci\xF3n, por favor contacta con nuestro equipo de soporte respondiendo a este correo."
        },
        confirmation: {
          greatNews: "\xA1Excelente noticia! Hemos recibido correctamente tu solicitud y ya estamos trabajando en ella. A partir de ahora, nuestro equipo se encargar\xE1 de todo.",
          details: "Detalles de tu Solicitud",
          reference: "Referencia:",
          service: "Servicio:",
          company: "Empresa:",
          state: "Estado:",
          currentStatus: "Estado actual:",
          inReview: "En revisi\xF3n",
          whatNow: "\xBFQu\xE9 pasa ahora?",
          validatingInfo: "Nuestro equipo est\xE1 validando toda la informaci\xF3n que nos proporcionaste. En las pr\xF3ximas horas recibir\xE1s actualizaciones sobre el progreso de tu solicitud directamente en tu correo. Tambi\xE9n podr\xE1s seguir el estado en tiempo real desde tu \xC1rea Cliente.",
          nextSteps: "Pr\xF3ximos Pasos",
          step1: "Verificaremos que toda la informaci\xF3n es correcta",
          step2: "Iniciaremos los tr\xE1mites con las autoridades correspondientes",
          step3: "Te mantendremos informado en cada etapa del proceso",
          trackButton: "Ver Estado de mi Solicitud",
          questionRef: "\xBFTienes alguna pregunta? Simplemente responde a este correo mencionando tu referencia y te ayudaremos encantados."
        },
        autoReply: {
          receivedMessage: "Tu mensaje ha sido recibido correctamente.",
          ticketNumber: "N\xFAmero de ticket",
          estimatedResponse: "Tiempo estimado de respuesta: <strong>24-48 horas laborables</strong>",
          responding: "Nuestro equipo revisar\xE1 tu consulta y te responder\xE1 lo antes posible. Si necesitas a\xF1adir informaci\xF3n adicional, responde directamente a este correo.",
          seeMessages: "Ver Mensajes"
        },
        orderUpdate: {
          statusChanged: "El estado de tu pedido ha sido actualizado.",
          orderLabel: "Pedido:",
          newStatus: "Nuevo estado:",
          statusPending: "Pendiente",
          statusProcessing: "En proceso",
          statusPaid: "Pagado",
          statusFiled: "Presentado",
          statusDocumentsReady: "Documentos listos",
          statusCompleted: "Completado",
          statusCancelled: "Cancelado",
          clarification: "Para cualquier aclaraci\xF3n sobre esta actualizaci\xF3n, responde directamente a este correo.",
          trackButton: "Ver detalles completos"
        },
        orderCompleted: {
          llcReady: "\xA1Tu LLC est\xE1 lista!",
          congratulations: "\xA1Felicidades! Tu pedido ha sido completado con \xE9xito. Todo est\xE1 listo para que puedas empezar a operar con tu empresa en Estados Unidos.",
          docsReady: "Tu documentaci\xF3n est\xE1 lista",
          accessDocuments: "Ya puedes acceder y descargar todos los documentos de tu empresa desde tu Centro de Documentaci\xF3n.",
          whatYouFind: "\xBFQu\xE9 encontrar\xE1s?",
          documentList: "Documentos disponibles:",
          articlesOrg: "Articles of Organization (documento de constituci\xF3n)",
          einLetter: "Carta del EIN del IRS",
          registeredAgent: "Informaci\xF3n del agente registrado",
          additionalGuides: "Gu\xEDas y documentos adicionales seg\xFAn tu servicio",
          viewDocuments: "Ver Mis Documentos",
          nextSteps: "Pr\xF3ximos pasos:",
          activateBanking: "Activar cuenta bancaria (si solicitado)",
          operatingAgreement: "Generar tu Operating Agreement",
          trackExpenses: "Comenzar a registrar ingresos y gastos",
          hereForYou: "Recuerda que seguimos aqu\xED para ayudarte en todo lo que necesites. Si tienes dudas sobre los siguientes pasos, como abrir una cuenta bancaria o configurar tu pasarela de pagos, no dudes en escribirnos.",
          feedbackRequest: "Tu experiencia es muy importante para nosotros. Si tienes un momento, nos encantar\xEDa conocer tu opini\xF3n sobre nuestro servicio."
        },
        noteReceived: {
          teamNote: "Tienes un nuevo mensaje de nuestro equipo",
          relatedToOrder: "relacionado con tu pedido",
          respondNote: "Puedes responder directamente a este correo o acceder a tu \xC1rea Cliente para ver el historial completo.",
          viewClientArea: "Ver Mi \xC1rea Cliente"
        },
        adminNote: {
          messageAbout: "Tienes un mensaje importante sobre tu solicitud:",
          viewTicket: "Ver Ticket",
          viewClientArea: "Ver Mi \xC1rea Cliente"
        },
        paymentRequest: {
          paymentRequired: "Se ha generado una solicitud de pago para continuar con tu tr\xE1mite",
          messageLabel: "Mensaje:",
          amount: "por un valor de",
          payNow: "Realizar Pago",
          buttonFallback: "Si el bot\xF3n no funciona, copia y pega este enlace:",
          securePayment: "El pago se procesa de forma segura a trav\xE9s de Stripe."
        },
        documentRequest: {
          needDocument: "Nuestro equipo requiere que subas el siguiente documento:",
          messageLabel: "Mensaje:",
          documentType: "Documento solicitado:",
          referenceTicket: "Ticket de referencia:",
          important: "Importante:",
          uploadInstruction: "Por favor, sube el documento solicitado lo antes posible para evitar retrasos en el proceso.",
          uploadButton: "Subir Documento"
        },
        documentUploaded: {
          documentReceived: "Hemos a\xF1adido un nuevo documento a tu expediente:",
          forOrder: "Pedido:",
          accessDownload: "Puedes acceder y descargar este documento desde tu \xC1rea Cliente.",
          reviewing: "Nuestro equipo lo revisar\xE1 y te notificaremos si es necesaria alguna acci\xF3n adicional.",
          viewDocuments: "Ver Mis Documentos",
          trackButton: "Ver estado de mi solicitud"
        },
        messageReply: {
          newReply: "Tienes una nueva respuesta en tu conversaci\xF3n:",
          repliedToQuery: "Hemos respondido a tu consulta",
          ticket: "Ticket:",
          viewConversation: "Ver conversaci\xF3n",
          viewClientArea: "Ver Mi \xC1rea Cliente"
        },
        passwordChangeOtp: {
          passwordChangeRequest: "Has solicitado cambiar tu contrase\xF1a. Usa este c\xF3digo para verificar tu identidad:",
          useCode: "Utiliza el siguiente c\xF3digo para confirmar el cambio:",
          yourCode: "Tu c\xF3digo de verificaci\xF3n:",
          important: "Importante:",
          validFor: "Este c\xF3digo expira en <strong>10 minutos</strong>",
          doNotShare: "No lo compartas con nadie",
          notRequested: "Si no solicitaste este cambio, ignora este mensaje."
        },
        profileChangeOtp: {
          title: "Verificaci\xF3n de Identidad",
          sensitiveChangeRequest: "Se ha solicitado un cambio en los datos sensibles de tu perfil. Para confirmar tu identidad, utiliza el siguiente c\xF3digo de verificaci\xF3n:",
          yourCode: "Tu c\xF3digo de verificaci\xF3n:",
          important: "Importante:",
          personalAndConfidential: "Este c\xF3digo es personal y confidencial",
          validFor: "Tiene una validez de <strong>24 horas</strong>",
          doNotShare: "No lo compartas con nadie",
          ignoreMessage: "Si no has solicitado este cambio, puedes ignorar este mensaje con total tranquilidad."
        },
        accountLocked: {
          locked: "Por su seguridad, su cuenta ha sido temporalmente bloqueada tras detectar m\xFAltiples intentos de acceso fallidos.",
          attempts: "Para desbloquear su cuenta y verificar su identidad, necesitamos que nos env\xEDe:",
          verifyIdentity: "Para desbloquear su cuenta y verificar su identidad, necesitamos que nos env\xEDe:",
          idRequirement: "Imagen del DNI/Pasaporte de alta resoluci\xF3n (ambas caras)",
          birthDateConfirm: "Su fecha de nacimiento confirmada",
          referenceTicket: "Su Ticket ID de referencia es:",
          contactSupport: "Para desbloquear tu cuenta, contacta con nuestro equipo de soporte:",
          resetPassword: "Restablecer contrase\xF1a",
          unlockButton: "Contactar Soporte"
        },
        renewalReminder: {
          reminderText: "Te recordamos que el pack de mantenimiento de tu LLC",
          expiresIn: "Vence en",
          dueDate: "Fecha de vencimiento:",
          daysRemaining: "D\xEDas restantes:",
          withoutMaintenance: "Sin el pack de mantenimiento activo, tu LLC puede perder su buen estado legal. Esto incluye:",
          registeredAgentActive: "Agente registrado activo",
          annualReports: "Presentaci\xF3n de informes anuales",
          taxCompliance: "Cumplimiento fiscal (IRS 1120/5472)",
          legalAddress: "Domicilio legal en Estados Unidos",
          renewNow: "Renovar Ahora",
          whatHappens: "\xBFQu\xE9 pasa si no renuevo?",
          penalties: "Posibles penalizaciones y recargos",
          agentExpires: "Tu registered agent expirar\xE1",
          goodStanding: "Tu LLC podr\xEDa perder el buen estado",
          viewCalendar: "Ver calendario fiscal"
        },
        registrationOtp: {
          almostDone: "Gracias por registrarte en Easy US LLC. Tu c\xF3digo de verificaci\xF3n es:",
          confirmEmail: "Para completar el registro de tu cuenta, introduce el siguiente c\xF3digo de verificaci\xF3n:",
          yourCode: "Tu c\xF3digo de verificaci\xF3n:",
          important: "Importante:",
          validFor: "Este c\xF3digo expira en",
          doNotShare: "No lo compartas con nadie",
          clientIdLabel: "Tu ID de cliente es:",
          ignoreMessage: "Si no has creado una cuenta con nosotros, puedes ignorar este mensaje."
        },
        operatingAgreementReady: {
          ready: "\xA1Tu Operating Agreement est\xE1 listo!",
          generated: "Tenemos excelentes noticias para ti.",
          llcData: "Datos de tu LLC",
          companyLabel: "Empresa:",
          stateLabel: "Estado:",
          einLabel: "EIN:",
          whatIs: "\xBFQu\xE9 es el Operating Agreement?",
          explanation: "Es el documento legal que establece las reglas de funcionamiento de tu LLC, incluyendo la estructura de propiedad, distribuci\xF3n de beneficios y responsabilidades de los miembros.",
          fullExplanation: "Es el documento legal fundamental de tu LLC. Define c\xF3mo se gestiona tu empresa, las responsabilidades del propietario y las reglas de operaci\xF3n. Aunque en algunos estados no es obligatorio, es altamente recomendable tenerlo porque:",
          reason1: "Refuerza la separaci\xF3n entre tus finanzas personales y las de la empresa",
          reason2: "Es requerido por bancos y procesadores de pago como Stripe",
          reason3: "Proporciona protecci\xF3n legal adicional para ti como propietario",
          reason4: "Documenta oficialmente la estructura de tu negocio",
          generateButton: "Generar mi Operating Agreement",
          autoGenerated: "El documento se generar\xE1 autom\xE1ticamente con los datos de tu LLC y se guardar\xE1 en tu Centro de Documentaci\xF3n para que puedas descargarlo cuando lo necesites.",
          viewDocument: "Ver mi documento",
          tip: "Consejo:",
          tipText: "Guarda una copia firmada de este documento junto con tus otros archivos importantes de la empresa."
        },
        documentApproved: {
          title: "Documento Aprobado",
          approved: "Aprobado",
          reviewedAndApproved: "Tu documento ha sido revisado y aprobado correctamente.",
          viewDocuments: "Ver mis documentos"
        },
        documentRejected: {
          title: "Documento Rechazado - Acci\xF3n Requerida",
          rejected: "Rechazado",
          reviewedAndRejected: "Tu documento ha sido revisado y rechazado.",
          reason: "Motivo",
          pleaseReupload: "Por favor, accede a tu panel de cliente y sube nuevamente el documento corregido.",
          viewDocuments: "Ver mis documentos"
        },
        profileChangesVerified: {
          title: "Cambios de Perfil Verificados con OTP",
          client: "Cliente",
          email: "Email",
          clientId: "ID de Cliente",
          fieldsModified: "Campos modificados",
          verifiedWithOtp: "Cambio verificado con OTP"
        },
        abandonedApplication: {
          incomplete: "Tu solicitud est\xE1 incompleta",
          noticeText: "Hemos notado que empezaste a completar tu solicitud de",
          importantNote: "Nota importante:",
          draftDeletion: "Tu borrador se eliminar\xE1 autom\xE1ticamente si no lo completas. Por motivos de seguridad y protecci\xF3n de datos, no podemos mantener solicitudes incompletas indefinidamente.",
          understandDoubts: "Entendemos que dar el paso de crear una LLC puede generar algunas dudas. Queremos que sepas que estamos aqu\xED para ayudarte en cada paso del proceso.",
          questionsHelp: "Si tienes alguna pregunta o necesitas asistencia para completar tu solicitud, simplemente responde a este correo y te ayudaremos encantados.",
          whyChoose: "\xBFPor qu\xE9 elegir Easy US LLC?",
          reason1: "Formaci\xF3n completa en 48-72 horas",
          reason2: "Asistencia en espa\xF1ol durante todo el proceso",
          reason3: "Obtenci\xF3n del EIN incluida",
          reason4: "Ayuda con apertura de cuenta bancaria",
          reason5: "Soporte continuo post-formaci\xF3n",
          noMoreReminders: "Si finalmente decides no continuar, no te enviaremos m\xE1s recordatorios sobre esta solicitud. Tu privacidad es importante para nosotros.",
          savedDraft: "No te preocupes, hemos guardado todo tu progreso para que puedas continuar exactamente donde lo dejaste.",
          continueButton: "Continuar mi Solicitud",
          tip: "Consejo:",
          tipText: "Completa tu solicitud para que podamos empezar a trabajar en tu LLC lo antes posible.",
          expiring: "Tu borrador expirar\xE1 en 48 horas si no lo completas.",
          llcFormation: "constituci\xF3n de tu LLC",
          maintenancePack: "paquete de mantenimiento",
          dontLoseProgress: "No pierdas tu progreso. Retoma tu solicitud ahora y completa el proceso en pocos minutos.",
          lastHours: "\xFAltimas horas",
          autoDeleteWarning: "Tu solicitud se eliminar\xE1 autom\xE1ticamente si no la completas."
        },
        calculatorResults: {
          results: "Resultados de tu c\xE1lculo",
          introText: "Aqu\xED tienes el resumen de tu comparaci\xF3n fiscal que solicitaste. Hemos analizado los n\xFAmeros y queremos que tengas toda la informaci\xF3n para tomar la mejor decisi\xF3n para tu negocio.",
          summary: "Resumen de tu An\xE1lisis",
          income: "Ingresos anuales:",
          expenses: "Gastos deducibles:",
          autonomoTax: "Impuestos como aut\xF3nomo:",
          llcTax: "Impuestos con LLC:",
          potentialSavings: "Tu ahorro potencial:",
          savings: "Ahorro estimado:",
          withLLC: "Con una LLC en Estados Unidos, podr\xEDas optimizar significativamente tu carga fiscal mientras operas de forma completamente legal. Este ahorro se mantiene a\xF1o tras a\xF1o, lo que puede suponer una diferencia importante para tu negocio a largo plazo.",
          learnMore: "\xBFTe gustar\xEDa saber m\xE1s sobre c\xF3mo funciona? Estaremos encantados de resolver todas tus dudas sin ning\xFAn compromiso.",
          viewServices: "Ver Nuestros Servicios",
          disclaimer: "Este c\xE1lculo es orientativo y se basa en los datos que proporcionaste. Para un an\xE1lisis personalizado de tu situaci\xF3n, no dudes en contactarnos."
        },
        newsletter: {
          confirmed: "Tu suscripci\xF3n ha sido confirmada correctamente.",
          willReceive: "Recibir\xE1s informaci\xF3n relevante sobre servicios, actualizaciones y novedades relacionadas con Easy US LLC.",
          unsubscribe: "Puedes darte de baja en cualquier momento desde el enlace incluido en nuestros correos."
        },
        orderEvent: {
          update: "Tu pedido tiene una actualizaci\xF3n:",
          date: "Fecha:",
          viewDetails: "Ver Detalles"
        }
      },
      en: {
        common: {
          greeting: "Hello",
          closing: "Best regards,",
          doubts: "If you have any questions, reply directly to this email.",
          client: "Client"
        },
        otp: {
          thanks: "Thank you for continuing with your process at Easy US LLC.",
          forSecurity: "To ensure the security of your account, use the following verification code:",
          yourCode: "Your OTP code:",
          important: "Important:",
          personalAndConfidential: "This code is personal and confidential",
          validFor: "It is valid for <strong>15 minutes</strong> for security reasons",
          doNotShare: "Do not share it with anyone",
          ignoreMessage: "If you did not request this code, you can safely ignore this message.",
          ipDetected: "Login attempt detected from IP:"
        },
        welcome: {
          welcomeMessage: "Welcome to Easy US LLC! We're thrilled to have you with us.",
          accountCreated: "Your account has been created successfully and you can start exploring everything we can do together. From your Client Area you'll have access to:",
          accessFrom: "From your Client Area you'll have access to:",
          realTimeTracking: "Real-time tracking of your requests",
          documentCenter: "Documentation center to download all your files",
          professionalTools: "Professional tools like invoice generator",
          fiscalCalendar: "Fiscal calendar with your important dates",
          directSupport: "Direct communication with our support team",
          hereToHelp: "We're here to help you at every step of your business journey in the United States. If you have any questions, don't hesitate to contact us.",
          exploreButton: "Explore My Client Area"
        },
        accountPendingVerification: {
          accountCreatedBut: "Your account has been created successfully, but you need to verify your email to fully activate it.",
          actionRequired: "Action required:",
          accessAndVerify: "Access your Client Area and verify your email to activate your account and access all features.",
          verifyButton: "Verify my email",
          whileUnverified: "While your email is not verified, your account will remain under review."
        },
        accountUnderReview: {
          underReview: "We wanted to let you know that your account has entered a brief review process. Don't worry, this is completely routine and is part of our security standards to protect your information and ensure a safe experience.",
          whyReview: "Why do we do this?",
          whyReviewText: "At Easy US LLC, we take our clients' security very seriously. This process allows us to verify that all information is correct and that your account is properly protected.",
          duringProcess: "During this brief period, your account functions will be temporarily limited. This means you won't be able to place new orders or modify existing information, but don't worry: this situation is temporary and won't affect any procedures already in progress.",
          whatHappens: "What happens now?",
          step1: "Our team will review your account information (usually within 24-48 business hours)",
          step2: "We'll notify you by this same email once the review is complete",
          step3: "If we need any additional documents, we'll let you know clearly and simply",
          teamReviewing: "In the meantime, if you have any questions or need help, don't hesitate to reply to this email. We're here to help you with whatever you need.",
          patience: "Thank you for your patience and trust. We know your time is valuable and we'll do everything possible to resolve this as quickly as possible.",
          closing: "Warm regards from the Easy US LLC team"
        },
        accountVip: {
          updatedToVip: "Your account has been upgraded to VIP status.",
          benefits: "VIP Benefits:",
          priorityAttention: "Priority attention and expedited processing",
          preferentialTracking: "Preferential tracking by our team",
          fullAccess: "Full access to all services",
          viewDashboard: "View My Client Area"
        },
        accountReactivated: {
          reactivated: "Your account has been successfully reactivated.",
          canAccess: "You can now access your Client Area and use all our services normally.",
          viewDashboard: "View My Client Area"
        },
        accountDeactivated: {
          deactivated: "We regret to inform you that your account has been deactivated.",
          cannotAccess: "While your account remains in this state, you will not be able to access your Client Area or perform any operations through our platform.",
          contactSupport: "If you believe this is an error or would like more information, please contact our support team by replying to this email."
        },
        confirmation: {
          greatNews: "Great news! We have received your request and are already working on it. From now on, our team will take care of everything.",
          details: "Request Details",
          reference: "Reference:",
          service: "Service:",
          company: "Company:",
          state: "State:",
          currentStatus: "Current status:",
          inReview: "Under review",
          whatNow: "What happens now?",
          validatingInfo: "Our team is validating all the information you provided. In the next few hours you will receive updates on the progress of your request directly to your email. You can also track the status in real time from your Client Area.",
          nextSteps: "Next Steps",
          step1: "We will verify that all information is correct",
          step2: "We will begin the procedures with the corresponding authorities",
          step3: "We will keep you informed at every stage of the process",
          trackButton: "View My Request Status",
          questionRef: "Have any questions? Simply reply to this email mentioning your reference and we'll be happy to help."
        },
        autoReply: {
          receivedMessage: "Your message has been received successfully.",
          ticketNumber: "Ticket number",
          estimatedResponse: "Estimated response time: <strong>24-48 business hours</strong>",
          responding: "Our team will review your inquiry and respond as soon as possible. If you need to add additional information, reply directly to this email.",
          seeMessages: "View Messages"
        },
        orderUpdate: {
          statusChanged: "Your order status has been updated.",
          orderLabel: "Order:",
          newStatus: "New status:",
          statusPending: "Pending",
          statusProcessing: "Processing",
          statusPaid: "Paid",
          statusFiled: "Filed",
          statusDocumentsReady: "Documents ready",
          statusCompleted: "Completed",
          statusCancelled: "Cancelled",
          clarification: "For any clarification about this update, reply directly to this email.",
          trackButton: "View full details"
        },
        orderCompleted: {
          llcReady: "Your LLC is ready!",
          congratulations: "Congratulations! Your order has been completed successfully. Everything is ready for you to start operating your business in the United States.",
          docsReady: "Your documentation is ready",
          accessDocuments: "You can now access and download all your company documents from your Documentation Center.",
          whatYouFind: "What will you find?",
          documentList: "Available documents:",
          articlesOrg: "Articles of Organization (formation document)",
          einLetter: "EIN Letter from the IRS",
          registeredAgent: "Registered agent information",
          additionalGuides: "Guides and additional documents based on your service",
          viewDocuments: "View My Documents",
          nextSteps: "Next steps:",
          activateBanking: "Activate bank account (if requested)",
          operatingAgreement: "Generate your Operating Agreement",
          trackExpenses: "Start tracking income and expenses",
          hereForYou: "Remember we're still here to help you with anything you need. If you have questions about next steps, like opening a bank account or setting up your payment gateway, don't hesitate to contact us.",
          feedbackRequest: "Your experience is very important to us. If you have a moment, we'd love to hear your opinion about our service."
        },
        noteReceived: {
          teamNote: "You have a new message from our team",
          relatedToOrder: "related to your order",
          respondNote: "You can reply directly to this email or access your Client Area to view the complete history.",
          viewClientArea: "View My Client Area"
        },
        adminNote: {
          messageAbout: "You have an important message about your request:",
          viewTicket: "View Ticket",
          viewClientArea: "View My Client Area"
        },
        paymentRequest: {
          paymentRequired: "A payment request has been generated to continue with your process",
          messageLabel: "Message:",
          amount: "for an amount of",
          payNow: "Make Payment",
          buttonFallback: "If the button doesn't work, copy and paste this link:",
          securePayment: "Payment is processed securely through Stripe."
        },
        documentRequest: {
          needDocument: "Our team requires you to upload the following document:",
          messageLabel: "Message:",
          documentType: "Requested document:",
          referenceTicket: "Reference ticket:",
          important: "Important:",
          uploadInstruction: "Please upload the requested document as soon as possible to avoid delays in the process.",
          uploadButton: "Upload Document"
        },
        documentUploaded: {
          documentReceived: "We have added a new document to your file:",
          forOrder: "Order:",
          accessDownload: "You can access and download this document from your Client Area.",
          reviewing: "Our team will review it and notify you if any additional action is required.",
          viewDocuments: "View My Documents",
          trackButton: "View request status"
        },
        messageReply: {
          newReply: "You have a new reply in your conversation:",
          repliedToQuery: "We have responded to your inquiry",
          ticket: "Ticket:",
          viewConversation: "View conversation",
          viewClientArea: "View My Client Area"
        },
        passwordChangeOtp: {
          passwordChangeRequest: "You have requested to change your password. Use the following code to verify your identity:",
          useCode: "Use the following code to confirm the change:",
          yourCode: "Your verification code:",
          important: "Important:",
          validFor: "This code expires in <strong>10 minutes</strong>",
          doNotShare: "Do not share it with anyone",
          notRequested: "If you did not request this change, ignore this message."
        },
        profileChangeOtp: {
          title: "Identity Verification",
          sensitiveChangeRequest: "A change to sensitive profile data has been requested. To confirm your identity, use the following verification code:",
          yourCode: "Your verification code:",
          important: "Important:",
          personalAndConfidential: "This code is personal and confidential",
          validFor: "Valid for <strong>24 hours</strong>",
          doNotShare: "Do not share it with anyone",
          ignoreMessage: "If you did not request this change, you can safely ignore this message."
        },
        accountLocked: {
          locked: "For your security, your account has been temporarily locked after detecting multiple failed access attempts.",
          attempts: "To unlock your account and verify your identity, we need you to send us:",
          verifyIdentity: "To unlock your account and verify your identity, we need you to send us:",
          idRequirement: "High-resolution ID/Passport image (both sides)",
          birthDateConfirm: "Your confirmed date of birth",
          referenceTicket: "Your reference Ticket ID is:",
          contactSupport: "To unlock your account, contact our support team:",
          resetPassword: "Reset Password",
          unlockButton: "Contact Support"
        },
        renewalReminder: {
          reminderText: "We remind you that the maintenance pack for your LLC",
          expiresIn: "Expires in",
          dueDate: "Due date:",
          daysRemaining: "Days remaining:",
          withoutMaintenance: "Without an active maintenance pack, your LLC may lose its good legal standing. This includes:",
          registeredAgentActive: "Active registered agent",
          annualReports: "Annual report filings",
          taxCompliance: "Tax compliance (IRS 1120/5472)",
          legalAddress: "Legal address in the United States",
          renewNow: "Renew Now",
          whatHappens: "What happens if I don't renew?",
          penalties: "Possible penalties and surcharges",
          agentExpires: "Your registered agent will expire",
          goodStanding: "Your LLC could lose good standing",
          viewCalendar: "View fiscal calendar"
        },
        registrationOtp: {
          almostDone: "Thank you for registering at Easy US LLC. Your verification code is:",
          confirmEmail: "To complete your account registration, enter the following verification code:",
          yourCode: "Your verification code:",
          important: "Important:",
          validFor: "This code expires in",
          doNotShare: "Do not share it with anyone",
          clientIdLabel: "Your client ID is:",
          ignoreMessage: "If you didn't create an account with us, you can ignore this message."
        },
        operatingAgreementReady: {
          ready: "Your Operating Agreement is ready!",
          generated: "We have great news for you.",
          llcData: "Your LLC Details",
          companyLabel: "Company:",
          stateLabel: "State:",
          einLabel: "EIN:",
          whatIs: "What is the Operating Agreement?",
          explanation: "It is the legal document that establishes the operating rules of your LLC, including ownership structure, profit distribution, and member responsibilities.",
          fullExplanation: "It is the fundamental legal document of your LLC. It defines how your company is managed, owner responsibilities, and operating rules. Although not mandatory in some states, it is highly recommended because:",
          reason1: "It reinforces the separation between your personal and business finances",
          reason2: "It is required by banks and payment processors like Stripe",
          reason3: "It provides additional legal protection for you as an owner",
          reason4: "It officially documents your business structure",
          generateButton: "Generate my Operating Agreement",
          autoGenerated: "The document will be automatically generated with your LLC data and saved in your Documentation Center so you can download it whenever you need it.",
          viewDocument: "View my document",
          tip: "Tip:",
          tipText: "Keep a signed copy of this document along with your other important company files."
        },
        documentApproved: {
          title: "Document Approved",
          approved: "Approved",
          reviewedAndApproved: "Your document has been reviewed and approved successfully.",
          viewDocuments: "View my documents"
        },
        documentRejected: {
          title: "Document Rejected - Action Required",
          rejected: "Rejected",
          reviewedAndRejected: "Your document has been reviewed and rejected.",
          reason: "Reason",
          pleaseReupload: "Please access your client dashboard and upload the corrected document again.",
          viewDocuments: "View my documents"
        },
        profileChangesVerified: {
          title: "Profile Changes Verified with OTP",
          client: "Client",
          email: "Email",
          clientId: "Client ID",
          fieldsModified: "Fields modified",
          verifiedWithOtp: "Change verified with OTP"
        },
        abandonedApplication: {
          incomplete: "Your application is incomplete",
          noticeText: "We noticed that you started completing your application for",
          importantNote: "Important note:",
          draftDeletion: "Your draft will be automatically deleted if you don't complete it. For security and data protection reasons, we cannot keep incomplete applications indefinitely.",
          understandDoubts: "We understand that taking the step to create an LLC can raise some questions. We want you to know that we are here to help you at every step of the process.",
          questionsHelp: "If you have any questions or need assistance completing your application, simply reply to this email and we'll be happy to help.",
          whyChoose: "Why choose Easy US LLC?",
          reason1: "Complete formation in 48-72 hours",
          reason2: "Spanish-language assistance throughout the process",
          reason3: "EIN obtainment included",
          reason4: "Help with bank account opening",
          reason5: "Ongoing post-formation support",
          noMoreReminders: "If you ultimately decide not to continue, we won't send you any more reminders about this application. Your privacy is important to us.",
          savedDraft: "Don't worry, we've saved all your progress so you can continue exactly where you left off.",
          continueButton: "Continue my Application",
          tip: "Tip:",
          tipText: "Complete your application so we can start working on your LLC as soon as possible.",
          expiring: "Your draft will expire in 48 hours if not completed.",
          llcFormation: "your LLC formation",
          maintenancePack: "maintenance package",
          dontLoseProgress: "Don't lose your progress. Resume your application now and complete the process in a few minutes.",
          lastHours: "last hours",
          autoDeleteWarning: "Your application will be automatically deleted if you don't complete it."
        },
        calculatorResults: {
          results: "Your calculation results",
          introText: "Here is the summary of the tax comparison you requested. We've analyzed the numbers and want you to have all the information to make the best decision for your business.",
          summary: "Your Analysis Summary",
          income: "Annual income:",
          expenses: "Deductible expenses:",
          autonomoTax: "Taxes as freelancer:",
          llcTax: "Taxes with LLC:",
          potentialSavings: "Your potential savings:",
          savings: "Estimated savings:",
          withLLC: "With an LLC in the United States, you could significantly optimize your tax burden while operating completely legally. These savings are maintained year after year, which can make an important difference for your business in the long run.",
          learnMore: "Would you like to know more about how it works? We'll be happy to answer all your questions with no commitment.",
          viewServices: "View Our Services",
          disclaimer: "This calculation is indicative and based on the data you provided. For a personalized analysis of your situation, don't hesitate to contact us."
        },
        newsletter: {
          confirmed: "Your subscription has been confirmed successfully.",
          willReceive: "You will receive relevant information about services, updates, and news related to Easy US LLC.",
          unsubscribe: "You can unsubscribe at any time from the link included in our emails."
        },
        orderEvent: {
          update: "Your order has an update:",
          date: "Date:",
          viewDetails: "View Details"
        }
      },
      ca: {
        common: {
          greeting: "Hola",
          closing: "Salutacions,",
          doubts: "Si tens qualsevol dubte, respon directament a aquest correu.",
          client: "Client"
        },
        otp: {
          thanks: "Gr\xE0cies per continuar amb el teu proc\xE9s a Easy US LLC.",
          forSecurity: "Per garantir la seguretat del teu compte, utilitza el seg\xFCent codi de verificaci\xF3:",
          yourCode: "El teu codi OTP:",
          important: "Important:",
          personalAndConfidential: "Aquest codi \xE9s personal i confidencial",
          validFor: "T\xE9 una validesa limitada a <strong>15 minuts</strong> per motius de seguretat",
          doNotShare: "No el comparteixis amb ning\xFA",
          ignoreMessage: "Si no has sol\xB7licitat aquest codi, pots ignorar aquest missatge amb total tranquil\xB7litat.",
          ipDetected: "Intent d'acc\xE9s detectat des de la IP:"
        },
        welcome: {
          welcomeMessage: "Benvingut a Easy US LLC! Ens alegra molt tenir-te amb nosaltres.",
          accountCreated: "El teu compte s'ha creat correctament i ja pots comen\xE7ar a explorar tot el que podem fer junts. Des de la teva \xC0rea Client tindr\xE0s acc\xE9s a:",
          accessFrom: "Des de la teva \xC0rea Client tindr\xE0s acc\xE9s a:",
          realTimeTracking: "Seguiment en temps real de les teves sol\xB7licituds",
          documentCenter: "Centre de documentaci\xF3 per descarregar tots els teus arxius",
          professionalTools: "Eines professionals com generador de factures",
          fiscalCalendar: "Calendari fiscal amb les teves dates importants",
          directSupport: "Comunicaci\xF3 directa amb el nostre equip de suport",
          hereToHelp: "Som aqu\xED per ajudar-te en cada pas de la teva aventura empresarial als Estats Units. Si tens qualsevol pregunta, no dubtis a escriure'ns.",
          exploreButton: "Explorar la Meva \xC0rea Client"
        },
        accountPendingVerification: {
          accountCreatedBut: "El teu compte s'ha creat correctament, per\xF2 necessites verificar el teu email per activar-lo completament.",
          actionRequired: "Acci\xF3 requerida:",
          accessAndVerify: "Accedeix a la teva \xC0rea Client i verifica el teu email per activar el teu compte i accedir a totes les funcions.",
          verifyButton: "Verificar el meu email",
          whileUnverified: "Mentre el teu email no estigui verificat, el teu compte romandr\xE0 en estat de revisi\xF3."
        },
        accountUnderReview: {
          underReview: "Volem informar-te que el teu compte ha entrat en un breu proc\xE9s de revisi\xF3. No et preocupis, aix\xF2 \xE9s completament rutinari i forma part dels nostres est\xE0ndards de seguretat per protegir la teva informaci\xF3 i garantir una experi\xE8ncia segura.",
          whyReview: "Per qu\xE8 fem aix\xF2?",
          whyReviewText: "A Easy US LLC ens prenem molt seriosament la seguretat dels nostres clients. Aquest proc\xE9s ens permet verificar que tota la informaci\xF3 \xE9s correcta i que el teu compte est\xE0 degudament protegit.",
          duringProcess: "Durant aquest breu per\xEDode, les funcions del teu compte estaran temporalment limitades. Aix\xF2 significa que no podr\xE0s realitzar noves comandes ni modificar informaci\xF3 existent, per\xF2 no et preocupis: aquesta situaci\xF3 \xE9s temporal i no afectar\xE0 cap tr\xE0mit que ja estigui en curs.",
          whatHappens: "Qu\xE8 passar\xE0 ara?",
          step1: "El nostre equip revisar\xE0 la informaci\xF3 del teu compte (normalment en 24-48 hores laborables)",
          step2: "Et notificarem per aquest mateix correu quan la revisi\xF3 hagi finalitzat",
          step3: "Si necessitem algun document addicional, t'ho farem saber de forma clara i senzilla",
          teamReviewing: "Mentrestant, si tens qualsevol pregunta o necessites ajuda, no dubtis a respondre a aquest correu. Estem aqu\xED per ajudar-te en tot el que necessitis.",
          patience: "Gr\xE0cies per la teva paci\xE8ncia i confian\xE7a. Sabem que el teu temps \xE9s valu\xF3s i farem tot el possible per resoldre aix\xF2 el m\xE9s aviat possible.",
          closing: "Una abra\xE7ada de l'equip d'Easy US LLC"
        },
        accountVip: {
          updatedToVip: "El teu compte ha estat actualitzat a l'estat VIP.",
          benefits: "Beneficis VIP:",
          priorityAttention: "Atenci\xF3 priorit\xE0ria i gesti\xF3 accelerada",
          preferentialTracking: "Seguiment preferent pel nostre equip",
          fullAccess: "Acc\xE9s complet a tots els serveis",
          viewDashboard: "Veure la Meva \xC0rea Client"
        },
        accountReactivated: {
          reactivated: "El teu compte ha estat reactivat correctament.",
          canAccess: "Ja pots accedir a la teva \xC0rea Client i utilitzar tots els nostres serveis amb normalitat.",
          viewDashboard: "Veure la Meva \xC0rea Client"
        },
        accountDeactivated: {
          deactivated: "Lamentem informar-te que el teu compte ha estat desactivat.",
          cannotAccess: "Mentre el teu compte romangui en aquest estat, no podr\xE0s accedir a la teva \xC0rea Client ni realitzar gestions a trav\xE9s de la nostra plataforma.",
          contactSupport: "Si creus que aix\xF2 \xE9s un error o desitges obtenir m\xE9s informaci\xF3, si us plau contacta amb el nostre equip de suport responent a aquest correu."
        },
        confirmation: {
          greatNews: "Excel\xB7lent not\xEDcia! Hem rebut correctament la teva sol\xB7licitud i ja estem treballant en ella. A partir d'ara, el nostre equip s'encarregar\xE0 de tot.",
          details: "Detalls de la teva Sol\xB7licitud",
          reference: "Refer\xE8ncia:",
          service: "Servei:",
          company: "Empresa:",
          state: "Estat:",
          currentStatus: "Estat actual:",
          inReview: "En revisi\xF3",
          whatNow: "Qu\xE8 passa ara?",
          validatingInfo: "El nostre equip est\xE0 validant tota la informaci\xF3 que ens vas proporcionar. En les properes hores rebr\xE0s actualitzacions sobre el progr\xE9s de la teva sol\xB7licitud directament al teu correu. Tamb\xE9 podr\xE0s seguir l'estat en temps real des de la teva \xC0rea Client.",
          nextSteps: "Propers Passos",
          step1: "Verificarem que tota la informaci\xF3 \xE9s correcta",
          step2: "Iniciarem els tr\xE0mits amb les autoritats corresponents",
          step3: "Et mantindrem informat en cada etapa del proc\xE9s",
          trackButton: "Veure Estat de la meva Sol\xB7licitud",
          questionRef: "Tens alguna pregunta? Simplement respon a aquest correu esmentant la teva refer\xE8ncia i t'ajudarem encantats."
        },
        autoReply: {
          receivedMessage: "El teu missatge ha estat rebut correctament.",
          ticketNumber: "N\xFAmero de ticket",
          estimatedResponse: "Temps estimat de resposta: <strong>24-48 hores laborables</strong>",
          responding: "El nostre equip revisar\xE0 la teva consulta i et respondr\xE0 el m\xE9s aviat possible. Si necessites afegir informaci\xF3 addicional, respon directament a aquest correu.",
          seeMessages: "Veure Missatges"
        },
        orderUpdate: {
          statusChanged: "L'estat de la teva comanda ha estat actualitzat.",
          orderLabel: "Comanda:",
          newStatus: "Nou estat:",
          statusPending: "Pendent",
          statusProcessing: "En proc\xE9s",
          statusPaid: "Pagat",
          statusFiled: "Presentat",
          statusDocumentsReady: "Documents llestos",
          statusCompleted: "Completat",
          statusCancelled: "Cancel\xB7lat",
          clarification: "Per a qualsevol aclariment sobre aquesta actualitzaci\xF3, respon directament a aquest correu.",
          trackButton: "Veure detalls complets"
        },
        orderCompleted: {
          llcReady: "La teva LLC est\xE0 llesta!",
          congratulations: "Felicitats! La teva comanda ha estat completada amb \xE8xit. Tot est\xE0 llest perqu\xE8 puguis comen\xE7ar a operar amb la teva empresa als Estats Units.",
          docsReady: "La teva documentaci\xF3 est\xE0 llesta",
          accessDocuments: "Ja pots accedir i descarregar tots els documents de la teva empresa des del teu Centre de Documentaci\xF3.",
          whatYouFind: "Qu\xE8 trobar\xE0s?",
          documentList: "Documents disponibles:",
          articlesOrg: "Articles of Organization (document de constituci\xF3)",
          einLetter: "Carta de l'EIN de l'IRS",
          registeredAgent: "Informaci\xF3 de l'agent registrat",
          additionalGuides: "Guies i documents addicionals segons el teu servei",
          viewDocuments: "Veure Els Meus Documents",
          nextSteps: "Propers passos:",
          activateBanking: "Activar compte bancari (si sol\xB7licitat)",
          operatingAgreement: "Generar el teu Operating Agreement",
          trackExpenses: "Comen\xE7ar a registrar ingressos i despeses",
          hereForYou: "Recorda que seguim aqu\xED per ajudar-te en tot el que necessitis. Si tens dubtes sobre els propers passos, com obrir un compte bancari o configurar la teva passarel\xB7la de pagaments, no dubtis a escriure'ns.",
          feedbackRequest: "La teva experi\xE8ncia \xE9s molt important per a nosaltres. Si tens un moment, ens encantaria con\xE8ixer la teva opini\xF3 sobre el nostre servei."
        },
        noteReceived: {
          teamNote: "Tens un nou missatge del nostre equip",
          relatedToOrder: "relacionat amb la teva comanda",
          respondNote: "Pots respondre directament a aquest correu o accedir a la teva \xC0rea Client per veure l'historial complet.",
          viewClientArea: "Veure la Meva \xC0rea Client"
        },
        adminNote: {
          messageAbout: "Tens un missatge important sobre la teva sol\xB7licitud:",
          viewTicket: "Veure Ticket",
          viewClientArea: "Veure la Meva \xC0rea Client"
        },
        paymentRequest: {
          paymentRequired: "S'ha generat una sol\xB7licitud de pagament per continuar amb el teu tr\xE0mit",
          messageLabel: "Missatge:",
          amount: "per un valor de",
          payNow: "Realitzar Pagament",
          buttonFallback: "Si el bot\xF3 no funciona, copia i enganxa aquest enlla\xE7:",
          securePayment: "El pagament es processa de forma segura a trav\xE9s de Stripe."
        },
        documentRequest: {
          needDocument: "El nostre equip requereix que pugis el seg\xFCent document:",
          messageLabel: "Missatge:",
          documentType: "Document sol\xB7licitat:",
          referenceTicket: "Ticket de refer\xE8ncia:",
          important: "Important:",
          uploadInstruction: "Si us plau, puja el document sol\xB7licitat el m\xE9s aviat possible per evitar retards en el proc\xE9s.",
          uploadButton: "Pujar Document"
        },
        documentUploaded: {
          documentReceived: "Hem afegit un nou document al teu expedient:",
          forOrder: "Comanda:",
          accessDownload: "Pots accedir i descarregar aquest document des de la teva \xC0rea Client.",
          reviewing: "El nostre equip el revisar\xE0 i et notificarem si \xE9s necess\xE0ria alguna acci\xF3 addicional.",
          viewDocuments: "Veure Els Meus Documents",
          trackButton: "Veure estat de la meva sol\xB7licitud"
        },
        messageReply: {
          newReply: "Tens una nova resposta a la teva conversa:",
          repliedToQuery: "Hem respost a la teva consulta",
          ticket: "Ticket:",
          viewConversation: "Veure conversa",
          viewClientArea: "Veure la Meva \xC0rea Client"
        },
        passwordChangeOtp: {
          passwordChangeRequest: "Has sol\xB7licitat canviar la teva contrasenya. Utilitza el seg\xFCent codi per verificar la teva identitat:",
          useCode: "Utilitza el seg\xFCent codi per confirmar el canvi:",
          yourCode: "El teu codi de verificaci\xF3:",
          important: "Important:",
          validFor: "Aquest codi expira en <strong>10 minuts</strong>",
          doNotShare: "No el comparteixis amb ning\xFA",
          notRequested: "Si no has sol\xB7licitat aquest canvi, ignora aquest missatge."
        },
        profileChangeOtp: {
          title: "Verificaci\xF3 d'Identitat",
          sensitiveChangeRequest: "S'ha sol\xB7licitat un canvi en les dades sensibles del teu perfil. Per confirmar la teva identitat, utilitza el seg\xFCent codi de verificaci\xF3:",
          yourCode: "El teu codi de verificaci\xF3:",
          important: "Important:",
          personalAndConfidential: "Aquest codi \xE9s personal i confidencial",
          validFor: "T\xE9 una validesa de <strong>24 hores</strong>",
          doNotShare: "No el comparteixis amb ning\xFA",
          ignoreMessage: "Si no has sol\xB7licitat aquest canvi, pots ignorar aquest missatge amb total tranquil\xB7litat."
        },
        accountLocked: {
          locked: "Per la teva seguretat, el teu compte ha estat temporalment bloquejat despr\xE9s de detectar m\xFAltiples intents d'acc\xE9s fallits.",
          attempts: "Per desbloquejar el teu compte i verificar la teva identitat, necessitem que ens envi\xEFs:",
          verifyIdentity: "Per desbloquejar el teu compte i verificar la teva identitat, necessitem que ens envi\xEFs:",
          idRequirement: "Imatge del DNI/Passaport d'alta resoluci\xF3 (ambdues cares)",
          birthDateConfirm: "La teva data de naixement confirmada",
          referenceTicket: "El teu Ticket ID de refer\xE8ncia \xE9s:",
          contactSupport: "Per desbloquejar el teu compte, contacta amb el nostre equip de suport:",
          resetPassword: "Restablir contrasenya",
          unlockButton: "Contactar Suport"
        },
        renewalReminder: {
          reminderText: "Et recordem que el pack de manteniment de la teva LLC",
          expiresIn: "Ven\xE7 en",
          dueDate: "Data de venciment:",
          daysRemaining: "Dies restants:",
          withoutMaintenance: "Sense el pack de manteniment actiu, la teva LLC pot perdre el seu bon estat legal. Aix\xF2 inclou:",
          registeredAgentActive: "Agent registrat actiu",
          annualReports: "Presentaci\xF3 d'informes anuals",
          taxCompliance: "Compliment fiscal (IRS 1120/5472)",
          legalAddress: "Domicili legal als Estats Units",
          renewNow: "Renovar Ara",
          whatHappens: "Qu\xE8 passa si no renovo?",
          penalties: "Possibles penalitzacions i rec\xE0rrecs",
          agentExpires: "El teu registered agent expirar\xE0",
          goodStanding: "La teva LLC podria perdre el bon estat",
          viewCalendar: "Veure calendari fiscal"
        },
        registrationOtp: {
          almostDone: "Gr\xE0cies per registrar-te a Easy US LLC. El teu codi de verificaci\xF3 \xE9s:",
          confirmEmail: "Per completar el registre del teu compte, introdueix el seg\xFCent codi de verificaci\xF3:",
          yourCode: "El teu codi de verificaci\xF3:",
          important: "Important:",
          validFor: "Aquest codi expira en",
          doNotShare: "No el comparteixis amb ning\xFA",
          clientIdLabel: "El teu ID de client \xE9s:",
          ignoreMessage: "Si no has creat un compte amb nosaltres, pots ignorar aquest missatge."
        },
        operatingAgreementReady: {
          ready: "El teu Operating Agreement est\xE0 llest!",
          generated: "Tenim excel\xB7lents not\xEDcies per a tu.",
          llcData: "Dades de la teva LLC",
          companyLabel: "Empresa:",
          stateLabel: "Estat:",
          einLabel: "EIN:",
          whatIs: "Qu\xE8 \xE9s l'Operating Agreement?",
          explanation: "\xC9s el document legal que estableix les regles de funcionament de la teva LLC, incloent l'estructura de propietat, distribuci\xF3 de beneficis i responsabilitats dels membres.",
          fullExplanation: "\xC9s el document legal fonamental de la teva LLC. Defineix com es gestiona la teva empresa, les responsabilitats del propietari i les regles d'operaci\xF3. Tot i que en alguns estats no \xE9s obligatori, \xE9s altament recomanable tenir-lo perqu\xE8:",
          reason1: "Refor\xE7a la separaci\xF3 entre les teves finances personals i les de l'empresa",
          reason2: "\xC9s requerit per bancs i processadors de pagament com Stripe",
          reason3: "Proporciona protecci\xF3 legal addicional per a tu com a propietari",
          reason4: "Documenta oficialment l'estructura del teu negoci",
          generateButton: "Generar el meu Operating Agreement",
          autoGenerated: "El document es generar\xE0 autom\xE0ticament amb les dades de la teva LLC i es guardar\xE0 al teu Centre de Documentaci\xF3 perqu\xE8 puguis descarregar-lo quan ho necessitis.",
          viewDocument: "Veure el meu document",
          tip: "Consell:",
          tipText: "Guarda una c\xF2pia signada d'aquest document juntament amb els teus altres arxius importants de l'empresa."
        },
        documentApproved: {
          title: "Document Aprovat",
          approved: "Aprovat",
          reviewedAndApproved: "El teu document ha estat revisat i aprovat correctament.",
          viewDocuments: "Veure els meus documents"
        },
        documentRejected: {
          title: "Document Rebutjat - Acci\xF3 Requerida",
          rejected: "Rebutjat",
          reviewedAndRejected: "El teu document ha estat revisat i rebutjat.",
          reason: "Motiu",
          pleaseReupload: "Si us plau, accedeix al teu panell de client i puja novament el document corregit.",
          viewDocuments: "Veure els meus documents"
        },
        profileChangesVerified: {
          title: "Canvis de Perfil Verificats amb OTP",
          client: "Client",
          email: "Email",
          clientId: "ID de Client",
          fieldsModified: "Camps modificats",
          verifiedWithOtp: "Canvi verificat amb OTP"
        },
        abandonedApplication: {
          incomplete: "La teva sol\xB7licitud est\xE0 incompleta",
          noticeText: "Hem notat que vas comen\xE7ar a completar la teva sol\xB7licitud de",
          importantNote: "Nota important:",
          draftDeletion: "El teu esborrany s'eliminar\xE0 autom\xE0ticament si no el completes. Per motius de seguretat i protecci\xF3 de dades, no podem mantenir sol\xB7licituds incompletes indefinidament.",
          understandDoubts: "Entenem que fer el pas de crear una LLC pot generar alguns dubtes. Volem que s\xE0pigues que estem aqu\xED per ajudar-te en cada pas del proc\xE9s.",
          questionsHelp: "Si tens alguna pregunta o necessites assist\xE8ncia per completar la teva sol\xB7licitud, simplement respon a aquest correu i t'ajudarem encantats.",
          whyChoose: "Per qu\xE8 triar Easy US LLC?",
          reason1: "Formaci\xF3 completa en 48-72 hores",
          reason2: "Assist\xE8ncia en espanyol durant tot el proc\xE9s",
          reason3: "Obtenci\xF3 de l'EIN inclosa",
          reason4: "Ajuda amb obertura de compte bancari",
          reason5: "Suport continu post-formaci\xF3",
          noMoreReminders: "Si finalment decideixes no continuar, no t'enviarem m\xE9s recordatoris sobre aquesta sol\xB7licitud. La teva privacitat \xE9s important per a nosaltres.",
          savedDraft: "No et preocupis, hem guardat tot el teu progr\xE9s perqu\xE8 puguis continuar exactament on ho vas deixar.",
          continueButton: "Continuar la meva Sol\xB7licitud",
          tip: "Consell:",
          tipText: "Completa la teva sol\xB7licitud perqu\xE8 puguem comen\xE7ar a treballar en la teva LLC el m\xE9s aviat possible.",
          expiring: "El teu esborrany expirar\xE0 en 48 hores si no el completes.",
          llcFormation: "constituci\xF3 de la teva LLC",
          maintenancePack: "paquet de manteniment",
          dontLoseProgress: "No perdis el teu progr\xE9s. Repr\xE8n la teva sol\xB7licitud ara i completa el proc\xE9s en pocs minuts.",
          lastHours: "\xFAltimes hores",
          autoDeleteWarning: "La teva sol\xB7licitud s'eliminar\xE0 autom\xE0ticament si no la completes."
        },
        calculatorResults: {
          results: "Resultats del teu c\xE0lcul",
          introText: "Aqu\xED tens el resum de la teva comparaci\xF3 fiscal que vas sol\xB7licitar. Hem analitzat els n\xFAmeros i volem que tinguis tota la informaci\xF3 per prendre la millor decisi\xF3 per al teu negoci.",
          summary: "Resum de la teva An\xE0lisi",
          income: "Ingressos anuals:",
          expenses: "Despeses dedu\xEFbles:",
          autonomoTax: "Impostos com a aut\xF2nom:",
          llcTax: "Impostos amb LLC:",
          potentialSavings: "El teu estalvi potencial:",
          savings: "Estalvi estimat:",
          withLLC: "Amb una LLC als Estats Units, podries optimitzar significativament la teva c\xE0rrega fiscal mentre operes de forma completament legal. Aquest estalvi es mant\xE9 any rere any, el que pot suposar una difer\xE8ncia important per al teu negoci a llarg termini.",
          learnMore: "T'agradaria saber m\xE9s sobre com funciona? Estarem encantats de resoldre tots els teus dubtes sense cap comprom\xEDs.",
          viewServices: "Veure Els Nostres Serveis",
          disclaimer: "Aquest c\xE0lcul \xE9s orientatiu i es basa en les dades que vas proporcionar. Per a una an\xE0lisi personalitzada de la teva situaci\xF3, no dubtis a contactar-nos."
        },
        newsletter: {
          confirmed: "La teva subscripci\xF3 ha estat confirmada correctament.",
          willReceive: "Rebr\xE0s informaci\xF3 rellevant sobre serveis, actualitzacions i novetats relacionades amb Easy US LLC.",
          unsubscribe: "Pots donar-te de baixa en qualsevol moment des de l'enlla\xE7 incl\xF2s als nostres correus."
        },
        orderEvent: {
          update: "La teva comanda t\xE9 una actualitzaci\xF3:",
          date: "Data:",
          viewDetails: "Veure Detalls"
        }
      },
      fr: {
        common: {
          greeting: "Bonjour",
          closing: "Cordialement,",
          doubts: "Si vous avez des questions, r\xE9pondez directement \xE0 cet e-mail.",
          client: "Client"
        },
        otp: {
          thanks: "Merci de poursuivre votre d\xE9marche chez Easy US LLC.",
          forSecurity: "Pour garantir la s\xE9curit\xE9 de votre compte, utilisez le code de v\xE9rification suivant :",
          yourCode: "Votre code OTP :",
          important: "Important :",
          personalAndConfidential: "Ce code est personnel et confidentiel",
          validFor: "Il est valable <strong>15 minutes</strong> pour des raisons de s\xE9curit\xE9",
          doNotShare: "Ne le partagez avec personne",
          ignoreMessage: "Si vous n'avez pas demand\xE9 ce code, vous pouvez ignorer ce message en toute tranquillit\xE9.",
          ipDetected: "Tentative de connexion d\xE9tect\xE9e depuis l'IP :"
        },
        welcome: {
          welcomeMessage: "Bienvenue chez Easy US LLC ! Nous sommes ravis de vous compter parmi nous.",
          accountCreated: "Votre compte a \xE9t\xE9 cr\xE9\xE9 avec succ\xE8s et vous pouvez commencer \xE0 explorer tout ce que nous pouvons faire ensemble. Depuis votre Espace Client, vous aurez acc\xE8s \xE0 :",
          accessFrom: "Depuis votre Espace Client, vous aurez acc\xE8s \xE0 :",
          realTimeTracking: "Suivi en temps r\xE9el de vos demandes",
          documentCenter: "Centre de documentation pour t\xE9l\xE9charger tous vos fichiers",
          professionalTools: "Outils professionnels comme le g\xE9n\xE9rateur de factures",
          fiscalCalendar: "Calendrier fiscal avec vos dates importantes",
          directSupport: "Communication directe avec notre \xE9quipe de support",
          hereToHelp: "Nous sommes l\xE0 pour vous accompagner \xE0 chaque \xE9tape de votre aventure entrepreneuriale aux \xC9tats-Unis. Si vous avez des questions, n'h\xE9sitez pas \xE0 nous \xE9crire.",
          exploreButton: "Explorer Mon Espace Client"
        },
        accountPendingVerification: {
          accountCreatedBut: "Votre compte a \xE9t\xE9 cr\xE9\xE9 avec succ\xE8s, mais vous devez v\xE9rifier votre e-mail pour l'activer compl\xE8tement.",
          actionRequired: "Action requise :",
          accessAndVerify: "Acc\xE9dez \xE0 votre Espace Client et v\xE9rifiez votre e-mail pour activer votre compte et acc\xE9der \xE0 toutes les fonctionnalit\xE9s.",
          verifyButton: "V\xE9rifier mon e-mail",
          whileUnverified: "Tant que votre e-mail n'est pas v\xE9rifi\xE9, votre compte restera en cours de r\xE9vision."
        },
        accountUnderReview: {
          underReview: "Nous souhaitons vous informer que votre compte est entr\xE9 dans un bref processus de v\xE9rification. Ne vous inqui\xE9tez pas, c'est tout \xE0 fait routinier et fait partie de nos normes de s\xE9curit\xE9 pour prot\xE9ger vos informations et garantir une exp\xE9rience s\xFBre.",
          whyReview: "Pourquoi faisons-nous cela ?",
          whyReviewText: "Chez Easy US LLC, nous prenons tr\xE8s au s\xE9rieux la s\xE9curit\xE9 de nos clients. Ce processus nous permet de v\xE9rifier que toutes les informations sont correctes et que votre compte est correctement prot\xE9g\xE9.",
          duringProcess: "Pendant cette br\xE8ve p\xE9riode, les fonctions de votre compte seront temporairement limit\xE9es. Cela signifie que vous ne pourrez pas passer de nouvelles commandes ni modifier les informations existantes, mais ne vous inqui\xE9tez pas : cette situation est temporaire et n'affectera aucune d\xE9marche d\xE9j\xE0 en cours.",
          whatHappens: "Que va-t-il se passer maintenant ?",
          step1: "Notre \xE9quipe examinera les informations de votre compte (g\xE9n\xE9ralement sous 24 \xE0 48 heures ouvrables)",
          step2: "Nous vous notifierons par ce m\xEAme e-mail d\xE8s que la v\xE9rification sera termin\xE9e",
          step3: "Si nous avons besoin de documents suppl\xE9mentaires, nous vous le ferons savoir clairement et simplement",
          teamReviewing: "En attendant, si vous avez des questions ou besoin d'aide, n'h\xE9sitez pas \xE0 r\xE9pondre \xE0 cet e-mail. Nous sommes l\xE0 pour vous aider dans tout ce dont vous avez besoin.",
          patience: "Merci pour votre patience et votre confiance. Nous savons que votre temps est pr\xE9cieux et nous ferons tout notre possible pour r\xE9soudre cela le plus rapidement possible.",
          closing: "Chaleureusement, l'\xE9quipe Easy US LLC"
        },
        accountVip: {
          updatedToVip: "Votre compte a \xE9t\xE9 mis \xE0 niveau au statut VIP.",
          benefits: "Avantages VIP :",
          priorityAttention: "Attention prioritaire et traitement acc\xE9l\xE9r\xE9",
          preferentialTracking: "Suivi pr\xE9f\xE9rentiel par notre \xE9quipe",
          fullAccess: "Acc\xE8s complet \xE0 tous les services",
          viewDashboard: "Voir Mon Espace Client"
        },
        accountReactivated: {
          reactivated: "Votre compte a \xE9t\xE9 r\xE9activ\xE9 avec succ\xE8s.",
          canAccess: "Vous pouvez maintenant acc\xE9der \xE0 votre Espace Client et utiliser tous nos services normalement.",
          viewDashboard: "Voir Mon Espace Client"
        },
        accountDeactivated: {
          deactivated: "Nous avons le regret de vous informer que votre compte a \xE9t\xE9 d\xE9sactiv\xE9.",
          cannotAccess: "Tant que votre compte reste dans cet \xE9tat, vous ne pourrez pas acc\xE9der \xE0 votre Espace Client ni effectuer d'op\xE9rations via notre plateforme.",
          contactSupport: "Si vous pensez qu'il s'agit d'une erreur ou souhaitez obtenir plus d'informations, veuillez contacter notre \xE9quipe de support en r\xE9pondant \xE0 cet e-mail."
        },
        confirmation: {
          greatNews: "Excellente nouvelle ! Nous avons bien re\xE7u votre demande et nous travaillons d\xE9j\xE0 dessus. \xC0 partir de maintenant, notre \xE9quipe s'occupe de tout.",
          details: "D\xE9tails de votre demande",
          reference: "R\xE9f\xE9rence :",
          service: "Service :",
          company: "Entreprise :",
          state: "\xC9tat :",
          currentStatus: "Statut actuel :",
          inReview: "En cours de r\xE9vision",
          whatNow: "Que se passe-t-il maintenant ?",
          validatingInfo: "Notre \xE9quipe valide toutes les informations que vous avez fournies. Dans les prochaines heures, vous recevrez des mises \xE0 jour sur l'avancement de votre demande directement par e-mail. Vous pouvez \xE9galement suivre le statut en temps r\xE9el depuis votre Espace Client.",
          nextSteps: "Prochaines \xE9tapes",
          step1: "Nous v\xE9rifierons que toutes les informations sont correctes",
          step2: "Nous entamerons les d\xE9marches aupr\xE8s des autorit\xE9s comp\xE9tentes",
          step3: "Nous vous tiendrons inform\xE9 \xE0 chaque \xE9tape du processus",
          trackButton: "Voir le statut de ma demande",
          questionRef: "Vous avez des questions ? R\xE9pondez simplement \xE0 cet e-mail en mentionnant votre r\xE9f\xE9rence et nous serons ravis de vous aider."
        },
        autoReply: {
          receivedMessage: "Votre message a \xE9t\xE9 re\xE7u avec succ\xE8s.",
          ticketNumber: "Num\xE9ro de ticket",
          estimatedResponse: "Temps de r\xE9ponse estim\xE9 : <strong>24-48 heures ouvrables</strong>",
          responding: "Notre \xE9quipe examinera votre demande et vous r\xE9pondra dans les plus brefs d\xE9lais. Si vous devez ajouter des informations suppl\xE9mentaires, r\xE9pondez directement \xE0 cet e-mail.",
          seeMessages: "Voir les messages"
        },
        orderUpdate: {
          statusChanged: "Le statut de votre commande a \xE9t\xE9 mis \xE0 jour.",
          orderLabel: "Commande :",
          newStatus: "Nouveau statut :",
          statusPending: "En attente",
          statusProcessing: "En cours de traitement",
          statusPaid: "Pay\xE9",
          statusFiled: "D\xE9pos\xE9",
          statusDocumentsReady: "Documents pr\xEAts",
          statusCompleted: "Termin\xE9",
          statusCancelled: "Annul\xE9",
          clarification: "Pour toute clarification concernant cette mise \xE0 jour, r\xE9pondez directement \xE0 cet e-mail.",
          trackButton: "Voir les d\xE9tails complets"
        },
        orderCompleted: {
          llcReady: "Votre LLC est pr\xEAte !",
          congratulations: "F\xE9licitations ! Votre commande a \xE9t\xE9 compl\xE9t\xE9e avec succ\xE8s. Tout est pr\xEAt pour que vous puissiez commencer \xE0 exploiter votre entreprise aux \xC9tats-Unis.",
          docsReady: "Votre documentation est pr\xEAte",
          accessDocuments: "Vous pouvez maintenant acc\xE9der et t\xE9l\xE9charger tous les documents de votre entreprise depuis votre Centre de Documentation.",
          whatYouFind: "Que trouverez-vous ?",
          documentList: "Documents disponibles :",
          articlesOrg: "Articles of Organization (document de constitution)",
          einLetter: "Lettre EIN de l'IRS",
          registeredAgent: "Informations sur l'agent enregistr\xE9",
          additionalGuides: "Guides et documents suppl\xE9mentaires selon votre service",
          viewDocuments: "Voir Mes Documents",
          nextSteps: "Prochaines \xE9tapes :",
          activateBanking: "Activer le compte bancaire (si demand\xE9)",
          operatingAgreement: "G\xE9n\xE9rer votre Operating Agreement",
          trackExpenses: "Commencer \xE0 suivre les revenus et les d\xE9penses",
          hereForYou: "N'oubliez pas que nous sommes toujours l\xE0 pour vous aider dans tout ce dont vous avez besoin. Si vous avez des questions sur les prochaines \xE9tapes, comme l'ouverture d'un compte bancaire ou la configuration de votre passerelle de paiement, n'h\xE9sitez pas \xE0 nous contacter.",
          feedbackRequest: "Votre exp\xE9rience est tr\xE8s importante pour nous. Si vous avez un moment, nous serions ravis de conna\xEEtre votre avis sur notre service."
        },
        noteReceived: {
          teamNote: "Vous avez un nouveau message de notre \xE9quipe",
          relatedToOrder: "concernant votre commande",
          respondNote: "Vous pouvez r\xE9pondre directement \xE0 cet e-mail ou acc\xE9der \xE0 votre Espace Client pour voir l'historique complet.",
          viewClientArea: "Voir Mon Espace Client"
        },
        adminNote: {
          messageAbout: "Vous avez un message important concernant votre demande :",
          viewTicket: "Voir le ticket",
          viewClientArea: "Voir Mon Espace Client"
        },
        paymentRequest: {
          paymentRequired: "Une demande de paiement a \xE9t\xE9 g\xE9n\xE9r\xE9e pour poursuivre votre d\xE9marche",
          messageLabel: "Message :",
          amount: "pour un montant de",
          payNow: "Effectuer le paiement",
          buttonFallback: "Si le bouton ne fonctionne pas, copiez et collez ce lien :",
          securePayment: "Le paiement est trait\xE9 de mani\xE8re s\xE9curis\xE9e via Stripe."
        },
        documentRequest: {
          needDocument: "Notre \xE9quipe vous demande de t\xE9l\xE9charger le document suivant :",
          messageLabel: "Message :",
          documentType: "Document demand\xE9 :",
          referenceTicket: "Ticket de r\xE9f\xE9rence :",
          important: "Important :",
          uploadInstruction: "Veuillez t\xE9l\xE9charger le document demand\xE9 d\xE8s que possible pour \xE9viter les retards dans le processus.",
          uploadButton: "T\xE9l\xE9charger le document"
        },
        documentUploaded: {
          documentReceived: "Nous avons ajout\xE9 un nouveau document \xE0 votre dossier :",
          forOrder: "Commande :",
          accessDownload: "Vous pouvez acc\xE9der et t\xE9l\xE9charger ce document depuis votre Espace Client.",
          reviewing: "Notre \xE9quipe l'examinera et vous informera si une action suppl\xE9mentaire est n\xE9cessaire.",
          viewDocuments: "Voir Mes Documents",
          trackButton: "Voir le statut de ma demande"
        },
        messageReply: {
          newReply: "Vous avez une nouvelle r\xE9ponse dans votre conversation :",
          repliedToQuery: "Nous avons r\xE9pondu \xE0 votre demande",
          ticket: "Ticket :",
          viewConversation: "Voir la conversation",
          viewClientArea: "Voir Mon Espace Client"
        },
        passwordChangeOtp: {
          passwordChangeRequest: "Vous avez demand\xE9 \xE0 changer votre mot de passe. Utilisez le code suivant pour v\xE9rifier votre identit\xE9 :",
          useCode: "Utilisez le code suivant pour confirmer le changement :",
          yourCode: "Votre code de v\xE9rification :",
          important: "Important :",
          validFor: "Ce code expire dans <strong>10 minutes</strong>",
          doNotShare: "Ne le partagez avec personne",
          notRequested: "Si vous n'avez pas demand\xE9 ce changement, ignorez ce message."
        },
        profileChangeOtp: {
          title: "V\xE9rification d'Identit\xE9",
          sensitiveChangeRequest: "Un changement des donn\xE9es sensibles de votre profil a \xE9t\xE9 demand\xE9. Pour confirmer votre identit\xE9, utilisez le code de v\xE9rification suivant :",
          yourCode: "Votre code de v\xE9rification :",
          important: "Important :",
          personalAndConfidential: "Ce code est personnel et confidentiel",
          validFor: "Valable pendant <strong>24 heures</strong>",
          doNotShare: "Ne le partagez avec personne",
          ignoreMessage: "Si vous n'avez pas demand\xE9 ce changement, vous pouvez ignorer ce message en toute s\xE9curit\xE9."
        },
        accountLocked: {
          locked: "Pour votre s\xE9curit\xE9, votre compte a \xE9t\xE9 temporairement verrouill\xE9 apr\xE8s la d\xE9tection de plusieurs tentatives d'acc\xE8s \xE9chou\xE9es.",
          attempts: "Pour d\xE9verrouiller votre compte et v\xE9rifier votre identit\xE9, nous avons besoin que vous nous envoyiez :",
          verifyIdentity: "Pour d\xE9verrouiller votre compte et v\xE9rifier votre identit\xE9, nous avons besoin que vous nous envoyiez :",
          idRequirement: "Image haute r\xE9solution de la pi\xE8ce d'identit\xE9/passeport (recto-verso)",
          birthDateConfirm: "Votre date de naissance confirm\xE9e",
          referenceTicket: "Votre num\xE9ro de ticket de r\xE9f\xE9rence est :",
          contactSupport: "Pour d\xE9verrouiller votre compte, contactez notre \xE9quipe de support :",
          resetPassword: "R\xE9initialiser le mot de passe",
          unlockButton: "Contacter le support"
        },
        renewalReminder: {
          reminderText: "Nous vous rappelons que le pack de maintenance de votre LLC",
          expiresIn: "Expire dans",
          dueDate: "Date d'\xE9ch\xE9ance :",
          daysRemaining: "Jours restants :",
          withoutMaintenance: "Sans le pack de maintenance actif, votre LLC peut perdre son bon \xE9tat juridique. Cela inclut :",
          registeredAgentActive: "Agent enregistr\xE9 actif",
          annualReports: "D\xE9p\xF4t des rapports annuels",
          taxCompliance: "Conformit\xE9 fiscale (IRS 1120/5472)",
          legalAddress: "Adresse l\xE9gale aux \xC9tats-Unis",
          renewNow: "Renouveler maintenant",
          whatHappens: "Que se passe-t-il si je ne renouvelle pas ?",
          penalties: "P\xE9nalit\xE9s et frais suppl\xE9mentaires possibles",
          agentExpires: "Votre agent enregistr\xE9 expirera",
          goodStanding: "Votre LLC pourrait perdre son bon \xE9tat",
          viewCalendar: "Voir le calendrier fiscal"
        },
        registrationOtp: {
          almostDone: "Merci de vous \xEAtre inscrit chez Easy US LLC. Votre code de v\xE9rification est :",
          confirmEmail: "Pour compl\xE9ter l'inscription de votre compte, entrez le code de v\xE9rification suivant :",
          yourCode: "Votre code de v\xE9rification :",
          important: "Important :",
          validFor: "Ce code expire dans",
          doNotShare: "Ne le partagez avec personne",
          clientIdLabel: "Votre identifiant client est :",
          ignoreMessage: "Si vous n'avez pas cr\xE9\xE9 de compte chez nous, vous pouvez ignorer ce message."
        },
        operatingAgreementReady: {
          ready: "Votre Operating Agreement est pr\xEAt !",
          generated: "Nous avons d'excellentes nouvelles pour vous.",
          llcData: "Donn\xE9es de votre LLC",
          companyLabel: "Entreprise :",
          stateLabel: "\xC9tat :",
          einLabel: "EIN :",
          whatIs: "Qu'est-ce que l'Operating Agreement ?",
          explanation: "C'est le document juridique qui \xE9tablit les r\xE8gles de fonctionnement de votre LLC, y compris la structure de propri\xE9t\xE9, la r\xE9partition des b\xE9n\xE9fices et les responsabilit\xE9s des membres.",
          fullExplanation: "C'est le document juridique fondamental de votre LLC. Il d\xE9finit la gestion de votre entreprise, les responsabilit\xE9s du propri\xE9taire et les r\xE8gles de fonctionnement. Bien que non obligatoire dans certains \xC9tats, il est fortement recommand\xE9 car :",
          reason1: "Il renforce la s\xE9paration entre vos finances personnelles et celles de l'entreprise",
          reason2: "Il est exig\xE9 par les banques et les processeurs de paiement comme Stripe",
          reason3: "Il fournit une protection juridique suppl\xE9mentaire pour vous en tant que propri\xE9taire",
          reason4: "Il documente officiellement la structure de votre entreprise",
          generateButton: "G\xE9n\xE9rer mon Operating Agreement",
          autoGenerated: "Le document sera g\xE9n\xE9r\xE9 automatiquement avec les donn\xE9es de votre LLC et sauvegard\xE9 dans votre Centre de Documentation pour que vous puissiez le t\xE9l\xE9charger quand vous en avez besoin.",
          viewDocument: "Voir mon document",
          tip: "Conseil :",
          tipText: "Conservez une copie sign\xE9e de ce document avec vos autres fichiers importants de l'entreprise."
        },
        documentApproved: {
          title: "Document Approuv\xE9",
          approved: "Approuv\xE9",
          reviewedAndApproved: "Votre document a \xE9t\xE9 examin\xE9 et approuv\xE9 avec succ\xE8s.",
          viewDocuments: "Voir mes documents"
        },
        documentRejected: {
          title: "Document Rejet\xE9 - Action Requise",
          rejected: "Rejet\xE9",
          reviewedAndRejected: "Votre document a \xE9t\xE9 examin\xE9 et rejet\xE9.",
          reason: "Raison",
          pleaseReupload: "Veuillez acc\xE9der \xE0 votre tableau de bord client et t\xE9l\xE9charger \xE0 nouveau le document corrig\xE9.",
          viewDocuments: "Voir mes documents"
        },
        profileChangesVerified: {
          title: "Modifications de Profil V\xE9rifi\xE9es avec OTP",
          client: "Client",
          email: "Email",
          clientId: "ID Client",
          fieldsModified: "Champs modifi\xE9s",
          verifiedWithOtp: "Modification v\xE9rifi\xE9e avec OTP"
        },
        abandonedApplication: {
          incomplete: "Votre demande est incompl\xE8te",
          noticeText: "Nous avons remarqu\xE9 que vous avez commenc\xE9 \xE0 remplir votre demande de",
          importantNote: "Note importante :",
          draftDeletion: "Votre brouillon sera automatiquement supprim\xE9 si vous ne le compl\xE9tez pas. Pour des raisons de s\xE9curit\xE9 et de protection des donn\xE9es, nous ne pouvons pas conserver les demandes incompl\xE8tes ind\xE9finiment.",
          understandDoubts: "Nous comprenons que cr\xE9er une LLC peut soulever quelques questions. Sachez que nous sommes l\xE0 pour vous accompagner \xE0 chaque \xE9tape du processus.",
          questionsHelp: "Si vous avez des questions ou besoin d'aide pour compl\xE9ter votre demande, r\xE9pondez simplement \xE0 cet e-mail et nous serons ravis de vous aider.",
          whyChoose: "Pourquoi choisir Easy US LLC ?",
          reason1: "Formation compl\xE8te en 48-72 heures",
          reason2: "Assistance en espagnol tout au long du processus",
          reason3: "Obtention de l'EIN incluse",
          reason4: "Aide \xE0 l'ouverture d'un compte bancaire",
          reason5: "Support continu apr\xE8s la formation",
          noMoreReminders: "Si vous d\xE9cidez finalement de ne pas continuer, nous ne vous enverrons plus de rappels concernant cette demande. Votre vie priv\xE9e est importante pour nous.",
          savedDraft: "Ne vous inqui\xE9tez pas, nous avons sauvegard\xE9 toute votre progression pour que vous puissiez reprendre exactement l\xE0 o\xF9 vous vous \xEAtes arr\xEAt\xE9.",
          continueButton: "Continuer ma demande",
          tip: "Conseil :",
          tipText: "Compl\xE9tez votre demande pour que nous puissions commencer \xE0 travailler sur votre LLC le plus rapidement possible.",
          expiring: "Votre brouillon expirera dans 48 heures s'il n'est pas compl\xE9t\xE9.",
          llcFormation: "la constitution de votre LLC",
          maintenancePack: "pack de maintenance",
          dontLoseProgress: "Ne perdez pas votre progression. Reprenez votre demande maintenant et compl\xE9tez le processus en quelques minutes.",
          lastHours: "derni\xE8res heures",
          autoDeleteWarning: "Votre demande sera automatiquement supprim\xE9e si vous ne la compl\xE9tez pas."
        },
        calculatorResults: {
          results: "R\xE9sultats de votre calcul",
          introText: "Voici le r\xE9sum\xE9 de votre comparaison fiscale demand\xE9e. Nous avons analys\xE9 les chiffres et souhaitons que vous ayez toutes les informations pour prendre la meilleure d\xE9cision pour votre entreprise.",
          summary: "R\xE9sum\xE9 de votre analyse",
          income: "Revenus annuels :",
          expenses: "D\xE9penses d\xE9ductibles :",
          autonomoTax: "Imp\xF4ts en tant qu'ind\xE9pendant :",
          llcTax: "Imp\xF4ts avec LLC :",
          potentialSavings: "Vos \xE9conomies potentielles :",
          savings: "\xC9conomies estim\xE9es :",
          withLLC: "Avec une LLC aux \xC9tats-Unis, vous pourriez optimiser consid\xE9rablement votre charge fiscale tout en op\xE9rant de mani\xE8re parfaitement l\xE9gale. Ces \xE9conomies se maintiennent ann\xE9e apr\xE8s ann\xE9e, ce qui peut repr\xE9senter une diff\xE9rence importante pour votre entreprise \xE0 long terme.",
          learnMore: "Souhaitez-vous en savoir plus sur le fonctionnement ? Nous serons ravis de r\xE9pondre \xE0 toutes vos questions sans engagement.",
          viewServices: "Voir nos services",
          disclaimer: "Ce calcul est indicatif et bas\xE9 sur les donn\xE9es que vous avez fournies. Pour une analyse personnalis\xE9e de votre situation, n'h\xE9sitez pas \xE0 nous contacter."
        },
        newsletter: {
          confirmed: "Votre abonnement a \xE9t\xE9 confirm\xE9 avec succ\xE8s.",
          willReceive: "Vous recevrez des informations pertinentes sur les services, mises \xE0 jour et nouveaut\xE9s li\xE9es \xE0 Easy US LLC.",
          unsubscribe: "Vous pouvez vous d\xE9sabonner \xE0 tout moment via le lien inclus dans nos e-mails."
        },
        orderEvent: {
          update: "Votre commande a une mise \xE0 jour :",
          date: "Date :",
          viewDetails: "Voir les d\xE9tails"
        }
      },
      de: {
        common: {
          greeting: "Hallo",
          closing: "Mit freundlichen Gr\xFC\xDFen,",
          doubts: "Bei Fragen antworten Sie bitte direkt auf diese E-Mail.",
          client: "Kunde"
        },
        otp: {
          thanks: "Vielen Dank, dass Sie Ihren Prozess bei Easy US LLC fortsetzen.",
          forSecurity: "Um die Sicherheit Ihres Kontos zu gew\xE4hrleisten, verwenden Sie bitte den folgenden Verifizierungscode:",
          yourCode: "Ihr OTP-Code:",
          important: "Wichtig:",
          personalAndConfidential: "Dieser Code ist pers\xF6nlich und vertraulich",
          validFor: "Er ist aus Sicherheitsgr\xFCnden <strong>15 Minuten</strong> g\xFCltig",
          doNotShare: "Teilen Sie ihn mit niemandem",
          ignoreMessage: "Wenn Sie diesen Code nicht angefordert haben, k\xF6nnen Sie diese Nachricht bedenkenlos ignorieren.",
          ipDetected: "Anmeldeversuch erkannt von IP:"
        },
        welcome: {
          welcomeMessage: "Willkommen bei Easy US LLC! Wir freuen uns sehr, Sie bei uns zu haben.",
          accountCreated: "Ihr Konto wurde erfolgreich erstellt und Sie k\xF6nnen alles erkunden, was wir gemeinsam erreichen k\xF6nnen. \xDCber Ihren Kundenbereich haben Sie Zugang zu:",
          accessFrom: "\xDCber Ihren Kundenbereich haben Sie Zugang zu:",
          realTimeTracking: "Echtzeit-Verfolgung Ihrer Anfragen",
          documentCenter: "Dokumentencenter zum Herunterladen aller Ihrer Dateien",
          professionalTools: "Professionelle Tools wie den Rechnungsgenerator",
          fiscalCalendar: "Steuerkalender mit Ihren wichtigen Terminen",
          directSupport: "Direkte Kommunikation mit unserem Support-Team",
          hereToHelp: "Wir sind hier, um Sie bei jedem Schritt Ihres gesch\xE4ftlichen Abenteuers in den Vereinigten Staaten zu unterst\xFCtzen. Wenn Sie Fragen haben, z\xF6gern Sie nicht, uns zu kontaktieren.",
          exploreButton: "Meinen Kundenbereich erkunden"
        },
        accountPendingVerification: {
          accountCreatedBut: "Ihr Konto wurde erfolgreich erstellt, aber Sie m\xFCssen Ihre E-Mail-Adresse verifizieren, um es vollst\xE4ndig zu aktivieren.",
          actionRequired: "Aktion erforderlich:",
          accessAndVerify: "Greifen Sie auf Ihren Kundenbereich zu und verifizieren Sie Ihre E-Mail, um Ihr Konto zu aktivieren und auf alle Funktionen zuzugreifen.",
          verifyButton: "Meine E-Mail verifizieren",
          whileUnverified: "Solange Ihre E-Mail nicht verifiziert ist, bleibt Ihr Konto in \xDCberpr\xFCfung."
        },
        accountUnderReview: {
          underReview: "Wir m\xF6chten Sie dar\xFCber informieren, dass Ihr Konto einen kurzen \xDCberpr\xFCfungsprozess durchl\xE4uft. Keine Sorge, dies ist v\xF6llig routinem\xE4\xDFig und geh\xF6rt zu unseren Sicherheitsstandards zum Schutz Ihrer Daten und zur Gew\xE4hrleistung einer sicheren Erfahrung.",
          whyReview: "Warum tun wir das?",
          whyReviewText: "Bei Easy US LLC nehmen wir die Sicherheit unserer Kunden sehr ernst. Dieser Prozess erm\xF6glicht es uns zu \xFCberpr\xFCfen, ob alle Informationen korrekt sind und Ihr Konto ordnungsgem\xE4\xDF gesch\xFCtzt ist.",
          duringProcess: "W\xE4hrend dieser kurzen Phase werden die Funktionen Ihres Kontos vor\xFCbergehend eingeschr\xE4nkt. Das bedeutet, dass Sie keine neuen Bestellungen aufgeben oder bestehende Informationen \xE4ndern k\xF6nnen, aber keine Sorge: Diese Situation ist vor\xFCbergehend und beeintr\xE4chtigt keine bereits laufenden Verfahren.",
          whatHappens: "Was passiert jetzt?",
          step1: "Unser Team wird Ihre Kontoinformationen \xFCberpr\xFCfen (normalerweise innerhalb von 24-48 Gesch\xE4ftstagen)",
          step2: "Wir werden Sie per E-Mail benachrichtigen, sobald die \xDCberpr\xFCfung abgeschlossen ist",
          step3: "Wenn wir zus\xE4tzliche Dokumente ben\xF6tigen, werden wir Sie klar und einfach dar\xFCber informieren",
          teamReviewing: "In der Zwischenzeit, wenn Sie Fragen haben oder Hilfe ben\xF6tigen, z\xF6gern Sie nicht, auf diese E-Mail zu antworten. Wir sind hier, um Ihnen bei allem zu helfen, was Sie brauchen.",
          patience: "Vielen Dank f\xFCr Ihre Geduld und Ihr Vertrauen. Wir wissen, dass Ihre Zeit wertvoll ist, und werden alles tun, um dies so schnell wie m\xF6glich zu kl\xE4ren.",
          closing: "Herzliche Gr\xFC\xDFe vom Easy US LLC Team"
        },
        accountVip: {
          updatedToVip: "Ihr Konto wurde auf den VIP-Status aktualisiert.",
          benefits: "VIP-Vorteile:",
          priorityAttention: "Priorit\xE4re Betreuung und beschleunigte Bearbeitung",
          preferentialTracking: "Bevorzugte Nachverfolgung durch unser Team",
          fullAccess: "Vollst\xE4ndiger Zugang zu allen Diensten",
          viewDashboard: "Meinen Kundenbereich anzeigen"
        },
        accountReactivated: {
          reactivated: "Ihr Konto wurde erfolgreich reaktiviert.",
          canAccess: "Sie k\xF6nnen jetzt auf Ihren Kundenbereich zugreifen und alle unsere Dienste normal nutzen.",
          viewDashboard: "Meinen Kundenbereich anzeigen"
        },
        accountDeactivated: {
          deactivated: "Wir bedauern, Ihnen mitteilen zu m\xFCssen, dass Ihr Konto deaktiviert wurde.",
          cannotAccess: "Solange Ihr Konto in diesem Zustand bleibt, k\xF6nnen Sie nicht auf Ihren Kundenbereich zugreifen oder Vorg\xE4nge \xFCber unsere Plattform durchf\xFChren.",
          contactSupport: "Wenn Sie glauben, dass dies ein Fehler ist, oder weitere Informationen w\xFCnschen, kontaktieren Sie bitte unser Support-Team, indem Sie auf diese E-Mail antworten."
        },
        confirmation: {
          greatNews: "Gro\xDFartige Neuigkeiten! Wir haben Ihre Anfrage erhalten und arbeiten bereits daran. Ab jetzt k\xFCmmert sich unser Team um alles.",
          details: "Anfrage-Details",
          reference: "Referenz:",
          service: "Dienst:",
          company: "Unternehmen:",
          state: "Staat:",
          currentStatus: "Aktueller Status:",
          inReview: "In \xDCberpr\xFCfung",
          whatNow: "Was passiert jetzt?",
          validatingInfo: "Unser Team \xFCberpr\xFCft alle von Ihnen bereitgestellten Informationen. In den n\xE4chsten Stunden erhalten Sie Updates zum Fortschritt Ihrer Anfrage direkt per E-Mail. Sie k\xF6nnen den Status auch in Echtzeit \xFCber Ihren Kundenbereich verfolgen.",
          nextSteps: "N\xE4chste Schritte",
          step1: "Wir werden \xFCberpr\xFCfen, ob alle Informationen korrekt sind",
          step2: "Wir werden die Verfahren bei den zust\xE4ndigen Beh\xF6rden einleiten",
          step3: "Wir werden Sie in jeder Phase des Prozesses auf dem Laufenden halten",
          trackButton: "Meinen Anfragestatus anzeigen",
          questionRef: "Haben Sie Fragen? Antworten Sie einfach auf diese E-Mail unter Angabe Ihrer Referenz und wir helfen Ihnen gerne."
        },
        autoReply: {
          receivedMessage: "Ihre Nachricht wurde erfolgreich empfangen.",
          ticketNumber: "Ticket-Nummer",
          estimatedResponse: "Gesch\xE4tzte Antwortzeit: <strong>24-48 Gesch\xE4ftstage</strong>",
          responding: "Unser Team wird Ihre Anfrage pr\xFCfen und so schnell wie m\xF6glich antworten. Wenn Sie zus\xE4tzliche Informationen hinzuf\xFCgen m\xF6chten, antworten Sie direkt auf diese E-Mail.",
          seeMessages: "Nachrichten anzeigen"
        },
        orderUpdate: {
          statusChanged: "Der Status Ihrer Bestellung wurde aktualisiert.",
          orderLabel: "Bestellung:",
          newStatus: "Neuer Status:",
          statusPending: "Ausstehend",
          statusProcessing: "In Bearbeitung",
          statusPaid: "Bezahlt",
          statusFiled: "Eingereicht",
          statusDocumentsReady: "Dokumente bereit",
          statusCompleted: "Abgeschlossen",
          statusCancelled: "Storniert",
          clarification: "F\xFCr R\xFCckfragen zu dieser Aktualisierung antworten Sie bitte direkt auf diese E-Mail.",
          trackButton: "Vollst\xE4ndige Details anzeigen"
        },
        orderCompleted: {
          llcReady: "Ihre LLC ist fertig!",
          congratulations: "Herzlichen Gl\xFCckwunsch! Ihre Bestellung wurde erfolgreich abgeschlossen. Alles ist bereit, damit Sie Ihr Unternehmen in den Vereinigten Staaten betreiben k\xF6nnen.",
          docsReady: "Ihre Dokumentation ist bereit",
          accessDocuments: "Sie k\xF6nnen jetzt alle Dokumente Ihres Unternehmens \xFCber Ihr Dokumentencenter abrufen und herunterladen.",
          whatYouFind: "Was werden Sie finden?",
          documentList: "Verf\xFCgbare Dokumente:",
          articlesOrg: "Articles of Organization (Gr\xFCndungsdokument)",
          einLetter: "EIN-Brief vom IRS",
          registeredAgent: "Informationen zum registrierten Vertreter",
          additionalGuides: "Leitf\xE4den und zus\xE4tzliche Dokumente basierend auf Ihrem Service",
          viewDocuments: "Meine Dokumente anzeigen",
          nextSteps: "N\xE4chste Schritte:",
          activateBanking: "Bankkonto aktivieren (falls angefordert)",
          operatingAgreement: "Ihren Operating Agreement erstellen",
          trackExpenses: "Einnahmen und Ausgaben erfassen",
          hereForYou: "Denken Sie daran, dass wir weiterhin f\xFCr Sie da sind, um Ihnen bei allem zu helfen, was Sie brauchen. Wenn Sie Fragen zu den n\xE4chsten Schritten haben, wie die Er\xF6ffnung eines Bankkontos oder die Einrichtung Ihres Zahlungs-Gateways, z\xF6gern Sie nicht, uns zu kontaktieren.",
          feedbackRequest: "Ihre Erfahrung ist uns sehr wichtig. Wenn Sie einen Moment Zeit haben, w\xFCrden wir uns \xFCber Ihre Meinung zu unserem Service freuen."
        },
        noteReceived: {
          teamNote: "Sie haben eine neue Nachricht von unserem Team",
          relatedToOrder: "bez\xFCglich Ihrer Bestellung",
          respondNote: "Sie k\xF6nnen direkt auf diese E-Mail antworten oder \xFCber Ihren Kundenbereich den vollst\xE4ndigen Verlauf einsehen.",
          viewClientArea: "Meinen Kundenbereich anzeigen"
        },
        adminNote: {
          messageAbout: "Sie haben eine wichtige Nachricht zu Ihrer Anfrage:",
          viewTicket: "Ticket anzeigen",
          viewClientArea: "Meinen Kundenbereich anzeigen"
        },
        paymentRequest: {
          paymentRequired: "Eine Zahlungsanforderung wurde erstellt, um mit Ihrem Verfahren fortzufahren",
          messageLabel: "Nachricht:",
          amount: "in H\xF6he von",
          payNow: "Jetzt bezahlen",
          buttonFallback: "Wenn die Schaltfl\xE4che nicht funktioniert, kopieren Sie diesen Link und f\xFCgen Sie ihn ein:",
          securePayment: "Die Zahlung wird sicher \xFCber Stripe abgewickelt."
        },
        documentRequest: {
          needDocument: "Unser Team ben\xF6tigt, dass Sie folgendes Dokument hochladen:",
          messageLabel: "Nachricht:",
          documentType: "Angefordertes Dokument:",
          referenceTicket: "Referenz-Ticket:",
          important: "Wichtig:",
          uploadInstruction: "Bitte laden Sie das angeforderte Dokument so schnell wie m\xF6glich hoch, um Verz\xF6gerungen im Prozess zu vermeiden.",
          uploadButton: "Dokument hochladen"
        },
        documentUploaded: {
          documentReceived: "Wir haben ein neues Dokument zu Ihrer Akte hinzugef\xFCgt:",
          forOrder: "Bestellung:",
          accessDownload: "Sie k\xF6nnen dieses Dokument \xFCber Ihren Kundenbereich abrufen und herunterladen.",
          reviewing: "Unser Team wird es \xFCberpr\xFCfen und Sie benachrichtigen, wenn weitere Ma\xDFnahmen erforderlich sind.",
          viewDocuments: "Meine Dokumente anzeigen",
          trackButton: "Anfragestatus anzeigen"
        },
        messageReply: {
          newReply: "Sie haben eine neue Antwort in Ihrer Konversation:",
          repliedToQuery: "Wir haben auf Ihre Anfrage geantwortet",
          ticket: "Ticket:",
          viewConversation: "Konversation anzeigen",
          viewClientArea: "Meinen Kundenbereich anzeigen"
        },
        passwordChangeOtp: {
          passwordChangeRequest: "Sie haben die \xC4nderung Ihres Passworts beantragt. Verwenden Sie den folgenden Code zur Verifizierung Ihrer Identit\xE4t:",
          useCode: "Verwenden Sie den folgenden Code, um die \xC4nderung zu best\xE4tigen:",
          yourCode: "Ihr Verifizierungscode:",
          important: "Wichtig:",
          validFor: "Dieser Code l\xE4uft in <strong>10 Minuten</strong> ab",
          doNotShare: "Teilen Sie ihn mit niemandem",
          notRequested: "Wenn Sie diese \xC4nderung nicht beantragt haben, ignorieren Sie diese Nachricht."
        },
        profileChangeOtp: {
          title: "Identit\xE4tsverifizierung",
          sensitiveChangeRequest: "Eine \xC4nderung sensibler Profildaten wurde angefordert. Um Ihre Identit\xE4t zu best\xE4tigen, verwenden Sie den folgenden Verifizierungscode:",
          yourCode: "Ihr Verifizierungscode:",
          important: "Wichtig:",
          personalAndConfidential: "Dieser Code ist pers\xF6nlich und vertraulich",
          validFor: "G\xFCltig f\xFCr <strong>24 Stunden</strong>",
          doNotShare: "Teilen Sie ihn mit niemandem",
          ignoreMessage: "Wenn Sie diese \xC4nderung nicht angefordert haben, k\xF6nnen Sie diese Nachricht bedenkenlos ignorieren."
        },
        accountLocked: {
          locked: "Zu Ihrer Sicherheit wurde Ihr Konto nach mehreren fehlgeschlagenen Zugriffsversuchen vor\xFCbergehend gesperrt.",
          attempts: "Um Ihr Konto zu entsperren und Ihre Identit\xE4t zu verifizieren, ben\xF6tigen wir Folgendes von Ihnen:",
          verifyIdentity: "Um Ihr Konto zu entsperren und Ihre Identit\xE4t zu verifizieren, ben\xF6tigen wir Folgendes von Ihnen:",
          idRequirement: "Hochaufl\xF6sendes Bild des Ausweises/Reisepasses (beide Seiten)",
          birthDateConfirm: "Ihr best\xE4tigtes Geburtsdatum",
          referenceTicket: "Ihre Referenz-Ticket-ID lautet:",
          contactSupport: "Um Ihr Konto zu entsperren, kontaktieren Sie unser Support-Team:",
          resetPassword: "Passwort zur\xFCcksetzen",
          unlockButton: "Support kontaktieren"
        },
        renewalReminder: {
          reminderText: "Wir erinnern Sie daran, dass das Wartungspaket Ihrer LLC",
          expiresIn: "L\xE4uft ab in",
          dueDate: "F\xE4lligkeitsdatum:",
          daysRemaining: "Verbleibende Tage:",
          withoutMaintenance: "Ohne aktives Wartungspaket kann Ihre LLC ihren guten rechtlichen Status verlieren. Dazu geh\xF6rt:",
          registeredAgentActive: "Aktiver registrierter Vertreter",
          annualReports: "Einreichung der Jahresberichte",
          taxCompliance: "Steuerkonformit\xE4t (IRS 1120/5472)",
          legalAddress: "Rechtsadresse in den Vereinigten Staaten",
          renewNow: "Jetzt erneuern",
          whatHappens: "Was passiert, wenn ich nicht erneuere?",
          penalties: "M\xF6gliche Strafen und Zuschl\xE4ge",
          agentExpires: "Ihr registrierter Vertreter l\xE4uft ab",
          goodStanding: "Ihre LLC k\xF6nnte den guten Status verlieren",
          viewCalendar: "Steuerkalender anzeigen"
        },
        registrationOtp: {
          almostDone: "Vielen Dank f\xFCr Ihre Registrierung bei Easy US LLC. Ihr Verifizierungscode lautet:",
          confirmEmail: "Um die Registrierung Ihres Kontos abzuschlie\xDFen, geben Sie den folgenden Verifizierungscode ein:",
          yourCode: "Ihr Verifizierungscode:",
          important: "Wichtig:",
          validFor: "Dieser Code l\xE4uft ab in",
          doNotShare: "Teilen Sie ihn mit niemandem",
          clientIdLabel: "Ihre Kunden-ID lautet:",
          ignoreMessage: "Wenn Sie kein Konto bei uns erstellt haben, k\xF6nnen Sie diese Nachricht ignorieren."
        },
        operatingAgreementReady: {
          ready: "Ihr Operating Agreement ist fertig!",
          generated: "Wir haben gro\xDFartige Neuigkeiten f\xFCr Sie.",
          llcData: "Ihre LLC-Daten",
          companyLabel: "Unternehmen:",
          stateLabel: "Staat:",
          einLabel: "EIN:",
          whatIs: "Was ist das Operating Agreement?",
          explanation: "Es ist das rechtliche Dokument, das die Betriebsregeln Ihrer LLC festlegt, einschlie\xDFlich der Eigentumsstruktur, Gewinnverteilung und Verantwortlichkeiten der Mitglieder.",
          fullExplanation: "Es ist das grundlegende Rechtsdokument Ihrer LLC. Es definiert, wie Ihr Unternehmen gef\xFChrt wird, die Verantwortlichkeiten des Eigent\xFCmers und die Betriebsregeln. Obwohl es in einigen Staaten nicht obligatorisch ist, wird es dringend empfohlen, weil:",
          reason1: "Es verst\xE4rkt die Trennung zwischen Ihren pers\xF6nlichen und gesch\xE4ftlichen Finanzen",
          reason2: "Es wird von Banken und Zahlungsanbietern wie Stripe verlangt",
          reason3: "Es bietet Ihnen als Eigent\xFCmer zus\xE4tzlichen Rechtsschutz",
          reason4: "Es dokumentiert offiziell die Struktur Ihres Unternehmens",
          generateButton: "Mein Operating Agreement erstellen",
          autoGenerated: "Das Dokument wird automatisch mit Ihren LLC-Daten erstellt und in Ihrem Dokumentencenter gespeichert, damit Sie es jederzeit herunterladen k\xF6nnen.",
          viewDocument: "Mein Dokument anzeigen",
          tip: "Tipp:",
          tipText: "Bewahren Sie eine unterzeichnete Kopie dieses Dokuments zusammen mit Ihren anderen wichtigen Unternehmensunterlagen auf."
        },
        documentApproved: {
          title: "Dokument Genehmigt",
          approved: "Genehmigt",
          reviewedAndApproved: "Ihr Dokument wurde \xFCberpr\xFCft und erfolgreich genehmigt.",
          viewDocuments: "Meine Dokumente anzeigen"
        },
        documentRejected: {
          title: "Dokument Abgelehnt - Aktion Erforderlich",
          rejected: "Abgelehnt",
          reviewedAndRejected: "Ihr Dokument wurde \xFCberpr\xFCft und abgelehnt.",
          reason: "Grund",
          pleaseReupload: "Bitte greifen Sie auf Ihr Kunden-Dashboard zu und laden Sie das korrigierte Dokument erneut hoch.",
          viewDocuments: "Meine Dokumente anzeigen"
        },
        profileChangesVerified: {
          title: "Profil\xE4nderungen mit OTP Verifiziert",
          client: "Kunde",
          email: "E-Mail",
          clientId: "Kunden-ID",
          fieldsModified: "Ge\xE4nderte Felder",
          verifiedWithOtp: "\xC4nderung mit OTP verifiziert"
        },
        abandonedApplication: {
          incomplete: "Ihr Antrag ist unvollst\xE4ndig",
          noticeText: "Wir haben bemerkt, dass Sie begonnen haben, Ihren Antrag f\xFCr",
          importantNote: "Wichtiger Hinweis:",
          draftDeletion: "Ihr Entwurf wird automatisch gel\xF6scht, wenn Sie ihn nicht abschlie\xDFen. Aus Sicherheits- und Datenschutzgr\xFCnden k\xF6nnen wir unvollst\xE4ndige Antr\xE4ge nicht unbegrenzt aufbewahren.",
          understandDoubts: "Wir verstehen, dass die Gr\xFCndung einer LLC einige Fragen aufwerfen kann. Wir m\xF6chten, dass Sie wissen, dass wir Ihnen bei jedem Schritt des Prozesses zur Seite stehen.",
          questionsHelp: "Wenn Sie Fragen haben oder Hilfe beim Ausf\xFCllen Ihres Antrags ben\xF6tigen, antworten Sie einfach auf diese E-Mail und wir helfen Ihnen gerne.",
          whyChoose: "Warum Easy US LLC w\xE4hlen?",
          reason1: "Vollst\xE4ndige Gr\xFCndung in 48-72 Stunden",
          reason2: "Spanischsprachige Unterst\xFCtzung w\xE4hrend des gesamten Prozesses",
          reason3: "EIN-Beschaffung inklusive",
          reason4: "Hilfe bei der Kontoer\xF6ffnung",
          reason5: "Fortlaufender Support nach der Gr\xFCndung",
          noMoreReminders: "Wenn Sie sich letztendlich entscheiden, nicht fortzufahren, werden wir Ihnen keine weiteren Erinnerungen zu diesem Antrag senden. Ihre Privatsph\xE4re ist uns wichtig.",
          savedDraft: "Keine Sorge, wir haben Ihren gesamten Fortschritt gespeichert, damit Sie genau dort weitermachen k\xF6nnen, wo Sie aufgeh\xF6rt haben.",
          continueButton: "Meinen Antrag fortsetzen",
          tip: "Tipp:",
          tipText: "Schlie\xDFen Sie Ihren Antrag ab, damit wir so schnell wie m\xF6glich mit Ihrer LLC beginnen k\xF6nnen.",
          expiring: "Ihr Entwurf l\xE4uft in 48 Stunden ab, wenn er nicht abgeschlossen wird.",
          llcFormation: "Ihre LLC-Gr\xFCndung",
          maintenancePack: "Wartungspaket",
          dontLoseProgress: "Verlieren Sie nicht Ihren Fortschritt. Setzen Sie Ihren Antrag jetzt fort und schlie\xDFen Sie den Prozess in wenigen Minuten ab.",
          lastHours: "letzte Stunden",
          autoDeleteWarning: "Ihr Antrag wird automatisch gel\xF6scht, wenn Sie ihn nicht abschlie\xDFen."
        },
        calculatorResults: {
          results: "Ihre Berechnungsergebnisse",
          introText: "Hier ist die Zusammenfassung Ihres angeforderten Steuervergleichs. Wir haben die Zahlen analysiert und m\xF6chten, dass Sie alle Informationen haben, um die beste Entscheidung f\xFCr Ihr Unternehmen zu treffen.",
          summary: "Ihre Analysezusammenfassung",
          income: "Jahreseinkommen:",
          expenses: "Abzugsf\xE4hige Ausgaben:",
          autonomoTax: "Steuern als Freiberufler:",
          llcTax: "Steuern mit LLC:",
          potentialSavings: "Ihre m\xF6glichen Einsparungen:",
          savings: "Gesch\xE4tzte Einsparungen:",
          withLLC: "Mit einer LLC in den Vereinigten Staaten k\xF6nnten Sie Ihre Steuerlast erheblich optimieren und dabei v\xF6llig legal operieren. Diese Einsparungen bleiben Jahr f\xFCr Jahr bestehen, was einen wichtigen Unterschied f\xFCr Ihr Unternehmen langfristig ausmachen kann.",
          learnMore: "M\xF6chten Sie mehr dar\xFCber erfahren, wie es funktioniert? Wir beantworten gerne alle Ihre Fragen unverbindlich.",
          viewServices: "Unsere Dienste anzeigen",
          disclaimer: "Diese Berechnung ist indikativ und basiert auf den von Ihnen bereitgestellten Daten. F\xFCr eine personalisierte Analyse Ihrer Situation z\xF6gern Sie nicht, uns zu kontaktieren."
        },
        newsletter: {
          confirmed: "Ihr Abonnement wurde erfolgreich best\xE4tigt.",
          willReceive: "Sie erhalten relevante Informationen \xFCber Dienste, Updates und Neuigkeiten rund um Easy US LLC.",
          unsubscribe: "Sie k\xF6nnen sich jederzeit \xFCber den Link in unseren E-Mails abmelden."
        },
        orderEvent: {
          update: "Ihre Bestellung hat ein Update:",
          date: "Datum:",
          viewDetails: "Details anzeigen"
        }
      },
      it: {
        common: {
          greeting: "Ciao",
          closing: "Cordiali saluti,",
          doubts: "Se hai domande, rispondi direttamente a questa e-mail.",
          client: "Cliente"
        },
        otp: {
          thanks: "Grazie per continuare il tuo processo con Easy US LLC.",
          forSecurity: "Per garantire la sicurezza del tuo account, utilizza il seguente codice di verifica:",
          yourCode: "Il tuo codice OTP:",
          important: "Importante:",
          personalAndConfidential: "Questo codice \xE8 personale e confidenziale",
          validFor: "\xC8 valido per <strong>15 minuti</strong> per motivi di sicurezza",
          doNotShare: "Non condividerlo con nessuno",
          ignoreMessage: "Se non hai richiesto questo codice, puoi ignorare questo messaggio in tutta tranquillit\xE0.",
          ipDetected: "Tentativo di accesso rilevato dall'IP:"
        },
        welcome: {
          welcomeMessage: "Benvenuto in Easy US LLC! Siamo felici di averti con noi.",
          accountCreated: "Il tuo account \xE8 stato creato con successo e puoi iniziare a esplorare tutto ci\xF2 che possiamo fare insieme. Dalla tua Area Cliente avrai accesso a:",
          accessFrom: "Dalla tua Area Cliente avrai accesso a:",
          realTimeTracking: "Monitoraggio in tempo reale delle tue richieste",
          documentCenter: "Centro documentazione per scaricare tutti i tuoi file",
          professionalTools: "Strumenti professionali come il generatore di fatture",
          fiscalCalendar: "Calendario fiscale con le tue date importanti",
          directSupport: "Comunicazione diretta con il nostro team di supporto",
          hereToHelp: "Siamo qui per aiutarti in ogni fase della tua avventura imprenditoriale negli Stati Uniti. Se hai domande, non esitare a scriverci.",
          exploreButton: "Esplora la Mia Area Cliente"
        },
        accountPendingVerification: {
          accountCreatedBut: "Il tuo account \xE8 stato creato con successo, ma devi verificare la tua e-mail per attivarlo completamente.",
          actionRequired: "Azione richiesta:",
          accessAndVerify: "Accedi alla tua Area Cliente e verifica la tua e-mail per attivare il tuo account e accedere a tutte le funzionalit\xE0.",
          verifyButton: "Verifica la mia e-mail",
          whileUnverified: "Finch\xE9 la tua e-mail non sar\xE0 verificata, il tuo account rimarr\xE0 in fase di revisione."
        },
        accountUnderReview: {
          underReview: "Vogliamo informarti che il tuo account \xE8 entrato in un breve processo di verifica. Non preoccuparti, \xE8 completamente di routine e fa parte dei nostri standard di sicurezza per proteggere le tue informazioni e garantire un'esperienza sicura.",
          whyReview: "Perch\xE9 lo facciamo?",
          whyReviewText: "In Easy US LLC prendiamo molto seriamente la sicurezza dei nostri clienti. Questo processo ci permette di verificare che tutte le informazioni siano corrette e che il tuo account sia adeguatamente protetto.",
          duringProcess: "Durante questo breve periodo, le funzioni del tuo account saranno temporaneamente limitate. Ci\xF2 significa che non potrai effettuare nuovi ordini o modificare le informazioni esistenti, ma non preoccuparti: questa situazione \xE8 temporanea e non influir\xE0 su nessuna procedura gi\xE0 in corso.",
          whatHappens: "Cosa succede ora?",
          step1: "Il nostro team esaminer\xE0 le informazioni del tuo account (solitamente entro 24-48 ore lavorative)",
          step2: "Ti notificheremo tramite questa stessa e-mail non appena la verifica sar\xE0 completata",
          step3: "Se avremo bisogno di documenti aggiuntivi, te lo comunicheremo in modo chiaro e semplice",
          teamReviewing: "Nel frattempo, se hai domande o hai bisogno di aiuto, non esitare a rispondere a questa e-mail. Siamo qui per aiutarti in tutto ci\xF2 di cui hai bisogno.",
          patience: "Grazie per la tua pazienza e fiducia. Sappiamo che il tuo tempo \xE8 prezioso e faremo tutto il possibile per risolvere la questione il prima possibile.",
          closing: "Un caro saluto dal team di Easy US LLC"
        },
        accountVip: {
          updatedToVip: "Il tuo account \xE8 stato aggiornato allo stato VIP.",
          benefits: "Vantaggi VIP:",
          priorityAttention: "Attenzione prioritaria e gestione accelerata",
          preferentialTracking: "Monitoraggio preferenziale da parte del nostro team",
          fullAccess: "Accesso completo a tutti i servizi",
          viewDashboard: "Visualizza la Mia Area Cliente"
        },
        accountReactivated: {
          reactivated: "Il tuo account \xE8 stato riattivato con successo.",
          canAccess: "Ora puoi accedere alla tua Area Cliente e utilizzare tutti i nostri servizi normalmente.",
          viewDashboard: "Visualizza la Mia Area Cliente"
        },
        accountDeactivated: {
          deactivated: "Ci dispiace informarti che il tuo account \xE8 stato disattivato.",
          cannotAccess: "Finch\xE9 il tuo account rimarr\xE0 in questo stato, non potrai accedere alla tua Area Cliente n\xE9 effettuare operazioni tramite la nostra piattaforma.",
          contactSupport: "Se ritieni che si tratti di un errore o desideri maggiori informazioni, contatta il nostro team di supporto rispondendo a questa e-mail."
        },
        confirmation: {
          greatNews: "Ottime notizie! Abbiamo ricevuto la tua richiesta e stiamo gi\xE0 lavorando. Da questo momento, il nostro team si occuper\xE0 di tutto.",
          details: "Dettagli della richiesta",
          reference: "Riferimento:",
          service: "Servizio:",
          company: "Azienda:",
          state: "Stato:",
          currentStatus: "Stato attuale:",
          inReview: "In revisione",
          whatNow: "Cosa succede ora?",
          validatingInfo: "Il nostro team sta verificando tutte le informazioni che hai fornito. Nelle prossime ore riceverai aggiornamenti sull'avanzamento della tua richiesta direttamente via e-mail. Puoi anche seguire lo stato in tempo reale dalla tua Area Cliente.",
          nextSteps: "Prossimi passi",
          step1: "Verificheremo che tutte le informazioni siano corrette",
          step2: "Avvieremo le procedure presso le autorit\xE0 competenti",
          step3: "Ti terremo informato in ogni fase del processo",
          trackButton: "Visualizza lo stato della mia richiesta",
          questionRef: "Hai domande? Rispondi semplicemente a questa e-mail indicando il tuo riferimento e saremo felici di aiutarti."
        },
        autoReply: {
          receivedMessage: "Il tuo messaggio \xE8 stato ricevuto con successo.",
          ticketNumber: "Numero di ticket",
          estimatedResponse: "Tempo di risposta stimato: <strong>24-48 ore lavorative</strong>",
          responding: "Il nostro team esaminer\xE0 la tua richiesta e risponder\xE0 il prima possibile. Se hai bisogno di aggiungere informazioni supplementari, rispondi direttamente a questa e-mail.",
          seeMessages: "Visualizza messaggi"
        },
        orderUpdate: {
          statusChanged: "Lo stato del tuo ordine \xE8 stato aggiornato.",
          orderLabel: "Ordine:",
          newStatus: "Nuovo stato:",
          statusPending: "In attesa",
          statusProcessing: "In elaborazione",
          statusPaid: "Pagato",
          statusFiled: "Depositato",
          statusDocumentsReady: "Documenti pronti",
          statusCompleted: "Completato",
          statusCancelled: "Annullato",
          clarification: "Per qualsiasi chiarimento su questo aggiornamento, rispondi direttamente a questa e-mail.",
          trackButton: "Visualizza dettagli completi"
        },
        orderCompleted: {
          llcReady: "La tua LLC \xE8 pronta!",
          congratulations: "Congratulazioni! Il tuo ordine \xE8 stato completato con successo. Tutto \xE8 pronto per iniziare a operare con la tua azienda negli Stati Uniti.",
          docsReady: "La tua documentazione \xE8 pronta",
          accessDocuments: "Ora puoi accedere e scaricare tutti i documenti della tua azienda dal tuo Centro Documentazione.",
          whatYouFind: "Cosa troverai?",
          documentList: "Documenti disponibili:",
          articlesOrg: "Articles of Organization (atto costitutivo)",
          einLetter: "Lettera EIN dall'IRS",
          registeredAgent: "Informazioni sull'agente registrato",
          additionalGuides: "Guide e documenti aggiuntivi in base al tuo servizio",
          viewDocuments: "Visualizza I Miei Documenti",
          nextSteps: "Prossimi passi:",
          activateBanking: "Attivare il conto bancario (se richiesto)",
          operatingAgreement: "Generare il tuo Operating Agreement",
          trackExpenses: "Iniziare a registrare entrate e spese",
          hereForYou: "Ricorda che siamo sempre qui per aiutarti in tutto ci\xF2 di cui hai bisogno. Se hai domande sui prossimi passi, come aprire un conto bancario o configurare il tuo gateway di pagamento, non esitare a contattarci.",
          feedbackRequest: "La tua esperienza \xE8 molto importante per noi. Se hai un momento, ci farebbe piacere conoscere la tua opinione sul nostro servizio."
        },
        noteReceived: {
          teamNote: "Hai un nuovo messaggio dal nostro team",
          relatedToOrder: "relativo al tuo ordine",
          respondNote: "Puoi rispondere direttamente a questa e-mail o accedere alla tua Area Cliente per visualizzare lo storico completo.",
          viewClientArea: "Visualizza la Mia Area Cliente"
        },
        adminNote: {
          messageAbout: "Hai un messaggio importante riguardo alla tua richiesta:",
          viewTicket: "Visualizza ticket",
          viewClientArea: "Visualizza la Mia Area Cliente"
        },
        paymentRequest: {
          paymentRequired: "\xC8 stata generata una richiesta di pagamento per procedere con la tua pratica",
          messageLabel: "Messaggio:",
          amount: "per un importo di",
          payNow: "Effettua il pagamento",
          buttonFallback: "Se il pulsante non funziona, copia e incolla questo link:",
          securePayment: "Il pagamento viene elaborato in modo sicuro tramite Stripe."
        },
        documentRequest: {
          needDocument: "Il nostro team richiede che tu carichi il seguente documento:",
          messageLabel: "Messaggio:",
          documentType: "Documento richiesto:",
          referenceTicket: "Ticket di riferimento:",
          important: "Importante:",
          uploadInstruction: "Per favore, carica il documento richiesto il prima possibile per evitare ritardi nel processo.",
          uploadButton: "Carica documento"
        },
        documentUploaded: {
          documentReceived: "Abbiamo aggiunto un nuovo documento al tuo fascicolo:",
          forOrder: "Ordine:",
          accessDownload: "Puoi accedere e scaricare questo documento dalla tua Area Cliente.",
          reviewing: "Il nostro team lo esaminer\xE0 e ti notificher\xE0 se \xE8 necessaria un'azione aggiuntiva.",
          viewDocuments: "Visualizza I Miei Documenti",
          trackButton: "Visualizza stato della richiesta"
        },
        messageReply: {
          newReply: "Hai una nuova risposta nella tua conversazione:",
          repliedToQuery: "Abbiamo risposto alla tua richiesta",
          ticket: "Ticket:",
          viewConversation: "Visualizza conversazione",
          viewClientArea: "Visualizza la Mia Area Cliente"
        },
        passwordChangeOtp: {
          passwordChangeRequest: "Hai richiesto di cambiare la tua password. Usa il seguente codice per verificare la tua identit\xE0:",
          useCode: "Usa il seguente codice per confermare la modifica:",
          yourCode: "Il tuo codice di verifica:",
          important: "Importante:",
          validFor: "Questo codice scade tra <strong>10 minuti</strong>",
          doNotShare: "Non condividerlo con nessuno",
          notRequested: "Se non hai richiesto questa modifica, ignora questo messaggio."
        },
        profileChangeOtp: {
          title: "Verifica dell'Identit\xE0",
          sensitiveChangeRequest: "\xC8 stata richiesta una modifica ai dati sensibili del tuo profilo. Per confermare la tua identit\xE0, utilizza il seguente codice di verifica:",
          yourCode: "Il tuo codice di verifica:",
          important: "Importante:",
          personalAndConfidential: "Questo codice \xE8 personale e riservato",
          validFor: "Valido per <strong>24 ore</strong>",
          doNotShare: "Non condividerlo con nessuno",
          ignoreMessage: "Se non hai richiesto questa modifica, puoi ignorare questo messaggio in tutta sicurezza."
        },
        accountLocked: {
          locked: "Per la tua sicurezza, il tuo account \xE8 stato temporaneamente bloccato dopo aver rilevato molteplici tentativi di accesso falliti.",
          attempts: "Per sbloccare il tuo account e verificare la tua identit\xE0, abbiamo bisogno che ci invii:",
          verifyIdentity: "Per sbloccare il tuo account e verificare la tua identit\xE0, abbiamo bisogno che ci invii:",
          idRequirement: "Immagine ad alta risoluzione del documento d'identit\xE0/passaporto (fronte e retro)",
          birthDateConfirm: "La tua data di nascita confermata",
          referenceTicket: "Il tuo ID ticket di riferimento \xE8:",
          contactSupport: "Per sbloccare il tuo account, contatta il nostro team di supporto:",
          resetPassword: "Reimposta password",
          unlockButton: "Contatta il supporto"
        },
        renewalReminder: {
          reminderText: "Ti ricordiamo che il pacchetto di manutenzione della tua LLC",
          expiresIn: "Scade tra",
          dueDate: "Data di scadenza:",
          daysRemaining: "Giorni rimanenti:",
          withoutMaintenance: "Senza il pacchetto di manutenzione attivo, la tua LLC potrebbe perdere il suo buono stato legale. Questo include:",
          registeredAgentActive: "Agente registrato attivo",
          annualReports: "Presentazione dei rapporti annuali",
          taxCompliance: "Conformit\xE0 fiscale (IRS 1120/5472)",
          legalAddress: "Indirizzo legale negli Stati Uniti",
          renewNow: "Rinnova ora",
          whatHappens: "Cosa succede se non rinnovo?",
          penalties: "Possibili penalit\xE0 e sovrattasse",
          agentExpires: "Il tuo agente registrato scadr\xE0",
          goodStanding: "La tua LLC potrebbe perdere il buono stato",
          viewCalendar: "Visualizza calendario fiscale"
        },
        registrationOtp: {
          almostDone: "Grazie per esserti registrato su Easy US LLC. Il tuo codice di verifica \xE8:",
          confirmEmail: "Per completare la registrazione del tuo account, inserisci il seguente codice di verifica:",
          yourCode: "Il tuo codice di verifica:",
          important: "Importante:",
          validFor: "Questo codice scade tra",
          doNotShare: "Non condividerlo con nessuno",
          clientIdLabel: "Il tuo ID cliente \xE8:",
          ignoreMessage: "Se non hai creato un account con noi, puoi ignorare questo messaggio."
        },
        operatingAgreementReady: {
          ready: "Il tuo Operating Agreement \xE8 pronto!",
          generated: "Abbiamo ottime notizie per te.",
          llcData: "Dati della tua LLC",
          companyLabel: "Azienda:",
          stateLabel: "Stato:",
          einLabel: "EIN:",
          whatIs: "Cos'\xE8 l'Operating Agreement?",
          explanation: "\xC8 il documento legale che stabilisce le regole di funzionamento della tua LLC, inclusa la struttura proprietaria, la distribuzione degli utili e le responsabilit\xE0 dei membri.",
          fullExplanation: "\xC8 il documento legale fondamentale della tua LLC. Definisce come viene gestita la tua azienda, le responsabilit\xE0 del proprietario e le regole operative. Sebbene in alcuni stati non sia obbligatorio, \xE8 altamente raccomandato perch\xE9:",
          reason1: "Rafforza la separazione tra le tue finanze personali e quelle aziendali",
          reason2: "\xC8 richiesto da banche e processori di pagamento come Stripe",
          reason3: "Fornisce una protezione legale aggiuntiva per te come proprietario",
          reason4: "Documenta ufficialmente la struttura della tua attivit\xE0",
          generateButton: "Genera il mio Operating Agreement",
          autoGenerated: "Il documento sar\xE0 generato automaticamente con i dati della tua LLC e salvato nel tuo Centro Documentazione per poterlo scaricare quando ne avrai bisogno.",
          viewDocument: "Visualizza il mio documento",
          tip: "Consiglio:",
          tipText: "Conserva una copia firmata di questo documento insieme agli altri file importanti della tua azienda."
        },
        documentApproved: {
          title: "Documento Approvato",
          approved: "Approvato",
          reviewedAndApproved: "Il tuo documento \xE8 stato esaminato e approvato con successo.",
          viewDocuments: "Visualizza i miei documenti"
        },
        documentRejected: {
          title: "Documento Rifiutato - Azione Richiesta",
          rejected: "Rifiutato",
          reviewedAndRejected: "Il tuo documento \xE8 stato esaminato e rifiutato.",
          reason: "Motivo",
          pleaseReupload: "Per favore, accedi al tuo pannello cliente e carica nuovamente il documento corretto.",
          viewDocuments: "Visualizza i miei documenti"
        },
        profileChangesVerified: {
          title: "Modifiche Profilo Verificate con OTP",
          client: "Cliente",
          email: "Email",
          clientId: "ID Cliente",
          fieldsModified: "Campi modificati",
          verifiedWithOtp: "Modifica verificata con OTP"
        },
        abandonedApplication: {
          incomplete: "La tua richiesta \xE8 incompleta",
          noticeText: "Abbiamo notato che hai iniziato a compilare la tua richiesta per",
          importantNote: "Nota importante:",
          draftDeletion: "La tua bozza verr\xE0 eliminata automaticamente se non la completi. Per motivi di sicurezza e protezione dei dati, non possiamo conservare le richieste incomplete a tempo indeterminato.",
          understandDoubts: "Capiamo che fare il passo di creare una LLC possa generare alcune domande. Vogliamo che tu sappia che siamo qui per aiutarti in ogni fase del processo.",
          questionsHelp: "Se hai domande o hai bisogno di assistenza per completare la tua richiesta, rispondi semplicemente a questa e-mail e saremo felici di aiutarti.",
          whyChoose: "Perch\xE9 scegliere Easy US LLC?",
          reason1: "Costituzione completa in 48-72 ore",
          reason2: "Assistenza in spagnolo durante tutto il processo",
          reason3: "Ottenimento dell'EIN incluso",
          reason4: "Aiuto con l'apertura del conto bancario",
          reason5: "Supporto continuo dopo la costituzione",
          noMoreReminders: "Se alla fine decidi di non continuare, non ti invieremo pi\xF9 promemoria su questa richiesta. La tua privacy \xE8 importante per noi.",
          savedDraft: "Non preoccuparti, abbiamo salvato tutti i tuoi progressi in modo che tu possa riprendere esattamente da dove ti eri fermato.",
          continueButton: "Continua la mia richiesta",
          tip: "Consiglio:",
          tipText: "Completa la tua richiesta in modo che possiamo iniziare a lavorare sulla tua LLC il prima possibile.",
          expiring: "La tua bozza scadr\xE0 tra 48 ore se non la completi.",
          llcFormation: "la costituzione della tua LLC",
          maintenancePack: "pacchetto di manutenzione",
          dontLoseProgress: "Non perdere i tuoi progressi. Riprendi la tua richiesta ora e completa il processo in pochi minuti.",
          lastHours: "ultime ore",
          autoDeleteWarning: "La tua richiesta verr\xE0 eliminata automaticamente se non la completi."
        },
        calculatorResults: {
          results: "Risultati del tuo calcolo",
          introText: "Ecco il riepilogo del confronto fiscale che hai richiesto. Abbiamo analizzato i numeri e vogliamo che tu abbia tutte le informazioni per prendere la migliore decisione per la tua attivit\xE0.",
          summary: "Riepilogo della tua analisi",
          income: "Reddito annuale:",
          expenses: "Spese deducibili:",
          autonomoTax: "Tasse come lavoratore autonomo:",
          llcTax: "Tasse con LLC:",
          potentialSavings: "Il tuo risparmio potenziale:",
          savings: "Risparmio stimato:",
          withLLC: "Con una LLC negli Stati Uniti, potresti ottimizzare significativamente il tuo carico fiscale operando in modo completamente legale. Questi risparmi si mantengono anno dopo anno, il che pu\xF2 fare una differenza importante per la tua attivit\xE0 a lungo termine.",
          learnMore: "Vorresti saperne di pi\xF9 su come funziona? Saremo felici di rispondere a tutte le tue domande senza impegno.",
          viewServices: "Visualizza i nostri servizi",
          disclaimer: "Questo calcolo \xE8 indicativo e si basa sui dati che hai fornito. Per un'analisi personalizzata della tua situazione, non esitare a contattarci."
        },
        newsletter: {
          confirmed: "La tua iscrizione \xE8 stata confermata con successo.",
          willReceive: "Riceverai informazioni pertinenti su servizi, aggiornamenti e novit\xE0 relative a Easy US LLC.",
          unsubscribe: "Puoi annullare l'iscrizione in qualsiasi momento tramite il link incluso nelle nostre e-mail."
        },
        orderEvent: {
          update: "Il tuo ordine ha un aggiornamento:",
          date: "Data:",
          viewDetails: "Visualizza dettagli"
        }
      },
      pt: {
        common: {
          greeting: "Ol\xE1",
          closing: "Atenciosamente,",
          doubts: "Se tiver alguma d\xFAvida, responda diretamente a este e-mail.",
          client: "Cliente"
        },
        otp: {
          thanks: "Obrigado por continuar com o seu processo na Easy US LLC.",
          forSecurity: "Para garantir a seguran\xE7a da sua conta, utilize o seguinte c\xF3digo de verifica\xE7\xE3o:",
          yourCode: "O seu c\xF3digo OTP:",
          important: "Importante:",
          personalAndConfidential: "Este c\xF3digo \xE9 pessoal e confidencial",
          validFor: "\xC9 v\xE1lido por <strong>15 minutos</strong> por raz\xF5es de seguran\xE7a",
          doNotShare: "N\xE3o o partilhe com ningu\xE9m",
          ignoreMessage: "Se n\xE3o solicitou este c\xF3digo, pode ignorar esta mensagem com toda a tranquilidade.",
          ipDetected: "Tentativa de acesso detetada a partir do IP:"
        },
        welcome: {
          welcomeMessage: "Bem-vindo \xE0 Easy US LLC! Estamos muito felizes por t\xEA-lo connosco.",
          accountCreated: "A sua conta foi criada com sucesso e pode come\xE7ar a explorar tudo o que podemos fazer juntos. A partir da sua \xC1rea de Cliente ter\xE1 acesso a:",
          accessFrom: "A partir da sua \xC1rea de Cliente ter\xE1 acesso a:",
          realTimeTracking: "Acompanhamento em tempo real dos seus pedidos",
          documentCenter: "Centro de documenta\xE7\xE3o para descarregar todos os seus ficheiros",
          professionalTools: "Ferramentas profissionais como o gerador de faturas",
          fiscalCalendar: "Calend\xE1rio fiscal com as suas datas importantes",
          directSupport: "Comunica\xE7\xE3o direta com a nossa equipa de suporte",
          hereToHelp: "Estamos aqui para ajud\xE1-lo em cada passo da sua aventura empresarial nos Estados Unidos. Se tiver alguma d\xFAvida, n\xE3o hesite em contactar-nos.",
          exploreButton: "Explorar a Minha \xC1rea de Cliente"
        },
        accountPendingVerification: {
          accountCreatedBut: "A sua conta foi criada com sucesso, mas precisa de verificar o seu e-mail para a ativar completamente.",
          actionRequired: "A\xE7\xE3o necess\xE1ria:",
          accessAndVerify: "Aceda \xE0 sua \xC1rea de Cliente e verifique o seu e-mail para ativar a sua conta e aceder a todas as funcionalidades.",
          verifyButton: "Verificar o meu e-mail",
          whileUnverified: "Enquanto o seu e-mail n\xE3o estiver verificado, a sua conta permanecer\xE1 em revis\xE3o."
        },
        accountUnderReview: {
          underReview: "Queremos inform\xE1-lo de que a sua conta entrou num breve processo de verifica\xE7\xE3o. N\xE3o se preocupe, \xE9 completamente rotineiro e faz parte dos nossos padr\xF5es de seguran\xE7a para proteger as suas informa\xE7\xF5es e garantir uma experi\xEAncia segura.",
          whyReview: "Porque fazemos isto?",
          whyReviewText: "Na Easy US LLC, levamos muito a s\xE9rio a seguran\xE7a dos nossos clientes. Este processo permite-nos verificar que todas as informa\xE7\xF5es est\xE3o corretas e que a sua conta est\xE1 devidamente protegida.",
          duringProcess: "Durante este breve per\xEDodo, as fun\xE7\xF5es da sua conta estar\xE3o temporariamente limitadas. Isto significa que n\xE3o poder\xE1 fazer novos pedidos nem modificar informa\xE7\xF5es existentes, mas n\xE3o se preocupe: esta situa\xE7\xE3o \xE9 tempor\xE1ria e n\xE3o afetar\xE1 nenhum processo j\xE1 em curso.",
          whatHappens: "O que acontece agora?",
          step1: "A nossa equipa ir\xE1 rever as informa\xE7\xF5es da sua conta (normalmente dentro de 24-48 horas \xFAteis)",
          step2: "Notific\xE1-lo-emos por este mesmo e-mail assim que a verifica\xE7\xE3o estiver conclu\xEDda",
          step3: "Se precisarmos de documentos adicionais, inform\xE1-lo-emos de forma clara e simples",
          teamReviewing: "Entretanto, se tiver alguma d\xFAvida ou precisar de ajuda, n\xE3o hesite em responder a este e-mail. Estamos aqui para ajud\xE1-lo em tudo o que precisar.",
          patience: "Obrigado pela sua paci\xEAncia e confian\xE7a. Sabemos que o seu tempo \xE9 valioso e faremos tudo o poss\xEDvel para resolver isto o mais rapidamente poss\xEDvel.",
          closing: "Com carinho, a equipa da Easy US LLC"
        },
        accountVip: {
          updatedToVip: "A sua conta foi atualizada para o estado VIP.",
          benefits: "Benef\xEDcios VIP:",
          priorityAttention: "Aten\xE7\xE3o priorit\xE1ria e processamento acelerado",
          preferentialTracking: "Acompanhamento preferencial pela nossa equipa",
          fullAccess: "Acesso completo a todos os servi\xE7os",
          viewDashboard: "Ver a Minha \xC1rea de Cliente"
        },
        accountReactivated: {
          reactivated: "A sua conta foi reativada com sucesso.",
          canAccess: "Agora pode aceder \xE0 sua \xC1rea de Cliente e utilizar todos os nossos servi\xE7os normalmente.",
          viewDashboard: "Ver a Minha \xC1rea de Cliente"
        },
        accountDeactivated: {
          deactivated: "Lamentamos informar que a sua conta foi desativada.",
          cannotAccess: "Enquanto a sua conta permanecer neste estado, n\xE3o poder\xE1 aceder \xE0 sua \xC1rea de Cliente nem realizar opera\xE7\xF5es atrav\xE9s da nossa plataforma.",
          contactSupport: "Se acredita que se trata de um erro ou deseja obter mais informa\xE7\xF5es, contacte a nossa equipa de suporte respondendo a este e-mail."
        },
        confirmation: {
          greatNews: "\xD3timas not\xEDcias! Recebemos o seu pedido e j\xE1 estamos a trabalhar nele. A partir de agora, a nossa equipa trata de tudo.",
          details: "Detalhes do pedido",
          reference: "Refer\xEAncia:",
          service: "Servi\xE7o:",
          company: "Empresa:",
          state: "Estado:",
          currentStatus: "Estado atual:",
          inReview: "Em revis\xE3o",
          whatNow: "O que acontece agora?",
          validatingInfo: "A nossa equipa est\xE1 a validar todas as informa\xE7\xF5es que forneceu. Nas pr\xF3ximas horas receber\xE1 atualiza\xE7\xF5es sobre o progresso do seu pedido diretamente no seu e-mail. Tamb\xE9m pode acompanhar o estado em tempo real a partir da sua \xC1rea de Cliente.",
          nextSteps: "Pr\xF3ximos passos",
          step1: "Verificaremos que todas as informa\xE7\xF5es est\xE3o corretas",
          step2: "Iniciaremos os procedimentos junto das autoridades competentes",
          step3: "Mant\xEA-lo-emos informado em cada etapa do processo",
          trackButton: "Ver o estado do meu pedido",
          questionRef: "Tem alguma d\xFAvida? Responda simplesmente a este e-mail mencionando a sua refer\xEAncia e teremos todo o prazer em ajudar."
        },
        autoReply: {
          receivedMessage: "A sua mensagem foi recebida com sucesso.",
          ticketNumber: "N\xFAmero do ticket",
          estimatedResponse: "Tempo de resposta estimado: <strong>24-48 horas \xFAteis</strong>",
          responding: "A nossa equipa analisar\xE1 a sua consulta e responder\xE1 o mais brevemente poss\xEDvel. Se precisar de adicionar informa\xE7\xF5es adicionais, responda diretamente a este e-mail.",
          seeMessages: "Ver mensagens"
        },
        orderUpdate: {
          statusChanged: "O estado da sua encomenda foi atualizado.",
          orderLabel: "Encomenda:",
          newStatus: "Novo estado:",
          statusPending: "Pendente",
          statusProcessing: "Em processamento",
          statusPaid: "Pago",
          statusFiled: "Registado",
          statusDocumentsReady: "Documentos prontos",
          statusCompleted: "Conclu\xEDdo",
          statusCancelled: "Cancelado",
          clarification: "Para qualquer esclarecimento sobre esta atualiza\xE7\xE3o, responda diretamente a este e-mail.",
          trackButton: "Ver detalhes completos"
        },
        orderCompleted: {
          llcReady: "A sua LLC est\xE1 pronta!",
          congratulations: "Parab\xE9ns! A sua encomenda foi conclu\xEDda com sucesso. Tudo est\xE1 pronto para come\xE7ar a operar a sua empresa nos Estados Unidos.",
          docsReady: "A sua documenta\xE7\xE3o est\xE1 pronta",
          accessDocuments: "Agora pode aceder e descarregar todos os documentos da sua empresa a partir do seu Centro de Documenta\xE7\xE3o.",
          whatYouFind: "O que vai encontrar?",
          documentList: "Documentos dispon\xEDveis:",
          articlesOrg: "Articles of Organization (documento de constitui\xE7\xE3o)",
          einLetter: "Carta EIN do IRS",
          registeredAgent: "Informa\xE7\xF5es do agente registado",
          additionalGuides: "Guias e documentos adicionais de acordo com o seu servi\xE7o",
          viewDocuments: "Ver Os Meus Documentos",
          nextSteps: "Pr\xF3ximos passos:",
          activateBanking: "Ativar conta banc\xE1ria (se solicitado)",
          operatingAgreement: "Gerar o seu Operating Agreement",
          trackExpenses: "Come\xE7ar a registar receitas e despesas",
          hereForYou: "Lembre-se de que continuamos aqui para ajud\xE1-lo em tudo o que precisar. Se tiver d\xFAvidas sobre os pr\xF3ximos passos, como abrir uma conta banc\xE1ria ou configurar o seu gateway de pagamento, n\xE3o hesite em contactar-nos.",
          feedbackRequest: "A sua experi\xEAncia \xE9 muito importante para n\xF3s. Se tiver um momento, adorar\xEDamos conhecer a sua opini\xE3o sobre o nosso servi\xE7o."
        },
        noteReceived: {
          teamNote: "Tem uma nova mensagem da nossa equipa",
          relatedToOrder: "relacionada com a sua encomenda",
          respondNote: "Pode responder diretamente a este e-mail ou aceder \xE0 sua \xC1rea de Cliente para ver o hist\xF3rico completo.",
          viewClientArea: "Ver a Minha \xC1rea de Cliente"
        },
        adminNote: {
          messageAbout: "Tem uma mensagem importante sobre o seu pedido:",
          viewTicket: "Ver ticket",
          viewClientArea: "Ver a Minha \xC1rea de Cliente"
        },
        paymentRequest: {
          paymentRequired: "Foi gerado um pedido de pagamento para prosseguir com o seu processo",
          messageLabel: "Mensagem:",
          amount: "no valor de",
          payNow: "Efetuar pagamento",
          buttonFallback: "Se o bot\xE3o n\xE3o funcionar, copie e cole este link:",
          securePayment: "O pagamento \xE9 processado de forma segura atrav\xE9s do Stripe."
        },
        documentRequest: {
          needDocument: "A nossa equipa necessita que carregue o seguinte documento:",
          messageLabel: "Mensagem:",
          documentType: "Documento solicitado:",
          referenceTicket: "Ticket de refer\xEAncia:",
          important: "Importante:",
          uploadInstruction: "Por favor, carregue o documento solicitado o mais brevemente poss\xEDvel para evitar atrasos no processo.",
          uploadButton: "Carregar documento"
        },
        documentUploaded: {
          documentReceived: "Adicion\xE1mos um novo documento ao seu processo:",
          forOrder: "Encomenda:",
          accessDownload: "Pode aceder e descarregar este documento a partir da sua \xC1rea de Cliente.",
          reviewing: "A nossa equipa ir\xE1 analis\xE1-lo e notific\xE1-lo-\xE1 se for necess\xE1ria alguma a\xE7\xE3o adicional.",
          viewDocuments: "Ver Os Meus Documentos",
          trackButton: "Ver estado do pedido"
        },
        messageReply: {
          newReply: "Tem uma nova resposta na sua conversa:",
          repliedToQuery: "Respondemos \xE0 sua consulta",
          ticket: "Ticket:",
          viewConversation: "Ver conversa",
          viewClientArea: "Ver a Minha \xC1rea de Cliente"
        },
        passwordChangeOtp: {
          passwordChangeRequest: "Solicitou a altera\xE7\xE3o da sua palavra-passe. Utilize o seguinte c\xF3digo para verificar a sua identidade:",
          useCode: "Utilize o seguinte c\xF3digo para confirmar a altera\xE7\xE3o:",
          yourCode: "O seu c\xF3digo de verifica\xE7\xE3o:",
          important: "Importante:",
          validFor: "Este c\xF3digo expira em <strong>10 minutos</strong>",
          doNotShare: "N\xE3o o partilhe com ningu\xE9m",
          notRequested: "Se n\xE3o solicitou esta altera\xE7\xE3o, ignore esta mensagem."
        },
        profileChangeOtp: {
          title: "Verifica\xE7\xE3o de Identidade",
          sensitiveChangeRequest: "Foi solicitada uma altera\xE7\xE3o nos dados sens\xEDveis do seu perfil. Para confirmar a sua identidade, utilize o seguinte c\xF3digo de verifica\xE7\xE3o:",
          yourCode: "O seu c\xF3digo de verifica\xE7\xE3o:",
          important: "Importante:",
          personalAndConfidential: "Este c\xF3digo \xE9 pessoal e confidencial",
          validFor: "V\xE1lido por <strong>24 horas</strong>",
          doNotShare: "N\xE3o o partilhe com ningu\xE9m",
          ignoreMessage: "Se n\xE3o solicitou esta altera\xE7\xE3o, pode ignorar esta mensagem com total tranquilidade."
        },
        accountLocked: {
          locked: "Para sua seguran\xE7a, a sua conta foi temporariamente bloqueada ap\xF3s a dete\xE7\xE3o de m\xFAltiplas tentativas de acesso falhadas.",
          attempts: "Para desbloquear a sua conta e verificar a sua identidade, precisamos que nos envie:",
          verifyIdentity: "Para desbloquear a sua conta e verificar a sua identidade, precisamos que nos envie:",
          idRequirement: "Imagem de alta resolu\xE7\xE3o do documento de identidade/passaporte (frente e verso)",
          birthDateConfirm: "A sua data de nascimento confirmada",
          referenceTicket: "O seu ID de ticket de refer\xEAncia \xE9:",
          contactSupport: "Para desbloquear a sua conta, contacte a nossa equipa de suporte:",
          resetPassword: "Redefinir palavra-passe",
          unlockButton: "Contactar suporte"
        },
        renewalReminder: {
          reminderText: "Lembramos que o pacote de manuten\xE7\xE3o da sua LLC",
          expiresIn: "Expira em",
          dueDate: "Data de vencimento:",
          daysRemaining: "Dias restantes:",
          withoutMaintenance: "Sem o pacote de manuten\xE7\xE3o ativo, a sua LLC pode perder o seu bom estado legal. Isto inclui:",
          registeredAgentActive: "Agente registado ativo",
          annualReports: "Apresenta\xE7\xE3o de relat\xF3rios anuais",
          taxCompliance: "Conformidade fiscal (IRS 1120/5472)",
          legalAddress: "Morada legal nos Estados Unidos",
          renewNow: "Renovar agora",
          whatHappens: "O que acontece se n\xE3o renovar?",
          penalties: "Poss\xEDveis penaliza\xE7\xF5es e sobretaxas",
          agentExpires: "O seu agente registado expirar\xE1",
          goodStanding: "A sua LLC pode perder o bom estado",
          viewCalendar: "Ver calend\xE1rio fiscal"
        },
        registrationOtp: {
          almostDone: "Obrigado por se registar na Easy US LLC. O seu c\xF3digo de verifica\xE7\xE3o \xE9:",
          confirmEmail: "Para completar o registo da sua conta, introduza o seguinte c\xF3digo de verifica\xE7\xE3o:",
          yourCode: "O seu c\xF3digo de verifica\xE7\xE3o:",
          important: "Importante:",
          validFor: "Este c\xF3digo expira em",
          doNotShare: "N\xE3o o partilhe com ningu\xE9m",
          clientIdLabel: "O seu ID de cliente \xE9:",
          ignoreMessage: "Se n\xE3o criou uma conta connosco, pode ignorar esta mensagem."
        },
        operatingAgreementReady: {
          ready: "O seu Operating Agreement est\xE1 pronto!",
          generated: "Temos \xF3timas not\xEDcias para si.",
          llcData: "Dados da sua LLC",
          companyLabel: "Empresa:",
          stateLabel: "Estado:",
          einLabel: "EIN:",
          whatIs: "O que \xE9 o Operating Agreement?",
          explanation: "\xC9 o documento legal que estabelece as regras de funcionamento da sua LLC, incluindo a estrutura de propriedade, distribui\xE7\xE3o de lucros e responsabilidades dos membros.",
          fullExplanation: "\xC9 o documento legal fundamental da sua LLC. Define como a sua empresa \xE9 gerida, as responsabilidades do propriet\xE1rio e as regras de opera\xE7\xE3o. Embora em alguns estados n\xE3o seja obrigat\xF3rio, \xE9 altamente recomend\xE1vel porque:",
          reason1: "Refor\xE7a a separa\xE7\xE3o entre as suas finan\xE7as pessoais e as da empresa",
          reason2: "\xC9 exigido por bancos e processadores de pagamento como o Stripe",
          reason3: "Proporciona prote\xE7\xE3o legal adicional para si como propriet\xE1rio",
          reason4: "Documenta oficialmente a estrutura do seu neg\xF3cio",
          generateButton: "Gerar o meu Operating Agreement",
          autoGenerated: "O documento ser\xE1 gerado automaticamente com os dados da sua LLC e guardado no seu Centro de Documenta\xE7\xE3o para que possa descarreg\xE1-lo quando precisar.",
          viewDocument: "Ver o meu documento",
          tip: "Dica:",
          tipText: "Guarde uma c\xF3pia assinada deste documento junto com os outros ficheiros importantes da sua empresa."
        },
        documentApproved: {
          title: "Documento Aprovado",
          approved: "Aprovado",
          reviewedAndApproved: "O seu documento foi revisto e aprovado com sucesso.",
          viewDocuments: "Ver os meus documentos"
        },
        documentRejected: {
          title: "Documento Rejeitado - A\xE7\xE3o Necess\xE1ria",
          rejected: "Rejeitado",
          reviewedAndRejected: "O seu documento foi revisto e rejeitado.",
          reason: "Motivo",
          pleaseReupload: "Por favor, aceda ao seu painel de cliente e carregue novamente o documento corrigido.",
          viewDocuments: "Ver os meus documentos"
        },
        profileChangesVerified: {
          title: "Altera\xE7\xF5es de Perfil Verificadas com OTP",
          client: "Cliente",
          email: "Email",
          clientId: "ID de Cliente",
          fieldsModified: "Campos modificados",
          verifiedWithOtp: "Altera\xE7\xE3o verificada com OTP"
        },
        abandonedApplication: {
          incomplete: "O seu pedido est\xE1 incompleto",
          noticeText: "Repar\xE1mos que come\xE7ou a preencher o seu pedido de",
          importantNote: "Nota importante:",
          draftDeletion: "O seu rascunho ser\xE1 automaticamente eliminado se n\xE3o o completar. Por raz\xF5es de seguran\xE7a e prote\xE7\xE3o de dados, n\xE3o podemos manter pedidos incompletos indefinidamente.",
          understandDoubts: "Compreendemos que dar o passo de criar uma LLC pode gerar algumas d\xFAvidas. Queremos que saiba que estamos aqui para ajud\xE1-lo em cada passo do processo.",
          questionsHelp: "Se tiver alguma d\xFAvida ou precisar de assist\xEAncia para completar o seu pedido, responda simplesmente a este e-mail e teremos todo o prazer em ajudar.",
          whyChoose: "Porqu\xEA escolher a Easy US LLC?",
          reason1: "Constitui\xE7\xE3o completa em 48-72 horas",
          reason2: "Assist\xEAncia em espanhol durante todo o processo",
          reason3: "Obten\xE7\xE3o do EIN inclu\xEDda",
          reason4: "Ajuda com a abertura de conta banc\xE1ria",
          reason5: "Suporte cont\xEDnuo ap\xF3s a constitui\xE7\xE3o",
          noMoreReminders: "Se decidir n\xE3o continuar, n\xE3o lhe enviaremos mais lembretes sobre este pedido. A sua privacidade \xE9 importante para n\xF3s.",
          savedDraft: "N\xE3o se preocupe, guard\xE1mos todo o seu progresso para que possa continuar exatamente de onde parou.",
          continueButton: "Continuar o meu pedido",
          tip: "Dica:",
          tipText: "Complete o seu pedido para que possamos come\xE7ar a trabalhar na sua LLC o mais rapidamente poss\xEDvel.",
          expiring: "O seu rascunho expirar\xE1 em 48 horas se n\xE3o o completar.",
          llcFormation: "a constitui\xE7\xE3o da sua LLC",
          maintenancePack: "pacote de manuten\xE7\xE3o",
          dontLoseProgress: "N\xE3o perca o seu progresso. Retome o seu pedido agora e complete o processo em poucos minutos.",
          lastHours: "\xFAltimas horas",
          autoDeleteWarning: "O seu pedido ser\xE1 automaticamente eliminado se n\xE3o o completar."
        },
        calculatorResults: {
          results: "Resultados do seu c\xE1lculo",
          introText: "Aqui est\xE1 o resumo da sua compara\xE7\xE3o fiscal solicitada. Analis\xE1mos os n\xFAmeros e queremos que tenha toda a informa\xE7\xE3o para tomar a melhor decis\xE3o para o seu neg\xF3cio.",
          summary: "Resumo da sua an\xE1lise",
          income: "Rendimento anual:",
          expenses: "Despesas dedut\xEDveis:",
          autonomoTax: "Impostos como trabalhador independente:",
          llcTax: "Impostos com LLC:",
          potentialSavings: "A sua poupan\xE7a potencial:",
          savings: "Poupan\xE7a estimada:",
          withLLC: "Com uma LLC nos Estados Unidos, poderia otimizar significativamente a sua carga fiscal enquanto opera de forma completamente legal. Esta poupan\xE7a mant\xE9m-se ano ap\xF3s ano, o que pode representar uma diferen\xE7a importante para o seu neg\xF3cio a longo prazo.",
          learnMore: "Gostaria de saber mais sobre como funciona? Teremos todo o prazer em responder a todas as suas d\xFAvidas sem qualquer compromisso.",
          viewServices: "Ver os nossos servi\xE7os",
          disclaimer: "Este c\xE1lculo \xE9 indicativo e baseia-se nos dados que forneceu. Para uma an\xE1lise personalizada da sua situa\xE7\xE3o, n\xE3o hesite em contactar-nos."
        },
        newsletter: {
          confirmed: "A sua subscri\xE7\xE3o foi confirmada com sucesso.",
          willReceive: "Receber\xE1 informa\xE7\xF5es relevantes sobre servi\xE7os, atualiza\xE7\xF5es e novidades relacionadas com a Easy US LLC.",
          unsubscribe: "Pode cancelar a subscri\xE7\xE3o a qualquer momento atrav\xE9s do link inclu\xEDdo nos nossos e-mails."
        },
        orderEvent: {
          update: "A sua encomenda tem uma atualiza\xE7\xE3o:",
          date: "Data:",
          viewDetails: "Ver detalhes"
        }
      }
    };
  }
});

// server/lib/email.ts
var email_exports = {};
__export(email_exports, {
  getAbandonedApplicationReminderTemplate: () => getAbandonedApplicationReminderTemplate,
  getAbandonedApplicationTemplate: () => getAbandonedApplicationTemplate,
  getAccountDeactivatedTemplate: () => getAccountDeactivatedTemplate,
  getAccountLockedTemplate: () => getAccountLockedTemplate,
  getAccountPendingVerificationTemplate: () => getAccountPendingVerificationTemplate,
  getAccountReactivatedTemplate: () => getAccountReactivatedTemplate,
  getAccountUnderReviewTemplate: () => getAccountUnderReviewTemplate,
  getAccountVipTemplate: () => getAccountVipTemplate,
  getAdminLLCOrderTemplate: () => getAdminLLCOrderTemplate,
  getAdminMaintenanceOrderTemplate: () => getAdminMaintenanceOrderTemplate,
  getAdminNewRegistrationTemplate: () => getAdminNewRegistrationTemplate,
  getAdminNoteTemplate: () => getAdminNoteTemplate,
  getAdminOtpRequestTemplate: () => getAdminOtpRequestTemplate,
  getAdminPasswordResetTemplate: () => getAdminPasswordResetTemplate,
  getAdminProfileChangesTemplate: () => getAdminProfileChangesTemplate,
  getAutoReplyTemplate: () => getAutoReplyTemplate,
  getCalculatorResultsTemplate: () => getCalculatorResultsTemplate,
  getConfirmationEmailTemplate: () => getConfirmationEmailTemplate,
  getDocumentApprovedTemplate: () => getDocumentApprovedTemplate,
  getDocumentRejectedTemplate: () => getDocumentRejectedTemplate,
  getDocumentRequestTemplate: () => getDocumentRequestTemplate,
  getDocumentUploadedTemplate: () => getDocumentUploadedTemplate,
  getEmailFooter: () => getEmailFooter,
  getEmailHeader: () => getEmailHeader,
  getEmailQueueStatus: () => getEmailQueueStatus,
  getMessageReplyTemplate: () => getMessageReplyTemplate,
  getNewsletterWelcomeTemplate: () => getNewsletterWelcomeTemplate,
  getNoteReceivedTemplate: () => getNoteReceivedTemplate,
  getOperatingAgreementReadyTemplate: () => getOperatingAgreementReadyTemplate,
  getOrderCompletedTemplate: () => getOrderCompletedTemplate,
  getOrderEventTemplate: () => getOrderEventTemplate,
  getOrderUpdateTemplate: () => getOrderUpdateTemplate,
  getOtpEmailTemplate: () => getOtpEmailTemplate,
  getPasswordChangeOtpTemplate: () => getPasswordChangeOtpTemplate,
  getPaymentRequestTemplate: () => getPaymentRequestTemplate,
  getProfileChangeOtpTemplate: () => getProfileChangeOtpTemplate,
  getRegistrationOtpTemplate: () => getRegistrationOtpTemplate,
  getRenewalReminderTemplate: () => getRenewalReminderTemplate,
  getWelcomeEmailTemplate: () => getWelcomeEmailTemplate,
  queueEmail: () => queueEmail,
  sendEmail: () => sendEmail,
  sendTrustpilotEmail: () => sendTrustpilotEmail
});
function getSimpleHeader() {
  return `
    <div style="background: linear-gradient(180deg, #0A0A0A 0%, #0A0A0A 100%); padding: 35px 20px; text-align: center;">
      <a href="https://${domain}" target="_blank" style="text-decoration: none; display: inline-block;">
        <img src="${EMAIL_LOGO}" alt="Easy US LLC" width="70" height="70" style="display: block; margin: 0 auto; border-radius: 50%; border: 0;" />
      </a>
    </div>
  `;
}
function getSimpleFooter() {
  return `
    <div style="background-color: #0A0A0A; padding: 35px 25px; text-align: center; color: #F7F7F5;">
      <div style="width: 40px; height: 3px; background: #6EDC8A; margin: 0 auto 20px; border-radius: 2px;"></div>
      <p style="margin: 0 0 15px 0; font-size: 12px; color: #9CA3AF; line-height: 1.7;">1209 Mountain Road Place Northeast, STE R<br>Albuquerque, NM 87110</p>
      <p style="margin: 0; font-size: 11px; color: #6B7280;">\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Easy US LLC</p>
    </div>
  `;
}
function getEmailWrapper(content, lang = "es") {
  const doubtsText = getCommonDoubtsText(lang);
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
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: auto; border-radius: 24px; overflow: hidden; color: #0A0A0A; background-color: #ffffff; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          ${getSimpleHeader()}
          <div style="padding: 40px 35px;">
            ${content}
            <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 35px; padding-top: 25px; border-top: 1px solid #E6E9EC;">${doubtsText}</p>
          </div>
          ${getSimpleFooter()}
        </div>
      </div>
    </body>
    </html>
  `;
}
function getOtpEmailTemplate(otp, name, lang = "es", ip) {
  const t = getEmailTranslations(lang);
  const clientName = name || t.common.client;
  const ipSection = ip ? `
    <p style="line-height: 1.7; font-size: 14px; color: #6B7280; margin-bottom: 20px;">${t.otp.ipDetected} <strong style="color: #0A0A0A;">${ip}</strong></p>
  ` : "";
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 20px 0;">${t.common.greeting} ${clientName},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 10px;">${t.otp.thanks}</p>
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 30px;">${t.otp.forSecurity}</p>
    ${ipSection}
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 30px; border-radius: 16px; margin: 25px 0; text-align: center; border: 2px solid #6EDC8A;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #059669; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">${t.otp.yourCode}</p>
      <p style="margin: 0; font-size: 42px; font-weight: 900; color: #0A0A0A; letter-spacing: 12px; font-family: 'SF Mono', 'Consolas', monospace;">${otp}</p>
    </div>

    <p style="line-height: 1.7; font-size: 13px; color: #6B7280; margin: 20px 0 6px 0;">${t.otp.important}</p>
    <p style="line-height: 1.7; font-size: 13px; color: #6B7280; margin: 0 0 4px 0;">\u2014 ${t.otp.personalAndConfidential}</p>
    <p style="line-height: 1.7; font-size: 13px; color: #6B7280; margin: 0 0 4px 0;">\u2014 ${t.otp.validFor}</p>
    <p style="line-height: 1.7; font-size: 13px; color: #6B7280; margin: 0 0 4px 0;">\u2014 ${t.otp.doNotShare}</p>

    <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 25px;">${t.otp.ignoreMessage}</p>
  `;
  return getEmailWrapper(content, lang);
}
function getWelcomeEmailTemplate(name, lang = "es") {
  const t = getEmailTranslations(lang);
  const clientName = name || t.common.client;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${clientName},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.welcome.welcomeMessage}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.welcome.accountCreated}</p>
    
    <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #444; font-size: 14px; line-height: 1.8;">
      <li>${t.welcome.realTimeTracking}</li>
      <li>${t.welcome.documentCenter}</li>
      <li>${t.welcome.professionalTools}</li>
      <li>${t.welcome.fiscalCalendar}</li>
      <li>${t.welcome.directSupport}</li>
    </ul>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.welcome.hereToHelp}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.welcome.exploreButton}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}
function getAccountPendingVerificationTemplate(name, lang = "es") {
  const t = getEmailTranslations(lang);
  const clientName = name || t.common.client;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${clientName},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.accountPendingVerification.accountCreatedBut}</p>
    
    <div style="background: #FEF3C7; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #F59E0B;">
      <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: #92400E; text-transform: uppercase;">${t.accountPendingVerification.actionRequired}</p>
      <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.7;">${t.accountPendingVerification.accessAndVerify}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.accountPendingVerification.verifyButton}</a>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">${t.accountPendingVerification.whileUnverified}</p>
  `;
  return getEmailWrapper(content, lang);
}
function getAccountUnderReviewTemplate(name, lang = "es") {
  const t = getEmailTranslations(lang);
  const clientName = name || t.common.client;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${clientName},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.accountUnderReview.underReview}</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #0A0A0A;">${t.accountUnderReview.whyReview}</p>
      <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.7;">${t.accountUnderReview.whyReviewText}</p>
    </div>
    
    <div style="background: #FEF3C7; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #F59E0B;">
      <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.7;">${t.accountUnderReview.duringProcess}</p>
    </div>
    
    <div style="background: #F0FDF4; padding: 25px; border-radius: 16px; margin: 25px 0; border: 1px solid #6EDC8A;">
      <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #0A0A0A;">${t.accountUnderReview.whatHappens}</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #444; line-height: 1.9;">
        <li style="margin-bottom: 8px;">${t.accountUnderReview.step1}</li>
        <li style="margin-bottom: 8px;">${t.accountUnderReview.step2}</li>
        <li>${t.accountUnderReview.step3}</li>
      </ul>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.accountUnderReview.teamReviewing}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.accountUnderReview.patience}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #0A0A0A; font-weight: 600; margin-bottom: 0;">${t.accountUnderReview.closing}</p>
  `;
  return getEmailWrapper(content, lang);
}
function getAccountVipTemplate(name, lang = "es") {
  const t = getEmailTranslations(lang);
  const clientName = name || t.common.client;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${clientName},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.accountVip.updatedToVip}</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #6EDC8A;">
      <p style="margin: 0 0 15px 0; font-size: 15px; color: #0A0A0A; font-weight: 600;">${t.accountVip.benefits}</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #444; line-height: 1.8;">
        <li>${t.accountVip.priorityAttention}</li>
        <li>${t.accountVip.preferentialTracking}</li>
        <li>${t.accountVip.fullAccess}</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.accountVip.viewDashboard}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}
function getAccountReactivatedTemplate(name, lang = "es") {
  const t = getEmailTranslations(lang);
  const clientName = name || t.common.client;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${clientName},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.accountReactivated.reactivated}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.accountReactivated.canAccess}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.accountReactivated.viewDashboard}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}
function getConfirmationEmailTemplate(name, requestCode, details, lang = "es") {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.confirmation.greatNews}</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #6EDC8A;">
      <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 1px;">${t.confirmation.details}</p>
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">${t.confirmation.reference}</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0A0A0A;">${requestCode}</td>
        </tr>
        ${details?.serviceType ? `
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">${t.confirmation.service}</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0A0A0A;">${details.serviceType}</td>
        </tr>` : ""}
        ${details?.companyName ? `
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">${t.confirmation.company}</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0A0A0A;">${details.companyName}</td>
        </tr>` : ""}
        ${details?.state ? `
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">${t.confirmation.state}</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0A0A0A;">${details.state}</td>
        </tr>` : ""}
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">${t.confirmation.currentStatus}</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #059669;">${t.confirmation.inReview}</td>
        </tr>
      </table>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 15px;"><strong>${t.confirmation.whatNow}</strong></p>
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.confirmation.validatingInfo}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.confirmation.trackButton}</a>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">${t.confirmation.questionRef}</p>
  `;
  return getEmailWrapper(content, lang);
}
function getAutoReplyTemplate(name, ticketId, lang = "es") {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.autoReply.receivedMessage}</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 20px 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #6EDC8A; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280; text-transform: uppercase;">${t.autoReply.ticketNumber}</p>
      <p style="margin: 0; font-size: 24px; font-weight: 900; color: #0A0A0A; letter-spacing: 2px;">#${ticketId}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-bottom: 15px;">${t.autoReply.estimatedResponse}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.autoReply.responding}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.autoReply.seeMessages}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}
function getOrderUpdateTemplate(name, orderId, status, description, lang = "es") {
  const t = getEmailTranslations(lang);
  const statusLabels = {
    pending: t.orderUpdate.statusPending,
    processing: t.orderUpdate.statusProcessing,
    paid: t.orderUpdate.statusPaid,
    filed: t.orderUpdate.statusFiled,
    documents_ready: t.orderUpdate.statusDocumentsReady,
    completed: t.orderUpdate.statusCompleted,
    cancelled: t.orderUpdate.statusCancelled
  };
  const translatedStatus = statusLabels[status] || status;
  const statusColors = {
    pending: "#F59E0B",
    processing: "#3B82F6",
    paid: "#10B981",
    filed: "#8B5CF6",
    documents_ready: "#059669",
    completed: "#059669",
    cancelled: "#EF4444"
  };
  const statusColor = statusColors[status] || "#6EDC8A";
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.orderUpdate.statusChanged}</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid ${statusColor};">
      <p style="margin: 0 0 10px 0; font-size: 13px; color: #6B7280; text-transform: uppercase;">${t.orderUpdate.orderLabel} <strong>#${orderId}</strong></p>
      <p style="margin: 0; font-size: 16px; font-weight: 700; color: ${statusColor};">${t.orderUpdate.newStatus} ${translatedStatus}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-bottom: 25px;">${t.orderUpdate.clarification}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.orderUpdate.trackButton}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}
function getOrderCompletedTemplate(name, orderCode, lang = "es") {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 16px; margin: 0 0 25px 0; text-align: center; border: 2px solid #6EDC8A;">
      <p style="margin: 0; font-size: 20px; font-weight: 800; color: #059669;">${t.orderCompleted.llcReady}</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.orderCompleted.congratulations}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 15px;"><strong>${t.orderCompleted.docsReady}</strong></p>
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.orderCompleted.accessDocuments}</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #0A0A0A; text-transform: uppercase;">${t.orderCompleted.whatYouFind}</p>
      <ul style="margin: 0; padding-left: 18px; color: #444; font-size: 14px; line-height: 1.8;">
        <li>${t.orderCompleted.articlesOrg}</li>
        <li>${t.orderCompleted.einLetter}</li>
        <li>${t.orderCompleted.registeredAgent}</li>
        <li>${t.orderCompleted.additionalGuides}</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.orderCompleted.viewDocuments}</a>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.orderCompleted.hereForYou}</p>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">${t.orderCompleted.feedbackRequest}</p>
  `;
  return getEmailWrapper(content, lang);
}
function getNoteReceivedTemplate(name, note, orderId, lang = "es") {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.noteReceived.teamNote} ${t.noteReceived.relatedToOrder} <strong>#${orderId}</strong>:</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0; font-size: 15px; color: #0A0A0A; line-height: 1.7;">${note}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-bottom: 25px;">${t.noteReceived.respondNote}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.noteReceived.viewClientArea}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}
function getAdminNoteTemplate(name, message, ticketId, lang = "es") {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.adminNote.messageAbout}</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #6B7280; text-transform: uppercase;">${t.adminNote.viewTicket} #${ticketId}</p>
      <p style="margin: 0; font-size: 15px; color: #0A0A0A; line-height: 1.7;">${message}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.adminNote.viewClientArea}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}
function getPaymentRequestTemplate(name, amount, paymentLink, message, lang = "es") {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.paymentRequest.paymentRequired} ${t.paymentRequest.amount} <strong>$${amount}</strong>.</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #6B7280; text-transform: uppercase;">${t.paymentRequest.messageLabel}</p>
      <p style="margin: 0; font-size: 15px; color: #0A0A0A; line-height: 1.7;">${message}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${paymentLink}" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.paymentRequest.payNow}</a>
    </div>
    
    <p style="line-height: 1.5; font-size: 12px; color: #9CA3AF; word-break: break-all;">${t.paymentRequest.buttonFallback} ${paymentLink}</p>
    
    <p style="line-height: 1.6; font-size: 13px; color: #6B7280; margin-top: 20px;">${t.paymentRequest.securePayment}</p>
  `;
  return getEmailWrapper(content, lang);
}
function getDocumentRequestTemplate(name, documentType, message, ticketId, lang = "es") {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.documentRequest.needDocument}</p>
    
    <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FEF9C3 100%); padding: 20px 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #F59E0B; text-align: center;">
      <p style="margin: 0; font-size: 16px; font-weight: 700; color: #92400E;">${documentType}</p>
    </div>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #6B7280; text-transform: uppercase;">${t.documentRequest.messageLabel}</p>
      <p style="margin: 0; font-size: 15px; color: #0A0A0A; line-height: 1.7;">${message}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 13px; color: #6B7280; margin-bottom: 25px;">${t.documentRequest.referenceTicket} <strong>#${ticketId}</strong></p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.documentRequest.uploadButton}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}
function getDocumentUploadedTemplate(name, documentType, orderCode, lang = "es") {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.documentUploaded.documentReceived}</p>
    
    <div style="background: linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 100%); padding: 20px 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #10B981; text-align: center;">
      <p style="margin: 0; font-size: 16px; font-weight: 700; color: #065F46;">${documentType}</p>
      <p style="margin: 10px 0 0 0; font-size: 13px; color: #047857;">${t.documentUploaded.forOrder} ${orderCode}</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.documentUploaded.accessDownload}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.documentUploaded.viewDocuments}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}
function getMessageReplyTemplate(name, content, ticketId, lang = "es") {
  const t = getEmailTranslations(lang);
  const emailContent = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.messageReply.repliedToQuery} (${t.messageReply.ticket} <strong>#${ticketId}</strong>):</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0; font-size: 15px; color: #0A0A0A; line-height: 1.7; white-space: pre-wrap;">${content}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.messageReply.viewClientArea}</a>
    </div>
  `;
  return getEmailWrapper(emailContent, lang);
}
function getPasswordChangeOtpTemplate(name, otp, lang = "es") {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.passwordChangeOtp.passwordChangeRequest}</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 30px; border-radius: 16px; margin: 25px 0; text-align: center; border: 2px solid #6EDC8A;">
      <p style="margin: 0; font-size: 42px; font-weight: 900; color: #0A0A0A; letter-spacing: 12px; font-family: 'SF Mono', 'Consolas', monospace;">${otp}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">${t.passwordChangeOtp.validFor}</p>
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">${t.passwordChangeOtp.notRequested}</p>
  `;
  return getEmailWrapper(content, lang);
}
function getProfileChangeOtpTemplate(name, otp, lang = "es") {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 20px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 30px;">${t.profileChangeOtp.sensitiveChangeRequest}</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 30px; border-radius: 16px; margin: 25px 0; text-align: center; border: 2px solid #6EDC8A;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #059669; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">${t.profileChangeOtp.yourCode}</p>
      <p style="margin: 0; font-size: 42px; font-weight: 900; color: #0A0A0A; letter-spacing: 12px; font-family: 'SF Mono', 'Consolas', monospace;">${otp}</p>
    </div>

    <div style="background: #F9FAFB; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: #0A0A0A; text-transform: uppercase;">${t.profileChangeOtp.important}</p>
      <ul style="margin: 0; padding-left: 18px; color: #444; font-size: 14px; line-height: 1.8;">
        <li style="margin-bottom: 6px;">${t.profileChangeOtp.personalAndConfidential}</li>
        <li style="margin-bottom: 6px;">${t.profileChangeOtp.validFor}</li>
        <li>${t.profileChangeOtp.doNotShare}</li>
      </ul>
    </div>

    <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 25px;">${t.profileChangeOtp.ignoreMessage}</p>
  `;
  return getEmailWrapper(content, lang);
}
function getOrderEventTemplate(name, orderId, eventType, description, lang = "es") {
  const t = getEmailTranslations(lang);
  const locale = lang === "en" ? "en-US" : lang === "ca" ? "ca-ES" : "es-ES";
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.orderEvent.update} <strong>#${orderId}</strong></p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 700; color: #0A0A0A;">${eventType}</p>
      <p style="margin: 0; font-size: 14px; color: #6B7280; line-height: 1.6;">${description}</p>
    </div>
    
    <p style="line-height: 1.5; font-size: 13px; color: #9CA3AF;">${t.orderEvent.date} ${(/* @__PURE__ */ new Date()).toLocaleString(locale)}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.orderEvent.viewDetails}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}
function getAccountDeactivatedTemplate(name, lang = "es") {
  const t = getEmailTranslations(lang);
  const clientName = name || t.common.client;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${clientName},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.accountDeactivated.deactivated}</p>
    
    <div style="background: #FEE2E2; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #EF4444;">
      <p style="margin: 0; font-size: 14px; color: #B91C1C; line-height: 1.7;">${t.accountDeactivated.cannotAccess}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">${t.accountDeactivated.contactSupport}</p>
  `;
  return getEmailWrapper(content, lang);
}
function getNewsletterWelcomeTemplate(lang = "es") {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.newsletter.confirmed}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.newsletter.willReceive}</p>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">${t.newsletter.unsubscribe}</p>
  `;
  return getEmailWrapper(content, lang);
}
function getRenewalReminderTemplate(name, companyName, daysRemaining, renewalDate, state, lang = "es") {
  const t = getEmailTranslations(lang);
  const isUrgent = daysRemaining === "una semana" || daysRemaining === "one week" || daysRemaining === "una setmana";
  const urgencyColor = isUrgent ? "#EF4444" : "#F59E0B";
  const urgencyBg = isUrgent ? "#FEE2E2" : "#FEF3C7";
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.renewalReminder.reminderText} <strong>${companyName}</strong> (${state}) vence pronto.</p>
    
    <div style="background: ${urgencyBg}; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid ${urgencyColor};">
      <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: ${urgencyColor}; text-transform: uppercase;">${t.renewalReminder.expiresIn} ${daysRemaining}</p>
      <p style="margin: 0; font-size: 16px; font-weight: 600; color: #0A0A0A;">${t.renewalReminder.dueDate} ${renewalDate}</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.renewalReminder.withoutMaintenance}</p>
    
    <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #444; font-size: 14px; line-height: 1.8;">
      <li>${t.renewalReminder.registeredAgentActive}</li>
      <li>${t.renewalReminder.annualReports}</li>
      <li>${t.renewalReminder.taxCompliance}</li>
      <li>${t.renewalReminder.legalAddress}</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/llc/maintenance" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.renewalReminder.renewNow}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}
function getRegistrationOtpTemplate(name, otp, clientId, expiryMinutes = 15, lang = "es") {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.registrationOtp.almostDone}</p>
    
    <div style="background-color: #0A0A0A; padding: 25px; text-align: center; border-radius: 16px; margin: 25px 0;">
      <span style="color: #6EDC8A; font-size: 36px; font-weight: 900; letter-spacing: 8px; font-family: monospace;">${otp}</span>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.registrationOtp.validFor} ${expiryMinutes} ${lang === "en" ? "minutes" : lang === "ca" ? "minuts" : "minutos"}.</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.registrationOtp.clientIdLabel} <strong>${clientId}</strong></p>
  `;
  return getEmailWrapper(content, lang);
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
function getAccountLockedTemplate(name, ticketId, lang = "es") {
  const t = getEmailTranslations(lang);
  const baseUrl = process.env.BASE_URL || `https://${domain}`;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.accountLocked.locked}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.accountLocked.verifyIdentity}</p>
    
    <div style="background-color: #FFF3E0; padding: 20px; border-radius: 16px; border-left: 4px solid #FF9800; margin: 25px 0;">
      <ul style="margin: 0; padding-left: 20px; color: #444;">
        <li style="margin-bottom: 8px;">${t.accountLocked.idRequirement}</li>
        <li>${t.accountLocked.birthDateConfirm}</li>
      </ul>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.accountLocked.referenceTicket} <strong>#${ticketId}</strong></p>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${baseUrl}/forgot-password" style="background-color: #6EDC8A; color: #0A0A0A; font-weight: 700; font-size: 15px; padding: 16px 40px; border-radius: 50px; text-decoration: none; display: inline-block; box-shadow: 0 4px 15px rgba(110, 220, 138, 0.3);">${t.accountLocked.resetPassword}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
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
function getAdminPasswordResetTemplate(name, lang = "es") {
  const t = {
    es: { greeting: `Hola ${name || "Cliente"},`, body: "Tu contrase\xF1a ha sido restablecida por nuestro equipo de soporte.", cta: "Ahora puedes iniciar sesi\xF3n con tu nueva contrase\xF1a", btn: "Iniciar Sesi\xF3n", important: "Importante:", warning: "Si no solicitaste este cambio, por favor contacta con nuestro equipo de soporte inmediatamente." },
    en: { greeting: `Hello ${name || "Client"},`, body: "Your password has been reset by our support team.", cta: "You can now log in with your new password", btn: "Log In", important: "Important:", warning: "If you did not request this change, please contact our support team immediately." },
    ca: { greeting: `Hola ${name || "Client"},`, body: "La teva contrasenya ha estat restablerta pel nostre equip de suport.", cta: "Ara pots iniciar sessi\xF3 amb la teva nova contrasenya", btn: "Iniciar Sessi\xF3", important: "Important:", warning: "Si no has sol\xB7licitat aquest canvi, contacta amb el nostre equip de suport immediatament." },
    fr: { greeting: `Bonjour ${name || "Client"},`, body: "Votre mot de passe a \xE9t\xE9 r\xE9initialis\xE9 par notre \xE9quipe de support.", cta: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe", btn: "Se connecter", important: "Important :", warning: "Si vous n'avez pas demand\xE9 ce changement, veuillez contacter notre \xE9quipe de support imm\xE9diatement." },
    de: { greeting: `Hallo ${name || "Kunde"},`, body: "Ihr Passwort wurde von unserem Support-Team zur\xFCckgesetzt.", cta: "Sie k\xF6nnen sich jetzt mit Ihrem neuen Passwort anmelden", btn: "Anmelden", important: "Wichtig:", warning: "Wenn Sie diese \xC4nderung nicht angefordert haben, kontaktieren Sie bitte sofort unser Support-Team." },
    it: { greeting: `Ciao ${name || "Cliente"},`, body: "La tua password \xE8 stata reimpostata dal nostro team di supporto.", cta: "Ora puoi accedere con la tua nuova password", btn: "Accedi", important: "Importante:", warning: "Se non hai richiesto questa modifica, contatta immediatamente il nostro team di supporto." },
    pt: { greeting: `Ol\xE1 ${name || "Cliente"},`, body: "A sua palavra-passe foi redefinida pela nossa equipa de suporte.", cta: "Agora pode iniciar sess\xE3o com a sua nova palavra-passe", btn: "Iniciar Sess\xE3o", important: "Importante:", warning: "Se n\xE3o solicitou esta altera\xE7\xE3o, contacte a nossa equipa de suporte imediatamente." }
  }[lang] || { greeting: `Hola ${name || "Cliente"},`, body: "Tu contrase\xF1a ha sido restablecida por nuestro equipo de soporte.", cta: "Ahora puedes iniciar sesi\xF3n con tu nueva contrase\xF1a", btn: "Iniciar Sesi\xF3n", important: "Importante:", warning: "Si no solicitaste este cambio, por favor contacta con nuestro equipo de soporte inmediatamente." };
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.greeting}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.body}</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 16px; margin: 25px 0; text-align: center; border: 2px solid #6EDC8A;">
      <p style="margin: 0; font-size: 14px; color: #059669; font-weight: 700;">${t.cta}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/auth/login" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.btn}</a>
    </div>

    <div style="background: #FEF3C7; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #F59E0B;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #92400E; text-transform: uppercase;">${t.important}</p>
      <p style="margin: 0; font-size: 14px; color: #78350F; line-height: 1.6;">${t.warning}</p>
    </div>
  `;
  return getEmailWrapper(content);
}
function getCalculatorResultsTemplate(name, freelancerTax, llcTax, savings, annualIncome, expenses, lang = "es") {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.calculatorResults.introText}</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #6EDC8A;">
      <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 1px;">${t.calculatorResults.summary}</p>
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #6B7280; border-bottom: 1px solid #D1FAE5;">${t.calculatorResults.income}</td>
          <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #0A0A0A; border-bottom: 1px solid #D1FAE5;">${annualIncome}\u20AC</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6B7280; border-bottom: 1px solid #D1FAE5;">${t.calculatorResults.expenses}</td>
          <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #0A0A0A; border-bottom: 1px solid #D1FAE5;">${expenses}\u20AC</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6B7280; border-bottom: 1px solid #D1FAE5;">${t.calculatorResults.autonomoTax}</td>
          <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #EF4444; border-bottom: 1px solid #D1FAE5;">${freelancerTax}\u20AC</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6B7280; border-bottom: 1px solid #D1FAE5;">${t.calculatorResults.llcTax}</td>
          <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #059669; border-bottom: 1px solid #D1FAE5;">${llcTax}\u20AC</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #059669; font-weight: 700; font-size: 15px;">${t.calculatorResults.potentialSavings}</td>
          <td style="padding: 12px 0; font-weight: 900; text-align: right; color: #059669; font-size: 18px;">${savings}\u20AC/${lang === "en" ? "year" : "a\xF1o"}</td>
        </tr>
      </table>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.calculatorResults.withLLC}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.calculatorResults.learnMore}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/servicios" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.calculatorResults.viewServices}</a>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 25px;">${t.calculatorResults.disclaimer}</p>
  `;
  return getEmailWrapper(content, lang);
}
function getOperatingAgreementReadyTemplate(name, companyName, ein, state, lang = "es") {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.operatingAgreementReady.generated} ${t.operatingAgreementReady.ready}</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #6EDC8A;">
      <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 1px;">${t.operatingAgreementReady.llcData}</p>
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">${t.operatingAgreementReady.companyLabel}</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0A0A0A;">${companyName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">${t.operatingAgreementReady.stateLabel}</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0A0A0A;">${state}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">${t.operatingAgreementReady.einLabel}</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #059669;">${ein}</td>
        </tr>
      </table>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 15px;"><strong>${t.operatingAgreementReady.whatIs}</strong></p>
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.operatingAgreementReady.fullExplanation}</p>
    
    <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #444; font-size: 14px; line-height: 1.8;">
      <li>${t.operatingAgreementReady.reason1}</li>
      <li>${t.operatingAgreementReady.reason2}</li>
      <li>${t.operatingAgreementReady.reason3}</li>
      <li>${t.operatingAgreementReady.reason4}</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/tools/operating-agreement" style="display: inline-block; background: #8B5CF6; color: #FFFFFF; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(139,92,246,0.35);">${t.operatingAgreementReady.generateButton}</a>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 25px;">${t.operatingAgreementReady.autoGenerated}</p>
  `;
  return getEmailWrapper(content, lang);
}
function getDocumentApprovedTemplate(name, documentLabel, lang = "es") {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 16px; margin: 25px 0; text-align: center; border: 2px solid #6EDC8A;">
      <p style="margin: 0 0 8px 0; font-size: 28px;">&#10003;</p>
      <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 800; color: #059669;">${t.documentApproved.title}</p>
      <p style="margin: 0; font-size: 16px; font-weight: 600; color: #0A0A0A;">"${documentLabel}"</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.documentApproved.reviewedAndApproved}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.documentApproved.viewDocuments}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}
function getDocumentRejectedTemplate(name, documentLabel, reason, lang = "es") {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <div style="background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%); padding: 25px; border-radius: 16px; margin: 25px 0; text-align: center; border: 2px solid #F87171;">
      <p style="margin: 0 0 8px 0; font-size: 28px;">&#9888;</p>
      <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 800; color: #DC2626;">${t.documentRejected.title}</p>
      <p style="margin: 0; font-size: 16px; font-weight: 600; color: #0A0A0A;">"${documentLabel}"</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 15px;">${t.documentRejected.reviewedAndRejected}</p>
    
    <div style="background: #F9FAFB; padding: 20px 25px; border-radius: 16px; margin: 20px 0; border-left: 4px solid #F87171;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #DC2626; text-transform: uppercase;">${t.documentRejected.reason}</p>
      <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.6;">${reason}</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.documentRejected.pleaseReupload}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #F87171; color: #FFFFFF; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(248,113,113,0.35);">${t.documentRejected.viewDocuments}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}
function getAdminProfileChangesTemplate(clientName, clientEmail, clientId, changedFields) {
  const changesHtml = changedFields.map(
    (f) => `<tr>
      <td style="padding: 10px 15px; border-bottom: 1px solid #E5E7EB; font-weight: 600; color: #0A0A0A;">${f.field}</td>
      <td style="padding: 10px 15px; border-bottom: 1px solid #E5E7EB; color: #6B7280; text-decoration: line-through;">${f.oldValue}</td>
      <td style="padding: 10px 15px; border-bottom: 1px solid #E5E7EB; color: #059669; font-weight: 600;">${f.newValue}</td>
    </tr>`
  ).join("");
  const content = `
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 16px; margin: 0 0 25px 0; text-align: center; border: 2px solid #6EDC8A;">
      <p style="margin: 0 0 8px 0; font-size: 28px;">&#128274;</p>
      <p style="margin: 0; font-size: 18px; font-weight: 800; color: #059669;">Cambios de Perfil Verificados con OTP</p>
    </div>
    
    <div style="background: #F9FAFB; padding: 20px 25px; border-radius: 16px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #444;"><strong>Cliente:</strong> ${clientName}</p>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #444;"><strong>Email:</strong> ${clientEmail}</p>
      <p style="margin: 0; font-size: 14px; color: #444;"><strong>ID de Cliente:</strong> ${clientId}</p>
    </div>
    
    <p style="margin: 20px 0 10px 0; font-size: 14px; font-weight: 800; color: #0A0A0A; text-transform: uppercase;">Campos modificados:</p>
    <table style="width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
      <thead>
        <tr style="background: #F3F4F6;">
          <th style="padding: 10px 15px; text-align: left; font-size: 12px; color: #6B7280; text-transform: uppercase;">Campo</th>
          <th style="padding: 10px 15px; text-align: left; font-size: 12px; color: #6B7280; text-transform: uppercase;">Anterior</th>
          <th style="padding: 10px 15px; text-align: left; font-size: 12px; color: #6B7280; text-transform: uppercase;">Nuevo</th>
        </tr>
      </thead>
      <tbody>
        ${changesHtml}
      </tbody>
    </table>
    
    <p style="line-height: 1.6; font-size: 13px; color: #9CA3AF; margin-top: 20px;">Cambio verificado con OTP - ${(/* @__PURE__ */ new Date()).toLocaleString("es-ES")}</p>
  `;
  return getEmailWrapper(content, "es");
}
function getAdminOtpRequestTemplate(name, otp, reason, lang = "es") {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 20px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${reason || t.profileChangeOtp.sensitiveChangeRequest}</p>
    
    <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); padding: 30px; border-radius: 16px; margin: 25px 0; text-align: center; border: 2px solid #F59E0B;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #92400E; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">${t.profileChangeOtp.yourCode}</p>
      <p style="margin: 0; font-size: 42px; font-weight: 900; color: #0A0A0A; letter-spacing: 12px; font-family: 'SF Mono', 'Consolas', monospace;">${otp}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280; text-align: center;">${t.profileChangeOtp.validFor}</p>
  `;
  return getEmailWrapper(content, lang);
}
function getAbandonedApplicationTemplate(name, serviceType, state, hoursRemaining, lang = "es") {
  const t = getEmailTranslations(lang);
  const urgency = hoursRemaining && hoursRemaining <= 12 ? true : false;
  const urgencyColor = urgency ? "#EF4444" : "#F59E0B";
  const urgencyBg = urgency ? "#FEE2E2" : "#FEF3C7";
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.abandonedApplication.noticeText} <strong>${serviceType}</strong>${state ? ` ${lang === "en" ? "in" : "en"} ${state}` : ""}. ${t.abandonedApplication.savedDraft}</p>
    
    ${hoursRemaining ? `
    <div style="background: ${urgencyBg}; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid ${urgencyColor};">
      <p style="margin: 0; font-size: 14px; color: ${urgency ? "#B91C1C" : "#92400E"}; line-height: 1.7;">
        <strong>${t.abandonedApplication.importantNote}</strong> ${t.abandonedApplication.draftDeletion}
      </p>
    </div>
    ` : ""}
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 15px;">${t.abandonedApplication.understandDoubts}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.abandonedApplication.questionsHelp}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.abandonedApplication.continueButton}</a>
    </div>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: #0A0A0A; text-transform: uppercase;">${t.abandonedApplication.whyChoose}</p>
      <ul style="margin: 0; padding-left: 18px; color: #444; font-size: 14px; line-height: 1.8;">
        <li>${t.abandonedApplication.reason1}</li>
        <li>${t.abandonedApplication.reason2}</li>
        <li>${t.abandonedApplication.reason3}</li>
        <li>${t.abandonedApplication.reason4}</li>
        <li>${t.abandonedApplication.reason5}</li>
      </ul>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">${t.abandonedApplication.noMoreReminders}</p>
  `;
  return getEmailWrapper(content, lang);
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
    try {
      await transporter.sendMail({
        from: `"Easy US LLC" <no-reply@easyusllc.com>`,
        replyTo: job.replyTo || "hola@easyusllc.com",
        to: job.to,
        subject: job.subject,
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
  try {
    const path7 = await import("path");
    const logoPath = path7.join(process.cwd(), "client/public/logo-icon.png");
    const info = await transporter.sendMail({
      from: `"Easy US LLC" <no-reply@easyusllc.com>`,
      replyTo: replyTo || "hola@easyusllc.com",
      to,
      subject,
      html,
      attachments: [
        {
          filename: "logo-icon.png",
          path: logoPath,
          cid: "logo-icon"
        }
      ]
    });
    return info;
  } catch (error) {
    queueEmail({ to, subject, html, replyTo });
    return null;
  }
}
function getAbandonedApplicationReminderTemplate(name, applicationType, state, hoursRemaining, lang = "es") {
  const t = getEmailTranslations(lang);
  const emailDomain = process.env.REPLIT_DEV_DOMAIN || domain;
  const serviceLabel = applicationType === "llc" ? t.abandonedApplication.llcFormation : t.abandonedApplication.maintenancePack;
  const urgencyColor = hoursRemaining <= 12 ? "#EF4444" : "#F59E0B";
  const urgencyText = hoursRemaining <= 12 ? t.abandonedApplication.lastHours : `${Math.round(hoursRemaining)} ${lang === "en" ? "hours" : lang === "ca" ? "hores" : "horas"}`;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.abandonedApplication.noticeText} ${serviceLabel} ${lang === "en" ? "in" : "a"} ${state}.</p>
    
    <div style="background: ${urgencyColor}15; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid ${urgencyColor};">
      <p style="margin: 0; font-size: 14px; color: ${urgencyColor}; line-height: 1.7; font-weight: 600;">
        ${t.abandonedApplication.autoDeleteWarning} (${urgencyText})
      </p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.abandonedApplication.dontLoseProgress}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${emailDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0A0A0A; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">${t.abandonedApplication.continueButton}</a>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">${t.abandonedApplication.questionsHelp}</p>
  `;
  return getEmailWrapper(content, lang);
}
async function sendTrustpilotEmail({ to, name, orderNumber }) {
  if (!process.env.SMTP_PASS) {
    return;
  }
  const trustpilotBcc = process.env.TRUSTPILOT_BCC_EMAIL || "easyusllc.com+62fb280c0a@invite.trustpilot.com";
  const html = getOrderCompletedTemplate(name, orderNumber);
  try {
    const path7 = await import("path");
    const logoPath = path7.join(process.cwd(), "client/public/logo-icon.png");
    const info = await transporter.sendMail({
      from: `"Easy US LLC" <no-reply@easyusllc.com>`,
      replyTo: "hola@easyusllc.com",
      to,
      bcc: trustpilotBcc,
      subject: `Pedido completado - Documentaci\xF3n disponible`,
      html,
      attachments: [
        {
          filename: "logo-icon.png",
          path: logoPath,
          cid: "logo-icon"
        }
      ]
    });
    return info;
  } catch (error) {
    return null;
  }
}
var import_nodemailer, domain, EMAIL_LOGO, transporter, emailQueue, MAX_RETRIES, MAX_QUEUE_SIZE, EMAIL_TTL, QUEUE_PROCESS_INTERVAL, isProcessingQueue, lastProcessTime;
var init_email = __esm({
  "server/lib/email.ts"() {
    "use strict";
    import_nodemailer = __toESM(require("nodemailer"), 1);
    init_email_translations();
    domain = "easyusllc.com";
    EMAIL_LOGO = "cid:logo-icon";
    transporter = import_nodemailer.default.createTransport({
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

// server/lib/id-generator.ts
var id_generator_exports = {};
__export(id_generator_exports, {
  formatOrderDisplay: () => formatOrderDisplay,
  generate8DigitId: () => generate8DigitId,
  generateDocRequestId: () => generateDocRequestId,
  generateDocumentId: () => generateDocumentId,
  generateOrderCode: () => generateOrderCode,
  generateUniqueAdminOrderCode: () => generateUniqueAdminOrderCode,
  generateUniqueBookingCode: () => generateUniqueBookingCode,
  generateUniqueClientId: () => generateUniqueClientId,
  generateUniqueInvoiceNumber: () => generateUniqueInvoiceNumber,
  generateUniqueMessageId: () => generateUniqueMessageId,
  generateUniqueOrderCode: () => generateUniqueOrderCode,
  generateUniqueTicketId: () => generateUniqueTicketId,
  getStatePrefix: () => getStatePrefix
});
function generate8DigitId() {
  return Math.floor(1e7 + Math.random() * 9e7).toString();
}
async function generateUniqueClientId() {
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts < maxAttempts) {
    const clientId = generate8DigitId();
    const existing = await db.select({ id: users.id }).from(users).where((0, import_drizzle_orm3.eq)(users.clientId, clientId)).limit(1);
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
    const existingLlc = await db.select({ id: llcApplications.id }).from(llcApplications).where((0, import_drizzle_orm3.eq)(llcApplications.requestCode, code)).limit(1);
    const existingMaint = await db.select({ id: maintenanceApplications.id }).from(maintenanceApplications).where((0, import_drizzle_orm3.eq)(maintenanceApplications.requestCode, code)).limit(1);
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
    const existingNotif = await db.select({ id: userNotifications.id }).from(userNotifications).where((0, import_drizzle_orm3.eq)(userNotifications.ticketId, ticketId)).limit(1);
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
    const existing = await db.select({ id: messages.id }).from(messages).where((0, import_drizzle_orm3.eq)(messages.messageId, messageId)).limit(1);
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
async function generateUniqueBookingCode() {
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts < maxAttempts) {
    const bookingCode = `CON-${generate8DigitId()}`;
    const existing = await db.select({ id: consultationBookings.id }).from(consultationBookings).where((0, import_drizzle_orm3.eq)(consultationBookings.bookingCode, bookingCode)).limit(1);
    if (existing.length === 0) {
      return bookingCode;
    }
    attempts++;
  }
  return `CON-${Date.now().toString().slice(-8)}`;
}
async function generateUniqueAdminOrderCode(state) {
  const statePrefix = getStatePrefix(state);
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts < maxAttempts) {
    const digits = generate8DigitId();
    const code = `${statePrefix}-${year}-${digits}`;
    const existingLlc = await db.select({ id: llcApplications.id }).from(llcApplications).where((0, import_drizzle_orm3.eq)(llcApplications.requestCode, code)).limit(1);
    const existingMaint = await db.select({ id: maintenanceApplications.id }).from(maintenanceApplications).where((0, import_drizzle_orm3.eq)(maintenanceApplications.requestCode, code)).limit(1);
    const existingOrder = await db.select({ id: orders.id }).from(orders).where((0, import_drizzle_orm3.eq)(orders.invoiceNumber, code)).limit(1);
    if (existingLlc.length === 0 && existingMaint.length === 0 && existingOrder.length === 0) {
      return code;
    }
    attempts++;
  }
  return `${statePrefix}-${year}-${Date.now().toString().slice(-8)}`;
}
async function generateUniqueInvoiceNumber() {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts < maxAttempts) {
    const digits = generate8DigitId();
    const invoiceNum = `INV-${year}-${digits}`;
    const existing = await db.select({ id: orders.id }).from(orders).where((0, import_drizzle_orm3.eq)(orders.invoiceNumber, invoiceNum)).limit(1);
    if (existing.length === 0) {
      return invoiceNum;
    }
    attempts++;
  }
  return `INV-${year}-${Date.now().toString().slice(-8)}`;
}
function generateDocRequestId() {
  return generate8DigitId();
}
var import_drizzle_orm3;
var init_id_generator = __esm({
  "server/lib/id-generator.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_drizzle_orm3 = require("drizzle-orm");
  }
});

// server/lib/rate-limiter.ts
function checkRateLimitInMemory(type, identifier) {
  const config = RATE_LIMITS[type];
  if (!config) return { allowed: true };
  const store = inMemoryStore.get(type);
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
function cleanupInMemoryRateLimits() {
  const now = Date.now();
  const storeEntries = Array.from(inMemoryStore.entries());
  for (const [type, store] of storeEntries) {
    const config = RATE_LIMITS[type];
    if (!config) continue;
    const ipEntries = Array.from(store.entries());
    for (const [ip, timestamps] of ipEntries) {
      const valid = timestamps.filter((t) => now - t < config.windowMs);
      if (valid.length === 0) {
        store.delete(ip);
      } else {
        store.set(ip, valid);
      }
    }
  }
}
async function checkRateLimitDb(type, identifier) {
  const config = RATE_LIMITS[type] || RATE_LIMITS.general;
  try {
    const windowStart = new Date(Date.now() - config.windowMs);
    const result = await db.execute(import_drizzle_orm4.sql`
      SELECT COUNT(*) as count 
      FROM rate_limit_entries 
      WHERE identifier = ${identifier} 
        AND limit_type = ${type}
        AND created_at > ${windowStart}
    `);
    const count = Number(result.rows[0]?.count || 0);
    if (count >= config.maxRequests) {
      const retryAfter = Math.ceil(config.windowMs / 1e3);
      return { allowed: false, retryAfter };
    }
    await db.execute(import_drizzle_orm4.sql`
      INSERT INTO rate_limit_entries (identifier, limit_type, created_at)
      VALUES (${identifier}, ${type}, NOW())
    `);
    return { allowed: true };
  } catch (error) {
    console.error("Rate limit DB error, falling back to memory:", error);
    return checkRateLimitInMemory(type, identifier);
  }
}
async function cleanupDbRateLimits() {
  try {
    const oldestAllowed = new Date(Date.now() - 36e5);
    await db.execute(import_drizzle_orm4.sql`
      DELETE FROM rate_limit_entries 
      WHERE created_at < ${oldestAllowed}
    `);
  } catch (error) {
    console.error("Rate limit cleanup error:", error);
  }
}
async function checkRateLimit(type, identifier) {
  if (isProduction) {
    return checkRateLimitDb(type, identifier);
  }
  return checkRateLimitInMemory(type, identifier);
}
var import_drizzle_orm4, RATE_LIMITS, inMemoryStore, isProduction;
var init_rate_limiter = __esm({
  "server/lib/rate-limiter.ts"() {
    "use strict";
    init_db();
    import_drizzle_orm4 = require("drizzle-orm");
    RATE_LIMITS = {
      login: { windowMs: 9e5, maxRequests: 5 },
      otp: { windowMs: 3e5, maxRequests: 3 },
      register: { windowMs: 36e5, maxRequests: 3 },
      passwordReset: { windowMs: 6e5, maxRequests: 3 },
      contact: { windowMs: 3e5, maxRequests: 5 },
      general: { windowMs: 6e4, maxRequests: 100 },
      api: { windowMs: 6e4, maxRequests: 100 }
    };
    inMemoryStore = /* @__PURE__ */ new Map();
    Object.keys(RATE_LIMITS).forEach((key) => {
      inMemoryStore.set(key, /* @__PURE__ */ new Map());
    });
    setInterval(cleanupInMemoryRateLimits, 3e5);
    isProduction = process.env.NODE_ENV === "production";
  }
});

// server/lib/security.ts
function sanitizeHtml(input) {
  if (!input || typeof input !== "string") return "";
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;").replace(/`/g, "&#96;").trim();
}
function validatePassword(password) {
  if (password.length < 8) {
    return { valid: false, message: "La contrase\xF1a debe tener al menos 8 caracteres" };
  }
  if (password.length > 128) {
    return { valid: false, message: "La contrase\xF1a es demasiado larga" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "La contrase\xF1a debe contener al menos una letra may\xFAscula" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "La contrase\xF1a debe contener al menos una letra min\xFAscula" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "La contrase\xF1a debe contener al menos un n\xFAmero" };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: "La contrase\xF1a debe contener al menos un s\xEDmbolo especial (!@#$%^&*...)" };
  }
  return { valid: true };
}
function logAudit(entry) {
  const logEntry = {
    ...entry,
    timestamp: /* @__PURE__ */ new Date()
  };
  memoryAuditLogs.push(logEntry);
  if (memoryAuditLogs.length > MAX_MEMORY_LOGS) {
    memoryAuditLogs.shift();
  }
  db.insert(auditLogs).values({
    action: entry.action,
    userId: entry.userId || null,
    targetId: entry.targetId || null,
    ip: entry.ip || null,
    userAgent: entry.userAgent || null,
    details: entry.details || null
  }).catch((err) => {
    console.error("[AUDIT] Failed to persist audit log:", err.message);
  });
  if (process.env.NODE_ENV === "development") {
    console.log(`[AUDIT] ${entry.action}:`, {
      userId: entry.userId,
      targetId: entry.targetId,
      ip: entry.ip,
      details: entry.details
    });
  }
}
async function checkDatabaseHealth() {
  const start = Date.now();
  try {
    await db.execute(import_drizzle_orm5.sql`SELECT 1`);
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
var import_drizzle_orm5, memoryAuditLogs, MAX_MEMORY_LOGS;
var init_security = __esm({
  "server/lib/security.ts"() {
    "use strict";
    init_db();
    import_drizzle_orm5 = require("drizzle-orm");
    init_rate_limiter();
    init_schema();
    memoryAuditLogs = [];
    MAX_MEMORY_LOGS = 1e3;
  }
});

// server/lib/auth-service.ts
var auth_service_exports = {};
__export(auth_service_exports, {
  createPasswordResetOtp: () => createPasswordResetOtp,
  createUser: () => createUser,
  generateOtp: () => generateOtp,
  generateToken: () => generateToken,
  generateUniqueClientId: () => generateUniqueClientId,
  hashPassword: () => hashPassword,
  isAdminEmail: () => isAdminEmail,
  loginUser: () => loginUser,
  resendVerificationEmail: () => resendVerificationEmail,
  resetPasswordWithOtp: () => resetPasswordWithOtp,
  verifyEmailToken: () => verifyEmailToken,
  verifyPassword: () => verifyPassword,
  verifyPasswordResetOtp: () => verifyPasswordResetOtp
});
function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
async function hashPassword(password) {
  return import_bcrypt.default.hash(password, SALT_ROUNDS);
}
async function verifyPassword(password, hash) {
  return import_bcrypt.default.compare(password, hash);
}
function generateOtp() {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
}
function generateToken() {
  return import_crypto.default.randomBytes(32).toString("hex");
}
async function createUser(data) {
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.message || "Contrase\xF1a no v\xE1lida");
  }
  const existingUser = await db.select().from(users).where((0, import_drizzle_orm6.eq)(users.email, data.email)).limit(1);
  if (existingUser.length > 0) {
    const existing = existingUser[0];
    if (existing.isActive === false || existing.accountStatus === "deactivated") {
      const error = new Error("Tu cuenta ha sido desactivada. Contacta con nuestro equipo de soporte para m\xE1s informaci\xF3n.");
      error.code = "ACCOUNT_DEACTIVATED";
      throw error;
    }
    throw new Error("El email ya est\xE1 registrado");
  }
  const passwordHash = await hashPassword(data.password);
  const isAdmin2 = isAdminEmail(data.email);
  const [newUser] = await db.insert(users).values({
    id: data.clientId,
    clientId: data.clientId,
    email: data.email,
    passwordHash,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    businessActivity: data.businessActivity || null,
    preferredLanguage: data.preferredLanguage || "es",
    emailVerified: false,
    isAdmin: isAdmin2,
    accountStatus: "pending"
  }).returning();
  const verificationToken = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1e3);
  await db.insert(emailVerificationTokens).values({
    userId: newUser.id,
    token: verificationToken,
    expiresAt
  });
  const userLang = data.preferredLanguage || "es";
  try {
    await sendEmail({
      to: data.email,
      subject: getRegistrationOtpSubject(userLang),
      html: getRegistrationOtpTemplate(data.firstName, verificationToken, data.clientId, OTP_EXPIRY_MINUTES, userLang)
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
    (0, import_drizzle_orm6.and)(
      (0, import_drizzle_orm6.eq)(emailVerificationTokens.userId, userId),
      (0, import_drizzle_orm6.eq)(emailVerificationTokens.token, token),
      (0, import_drizzle_orm6.eq)(emailVerificationTokens.used, false),
      (0, import_drizzle_orm6.gt)(emailVerificationTokens.expiresAt, /* @__PURE__ */ new Date())
    )
  ).limit(1);
  if (!tokenRecord) {
    return false;
  }
  const [user] = await db.select().from(users).where((0, import_drizzle_orm6.eq)(users.id, userId)).limit(1);
  if (!user) {
    return false;
  }
  await db.update(emailVerificationTokens).set({ used: true }).where((0, import_drizzle_orm6.eq)(emailVerificationTokens.id, tokenRecord.id));
  if (!user.emailVerified && user.accountStatus === "pending") {
    await db.update(users).set({
      emailVerified: true,
      accountStatus: "active",
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm6.eq)(users.id, userId));
  } else if (!user.emailVerified) {
    await db.update(users).set({
      emailVerified: true,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm6.eq)(users.id, userId));
  }
  return true;
}
async function loginUser(email, password) {
  const [user] = await db.select().from(users).where((0, import_drizzle_orm6.eq)(users.email, email)).limit(1);
  if (!user || !user.passwordHash) {
    return null;
  }
  if (user.lockUntil && user.lockUntil > /* @__PURE__ */ new Date()) {
    const error = new Error("ACCOUNT_LOCKED_TEMPORARILY");
    error.locked = true;
    error.code = "ACCOUNT_LOCKED";
    throw error;
  }
  if (user.isActive === false || user.accountStatus === "deactivated") {
    const error = new Error("ACCOUNT_DEACTIVATED");
    error.locked = true;
    error.code = "ACCOUNT_DEACTIVATED";
    error.status = 403;
    logActivity("Intento de Login en Cuenta Desactivada", { userId: user.id, email: user.email });
    throw error;
  }
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    const newAttempts = (user.loginAttempts || 0) + 1;
    const updates = { loginAttempts: newAttempts };
    if (newAttempts >= 4) {
      updates.accountStatus = "deactivated";
      updates.isActive = false;
      updates.lockUntil = null;
      const msgId = await generateUniqueMessageId();
      try {
        const secLang = user.preferredLanguage || "es";
        const secSubjects = { en: "Security Easy US LLC - Account Deactivated", ca: "Seguretat Easy US LLC - Compte Desactivat", fr: "S\xE9curit\xE9 Easy US LLC - Compte D\xE9sactiv\xE9", de: "Sicherheit Easy US LLC - Konto Deaktiviert", it: "Sicurezza Easy US LLC - Account Disattivato", pt: "Seguran\xE7a Easy US LLC - Conta Desativada" };
        await sendEmail({
          to: user.email,
          subject: secSubjects[secLang] || "Seguridad Easy US LLC - Cuenta Desactivada",
          html: getAccountLockedTemplate(user.firstName || "", msgId)
        });
        await db.insert(messages).values({
          userId: user.id,
          name: "Sistema de Seguridad",
          email: "seguridad@easyusllc.com",
          subject: "Cuenta Desactivada - 4 Intentos Fallidos",
          content: `Cuenta desactivada permanentemente por seguridad tras 4 intentos fallidos de inicio de sesi\xF3n. Se requiere verificaci\xF3n de identidad para reactivar. Ticket ID: ${msgId}`,
          status: "unread",
          type: "support",
          messageId: msgId
        });
        logActivity("Cuenta Desactivada por Seguridad", { userId: user.id, email: user.email, attempts: newAttempts });
      } catch (e) {
        console.error("Error handling account deactivation:", e);
      }
    }
    await db.update(users).set(updates).where((0, import_drizzle_orm6.eq)(users.id, user.id));
    return null;
  }
  if (user.loginAttempts > 0 || user.lockUntil) {
    await db.update(users).set({
      loginAttempts: 0,
      lockUntil: null,
      accountStatus: user.accountStatus,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm6.eq)(users.id, user.id));
  }
  return user;
}
async function createPasswordResetOtp(email) {
  const [user] = await db.select().from(users).where((0, import_drizzle_orm6.eq)(users.email, email)).limit(1);
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
  const lang = user.preferredLanguage || "es";
  try {
    const { getOtpEmailTemplate: getOtpEmailTemplate2 } = await Promise.resolve().then(() => (init_email(), email_exports));
    await sendEmail({
      to: email,
      subject: getPasswordResetSubject(lang),
      html: getOtpEmailTemplate2(otp, user.firstName || void 0, lang)
    });
  } catch (emailError) {
  }
  return { success: true, userId: user.id };
}
async function verifyPasswordResetOtp(email, otp) {
  const [user] = await db.select().from(users).where((0, import_drizzle_orm6.eq)(users.email, email)).limit(1);
  if (!user) return false;
  const [tokenRecord] = await db.select().from(passwordResetTokens).where(
    (0, import_drizzle_orm6.and)(
      (0, import_drizzle_orm6.eq)(passwordResetTokens.userId, user.id),
      (0, import_drizzle_orm6.eq)(passwordResetTokens.token, otp),
      (0, import_drizzle_orm6.eq)(passwordResetTokens.used, false),
      (0, import_drizzle_orm6.gt)(passwordResetTokens.expiresAt, /* @__PURE__ */ new Date())
    )
  ).orderBy(import_drizzle_orm6.sql`${passwordResetTokens.createdAt} DESC`).limit(1);
  return !!tokenRecord;
}
async function resetPasswordWithOtp(email, otp, newPassword) {
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.message || "Contrase\xF1a no v\xE1lida");
  }
  const [user] = await db.select().from(users).where((0, import_drizzle_orm6.eq)(users.email, email)).limit(1);
  if (!user) return false;
  const [tokenRecord] = await db.select().from(passwordResetTokens).where(
    (0, import_drizzle_orm6.and)(
      (0, import_drizzle_orm6.eq)(passwordResetTokens.userId, user.id),
      (0, import_drizzle_orm6.eq)(passwordResetTokens.token, otp),
      (0, import_drizzle_orm6.eq)(passwordResetTokens.used, false),
      (0, import_drizzle_orm6.gt)(passwordResetTokens.expiresAt, /* @__PURE__ */ new Date())
    )
  ).limit(1);
  if (!tokenRecord) {
    return false;
  }
  const passwordHash = await hashPassword(newPassword);
  await db.update(passwordResetTokens).set({ used: true }).where((0, import_drizzle_orm6.eq)(passwordResetTokens.id, tokenRecord.id));
  await db.update(users).set({
    passwordHash,
    updatedAt: /* @__PURE__ */ new Date(),
    loginAttempts: 0,
    lockUntil: null,
    accountStatus: "active"
  }).where((0, import_drizzle_orm6.eq)(users.id, tokenRecord.userId));
  return true;
}
async function resendVerificationEmail(userId) {
  const [user] = await db.select().from(users).where((0, import_drizzle_orm6.eq)(users.id, userId)).limit(1);
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
  const lang = user.preferredLanguage || "es";
  try {
    await sendEmail({
      to: user.email,
      subject: getOtpSubject(lang),
      html: getOtpEmailTemplate(verificationToken, user.firstName || void 0, lang)
    });
  } catch (emailError) {
    return false;
  }
  return true;
}
var import_bcrypt, import_crypto, import_drizzle_orm6, SALT_ROUNDS, OTP_EXPIRY_MINUTES, ADMIN_EMAILS;
var init_auth_service = __esm({
  "server/lib/auth-service.ts"() {
    "use strict";
    import_bcrypt = __toESM(require("bcrypt"), 1);
    import_crypto = __toESM(require("crypto"), 1);
    init_db();
    init_schema();
    import_drizzle_orm6 = require("drizzle-orm");
    init_email();
    init_email_translations();
    init_security();
    init_id_generator();
    SALT_ROUNDS = 12;
    OTP_EXPIRY_MINUTES = 15;
    ADMIN_EMAILS = [
      process.env.ADMIN_EMAIL?.toLowerCase(),
      "afortuny07@gmail.com"
    ].filter(Boolean);
  }
});

// server/utils/encryption.ts
var encryption_exports = {};
__export(encryption_exports, {
  decrypt: () => decrypt,
  decryptBuffer: () => decryptBuffer,
  decryptFileWithVerification: () => decryptFileWithVerification,
  decryptSensitiveField: () => decryptSensitiveField,
  encrypt: () => encrypt,
  encryptBuffer: () => encryptBuffer,
  encryptFileWithMetadata: () => encryptFileWithMetadata,
  encryptSensitiveField: () => encryptSensitiveField,
  generateFileHash: () => generateFileHash,
  isEncrypted: () => isEncrypted,
  maskSensitiveData: () => maskSensitiveData,
  verifyFileIntegrity: () => verifyFileIntegrity
});
function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;
  const isProduction3 = process.env.NODE_ENV === "production";
  if (!key && isProduction3) {
    throw new Error("ENCRYPTION_KEY environment variable is required in production");
  }
  if (!key) {
    console.warn("\u26A0\uFE0F Using fallback encryption key for development. Set ENCRYPTION_KEY in production.");
    return Buffer.from("dev_fallback_key_32_chars_long!!".slice(0, 32));
  }
  if (key.length < 32) {
    throw new Error("ENCRYPTION_KEY must be at least 32 characters long");
  }
  return Buffer.from(key.slice(0, 32));
}
function encrypt(text3) {
  if (!text3) return "";
  const iv = import_crypto2.default.randomBytes(IV_LENGTH);
  const cipher = import_crypto2.default.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(text3, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}
function decrypt(text3) {
  if (!text3 || !text3.includes(":")) return text3;
  try {
    const textParts = text3.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = import_crypto2.default.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString("utf8");
  } catch (error) {
    console.error("[ENCRYPTION] Decrypt error - returning original text");
    return text3;
  }
}
function encryptBuffer(buffer) {
  const iv = import_crypto2.default.randomBytes(IV_LENGTH);
  const cipher = import_crypto2.default.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return { encrypted, iv: iv.toString("hex") };
}
function decryptBuffer(encryptedBuffer, ivHex) {
  const iv = Buffer.from(ivHex, "hex");
  const decipher = import_crypto2.default.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
}
function generateFileHash(buffer) {
  return import_crypto2.default.createHash(HASH_ALGORITHM).update(buffer).digest("hex");
}
function verifyFileIntegrity(buffer, expectedHash) {
  const actualHash = generateFileHash(buffer);
  return actualHash === expectedHash;
}
function encryptSensitiveField(value) {
  if (!value || value.trim() === "") return null;
  return encrypt(value);
}
function decryptSensitiveField(value) {
  if (!value) return null;
  return decrypt(value);
}
function encryptFileWithMetadata(buffer) {
  const hash = generateFileHash(buffer);
  const { encrypted, iv } = encryptBuffer(buffer);
  return {
    encryptedBuffer: encrypted,
    metadata: {
      iv,
      hash,
      originalSize: buffer.length,
      encryptedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  };
}
function decryptFileWithVerification(encryptedBuffer, metadata) {
  const decrypted = decryptBuffer(encryptedBuffer, metadata.iv);
  const verified = verifyFileIntegrity(decrypted, metadata.hash);
  if (!verified) {
    console.error("[ENCRYPTION] File integrity verification failed!");
  }
  return { buffer: decrypted, verified };
}
function maskSensitiveData(value, visibleChars = 4) {
  if (!value || value.length <= visibleChars) return "****";
  return "*".repeat(value.length - visibleChars) + value.slice(-visibleChars);
}
function isEncrypted(text3) {
  if (!text3) return false;
  const parts = text3.split(":");
  if (parts.length !== 2) return false;
  return /^[a-f0-9]{32}$/.test(parts[0]);
}
var import_crypto2, ALGORITHM, IV_LENGTH, HASH_ALGORITHM;
var init_encryption = __esm({
  "server/utils/encryption.ts"() {
    "use strict";
    import_crypto2 = __toESM(require("crypto"), 1);
    ALGORITHM = "aes-256-cbc";
    IV_LENGTH = 16;
    HASH_ALGORITHM = "sha256";
  }
});

// server/calendar-service.ts
var calendar_service_exports = {};
__export(calendar_service_exports, {
  calculateComplianceDeadlines: () => calculateComplianceDeadlines,
  checkAndSendReminders: () => checkAndSendReminders,
  checkExpiredRenewals: () => checkExpiredRenewals,
  getClientsNeedingRenewal: () => getClientsNeedingRenewal,
  getUpcomingDeadlinesForUser: () => getUpcomingDeadlinesForUser,
  sendRenewalReminders: () => sendRenewalReminders,
  updateApplicationDeadlines: () => updateApplicationDeadlines
});
function calculateComplianceDeadlines(formationDate, state, hasTaxExtension = false) {
  const deadlines = [];
  const formationYear = formationDate.getFullYear();
  const taxMonth = hasTaxExtension ? 9 : 3;
  const taxDay = 15;
  const irs1120DueDate = new Date(formationYear + 1, taxMonth, taxDay);
  const irs1120ReminderDate = new Date(irs1120DueDate);
  irs1120ReminderDate.setDate(irs1120ReminderDate.getDate() - 60);
  const extensionNote = hasTaxExtension ? " (con extensi\xF3n de 6 meses)" : "";
  deadlines.push({
    type: "irs_1120",
    dueDate: irs1120DueDate,
    reminderDate: irs1120ReminderDate,
    description: `Presentaci\xF3n del formulario IRS 1120 (Declaraci\xF3n de impuestos corporativos)${extensionNote}`
  });
  const irs5472DueDate = new Date(formationYear + 1, taxMonth, taxDay);
  const irs5472ReminderDate = new Date(irs5472DueDate);
  irs5472ReminderDate.setDate(irs5472ReminderDate.getDate() - 60);
  deadlines.push({
    type: "irs_5472",
    dueDate: irs5472DueDate,
    reminderDate: irs5472ReminderDate,
    description: `Presentaci\xF3n del formulario IRS 5472 (Declaraci\xF3n de transacciones con propietarios extranjeros)${extensionNote}`
  });
  if (state === "delaware" || state === "DE" || state === "Delaware") {
    const annualReportDueDate = new Date(formationYear + 1, 5, 1);
    const annualReportReminderDate = new Date(annualReportDueDate);
    annualReportReminderDate.setDate(annualReportReminderDate.getDate() - 60);
    deadlines.push({
      type: "annual_report",
      dueDate: annualReportDueDate,
      reminderDate: annualReportReminderDate,
      description: "Informe Anual del estado de Delaware",
      state: "Delaware"
    });
  } else if (state === "wyoming" || state === "WY" || state === "Wyoming") {
    const annualReportDueDate = new Date(formationDate);
    annualReportDueDate.setFullYear(annualReportDueDate.getFullYear() + 1);
    const annualReportReminderDate = new Date(annualReportDueDate);
    annualReportReminderDate.setDate(annualReportReminderDate.getDate() - 60);
    deadlines.push({
      type: "annual_report",
      dueDate: annualReportDueDate,
      reminderDate: annualReportReminderDate,
      description: "Informe Anual del estado de Wyoming",
      state: "Wyoming"
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
async function updateApplicationDeadlines(applicationId, formationDate, state, hasTaxExtension = false) {
  const deadlines = calculateComplianceDeadlines(formationDate, state, hasTaxExtension);
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
  }).where((0, import_drizzle_orm10.eq)(llcApplications.id, applicationId));
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
  }).from(llcApplications).innerJoin(orders, (0, import_drizzle_orm10.eq)(llcApplications.orderId, orders.id)).where(
    (0, import_drizzle_orm10.and)(
      (0, import_drizzle_orm10.isNotNull)(llcApplications.irs1120DueDate),
      (0, import_drizzle_orm10.gte)(llcApplications.irs1120DueDate, reminderWindowStart),
      (0, import_drizzle_orm10.lte)(llcApplications.irs1120DueDate, reminderWindowEnd)
    )
  );
  for (const { application, order } of applicationsWithIRS1120) {
    const daysUntilDue = Math.ceil((application.irs1120DueDate.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
    await createComplianceNotification(
      order.userId,
      order.id,
      application.requestCode || `LLC-${application.id}`,
      "irs_1120",
      `i18n:ntf.compliance.irs1120.title::{"days":"${daysUntilDue}"}`,
      `i18n:ntf.compliance.irs1120.message::{"companyName":"${application.companyName || ""}","dueDate":"${formatDate(application.irs1120DueDate)}"}`
    );
  }
  const applicationsWithIRS5472 = await db.select({
    application: llcApplications,
    order: orders
  }).from(llcApplications).innerJoin(orders, (0, import_drizzle_orm10.eq)(llcApplications.orderId, orders.id)).where(
    (0, import_drizzle_orm10.and)(
      (0, import_drizzle_orm10.isNotNull)(llcApplications.irs5472DueDate),
      (0, import_drizzle_orm10.gte)(llcApplications.irs5472DueDate, reminderWindowStart),
      (0, import_drizzle_orm10.lte)(llcApplications.irs5472DueDate, reminderWindowEnd)
    )
  );
  for (const { application, order } of applicationsWithIRS5472) {
    const daysUntilDue = Math.ceil((application.irs5472DueDate.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
    await createComplianceNotification(
      order.userId,
      order.id,
      application.requestCode || `LLC-${application.id}`,
      "irs_5472",
      `i18n:ntf.compliance.irs5472.title::{"days":"${daysUntilDue}"}`,
      `i18n:ntf.compliance.irs5472.message::{"companyName":"${application.companyName || ""}","dueDate":"${formatDate(application.irs5472DueDate)}"}`
    );
  }
  const applicationsWithAnnualReport = await db.select({
    application: llcApplications,
    order: orders
  }).from(llcApplications).innerJoin(orders, (0, import_drizzle_orm10.eq)(llcApplications.orderId, orders.id)).where(
    (0, import_drizzle_orm10.and)(
      (0, import_drizzle_orm10.isNotNull)(llcApplications.annualReportDueDate),
      (0, import_drizzle_orm10.gte)(llcApplications.annualReportDueDate, reminderWindowStart),
      (0, import_drizzle_orm10.lte)(llcApplications.annualReportDueDate, reminderWindowEnd)
    )
  );
  for (const { application, order } of applicationsWithAnnualReport) {
    const daysUntilDue = Math.ceil((application.annualReportDueDate.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
    const stateLabel = application.state === "wyoming" || application.state === "WY" ? "Wyoming" : "New Mexico";
    await createComplianceNotification(
      order.userId,
      order.id,
      application.requestCode || `LLC-${application.id}`,
      "annual_report",
      `i18n:ntf.compliance.annualReport.title::{"stateLabel":"${stateLabel}","days":"${daysUntilDue}"}`,
      `i18n:ntf.compliance.annualReport.message::{"companyName":"${application.companyName || ""}","stateLabel":"${stateLabel}","dueDate":"${formatDate(application.annualReportDueDate)}"}`
    );
  }
  const applicationsWithAgentRenewal = await db.select({
    application: llcApplications,
    order: orders
  }).from(llcApplications).innerJoin(orders, (0, import_drizzle_orm10.eq)(llcApplications.orderId, orders.id)).where(
    (0, import_drizzle_orm10.and)(
      (0, import_drizzle_orm10.isNotNull)(llcApplications.agentRenewalDate),
      (0, import_drizzle_orm10.gte)(llcApplications.agentRenewalDate, reminderWindowStart),
      (0, import_drizzle_orm10.lte)(llcApplications.agentRenewalDate, reminderWindowEnd)
    )
  );
  for (const { application, order } of applicationsWithAgentRenewal) {
    const daysUntilDue = Math.ceil((application.agentRenewalDate.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
    await createComplianceNotification(
      order.userId,
      order.id,
      application.requestCode || `LLC-${application.id}`,
      "agent_renewal",
      `i18n:ntf.compliance.agentRenewal.title::{"days":"${daysUntilDue}"}`,
      `i18n:ntf.compliance.agentRenewal.message::{"companyName":"${application.companyName || ""}","dueDate":"${formatDate(application.agentRenewalDate)}"}`
    );
  }
  const renewalResult = await sendRenewalReminders();
  return { checked: true, timestamp: today, renewalRemindersSent: renewalResult.remindersSent };
}
async function createComplianceNotification(userId, orderId, orderCode, type, title, message) {
  const ticketId = `COMP-${type.toUpperCase()}-${orderId}-${Date.now()}`;
  const existing = await db.select().from(userNotifications).where(
    (0, import_drizzle_orm10.and)(
      (0, import_drizzle_orm10.eq)(userNotifications.userId, userId),
      (0, import_drizzle_orm10.eq)(userNotifications.orderId, orderId),
      import_drizzle_orm10.sql`${userNotifications.type} = ${"compliance_" + type}`,
      import_drizzle_orm10.sql`${userNotifications.createdAt} > NOW() - INTERVAL '30 days'`
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
function formatDate(date) {
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}
async function checkExpiredRenewals() {
  const today = /* @__PURE__ */ new Date();
  const expiredApplications = await db.select({
    application: llcApplications,
    order: orders,
    user: users
  }).from(llcApplications).innerJoin(orders, (0, import_drizzle_orm10.eq)(llcApplications.orderId, orders.id)).innerJoin(users, (0, import_drizzle_orm10.eq)(orders.userId, users.id)).where(
    (0, import_drizzle_orm10.and)(
      (0, import_drizzle_orm10.isNotNull)(llcApplications.agentRenewalDate),
      (0, import_drizzle_orm10.lte)(llcApplications.agentRenewalDate, today),
      (0, import_drizzle_orm10.eq)(orders.status, "completed"),
      (0, import_drizzle_orm10.eq)(users.accountStatus, "active")
      // Only check active users
    )
  );
  const allMaintenanceApps = await db.select({
    maintApp: maintenanceApplications,
    maintOrder: orders
  }).from(maintenanceApplications).innerJoin(orders, (0, import_drizzle_orm10.eq)(maintenanceApplications.orderId, orders.id)).where((0, import_drizzle_orm10.eq)(orders.status, "completed"));
  const expiredList = [];
  for (const { application, order, user } of expiredApplications) {
    const renewalDate = new Date(application.agentRenewalDate);
    const sixtyDaysBeforeRenewal = new Date(renewalDate);
    sixtyDaysBeforeRenewal.setDate(sixtyDaysBeforeRenewal.getDate() - 60);
    const hasRenewal = allMaintenanceApps.some(
      ({ maintApp, maintOrder }) => maintOrder.userId === user.id && maintApp.state === application.state && new Date(maintOrder.createdAt) >= sixtyDaysBeforeRenewal
    );
    if (!hasRenewal) {
      const daysSinceExpiry = Math.ceil((today.getTime() - new Date(application.agentRenewalDate).getTime()) / (1e3 * 60 * 60 * 24));
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
        accountStatus: user.accountStatus
      });
    }
  }
  return expiredList;
}
async function getClientsNeedingRenewal() {
  const today = /* @__PURE__ */ new Date();
  const ninetyDaysFromNow = new Date(today);
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
  const applicationsNeedingRenewal = await db.select({
    application: llcApplications,
    order: orders,
    user: users
  }).from(llcApplications).innerJoin(orders, (0, import_drizzle_orm10.eq)(llcApplications.orderId, orders.id)).innerJoin(users, (0, import_drizzle_orm10.eq)(orders.userId, users.id)).where(
    (0, import_drizzle_orm10.and)(
      (0, import_drizzle_orm10.isNotNull)(llcApplications.agentRenewalDate),
      (0, import_drizzle_orm10.lte)(llcApplications.agentRenewalDate, ninetyDaysFromNow),
      (0, import_drizzle_orm10.eq)(orders.status, "completed"),
      (0, import_drizzle_orm10.eq)(users.accountStatus, "active")
      // Only check active users
    )
  );
  const allMaintenanceApps = await db.select({
    maintApp: maintenanceApplications,
    maintOrder: orders
  }).from(maintenanceApplications).innerJoin(orders, (0, import_drizzle_orm10.eq)(maintenanceApplications.orderId, orders.id)).where((0, import_drizzle_orm10.eq)(orders.status, "completed"));
  const result = [];
  for (const { application, order, user } of applicationsNeedingRenewal) {
    const renewalDate = new Date(application.agentRenewalDate);
    const sixtyDaysBeforeRenewal = new Date(renewalDate);
    sixtyDaysBeforeRenewal.setDate(sixtyDaysBeforeRenewal.getDate() - 60);
    const hasRenewal = allMaintenanceApps.some(
      ({ maintApp, maintOrder }) => maintOrder.userId === user.id && maintApp.state === application.state && new Date(maintOrder.createdAt) >= sixtyDaysBeforeRenewal
      // Renewal order created within renewal window
    );
    if (!hasRenewal) {
      const daysUntilExpiry = Math.ceil((new Date(application.agentRenewalDate).getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
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
        accountStatus: user.accountStatus
      });
    }
  }
  return result.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}
async function sendRenewalReminders() {
  const clientsNeedingRenewal = await getClientsNeedingRenewal();
  let remindersSent = 0;
  for (const client of clientsNeedingRenewal) {
    if (client.daysUntilExpiry < 0) continue;
    const reminderWindows = [
      { min: 55, max: 65, type: "renewal_60days", label: "60 d\xEDas" },
      { min: 25, max: 35, type: "renewal_30days", label: "30 d\xEDas" },
      { min: 5, max: 10, type: "renewal_7days", label: "una semana" }
    ];
    for (const window of reminderWindows) {
      if (client.daysUntilExpiry >= window.min && client.daysUntilExpiry <= window.max) {
        await createComplianceNotification(
          client.userId,
          client.orderId,
          `LLC-${client.applicationId}`,
          window.type,
          `i18n:ntf.compliance.renewalPending.title::{"label":"${window.label}"}`,
          `i18n:ntf.compliance.renewalPending.message::{"companyName":"${client.companyName || ""}","dueDate":"${formatDate(new Date(client.agentRenewalDate))}"}`
        );
        if (client.email && client.companyName) {
          const emailHtml = getRenewalReminderTemplate(
            client.firstName || "Cliente",
            client.companyName,
            window.label,
            formatDate(new Date(client.agentRenewalDate)),
            client.state || "New Mexico"
          );
          queueEmail({
            to: client.email,
            subject: `Renovaci\xF3n LLC ${client.companyName} - Vence en ${window.label}`,
            html: emailHtml
          });
        }
        remindersSent++;
        break;
      }
    }
  }
  return { remindersSent };
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
var import_drizzle_orm10;
var init_calendar_service = __esm({
  "server/calendar-service.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_drizzle_orm10 = require("drizzle-orm");
    init_email();
  }
});

// vite.config.ts
var import_vite, import_plugin_react, import_path5, rootDir, vite_config_default;
var init_vite_config = __esm({
  "vite.config.ts"() {
    "use strict";
    import_vite = require("vite");
    import_plugin_react = __toESM(require("@vitejs/plugin-react"), 1);
    import_path5 = __toESM(require("path"), 1);
    rootDir = process.cwd();
    vite_config_default = (0, import_vite.defineConfig)({
      plugins: [
        (0, import_plugin_react.default)()
      ],
      resolve: {
        alias: {
          "@": import_path5.default.resolve(rootDir, "client", "src"),
          "@shared": import_path5.default.resolve(rootDir, "shared"),
          "@assets": import_path5.default.resolve(rootDir, "client", "src", "assets")
        }
      },
      root: import_path5.default.resolve(rootDir, "client"),
      build: {
        outDir: import_path5.default.resolve(rootDir, "dist/public"),
        emptyOutDir: true,
        reportCompressedSize: false,
        chunkSizeWarningLimit: 1e3,
        target: "es2020",
        minify: "esbuild",
        cssMinify: true,
        cssCodeSplit: true,
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes("node_modules")) {
                if (id.includes("react-dom")) return "react-dom";
                if (id.includes("react/") || id.includes("/react.")) return "react-core";
                if (id.includes("framer-motion")) return "framer-motion";
                if (id.includes("@radix-ui")) return "radix-ui";
                if (id.includes("lucide-react")) return "lucide";
                if (id.includes("@tanstack")) return "tanstack";
                if (id.includes("react-hook-form") || id.includes("@hookform")) return "forms";
                if (id.includes("zod") || id.includes("drizzle")) return "validation";
                if (id.includes("i18next")) return "i18n";
                if (id.includes("date-fns")) return "date-utils";
                if (id.includes("jspdf")) return "pdf";
              }
              if (id.includes("/components/ui/")) return "ui-components";
            },
            chunkFileNames: "assets/[name]-[hash].js",
            entryFileNames: "assets/[name]-[hash].js",
            assetFileNames: "assets/[name]-[hash].[ext]"
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
var import_crypto6, POOL_SIZE_MULTIPLIER, pool2, poolOffset, fillPool, nanoid;
var init_nanoid = __esm({
  "node_modules/nanoid/index.js"() {
    import_crypto6 = __toESM(require("crypto"), 1);
    init_url_alphabet();
    POOL_SIZE_MULTIPLIER = 128;
    fillPool = (bytes) => {
      if (!pool2 || pool2.length < bytes) {
        pool2 = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
        import_crypto6.default.randomFillSync(pool2);
        poolOffset = 0;
      } else if (poolOffset + bytes > pool2.length) {
        import_crypto6.default.randomFillSync(pool2);
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
async function setupVite(server, app2) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true
  };
  const vite = await (0, import_vite2.createServer)({
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
      const clientTemplate = import_path6.default.resolve(
        rootDir2,
        "client",
        "index.html"
      );
      let template = await import_fs5.default.promises.readFile(clientTemplate, "utf-8");
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
var import_vite2, import_fs5, import_path6, rootDir2, viteLogger;
var init_vite = __esm({
  "server/vite.ts"() {
    "use strict";
    import_vite2 = require("vite");
    init_vite_config();
    import_fs5 = __toESM(require("fs"), 1);
    import_path6 = __toESM(require("path"), 1);
    init_nanoid();
    rootDir2 = process.cwd();
    viteLogger = (0, import_vite2.createLogger)();
  }
});

// server/index.ts
var index_exports = {};
__export(index_exports, {
  log: () => log
});
module.exports = __toCommonJS(index_exports);
var import_express3 = __toESM(require("express"), 1);

// server/lib/custom-auth.ts
var import_express_session = __toESM(require("express-session"), 1);
var import_connect_pg_simple = __toESM(require("connect-pg-simple"), 1);
var import_express = __toESM(require("express"), 1);
init_db();
init_auth();
init_schema();
var import_drizzle_orm7 = require("drizzle-orm");
init_email();
init_id_generator();
init_email_translations();
init_security();
init_auth_service();
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = (0, import_connect_pg_simple.default)(import_express_session.default);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  const isProduction3 = process.env.NODE_ENV === "production" || process.env.REPLIT_ENVIRONMENT === "production";
  const envSecret = process.env.SESSION_SECRET;
  if (!envSecret && isProduction3) {
    throw new Error("SESSION_SECRET environment variable is required in production");
  }
  const sessionSecret = envSecret || require("crypto").randomBytes(32).toString("hex");
  if (!envSecret) {
    console.warn("\u26A0\uFE0F Using random session secret for development. Set SESSION_SECRET in production.");
  }
  return (0, import_express_session.default)({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction3,
      maxAge: sessionTtl,
      sameSite: isProduction3 ? "none" : "lax"
    }
  });
}
function setupCustomAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(import_express.default.json());
  app2.use(import_express.default.urlencoded({ extended: true }));
  app2.use(getSession());
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone, birthDate, businessActivity, preferredLanguage } = req.body;
      if (!email || !password || !firstName || !lastName || !phone) {
        return res.status(400).json({ message: "All fields are required" });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      const clientId = await generateUniqueClientId();
      const supportedLangs = ["es", "en", "ca", "fr", "de", "it", "pt"];
      const lang = supportedLangs.includes(preferredLanguage) ? preferredLanguage : "es";
      const { user } = await createUser({
        email,
        password,
        firstName,
        lastName,
        phone,
        birthDate,
        businessActivity,
        clientId,
        preferredLanguage: lang
      });
      const emailLang = lang;
      await db.insert(userNotifications).values({
        userId: user.id,
        title: "i18n:ntf.welcome.title",
        message: "i18n:ntf.welcome.message",
        type: "info",
        isRead: false
      });
      sendEmail({
        to: user.email,
        subject: getWelcomeEmailSubject(emailLang),
        html: getWelcomeEmailTemplate(user.firstName || getDefaultClientName(emailLang), emailLang)
      }).catch(() => {
      });
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.isAdmin = user.isAdmin;
      req.session.isSupport = user.isSupport;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Error saving session" });
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
          message: "Account created. Check your email to verify your account."
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Error creating account" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = checkRateLimitInMemory("login", ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({
          message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.`
        });
      }
      const { email, password, securityOtp } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await loginUser(email, password);
      if (!user) {
        const [existingUser] = await db.select({ id: users.id }).from(users).where((0, import_drizzle_orm7.eq)(users.email, email.toLowerCase().trim())).limit(1);
        logAudit({ action: "user_login", ip, details: { email, success: false } });
        return res.status(401).json({
          message: "Incorrect email or password",
          hint: existingUser ? void 0 : "no_account"
        });
      }
      if (user.accountStatus === "deactivated") {
        return res.status(403).json({ message: "Your account has been deactivated. Contact our customer service for more information." });
      }
      const { applicationDocuments: appDocsTable, orders: ordersTable2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const userOrders = await db.select({ id: ordersTable2.id }).from(ordersTable2).where((0, import_drizzle_orm7.eq)(ordersTable2.userId, user.id));
      const orderIds = userOrders.map((o) => o.id);
      let hasOrgDocs = false;
      if (orderIds.length > 0) {
        const orgDocs = await db.select().from(appDocsTable).where(
          (0, import_drizzle_orm7.and)(
            (0, import_drizzle_orm7.inArray)(appDocsTable.orderId, orderIds),
            (0, import_drizzle_orm7.eq)(appDocsTable.documentType, "organization_docs")
          )
        ).limit(1);
        hasOrgDocs = orgDocs.length > 0;
      }
      const newLoginCount = (user.loginCount || 0) + 1;
      const ipChanged = user.lastLoginIp && user.lastLoginIp !== ip;
      const lastOtpCheck = user.lastSecurityOtpAt ? new Date(user.lastSecurityOtpAt) : null;
      const daysSinceOtpCheck = lastOtpCheck ? (Date.now() - lastOtpCheck.getTime()) / (1e3 * 60 * 60 * 24) : 999;
      const requiresSecurityOtp = !hasOrgDocs && !user.isAdmin && (user.securityOtpRequired || newLoginCount % 3 === 0 || ipChanged && daysSinceOtpCheck > 1);
      if (requiresSecurityOtp && !securityOtp) {
        const { contactOtps: contactOtps2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { sendEmail: sendEmail2, getOtpEmailTemplate: getOtpEmailTemplate2 } = await Promise.resolve().then(() => (init_email(), email_exports));
        const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
        await db.insert(contactOtps2).values({
          email: user.email,
          otp,
          otpType: "security_verification",
          expiresAt
        });
        const secLang = user.preferredLanguage || "es";
        await sendEmail2({
          to: user.email,
          subject: getSecurityOtpSubject(secLang),
          html: getOtpEmailTemplate2(otp, user.firstName || void 0, secLang, ip)
        });
        return res.status(200).json({
          requiresSecurityOtp: true,
          message: "For security, we have sent a verification code to your email."
        });
      }
      if (securityOtp) {
        const { contactOtps: contactOtps2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const [otpRecord] = await db.select().from(contactOtps2).where(
          (0, import_drizzle_orm7.and)(
            (0, import_drizzle_orm7.eq)(contactOtps2.email, user.email),
            (0, import_drizzle_orm7.eq)(contactOtps2.otp, securityOtp),
            (0, import_drizzle_orm7.eq)(contactOtps2.otpType, "security_verification"),
            (0, import_drizzle_orm7.gt)(contactOtps2.expiresAt, /* @__PURE__ */ new Date())
          )
        ).orderBy((0, import_drizzle_orm7.desc)(contactOtps2.expiresAt)).limit(1);
        if (!otpRecord) {
          return res.status(400).json({ message: "Incorrect or expired verification code." });
        }
        await db.update(contactOtps2).set({ verified: true }).where((0, import_drizzle_orm7.eq)(contactOtps2.id, otpRecord.id));
      }
      await db.update(users).set({
        lastLoginIp: ip,
        loginCount: newLoginCount,
        securityOtpRequired: false,
        lastSecurityOtpAt: securityOtp ? /* @__PURE__ */ new Date() : user.lastSecurityOtpAt,
        loginAttempts: 0
      }).where((0, import_drizzle_orm7.eq)(users.id, user.id));
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.isAdmin = user.isAdmin;
      req.session.isSupport = user.isSupport;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Error saving session" });
        }
        logAudit({ action: "user_login", userId: user.id, ip, details: { email, success: true, loginCount: newLoginCount } });
        res.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            emailVerified: user.emailVerified,
            isAdmin: user.isAdmin,
            accountStatus: user.accountStatus,
            preferredLanguage: user.preferredLanguage || "es"
          }
        });
      });
    } catch (error) {
      if (error.locked) {
        logAudit({ action: "account_locked", ip: getClientIp(req), details: { reason: "too_many_attempts" } });
        return res.status(403).json({ message: error.message });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Error logging in" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Error logging out" });
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
        return res.status(401).json({ message: "Not authenticated" });
      }
      const success = await verifyEmailToken(userId, code);
      if (!success) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }
      res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error verifying email" });
    }
  });
  app2.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const success = await resendVerificationEmail(userId);
      if (!success) {
        return res.status(400).json({ message: "Error sending code" });
      }
      res.json({ success: true, message: "Code sent" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Error sending code" });
    }
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      await createPasswordResetOtp(email);
      res.json({
        success: true,
        message: "If the email exists in our system, you will receive a verification code"
      });
    } catch (error) {
      res.status(500).json({ message: "Error processing request" });
    }
  });
  app2.post("/api/auth/verify-reset-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ message: "Email and code are required" });
      }
      const isValid = await verifyPasswordResetOtp(email, otp);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error verifying code" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, otp, password } = req.body;
      if (!email || !otp || !password) {
        return res.status(400).json({ message: "Email, code and password are required" });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      const success = await resetPasswordWithOtp(email, otp, password);
      if (!success) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }
      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating password" });
    }
  });
  app2.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const [user] = await db.select().from(users).where((0, import_drizzle_orm7.eq)(users.id, userId)).limit(1);
      if (!user) {
        req.session.destroy(() => {
        });
        return res.status(401).json({ message: "User not found" });
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
        isSupport: user.isSupport,
        accountStatus: user.accountStatus,
        profileImageUrl: user.profileImageUrl,
        googleId: user.googleId ? true : false,
        preferredLanguage: user.preferredLanguage || "es",
        createdAt: user.createdAt,
        pendingProfileChanges: user.pendingProfileChanges || null,
        pendingChangesExpiresAt: user.pendingChangesExpiresAt || null
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Error fetching user" });
    }
  });
  app2.patch("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { firstName, lastName, phone, address, streetType, city, province, postalCode, country, idNumber, idType, businessActivity, preferredLanguage } = req.body;
      const [currentUser] = await db.select().from(users).where((0, import_drizzle_orm7.eq)(users.id, userId)).limit(1);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const sensitiveFields = ["idNumber", "idType", "address", "streetType", "city", "province", "postalCode", "country"];
      let significantChanges = 0;
      const currentValues = {
        idNumber: currentUser.idNumber,
        idType: currentUser.idType,
        address: currentUser.address,
        streetType: currentUser.streetType,
        city: currentUser.city,
        province: currentUser.province,
        postalCode: currentUser.postalCode,
        country: currentUser.country
      };
      const newValues = { idNumber, idType, address, streetType, city, province, postalCode, country };
      for (const field of sensitiveFields) {
        const oldVal = currentValues[field] || "";
        const newVal = newValues[field] || "";
        if (newVal && oldVal !== newVal) {
          significantChanges++;
        }
      }
      const updateData = {
        firstName,
        lastName,
        phone,
        address,
        streetType,
        city,
        province,
        postalCode,
        country,
        idNumber,
        idType,
        businessActivity,
        preferredLanguage,
        updatedAt: /* @__PURE__ */ new Date()
      };
      await db.update(users).set(updateData).where((0, import_drizzle_orm7.eq)(users.id, userId));
      const [updatedUser] = await db.select().from(users).where((0, import_drizzle_orm7.eq)(users.id, userId)).limit(1);
      res.json({
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone,
          address: updatedUser.address,
          streetType: updatedUser.streetType,
          city: updatedUser.city,
          province: updatedUser.province,
          postalCode: updatedUser.postalCode,
          country: updatedUser.country,
          idNumber: updatedUser.idNumber,
          idType: updatedUser.idType,
          businessActivity: updatedUser.businessActivity,
          emailVerified: updatedUser.emailVerified,
          accountStatus: updatedUser.accountStatus
        },
        accountUnderReview: false
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Error updating profile" });
    }
  });
}
var isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};
var isAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const [user] = await db.select().from(users).where((0, import_drizzle_orm7.eq)(users.id, req.session.userId)).limit(1);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Not authorized" });
  }
  next();
};
var isAdminOrSupport = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const [user] = await db.select().from(users).where((0, import_drizzle_orm7.eq)(users.id, req.session.userId)).limit(1);
  if (!user || !user.isAdmin && !user.isSupport) {
    return res.status(403).json({ message: "Not authorized" });
  }
  next();
};

// server/storage.ts
init_db();
init_schema();
var import_drizzle_orm8 = require("drizzle-orm");
init_id_generator();
var DatabaseStorage = class {
  // Products
  async getProducts() {
    return await db.select().from(products).orderBy(products.price);
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where((0, import_drizzle_orm8.eq)(products.id, id));
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
        where: (0, import_drizzle_orm8.eq)(orders.userId, userId),
        with: {
          product: true,
          application: true,
          maintenanceApplication: true
        },
        orderBy: (0, import_drizzle_orm8.desc)(orders.createdAt)
      });
    }
    return await db.query.orders.findMany({
      with: {
        product: true,
        application: true,
        maintenanceApplication: true,
        user: true
      },
      orderBy: (0, import_drizzle_orm8.desc)(orders.createdAt)
    });
  }
  async getOrder(id) {
    const result = await db.query.orders.findFirst({
      where: (0, import_drizzle_orm8.eq)(orders.id, id),
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
    const [app2] = await db.select().from(llcApplications).where((0, import_drizzle_orm8.eq)(llcApplications.id, id));
    return app2;
  }
  async getLlcApplicationByOrderId(orderId) {
    const [app2] = await db.select().from(llcApplications).where((0, import_drizzle_orm8.eq)(llcApplications.orderId, orderId));
    return app2;
  }
  async getLlcApplicationByRequestCode(code) {
    const result = await db.query.llcApplications.findFirst({
      where: (0, import_drizzle_orm8.eq)(llcApplications.requestCode, code),
      with: {
        documents: true
      }
    });
    return result;
  }
  async updateLlcApplication(id, updates) {
    const [updated] = await db.update(llcApplications).set({ ...updates, lastUpdated: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm8.eq)(llcApplications.id, id)).returning();
    return updated;
  }
  // Documents
  async createDocument(doc) {
    const [newDoc] = await db.insert(applicationDocuments).values(doc).returning();
    return newDoc;
  }
  async getDocumentsByApplicationId(applicationId) {
    return await db.select().from(applicationDocuments).where((0, import_drizzle_orm8.eq)(applicationDocuments.applicationId, applicationId));
  }
  async getDocumentsByOrderIds(orderIds) {
    const { inArray: inArray5 } = await import("drizzle-orm");
    if (orderIds.length === 0) return [];
    return await db.select().from(applicationDocuments).where(inArray5(applicationDocuments.orderId, orderIds));
  }
  async deleteDocument(id) {
    await db.delete(applicationDocuments).where((0, import_drizzle_orm8.eq)(applicationDocuments.id, id));
  }
  // Newsletter
  async subscribeToNewsletter(email) {
    const subscribed = await this.isSubscribedToNewsletter(email);
    if (!subscribed) {
      await db.insert(newsletterSubscribers).values({ email });
    }
  }
  async isSubscribedToNewsletter(email) {
    const [subscriber] = await db.select().from(newsletterSubscribers).where((0, import_drizzle_orm8.eq)(newsletterSubscribers.email, email));
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
      orderBy: (0, import_drizzle_orm8.desc)(orders.createdAt)
    });
  }
  async updateOrderStatus(orderId, status) {
    const [updated] = await db.update(orders).set({ status }).where((0, import_drizzle_orm8.eq)(orders.id, orderId)).returning();
    return updated;
  }
  // Messages
  async createMessage(message) {
    const { encrypt: encrypt2 } = await Promise.resolve().then(() => (init_encryption(), encryption_exports));
    const msgId = await generateUniqueMessageId();
    const encryptedContent = encrypt2(message.content);
    const [newMessage] = await db.insert(messages).values({
      ...message,
      messageId: msgId,
      encryptedContent
    }).returning();
    return newMessage;
  }
  async getMessagesByUserId(userId) {
    const messages2 = await db.query.messages.findMany({
      where: (0, import_drizzle_orm8.eq)(messages.userId, userId),
      orderBy: (0, import_drizzle_orm8.desc)(messages.createdAt),
      with: {
        replies: true
      }
    });
    return messages2.map((msg) => ({
      ...msg,
      content: msg.content?.replace(/\n*Archivo disponible en:.*$/gm, "")?.replace(/\n*Archivo:.*\.(png|jpg|jpeg|pdf)/gim, "")?.replace(/\/uploads\/[^\s]*/g, "")?.trim() || msg.content,
      encryptedContent: void 0
    }));
  }
  async getAllMessages() {
    return await db.query.messages.findMany({
      orderBy: (0, import_drizzle_orm8.desc)(messages.createdAt),
      with: {
        replies: true
      }
    });
  }
  async updateMessageStatus(id, status) {
    const [updated] = await db.update(messages).set({ status }).where((0, import_drizzle_orm8.eq)(messages.id, id)).returning();
    return updated;
  }
  async createGuestVisitor(visitor) {
    const [newVisitor] = await db.insert(guestVisitors).values(visitor).returning();
    return newVisitor;
  }
  async getAllGuestVisitors() {
    return await db.select().from(guestVisitors).orderBy((0, import_drizzle_orm8.desc)(guestVisitors.createdAt));
  }
  async deleteGuestVisitor(id) {
    await db.delete(guestVisitors).where((0, import_drizzle_orm8.eq)(guestVisitors.id, id));
  }
  async deleteGuestVisitorsByEmail(email) {
    const deleted = await db.delete(guestVisitors).where((0, import_drizzle_orm8.eq)(guestVisitors.email, email)).returning();
    return deleted.length;
  }
  async getGuestVisitorStats() {
    const all = await db.select().from(guestVisitors);
    const withEmail = all.filter((v) => v.email).length;
    const sources = {};
    for (const v of all) {
      sources[v.source] = (sources[v.source] || 0) + 1;
    }
    return { total: all.length, withEmail, sources };
  }
  async getPaymentAccounts() {
    return await db.select().from(paymentAccounts).orderBy(paymentAccounts.sortOrder);
  }
  async getActivePaymentAccounts() {
    return await db.select().from(paymentAccounts).where((0, import_drizzle_orm8.eq)(paymentAccounts.isActive, true)).orderBy(paymentAccounts.sortOrder);
  }
  async createPaymentAccount(account) {
    const [newAccount] = await db.insert(paymentAccounts).values(account).returning();
    return newAccount;
  }
  async updatePaymentAccount(id, updates) {
    const [updated] = await db.update(paymentAccounts).set(updates).where((0, import_drizzle_orm8.eq)(paymentAccounts.id, id)).returning();
    return updated;
  }
  async deletePaymentAccount(id) {
    await db.delete(paymentAccounts).where((0, import_drizzle_orm8.eq)(paymentAccounts.id, id));
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
init_db();
init_schema();
var import_drizzle_orm27 = require("drizzle-orm");
init_security();

// server/oauth.ts
var import_google_auth_library = require("google-auth-library");
init_db();
init_schema();
var import_drizzle_orm9 = require("drizzle-orm");
var import_crypto3 = __toESM(require("crypto"), 1);
init_auth_service();
init_id_generator();
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
var googleClient = GOOGLE_CLIENT_ID ? new import_google_auth_library.OAuth2Client(GOOGLE_CLIENT_ID) : null;
async function findOrCreateUserByGoogle(profile) {
  const existingByGoogle = await db.select().from(users).where((0, import_drizzle_orm9.eq)(users.googleId, profile.googleId)).limit(1);
  if (existingByGoogle.length > 0) {
    return existingByGoogle[0];
  }
  const existingByEmail = await db.select().from(users).where((0, import_drizzle_orm9.eq)(users.email, profile.email)).limit(1);
  if (existingByEmail.length > 0) {
    await db.update(users).set({
      googleId: profile.googleId,
      emailVerified: true,
      profileImageUrl: profile.profileImageUrl || existingByEmail[0].profileImageUrl,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm9.eq)(users.id, existingByEmail[0].id));
    return { ...existingByEmail[0], googleId: profile.googleId, emailVerified: true };
  }
  const newUser = await db.insert(users).values({
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    profileImageUrl: profile.profileImageUrl,
    googleId: profile.googleId,
    emailVerified: true,
    clientId: await generateUniqueClientId(),
    isActive: true,
    accountStatus: "active",
    isAdmin: isAdminEmail(profile.email)
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
    const host = req.headers.host || process.env.REPLIT_DEV_DOMAIN || `localhost:${process.env.PORT || 5e3}`;
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;
    const oauthState = import_crypto3.default.randomBytes(32).toString("hex");
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
      const host = req.headers.host || process.env.REPLIT_DEV_DOMAIN || `localhost:${process.env.PORT || 5e3}`;
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
        const [existingUser] = await db.select().from(users).where((0, import_drizzle_orm9.eq)(users.id, req.session.userId)).limit(1);
        if (existingUser) {
          await db.update(users).set({
            googleId: payload.sub,
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm9.eq)(users.id, existingUser.id));
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
        return res.status(400).json({ message: "Google credential required" });
      }
      if (!googleClient || !GOOGLE_CLIENT_ID) {
        return res.status(503).json({ message: "Google OAuth is not configured" });
      }
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(400).json({ message: "Invalid Google token" });
      }
      const user = await findOrCreateUserByGoogle({
        googleId: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        profileImageUrl: payload.picture
      });
      if (!user.isActive || user.accountStatus === "deactivated") {
        return res.status(403).json({ message: "Account deactivated" });
      }
      req.session.userId = user.id;
      req.session.email = user.email || void 0;
      req.session.isAdmin = user.isAdmin || false;
      req.session.isSupport = user.isSupport || false;
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      return res.json({
        message: "Login successful",
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
    } catch (error) {
      console.error("Error en autenticacion de Google:", error);
      return res.status(401).json({ message: "Error verifying Google credential" });
    }
  });
  app2.post("/api/auth/connect/google", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { credential } = req.body;
      if (!credential || !googleClient || !GOOGLE_CLIENT_ID) {
        return res.status(400).json({ message: "Google credential required" });
      }
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      if (!payload) {
        return res.status(400).json({ message: "Invalid token" });
      }
      const existingUser = await db.select().from(users).where((0, import_drizzle_orm9.eq)(users.googleId, payload.sub)).limit(1);
      if (existingUser.length > 0 && existingUser[0].id !== req.session.userId) {
        return res.status(409).json({ message: "This Google account is already linked to another user" });
      }
      await db.update(users).set({
        googleId: payload.sub,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm9.eq)(users.id, req.session.userId));
      return res.json({ message: "Google account linked successfully" });
    } catch (error) {
      console.error("Error conectando Google:", error);
      return res.status(500).json({ message: "Error linking Google account" });
    }
  });
  app2.post("/api/auth/disconnect/google", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const userId = req.session.userId;
      const user = await db.select().from(users).where((0, import_drizzle_orm9.eq)(users.id, userId)).limit(1);
      if (user.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!user[0].passwordHash) {
        return res.status(400).json({
          message: "You must have a password configured before unlinking Google"
        });
      }
      await db.update(users).set({
        googleId: null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm9.eq)(users.id, userId));
      return res.json({ message: "Google account unlinked successfully" });
    } catch (error) {
      console.error("Error desconectando Google:", error);
      return res.status(500).json({ message: "Error unlinking Google account" });
    }
  });
}

// server/routes.ts
init_calendar_service();

// server/lib/abandoned-service.ts
init_db();
init_schema();
var import_drizzle_orm11 = require("drizzle-orm");
init_email();
var ABANDONMENT_THRESHOLD_HOURS = 48;
var REMINDER_INTERVAL_HOURS = 12;
var MAX_REMINDERS = 3;
async function markAsAbandoned() {
  const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1e3);
  await db.update(llcApplications).set({ abandonedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm11.and)(
    (0, import_drizzle_orm11.eq)(llcApplications.status, "draft"),
    (0, import_drizzle_orm11.lt)(llcApplications.lastUpdated, cutoffDate),
    (0, import_drizzle_orm11.isNull)(llcApplications.abandonedAt)
  ));
  await db.update(maintenanceApplications).set({ abandonedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm11.and)(
    (0, import_drizzle_orm11.eq)(maintenanceApplications.status, "draft"),
    (0, import_drizzle_orm11.lt)(maintenanceApplications.lastUpdated, cutoffDate),
    (0, import_drizzle_orm11.isNull)(maintenanceApplications.abandonedAt)
  ));
}
async function sendReminders() {
  const now = /* @__PURE__ */ new Date();
  const reminderCutoff = new Date(now.getTime() - REMINDER_INTERVAL_HOURS * 60 * 60 * 1e3);
  const deletionThreshold = new Date(now.getTime() - ABANDONMENT_THRESHOLD_HOURS * 60 * 60 * 1e3);
  const abandonedLlcApps = await db.select({
    id: llcApplications.id,
    ownerEmail: llcApplications.ownerEmail,
    ownerFullName: llcApplications.ownerFullName,
    state: llcApplications.state,
    abandonedAt: llcApplications.abandonedAt,
    remindersSent: llcApplications.remindersSent,
    lastReminderAt: llcApplications.lastReminderAt,
    orderId: llcApplications.orderId
  }).from(llcApplications).where((0, import_drizzle_orm11.and)(
    (0, import_drizzle_orm11.eq)(llcApplications.status, "draft"),
    (0, import_drizzle_orm11.isNotNull)(llcApplications.abandonedAt),
    (0, import_drizzle_orm11.lt)(llcApplications.remindersSent, MAX_REMINDERS),
    (0, import_drizzle_orm11.or)(
      (0, import_drizzle_orm11.isNull)(llcApplications.lastReminderAt),
      (0, import_drizzle_orm11.lt)(llcApplications.lastReminderAt, reminderCutoff)
    )
  )).limit(20);
  for (const app2 of abandonedLlcApps) {
    if (!app2.ownerEmail || !app2.abandonedAt) continue;
    const hoursRemaining = Math.max(
      0,
      ABANDONMENT_THRESHOLD_HOURS - (now.getTime() - app2.abandonedAt.getTime()) / (60 * 60 * 1e3)
    );
    if (hoursRemaining <= 0) continue;
    const name = app2.ownerFullName || "Cliente";
    const state = app2.state || "EE.UU.";
    const html = getAbandonedApplicationReminderTemplate(name, "llc", state, hoursRemaining);
    await sendEmail({
      to: app2.ownerEmail,
      subject: `Tu solicitud de LLC est\xE1 pendiente - Compl\xE9tala ahora`,
      html
    });
    await db.update(llcApplications).set({
      remindersSent: (app2.remindersSent || 0) + 1,
      lastReminderAt: now
    }).where((0, import_drizzle_orm11.eq)(llcApplications.id, app2.id));
  }
  const abandonedMaintApps = await db.select({
    id: maintenanceApplications.id,
    ownerEmail: maintenanceApplications.ownerEmail,
    ownerFullName: maintenanceApplications.ownerFullName,
    state: maintenanceApplications.state,
    abandonedAt: maintenanceApplications.abandonedAt,
    remindersSent: maintenanceApplications.remindersSent,
    lastReminderAt: maintenanceApplications.lastReminderAt,
    orderId: maintenanceApplications.orderId
  }).from(maintenanceApplications).where((0, import_drizzle_orm11.and)(
    (0, import_drizzle_orm11.eq)(maintenanceApplications.status, "draft"),
    (0, import_drizzle_orm11.isNotNull)(maintenanceApplications.abandonedAt),
    (0, import_drizzle_orm11.lt)(maintenanceApplications.remindersSent, MAX_REMINDERS),
    (0, import_drizzle_orm11.or)(
      (0, import_drizzle_orm11.isNull)(maintenanceApplications.lastReminderAt),
      (0, import_drizzle_orm11.lt)(maintenanceApplications.lastReminderAt, reminderCutoff)
    )
  )).limit(20);
  for (const app2 of abandonedMaintApps) {
    if (!app2.ownerEmail || !app2.abandonedAt) continue;
    const hoursRemaining = Math.max(
      0,
      ABANDONMENT_THRESHOLD_HOURS - (now.getTime() - app2.abandonedAt.getTime()) / (60 * 60 * 1e3)
    );
    if (hoursRemaining <= 0) continue;
    const name = app2.ownerFullName || "Cliente";
    const state = app2.state || "EE.UU.";
    const html = getAbandonedApplicationReminderTemplate(name, "maintenance", state, hoursRemaining);
    await sendEmail({
      to: app2.ownerEmail,
      subject: `Tu solicitud de mantenimiento est\xE1 pendiente - Compl\xE9tala ahora`,
      html
    });
    await db.update(maintenanceApplications).set({
      remindersSent: (app2.remindersSent || 0) + 1,
      lastReminderAt: now
    }).where((0, import_drizzle_orm11.eq)(maintenanceApplications.id, app2.id));
  }
}
async function cleanupAbandonedApplications() {
  const deletionThreshold = new Date(Date.now() - ABANDONMENT_THRESHOLD_HOURS * 60 * 60 * 1e3);
  const llcToDelete = await db.select({ id: llcApplications.id, orderId: llcApplications.orderId }).from(llcApplications).where((0, import_drizzle_orm11.and)(
    (0, import_drizzle_orm11.eq)(llcApplications.status, "draft"),
    (0, import_drizzle_orm11.lt)(llcApplications.abandonedAt, deletionThreshold)
  ));
  for (const app2 of llcToDelete) {
    await db.delete(llcApplications).where((0, import_drizzle_orm11.eq)(llcApplications.id, app2.id));
    await db.delete(orders).where((0, import_drizzle_orm11.eq)(orders.id, app2.orderId));
  }
  const maintToDelete = await db.select({ id: maintenanceApplications.id, orderId: maintenanceApplications.orderId }).from(maintenanceApplications).where((0, import_drizzle_orm11.and)(
    (0, import_drizzle_orm11.eq)(maintenanceApplications.status, "draft"),
    (0, import_drizzle_orm11.lt)(maintenanceApplications.abandonedAt, deletionThreshold)
  ));
  for (const app2 of maintToDelete) {
    await db.delete(maintenanceApplications).where((0, import_drizzle_orm11.eq)(maintenanceApplications.id, app2.id));
    await db.delete(orders).where((0, import_drizzle_orm11.eq)(orders.id, app2.orderId));
  }
  if (llcToDelete.length > 0 || maintToDelete.length > 0) {
    console.log(`[Abandoned Cleanup] Deleted ${llcToDelete.length} LLC apps and ${maintToDelete.length} maintenance apps`);
  }
}
async function processAbandonedApplications() {
  try {
    await markAsAbandoned();
    await sendReminders();
    await cleanupAbandonedApplications();
  } catch (error) {
    console.error("[Abandoned Service] Error:", error);
  }
}

// server/lib/backup-service.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);

// server/replit_integrations/object_storage/objectStorage.ts
var import_storage = require("@google-cloud/storage");
var import_crypto4 = require("crypto");

// server/replit_integrations/object_storage/objectAcl.ts
var ACL_POLICY_METADATA_KEY = "custom:aclPolicy";
function isPermissionAllowed(requested, granted) {
  if (requested === "read" /* READ */) {
    return ["read" /* READ */, "write" /* WRITE */].includes(granted);
  }
  return granted === "write" /* WRITE */;
}
function createObjectAccessGroup(group) {
  switch (group.type) {
    // Implement the case for each type of access group to instantiate.
    //
    // For example:
    // case "USER_LIST":
    //   return new UserListAccessGroup(group.id);
    // case "EMAIL_DOMAIN":
    //   return new EmailDomainAccessGroup(group.id);
    // case "GROUP_MEMBER":
    //   return new GroupMemberAccessGroup(group.id);
    // case "SUBSCRIBER":
    //   return new SubscriberAccessGroup(group.id);
    default:
      throw new Error(`Unknown access group type: ${group.type}`);
  }
}
async function setObjectAclPolicy(objectFile, aclPolicy) {
  const [exists] = await objectFile.exists();
  if (!exists) {
    throw new Error(`Object not found: ${objectFile.name}`);
  }
  await objectFile.setMetadata({
    metadata: {
      [ACL_POLICY_METADATA_KEY]: JSON.stringify(aclPolicy)
    }
  });
}
async function getObjectAclPolicy(objectFile) {
  const [metadata] = await objectFile.getMetadata();
  const aclPolicy = metadata?.metadata?.[ACL_POLICY_METADATA_KEY];
  if (!aclPolicy) {
    return null;
  }
  return JSON.parse(aclPolicy);
}
async function canAccessObject({
  userId,
  objectFile,
  requestedPermission
}) {
  const aclPolicy = await getObjectAclPolicy(objectFile);
  if (!aclPolicy) {
    return false;
  }
  if (aclPolicy.visibility === "public" && requestedPermission === "read" /* READ */) {
    return true;
  }
  if (!userId) {
    return false;
  }
  if (aclPolicy.owner === userId) {
    return true;
  }
  for (const rule of aclPolicy.aclRules || []) {
    const accessGroup = createObjectAccessGroup(rule.group);
    if (await accessGroup.hasMember(userId) && isPermissionAllowed(requestedPermission, rule.permission)) {
      return true;
    }
  }
  return false;
}

// server/replit_integrations/object_storage/objectStorage.ts
var REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
var objectStorageClient = new import_storage.Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token"
      }
    },
    universe_domain: "googleapis.com"
  },
  projectId: ""
});
var ObjectNotFoundError = class _ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, _ObjectNotFoundError.prototype);
  }
};
var ObjectStorageService = class {
  constructor() {
  }
  // Gets the public object search paths.
  getPublicObjectSearchPaths() {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr.split(",").map((path7) => path7.trim()).filter((path7) => path7.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }
  // Gets the private object directory.
  getPrivateObjectDir() {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    return dir;
  }
  // Search for a public object from the search paths.
  async searchPublicObject(filePath) {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;
      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }
    return null;
  }
  // Downloads an object to the response.
  async downloadObject(file, res, cacheTtlSec = 3600) {
    try {
      const [metadata] = await file.getMetadata();
      const aclPolicy = await getObjectAclPolicy(file);
      const isPublic = aclPolicy?.visibility === "public";
      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": metadata.size,
        "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`
      });
      const stream = file.createReadStream();
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });
      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }
  // Gets the upload URL for an object entity.
  async getObjectEntityUploadURL() {
    const privateObjectDir = this.getPrivateObjectDir();
    if (!privateObjectDir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    const objectId = (0, import_crypto4.randomUUID)();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);
    return signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900
    });
  }
  // Gets the object entity file from the object path.
  async getObjectEntityFile(objectPath) {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }
    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }
    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }
  normalizeObjectEntityPath(rawPath) {
    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      return rawPath;
    }
    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;
    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }
    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }
    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }
  // Tries to set the ACL policy for the object entity and return the normalized path.
  async trySetObjectEntityAclPolicy(rawPath, aclPolicy) {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }
    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }
  // Checks if the user can access the object entity.
  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission
  }) {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? "read" /* READ */
    });
  }
};
function parseObjectPath(path7) {
  if (!path7.startsWith("/")) {
    path7 = `/${path7}`;
  }
  const pathParts = path7.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }
  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");
  return {
    bucketName,
    objectName
  };
}
async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec
}) {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1e3).toISOString()
  };
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, make sure you're running on Replit`
    );
  }
  const { signed_url: signedURL } = await response.json();
  return signedURL;
}

// server/replit_integrations/object_storage/routes.ts
function registerObjectStorageRoutes(app2) {
  const objectStorageService = new ObjectStorageService();
  app2.post("/api/uploads/request-url", async (req, res) => {
    try {
      const { name, size, contentType } = req.body;
      if (!name) {
        return res.status(400).json({
          error: "Missing required field: name"
        });
      }
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      res.json({
        uploadURL,
        objectPath,
        // Echo back the metadata for client convenience
        metadata: { name, size, contentType }
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });
  app2.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Object not found" });
      }
      return res.status(500).json({ error: "Failed to serve object" });
    }
  });
}

// server/lib/backup-service.ts
init_security();
var UPLOADS_DIR = import_path.default.join(process.cwd(), "uploads");
var BACKUP_INTERVAL = 60 * 60 * 1e3;
var BACKUP_TRACKING_FILE = import_path.default.join(process.cwd(), ".backup-state.json");
var BACKUP_TEMP_FILE = import_path.default.join(process.cwd(), ".backup-state.json.tmp");
function loadBackupState() {
  try {
    if (import_fs.default.existsSync(BACKUP_TRACKING_FILE)) {
      const content = import_fs.default.readFileSync(BACKUP_TRACKING_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.backedUpFiles === "object") {
        return parsed;
      }
    }
  } catch (error) {
    console.error("[Backup] Error loading backup state:", error);
  }
  return { lastBackup: "", backedUpFiles: {} };
}
function saveBackupStateAtomic(state) {
  try {
    const content = JSON.stringify(state, null, 2);
    import_fs.default.writeFileSync(BACKUP_TEMP_FILE, content, "utf-8");
    import_fs.default.renameSync(BACKUP_TEMP_FILE, BACKUP_TRACKING_FILE);
  } catch (error) {
    console.error("[Backup] Error saving backup state:", error);
    try {
      if (import_fs.default.existsSync(BACKUP_TEMP_FILE)) {
        import_fs.default.unlinkSync(BACKUP_TEMP_FILE);
      }
    } catch {
    }
  }
}
function getAllFiles(dir, fileList = []) {
  if (!import_fs.default.existsSync(dir)) {
    return fileList;
  }
  const files = import_fs.default.readdirSync(dir);
  for (const file of files) {
    const filePath = import_path.default.join(dir, file);
    try {
      const stat = import_fs.default.statSync(filePath);
      if (stat.isDirectory()) {
        getAllFiles(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    } catch {
      continue;
    }
  }
  return fileList;
}
async function backupFile(filePath, state, objectStorageService) {
  try {
    const stat = import_fs.default.statSync(filePath);
    const relativePath = import_path.default.relative(UPLOADS_DIR, filePath);
    const stateKey = relativePath;
    const existingBackup = state.backedUpFiles[stateKey];
    if (existingBackup) {
      if (existingBackup.size === stat.size && existingBackup.mtimeMs === stat.mtimeMs) {
        return { backed: false };
      }
    }
    const privateDir = objectStorageService.getPrivateObjectDir();
    const objectPath = `${privateDir}/backups/${relativePath}`;
    const { bucketName, objectName } = parseObjectPath2(objectPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);
    const fileContent = import_fs.default.readFileSync(filePath);
    await file.save(fileContent, {
      metadata: {
        contentType: getContentType(filePath),
        metadata: {
          originalPath: relativePath,
          backupDate: (/* @__PURE__ */ new Date()).toISOString()
        }
      }
    });
    state.backedUpFiles[stateKey] = {
      size: stat.size,
      mtimeMs: stat.mtimeMs,
      objectPath
    };
    return { backed: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Backup] Error backing up ${filePath}:`, errorMsg);
    return { backed: false, error: errorMsg };
  }
}
function parseObjectPath2(pathStr) {
  if (!pathStr.startsWith("/")) {
    pathStr = `/${pathStr}`;
  }
  const parts = pathStr.split("/");
  if (parts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }
  return {
    bucketName: parts[1],
    objectName: parts.slice(2).join("/")
  };
}
function getContentType(filePath) {
  const ext = import_path.default.extname(filePath).toLowerCase();
  const mimeTypes = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain"
  };
  return mimeTypes[ext] || "application/octet-stream";
}
function pruneDeletedFiles(state, currentFiles) {
  let pruned = 0;
  const toDelete = [];
  for (const key of Object.keys(state.backedUpFiles)) {
    if (!currentFiles.has(key)) {
      toDelete.push(key);
    }
  }
  for (const key of toDelete) {
    delete state.backedUpFiles[key];
    pruned++;
  }
  return pruned;
}
async function runBackup() {
  const objectStorageService = new ObjectStorageService();
  const state = loadBackupState();
  let backedUp = 0;
  let skipped = 0;
  let errors = 0;
  const failedFiles = [];
  try {
    const files = getAllFiles(UPLOADS_DIR);
    const currentFiles = new Set(
      files.map((f) => import_path.default.relative(UPLOADS_DIR, f))
    );
    const pruned = pruneDeletedFiles(state, currentFiles);
    for (const filePath of files) {
      const result = await backupFile(filePath, state, objectStorageService);
      if (result.error) {
        errors++;
        failedFiles.push(import_path.default.relative(UPLOADS_DIR, filePath));
      } else if (result.backed) {
        backedUp++;
      } else {
        skipped++;
      }
    }
    state.lastBackup = (/* @__PURE__ */ new Date()).toISOString();
    saveBackupStateAtomic(state);
    logAudit({
      action: "backup_completed",
      details: {
        backedUp,
        skipped,
        errors,
        pruned,
        totalFiles: files.length,
        failedFiles: failedFiles.length > 0 ? failedFiles.slice(0, 10) : void 0
      }
    });
    console.log(`[Backup] Completed: ${backedUp} backed up, ${skipped} skipped, ${errors} errors, ${pruned} pruned`);
    return { backedUp, skipped, errors, pruned };
  } catch (error) {
    console.error("[Backup] Error during backup:", error);
    logAudit({
      action: "backup_failed",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
        backedUp,
        skipped,
        errors
      }
    });
    return { backedUp, skipped, errors, pruned: 0 };
  }
}
function startBackupService() {
  console.log("[Backup] Starting backup service...");
  setTimeout(() => {
    runBackup().catch(console.error);
  }, 5e3);
  setInterval(() => {
    runBackup().catch(console.error);
  }, BACKUP_INTERVAL);
  console.log(`[Backup] Service started. Will backup every ${BACKUP_INTERVAL / 1e3 / 60} minutes.`);
}

// server/lib/csrf.ts
var import_crypto5 = __toESM(require("crypto"), 1);
var CSRF_TOKEN_LENGTH = 32;
var CSRF_HEADER = "x-csrf-token";
function generateCsrfToken() {
  return import_crypto5.default.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}
function csrfMiddleware(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
}
function validateCsrf(req, res, next) {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }
  const tokenFromHeader = req.headers[CSRF_HEADER];
  const tokenFromBody = req.body?._csrf;
  const tokenFromQuery = req.query?._csrf;
  const submittedToken = tokenFromHeader || tokenFromBody || tokenFromQuery;
  if (!submittedToken || submittedToken !== req.session.csrfToken) {
    return res.status(403).json({
      code: "CSRF_INVALID",
      message: "Token CSRF inv\xE1lido. Por favor, recarga la p\xE1gina e intenta de nuevo."
    });
  }
  next();
}
function getCsrfToken(req, res) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }
  res.json({ csrfToken: req.session.csrfToken });
}

// server/routes.ts
init_rate_limiter();

// server/routes/shared.ts
init_db();
init_schema();
var import_drizzle_orm12 = require("drizzle-orm");
init_security();
var statsCache = /* @__PURE__ */ new Map();
var STATS_CACHE_TTL = 3e4;
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
var ipOrderTracker = /* @__PURE__ */ new Map();
var IP_BLOCK_THRESHOLD = 7;
var IP_BLOCK_DURATION = 24 * 60 * 60 * 1e3;
function startIpTrackerCleanup() {
  setInterval(() => {
    const cutoff = Date.now() - IP_BLOCK_DURATION;
    ipOrderTracker.forEach((timestamps, ip) => {
      const valid = timestamps.filter((t) => t > cutoff);
      if (valid.length === 0) {
        ipOrderTracker.delete(ip);
      } else {
        ipOrderTracker.set(ip, valid);
      }
    });
  }, 36e5);
}
function isIpBlockedFromOrders(ip) {
  const timestamps = ipOrderTracker.get(ip) || [];
  const cutoff = Date.now() - IP_BLOCK_DURATION;
  const recentCount = timestamps.filter((t) => t > cutoff).length;
  return { blocked: recentCount >= IP_BLOCK_THRESHOLD, ordersCount: recentCount };
}
function trackOrderByIp(ip) {
  const timestamps = ipOrderTracker.get(ip) || [];
  timestamps.push(Date.now());
  ipOrderTracker.set(ip, timestamps);
}
async function detectSuspiciousOrderActivity(userId) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
  const recentOrders = await db.select({ id: orders.id, createdAt: orders.createdAt }).from(orders).where(
    (0, import_drizzle_orm12.and)(
      (0, import_drizzle_orm12.eq)(orders.userId, userId),
      (0, import_drizzle_orm12.gt)(orders.createdAt, oneDayAgo)
    )
  );
  if (recentOrders.length >= 7) {
    return { suspicious: true, reason: `Created ${recentOrders.length} orders in 24 hours` };
  }
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1e3);
  const veryRecentOrders = recentOrders.filter((o) => o.createdAt && new Date(o.createdAt) > oneHourAgo);
  if (veryRecentOrders.length >= 4) {
    return { suspicious: true, reason: `Created ${veryRecentOrders.length} orders in 1 hour` };
  }
  return { suspicious: false };
}
async function flagAccountForReview(userId, reason) {
  await db.update(users).set({
    accountStatus: "pending",
    securityOtpRequired: true,
    internalNotes: import_drizzle_orm12.sql`COALESCE(${users.internalNotes}, '') || E'\n[' || NOW() || '] SECURITY FLAG: ' || ${reason}`
  }).where((0, import_drizzle_orm12.eq)(users.id, userId));
  logAudit({
    action: "account_flagged_for_review",
    userId,
    details: { reason }
  });
}
var logActivity2 = async (title, data, _req) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[LOG] ${title}:`, data);
  }
};
var asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// server/routes/admin-orders.ts
var import_zod = require("zod");
var import_drizzle_orm13 = require("drizzle-orm");
init_schema();
init_email();
init_calendar_service();
function registerAdminOrderRoutes(app2) {
  app2.get("/api/admin/orders", isAdminOrSupport, async (req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      res.json(allOrders);
    } catch (error) {
      console.error("Admin orders error:", error);
      res.status(500).json({ message: "Error fetching orders" });
    }
  });
  app2.patch("/api/admin/orders/:id/status", isAdminOrSupport, asyncHandler(async (req, res) => {
    const orderId = Number(req.params.id);
    const { status } = import_zod.z.object({ status: import_zod.z.string() }).parse(req.body);
    const [updatedOrder] = await db.update(orders).set({ status }).where((0, import_drizzle_orm13.eq)(orders.id, orderId)).returning();
    logAudit({
      action: "order_status_change",
      userId: req.session?.userId,
      targetId: String(orderId),
      details: { newStatus: status }
    });
    const order = await storage.getOrder(orderId);
    if (order?.user?.email) {
      const userLang = order.user.preferredLanguage || "es";
      const statusLabelsI18n = {
        pending: { es: "Pendiente", en: "Pending", ca: "Pendent", fr: "En attente", de: "Ausstehend", it: "In sospeso", pt: "Pendente" },
        paid: { es: "Pagado", en: "Paid", ca: "Pagat", fr: "Pay\xE9", de: "Bezahlt", it: "Pagato", pt: "Pago" },
        processing: { es: "En proceso", en: "Processing", ca: "En proc\xE9s", fr: "En cours", de: "In Bearbeitung", it: "In elaborazione", pt: "Em processamento" },
        filed: { es: "Presentado", en: "Filed", ca: "Presentat", fr: "D\xE9pos\xE9", de: "Eingereicht", it: "Presentato", pt: "Apresentado" },
        documents_ready: { es: "Documentos listos", en: "Documents ready", ca: "Documents preparats", fr: "Documents pr\xEAts", de: "Dokumente bereit", it: "Documenti pronti", pt: "Documentos prontos" },
        completed: { es: "Completado", en: "Completed", ca: "Completat", fr: "Termin\xE9", de: "Abgeschlossen", it: "Completato", pt: "Conclu\xEDdo" },
        cancelled: { es: "Cancelado", en: "Cancelled", ca: "Cancel\xB7lat", fr: "Annul\xE9", de: "Storniert", it: "Annullato", pt: "Cancelado" }
      };
      const statusLabel = statusLabelsI18n[status]?.[userLang] || statusLabelsI18n[status]?.es || status.replace(/_/g, " ");
      if (status === "completed" && order.userId) {
        await db.update(users).set({ accountStatus: "vip" }).where((0, import_drizzle_orm13.eq)(users.id, order.userId));
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
        const hasTaxExtension = order.application.hasTaxExtension || false;
        await updateApplicationDeadlines(order.application.id, formationDate, state, hasTaxExtension);
      }
      if (status === "cancelled" && order.application) {
        await db.update(llcApplications).set({
          irs1120DueDate: null,
          irs5472DueDate: null,
          annualReportDueDate: null,
          agentRenewalDate: null
        }).where((0, import_drizzle_orm13.eq)(llcApplications.id, order.application.id));
      }
      const orderCode = order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber || `#${order.id}`;
      const messageKey = status === "completed" ? "ntf.orderUpdateCompleted.message" : "ntf.orderUpdate.message";
      await db.insert(userNotifications).values({
        userId: order.userId,
        orderId: order.id,
        orderCode,
        title: `i18n:ntf.orderUpdate.title::{"statusLabel":"@ntf.orderStatus.${status}"}`,
        message: `i18n:${messageKey}::{"orderCode":"${orderCode}","statusLabel":"@ntf.orderStatus.${status}"}`,
        type: "update",
        isRead: false
      });
      await db.insert(orderEvents).values({
        orderId: order.id,
        eventType: statusLabel,
        description: `${statusLabel} \u2014 ${orderCode}`,
        createdBy: req.session.userId
      });
      const emailSubjects = {
        es: `Actualizaci\xF3n de estado - Pedido ${order.invoiceNumber || `#${order.id}`}`,
        en: `Status update - Order ${order.invoiceNumber || `#${order.id}`}`,
        ca: `Actualitzaci\xF3 d'estat - Comanda ${order.invoiceNumber || `#${order.id}`}`,
        fr: `Mise \xE0 jour - Commande ${order.invoiceNumber || `#${order.id}`}`,
        de: `Statusaktualisierung - Bestellung ${order.invoiceNumber || `#${order.id}`}`,
        it: `Aggiornamento stato - Ordine ${order.invoiceNumber || `#${order.id}`}`,
        pt: `Atualiza\xE7\xE3o de estado - Pedido ${order.invoiceNumber || `#${order.id}`}`
      };
      const emailBodies = {
        es: `Tu pedido ha pasado a estado: ${statusLabel}. Puedes ver los detalles en tu \xE1rea de clientes.`,
        en: `Your order status has been updated to: ${statusLabel}. You can view the details in your dashboard.`,
        ca: `La teva comanda ha passat a estat: ${statusLabel}. Pots veure els detalls a la teva \xE0rea de clients.`,
        fr: `Votre commande est pass\xE9e \xE0 l'\xE9tat : ${statusLabel}. Vous pouvez consulter les d\xE9tails dans votre espace client.`,
        de: `Ihr Bestellstatus wurde auf ${statusLabel} aktualisiert. Sie k\xF6nnen die Details in Ihrem Dashboard einsehen.`,
        it: `Il tuo ordine \xE8 passato allo stato: ${statusLabel}. Puoi visualizzare i dettagli nella tua area clienti.`,
        pt: `O seu pedido foi atualizado para: ${statusLabel}. Pode ver os detalhes na sua \xE1rea de clientes.`
      };
      sendEmail({
        to: order.user.email,
        subject: emailSubjects[userLang] || emailSubjects.es,
        html: getOrderUpdateTemplate(
          order.user.firstName || "Cliente",
          order.invoiceNumber || `#${order.id}`,
          status,
          emailBodies[userLang] || emailBodies.es,
          userLang
        )
      }).catch(() => {
      });
    }
    res.json(updatedOrder);
  }));
  app2.patch("/api/admin/orders/:id/inline", isAdminOrSupport, asyncHandler(async (req, res) => {
    const orderId = Number(req.params.id);
    const body = import_zod.z.object({
      amount: import_zod.z.number().optional(),
      companyName: import_zod.z.string().optional(),
      state: import_zod.z.string().optional(),
      ownerFullName: import_zod.z.string().optional(),
      ownerEmail: import_zod.z.string().optional(),
      ownerPhone: import_zod.z.string().optional(),
      businessCategory: import_zod.z.string().optional(),
      ein: import_zod.z.string().optional(),
      notes: import_zod.z.string().optional()
    }).parse(req.body);
    const [order] = await db.select().from(orders).where((0, import_drizzle_orm13.eq)(orders.id, orderId));
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (body.amount !== void 0) {
      await db.update(orders).set({ amount: body.amount }).where((0, import_drizzle_orm13.eq)(orders.id, orderId));
    }
    const appFields = {};
    if (body.companyName !== void 0) appFields.companyName = body.companyName;
    if (body.state !== void 0) appFields.state = body.state;
    if (body.ownerFullName !== void 0) appFields.ownerFullName = body.ownerFullName;
    if (body.ownerEmail !== void 0) appFields.ownerEmail = body.ownerEmail;
    if (body.ownerPhone !== void 0) appFields.ownerPhone = body.ownerPhone;
    if (body.businessCategory !== void 0) appFields.businessCategory = body.businessCategory;
    if (Object.keys(appFields).length > 0) {
      const [llcApp] = await db.select().from(llcApplications).where((0, import_drizzle_orm13.eq)(llcApplications.orderId, orderId));
      if (llcApp) {
        await db.update(llcApplications).set(appFields).where((0, import_drizzle_orm13.eq)(llcApplications.id, llcApp.id));
      }
      const [maintApp] = await db.select().from(maintenanceApplications).where((0, import_drizzle_orm13.eq)(maintenanceApplications.orderId, orderId));
      if (maintApp) {
        const maintFields = { ...appFields };
        if (body.ein !== void 0) maintFields.ein = body.ein;
        await db.update(maintenanceApplications).set(maintFields).where((0, import_drizzle_orm13.eq)(maintenanceApplications.id, maintApp.id));
      }
    }
    logAudit({
      action: "order_updated",
      userId: req.session?.userId,
      targetId: orderId.toString(),
      details: { orderId, changedFields: Object.keys(body) }
    });
    res.json({ success: true });
  }));
  app2.patch("/api/admin/orders/:id/payment-link", isAdminOrSupport, asyncHandler(async (req, res) => {
    const orderId = Number(req.params.id);
    const { paymentLink, paymentStatus, paymentDueDate } = import_zod.z.object({
      paymentLink: import_zod.z.string().url().optional().nullable(),
      paymentStatus: import_zod.z.enum(["pending", "paid", "overdue", "cancelled"]).optional(),
      paymentDueDate: import_zod.z.string().optional().nullable()
    }).parse(req.body);
    const updateData = {};
    if (paymentLink !== void 0) updateData.paymentLink = paymentLink;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (paymentDueDate !== void 0) updateData.paymentDueDate = paymentDueDate ? new Date(paymentDueDate) : null;
    if (paymentStatus === "paid") updateData.paidAt = /* @__PURE__ */ new Date();
    const [updatedOrder] = await db.update(orders).set(updateData).where((0, import_drizzle_orm13.eq)(orders.id, orderId)).returning();
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
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
      return res.status(404).json({ message: "Order not found" });
    }
    await db.transaction(async (tx) => {
      await tx.delete(orderEvents).where((0, import_drizzle_orm13.eq)(orderEvents.orderId, orderId));
      await tx.delete(applicationDocuments).where((0, import_drizzle_orm13.eq)(applicationDocuments.orderId, orderId));
      if (order.userId) {
        await tx.delete(userNotifications).where(
          (0, import_drizzle_orm13.and)(
            (0, import_drizzle_orm13.eq)(userNotifications.userId, order.userId),
            import_drizzle_orm13.sql`${userNotifications.message} LIKE ${"%" + (order.invoiceNumber || `#${orderId}`) + "%"}`
          )
        );
      }
      if (order.application?.id) {
        await tx.delete(llcApplications).where((0, import_drizzle_orm13.eq)(llcApplications.id, order.application.id));
      }
      await tx.delete(orders).where((0, import_drizzle_orm13.eq)(orders.id, orderId));
    });
    res.json({ success: true, message: "Order deleted successfully" });
  }));
  app2.get("/api/admin/incomplete-applications", isAdminOrSupport, async (req, res) => {
    try {
      const llcDrafts = await db.select({
        id: llcApplications.id,
        orderId: llcApplications.orderId,
        requestCode: llcApplications.requestCode,
        ownerFullName: llcApplications.ownerFullName,
        ownerEmail: llcApplications.ownerEmail,
        ownerPhone: llcApplications.ownerPhone,
        companyName: llcApplications.companyName,
        state: llcApplications.state,
        status: llcApplications.status,
        abandonedAt: llcApplications.abandonedAt,
        remindersSent: llcApplications.remindersSent,
        lastUpdated: llcApplications.lastUpdated
      }).from(llcApplications).where((0, import_drizzle_orm13.eq)(llcApplications.status, "draft")).orderBy((0, import_drizzle_orm13.desc)(llcApplications.lastUpdated));
      const maintDrafts = await db.select({
        id: maintenanceApplications.id,
        orderId: maintenanceApplications.orderId,
        requestCode: maintenanceApplications.requestCode,
        ownerFullName: maintenanceApplications.ownerFullName,
        ownerEmail: maintenanceApplications.ownerEmail,
        ownerPhone: maintenanceApplications.ownerPhone,
        companyName: maintenanceApplications.companyName,
        state: maintenanceApplications.state,
        status: maintenanceApplications.status,
        abandonedAt: maintenanceApplications.abandonedAt,
        remindersSent: maintenanceApplications.remindersSent,
        lastUpdated: maintenanceApplications.lastUpdated
      }).from(maintenanceApplications).where((0, import_drizzle_orm13.eq)(maintenanceApplications.status, "draft")).orderBy((0, import_drizzle_orm13.desc)(maintenanceApplications.lastUpdated));
      res.json({
        llc: llcDrafts.map((d) => ({ ...d, type: "llc" })),
        maintenance: maintDrafts.map((d) => ({ ...d, type: "maintenance" }))
      });
    } catch (error) {
      console.error("Error fetching incomplete applications:", error);
      res.status(500).json({ message: "Error fetching incomplete applications" });
    }
  });
  app2.delete("/api/admin/incomplete-applications/:type/:id", isAdmin, asyncHandler(async (req, res) => {
    const { type, id } = req.params;
    const appId = Number(id);
    if (type === "llc") {
      const [app3] = await db.select({ orderId: llcApplications.orderId }).from(llcApplications).where((0, import_drizzle_orm13.and)((0, import_drizzle_orm13.eq)(llcApplications.id, appId), (0, import_drizzle_orm13.eq)(llcApplications.status, "draft")));
      if (!app3) {
        return res.status(404).json({ message: "Request not found" });
      }
      await db.delete(applicationDocuments).where((0, import_drizzle_orm13.eq)(applicationDocuments.orderId, app3.orderId));
      await db.delete(orderEvents).where((0, import_drizzle_orm13.eq)(orderEvents.orderId, app3.orderId));
      await db.delete(llcApplications).where((0, import_drizzle_orm13.eq)(llcApplications.id, appId));
      await db.delete(orders).where((0, import_drizzle_orm13.eq)(orders.id, app3.orderId));
    } else if (type === "maintenance") {
      const [app3] = await db.select({ orderId: maintenanceApplications.orderId }).from(maintenanceApplications).where((0, import_drizzle_orm13.and)((0, import_drizzle_orm13.eq)(maintenanceApplications.id, appId), (0, import_drizzle_orm13.eq)(maintenanceApplications.status, "draft")));
      if (!app3) {
        return res.status(404).json({ message: "Request not found" });
      }
      await db.delete(applicationDocuments).where((0, import_drizzle_orm13.eq)(applicationDocuments.orderId, app3.orderId));
      await db.delete(orderEvents).where((0, import_drizzle_orm13.eq)(orderEvents.orderId, app3.orderId));
      await db.delete(maintenanceApplications).where((0, import_drizzle_orm13.eq)(maintenanceApplications.id, appId));
      await db.delete(orders).where((0, import_drizzle_orm13.eq)(orders.id, app3.orderId));
    } else {
      return res.status(400).json({ message: "Invalid request type" });
    }
    res.json({ success: true, message: "Incomplete request deleted" });
  }));
  app2.patch("/api/admin/llc/:appId/dates", isAdminOrSupport, asyncHandler(async (req, res) => {
    const appId = Number(req.params.appId);
    const { field, value } = import_zod.z.object({
      field: import_zod.z.enum(["llcCreatedDate", "agentRenewalDate", "irs1120DueDate", "irs5472DueDate", "annualReportDueDate", "ein", "registrationNumber", "llcAddress", "ownerSharePercentage", "agentStatus", "boiStatus", "boiFiledDate"]),
      value: import_zod.z.string()
    }).parse(req.body);
    const textFields = ["ein", "registrationNumber", "llcAddress", "ownerSharePercentage", "agentStatus", "boiStatus"];
    if (textFields.includes(field)) {
      const updateData2 = {};
      updateData2[field] = value || null;
      if (field === "agentStatus" && value === "renewed") {
        const [app3] = await db.select({ agentRenewalDate: llcApplications.agentRenewalDate }).from(llcApplications).where((0, import_drizzle_orm13.eq)(llcApplications.id, appId)).limit(1);
        if (app3?.agentRenewalDate) {
          const newRenewalDate = new Date(app3.agentRenewalDate);
          newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);
          await db.update(llcApplications).set({
            agentStatus: "active",
            agentRenewalDate: newRenewalDate
          }).where((0, import_drizzle_orm13.eq)(llcApplications.id, appId));
          return res.json({ success: true, newRenewalDate });
        }
      }
      await db.update(llcApplications).set(updateData2).where((0, import_drizzle_orm13.eq)(llcApplications.id, appId));
      return res.json({ success: true });
    }
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
      const [app3] = await db.select({ state: llcApplications.state }).from(llcApplications).where((0, import_drizzle_orm13.eq)(llcApplications.id, appId)).limit(1);
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
    await db.update(llcApplications).set(updateData).where((0, import_drizzle_orm13.eq)(llcApplications.id, appId));
    res.json({ success: true });
  }));
  app2.patch("/api/admin/llc/:appId/tax-extension", isAdminOrSupport, asyncHandler(async (req, res) => {
    const appId = Number(req.params.appId);
    const { hasTaxExtension } = import_zod.z.object({
      hasTaxExtension: import_zod.z.boolean()
    }).parse(req.body);
    const [app3] = await db.select().from(llcApplications).where((0, import_drizzle_orm13.eq)(llcApplications.id, appId)).limit(1);
    if (!app3) {
      return res.status(404).json({ message: "Application not found" });
    }
    await db.update(llcApplications).set({ hasTaxExtension }).where((0, import_drizzle_orm13.eq)(llcApplications.id, appId));
    if (app3.llcCreatedDate) {
      const creationDate = new Date(app3.llcCreatedDate);
      const creationYear = creationDate.getFullYear();
      const nextYear = creationYear + 1;
      const taxMonth = hasTaxExtension ? 9 : 3;
      await db.update(llcApplications).set({
        irs1120DueDate: new Date(nextYear, taxMonth, 15),
        irs5472DueDate: new Date(nextYear, taxMonth, 15)
      }).where((0, import_drizzle_orm13.eq)(llcApplications.id, appId));
    }
    res.json({
      success: true,
      hasTaxExtension
    });
  }));
}

// server/routes/admin-users.ts
var import_zod2 = require("zod");
var import_drizzle_orm14 = require("drizzle-orm");
init_schema();
init_email();
init_email_translations();
init_security();
function registerAdminUserRoutes(app2) {
  app2.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users4 = await db.select().from(users).orderBy((0, import_drizzle_orm14.desc)(users.createdAt));
      res.json(users4);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  app2.patch("/api/admin/users/:id", isAdmin, asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const updateSchema = import_zod2.z.object({
      firstName: import_zod2.z.string().min(1).max(100).optional(),
      lastName: import_zod2.z.string().min(1).max(100).optional(),
      email: import_zod2.z.string().email().optional(),
      phone: import_zod2.z.string().max(30).optional().nullable(),
      address: import_zod2.z.string().optional().nullable(),
      streetType: import_zod2.z.string().optional().nullable(),
      city: import_zod2.z.string().optional().nullable(),
      province: import_zod2.z.string().optional().nullable(),
      postalCode: import_zod2.z.string().optional().nullable(),
      country: import_zod2.z.string().optional().nullable(),
      idNumber: import_zod2.z.string().optional().nullable(),
      idType: import_zod2.z.enum(["dni", "nie", "passport"]).optional().nullable(),
      birthDate: import_zod2.z.string().optional().nullable(),
      businessActivity: import_zod2.z.string().optional().nullable(),
      isActive: import_zod2.z.boolean().optional(),
      isAdmin: import_zod2.z.boolean().optional(),
      isSupport: import_zod2.z.boolean().optional(),
      accountStatus: import_zod2.z.enum(["active", "pending", "deactivated", "vip"]).optional(),
      internalNotes: import_zod2.z.string().optional().nullable()
    });
    const data = updateSchema.parse(req.body);
    const SUPER_ADMIN_EMAIL = "afortuny07@gmail.com";
    if (data.isAdmin !== void 0 || data.isSupport !== void 0) {
      const [currentAdmin] = await db.select().from(users).where((0, import_drizzle_orm14.eq)(users.id, req.session?.userId || "")).limit(1);
      if (!currentAdmin || currentAdmin.email !== SUPER_ADMIN_EMAIL) {
        return res.status(403).json({ message: "Only the main administrator can assign admin or support privileges" });
      }
    }
    const updateData = { ...data, updatedAt: /* @__PURE__ */ new Date() };
    if (data.isAdmin === true) {
      updateData.emailVerified = true;
      updateData.accountStatus = "active";
    }
    const [updated] = await db.update(users).set(updateData).where((0, import_drizzle_orm14.eq)(users.id, userId)).returning();
    logAudit({
      action: "admin_user_update",
      userId: req.session?.userId,
      targetId: userId,
      details: { changes: Object.keys(data) }
    });
    if (data.accountStatus) {
      const [user] = await db.select().from(users).where((0, import_drizzle_orm14.eq)(users.id, userId)).limit(1);
      if (user && user.email) {
        const uLang = user.preferredLanguage || "es";
        if (data.accountStatus === "deactivated") {
          await sendEmail({
            to: user.email,
            subject: uLang === "en" ? "Account status notification" : uLang === "ca" ? "Notificaci\xF3 d'estat del compte" : uLang === "fr" ? "Notification de statut de compte" : uLang === "de" ? "Kontostatus-Benachrichtigung" : uLang === "it" ? "Notifica stato account" : uLang === "pt" ? "Notifica\xE7\xE3o de estado da conta" : "Notificaci\xF3n de estado de cuenta",
            html: getAccountDeactivatedTemplate(user.firstName || void 0, uLang)
          }).catch(() => {
          });
          await db.insert(userNotifications).values({
            userId,
            title: "i18n:ntf.accountDeactivated.title",
            message: "i18n:ntf.accountDeactivated.message",
            type: "action_required",
            isRead: false
          });
        } else if (data.accountStatus === "vip") {
          await sendEmail({
            to: user.email,
            subject: uLang === "en" ? "Your account has been upgraded to VIP" : uLang === "ca" ? "El teu compte ha estat actualitzat a VIP" : uLang === "fr" ? "Votre compte a \xE9t\xE9 mis \xE0 jour en VIP" : uLang === "de" ? "Ihr Konto wurde auf VIP aktualisiert" : uLang === "it" ? "Il tuo account \xE8 stato aggiornato a VIP" : uLang === "pt" ? "A sua conta foi atualizada para VIP" : "Tu cuenta ha sido actualizada a estado VIP",
            html: getAccountVipTemplate(user.firstName || void 0, uLang)
          }).catch(() => {
          });
          await db.insert(userNotifications).values({
            userId,
            title: "i18n:ntf.accountVip.title",
            message: "i18n:ntf.accountVip.message",
            type: "update",
            isRead: false
          });
        } else if (data.accountStatus === "active") {
          await sendEmail({
            to: user.email,
            subject: uLang === "en" ? "Your account has been reactivated" : uLang === "ca" ? "El teu compte ha estat reactivat" : uLang === "fr" ? "Votre compte a \xE9t\xE9 r\xE9activ\xE9" : uLang === "de" ? "Ihr Konto wurde reaktiviert" : uLang === "it" ? "Il tuo account \xE8 stato riattivato" : uLang === "pt" ? "A sua conta foi reativada" : "Tu cuenta ha sido reactivada",
            html: getAccountReactivatedTemplate(user.firstName || void 0, uLang)
          }).catch(() => {
          });
          await db.insert(userNotifications).values({
            userId,
            title: "i18n:ntf.accountActivated.title",
            message: "i18n:ntf.accountActivated.message",
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
      const userOrders = await db.select({ id: orders.id }).from(orders).where((0, import_drizzle_orm14.eq)(orders.userId, userId));
      const orderIds = userOrders.map((o) => o.id);
      const userApps = orderIds.length > 0 ? await db.select({ id: llcApplications.id }).from(llcApplications).where((0, import_drizzle_orm14.inArray)(llcApplications.orderId, orderIds)) : [];
      const appIds = userApps.map((a) => a.id);
      if (orderIds.length > 0) {
        await db.delete(applicationDocuments).where((0, import_drizzle_orm14.inArray)(applicationDocuments.orderId, orderIds));
      }
      if (appIds.length > 0) {
        await db.delete(applicationDocuments).where((0, import_drizzle_orm14.inArray)(applicationDocuments.applicationId, appIds));
      }
      if (orderIds.length > 0) {
        await db.delete(orderEvents).where((0, import_drizzle_orm14.inArray)(orderEvents.orderId, orderIds));
      }
      await db.delete(userNotifications).where((0, import_drizzle_orm14.eq)(userNotifications.userId, userId));
      const userMessages = await db.select({ id: messages.id }).from(messages).where((0, import_drizzle_orm14.eq)(messages.userId, userId));
      const messageIds = userMessages.map((m) => m.id);
      if (messageIds.length > 0) {
        await db.delete(messageReplies).where((0, import_drizzle_orm14.inArray)(messageReplies.messageId, messageIds));
      }
      await db.delete(messages).where((0, import_drizzle_orm14.eq)(messages.userId, userId));
      if (orderIds.length > 0) {
        await db.delete(maintenanceApplications).where((0, import_drizzle_orm14.inArray)(maintenanceApplications.orderId, orderIds));
      }
      if (orderIds.length > 0) {
        await db.delete(llcApplications).where((0, import_drizzle_orm14.inArray)(llcApplications.orderId, orderIds));
      }
      await db.delete(orders).where((0, import_drizzle_orm14.eq)(orders.userId, userId));
      await db.delete(users).where((0, import_drizzle_orm14.eq)(users.id, userId));
      logAudit({
        action: "admin_user_update",
        userId: req.session?.userId,
        targetId: userId,
        details: { action: "cascade_delete", deletedOrders: orderIds.length, deletedApps: appIds.length }
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user" });
    }
  });
  app2.post("/api/admin/users/create", isAdmin, asyncHandler(async (req, res) => {
    const schema = import_zod2.z.object({
      firstName: import_zod2.z.string().optional(),
      lastName: import_zod2.z.string().optional(),
      email: import_zod2.z.string().email(),
      phone: import_zod2.z.string().optional(),
      password: import_zod2.z.string().min(6)
    });
    const { firstName, lastName, email, phone, password } = schema.parse(req.body);
    const existing = await db.select().from(users).where((0, import_drizzle_orm14.eq)(users.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email is already registered" });
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
  app2.post("/api/admin/users/:id/reset-password", isAdmin, asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: "Password is required" });
    }
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }
    const [user] = await db.select().from(users).where((0, import_drizzle_orm14.eq)(users.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const bcrypt2 = await import("bcrypt");
    const hashedPassword = await bcrypt2.hash(newPassword, 10);
    await db.update(users).set({
      passwordHash: hashedPassword,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm14.eq)(users.id, userId));
    logAudit({
      action: "admin_password_reset",
      userId: req.session?.userId,
      targetId: userId,
      details: { email: user.email }
    });
    if (user.email) {
      const rpLang = user.preferredLanguage || "es";
      await sendEmail({
        to: user.email,
        subject: rpLang === "en" ? "Your password has been reset" : rpLang === "ca" ? "La teva contrasenya ha estat restablerta" : rpLang === "fr" ? "Votre mot de passe a \xE9t\xE9 r\xE9initialis\xE9" : rpLang === "de" ? "Ihr Passwort wurde zur\xFCckgesetzt" : rpLang === "it" ? "La tua password \xE8 stata reimpostata" : rpLang === "pt" ? "A sua palavra-passe foi redefinida" : "Tu contrase\xF1a ha sido restablecida",
        html: getAdminPasswordResetTemplate(user.firstName || "", rpLang)
      }).catch(() => {
      });
    }
    res.json({ success: true });
  }));
  app2.get("/api/admin/users/:id/documents/download", isAdminOrSupport, asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const archiver = await import("archiver");
    const path7 = await import("path");
    const fs6 = await import("fs");
    const [user] = await db.select().from(users).where((0, import_drizzle_orm14.eq)(users.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const documents = await db.select().from(applicationDocuments).where((0, import_drizzle_orm14.eq)(applicationDocuments.userId, userId));
    if (documents.length === 0) {
      return res.status(404).json({ message: "No documents found for this user" });
    }
    const archive = archiver.default("zip", { zlib: { level: 9 } });
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="documentos_${user.firstName || "cliente"}_${user.clientId || userId}.zip"`);
    archive.pipe(res);
    for (const doc of documents) {
      const filePath = path7.join(process.cwd(), doc.fileUrl);
      if (fs6.existsSync(filePath)) {
        archive.file(filePath, { name: doc.fileName });
      }
    }
    await archive.finalize();
    logAudit({
      action: "admin_documents_download",
      userId: req.session?.userId,
      targetId: userId,
      details: { documentCount: documents.length }
    });
  }));
  app2.patch("/api/admin/users/:id/deactivate", isAdmin, asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { reason, confirmDeactivation } = req.body;
    if (!confirmDeactivation) {
      return res.status(400).json({ message: "Explicit confirmation required (confirmDeactivation: true)" });
    }
    const [user] = await db.select().from(users).where((0, import_drizzle_orm14.eq)(users.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isAdmin) {
      return res.status(403).json({ message: "Cannot deactivate an administrator" });
    }
    if (user.accountStatus === "deactivated") {
      return res.status(400).json({ message: "User is already deactivated" });
    }
    const recentOrders = await db.select().from(orders).where((0, import_drizzle_orm14.and)(
      (0, import_drizzle_orm14.eq)(orders.userId, userId),
      (0, import_drizzle_orm14.eq)(orders.status, "paid"),
      import_drizzle_orm14.sql`${orders.paidAt} > NOW() - INTERVAL '30 days'`
    )).limit(1);
    if (recentOrders.length > 0) {
      return res.status(400).json({
        message: "Cannot deactivate: user has a recent payment in the last 30 days"
      });
    }
    const sanitizedReason = reason ? String(reason).slice(0, 500) : "No renov\xF3 mantenimiento";
    await db.update(users).set({
      accountStatus: "deactivated",
      internalNotes: user.internalNotes ? `${user.internalNotes}
[${(/* @__PURE__ */ new Date()).toISOString()}] Desactivado por admin: ${sanitizedReason}` : `[${(/* @__PURE__ */ new Date()).toISOString()}] Desactivado por admin: ${sanitizedReason}`,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm14.eq)(users.id, userId));
    logActivity2("Usuario Desactivado", {
      "Usuario ID": userId,
      "ClientID": user.clientId,
      "Email": user.email,
      "Estado Anterior": user.accountStatus,
      "Raz\xF3n": sanitizedReason,
      "Admin": req.session?.userId
    });
    res.json({ success: true, message: "User deactivated successfully" });
  }));
  app2.patch("/api/admin/users/:id/reactivate", isAdmin, asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { reason } = req.body;
    const [user] = await db.select().from(users).where((0, import_drizzle_orm14.eq)(users.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.accountStatus !== "deactivated") {
      return res.status(400).json({ message: "User is not deactivated" });
    }
    const sanitizedReason = reason ? String(reason).slice(0, 500) : "Reactivado por admin";
    await db.update(users).set({
      accountStatus: "active",
      internalNotes: user.internalNotes ? `${user.internalNotes}
[${(/* @__PURE__ */ new Date()).toISOString()}] Reactivado: ${sanitizedReason}` : `[${(/* @__PURE__ */ new Date()).toISOString()}] Reactivado: ${sanitizedReason}`,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm14.eq)(users.id, userId));
    logActivity2("Usuario Reactivado", {
      "Usuario ID": userId,
      "Email": user.email,
      "Raz\xF3n": sanitizedReason
    });
    res.json({ success: true, message: "User reactivated successfully" });
  }));
  app2.post("/api/admin/users/:userId/request-otp", isAdmin, asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { reason } = req.body;
    const [user] = await db.select().from(users).where((0, import_drizzle_orm14.eq)(users.id, userId)).limit(1);
    if (!user || !user.email) {
      return res.status(404).json({ message: "User not found" });
    }
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
    const userEmail = user.email;
    await db.insert(contactOtps).values({
      email: userEmail,
      otp,
      otpType: "profile_change",
      expiresAt,
      verified: false
    });
    const userLang = user.preferredLanguage || "es";
    sendEmail({
      to: userEmail,
      subject: getOtpSubject(userLang),
      html: getAdminOtpRequestTemplate(
        user.firstName || "Cliente",
        otp,
        reason,
        userLang
      )
    }).catch(console.error);
    logActivity2("OTP Verification Requested", {
      "Admin": req.session?.userId || "unknown",
      "Target User": userId,
      "Email": user.email,
      "Reason": reason || "Admin request"
    });
    res.json({ success: true, message: "OTP verification email sent to client" });
  }));
}

// server/routes/admin-billing.ts
var import_zod3 = require("zod");
var import_drizzle_orm15 = require("drizzle-orm");
init_schema();
function registerAdminBillingRoutes(app2) {
  app2.post("/api/admin/orders/create", isAdmin, asyncHandler(async (req, res) => {
    const validStates = ["New Mexico", "Wyoming", "Delaware"];
    const schema = import_zod3.z.object({
      userId: import_zod3.z.string().uuid(),
      state: import_zod3.z.enum(validStates),
      amount: import_zod3.z.string().or(import_zod3.z.number()).refine((val) => Number(val) > 0, { message: "Amount must be greater than 0" })
    });
    const { userId, state, amount } = schema.parse(req.body);
    const [user] = await db.select().from(users).where((0, import_drizzle_orm15.eq)(users.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const productMap = {
      "New Mexico": { id: 1, name: "LLC New Mexico" },
      "Wyoming": { id: 2, name: "LLC Wyoming" },
      "Delaware": { id: 3, name: "LLC Delaware" }
    };
    const product = productMap[state];
    const amountCents = Math.round(Number(amount) * 100);
    const { generateUniqueAdminOrderCode: generateUniqueAdminOrderCode2 } = await Promise.resolve().then(() => (init_id_generator(), id_generator_exports));
    const invoiceNumber = await generateUniqueAdminOrderCode2(state);
    const [order] = await db.insert(orders).values({
      userId,
      productId: product.id,
      amount: amountCents,
      status: "pending",
      invoiceNumber
    }).returning();
    await db.insert(llcApplications).values({
      orderId: order.id,
      requestCode: invoiceNumber,
      ownerFullName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null,
      ownerEmail: user.email,
      ownerPhone: user.phone,
      state,
      status: "submitted"
    });
    await db.insert(orderEvents).values({
      orderId: order.id,
      eventType: "order_created",
      description: `Pedido ${invoiceNumber} creado por administrador`
    });
    await db.insert(userNotifications).values({
      userId,
      orderId: order.id,
      orderCode: invoiceNumber,
      title: "i18n:ntf.orderCreatedAdmin.title",
      message: `i18n:ntf.orderCreatedAdmin.message::{"invoiceNumber":"${invoiceNumber}","productName":"${product.name}"}`,
      type: "info",
      isRead: false
    });
    res.json({ success: true, orderId: order.id, invoiceNumber });
  }));
  app2.post("/api/admin/orders/create-maintenance", isAdmin, asyncHandler(async (req, res) => {
    const validStates = ["New Mexico", "Wyoming", "Delaware"];
    const schema = import_zod3.z.object({
      userId: import_zod3.z.string().uuid(),
      state: import_zod3.z.enum(validStates),
      amount: import_zod3.z.string().or(import_zod3.z.number()).refine((val) => Number(val) > 0, { message: "Amount must be greater than 0" })
    });
    const { userId, state, amount } = schema.parse(req.body);
    const [user] = await db.select().from(users).where((0, import_drizzle_orm15.eq)(users.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const productMap = {
      "New Mexico": { id: 4, name: "Mantenimiento Anual New Mexico" },
      "Wyoming": { id: 5, name: "Mantenimiento Anual Wyoming" },
      "Delaware": { id: 6, name: "Mantenimiento Anual Delaware" }
    };
    const product = productMap[state];
    const amountCents = Math.round(Number(amount) * 100);
    const { generateUniqueAdminOrderCode: generateUniqueAdminOrderCode2 } = await Promise.resolve().then(() => (init_id_generator(), id_generator_exports));
    const invoiceNumber = `M-${await generateUniqueAdminOrderCode2(state)}`;
    const [order] = await db.insert(orders).values({
      userId,
      productId: product.id,
      amount: amountCents,
      status: "pending",
      invoiceNumber
    }).returning();
    await db.insert(maintenanceApplications).values({
      orderId: order.id,
      requestCode: invoiceNumber,
      ownerFullName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null,
      ownerEmail: user.email,
      ownerPhone: user.phone,
      state,
      status: "submitted"
    });
    await db.insert(orderEvents).values({
      orderId: order.id,
      eventType: "order_created",
      description: `Pedido de mantenimiento ${invoiceNumber} creado por administrador`
    });
    await db.insert(userNotifications).values({
      userId,
      orderId: order.id,
      orderCode: invoiceNumber,
      title: "i18n:ntf.maintenanceCreatedAdmin.title",
      message: `i18n:ntf.maintenanceCreatedAdmin.message::{"invoiceNumber":"${invoiceNumber}","productName":"${product.name}"}`,
      type: "info",
      isRead: false
    });
    logAudit({
      action: "admin_create_maintenance_order",
      userId: req.session?.userId,
      targetId: String(order.id),
      details: { userId, state, amount: amountCents, invoiceNumber }
    });
    res.json({ success: true, orderId: order.id, invoiceNumber });
  }));
  app2.post("/api/admin/orders/create-custom", isAdmin, asyncHandler(async (req, res) => {
    const schema = import_zod3.z.object({
      userId: import_zod3.z.string().uuid(),
      concept: import_zod3.z.string().min(1, "Concept is required"),
      amount: import_zod3.z.string().or(import_zod3.z.number()).refine((val) => Number(val) > 0, { message: "Amount must be greater than 0" })
    });
    const { userId, concept, amount } = schema.parse(req.body);
    const [user] = await db.select().from(users).where((0, import_drizzle_orm15.eq)(users.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const amountCents = Math.round(Number(amount) * 100);
    const { generate8DigitId: generate8DigitId2 } = await Promise.resolve().then(() => (init_id_generator(), id_generator_exports));
    const invoiceNumber = `CUST-${generate8DigitId2()}`;
    const [order] = await db.insert(orders).values({
      userId,
      productId: 1,
      amount: amountCents,
      status: "pending",
      invoiceNumber
    }).returning();
    await db.insert(orderEvents).values({
      orderId: order.id,
      eventType: "order_created",
      description: `Custom order: ${concept}`
    });
    await db.insert(userNotifications).values({
      userId,
      orderId: order.id,
      orderCode: invoiceNumber,
      title: "i18n:ntf.orderCreatedAdmin.title",
      message: `i18n:ntf.orderCreatedAdmin.message::{"invoiceNumber":"${invoiceNumber}","productName":"${concept}"}`,
      type: "info",
      isRead: false
    });
    logAudit({
      action: "admin_create_custom_order",
      userId: req.session?.userId,
      targetId: String(order.id),
      details: { userId, concept, amount: amountCents, invoiceNumber }
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
        db.select({ total: import_drizzle_orm15.sql`COALESCE(sum(amount), 0)` }).from(orders).where((0, import_drizzle_orm15.eq)(orders.status, "completed")),
        db.select({ total: import_drizzle_orm15.sql`COALESCE(sum(amount), 0)` }).from(orders).where((0, import_drizzle_orm15.eq)(orders.status, "pending")),
        db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(users),
        db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(orders),
        db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(orders).where((0, import_drizzle_orm15.eq)(orders.status, "pending")),
        db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(orders).where((0, import_drizzle_orm15.eq)(orders.status, "completed")),
        db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(orders).where((0, import_drizzle_orm15.eq)(orders.status, "processing")),
        db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(newsletterSubscribers),
        db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(users).where((0, import_drizzle_orm15.eq)(users.accountStatus, "pending")),
        db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(users).where((0, import_drizzle_orm15.eq)(users.accountStatus, "active")),
        db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(users).where((0, import_drizzle_orm15.eq)(users.accountStatus, "vip")),
        db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(users).where((0, import_drizzle_orm15.eq)(users.accountStatus, "deactivated")),
        db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(messages),
        db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(messages).where((0, import_drizzle_orm15.eq)(messages.status, "pending")),
        db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(applicationDocuments),
        db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(applicationDocuments).where((0, import_drizzle_orm15.eq)(applicationDocuments.reviewStatus, "pending"))
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
      const result = await db.select({ total: import_drizzle_orm15.sql`sum(amount)` }).from(orders).where((0, import_drizzle_orm15.eq)(orders.status, "completed"));
      res.json({ totalSales: Number(result[0]?.total || 0) });
    } catch (error) {
      res.status(500).json({ message: "Error fetching stats" });
    }
  });
  app2.get("/api/admin/audit-logs", isAdmin, async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 100, 500);
      const offset = parseInt(req.query.offset) || 0;
      const action = req.query.action;
      const search = req.query.search;
      const conditions = [];
      if (action) {
        conditions.push((0, import_drizzle_orm15.eq)(auditLogs.action, action));
      }
      if (search) {
        conditions.push(
          (0, import_drizzle_orm15.or)(
            import_drizzle_orm15.sql`${auditLogs.ip}::text ILIKE ${"%" + search + "%"}`,
            import_drizzle_orm15.sql`${auditLogs.userId}::text ILIKE ${"%" + search + "%"}`,
            import_drizzle_orm15.sql`${auditLogs.details}::text ILIKE ${"%" + search + "%"}`
          )
        );
      }
      const whereClause = conditions.length > 0 ? (0, import_drizzle_orm15.and)(...conditions) : void 0;
      const logsQuery = db.select().from(auditLogs).orderBy((0, import_drizzle_orm15.desc)(auditLogs.createdAt)).limit(limit).offset(offset);
      const countQuery = db.select({ count: import_drizzle_orm15.sql`count(*)` }).from(auditLogs);
      if (whereClause) {
        logsQuery.where(whereClause);
        countQuery.where(whereClause);
      }
      const [logs, countResult] = await Promise.all([logsQuery, countQuery]);
      const total = Number(countResult[0]?.count || 0);
      const distinctActions = await db.selectDistinct({ action: auditLogs.action }).from(auditLogs).orderBy(auditLogs.action);
      res.json({ logs, total, limit, offset, actions: distinctActions.map((a) => a.action) });
    } catch (error) {
      console.error("Audit logs error:", error);
      res.status(500).json({ message: "Error fetching audit logs" });
    }
  });
  app2.get("/api/admin/renewals", isAdmin, async (req, res) => {
    try {
      const { getClientsNeedingRenewal: getClientsNeedingRenewal2 } = await Promise.resolve().then(() => (init_calendar_service(), calendar_service_exports));
      const clients = await getClientsNeedingRenewal2();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching renewal clients:", error);
      res.status(500).json({ message: "Error fetching clients pending renewal" });
    }
  });
  app2.get("/api/admin/renewals/expired", isAdmin, async (req, res) => {
    try {
      const { checkExpiredRenewals: checkExpiredRenewals2 } = await Promise.resolve().then(() => (init_calendar_service(), calendar_service_exports));
      const expiredClients = await checkExpiredRenewals2();
      res.json(expiredClients);
    } catch (error) {
      console.error("Error fetching expired renewals:", error);
      res.status(500).json({ message: "Error fetching expired renewals" });
    }
  });
  app2.get("/api/admin/discount-codes", isAdmin, async (req, res) => {
    try {
      const codes = await db.select().from(discountCodes).orderBy((0, import_drizzle_orm15.desc)(discountCodes.createdAt));
      res.json(codes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching discount codes" });
    }
  });
  app2.post("/api/admin/discount-codes", isAdmin, async (req, res) => {
    try {
      const { code, description, discountType, discountValue, minOrderAmount, maxUses, validFrom, validUntil, isActive } = req.body;
      if (!code || !discountValue) {
        return res.status(400).json({ message: "Discount code and value are required" });
      }
      const [existing] = await db.select().from(discountCodes).where((0, import_drizzle_orm15.eq)(discountCodes.code, code.toUpperCase())).limit(1);
      if (existing) {
        return res.status(400).json({ message: "This code already exists" });
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
      const [updated] = await db.update(discountCodes).set(updateData).where((0, import_drizzle_orm15.eq)(discountCodes.id, id)).returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error updating discount code" });
    }
  });
  app2.delete("/api/admin/discount-codes/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(discountCodes).where((0, import_drizzle_orm15.eq)(discountCodes.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting discount code" });
    }
  });
  app2.get("/api/admin/payment-accounts", isAdmin, async (req, res) => {
    try {
      const accounts = await storage.getPaymentAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payment accounts" });
    }
  });
  app2.post("/api/admin/payment-accounts", isAdmin, async (req, res) => {
    try {
      const schema = import_zod3.z.object({
        label: import_zod3.z.string().min(1),
        holder: import_zod3.z.string().min(1),
        bankName: import_zod3.z.string().min(1),
        accountType: import_zod3.z.string().default("checking"),
        accountNumber: import_zod3.z.string().optional().nullable(),
        routingNumber: import_zod3.z.string().optional().nullable(),
        iban: import_zod3.z.string().optional().nullable(),
        swift: import_zod3.z.string().optional().nullable(),
        address: import_zod3.z.string().optional().nullable(),
        isActive: import_zod3.z.boolean().default(true),
        sortOrder: import_zod3.z.number().default(0)
      });
      const data = schema.parse(req.body);
      const account = await storage.createPaymentAccount(data);
      res.json(account);
    } catch (error) {
      res.status(400).json({ message: error.message || "Error creating payment account" });
    }
  });
  app2.patch("/api/admin/payment-accounts/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.updatePaymentAccount(id, req.body);
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Error updating payment account" });
    }
  });
  app2.delete("/api/admin/payment-accounts/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePaymentAccount(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting payment account" });
    }
  });
  app2.get("/api/payment-accounts/active", async (_req, res) => {
    try {
      const accounts = await storage.getActivePaymentAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payment accounts" });
    }
  });
  app2.post("/api/discount-codes/validate", async (req, res) => {
    try {
      const { code, orderAmount } = req.body;
      if (!code) {
        return res.status(400).json({ valid: false, message: "Code required" });
      }
      const [discountCode] = await db.select().from(discountCodes).where((0, import_drizzle_orm15.eq)(discountCodes.code, code.toUpperCase())).limit(1);
      if (!discountCode) {
        return res.status(404).json({ valid: false, message: "Code not found" });
      }
      if (!discountCode.isActive) {
        return res.status(400).json({ valid: false, message: "Code inactive" });
      }
      const now = /* @__PURE__ */ new Date();
      if (discountCode.validFrom && new Date(discountCode.validFrom) > now) {
        return res.status(400).json({ valid: false, message: "Code not yet valid" });
      }
      if (discountCode.validUntil && new Date(discountCode.validUntil) < now) {
        return res.status(400).json({ valid: false, message: "Code expired" });
      }
      if (discountCode.maxUses && discountCode.usedCount >= discountCode.maxUses) {
        return res.status(400).json({ valid: false, message: "Code exhausted" });
      }
      if (discountCode.minOrderAmount && orderAmount && orderAmount < discountCode.minOrderAmount) {
        return res.status(400).json({ valid: false, message: `Minimum order: ${(discountCode.minOrderAmount / 100).toFixed(2)}\u20AC` });
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
  app2.get("/api/admin/invoices", isAdmin, async (req, res) => {
    try {
      const invoices = await db.select({
        id: applicationDocuments.id,
        orderId: applicationDocuments.orderId,
        fileName: applicationDocuments.fileName,
        fileUrl: applicationDocuments.fileUrl,
        uploadedAt: applicationDocuments.uploadedAt,
        order: {
          id: orders.id,
          amount: orders.amount,
          currency: orders.currency,
          status: orders.status,
          invoiceNumber: orders.invoiceNumber,
          createdAt: orders.createdAt
        },
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email
        }
      }).from(applicationDocuments).leftJoin(orders, (0, import_drizzle_orm15.eq)(applicationDocuments.orderId, orders.id)).leftJoin(users, (0, import_drizzle_orm15.eq)(orders.userId, users.id)).where((0, import_drizzle_orm15.eq)(applicationDocuments.documentType, "invoice")).orderBy((0, import_drizzle_orm15.desc)(applicationDocuments.uploadedAt));
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Error fetching invoices" });
    }
  });
  app2.delete("/api/admin/invoices/:id", isAdmin, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      await db.delete(applicationDocuments).where(
        (0, import_drizzle_orm15.and)(
          (0, import_drizzle_orm15.eq)(applicationDocuments.id, invoiceId),
          (0, import_drizzle_orm15.eq)(applicationDocuments.documentType, "invoice")
        )
      );
      res.json({ success: true, message: "Invoice deleted" });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ message: "Error deleting invoice" });
    }
  });
  app2.patch("/api/admin/invoices/:id/status", isAdmin, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const { status } = import_zod3.z.object({
        status: import_zod3.z.enum(["pending", "paid", "completed", "cancelled", "refunded"])
      }).parse(req.body);
      const [invoice] = await db.select({ orderId: applicationDocuments.orderId }).from(applicationDocuments).where((0, import_drizzle_orm15.eq)(applicationDocuments.id, invoiceId)).limit(1);
      if (!invoice?.orderId) {
        return res.status(404).json({ message: "Invoice or order not found" });
      }
      await db.update(orders).set({ status }).where((0, import_drizzle_orm15.eq)(orders.id, invoice.orderId));
      res.json({ success: true, message: "Status updated" });
    } catch (error) {
      console.error("Error updating invoice status:", error);
      res.status(500).json({ message: "Error updating status" });
    }
  });
  app2.post("/api/admin/invoices/create", isAdmin, asyncHandler(async (req, res) => {
    const { userId, concept, amount, currency } = import_zod3.z.object({
      userId: import_zod3.z.string(),
      concept: import_zod3.z.string().min(1),
      amount: import_zod3.z.number().min(1),
      currency: import_zod3.z.enum(["EUR", "USD"]).default("EUR")
    }).parse(req.body);
    const currencySymbol = currency === "USD" ? "$" : "\u20AC";
    const [user] = await db.select().from(users).where((0, import_drizzle_orm15.eq)(users.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { generateUniqueInvoiceNumber: generateUniqueInvoiceNumber2 } = await Promise.resolve().then(() => (init_id_generator(), id_generator_exports));
    const invoiceNumber = await generateUniqueInvoiceNumber2();
    const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Factura ${invoiceNumber}</title>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 40px; color: #0A0A0A; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: 900; color: #0A0A0A; }
    .logo span { color: #6EDC8A; }
    .invoice-title { font-size: 32px; font-weight: 900; text-align: right; }
    .invoice-number { font-size: 14px; color: #6B7280; text-align: right; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .section-title { font-size: 12px; color: #6B7280; text-transform: uppercase; margin-bottom: 8px; }
    .section-content { font-size: 14px; line-height: 1.6; }
    .items { margin: 40px 0; }
    .items-header { display: grid; grid-template-columns: 3fr 1fr 1fr; padding: 12px 0; border-bottom: 2px solid #0A0A0A; font-weight: 700; font-size: 12px; text-transform: uppercase; }
    .items-row { display: grid; grid-template-columns: 3fr 1fr 1fr; padding: 16px 0; border-bottom: 1px solid #E6E9EC; font-size: 14px; }
    .total-section { text-align: right; margin-top: 24px; }
    .total-row { font-size: 14px; margin-bottom: 8px; }
    .total-final { font-size: 24px; font-weight: 900; color: #0A0A0A; }
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
    const [userOrder] = await db.select().from(orders).where((0, import_drizzle_orm15.eq)(orders.userId, userId)).limit(1);
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
    await db.insert(accountingTransactions).values({
      type: "income",
      category: "other_income",
      amount,
      // amount is already in cents
      description: `Factura ${invoiceNumber}: ${concept}`,
      reference: invoiceNumber,
      transactionDate: /* @__PURE__ */ new Date(),
      notes: `Cliente: ${user.firstName} ${user.lastName} (${user.email})`
    });
    res.json({ success: true, invoiceNumber });
  }));
}

// server/routes/admin-comms.ts
var import_zod4 = require("zod");
var import_drizzle_orm16 = require("drizzle-orm");
init_schema();
init_email();
function registerAdminCommsRoutes(app2) {
  app2.get("/api/admin/newsletter", isAdmin, async (req, res) => {
    try {
      const subscribers = await db.select().from(newsletterSubscribers).orderBy((0, import_drizzle_orm16.desc)(newsletterSubscribers.subscribedAt));
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  });
  app2.delete("/api/admin/newsletter/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(newsletterSubscribers).where((0, import_drizzle_orm16.eq)(newsletterSubscribers.id, parseInt(id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting subscriber" });
    }
  });
  app2.post("/api/calculator/consultation", async (req, res) => {
    try {
      const { email, income, country, activity, savings } = import_zod4.z.object({
        email: import_zod4.z.string().email(),
        income: import_zod4.z.number().min(1),
        country: import_zod4.z.string(),
        activity: import_zod4.z.string().optional(),
        savings: import_zod4.z.number().optional()
      }).parse(req.body);
      await db.insert(calculatorConsultations).values({
        email,
        income,
        country,
        activity: activity || null,
        savings: savings || 0,
        isRead: false
      });
      await storage.createGuestVisitor({
        email,
        source: "calculator",
        ip: getClientIp(req),
        userAgent: req.headers["user-agent"] || null,
        language: req.headers["accept-language"]?.split(",")[0] || null,
        page: "/tools/price-calculator",
        referrer: req.headers["referer"] || null,
        metadata: JSON.stringify({ income, country, activity: activity || null, savings: savings || 0 })
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Calculator consultation error:", error);
      res.status(500).json({ message: "Error saving consultation" });
    }
  });
  app2.get("/api/admin/calculator-consultations", isAdmin, async (req, res) => {
    try {
      const consultations = await db.select().from(calculatorConsultations).orderBy((0, import_drizzle_orm16.desc)(calculatorConsultations.createdAt));
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching consultations" });
    }
  });
  app2.patch("/api/admin/calculator-consultations/:id/read", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await db.update(calculatorConsultations).set({ isRead: true }).where((0, import_drizzle_orm16.eq)(calculatorConsultations.id, parseInt(id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error marking as read" });
    }
  });
  app2.post("/api/guest/track", async (req, res) => {
    try {
      const data = import_zod4.z.object({
        email: import_zod4.z.string().email().optional(),
        source: import_zod4.z.string().min(1),
        page: import_zod4.z.string().optional(),
        metadata: import_zod4.z.string().optional()
      }).parse(req.body);
      await storage.createGuestVisitor({
        email: data.email || null,
        source: data.source,
        ip: getClientIp(req),
        userAgent: req.headers["user-agent"] || null,
        language: req.headers["accept-language"]?.split(",")[0] || null,
        page: data.page || null,
        referrer: req.headers["referer"] || null,
        metadata: data.metadata || null
      });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Invalid tracking data" });
    }
  });
  app2.get("/api/admin/guests", isAdmin, async (req, res) => {
    try {
      const guests = await storage.getAllGuestVisitors();
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching guests" });
    }
  });
  app2.get("/api/admin/guests/stats", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getGuestVisitorStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching guest stats" });
    }
  });
  app2.delete("/api/admin/guests/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteGuestVisitor(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting guest" });
    }
  });
  app2.delete("/api/admin/guests/email/:email", isAdmin, async (req, res) => {
    try {
      const count = await storage.deleteGuestVisitorsByEmail(decodeURIComponent(req.params.email));
      res.json({ success: true, deleted: count });
    } catch (error) {
      res.status(500).json({ message: "Error deleting guest records" });
    }
  });
  app2.delete("/api/admin/calculator-consultations/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(calculatorConsultations).where((0, import_drizzle_orm16.eq)(calculatorConsultations.id, parseInt(id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting consultation" });
    }
  });
  app2.get("/api/admin/calculator-consultations/unread-count", isAdmin, async (req, res) => {
    try {
      const [result] = await db.select({ count: import_drizzle_orm16.sql`count(*)` }).from(calculatorConsultations).where((0, import_drizzle_orm16.eq)(calculatorConsultations.isRead, false));
      res.json({ count: result?.count || 0 });
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  });
  app2.post("/api/admin/newsletter/broadcast", isAdmin, asyncHandler(async (req, res) => {
    const { subject, message } = import_zod4.z.object({
      subject: import_zod4.z.string().min(1),
      message: import_zod4.z.string().min(1)
    }).parse(req.body);
    const subscribers = await db.select().from(newsletterSubscribers);
    const html = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f7f7f5;">
        <div style="background: white; padding: 32px; border-radius: 16px;">
          <h1 style="font-size: 24px; font-weight: 900; color: #0A0A0A; margin: 0 0 24px 0;">${subject}</h1>
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
  app2.get("/api/admin/messages", isAdminOrSupport, async (req, res) => {
    try {
      const allMessages = await storage.getAllMessages();
      res.json(allMessages);
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  });
  app2.patch("/api/admin/messages/:id/archive", isAdminOrSupport, async (req, res) => {
    try {
      const updated = await storage.updateMessageStatus(Number(req.params.id), "archived");
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error archiving message" });
    }
  });
  app2.delete("/api/admin/messages/:id", isAdmin, async (req, res) => {
    try {
      const msgId = Number(req.params.id);
      await db.delete(messageReplies).where((0, import_drizzle_orm16.eq)(messageReplies.messageId, msgId));
      await db.delete(messages).where((0, import_drizzle_orm16.eq)(messages.id, msgId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting message" });
    }
  });
}

// server/routes/admin-documents.ts
var import_zod5 = require("zod");
var import_drizzle_orm17 = require("drizzle-orm");
init_schema();
init_email();
init_calendar_service();
var MAX_FILE_SIZE_MB = 5;
var MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
function registerAdminDocumentsRoutes(app2) {
  app2.post("/api/admin/documents", isAdminOrSupport, async (req, res) => {
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
  app2.post("/api/admin/documents/upload", isAdminOrSupport, async (req, res) => {
    try {
      const busboy = (await import("busboy")).default;
      const bb = busboy({
        headers: req.headers,
        limits: { fileSize: MAX_FILE_SIZE_BYTES }
      });
      let fileName = "";
      let fileBuffer = null;
      let fileTruncated = false;
      let documentType = "other";
      let orderId = "";
      let targetUserId = "";
      bb.on("field", (name, val) => {
        if (name === "documentType") documentType = val;
        if (name === "orderId") orderId = val;
        if (name === "userId") targetUserId = val;
      });
      const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];
      const ALLOWED_MIMES = ["application/pdf", "image/jpeg", "image/png"];
      let detectedMime = "";
      bb.on("file", (name, file, info) => {
        fileName = info.filename || `documento_${Date.now()}`;
        detectedMime = info.mimeType || "";
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
          return res.status(413).json({ message: `File exceeds the ${MAX_FILE_SIZE_MB}MB size limit` });
        }
        if (!fileBuffer || !orderId && !targetUserId) {
          return res.status(400).json({ message: "Missing required data (orderId or userId)" });
        }
        const extCheck = fileName.toLowerCase().split(".").pop() || "";
        if (!ALLOWED_EXTENSIONS.includes(extCheck)) {
          return res.status(400).json({ message: "File type not allowed. Only accepted: PDF, JPG, JPEG, PNG" });
        }
        if (!ALLOWED_MIMES.includes(detectedMime)) {
          return res.status(400).json({ message: "Invalid file format" });
        }
        const fs6 = await import("fs/promises");
        const path7 = await import("path");
        const uploadDir = path7.join(process.cwd(), "uploads", "admin-docs");
        await fs6.mkdir(uploadDir, { recursive: true });
        const identifier = orderId || targetUserId;
        const safeFileName = `admin_${identifier}_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const filePath = path7.join(uploadDir, safeFileName);
        await fs6.writeFile(filePath, fileBuffer);
        const ext = fileName.toLowerCase().split(".").pop() || "";
        const mimeTypes = {
          "pdf": "application/pdf",
          "jpg": "image/jpeg",
          "jpeg": "image/jpeg",
          "png": "image/png"
        };
        const fileType = mimeTypes[ext] || "application/octet-stream";
        const docTypeLabels = {
          "articles_of_organization": "Art\xEDculos de Organizaci\xF3n",
          "certificate_of_formation": "Certificado de Formaci\xF3n",
          "boir": "BOIR",
          "ein_document": "Documento EIN",
          "operating_agreement": "Acuerdo Operativo",
          "invoice": "Factura",
          "other": "Otro Documento"
        };
        let finalUserId = targetUserId;
        let applicationId = null;
        let orderCode = "";
        if (orderId) {
          const [llcApp] = await db.select().from(llcApplications).where((0, import_drizzle_orm17.eq)(llcApplications.orderId, Number(orderId))).limit(1);
          applicationId = llcApp?.id || null;
          const [order] = await db.select().from(orders).where((0, import_drizzle_orm17.eq)(orders.id, Number(orderId))).limit(1);
          if (order?.userId) {
            finalUserId = order.userId;
            orderCode = llcApp?.requestCode || order.invoiceNumber || `#${order.id}`;
          }
        }
        const [doc] = await db.insert(applicationDocuments).values({
          orderId: orderId ? Number(orderId) : null,
          applicationId,
          userId: finalUserId || null,
          fileName: docTypeLabels[documentType] || fileName,
          fileType,
          fileUrl: `/uploads/admin-docs/${safeFileName}`,
          documentType,
          reviewStatus: "approved",
          uploadedBy: req.session.userId
        }).returning();
        if (finalUserId) {
          const docLabel = docTypeLabels[documentType] || "Documento";
          const docTypeKey = documentType && ["articles_of_organization", "certificate_of_formation", "boir", "ein_document", "operating_agreement", "invoice", "other"].includes(documentType) ? `@ntf.docTypes.${documentType}` : docLabel;
          await db.insert(userNotifications).values({
            userId: finalUserId,
            orderId: orderId ? Number(orderId) : null,
            orderCode: orderCode || "General",
            title: "i18n:ntf.docUploaded.title",
            message: `i18n:ntf.docUploaded.message::{"docName":"${docTypeKey}"}`,
            type: "info",
            isRead: false
          });
          const [user] = await db.select().from(users).where((0, import_drizzle_orm17.eq)(users.id, finalUserId)).limit(1);
          if (user?.email) {
            const docLang = user.preferredLanguage || "es";
            const docSubjects = { en: "New document available", ca: "Nou document disponible", fr: "Nouveau document disponible", de: "Neues Dokument verf\xFCgbar", it: "Nuovo documento disponibile", pt: "Novo documento dispon\xEDvel" };
            sendEmail({
              to: user.email,
              subject: `${docSubjects[docLang] || "Nuevo documento disponible"}${orderCode ? ` - ${orderCode}` : ""}`,
              html: getDocumentUploadedTemplate(user.firstName || "", docLabel, orderCode || "", docLang)
            }).catch(() => {
            });
          }
        }
        res.json(doc);
      });
      req.pipe(bb);
    } catch (error) {
      console.error("Admin upload doc error:", error);
      res.status(500).json({ message: "Error uploading document" });
    }
  });
  app2.get("/api/admin/documents", isAdminOrSupport, async (req, res) => {
    try {
      const docs = await db.select().from(applicationDocuments).leftJoin(orders, (0, import_drizzle_orm17.eq)(applicationDocuments.orderId, orders.id)).leftJoin(users, (0, import_drizzle_orm17.eq)(orders.userId, users.id)).leftJoin(llcApplications, (0, import_drizzle_orm17.eq)(applicationDocuments.applicationId, llcApplications.id)).orderBy((0, import_drizzle_orm17.desc)(applicationDocuments.uploadedAt));
      res.json(docs.map((d) => ({
        ...d.application_documents,
        order: d.orders,
        user: d.users ? { id: d.users.id, firstName: d.users.firstName, lastName: d.users.lastName, email: d.users.email } : null,
        application: d.llc_applications ? { companyName: d.llc_applications.companyName, state: d.llc_applications.state } : null
      })));
    } catch (error) {
      console.error("Admin documents error:", error);
      res.status(500).json({ message: "Error fetching documents" });
    }
  });
  app2.patch("/api/admin/documents/:id/review", isAdminOrSupport, async (req, res) => {
    try {
      const docId = Number(req.params.id);
      const { reviewStatus, rejectionReason } = import_zod5.z.object({
        reviewStatus: import_zod5.z.enum(["pending", "approved", "rejected", "action_required"]),
        rejectionReason: import_zod5.z.string().optional()
      }).parse(req.body);
      const [updated] = await db.update(applicationDocuments).set({ reviewStatus }).where((0, import_drizzle_orm17.eq)(applicationDocuments.id, docId)).returning();
      const [docWithOrder] = await db.select({
        doc: applicationDocuments,
        order: orders,
        user: users
      }).from(applicationDocuments).leftJoin(orders, (0, import_drizzle_orm17.eq)(applicationDocuments.orderId, orders.id)).leftJoin(users, (0, import_drizzle_orm17.eq)(orders.userId, users.id)).where((0, import_drizzle_orm17.eq)(applicationDocuments.id, docId)).limit(1);
      if (docWithOrder?.user) {
        const docTypeLabels = {
          "id_document": "Documento de identidad",
          "proof_of_address": "Comprobante de domicilio",
          "passport": "Pasaporte",
          "ein_letter": "Carta EIN",
          "articles_of_organization": "Art\xEDculos de Organizaci\xF3n",
          "operating_agreement": "Acuerdo Operativo",
          "invoice": "Factura",
          "other": "Otro documento"
        };
        const docLabel = docTypeLabels[docWithOrder.doc.documentType] || docWithOrder.doc.fileName;
        if (reviewStatus === "approved") {
          const approvedDocKey = docWithOrder.doc.documentType && ["id_document", "proof_of_address", "passport", "ein_letter", "articles_of_organization", "operating_agreement", "invoice", "other"].includes(docWithOrder.doc.documentType) ? `@ntf.docTypes.${docWithOrder.doc.documentType}` : docLabel;
          await db.insert(userNotifications).values({
            userId: docWithOrder.user.id,
            orderId: docWithOrder.order?.id || null,
            orderCode: docWithOrder.order?.invoiceNumber || "General",
            title: "i18n:ntf.docApproved.title",
            message: `i18n:ntf.docApproved.message::{"docType":"${approvedDocKey}"}`,
            type: "success",
            isRead: false
          });
          const userLang = docWithOrder.user.preferredLanguage || "es";
          const approvedSubjects = { en: "Document approved", ca: "Document aprovat", fr: "Document approuv\xE9", de: "Dokument genehmigt", it: "Documento approvato", pt: "Documento aprovado" };
          sendEmail({
            to: docWithOrder.user.email,
            subject: `${approvedSubjects[userLang] || "Documento aprobado"} - ${docLabel}`,
            html: getDocumentApprovedTemplate(
              docWithOrder.user.firstName || "",
              docLabel,
              userLang
            )
          }).catch(console.error);
        } else if (reviewStatus === "rejected") {
          const reason = rejectionReason || "No cumple los requisitos necesarios";
          const rejectedDocKey = docWithOrder.doc.documentType && ["id_document", "proof_of_address", "passport", "ein_letter", "articles_of_organization", "operating_agreement", "invoice", "other"].includes(docWithOrder.doc.documentType) ? `@ntf.docTypes.${docWithOrder.doc.documentType}` : docLabel;
          const safeReason = reason.replace(/"/g, '\\"').replace(/\n/g, " ");
          await db.insert(userNotifications).values({
            userId: docWithOrder.user.id,
            orderId: docWithOrder.order?.id || null,
            orderCode: docWithOrder.order?.invoiceNumber || "General",
            title: "i18n:ntf.docRejected.title",
            message: `i18n:ntf.docRejected.message::{"docType":"${rejectedDocKey}","reason":"${safeReason}"}`,
            type: "action_required",
            isRead: false
          });
          const rejLang = docWithOrder.user.preferredLanguage || "es";
          const rejSubjects = { en: "Action required - Document rejected", ca: "Acci\xF3 requerida - Document rebutjat", fr: "Action requise - Document rejet\xE9", de: "Handlung erforderlich - Dokument abgelehnt", it: "Azione richiesta - Documento rifiutato", pt: "A\xE7\xE3o necess\xE1ria - Documento rejeitado" };
          sendEmail({
            to: docWithOrder.user.email,
            subject: rejSubjects[rejLang] || "Acci\xF3n requerida - Documento rechazado",
            html: getDocumentRejectedTemplate(
              docWithOrder.user.firstName || "",
              docLabel,
              reason,
              rejLang
            )
          }).catch(console.error);
        }
      }
      res.json(updated);
    } catch (error) {
      console.error("Document review error:", error);
      res.status(500).json({ message: "Error updating document review status" });
    }
  });
  app2.delete("/api/admin/documents/:id", isAdmin, async (req, res) => {
    try {
      const docId = Number(req.params.id);
      await db.delete(applicationDocuments).where((0, import_drizzle_orm17.eq)(applicationDocuments.id, docId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting document" });
    }
  });
  app2.post("/api/admin/applications/:id/set-formation-date", isAdmin, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { formationDate, state } = import_zod5.z.object({
        formationDate: import_zod5.z.string(),
        state: import_zod5.z.string().optional()
      }).parse(req.body);
      const [app3] = await db.select().from(llcApplications).where((0, import_drizzle_orm17.eq)(llcApplications.id, applicationId)).limit(1);
      if (!app3) {
        return res.status(404).json({ message: "Application not found" });
      }
      const deadlines = await updateApplicationDeadlines(
        applicationId,
        new Date(formationDate),
        state || app3.state || "new_mexico",
        app3.hasTaxExtension || false
      );
      res.json({
        success: true,
        message: "Fechas de cumplimiento calculadas exitosamente",
        deadlines
      });
    } catch (error) {
      console.error("Error setting formation date:", error);
      res.status(500).json({ message: "Error setting formation date" });
    }
  });
  app2.post("/api/admin/send-note", isAdmin, async (req, res) => {
    try {
      const { userId, title, message, type } = import_zod5.z.object({
        userId: import_zod5.z.string(),
        title: import_zod5.z.string().min(1, "Title required"),
        message: import_zod5.z.string().min(1, "Mensaje requerido"),
        type: import_zod5.z.enum(["update", "info", "action_required"])
      }).parse(req.body);
      const [user] = await db.select().from(users).where((0, import_drizzle_orm17.eq)(users.id, userId)).limit(1);
      if (!user) return res.status(404).json({ message: "User not found" });
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
          html: getAdminNoteTemplate(user.firstName || "Cliente", `${title}: ${message}`, ticketId, user.preferredLanguage || "es")
        });
      }
      res.json({ success: true, emailSent: !!user.email, ticketId });
    } catch (error) {
      console.error("Error sending note:", error);
      res.status(500).json({ message: "Error sending note" });
    }
  });
  app2.post("/api/admin/send-payment-link", isAdmin, async (req, res) => {
    try {
      const { userId, paymentLink, message, amount } = import_zod5.z.object({
        userId: import_zod5.z.string(),
        paymentLink: import_zod5.z.string().url(),
        message: import_zod5.z.string(),
        amount: import_zod5.z.string().optional()
      }).parse(req.body);
      const [user] = await db.select().from(users).where((0, import_drizzle_orm17.eq)(users.id, userId)).limit(1);
      if (!user || !user.email) return res.status(404).json({ message: "User or email not found" });
      const payLang = user.preferredLanguage || "es";
      await sendEmail({
        to: user.email,
        subject: payLang === "en" ? "Payment pending - Easy US LLC" : payLang === "ca" ? "Pagament pendent - Easy US LLC" : payLang === "fr" ? "Paiement en attente - Easy US LLC" : payLang === "de" ? "Zahlung ausstehend - Easy US LLC" : payLang === "it" ? "Pagamento in sospeso - Easy US LLC" : payLang === "pt" ? "Pagamento pendente - Easy US LLC" : "Pago pendiente - Easy US LLC",
        html: getPaymentRequestTemplate(user.firstName || "", amount || "", paymentLink, message, payLang)
      });
      await db.insert(userNotifications).values({
        userId,
        title: "i18n:ntf.paymentRequested.title",
        message: `i18n:ntf.paymentRequested.message::{"amount":"${amount || ""}"}`,
        type: "action_required",
        isRead: false
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Send payment link error:", error);
      res.status(500).json({ message: "Error sending payment link" });
    }
  });
  app2.post("/api/admin/request-document", isAdminOrSupport, async (req, res) => {
    try {
      const { email, documentType, message, userId } = import_zod5.z.object({
        email: import_zod5.z.string().email(),
        documentType: import_zod5.z.string(),
        message: import_zod5.z.string(),
        userId: import_zod5.z.string().optional()
      }).parse(req.body);
      const { generateDocRequestId: generateDocRequestId2 } = await Promise.resolve().then(() => (init_id_generator(), id_generator_exports));
      const msgId = generateDocRequestId2();
      const docTypeLabels = {
        "passport": "Pasaporte / Documento de Identidad",
        "address_proof": "Comprobante de Domicilio",
        "tax_id": "Identificaci\xF3n Fiscal",
        "other": "Otro Documento"
      };
      const docTypeLabel = docTypeLabels[documentType] || documentType;
      const [reqUser] = userId ? await db.select().from(users).where((0, import_drizzle_orm17.eq)(users.id, userId)).limit(1) : [null];
      const reqLang = reqUser?.preferredLanguage || "es";
      const reqSubjects = { en: "Action Required: Documentation Request", ca: "Acci\xF3 Requerida: Sol\xB7licitud de Documentaci\xF3", fr: "Action Requise : Demande de Documentation", de: "Handlung Erforderlich: Dokumentationsanfrage", it: "Azione Richiesta: Richiesta di Documentazione", pt: "A\xE7\xE3o Necess\xE1ria: Solicita\xE7\xE3o de Documenta\xE7\xE3o" };
      await sendEmail({
        to: email,
        subject: reqSubjects[reqLang] || "Acci\xF3n Requerida: Solicitud de Documentaci\xF3n",
        html: getDocumentRequestTemplate(reqUser?.firstName || "", docTypeLabel, message, msgId, reqLang)
      });
      if (userId) {
        const reqDocKey = documentType && ["passport", "address_proof", "tax_id", "other"].includes(documentType) ? `@ntf.docTypes.${documentType === "passport" ? "passport_id" : documentType}` : docTypeLabel;
        await db.insert(userNotifications).values({
          userId,
          title: "i18n:ntf.docRequested.title",
          message: `i18n:ntf.docRequested.message::{"docType":"${reqDocKey}"}`,
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
      res.status(500).json({ message: "Error requesting document" });
    }
  });
  app2.get("/api/admin/invoice/:id", isAdmin, async (req, res) => {
    const orderId = Number(req.params.id);
    const order = await storage.getOrder(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.setHeader("Content-Type", "text/html");
    res.send(generateInvoiceHtml(order));
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
        const [user] = await db.select().from(users).where((0, import_drizzle_orm17.eq)(users.id, order.userId)).limit(1);
        if (user?.email) {
          const evtLang = user.preferredLanguage || "es";
          sendEmail({
            to: user.email,
            subject: evtLang === "en" ? "Update on your order" : evtLang === "ca" ? "Actualitzaci\xF3 del teu pedido" : evtLang === "fr" ? "Mise \xE0 jour de votre commande" : evtLang === "de" ? "Aktualisierung Ihrer Bestellung" : evtLang === "it" ? "Aggiornamento del tuo ordine" : evtLang === "pt" ? "Atualiza\xE7\xE3o do seu pedido" : "Actualizaci\xF3n de tu pedido",
            html: getOrderEventTemplate(user.firstName || "", String(orderId), eventType, description, evtLang)
          }).catch(() => {
          });
        }
      }
      res.json(event);
    } catch (error) {
      console.error("Error creating order event:", error);
      res.status(500).json({ message: "Error creating event" });
    }
  });
  app2.post("/api/admin/orders/:id/generate-invoice", isAdmin, async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const [order] = await db.select().from(orders).where((0, import_drizzle_orm17.eq)(orders.id, orderId)).limit(1);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const updateData = { isInvoiceGenerated: true };
      if (req.body.amount) updateData.amount = req.body.amount;
      if (req.body.currency) updateData.currency = req.body.currency;
      const [updatedOrder] = await db.update(orders).set(updateData).where((0, import_drizzle_orm17.eq)(orders.id, orderId)).returning();
      const [llcAppInv] = await db.select().from(llcApplications).where((0, import_drizzle_orm17.eq)(llcApplications.orderId, orderId)).limit(1);
      const [maintAppInv] = await db.select().from(maintenanceApplications).where((0, import_drizzle_orm17.eq)(maintenanceApplications.orderId, orderId)).limit(1);
      const displayInvoiceNumber = llcAppInv?.requestCode || maintAppInv?.requestCode || order.invoiceNumber;
      const existingDoc = await db.select().from(applicationDocuments).where((0, import_drizzle_orm17.and)((0, import_drizzle_orm17.eq)(applicationDocuments.orderId, orderId), (0, import_drizzle_orm17.eq)(applicationDocuments.documentType, "invoice"))).limit(1);
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
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; color: #0A0A0A; line-height: 1.6; background: #fff; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 3px solid #6EDC8A; }
            .logo-section h1 { font-size: 28px; font-weight: 900; letter-spacing: -0.02em; }
            .logo-section .subtitle { color: #6B7280; font-size: 13px; margin-top: 4px; }
            .invoice-info { text-align: right; }
            .invoice-badge { background: linear-gradient(135deg, #6EDC8A 0%, #4eca70 100%); color: #0A0A0A; padding: 10px 20px; border-radius: 100px; font-weight: 900; font-size: 13px; display: inline-block; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
            .invoice-number { font-size: 20px; font-weight: 800; color: #0A0A0A; }
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
            .totals-row.final { border-top: 2px solid #0A0A0A; padding-top: 15px; margin-top: 15px; margin-bottom: 0; }
            .totals-row.final .label { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280; }
            .totals-row.final .amount { font-size: 28px; font-weight: 900; color: #0A0A0A; }
            .footer { text-align: center; padding-top: 30px; border-top: 1px solid #E6E9EC; font-size: 12px; color: #6B7280; }
            .footer p { margin-bottom: 4px; }
            .print-controls { text-align: center; margin-bottom: 30px; }
            .print-btn { background: #6EDC8A; color: #0A0A0A; padding: 14px 35px; border: none; border-radius: 100px; font-weight: 800; cursor: pointer; font-size: 14px; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 15px rgba(110, 220, 138, 0.3); }
            .print-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(110, 220, 138, 0.4); }
          </style>
        </head>
        <body>
          <div class="print-controls no-print">
            <button class="print-btn" onclick="window.print()">Imprimir / Descargar PDF</button>
          </div>
          
          <div class="header">
            <div class="logo-section">
              <img src="cid:logo-icon" alt="Easy US LLC" style="width: 60px; height: 60px; margin-bottom: 10px; border-radius: 12px;">
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
}

// server/routes/consultations.ts
var import_zod6 = require("zod");
init_schema();
var import_drizzle_orm18 = require("drizzle-orm");
function registerConsultationRoutes(app2) {
  app2.get("/api/consultations/types", async (req, res) => {
    try {
      const types = await db.select().from(consultationTypes).where((0, import_drizzle_orm18.eq)(consultationTypes.isActive, true));
      res.json(types);
    } catch (err) {
      console.error("Error fetching consultation types:", err);
      res.status(500).json({ message: "Error fetching consultation types" });
    }
  });
  app2.get("/api/consultations/availability", async (req, res) => {
    try {
      const date = req.query.date;
      if (!date) return res.status(400).json({ message: "Date parameter required" });
      const targetDate = new Date(date);
      const dayOfWeek = targetDate.getDay();
      const blocked = await db.select().from(consultationBlockedDates).where(import_drizzle_orm18.sql`DATE(${consultationBlockedDates.date}) = DATE(${targetDate})`);
      if (blocked.length > 0) {
        return res.json({ available: false, slots: [], reason: "blocked" });
      }
      const slots = await db.select().from(consultationAvailability).where((0, import_drizzle_orm18.and)(
        (0, import_drizzle_orm18.eq)(consultationAvailability.dayOfWeek, dayOfWeek),
        (0, import_drizzle_orm18.eq)(consultationAvailability.isActive, true)
      ));
      const existingBookings = await db.select({
        scheduledTime: consultationBookings.scheduledTime,
        status: consultationBookings.status
      }).from(consultationBookings).where((0, import_drizzle_orm18.and)(
        import_drizzle_orm18.sql`DATE(${consultationBookings.scheduledDate}) = DATE(${targetDate})`,
        (0, import_drizzle_orm18.inArray)(consultationBookings.status, ["pending", "confirmed"])
      ));
      const bookedTimes = new Set(existingBookings.map((b) => b.scheduledTime));
      const availableSlots = slots.filter((slot) => !bookedTimes.has(slot.startTime));
      res.json({
        available: availableSlots.length > 0,
        slots: availableSlots.map((s) => ({ startTime: s.startTime, endTime: s.endTime }))
      });
    } catch (err) {
      console.error("Error fetching availability:", err);
      res.status(500).json({ message: "Error fetching availability" });
    }
  });
  app2.post("/api/consultations/book", isAuthenticated, async (req, res) => {
    try {
      const [user] = await db.select().from(users).where((0, import_drizzle_orm18.eq)(users.id, req.session.userId)).limit(1);
      if (!user) return res.status(401).json({ message: "User not found" });
      if (user.accountStatus === "deactivated") {
        return res.status(403).json({ message: "Your account is deactivated" });
      }
      const schema = import_zod6.z.object({
        consultationTypeId: import_zod6.z.number(),
        scheduledDate: import_zod6.z.string(),
        scheduledTime: import_zod6.z.string(),
        hasLlc: import_zod6.z.string().optional(),
        llcState: import_zod6.z.string().optional(),
        estimatedRevenue: import_zod6.z.string().optional(),
        countryOfResidence: import_zod6.z.string().optional(),
        mainTopic: import_zod6.z.string().optional(),
        additionalNotes: import_zod6.z.string().optional()
      });
      const data = schema.parse(req.body);
      const [consultationType] = await db.select().from(consultationTypes).where((0, import_drizzle_orm18.eq)(consultationTypes.id, data.consultationTypeId));
      if (!consultationType || !consultationType.isActive) {
        return res.status(400).json({ message: "Invalid consultation type" });
      }
      const scheduledDate = new Date(data.scheduledDate);
      const dayOfWeek = scheduledDate.getDay();
      const [slot] = await db.select().from(consultationAvailability).where((0, import_drizzle_orm18.and)(
        (0, import_drizzle_orm18.eq)(consultationAvailability.dayOfWeek, dayOfWeek),
        (0, import_drizzle_orm18.eq)(consultationAvailability.startTime, data.scheduledTime),
        (0, import_drizzle_orm18.eq)(consultationAvailability.isActive, true)
      ));
      if (!slot) {
        return res.status(400).json({ message: "Schedule not available" });
      }
      const [existingBooking] = await db.select().from(consultationBookings).where((0, import_drizzle_orm18.and)(
        import_drizzle_orm18.sql`DATE(${consultationBookings.scheduledDate}) = DATE(${scheduledDate})`,
        (0, import_drizzle_orm18.eq)(consultationBookings.scheduledTime, data.scheduledTime),
        (0, import_drizzle_orm18.inArray)(consultationBookings.status, ["pending", "confirmed"])
      ));
      if (existingBooking) {
        return res.status(400).json({ message: "This schedule is already booked" });
      }
      const { generateUniqueBookingCode: generateUniqueBookingCode2 } = await Promise.resolve().then(() => (init_id_generator(), id_generator_exports));
      const bookingCode = await generateUniqueBookingCode2();
      const [booking] = await db.insert(consultationBookings).values({
        bookingCode,
        userId: user.id,
        consultationTypeId: data.consultationTypeId,
        scheduledDate,
        scheduledTime: data.scheduledTime,
        duration: consultationType.duration,
        status: "pending",
        hasLlc: data.hasLlc,
        llcState: data.llcState,
        estimatedRevenue: data.estimatedRevenue,
        countryOfResidence: data.countryOfResidence,
        mainTopic: data.mainTopic,
        additionalNotes: data.additionalNotes
      }).returning();
      logAudit({
        action: "consultation_booked",
        userId: user.id,
        targetId: booking.id.toString(),
        ip: getClientIp(req),
        userAgent: req.headers["user-agent"],
        details: {
          bookingCode,
          consultationType: consultationType.name,
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime
        }
      });
      res.json({ success: true, booking });
    } catch (err) {
      console.error("Error creating booking:", err);
      if (err.errors) {
        return res.status(400).json({ message: err.errors[0]?.message || "Error creating booking" });
      }
      res.status(500).json({ message: "Error creating the booking" });
    }
  });
  app2.get("/api/consultations/my", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const bookings = await db.select({
        booking: consultationBookings,
        consultationType: consultationTypes
      }).from(consultationBookings).innerJoin(consultationTypes, (0, import_drizzle_orm18.eq)(consultationBookings.consultationTypeId, consultationTypes.id)).where((0, import_drizzle_orm18.eq)(consultationBookings.userId, userId)).orderBy((0, import_drizzle_orm18.desc)(consultationBookings.scheduledDate));
      res.json(bookings);
    } catch (err) {
      console.error("Error fetching user consultations:", err);
      res.status(500).json({ message: "Error fetching consultations" });
    }
  });
  app2.patch("/api/consultations/:id/cancel", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const bookingId = parseInt(req.params.id);
      const [booking] = await db.select().from(consultationBookings).where((0, import_drizzle_orm18.and)(
        (0, import_drizzle_orm18.eq)(consultationBookings.id, bookingId),
        (0, import_drizzle_orm18.eq)(consultationBookings.userId, userId)
      ));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      if (!["pending", "confirmed"].includes(booking.status)) {
        return res.status(400).json({ message: "Cannot cancel this booking" });
      }
      await db.update(consultationBookings).set({
        status: "cancelled",
        cancelledAt: /* @__PURE__ */ new Date(),
        cancelReason: req.body.reason || "Cancelled by user",
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm18.eq)(consultationBookings.id, bookingId));
      logAudit({
        action: "consultation_cancelled",
        userId,
        targetId: bookingId.toString(),
        ip: getClientIp(req),
        userAgent: req.headers["user-agent"],
        details: { bookingCode: booking.bookingCode }
      });
      res.json({ success: true });
    } catch (err) {
      console.error("Error cancelling booking:", err);
      res.status(500).json({ message: "Error canceling booking" });
    }
  });
  app2.get("/api/admin/consultations/types", isAdmin, async (req, res) => {
    try {
      const types = await db.select().from(consultationTypes).orderBy((0, import_drizzle_orm18.desc)(consultationTypes.createdAt));
      res.json(types);
    } catch (err) {
      console.error("Error fetching consultation types:", err);
      res.status(500).json({ message: "Error fetching consultation types" });
    }
  });
  app2.post("/api/admin/consultations/types", isAdmin, async (req, res) => {
    try {
      const schema = import_zod6.z.object({
        name: import_zod6.z.string().min(1),
        nameEs: import_zod6.z.string().min(1),
        nameEn: import_zod6.z.string().min(1),
        nameCa: import_zod6.z.string().min(1),
        description: import_zod6.z.string().optional(),
        descriptionEs: import_zod6.z.string().optional(),
        descriptionEn: import_zod6.z.string().optional(),
        descriptionCa: import_zod6.z.string().optional(),
        duration: import_zod6.z.number().min(15).max(180),
        price: import_zod6.z.number().min(0),
        isActive: import_zod6.z.boolean().optional()
      });
      const data = schema.parse(req.body);
      const [type] = await db.insert(consultationTypes).values(data).returning();
      logAudit({
        action: "consultation_type_created",
        userId: req.session.userId,
        targetId: type.id.toString(),
        ip: getClientIp(req),
        userAgent: req.headers["user-agent"],
        details: { name: data.name }
      });
      res.json(type);
    } catch (err) {
      console.error("Error creating consultation type:", err);
      res.status(400).json({ message: err.errors?.[0]?.message || "Error creating consultation type" });
    }
  });
  app2.patch("/api/admin/consultations/types/:id", isAdmin, async (req, res) => {
    try {
      const typeId = parseInt(req.params.id);
      const [updated] = await db.update(consultationTypes).set(req.body).where((0, import_drizzle_orm18.eq)(consultationTypes.id, typeId)).returning();
      if (!updated) {
        return res.status(404).json({ message: "Type not found" });
      }
      res.json(updated);
    } catch (err) {
      console.error("Error updating consultation type:", err);
      res.status(500).json({ message: "Error updating type" });
    }
  });
  app2.delete("/api/admin/consultations/types/:id", isAdmin, async (req, res) => {
    try {
      const typeId = parseInt(req.params.id);
      await db.delete(consultationTypes).where((0, import_drizzle_orm18.eq)(consultationTypes.id, typeId));
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting consultation type:", err);
      res.status(500).json({ message: "Error deleting type" });
    }
  });
  app2.get("/api/admin/consultations/availability", isAdmin, async (req, res) => {
    try {
      const slots = await db.select().from(consultationAvailability).orderBy(consultationAvailability.dayOfWeek, consultationAvailability.startTime);
      res.json(slots);
    } catch (err) {
      console.error("Error fetching availability:", err);
      res.status(500).json({ message: "Error fetching availability" });
    }
  });
  app2.post("/api/admin/consultations/availability", isAdmin, async (req, res) => {
    try {
      const schema = import_zod6.z.object({
        dayOfWeek: import_zod6.z.number().min(0).max(6),
        startTime: import_zod6.z.string().regex(/^\d{2}:\d{2}$/),
        endTime: import_zod6.z.string().regex(/^\d{2}:\d{2}$/),
        isActive: import_zod6.z.boolean().optional()
      });
      const data = schema.parse(req.body);
      const [slot] = await db.insert(consultationAvailability).values(data).returning();
      res.json(slot);
    } catch (err) {
      console.error("Error creating availability slot:", err);
      res.status(400).json({ message: err.errors?.[0]?.message || "Error creating schedule" });
    }
  });
  app2.patch("/api/admin/consultations/availability/:id", isAdmin, async (req, res) => {
    try {
      const slotId = parseInt(req.params.id);
      const [updated] = await db.update(consultationAvailability).set(req.body).where((0, import_drizzle_orm18.eq)(consultationAvailability.id, slotId)).returning();
      res.json(updated);
    } catch (err) {
      console.error("Error updating availability:", err);
      res.status(500).json({ message: "Error updating schedule" });
    }
  });
  app2.delete("/api/admin/consultations/availability/:id", isAdmin, async (req, res) => {
    try {
      const slotId = parseInt(req.params.id);
      await db.delete(consultationAvailability).where((0, import_drizzle_orm18.eq)(consultationAvailability.id, slotId));
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting availability:", err);
      res.status(500).json({ message: "Error deleting schedule" });
    }
  });
  app2.get("/api/admin/consultations/blocked-dates", isAdmin, async (req, res) => {
    try {
      const dates = await db.select().from(consultationBlockedDates).orderBy((0, import_drizzle_orm18.desc)(consultationBlockedDates.date));
      res.json(dates);
    } catch (err) {
      console.error("Error fetching blocked dates:", err);
      res.status(500).json({ message: "Error fetching blocked dates" });
    }
  });
  app2.post("/api/admin/consultations/blocked-dates", isAdmin, async (req, res) => {
    try {
      const schema = import_zod6.z.object({
        date: import_zod6.z.string(),
        reason: import_zod6.z.string().optional()
      });
      const data = schema.parse(req.body);
      const [blocked] = await db.insert(consultationBlockedDates).values({
        date: new Date(data.date),
        reason: data.reason
      }).returning();
      res.json(blocked);
    } catch (err) {
      console.error("Error creating blocked date:", err);
      res.status(400).json({ message: err.errors?.[0]?.message || "Error blocking date" });
    }
  });
  app2.delete("/api/admin/consultations/blocked-dates/:id", isAdmin, async (req, res) => {
    try {
      const dateId = parseInt(req.params.id);
      await db.delete(consultationBlockedDates).where((0, import_drizzle_orm18.eq)(consultationBlockedDates.id, dateId));
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting blocked date:", err);
      res.status(500).json({ message: "Error deleting blocked date" });
    }
  });
  app2.get("/api/admin/consultations/bookings", isAdminOrSupport, async (req, res) => {
    try {
      const { status, from, to } = req.query;
      let query = db.select({
        booking: consultationBookings,
        consultationType: consultationTypes,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          clientId: users.clientId
        }
      }).from(consultationBookings).innerJoin(consultationTypes, (0, import_drizzle_orm18.eq)(consultationBookings.consultationTypeId, consultationTypes.id)).innerJoin(users, (0, import_drizzle_orm18.eq)(consultationBookings.userId, users.id)).orderBy((0, import_drizzle_orm18.desc)(consultationBookings.scheduledDate));
      const bookings = await query;
      res.json(bookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      res.status(500).json({ message: "Error fetching bookings" });
    }
  });
  app2.patch("/api/admin/consultations/bookings/:id", isAdminOrSupport, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { status, adminNotes, meetingLink } = req.body;
      const updateData = { updatedAt: /* @__PURE__ */ new Date() };
      if (status) {
        updateData.status = status;
        if (status === "confirmed") updateData.confirmedAt = /* @__PURE__ */ new Date();
        if (status === "completed") updateData.completedAt = /* @__PURE__ */ new Date();
        if (status === "cancelled") updateData.cancelledAt = /* @__PURE__ */ new Date();
      }
      if (adminNotes !== void 0) updateData.adminNotes = adminNotes;
      if (meetingLink !== void 0) updateData.meetingLink = meetingLink;
      const [updated] = await db.update(consultationBookings).set(updateData).where((0, import_drizzle_orm18.eq)(consultationBookings.id, bookingId)).returning();
      if (!updated) {
        return res.status(404).json({ message: "Booking not found" });
      }
      logAudit({
        action: "consultation_updated",
        userId: req.session.userId,
        targetId: bookingId.toString(),
        ip: getClientIp(req),
        userAgent: req.headers["user-agent"],
        details: { status, adminNotes, meetingLink }
      });
      res.json(updated);
    } catch (err) {
      console.error("Error updating booking:", err);
      res.status(500).json({ message: "Error updating booking" });
    }
  });
  app2.patch("/api/admin/consultations/bookings/:id/reschedule", isAdminOrSupport, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { scheduledDate, scheduledTime } = req.body;
      const newDate = new Date(scheduledDate);
      const [existingBooking] = await db.select().from(consultationBookings).where((0, import_drizzle_orm18.and)(
        import_drizzle_orm18.sql`DATE(${consultationBookings.scheduledDate}) = DATE(${newDate})`,
        (0, import_drizzle_orm18.eq)(consultationBookings.scheduledTime, scheduledTime),
        (0, import_drizzle_orm18.inArray)(consultationBookings.status, ["pending", "confirmed"])
      ));
      if (existingBooking && existingBooking.id !== bookingId) {
        return res.status(400).json({ message: "This schedule is already booked" });
      }
      const [updated] = await db.update(consultationBookings).set({
        scheduledDate: newDate,
        scheduledTime,
        status: "rescheduled",
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm18.eq)(consultationBookings.id, bookingId)).returning();
      logAudit({
        action: "consultation_rescheduled",
        userId: req.session.userId,
        targetId: bookingId.toString(),
        ip: getClientIp(req),
        userAgent: req.headers["user-agent"],
        details: { scheduledDate, scheduledTime }
      });
      res.json(updated);
    } catch (err) {
      console.error("Error rescheduling booking:", err);
      res.status(500).json({ message: "Error rescheduling booking" });
    }
  });
  app2.get("/api/admin/consultations/stats", isAdminOrSupport, async (req, res) => {
    try {
      const [pending] = await db.select({ count: import_drizzle_orm18.sql`count(*)` }).from(consultationBookings).where((0, import_drizzle_orm18.eq)(consultationBookings.status, "pending"));
      const [confirmed] = await db.select({ count: import_drizzle_orm18.sql`count(*)` }).from(consultationBookings).where((0, import_drizzle_orm18.eq)(consultationBookings.status, "confirmed"));
      const [completed] = await db.select({ count: import_drizzle_orm18.sql`count(*)` }).from(consultationBookings).where((0, import_drizzle_orm18.eq)(consultationBookings.status, "completed"));
      const [cancelled] = await db.select({ count: import_drizzle_orm18.sql`count(*)` }).from(consultationBookings).where((0, import_drizzle_orm18.eq)(consultationBookings.status, "cancelled"));
      res.json({
        pending: Number(pending?.count || 0),
        confirmed: Number(confirmed?.count || 0),
        completed: Number(completed?.count || 0),
        cancelled: Number(cancelled?.count || 0),
        total: Number(pending?.count || 0) + Number(confirmed?.count || 0) + Number(completed?.count || 0) + Number(cancelled?.count || 0)
      });
    } catch (err) {
      console.error("Error fetching consultation stats:", err);
      res.status(500).json({ message: "Error fetching statistics" });
    }
  });
}

// server/routes/user-profile.ts
var import_zod7 = require("zod");
var import_drizzle_orm19 = require("drizzle-orm");
init_schema();
init_email();
init_email_translations();
init_security();
init_calendar_service();
function registerUserProfileRoutes(app2) {
  app2.get("/api/user/completed-llcs", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const llcApps = await db.select({
        id: llcApplications.id,
        orderId: llcApplications.orderId,
        companyName: llcApplications.companyName,
        ein: llcApplications.ein,
        state: llcApplications.state,
        ownerFullName: llcApplications.ownerFullName,
        ownerEmail: llcApplications.ownerEmail,
        ownerPhone: llcApplications.ownerPhone,
        ownerIdNumber: llcApplications.ownerIdNumber,
        ownerIdType: llcApplications.ownerIdType,
        ownerAddress: llcApplications.ownerAddress,
        ownerCity: llcApplications.ownerCity,
        ownerCountry: llcApplications.ownerCountry,
        ownerProvince: llcApplications.ownerProvince,
        ownerPostalCode: llcApplications.ownerPostalCode,
        llcCreatedDate: llcApplications.llcCreatedDate,
        designator: llcApplications.designator
      }).from(llcApplications).innerJoin(orders, (0, import_drizzle_orm19.eq)(llcApplications.orderId, orders.id)).where((0, import_drizzle_orm19.and)(
        (0, import_drizzle_orm19.eq)(orders.userId, userId),
        (0, import_drizzle_orm19.eq)(orders.status, "completed")
      ));
      res.json(llcApps);
    } catch (error) {
      console.error("Error fetching completed LLCs:", error);
      res.status(500).json({ message: "Error fetching completed LLCs" });
    }
  });
  app2.post("/api/user/operating-agreements", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { llcApplicationId, pdfBase64, fileName } = req.body;
      if (!llcApplicationId || !pdfBase64 || !fileName) {
        return res.status(400).json({ message: "Incomplete data" });
      }
      const [llcApp] = await db.select({ orderId: llcApplications.orderId, ein: llcApplications.ein, companyName: llcApplications.companyName }).from(llcApplications).where((0, import_drizzle_orm19.eq)(llcApplications.id, llcApplicationId)).limit(1);
      if (!llcApp) {
        return res.status(404).json({ message: "Application not found" });
      }
      const [order] = await db.select().from(orders).where((0, import_drizzle_orm19.eq)(orders.id, llcApp.orderId)).limit(1);
      if (!order || order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (!llcApp.ein) {
        return res.status(400).json({ message: "Cannot generate without assigned EIN" });
      }
      const [doc] = await db.insert(applicationDocuments).values({
        orderId: llcApp.orderId,
        userId,
        fileName,
        fileType: "application/pdf",
        fileUrl: pdfBase64,
        documentType: "operating_agreement",
        reviewStatus: "approved",
        uploadedBy: userId
      }).returning();
      res.json({ success: true, documentId: doc.id });
    } catch (error) {
      console.error("Error saving Operating Agreement:", error);
      res.status(500).json({ message: "Error saving document" });
    }
  });
  app2.get("/api/user/documents", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const orderDocs = await db.select({
        doc: applicationDocuments,
        order: orders
      }).from(applicationDocuments).leftJoin(orders, (0, import_drizzle_orm19.eq)(applicationDocuments.orderId, orders.id)).where((0, import_drizzle_orm19.eq)(orders.userId, userId)).orderBy((0, import_drizzle_orm19.desc)(applicationDocuments.uploadedAt));
      const directDocs = await db.select().from(applicationDocuments).where((0, import_drizzle_orm19.eq)(applicationDocuments.userId, userId)).orderBy((0, import_drizzle_orm19.desc)(applicationDocuments.uploadedAt));
      const allDocs = [...orderDocs.map((d) => d.doc), ...directDocs];
      const uniqueDocs = allDocs.filter(
        (doc, index3, self) => index3 === self.findIndex((d) => d.id === doc.id)
      );
      const uploaderIds = Array.from(new Set(uniqueDocs.map((d) => d.uploadedBy).filter(Boolean)));
      const uploaderMap = /* @__PURE__ */ new Map();
      if (uploaderIds.length > 0) {
        const uploaders = await db.select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          isAdmin: users.isAdmin
        }).from(users).where((0, import_drizzle_orm19.inArray)(users.id, uploaderIds));
        uploaders.forEach((u) => uploaderMap.set(u.id, u));
      }
      const docsWithUploader = uniqueDocs.map((doc) => {
        const uploader = doc.uploadedBy ? uploaderMap.get(doc.uploadedBy) || null : null;
        const { encryptionIv, fileHash, ...safeFields } = doc;
        return { ...safeFields, fileUrl: doc.fileUrl ? `/api/user/documents/${doc.id}/download` : null, uploader };
      });
      res.json(docsWithUploader);
    } catch (error) {
      res.status(500).json({ message: "Error fetching documents" });
    }
  });
  app2.delete("/api/user/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const docId = parseInt(req.params.id);
      const [user] = await db.select().from(users).where((0, import_drizzle_orm19.eq)(users.id, userId)).limit(1);
      if (!user || user.accountStatus === "pending") {
        return res.status(403).json({ message: "Your account is in a status that does not allow this action. Contact our team." });
      }
      const orderDocs = await db.select().from(applicationDocuments).leftJoin(orders, (0, import_drizzle_orm19.eq)(applicationDocuments.orderId, orders.id)).where((0, import_drizzle_orm19.and)(
        (0, import_drizzle_orm19.eq)(applicationDocuments.id, docId),
        (0, import_drizzle_orm19.eq)(orders.userId, userId)
      ));
      const directDocs = await db.select().from(applicationDocuments).where((0, import_drizzle_orm19.and)(
        (0, import_drizzle_orm19.eq)(applicationDocuments.id, docId),
        (0, import_drizzle_orm19.eq)(applicationDocuments.userId, userId)
      ));
      if (!orderDocs.length && !directDocs.length) {
        return res.status(404).json({ message: "Document not found" });
      }
      const docToDelete = orderDocs[0]?.application_documents || directDocs[0];
      if (docToDelete && docToDelete.reviewStatus === "approved") {
        return res.status(403).json({ message: "Approved documents cannot be deleted." });
      }
      await db.delete(applicationDocuments).where((0, import_drizzle_orm19.eq)(applicationDocuments.id, docId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Error deleting document" });
    }
  });
  app2.get("/api/user/documents/:id/download", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const docId = parseInt(req.params.id);
      const [doc] = await db.select().from(applicationDocuments).where((0, import_drizzle_orm19.eq)(applicationDocuments.id, docId)).limit(1);
      if (!doc) {
        return res.status(404).json({ message: "Document not found" });
      }
      let hasAccess = req.session.isAdmin || req.session.isSupport;
      if (!hasAccess && doc.orderId) {
        const [order] = await db.select().from(orders).where((0, import_drizzle_orm19.eq)(orders.id, doc.orderId)).limit(1);
        if (order && order.userId === userId) {
          hasAccess = true;
        }
      }
      if (!hasAccess && doc.userId === userId) {
        hasAccess = true;
      }
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (!doc.fileUrl) {
        return res.status(404).json({ message: "File not available" });
      }
      const path7 = await import("path");
      const fs6 = await import("fs");
      const filePath = path7.join(process.cwd(), doc.fileUrl.replace(/^\//, ""));
      if (!fs6.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      res.setHeader("Content-Disposition", `attachment; filename="${doc.fileName}"`);
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "private, no-cache");
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error downloading document:", error);
      res.status(500).json({ message: "Error downloading file" });
    }
  });
  app2.post("/api/documents/upload", isAuthenticated, async (req, res) => {
    try {
      const { orderId, fileName, fileUrl, documentType, applicationId } = import_zod7.z.object({
        orderId: import_zod7.z.number(),
        applicationId: import_zod7.z.number(),
        fileName: import_zod7.z.string(),
        fileUrl: import_zod7.z.string(),
        documentType: import_zod7.z.string()
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
      const { fileUrl: _url, encryptionIv: _iv, fileHash: _hash, ...safeDoc } = doc;
      res.json(safeDoc);
    } catch (error) {
      res.status(500).json({ message: "Error uploading document" });
    }
  });
  app2.get("/uploads/admin-docs/:filename", isAuthenticated, async (req, res) => {
    try {
      const filename = req.params.filename;
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ message: "Invalid filename" });
      }
      const fileUrl = `/uploads/admin-docs/${filename}`;
      if (!req.session.isAdmin && !req.session.isSupport) {
        const [user] = await db.select().from(users).where((0, import_drizzle_orm19.eq)(users.id, req.session.userId)).limit(1);
        if (user && user.accountStatus === "pending") {
          return res.status(403).json({ message: "Your account is in a status that does not allow this action. Contact our team." });
        }
      }
      const [doc] = await db.select().from(applicationDocuments).where((0, import_drizzle_orm19.eq)(applicationDocuments.fileUrl, fileUrl)).limit(1);
      if (!doc) {
        return res.status(404).json({ message: "Document not found" });
      }
      let hasAccess = req.session.isAdmin || req.session.isSupport;
      if (!hasAccess && doc.orderId) {
        const [order] = await db.select().from(orders).where((0, import_drizzle_orm19.eq)(orders.id, doc.orderId)).limit(1);
        if (order && order.userId === req.session.userId) {
          hasAccess = true;
        }
      }
      if (!hasAccess && doc.userId === req.session.userId) {
        hasAccess = true;
      }
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      const path7 = await import("path");
      const fs6 = await import("fs");
      const filePath = path7.join(process.cwd(), "uploads", "admin-docs", filename);
      if (!fs6.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "private, no-cache");
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error serving admin doc:", error);
      res.status(500).json({ message: "Error serving file" });
    }
  });
  app2.get("/uploads/client-docs/:filename", isAuthenticated, async (req, res) => {
    try {
      const filename = req.params.filename;
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ message: "Invalid filename" });
      }
      const fileUrl = `/uploads/client-docs/${filename}`;
      if (!req.session.isAdmin && !req.session.isSupport) {
        const [user] = await db.select().from(users).where((0, import_drizzle_orm19.eq)(users.id, req.session.userId)).limit(1);
        if (user && user.accountStatus === "pending") {
          return res.status(403).json({ message: "Your account is in a status that does not allow this action. Contact our team." });
        }
      }
      const [doc] = await db.select().from(applicationDocuments).where((0, import_drizzle_orm19.eq)(applicationDocuments.fileUrl, fileUrl)).limit(1);
      if (!doc) {
        return res.status(404).json({ message: "Document not found" });
      }
      let hasAccess = req.session.isAdmin || req.session.isSupport;
      if (!hasAccess && doc.orderId) {
        const [order] = await db.select().from(orders).where((0, import_drizzle_orm19.eq)(orders.id, doc.orderId)).limit(1);
        if (order && order.userId === req.session.userId) {
          hasAccess = true;
        }
      }
      if (!hasAccess && doc.userId === req.session.userId) {
        hasAccess = true;
      }
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      const path7 = await import("path");
      const fs6 = await import("fs");
      const filePath = path7.join(process.cwd(), "uploads", "client-docs", filename);
      if (!fs6.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "private, no-cache");
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error serving client doc:", error);
      res.status(500).json({ message: "Error serving file" });
    }
  });
  app2.get("/uploads/*", (_req, res) => {
    res.status(403).json({ message: "Access denied" });
  });
  app2.get("/api/products", async (req, res) => {
    const products3 = await storage.getProducts();
    res.json(products3);
  });
  app2.post("/api/seed-admin", isAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      const adminEmail = email || process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
      const [existingUser] = await db.select().from(users).where((0, import_drizzle_orm19.eq)(users.email, adminEmail)).limit(1);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found." });
      }
      await db.update(users).set({ isAdmin: true, accountStatus: "active" }).where((0, import_drizzle_orm19.eq)(users.email, adminEmail));
      res.json({ success: true, message: "Admin role assigned successfully" });
    } catch (error) {
      console.error("Seed admin error:", error);
      res.status(500).json({ message: "Error assigning admin role" });
    }
  });
  app2.delete("/api/user/account", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { mode } = req.body;
      if (mode === "hard") {
        await db.delete(users).where((0, import_drizzle_orm19.eq)(users.id, userId));
      } else {
        const [user] = await db.select().from(users).where((0, import_drizzle_orm19.eq)(users.id, userId)).limit(1);
        await db.update(users).set({
          accountStatus: "deactivated",
          isActive: false,
          email: `deleted_${userId}_${user.email}`,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm19.eq)(users.id, userId));
      }
      req.session.destroy(() => {
      });
      res.json({ success: true, message: "Account processed successfully" });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ message: "Error processing account deletion" });
    }
  });
  app2.patch("/api/user/language", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { preferredLanguage } = req.body;
      if (!preferredLanguage || typeof preferredLanguage !== "string") {
        return res.status(400).json({ message: "Invalid language" });
      }
      await db.update(users).set({ preferredLanguage }).where((0, import_drizzle_orm19.eq)(users.id, userId));
      const [updatedUser] = await db.select().from(users).where((0, import_drizzle_orm19.eq)(users.id, userId)).limit(1);
      res.json(updatedUser);
    } catch (error) {
      console.error("Update language error:", error);
      res.status(500).json({ message: "Error updating language" });
    }
  });
  const updateProfileSchema = import_zod7.z.object({
    firstName: import_zod7.z.string().optional(),
    lastName: import_zod7.z.string().optional(),
    phone: import_zod7.z.string().optional(),
    businessActivity: import_zod7.z.string().optional(),
    address: import_zod7.z.string().optional(),
    streetType: import_zod7.z.string().optional(),
    city: import_zod7.z.string().optional(),
    province: import_zod7.z.string().optional(),
    postalCode: import_zod7.z.string().optional(),
    country: import_zod7.z.string().optional(),
    idNumber: import_zod7.z.string().optional(),
    idType: import_zod7.z.string().optional(),
    birthDate: import_zod7.z.string().optional()
  });
  const sensitiveFields = ["firstName", "lastName", "idNumber", "idType", "phone"];
  app2.patch("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { otpCode, ...profileData } = req.body;
      const validatedData = updateProfileSchema.parse(profileData);
      const [currentUser] = await db.select().from(users).where((0, import_drizzle_orm19.eq)(users.id, userId)).limit(1);
      if (!currentUser || !currentUser.email) {
        return res.status(404).json({ message: "User not found" });
      }
      const currentUserEmail = currentUser.email;
      const changedSensitiveFields = [];
      for (const field of sensitiveFields) {
        const currentValue = currentUser[field];
        const newValue = validatedData[field];
        const currentIsEmpty = !currentValue || typeof currentValue === "string" && currentValue.trim() === "";
        const newIsEmpty = !newValue || typeof newValue === "string" && newValue.trim() === "";
        if (field in validatedData && newValue !== currentValue) {
          if (currentIsEmpty || newIsEmpty) {
            continue;
          }
          changedSensitiveFields.push({
            field,
            oldValue: currentValue || "(empty)",
            newValue: newValue || "(empty)"
          });
        }
      }
      if (changedSensitiveFields.length > 0) {
        if (!otpCode) {
          const nonSensitiveData = {};
          const pendingData = {};
          for (const [key, value] of Object.entries(validatedData)) {
            if (sensitiveFields.includes(key) && changedSensitiveFields.some((f) => f.field === key)) {
              pendingData[key] = value;
            } else {
              nonSensitiveData[key] = value;
            }
          }
          if (Object.keys(nonSensitiveData).length > 0) {
            await db.update(users).set(nonSensitiveData).where((0, import_drizzle_orm19.eq)(users.id, userId));
          }
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
          await db.update(users).set({
            pendingProfileChanges: { fields: pendingData, changedFields: changedSensitiveFields, requestedAt: (/* @__PURE__ */ new Date()).toISOString() },
            pendingChangesExpiresAt: expiresAt
          }).where((0, import_drizzle_orm19.eq)(users.id, userId));
          const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
          const otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
          await db.insert(contactOtps).values({
            email: currentUserEmail,
            otp,
            otpType: "profile_change",
            expiresAt: otpExpiresAt,
            verified: false
          });
          const userLang = currentUser.preferredLanguage || "es";
          const userName = currentUser.firstName || "Cliente";
          sendEmail({
            to: currentUserEmail,
            subject: `${getEmailTranslations(userLang).profileChangeOtp.title} - Easy US LLC`,
            html: getProfileChangeOtpTemplate(userName, otp, userLang)
          }).catch(console.error);
          return res.status(400).json({
            message: "OTP verification required for sensitive changes",
            code: "OTP_REQUIRED",
            changedFields: changedSensitiveFields.map((f) => f.field),
            pendingChanges: pendingData
          });
        }
        const [otpRecord] = await db.select().from(contactOtps).where(
          (0, import_drizzle_orm19.and)(
            (0, import_drizzle_orm19.eq)(contactOtps.email, currentUserEmail),
            (0, import_drizzle_orm19.eq)(contactOtps.otpType, "profile_change"),
            (0, import_drizzle_orm19.eq)(contactOtps.otp, otpCode),
            (0, import_drizzle_orm19.eq)(contactOtps.verified, false),
            (0, import_drizzle_orm19.gt)(contactOtps.expiresAt, /* @__PURE__ */ new Date())
          )
        ).orderBy(import_drizzle_orm19.sql`${contactOtps.expiresAt} DESC`).limit(1);
        if (!otpRecord) {
          return res.status(400).json({ message: "Invalid or expired OTP code", code: "OTP_INVALID" });
        }
        await db.update(contactOtps).set({ verified: true }).where((0, import_drizzle_orm19.eq)(contactOtps.id, otpRecord.id));
        await db.update(users).set({
          ...validatedData,
          pendingProfileChanges: null,
          pendingChangesExpiresAt: null
        }).where((0, import_drizzle_orm19.eq)(users.id, userId));
        logAudit({
          action: "password_change",
          userId,
          details: {
            type: "profile_update_verified",
            changedFields: changedSensitiveFields,
            email: currentUser.email,
            clientId: currentUser.clientId
          }
        });
        const adminEmail = process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
        sendEmail({
          to: adminEmail,
          subject: `[ALERTA] Cambios de perfil verificados - Cliente ${currentUser.clientId}`,
          html: getAdminProfileChangesTemplate(
            `${currentUser.firstName} ${currentUser.lastName}`,
            currentUser.email || "",
            currentUser.clientId || "",
            changedSensitiveFields
          )
        }).catch(console.error);
        const [updatedUser2] = await db.select().from(users).where((0, import_drizzle_orm19.eq)(users.id, userId)).limit(1);
        return res.json(updatedUser2);
      }
      await db.update(users).set(validatedData).where((0, import_drizzle_orm19.eq)(users.id, userId));
      const [updatedUser] = await db.select().from(users).where((0, import_drizzle_orm19.eq)(users.id, userId)).limit(1);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof import_zod7.z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Error updating profile" });
    }
  });
  app2.post("/api/user/profile/confirm-otp", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { otpCode } = req.body;
      if (!otpCode || typeof otpCode !== "string" || otpCode.length !== 6) {
        return res.status(400).json({ message: "Invalid OTP code" });
      }
      const [user] = await db.select().from(users).where((0, import_drizzle_orm19.eq)(users.id, userId)).limit(1);
      if (!user || !user.email) {
        return res.status(404).json({ message: "User not found" });
      }
      const pendingChanges = user.pendingProfileChanges;
      if (!pendingChanges || !pendingChanges.fields) {
        return res.status(400).json({ message: "No pending changes to confirm" });
      }
      if (user.pendingChangesExpiresAt && new Date(user.pendingChangesExpiresAt) < /* @__PURE__ */ new Date()) {
        await db.update(users).set({ pendingProfileChanges: null, pendingChangesExpiresAt: null }).where((0, import_drizzle_orm19.eq)(users.id, userId));
        return res.status(400).json({ message: "Pending changes have expired. Please make the changes again." });
      }
      const userEmail = user.email;
      const [otpRecord] = await db.select().from(contactOtps).where(
        (0, import_drizzle_orm19.and)(
          (0, import_drizzle_orm19.eq)(contactOtps.email, userEmail),
          (0, import_drizzle_orm19.eq)(contactOtps.otpType, "profile_change"),
          (0, import_drizzle_orm19.eq)(contactOtps.otp, otpCode),
          (0, import_drizzle_orm19.eq)(contactOtps.verified, false),
          (0, import_drizzle_orm19.gt)(contactOtps.expiresAt, /* @__PURE__ */ new Date())
        )
      ).orderBy(import_drizzle_orm19.sql`${contactOtps.expiresAt} DESC`).limit(1);
      if (!otpRecord) {
        const attempts = (pendingChanges.otpAttempts || 0) + 1;
        const maxAttempts = 5;
        if (attempts >= maxAttempts) {
          await db.update(users).set({
            pendingProfileChanges: null,
            pendingChangesExpiresAt: null,
            accountStatus: "pending"
          }).where((0, import_drizzle_orm19.eq)(users.id, userId));
          logAudit({
            action: "account_review",
            userId,
            details: { reason: "Too many failed OTP attempts for profile change", attempts, email: user.email }
          });
          return res.status(403).json({
            message: "Too many failed attempts. Your account has been placed under review for security.",
            code: "ACCOUNT_UNDER_REVIEW",
            attemptsRemaining: 0
          });
        }
        await db.update(users).set({
          pendingProfileChanges: { ...pendingChanges, otpAttempts: attempts }
        }).where((0, import_drizzle_orm19.eq)(users.id, userId));
        return res.status(400).json({
          message: "Invalid or expired OTP code",
          code: "OTP_INVALID",
          attemptsRemaining: maxAttempts - attempts
        });
      }
      await db.update(contactOtps).set({ verified: true }).where((0, import_drizzle_orm19.eq)(contactOtps.id, otpRecord.id));
      await db.update(users).set({
        ...pendingChanges.fields,
        pendingProfileChanges: null,
        pendingChangesExpiresAt: null
      }).where((0, import_drizzle_orm19.eq)(users.id, userId));
      logAudit({
        action: "password_change",
        userId,
        details: {
          type: "profile_update_verified",
          changedFields: pendingChanges.changedFields,
          email: user.email,
          clientId: user.clientId
        }
      });
      const adminEmail = process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
      sendEmail({
        to: adminEmail,
        subject: `[ALERTA] Cambios de perfil verificados - Cliente ${user.clientId}`,
        html: getAdminProfileChangesTemplate(
          `${user.firstName} ${user.lastName}`,
          user.email || "",
          user.clientId || "",
          pendingChanges.changedFields || []
        )
      }).catch(console.error);
      const [updatedUser] = await db.select().from(users).where((0, import_drizzle_orm19.eq)(users.id, userId)).limit(1);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Confirm profile OTP error:", error);
      res.status(500).json({ message: "Error confirming changes" });
    }
  });
  app2.post("/api/user/profile/cancel-pending", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      await db.update(users).set({ pendingProfileChanges: null, pendingChangesExpiresAt: null }).where((0, import_drizzle_orm19.eq)(users.id, userId));
      const [updatedUser] = await db.select().from(users).where((0, import_drizzle_orm19.eq)(users.id, userId)).limit(1);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Cancel pending changes error:", error);
      res.status(500).json({ message: "Error cancelling changes" });
    }
  });
  app2.post("/api/user/profile/resend-otp", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const [user] = await db.select().from(users).where((0, import_drizzle_orm19.eq)(users.id, userId)).limit(1);
      if (!user || !user.email) {
        return res.status(404).json({ message: "User not found" });
      }
      const pendingChanges = user.pendingProfileChanges;
      if (!pendingChanges) {
        return res.status(400).json({ message: "No pending changes" });
      }
      const ip = getClientIp(req);
      const rateCheck = checkRateLimitInMemory("otp", ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.` });
      }
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      const otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      const userEmail = user.email;
      await db.insert(contactOtps).values({
        email: userEmail,
        otp,
        otpType: "profile_change",
        expiresAt: otpExpiresAt,
        verified: false
      });
      const resendLang = user.preferredLanguage || "es";
      const resendName = user.firstName || "Cliente";
      sendEmail({
        to: userEmail,
        subject: `${getEmailTranslations(resendLang).profileChangeOtp.title} - Easy US LLC`,
        html: getProfileChangeOtpTemplate(resendName, otp, resendLang)
      }).catch(console.error);
      res.json({ success: true, message: "New OTP code sent" });
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({ message: "Error sending OTP" });
    }
  });
  app2.post("/api/user/verify-email", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { otpCode } = req.body;
      const [user] = await db.select().from(users).where((0, import_drizzle_orm19.eq)(users.id, userId)).limit(1);
      if (!user || !user.email) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.emailVerified) {
        return res.json({ success: true, message: "Email already verified" });
      }
      const userEmail = user.email;
      const [otpRecord] = await db.select().from(contactOtps).where(
        (0, import_drizzle_orm19.and)(
          (0, import_drizzle_orm19.eq)(contactOtps.email, userEmail),
          (0, import_drizzle_orm19.eq)(contactOtps.otpType, "account_verification"),
          (0, import_drizzle_orm19.eq)(contactOtps.otp, otpCode),
          (0, import_drizzle_orm19.eq)(contactOtps.verified, false),
          (0, import_drizzle_orm19.gt)(contactOtps.expiresAt, /* @__PURE__ */ new Date())
        )
      ).limit(1);
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired OTP code" });
      }
      await db.update(contactOtps).set({ verified: true }).where((0, import_drizzle_orm19.eq)(contactOtps.id, otpRecord.id));
      await db.update(users).set({
        emailVerified: true,
        accountStatus: "active"
      }).where((0, import_drizzle_orm19.eq)(users.id, userId));
      req.session.isAdmin = user.isAdmin;
      req.session.isSupport = user.isSupport;
      const activeLang = user.preferredLanguage || "es";
      sendEmail({
        to: userEmail,
        subject: activeLang === "en" ? "Account activated - Easy US LLC" : activeLang === "ca" ? "Compte activat - Easy US LLC" : activeLang === "fr" ? "Compte activ\xE9 - Easy US LLC" : activeLang === "de" ? "Konto aktiviert - Easy US LLC" : activeLang === "it" ? "Account attivato - Easy US LLC" : activeLang === "pt" ? "Conta ativada - Easy US LLC" : "Cuenta activada - Easy US LLC",
        html: getWelcomeEmailTemplate(user.firstName || void 0, activeLang)
      }).catch(console.error);
      res.json({ success: true, message: "Email verified successfully. Your account is active." });
    } catch (error) {
      console.error("Verify email error:", error);
      res.status(500).json({ message: "Error verifying email" });
    }
  });
  app2.post("/api/user/send-verification-otp", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const [user] = await db.select().from(users).where((0, import_drizzle_orm19.eq)(users.id, userId)).limit(1);
      if (!user || !user.email) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.emailVerified) {
        return res.json({ success: true, message: "Email already verified" });
      }
      const ip = getClientIp(req);
      const rateCheck = checkRateLimitInMemory("otp", ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.` });
      }
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
      const userEmail = user.email;
      await db.insert(contactOtps).values({
        email: userEmail,
        otp,
        otpType: "account_verification",
        expiresAt,
        verified: false
      });
      const vpLang = user.preferredLanguage || "es";
      sendEmail({
        to: userEmail,
        subject: getOtpSubject(vpLang),
        html: getOtpEmailTemplate(otp, user.firstName || void 0, vpLang)
      }).catch(console.error);
      res.json({ success: true, message: "OTP code sent to your email" });
    } catch (error) {
      console.error("Send verification OTP error:", error);
      res.status(500).json({ message: "Error sending OTP" });
    }
  });
  app2.get("/api/user/deadlines", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const userOrders = await db.select({
        order: orders,
        application: llcApplications
      }).from(orders).leftJoin(llcApplications, (0, import_drizzle_orm19.eq)(orders.id, llcApplications.orderId)).where((0, import_drizzle_orm19.eq)(orders.userId, userId));
      const applications = userOrders.filter((o) => o.application).map((o) => o.application);
      const deadlines = getUpcomingDeadlinesForUser(applications);
      res.json(deadlines);
    } catch (error) {
      console.error("Error fetching deadlines:", error);
      res.status(500).json({ message: "Error fetching compliance dates" });
    }
  });
  app2.patch("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order || order.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      if (order.status !== "pending") {
        return res.status(400).json({ message: "The order is already in progress and cannot be modified." });
      }
      const updateSchema = import_zod7.z.object({
        companyNameOption2: import_zod7.z.string().optional(),
        designator: import_zod7.z.string().optional(),
        companyDescription: import_zod7.z.string().optional(),
        ownerNamesAlternates: import_zod7.z.string().optional(),
        notes: import_zod7.z.string().optional()
      });
      const validatedData = updateSchema.parse(req.body);
      await db.update(llcApplications).set({ ...validatedData, lastUpdated: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm19.eq)(llcApplications.orderId, orderId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error updating order" });
    }
  });
  app2.get("/api/user/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const notifs = await db.select().from(userNotifications).where((0, import_drizzle_orm19.eq)(userNotifications.userId, userId)).orderBy((0, import_drizzle_orm19.desc)(userNotifications.createdAt)).limit(50);
      res.json(notifs);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });
  app2.patch("/api/user/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      await db.update(userNotifications).set({ isRead: true }).where((0, import_drizzle_orm19.and)((0, import_drizzle_orm19.eq)(userNotifications.id, req.params.id), (0, import_drizzle_orm19.eq)(userNotifications.userId, req.session.userId)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  });
  app2.delete("/api/user/notifications/:id", isAuthenticated, async (req, res) => {
    try {
      await db.delete(userNotifications).where((0, import_drizzle_orm19.and)((0, import_drizzle_orm19.eq)(userNotifications.id, req.params.id), (0, import_drizzle_orm19.eq)(userNotifications.userId, req.session.userId)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting notification" });
    }
  });
  app2.post("/api/user/request-password-otp", isAuthenticated, async (req, res) => {
    try {
      const [user] = await db.select().from(users).where((0, import_drizzle_orm19.eq)(users.id, req.session.userId));
      if (!user?.email) {
        return res.status(400).json({ message: "User not found" });
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
      const pwLang = user.preferredLanguage || "es";
      await sendEmail({
        to: user.email,
        subject: getOtpSubject(pwLang),
        html: getPasswordChangeOtpTemplate(user.firstName || "", otp, pwLang)
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Request password OTP error:", error);
      res.status(500).json({ message: "Error sending code" });
    }
  });
  app2.post("/api/user/change-password", isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword, otp } = import_zod7.z.object({
        currentPassword: import_zod7.z.string().min(1),
        newPassword: import_zod7.z.string().min(8),
        otp: import_zod7.z.string().length(6)
      }).parse(req.body);
      const [user] = await db.select().from(users).where((0, import_drizzle_orm19.eq)(users.id, req.session.userId));
      if (!user?.email || !user?.passwordHash) {
        return res.status(400).json({ message: "Cannot change password" });
      }
      const [otpRecord] = await db.select().from(contactOtps).where((0, import_drizzle_orm19.and)(
        (0, import_drizzle_orm19.eq)(contactOtps.email, user.email),
        (0, import_drizzle_orm19.eq)(contactOtps.otp, otp),
        (0, import_drizzle_orm19.eq)(contactOtps.otpType, "password_change"),
        (0, import_drizzle_orm19.gt)(contactOtps.expiresAt, /* @__PURE__ */ new Date())
      ));
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }
      await db.delete(contactOtps).where((0, import_drizzle_orm19.eq)(contactOtps.id, otpRecord.id));
      const { verifyPassword: verifyPassword2, hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth_service(), auth_service_exports));
      const isValid = await verifyPassword2(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ message: "Incorrect current password" });
      }
      const newHash = await hashPassword2(newPassword);
      await db.update(users).set({ passwordHash: newHash, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm19.eq)(users.id, req.session.userId));
      res.json({ success: true });
    } catch (error) {
      if (error instanceof import_zod7.z.ZodError) {
        return res.status(400).json({ message: "Invalid data" });
      }
      console.error("Change password error:", error);
      res.status(500).json({ message: "Error changing password" });
    }
  });
}

// server/routes/orders.ts
var import_zod9 = require("zod");
var import_drizzle_orm20 = require("drizzle-orm");

// shared/routes.ts
var import_zod8 = require("zod");
init_schema();
var errorSchemas = {
  validation: import_zod8.z.object({
    message: import_zod8.z.string(),
    field: import_zod8.z.string().optional()
  }),
  notFound: import_zod8.z.object({
    message: import_zod8.z.string()
  }),
  internal: import_zod8.z.object({
    message: import_zod8.z.string()
  }),
  unauthorized: import_zod8.z.object({
    message: import_zod8.z.string()
  })
};
var api = {
  products: {
    list: {
      method: "GET",
      path: "/api/products",
      responses: {
        200: import_zod8.z.array(import_zod8.z.custom())
      }
    },
    get: {
      method: "GET",
      path: "/api/products/:id",
      responses: {
        200: import_zod8.z.custom(),
        404: errorSchemas.notFound
      }
    }
  },
  orders: {
    list: {
      method: "GET",
      path: "/api/orders",
      responses: {
        200: import_zod8.z.array(import_zod8.z.custom()),
        401: errorSchemas.unauthorized
      }
    },
    create: {
      method: "POST",
      path: "/api/orders",
      input: import_zod8.z.object({
        productId: import_zod8.z.number()
      }),
      responses: {
        201: import_zod8.z.custom(),
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
        200: import_zod8.z.custom(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    },
    update: {
      method: "PUT",
      path: "/api/llc/:id",
      input: insertLlcApplicationSchema.partial(),
      responses: {
        200: import_zod8.z.custom(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound
      }
    },
    getByCode: {
      method: "GET",
      path: "/api/llc/code/:code",
      responses: {
        200: import_zod8.z.custom(),
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
        201: import_zod8.z.custom(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound
      }
    },
    delete: {
      method: "DELETE",
      path: "/api/documents/:id",
      responses: {
        200: import_zod8.z.object({ success: import_zod8.z.boolean() }),
        404: errorSchemas.notFound
      }
    }
  }
};

// server/routes/orders.ts
init_schema();
init_email();
init_email_translations();

// server/lib/pdf-generator.ts
var import_pdfkit = __toESM(require("pdfkit"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_url = require("url");
var import_meta = {};
function getDirname() {
  try {
    if (typeof import_meta?.url !== "undefined") {
      return import_path2.default.dirname((0, import_url.fileURLToPath)(import_meta.url));
    }
  } catch {
  }
  return import_path2.default.resolve();
}
var __dirname = getDirname();
var DEFAULT_BANK_ACCOUNTS = [
  {
    label: "Thread Bank (Checking)",
    holder: "Fortuny Consulting LLC",
    bankName: "Thread Bank NA",
    accountType: "checking",
    accountNumber: "200002330558",
    routingNumber: "064209588",
    swift: "CLNOUS66MER",
    address: "1209 Mountain Road Place NE, STE R, Albuquerque, NM 87110"
  },
  {
    label: "Column N.A. (Checking)",
    holder: "Fortuny Consulting LLC",
    bankName: "Column N.A.",
    accountType: "checking",
    accountNumber: "141432778929495",
    routingNumber: "121145433",
    address: "1 Letterman Drive, Building A, Suite A4-700, San Francisco, CA 94129"
  },
  {
    label: "Cuenta Internacional (IBAN)",
    holder: "Fortuny Consulting LLC",
    bankName: "BANKING CIRCLE SA",
    accountType: "iban",
    iban: "DK2489000045271938",
    swift: "SXPYDKKK"
  }
];
var cachedLogoPath = null;
var logoChecked = false;
function getLogoPath() {
  if (logoChecked) return cachedLogoPath;
  const possiblePaths = [
    import_path2.default.join(process.cwd(), "client/public/logo-icon.png"),
    import_path2.default.join(process.cwd(), "dist/public/logo-icon.png"),
    import_path2.default.join(__dirname, "../../client/public/logo-icon.png")
  ];
  for (const logoPath of possiblePaths) {
    if (import_fs2.default.existsSync(logoPath)) {
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
function formatDate2(dateStr) {
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
function generateInvoicePdf(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new import_pdfkit.default({
        size: "A4",
        margin: 50,
        bufferPages: false,
        info: { Title: `Factura ${data.orderNumber}`, Author: "Easy US LLC" }
      });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      const pageW = 595;
      const left = 50;
      const right = pageW - 50;
      const contentW = right - left;
      const black = "#111111";
      const dark = "#1A1A1A";
      const mid = "#555555";
      const light = "#999999";
      const line = "#D4D4D4";
      const faint = "#F5F5F5";
      doc.rect(0, 0, 595, 842).fill("#FFFFFF");
      const logoPath = getLogoPath();
      if (logoPath) {
        try {
          doc.image(logoPath, left, 40, { width: 36, height: 36 });
        } catch {
        }
      }
      doc.font("Helvetica-Bold").fontSize(16).fillColor(black).text("Easy US LLC", left + 44, 44);
      doc.font("Helvetica").fontSize(7.5).fillColor(light).text("Fortuny Consulting LLC", left + 44, 62);
      doc.font("Helvetica").fontSize(9).fillColor(mid).text(`No. ${data.orderNumber}`, left, 80, { align: "right", width: contentW });
      doc.moveTo(left, 98).lineTo(right, 98).strokeColor(black).lineWidth(1.5).stroke();
      let y = 118;
      doc.font("Helvetica").fontSize(7).fillColor(light).text("FROM", left, y);
      doc.font("Helvetica-Bold").fontSize(10).fillColor(black).text("Fortuny Consulting LLC", left, y + 12);
      doc.font("Helvetica").fontSize(8.5).fillColor(mid);
      doc.text("1209 Mountain Road Place NE, STE R", left, y + 26);
      doc.text("Albuquerque, NM 87110, USA", left, y + 38);
      doc.text("hola@easyusllc.com", left, y + 50);
      const cX = 320;
      doc.font("Helvetica").fontSize(7).fillColor(light).text("BILL TO", cX, y);
      doc.font("Helvetica-Bold").fontSize(10).fillColor(black).text(data.customer.name, cX, y + 12);
      doc.font("Helvetica").fontSize(8.5).fillColor(mid);
      let cy = y + 26;
      if (data.customer.idType && data.customer.idNumber) {
        doc.text(`${data.customer.idType}: ${data.customer.idNumber}`, cX, cy);
        cy += 12;
      }
      doc.text(data.customer.email, cX, cy);
      cy += 12;
      if (data.customer.phone) {
        doc.text(data.customer.phone, cX, cy);
        cy += 12;
      }
      if (data.customer.address) {
        const addr = [data.customer.streetType, data.customer.address, data.customer.postalCode, data.customer.city, data.customer.country].filter(Boolean).join(", ");
        doc.fontSize(8).text(addr, cX, cy, { width: right - cX });
      }
      y += 80;
      doc.moveTo(left, y).lineTo(right, y).strokeColor(line).lineWidth(0.5).stroke();
      y += 15;
      const col2 = left + contentW * 0.33;
      const col3 = left + contentW * 0.56;
      const col4 = left + contentW * 0.78;
      doc.font("Helvetica").fontSize(7).fillColor(light);
      doc.text("ISSUE DATE", left, y);
      doc.text("DUE DATE", col2, y);
      doc.text("STATUS", col3, y);
      doc.text("CURRENCY", col4, y);
      y += 11;
      doc.font("Helvetica-Bold").fontSize(9.5).fillColor(black);
      doc.text(formatDate2(data.date), left, y);
      doc.text(data.dueDate ? formatDate2(data.dueDate) : formatDate2(data.date), col2, y);
      const statusColors = { pending: "#D97706", paid: "#059669", cancelled: "#DC2626", refunded: "#7C3AED" };
      doc.fillColor(statusColors[data.status] || "#059669").text(getStatusText(data.status), col3, y);
      doc.fillColor(black).text(data.currency, col4, y);
      y += 22;
      doc.moveTo(left, y).lineTo(right, y).strokeColor(line).lineWidth(0.5).stroke();
      y += 20;
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor(light);
      doc.text("DESCRIPTION", left, y);
      doc.text("QTY", left + contentW * 0.62, y, { width: 40 });
      doc.text("UNIT PRICE", left + contentW * 0.72, y, { width: 60 });
      doc.text("AMOUNT", right - 60, y, { width: 60, align: "right" });
      y += 14;
      doc.moveTo(left, y).lineTo(right, y).strokeColor(black).lineWidth(0.8).stroke();
      y += 8;
      for (const item of data.items) {
        doc.font("Helvetica-Bold").fontSize(9.5).fillColor(dark).text(item.description, left, y, { width: contentW * 0.58 });
        const descH = doc.heightOfString(item.description, { width: contentW * 0.58 });
        if (item.details) {
          doc.font("Helvetica").fontSize(8).fillColor(light).text(item.details, left, y + descH + 2, { width: contentW * 0.58 });
        }
        doc.font("Helvetica").fontSize(9.5).fillColor(dark);
        const rowMid = y + 1;
        doc.text(item.quantity.toString(), left + contentW * 0.62, rowMid, { width: 40 });
        doc.text(formatCurrency(item.unitPrice, data.currency), left + contentW * 0.72, rowMid, { width: 60 });
        doc.font("Helvetica-Bold").text(formatCurrency(item.total, data.currency), right - 60, rowMid, { width: 60, align: "right" });
        const rowH = item.details ? descH + 18 : Math.max(descH + 8, 22);
        y += rowH;
        doc.moveTo(left, y).lineTo(right, y).strokeColor(faint).lineWidth(0.5).stroke();
        y += 6;
      }
      y += 12;
      const totalLeft = left + contentW * 0.55;
      const totalValW = right - totalLeft - 5;
      doc.font("Helvetica").fontSize(9).fillColor(mid).text("Subtotal", totalLeft, y);
      doc.font("Helvetica").fontSize(9).fillColor(dark).text(formatCurrency(data.subtotal, data.currency), right - 60, y, { width: 60, align: "right" });
      y += 16;
      if (data.discount && data.discount.amount > 0) {
        const discLabel = data.discount.code ? `Discount (${data.discount.code})` : "Discount";
        doc.font("Helvetica").fontSize(9).fillColor(mid).text(discLabel, totalLeft, y);
        doc.font("Helvetica").fontSize(9).fillColor("#059669").text(`-${formatCurrency(data.discount.amount, data.currency)}`, right - 60, y, { width: 60, align: "right" });
        y += 16;
      }
      doc.moveTo(totalLeft, y).lineTo(right, y).strokeColor(black).lineWidth(1).stroke();
      y += 10;
      doc.font("Helvetica-Bold").fontSize(11).fillColor(black).text("TOTAL", totalLeft, y);
      doc.font("Helvetica-Bold").fontSize(14).fillColor(black).text(formatCurrency(data.total, data.currency), right - 80, y - 2, { width: 80, align: "right" });
      y += 30;
      doc.moveTo(left, y).lineTo(right, y).strokeColor(line).lineWidth(0.5).stroke();
      y += 18;
      const accounts = data.bankAccounts && data.bankAccounts.length > 0 ? data.bankAccounts : DEFAULT_BANK_ACCOUNTS;
      doc.font("Helvetica-Bold").fontSize(8).fillColor(black).text("PAYMENT DETAILS", left, y);
      y += 14;
      for (const account of accounts) {
        doc.font("Helvetica-Bold").fontSize(7.5).fillColor(dark).text(account.label.toUpperCase(), left, y);
        y += 11;
        const colW = contentW / 4;
        const fields = [];
        fields.push(["Holder", account.holder]);
        fields.push(["Bank", account.bankName]);
        if (account.iban) fields.push(["IBAN", account.iban]);
        if (account.accountNumber) fields.push(["Account", account.accountNumber]);
        if (account.routingNumber) fields.push(["Routing", account.routingNumber]);
        if (account.swift) fields.push(["SWIFT/BIC", account.swift]);
        let fX = left;
        let fRow = 0;
        for (const [label, value] of fields) {
          if (fX + colW > right + 10) {
            fX = left;
            fRow++;
          }
          const fY = y + fRow * 18;
          doc.font("Helvetica").fontSize(6.5).fillColor(light).text(label.toUpperCase(), fX, fY);
          doc.font("Helvetica").fontSize(7.5).fillColor(dark).text(value, fX, fY + 8);
          fX += colW;
        }
        y += (fRow + 1) * 18 + 6;
        doc.moveTo(left, y).lineTo(right, y).strokeColor(faint).lineWidth(0.5).stroke();
        y += 8;
      }
      if (data.status === "pending" && data.paymentLink) {
        y += 4;
        doc.font("Helvetica-Bold").fontSize(8).fillColor(black).text("ONLINE PAYMENT", left, y);
        y += 12;
        doc.font("Helvetica").fontSize(8.5).fillColor(mid).text(data.paymentLink, left, y, { link: data.paymentLink, underline: true });
        y += 16;
      }
      doc.moveTo(left, 790).lineTo(right, 790).strokeColor(line).lineWidth(0.5).stroke();
      doc.font("Helvetica").fontSize(7).fillColor(light).text("Easy US LLC is a brand of Fortuny Consulting LLC. 1209 Mountain Road Place NE, STE R, Albuquerque, NM 87110, USA", left, 798, { align: "center", width: contentW });
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
function generateOrderInvoice(orderData) {
  const invoiceData = {
    orderNumber: orderData.order.invoiceNumber || orderData.order.id.toString(),
    date: (orderData.order.createdAt || /* @__PURE__ */ new Date()).toISOString(),
    customer: {
      name: `${orderData.user.firstName || ""} ${orderData.user.lastName || ""}`.trim() || "Cliente",
      email: orderData.user.email,
      phone: orderData.user.phone || void 0,
      idType: orderData.user.idType || void 0,
      idNumber: orderData.user.idNumber || void 0,
      address: orderData.user.address || void 0,
      streetType: orderData.user.streetType || void 0,
      city: orderData.user.city || void 0,
      province: orderData.user.province || void 0,
      postalCode: orderData.user.postalCode || void 0,
      country: orderData.user.country || void 0
    },
    items: [{
      description: orderData.product.name,
      details: orderData.product.description,
      quantity: 1,
      unitPrice: orderData.order.originalAmount || orderData.order.amount,
      total: orderData.order.originalAmount || orderData.order.amount
    }],
    subtotal: orderData.order.originalAmount || orderData.order.amount,
    discount: orderData.order.discountAmount ? {
      code: orderData.order.discountCode || void 0,
      amount: orderData.order.discountAmount
    } : void 0,
    total: orderData.order.amount,
    currency: orderData.order.currency,
    status: orderData.order.status,
    isMaintenance: orderData.isMaintenance,
    bankAccounts: orderData.bankAccounts
  };
  return generateInvoicePdf(invoiceData);
}

// server/routes/orders.ts
function registerOrderRoutes(app2) {
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
      if (!order || order.userId !== req.session.userId && !req.session.isAdmin && !req.session.isSupport) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const [llcApp] = await db.select().from(llcApplications).where((0, import_drizzle_orm20.eq)(llcApplications.orderId, orderId)).limit(1);
      const [maintApp] = await db.select().from(maintenanceApplications).where((0, import_drizzle_orm20.eq)(maintenanceApplications.orderId, orderId)).limit(1);
      const activeAccounts = await storage.getActivePaymentAccounts();
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
        paymentLink: order.paymentLink || void 0,
        bankAccounts: activeAccounts.map((a) => ({ label: a.label, holder: a.holder, bankName: a.bankName, accountType: a.accountType, accountNumber: a.accountNumber, routingNumber: a.routingNumber, iban: a.iban, swift: a.swift, address: a.address }))
      });
      const invoiceNumber = llcApp?.requestCode || maintApp?.requestCode || order.invoiceNumber || `INV-${orderId}`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="Factura-${invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Invoice Error:", error);
      res.status(500).send("Error generating invoice");
    }
  });
  app2.post(api.orders.create.path, async (req, res) => {
    try {
      const { productId, email, password, ownerFullName, paymentMethod, discountCode, discountAmount } = req.body;
      const clientIp = getClientIp(req);
      const ipCheck = isIpBlockedFromOrders(clientIp);
      if (ipCheck.blocked) {
        logAudit({ action: "ip_order_blocked", details: { ip: clientIp, ordersCount: ipCheck.ordersCount } });
        return res.status(429).json({
          message: "Request limit reached from this connection. Please try again later or contact support.",
          code: "IP_ORDER_LIMIT"
        });
      }
      const parsedInput = api.orders.create.input.parse({ productId });
      let userId;
      let isNewUser = false;
      if (req.session?.userId) {
        const [currentUser] = await db.select().from(users).where((0, import_drizzle_orm20.eq)(users.id, req.session.userId)).limit(1);
        if (currentUser && (currentUser.accountStatus === "pending" || currentUser.accountStatus === "deactivated")) {
          return res.status(403).json({ message: "Your account is under review or deactivated. You cannot place new orders at this time." });
        }
        userId = req.session.userId;
      } else {
        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required to place an order." });
        }
        if (password.length < 8) {
          return res.status(400).json({ message: "Password must be at least 8 characters." });
        }
        const [existingUser] = await db.select().from(users).where((0, import_drizzle_orm20.eq)(users.email, email)).limit(1);
        if (existingUser) {
          return res.status(400).json({ message: "This email is already registered. Please log in." });
        }
        const [otpRecord] = await db.select().from(contactOtps).where(
          (0, import_drizzle_orm20.and)(
            (0, import_drizzle_orm20.eq)(contactOtps.email, email),
            (0, import_drizzle_orm20.eq)(contactOtps.otpType, "account_verification"),
            (0, import_drizzle_orm20.eq)(contactOtps.verified, true),
            (0, import_drizzle_orm20.gt)(contactOtps.expiresAt, new Date(Date.now() - 30 * 60 * 1e3))
            // Allow 30 min window after verification
          )
        ).orderBy(import_drizzle_orm20.sql`${contactOtps.expiresAt} DESC`).limit(1);
        if (!otpRecord) {
          return res.status(400).json({ message: "Please verify your email before continuing." });
        }
        const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth_service(), auth_service_exports));
        const { generateUniqueClientId: generateUniqueClientId2 } = await Promise.resolve().then(() => (init_id_generator(), id_generator_exports));
        const passwordHash = await hashPassword2(password);
        const clientId = await generateUniqueClientId2();
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
        const oLang = req.body.preferredLanguage || "es";
        sendEmail({
          to: email,
          subject: getWelcomeEmailSubject(oLang),
          html: getWelcomeEmailTemplate(nameParts[0] || void 0, oLang)
        }).catch(console.error);
      }
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(400).json({ message: "Invalid product" });
      }
      let finalPrice = product.price;
      if (product.name.includes("New Mexico")) finalPrice = 73900;
      else if (product.name.includes("Wyoming")) finalPrice = 89900;
      else if (product.name.includes("Delaware")) finalPrice = 139900;
      let originalAmount = finalPrice;
      let appliedDiscountAmount = 0;
      let appliedDiscountCode = null;
      if (discountCode && discountAmount) {
        appliedDiscountCode = discountCode;
        appliedDiscountAmount = discountAmount;
        finalPrice = Math.max(0, finalPrice - discountAmount);
        await db.update(discountCodes).set({ usedCount: import_drizzle_orm20.sql`${discountCodes.usedCount} + 1` }).where((0, import_drizzle_orm20.eq)(discountCodes.code, discountCode.toUpperCase()));
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
        eventType: "i18n:dashboard.tracking.orderReceived",
        description: `i18n:ntf.orderCreated.message::{"productName":"${product.name}"}`,
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
          title: "i18n:ntf.orderCreated.title",
          message: `i18n:ntf.orderCreated.message::{"productName":"${product.name}"}`,
          type: "info",
          isRead: false
        });
      }
      const { generateUniqueOrderCode: generateUniqueOrderCode2 } = await Promise.resolve().then(() => (init_id_generator(), id_generator_exports));
      const appState = product.name.split(" ")[0] || "New Mexico";
      const requestCode = await generateUniqueOrderCode2(appState);
      const updatedApplication = await storage.updateLlcApplication(application.id, { requestCode });
      trackOrderByIp(clientIp);
      logActivity2("Nuevo Pedido Recibido", {
        "Referencia": requestCode,
        "Producto": product.name,
        "Importe": `${(finalPrice / 100).toFixed(2)}\u20AC`,
        "Usuario": userId,
        "IP": req.ip
      });
      res.status(201).json({ ...order, application: updatedApplication });
    } catch (err) {
      if (err instanceof import_zod9.z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Error creating order:", err);
      return res.status(500).json({ message: "Error creating order" });
    }
  });
  app2.get("/api/orders/:id/events", isAuthenticated, async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (order.userId !== req.session.userId && !req.session.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      const events = await db.select().from(orderEvents).where((0, import_drizzle_orm20.eq)(orderEvents.orderId, orderId)).orderBy((0, import_drizzle_orm20.desc)(orderEvents.createdAt));
      res.json(events);
    } catch (error) {
      console.error("Error fetching order events:", error);
      res.status(500).json({ message: "Error fetching events" });
    }
  });
}

// server/routes/llc.ts
var import_zod10 = require("zod");
var import_drizzle_orm21 = require("drizzle-orm");
init_schema();
init_email();
init_email_translations();
function registerLlcRoutes(app2) {
  app2.post("/api/llc/claim-order", async (req, res) => {
    try {
      const { applicationId, email, password, ownerFullName, paymentMethod, discountCode, discountAmount } = req.body;
      if (!applicationId || !email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters." });
      }
      const [existingUser] = await db.select().from(users).where((0, import_drizzle_orm21.eq)(users.email, email)).limit(1);
      if (existingUser) {
        if (existingUser.isActive === false || existingUser.accountStatus === "deactivated") {
          return res.status(403).json({
            message: "Your account has been deactivated. Contact our support team for more information.",
            code: "ACCOUNT_DEACTIVATED"
          });
        }
        return res.status(400).json({ message: "This email is already registered. Please log in." });
      }
      const [otpRecord] = await db.select().from(contactOtps).where(
        (0, import_drizzle_orm21.and)(
          (0, import_drizzle_orm21.eq)(contactOtps.email, email),
          (0, import_drizzle_orm21.eq)(contactOtps.otpType, "account_verification"),
          (0, import_drizzle_orm21.eq)(contactOtps.verified, true),
          (0, import_drizzle_orm21.gt)(contactOtps.expiresAt, new Date(Date.now() - 30 * 60 * 1e3))
        )
      ).orderBy(import_drizzle_orm21.sql`${contactOtps.expiresAt} DESC`).limit(1);
      if (!otpRecord) {
        return res.status(400).json({ message: "Please verify your email before continuing." });
      }
      const application = await storage.getLlcApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Request not found." });
      }
      const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth_service(), auth_service_exports));
      const { generateUniqueClientId: generateUniqueClientId2 } = await Promise.resolve().then(() => (init_id_generator(), id_generator_exports));
      const passwordHash = await hashPassword2(password);
      const clientId = await generateUniqueClientId2();
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
      const orderUpdate = { userId: newUser.id };
      if (discountCode && discountAmount) {
        orderUpdate.discountCode = discountCode;
        orderUpdate.discountAmount = discountAmount;
        await db.update(discountCodes).set({ usedCount: import_drizzle_orm21.sql`${discountCodes.usedCount} + 1` }).where((0, import_drizzle_orm21.eq)(discountCodes.code, discountCode));
      }
      await db.update(orders).set(orderUpdate).where((0, import_drizzle_orm21.eq)(orders.id, application.orderId));
      if (paymentMethod) {
        await storage.updateLlcApplication(applicationId, { paymentMethod });
      }
      req.session.userId = newUser.id;
      const llcLang = req.body.preferredLanguage || "es";
      sendEmail({
        to: email,
        subject: getWelcomeEmailSubject(llcLang),
        html: getWelcomeEmailTemplate(nameParts[0] || void 0, llcLang)
      }).catch(console.error);
      res.json({ success: true, userId: newUser.id });
    } catch (error) {
      console.error("Error claiming order:", error);
      res.status(500).json({ message: "Error creating account." });
    }
  });
  app2.patch("/api/llc/:id/data", isAuthenticated, async (req, res) => {
    try {
      const appId = Number(req.params.id);
      const updates = req.body;
      const [existingApp] = await db.select({ ein: llcApplications.ein, orderId: llcApplications.orderId }).from(llcApplications).where((0, import_drizzle_orm21.eq)(llcApplications.id, appId)).limit(1);
      if (!existingApp) {
        return res.status(404).json({ message: "Application not found" });
      }
      if (existingApp.ein && !req.session.isAdmin) {
        return res.status(403).json({ message: "Data cannot be modified after EIN assignment. Contact support." });
      }
      if (existingApp.orderId && !req.session.isAdmin) {
        const [order] = await db.select().from(orders).where((0, import_drizzle_orm21.eq)(orders.id, existingApp.orderId)).limit(1);
        if (order && order.userId !== req.session.userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const [updated] = await db.update(llcApplications).set({ ...updates, lastUpdated: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm21.eq)(llcApplications.id, appId)).returning();
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
    if (!req.session.userId && !req.session.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (application.orderId) {
      const [order] = await db.select().from(orders).where((0, import_drizzle_orm21.eq)(orders.id, application.orderId)).limit(1);
      if (order && order.userId !== req.session.userId && !req.session.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
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
      if (application.orderId && !req.session.isAdmin) {
        const [order] = await db.select().from(orders).where((0, import_drizzle_orm21.eq)(orders.id, application.orderId)).limit(1);
        if (order && order.userId && order.userId !== req.session.userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      const updatedApp = await storage.updateLlcApplication(appId, updates);
      if (updates.status === "submitted" && updatedApp.ownerEmail) {
        const orderIdentifier = updatedApp.requestCode || `#${updatedApp.id}`;
        const [order] = await db.select().from(orders).where((0, import_drizzle_orm21.eq)(orders.id, updatedApp.orderId)).limit(1);
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
      if (err instanceof import_zod10.z.ZodError) {
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
      return res.status(404).json({ message: "Request not found. Verify the code entered." });
    }
    if (application.orderId) {
      const [order] = await db.select().from(orders).where((0, import_drizzle_orm21.eq)(orders.id, application.orderId)).limit(1);
      if (order && order.userId && req.session.userId !== order.userId && !req.session.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    res.json(application);
  });
  app2.post(api.documents.create.path, isAuthenticated, async (req, res) => {
    try {
      const docData = api.documents.create.input.parse(req.body);
      if (docData.applicationId) {
        const application = await storage.getLlcApplication(docData.applicationId);
        if (!application) {
          return res.status(404).json({ message: "Application not found" });
        }
        if (application.orderId && !req.session.isAdmin) {
          const [order] = await db.select().from(orders).where((0, import_drizzle_orm21.eq)(orders.id, application.orderId)).limit(1);
          if (order && order.userId && order.userId !== req.session.userId) {
            return res.status(403).json({ message: "Access denied" });
          }
        }
      }
      const document = await storage.createDocument(docData);
      res.status(201).json(document);
    } catch (err) {
      if (err instanceof import_zod10.z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  const MAX_FILE_SIZE_MB2 = 5;
  const MAX_FILE_SIZE_BYTES2 = MAX_FILE_SIZE_MB2 * 1024 * 1024;
  app2.post("/api/user/documents/upload", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authorized" });
      }
      const userOrders = await storage.getOrders(userId);
      const pendingRequests = await db.select().from(userNotifications).where((0, import_drizzle_orm21.and)(
        (0, import_drizzle_orm21.eq)(userNotifications.userId, userId),
        (0, import_drizzle_orm21.eq)(userNotifications.type, "action_required"),
        (0, import_drizzle_orm21.eq)(userNotifications.isRead, false)
      ));
      const hasOrdersOrRequests = userOrders.length > 0 || pendingRequests.length > 0;
      const busboy = (await import("busboy")).default;
      const bb = busboy({
        headers: req.headers,
        limits: { fileSize: MAX_FILE_SIZE_BYTES2 }
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
      const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];
      const ALLOWED_MIMES = ["application/pdf", "image/jpeg", "image/png"];
      let detectedMime = "";
      bb.on("file", (name, file, info) => {
        fileName = info.filename || `documento_${Date.now()}`;
        detectedMime = info.mimeType || "";
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
          return res.status(413).json({ message: `File exceeds the ${MAX_FILE_SIZE_MB2}MB size limit` });
        }
        if (!fileBuffer) {
          return res.status(400).json({ message: "No file received" });
        }
        const ext = fileName.toLowerCase().split(".").pop() || "";
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          return res.status(400).json({ message: "File type not allowed. Only accepted: PDF, JPG, JPEG, PNG" });
        }
        if (!ALLOWED_MIMES.includes(detectedMime)) {
          return res.status(400).json({ message: "Invalid file format" });
        }
        const fs6 = await import("fs/promises");
        const path7 = await import("path");
        const uploadDir = path7.join(process.cwd(), "uploads", "client-docs");
        await fs6.mkdir(uploadDir, { recursive: true });
        const safeFileName = `${userId}_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const filePath = path7.join(uploadDir, safeFileName);
        await fs6.writeFile(filePath, fileBuffer);
        const { generateUniqueMessageId: generateUniqueMessageId2 } = await Promise.resolve().then(() => (init_id_generator(), id_generator_exports));
        const ticketId = await generateUniqueMessageId2();
        const docTypeLabelsUpload = {
          "passport": { es: "Pasaporte / Documento de Identidad", en: "Passport / ID Document", ca: "Passaport / Document d'Identitat", fr: "Passeport / Pi\xE8ce d'identit\xE9", de: "Reisepass / Ausweis", it: "Passaporto / Documento d'identit\xE0", pt: "Passaporte / Documento de Identidade" },
          "address_proof": { es: "Comprobante de Domicilio", en: "Proof of Address", ca: "Comprovant de Domicili", fr: "Justificatif de domicile", de: "Adressnachweis", it: "Prova di indirizzo", pt: "Comprovante de Endere\xE7o" },
          "tax_id": { es: "Identificaci\xF3n Fiscal", en: "Tax ID", ca: "Identificaci\xF3 Fiscal", fr: "Identification fiscale", de: "Steuer-ID", it: "Codice fiscale", pt: "Identifica\xE7\xE3o Fiscal" },
          "other": { es: "Otro Documento", en: "Other Document", ca: "Altre Document", fr: "Autre document", de: "Anderes Dokument", it: "Altro documento", pt: "Outro Documento" }
        };
        const userForLang = await db.select({ preferredLanguage: users.preferredLanguage }).from(users).where((0, import_drizzle_orm21.eq)(users.id, userId)).limit(1);
        const userLang = userForLang[0]?.preferredLanguage || "es";
        const docTypeLabel = docTypeLabelsUpload[documentType]?.[userLang] || docTypeLabelsUpload[documentType]?.es || documentType;
        let targetOrderId = null;
        if (userOrders.length > 0) {
          targetOrderId = userOrders[0].id;
        } else if (pendingRequests.length > 0 && pendingRequests[0].orderId) {
          targetOrderId = pendingRequests[0].orderId;
        }
        const mimeTypesMap = {
          "pdf": "application/pdf",
          "jpg": "image/jpeg",
          "jpeg": "image/jpeg",
          "png": "image/png"
        };
        const fileExt = fileName.toLowerCase().split(".").pop() || "";
        const detectedFileType = mimeTypesMap[fileExt] || "application/octet-stream";
        const doc = await db.insert(applicationDocuments).values({
          orderId: targetOrderId,
          fileName,
          fileType: detectedFileType,
          fileUrl: `/uploads/client-docs/${safeFileName}`,
          documentType,
          reviewStatus: "pending",
          uploadedBy: userId
        }).returning();
        const userData = await db.select().from(users).where((0, import_drizzle_orm21.eq)(users.id, userId)).limit(1);
        const user = userData[0];
        if (user) {
          const { encrypt: encrypt2 } = await Promise.resolve().then(() => (init_encryption(), encryption_exports));
          const docSubjects = {
            es: `Documento Recibido: ${docTypeLabel}`,
            en: `Document Received: ${docTypeLabel}`,
            ca: `Document Rebut: ${docTypeLabel}`,
            fr: `Document Re\xE7u: ${docTypeLabel}`,
            de: `Dokument Erhalten: ${docTypeLabel}`,
            it: `Documento Ricevuto: ${docTypeLabel}`,
            pt: `Documento Recebido: ${docTypeLabel}`
          };
          const docMessages = {
            es: (type, n) => `Tu documento ha sido recibido correctamente.

Tipo: ${type}${n}

Nuestro equipo lo revisar\xE1 pronto. Recibir\xE1s una notificaci\xF3n cuando sea procesado.`,
            en: (type, n) => `Your document has been received successfully.

Type: ${type}${n}

Our team will review it shortly. You will receive a notification when it is processed.`,
            ca: (type, n) => `El teu document ha estat rebut correctament.

Tipus: ${type}${n}

El nostre equip el revisar\xE0 aviat. Rebr\xE0s una notificaci\xF3 quan sigui processat.`,
            fr: (type, n) => `Votre document a \xE9t\xE9 re\xE7u avec succ\xE8s.

Type: ${type}${n}

Notre \xE9quipe l'examinera bient\xF4t. Vous recevrez une notification lorsqu'il sera trait\xE9.`,
            de: (type, n) => `Ihr Dokument wurde erfolgreich empfangen.

Typ: ${type}${n}

Unser Team wird es in K\xFCrze pr\xFCfen. Sie erhalten eine Benachrichtigung, wenn es bearbeitet wird.`,
            it: (type, n) => `Il tuo documento \xE8 stato ricevuto correttamente.

Tipo: ${type}${n}

Il nostro team lo esaminer\xE0 a breve. Riceverai una notifica quando sar\xE0 elaborato.`,
            pt: (type, n) => `O seu documento foi recebido com sucesso.

Tipo: ${type}${n}

A nossa equipa ir\xE1 rev\xEA-lo em breve. Receber\xE1 uma notifica\xE7\xE3o quando for processado.`
          };
          const notesLabels = { es: "Notas", en: "Notes", ca: "Notes", fr: "Notes", de: "Notizen", it: "Note", pt: "Notas" };
          const notesText = documentType === "other" && notes ? `
${notesLabels[userLang] || "Notas"}: ${notes}` : "";
          const userVisibleContent = (docMessages[userLang] || docMessages.es)(docTypeLabel, notesText);
          const adminInternalContent = `[ADMIN] Archivo: ${fileName} | Ruta: ${doc[0].fileUrl}`;
          const clientLabels = { es: "Cliente", en: "Client", ca: "Client", fr: "Client", de: "Kunde", it: "Cliente", pt: "Cliente" };
          await db.insert(messages).values({
            userId,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || clientLabels[userLang] || "Cliente",
            email: user.email || "sin-email@cliente.com",
            subject: docSubjects[userLang] || docSubjects.es,
            content: userVisibleContent,
            encryptedContent: encrypt2(adminInternalContent),
            type: "support",
            status: "unread",
            messageId: ticketId
          });
        }
        if (pendingRequests.length > 0) {
          await db.update(userNotifications).set({ isRead: true }).where((0, import_drizzle_orm21.and)(
            (0, import_drizzle_orm21.eq)(userNotifications.userId, userId),
            (0, import_drizzle_orm21.eq)(userNotifications.type, "action_required")
          ));
        }
        const safeDoc = { id: doc[0].id, documentType: doc[0].documentType, reviewStatus: doc[0].reviewStatus, uploadedAt: doc[0].uploadedAt };
        res.json({ success: true, document: safeDoc, ticketId });
      });
      req.pipe(bb);
    } catch (error) {
      console.error("Client upload error:", error);
      res.status(500).json({ message: "Error uploading document" });
    }
  });
  app2.post("/api/llc/:id/pay", isAdmin, async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      const application = await storage.getLlcApplication(appId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      if (application.orderId) {
        await storage.updateOrderStatus(application.orderId, "paid");
        logAudit({
          action: "payment_received",
          userId: req.session.userId,
          targetId: application.orderId.toString(),
          details: { applicationId: appId, markedBy: "admin" }
        });
      }
      await storage.updateLlcApplication(appId, { status: "submitted", paymentStatus: "paid" });
      res.json({ success: true, message: "Payment successful" });
    } catch (error) {
      console.error("Payment error:", error);
      res.status(500).json({ message: "Payment processing failed" });
    }
  });
}

// server/routes/maintenance.ts
var import_drizzle_orm22 = require("drizzle-orm");
init_schema();
init_email();
init_email_translations();
function registerMaintenanceRoutes(app2) {
  app2.post("/api/maintenance/claim-order", async (req, res) => {
    try {
      const { applicationId, email, password, ownerFullName, paymentMethod, discountCode, discountAmount } = req.body;
      if (!applicationId || !email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters." });
      }
      const [existingUser] = await db.select().from(users).where((0, import_drizzle_orm22.eq)(users.email, email)).limit(1);
      if (existingUser) {
        if (existingUser.isActive === false || existingUser.accountStatus === "deactivated") {
          return res.status(403).json({
            message: "Your account has been deactivated. Contact our support team for more information.",
            code: "ACCOUNT_DEACTIVATED"
          });
        }
        return res.status(400).json({ message: "This email is already registered. Please log in." });
      }
      const [otpRecord] = await db.select().from(contactOtps).where(
        (0, import_drizzle_orm22.and)(
          (0, import_drizzle_orm22.eq)(contactOtps.email, email),
          (0, import_drizzle_orm22.eq)(contactOtps.otpType, "account_verification"),
          (0, import_drizzle_orm22.eq)(contactOtps.verified, true),
          (0, import_drizzle_orm22.gt)(contactOtps.expiresAt, new Date(Date.now() - 30 * 60 * 1e3))
        )
      ).orderBy(import_drizzle_orm22.sql`${contactOtps.expiresAt} DESC`).limit(1);
      if (!otpRecord) {
        return res.status(400).json({ message: "Please verify your email before continuing." });
      }
      const [application] = await db.select().from(maintenanceApplications).where((0, import_drizzle_orm22.eq)(maintenanceApplications.id, applicationId)).limit(1);
      if (!application) {
        return res.status(404).json({ message: "Request not found." });
      }
      const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth_service(), auth_service_exports));
      const { generateUniqueClientId: generateUniqueClientId2 } = await Promise.resolve().then(() => (init_id_generator(), id_generator_exports));
      const passwordHash = await hashPassword2(password);
      const clientId = await generateUniqueClientId2();
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
      const orderUpdate = { userId: newUser.id };
      if (discountCode && discountAmount) {
        orderUpdate.discountCode = discountCode;
        orderUpdate.discountAmount = discountAmount;
        await db.update(discountCodes).set({ usedCount: import_drizzle_orm22.sql`${discountCodes.usedCount} + 1` }).where((0, import_drizzle_orm22.eq)(discountCodes.code, discountCode));
      }
      await db.update(orders).set(orderUpdate).where((0, import_drizzle_orm22.eq)(orders.id, application.orderId));
      if (paymentMethod) {
        await db.update(maintenanceApplications).set({ paymentMethod }).where((0, import_drizzle_orm22.eq)(maintenanceApplications.id, applicationId));
      }
      req.session.userId = newUser.id;
      const claimLang = req.body.preferredLanguage || "es";
      sendEmail({
        to: email,
        subject: getWelcomeEmailSubject(claimLang),
        html: getWelcomeEmailTemplate(nameParts[0] || void 0, claimLang)
      }).catch(console.error);
      res.json({ success: true, userId: newUser.id });
    } catch (error) {
      console.error("Error claiming maintenance order:", error);
      res.status(500).json({ message: "Error creating account." });
    }
  });
  app2.post("/api/maintenance/orders", async (req, res) => {
    try {
      const { productId, state, email, password, ownerFullName, paymentMethod, discountCode, discountAmount } = req.body;
      const clientIp = getClientIp(req);
      const ipCheck = isIpBlockedFromOrders(clientIp);
      if (ipCheck.blocked) {
        logAudit({ action: "ip_order_blocked", details: { ip: clientIp, ordersCount: ipCheck.ordersCount } });
        return res.status(429).json({
          message: "Request limit reached from this connection. Please try again later or contact support.",
          code: "IP_ORDER_LIMIT"
        });
      }
      let userId;
      let isNewUser = false;
      if (req.session?.userId) {
        const [currentUser] = await db.select().from(users).where((0, import_drizzle_orm22.eq)(users.id, req.session.userId)).limit(1);
        if (currentUser && (currentUser.accountStatus === "pending" || currentUser.accountStatus === "deactivated")) {
          return res.status(403).json({ message: "Your account is under review or deactivated. You cannot place new orders at this time." });
        }
        const suspiciousCheck = await detectSuspiciousOrderActivity(req.session.userId);
        if (suspiciousCheck.suspicious) {
          await flagAccountForReview(req.session.userId, suspiciousCheck.reason || "Suspicious order activity");
          return res.status(403).json({
            message: "Your account has been placed under review due to unusual activity. Our team will review it soon.",
            code: "ACCOUNT_UNDER_REVIEW"
          });
        }
        userId = req.session.userId;
      } else {
        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required to place an order." });
        }
        if (password.length < 8) {
          return res.status(400).json({ message: "Password must be at least 8 characters." });
        }
        const [existingUser] = await db.select().from(users).where((0, import_drizzle_orm22.eq)(users.email, email)).limit(1);
        if (existingUser) {
          return res.status(400).json({ message: "This email is already registered. Please log in." });
        }
        const [otpRecord] = await db.select().from(contactOtps).where(
          (0, import_drizzle_orm22.and)(
            (0, import_drizzle_orm22.eq)(contactOtps.email, email),
            (0, import_drizzle_orm22.eq)(contactOtps.otpType, "account_verification"),
            (0, import_drizzle_orm22.eq)(contactOtps.verified, true),
            (0, import_drizzle_orm22.gt)(contactOtps.expiresAt, new Date(Date.now() - 30 * 60 * 1e3))
          )
        ).orderBy(import_drizzle_orm22.sql`${contactOtps.expiresAt} DESC`).limit(1);
        const isEmailVerified = !!otpRecord;
        const accountStatus = isEmailVerified ? "active" : "pending";
        const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth_service(), auth_service_exports));
        const { generateUniqueClientId: generateUniqueClientId2 } = await Promise.resolve().then(() => (init_id_generator(), id_generator_exports));
        const passwordHash = await hashPassword2(password);
        const clientId = await generateUniqueClientId2();
        const nameParts = ownerFullName?.split(" ") || ["Cliente"];
        const [newUser] = await db.insert(users).values({
          email,
          passwordHash,
          clientId,
          firstName: nameParts[0] || "Cliente",
          lastName: nameParts.slice(1).join(" ") || "",
          emailVerified: isEmailVerified,
          accountStatus
        }).returning();
        userId = newUser.id;
        isNewUser = true;
        req.session.userId = userId;
        const mLang = req.body.preferredLanguage || "es";
        if (isEmailVerified) {
          sendEmail({
            to: email,
            subject: getWelcomeEmailSubject(mLang),
            html: getWelcomeEmailTemplate(nameParts[0] || void 0, mLang)
          }).catch(console.error);
        } else {
          sendEmail({
            to: email,
            subject: getVerifyEmailSubject(mLang),
            html: getAccountPendingVerificationTemplate(nameParts[0] || void 0, mLang)
          }).catch(console.error);
        }
      }
      const product = await storage.getProduct(productId);
      if (!product) return res.status(400).json({ message: "Invalid product" });
      let finalPrice = product.price;
      if (state?.includes("New Mexico")) finalPrice = 53900;
      else if (state?.includes("Wyoming")) finalPrice = 69900;
      else if (state?.includes("Delaware")) finalPrice = 99900;
      let originalAmount = finalPrice;
      let appliedDiscountAmount = 0;
      let appliedDiscountCode = null;
      if (discountCode && discountAmount) {
        appliedDiscountCode = discountCode;
        appliedDiscountAmount = discountAmount;
        finalPrice = Math.max(0, finalPrice - discountAmount);
        await db.update(discountCodes).set({ usedCount: import_drizzle_orm22.sql`${discountCodes.usedCount} + 1` }).where((0, import_drizzle_orm22.eq)(discountCodes.code, discountCode.toUpperCase()));
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
      await db.update(maintenanceApplications).set({ requestCode }).where((0, import_drizzle_orm22.eq)(maintenanceApplications.id, application.id));
      if (userId && !userId.startsWith("guest_")) {
        await db.insert(userNotifications).values({
          userId,
          orderId: order.id,
          orderCode: requestCode,
          title: "i18n:ntf.maintenanceSubmitted.title",
          message: `i18n:ntf.maintenanceSubmitted.message::{"requestCode":"${requestCode}"}`,
          type: "info",
          isRead: false
        });
      }
      trackOrderByIp(clientIp);
      res.status(201).json({ ...order, application: { ...application, requestCode } });
    } catch (err) {
      console.error("Error creating maintenance order:", err);
      res.status(500).json({ message: "Error creating maintenance order" });
    }
  });
  app2.put("/api/maintenance/:id", isAuthenticated, async (req, res) => {
    try {
      const appId = Number(req.params.id);
      const updates = req.body;
      const [existingApp] = await db.select().from(maintenanceApplications).where((0, import_drizzle_orm22.eq)(maintenanceApplications.id, appId)).limit(1);
      if (!existingApp) {
        return res.status(404).json({ message: "Request not found" });
      }
      if (existingApp.orderId) {
        const [order] = await db.select().from(orders).where((0, import_drizzle_orm22.eq)(orders.id, existingApp.orderId)).limit(1);
        if (order && order.userId && order.userId !== req.session.userId && !req.session.isAdmin) {
          return res.status(403).json({ message: "Not authorized" });
        }
      }
      const [updatedApp] = await db.update(maintenanceApplications).set({ ...updates, lastUpdated: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm22.eq)(maintenanceApplications.id, appId)).returning();
      if (!updatedApp) {
        return res.status(404).json({ message: "Request not found" });
      }
      if (updates.status === "submitted") {
        const orderIdentifier = updatedApp.requestCode || `MN-${updatedApp.id}`;
        const [order] = await db.select().from(orders).where((0, import_drizzle_orm22.eq)(orders.id, updatedApp.orderId)).limit(1);
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
      res.status(500).json({ message: "Error updating request" });
    }
  });
}

// server/routes/accounting.ts
init_schema();
var import_drizzle_orm23 = require("drizzle-orm");
function registerAccountingRoutes(app2) {
  app2.get("/api/admin/accounting/transactions", isAdmin, async (req, res) => {
    try {
      const { type, category, startDate, endDate } = req.query;
      let query = db.select().from(accountingTransactions);
      const conditions = [];
      if (type && typeof type === "string") {
        conditions.push((0, import_drizzle_orm23.eq)(accountingTransactions.type, type));
      }
      if (category && typeof category === "string") {
        conditions.push((0, import_drizzle_orm23.eq)(accountingTransactions.category, category));
      }
      if (startDate && typeof startDate === "string") {
        conditions.push(import_drizzle_orm23.sql`${accountingTransactions.transactionDate} >= ${new Date(startDate)}`);
      }
      if (endDate && typeof endDate === "string") {
        conditions.push(import_drizzle_orm23.sql`${accountingTransactions.transactionDate} <= ${new Date(endDate)}`);
      }
      const transactions = await db.select().from(accountingTransactions).where(conditions.length > 0 ? (0, import_drizzle_orm23.and)(...conditions) : void 0).orderBy((0, import_drizzle_orm23.desc)(accountingTransactions.transactionDate));
      res.json(transactions);
    } catch (err) {
      console.error("Error fetching accounting transactions:", err);
      res.status(500).json({ message: "Error fetching transactions" });
    }
  });
  app2.get("/api/admin/accounting/summary", isAdmin, async (req, res) => {
    try {
      const { period } = req.query;
      let startDate = null;
      const now = /* @__PURE__ */ new Date();
      if (period === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === "year") {
        startDate = new Date(now.getFullYear(), 0, 1);
      }
      const dateCondition = startDate ? import_drizzle_orm23.sql`${accountingTransactions.transactionDate} >= ${startDate}` : import_drizzle_orm23.sql`1=1`;
      const [incomeResult] = await db.select({ total: import_drizzle_orm23.sql`COALESCE(SUM(amount), 0)` }).from(accountingTransactions).where((0, import_drizzle_orm23.and)((0, import_drizzle_orm23.eq)(accountingTransactions.type, "income"), dateCondition));
      const [expenseResult] = await db.select({ total: import_drizzle_orm23.sql`COALESCE(SUM(ABS(amount)), 0)` }).from(accountingTransactions).where((0, import_drizzle_orm23.and)((0, import_drizzle_orm23.eq)(accountingTransactions.type, "expense"), dateCondition));
      const totalIncome = Number(incomeResult?.total || 0);
      const totalExpenses = Number(expenseResult?.total || 0);
      const categoryBreakdown = await db.select({
        category: accountingTransactions.category,
        type: accountingTransactions.type,
        total: import_drizzle_orm23.sql`SUM(ABS(amount))`
      }).from(accountingTransactions).where(dateCondition).groupBy(accountingTransactions.category, accountingTransactions.type);
      res.json({
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        categoryBreakdown
      });
    } catch (err) {
      console.error("Error fetching accounting summary:", err);
      res.status(500).json({ message: "Error fetching accounting summary" });
    }
  });
  app2.post("/api/admin/accounting/transactions", isAdmin, async (req, res) => {
    try {
      const { type, category, amount, currency, description, orderId, userId, reference, transactionDate, notes } = req.body;
      if (!type || !category || amount === void 0) {
        return res.status(400).json({ message: "Missing required data" });
      }
      const amountCents = Math.round(Number(amount) * 100);
      const [transaction] = await db.insert(accountingTransactions).values({
        type,
        category,
        amount: type === "expense" ? -Math.abs(amountCents) : Math.abs(amountCents),
        currency: currency || "EUR",
        description,
        orderId: orderId || null,
        userId: userId || null,
        reference,
        transactionDate: transactionDate ? new Date(transactionDate) : /* @__PURE__ */ new Date(),
        createdBy: req.session?.userId,
        notes
      }).returning();
      logAudit({
        action: "accounting_transaction_created",
        userId: req.session?.userId,
        targetId: String(transaction.id),
        details: { type, category, amount: amountCents }
      });
      res.json(transaction);
    } catch (err) {
      console.error("Error creating transaction:", err);
      res.status(500).json({ message: "Error creating transaction" });
    }
  });
  app2.patch("/api/admin/accounting/transactions/:id", isAdmin, async (req, res) => {
    try {
      const txId = Number(req.params.id);
      const { type, category, amount, currency, description, reference, transactionDate, notes } = req.body;
      const updateData = { updatedAt: /* @__PURE__ */ new Date() };
      if (type) updateData.type = type;
      if (category) updateData.category = category;
      if (amount !== void 0) {
        const amountCents = Math.round(Number(amount) * 100);
        updateData.amount = type === "expense" ? -Math.abs(amountCents) : Math.abs(amountCents);
      }
      if (currency) updateData.currency = currency;
      if (description !== void 0) updateData.description = description;
      if (reference !== void 0) updateData.reference = reference;
      if (transactionDate) updateData.transactionDate = new Date(transactionDate);
      if (notes !== void 0) updateData.notes = notes;
      const [updated] = await db.update(accountingTransactions).set(updateData).where((0, import_drizzle_orm23.eq)(accountingTransactions.id, txId)).returning();
      logAudit({
        action: "accounting_transaction_updated",
        userId: req.session?.userId,
        targetId: String(txId),
        details: updateData
      });
      res.json(updated);
    } catch (err) {
      console.error("Error updating transaction:", err);
      res.status(500).json({ message: "Error updating transaction" });
    }
  });
  app2.delete("/api/admin/accounting/transactions/:id", isAdmin, async (req, res) => {
    try {
      const txId = Number(req.params.id);
      await db.delete(accountingTransactions).where((0, import_drizzle_orm23.eq)(accountingTransactions.id, txId));
      logAudit({
        action: "accounting_transaction_deleted",
        userId: req.session?.userId,
        targetId: String(txId)
      });
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting transaction:", err);
      res.status(500).json({ message: "Error deleting transaction" });
    }
  });
  app2.get("/api/admin/accounting/export-csv", isAdmin, async (req, res) => {
    try {
      const { startDate, endDate, type, category } = req.query;
      const conditions = [];
      if (type && typeof type === "string") {
        conditions.push((0, import_drizzle_orm23.eq)(accountingTransactions.type, type));
      }
      if (category && typeof category === "string") {
        conditions.push((0, import_drizzle_orm23.eq)(accountingTransactions.category, category));
      }
      if (startDate && typeof startDate === "string") {
        conditions.push(import_drizzle_orm23.sql`${accountingTransactions.transactionDate} >= ${new Date(startDate)}`);
      }
      if (endDate && typeof endDate === "string") {
        conditions.push(import_drizzle_orm23.sql`${accountingTransactions.transactionDate} <= ${new Date(endDate)}`);
      }
      const transactions = await db.select().from(accountingTransactions).where(conditions.length > 0 ? (0, import_drizzle_orm23.and)(...conditions) : void 0).orderBy((0, import_drizzle_orm23.desc)(accountingTransactions.transactionDate));
      const headers = ["ID", "Fecha", "Tipo", "Categor\xEDa", "Importe (\u20AC)", "Descripci\xF3n", "Referencia", "Notas"];
      const rows = transactions.map((tx) => [
        tx.id,
        tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString("es-ES") : "",
        tx.type === "income" ? "Ingreso" : "Gasto",
        tx.category,
        (tx.amount / 100).toFixed(2),
        tx.description || "",
        tx.reference || "",
        tx.notes || ""
      ]);
      const csvContent = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="transacciones_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv"`);
      res.send("\uFEFF" + csvContent);
    } catch (err) {
      console.error("Error exporting CSV:", err);
      res.status(500).json({ message: "Error exporting CSV" });
    }
  });
}

// server/routes/messages.ts
init_schema();
var import_drizzle_orm24 = require("drizzle-orm");
init_email();
function registerMessageRoutes(app2) {
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
        const [currentUser] = await db.select().from(users).where((0, import_drizzle_orm24.eq)(users.id, userId)).limit(1);
        if (currentUser?.accountStatus === "deactivated") {
          return res.status(403).json({ message: "Your account is deactivated. You cannot send messages." });
        }
        if (currentUser?.accountStatus === "pending") {
          return res.status(403).json({
            message: "Your account is under review. Our team is performing security checks.",
            code: "ACCOUNT_UNDER_REVIEW"
          });
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
      let userLang = "es";
      if (userId) {
        const [msgUser] = await db.select().from(users).where((0, import_drizzle_orm24.eq)(users.id, userId)).limit(1);
        if (msgUser?.preferredLanguage) userLang = msgUser.preferredLanguage;
      } else {
        const browserLang = req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || "es";
        if (["es", "en", "ca", "fr", "de", "it", "pt"].includes(browserLang)) userLang = browserLang;
      }
      const ticketSubjects = {
        es: `Recibimos tu mensaje - Ticket #${ticketId}`,
        en: `We received your message - Ticket #${ticketId}`,
        ca: `Hem rebut el teu missatge - Ticket #${ticketId}`,
        fr: `Nous avons re\xE7u votre message - Ticket #${ticketId}`,
        de: `Wir haben Ihre Nachricht erhalten - Ticket #${ticketId}`,
        it: `Abbiamo ricevuto il tuo messaggio - Ticket #${ticketId}`,
        pt: `Recebemos a sua mensagem - Ticket #${ticketId}`
      };
      sendEmail({
        to: email,
        subject: ticketSubjects[userLang] || ticketSubjects.es,
        html: getAutoReplyTemplate(name || "Cliente", ticketId, userLang)
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
  app2.get("/api/messages/:id/replies", isAuthenticated, async (req, res) => {
    try {
      const messageId = Number(req.params.id);
      const [message] = await db.select().from(messages).where((0, import_drizzle_orm24.eq)(messages.id, messageId)).limit(1);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      if (message.userId !== req.session.userId && !req.session.isAdmin && !req.session.isSupport) {
        return res.status(403).json({ message: "Access denied" });
      }
      const replies = await db.select().from(messageReplies).where((0, import_drizzle_orm24.eq)(messageReplies.messageId, messageId)).orderBy(messageReplies.createdAt);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching message replies:", error);
      res.status(500).json({ message: "Error fetching replies" });
    }
  });
  app2.post("/api/messages/:id/reply", isAuthenticated, async (req, res) => {
    try {
      const messageId = Number(req.params.id);
      const { content } = req.body;
      const [existingMessage] = await db.select().from(messages).where((0, import_drizzle_orm24.eq)(messages.id, messageId)).limit(1);
      if (!existingMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      if (existingMessage.userId !== req.session.userId && !req.session.isAdmin && !req.session.isSupport) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (!content || typeof content !== "string" || !content.trim()) {
        return res.status(400).json({ message: "El contenido de la respuesta es requerido" });
      }
      const [reply] = await db.insert(messageReplies).values({
        messageId,
        content,
        isAdmin: req.session.isAdmin || req.session.isSupport || false,
        createdBy: req.session.userId
      }).returning();
      const [message] = await db.select().from(messages).where((0, import_drizzle_orm24.eq)(messages.id, messageId)).limit(1);
      if (message?.email && (req.session.isAdmin || req.session.isSupport)) {
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
            title: "i18n:ntf.messageReply.title",
            message: `i18n:ntf.messageReply.message::{"ticketId":"${ticketId}"}`,
            type: "info",
            isRead: false
          });
        }
      }
      res.json(reply);
    } catch (error) {
      console.error("Error creating reply:", error);
      res.status(500).json({ message: "Error creating reply" });
    }
  });
}

// server/routes/contact.ts
var import_zod11 = require("zod");
init_schema();
var import_drizzle_orm25 = require("drizzle-orm");
init_security();
init_email();
init_email_translations();
function registerContactRoutes(app2) {
  app2.get("/api/newsletter/status", isAuthenticated, async (req, res) => {
    const isSubscribed = await storage.isSubscribedToNewsletter(req.session.email);
    res.json({ isSubscribed });
  });
  app2.post("/api/newsletter/unsubscribe", isAuthenticated, async (req, res) => {
    await db.delete(newsletterSubscribers).where((0, import_drizzle_orm25.eq)(newsletterSubscribers.email, req.session.email));
    res.json({ success: true });
  });
  app2.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = import_zod11.z.object({ email: import_zod11.z.string().email().optional() }).parse(req.body);
      const targetEmail = email || req.session?.email || null;
      if (!targetEmail) {
        return res.status(400).json({ message: "Email is required" });
      }
      const isSubscribed = await storage.isSubscribedToNewsletter(targetEmail);
      if (isSubscribed) {
        return res.json({ success: true, message: "Already subscribed" });
      }
      await storage.subscribeToNewsletter(targetEmail);
      await storage.createGuestVisitor({
        email: targetEmail,
        source: "newsletter",
        ip: getClientIp(req),
        userAgent: req.headers["user-agent"] || null,
        language: req.headers["accept-language"]?.split(",")[0] || null,
        page: req.headers["referer"] || null,
        referrer: null,
        metadata: null
      }).catch(() => {
      });
      const [user] = await db.select().from(users).where((0, import_drizzle_orm25.eq)(users.email, targetEmail)).limit(1);
      if (user) {
        await db.insert(userNotifications).values({
          userId: user.id,
          title: "i18n:ntf.newsletterSubscribed.title",
          message: "i18n:ntf.newsletterSubscribed.message",
          type: "info",
          isRead: false
        });
      }
      const nlLang = user?.preferredLanguage || req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || "es";
      const nlSubjects = {
        en: "Subscription confirmed - Easy US LLC",
        ca: "Subscripci\xF3 confirmada - Easy US LLC",
        fr: "Abonnement confirm\xE9 - Easy US LLC",
        de: "Abonnement best\xE4tigt - Easy US LLC",
        it: "Iscrizione confermata - Easy US LLC",
        pt: "Subscri\xE7\xE3o confirmada - Easy US LLC"
      };
      await sendEmail({
        to: targetEmail,
        subject: nlSubjects[nlLang] || "Confirmaci\xF3n de suscripci\xF3n a Easy US LLC",
        html: getNewsletterWelcomeTemplate(nlLang)
      }).catch(() => {
      });
      res.json({ success: true });
    } catch (err) {
      if (err instanceof import_zod11.z.ZodError) {
        return res.status(400).json({ message: "Invalid email" });
      }
      res.status(500).json({ message: "Error subscribing" });
    }
  });
  app2.post("/api/contact/send-otp", async (req, res) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = checkRateLimitInMemory("contact", ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({
          message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.`
        });
      }
      const { email } = import_zod11.z.object({ email: import_zod11.z.string().email() }).parse(req.body);
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
      await db.insert(contactOtps).values({
        email,
        otp,
        expiresAt
      });
      const cLang = req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || "es";
      const supportedContactLangs = ["es", "en", "ca", "fr", "de", "it", "pt"];
      const contactLang = supportedContactLangs.includes(cLang) ? cLang : "es";
      await sendEmail({
        to: email,
        subject: getOtpSubject(contactLang),
        html: getOtpEmailTemplate(otp, void 0, contactLang)
      });
      res.json({ success: true });
    } catch (err) {
      console.error("Error sending contact OTP:", err);
      res.status(400).json({ message: "Error sending verification code. Please try again in a few minutes." });
    }
  });
  app2.post("/api/contact/verify-otp", async (req, res) => {
    try {
      const { email, otp } = import_zod11.z.object({ email: import_zod11.z.string().email(), otp: import_zod11.z.string() }).parse(req.body);
      const [record] = await db.select().from(contactOtps).where(
        (0, import_drizzle_orm25.and)(
          (0, import_drizzle_orm25.eq)(contactOtps.email, email),
          (0, import_drizzle_orm25.eq)(contactOtps.otp, otp),
          (0, import_drizzle_orm25.gt)(contactOtps.expiresAt, /* @__PURE__ */ new Date())
        )
      ).limit(1);
      if (!record) {
        return res.status(400).json({ message: "The code has expired or is incorrect. Please request a new one." });
      }
      await db.update(contactOtps).set({ verified: true }).where((0, import_drizzle_orm25.eq)(contactOtps.id, record.id));
      res.json({ success: true });
    } catch (err) {
      console.error("Error verifying contact OTP:", err);
      res.status(400).json({ message: "Could not verify the code. Please try again." });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const contactData = import_zod11.z.object({
        nombre: import_zod11.z.string(),
        apellido: import_zod11.z.string(),
        email: import_zod11.z.string().email(),
        telefono: import_zod11.z.string().optional(),
        subject: import_zod11.z.string(),
        mensaje: import_zod11.z.string(),
        otp: import_zod11.z.string()
      }).parse(req.body);
      const sanitizedData = {
        nombre: sanitizeHtml(contactData.nombre),
        apellido: sanitizeHtml(contactData.apellido),
        subject: sanitizeHtml(contactData.subject),
        mensaje: sanitizeHtml(contactData.mensaje),
        telefono: contactData.telefono ? sanitizeHtml(contactData.telefono) : void 0
      };
      const [otpRecord] = await db.select().from(contactOtps).where(
        (0, import_drizzle_orm25.and)(
          (0, import_drizzle_orm25.eq)(contactOtps.email, contactData.email),
          (0, import_drizzle_orm25.eq)(contactOtps.otp, contactData.otp),
          (0, import_drizzle_orm25.eq)(contactOtps.verified, true)
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
      const contactLang = req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || "es";
      const validLang = ["es", "en", "ca", "fr", "de", "it", "pt"].includes(contactLang) ? contactLang : "es";
      const contactTicketSubjects = {
        es: `Hemos recibido tu mensaje - Ticket #${ticketId}`,
        en: `We received your message - Ticket #${ticketId}`,
        ca: `Hem rebut el teu missatge - Ticket #${ticketId}`,
        fr: `Nous avons re\xE7u votre message - Ticket #${ticketId}`,
        de: `Wir haben Ihre Nachricht erhalten - Ticket #${ticketId}`,
        it: `Abbiamo ricevuto il tuo messaggio - Ticket #${ticketId}`,
        pt: `Recebemos a sua mensagem - Ticket #${ticketId}`
      };
      await sendEmail({
        to: contactData.email,
        subject: contactTicketSubjects[validLang] || contactTicketSubjects.es,
        html: getAutoReplyTemplate(sanitizedData.nombre, ticketId, validLang)
      });
      await storage.createGuestVisitor({
        email: contactData.email,
        source: "contact",
        ip: clientIp,
        userAgent: req.headers["user-agent"] || null,
        language: req.headers["accept-language"]?.split(",")[0] || null,
        page: "/contacto",
        referrer: req.headers["referer"] || null,
        metadata: JSON.stringify({ name: `${sanitizedData.nombre} ${sanitizedData.apellido}`, subject: sanitizedData.subject })
      }).catch(() => {
      });
      logAudit({ action: "order_created", ip: clientIp, details: { ticketId, type: "contact" } });
      res.json({ success: true, ticketId });
    } catch (err) {
      console.error("Error processing contact form:", err);
      res.status(400).json({ message: "Error processing message" });
    }
  });
}

// server/routes/auth-ext.ts
var import_zod12 = require("zod");
init_schema();
var import_drizzle_orm26 = require("drizzle-orm");
init_security();
init_email();
init_email_translations();
function registerAuthExtRoutes(app2) {
  app2.post("/api/auth/check-email", async (req, res) => {
    try {
      const { email } = import_zod12.z.object({ email: import_zod12.z.string().email() }).parse(req.body);
      const [existingUser] = await db.select().from(users).where((0, import_drizzle_orm26.eq)(users.email, email)).limit(1);
      const isDeactivated = existingUser ? existingUser.isActive === false || existingUser.accountStatus === "deactivated" : false;
      res.json({
        exists: !!existingUser,
        deactivated: isDeactivated,
        firstName: existingUser?.firstName || null
      });
    } catch (err) {
      res.status(400).json({ message: "Invalid email" });
    }
  });
  app2.post("/api/register/send-otp", async (req, res) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = checkRateLimitInMemory("register", ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({
          message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.`
        });
      }
      const { email } = import_zod12.z.object({ email: import_zod12.z.string().email() }).parse(req.body);
      const [existingUser] = await db.select().from(users).where((0, import_drizzle_orm26.eq)(users.email, email)).limit(1);
      if (existingUser) {
        if (existingUser.isActive === false || existingUser.accountStatus === "deactivated") {
          return res.status(403).json({
            message: "Your account has been deactivated. Contact our support team for more information.",
            code: "ACCOUNT_DEACTIVATED"
          });
        }
        return res.status(400).json({ message: "This email is already registered. Please log in." });
      }
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
      await db.insert(contactOtps).values({
        email,
        otp,
        otpType: "account_verification",
        expiresAt
      });
      const browserLang = req.body.preferredLanguage || req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || "es";
      const supportedLangs = ["es", "en", "ca", "fr", "de", "it", "pt"];
      const lang = supportedLangs.includes(browserLang) ? browserLang : "es";
      await sendEmail({
        to: email,
        subject: getOtpSubject(lang),
        html: getOtpEmailTemplate(otp, void 0, lang)
      });
      logAudit({ action: "user_register", ip, details: { email, step: "otp_sent" } });
      res.json({ success: true });
    } catch (err) {
      console.error("Error sending registration OTP:", err);
      res.status(400).json({ message: "Error sending verification code." });
    }
  });
  app2.post("/api/register/verify-otp", async (req, res) => {
    try {
      const { email, otp } = import_zod12.z.object({ email: import_zod12.z.string().email(), otp: import_zod12.z.string() }).parse(req.body);
      const [record] = await db.select().from(contactOtps).where(
        (0, import_drizzle_orm26.and)(
          (0, import_drizzle_orm26.eq)(contactOtps.email, email),
          (0, import_drizzle_orm26.eq)(contactOtps.otp, otp),
          (0, import_drizzle_orm26.eq)(contactOtps.otpType, "account_verification"),
          (0, import_drizzle_orm26.gt)(contactOtps.expiresAt, /* @__PURE__ */ new Date())
        )
      ).limit(1);
      if (!record) {
        return res.status(400).json({ message: "The code has expired or is incorrect. Please request a new one." });
      }
      await db.update(contactOtps).set({ verified: true }).where((0, import_drizzle_orm26.eq)(contactOtps.id, record.id));
      res.json({ success: true });
    } catch (err) {
      console.error("Error verifying registration OTP:", err);
      res.status(400).json({ message: "Could not verify the code. Please try again." });
    }
  });
  app2.post("/api/password-reset/send-otp", async (req, res) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = checkRateLimitInMemory("passwordReset", ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({
          message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.`
        });
      }
      const { email } = import_zod12.z.object({ email: import_zod12.z.string().email() }).parse(req.body);
      const [existingUser] = await db.select().from(users).where((0, import_drizzle_orm26.eq)(users.email, email)).limit(1);
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
      const resetLang = existingUser?.preferredLanguage || "es";
      await sendEmail({
        to: email,
        subject: getOtpSubject(resetLang),
        html: getOtpEmailTemplate(otp, existingUser?.firstName || void 0, resetLang)
      });
      logAudit({ action: "password_reset", ip, details: { email } });
      res.json({ success: true });
    } catch (err) {
      console.error("Error sending password reset OTP:", err);
      res.status(400).json({ message: "Error sending verification code." });
    }
  });
  app2.post("/api/password-reset/confirm", async (req, res) => {
    try {
      const { email, otp, newPassword } = import_zod12.z.object({
        email: import_zod12.z.string().email(),
        otp: import_zod12.z.string(),
        newPassword: import_zod12.z.string().min(8, "Password must be at least 8 characters")
      }).parse(req.body);
      const [record] = await db.select().from(contactOtps).where(
        (0, import_drizzle_orm26.and)(
          (0, import_drizzle_orm26.eq)(contactOtps.email, email),
          (0, import_drizzle_orm26.eq)(contactOtps.otp, otp),
          (0, import_drizzle_orm26.eq)(contactOtps.otpType, "password_reset"),
          (0, import_drizzle_orm26.gt)(contactOtps.expiresAt, /* @__PURE__ */ new Date()),
          (0, import_drizzle_orm26.eq)(contactOtps.verified, false)
        )
      ).limit(1);
      if (!record) {
        return res.status(400).json({ message: "The code has expired or is incorrect. Please request a new one." });
      }
      const [user] = await db.select().from(users).where((0, import_drizzle_orm26.eq)(users.email, email)).limit(1);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth_service(), auth_service_exports));
      const passwordHash = await hashPassword2(newPassword);
      await db.update(users).set({ passwordHash, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm26.eq)(users.id, user.id));
      await db.update(contactOtps).set({ verified: true }).where((0, import_drizzle_orm26.eq)(contactOtps.id, record.id));
      res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
      console.error("Error resetting password:", err);
      if (err.errors) {
        return res.status(400).json({ message: err.errors[0]?.message || "Error resetting password" });
      }
      res.status(400).json({ message: "Error resetting password" });
    }
  });
}

// server/routes.ts
async function registerRoutes(httpServer2, app2) {
  setInterval(async () => {
    try {
      const cleanupPromise = db.delete(contactOtps).where(
        import_drizzle_orm27.sql`${contactOtps.expiresAt} < NOW()`
      );
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("OTP cleanup query timeout")), 15e3)
      );
      await Promise.race([cleanupPromise, timeoutPromise]);
    } catch (e) {
      console.error("OTP cleanup error:", e);
    }
  }, 6e5);
  app2.use("/api/", async (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"]?.toString().split(",")[0] || "unknown";
    const rateCheck = await checkRateLimit("api", ip);
    if (!rateCheck.allowed) {
      res.setHeader("Retry-After", String(rateCheck.retryAfter || 60));
      return res.status(429).json({ message: "Too many requests. Please wait a minute." });
    }
    next();
  });
  startIpTrackerCleanup();
  setupCustomAuth(app2);
  setupOAuth(app2);
  registerObjectStorageRoutes(app2);
  app2.use(csrfMiddleware);
  app2.get("/api/csrf-token", (req, res) => {
    getCsrfToken(req, res);
  });
  const csrfExemptPaths = [
    "/api/stripe/webhook",
    "/api/webhook"
  ];
  app2.use((req, res, next) => {
    const isExempt = csrfExemptPaths.some((path7) => req.path.startsWith(path7));
    const isMutatingMethod = !["GET", "HEAD", "OPTIONS"].includes(req.method);
    const isApiRoute = req.path.startsWith("/api/");
    if (isApiRoute && isMutatingMethod && !isExempt) {
      return validateCsrf(req, res, next);
    }
    next();
  });
  setInterval(async () => {
    try {
      await checkAndSendReminders();
    } catch (e) {
      console.error("Compliance reminder check error:", e);
    }
    try {
      await processAbandonedApplications();
    } catch (e) {
      console.error("Abandoned applications check error:", e);
    }
  }, 36e5);
  setTimeout(async () => {
    try {
      await checkAndSendReminders();
      console.log("Initial compliance reminder check completed");
    } catch (e) {
      console.error("Initial compliance reminder check error:", e);
    }
    try {
      await processAbandonedApplications();
      console.log("Initial abandoned applications check completed");
    } catch (e) {
      console.error("Initial abandoned applications check error:", e);
    }
    startBackupService();
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
  app2.post("/api/activity/track", async (req, res) => {
    const { action, details } = req.body;
    if (action === "CLICK_ELEGIR_ESTADO") {
      if (process.env.NODE_ENV === "development") {
        console.log(`[LOG] Selecci\xF3n de Estado:`, { "Detalles": details });
      }
    }
    res.json({ success: true });
  });
  registerAdminOrderRoutes(app2);
  registerAdminUserRoutes(app2);
  registerAdminBillingRoutes(app2);
  registerAdminCommsRoutes(app2);
  registerAdminDocumentsRoutes(app2);
  registerUserProfileRoutes(app2);
  registerOrderRoutes(app2);
  registerMessageRoutes(app2);
  registerLlcRoutes(app2);
  registerMaintenanceRoutes(app2);
  registerContactRoutes(app2);
  registerAuthExtRoutes(app2);
  registerConsultationRoutes(app2);
  registerAccountingRoutes(app2);
  try {
    await seedDatabase();
  } catch (e) {
    console.error("Database seeding error:", e);
  }
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
      price: 139900,
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
var import_express2 = __toESM(require("express"), 1);
var import_fs3 = __toESM(require("fs"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_url2 = require("url");
var import_meta2 = {};
function getDirname2() {
  try {
    if (typeof import_meta2?.url !== "undefined") {
      return import_path3.default.dirname((0, import_url2.fileURLToPath)(import_meta2.url));
    }
  } catch {
  }
  return import_path3.default.resolve();
}
var __dirname2 = getDirname2();
function serveStatic(app2) {
  const distPath = import_path3.default.resolve(__dirname2, "public");
  if (!import_fs3.default.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(import_express2.default.static(distPath, {
    maxAge: "1y",
    immutable: true,
    index: false,
    etag: true,
    lastModified: true
  }));
  app2.use("*", (_req, res) => {
    res.sendFile(import_path3.default.resolve(distPath, "index.html"), {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    });
  });
}

// server/index.ts
var import_http = require("http");
var import_compression = __toESM(require("compression"), 1);

// server/lib/sentry.ts
var Sentry = __toESM(require("@sentry/node"), 1);
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
var import_child_process = require("child_process");
var import_util = require("util");
var import_fs4 = __toESM(require("fs"), 1);
var import_path4 = __toESM(require("path"), 1);
var execAsync = (0, import_util.promisify)(import_child_process.exec);
var BACKUP_DIR = "/tmp/db-backups";
var MAX_BACKUPS = 7;
async function ensureBackupDir() {
  if (!import_fs4.default.existsSync(BACKUP_DIR)) {
    import_fs4.default.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}
async function cleanOldBackups() {
  const files = import_fs4.default.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".sql")).map((f) => ({
    name: f,
    path: import_path4.default.join(BACKUP_DIR, f),
    time: import_fs4.default.statSync(import_path4.default.join(BACKUP_DIR, f)).mtime.getTime()
  })).sort((a, b) => b.time - a.time);
  while (files.length > MAX_BACKUPS) {
    const oldest = files.pop();
    if (oldest) {
      import_fs4.default.unlinkSync(oldest.path);
      console.log(`[Backup] Deleted old backup: ${oldest.name}`);
    }
  }
}
async function createBackup() {
  try {
    await ensureBackupDir();
    const timestamp3 = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    const backupFile2 = import_path4.default.join(BACKUP_DIR, `backup-${timestamp3}.sql`);
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error("[Backup] DATABASE_URL not configured");
      return null;
    }
    const pgDumpCmd = `pg_dump "${databaseUrl}" --no-owner --no-acl -f "${backupFile2}"`;
    await execAsync(pgDumpCmd);
    await cleanOldBackups();
    console.log(`[Backup] Created successfully: ${backupFile2}`);
    return backupFile2;
  } catch (error) {
    console.error("[Backup] Failed:", error);
    return null;
  }
}
function scheduleBackups() {
  const BACKUP_INTERVAL2 = 24 * 60 * 60 * 1e3;
  createBackup();
  setInterval(() => {
    createBackup();
  }, BACKUP_INTERVAL2);
  console.log("[Backup] Scheduled daily backups");
}

// server/index.ts
init_rate_limiter();

// server/sitemap.ts
var BASE_URL = "https://easyusllc.com";
var LINKTREE_URL = "https://creamostullc.com";
var PUBLIC_ROUTES = [
  { path: "/", priority: 1, changefreq: "weekly" },
  { path: "/servicios", priority: 0.9, changefreq: "weekly" },
  { path: "/faq", priority: 0.8, changefreq: "monthly" },
  { path: "/contacto", priority: 0.7, changefreq: "monthly" },
  { path: "/llc/formation", priority: 0.9, changefreq: "weekly" },
  { path: "/llc/maintenance", priority: 0.8, changefreq: "weekly" },
  { path: "/tools/price-calculator", priority: 0.7, changefreq: "monthly" },
  { path: "/tools/invoice", priority: 0.6, changefreq: "monthly" },
  { path: "/tools/operating-agreement", priority: 0.6, changefreq: "monthly" },
  { path: "/legal/terminos", priority: 0.4, changefreq: "yearly" },
  { path: "/legal/privacidad", priority: 0.4, changefreq: "yearly" },
  { path: "/legal/reembolsos", priority: 0.4, changefreq: "yearly" },
  { path: "/legal/cookies", priority: 0.4, changefreq: "yearly" }
];
var LINKTREE_ROUTES = [
  { path: "/", priority: 1, changefreq: "weekly" },
  { path: "/tu-llc", priority: 0.9, changefreq: "weekly" }
];
function generateSitemap() {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const urls = PUBLIC_ROUTES.map((route) => `
  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
function generateLinktreeSitemap() {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const urls = LINKTREE_ROUTES.map((route) => `
  <url>
    <loc>${LINKTREE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
function setupSitemapRoute(app2) {
  app2.get("/sitemap.xml", (req, res) => {
    const host = req.get("host") || "";
    const isLinktree = host.includes("creamostullc");
    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.send(isLinktree ? generateLinktreeSitemap() : generateSitemap());
  });
  app2.get("/robots.txt", (req, res) => {
    const host = req.get("host") || "";
    const isLinktree = host.includes("creamostullc");
    res.header("Content-Type", "text/plain");
    res.header("Cache-Control", "public, max-age=86400");
    const robotsContent = isLinktree ? `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${LINKTREE_URL}/sitemap.xml` : `User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard
Disallow: /admin
Disallow: /auth/
Crawl-delay: 1

User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /dashboard
Disallow: /admin
Disallow: /auth/

User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /dashboard
Disallow: /admin
Disallow: /auth/
Crawl-delay: 2

Sitemap: ${BASE_URL}/sitemap.xml`;
    res.send(robotsContent);
  });
}

// server/index.ts
initServerSentry();
var app = (0, import_express3.default)();
var isProduction2 = process.env.NODE_ENV === "production";
var httpServer = (0, import_http.createServer)(app);
app.use((0, import_compression.default)());
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
function getCSP() {
  const baseCSP = {
    "default-src": ["'self'"],
    "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
    "img-src": ["'self'", "data:", "blob:", "https://*.stripe.com", "https://lh3.googleusercontent.com"],
    "connect-src": ["'self'", "https://api.stripe.com", "https://accounts.google.com", "wss://*.replit.dev", "wss://*.replit.app"],
    "frame-src": ["'self'", "https://js.stripe.com", "https://accounts.google.com"],
    "frame-ancestors": ["'self'", "https://*.replit.dev", "https://*.replit.app"]
  };
  if (isProduction2) {
    return [
      `default-src ${baseCSP["default-src"].join(" ")}`,
      `script-src 'self' https://js.stripe.com https://accounts.google.com`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `font-src ${baseCSP["font-src"].join(" ")}`,
      `img-src ${baseCSP["img-src"].join(" ")}`,
      `connect-src ${baseCSP["connect-src"].join(" ")}`,
      `frame-src ${baseCSP["frame-src"].join(" ")}`,
      `frame-ancestors ${baseCSP["frame-ancestors"].join(" ")}`
    ].join("; ");
  } else {
    return [
      `default-src ${baseCSP["default-src"].join(" ")}`,
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://accounts.google.com`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `font-src ${baseCSP["font-src"].join(" ")}`,
      `img-src ${baseCSP["img-src"].join(" ")}`,
      `connect-src ${baseCSP["connect-src"].join(" ")}`,
      `frame-src ${baseCSP["frame-src"].join(" ")}`,
      `frame-ancestors ${baseCSP["frame-ancestors"].join(" ")}`
    ].join("; ");
  }
}
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("Content-Security-Policy", getCSP());
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  if (req.method === "GET") {
    const isAsset = req.path.startsWith("/assets/") || req.path.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff2|woff)$/);
    const isStaticFile = req.path.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|woff2|woff|ttf|eot)$/);
    const isSeoFile = req.path === "/robots.txt" || req.path.startsWith("/sitemap");
    const isJS = req.path.match(/\.js$/);
    const isCSS = req.path.match(/\.css$/);
    if (isAsset) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Vary", "Accept-Encoding");
    } else if (isStaticFile) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    } else if (isSeoFile) {
      res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
      res.setHeader("X-Robots-Tag", "all");
    }
    if (isJS) {
      res.setHeader("X-Content-Type-Options", "nosniff");
    }
    if (isCSS) {
      res.setHeader("X-Content-Type-Options", "nosniff");
    }
    res.setHeader("X-DNS-Prefetch-Control", "on");
    const linkHints = [
      "</logo-icon.png>; rel=preload; as=image; fetchpriority=high",
      "<https://fonts.googleapis.com>; rel=preconnect",
      "<https://fonts.gstatic.com>; rel=preconnect; crossorigin",
      "<https://js.stripe.com>; rel=preconnect"
    ];
    res.setHeader("Link", linkHints.join(", "));
  }
  const seoPages = ["/", "/servicios", "/faq", "/contacto", "/llc/formation", "/llc/maintenance"];
  if (seoPages.includes(req.path)) {
    res.setHeader("X-Robots-Tag", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    const existingLinkRaw = res.getHeader("Link");
    const existingLink = Array.isArray(existingLinkRaw) ? existingLinkRaw.join(", ") : existingLinkRaw || "";
    const canonicalLink = `<https://easyusllc.com${req.path}>; rel="canonical"`;
    res.setHeader("Link", existingLink ? `${existingLink}, ${canonicalLink}` : canonicalLink);
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
  setupSitemapRoute(app);
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
      if (process.env.NODE_ENV === "production") {
        setInterval(async () => {
          try {
            await cleanupDbRateLimits();
          } catch (e) {
            console.error("Rate limit cleanup error:", e);
          }
        }, 3e5);
      }
    }
  );
})();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  log
});
//# sourceMappingURL=index.cjs.map
