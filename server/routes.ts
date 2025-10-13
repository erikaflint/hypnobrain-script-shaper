import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./ai-service";
import { paymentService } from "./payment-service";
import { templateManager } from "./template-manager";
import { templateSelector } from "./template-selector";
import { dimensionAssembler } from "./dimension-assembler";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up Replit Auth
  await setupAuth(app);

  // Auth user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all dimensions
  app.get("/api/dimensions", async (req, res) => {
    try {
      const dimensions = await storage.getAllDimensions();
      res.json(dimensions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all archetypes
  app.get("/api/archetypes", async (req, res) => {
    try {
      const archetypes = await storage.getAllArchetypes();
      res.json(archetypes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get blended archetypes (sort_order >= 10) for DREAM
  app.get("/api/archetypes/blended", async (req, res) => {
    try {
      const blendedArchetypes = await storage.getBlendedArchetypes();
      res.json(blendedArchetypes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all styles
  app.get("/api/styles", async (req, res) => {
    try {
      const styles = await storage.getAllStyles();
      res.json(styles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get authenticated user's saved generations
  app.get("/api/user/generations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const generations = await storage.getGenerationsByUserId(userId);
      res.json(generations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get user's saved generations by email (legacy - for backwards compatibility)
  app.get("/api/generations", async (req, res) => {
    try {
      const email = req.query.email as string;
      
      if (!email) {
        return res.status(400).json({ message: "Email parameter is required" });
      }
      
      const generations = await storage.getGenerationsByEmail(email);
      res.json(generations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Toggle favorite status
  app.patch("/api/generations/:id/favorite", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schema = z.object({
        isFavorite: z.boolean(),
      });
      
      const { isFavorite } = schema.parse(req.body);
      
      const updated = await storage.updateGenerationFavorite(id, isFavorite);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Create a remix from an existing generation
  app.post("/api/generations/:id/remix", async (req, res) => {
    try {
      const parentId = parseInt(req.params.id);
      const schema = z.object({
        versionLabel: z.string().optional(),
        dimensionValues: z.object({
          somatic: z.number(),
          temporal: z.number(),
          symbolic: z.number(),
          psychological: z.number(),
          perspective: z.number(),
          spiritual: z.number(),
          relational: z.number(),
          language: z.number(),
        }).optional(),
      });
      
      const data = schema.parse(req.body);
      
      // Get parent generation to copy settings
      const parent = await storage.getGenerationById(parentId);
      if (!parent) {
        return res.status(404).json({ message: "Parent generation not found" });
      }
      
      // Determine next version number
      const siblings = await storage.getGenerationsByParentId(parentId);
      const versionNumber = siblings.length + 2; // +1 for parent, +1 for new version
      
      // Create remix with parent tracking
      const remix = await storage.createGeneration({
        sessionId: parent.sessionId,
        email: parent.email,
        generationMode: 'remix',
        isFree: false,
        presentingIssue: parent.presentingIssue,
        desiredOutcome: parent.desiredOutcome,
        benefits: parent.benefits,
        customNotes: parent.customNotes,
        dimensionsJson: data.dimensionValues || parent.dimensionsJson,
        archetypeId: parent.archetypeId,
        stylesJson: parent.stylesJson,
        templateUsed: parent.templateUsed,
        parentGenerationId: parentId,
        versionLabel: data.versionLabel || `v${versionNumber}`,
        paymentStatus: 'pending_payment',
      });
      
      res.json({ 
        remixId: remix.id,
        message: "Remix created. Complete generation to get the script.",
        versionLabel: remix.versionLabel,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Check free script eligibility
  app.post("/api/check-free-eligibility", async (req, res) => {
    try {
      const schema = z.object({
        email: z.string().email(),
      });
      
      const { email } = schema.parse(req.body);
      const isEligible = await storage.checkFreeEligibility(email);
      
      if (!isEligible) {
        const lastUsage = await storage.getLastFreeUsage(email);
        const nextAvailable = lastUsage 
          ? new Date(lastUsage.lastFreeScriptAt.getTime() + 7 * 24 * 60 * 60 * 1000)
          : new Date();
        
        res.json({ 
          eligible: false, 
          nextAvailableDate: nextAvailable.toISOString(),
          message: "You've already used your free script this week"
        });
      } else {
        res.json({ eligible: true });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Generate preview
  app.post("/api/generate-preview", async (req, res) => {
    try {
      const schema = z.object({
        mode: z.enum(['create', 'remix']),
        clientName: z.string(),
        clientIssue: z.string(),
        archetypeId: z.number(),
        styleId: z.number(),
        dimensionValues: z.object({
          somatic: z.number(),
          temporal: z.number(),
          symbolic: z.number(),
          psychological: z.number(),
          perspective: z.number(),
          spiritual: z.number(),
          relational: z.number(),
          language: z.number(),
        }),
        existingScript: z.string().optional(),
      });
      
      const data = schema.parse(req.body);
      
      const archetype = await storage.getArchetypeById(data.archetypeId);
      if (!archetype) {
        return res.status(404).json({ message: "Archetype not found" });
      }
      
      const style = await storage.getStyleById(data.styleId);
      if (!style) {
        return res.status(404).json({ message: "Style not found" });
      }
      
      const preview = await aiService.generatePreview({
        mode: data.mode,
        clientName: data.clientName,
        clientIssue: data.clientIssue,
        archetypeName: archetype.name,
        archetypeDescription: archetype.description || '',
        styleName: style.name,
        styleDescription: style.description || '',
        dimensionValues: data.dimensionValues,
        existingScript: data.existingScript,
      });
      
      res.json(preview);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Generate full script (free tier)
  app.post("/api/generate-free-script", async (req, res) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        clientIssue: z.string(),
      });
      
      const { email, clientIssue } = schema.parse(req.body);
      
      // Check eligibility
      const isEligible = await storage.checkFreeEligibility(email);
      if (!isEligible) {
        return res.status(403).json({ message: "You've already used your free script this week" });
      }
      
      // Get default archetype and style for free tier
      const archetypes = await storage.getAllArchetypes();
      const styles = await storage.getAllStyles();
      const defaultArchetype = archetypes[0]; // "The Healer"
      const defaultStyle = styles[0]; // "Conversational"
      
      // Use balanced dimension values for free tier (all 8D dimensions at 50%)
      const balancedDimensions = {
        somatic: 50,
        temporal: 50,
        symbolic: 50,
        psychological: 50,
        perspective: 50,
        spiritual: 50,
        relational: 50,
        language: 50,
      };
      
      const result = await aiService.generateFullScript({
        mode: 'create',
        clientName: 'valued client',
        clientIssue,
        archetypeName: defaultArchetype.name,
        archetypeDescription: defaultArchetype.description || '',
        styleName: defaultStyle.name,
        styleDescription: defaultStyle.description || '',
        dimensionValues: balancedDimensions,
      });
      
      // Record usage
      await storage.recordFreeUsage({
        email,
        lastFreeScriptAt: new Date(),
      });
      
      res.json({ script: result.fullScript });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Generate DREAM script (sleep hypnosis journey)
  app.post("/api/generate-dream-script", async (req, res) => {
    try {
      const schema = z.object({
        journeyIdea: z.string(),
        archetypeId: z.number().optional(),
      });
      
      const { journeyIdea, archetypeId } = schema.parse(req.body);
      
      // Fetch selected archetype or use first blended archetype
      let archetype;
      if (archetypeId) {
        archetype = await storage.getArchetypeById(archetypeId);
      } else {
        const blendedArchetypes = await storage.getBlendedArchetypes();
        archetype = blendedArchetypes[0]; // Default to first blended archetype
      }
      
      if (!archetype) {
        return res.status(404).json({ message: "Archetype not found" });
      }
      
      // Get a template suitable for DREAM (high somatic, high symbolic)
      // For now, use template selector with journey idea
      const recommendations = await templateSelector.recommendTemplates(
        journeyIdea,
        "deep rest and peaceful sleep"
      );
      
      if (recommendations.length === 0) {
        return res.status(404).json({ message: "No suitable template found for DREAM hypnosis" });
      }
      
      const template = recommendations[0].template;
      const templateJson = typeof template.jsonData === 'string' 
        ? JSON.parse(template.jsonData) 
        : template.jsonData;
      
      // Enhance template for DREAM: boost somatic and symbolic, set archetype
      const dreamTemplate = {
        ...templateJson,
        archetype: {
          name: archetype.name,
          description: archetype.description || '',
        },
        dimensions: {
          ...templateJson.dimensions,
          somatic: { ...templateJson.dimensions.somatic, level: Math.max(70, templateJson.dimensions.somatic.level) },
          symbolic: { ...templateJson.dimensions.symbolic, level: Math.max(70, templateJson.dimensions.symbolic.level) },
        }
      };
      
      // Generate DREAM script (30 minutes = ~3000 words)
      const result = await aiService.generateFullScript({
        template: dreamTemplate,
        presentingIssue: journeyIdea,
        desiredOutcome: "Experience a peaceful, restful journey into natural sleep",
        emergenceType: 'sleep',  // Key difference: sleep emergence
        targetWordCount: 3000,  // 30-minute script
      });
      
      res.json({ fullScript: result.fullScript });
    } catch (error: any) {
      console.error("DREAM generation error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Create payment intent (mock for now)
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const schema = z.object({
        tier: z.enum(['create_new', 'remix']),
        generationData: z.any(),
      });
      
      const { tier, generationData } = schema.parse(req.body);
      
      const pricing = await storage.getPricingByTierName(tier);
      if (!pricing) {
        return res.status(404).json({ message: "Pricing tier not found" });
      }
      
      const paymentIntent = await paymentService.createPaymentIntent(
        pricing.priceCents,
        { tier, generationData: JSON.stringify(generationData) }
      );
      
      res.json(paymentIntent);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Generate full script (paid tier)
  app.post("/api/generate-paid-script", async (req, res) => {
    try {
      const schema = z.object({
        mode: z.enum(['create', 'remix']),
        clientName: z.string(),
        clientIssue: z.string(),
        archetypeId: z.number(),
        styleId: z.number(),
        dimensionValues: z.object({
          somatic: z.number(),
          temporal: z.number(),
          symbolic: z.number(),
          psychological: z.number(),
          perspective: z.number(),
          spiritual: z.number(),
          relational: z.number(),
          language: z.number(),
        }),
        existingScript: z.string().optional(),
        paymentIntentId: z.string(),
      });
      
      const data = schema.parse(req.body);
      
      const archetype = await storage.getArchetypeById(data.archetypeId);
      if (!archetype) {
        return res.status(404).json({ message: "Archetype not found" });
      }
      
      const style = await storage.getStyleById(data.styleId);
      if (!style) {
        return res.status(404).json({ message: "Style not found" });
      }
      
      // Generate the full script
      const result = await aiService.generateFullScript({
        mode: data.mode,
        clientName: data.clientName,
        clientIssue: data.clientIssue,
        archetypeName: archetype.name,
        archetypeDescription: archetype.description || '',
        styleName: style.name,
        styleDescription: style.description || '',
        dimensionValues: data.dimensionValues,
        existingScript: data.existingScript,
      });
      
      // Save to database (using actual schema field names)
      const generation = await storage.createGeneration({
        generationMode: data.mode === 'create' ? 'create_new' : 'remix',
        isFree: false,
        originalScript: data.existingScript,
        originalDimensionsJson: data.mode === 'remix' ? data.dimensionValues : null,
        presentingIssue: data.clientIssue,
        dimensionsJson: data.dimensionValues,
        archetypeId: data.archetypeId,
        stylesJson: { id: style.id, name: style.name },
        previewText: result.fullScript.substring(0, 500),
        fullScript: result.fullScript,
        assetsJson: result.marketingAssets,
        paymentStatus: 'pending_payment',
        stripePaymentIntentId: data.paymentIntentId,
      });
      
      res.json({ 
        generationId: generation.id,
        fullScript: result.fullScript,
        marketingAssets: result.marketingAssets,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Analyze script for remix mode
  app.post("/api/analyze-script", async (req, res) => {
    try {
      const schema = z.object({
        script: z.string(),
      });
      
      const { script } = schema.parse(req.body);
      
      const analysis = await aiService.analyzeScriptDimensions(script);
      
      res.json(analysis);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: Get all generations
  app.get("/api/admin/generations", async (req, res) => {
    try {
      const allGenerations = await storage.getAllGenerations();
      res.json(allGenerations);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ========== V2 TEMPLATE-BASED ROUTES ==========
  
  // Get all templates (with optional filters)
  app.get("/api/templates", async (req, res) => {
    try {
      const { type, category } = req.query;
      
      let templates;
      if (type === 'system') {
        templates = await templateManager.getSystemTemplates();
      } else if (type === 'public') {
        templates = await templateManager.getPublicTemplates();
      } else if (category) {
        templates = await templateManager.getTemplatesByCategory(category as string);
      } else {
        templates = await templateManager.getAllTemplates();
      }
      
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get single template by ID
  app.get("/api/templates/:templateId", async (req, res) => {
    try {
      const template = await templateManager.getTemplateById(req.params.templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get user's saved templates (custom mixes)
  app.get("/api/user/templates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userTemplates = await storage.getUserTemplates(userId);
      res.json(userTemplates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get template recommendations
  app.post("/api/templates/recommend", async (req, res) => {
    try {
      const schema = z.object({
        presentingIssue: z.string(),
        desiredOutcome: z.string().optional(),
        clientNotes: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
      });
      
      const data = schema.parse(req.body);
      
      const recommendations = await templateSelector.recommendTemplates(
        data.presentingIssue,
        data.desiredOutcome || '',
        data.clientNotes || ''
      );
      
      res.json(recommendations);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Generate preview with template
  app.post("/api/templates/:templateId/preview", async (req, res) => {
    try {
      const schema = z.object({
        title: z.string().optional(),
        presentingIssue: z.string(),
        desiredOutcome: z.string(),
        clientNotes: z.string().optional(),
      });
      
      const data = schema.parse(req.body);
      const template = await templateManager.getTemplateById(req.params.templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Increment usage count
      await templateManager.incrementUsageCount(req.params.templateId);
      
      // Generate preview using template
      const preview = await aiService.generatePreview({
        template: template.jsonData as any, // JSONB returns unknown, safe to cast
        presentingIssue: data.presentingIssue,
        desiredOutcome: data.desiredOutcome,
        clientNotes: data.clientNotes || '',
      });
      
      res.json(preview);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Generate full script with template (protected - requires auth)
  app.post("/api/templates/:templateId/generate", isAuthenticated, async (req: any, res) => {
    try {
      const schema = z.object({
        title: z.string().optional(),
        presentingIssue: z.string(),
        desiredOutcome: z.string(),
        clientNotes: z.string().optional(),
        paymentIntentId: z.string().optional(),
      });
      
      const data = schema.parse(req.body);
      const template = await templateManager.getTemplateById(req.params.templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Get authenticated user ID
      const userId = req.user.claims.sub;
      
      // Increment usage count
      await templateManager.incrementUsageCount(req.params.templateId);
      
      // Generate full script using template
      const result = await aiService.generateFullScript({
        template: template.jsonData as any, // JSONB returns unknown, safe to cast
        presentingIssue: data.presentingIssue,
        desiredOutcome: data.desiredOutcome,
        clientNotes: data.clientNotes || '',
      });
      
      // Generate a memorable title from presenting issue and desired outcome
      const generateTitle = (issue: string, outcome: string): string => {
        // Clean and trim inputs
        const cleanIssue = issue.trim().replace(/[^\w\s-]/g, '');
        const cleanOutcome = outcome.trim().replace(/[^\w\s-]/g, '');
        
        // Take first 2-3 words from issue, ensure we have content
        const issueWords = cleanIssue.split(/\s+/).filter(w => w.length > 0).slice(0, 3).join(' ');
        const outcomeWords = cleanOutcome.split(/\s+/).filter(w => w.length > 0).slice(0, 4).join(' ');
        
        if (!issueWords) return 'Hypnosis Session'; // Fallback if no issue
        
        // Create variations based on template category
        const category = (template.jsonData as any)?.category || 'therapeutic';
        if (category === 'beginner' || category === 'rapid') {
          return `${issueWords} Relief`;
        } else if (category === 'specialized') {
          return `${issueWords} Transformation`;
        } else if (outcomeWords) {
          return `${issueWords} to ${outcomeWords}`;
        } else {
          return `${issueWords} Session`;
        }
      };
      
      const generatedTitle = data.title || generateTitle(data.presentingIssue, data.desiredOutcome);
      
      // Save to database with userId
      const generation = await storage.createGeneration({
        userId, // Save authenticated user's ID
        title: generatedTitle,
        generationMode: 'create_new',
        isFree: false,
        presentingIssue: data.presentingIssue,
        dimensionsJson: null, // Template-based, no manual dimension values
        archetypeId: null,
        stylesJson: null,
        previewText: result.fullScript.substring(0, 500),
        fullScript: result.fullScript,
        assetsJson: result.marketingAssets,
        paymentStatus: 'pending_payment',
        stripePaymentIntentId: data.paymentIntentId,
        templateUsed: template.templateId,
        systemPrompt: result.systemPrompt, // Track AI prompts for testing/debugging
        userPrompt: result.userPrompt,
      });
      
      res.json({ 
        generationId: generation.id,
        fullScript: result.fullScript,
        marketingAssets: result.marketingAssets,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Remix existing script with template
  app.post("/api/templates/:templateId/remix", async (req, res) => {
    try {
      const schema = z.object({
        existingScript: z.string(),
        presentingIssue: z.string(),
        desiredOutcome: z.string(),
        clientNotes: z.string().optional(),
        paymentIntentId: z.string().optional(),
      });
      
      const data = schema.parse(req.body);
      const template = await templateManager.getTemplateById(req.params.templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Increment usage count
      await templateManager.incrementUsageCount(req.params.templateId);
      
      // Generate remixed script using template
      const result = await aiService.generateRemixScript({
        template: template.jsonData as any, // JSONB returns unknown, safe to cast
        existingScript: data.existingScript,
        presentingIssue: data.presentingIssue,
        desiredOutcome: data.desiredOutcome,
        clientNotes: data.clientNotes || '',
      });
      
      // Save to database
      const generation = await storage.createGeneration({
        generationMode: 'remix',
        isFree: false,
        originalScript: data.existingScript,
        presentingIssue: data.presentingIssue,
        dimensionsJson: null,
        archetypeId: null,
        stylesJson: null,
        previewText: result.fullScript.substring(0, 500),
        fullScript: result.fullScript,
        assetsJson: result.marketingAssets,
        paymentStatus: 'pending_payment',
        stripePaymentIntentId: data.paymentIntentId,
        templateUsed: template.templateId,
        systemPrompt: result.systemPrompt, // Track AI prompts for testing/debugging
        userPrompt: result.userPrompt,
      });
      
      res.json({ 
        generationId: generation.id,
        fullScript: result.fullScript,
        marketingAssets: result.marketingAssets,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Analyze script and get dimension analysis (for showing what dimensions are in a script)
  app.post("/api/templates/analyze", async (req, res) => {
    try {
      const schema = z.object({
        script: z.string(),
      });
      
      const { script } = schema.parse(req.body);
      const analysis = await aiService.analyzeScriptDimensions(script);
      
      res.json(analysis);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Create new user template (Save Mix) - requires auth
  app.post("/api/templates", isAuthenticated, async (req: any, res) => {
    try {
      const schema = z.object({
        templateId: z.string(),
        jsonData: z.any(), // TemplateJSON object
        name: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        isPublic: z.boolean().optional(),
      });
      
      const data = schema.parse(req.body);
      const userId = req.user.claims.sub; // Get authenticated user ID
      
      // Validate the JSON data structure
      templateManager.validateTemplateJSON(data.jsonData);
      
      const template = await templateManager.createTemplate({
        templateId: data.templateId,
        jsonData: data.jsonData,
        name: data.name,
        description: data.description,
        category: data.category,
        tags: data.tags,
        createdBy: "user",
        userId: userId,
        isPublic: data.isPublic || false,
        isSystem: false,
      });
      
      res.json(template);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // User template library: Add template to library
  app.post("/api/user-library/templates/:templateId", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.string(),
      });
      
      const { userId } = schema.parse(req.body);
      const { templateId } = req.params;
      
      const libraryEntry = await templateManager.addTemplateToUserLibrary(userId, templateId);
      res.json(libraryEntry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // User template library: Remove template from library
  app.delete("/api/user-library/templates/:templateId", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.string(),
      });
      
      const { userId } = schema.parse(req.body);
      const { templateId } = req.params;
      
      await templateManager.removeTemplateFromUserLibrary(userId, templateId);
      res.json({ message: "Template removed from library" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // User template library: Get user's saved templates
  app.get("/api/user-library/templates", async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ message: "userId query parameter required" });
      }
      
      const templates = await templateManager.getUserLibraryTemplates(userId as string);
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // ============================================
  // SCRIPT PACKAGES - Collection Generator
  // ============================================
  
  // Create a new script package and generate concepts
  app.post("/api/packages", isAuthenticated, async (req, res) => {
    let createdPackageId: number | null = null;
    
    try {
      const schema = z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        theme: z.string().min(1),
        scriptCount: z.number().min(1).max(50),
      });
      
      const data = schema.parse(req.body);
      
      // Get user ID from claims (for compatibility with existing sessions)
      const userId = (req.user as any)?.id || (req.user as any)?.claims?.sub;
      
      // Create the package with 'generating' status
      const pkg = await storage.createPackage({
        userId,
        title: data.title,
        description: data.description,
        theme: data.theme,
        scriptCount: data.scriptCount,
        status: 'generating',
      });
      createdPackageId = pkg.id;
      
      try {
        // Generate script concepts using AI
        const concepts = await aiService.generatePackageConcepts({
          theme: data.theme,
          count: data.scriptCount,
          description: data.description,
        });
        
        // Save concepts as package scripts
        const packageScripts = await Promise.all(
          concepts.map((concept, index) => 
            storage.createPackageScript({
              packageId: pkg.id,
              conceptTitle: concept.title,
              conceptDescription: concept.description,
              suggestedPresentingIssue: concept.presentingIssue,
              suggestedDesiredOutcome: concept.desiredOutcome,
              sortOrder: index + 1,
              status: 'concept',
            })
          )
        );
        
        // Update package status to draft (success)
        await storage.updatePackageStatus(pkg.id, 'draft');
        
        // Fetch updated package to return accurate state
        const updatedPkg = await storage.getPackageById(pkg.id);
        
        res.json({ package: updatedPkg, scripts: packageScripts });
      } catch (generationError: any) {
        // Mark package as failed if AI generation or script creation fails
        await storage.updatePackageStatus(pkg.id, 'failed');
        throw generationError;
      }
    } catch (error: any) {
      console.error('Error creating package:', error);
      
      // If package was created but generation failed, inform user
      if (createdPackageId) {
        res.status(500).json({ 
          message: error.message || 'Failed to generate package concepts',
          packageId: createdPackageId,
          status: 'failed'
        });
      } else {
        res.status(500).json({ message: error.message || 'Failed to create package' });
      }
    }
  });
  
  // Get all packages for the authenticated user
  app.get("/api/packages", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id || (req.user as any)?.claims?.sub;
      const packages = await storage.getPackagesByUserId(userId);
      res.json(packages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get a specific package with all its scripts
  app.get("/api/packages/:id", isAuthenticated, async (req, res) => {
    try {
      const packageId = parseInt(req.params.id);
      const pkg = await storage.getPackageById(packageId);
      
      if (!pkg) {
        return res.status(404).json({ message: 'Package not found' });
      }
      
      // Verify ownership
      const currentUserId = (req.user as any)?.id || (req.user as any)?.claims?.sub;
      if (pkg.userId !== currentUserId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const scripts = await storage.getPackageScripts(packageId);
      res.json({ package: pkg, scripts });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update a package script (user modifications)
  app.patch("/api/packages/:packageId/scripts/:scriptId", isAuthenticated, async (req, res) => {
    try {
      const packageId = parseInt(req.params.packageId);
      const scriptId = parseInt(req.params.scriptId);
      
      const schema = z.object({
        userModifiedTitle: z.string().optional(),
        userModifiedIssue: z.string().optional(),
        userModifiedOutcome: z.string().optional(),
        assignedTemplateId: z.string().optional(),
      });
      
      const updates = schema.parse(req.body);
      
      // Verify package ownership
      const pkg = await storage.getPackageById(packageId);
      const currentUserId = (req.user as any)?.id || (req.user as any)?.claims?.sub;
      if (!pkg || pkg.userId !== currentUserId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const updatedScript = await storage.updatePackageScript(scriptId, updates);
      res.json(updatedScript);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Generate all scripts in a package
  app.post("/api/packages/:id/generate", isAuthenticated, async (req, res) => {
    try {
      const packageId = parseInt(req.params.id);
      const pkg = await storage.getPackageById(packageId);
      
      const currentUserId = (req.user as any)?.id || (req.user as any)?.claims?.sub;
      if (!pkg || pkg.userId !== currentUserId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      await storage.updatePackageStatus(packageId, 'generating');
      
      const scripts = await storage.getPackageScripts(packageId);
      const generatedScripts = [];
      const failedScripts = [];
      
      // Generate each script
      for (const script of scripts) {
        try {
          // Use modified values if available, otherwise use suggested values
          const presentingIssue = script.userModifiedIssue || script.suggestedPresentingIssue || '';
          const desiredOutcome = script.userModifiedOutcome || script.suggestedDesiredOutcome || '';
          
          // Get template if assigned (assignedTemplateId is the numeric database ID)
          let template = null;
          if (script.assignedTemplateId) {
            template = await templateManager.getTemplateByDbId(script.assignedTemplateId);
          }
          
          // If no template assigned, use template selector to find one
          if (!template) {
            const recommendations = await templateSelector.recommendTemplates(
              presentingIssue,
              desiredOutcome
            );
            if (recommendations.length > 0) {
              template = recommendations[0].template;
            }
          }
          
          if (!template) {
            throw new Error(`No template available for script: ${script.conceptTitle}`);
          }
          
          // jsonData is already parsed by Drizzle (jsonb type)
          const templateJson = template.jsonData as any;
          
          // Defensive check
          if (!templateJson || !templateJson.dimensions) {
            throw new Error(`Invalid template data for template ID ${script.assignedTemplateId}`);
          }
          
          // Generate full script
          const result = await aiService.generateFullScript({
            template: templateJson,
            presentingIssue,
            desiredOutcome,
          });
          
          // Save generation
          const generation = await storage.createGeneration({
            userId: currentUserId,
            title: script.userModifiedTitle || script.conceptTitle,
            generationMode: 'create_new',
            isFree: false,
            presentingIssue,
            desiredOutcome,
            fullScript: result.fullScript,
            assetsJson: result.marketingAssets,
            templateUsed: template.templateId,
            pricePaidCents: 0, // Part of package, no individual charge
            paymentStatus: 'completed',
            systemPrompt: result.systemPrompt,
            userPrompt: result.userPrompt,
          });
          
          // Link generation to package script and clear any previous error
          await storage.updatePackageScript(script.id, {
            generationId: generation.id,
            status: 'completed',
            errorMessage: null, // Clear any previous error on successful generation
          });
          
          generatedScripts.push(generation);
        } catch (error: any) {
          console.error(`Error generating script ${script.id}:`, error);
          await storage.updatePackageScript(script.id, { 
            status: 'failed',
            errorMessage: error.message || 'Unknown error during generation'
          });
          failedScripts.push({ scriptId: script.id, title: script.conceptTitle, error: error.message });
        }
      }
      
      // Set package status based on results
      const finalStatus = failedScripts.length === 0 ? 'completed' : 
                         failedScripts.length === scripts.length ? 'failed' : 'partial';
      await storage.updatePackageStatus(packageId, finalStatus);
      
      res.json({ 
        package: { ...pkg, status: finalStatus }, 
        generatedScripts,
        failedScripts: failedScripts.length > 0 ? failedScripts : undefined
      });
    } catch (error: any) {
      console.error('Error generating package scripts:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Export package scripts
  app.get("/api/packages/:id/export", isAuthenticated, async (req, res) => {
    try {
      const packageId = parseInt(req.params.id);
      
      // Re-fetch package to ensure fresh status (not stale cached data)
      const pkg = await storage.getPackageById(packageId);
      
      const currentUserId = (req.user as any)?.id || (req.user as any)?.claims?.sub;
      if (!pkg || pkg.userId !== currentUserId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      // Fetch all scripts and independently verify completion status
      const scripts = await storage.getPackageScripts(packageId);
      
      // Check for any failed scripts
      const failedScripts = scripts.filter(s => s.status === 'failed');
      if (failedScripts.length > 0) {
        return res.status(400).json({ 
          message: `Cannot export: ${failedScripts.length} script(s) failed to generate. Please review errors and regenerate failed scripts.`,
          failedScripts: failedScripts.map(s => ({
            title: s.conceptTitle,
            error: s.errorMessage || 'Unknown error'
          }))
        });
      }
      
      // Check for scripts still in concept/generating state
      const incompleteScripts = scripts.filter(s => !s.generationId || s.status !== 'completed');
      if (incompleteScripts.length > 0) {
        return res.status(400).json({ 
          message: `Cannot export: ${incompleteScripts.length} script(s) have not been generated yet. Please generate all scripts before exporting.` 
        });
      }
      
      // Final safety check: verify package status matches script reality
      if (pkg.status !== 'completed') {
        return res.status(400).json({ 
          message: `Package status is '${pkg.status}'. Only completed packages can be exported.` 
        });
      }
      
      // Get all generated scripts
      const generatedScripts = await Promise.all(
        scripts
          .filter(s => s.generationId)
          .map(async (script) => {
            const generation = await storage.getGenerationById(script.generationId!);
            return {
              title: script.userModifiedTitle || script.conceptTitle,
              description: script.conceptDescription,
              presentingIssue: script.userModifiedIssue || script.suggestedPresentingIssue,
              desiredOutcome: script.userModifiedOutcome || script.suggestedDesiredOutcome,
              script: generation?.fullScript || '',
            };
          })
      );
      
      // Format as text document
      let exportText = `${pkg.title}\n`;
      exportText += `Theme: ${pkg.theme}\n`;
      exportText += `\n${'='.repeat(80)}\n\n`;
      
      generatedScripts.forEach((script, index) => {
        exportText += `SCRIPT ${index + 1}: ${script.title}\n`;
        exportText += `${'='.repeat(80)}\n\n`;
        exportText += `Presenting Issue: ${script.presentingIssue}\n`;
        exportText += `Desired Outcome: ${script.desiredOutcome}\n\n`;
        exportText += `${script.script}\n\n`;
        exportText += `${'-'.repeat(80)}\n\n`;
      });
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${pkg.title.replace(/[^a-z0-9]/gi, '_')}.txt"`);
      res.send(exportText);
    } catch (error: any) {
      console.error('Error exporting package:', error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
