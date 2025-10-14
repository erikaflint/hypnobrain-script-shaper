/**
 * Quality Guard (Stage 4)
 * 
 * Validates and polishes DREAM scripts to ensure quality standards
 * before delivery to the user.
 */

import Anthropic from '@anthropic-ai/sdk';
import { analyzeGrammar } from './grammar-checker';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface QualityCheck {
  name: string;
  passed: boolean;
  details: string;
}

interface QualityReport {
  passed: boolean;
  score: number; // 0-100
  checks: QualityCheck[];
  finalScript: string;
  polishMessage?: string;
}

/**
 * Check if emergence type is correct
 */
function checkEmergence(script: string, emergenceType: 'sleep' | 'regular'): QualityCheck {
  const scriptLower = script.toLowerCase();
  const hasAwaken = /awaken|alert|energized|refreshed|wide awake/i.test(script);
  const hasSleep = /drift.*sleep|fall.*asleep|let.*sleep|sleep.*natural/i.test(script);
  
  if (emergenceType === 'sleep') {
    if (hasAwaken) {
      return {
        name: "Emergence Type",
        passed: false,
        details: "Script has 'awaken' language but emergence type is 'sleep'"
      };
    }
    if (!hasSleep) {
      return {
        name: "Emergence Type", 
        passed: false,
        details: "Script lacks sleep transition language for sleep emergence"
      };
    }
  } else {
    if (!hasAwaken) {
      return {
        name: "Emergence Type",
        passed: false,
        details: "Script lacks awakening language for regular emergence"
      };
    }
  }
  
  return {
    name: "Emergence Type",
    passed: true,
    details: `Correct ${emergenceType} emergence language found`
  };
}

/**
 * Check for functional suggestions (therapeutic elements)
 */
function checkFunctionalSuggestions(script: string): QualityCheck {
  // Look for therapeutic patterns that create change
  const functionalPatterns = [
    /your body (knows|remembers|can|will)/gi,
    /naturally (begin|start|find|discover)/gi,
    /(allow|let|permit) yourself/gi,
    /might (notice|feel|find|discover)/gi,
    /as if/gi, // metaphorical suggestions
    /like a/gi,  // simile suggestions
  ];
  
  let functionalCount = 0;
  functionalPatterns.forEach(pattern => {
    const matches = script.match(pattern) || [];
    functionalCount += matches.length;
  });
  
  const passed = functionalCount >= 15; // At least 15 functional suggestions
  
  return {
    name: "Functional Suggestions",
    passed,
    details: passed 
      ? `Found ${functionalCount} functional/therapeutic suggestions`
      : `Only ${functionalCount} functional suggestions (minimum: 15)`
  };
}

/**
 * Check word count is within target range
 */
function checkWordCount(script: string, targetWordCount: number): QualityCheck {
  const words = script.split(/\s+/).filter(w => w.length > 0);
  const actualCount = words.length;
  const tolerance = targetWordCount * 0.15; // 15% tolerance
  const minCount = targetWordCount - tolerance;
  const maxCount = targetWordCount + tolerance;
  
  const passed = actualCount >= minCount && actualCount <= maxCount;
  
  return {
    name: "Word Count",
    passed,
    details: passed
      ? `${actualCount} words (target: ${targetWordCount} ±15%)`
      : `${actualCount} words - outside target range ${Math.round(minCount)}-${Math.round(maxCount)}`
  };
}

/**
 * Check natural grammar and hypnotic flow
 */
function checkNaturalGrammar(script: string): QualityCheck {
  const grammarReport = analyzeGrammar(script);
  
  return {
    name: "Natural Grammar",
    passed: grammarReport.isNatural,
    details: grammarReport.isNatural
      ? `Natural hypnotic language (score: ${grammarReport.score}%)`
      : `Unnatural/robotic language (score: ${grammarReport.score}%) - ${grammarReport.issues.map(i => i.type).join(', ')}`
  };
}

/**
 * Check sentence variety (no excessive repetition of openers)
 */
function checkSentenceVariety(script: string): QualityCheck {
  // Split on sentence boundaries
  const sentences = script
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);
  
  if (sentences.length === 0) {
    return {
      name: "Sentence Variety",
      passed: false,
      details: "No sentences found to analyze"
    };
  }
  
  // Extract first 2-3 words of each sentence
  const openers = sentences.map(s => {
    const words = s.toLowerCase().split(/\s+/).slice(0, 3);
    return words.join(' ');
  });
  
  // Count frequency of each opener
  const openerCounts: { [key: string]: number } = {};
  openers.forEach(opener => {
    openerCounts[opener] = (openerCounts[opener] || 0) + 1;
  });
  
  // Find most common opener
  const entries = Object.entries(openerCounts);
  const maxEntry = entries.reduce((max, entry) => 
    entry[1] > max[1] ? entry : max
  );
  
  const [mostCommonOpener, maxCount] = maxEntry;
  const percentage = (maxCount / sentences.length) * 100;
  
  // Fail if any opener is used more than 12% of the time
  const passed = percentage <= 12;
  
  return {
    name: "Sentence Variety",
    passed,
    details: passed
      ? `Good variety - most common opener "${mostCommonOpener}" used ${maxCount}x (${Math.round(percentage)}%)`
      : `Too repetitive - "${mostCommonOpener}" used ${maxCount}x (${Math.round(percentage)}% of sentences, limit: 12%)`
  };
}

/**
 * Check metaphor consistency (same metaphor family)
 */
function checkMetaphorConsistency(script: string): QualityCheck {
  const scriptLower = script.toLowerCase();
  
  // Detect primary metaphor families
  const metaphorFamilies = {
    nature: ['tree', 'forest', 'river', 'ocean', 'mountain', 'wind', 'rain', 'cloud', 'meadow', 'garden'],
    journey: ['path', 'journey', 'walk', 'travel', 'explore', 'wander', 'destination'],
    water: ['water', 'ocean', 'river', 'stream', 'wave', 'flow', 'current', 'tide'],
    light: ['light', 'glow', 'shine', 'radiance', 'illuminate', 'brightness', 'dawn']
  };
  
  const familyCounts: { [key: string]: number } = {};
  
  Object.entries(metaphorFamilies).forEach(([family, words]) => {
    let count = 0;
    words.forEach(word => {
      const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi');
      const matches = scriptLower.match(regex) || [];
      count += matches.length;
    });
    if (count > 0) {
      familyCounts[family] = count;
    }
  });
  
  const families = Object.keys(familyCounts);
  
  if (families.length === 0) {
    return {
      name: "Metaphor Consistency",
      passed: true,
      details: "No strong metaphor families detected (abstract script)"
    };
  }
  
  // Check if one family dominates (good) or if it's scattered (bad)
  const total = Object.values(familyCounts).reduce((a, b) => a + b, 0);
  const primaryFamily = families.reduce((a, b) => 
    familyCounts[a] > familyCounts[b] ? a : b
  );
  const primaryPercentage = (familyCounts[primaryFamily] / total) * 100;
  
  const passed = primaryPercentage >= 60 || families.length <= 2;
  
  return {
    name: "Metaphor Consistency",
    passed,
    details: passed
      ? `Primary metaphor: ${primaryFamily} (${Math.round(primaryPercentage)}%)`
      : `Scattered metaphors: ${families.join(', ')} - lacks consistency`
  };
}

/**
 * Micro-polish script for final refinement
 */
async function microPolish(script: string, failedChecks: QualityCheck[]): Promise<string> {
  if (failedChecks.length === 0) {
    return script; // Already perfect
  }

  const systemPrompt = `You are a hypnosis script polisher. Make minimal, surgical edits to fix specific issues while preserving everything else.

Your ONLY job: Fix the listed problems without changing anything else.`;

  const userPrompt = `Script to polish:
${script}

Issues to fix:
${failedChecks.map(c => `- ${c.name}: ${c.details}`).join('\n')}

Make MINIMAL changes to fix only these issues. Preserve all content, structure, and flow.

Return as JSON:
{
  "polishedScript": "The script with minimal fixes..."
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textContent = response.content[0];
  if (textContent.type !== 'text') {
    throw new Error('Expected text response from micro-polish');
  }

  let jsonText = textContent.text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
  }

  const result = JSON.parse(jsonText);
  return result.polishedScript;
}

/**
 * Quality validation metrics (exported for testing)
 */
export interface QualityMetrics {
  emergenceTypeMatch: boolean;
  emergenceIssue?: string;
  functionalSuggestionsCount: number;
  wordCountInRange: boolean;
  actualWordCount: number;
  overallScore: number;
}

/**
 * Validate script quality without AI polish (for testing)
 */
export function validateScriptQuality(
  script: string,
  emergenceType: 'sleep' | 'regular',
  targetWordCount: number = 3000
): QualityMetrics {
  const emergenceCheck = checkEmergence(script, emergenceType);
  const suggestionsCheck = checkFunctionalSuggestions(script);
  const wordCountCheck = checkWordCount(script, targetWordCount);
  
  const words = script.split(/\s+/).filter(w => w.length > 0);
  
  // Calculate score
  let score = 100;
  if (!emergenceCheck.passed) score -= 40;
  if (!suggestionsCheck.passed) score -= 30;
  if (!wordCountCheck.passed) score -= 30;
  
  return {
    emergenceTypeMatch: emergenceCheck.passed,
    emergenceIssue: emergenceCheck.passed ? undefined : emergenceCheck.details,
    functionalSuggestionsCount: parseInt(suggestionsCheck.details.match(/\d+/)?.[0] || '0'),
    wordCountInRange: wordCountCheck.passed,
    actualWordCount: words.length,
    overallScore: Math.max(0, score)
  };
}

/**
 * Main Quality Guard entry point
 */
export async function runQualityGuard(
  script: string,
  options: {
    emergenceType: 'sleep' | 'regular';
    targetWordCount: number;
    allowRetry?: boolean;
  }
): Promise<QualityReport> {
  console.log('[QUALITY GUARD] Running quality checks...');
  
  const checks: QualityCheck[] = [
    checkEmergence(script, options.emergenceType),
    checkNaturalGrammar(script), // CRITICAL: Check for natural, hypnotic language
    checkFunctionalSuggestions(script),
    checkWordCount(script, options.targetWordCount),
    checkSentenceVariety(script),
    checkMetaphorConsistency(script)
  ];
  
  const failedChecks = checks.filter(c => !c.passed);
  const passedCount = checks.filter(c => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);
  
  console.log(`[QUALITY GUARD] Score: ${score}% (${passedCount}/${checks.length} checks passed)`);
  
  checks.forEach(check => {
    const icon = check.passed ? '✓' : '✗';
    console.log(`[QUALITY GUARD]   ${icon} ${check.name}: ${check.details}`);
  });
  
  // If all checks pass, return as-is
  if (failedChecks.length === 0) {
    console.log('[QUALITY GUARD] ✓ All checks passed!');
    return {
      passed: true,
      score: 100,
      checks,
      finalScript: script
    };
  }
  
  // Try micro-polish to fix issues
  if (options.allowRetry !== false) {
    console.log(`[QUALITY GUARD] Attempting micro-polish to fix ${failedChecks.length} issues...`);
    try {
      const polishedScript = await microPolish(script, failedChecks);
      
      // Re-check polished version
      const recheck: QualityCheck[] = [
        checkEmergence(polishedScript, options.emergenceType),
        checkNaturalGrammar(polishedScript),
        checkFunctionalSuggestions(polishedScript),
        checkWordCount(polishedScript, options.targetWordCount),
        checkSentenceVariety(polishedScript),
        checkMetaphorConsistency(polishedScript)
      ];
      
      const newFailedChecks = recheck.filter(c => !c.passed);
      const newPassedCount = recheck.filter(c => c.passed).length;
      const newScore = Math.round((newPassedCount / recheck.length) * 100);
      
      const improvement = newScore - score;
      console.log(`[QUALITY GUARD] ✓ Micro-polish complete. Score: ${score}% → ${newScore}% (+${improvement}%)`);
      
      return {
        passed: newFailedChecks.length === 0,
        score: newScore,
        checks: recheck,
        finalScript: polishedScript,
        polishMessage: `Quality improved: ${score}% → ${newScore}%`
      };
    } catch (error: any) {
      console.error(`[QUALITY GUARD] ✗ Micro-polish failed: ${error.message}`);
    }
  }
  
  // Return original with quality report
  return {
    passed: false,
    score,
    checks,
    finalScript: script
  };
}
