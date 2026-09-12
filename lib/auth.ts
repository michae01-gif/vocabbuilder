import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getDb } from "./db";
import type { User } from "./data";

export const SESSION_COOKIE = "wf_session";
export const SESSION_DAYS = 30;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function createSessionDb(userId: number): string {
  const token = randomBytes(32).toString("hex");
  getDb()
    .prepare(
      `INSERT INTO auth_sessions (token, user_id, expires_at)
       VALUES (?, ?, datetime('now', '+${SESSION_DAYS} days'))`
    )
    .run(token, userId);
  return token;
}

export function deleteSessionDb(token: string) {
  getDb().prepare("DELETE FROM auth_sessions WHERE token = ?").run(token);
}

export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = getDb();
  const row = db
    .prepare(
      `SELECT u.* FROM auth_sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > datetime('now')`
    )
    .get(token) as User | undefined;
  return row ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function sessionCookieOptions() {
  const h = await headers();
  const isHttps = h.get("x-forwarded-proto") === "https";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isHttps,
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  };
}

export { validateUsername, validatePassword } from "./validate";
