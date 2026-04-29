import { createRouter, publicQuery } from "../middleware";
import { query } from "../lib/db";
import { z } from "zod";

export const disputesRouter = createRouter({
  list: publicQuery.query(async () => {
    return query("SELECT * FROM dispute ORDER BY created_at DESC", []);
  }),
  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await query("SELECT * FROM dispute WHERE dispute_id = ?", [input.id]);
      return rows[0] ?? null;
    }),
});
