/**
 * Grammar and Naturalness Checker
 * 
 * Detects unnatural phrasing, missing articles, and robotic constructions
 */

export interface GrammarIssue {
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  count: number;
}

export interface GrammarReport {
  score: number; // 0-100, where 100 is perfect
  issues: GrammarIssue[];
  isNatural: boolean;
}

/**
 * Check for missing articles that make text sound robotic
 */
function checkMissingArticles(script: string): GrammarIssue | null {
  const sentences = script.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
  
  // Patterns that indicate missing articles
  const missingArticlePatterns = [
    /\b(notice|feel|hear|see)\s+(breath|chest|weight|body|mind)/gi, // "notice breath" instead of "notice the breath"
    /\b(breath|weight|rain|wind|clouds?)\s+(becomes?|settles?|begins?|flows?)/gi, // "breath becomes" instead of "the breath becomes"
    /\b(bodies|minds|hearts)\s+(know|remember|understand)/gi, // Generic plurals without articles
  ];
  
  let totalMatches = 0;
  missingArticlePatterns.forEach(pattern => {
    const matches = script.match(pattern) || [];
    totalMatches += matches.length;
  });
  
  if (totalMatches > 2) { // Stricter: Even 3 instances make it sound robotic
    return {
      type: "Missing Articles",
      severity: 'high',
      description: `Found ${totalMatches} instances of likely missing articles (the, a, your)`,
      count: totalMatches
    };
  }
  
  return null;
}

/**
 * Check for awkward passive/gerund constructions
 */
function checkAwkwardConstructions(script: string): GrammarIssue | null {
  const awkwardPatterns = [
    /perhaps\s+(sensing|feeling|noticing)\s+emerges?\s+of/gi, // "perhaps sensing emerges of"
    /might\s+occur\b/gi, // "might occur" instead of "might happen" or direct action
    /drifting\s+might\s+occur/gi, // Passive gerund construction
  ];
  
  let totalMatches = 0;
  awkwardPatterns.forEach(pattern => {
    const matches = script.match(pattern) || [];
    totalMatches += matches.length;
  });
  
  if (totalMatches > 1) { // Stricter: Even 2 instances break hypnotic flow
    return {
      type: "Awkward Constructions",
      severity: 'high',
      description: `Found ${totalMatches} awkward passive/gerund constructions`,
      count: totalMatches
    };
  }
  
  return null;
}

/**
 * Check for robotic generic plurals
 */
function checkGenericPlurals(script: string): GrammarIssue | null {
  const genericPluralPattern = /\b(bodies|minds|hearts|eyes)\s+(know|remember|understand|feel|become)/gi;
  const matches = script.match(genericPluralPattern) || [];
  
  if (matches.length > 3) { // Stricter: Even 4 instances sound robotic
    return {
      type: "Generic Plurals",
      severity: 'high', // Upgraded to high severity
      description: `Found ${matches.length} generic plural constructions (bodies/minds know) - should be "your body knows"`,
      count: matches.length
    };
  }
  
  return null;
}

/**
 * Check for natural hypnotic flow
 */
function checkHypnoticFlow(script: string): GrammarIssue | null {
  // Count transition words and phrases that create natural flow
  const transitionPatterns = [
    /\b(and|but|as|while|when|now|then|perhaps|maybe)\b/gi,
    /\b(and\s+(?:as|while|when))\b/gi, // Compound transitions
  ];
  
  const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 10);
  let transitionCount = 0;
  
  transitionPatterns.forEach(pattern => {
    const matches = script.match(pattern) || [];
    transitionCount += matches.length;
  });
  
  const transitionsPerSentence = transitionCount / sentences.length;
  
  // Should have at least 0.3 transitions per sentence for natural flow
  if (transitionsPerSentence < 0.3) {
    return {
      type: "Missing Transitions",
      severity: 'medium',
      description: `Low transition word density (${transitionsPerSentence.toFixed(2)} per sentence) - script may sound choppy`,
      count: Math.round(transitionsPerSentence * 100)
    };
  }
  
  return null;
}

/**
 * Analyze script for grammar and naturalness
 */
export function analyzeGrammar(script: string): GrammarReport {
  const issues: GrammarIssue[] = [];
  
  const missingArticles = checkMissingArticles(script);
  if (missingArticles) issues.push(missingArticles);
  
  const awkwardConstructions = checkAwkwardConstructions(script);
  if (awkwardConstructions) issues.push(awkwardConstructions);
  
  const genericPlurals = checkGenericPlurals(script);
  if (genericPlurals) issues.push(genericPlurals);
  
  const hypnoticFlow = checkHypnoticFlow(script);
  if (hypnoticFlow) issues.push(hypnoticFlow);
  
  // Calculate score based on severity
  let deductions = 0;
  issues.forEach(issue => {
    // Stricter deductions: Missing articles and awkward constructions are critical
    if (issue.type === "Missing Articles" || issue.type === "Awkward Constructions") {
      deductions += 35; // Increased from 25 to ensure 3 instances fail
    } else if (issue.severity === 'high') {
      deductions += 25;
    } else if (issue.severity === 'medium') {
      deductions += 15;
    } else {
      deductions += 5;
    }
  });
  
  const score = Math.max(0, 100 - deductions);
  const isNatural = score >= 70; // Must score 70+ to be considered natural
  
  return {
    score,
    issues,
    isNatural
  };
}
