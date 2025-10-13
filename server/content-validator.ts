/**
 * Content validation utility for user-submitted text
 * Blocks inappropriate content across all endpoints
 */

const INAPPROPRIATE_KEYWORDS = [
  // Sexual/Adult content
  'sex', 'sexy', 'nude', 'naked', 'porn', 'explicit', 'adult', 'erotic', 'xxx',
  
  // Violence
  'violent', 'kill', 'murder', 'blood', 'gore', 'death', 'torture', 'harm',
  
  // Hate speech
  'hate', 'racist', 'discrimination', 'slur',
  
  // Drugs
  'drug', 'cocaine', 'heroin', 'meth', 'weed', 'marijuana',
  
  // Other inappropriate
  'suicide', 'self-harm', 'abuse',
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

  const lowerContent = content.toLowerCase();
  
  for (const keyword of INAPPROPRIATE_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      // Log the violation
      if (userId) {
        console.warn(`🚨 FLAGGED CONTENT from user ${userId}: keyword "${keyword}" in "${content.substring(0, 100)}..."`);
      } else {
        console.warn(`🚨 FLAGGED CONTENT (no user): keyword "${keyword}" in "${content.substring(0, 100)}..."`);
      }
      
      return {
        isValid: false,
        reason: 'Inappropriate content detected. Please use respectful, safe language.',
        flaggedWord: keyword,
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
