import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, boolean, text, integer } from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id", { length: 8 }).unique(), // 8-digit numeric ID
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
  preferredLanguage: varchar("preferred_language", { length: 5 }).default("es"), // es, en, ca
  isAdmin: boolean("is_admin").notNull().default(false),
  isSupport: boolean("is_support").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  accountStatus: text("account_status").notNull().default("active"), // active (Verificado), pending (En revisión), deactivated (Desactivada), vip
  loginAttempts: integer("login_attempts").notNull().default(0),
  lockUntil: timestamp("lock_until"),
  internalNotes: text("internal_notes"),
  googleId: varchar("google_id"),
  // Security tracking fields
  lastLoginIp: varchar("last_login_ip"),
  loginCount: integer("login_count").notNull().default(0),
  securityOtpRequired: boolean("security_otp_required").notNull().default(false),
  lastSecurityOtpAt: timestamp("last_security_otp_at"),
  pendingProfileChanges: jsonb("pending_profile_changes"),
  pendingChangesExpiresAt: timestamp("pending_changes_expires_at"),
  identityVerificationStatus: text("identity_verification_status").notNull().default("none"),
  identityVerificationNotes: text("identity_verification_notes"),
  identityVerificationRequestedAt: timestamp("identity_verification_requested_at"),
  identityVerificationDocumentKey: text("identity_verification_document_key"),
  identityVerificationDocumentName: text("identity_verification_document_name"),
  identityVerificationReviewedAt: timestamp("identity_verification_reviewed_at"),
  userType: text("user_type").notNull().default("client"),
  staffRoleId: integer("staff_role_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  accountStatusIdx: index("users_account_status_idx").on(table.accountStatus),
  isAdminIdx: index("users_is_admin_idx").on(table.isAdmin),
  userTypeIdx: index("users_user_type_idx").on(table.userType),
}));

export const userNotifications = pgTable("user_notifications", {
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
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("user_notifications_user_id_idx").on(table.userId),
  index("user_notifications_is_read_idx").on(table.isRead),
  index("user_notifications_ticket_id_idx").on(table.ticketId),
]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type UserNotification = typeof userNotifications.$inferSelect;
