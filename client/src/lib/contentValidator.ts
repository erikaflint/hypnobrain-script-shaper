/**
 * Frontend content validation utility
 * First line of defense against inappropriate content
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
}

/**
 * Validate user input for inappropriate content
 * @param content - The text to validate
 * @returns ValidationResult
 */
export function validateContent(content: string): ValidationResult {
  if (!content || typeof content !== 'string') {
    return { isValid: true };
  }

  const lowerContent = content.toLowerCase();
  
  for (const keyword of INAPPROPRIATE_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      return {
        isValid: false,
        reason: 'Inappropriate content detected. Please use respectful, safe language for hypnosis scripts.',
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate multiple fields at once
 * @param fields - Object with field values to validate
 * @returns ValidationResult
 */
export function validateMultipleFields(
  fields: Record<string, string | null | undefined>
): ValidationResult {
  for (const [fieldName, value] of Object.entries(fields)) {
    if (value) {
      const result = validateContent(value);
      if (!result.isValid) {
        return {
          isValid: false,
          reason: `${result.reason} (Issue in: ${fieldName})`,
        };
      }
    }
  }

  return { isValid: true };
}
