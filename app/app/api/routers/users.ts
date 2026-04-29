import { createRouter, authedQuery, publicQuery } from "../middleware";
import { query } from "../lib/db";
import { z } from "zod";

export const usersRouter = createRouter({
  me: authedQuery.query(async ({ ctx }) => {
    const { password, ...safe } = ctx.user;
    return safe;
  }),
  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await query(
        "SELECT user_id, first_name, last_name, email, phone, role FROM users WHERE user_id = ?",
        [input.id]
      );
      return rows[0] ?? null;
    }),
});
