import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { frameworksTable } from "./frameworks";

export const templatesTable = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  frameworkId: integer("framework_id").notNull().references(() => frameworksTable.id, { onDelete: "cascade" }),
  repoUrl: text("repo_url"),
  language: text("language").notNull().default("Python"),
  difficulty: text("difficulty").notNull().default("beginner"),
  useCount: integer("use_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTemplateSchema = createInsertSchema(templatesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templatesTable.$inferSelect;
