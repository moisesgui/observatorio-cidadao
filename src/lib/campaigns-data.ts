import { asc, desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { campaigns, localities } from "@/db/schema";
import { slugify } from "@/lib/slug";

import type { CampaignPublic } from "@/types/campaign";

export type { CampaignPublic };

export async function getCampaignBySlug(slug: string): Promise<CampaignPublic | null> {
  const db = getDb();
  const [row] = await db.select().from(campaigns).where(eq(campaigns.slug, slug)).limit(1);
  if (!row || !row.active) return null;
  const locs = await db
    .select()
    .from(localities)
    .where(eq(localities.campaignId, row.id))
    .orderBy(asc(localities.sortOrder), asc(localities.name));
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    localityLabel: row.localityLabel,
    active: row.active,
    mapCenterLat: row.mapCenterLat,
    mapCenterLng: row.mapCenterLng,
    localities: locs.map((l) => ({ name: l.name, lat: l.lat, lng: l.lng })),
  };
}

export async function listCampaignsForAdmin() {
  const db = getDb();
  return db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
}

export async function getCampaignAdmin(id: string) {
  const db = getDb();
  const [row] = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  if (!row) return null;
  const locs = await db
    .select()
    .from(localities)
    .where(eq(localities.campaignId, id))
    .orderBy(asc(localities.sortOrder), asc(localities.name));
  return { ...row, localities: locs };
}

export async function ensureUniqueSlug(base: string, excludeId?: string) {
  const db = getDb();
  let slug = slugify(base) || "campanha";
  let n = 0;
  for (;;) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const [hit] = await db.select({ id: campaigns.id }).from(campaigns).where(eq(campaigns.slug, candidate)).limit(1);
    if (!hit || (excludeId && hit.id === excludeId)) return candidate;
    n += 1;
  }
}

export type CampaignInput = {
  title: string;
  subtitle?: string;
  localityLabel: string;
  mapCenterLat?: number | null;
  mapCenterLng?: number | null;
  localityNames: string[];
  localityCoords?: Record<string, { lat: number; lng: number }>;
};

export async function createCampaign(input: CampaignInput, createdBy: string | null) {
  const db = getDb();
  const slug = await ensureUniqueSlug(input.title);
  const [row] = await db
    .insert(campaigns)
    .values({
      slug,
      title: input.title,
      subtitle: input.subtitle ?? null,
      localityLabel: input.localityLabel,
      mapCenterLat: input.mapCenterLat ?? null,
      mapCenterLng: input.mapCenterLng ?? null,
      createdBy,
    })
    .returning();
  if (!row) throw new Error("Falha ao criar campanha");
  await insertLocalities(row.id, input);
  return row;
}

export async function updateCampaign(id: string, input: CampaignInput) {
  const db = getDb();
  const slug = await ensureUniqueSlug(input.title, id);
  const [row] = await db
    .update(campaigns)
    .set({
      title: input.title,
      subtitle: input.subtitle ?? null,
      localityLabel: input.localityLabel,
      mapCenterLat: input.mapCenterLat ?? null,
      mapCenterLng: input.mapCenterLng ?? null,
      slug,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, id))
    .returning();
  if (!row) throw new Error("Campanha não encontrada");
  await db.delete(localities).where(eq(localities.campaignId, id));
  await insertLocalities(id, input);
  return row;
}

async function insertLocalities(campaignId: string, input: CampaignInput) {
  const db = getDb();
  const names = [...input.localityNames.filter(Boolean), "Outro"];
  const unique = [...new Set(names)];
  await db.insert(localities).values(
    unique.map((name, i) => ({
      campaignId,
      name,
      sortOrder: i,
      lat: input.localityCoords?.[name]?.lat ?? null,
      lng: input.localityCoords?.[name]?.lng ?? null,
    })),
  );
}