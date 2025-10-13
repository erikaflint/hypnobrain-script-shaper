/**
 * Content validation utility for user-submitted text
 * Blocks inappropriate content across all endpoints
 */

// Use word boundaries to avoid false positives (e.g., "harm" in "harmless")
const INAPPROPRIATE_PATTERNS = [
  // Sexual/Adult content
  /\bsex\b/i, /\bsexy\b/i, /\bnude\b/i, /\bnaked\b/i, /\bporn\b/i, /\bexplicit\b/i, /\berotic\b/i, /\bxxx\b/i,
  
  // Violence (use word boundaries to avoid "harmless", "charm", etc.)
  /\bviolent\b/i, /\bkill\b/i, /\bmurder\b/i, /\bblood\b/i, /\bgore\b/i, /\btorture\b/i,
  
  // Hate speech
  /\bracist\b/i, /\bdiscrimination\b/i, /\bslur\b/i,
  
  // Drugs
  /\bcocaine\b/i, /\bheroin\b/i, /\bmeth\b/i,
  
  // Self-harm
  /\bsuicide\b/i, /\bself-harm\b/i,
];

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  flaggedWord?: string;
}

/**
 * Validate user-submitted content for inappropriate keywords
 * @param content - The text to validate
 * @param userId - Optional user ID for logging
 * @returns ValidationResult with isValid flag and optional reason
 */
export function validateContent(content: string, userId?: string): ValidationResult {
  if (!content || typeof content !== 'string') {
    return { isValid: true };
  }
  
  for (const pattern of INAPPROPRIATE_PATTERNS) {
    const match = pattern.exec(content);
    if (match) {
      const flaggedWord = match[0];
      
      // Log the violation
      if (userId) {
        console.warn(`🚨 FLAGGED CONTENT from user ${userId}: word "${flaggedWord}" in "${content.substring(0, 100)}..."`);
      } else {
        console.warn(`🚨 FLAGGED CONTENT (no user): word "${flaggedWord}" in "${content.substring(0, 100)}..."`);
      }
      
      return {
        isValid: false,
        reason: 'Inappropriate content detected. Please use respectful, safe language.',
        flaggedWord,
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate multiple content fields at once
 * @param fields - Object with field names and their values
 * @param userId - Optional user ID for logging
 * @returns ValidationResult
 */
export function validateMultipleFields(
  fields: Record<string, string | null | undefined>,
  userId?: string
): ValidationResult {
  for (const [fieldName, value] of Object.entries(fields)) {
    if (value) {
      const result = validateContent(value, userId);
      if (!result.isValid) {
        return {
          ...result,
          reason: `Inappropriate content in ${fieldName}: ${result.reason}`,
        };
      }
    }
  }

  return { isValid: true };
}
