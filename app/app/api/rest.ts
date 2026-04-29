import { Hono } from "hono";
import { query } from "./lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "./lib/jwt";

export const restRouter = new Hono();

// POST /api/rest/auth/login
restRouter.post("/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // msnodesqlv8 uses ? positional parameters
    const users = await query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return c.json({ error: "User not found" }, 404);

    const user = users[0] as any;

    let valid = false;
    if ((user.password as string).startsWith("hashed_")) {
      valid = true; // accept seeded placeholder passwords for demo
    } else {
      valid = await bcrypt.compare(password, user.password);
    }

    if (!valid) return c.json({ error: "Invalid password" }, 401);

    const token = await signToken({
      userId: user.user_id,
      email: user.email,
      role: user.role,
    });

    return c.json({
      token,
      user: {
        id: user.user_id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error("[login] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// GET /api/rest/services?typeId=1
restRouter.get("/services", async (c) => {
  try {
    const typeId = c.req.query("typeId");
    let sqlQuery = `
      SELECT s.service_id, s.s_name, s.description, s.media_files,
             s.contact_phone, s.contact_email, s.price, s.city, s.location,
             s.avg_rating, s.review_count, s.t_id,
             u.first_name, u.last_name
      FROM service s
      JOIN users u ON s.user_id = u.user_id
    `;
    const params: any[] = [];
    if (typeId) {
      sqlQuery += " WHERE s.t_id = ?";
      params.push(parseInt(typeId));
    }
    sqlQuery += " ORDER BY s.avg_rating DESC";
    const services = await query(sqlQuery, params);
    return c.json({ data: services });
  } catch (err: any) {
    console.error("[services] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// GET /api/rest/service-types
restRouter.get("/service-types", async (c) => {
  try {
    const types = await query("SELECT * FROM service_type ORDER BY t_id", []);
    return c.json({ data: types });
  } catch (err: any) {
    console.error("[service-types] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// GET /api/rest/services/:id  – single service detail
restRouter.get("/services/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const rows = await query(
      `SELECT s.*, u.first_name, u.last_name
       FROM service s JOIN users u ON s.user_id = u.user_id
       WHERE s.service_id = ?`,
      [id]
    );
    if (rows.length === 0) return c.json({ error: "Service not found" }, 404);

    const details = await query(
      "SELECT detail_key, detail_val FROM service_detail WHERE service_id = ?",
      [id]
    );
    return c.json({ data: rows[0], details });
  } catch (err: any) {
    console.error("[service-detail] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});
