import { createRouter, publicQuery, authedQuery } from "../middleware";
import { query } from "../lib/db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const servicesRouter = createRouter({
  list: publicQuery
    .input(z.object({ typeId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      let sql = `SELECT s.*, u.first_name, u.last_name FROM service s JOIN users u ON s.user_id = u.user_id`;
      const params: any[] = [];
      if (input?.typeId) {
        sql += " WHERE s.t_id = ?";
        params.push(input.typeId);
      }
      sql += " ORDER BY s.avg_rating DESC";
      return query(sql, params);
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await query(
        `SELECT s.*, u.first_name, u.last_name FROM service s JOIN users u ON s.user_id = u.user_id WHERE s.service_id = ?`,
        [input.id]
      );
      if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Service not found" });
      const details = await query(
        "SELECT detail_key, detail_val FROM service_detail WHERE service_id = ?",
        [input.id]
      );
      return { service: rows[0], details };
    }),

  types: publicQuery.query(async () => {
    return query("SELECT * FROM service_type ORDER BY t_id", []);
  }),
});
