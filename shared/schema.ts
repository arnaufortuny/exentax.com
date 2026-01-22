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
  requestCode: text("request_code"),
  ownerFullName: text("owner_full_name"),
  ownerEmail: text("owner_email"),
  ownerPhone: text("owner_phone"),
  ownerBirthDate: text("owner_birth_date"),
  ownerAddress: text("owner_address"),
  ownerCity: text("owner_city"),
  ownerCountry: text("owner_country"),
  ownerProvince: text("owner_province"),
  ownerPostalCode: text("owner_postal_code"),
  ownerIdNumber: text("owner_id_number"), // DNI/Passport number
  ownerIdType: text("owner_id_type"), // DNI or Passport
  idLater: boolean("id_later").notNull().default(false),
  dataProcessingConsent: boolean("data_processing_consent").notNull().default(false),
  ageConfirmation: boolean("age_confirmation").notNull().default(false),
  companyName: text("company_name"),
  companyNameOption2: text("company_name_option_2"),
  designator: text("designator"), // LLC, L.L.C., Ltd.
  companyDescription: text("company_description"),
  businessCategory: text("business_category"),
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

