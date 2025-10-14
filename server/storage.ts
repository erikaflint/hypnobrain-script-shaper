import { eq, and, gte, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  dimensions,
  archetypes,
  styles,
  pricing,
  generations,
  freeScriptUsage,
  users,
  templates,
  scriptPackages,
  packageScripts,
  type Dimension,
  type Archetype,
  type Style,
  type Pricing,
  type Generation,
  type FreeScriptUsage,
  type InsertGeneration,
  type InsertFreeScriptUsage,
  type User,
  type UpsertUser,
  type ScriptPackage,
  type InsertScriptPackage,
  type PackageScript,
  type InsertPackageScript,
} from "@shared/schema";

export interface IStorage {
  // User operations (for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Dimensions
  getAllDimensions(): Promise<Dimension[]>;
  
  // Archetypes
  getAllArchetypes(): Promise<Archetype[]>;
  getBlendedArchetypes(): Promise<Archetype[]>;
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
  getGenerationsByUserId(userId: string): Promise<Generation[]>;
  getDreamThumbnailsByUserId(userId: string): Promise<string[]>;
  getAllDreamThumbnails(): Promise<string[]>;
  getGenerationsByParentId(parentId: number): Promise<Generation[]>;
  updateGenerationPaymentStatus(id: number, paymentStatus: string): Promise<void>;
  updateGenerationScript(id: number, fullScript: string): Promise<void>;
  updateGenerationFavorite(id: number, isFavorite: boolean): Promise<Generation>;
  
  // Free script usage tracking
  checkFreeEligibility(email: string): Promise<boolean>;
  recordFreeUsage(usage: InsertFreeScriptUsage): Promise<FreeScriptUsage>;
  getLastFreeUsage(email: string): Promise<FreeScriptUsage | undefined>;
  
  // User templates (custom mixes)
  getUserTemplates(userId: string): Promise<any[]>;
  
  // Script Packages
  createPackage(pkg: InsertScriptPackage): Promise<ScriptPackage>;
  getPackagesByUserId(userId: string): Promise<ScriptPackage[]>;
  getPackageById(id: number): Promise<ScriptPackage | undefined>;
  updatePackageStatus(id: number, status: string): Promise<void>;
  
  // Package Scripts
  createPackageScript(script: InsertPackageScript): Promise<PackageScript>;
  getPackageScripts(packageId: number): Promise<PackageScript[]>;
  updatePackageScript(id: number, updates: Partial<InsertPackageScript>): Promise<PackageScript>;
  deletePackageScript(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Dimensions
  async getAllDimensions(): Promise<Dimension[]> {
    return await db.select().from(dimensions);
  }
  
  // Archetypes
  async getAllArchetypes(): Promise<Archetype[]> {
    return await db.select().from(archetypes);
  }
  
  async getBlendedArchetypes(): Promise<Archetype[]> {
    return await db.select().from(archetypes).where(gte(archetypes.sortOrder, 10));
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
  
  async getGenerationsByUserId(userId: string): Promise<Generation[]> {
    return await db
      .select()
      .from(generations)
      .where(eq(generations.userId, userId))
      .orderBy(desc(generations.createdAt));
  }
  
  async getDreamThumbnailsByUserId(userId: string): Promise<string[]> {
    const { isNotNull } = await import('drizzle-orm');
    const results = await db
      .select({ imageUrl: generations.imageUrl })
      .from(generations)
      .where(
        and(
          eq(generations.userId, userId),
          eq(generations.generationMode, 'dream'),
          isNotNull(generations.imageUrl)
        )
      )
      .orderBy(desc(generations.createdAt))
      .limit(20); // Get up to 20 recent DREAM thumbnails
    
    return results.map(r => r.imageUrl as string);
  }

  async getAllDreamThumbnails(): Promise<string[]> {
    const { isNotNull } = await import('drizzle-orm');
    const results = await db
      .select({ imageUrl: generations.imageUrl })
      .from(generations)
      .where(
        and(
          eq(generations.generationMode, 'dream'),
          isNotNull(generations.imageUrl)
        )
      )
      .orderBy(desc(generations.createdAt))
      .limit(50); // Get up to 50 recent DREAM thumbnails from ALL users
    
    return results.map(r => r.imageUrl as string);
  }
  
  async updateGenerationPaymentStatus(id: number, paymentStatus: string): Promise<void> {
    await db.update(generations).set({ paymentStatus }).where(eq(generations.id, id));
  }
  
  async updateGenerationScript(id: number, fullScript: string): Promise<void> {
    await db.update(generations).set({ fullScript }).where(eq(generations.id, id));
  }
  
  async getGenerationsByParentId(parentId: number): Promise<Generation[]> {
    return await db
      .select()
      .from(generations)
      .where(eq(generations.parentGenerationId, parentId))
      .orderBy(desc(generations.createdAt));
  }
  
  async updateGenerationFavorite(id: number, isFavorite: boolean): Promise<Generation> {
    const result = await db
      .update(generations)
      .set({ isFavorite })
      .where(eq(generations.id, id))
      .returning();
    return result[0];
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
  
  // User templates (custom mixes)
  async getUserTemplates(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.userId, userId))
      .orderBy(desc(templates.createdAt));
  }
  
  // Script Packages
  async createPackage(pkg: InsertScriptPackage): Promise<ScriptPackage> {
    const [result] = await db.insert(scriptPackages).values(pkg).returning();
    return result;
  }

  async getPackagesByUserId(userId: string): Promise<ScriptPackage[]> {
    return await db
      .select()
      .from(scriptPackages)
      .where(eq(scriptPackages.userId, userId))
      .orderBy(desc(scriptPackages.createdAt));
  }

  async getPackageById(id: number): Promise<ScriptPackage | undefined> {
    const [result] = await db
      .select()
      .from(scriptPackages)
      .where(eq(scriptPackages.id, id));
    return result;
  }

  async updatePackageStatus(id: number, status: string): Promise<void> {
    await db
      .update(scriptPackages)
      .set({ status, updatedAt: new Date() })
      .where(eq(scriptPackages.id, id));
  }

  // Package Scripts
  async createPackageScript(script: InsertPackageScript): Promise<PackageScript> {
    const [result] = await db.insert(packageScripts).values(script).returning();
    return result;
  }

  async getPackageScripts(packageId: number): Promise<PackageScript[]> {
    return await db
      .select()
      .from(packageScripts)
      .where(eq(packageScripts.packageId, packageId))
      .orderBy(packageScripts.sortOrder);
  }

  async updatePackageScript(id: number, updates: Partial<InsertPackageScript>): Promise<PackageScript> {
    const [result] = await db
      .update(packageScripts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(packageScripts.id, id))
      .returning();
    return result;
  }

  async deletePackageScript(id: number): Promise<void> {
    await db.delete(packageScripts).where(eq(packageScripts.id, id));
  }
}

export const storage = new DatabaseStorage();
