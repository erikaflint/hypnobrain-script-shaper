import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./ai-service";
import { paymentService } from "./payment-service";
import { templateManager } from "./template-manager";
import { templateSelector } from "./template-selector";
import { dimensionAssembler } from "./dimension-assembler";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Get all styles
  app.get("/api/styles", async (req, res) => {
    try {
      const styles = await storage.getAllStyles();
      res.json(styles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
  
  // Generate full script with template
  app.post("/api/templates/:templateId/generate", async (req, res) => {
    try {
      const schema = z.object({
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
      
      // Generate full script using template
      const result = await aiService.generateFullScript({
        template: template.jsonData as any, // JSONB returns unknown, safe to cast
        presentingIssue: data.presentingIssue,
        desiredOutcome: data.desiredOutcome,
        clientNotes: data.clientNotes || '',
      });
      
      // Save to database
      const generation = await storage.createGeneration({
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
  
  // Create new user template
  app.post("/api/templates", async (req, res) => {
    try {
      const schema = z.object({
        templateId: z.string(),
        jsonData: z.any(), // TemplateJSON object
        name: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        userId: z.string(),
        isPublic: z.boolean().optional(),
      });
      
      const data = schema.parse(req.body);
      
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
        userId: data.userId,
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

  const httpServer = createServer(app);

  return httpServer;
}
