import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const frameworksTable = pgTable("frameworks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  githubUrl: text("github_url"),
  pypiUrl: text("pypi_url"),
  officialUrl: text("official_url"),
  stars: integer("stars").notNull().default(0),
  weeklyDownloads: integer("weekly_downloads").notNull().default(0),
  version: text("version").notNull(),
  license: text("license").notNull(),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertFrameworkSchema = createInsertSchema(frameworksTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertFramework = z.infer<typeof insertFrameworkSchema>;
export type Framework = typeof frameworksTable.$inferSelect;
