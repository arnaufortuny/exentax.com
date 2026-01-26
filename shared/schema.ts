export * from "./models/auth";
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations } from "drizzle-orm";

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
  status: text("status").notNull().default("pending"), // pending, paid, cancelled
  stripeSessionId: text("stripe_session_id"),
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

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
  paymentStatus: text("payment_status").notNull().default("unpaid"), // unpaid, paid
  notes: text("notes"),
  state: text("state"),
  status: text("status").notNull().default("draft"), // draft, submitted, filed, rejected
  submittedAt: timestamp("submitted_at"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  emailOtp: text("email_otp"),
  emailOtpExpires: timestamp("email_otp_expires"),
  emailVerified: boolean("email_verified").notNull().default(false),
});

// Application documents table
export const applicationDocuments = pgTable("application_documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => llcApplications.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileUrl: text("file_url").notNull(),
  documentType: text("document_type").notNull(), // passport, id, other
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Relations
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
  subject: text("subject"),
  content: text("content").notNull(),
  status: text("status").notNull().default("unread"), // unread, read, archived
  type: text("type").notNull().default("contact"), // contact, support, system
  requestCode: text("request_code"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactOtps = pgTable("contact_otps", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").notNull().default(false),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  product: one(products, { fields: [orders.productId], references: [products.id] }),
  application: one(llcApplications, { fields: [orders.id], references: [llcApplications.orderId] }),
}));

export const llcApplicationsRelations = relations(llcApplications, ({ one, many }) => ({
  order: one(orders, { fields: [llcApplications.orderId], references: [orders.id] }),
  documents: many(applicationDocuments),
}));

export const applicationDocumentsRelations = relations(applicationDocuments, ({ one }) => ({
  application: one(llcApplications, { fields: [applicationDocuments.applicationId], references: [llcApplications.id] }),
}));

// Schemas
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertLlcApplicationSchema = createInsertSchema(llcApplications).omit({ id: true, lastUpdated: true });
export const insertApplicationDocumentSchema = createInsertSchema(applicationDocuments).omit({ id: true, uploadedAt: true });

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
  authorizedManagement: boolean("authorized_management").notNull().default(false),
  termsConsent: boolean("terms_consent").notNull().default(false),
  dataProcessingConsent: boolean("data_processing_consent").notNull().default(false),
});

export const insertMaintenanceApplicationSchema = createInsertSchema(maintenanceApplications).omit({ id: true, lastUpdated: true });

export const insertContactOtpSchema = createInsertSchema(contactOtps).omit({ id: true });

export type MaintenanceApplication = typeof maintenanceApplications.$inferSelect;

export const maintenanceApplicationsRelations = relations(maintenanceApplications, ({ one }) => ({
  order: one(orders, { fields: [maintenanceApplications.orderId], references: [orders.id] }),
}));

// Types
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type LlcApplication = typeof llcApplications.$inferSelect;
export type ApplicationDocument = typeof applicationDocuments.$inferSelect;

// Request Types
export type CreateOrderRequest = {
  productId: number;
};
export type UpdateLlcApplicationRequest = Partial<z.infer<typeof insertLlcApplicationSchema>>;
export type CreateDocumentRequest = z.infer<typeof insertApplicationDocumentSchema>;

