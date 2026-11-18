import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { adminSessions, adminUsers, type AdminUser } from "@/db/schema";
import { parseCookieHeader, SESSION_COOKIE } from "@/lib/cookies";

const SESSION_DAYS = 30;

export function newSessionId() {
  return randomBytes(32).toString("hex");
}

export function sessionCookieOptions(token: string, maxAgeSec: number) {
  const secure = process.env.NODE_ENV === "production";
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSec}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export async function createAdminSession(userId: string) {
  const db = getDb();
  const id = newSessionId();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(adminSessions).values({ id, userId, expiresAt });
  return { token: id, maxAge: SESSION_DAYS * 24 * 60 * 60 };
}

export async function getAdminFromRequest(request: Request): Promise<AdminUser | null> {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  const db = getDb();
  const now = new Date();
  const row = await db
    .select({ user: adminUsers })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id))
    .where(eq(adminSessions.id, token))
    .limit(1);
  const hit = row[0];
  if (!hit) return null;
  const [session] = await db
    .select()
    .from(adminSessions)
    .where(eq(adminSessions.id, token))
    .limit(1);
  if (!session || session.expiresAt <= now) return null;
  return hit.user;
}

export async function destroyAdminSession(request: Request) {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const token = cookies[SESSION_COOKIE];
  if (!token) return;
  const db = getDb();
  await db.delete(adminSessions).where(eq(adminSessions.id, token));
}

export function newVisitorKey() {
  return randomBytes(16).toString("hex");
}

export function visitorCookieOptions(key: string) {
  const maxAge = 365 * 24 * 60 * 60;
  const secure = process.env.NODE_ENV === "production";
  const parts = [
    `oc_visitor=${encodeURIComponent(key)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function getVisitorKey(request: Request) {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  return cookies["oc_visitor"] || null;
}