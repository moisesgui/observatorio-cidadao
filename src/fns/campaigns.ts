import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  createCampaign,
  getCampaignAdmin,
  getCampaignBySlug,
  listCampaignsForAdmin,
  updateCampaign,
} from "@/lib/campaigns-data";
import { listResponsesForCampaign } from "@/lib/responses-data";
import { getAdminFromRequest } from "@/lib/auth/session";
import { withRequest } from "@/lib/middleware/request";
import { toRespostaRows } from "@/lib/survey-form";

const campaignInput = z.object({
  title: z.string().min(2).max(120),
  subtitle: z.string().max(200).optional(),
  localityLabel: z.string().min(2).max(40).default("localidade"),
  mapCenterLat: z.number().nullable().optional(),
  mapCenterLng: z.number().nullable().optional(),
  localityNames: z.array(z.string().min(1)).min(1),
  localityCoords: z
    .record(z.string(), z.object({ lat: z.number(), lng: z.number() }))
    .optional(),
});

async function requireAdmin(request: Request) {
  const user = await getAdminFromRequest(request);
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export const fetchCampaignPublicFn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => (await getCampaignBySlug(data.slug)) ?? null);

export const fetchCampaignResponsesFn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const campaign = await getCampaignBySlug(data.slug);
    if (!campaign) return { campaign: null, responses: [] as ReturnType<typeof toRespostaRows> };
    const rows = await listResponsesForCampaign(campaign.id);
    return { campaign, responses: toRespostaRows(rows) };
  });

export const listCampaignsAdminFn = createServerFn({ method: "GET" })
  .middleware([withRequest])
  .handler(async ({ context }) => {
    await requireAdmin(context.request);
    return listCampaignsForAdmin();
  });

export const getCampaignAdminFn = createServerFn({ method: "GET" })
  .middleware([withRequest])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.request);
    return getCampaignAdmin(data.id);
  });

export const createCampaignFn = createServerFn({ method: "POST" })
  .middleware([withRequest])
  .validator(campaignInput)
  .handler(async ({ data, context }) => {
    const user = await requireAdmin(context.request);
    return createCampaign(data, user.id);
  });

export const updateCampaignFn = createServerFn({ method: "POST" })
  .middleware([withRequest])
  .validator(campaignInput.extend({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.request);
    const { id, ...rest } = data;
    return updateCampaign(id, rest);
  });