import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db";
import { adminUsers } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  clearSessionCookie,
  createAdminSession,
  destroyAdminSession,
  getAdminFromRequest,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { withRequest } from "@/lib/middleware/request";

export const loginAdminFn = createServerFn({ method: "POST" })
  .middleware([withRequest])
  .validator(z.object({ email: z.string().email(), password: z.string().min(8) }))
  .handler(async ({ data, context }) => {
    const db = getDb();
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, data.email.toLowerCase())).limit(1);
    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      return new Response(JSON.stringify({ ok: false, error: "E-mail ou senha inválidos." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const session = await createAdminSession(user.id);
    return new Response(JSON.stringify({ ok: true, user: { id: user.id, email: user.email, name: user.name } }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": sessionCookieOptions(session.token, session.maxAge),
      },
    });
  });

export const logoutAdminFn = createServerFn({ method: "POST" })
  .middleware([withRequest])
  .handler(async ({ context }) => {
    await destroyAdminSession(context.request);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json", "Set-Cookie": clearSessionCookie() },
    });
  });

export const getAdminSessionFn = createServerFn({ method: "GET" })
  .middleware([withRequest])
  .handler(async ({ context }) => {
    const user = await getAdminFromRequest(context.request);
    if (!user) return { user: null as null };
    return { user: { id: user.id, email: user.email, name: user.name } };
  });

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  name: z.string().min(2).optional(),
});

export const registerAdminFn = createServerFn({ method: "POST" })
  .middleware([withRequest])
  .validator(registerSchema)
  .handler(async ({ data, context }) => {
    const actor = await getAdminFromRequest(context.request);
    const db = getDb();
    const count = await db.select({ id: adminUsers.id }).from(adminUsers);
    const isBootstrap =
      count.length === 0 || (process.env.BOOTSTRAP_ADMIN_EMAIL && data.email === process.env.BOOTSTRAP_ADMIN_EMAIL);
    if (!actor && !isBootstrap) {
      return new Response(JSON.stringify({ ok: false, error: "Apenas administradores podem convidar novos usuários." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    const email = data.email.toLowerCase();
    const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    if (existing) {
      return new Response(JSON.stringify({ ok: false, error: "E-mail já cadastrado." }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }
    const passwordHash = await hashPassword(data.password);
    const [user] = await db.insert(adminUsers).values({ email, passwordHash, name: data.name ?? null }).returning();
    return { ok: true, user: { id: user!.id, email: user!.email, name: user!.name } };
  });