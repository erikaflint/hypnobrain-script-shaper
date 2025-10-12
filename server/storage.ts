import { eq, and, gte, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  dimensions,
  archetypes,
  styles,
  pricing,
  generations,
  freeScriptUsage,
  type Dimension,
  type Archetype,
  type Style,
  type Pricing,
  type Generation,
  type FreeScriptUsage,
  type InsertGeneration,
  type InsertFreeScriptUsage,
} from "@shared/schema";

export interface IStorage {
  // Dimensions
  getAllDimensions(): Promise<Dimension[]>;
  
  // Archetypes
  getAllArchetypes(): Promise<Archetype[]>;
  getArchetypeById(id: number): Promise<Archetype | undefined>;
  
  // Styles
  getAllStyles(): Promise<Style[]>;
  getStyleById(id: number): Promise<Style | undefined>;
  
  // Pricing
  getPricingByTierName(tierName: string): Promise<Pricing | undefined>;
  
  // Generations
  createGeneration(generation: InsertGeneration): Promise<Generation>;
  getGenerationById(id: number): Promise<Generation | undefined>;
  getAllGenerations(): Promise<Generation[]>;
  getGenerationsByEmail(email: string): Promise<Generation[]>;
  updateGenerationPaymentStatus(id: number, paymentStatus: string): Promise<void>;
  updateGenerationScript(id: number, fullScript: string): Promise<void>;
  
  // Free script usage tracking
  checkFreeEligibility(email: string): Promise<boolean>;
  recordFreeUsage(usage: InsertFreeScriptUsage): Promise<FreeScriptUsage>;
  getLastFreeUsage(email: string): Promise<FreeScriptUsage | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Dimensions
  async getAllDimensions(): Promise<Dimension[]> {
    return await db.select().from(dimensions);
  }
  
  // Archetypes
  async getAllArchetypes(): Promise<Archetype[]> {
    return await db.select().from(archetypes);
  }
  
  async getArchetypeById(id: number): Promise<Archetype | undefined> {
    const result = await db.select().from(archetypes).where(eq(archetypes.id, id));
    return result[0];
  }
  
  // Styles
  async getAllStyles(): Promise<Style[]> {
    return await db.select().from(styles);
  }
  
  async getStyleById(id: number): Promise<Style | undefined> {
    const result = await db.select().from(styles).where(eq(styles.id, id));
    return result[0];
  }
  
  // Pricing
  async getPricingByTierName(tierName: string): Promise<Pricing | undefined> {
    const result = await db.select().from(pricing).where(eq(pricing.tierName, tierName));
    return result[0];
  }
  
  // Generations
  async createGeneration(generation: InsertGeneration): Promise<Generation> {
    const result = await db.insert(generations).values(generation).returning();
    return result[0];
  }
  
  async getGenerationById(id: number): Promise<Generation | undefined> {
    const result = await db.select().from(generations).where(eq(generations.id, id));
    return result[0];
  }
  
  async getAllGenerations(): Promise<Generation[]> {
    return await db.select().from(generations).orderBy(desc(generations.createdAt));
  }
  
  async getGenerationsByEmail(email: string): Promise<Generation[]> {
    return await db
      .select()
      .from(generations)
      .where(eq(generations.email, email))
      .orderBy(desc(generations.createdAt));
  }
  
  async updateGenerationPaymentStatus(id: number, paymentStatus: string): Promise<void> {
    await db.update(generations).set({ paymentStatus }).where(eq(generations.id, id));
  }
  
  async updateGenerationScript(id: number, fullScript: string): Promise<void> {
    await db.update(generations).set({ fullScript }).where(eq(generations.id, id));
  }
  
  // Free script usage tracking
  async checkFreeEligibility(email: string): Promise<boolean> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const result = await db
      .select()
      .from(freeScriptUsage)
      .where(
        and(
          eq(freeScriptUsage.email, email),
          gte(freeScriptUsage.lastFreeScriptAt, sevenDaysAgo)
        )
      )
      .orderBy(desc(freeScriptUsage.lastFreeScriptAt))
      .limit(1);
    
    // Eligible if no usage in last 7 days
    return result.length === 0;
  }
  
  async recordFreeUsage(usage: InsertFreeScriptUsage): Promise<FreeScriptUsage> {
    // Upsert: update if exists, insert if not
    const result = await db
      .insert(freeScriptUsage)
      .values(usage)
      .onConflictDoUpdate({
        target: freeScriptUsage.email,
        set: {
          lastFreeScriptAt: usage.lastFreeScriptAt,
          freeScriptsCount: sql`${freeScriptUsage.freeScriptsCount} + 1`,
        },
      })
      .returning();
    return result[0];
  }
  
  async getLastFreeUsage(email: string): Promise<FreeScriptUsage | undefined> {
    const result = await db
      .select()
      .from(freeScriptUsage)
      .where(eq(freeScriptUsage.email, email))
      .orderBy(desc(freeScriptUsage.lastFreeScriptAt))
      .limit(1);
    
    return result[0];
  }
}

export const storage = new DatabaseStorage();
