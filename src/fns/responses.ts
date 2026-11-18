import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getCampaignBySlug } from "@/lib/campaigns-data";
import { insertResponse, visitorAlreadyResponded } from "@/lib/responses-data";
import { getVisitorKey, newVisitorKey, visitorCookieOptions } from "@/lib/auth/session";
import { withRequest } from "@/lib/middleware/request";

const responseSchema = z.object({
  slug: z.string().min(1),
  locality: z.string().min(1),
  idade: z.string().min(1),
  area: z.string().min(1),
  servicos: z.string().min(1),
  gestao: z.string().min(1),
  melhoria: z.string().min(1),
  outros: z.record(z.string(), z.string()).optional(),
  audios: z.record(z.string(), z.string()).optional(),
});

export const checkVisitorFn = createServerFn({ method: "GET" })
  .middleware([withRequest])
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const campaign = await getCampaignBySlug(data.slug);
    if (!campaign) return { allowed: false, reason: "not_found" as const };
    const visitor = getVisitorKey(context.request);
    if (!visitor) return { allowed: true, already: false as const };
    const already = await visitorAlreadyResponded(campaign.id, visitor);
    return { allowed: true, already };
  });

export const submitResponseFn = createServerFn({ method: "POST" })
  .middleware([withRequest])
  .validator(responseSchema)
  .handler(async ({ data, context }) => {
    const campaign = await getCampaignBySlug(data.slug);
    if (!campaign) {
      return new Response(JSON.stringify({ ok: false, error: "Campanha não encontrada." }), { status: 404 });
    }
    let visitor = getVisitorKey(context.request);
    let setVisitor: string | undefined;
    if (!visitor) {
      visitor = newVisitorKey();
      setVisitor = visitorCookieOptions(visitor);
    }
    if (await visitorAlreadyResponded(campaign.id, visitor)) {
      return new Response(JSON.stringify({ ok: false, error: "already_answered" }), { status: 409 });
    }
    await insertResponse({
      campaignId: campaign.id,
      visitorKey: visitor,
      locality: data.locality,
      idade: data.idade,
      area: data.area,
      servicos: data.servicos,
      gestao: data.gestao,
      melhoria: data.melhoria,
      outros: data.outros,
      audios: data.audios,
    });
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (setVisitor) headers["Set-Cookie"] = setVisitor;
    return new Response(JSON.stringify({ ok: true, slug: campaign.slug }), { headers });
  });