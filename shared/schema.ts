export * from "./models/auth";
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations, sql } from "drizzle-orm";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  features: jsonb("features").$type<string[]>().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  status: text("status").notNull().default("pending"), // pending, paid, processing, documents_ready, completed, cancelled
  stripeSessionId: text("stripe_session_id"),
  amount: integer("amount").notNull(),
  originalAmount: integer("original_amount"), // original amount before discount
  discountCode: varchar("discount_code", { length: 50 }),
  discountAmount: integer("discount_amount").default(0), // discount in cents
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"), // USD or EUR
  isInvoiceGenerated: boolean("is_invoice_generated").notNull().default(false),
  invoiceNumber: text("invoice_number"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("orders_user_id_idx").on(table.userId),
  statusIdx: index("orders_status_idx").on(table.status),
}));

export const llcApplications = pgTable("llc_applications", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  requestCode: text("request_code").unique(),
  ownerFullName: text("owner_full_name"),
  ownerEmail: text("owner_email"),
  ownerPhone: text("owner_phone"),
  ownerBirthDate: text("owner_birth_date"),
  ownerAddress: text("owner_address"),
  ownerStreetType: text("owner_street_type"), // Calle, Avenida, Paseo
  ownerCity: text("owner_city"),
  ownerCountry: text("owner_country"),
  ownerProvince: text("owner_province"),
  ownerPostalCode: text("owner_postal_code"),
  ownerIdNumber: text("owner_id_number"), // DNI/Passport number
  ownerIdType: text("owner_id_type"), // DNI or Passport
  idLater: boolean("id_later").notNull().default(false),
  dataProcessingConsent: boolean("data_processing_consent").notNull().default(false),
  termsConsent: boolean("terms_consent").notNull().default(false),
  ageConfirmation: boolean("age_confirmation").notNull().default(false),
  companyName: text("company_name"),
  companyNameOption2: text("company_name_option_2"),
  designator: text("designator"), // LLC, L.L.C., Ltd.
  companyDescription: text("company_description"),
  businessCategory: text("business_category"),
  businessActivity: text("business_activity"),
  businessCategoryOther: text("business_category_other"),
  ownerNamesAlternates: text("owner_names_alternates"), // Plan B, C, D names
  ownerCount: integer("owner_count").default(1),
  ownerCountryResidency: text("owner_country_residency"),
  idDocumentUrl: text("id_document_url"),
  isSellingOnline: text("is_selling_online"), // Yes, No, Not sure
  needsBankAccount: text("needs_bank_account"), // Mercury, Relay, No, Yes
  willUseStripe: text("will_use_stripe"), // Stripe, PayPal, Both, Other, Not yet
  wantsBoiReport: text("wants_boi_report"), // Yes, No, Info
  wantsMaintenancePack: text("wants_maintenance_pack"), // Yes, No, Info
  paymentMethod: text("payment_method"), // transfer, link
  paymentStatus: text("payment_status").notNull().default("unpaid"), // unpaid, paid
  notes: text("notes"),
  state: text("state"),
  status: text("status").notNull().default("draft"), // draft, submitted, filed, rejected
  submittedAt: timestamp("submitted_at"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  emailOtp: text("email_otp"),
  emailOtpExpires: timestamp("email_otp_expires"),
  emailVerified: boolean("email_verified").notNull().default(false),
  // Important dates for calendar
  llcCreatedDate: timestamp("llc_created_date"),
  agentRenewalDate: timestamp("agent_renewal_date"),
  irs1120DueDate: timestamp("irs_1120_due_date"),
  irs5472DueDate: timestamp("irs_5472_due_date"),
  annualReportDueDate: timestamp("annual_report_due_date"),
}, (table) => ({
  orderIdIdx: index("llc_apps_order_id_idx").on(table.orderId),
  requestCodeIdx: index("llc_apps_req_code_idx").on(table.requestCode),
  statusIdx: index("llc_apps_status_idx").on(table.status),
}));

export const applicationDocuments = pgTable("application_documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => llcApplications.id),
  orderId: integer("order_id").references(() => orders.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileUrl: text("file_url").notNull(),
  documentType: text("document_type").notNull(), // passport, id, company_docs, tax_id, official_filing, other
  reviewStatus: text("review_status").notNull().default("pending"), // pending, approved, rejected, action_required
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
}, (table) => ({
  applicationIdIdx: index("app_docs_application_id_idx").on(table.applicationId),
  orderIdIdx: index("app_docs_order_id_idx").on(table.orderId),
  uploadedByIdx: index("app_docs_uploaded_by_idx").on(table.uploadedBy),
}));

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  name: text("name"),
  email: text("email").notNull(),
  phone: text("phone"),
  contactByWhatsapp: boolean("contact_by_whatsapp").default(false),
  subject: text("subject"),
  content: text("content").notNull(),
  encryptedContent: text("encrypted_content"),
  status: text("status").notNull().default("unread"), // unread, read, archived
  type: text("type").notNull().default("contact"), // contact, support, system
  requestCode: text("request_code"),
  messageId: text("message_id").unique(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("messages_user_id_idx").on(table.userId),
  statusIdx: index("messages_status_idx").on(table.status),
  emailIdx: index("messages_email_idx").on(table.email),
}));

export const contactOtps = pgTable("contact_otps", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  otp: text("otp").notNull(),
  otpType: text("otp_type").notNull().default("contact"), // contact, password_change
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").notNull().default(false),
}, (table) => ({
  emailIdx: index("contact_otps_email_idx").on(table.email),
  expiresAtIdx: index("contact_otps_expires_at_idx").on(table.expiresAt),
}));

export const orderEvents = pgTable("order_events", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  eventType: text("event_type").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
}, (table) => ({
  orderIdIdx: index("order_events_order_id_idx").on(table.orderId),
}));

export const messageReplies = pgTable("message_replies", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => messages.id),
  content: text("content").notNull(),
  encryptedContent: text("encrypted_content"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

export const maintenanceApplications = pgTable("maintenance_applications", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  requestCode: text("request_code").unique(),
  ownerFullName: text("owner_full_name"),
  ownerEmail: text("owner_email"),
  ownerPhone: text("owner_phone"),
  companyName: text("company_name"),
  ein: text("ein"),
  state: text("state"),
  creationSource: text("creation_source"),
  creationYear: text("creation_year"),
  bankAccount: text("bank_account"),
  paymentGateway: text("payment_gateway"),
  businessActivity: text("business_activity"),
  expectedServices: text("expected_services"),
  status: text("status").notNull().default("draft"),
  submittedAt: timestamp("submitted_at"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  emailOtp: text("email_otp"),
  emailOtpExpires: timestamp("email_otp_expires"),
  emailVerified: boolean("email_verified").notNull().default(false),
  notes: text("notes"),
  wantsDissolve: text("wants_dissolve"),
  paymentMethod: text("payment_method"), // transfer, link
  authorizedManagement: boolean("authorized_management").notNull().default(false),
  termsConsent: boolean("terms_consent").notNull().default(false),
  dataProcessingConsent: boolean("data_processing_consent").notNull().default(false),
}, (table) => ({
  orderIdIdx: index("maint_apps_order_id_idx").on(table.orderId),
  requestCodeIdx: index("maint_apps_req_code_idx").on(table.requestCode),
  statusIdx: index("maint_apps_status_idx").on(table.status),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  product: one(products, { fields: [orders.productId], references: [products.id] }),
  application: one(llcApplications, { fields: [orders.id], references: [llcApplications.orderId] }),
  maintenanceApplication: one(maintenanceApplications, { fields: [orders.id], references: [maintenanceApplications.orderId] }),
  events: many(orderEvents),
}));

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] }),
}));

export const messagesRelations = relations(messages, ({ many }) => ({
  replies: many(messageReplies),
}));

export const messageRepliesRelations = relations(messageReplies, ({ one }) => ({
  message: one(messages, { fields: [messageReplies.messageId], references: [messages.id] }),
}));

export const llcApplicationsRelations = relations(llcApplications, ({ one, many }) => ({
  order: one(orders, { fields: [llcApplications.orderId], references: [orders.id] }),
  documents: many(applicationDocuments),
}));

export const applicationDocumentsRelations = relations(applicationDocuments, ({ one }) => ({
  application: one(llcApplications, { fields: [applicationDocuments.applicationId], references: [llcApplications.id] }),
}));

export const maintenanceApplicationsRelations = relations(maintenanceApplications, ({ one }) => ({
  order: one(orders, { fields: [maintenanceApplications.orderId], references: [orders.id] }),
}));

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertLlcApplicationSchema = createInsertSchema(llcApplications).omit({ id: true, lastUpdated: true });
export const insertApplicationDocumentSchema = createInsertSchema(applicationDocuments).omit({ id: true, uploadedAt: true });
export const insertMaintenanceApplicationSchema = createInsertSchema(maintenanceApplications).omit({ id: true, lastUpdated: true });
export const insertContactOtpSchema = createInsertSchema(contactOtps).omit({ id: true });
export const insertOrderEventSchema = createInsertSchema(orderEvents).omit({ id: true, createdAt: true });
export const insertMessageReplySchema = createInsertSchema(messageReplies).omit({ id: true, createdAt: true });

// Discount codes table
export const discountCodes = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  discountType: varchar("discount_type", { length: 20 }).notNull().default("percentage"), // percentage or fixed
  discountValue: integer("discount_value").notNull(), // percentage (0-100) or fixed amount in cents
  minOrderAmount: integer("min_order_amount").default(0), // minimum order amount in cents
  maxUses: integer("max_uses"), // null = unlimited
  usedCount: integer("used_count").notNull().default(0),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({ id: true, createdAt: true, usedCount: true });
export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;

export type MaintenanceApplication = typeof maintenanceApplications.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type LlcApplication = typeof llcApplications.$inferSelect;
export type ApplicationDocument = typeof applicationDocuments.$inferSelect;
export type OrderEvent = typeof orderEvents.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MessageReply = typeof messageReplies.$inferSelect;

export type CreateOrderRequest = {
  productId: number;
};
export type UpdateLlcApplicationRequest = Partial<z.infer<typeof insertLlcApplicationSchema>>;
export type CreateDocumentRequest = z.infer<typeof insertApplicationDocumentSchema>;
