import Anthropic from '@anthropic-ai/sdk';
import { dimensionAssembler, type AssembledPrompt } from './dimension-assembler';
import { scriptEngine } from './script-engine';
import type { TemplateJSON } from '@shared/schema';

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

// Helper function to strip markdown code blocks from AI responses
function cleanJsonResponse(text: string): string {
  // Remove markdown code block markers (```json, ```, etc.)
  const cleaned = text
    .replace(/^```(?:json)?\s*\n?/gm, '')
    .replace(/\n?```\s*$/gm, '')
    .trim();
  return cleaned;
}

// Template-based generation parameters
export interface TemplateScriptGenerationParams {
  template: TemplateJSON;
  presentingIssue: string;
  desiredOutcome: string;
  clientNotes?: string;
  emergenceType?: 'regular' | 'sleep'; // How to bring them out of trance
  targetWordCount?: number; // Default 1500-2000 for regular, 3000+ for DREAM
}

// Remix generation parameters
export interface RemixScriptGenerationParams {
  template: TemplateJSON;
  existingScript: string;
  presentingIssue: string;
  desiredOutcome: string;
  clientNotes?: string;
}

// Result interfaces
export interface PreviewGenerationResult {
  preview: string;
  estimatedLength: string;
  systemPrompt?: string; // Track the system prompt for testing/debugging
  userPrompt?: string; // Track the user prompt for testing/debugging
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
  systemPrompt?: string; // Track the system prompt for testing/debugging
  userPrompt?: string; // Track the user prompt for testing/debugging
}

// Dimension values for analysis
export interface DimensionValues {
  somatic: number;
  temporal: number;
  symbolic: number;
  psychological: number;
  perspective: number;
  spiritual: number;
  relational: number;
  language: number;
}

export interface RemixAnalysisResult {
  detectedDimensions: DimensionValues;
  analysis: string;
}

export class AIService {
  /**
   * Generate preview using template-based approach + ScriptEngine IP
   */
  async generatePreview(params: TemplateScriptGenerationParams): Promise<PreviewGenerationResult> {
    // Step 1: Get dimension mix from template
    const assembled = dimensionAssembler.assemblePrompt(
      params.template,
      params.presentingIssue,
      params.desiredOutcome,
      params.clientNotes || ''
    );
    
    // Step 2: Get IP-enhanced directives from ScriptEngine
    const engineOutput = await scriptEngine.generate({
      presentingIssue: params.presentingIssue,
      desiredOutcome: params.desiredOutcome,
      clientNotes: params.clientNotes,
      symbolicDimensionLevel: params.template.dimensions.symbolic.level,
      somaticDimensionLevel: params.template.dimensions.somatic.level,
      clientLevel: 'beginner', // Default for preview
      targetTranceDep: 'light'
    });
    
    // Step 3: Combine both into enhanced prompts
    const enhancedSystemPrompt = `${assembled.systemPrompt}

${engineOutput.enhancedSystemPrompt}`;
    
    const previewPrompt = `${assembled.userPrompt}

**STRUCTURED INSTRUCTIONS FROM SCRIPT ENGINE**:
${engineOutput.structuredInstructions.slice(0, 15).join('\n')}

**TASK**: Generate a 150-200 word PREVIEW (NOT a full script) that demonstrates:
1. The opening style and therapeutic approach following the core principles
2. How the dimensional emphasis will be applied
3. The selected narrative arc(s) and metaphor
4. An estimated length for the full script (e.g., "15-20 minutes")

This is a PREVIEW ONLY - do not generate the complete script.

Format as JSON:
{
  "preview": "150-200 word preview text here...",
  "estimatedLength": "15-20 minutes"
}`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 2000,
      system: enhancedSystemPrompt,
      messages: [{ role: 'user', content: previewPrompt }],
    });

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Expected text response from AI');
    }
    const result = JSON.parse(cleanJsonResponse(textContent.text));
    
    // Include prompts for tracking/debugging
    return {
      ...result,
      systemPrompt: enhancedSystemPrompt,
      userPrompt: previewPrompt,
    };
  }

  /**
   * Generate full script using template-based approach + ScriptEngine IP
   */
  async generateFullScript(params: TemplateScriptGenerationParams): Promise<FullScriptGenerationResult> {
    // Step 1: Get dimension mix from template
    const assembled = dimensionAssembler.assemblePrompt(
      params.template,
      params.presentingIssue,
      params.desiredOutcome,
      params.clientNotes || ''
    );
    
    // Step 2: Get IP-enhanced directives from ScriptEngine
    const emergenceType = params.emergenceType || 'regular';
    const targetWordCount = params.targetWordCount || 1750; // Default to mid-range of 1500-2000
    const engineOutput = await scriptEngine.generate({
      presentingIssue: params.presentingIssue,
      desiredOutcome: params.desiredOutcome,
      clientNotes: params.clientNotes,
      symbolicDimensionLevel: params.template.dimensions.symbolic.level,
      somaticDimensionLevel: params.template.dimensions.somatic.level,
      clientLevel: 'intermediate', // Full scripts assume some experience
      targetTranceDep: 'medium',
      emergenceType: emergenceType
    });
    
    // Step 3: Combine both into enhanced prompts
    const enhancedSystemPrompt = `${assembled.systemPrompt}

${engineOutput.enhancedSystemPrompt}

## GENERATION CONTRACT
Selected Narrative Arcs: ${engineOutput.generationContract.selectedArcs.map(a => a.arcName).join(', ')}
Primary Metaphor: ${engineOutput.generationContract.primaryMetaphor?.family || 'None'}

You MUST weave these narrative arcs throughout the script and maintain metaphor consistency.`;
    
    const fullScriptPrompt = `${assembled.userPrompt}

**STRUCTURED INSTRUCTIONS FROM SCRIPT ENGINE**:
${engineOutput.structuredInstructions.join('\n')}

**TASK**: Generate a COMPLETE hypnosis script following ALL the instructions above.

Requirements:
1. FULL SCRIPT (~${targetWordCount} words) with all phases:
   - Induction (guide client into trance) - Use somatic anchoring early (first 100-150 words)
   - Deepening (deepen the trance state) - Apply selected narrative arcs
   - Therapeutic work (address the issue) - Maintain metaphor consistency, use all selected arcs
   - Emergence ${emergenceType === 'sleep' 
     ? '(allow them to drift into sleep) - Keep metaphor flowing, no counting up, let them rest peacefully'
     : '(guide client out of trance safely) - Include ego strengthening closure, count from 1-5 to full alert'}
   
2. Six marketing assets to help promote this therapeutic approach

3. CRITICAL: Follow ALL 6 core principles listed in the structured instructions above.

The script should flow naturally while emphasizing the specified dimensions AND following the IP methodology.

Format as JSON:
{
  "fullScript": "complete ${targetWordCount}-word script here...",
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
      system: enhancedSystemPrompt,
      messages: [{ role: 'user', content: fullScriptPrompt }],
    });

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Expected text response from AI');
    }
    const result = JSON.parse(cleanJsonResponse(textContent.text));
    
    // Include prompts for tracking/debugging
    return {
      ...result,
      systemPrompt: enhancedSystemPrompt,
      userPrompt: fullScriptPrompt,
    };
  }

  /**
   * Generate remix script by applying template to existing script
   */
  async generateRemixScript(params: RemixScriptGenerationParams): Promise<FullScriptGenerationResult> {
    const assembled = dimensionAssembler.assemblePrompt(
      params.template,
      params.presentingIssue,
      params.desiredOutcome,
      params.clientNotes || ''
    );
    
    const remixPrompt = `${assembled.userPrompt}

**TASK**: REMIX MODE - Transform the existing hypnosis script below by applying the new dimensional emphasis.

**EXISTING SCRIPT TO TRANSFORM**:
${params.existingScript}

Requirements:
1. COMPLETE transformed script (1500-2000 words) that:
   - Maintains the core therapeutic intent and issue resolution
   - Applies the NEW dimensional emphasis from the template instructions
   - Includes all phases: induction, deepening, therapeutic work, and emergence
   - Flows naturally with the new dimensional balance
   
2. Six marketing assets for the transformed therapeutic approach

The script should feel like a cohesive whole with the new dimensional emphasis, not a patchwork.

Format as JSON:
{
  "fullScript": "complete 1500-2000 word transformed script here...",
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
      system: assembled.systemPrompt,
      messages: [{ role: 'user', content: remixPrompt }],
    });

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Expected text response from AI');
    }
    const result = JSON.parse(cleanJsonResponse(textContent.text));
    
    // Include prompts for tracking/debugging
    return {
      ...result,
      systemPrompt: assembled.systemPrompt,
      userPrompt: remixPrompt,
    };
  }

  async analyzeScriptDimensions(script: string): Promise<RemixAnalysisResult> {
    const systemPrompt = `You are an expert in analyzing hypnosis scripts using Erika Flint's 8-Dimensional Hypnosis Framework.`;
    
    const userPrompt = `Analyze this hypnosis script and determine the emphasis level (0-100%) for each of the 8 dimensions:

SCRIPT:
${script}

THE 8D HYPNOSIS FRAMEWORK DIMENSIONS (analyze each independently):

1. **Somatic (Body-Based)** - Does the script use the body as an entry point? Look for references to breath, posture, temperature, physical sensations, or bodily shifts.

2. **Temporal (Time-Based)** - Does the script leverage time? Look for regression to past memories, progression to future states, or language that stretches/compresses time.

3. **Symbolic (Metaphor & Archetype)** - Does the script use symbols, metaphors, imagery, or archetypal stories? Look for landscapes, journeys, or symbolic transformations.

4. **Psychological (Inner Architecture)** - Does the script engage cognitive patterns, limiting beliefs, protective parts, or inner conflicts? Look for reframing and mental structure work.

5. **Perspective (Point of View)** - Does the script shift perspective? Look for observer mode, first-person immersion, or future-self viewpoints.

6. **Spiritual (Transpersonal)** - Does the script tap into meaning, purpose, or connection to something greater? Look for higher self, inner wisdom, or transcendent themes.

7. **Relational (Connection & Dialogue)** - Does the script integrate relationships? Look for dialogues, forgiveness work, or experiences of support and belonging.

8. **Language (Linguistic Craft)** - Does the script use hypnotic phrasing deliberately? Look for embedded commands, ambiguity, varied pacing, or presuppositions.

Rate each dimension 0-100% based on how strongly it's emphasized in the script.

Format as JSON:
{
  "detectedDimensions": {
    "somatic": 0-100,
    "temporal": 0-100,
    "symbolic": 0-100,
    "psychological": 0-100,
    "perspective": 0-100,
    "spiritual": 0-100,
    "relational": 0-100,
    "language": 0-100
  },
  "analysis": "Brief explanation of the script's dimensional pattern and overall approach..."
}`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Expected text response from AI');
    }
    const result = JSON.parse(cleanJsonResponse(textContent.text));
    return result;
  }

  /**
   * Generate script package concepts - AI creates themed script ideas
   */
  async generatePackageConcepts(params: {
    theme: string;
    count: number;
    description?: string;
  }): Promise<Array<{
    title: string;
    description: string;
    presentingIssue: string;
    desiredOutcome: string;
  }>> {
    const systemPrompt = `You are an expert hypnotherapist using Erika Flint's 8-Dimensional Hypnosis Framework. 
You specialize in creating themed script collections that work together as a comprehensive package.

Your task: Generate ${params.count} unique, complementary hypnosis script concepts for a package about "${params.theme}".

Each script should:
- Address a specific aspect or angle of the theme
- Have a unique presenting issue and desired outcome
- Complement the other scripts in the package
- Follow evidence-based hypnotherapy principles
- Be practical and immediately usable for therapists

The collection should cover different dimensions of the theme, creating a complete, sellable package.`;

    const userPrompt = `Theme: ${params.theme}
${params.description ? `Additional Context: ${params.description}` : ''}

Generate exactly ${params.count} script concepts that work together as a cohesive package.

Format as JSON array:
[
  {
    "title": "Memorable, specific title",
    "description": "2-3 sentence overview of what this script addresses",
    "presentingIssue": "Specific issue client brings (e.g., 'stress at bedtime')",
    "desiredOutcome": "Specific desired state (e.g., 'fall asleep easily and naturally')"
  },
  ...
]

Make each concept distinct and valuable. Think like a professional creating a sellable product.`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Expected text response from AI');
    }
    
    const result = JSON.parse(cleanJsonResponse(textContent.text));
    return result;
  }
}

export const aiService = new AIService();
