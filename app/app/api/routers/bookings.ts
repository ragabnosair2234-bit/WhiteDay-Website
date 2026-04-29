import { createRouter, authedQuery, publicQuery } from "../middleware";
import { query } from "../lib/db";
import { z } from "zod";

export const bookingsRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    return query(
      `SELECT b.*, u.first_name, u.last_name FROM booking b JOIN users u ON b.user_id = u.user_id WHERE b.user_id = ? ORDER BY b.booking_date DESC`,
      [ctx.user.user_id]
    );
  }),
  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await query(
        "SELECT * FROM booking WHERE booking_id = ?",
        [input.id]
      );
      return rows[0] ?? null;
    }),
});
