/**
 * Script Analyzer
 * Analyzes hypnosis scripts to extract 8D dimensions, narrative patterns, and quality metrics
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ScriptAnalysisResult {
  dimensions: {
    cognitive: number;
    emotional: number;
    somatic: number;
    behavioral: number;
    symbolic: number;
    perspective: number;
    relational: number;
    spiritual: number;
  };
  narrativeArcs: string[];
  qualityMetrics: {
    wordCount: number;
    avgSentenceLength: number;
    hypnoticLanguageScore: number; // 0-100
    metaphorDensity: number; // 0-100
    suggestionsCount: number;
  };
  emergenceType: 'regular' | 'sleep';
  tranceDepth: 'light' | 'medium' | 'deep';
  primaryMetaphor?: string;
  strengths: string[];
  improvements: string[];
}

export async function analyzeScript(
  scriptText: string,
  scriptType: 'clinical' | 'dream'
): Promise<ScriptAnalysisResult> {
  
  const analysisPrompt = scriptType === 'clinical' 
    ? getClinicalAnalysisPrompt(scriptText)
    : getDreamAnalysisPrompt(scriptText);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    temperature: 0.3,
    messages: [{
      role: "user",
      content: analysisPrompt
    }]
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response format from AI');
  }

  try {
    const analysis = JSON.parse(content.text);
    return analysis;
  } catch (error) {
    console.error('Failed to parse analysis response:', content.text);
    throw new Error('Failed to parse analysis results');
  }
}

function getClinicalAnalysisPrompt(scriptText: string): string {
  return `You are an expert hypnotherapist analyzing a clinical hypnosis script based on Erika Flint's 8-Dimensional Hypnosis Framework.

Analyze this script and provide a detailed assessment in JSON format.

SCRIPT TO ANALYZE:
${scriptText}

Analyze the script across these 8 dimensions (rate 0-100%):
1. **Cognitive** (0-100): Reframes, perspective shifts, cognitive restructuring
2. **Emotional** (0-100): Emotional processing, regulation, healing
3. **Somatic** (0-100): Body awareness, sensations, physical relaxation
4. **Behavioral** (0-100): Action steps, behavioral suggestions, habit change
5. **Symbolic** (0-100): Metaphors, imagery, symbolic language
6. **Perspective** (0-100): Dissociation, observer perspective, time shifts
7. **Relational** (0-100): Connection to others, relationships
8. **Spiritual** (0-100): Meaning, purpose, transcendence

Also identify:
- Narrative arcs used (e.g., "Hero's Journey", "Inner Sanctuary", "Time Travel")
- Emergence type (regular vs sleep emergence)
- Trance depth (light, medium, deep)
- Primary metaphor if present
- Quality metrics (word count, hypnotic language patterns, suggestion count)
- Strengths and areas for improvement

Return ONLY valid JSON matching this structure:
{
  "dimensions": {
    "cognitive": number,
    "emotional": number,
    "somatic": number,
    "behavioral": number,
    "symbolic": number,
    "perspective": number,
    "relational": number,
    "spiritual": number
  },
  "narrativeArcs": ["arc1", "arc2"],
  "qualityMetrics": {
    "wordCount": number,
    "avgSentenceLength": number,
    "hypnoticLanguageScore": number,
    "metaphorDensity": number,
    "suggestionsCount": number
  },
  "emergenceType": "regular" | "sleep",
  "tranceDepth": "light" | "medium" | "deep",
  "primaryMetaphor": "description" or null,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}`;
}

function getDreamAnalysisPrompt(scriptText: string): string {
  return `You are an expert in analyzing DREAM Hypnosis scripts - immersive 30-minute sleep/meditation journeys.

Analyze this DREAM script and provide a detailed assessment in JSON format.

SCRIPT TO ANALYZE:
${scriptText}

DREAM scripts are non-clinical bedtime stories for adults with:
- High somatic and symbolic emphasis (sensory immersion)
- Sleep emergence (no formal awakening)
- Journey-based narratives
- Rich metaphorical landscapes

Analyze across 8 dimensions (rate 0-100%):
1. **Cognitive** (0-100): Perspective shifts, reframes (usually lower in DREAM)
2. **Emotional** (0-100): Emotional journey, soothing
3. **Somatic** (0-100): Body sensations, relaxation, sensory details
4. **Behavioral** (0-100): Gentle suggestions (usually lower in DREAM)
5. **Symbolic** (0-100): Metaphors, imagery, symbolic journeys
6. **Perspective** (0-100): POV shifts, dissociation
7. **Relational** (0-100): Connection themes
8. **Spiritual** (0-100): Meaning, transcendence

Also identify:
- Narrative arcs (DREAM-specific like "Cosmic Journey", "Nature Immersion")
- Sensory richness score (0-100)
- Journey coherence (0-100)
- Sleep transition quality (0-100)
- Primary metaphor/setting
- Strengths and improvements

Return ONLY valid JSON matching this structure:
{
  "dimensions": {
    "cognitive": number,
    "emotional": number,
    "somatic": number,
    "behavioral": number,
    "symbolic": number,
    "perspective": number,
    "relational": number,
    "spiritual": number
  },
  "narrativeArcs": ["arc1", "arc2"],
  "qualityMetrics": {
    "wordCount": number,
    "avgSentenceLength": number,
    "hypnoticLanguageScore": number,
    "metaphorDensity": number,
    "suggestionsCount": number
  },
  "emergenceType": "sleep",
  "tranceDepth": "medium" | "deep",
  "primaryMetaphor": "description",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}`;
}
