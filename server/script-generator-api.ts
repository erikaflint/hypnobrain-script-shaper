/**
 * External API - Script Generator
 * Provides script GENERATION (not analysis) for external integrations
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireApiKey } from './apiKeyAuth';
import { storage } from './storage';
import { aiService } from './ai-service';
import { templateSelector } from './template-selector';
import { validateContent, validateMultipleFields } from './content-validator';
import { db } from './db';
import { apiKeys } from '@shared/schema';
import { eq } from 'drizzle-orm';

export const scriptGeneratorRouter = Router();

/**
 * Update API key last used timestamp
 */
async function trackApiKeyUsage(keyId: number) {
  await db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, keyId));
}

/**
 * Generate Clinical Script
 * POST /api/generate/clinical
 */
scriptGeneratorRouter.post('/clinical', 
  requireApiKey(['generate:clinical']),
  async (req: any, res) => {
    try {
      const schema = z.object({
        presentingIssue: z.string().min(10, 'Presenting issue must be at least 10 characters'),
        desiredOutcome: z.string().min(10, 'Desired outcome must be at least 10 characters'),
        additionalNotes: z.string().optional(), // Client notes/context
        voiceProfileId: z.number().optional(), // Voice/tone profile
        archetypeId: z.number().optional(), // Narrative archetype
        styleId: z.number().optional(), // Writing style
        templateId: z.number().optional(), // Direct template selection (overrides auto-recommendation)
        arcId: z.string().optional(), // Optional narrative arc selection (e.g., "earned-delight", "oasis-rest")
        emergenceType: z.enum(['regular', 'sleep']).optional().default('regular'),
        targetWordCount: z.number().optional().default(1800),
      });

      const data = schema.parse(req.body);
      
      // Validate content
      const validation = validateMultipleFields({
        clientIssue: data.presentingIssue,
      });
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: 'Content validation failed',
          message: validation.reason 
        });
      }

      // Get archetype (or use default)
      let archetype;
      if (data.archetypeId) {
        archetype = await storage.getArchetypeById(data.archetypeId);
        if (!archetype) {
          return res.status(404).json({ 
            error: 'Archetype not found',
            message: `Archetype with ID ${data.archetypeId} does not exist`
          });
        }
      } else {
        const allArchetypes = await storage.getAllArchetypes();
        archetype = allArchetypes[0]; // Use first as default
      }

      // Get style (or use default)
      let style;
      if (data.styleId) {
        style = await storage.getStyleById(data.styleId);
        if (!style) {
          return res.status(404).json({ 
            error: 'Style not found',
            message: `Style with ID ${data.styleId} does not exist`
          });
        }
      } else {
        const allStyles = await storage.getAllStyles();
        style = allStyles[0]; // Use first as default
      }

      // Get template: either specified directly or via recommendation
      let template;
      if (data.templateId) {
        const templateManager = await import('./template-manager');
        template = await templateManager.templateManager.getTemplateByDbId(data.templateId);
        if (!template) {
          return res.status(404).json({ 
            error: 'Template not found',
            message: `Template with ID ${data.templateId} does not exist`
          });
        }
      } else {
        // Get recommended template based on issue/outcome
        const recommendations = await templateSelector.recommendTemplates(
          data.presentingIssue,
          data.desiredOutcome
        );

        if (recommendations.length === 0) {
          return res.status(500).json({ 
            error: 'Template not found',
            message: 'No suitable template found for this request'
          });
        }

        template = recommendations[0].template;
      }
      const templateJson = typeof template.jsonData === 'string' 
        ? JSON.parse(template.jsonData) 
        : template.jsonData;

      console.log(`[API] Generating clinical script for: "${data.presentingIssue.substring(0, 50)}..."`);
      
      // Generate script using ScriptEngine with template
      const result = await aiService.generateFullScript({
        template: templateJson,
        presentingIssue: data.presentingIssue,
        desiredOutcome: data.desiredOutcome,
        clientNotes: data.additionalNotes,
        arcId: data.arcId, // Optional manual arc selection
        emergenceType: data.emergenceType,
        targetWordCount: data.targetWordCount,
      });

      console.log(`[API] ✓ Clinical script generated (${result.fullScript.split(' ').length} words)`);

      // Track API usage
      await trackApiKeyUsage(req.apiKey.id);

      res.json({
        success: true,
        script: {
          title: `${data.desiredOutcome} Hypnosis Script`, // Simple title
          text: result.fullScript,
          wordCount: result.fullScript.split(' ').length,
          emergenceType: data.emergenceType,
        },
        metadata: {
          apiKeyId: req.apiKey.id,
          generatedAt: new Date().toISOString(),
          archetypeUsed: archetype?.name,
          styleUsed: style?.name,
          templateUsed: template.name,
          templateId: template.id,
        }
      });

    } catch (error: any) {
      console.error('[API] Clinical generation error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }

      res.status(500).json({
        error: 'Generation failed',
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

/**
 * Generate DREAM Script (Simplified - No 4-stage pipeline for external API)
 * POST /api/generate/dream
 */
scriptGeneratorRouter.post('/dream',
  requireApiKey(['generate:dream']),
  async (req: any, res) => {
    try {
      const schema = z.object({
        journeyIdea: z.string().min(20, 'Journey idea must be at least 20 characters'),
        archetypeId: z.number().optional(),
        arcId: z.string().optional(), // Optional DREAM narrative arc selection
        targetWordCount: z.number().optional().default(3000),
      });

      const data = schema.parse(req.body);

      // Validate content
      const validation = validateContent(data.journeyIdea, req.apiKey.userId);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Content validation failed',
          message: 'DREAM scripts are for peaceful sleep journeys only. ' + validation.reason
        });
      }

      // Get archetype (or use blended archetype default)
      let archetype;
      if (data.archetypeId) {
        archetype = await storage.getArchetypeById(data.archetypeId);
        if (!archetype) {
          return res.status(404).json({
            error: 'Archetype not found',
            message: `Archetype with ID ${data.archetypeId} does not exist`
          });
        }
      } else {
        const blendedArchetypes = await storage.getBlendedArchetypes();
        archetype = blendedArchetypes[0]; // Default to first blended archetype
      }

      if (!archetype) {
        return res.status(404).json({
          error: 'Archetype not found',
          message: 'No archetypes available'
        });
      }

      console.log(`[API] Starting DREAM generation for: "${data.journeyIdea.substring(0, 50)}..."`);

      // Get DREAM-optimized template
      const recommendations = await templateSelector.recommendTemplates(
        data.journeyIdea,
        "deep rest and peaceful sleep"
      );

      if (recommendations.length === 0) {
        return res.status(500).json({
          error: 'Template not found',
          message: 'No suitable template found for DREAM hypnosis'
        });
      }

      const template = recommendations[0].template;
      const templateJson = typeof template.jsonData === 'string'
        ? JSON.parse(template.jsonData)
        : template.jsonData;

      // Enhance template for DREAM: boost somatic and symbolic
      const dreamTemplate = {
        ...templateJson,
        dimensions: {
          ...templateJson.dimensions,
          somatic: {
            ...templateJson.dimensions.somatic,
            level: Math.max(70, templateJson.dimensions.somatic.level)
          },
          symbolic: {
            ...templateJson.dimensions.symbolic,
            level: Math.max(70, templateJson.dimensions.symbolic.level),
            archetype: `${archetype.name} - ${archetype.description || ''}`
          },
        }
      };

      // Generate DREAM script
      const result = await aiService.generateFullScript({
        template: dreamTemplate,
        presentingIssue: data.journeyIdea,
        desiredOutcome: "Experience a peaceful, restful journey into natural sleep",
        arcId: data.arcId, // Optional manual arc selection for DREAM
        emergenceType: 'sleep',
        targetWordCount: data.targetWordCount,
      });

      console.log(`[API] ✓ DREAM script generated (${result.fullScript.split(' ').length} words)`);

      // Generate AI title
      const dreamTitle = await aiService.generateDreamTitle({
        journeyIdea: data.journeyIdea,
        archetypeName: archetype.name,
      });

      // Track API usage
      await trackApiKeyUsage(req.apiKey.id);

      res.json({
        success: true,
        script: {
          title: dreamTitle,
          text: result.fullScript,
          wordCount: result.fullScript.split(' ').length,
          emergenceType: 'sleep',
        },
        metadata: {
          apiKeyId: req.apiKey.id,
          generatedAt: new Date().toISOString(),
          archetypeUsed: archetype.name,
          templateUsed: template.name,
        }
      });

    } catch (error: any) {
      console.error('[API] DREAM generation error:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }

      res.status(500).json({
        error: 'Generation failed',
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

/**
 * List Available Archetypes
 * GET /api/archetypes
 */
scriptGeneratorRouter.get('/archetypes',
  requireApiKey(['generate:clinical', 'generate:dream']),
  async (req: any, res) => {
    try {
      const archetypes = await storage.getAllArchetypes();
      const blendedArchetypes = await storage.getBlendedArchetypes();

      res.json({
        success: true,
        archetypes: archetypes.map(a => ({
          id: a.id,
          name: a.name,
          description: a.description,
        })),
        blendedArchetypes: blendedArchetypes.map(a => ({
          id: a.id,
          name: a.name,
          description: a.description,
        })),
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch archetypes',
        message: error.message,
      });
    }
  }
);

/**
 * List Available Styles
 * GET /api/styles
 */
scriptGeneratorRouter.get('/styles',
  requireApiKey(['generate:clinical']),
  async (req: any, res) => {
    try {
      const styles = await storage.getAllStyles();

      res.json({
        success: true,
        styles: styles.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
        })),
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch styles',
        message: error.message,
      });
    }
  }
);
