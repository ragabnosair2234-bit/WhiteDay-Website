import {
  mysqlTable,
  int,
  varchar,
  text,
  decimal,
  date,
  primaryKey,
} from "drizzle-orm/mysql-core";

// ── Platform Contact ─────────────────────────────────────────────────────
export const platformContact = mysqlTable("platform_contact", {
  contactId: int("contact_id").primaryKey(),
  platformName: varchar("platform_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
});

export type PlatformContact = typeof platformContact.$inferSelect;

// ── Users ────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  userId: int("user_id").primaryKey(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Service Type ───────────────────────────────────────────────────────
export const serviceType = mysqlTable("service_type", {
  tId: int("t_id").primaryKey(),
  serviceName: varchar("service_name", { length: 100 }).notNull(),
});

export type ServiceType = typeof serviceType.$inferSelect;

// ── Service ──────────────────────────────────────────────────────────────
export const service = mysqlTable("service", {
  serviceId: int("service_id").primaryKey(),
  sName: varchar("s_name", { length: 150 }).notNull(),
  description: text("description"),
  mediaFiles: varchar("media_files", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 20 }).notNull(),
  contactEmail: varchar("contact_email", { length: 100 }),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  city: varchar("city", { length: 50 }),
  location: varchar("location", { length: 100 }),
  avgRating: decimal("avg_rating", { precision: 3, scale: 1 }).default("0.0"),
  reviewCount: int("review_count").default(0),
  userId: int("user_id").notNull(),
  tId: int("t_id").notNull(),
});

export type Service = typeof service.$inferSelect;

// ── Service Detail ──────────────────────────────────────────────────────
export const serviceDetail = mysqlTable("service_detail", {
  detailId: int("detail_id").primaryKey(),
  serviceId: int("service_id").notNull(),
  detailKey: varchar("detail_key", { length: 100 }).notNull(),
  detailVal: varchar("detail_val", { length: 255 }).notNull(),
});

export type ServiceDetail = typeof serviceDetail.$inferSelect;

// ── Booking ────────────────────────────────────────────────────────────
export const booking = mysqlTable("booking", {
  bookingId: int("booking_id").primaryKey(),
  status: varchar("status", { length: 20 }).notNull(),
  bookingDate: date("booking_date").notNull(),
  deliveryDate: date("delivery_date"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  userId: int("user_id").notNull(),
});

export type Booking = typeof booking.$inferSelect;

// ── Booking Includes ────────────────────────────────────────────────────
export const bookingIncludes = mysqlTable(
  "booking_includes",
  {
    bookingId: int("booking_id").notNull(),
    serviceId: int("service_id").notNull(),
    quantity: int("quantity").default(1),
    unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.bookingId, table.serviceId] }),
  })
);

export type BookingIncludes = typeof bookingIncludes.$inferSelect;

// ── Wallet Payment ─────────────────────────────────────────────────────
export const walletPayment = mysqlTable("wallet_payment", {
  transactionId: int("transaction_id").primaryKey(),
  paymentMethod: varchar("payment_method", { length: 20 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 12, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }),
  paymentDate: date("payment_date").notNull(),
  bookingId: int("booking_id").notNull(),
  userId: int("user_id").notNull(),
});

export type WalletPayment = typeof walletPayment.$inferSelect;

// ── Review ─────────────────────────────────────────────────────────────
export const review = mysqlTable("review", {
  reviewId: int("review_id").primaryKey(),
  rateStar: decimal("rate_star", { precision: 3, scale: 1 }).notNull(),
  comment: text("comment"),
  createdAt: date("created_at").notNull(),
  userId: int("user_id").notNull(),
  serviceId: int("service_id").notNull(),
});

export type Review = typeof review.$inferSelect;

// ── Dispute ─────────────────────────────────────────────────────────────
export const dispute = mysqlTable("dispute", {
  disputeId: int("dispute_id").primaryKey(),
  issueDescription: text("issue_description").notNull(),
  managerDecision: varchar("manager_decision", { length: 50 }),
  createdAt: date("created_at").notNull(),
  userId: int("user_id").notNull(),
  bookingId: int("booking_id").notNull(),
});

export type Dispute = typeof dispute.$inferSelect;
