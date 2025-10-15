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
 * Common repetitive patterns to detect
 */
const PATTERN_PHRASES = [
  { phrase: "you might", threshold: 5 },  // Increased - "you" is essential for hypnosis
  { phrase: "as you", threshold: 5 },     // Increased - personal connection is key
  { phrase: "perhaps you", threshold: 4 },
  { phrase: "perhaps", threshold: 3 },
  { phrase: "and as", threshold: 3 },
  { phrase: "the ", threshold: 10 },
  // REMOVED "your" - it's essential for personal connection in hypnosis!
  { phrase: "and you", threshold: 5 },    // Increased - "you" keeps client engaged
  { phrase: "notice how", threshold: 3 },
  { phrase: "feel the", threshold: 4 },   // Slightly increased
  { phrase: "you find", threshold: 3 },
  { phrase: "you can", threshold: 3 },
];

/**
 * Analyze script for repetitive patterns - checks both sentence starts AND mid-paragraph
 */
export function analyzePatterns(script: string): PatternAnalysis {
  if (!script || script.trim().length === 0) {
    return {
      overusedPatterns: [],
      totalSentences: 0,
      diversityScore: 100
    };
  }

  // Split on sentence boundaries (period, exclamation, question mark)
  const sentences = script
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10); // Ignore very short fragments
  
  const totalSentences = sentences.length;
  
  if (totalSentences === 0) {
    return {
      overusedPatterns: [],
      totalSentences: 0,
      diversityScore: 100
    };
  }

  const scriptLower = script.toLowerCase();
  
  // Count patterns throughout the entire script (not just sentence starts)
  const overusedPatterns = PATTERN_PHRASES.map(({ phrase, threshold }) => {
    const regex = new RegExp(`\\b${phrase.trim()}\\b`, 'gi');
    const matches = scriptLower.match(regex) || [];
    const count = matches.length;
    const needsRewrite = count >= threshold;
    
    return {
      pattern: phrase.trim(),
      count,
      threshold,
      needsRewrite
    };
  }).filter(p => p.count > 0); // Only include patterns that appear at least once

  // Calculate diversity score based on pattern overuse
  const patternsNeedingRewrite = overusedPatterns.filter(p => p.needsRewrite);
  
  if (patternsNeedingRewrite.length === 0) {
    return {
      overusedPatterns,
      totalSentences,
      diversityScore: 100
    };
  }

  // Each overused pattern reduces diversity by 16 points (ensures <85 with 1 pattern)
  // Also add extra penalty for extremely repetitive scripts and higher counts
  const maxCount = Math.max(...overusedPatterns.map(p => p.count));
  const extremePenalty = maxCount > 50 ? Math.min(50, Math.floor(maxCount / 2)) : 0;
  
  // Additional penalty based on total repetition count - more repeats = lower score
  // Even small increases in repetition should be penalized
  const totalRepeats = patternsNeedingRewrite.reduce((sum, p) => sum + p.count, 0);
  const countPenalty = totalRepeats > 3 ? Math.min(20, (totalRepeats - 3) * 2) : 0;
  
  const diversityScore = Math.max(0, 100 - (patternsNeedingRewrite.length * 16) - extremePenalty - countPenalty);

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

CRITICAL HYPNOTIC LANGUAGE RULES:
- ALWAYS KEEP "YOU" and "YOUR" - These are ESSENTIAL for personal connection, NOT repetition!
- "You" and "your" keep the client engaged with themselves - this is hypnotic, not redundant
- Use articles: "the breath" NOT "breath", "your body" NOT "body", "a gentle feeling" NOT "gentle feeling"  
- Avoid robotic constructions: "you might notice" is fine, just vary it to "you may notice", "you can feel", "you discover"
- NEVER use impersonal commands: "Take a breath" → "You take a breath", "Let eyes close" → "Your eyes close"
- Maintain personal pronouns while varying the REST of the sentence

DO NOT:
- Remove "you" or "your" - these maintain personal connection
- Use command forms ("Take", "Feel", "Notice") - always include "you" or "your"
- Change the content or ideas
- Add new information
- Remove any details
- Alter the script length significantly

You will receive a script with repetitive sentence openers. Vary the sentence structures while KEEPING all "you" and "your" pronouns intact.`;

  const userPrompt = `Script to refine:
${script}

Overused patterns detected:
${patternsToFix.map(p => `- "${p.pattern}" used ${p.count} times (threshold: ${p.threshold})`).join('\n')}

Task: Rewrite sentences that start with these patterns to create more variety. KEEP "you" and "your" - just vary the REST of the sentence structure.

Examples of GOOD variety (keeping personal pronouns):
- "You might notice..." → "You may discover..." or "You can sense..." or "You begin to feel..."
- "As you breathe..." → "With each breath you take..." or "You breathe and notice..." or "Your breathing deepens..."
- "Perhaps you feel..." → "You may feel..." or "You might sense..." or "You discover a feeling..."
- "Take a breath" → "You take a breath" or "Your breath deepens"
- "Let your eyes close" → "Your eyes close" or "You let your eyes close"
- "Feel the warmth" → "You feel the warmth" or "Your body feels the warmth"

Examples of BAD variety (removing personal connection):
❌ "A gentle awareness may arise..." (loses "you")
❌ "With each breath..." (loses "you")  
❌ "There's a quality of..." (loses "you")

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
