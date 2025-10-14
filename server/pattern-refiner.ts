/**
 * Pattern Refiner (Stage 3)
 * 
 * Detects and fixes repetitive sentence patterns in DREAM scripts
 * to maintain variety and avoid AI-generated monotony.
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface PatternAnalysis {
  overusedPatterns: {
    pattern: string;
    count: number;
    threshold: number;
    needsRewrite: boolean;
  }[];
  totalSentences: number;
  diversityScore: number; // 0-100
}

interface RefinerResult {
  refinedScript: string;
  analysis: PatternAnalysis;
  changesMessage: string;
}

/**
 * Common repetitive patterns to detect (sentence openers)
 */
const PATTERN_PHRASES = [
  { phrase: "you might", threshold: 8 },
  { phrase: "as you", threshold: 10 },
  { phrase: "perhaps you", threshold: 6 },
  { phrase: "the ", threshold: 15 }, // Generic article opener
  { phrase: "your ", threshold: 12 },
  { phrase: "and you", threshold: 8 },
  { phrase: "notice how", threshold: 6 },
  { phrase: "feel the", threshold: 8 },
  { phrase: "you find", threshold: 6 },
  { phrase: "you can", threshold: 8 },
];

/**
 * Analyze script for repetitive patterns at TRUE sentence boundaries
 */
export function analyzePatterns(script: string): PatternAnalysis {
  // Split on sentence boundaries (period, exclamation, question mark)
  const sentences = script
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10); // Ignore very short fragments
  
  const totalSentences = sentences.length;
  
  // Count how many sentences start with each pattern
  const overusedPatterns = PATTERN_PHRASES.map(({ phrase, threshold }) => {
    let count = 0;
    
    sentences.forEach(sentence => {
      const normalized = sentence.toLowerCase();
      // Check if sentence starts with this phrase (allowing for whitespace)
      if (normalized.startsWith(phrase)) {
        count++;
      }
    });
    
    const needsRewrite = count > threshold;
    
    return {
      pattern: phrase.trim(),
      count,
      threshold,
      needsRewrite
    };
  });

  // Calculate diversity score based on pattern concentration
  const patternsNeedingRewrite = overusedPatterns.filter(p => p.needsRewrite).length;
  
  // Also penalize high concentration of any single pattern
  const maxPatternCount = Math.max(...overusedPatterns.map(p => p.count));
  const concentrationPenalty = maxPatternCount > 15 ? 10 : 0;
  
  const diversityScore = Math.max(0, 100 - (patternsNeedingRewrite * 15) - concentrationPenalty);

  return {
    overusedPatterns,
    totalSentences,
    diversityScore
  };
}

/**
 * Refine script to reduce pattern repetition
 */
export async function refinePatterns(
  script: string,
  analysis: PatternAnalysis
): Promise<RefinerResult> {
  // If diversity is already good, skip refinement
  if (analysis.diversityScore >= 85) {
    return {
      refinedScript: script,
      analysis,
      changesMessage: "Script already has good variety (score: " + analysis.diversityScore + "%). No changes needed."
    };
  }

  const patternsToFix = analysis.overusedPatterns.filter(p => p.needsRewrite);
  
  if (patternsToFix.length === 0) {
    return {
      refinedScript: script,
      analysis,
      changesMessage: "No patterns exceed threshold. No changes needed."
    };
  }

  const systemPrompt = `You are a script refinement specialist. Your ONLY job is to rewrite repetitive sentence patterns while preserving:
- ALL content and meaning
- ALL specific details (names, dates, places)
- The overall flow and structure
- The peaceful, calming tone
- NATURAL HYPNOTIC LANGUAGE with proper grammar and articles (the, a, your)

CRITICAL GRAMMAR RULES:
- Always use articles: "the breath" NOT "breath", "your body" NOT "body", "a gentle feeling" NOT "gentle feeling"
- Avoid robotic constructions: "you might notice" NOT "perhaps noticing emerges", "your body knows" NOT "bodies know"
- Use natural phrasing: "feel the warmth" NOT "feeling of warmth occurs"
- Maintain proper English grammar while varying sentence openers

DO NOT:
- Change the content or ideas
- Add new information
- Remove any details
- Drop articles or create awkward passive constructions
- Alter the script length significantly

You will receive a script with repetitive sentence openers. Rewrite ONLY the overused patterns to create more variety while keeping the language natural and hypnotic.`;

  const userPrompt = `Script to refine:
${script}

Overused patterns detected:
${patternsToFix.map(p => `- "${p.pattern}" used ${p.count} times (threshold: ${p.threshold})`).join('\n')}

Task: Rewrite sentences that start with these patterns to create more variety. Keep the same content, just change how sentences begin.

Examples of variety:
- "You might notice..." → "A gentle awareness may arise..."
- "As you breathe..." → "With each breath..."
- "Perhaps you feel..." → "There's a quality of..."

Return the refined script as JSON:
{
  "refinedScript": "The complete refined script here..."
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textContent = response.content[0];
  if (textContent.type !== 'text') {
    throw new Error('Expected text response from Pattern Refiner');
  }

  let jsonText = textContent.text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
  }

  const result = JSON.parse(jsonText);
  const refinedScript = result.refinedScript;

  // Re-analyze to measure improvement
  const newAnalysis = analyzePatterns(refinedScript);

  const improvementMessage = `Refined ${patternsToFix.length} patterns. Diversity improved: ${analysis.diversityScore}% → ${newAnalysis.diversityScore}%`;

  return {
    refinedScript,
    analysis: newAnalysis,
    changesMessage: improvementMessage
  };
}

/**
 * Main entry point for Pattern Refiner stage
 */
export async function runPatternRefiner(script: string): Promise<RefinerResult> {
  console.log('[PATTERN REFINER] Analyzing patterns...');
  const analysis = analyzePatterns(script);
  
  console.log(`[PATTERN REFINER] Diversity score: ${analysis.diversityScore}%`);
  
  if (analysis.diversityScore >= 85) {
    console.log('[PATTERN REFINER] ✓ Script already has good variety, skipping refinement');
    return {
      refinedScript: script,
      analysis,
      changesMessage: "Script already has good variety. No changes needed."
    };
  }

  console.log('[PATTERN REFINER] Refining patterns...');
  const result = await refinePatterns(script, analysis);
  
  console.log(`[PATTERN REFINER] ✓ ${result.changesMessage}`);
  
  return result;
}
