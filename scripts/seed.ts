import "dotenv/config";
import { eq } from "drizzle-orm";

import { getDb } from "../src/db/index";
import { adminUsers, campaigns } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth/password";
import { createCampaign } from "../src/lib/campaigns-data";

const COORDS: Record<string, { lat: number; lng: number }> = {
  Pereiros: { lat: -4.6924, lng: -40.4796 },
  Peixe: { lat: -4.698, lng: -40.5038 },
  "Mata Fresca": { lat: -4.7215, lng: -40.4828 },
  Pitombeiras: { lat: -4.707, lng: -40.4957 },
  Retiro: { lat: -4.6672, lng: -40.5139 },
  "Espacinha de Baixo": { lat: -4.6813, lng: -40.4865 },
  Patos: { lat: -4.6696, lng: -40.4475 },
  Canafístula: { lat: -4.6778, lng: -40.4527 },
  Extremas: { lat: -4.6625, lng: -40.4405 },
};

async function main() {
  const db = getDb();
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL ?? "admin@observatorio.local";
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? "troque-esta-senha";
  const [existingAdmin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (!existingAdmin) {
    await db.insert(adminUsers).values({
      email,
      passwordHash: await hashPassword(password),
      name: "Administrador",
    });
    console.log(`Admin criado: ${email}`);
  }

  const [existingCampaign] = await db.select().from(campaigns).where(eq(campaigns.slug, "espacinha")).limit(1);
  if (!existingCampaign) {
    await createCampaign(
      {
        title: "Espacinha",
        subtitle: "Nova Russas — CE",
        localityLabel: "localidade",
        mapCenterLat: -4.685,
        mapCenterLng: -40.48,
        localityNames: [
          "Pereiros",
          "Peixe",
          "Mata Fresca",
          "Pitombeiras",
          "Retiro",
          "Espacinha de Baixo",
          "Patos",
          "Canafístula",
          "Extremas",
        ],
        localityCoords: COORDS,
      },
      null,
    );
    console.log("Campanha exemplo Espacinha criada.");
  }

  console.log("Seed concluído.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});