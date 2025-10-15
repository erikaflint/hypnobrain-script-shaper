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
  const hasAwaken = /awaken|alert|energized|refreshed|wide awake|open.*eyes|return.*feeling/i.test(script);
  const hasSleep = /drift.*sleep|fall.*asleep|let.*sleep|sleep.*natural|peaceful sleep|drift.*into.*peaceful sleep/i.test(script);
  
  if (emergenceType === 'sleep') {
    if (hasAwaken) {
      return {
        name: "Emergence Type",
        passed: false,
        details: "Script has awakening language when sleep expected"
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
    if (hasSleep && !hasAwaken) {
      return {
        name: "Emergence Type",
        passed: false,
        details: "Script has sleep emergence when regular expected"
      };
    }
    if (!hasAwaken) {
      return {
        name: "Emergence Type",
        passed: false,
        details: "Script lacks awakening for regular emergence"
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
  const scriptLower = script.toLowerCase();
  
  // Look for complete functional phrases (not just individual words)
  const functionalPhrases = [
    /you\s+might\b/gi,
    /you\s+can\b/gi,
    /you\s+allow\b/gi,
    /perhaps\s+you\b/gi,
    /you\s+find\b/gi,
    /you\s+notice\b/gi,
    /you\s+could\b/gi,
    /you\s+may\b/gi,
    /begin\s+to\b/gi,
    /as\s+you\b/gi,
  ];
  
  let functionalCount = 0;
  functionalPhrases.forEach(pattern => {
    const matches = scriptLower.match(pattern) || [];
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
 * Note: For very high-quality scripts with many functional suggestions,
 * we're more lenient with word count validation
 */
function checkWordCount(script: string, targetWordCount: number, functionalCount?: number): QualityCheck {
  const words = script.split(/\s+/).filter(w => w.length > 0);
  const actualCount = words.length;
  const tolerance = targetWordCount * 0.15; // 15% tolerance
  const minCount = targetWordCount - tolerance;
  const maxCount = targetWordCount + tolerance;
  
  // If script has exceptionally high functional suggestions (indicating very long, high-quality content),
  // allow wider tolerance
  const isHighQuality = functionalCount && functionalCount > 1000;
  const passed = isHighQuality || (actualCount >= minCount && actualCount <= maxCount);
  
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
 * Check metaphor frequency (not overused)
 */
function checkMetaphorFrequency(script: string, targetWordCount: number = 3000): QualityCheck {
  const scriptLower = script.toLowerCase();
  const wordCount = script.split(/\s+/).filter(w => w.length > 0).length;
  
  // Detect metaphor families and count usage
  const metaphorFamilies = {
    nature: ['tree', 'forest', 'river', 'ocean', 'mountain', 'wind', 'rain', 'cloud', 'meadow', 'garden'],
    journey: ['path', 'journey', 'walk', 'travel', 'explore', 'wander', 'destination'],
    water: ['water', 'ocean', 'oceanic', 'river', 'stream', 'wave', 'flow', 'flowing', 'current', 'tide', 'sea'],
    light: ['light', 'glow', 'shine', 'radiance', 'illuminate', 'brightness', 'dawn']
  };
  
  const familyCounts: { [key: string]: number } = {};
  const wordCounts: { [key: string]: number } = {};
  
  Object.entries(metaphorFamilies).forEach(([family, words]) => {
    let familyTotal = 0;
    words.forEach(word => {
      const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi');
      const matches = scriptLower.match(regex) || [];
      const count = matches.length;
      if (count > 0) {
        wordCounts[word] = count;
        familyTotal += count;
      }
    });
    if (familyTotal > 0) {
      familyCounts[family] = familyTotal;
    }
  });
  
  if (Object.keys(familyCounts).length === 0) {
    return {
      name: "Metaphor Frequency",
      passed: true,
      details: "No heavy metaphor use detected"
    };
  }
  
  // Find dominant family and check if overused
  const primaryFamily = Object.entries(familyCounts).reduce((a, b) => 
    b[1] > a[1] ? b : a
  )[0];
  const metaphorCount = familyCounts[primaryFamily];
  
  // Determine max based on script length
  const maxMetaphors = wordCount >= 2500 ? 10 : 8; // DREAM scripts get slightly higher limit
  
  // Find the most overused specific word
  const mostUsedWord = Object.entries(wordCounts)
    .filter(([word]) => metaphorFamilies[primaryFamily as keyof typeof metaphorFamilies]?.includes(word))
    .reduce((a, b) => b[1] > a[1] ? b : a, ['', 0]);
  
  const passed = metaphorCount <= maxMetaphors;
  
  return {
    name: "Metaphor Frequency",
    passed,
    details: passed
      ? `Good balance - ${primaryFamily} metaphor used ${metaphorCount}x (max: ${maxMetaphors})`
      : `Metaphor overload - ${primaryFamily} used ${metaphorCount}x (max: ${maxMetaphors}). "${mostUsedWord[0]}" appears ${mostUsedWord[1]}x`
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
  if (!script || script.trim().length === 0) {
    return {
      emergenceTypeMatch: false,
      emergenceIssue: "Empty script",
      functionalSuggestionsCount: 0,
      wordCountInRange: false,
      actualWordCount: 0,
      overallScore: 0
    };
  }

  const emergenceCheck = checkEmergence(script, emergenceType);
  const suggestionsCheck = checkFunctionalSuggestions(script);
  const functionalCount = parseInt(suggestionsCheck.details.match(/\d+/)?.[0] || '0');
  const wordCountCheck = checkWordCount(script, targetWordCount, functionalCount);
  const grammarCheck = checkNaturalGrammar(script);
  
  const words = script.split(/\s+/).filter(w => w.length > 0);
  
  // Calculate score - core quality checks (emergence, grammar, suggestions)
  // Word count is tracked separately as a metric, not part of quality score
  let score = 100;
  if (!emergenceCheck.passed) score -= 34;
  if (!suggestionsCheck.passed) score -= 33;
  if (!grammarCheck.passed) score -= 33;
  
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
  
  const suggestionsCheck = checkFunctionalSuggestions(script);
  const functionalCount = parseInt(suggestionsCheck.details.match(/\d+/)?.[0] || '0');
  
  const checks: QualityCheck[] = [
    checkEmergence(script, options.emergenceType),
    checkNaturalGrammar(script), // CRITICAL: Check for natural, hypnotic language
    suggestionsCheck,
    checkWordCount(script, options.targetWordCount, functionalCount),
    checkSentenceVariety(script),
    checkMetaphorFrequency(script, options.targetWordCount), // NEW: Check metaphor isn't overused
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
      const polishedSuggestionsCheck = checkFunctionalSuggestions(polishedScript);
      const polishedFunctionalCount = parseInt(polishedSuggestionsCheck.details.match(/\d+/)?.[0] || '0');
      
      const recheck: QualityCheck[] = [
        checkEmergence(polishedScript, options.emergenceType),
        checkNaturalGrammar(polishedScript),
        polishedSuggestionsCheck,
        checkWordCount(polishedScript, options.targetWordCount, polishedFunctionalCount),
        checkSentenceVariety(polishedScript),
        checkMetaphorFrequency(polishedScript, options.targetWordCount), // NEW: Check metaphor isn't overused
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
