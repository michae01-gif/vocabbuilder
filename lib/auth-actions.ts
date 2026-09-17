"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "./db";
import {
  SESSION_COOKIE,
  createSessionDb,
  deleteSessionDb,
  hashPassword,
  sessionCookieOptions,
  validatePassword,
  validateUsername,
  verifyPassword,
} from "./auth";

export async function signUpAction(username: string, password: string) {
  const uname = username.trim();
  const uErr = validateUsername(uname);
  if (uErr) return { ok: false as const, error: uErr };
  const pErr = validatePassword(password);
  if (pErr) return { ok: false as const, error: pErr };

  const db = getDb();
  const taken = db.prepare("SELECT id FROM users WHERE username = ? COLLATE NOCASE").get(uname);
  if (taken) return { ok: false as const, error: "That username is already taken." };

  const info = db
    .prepare("INSERT INTO users (name, username, password_hash, coins, tutorial_step) VALUES (?, ?, ?, 100, 1)")
    .run(uname, uname, hashPassword(password));
  const userId = Number(info.lastInsertRowid);

  const token = createSessionDb(userId);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, await sessionCookieOptions());
  revalidatePath("/");
  redirect("/");
}

export async function signInAction(username: string, password: string) {
  const uname = username.trim();
  const db = getDb();
  const user = db
    .prepare("SELECT id, password_hash FROM users WHERE username = ? COLLATE NOCASE")
    .get(uname) as { id: number; password_hash: string | null } | undefined;

  if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
    return { ok: false as const, error: "Invalid username or password." };
  }

  const token = createSessionDb(user.id);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, await sessionCookieOptions());
  revalidatePath("/");
  redirect("/");
}

export async function signOutAction() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) deleteSessionDb(token);
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
