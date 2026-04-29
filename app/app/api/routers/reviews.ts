import { createRouter, publicQuery } from "../middleware";
import { query } from "../lib/db";
import { z } from "zod";

export const reviewsRouter = createRouter({
  list: publicQuery.query(async () => {
    return query("SELECT * FROM review ORDER BY created_at DESC", []);
  }),
  byService: publicQuery
    .input(z.object({ serviceId: z.number() }))
    .query(async ({ input }) => {
      return query(
        "SELECT r.*, u.first_name, u.last_name FROM review r JOIN users u ON r.user_id = u.user_id WHERE r.service_id = ? ORDER BY r.created_at DESC",
        [input.serviceId]
      );
    }),
});
