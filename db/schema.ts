import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const contentRecords = sqliteTable(
  "content_records",
  {
    id: text("id").primaryKey(),
    kind: text("kind").notNull(),
    draft: text("draft").notNull(),
    published: text("published"),
    archived: integer("archived").notNull().default(0),
    version: integer("version").notNull().default(1),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_content_kind_archived").on(table.kind, table.archived),
  ],
);
export const siteSettings = sqliteTable("site_settings", {
  id: text("id").primaryKey(),
  draft: text("draft").notNull(),
  published: text("published").notNull(),
  version: integer("version").notNull().default(1),
  updatedAt: text("updated_at").notNull(),
});
export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  alt: text("alt").notNull().default(""),
  createdAt: text("created_at").notNull(),
});
export const audit = sqliteTable("audit", {
  id: text("id").primaryKey(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  target: text("target").notNull(),
  createdAt: text("created_at").notNull(),
});
