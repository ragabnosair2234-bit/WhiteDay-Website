import { createRouter, publicQuery } from "../middleware";
import { query } from "../lib/db";
import { z } from "zod";

export const paymentsRouter = createRouter({
  list: publicQuery.query(async () => {
    return query("SELECT * FROM wallet_payment ORDER BY payment_date DESC", []);
  }),
  byBooking: publicQuery
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ input }) => {
      return query("SELECT * FROM wallet_payment WHERE booking_id = ?", [input.bookingId]);
    }),
});
