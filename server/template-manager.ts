import { eq, and, or, ilike, arrayContains, sql, desc } from "drizzle-orm";
import { db } from "./db";
import {
  templates,
  userTemplateLibraries,
  type Template,
  type InsertTemplate,
  type UserTemplateLibrary,
  type InsertUserTemplateLibrary,
  type TemplateJSON,
  templateJSONSchema,
} from "@shared/schema";

export interface ITemplateManager {
  // Template CRUD
  getTemplateById(templateId: string): Promise<Template | undefined>;
  getTemplateByDbId(id: number): Promise<Template | undefined>;
  getAllTemplates(): Promise<Template[]>;
  getSystemTemplates(): Promise<Template[]>;
  getPublicTemplates(): Promise<Template[]>;
  getUserTemplates(userId: string): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(templateId: string, updates: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(templateId: string): Promise<void>;
  incrementUsageCount(templateId: string): Promise<void>;
  
  // Template querying
  getTemplatesByCategory(category: string): Promise<Template[]>;
  searchTemplatesByTags(tags: string[]): Promise<Template[]>;
  searchTemplatesByPresentingIssue(issue: string): Promise<Template[]>;
  
  // User template library
  addTemplateToUserLibrary(userId: string, templateId: string): Promise<UserTemplateLibrary>;
  removeTemplateFromUserLibrary(userId: string, templateId: string): Promise<void>;
  getUserLibraryTemplates(userId: string): Promise<Template[]>;
  isTemplateInUserLibrary(userId: string, templateId: string): Promise<boolean>;
  
  // Validation
  validateTemplateJSON(jsonData: any): TemplateJSON;
}

export class TemplateManager implements ITemplateManager {
  // Template CRUD
  async getTemplateById(templateId: string): Promise<Template | undefined> {
    const result = await db
      .select()
      .from(templates)
      .where(eq(templates.templateId, templateId))
      .limit(1);
    return result[0];
  }

  async getTemplateByDbId(id: number): Promise<Template | undefined> {
    const result = await db
      .select()
      .from(templates)
      .where(eq(templates.id, id))
      .limit(1);
    return result[0];
  }

  async getAllTemplates(): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .orderBy(desc(templates.usageCount), desc(templates.createdAt));
  }

  async getSystemTemplates(): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.isSystem, true))
      .orderBy(desc(templates.usageCount));
  }

  async getPublicTemplates(): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.isPublic, true))
      .orderBy(desc(templates.usageCount));
  }

  async getUserTemplates(userId: string): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.userId, userId))
      .orderBy(desc(templates.createdAt));
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    // Validate JSON data
    this.validateTemplateJSON(template.jsonData);
    
    const result = await db.insert(templates).values(template).returning();
    return result[0];
  }

  async updateTemplate(templateId: string, updates: Partial<InsertTemplate>): Promise<Template | undefined> {
    // If updating JSON, validate it
    if (updates.jsonData) {
      this.validateTemplateJSON(updates.jsonData);
    }
    
    const result = await db
      .update(templates)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(templates.templateId, templateId))
      .returning();
    
    return result[0];
  }

  async deleteTemplate(templateId: string): Promise<void> {
    await db.delete(templates).where(eq(templates.templateId, templateId));
  }

  async incrementUsageCount(templateId: string): Promise<void> {
    await db
      .update(templates)
      .set({
        usageCount: sql`${templates.usageCount} + 1`,
      })
      .where(eq(templates.templateId, templateId));
  }

  // Template querying
  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(
        and(
          eq(templates.category, category),
          or(eq(templates.isPublic, true), eq(templates.isSystem, true))
        )
      )
      .orderBy(desc(templates.usageCount));
  }

  async searchTemplatesByTags(tags: string[]): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(
        and(
          arrayContains(templates.tags, tags),
          or(eq(templates.isPublic, true), eq(templates.isSystem, true))
        )
      )
      .orderBy(desc(templates.usageCount));
  }

  async searchTemplatesByPresentingIssue(issue: string): Promise<Template[]> {
    // Search in JSON presenting_issues array
    return await db
      .select()
      .from(templates)
      .where(
        and(
          sql`${templates.jsonData}->>'presenting_issues' ILIKE ${`%${issue}%`}`,
          or(eq(templates.isPublic, true), eq(templates.isSystem, true))
        )
      )
      .orderBy(desc(templates.usageCount))
      .limit(10);
  }

  // User template library
  async addTemplateToUserLibrary(userId: string, templateId: string): Promise<UserTemplateLibrary> {
    // Verify template exists
    const template = await this.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    try {
      const result = await db
        .insert(userTemplateLibraries)
        .values({
          userId,
          templateId,
        })
        .returning();
      
      return result[0];
    } catch (error: any) {
      // Handle unique constraint violation (duplicate entry)
      if (error?.code === '23505') {
        throw new Error(`Template ${templateId} already in user library`);
      }
      throw error;
    }
  }

  async removeTemplateFromUserLibrary(userId: string, templateId: string): Promise<void> {
    await db
      .delete(userTemplateLibraries)
      .where(
        and(
          eq(userTemplateLibraries.userId, userId),
          eq(userTemplateLibraries.templateId, templateId)
        )
      );
  }

  async getUserLibraryTemplates(userId: string): Promise<Template[]> {
    const result = await db
      .select({
        template: templates,
      })
      .from(userTemplateLibraries)
      .innerJoin(templates, eq(userTemplateLibraries.templateId, templates.templateId))
      .where(eq(userTemplateLibraries.userId, userId))
      .orderBy(desc(userTemplateLibraries.addedAt));

    return result.map((r) => r.template);
  }

  async isTemplateInUserLibrary(userId: string, templateId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(userTemplateLibraries)
      .where(
        and(
          eq(userTemplateLibraries.userId, userId),
          eq(userTemplateLibraries.templateId, templateId)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  // Validation
  validateTemplateJSON(jsonData: any): TemplateJSON {
    const result = templateJSONSchema.safeParse(jsonData);
    if (!result.success) {
      throw new Error(`Invalid template JSON: ${result.error.message}`);
    }
    return result.data;
  }
}

// Export singleton instance
export const templateManager = new TemplateManager();
