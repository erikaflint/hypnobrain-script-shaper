import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, serial, index, uniqueIndex } from "drizzle-orm/pg-core";
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
  templateUsed: varchar("template_used", { length: 255 }).references(() => templates.templateId, { onDelete: 'set null' }), // V2: Track which template was used
  
  // Version control fields
  isFavorite: boolean("is_favorite").default(false).notNull(),
  parentGenerationId: integer("parent_generation_id").references(() => generations.id, { onDelete: 'set null' }),
  versionLabel: varchar("version_label", { length: 100 }),
  
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

// V2: Templates table (JSON-based template system)
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  templateId: varchar("template_id", { length: 255 }).notNull().unique(),
  jsonData: jsonb("json_data").notNull(),
  
  // Denormalized for fast queries
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  tags: text("tags").array(),
  
  createdBy: varchar("created_by", { length: 100 }).default("system").notNull(),
  userId: varchar("user_id", { length: 255 }), // For user-created templates
  isPublic: boolean("is_public").default(false).notNull(),
  isSystem: boolean("is_system").default(false).notNull(),
  
  usageCount: integer("usage_count").default(0).notNull(),
  ratingAvg: integer("rating_avg"), // Store as integer (e.g., 450 = 4.50)
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Indexes for fast querying
  isPublicIdx: index("templates_is_public_idx").on(table.isPublic),
  categoryIdx: index("templates_category_idx").on(table.category),
  templateIdIdx: index("templates_template_id_idx").on(table.templateId),
  tagsIdx: index("templates_tags_idx").using('gin', table.tags),
}));

// V2: User template libraries (saved templates)
export const userTemplateLibraries = pgTable("user_template_libraries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  templateId: varchar("template_id", { length: 255 }).notNull().references(() => templates.templateId, { onDelete: 'cascade' }),
  addedAt: timestamp("added_at").defaultNow().notNull(),
}, (table) => ({
  // Unique constraint to prevent duplicate saves + serves as lookup index
  userTemplateUniq: uniqueIndex("user_template_unique_idx").on(table.userId, table.templateId),
}));

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

// V2: Template schemas and types
export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserTemplateLibrarySchema = createInsertSchema(userTemplateLibraries).omit({
  id: true,
  addedAt: true,
});

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type UserTemplateLibrary = typeof userTemplateLibraries.$inferSelect;
export type InsertUserTemplateLibrary = z.infer<typeof insertUserTemplateLibrarySchema>;

// V2: Template JSON structure interfaces
export interface TemplateJSON {
  id: string;
  version: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  use_cases: string[];
  presenting_issues: string[];
  dimensions: DimensionConfig;
  generation_rules: GenerationRules;
  prompting_hints: PromptingHints;
  metadata: TemplateMetadata;
}

export interface DimensionConfig {
  somatic: SomaticDimension;
  language: LanguageDimension;
  symbolic: SymbolicDimension;
  psychological: PsychologicalDimension;
  temporal: TemporalDimension;
  perspective: PerspectiveDimension;
  relational: RelationalDimension;
  spiritual: SpiritualDimension;
}

export interface SomaticDimension {
  level: number;
  emphasis?: string;
  techniques?: string[];
}

export interface LanguageDimension {
  level: number;
  style?: string;
  pacing?: string;
}

export interface SymbolicDimension {
  level: number;
  archetype?: string | null;
  metaphor?: string | null;
}

export interface PsychologicalDimension {
  level: number;
  approaches?: string[];
  depth?: string;
}

export interface TemporalDimension {
  level: number;
  work_types?: string[];
  focus?: string;
}

export interface PerspectiveDimension {
  level: number;
  primary_pov?: string;
  techniques?: string[];
}

export interface RelationalDimension {
  level: number;
  approaches?: string[];
}

export interface SpiritualDimension {
  enabled: boolean;
  level: number;
  framework?: string;
}

export interface GenerationRules {
  opening_style?: string;
  closing_style?: string;
  voice_tone?: string;
  pacing?: string;
}

export interface PromptingHints {
  priority?: string[];
  avoid?: string[];
}

export interface TemplateMetadata {
  created_by: string;
  usage_count: number;
  is_public: boolean;
}

// Zod schema for template JSON validation
export const templateJSONSchema = z.object({
  id: z.string(),
  version: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  use_cases: z.array(z.string()),
  presenting_issues: z.array(z.string()),
  dimensions: z.object({
    somatic: z.object({
      level: z.number().min(0).max(100),
      emphasis: z.string().optional(),
      techniques: z.array(z.string()).optional(),
    }),
    language: z.object({
      level: z.number().min(0).max(100),
      style: z.string().optional(),
      pacing: z.string().optional(),
    }),
    symbolic: z.object({
      level: z.number().min(0).max(100),
      archetype: z.string().nullable().optional(),
      metaphor: z.string().nullable().optional(),
    }),
    psychological: z.object({
      level: z.number().min(0).max(100),
      approaches: z.array(z.string()).optional(),
      depth: z.string().optional(),
    }),
    temporal: z.object({
      level: z.number().min(0).max(100),
      work_types: z.array(z.string()).optional(),
      focus: z.string().optional(),
    }),
    perspective: z.object({
      level: z.number().min(0).max(100),
      primary_pov: z.string().optional(),
      techniques: z.array(z.string()).optional(),
    }),
    relational: z.object({
      level: z.number().min(0).max(100),
      approaches: z.array(z.string()).optional(),
    }),
    spiritual: z.object({
      enabled: z.boolean(),
      level: z.number().min(0).max(100),
      framework: z.string().optional(),
    }),
  }),
  generation_rules: z.object({
    opening_style: z.string().optional(),
    closing_style: z.string().optional(),
    voice_tone: z.string().optional(),
    pacing: z.string().optional(),
  }),
  prompting_hints: z.object({
    priority: z.array(z.string()).optional(),
    avoid: z.array(z.string()).optional(),
  }),
  metadata: z.object({
    created_by: z.string(),
    usage_count: z.number(),
    is_public: z.boolean(),
  }),
});
