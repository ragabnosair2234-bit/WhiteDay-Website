import { relations } from "drizzle-orm";
import {
  users,
  serviceType,
  service,
  serviceDetail,
  booking,
  bookingIncludes,
  walletPayment,
  review,
  dispute,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  services: many(service),
  bookings: many(booking),
  walletPayments: many(walletPayment),
  reviews: many(review),
  disputes: many(dispute),
}));

export const serviceTypeRelations = relations(serviceType, ({ many }) => ({
  services: many(service),
}));

export const serviceRelations = relations(service, ({ one, many }) => ({
  provider: one(users, {
    fields: [service.userId],
    references: [users.userId],
  }),
  type: one(serviceType, {
    fields: [service.tId],
    references: [serviceType.tId],
  }),
  details: many(serviceDetail),
  bookingIncludes: many(bookingIncludes),
  reviews: many(review),
}));

export const serviceDetailRelations = relations(serviceDetail, ({ one }) => ({
  service: one(service, {
    fields: [serviceDetail.serviceId],
    references: [service.serviceId],
  }),
}));

export const bookingRelations = relations(booking, ({ one, many }) => ({
  customer: one(users, {
    fields: [booking.userId],
    references: [users.userId],
  }),
  services: many(bookingIncludes),
  walletPayments: many(walletPayment),
  disputes: many(dispute),
}));

export const bookingIncludesRelations = relations(bookingIncludes, ({ one }) => ({
  booking: one(booking, {
    fields: [bookingIncludes.bookingId],
    references: [booking.bookingId],
  }),
  service: one(service, {
    fields: [bookingIncludes.serviceId],
    references: [service.serviceId],
  }),
}));

export const walletPaymentRelations = relations(walletPayment, ({ one }) => ({
  booking: one(booking, {
    fields: [walletPayment.bookingId],
    references: [booking.bookingId],
  }),
  user: one(users, {
    fields: [walletPayment.userId],
    references: [users.userId],
  }),
}));

export const reviewRelations = relations(review, ({ one }) => ({
  user: one(users, {
    fields: [review.userId],
    references: [users.userId],
  }),
  service: one(service, {
    fields: [review.serviceId],
    references: [service.serviceId],
  }),
}));

export const disputeRelations = relations(dispute, ({ one }) => ({
  user: one(users, {
    fields: [dispute.userId],
    references: [users.userId],
  }),
  booking: one(booking, {
    fields: [dispute.bookingId],
    references: [booking.bookingId],
  }),
}));
