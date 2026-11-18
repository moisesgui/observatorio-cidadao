import { and, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { responses } from "@/db/schema";

export type ResponseInput = {
  campaignId: string;
  visitorKey: string;
  locality: string;
  idade: string;
  area: string;
  servicos: string;
  gestao: string;
  melhoria: string;
  outros?: Record<string, string>;
  audios?: Record<string, string>;
};

export async function visitorAlreadyResponded(campaignId: string, visitorKey: string) {
  const db = getDb();
  const [hit] = await db
    .select({ id: responses.id })
    .from(responses)
    .where(and(eq(responses.campaignId, campaignId), eq(responses.visitorKey, visitorKey)))
    .limit(1);
  return Boolean(hit);
}

export async function insertResponse(input: ResponseInput) {
  const db = getDb();
  await db.insert(responses).values({
    campaignId: input.campaignId,
    visitorKey: input.visitorKey,
    locality: input.locality,
    idade: input.idade,
    area: input.area,
    servicos: input.servicos,
    gestao: input.gestao,
    melhoria: input.melhoria,
    outros: input.outros ?? null,
    audios: input.audios ?? null,
  });
}

export async function listResponsesForCampaign(campaignId: string) {
  const db = getDb();
  return db.select().from(responses).where(eq(responses.campaignId, campaignId));
}