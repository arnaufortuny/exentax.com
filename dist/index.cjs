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
var __copyProps = (to, from, except, desc3) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc3 = __getOwnPropDesc(from, key)) || desc3.enumerable });
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
      isAdmin: (0, import_pg_core.boolean)("is_admin").notNull().default(false),
      isActive: (0, import_pg_core.boolean)("is_active").notNull().default(true),
      accountStatus: (0, import_pg_core.text)("account_status").notNull().default("active"),
      // active, pending, suspended, vip
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    userNotifications = (0, import_pg_core.pgTable)("user_notifications", {
      id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
      userId: (0, import_pg_core.varchar)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      type: (0, import_pg_core.text)("type").notNull(),
      title: (0, import_pg_core.text)("title").notNull(),
      message: (0, import_pg_core.text)("message").notNull(),
      isRead: (0, import_pg_core.boolean)("is_read").notNull().default(false),
      actionUrl: (0, import_pg_core.text)("action_url"),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
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
  applicationDocuments: () => applicationDocuments,
  applicationDocumentsRelations: () => applicationDocumentsRelations,
  contactOtps: () => contactOtps,
  emailVerificationTokens: () => emailVerificationTokens,
  insertApplicationDocumentSchema: () => insertApplicationDocumentSchema,
  insertContactOtpSchema: () => insertContactOtpSchema,
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
var import_pg_core2, import_drizzle_zod, import_drizzle_orm2, products, orders, llcApplications, applicationDocuments, newsletterSubscribers, messages, contactOtps, orderEvents, messageReplies, maintenanceApplications, ordersRelations, orderEventsRelations, messagesRelations, messageRepliesRelations, llcApplicationsRelations, applicationDocumentsRelations, maintenanceApplicationsRelations, insertProductSchema, insertOrderSchema, insertLlcApplicationSchema, insertApplicationDocumentSchema, insertMaintenanceApplicationSchema, insertContactOtpSchema, insertOrderEventSchema, insertMessageReplySchema;
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
      // pending, paid, cancelled
      stripeSessionId: (0, import_pg_core2.text)("stripe_session_id"),
      amount: (0, import_pg_core2.integer)("amount").notNull(),
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
      emailVerified: (0, import_pg_core2.boolean)("email_verified").notNull().default(false)
    }, (table) => ({
      orderIdIdx: (0, import_pg_core2.index)("llc_apps_order_id_idx").on(table.orderId),
      requestCodeIdx: (0, import_pg_core2.index)("llc_apps_req_code_idx").on(table.requestCode),
      statusIdx: (0, import_pg_core2.index)("llc_apps_status_idx").on(table.status)
    }));
    applicationDocuments = (0, import_pg_core2.pgTable)("application_documents", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      applicationId: (0, import_pg_core2.integer)("application_id").notNull().references(() => llcApplications.id),
      fileName: (0, import_pg_core2.text)("file_name").notNull(),
      fileType: (0, import_pg_core2.text)("file_type").notNull(),
      fileUrl: (0, import_pg_core2.text)("file_url").notNull(),
      documentType: (0, import_pg_core2.text)("document_type").notNull(),
      // passport, id, other
      uploadedAt: (0, import_pg_core2.timestamp)("uploaded_at").defaultNow()
    });
    newsletterSubscribers = (0, import_pg_core2.pgTable)("newsletter_subscribers", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      email: (0, import_pg_core2.text)("email").notNull().unique(),
      subscribedAt: (0, import_pg_core2.timestamp)("subscribed_at").defaultNow()
    });
    messages = (0, import_pg_core2.pgTable)("messages", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      userId: (0, import_pg_core2.varchar)("user_id").references(() => users.id),
      name: (0, import_pg_core2.text)("name"),
      email: (0, import_pg_core2.text)("email").notNull(),
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
    });
    contactOtps = (0, import_pg_core2.pgTable)("contact_otps", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      email: (0, import_pg_core2.text)("email").notNull(),
      otp: (0, import_pg_core2.text)("otp").notNull(),
      expiresAt: (0, import_pg_core2.timestamp)("expires_at").notNull(),
      verified: (0, import_pg_core2.boolean)("verified").notNull().default(false)
    });
    orderEvents = (0, import_pg_core2.pgTable)("order_events", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      orderId: (0, import_pg_core2.integer)("order_id").notNull().references(() => orders.id),
      eventType: (0, import_pg_core2.text)("event_type").notNull(),
      description: (0, import_pg_core2.text)("description").notNull(),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow(),
      createdBy: (0, import_pg_core2.varchar)("created_by").references(() => users.id)
    });
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
      authorizedManagement: (0, import_pg_core2.boolean)("authorized_management").notNull().default(false),
      termsConsent: (0, import_pg_core2.boolean)("terms_consent").notNull().default(false),
      dataProcessingConsent: (0, import_pg_core2.boolean)("data_processing_consent").notNull().default(false)
    });
    ordersRelations = (0, import_drizzle_orm2.relations)(orders, ({ one, many }) => ({
      user: one(users, { fields: [orders.userId], references: [users.id] }),
      product: one(products, { fields: [orders.productId], references: [products.id] }),
      application: one(llcApplications, { fields: [orders.id], references: [llcApplications.orderId] }),
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
  }
});

// server/db.ts
var import_node_postgres, import_pg, Pool, pool, db;
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
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });
  }
});

// server/lib/email.ts
var email_exports = {};
__export(email_exports, {
  getActionRequiredTemplate: () => getActionRequiredTemplate,
  getAutoReplyTemplate: () => getAutoReplyTemplate,
  getConfirmationEmailTemplate: () => getConfirmationEmailTemplate,
  getEmailFooter: () => getEmailFooter,
  getEmailHeader: () => getEmailHeader,
  getInvoiceEmailTemplate: () => getInvoiceEmailTemplate,
  getNewsletterWelcomeTemplate: () => getNewsletterWelcomeTemplate,
  getNoteReceivedTemplate: () => getNoteReceivedTemplate,
  getOrderUpdateTemplate: () => getOrderUpdateTemplate2,
  getOtpEmailTemplate: () => getOtpEmailTemplate,
  getReminderEmailTemplate: () => getReminderEmailTemplate,
  getWelcomeEmailTemplate: () => getWelcomeEmailTemplate,
  sendEmail: () => sendEmail
});
function getEmailHeader(title = "Easy US LLC") {
  const domain = "easyusllc.com";
  const protocol = "https";
  const logoUrl = `${protocol}://${domain}/logo-email.png?v=4`;
  return `
    <div style="background-color: #ffffff; padding: 40px 20px; text-align: center; border-bottom: 3px solid #6EDC8A;">
      <div style="margin-bottom: 25px; display: block; width: 100%; text-align: center;">
        <a href="https://${domain}" target="_blank" style="text-decoration: none; display: inline-block;">
          <img src="${logoUrl}" alt="Easy US LLC" width="120" height="120" style="display: inline-block; margin: 0 auto; width: 120px; height: 120px; object-fit: contain; border: 0;" />
        </a>
      </div>
      <h1 style="color: #0E1215; margin: 0; font-family: 'Inter', Arial, sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: -1.5px; font-size: 28px; line-height: 1.1;">
        ${title}
      </h1>
    </div>
  `;
}
function getEmailFooter() {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  return `
    <div style="background-color: #0E1215; padding: 40px 20px; text-align: center; color: #F7F7F5; font-family: 'Inter', Arial, sans-serif;">
      <p style="margin: 0 0 15px 0; font-weight: 800; color: #6EDC8A; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Expertos en formaci\xF3n de LLC</p>
      <p style="margin: 0; font-size: 13px; color: #F7F7F5; font-weight: 500;">New Mexico, USA | <a href="mailto:info@easyusllc.com" style="color: #6EDC8A; text-decoration: none; font-weight: 700;">info@easyusllc.com</a></p>
      <div style="margin-top: 20px;">
        <a href="https://wa.me/34614916910" style="color: #F7F7F5; text-decoration: none; font-weight: 800; font-size: 11px; text-transform: uppercase; margin: 0 15px; border-bottom: 1px solid #6EDC8A;">WhatsApp</a>
        <a href="https://easyusllc.com" style="color: #F7F7F5; text-decoration: none; font-weight: 800; font-size: 11px; text-transform: uppercase; margin: 0 15px; border-bottom: 1px solid #6EDC8A;">Web Oficial</a>
      </div>
      <p style="margin-top: 30px; font-size: 10px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px;">\xA9 ${year} Easy US LLC. Todos los derechos reservados.</p>
    </div>
  `;
}
function getAutoReplyTemplate(ticketId, name = "Cliente") {
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader()}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">Hemos recibido tu consulta</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">Hola <strong>${name}</strong>, gracias por contactar con Easy US LLC. Tu consulta ha sido registrada correctamente con el identificador que ver\xE1s a continuaci\xF3n.</p>
          
          <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #6EDC8A; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Referencia de Seguimiento</p>
            <p style="margin: 0; font-size: 24px; font-weight: 900; color: #0E1215;">${ticketId}</p>
          </div>

          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 20px;">Nuestro equipo de expertos revisar\xE1 tu mensaje y te responder\xE1 de forma personalizada en un plazo de <strong>24 a 48 horas h\xE1biles</strong>.</p>
          
          <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Si necesitas a\xF1adir informaci\xF3n adicional, simplemente responde a este correo manteniendo el asunto intacto.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}
function getOtpEmailTemplate(otp) {
  return `
    <div style="background-color: #F7F7F5; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #0E1215; background-color: #ffffff; border: 1px solid #E6E9EC;">
        ${getEmailHeader()}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #0E1215;">Verificaci\xF3n de Identidad</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #0E1215; margin-bottom: 25px;">Verifica tu email con el siguiente c\xF3digo de seguridad:</p>
          
          <div style="background: #F7F7F5; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; border: 2px solid #6EDC8A;">
            <p style="margin: 0; font-size: 32px; font-weight: 900; color: #0E1215; letter-spacing: 8px;">${otp}</p>
          </div>

          <p style="line-height: 1.6; font-size: 12px; color: #6B7280; margin-top: 20px;">Este c\xF3digo caducar\xE1 en 10 minutos.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}
function getWelcomeEmailTemplate(name) {
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader()}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">Bienvenido a Easy US LLC, ${name}</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 20px;">Es un placer acompa\xF1arte en la expansi\xF3n de tu negocio hacia los Estados Unidos. Nuestra misi\xF3n es simplificar cada paso administrativo para que t\xFA puedas centrarte en crecer.</p>
          
          <div style="background: #fcfcfc; border-left: 3px solid #000; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; font-size: 15px; font-weight: 700; color: #000;">\xBFQu\xE9 esperar ahora?</p>
            <ul style="margin: 15px 0 0 0; padding-left: 20px; color: #555; font-size: 14px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">Asignaci\xF3n de un agente especializado a tu expediente.</li>
              <li style="margin-bottom: 8px;">Revisi\xF3n de disponibilidad de nombres en el estado seleccionado.</li>
              <li style="margin-bottom: 8px;">Preparaci\xF3n de documentos constitutivos oficiales.</li>
            </ul>
          </div>

          <p style="line-height: 1.6; font-size: 14px; color: #666;">Recibir\xE1s actualizaciones peri\xF3dicas sobre el estado de tu formaci\xF3n. Si tienes cualquier consulta, nuestro equipo est\xE1 a tu disposici\xF3n v\xEDa WhatsApp o email.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}
function getConfirmationEmailTemplate(name, requestCode, details) {
  const now = /* @__PURE__ */ new Date();
  const dateStr = now.toLocaleDateString("es-ES", { timeZone: "Europe/Madrid" });
  const timeStr = now.toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit" });
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader()}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">\xA1Gracias por tu solicitud, ${name}!</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">Hemos recibido correctamente los datos para el registro de tu nueva LLC. Nuestro equipo de especialistas comenzar\xE1 con la revisi\xF3n t\xE9cnica de inmediato.</p>
          
          <div style="background: #fcfcfc; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #6EDC8A;">
            <p style="margin: 0 0 15px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280; letter-spacing: 1px;">Referencia de Solicitud</p>
            <p style="margin: 0; font-size: 24px; font-weight: 900; color: #0E1215;">${requestCode}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; font-size: 13px; font-weight: 800; text-transform: uppercase; color: #000; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">Resumen del Registro</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Fecha y hora:</td>
                <td style="padding: 8px 0; font-weight: 700; text-align: right;">${dateStr} | ${timeStr}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Nombre Propuesto:</td>
                <td style="padding: 8px 0; font-weight: 700; text-align: right;">${details?.companyName || "Pendiente"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Estado de Pago:</td>
                <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0d9488;">Confirmado / Procesando</td>
              </tr>
            </table>
          </div>

          <div style="background: #FFF9E6; padding: 20px; border-radius: 8px; border: 1px solid #FFE4B3; margin: 25px 0;">
            <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.6;"><strong>Pr\xF3ximos Pasos:</strong> En las pr\xF3ximas 24-48h recibir\xE1s un email con los documentos constitutivos para tu firma electr\xF3nica. Por favor, mantente atento a tu bandeja de entrada.</p>
          </div>

          <p style="line-height: 1.6; font-size: 14px; color: #666;">Si necesitas realizar cualquier cambio en los datos suministrados, por favor contacta con nosotros respondiendo a este correo.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}
function getNewsletterWelcomeTemplate() {
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader()}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">Suscripci\xF3n Confirmada</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">Ya formas parte de la comunidad de Easy US LLC. A partir de ahora, recibir\xE1s informaci\xF3n estrat\xE9gica para optimizar tu negocio en EE.UU.</p>
          
          <div style="background: #fcfcfc; padding: 25px; border-radius: 8px; border: 1px solid #eee;">
            <p style="margin: 0 0 15px 0; font-weight: 800; font-size: 12px; text-transform: uppercase; color: #000;">Lo que vas a recibir:</p>
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: 700; font-size: 14px; color: #000;">Gu\xEDas de Cumplimiento</p>
              <p style="margin: 3px 0 0 0; font-size: 13px; color: #666;">Informaci\xF3n clave sobre BOI Reports y declaraciones anuales.</p>
            </div>
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: 700; font-size: 14px; color: #000;">Tips de Banca USA</p>
              <p style="margin: 3px 0 0 0; font-size: 13px; color: #666;">Novedades sobre Mercury, Relay y gesti\xF3n de fondos en USD.</p>
            </div>
            <div>
              <p style="margin: 0; font-weight: 700; font-size: 14px; color: #000;">Estrategia Fiscal</p>
              <p style="margin: 3px 0 0 0; font-size: 13px; color: #666;">C\xF3mo operar sin IVA y minimizar el impacto tributario legalmente.</p>
            </div>
          </div>

          <p style="line-height: 1.6; font-size: 14px; color: #666; margin-top: 25px; text-align: center;">Bienvenido al ecosistema global de emprendimiento.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}
function getReminderEmailTemplate(name, requestCode) {
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader()}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">Termina tu registro</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444;">Hola <strong>${name}</strong>, hemos notado que tu solicitud para una nueva LLC a\xFAn no est\xE1 completa.</p>
          
          <div style="background: #f1f5f9; padding: 25px; border-radius: 8px; margin: 35px 0; border: 1px dashed #cbd5e1; text-align: center;">
            <p style="margin: 0; font-size: 15px; color: #000;"><strong>Solicitud pendiente:</strong> ${requestCode}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://easyusllc.com/seguimiento" style="background-color: #000; color: #fff; padding: 15px 35px; text-decoration: none; border-radius: 6px; font-weight: 800; display: inline-block; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">Continuar Solicitud \u2192</a>
          </div>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}
function getActionRequiredTemplate(name, orderNumber, actionDescription) {
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader("Acci\xF3n Requerida")}
        <div style="padding: 40px;">
          <div style="background: #FEF2F2; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #EF4444;">
            <p style="margin: 0; font-size: 13px; font-weight: 700; color: #DC2626; text-transform: uppercase;">Requiere tu atenci\xF3n</p>
          </div>
          
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">Hola ${name},</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">Necesitamos tu ayuda para continuar con el proceso de tu solicitud. Por favor, revisa la siguiente informaci\xF3n:</p>
          
          <div style="background: #fcfcfc; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #e5e5e5;">
            <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280; letter-spacing: 1px;">Pedido</p>
            <p style="margin: 0 0 20px 0; font-size: 20px; font-weight: 900; color: #0E1215;">${orderNumber}</p>
            <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280; letter-spacing: 1px;">Acci\xF3n Necesaria</p>
            <p style="margin: 0; font-size: 15px; color: #444; line-height: 1.6;">${actionDescription}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://easyusllc.com/dashboard" style="background-color: #0E1215; color: #fff; padding: 15px 35px; text-decoration: none; border-radius: 6px; font-weight: 800; display: inline-block; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">Ir a Mi Panel \u2192</a>
          </div>
          
          <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 25px; text-align: center;">Tambi\xE9n puedes responder directamente a este correo si tienes alguna duda.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}
function getNoteReceivedTemplate(name, noteContent, orderNumber) {
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader("Nuevo Mensaje")}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">Hola ${name},</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">Has recibido un nuevo mensaje de nuestro equipo${orderNumber ? ` relacionado con tu pedido <strong>${orderNumber}</strong>` : ""}:</p>
          
          <div style="background: #F0FDF4; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
            <p style="margin: 0; font-size: 15px; color: #0E1215; line-height: 1.6; white-space: pre-wrap;">${noteContent}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://easyusllc.com/dashboard" style="background-color: #6EDC8A; color: #0E1215; padding: 15px 35px; text-decoration: none; border-radius: 6px; font-weight: 800; display: inline-block; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">Ver en Mi Panel \u2192</a>
          </div>
          
          <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 25px; text-align: center;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}
function getOrderUpdateTemplate2(name, orderNumber, newStatus, statusDescription) {
  const statusColors = {
    pending: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
    processing: { bg: "#DBEAFE", border: "#3B82F6", text: "#1E40AF" },
    documents_ready: { bg: "#E0E7FF", border: "#6366F1", text: "#3730A3" },
    completed: { bg: "#D1FAE5", border: "#10B981", text: "#065F46" },
    cancelled: { bg: "#FEE2E2", border: "#EF4444", text: "#991B1B" }
  };
  const colors = statusColors[newStatus] || statusColors.processing;
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader("Actualizaci\xF3n de Pedido")}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">Hola ${name},</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">Tu pedido ha sido actualizado con un nuevo estado:</p>
          
          <div style="background: #fcfcfc; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #e5e5e5;">
            <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280; letter-spacing: 1px;">N\xFAmero de Pedido</p>
            <p style="margin: 0 0 20px 0; font-size: 20px; font-weight: 900; color: #0E1215;">${orderNumber}</p>
            
            <div style="background: ${colors.bg}; padding: 15px 20px; border-radius: 8px; border-left: 4px solid ${colors.border};">
              <p style="margin: 0; font-size: 14px; font-weight: 800; color: ${colors.text}; text-transform: uppercase;">${newStatus.replace(/_/g, " ")}</p>
            </div>
          </div>
          
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">${statusDescription}</p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://easyusllc.com/dashboard" style="background-color: #0E1215; color: #fff; padding: 15px 35px; text-decoration: none; border-radius: 6px; font-weight: 800; display: inline-block; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">Ver Detalles \u2192</a>
          </div>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}
function getInvoiceEmailTemplate(name, orderNumber, invoiceDetails) {
  const itemsHtml = invoiceDetails.items.map((item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #444;">${item.description}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #444; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #444; text-align: right;">$${item.price.toFixed(2)}</td>
    </tr>
  `).join("");
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader("Factura")}
        <div style="padding: 40px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div>
              <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280;">Factura</p>
              <p style="margin: 0; font-size: 18px; font-weight: 900; color: #0E1215;">${invoiceDetails.invoiceNumber}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280;">Fecha</p>
              <p style="margin: 0; font-size: 14px; color: #444;">${invoiceDetails.issueDate}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 25px;">
            <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280;">Cliente</p>
            <p style="margin: 0; font-size: 16px; font-weight: 700; color: #0E1215;">${name}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #6B7280;">Pedido: ${orderNumber}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
            <thead>
              <tr style="background: #f9f9f9;">
                <th style="padding: 12px 0; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6B7280; border-bottom: 2px solid #e5e5e5;">Descripci\xF3n</th>
                <th style="padding: 12px 0; text-align: center; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6B7280; border-bottom: 2px solid #e5e5e5;">Cant.</th>
                <th style="padding: 12px 0; text-align: right; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6B7280; border-bottom: 2px solid #e5e5e5;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="border-top: 2px solid #0E1215; padding-top: 15px; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 14px; color: #6B7280;">Subtotal</span>
              <span style="font-size: 14px; color: #444;">$${invoiceDetails.subtotal.toFixed(2)}</span>
            </div>
            ${invoiceDetails.tax ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 14px; color: #6B7280;">Impuestos</span>
              <span style="font-size: 14px; color: #444;">$${invoiceDetails.tax.toFixed(2)}</span>
            </div>
            ` : ""}
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #e5e5e5;">
              <span style="font-size: 16px; font-weight: 800; color: #0E1215;">TOTAL</span>
              <span style="font-size: 18px; font-weight: 900; color: #6EDC8A;">$${invoiceDetails.total.toFixed(2)}</span>
            </div>
          </div>

          <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin-top: 30px; border: 1px solid #6EDC8A;">
            <p style="margin: 0; font-size: 14px; color: #065F46; text-align: center;"><strong>Pago confirmado</strong> - Gracias por tu confianza</p>
          </div>
          
          <p style="line-height: 1.6; font-size: 12px; color: #6B7280; margin-top: 25px; text-align: center;">Este documento sirve como comprobante de pago. Para cualquier consulta sobre facturaci\xF3n, contacta con nosotros.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}
async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("Email credentials missing. Email not sent.");
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: `"Easy US LLC" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
var import_nodemailer, transporter;
var init_email = __esm({
  "server/lib/email.ts"() {
    "use strict";
    import_nodemailer = __toESM(require("nodemailer"), 1);
    transporter = import_nodemailer.default.createTransport({
      host: process.env.SMTP_HOST || "smtp.ionos.es",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      // TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100
    });
  }
});

// server/lib/auth-service.ts
var auth_service_exports = {};
__export(auth_service_exports, {
  createPasswordResetToken: () => createPasswordResetToken,
  createUser: () => createUser,
  generateClientId: () => generateClientId,
  generateOtp: () => generateOtp,
  generateToken: () => generateToken,
  hashPassword: () => hashPassword,
  loginUser: () => loginUser,
  resendVerificationEmail: () => resendVerificationEmail,
  resetPassword: () => resetPassword,
  verifyEmailToken: () => verifyEmailToken,
  verifyPassword: () => verifyPassword
});
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
function generateClientId() {
  const prefix = "CLI";
  const timestamp3 = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp3}-${random}`;
}
async function createUser(data) {
  const existingUser = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.email, data.email)).limit(1);
  if (existingUser.length > 0) {
    throw new Error("El email ya est\xE1 registrado");
  }
  const passwordHash = await hashPassword(data.password);
  const clientId = generateClientId();
  const isAdminEmail = data.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
  const [newUser] = await db.insert(users).values({
    id: clientId,
    email: data.email,
    passwordHash,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    emailVerified: false,
    isAdmin: isAdminEmail
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
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0E1215;">\xA1Bienvenido a Easy US LLC!</h1>
          <p>Hola ${data.firstName},</p>
          <p>Gracias por registrarte. Tu c\xF3digo de verificaci\xF3n es:</p>
          <div style="background: #6EDC8A; color: #0E1215; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            ${verificationToken}
          </div>
          <p>Este c\xF3digo expira en ${OTP_EXPIRY_MINUTES} minutos.</p>
          <p>Tu ID de cliente es: <strong>${clientId}</strong></p>
          <p>Saludos,<br>El equipo de Easy US LLC</p>
        </div>
      `
    });
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
  }
  return { user: newUser, verificationToken };
}
async function verifyEmailToken(userId, token) {
  const [tokenRecord] = await db.select().from(emailVerificationTokens).where(
    (0, import_drizzle_orm3.and)(
      (0, import_drizzle_orm3.eq)(emailVerificationTokens.userId, userId),
      (0, import_drizzle_orm3.eq)(emailVerificationTokens.token, token),
      (0, import_drizzle_orm3.eq)(emailVerificationTokens.used, false),
      (0, import_drizzle_orm3.gt)(emailVerificationTokens.expiresAt, /* @__PURE__ */ new Date())
    )
  ).limit(1);
  if (!tokenRecord) {
    return false;
  }
  await db.update(emailVerificationTokens).set({ used: true }).where((0, import_drizzle_orm3.eq)(emailVerificationTokens.id, tokenRecord.id));
  await db.update(users).set({ emailVerified: true, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.eq)(users.id, userId));
  return true;
}
async function loginUser(email, password) {
  const [user] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.email, email)).limit(1);
  if (!user || !user.passwordHash) {
    return null;
  }
  if (user.isActive === false) {
    return null;
  }
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }
  return user;
}
async function createPasswordResetToken(email) {
  const [user] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.email, email)).limit(1);
  if (!user) {
    return null;
  }
  const token = generateToken();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1e3);
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt
  });
  const resetLink = `${process.env.BASE_URL || "https://easyusllc.com"}/reset-password?token=${token}`;
  try {
    await sendEmail({
      to: email,
      subject: "Easy US LLC - Recuperar contrase\xF1a",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0E1215;">Recuperar contrase\xF1a</h1>
          <p>Hola ${user.firstName || ""},</p>
          <p>Has solicitado restablecer tu contrase\xF1a. Haz clic en el siguiente bot\xF3n:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #6EDC8A; color: #0E1215; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-weight: bold;">
              Restablecer contrase\xF1a
            </a>
          </div>
          <p>Este enlace expira en ${PASSWORD_RESET_EXPIRY_HOURS} horas.</p>
          <p>Si no solicitaste este cambio, ignora este email.</p>
          <p>Saludos,<br>El equipo de Easy US LLC</p>
        </div>
      `
    });
  } catch (emailError) {
    console.error("Failed to send password reset email:", emailError);
  }
  return token;
}
async function resetPassword(token, newPassword) {
  const [tokenRecord] = await db.select().from(passwordResetTokens).where(
    (0, import_drizzle_orm3.and)(
      (0, import_drizzle_orm3.eq)(passwordResetTokens.token, token),
      (0, import_drizzle_orm3.eq)(passwordResetTokens.used, false),
      (0, import_drizzle_orm3.gt)(passwordResetTokens.expiresAt, /* @__PURE__ */ new Date())
    )
  ).limit(1);
  if (!tokenRecord) {
    return false;
  }
  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.eq)(users.id, tokenRecord.userId));
  await db.update(passwordResetTokens).set({ used: true }).where((0, import_drizzle_orm3.eq)(passwordResetTokens.id, tokenRecord.id));
  return true;
}
async function resendVerificationEmail(userId) {
  const [user] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.id, userId)).limit(1);
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
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0E1215;">C\xF3digo de verificaci\xF3n</h1>
          <p>Hola ${user.firstName || ""},</p>
          <p>Tu nuevo c\xF3digo de verificaci\xF3n es:</p>
          <div style="background: #6EDC8A; color: #0E1215; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            ${verificationToken}
          </div>
          <p>Este c\xF3digo expira en ${OTP_EXPIRY_MINUTES} minutos.</p>
          <p>Saludos,<br>El equipo de Easy US LLC</p>
        </div>
      `
    });
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
    return false;
  }
  return true;
}
var import_bcrypt, import_crypto, import_drizzle_orm3, SALT_ROUNDS, OTP_EXPIRY_MINUTES, PASSWORD_RESET_EXPIRY_HOURS;
var init_auth_service = __esm({
  "server/lib/auth-service.ts"() {
    "use strict";
    import_bcrypt = __toESM(require("bcrypt"), 1);
    import_crypto = __toESM(require("crypto"), 1);
    init_db();
    init_auth();
    import_drizzle_orm3 = require("drizzle-orm");
    init_email();
    SALT_ROUNDS = 12;
    OTP_EXPIRY_MINUTES = 15;
    PASSWORD_RESET_EXPIRY_HOURS = 24;
  }
});

// server/utils/encryption.ts
var encryption_exports = {};
__export(encryption_exports, {
  decrypt: () => decrypt,
  encrypt: () => encrypt
});
function encrypt(text3) {
  const iv = import_crypto2.default.randomBytes(IV_LENGTH);
  const cipher = import_crypto2.default.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let encrypted = cipher.update(text3);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}
function decrypt(text3) {
  const textParts = text3.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = import_crypto2.default.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
var import_crypto2, ALGORITHM, ENCRYPTION_KEY, IV_LENGTH;
var init_encryption = __esm({
  "server/utils/encryption.ts"() {
    "use strict";
    import_crypto2 = __toESM(require("crypto"), 1);
    ALGORITHM = "aes-256-cbc";
    ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "fallback_key_at_least_32_chars_long!!";
    IV_LENGTH = 16;
  }
});

// vite.config.ts
var import_vite, import_plugin_react, import_path2, rootDir, vite_config_default;
var init_vite_config = __esm({
  "vite.config.ts"() {
    "use strict";
    import_vite = require("vite");
    import_plugin_react = __toESM(require("@vitejs/plugin-react"), 1);
    import_path2 = __toESM(require("path"), 1);
    rootDir = process.cwd();
    vite_config_default = (0, import_vite.defineConfig)({
      plugins: [
        (0, import_plugin_react.default)()
      ],
      resolve: {
        alias: {
          "@": import_path2.default.resolve(rootDir, "client", "src"),
          "@shared": import_path2.default.resolve(rootDir, "shared"),
          "@assets": import_path2.default.resolve(rootDir, "client", "src", "assets")
        }
      },
      root: import_path2.default.resolve(rootDir, "client"),
      build: {
        outDir: import_path2.default.resolve(rootDir, "dist/public"),
        emptyOutDir: true,
        reportCompressedSize: false,
        chunkSizeWarningLimit: 1e3,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ["react", "react-dom", "framer-motion"],
              ui: ["lucide-react", "@radix-ui/react-dialog", "@radix-ui/react-select"]
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
var import_crypto3, POOL_SIZE_MULTIPLIER, pool2, poolOffset, fillPool, nanoid;
var init_nanoid = __esm({
  "node_modules/nanoid/index.js"() {
    import_crypto3 = __toESM(require("crypto"), 1);
    init_url_alphabet();
    POOL_SIZE_MULTIPLIER = 128;
    fillPool = (bytes) => {
      if (!pool2 || pool2.length < bytes) {
        pool2 = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
        import_crypto3.default.randomFillSync(pool2);
        poolOffset = 0;
      } else if (poolOffset + bytes > pool2.length) {
        import_crypto3.default.randomFillSync(pool2);
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
      const clientTemplate = import_path3.default.resolve(
        rootDir2,
        "client",
        "index.html"
      );
      let template = await import_fs2.default.promises.readFile(clientTemplate, "utf-8");
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
var import_vite2, import_fs2, import_path3, rootDir2, viteLogger;
var init_vite = __esm({
  "server/vite.ts"() {
    "use strict";
    import_vite2 = require("vite");
    init_vite_config();
    import_fs2 = __toESM(require("fs"), 1);
    import_path3 = __toESM(require("path"), 1);
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
var import_express2 = __toESM(require("express"), 1);

// server/lib/custom-auth.ts
var import_express_session = __toESM(require("express-session"), 1);
var import_connect_pg_simple = __toESM(require("connect-pg-simple"), 1);
init_db();
init_auth();
var import_drizzle_orm4 = require("drizzle-orm");
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
  const isProduction = process.env.NODE_ENV === "production" || process.env.REPLIT_ENVIRONMENT === "production";
  return (0, import_express_session.default)({
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
  app2.use(getSession());
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone, birthDate } = req.body;
      if (!email || !password || !firstName || !lastName || !phone) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "La contrase\xF1a debe tener al menos 8 caracteres" });
      }
      const { user } = await createUser({
        email,
        password,
        firstName,
        lastName,
        phone,
        birthDate
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
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email y contrase\xF1a son obligatorios" });
      }
      const user = await loginUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Email o contrase\xF1a incorrectos" });
      }
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
            phone: user.phone,
            emailVerified: user.emailVerified,
            isAdmin: user.isAdmin
          }
        });
      });
    } catch (error) {
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
      console.error("Verify email error:", error);
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
      await createPasswordResetToken(email);
      res.json({
        success: true,
        message: "Si el email existe en nuestro sistema, recibir\xE1s instrucciones para restablecer tu contrase\xF1a"
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Error al procesar la solicitud" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "Token y contrase\xF1a son obligatorios" });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "La contrase\xF1a debe tener al menos 8 caracteres" });
      }
      const success = await resetPassword(token, password);
      if (!success) {
        return res.status(400).json({ message: "Token inv\xE1lido o expirado" });
      }
      res.json({ success: true, message: "Contrase\xF1a actualizada correctamente" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Error al actualizar la contrase\xF1a" });
    }
  });
  app2.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "No autenticado" });
      }
      const [user] = await db.select().from(users).where((0, import_drizzle_orm4.eq)(users.id, userId)).limit(1);
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
      }).where((0, import_drizzle_orm4.eq)(users.id, userId));
      const [updatedUser] = await db.select().from(users).where((0, import_drizzle_orm4.eq)(users.id, userId)).limit(1);
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
  const [user] = await db.select().from(users).where((0, import_drizzle_orm4.eq)(users.id, req.session.userId)).limit(1);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "No autorizado" });
  }
  next();
};

// server/storage.ts
init_db();
var import_drizzle_orm5 = require("drizzle-orm");
init_schema();
var import_drizzle_orm6 = require("drizzle-orm");
var DatabaseStorage = class {
  // Products
  async getProducts() {
    return await db.select().from(products).orderBy(products.price);
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where((0, import_drizzle_orm6.eq)(products.id, id));
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
        where: (0, import_drizzle_orm6.eq)(orders.userId, userId),
        with: {
          product: true,
          application: true
        },
        orderBy: (0, import_drizzle_orm6.desc)(orders.createdAt)
      });
    }
    return await db.query.orders.findMany({
      with: {
        product: true,
        application: true,
        user: true
      },
      orderBy: (0, import_drizzle_orm6.desc)(orders.createdAt)
    });
  }
  async getOrder(id) {
    const result = await db.query.orders.findFirst({
      where: (0, import_drizzle_orm6.eq)(orders.id, id),
      with: {
        product: true,
        application: true,
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
    const [app2] = await db.select().from(llcApplications).where((0, import_drizzle_orm6.eq)(llcApplications.id, id));
    return app2;
  }
  async getLlcApplicationByOrderId(orderId) {
    const [app2] = await db.select().from(llcApplications).where((0, import_drizzle_orm6.eq)(llcApplications.orderId, orderId));
    return app2;
  }
  async getLlcApplicationByRequestCode(code) {
    const result = await db.query.llcApplications.findFirst({
      where: (0, import_drizzle_orm6.eq)(llcApplications.requestCode, code),
      with: {
        documents: true
      }
    });
    return result;
  }
  async updateLlcApplication(id, updates) {
    const [updated] = await db.update(llcApplications).set({ ...updates, lastUpdated: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm6.eq)(llcApplications.id, id)).returning();
    return updated;
  }
  async setOtp(type, id, otp, expires) {
    const table = type === "llc" ? llcApplications : maintenanceApplications;
    await db.update(table).set({ emailOtp: otp, emailOtpExpires: expires }).where((0, import_drizzle_orm6.eq)(table.id, id));
  }
  async verifyOtp(type, id, otp) {
    const table = type === "llc" ? llcApplications : maintenanceApplications;
    const [app2] = await db.select().from(table).where((0, import_drizzle_orm6.eq)(table.id, id));
    if (!app2 || !app2.emailOtp || !app2.emailOtpExpires) return false;
    if (app2.emailOtp === otp && /* @__PURE__ */ new Date() < app2.emailOtpExpires) {
      await db.update(table).set({ emailVerified: true, emailOtp: null, emailOtpExpires: null }).where((0, import_drizzle_orm6.eq)(table.id, id));
      return true;
    }
    return false;
  }
  // Documents
  async createDocument(doc) {
    const [newDoc] = await db.insert(applicationDocuments).values(doc).returning();
    return newDoc;
  }
  async getDocumentsByApplicationId(applicationId) {
    return await db.select().from(applicationDocuments).where((0, import_drizzle_orm6.eq)(applicationDocuments.applicationId, applicationId));
  }
  async deleteDocument(id) {
    await db.delete(applicationDocuments).where((0, import_drizzle_orm6.eq)(applicationDocuments.id, id));
  }
  // Newsletter
  async subscribeToNewsletter(email) {
    const subscribed = await this.isSubscribedToNewsletter(email);
    if (!subscribed) {
      await db.insert(newsletterSubscribers).values({ email });
    }
  }
  async isSubscribedToNewsletter(email) {
    const [subscriber] = await db.select().from(newsletterSubscribers).where((0, import_drizzle_orm6.eq)(newsletterSubscribers.email, email));
    return !!subscriber;
  }
  // Admin methods
  async getAllOrders() {
    return await db.query.orders.findMany({
      with: {
        product: true,
        application: true,
        user: true
      },
      orderBy: (0, import_drizzle_orm6.desc)(orders.createdAt)
    });
  }
  async updateOrderStatus(orderId, status) {
    const [updated] = await db.update(orders).set({ status }).where((0, import_drizzle_orm6.eq)(orders.id, orderId)).returning();
    return updated;
  }
  // Messages
  async createMessage(message) {
    const { encrypt: encrypt2 } = await Promise.resolve().then(() => (init_encryption(), encryption_exports));
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const count = await db.select({ count: import_drizzle_orm5.sql`count(*)` }).from(messages);
    const msgId = `MSG-${year}-${String(Number(count[0].count) + 1).padStart(4, "0")}`;
    const encryptedContent = encrypt2(message.content);
    const [newMessage] = await db.insert(messages).values({
      ...message,
      messageId: msgId,
      encryptedContent
    }).returning();
    return newMessage;
  }
  async getMessagesByUserId(userId) {
    return await db.select().from(messages).where((0, import_drizzle_orm6.eq)(messages.userId, userId)).orderBy((0, import_drizzle_orm6.desc)(messages.createdAt));
  }
  async getAllMessages() {
    return await db.query.messages.findMany({
      orderBy: (0, import_drizzle_orm6.desc)(messages.createdAt),
      with: {
        replies: true
      }
    });
  }
  async updateMessageStatus(id, status) {
    const [updated] = await db.update(messages).set({ status }).where((0, import_drizzle_orm6.eq)(messages.id, id)).returning();
    return updated;
  }
};
var storage = new DatabaseStorage();

// shared/routes.ts
var import_zod = require("zod");
init_schema();
var errorSchemas = {
  validation: import_zod.z.object({
    message: import_zod.z.string(),
    field: import_zod.z.string().optional()
  }),
  notFound: import_zod.z.object({
    message: import_zod.z.string()
  }),
  internal: import_zod.z.object({
    message: import_zod.z.string()
  }),
  unauthorized: import_zod.z.object({
    message: import_zod.z.string()
  })
};
var api = {
  products: {
    list: {
      method: "GET",
      path: "/api/products",
      responses: {
        200: import_zod.z.array(import_zod.z.custom())
      }
    },
    get: {
      method: "GET",
      path: "/api/products/:id",
      responses: {
        200: import_zod.z.custom(),
        404: errorSchemas.notFound
      }
    }
  },
  orders: {
    list: {
      method: "GET",
      path: "/api/orders",
      responses: {
        200: import_zod.z.array(import_zod.z.custom()),
        401: errorSchemas.unauthorized
      }
    },
    create: {
      method: "POST",
      path: "/api/orders",
      input: import_zod.z.object({
        productId: import_zod.z.number()
      }),
      responses: {
        201: import_zod.z.custom(),
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
        200: import_zod.z.custom(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    },
    update: {
      method: "PUT",
      path: "/api/llc/:id",
      input: insertLlcApplicationSchema.partial(),
      responses: {
        200: import_zod.z.custom(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound
      }
    },
    getByCode: {
      method: "GET",
      path: "/api/llc/code/:code",
      responses: {
        200: import_zod.z.custom(),
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
        201: import_zod.z.custom(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound
      }
    },
    delete: {
      method: "DELETE",
      path: "/api/documents/:id",
      responses: {
        200: import_zod.z.object({ success: import_zod.z.boolean() }),
        404: errorSchemas.notFound
      }
    }
  }
};

// server/routes.ts
var import_zod2 = require("zod");
init_db();
init_email();
init_schema();
var import_drizzle_orm7 = require("drizzle-orm");
async function registerRoutes(httpServer2, app2) {
  setupCustomAuth(app2);
  const logActivity = (title, data) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[LOG] ${title}:`, data);
    }
    sendEmail({
      to: "afortuny07@gmail.com",
      subject: `[LOG] ${title}`,
      html: `
          <div style="background-color: #f9f9f9; padding: 20px 0;">
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
              ${getEmailHeader()}
              <div style="padding: 40px;">
                <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">${title}</h2>
                <div style="background: #f4f4f4; border-left: 4px solid #6EDC8A; padding: 20px; margin: 20px 0;">
                  ${Object.entries(data).map(([k, v]) => `<p style="margin: 0 0 10px 0; font-size: 14px;"><strong>${k}:</strong> ${v}</p>`).join("")}
                </div>
                <p style="font-size: 12px; color: #999;">Fecha: ${(/* @__PURE__ */ new Date()).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p>
              </div>
              ${getEmailFooter()}
            </div>
          </div>
        `
    }).catch((e) => console.error("Log error:", e));
  };
  app2.post("/api/activity/track", async (req, res) => {
    const { action, details } = req.body;
    if (action === "CLICK_ELEGIR_ESTADO") {
      logActivity("Selecci\xF3n de Estado", { "Detalles": details, "IP": req.ip });
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
  app2.patch("/api/admin/orders/:id/status", isAdmin, async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const { status } = import_zod2.z.object({ status: import_zod2.z.string() }).parse(req.body);
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      const order = await storage.getOrder(orderId);
      if (order?.user?.email) {
        sendEmail({
          to: order.user.email,
          subject: `Actualizaci\xF3n de tu pedido ${order.application?.requestCode || `#${order.id}`}`,
          html: getOrderUpdateTemplate(
            order.user.firstName || "Cliente",
            order.application?.requestCode || `#${order.id}`,
            status,
            `Tu pedido ha pasado a estado: ${status.replace(/_/g, " ")}`
          )
        }).catch(console.error);
      }
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Error updating status" });
    }
  });
  app2.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users2 = await db.select().from(users).orderBy((0, import_drizzle_orm7.desc)(users.createdAt));
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  app2.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const { accountStatus, isAdmin: promoteAdmin } = req.body;
      const [updatedUser] = await db.update(users).set({ accountStatus, isAdmin: promoteAdmin, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm7.eq)(users.id, req.params.id)).returning();
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Error updating user" });
    }
  });
  app2.get("/api/admin/newsletter", isAdmin, async (req, res) => {
    try {
      const subscribers = await db.select().from(newsletterSubscribers).orderBy((0, import_drizzle_orm7.desc)(newsletterSubscribers.subscribedAt));
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  });
  app2.get("/api/admin/messages", isAdmin, async (req, res) => {
    try {
      const allMessages = await storage.getAllMessages();
      res.json(allMessages);
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  });
  app2.patch("/api/admin/messages/:id/status", isAdmin, async (req, res) => {
    try {
      const updated = await storage.updateMessageStatus(Number(req.params.id), req.body.status);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  });
  app2.post("/api/admin/request-document", isAdmin, async (req, res) => {
    try {
      const { email, documentType, message } = req.body;
      const { getActionRequiredTemplate: getActionRequiredTemplate2 } = await Promise.resolve().then(() => (init_email(), email_exports));
      await sendEmail({
        to: email,
        subject: "Acci\xF3n Requerida: Documentaci\xF3n para tu LLC",
        html: getActionRequiredTemplate2("Cliente", "Solicitud de Documentos", message || `Necesitamos tu ${documentType} para continuar.`)
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error al solicitar documento" });
    }
  });
  app2.post("/api/admin/send-note", isAdmin, async (req, res) => {
    try {
      const { userId, title, message, type, sendEmail: shouldSendEmail } = req.body;
      await db.insert(userNotifications).values({
        userId,
        title,
        message,
        type: type || "info",
        isRead: false
      });
      if (shouldSendEmail) {
        const [targetUser] = await db.select().from(users).where((0, import_drizzle_orm7.eq)(users.id, userId)).limit(1);
        if (targetUser?.email) {
          const { getNoteReceivedTemplate: getNoteReceivedTemplate2 } = await Promise.resolve().then(() => (init_email(), email_exports));
          await sendEmail({
            to: targetUser.email,
            subject: `Nuevo mensaje de Easy US LLC: ${title}`,
            html: getNoteReceivedTemplate2(targetUser.firstName || "Cliente", message)
          });
        }
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Send note error:", error);
      res.status(500).json({ message: "Error al enviar nota" });
    }
  });
  app2.get(api.products.list.path, async (req, res) => {
    const products3 = await storage.getProducts();
    res.json(products3);
  });
  app2.post("/api/seed-admin", async (req, res) => {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
      const [existingUser] = await db.select().from(users).where((0, import_drizzle_orm7.eq)(users.email, adminEmail)).limit(1);
      if (!existingUser) {
        return res.status(404).json({ message: "Admin user not found. Please register first." });
      }
      await db.update(users).set({ isAdmin: true, accountStatus: "active" }).where((0, import_drizzle_orm7.eq)(users.email, adminEmail));
      res.json({ success: true, message: "Admin role assigned successfully" });
    } catch (error) {
      console.error("Seed admin error:", error);
      res.status(500).json({ message: "Error seeding admin" });
    }
  });
  app2.delete("/api/user/account", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      await db.delete(users).where((0, import_drizzle_orm7.eq)(users.id, userId));
      req.session.destroy(() => {
      });
      res.json({ success: true, message: "Cuenta eliminada correctamente" });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ message: "Error deleting account" });
    }
  });
  const updateProfileSchema = import_zod2.z.object({
    firstName: import_zod2.z.string().optional(),
    lastName: import_zod2.z.string().optional(),
    phone: import_zod2.z.string().optional(),
    businessActivity: import_zod2.z.string().optional(),
    address: import_zod2.z.string().optional(),
    streetType: import_zod2.z.string().optional(),
    city: import_zod2.z.string().optional(),
    province: import_zod2.z.string().optional(),
    postalCode: import_zod2.z.string().optional(),
    country: import_zod2.z.string().optional(),
    idNumber: import_zod2.z.string().optional(),
    idType: import_zod2.z.string().optional(),
    birthDate: import_zod2.z.string().optional()
  });
  app2.patch("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const validatedData = updateProfileSchema.parse(req.body);
      await db.update(users).set(validatedData).where((0, import_drizzle_orm7.eq)(users.id, userId));
      const [updatedUser] = await db.select().from(users).where((0, import_drizzle_orm7.eq)(users.id, userId)).limit(1);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof import_zod2.z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Error updating profile" });
    }
  });
  app2.get("/api/user/notifications", isAuthenticated, async (req, res) => {
    try {
      const notifications = await db.select().from(userNotifications).where((0, import_drizzle_orm7.eq)(userNotifications.userId, req.session.userId)).orderBy((0, import_drizzle_orm7.desc)(userNotifications.createdAt));
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Error al obtener notificaciones" });
    }
  });
  app2.patch("/api/user/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      await db.update(userNotifications).set({ isRead: true }).where((0, import_drizzle_orm7.and)((0, import_drizzle_orm7.eq)(userNotifications.id, req.params.id), (0, import_drizzle_orm7.eq)(userNotifications.userId, req.session.userId)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  });
  app2.post("/api/user/change-password", isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = import_zod2.z.object({
        currentPassword: import_zod2.z.string().min(1),
        newPassword: import_zod2.z.string().min(8)
      }).parse(req.body);
      const [user] = await db.select().from(users).where((0, import_drizzle_orm7.eq)(users.id, req.session.userId));
      if (!user?.passwordHash) {
        return res.status(400).json({ message: "No se puede cambiar la contrase\xF1a" });
      }
      const { verifyPassword: verifyPassword2, hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth_service(), auth_service_exports));
      const isValid = await verifyPassword2(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ message: "Contrase\xF1a actual incorrecta" });
      }
      const newHash = await hashPassword2(newPassword);
      await db.update(users).set({ passwordHash: newHash, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm7.eq)(users.id, req.session.userId));
      res.json({ success: true });
    } catch (error) {
      if (error instanceof import_zod2.z.ZodError) {
        return res.status(400).json({ message: "Datos inv\xE1lidos" });
      }
      console.error("Change password error:", error);
      res.status(500).json({ message: "Error al cambiar contrase\xF1a" });
    }
  });
  app2.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });
  app2.get(api.orders.list.path, async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const orders3 = await storage.getOrders(req.session.userId);
    res.json(orders3);
  });
  app2.post(api.orders.create.path, async (req, res) => {
    try {
      const { productId } = api.orders.create.input.parse(req.body);
      let userId;
      if (req.session?.userId) {
        userId = req.session.userId;
      } else {
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await db.insert(users).values({
          id: guestId,
          email: null,
          firstName: "Guest",
          lastName: "User"
        });
        userId = guestId;
      }
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(400).json({ message: "Invalid product" });
      }
      let finalPrice = product.price;
      if (product.name.includes("New Mexico")) finalPrice = 63900;
      else if (product.name.includes("Wyoming")) finalPrice = 79900;
      else if (product.name.includes("Delaware")) finalPrice = 99900;
      const order = await storage.createOrder({
        userId,
        productId,
        amount: finalPrice,
        status: "pending",
        stripeSessionId: "mock_session_" + Date.now()
      });
      const application = await storage.createLlcApplication({
        orderId: order.id,
        status: "draft",
        state: product.name.split(" ")[0]
        // Extract state name correctly
      });
      let statePrefix = "NM";
      if (product.name.includes("Wyoming")) statePrefix = "WY";
      else if (product.name.includes("Delaware")) statePrefix = "DE";
      else if (product.name.includes("Mantenimiento") || product.name.includes("Maintenance")) statePrefix = "MN";
      const year = (/* @__PURE__ */ new Date()).getFullYear().toString().slice(-2);
      const orderNum = String(order.id).padStart(6, "0");
      const requestCode = `${statePrefix}-${year}${orderNum.slice(0, 2)}-${orderNum.slice(2)}`;
      const updatedApplication = await storage.updateLlcApplication(application.id, { requestCode });
      logActivity("Nuevo Pedido Recibido", {
        "Referencia": requestCode,
        "Producto": product.name,
        "Importe": `${(finalPrice / 100).toFixed(2)}\u20AC`,
        "Usuario": userId,
        "IP": req.ip
      });
      res.status(201).json({ ...order, application: updatedApplication });
      if (req.session?.email) {
        const [userData] = await db.select().from(users).where((0, import_drizzle_orm7.eq)(users.id, req.session.userId)).limit(1);
        if (userData?.email) {
          sendEmail({
            to: userData.email,
            subject: "\xA1Bienvenido a Easy US LLC! - Pr\xF3ximos pasos",
            html: getWelcomeEmailTemplate(userData.firstName || "Cliente")
          }).catch((err) => console.error("Error sending welcome email:", err));
        }
      }
    } catch (err) {
      if (err instanceof import_zod2.z.ZodError) {
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
      const { name, email, subject, content, requestCode } = req.body;
      const userId = req.session?.userId || null;
      const message = await storage.createMessage({
        userId,
        name,
        email,
        subject,
        content,
        requestCode,
        type: "contact"
      });
      sendEmail({
        to: email,
        subject: `Recibimos tu mensaje: ${subject || "Contacto"}`,
        html: getAutoReplyTemplate(name || "Cliente")
      }).catch(console.error);
      logActivity("Nuevo Mensaje de Contacto", {
        "Nombre": name,
        "Email": email,
        "Asunto": subject,
        "Mensaje": content,
        "Referencia": requestCode || "N/A"
      });
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Error sending message" });
    }
  });
  app2.patch("/api/llc/:id/data", isAuthenticated, async (req, res) => {
    try {
      const appId = Number(req.params.id);
      const updates = req.body;
      const [updated] = await db.update(messages).set({ ...updates, createdAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm7.eq)(messages.id, appId)).returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error updating request" });
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
        logActivity("Nueva Solicitud LLC", {
          "Referencia": orderIdentifier,
          "Estado Pago": "CONFIRMADO / COMPLETADO",
          "Propietario": updatedApp.ownerFullName,
          "DNI/Pasaporte": updatedApp.ownerIdNumber || "No proporcionado",
          "Email": updatedApp.ownerEmail,
          "Tel\xE9fono": updatedApp.ownerPhone,
          "Empresa": updatedApp.companyName,
          "Estado Registro": updatedApp.state,
          "Categor\xEDa": updatedApp.businessCategory === "Otra (especificar)" ? updatedApp.businessCategoryOther : updatedApp.businessCategory,
          "Notas": updatedApp.notes || "Ninguna"
        });
        sendEmail({
          to: updatedApp.ownerEmail,
          subject: `Confirmaci\xF3n de Solicitud ${orderIdentifier} - Easy US LLC`,
          html: getConfirmationEmailTemplate(updatedApp.ownerFullName || "Cliente", orderIdentifier, { companyName: updatedApp.companyName })
        }).catch((err) => console.error("Error sending confirmation email:", err));
      }
      res.json(updatedApp);
    } catch (err) {
      if (err instanceof import_zod2.z.ZodError) {
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
      const application = await storage.getLlcApplication(docData.applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      const document = await storage.createDocument(docData);
      res.status(201).json(document);
    } catch (err) {
      if (err instanceof import_zod2.z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  app2.delete(api.documents.delete.path, async (req, res) => {
    const docId = Number(req.params.id);
    await storage.deleteDocument(docId);
    res.json({ success: true });
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
  app2.post("/api/:type(llc|maintenance)/:id/send-otp", async (req, res) => {
    try {
      const type = req.params.type;
      const appId = Number(req.params.id);
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1e3);
      await storage.setOtp(type, appId, otp, expires);
      await sendEmail({
        to: email,
        subject: "C\xF3digo de verificaci\xF3n - Easy US LLC",
        html: getOtpEmailTemplate(otp)
      });
      res.json({ success: true });
    } catch (error) {
      console.error(`Error sending ${req.params.type} OTP:`, error);
      res.status(500).json({ message: "Error al enviar el c\xF3digo de verificaci\xF3n" });
    }
  });
  app2.post("/api/:type(llc|maintenance)/:id/verify-otp", async (req, res) => {
    const type = req.params.type;
    const appId = Number(req.params.id);
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: "OTP is required" });
    const success = await storage.verifyOtp(type, appId, otp);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ message: "C\xF3digo inv\xE1lido o caducado" });
    }
  });
  app2.post("/api/maintenance/orders", async (req, res) => {
    try {
      const { productId, state } = req.body;
      let userId;
      if (req.session?.userId) {
        userId = req.session.userId;
      } else {
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await db.insert(users).values({
          id: guestId,
          email: null,
          firstName: "Guest",
          lastName: "User"
        });
        userId = guestId;
      }
      const product = await storage.getProduct(productId);
      if (!product) return res.status(400).json({ message: "Invalid product" });
      const order = await storage.createOrder({
        userId,
        productId,
        amount: product.price,
        status: "pending",
        stripeSessionId: "mock_session_maint_" + Date.now()
      });
      const [application] = await db.insert(maintenanceApplications).values({
        orderId: order.id,
        status: "draft",
        state: state || product.name.split(" ")[0]
      }).returning();
      const timestamp3 = Date.now().toString();
      const randomPart = Math.random().toString(36).substring(7).toUpperCase();
      const requestCode = `MN-${timestamp3.substring(timestamp3.length - 4)}-${randomPart.substring(0, 3)}-${Math.floor(Math.random() * 9)}`;
      await db.update(maintenanceApplications).set({ requestCode }).where((0, import_drizzle_orm7.eq)(maintenanceApplications.id, application.id));
      res.status(201).json({ ...order, application: { ...application, requestCode } });
    } catch (err) {
      console.error("Error creating maintenance order:", err);
      res.status(500).json({ message: "Error creating maintenance order" });
    }
  });
  app2.get("/api/newsletter/status", isAuthenticated, async (req, res) => {
    const isSubscribed = await storage.isSubscribedToNewsletter(req.session.email);
    res.json({ isSubscribed });
  });
  app2.post("/api/newsletter/unsubscribe", isAuthenticated, async (req, res) => {
    await db.delete(newsletterSubscribers).where((0, import_drizzle_orm7.eq)(newsletterSubscribers.email, req.session.email));
    res.json({ success: true });
  });
  app2.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = import_zod2.z.object({ email: import_zod2.z.string().email().optional() }).parse(req.body);
      const targetEmail = email || req.session?.email || null;
      if (!targetEmail) {
        return res.status(400).json({ message: "Se requiere un email" });
      }
      const isSubscribed = await storage.isSubscribedToNewsletter(targetEmail);
      if (isSubscribed) {
        return res.json({ success: true, message: "Ya est\xE1s suscrito" });
      }
      await storage.subscribeToNewsletter(targetEmail);
      await sendEmail({
        to: targetEmail,
        subject: "\xA1Bienvenido a la Newsletter de Easy US LLC!",
        html: getNewsletterWelcomeTemplate()
      }).catch((err) => console.error("Error sending newsletter welcome email:", err));
      res.json({ success: true });
    } catch (err) {
      if (err instanceof import_zod2.z.ZodError) {
        return res.status(400).json({ message: "Email inv\xE1lido" });
      }
      res.status(500).json({ message: "Error al suscribirse" });
    }
  });
  app2.get("/api/admin/messages", isAdmin, async (req, res) => {
    try {
      const messages2 = await storage.getAllMessages();
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching admin messages" });
    }
  });
  app2.patch("/api/admin/messages/:id/status", isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const message = await storage.updateMessageStatus(Number(req.params.id), status);
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Error updating message status" });
    }
  });
  app2.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users2 = await db.select().from(users);
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  });
  app2.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      await db.delete(users).where((0, import_drizzle_orm7.eq)(users.id, userId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error al eliminar usuario" });
    }
  });
  app2.patch("/api/admin/users/:id/password", isAdmin, async (req, res) => {
    const userId = req.params.id;
    res.json({ success: true, message: "Instrucciones de reinicio enviadas" });
  });
  app2.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const updateSchema = import_zod2.z.object({
        firstName: import_zod2.z.string().min(1).max(100).optional(),
        lastName: import_zod2.z.string().min(1).max(100).optional(),
        email: import_zod2.z.string().email().optional(),
        phone: import_zod2.z.string().max(30).optional().nullable(),
        isActive: import_zod2.z.boolean().optional(),
        accountStatus: import_zod2.z.enum(["active", "pending", "suspended", "vip"]).optional()
      });
      const data = updateSchema.parse(req.body);
      const [updated] = await db.update(users).set({
        ...data,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm7.eq)(users.id, userId)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof import_zod2.z.ZodError) {
        return res.status(400).json({ message: "Datos inv\xE1lidos" });
      }
      res.status(500).json({ message: "Error al actualizar usuario" });
    }
  });
  app2.get("/api/admin/newsletter", isAdmin, async (req, res) => {
    try {
      const subscribers = await db.select().from(newsletterSubscribers).orderBy((0, import_drizzle_orm7.desc)(newsletterSubscribers.subscribedAt));
      res.json(subscribers);
    } catch (error) {
      console.error("Error fetching newsletter subscribers:", error);
      res.status(500).json({ message: "Error al obtener suscriptores" });
    }
  });
  app2.delete("/api/admin/newsletter/:id", isAdmin, async (req, res) => {
    try {
      await db.delete(newsletterSubscribers).where((0, import_drizzle_orm7.eq)(newsletterSubscribers.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar suscriptor" });
    }
  });
  const escapeHtml = (text3) => text3.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  app2.post("/api/admin/send-email", isAdmin, async (req, res) => {
    try {
      const { to, subject, message } = import_zod2.z.object({
        to: import_zod2.z.string().email(),
        subject: import_zod2.z.string().min(1).max(200),
        message: import_zod2.z.string().min(1).max(5e3)
      }).parse(req.body);
      const safeSubject = escapeHtml(subject);
      const safeMessage = escapeHtml(message);
      await sendEmail({
        to,
        subject: `${safeSubject} - Easy US LLC`,
        html: `
          <div style="background-color: #f9f9f9; padding: 20px 0;">
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
              ${getEmailHeader(safeSubject)}
              <div style="padding: 40px;">
                <div style="line-height: 1.6; font-size: 15px; color: #444; white-space: pre-wrap;">${safeMessage}</div>
              </div>
              ${getEmailFooter()}
            </div>
          </div>
        `
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Error al enviar email" });
    }
  });
  app2.post("/api/admin/request-document", isAdmin, async (req, res) => {
    try {
      const { email, documentType, message } = import_zod2.z.object({
        email: import_zod2.z.string().email(),
        documentType: import_zod2.z.string().min(1).max(200),
        message: import_zod2.z.string().max(2e3).optional()
      }).parse(req.body);
      const safeDocType = escapeHtml(documentType);
      const safeMessage = message ? escapeHtml(message) : "";
      await sendEmail({
        to: email,
        subject: "Solicitud de Documentos - Easy US LLC",
        html: `
          <div style="background-color: #f9f9f9; padding: 20px 0;">
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
              ${getEmailHeader("Solicitud de Documentos")}
              <div style="padding: 40px;">
                <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">Necesitamos documentaci\xF3n adicional</h2>
                <p style="line-height: 1.6; font-size: 15px; color: #444;">Para continuar con tu solicitud, necesitamos que nos proporciones: <strong>${safeDocType}</strong></p>
                ${safeMessage ? `<p style="line-height: 1.6; font-size: 15px; color: #444; margin-top: 15px;">${safeMessage}</p>` : ""}
                <div style="margin-top: 30px; text-align: center;">
                  <a href="https://easyusllc.com/dashboard" style="background-color: #6EDC8A; color: #000; padding: 12px 25px; text-decoration: none; border-radius: 100px; font-weight: 900; font-size: 13px; text-transform: uppercase;">Subir documentos \u2192</a>
                </div>
              </div>
              ${getEmailFooter()}
            </div>
          </div>
        `
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error requesting document:", error);
      res.status(500).json({ message: "Error al solicitar documento" });
    }
  });
  app2.post("/api/admin/send-note", isAdmin, async (req, res) => {
    try {
      const { userId, email, title, message, type, sendEmail: shouldSendEmail } = import_zod2.z.object({
        userId: import_zod2.z.string(),
        email: import_zod2.z.string().email(),
        title: import_zod2.z.string().min(1).max(200),
        message: import_zod2.z.string().min(1).max(5e3),
        type: import_zod2.z.enum(["info", "action_required", "update"]).default("info"),
        sendEmail: import_zod2.z.boolean().default(true)
      }).parse(req.body);
      const safeTitle = escapeHtml(title);
      const safeMessage = escapeHtml(message);
      await db.insert(userNotifications).values({
        userId,
        type,
        title: safeTitle,
        message: safeMessage,
        actionUrl: "/dashboard"
      });
      if (shouldSendEmail) {
        await sendEmail({
          to: email,
          subject: `${safeTitle} - Easy US LLC`,
          html: `
            <div style="background-color: #f9f9f9; padding: 20px 0;">
              <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
                ${getEmailHeader(type === "action_required" ? "Acci\xF3n Requerida" : "Nueva Nota")}
                <div style="padding: 40px;">
                  <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">${safeTitle}</h2>
                  <div style="line-height: 1.6; font-size: 15px; color: #444; white-space: pre-wrap;">${safeMessage}</div>
                  <div style="margin-top: 30px; text-align: center;">
                    <a href="https://easyusllc.com/dashboard" style="background-color: #6EDC8A; color: #000; padding: 12px 25px; text-decoration: none; border-radius: 100px; font-weight: 900; font-size: 13px; text-transform: uppercase;">Ver en mi panel \u2192</a>
                  </div>
                </div>
                ${getEmailFooter()}
              </div>
            </div>
          `
        });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending note:", error);
      res.status(500).json({ message: "Error al enviar nota" });
    }
  });
  app2.get("/api/admin/orders", isAdmin, async (req, res) => {
    try {
      const orders3 = await db.select().from(orders).orderBy((0, import_drizzle_orm7.desc)(orders.createdAt));
      const populatedOrders = await Promise.all(orders3.map(async (order) => {
        const [product] = order.productId ? await db.select().from(products).where((0, import_drizzle_orm7.eq)(products.id, order.productId)).limit(1) : [null];
        const [user] = order.userId ? await db.select().from(users).where((0, import_drizzle_orm7.eq)(users.id, order.userId)).limit(1) : [null];
        const [application] = await db.select().from(llcApplications).where((0, import_drizzle_orm7.eq)(llcApplications.orderId, order.id)).limit(1);
        return { ...order, product, user, application };
      }));
      res.json(populatedOrders);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Error al obtener pedidos" });
    }
  });
  app2.patch("/api/admin/orders/:id/status", isAdmin, async (req, res) => {
    const { status } = req.body;
    const order = await storage.updateOrderStatus(Number(req.params.id), status);
    const application = await storage.getLlcApplicationByOrderId(order.id);
    if (application && application.ownerEmail) {
      sendEmail({
        to: application.ownerEmail,
        subject: `Actualizaci\xF3n de pedido ${application.requestCode || `#${order.id}`} - Easy US LLC`,
        html: `
          <div style="background-color: #f9f9f9; padding: 20px 0;">
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
              ${getEmailHeader("Actualizaci\xF3n de Estado")}
              <div style="padding: 40px;">
                <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">Tu pedido ha cambiado de estado</h2>
                <p style="line-height: 1.6; font-size: 15px; color: #444;">Tu solicitud <strong>${application.requestCode || `#${order.id}`}</strong> ahora se encuentra en estado: <strong style="text-transform: uppercase;">${status}</strong>.</p>
                <div style="margin-top: 30px; text-align: center;">
                  <a href="https://easyusllc.com/dashboard" style="background-color: #6EDC8A; color: #000; padding: 12px 25px; text-decoration: none; border-radius: 100px; font-weight: 900; font-size: 13px; text-transform: uppercase;">Ir a mi panel \u2192</a>
                </div>
              </div>
              ${getEmailFooter()}
            </div>
          </div>
        `
      }).catch((e) => console.error("Update email error:", e));
    }
    res.json(order);
  });
  app2.get("/api/admin/invoice/:id", isAdmin, async (req, res) => {
    const orderId = Number(req.params.id);
    const order = await storage.getOrder(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.setHeader("Content-Type", "text/html");
    res.send(generateInvoiceHtml(order));
  });
  app2.get("/api/orders/:id/invoice", isAuthenticated, async (req, res) => {
    const orderId = Number(req.params.id);
    const order = await storage.getOrder(orderId);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
    if (order.userId !== req.session.userId && !req.session.isAdmin) {
      return res.status(403).json({ message: "No tienes permiso para ver esta factura" });
    }
    res.setHeader("Content-Type", "text/html");
    res.send(generateInvoiceHtml(order));
  });
  app2.get("/api/orders/:id/receipt", isAuthenticated, async (req, res) => {
    const orderId = Number(req.params.id);
    const order = await storage.getOrder(orderId);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
    if (order.userId !== req.session.userId && !req.session.isAdmin) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    res.setHeader("Content-Type", "text/html");
    res.send(generateReceiptHtml(order));
  });
  app2.get("/api/orders/:id/events", isAuthenticated, async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
      if (order.userId !== req.session.userId && !req.session.isAdmin) {
        return res.status(403).json({ message: "Acceso denegado" });
      }
      const events = await db.select().from(orderEvents).where((0, import_drizzle_orm7.eq)(orderEvents.orderId, orderId)).orderBy((0, import_drizzle_orm7.desc)(orderEvents.createdAt));
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
        const [user] = await db.select().from(users).where((0, import_drizzle_orm7.eq)(users.id, order.userId)).limit(1);
        if (user?.email) {
          sendEmail({
            to: user.email,
            subject: "Actualizaci\xF3n de tu pedido - Easy US LLC",
            html: `
              <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 40px; background: #fff;">
                ${getEmailHeader()}
                <div style="padding: 30px;">
                  <h2 style="color: #000; font-weight: 900;">Actualizaci\xF3n de Pedido #${orderId}</h2>
                  <div style="background: #f4f4f4; border-left: 4px solid #6EDC8A; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0; font-weight: 700;">${eventType}</p>
                    <p style="margin: 10px 0 0; color: #666;">${description}</p>
                  </div>
                  <p style="color: #666; font-size: 14px;">Fecha: ${(/* @__PURE__ */ new Date()).toLocaleString("es-ES")}</p>
                </div>
                ${getEmailFooter()}
              </div>
            `
          }).catch((e) => console.error("Error sending event email:", e));
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
      const replies = await db.select().from(messageReplies).where((0, import_drizzle_orm7.eq)(messageReplies.messageId, messageId)).orderBy(messageReplies.createdAt);
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
      const [reply] = await db.insert(messageReplies).values({
        messageId,
        content,
        isAdmin: req.session.isAdmin || false,
        createdBy: req.session.userId
      }).returning();
      const [message] = await db.select().from(messages).where((0, import_drizzle_orm7.eq)(messages.id, messageId)).limit(1);
      if (message?.email && !req.session.isAdmin) {
        sendEmail({
          to: message.email,
          subject: "Nueva respuesta a tu consulta - Easy US LLC",
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 40px; background: #fff;">
              ${getEmailHeader()}
              <div style="padding: 30px;">
                <h2 style="color: #000; font-weight: 900;">Respuesta a tu consulta</h2>
                <p style="color: #666;">Ticket ID: MSG-${messageId}</p>
                <div style="background: #f4f4f4; border-left: 4px solid #6EDC8A; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0;">${content}</p>
                </div>
                <p style="color: #666; font-size: 14px;">Puedes responder accediendo a tu \xE1rea de clientes.</p>
              </div>
              ${getEmailFooter()}
            </div>
          `
        }).catch((e) => console.error("Error sending reply email:", e));
      }
      res.json(reply);
    } catch (error) {
      console.error("Error creating reply:", error);
      res.status(500).json({ message: "Error al crear respuesta" });
    }
  });
  function generateInvoiceHtml(order) {
    const requestCode = order.application?.requestCode || `ORD-${order.id}`;
    const userName = order.user ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() : "Cliente";
    const userEmail = order.user?.email || "";
    const userPhone = order.user?.phone || "";
    const productName = order.product?.name || "Servicio de Constituci\xF3n LLC";
    const invoiceNumber = `INV-${new Date(order.createdAt).getFullYear()}-${String(order.id).padStart(5, "0")}`;
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
                <p style="margin-top: 10px;">info@easyusllc.com</p>
                <p>+34 614 91 69 10</p>
              </div>
            </div>
            <div class="detail-box">
              <div class="detail-label">Datos del Cliente</div>
              <div class="detail-content">
                <p><strong>${userName}</strong></p>
                <p>${userEmail}</p>
                ${userPhone ? `<p>${userPhone}</p>` : ""}
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
                <td>${(order.amount / 100).toFixed(2)} \u20AC</td>
              </tr>
            </tbody>
          </table>
          
          <div class="totals-section">
            <div class="totals-box">
              <div class="totals-row">
                <span>Subtotal</span>
                <span>${(order.amount / 100).toFixed(2)} \u20AC</span>
              </div>
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
            <p>info@easyusllc.com \u2022 +34 614 91 69 10 \u2022 www.easyusllc.com</p>
          </div>
        </body>
      </html>
    `;
  }
  function generateReceiptHtml(order) {
    const requestCode = order.application?.requestCode || `ORD-${order.id}`;
    const userName = order.user ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() : "Cliente";
    const userEmail = order.user?.email || "";
    const productName = order.product?.name || "Servicio de Constituci\xF3n LLC";
    const receiptNumber = `REC-${new Date(order.createdAt).getFullYear()}-${String(order.id).padStart(5, "0")}`;
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
              <div class="success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
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
              <div class="detail-row">
                <span class="detail-label">Total</span>
                <span class="detail-value highlight">${(order.amount / 100).toFixed(2)} \u20AC</span>
              </div>
            </div>
            
            <div class="receipt-footer">
              <p>Conserva este recibo para tus registros.</p>
              <p class="company">EASY US LLC \u2022 FORTUNY CONSULTING LLC</p>
              <p>1209 Mountain Road Place NE, STE R, Albuquerque, NM 87110</p>
              <p>info@easyusllc.com \u2022 +34 614 91 69 10</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
  app2.post("/api/contact/send-otp", async (req, res) => {
    try {
      const { email } = import_zod2.z.object({ email: import_zod2.z.string().email() }).parse(req.body);
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
      await db.insert(contactOtps).values({
        email,
        otp,
        expiresAt
      });
      await sendEmail({
        to: email,
        subject: "C\xF3digo de verificaci\xF3n - Easy US LLC",
        html: getOtpEmailTemplate(otp)
      });
      res.json({ success: true });
    } catch (err) {
      console.error("Error sending contact OTP:", err);
      res.status(400).json({ message: "Error al enviar el c\xF3digo de verificaci\xF3n. Por favor, int\xE9ntalo de nuevo en unos minutos." });
    }
  });
  app2.post("/api/contact/verify-otp", async (req, res) => {
    try {
      const { email, otp } = import_zod2.z.object({ email: import_zod2.z.string().email(), otp: import_zod2.z.string() }).parse(req.body);
      const [record] = await db.select().from(contactOtps).where(
        (0, import_drizzle_orm7.and)(
          (0, import_drizzle_orm7.eq)(contactOtps.email, email),
          (0, import_drizzle_orm7.eq)(contactOtps.otp, otp),
          (0, import_drizzle_orm7.gt)(contactOtps.expiresAt, /* @__PURE__ */ new Date())
        )
      ).limit(1);
      if (!record) {
        return res.status(400).json({ message: "C\xF3digo inv\xE1lido o caducado" });
      }
      await db.update(contactOtps).set({ verified: true }).where((0, import_drizzle_orm7.eq)(contactOtps.id, record.id));
      res.json({ success: true });
    } catch (err) {
      console.error("Error verifying contact OTP:", err);
      res.status(400).json({ message: "Error al verificar el c\xF3digo" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const contactData = import_zod2.z.object({
        nombre: import_zod2.z.string(),
        apellido: import_zod2.z.string(),
        email: import_zod2.z.string().email(),
        telefono: import_zod2.z.string().optional(),
        subject: import_zod2.z.string(),
        mensaje: import_zod2.z.string(),
        otp: import_zod2.z.string()
      }).parse(req.body);
      const [otpRecord] = await db.select().from(contactOtps).where(
        (0, import_drizzle_orm7.and)(
          (0, import_drizzle_orm7.eq)(contactOtps.email, contactData.email),
          (0, import_drizzle_orm7.eq)(contactOtps.otp, contactData.otp),
          (0, import_drizzle_orm7.eq)(contactOtps.verified, true)
        )
      ).limit(1);
      if (!otpRecord) {
        return res.status(400).json({ message: "Email no verificado" });
      }
      const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      const ticketId = Math.floor(1e7 + Math.random() * 9e7).toString();
      logActivity("Acci\xF3n Contacto", {
        "ID Ticket": `#${ticketId}`,
        "Nombre": `${contactData.nombre} ${contactData.apellido}`,
        "Email": contactData.email,
        "Tel\xE9fono": contactData.telefono || "No proporcionado",
        "Asunto": contactData.subject,
        "Mensaje": contactData.mensaje,
        "IP": clientIp
      });
      await sendEmail({
        to: contactData.email,
        subject: `Confirmaci\xF3n de mensaje - Easy US LLC #${ticketId}`,
        html: getAutoReplyTemplate(ticketId, contactData.nombre)
      });
      res.json({ success: true, ticketId });
    } catch (err) {
      console.error("Error processing contact form:", err);
      res.status(400).json({ message: "Error al procesar el mensaje" });
    }
  });
  app2.post("/api/maintenance/orders-legacy", async (req, res) => {
    try {
      const { productId, state } = req.body;
      let userId;
      if (req.session?.userId) {
        userId = req.session.userId;
      } else {
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await db.insert(users).values({
          id: guestId,
          email: null,
          firstName: "Guest",
          lastName: "User"
        });
        userId = guestId;
      }
      const product = await storage.getProduct(productId);
      if (!product) return res.status(400).json({ message: "Invalid product" });
      let finalPrice = product.price;
      if (state?.includes("New Mexico")) finalPrice = 34900;
      else if (state?.includes("Wyoming")) finalPrice = 49900;
      else if (state?.includes("Delaware")) finalPrice = 59900;
      const order = await storage.createOrder({
        userId,
        productId,
        amount: finalPrice,
        status: "pending",
        stripeSessionId: "mock_maintenance_" + Date.now()
      });
      const maintenanceResults = await db.insert(maintenanceApplications).values({
        orderId: order.id,
        status: "draft",
        state: state || "New Mexico"
      }).returning();
      const application = maintenanceResults[0];
      res.status(201).json({ ...order, application });
    } catch (err) {
      console.error("Error creating maintenance order:", err);
      res.status(500).json({ message: "Error" });
    }
  });
  app2.post("/api/maintenance/:id/send-otp", async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1e3);
    await db.update(maintenanceApplications).set({ emailOtp: otp, emailOtpExpires: expires }).where((0, import_drizzle_orm7.eq)(maintenanceApplications.id, Number(req.params.id)));
    await sendEmail({
      to: email,
      subject: "C\xF3digo de verificaci\xF3n - Easy US LLC",
      html: getOtpEmailTemplate(otp)
    });
    res.json({ success: true });
  });
  app2.post("/api/maintenance/:id/verify-otp", async (req, res) => {
    const appId = Number(req.params.id);
    const { otp } = req.body;
    const [app3] = await db.select().from(maintenanceApplications).where((0, import_drizzle_orm7.and)(
      (0, import_drizzle_orm7.eq)(maintenanceApplications.id, appId),
      (0, import_drizzle_orm7.eq)(maintenanceApplications.emailOtp, otp),
      (0, import_drizzle_orm7.gt)(maintenanceApplications.emailOtpExpires, /* @__PURE__ */ new Date())
    ));
    if (app3) {
      await db.update((init_schema(), __toCommonJS(schema_exports)).maintenanceApplications).set({ emailVerified: true }).where((0, import_drizzle_orm7.eq)((init_schema(), __toCommonJS(schema_exports)).maintenanceApplications.id, appId));
      res.json({ success: true });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  });
  app2.put("/api/maintenance/:id", async (req, res) => {
    const appId = Number(req.params.id);
    const updates = req.body;
    const [updatedApp] = await db.update(maintenanceApplications).set({ ...updates, lastUpdated: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm7.eq)(maintenanceApplications.id, appId)).returning();
    if (updates.status === "submitted") {
      logActivity("Nueva Solicitud Mantenimiento", {
        "Propietario": updatedApp.ownerFullName,
        "LLC": updatedApp.companyName,
        "EIN": updatedApp.ein,
        "Estado": updatedApp.state,
        "Email": updatedApp.ownerEmail,
        "Disolver": updatedApp.wantsDissolve || "No",
        "Servicios": updatedApp.expectedServices
      });
    }
    res.json(updatedApp);
  });
  await seedDatabase();
  app2.post("/api/admin/test-emails", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    try {
      const ticketId = "12345678";
      const otp = "888999";
      const name = "Cliente de Prueba";
      const requestCode = "NM-9999-ABC-0";
      const activityHtml = `
        <div style="background-color: #f9f9f9; padding: 20px 0;">
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
            ${getEmailHeader()}
            <div style="padding: 40px;">
              <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">Log de Actividad: Selecci\xF3n de Estado</h2>
              <div style="background: #f4f4f4; border-left: 4px solid #000; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Acci\xF3n:</strong> Clic en bot\xF3n elegir</p>
                <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Estado:</strong> New Mexico Pack</p>
          <p style="margin: 0; font-size: 14px;"><strong>Precio:</strong> 639\u20AC</p>
        </div>
        <p style="font-size: 12px; color: #999;">IP Origen: 127.0.0.1 | Fecha: ${(/* @__PURE__ */ new Date()).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p>
      </div>
      ${getEmailFooter()}
    </div>
  </div>
`;
      app2.post("/api/activity/track", async (req2, res2) => {
        const { action, details } = req2.body;
        if (action === "CLICK_ELEGIR_ESTADO") {
          let price = "639\u20AC";
          if (details.includes("Wyoming")) price = "799\u20AC";
          if (details.includes("Delaware")) price = "999\u20AC";
          logActivity("Selecci\xF3n de Estado", {
            "Pack": details,
            "Precio Base": price,
            "IP": req2.ip
          });
        }
        res2.json({ success: true });
      });
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
        sendEmail({ to: email, subject: "TEST: OTP Verificaci\xF3n de Identidad", html: getOtpEmailTemplate(otp) }),
        sendEmail({ to: email, subject: "TEST: Log de Actividad (Admin)", html: activityHtml }),
        sendEmail({ to: email, subject: "TEST: Nueva Solicitud LLC (Admin)", html: orderHtml }),
        sendEmail({ to: email, subject: "TEST: Confirmaci\xF3n de Pedido (Cliente)", html: getConfirmationEmailTemplate(name, requestCode, { companyName: "Mi Nueva Empresa LLC" }) }),
        sendEmail({ to: email, subject: "TEST: Bienvenido a Easy US LLC", html: getWelcomeEmailTemplate(name) }),
        sendEmail({ to: email, subject: "TEST: Newsletter Bienvenida", html: getNewsletterWelcomeTemplate() }),
        sendEmail({ to: email, subject: "TEST: Confirmaci\xF3n de Mensaje (Auto-reply)", html: getAutoReplyTemplate(ticketId, name) }),
        sendEmail({ to: email, subject: "TEST: OTP Mensaje de Contacto", html: getOtpEmailTemplate(otp) })
      ]);
      res.json({ success: true, message: "Emails de prueba administrativos mejorados enviados" });
    } catch (error) {
      console.error("Error sending test emails:", error);
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
      price: 63900,
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
      price: 79900,
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
      price: 99900,
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
var import_express = __toESM(require("express"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
function serveStatic(app2) {
  const distPath = import_path.default.resolve(__dirname, "public");
  if (!import_fs.default.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(import_express.default.static(distPath, {
    maxAge: "1y",
    immutable: true,
    index: false,
    etag: true,
    lastModified: true
  }));
  app2.use("*", (_req, res) => {
    res.sendFile(import_path.default.resolve(distPath, "index.html"), {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    });
  });
}

// server/index.ts
var import_http = require("http");
var import_compression = __toESM(require("compression"), 1);
var app = (0, import_express2.default)();
var httpServer = (0, import_http.createServer)(app);
app.use((0, import_compression.default)());
app.use(import_express2.default.json());
app.use(import_express2.default.urlencoded({ extended: false }));
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
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  if (req.method === "GET") {
    const isAsset = req.path.startsWith("/assets/") || req.path.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff2|woff)$/);
    if (isAsset) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  }
  next();
});
(async () => {
  await registerRoutes(httpServer, app);
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
    }
  );
})();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  log
});
//# sourceMappingURL=index.cjs.map
