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
  somatic: number;
  temporal: number;
  symbolic: number;
  psychological: number;
  perspective: number;
  spiritual: number;
  relational: number;
  language: number;
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
      `Somatic (${dimensions.somatic}%): ${dimensions.somatic > 70 ? 'STRONG emphasis - ' : dimensions.somatic > 40 ? 'Moderate emphasis - ' : 'Minimal emphasis - '}Use body as entry point. Include breath, posture, temperature, physical sensations. Guide awareness of bodily shifts to deepen trance.`,
      `Temporal (${dimensions.temporal}%): ${dimensions.temporal > 70 ? 'STRONG emphasis - ' : dimensions.temporal > 40 ? 'Moderate emphasis - ' : 'Minimal emphasis - '}Leverage fluid experience of time. Guide backward to memories or forward to future states. Stretch, compress, or dissolve time.`,
      `Symbolic (${dimensions.symbolic}%): ${dimensions.symbolic > 70 ? 'STRONG emphasis - ' : dimensions.symbolic > 40 ? 'Moderate emphasis - ' : 'Minimal emphasis - '}Use metaphors, imagery, archetypal stories. Transform struggles into landscapes, journeys, or symbolic transformations.`,
      `Psychological (${dimensions.psychological}%): ${dimensions.psychological > 70 ? 'STRONG emphasis - ' : dimensions.psychological > 40 ? 'Moderate emphasis - ' : 'Minimal emphasis - '}Engage deeper mind structures. Address cognitive patterns, limiting beliefs, protective parts, inner conflicts.`,
      `Perspective (${dimensions.perspective}%): ${dimensions.perspective > 70 ? 'STRONG emphasis - ' : dimensions.perspective > 40 ? 'Moderate emphasis - ' : 'Minimal emphasis - '}Shift viewpoint. Use observer mode for insight, first-person for integration, or future-self perspective.`,
      `Spiritual (${dimensions.spiritual}%): ${dimensions.spiritual > 70 ? 'STRONG emphasis - ' : dimensions.spiritual > 40 ? 'Moderate emphasis - ' : 'Minimal emphasis - '}Tap into meaning, purpose, connection to something greater. Invite higher self, inner wisdom, transpersonal strength.`,
      `Relational (${dimensions.relational}%): ${dimensions.relational > 70 ? 'STRONG emphasis - ' : dimensions.relational > 40 ? 'Moderate emphasis - ' : 'Minimal emphasis - '}Integrate relationships. Include dialogues, forgiveness work, experiences of support and belonging.`,
      `Language (${dimensions.language}%): ${dimensions.language > 70 ? 'STRONG emphasis - ' : dimensions.language > 40 ? 'Moderate emphasis - ' : 'Minimal emphasis - '}Use hypnotic phrasing, pacing, rhythm. Embed commands, layer ambiguity, shape sentence flow to bypass resistance.`,
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

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Expected text response from AI');
    }
    const result = JSON.parse(textContent.text);
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

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Expected text response from AI');
    }
    const result = JSON.parse(textContent.text);
    return result;
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
    const result = JSON.parse(textContent.text);
    return result;
  }
}

export const aiService = new AIService();
