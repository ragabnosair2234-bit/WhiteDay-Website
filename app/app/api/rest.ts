import { Hono } from "hono";
import { query } from "./lib/db";
import bcrypt from "bcryptjs";
import { signToken, verifyToken } from "./lib/jwt";
import type { JWTPayload } from "./lib/jwt";
import { findUserByEmail, createUser, getNextUserId } from "./queries/users";

// ─── Auth helper ────────────────────────────────────────────────────────────

/**
 * Extract and verify the Bearer token from the Authorization header.
 * Returns the decoded payload or null if missing / invalid.
 */
async function getAuthUser(req: Request): Promise<JWTPayload | null> {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  return verifyToken(auth.slice(7));
}

/**
 * Resolve the next available integer primary key for a table.
 * Uses MAX(col)+1 — suitable for low-concurrency demo workloads.
 * `table` and `col` are validated against an allowlist to prevent injection.
 */
const NEXT_ID_ALLOWLIST: Record<string, string[]> = {
  booking:        ["booking_id"],
  wallet_payment: ["transaction_id"],
  review:         ["review_id"],
  dispute:        ["dispute_id"],
};

async function nextId(table: string, col: string): Promise<number> {
  const allowedCols = NEXT_ID_ALLOWLIST[table];
  if (!allowedCols || !allowedCols.includes(col)) {
    throw new Error(`nextId: disallowed table/column combination: ${table}.${col}`);
  }
  const rows = await query(`SELECT MAX(${col}) AS m FROM ${table}`, []);
  const max = (rows[0] as any)?.m ?? 0;
  return (max as number) + 1;
}

/** Return today's date as YYYY-MM-DD string */
function today(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Router ─────────────────────────────────────────────────────────────────

export const restRouter = new Hono();

// ── Auth ─────────────────────────────────────────────────────────────────────

// POST /api/rest/auth/login
restRouter.post("/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

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
      data: {
        token,
        user: {
          id: user.user_id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err: any) {
    console.error("[login] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// POST /api/rest/auth/register
restRouter.post("/auth/register", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, phone, password, role } = body;
    if (!name || !email || !phone || !password) {
      return c.json({ error: "name, email, phone and password are required" }, 400);
    }

    const existing = await findUserByEmail(email);
    if (existing) return c.json({ error: "Email already registered" }, 409);

    const [firstName, ...rest] = (name as string).trim().split(" ");
    const lastName = rest.join(" ") || "-";
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await getNextUserId();

    const user = await createUser({
      userId,
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: role === "provider" ? "provider" : "customer",
    });

    if (!user) return c.json({ error: "Failed to create user" }, 500);

    const token = await signToken({
      userId: (user as any).user_id,
      email: (user as any).email,
      role: (user as any).role,
    });

    return c.json({
      data: {
        token,
        user: {
          id: (user as any).user_id,
          name: `${(user as any).first_name} ${(user as any).last_name}`,
          email: (user as any).email,
          role: (user as any).role,
        },
      },
    }, 201);
  } catch (err: any) {
    console.error("[register] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// GET /api/rest/auth/me  (requires Bearer token)
restRouter.get("/auth/me", async (c) => {
  const authUser = await getAuthUser(c.req.raw);
  if (!authUser) return c.json({ error: "Unauthorized" }, 401);

  try {
    const rows = await query(
      "SELECT user_id, first_name, last_name, email, phone, role FROM users WHERE user_id = ?",
      [authUser.userId]
    );
    if (rows.length === 0) return c.json({ error: "User not found" }, 404);
    return c.json({ data: rows[0] });
  } catch (err: any) {
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// ── Services ──────────────────────────────────────────────────────────────────

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

// ── Bookings ──────────────────────────────────────────────────────────────────

// POST /api/rest/bookings
restRouter.post("/bookings", async (c) => {
  const authUser = await getAuthUser(c.req.raw);
  if (!authUser) return c.json({ error: "Unauthorized" }, 401);

  try {
    const body = await c.req.json();
    const { service_id, event_date, notes } = body;
    if (!service_id || !event_date) {
      return c.json({ error: "service_id and event_date are required" }, 400);
    }

    const svcRows = await query("SELECT price FROM service WHERE service_id = ?", [service_id]);
    if (svcRows.length === 0) return c.json({ error: "Service not found" }, 404);
    const price = (svcRows[0] as any).price as number;

    const bookingId = await nextId("booking", "booking_id");
    const todayStr = today();

    await query(
      `INSERT INTO booking (booking_id, status, booking_date, delivery_date, total_amount, user_id)
       VALUES (?, 'pending', ?, ?, ?, ?)`,
      [bookingId, todayStr, event_date, price, authUser.userId]
    );

    await query(
      `INSERT INTO booking_includes (booking_id, service_id, quantity, unit_price) VALUES (?, ?, 1, ?)`,
      [bookingId, service_id, price]
    );

    const rows = await query("SELECT * FROM booking WHERE booking_id = ?", [bookingId]);
    return c.json({ data: rows[0] }, 201);
  } catch (err: any) {
    console.error("[bookings:create] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// GET /api/rest/bookings
restRouter.get("/bookings", async (c) => {
  const authUser = await getAuthUser(c.req.raw);
  if (!authUser) return c.json({ error: "Unauthorized" }, 401);

  try {
    const rows = await query(
      `SELECT b.* FROM booking b WHERE b.user_id = ? ORDER BY b.booking_date DESC`,
      [authUser.userId]
    );
    return c.json({ data: rows });
  } catch (err: any) {
    console.error("[bookings:list] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// GET /api/rest/bookings/:id
restRouter.get("/bookings/:id", async (c) => {
  const authUser = await getAuthUser(c.req.raw);
  if (!authUser) return c.json({ error: "Unauthorized" }, 401);

  try {
    const id = parseInt(c.req.param("id"));
    const rows = await query("SELECT * FROM booking WHERE booking_id = ?", [id]);
    if (rows.length === 0) return c.json({ error: "Booking not found" }, 404);

    const booking = rows[0] as any;
    // Only the booking owner can see it (or admin)
    if (booking.user_id !== authUser.userId && authUser.role !== "admin") {
      return c.json({ error: "Forbidden" }, 403);
    }

    const items = await query(
      `SELECT bi.*, s.s_name FROM booking_includes bi
       JOIN service s ON bi.service_id = s.service_id
       WHERE bi.booking_id = ?`,
      [id]
    );
    return c.json({ data: { ...booking, items } });
  } catch (err: any) {
    console.error("[bookings:get] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// PATCH /api/rest/bookings/:id/cancel
restRouter.patch("/bookings/:id/cancel", async (c) => {
  const authUser = await getAuthUser(c.req.raw);
  if (!authUser) return c.json({ error: "Unauthorized" }, 401);

  try {
    const id = parseInt(c.req.param("id"));
    const rows = await query("SELECT * FROM booking WHERE booking_id = ?", [id]);
    if (rows.length === 0) return c.json({ error: "Booking not found" }, 404);

    const booking = rows[0] as any;
    if (booking.user_id !== authUser.userId) return c.json({ error: "Forbidden" }, 403);
    if (booking.status !== "pending") {
      return c.json({ error: "Only pending bookings can be cancelled" }, 422);
    }

    await query("UPDATE booking SET status = 'cancelled' WHERE booking_id = ?", [id]);
    return c.json({ data: { booking_id: id, status: "cancelled" } });
  } catch (err: any) {
    console.error("[bookings:cancel] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// PATCH /api/rest/bookings/:id/confirm  (provider only)
restRouter.patch("/bookings/:id/confirm", async (c) => {
  const authUser = await getAuthUser(c.req.raw);
  if (!authUser) return c.json({ error: "Unauthorized" }, 401);
  if (authUser.role !== "provider" && authUser.role !== "admin") {
    return c.json({ error: "Forbidden — providers only" }, 403);
  }

  try {
    const id = parseInt(c.req.param("id"));
    const rows = await query("SELECT * FROM booking WHERE booking_id = ?", [id]);
    if (rows.length === 0) return c.json({ error: "Booking not found" }, 404);

    await query("UPDATE booking SET status = 'confirmed' WHERE booking_id = ?", [id]);
    return c.json({ data: { booking_id: id, status: "confirmed" } });
  } catch (err: any) {
    console.error("[bookings:confirm] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// PATCH /api/rest/bookings/:id/complete  (provider only)
restRouter.patch("/bookings/:id/complete", async (c) => {
  const authUser = await getAuthUser(c.req.raw);
  if (!authUser) return c.json({ error: "Unauthorized" }, 401);
  if (authUser.role !== "provider" && authUser.role !== "admin") {
    return c.json({ error: "Forbidden — providers only" }, 403);
  }

  try {
    const id = parseInt(c.req.param("id"));
    const rows = await query("SELECT * FROM booking WHERE booking_id = ?", [id]);
    if (rows.length === 0) return c.json({ error: "Booking not found" }, 404);

    await query("UPDATE booking SET status = 'completed' WHERE booking_id = ?", [id]);
    return c.json({ data: { booking_id: id, status: "completed" } });
  } catch (err: any) {
    console.error("[bookings:complete] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// ── Wallet ────────────────────────────────────────────────────────────────────

const COMMISSION_RATE = 0.05; // 5 %

/** Derive balance from wallet_payment rows (credits − debits for the user). */
async function getWalletBalance(userId: number): Promise<number> {
  // Credits: topup rows have booking_id = 0 (or we use payment_method = 'topup')
  // We store topups with payment_method = 'topup'; debits with payment_method = 'wallet'
  const rows = await query(
    `SELECT payment_method, amount FROM wallet_payment WHERE user_id = ?`,
    [userId]
  );
  let balance = 0;
  for (const r of rows as any[]) {
    if (r.payment_method === "topup") {
      balance += Number(r.amount);
    } else if (r.payment_method === "wallet") {
      balance -= Number(r.amount);
    }
  }
  return balance;
}

// GET /api/rest/wallet/balance
restRouter.get("/wallet/balance", async (c) => {
  const authUser = await getAuthUser(c.req.raw);
  if (!authUser) return c.json({ error: "Unauthorized" }, 401);

  try {
    const balance = await getWalletBalance(authUser.userId);
    return c.json({ data: { balance } });
  } catch (err: any) {
    console.error("[wallet:balance] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// POST /api/rest/wallet/topup
restRouter.post("/wallet/topup", async (c) => {
  const authUser = await getAuthUser(c.req.raw);
  if (!authUser) return c.json({ error: "Unauthorized" }, 401);

  try {
    const body = await c.req.json();
    const amount = Number(body.amount);
    if (!amount || amount <= 0) return c.json({ error: "amount must be a positive number" }, 400);

    // Topup rows use a sentinel booking_id = 0; adjust if your schema requires a real FK.
    // We insert with booking_id pointing to the first booking as a workaround for NOT NULL FK.
    // Better: use a nullable booking_id. Here we use a dedicated sentinel booking row if exists.
    const txId = await nextId("wallet_payment", "transaction_id");
    const todayStr = today();
    const balanceBefore = await getWalletBalance(authUser.userId);
    const balanceAfter = balanceBefore + amount;

    // Find any booking owned by this user to satisfy the NOT NULL FK (topup has no booking)
    // If none exists we use booking_id = 101 (seed data) as a placeholder for demo.
    const bRows = await query(
      "SELECT TOP 1 booking_id FROM booking WHERE user_id = ?",
      [authUser.userId]
    );
    const sentinelBookingId = bRows.length > 0 ? (bRows[0] as any).booking_id : 101;

    await query(
      `INSERT INTO wallet_payment (transaction_id, payment_method, amount, commission, balance_after, payment_date, booking_id, user_id)
       VALUES (?, 'topup', ?, 0, ?, ?, ?, ?)`,
      [txId, amount, balanceAfter, todayStr, sentinelBookingId, authUser.userId]
    );

    return c.json({ data: { transaction_id: txId, amount, balance_after: balanceAfter } }, 201);
  } catch (err: any) {
    console.error("[wallet:topup] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// POST /api/rest/wallet/pay
restRouter.post("/wallet/pay", async (c) => {
  const authUser = await getAuthUser(c.req.raw);
  if (!authUser) return c.json({ error: "Unauthorized" }, 401);

  try {
    const body = await c.req.json();
    const { booking_id } = body;
    if (!booking_id) return c.json({ error: "booking_id is required" }, 400);

    const bRows = await query("SELECT * FROM booking WHERE booking_id = ?", [booking_id]);
    if (bRows.length === 0) return c.json({ error: "Booking not found" }, 404);
    const booking = bRows[0] as any;
    if (booking.user_id !== authUser.userId) return c.json({ error: "Forbidden" }, 403);

    const amount = Number(booking.total_amount);
    const commission = Math.round(amount * COMMISSION_RATE * 100) / 100;
    const balance = await getWalletBalance(authUser.userId);
    if (balance < amount) return c.json({ error: "Insufficient wallet balance" }, 422);

    const txId = await nextId("wallet_payment", "transaction_id");
    const todayStr = today();
    const balanceAfter = balance - amount;

    await query(
      `INSERT INTO wallet_payment (transaction_id, payment_method, amount, commission, balance_after, payment_date, booking_id, user_id)
       VALUES (?, 'wallet', ?, ?, ?, ?, ?, ?)`,
      [txId, amount, commission, balanceAfter, todayStr, booking_id, authUser.userId]
    );

    await query("UPDATE booking SET status = 'confirmed' WHERE booking_id = ?", [booking_id]);

    return c.json({
      data: {
        transaction_id: txId,
        amount,
        commission,
        balance_after: balanceAfter,
        booking_status: "confirmed",
      },
    });
  } catch (err: any) {
    console.error("[wallet:pay] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// GET /api/rest/wallet/history
restRouter.get("/wallet/history", async (c) => {
  const authUser = await getAuthUser(c.req.raw);
  if (!authUser) return c.json({ error: "Unauthorized" }, 401);

  try {
    const rows = await query(
      `SELECT * FROM wallet_payment WHERE user_id = ? ORDER BY payment_date DESC`,
      [authUser.userId]
    );
    return c.json({ data: rows });
  } catch (err: any) {
    console.error("[wallet:history] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// ── Reviews ───────────────────────────────────────────────────────────────────

// GET /api/rest/reviews?serviceId=X
restRouter.get("/reviews", async (c) => {
  try {
    const serviceId = c.req.query("serviceId");
    if (!serviceId) return c.json({ error: "serviceId query param is required" }, 400);

    const rows = await query(
      `SELECT r.*, u.first_name, u.last_name
       FROM review r JOIN users u ON r.user_id = u.user_id
       WHERE r.service_id = ? ORDER BY r.created_at DESC`,
      [parseInt(serviceId)]
    );
    return c.json({ data: rows });
  } catch (err: any) {
    console.error("[reviews:list] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// POST /api/rest/reviews
restRouter.post("/reviews", async (c) => {
  const authUser = await getAuthUser(c.req.raw);
  if (!authUser) return c.json({ error: "Unauthorized" }, 401);

  try {
    const body = await c.req.json();
    const { service_id, booking_id, rating, comment } = body;
    if (!service_id || !booking_id || !rating) {
      return c.json({ error: "service_id, booking_id and rating are required" }, 400);
    }
    const star = Math.min(5, Math.max(1, Number(rating)));

    const reviewId = await nextId("review", "review_id");
    const todayStr = today();

    await query(
      `INSERT INTO review (review_id, rate_star, comment, created_at, user_id, service_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [reviewId, star, comment ?? null, todayStr, authUser.userId, service_id]
    );

    // Update avg_rating and review_count on service
    await query(
      `UPDATE service
       SET review_count = review_count + 1,
           avg_rating   = (avg_rating * review_count + ?) / (review_count + 1)
       WHERE service_id = ?`,
      [star, service_id]
    );

    return c.json({ data: { review_id: reviewId } }, 201);
  } catch (err: any) {
    console.error("[reviews:create] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// ── Disputes ──────────────────────────────────────────────────────────────────

// POST /api/rest/disputes
restRouter.post("/disputes", async (c) => {
  const authUser = await getAuthUser(c.req.raw);
  if (!authUser) return c.json({ error: "Unauthorized" }, 401);

  try {
    const body = await c.req.json();
    const { booking_id, description } = body;
    if (!booking_id || !description) {
      return c.json({ error: "booking_id and description are required" }, 400);
    }

    const disputeId = await nextId("dispute", "dispute_id");
    const todayStr = today();

    await query(
      `INSERT INTO dispute (dispute_id, issue_description, created_at, user_id, booking_id)
       VALUES (?, ?, ?, ?, ?)`,
      [disputeId, description, todayStr, authUser.userId, booking_id]
    );

    return c.json({ data: { dispute_id: disputeId } }, 201);
  } catch (err: any) {
    console.error("[disputes:create] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// GET /api/rest/disputes
restRouter.get("/disputes", async (c) => {
  const authUser = await getAuthUser(c.req.raw);
  if (!authUser) return c.json({ error: "Unauthorized" }, 401);

  try {
    // Admins/managers see all; regular users see only their own
    let rows: any[];
    if (authUser.role === "admin" || authUser.role === "manager") {
      rows = await query("SELECT * FROM dispute ORDER BY created_at DESC", []);
    } else {
      rows = await query(
        "SELECT * FROM dispute WHERE user_id = ? ORDER BY created_at DESC",
        [authUser.userId]
      );
    }
    return c.json({ data: rows });
  } catch (err: any) {
    console.error("[disputes:list] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});

// PATCH /api/rest/disputes/:id/resolve  (admin/manager only)
restRouter.patch("/disputes/:id/resolve", async (c) => {
  const authUser = await getAuthUser(c.req.raw);
  if (!authUser) return c.json({ error: "Unauthorized" }, 401);
  if (authUser.role !== "admin" && authUser.role !== "manager") {
    return c.json({ error: "Forbidden — admin or manager only" }, 403);
  }

  try {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const { decision, resolution } = body;
    if (!decision) return c.json({ error: "decision is required" }, 400);

    const rows = await query("SELECT * FROM dispute WHERE dispute_id = ?", [id]);
    if (rows.length === 0) return c.json({ error: "Dispute not found" }, 404);

    // resolution stored in issue_description suffix for schema compatibility
    const resolvedDesc = resolution
      ? `${(rows[0] as any).issue_description} [Resolution: ${resolution}]`
      : (rows[0] as any).issue_description;

    await query(
      `UPDATE dispute SET manager_decision = ?, issue_description = ? WHERE dispute_id = ?`,
      [decision, resolvedDesc, id]
    );

    return c.json({ data: { dispute_id: id, manager_decision: decision } });
  } catch (err: any) {
    console.error("[disputes:resolve] error:", err);
    return c.json({ error: err.message ?? "Internal server error" }, 500);
  }
});
