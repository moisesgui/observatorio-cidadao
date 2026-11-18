import {
  boolean,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  integer,
} from "drizzle-orm/pg-core";

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    localityLabel: text("locality_label").default("localidade").notNull(),
    active: boolean("active").default(true).notNull(),
    mapCenterLat: real("map_center_lat"),
    mapCenterLng: real("map_center_lng"),
    createdBy: uuid("created_by").references(() => adminUsers.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("campaigns_slug_idx").on(t.slug)],
);

export const localities = pgTable("localities", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const responses = pgTable(
  "responses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    visitorKey: text("visitor_key").notNull(),
    locality: text("locality").notNull(),
    idade: text("idade").notNull(),
    area: text("area").notNull(),
    servicos: text("servicos").notNull(),
    gestao: text("gestao").notNull(),
    melhoria: text("melhoria").notNull(),
    outros: jsonb("outros").$type<Record<string, string>>(),
    audios: jsonb("audios").$type<Record<string, string>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("responses_campaign_visitor_idx").on(t.campaignId, t.visitorKey)],
);

export type Campaign = typeof campaigns.$inferSelect;
export type Locality = typeof localities.$inferSelect;
export type ResponseRow = typeof responses.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;