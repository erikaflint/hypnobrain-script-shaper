import Anthropic from '@anthropic-ai/sdk';

/*
<important_code_snippet_instructions>
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
If the user doesn't specify a model, always prefer using "claude-sonnet-4-20250514" as it is the latest model.
</important_code_snippet_instructions>
*/

// <important_do_not_delete>
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";
// </important_do_not_delete>

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface DimensionValues {
  directAuthoritarian: number;
  indirectPermissive: number;
  analyticalRational: number;
  emotionalMetaphorical: number;
  paternalParental: number;
  maternalNurturing: number;
  inwardIntrospective: number;
  outwardSocial: number;
}

export interface ScriptGenerationParams {
  mode: 'create' | 'remix';
  clientName: string;
  clientIssue: string;
  archetypeName: string;
  archetypeDescription: string;
  styleName: string;
  styleDescription: string;
  dimensionValues: DimensionValues;
  existingScript?: string;
}

export interface PreviewGenerationResult {
  preview: string;
  estimatedLength: string;
}

export interface FullScriptGenerationResult {
  fullScript: string;
  marketingAssets: {
    postTitle: string;
    postBody: string;
    emailSubject: string;
    emailBody: string;
    videoScript: string;
    adCopy: string;
  };
}

export interface RemixAnalysisResult {
  detectedDimensions: DimensionValues;
  analysis: string;
}

export class AIService {
  private buildDimensionPrompt(dimensions: DimensionValues): string {
    const dimensionDescriptions = [
      `Direct/Authoritarian: ${dimensions.directAuthoritarian}% - ${dimensions.directAuthoritarian > 50 ? 'Use direct commands and authoritative language' : 'Use gentle suggestions and permissive language'}`,
      `Analytical/Rational: ${dimensions.analyticalRational}% - ${dimensions.analyticalRational > 50 ? 'Use logical, rational language and cognitive reframes' : 'Use emotional, metaphorical language and storytelling'}`,
      `Paternal/Parental: ${dimensions.paternalParental}% - ${dimensions.paternalParental > 50 ? 'Use protective, authoritative parental guidance' : 'Use nurturing, maternal comfort and support'}`,
      `Inward/Introspective: ${dimensions.inwardIntrospective}% - ${dimensions.inwardIntrospective > 50 ? 'Focus on internal reflection and self-discovery' : 'Focus on external relationships and social connections'}`,
    ];
    
    return dimensionDescriptions.join('\n');
  }

  async generatePreview(params: ScriptGenerationParams): Promise<PreviewGenerationResult> {
    const dimensionPrompt = this.buildDimensionPrompt(params.dimensionValues);
    
    const systemPrompt = `You are an expert hypnotherapist trained in Erika Flint's 8-Dimensional Hypnosis Framework. Generate hypnosis script previews based on specific dimensional emphasis, archetypes, and styles.`;
    
    const userPrompt = `Generate a 150-200 word PREVIEW of a hypnosis script with these specifications:

CLIENT CONTEXT:
- Name: ${params.clientName}
- Issue: ${params.clientIssue}

ARCHETYPE: ${params.archetypeName}
${params.archetypeDescription}

STYLE: ${params.styleName}
${params.styleDescription}

DIMENSIONAL EMPHASIS (Erika Flint's 8-Dimensional Framework):
${dimensionPrompt}

${params.mode === 'remix' && params.existingScript ? `
REMIX MODE - Transform this existing script:
${params.existingScript.substring(0, 500)}...

Adjust the dimensional emphasis while maintaining the core therapeutic intent.
` : ''}

Provide:
1. A compelling 150-200 word preview showing the opening and style
2. Estimated full script length (e.g., "15-20 minutes")

Format as JSON:
{
  "preview": "script preview text here...",
  "estimatedLength": "15-20 minutes"
}`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const result = JSON.parse(response.content[0].text);
    return result;
  }

  async generateFullScript(params: ScriptGenerationParams): Promise<FullScriptGenerationResult> {
    const dimensionPrompt = this.buildDimensionPrompt(params.dimensionValues);
    
    const systemPrompt = `You are an expert hypnotherapist trained in Erika Flint's 8-Dimensional Hypnosis Framework. Generate complete, professional hypnosis scripts with marketing assets.`;
    
    const userPrompt = `Generate a COMPLETE hypnosis script (1500-2000 words) with these specifications:

CLIENT CONTEXT:
- Name: ${params.clientName}
- Issue: ${params.clientIssue}

ARCHETYPE: ${params.archetypeName}
${params.archetypeDescription}

STYLE: ${params.styleName}
${params.styleDescription}

DIMENSIONAL EMPHASIS (Erika Flint's 8-Dimensional Framework):
${dimensionPrompt}

${params.mode === 'remix' && params.existingScript ? `
REMIX MODE - Transform this existing script with new dimensional emphasis:
${params.existingScript}
` : ''}

Provide:
1. Complete hypnosis script (1500-2000 words) with induction, deepening, therapeutic work, and emergence
2. Six marketing assets to help promote this therapeutic approach

Format as JSON:
{
  "fullScript": "complete script here...",
  "marketingAssets": {
    "postTitle": "Social media post title",
    "postBody": "Social media post body (2-3 sentences)",
    "emailSubject": "Email subject line",
    "emailBody": "Email body (3-4 paragraphs)",
    "videoScript": "Short video script (30-45 seconds)",
    "adCopy": "Ad copy (2-3 sentences)"
  }
}`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const result = JSON.parse(response.content[0].text);
    return result;
  }

  async analyzeScriptDimensions(script: string): Promise<RemixAnalysisResult> {
    const systemPrompt = `You are an expert in analyzing hypnosis scripts using Erika Flint's 8-Dimensional Hypnosis Framework.`;
    
    const userPrompt = `Analyze this hypnosis script and determine the dimensional emphasis percentages:

SCRIPT:
${script}

FRAMEWORK DIMENSIONS:
1. Direct/Authoritarian (0-100%) vs Indirect/Permissive (100-0%)
2. Analytical/Rational (0-100%) vs Emotional/Metaphorical (100-0%)
3. Paternal/Parental (0-100%) vs Maternal/Nurturing (100-0%)
4. Inward/Introspective (0-100%) vs Outward/Social (100-0%)

Provide dimensional analysis and brief explanation.

Format as JSON:
{
  "detectedDimensions": {
    "directAuthoritarian": 0-100,
    "indirectPermissive": 0-100,
    "analyticalRational": 0-100,
    "emotionalMetaphorical": 0-100,
    "paternalParental": 0-100,
    "maternalNurturing": 0-100,
    "inwardIntrospective": 0-100,
    "outwardSocial": 0-100
  },
  "analysis": "Brief explanation of detected dimensional patterns..."
}`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const result = JSON.parse(response.content[0].text);
    return result;
  }
}

export const aiService = new AIService();
