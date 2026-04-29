import { query } from "../lib/db";

export async function findUserById(userId: number) {
  const rows = await query("SELECT * FROM users WHERE user_id = ?", [userId]);
  return rows[0] ?? null;
}

export async function findUserByEmail(email: string) {
  const rows = await query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] ?? null;
}

export async function createUser(data: {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}) {
  await query(
    `INSERT INTO users (user_id, first_name, last_name, email, phone, password, role)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.userId, data.firstName, data.lastName, data.email, data.phone, data.password, data.role]
  );
  return findUserByEmail(data.email);
}

export async function getNextUserId(): Promise<number> {
  const rows = await query("SELECT MAX(user_id) AS maxId FROM users", []);
  const max = (rows[0] as any)?.maxId ?? 0;
  return (max as number) + 1;
}
