/**
 * Grammar and Naturalness Checker
 * 
 * Detects unnatural phrasing, missing articles, and robotic constructions
 */

export interface GrammarIssue {
  type: string;
  severity: 'major' | 'high' | 'medium' | 'low';
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
  const sentences = script.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
  let missingCount = 0;
  
  sentences.forEach(sentence => {
    // Check if sentence starts with a noun that needs an article
    // or has a noun after certain words that would need an article
    const startsWithNoun = /^(cat|dog|bird|mouse|breath|chest|weight|body|mind|heart)\s+(is|are|becomes?|settles?|begins?|flows?|runs?|jumps?|flies?|hides?)/i.test(sentence);
    
    // Check for missing articles in middle of sentence (not after a/an/the/your/this/that)
    const middleMissing = /(?<!the\s|a\s|an\s|your\s|this\s|that\s|my\s|his\s|her\s|their\s|our\s)(cat|dog|bird|mouse|breath|chest|weight|body|mind|heart)\s+(is|are|becomes?|settles?|begins?|flows?)/gi;
    
    if (startsWithNoun) {
      missingCount++;
    }
    const middleMatches = sentence.match(middleMissing) || [];
    missingCount += middleMatches.length;
  });
  
  if (missingCount > 2) {
    return {
      type: "Missing Articles",
      severity: 'major',
      description: `Found ${missingCount} instances of likely missing articles (the, a, your)`,
      count: missingCount
    };
  }
  
  return null;
}

/**
 * Check for awkward passive/gerund constructions
 */
function checkAwkwardConstructions(script: string): GrammarIssue | null {
  const awkwardPatterns = [
    /seems?\s+to\s+be/gi, // "seems to be"
    /kind\s+of/gi, // "kind of"
    /sort\s+of/gi, // "sort of"
    /might\s+occur\b/gi, // "might occur"
  ];
  
  let totalMatches = 0;
  awkwardPatterns.forEach(pattern => {
    const matches = script.match(pattern) || [];
    totalMatches += matches.length;
  });
  
  if (totalMatches > 1) {
    return {
      type: "Awkward Constructions",
      severity: 'major',
      description: `Found ${totalMatches} awkward constructions (seems to be, kind of, etc.)`,
      count: totalMatches
    };
  }
  
  return null;
}

/**
 * Check for robotic generic plurals
 */
function checkGenericPlurals(script: string): GrammarIssue | null {
  // Look for bare plurals without articles or possessives
  const genericWords = ['feelings', 'sensations', 'emotions', 'vibrations'];
  let genericCount = 0;
  
  const scriptLower = script.toLowerCase();
  
  genericWords.forEach(word => {
    // Match the word when NOT preceded by articles/possessives
    const pattern = new RegExp(`(?<!the\\s|a\\s|an\\s|your\\s|these\\s|those\\s|some\\s|many\\s|few\\s)\\b${word}\\b`, 'gi');
    const matches = scriptLower.match(pattern) || [];
    genericCount += matches.length;
  });
  
  if (genericCount > 3) {
    return {
      type: "Generic Plurals",
      severity: 'high',
      description: `Found ${genericCount} generic plural constructions - should use articles or possessives`,
      count: genericCount
    };
  }
  
  return null;
}

/**
 * Analyze script for grammar and naturalness
 */
export function analyzeGrammar(script: string): GrammarReport {
  if (!script || script.trim().length === 0) {
    return {
      score: 100,
      issues: [],
      isNatural: true
    };
  }

  const issues: GrammarIssue[] = [];
  
  const missingArticles = checkMissingArticles(script);
  if (missingArticles) issues.push(missingArticles);
  
  const awkwardConstructions = checkAwkwardConstructions(script);
  if (awkwardConstructions) issues.push(awkwardConstructions);
  
  const genericPlurals = checkGenericPlurals(script);
  if (genericPlurals) issues.push(genericPlurals);
  
  // Calculate score based on severity
  let deductions = 0;
  issues.forEach(issue => {
    if (issue.severity === 'major') {
      deductions += 35; // Major issues like missing articles
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
