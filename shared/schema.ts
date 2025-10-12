import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Dimension configuration table
export const dimensions = pgTable("dimensions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  defaultValue: integer("default_value").default(50).notNull(),
  minValue: integer("min_value").default(0).notNull(),
  maxValue: integer("max_value").default(100).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Archetype templates
export const archetypes = pgTable("archetypes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  promptModifier: text("prompt_modifier"),
  enabled: boolean("enabled").default(true).notNull(),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Style options
export const styles = pgTable("styles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  enabled: boolean("enabled").default(true).notNull(),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Pricing configuration
export const pricing = pgTable("pricing", {
  id: serial("id").primaryKey(),
  tierName: varchar("tier_name", { length: 100 }).notNull(),
  description: text("description"),
  priceCents: integer("price_cents").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Generation history (for analytics)
export const generations = pgTable("generations", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }),
  email: varchar("email", { length: 255 }),
  generationMode: varchar("generation_mode", { length: 20 }).notNull(), // 'create_new', 'remix', or 'free_weekly'
  isFree: boolean("is_free").default(false).notNull(),
  originalScript: text("original_script"),
  originalDimensionsJson: jsonb("original_dimensions_json"),
  presentingIssue: varchar("presenting_issue", { length: 255 }),
  desiredOutcome: text("desired_outcome"),
  benefits: text("benefits"),
  customNotes: text("custom_notes"),
  dimensionsJson: jsonb("dimensions_json"),
  archetypeId: integer("archetype_id").references(() => archetypes.id),
  stylesJson: jsonb("styles_json"),
  previewText: text("preview_text"),
  fullScript: text("full_script"),
  assetsJson: jsonb("assets_json"),
  pricePaidCents: integer("price_paid_cents").default(0).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending_payment"), // 'pending_payment', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Free script tracking (rate limiting)
export const freeScriptUsage = pgTable("free_script_usage", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  lastFreeScriptAt: timestamp("last_free_script_at").notNull(),
  freeScriptsCount: integer("free_scripts_count").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admin users (simple)
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations - only define where actual FK relationships exist
export const generationsRelations = relations(generations, ({ one }) => ({
  archetype: one(archetypes, {
    fields: [generations.archetypeId],
    references: [archetypes.id],
  }),
}));

export const archetypesRelations = relations(archetypes, ({ many }) => ({
  generations: many(generations),
}));

// Insert schemas
export const insertDimensionSchema = createInsertSchema(dimensions).omit({
  id: true,
  createdAt: true,
});

export const insertArchetypeSchema = createInsertSchema(archetypes).omit({
  id: true,
  createdAt: true,
});

export const insertStyleSchema = createInsertSchema(styles).omit({
  id: true,
  createdAt: true,
});

export const insertPricingSchema = createInsertSchema(pricing).omit({
  id: true,
  createdAt: true,
});

export const insertGenerationSchema = createInsertSchema(generations).omit({
  id: true,
  createdAt: true,
});

export const insertFreeScriptUsageSchema = createInsertSchema(freeScriptUsage).omit({
  id: true,
  createdAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});

// Select types
export type Dimension = typeof dimensions.$inferSelect;
export type InsertDimension = z.infer<typeof insertDimensionSchema>;

export type Archetype = typeof archetypes.$inferSelect;
export type InsertArchetype = z.infer<typeof insertArchetypeSchema>;

export type Style = typeof styles.$inferSelect;
export type InsertStyle = z.infer<typeof insertStyleSchema>;

export type Pricing = typeof pricing.$inferSelect;
export type InsertPricing = z.infer<typeof insertPricingSchema>;

export type Generation = typeof generations.$inferSelect;
export type InsertGeneration = z.infer<typeof insertGenerationSchema>;

export type FreeScriptUsage = typeof freeScriptUsage.$inferSelect;
export type InsertFreeScriptUsage = z.infer<typeof insertFreeScriptUsageSchema>;

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

// Keep users table for compatibility (not used in this app)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
