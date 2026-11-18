import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

let client: ReturnType<typeof postgres> | undefined;

function getClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL não definida. Configure o Postgres no Railway (.env).");
  }
  if (!client) {
    client = postgres(url, { prepare: false, max: 10 });
  }
  return client;
}

export function getDb() {
  return drizzle(getClient(), { schema });
}

export { schema };