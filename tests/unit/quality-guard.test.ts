import { describe, it, expect } from 'vitest';
import { validateScriptQuality, type QualityMetrics } from '../../server/quality-guard';

describe('Quality Guard', () => {
  describe('Emergence Type Validation', () => {
    it('should validate sleep emergence type', () => {
      const script = 'And now you can drift into peaceful sleep...';
      const result = validateScriptQuality(script, 'sleep');
      
      expect(result.emergenceTypeMatch).toBe(true);
    });

    it('should validate regular emergence type', () => {
      const script = 'And when you are ready, you can open your eyes and return feeling refreshed...';
      const result = validateScriptQuality(script, 'regular');
      
      expect(result.emergenceTypeMatch).toBe(true);
    });

    it('should detect emergence type mismatch - sleep when regular expected', () => {
      const script = 'And now you can drift into peaceful sleep...';
      const result = validateScriptQuality(script, 'regular');
      
      expect(result.emergenceTypeMatch).toBe(false);
      expect(result.emergenceIssue).toContain('sleep emergence');
    });

    it('should detect emergence type mismatch - regular when sleep expected', () => {
      const script = 'And when you are ready, you can open your eyes...';
      const result = validateScriptQuality(script, 'sleep');
      
      expect(result.emergenceTypeMatch).toBe(false);
      expect(result.emergenceIssue).toContain('awakening');
    });
  });

  describe('Functional Suggestions Validation', () => {
    it('should count functional suggestion patterns correctly', () => {
      const script = `You might notice the waves.
And you can feel the peace.
Perhaps you sense the calm.
You find yourself drifting.
You allow the breath to settle.`;
      
      const result = validateScriptQuality(script, 'regular');
      
      expect(result.functionalSuggestionsCount).toBeGreaterThanOrEqual(5);
    });

    it('should require minimum 15 functional suggestions', () => {
      const shortScript = 'You might notice. You can feel. You sense.';
      const longScript = Array(20).fill('You might notice the waves.').join(' ');
      
      const shortResult = validateScriptQuality(shortScript, 'regular');
      const longResult = validateScriptQuality(longScript, 'regular');
      
      expect(shortResult.functionalSuggestionsCount).toBeLessThan(15);
      expect(longResult.functionalSuggestionsCount).toBeGreaterThanOrEqual(15);
    });

    it('should detect all functional suggestion patterns', () => {
      const script = `
        You might notice the waves (might).
        You can feel the peace (can).
        You allow the breath (allow).
        Perhaps you sense calm (perhaps).
        You find yourself drifting (find).
        And you notice the sounds (notice).
        You could drift deeper (could).
        You may feel relaxed (may).
        You begin to settle (begin to).
        As you breathe slowly (as you).
      `;
      
      const result = validateScriptQuality(script, 'regular');
      
      expect(result.functionalSuggestionsCount).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Word Count Validation', () => {
    it('should validate word count within 15% of target', () => {
      const targetWords = 3000;
      const script3000 = Array(3000).fill('word').join(' ');
      const script2600 = Array(2600).fill('word').join(' '); // ~13% below - should pass
      const script2400 = Array(2400).fill('word').join(' '); // ~20% below - should fail
      
      expect(validateScriptQuality(script3000, 'sleep', targetWords).wordCountInRange).toBe(true);
      expect(validateScriptQuality(script2600, 'sleep', targetWords).wordCountInRange).toBe(true);
      expect(validateScriptQuality(script2400, 'sleep', targetWords).wordCountInRange).toBe(false);
    });

    it('should handle default target of 3000 words', () => {
      const script = Array(3000).fill('word').join(' ');
      const result = validateScriptQuality(script, 'sleep');
      
      expect(result.wordCountInRange).toBe(true);
      expect(result.actualWordCount).toBe(3000);
    });

    it('should calculate percentage correctly', () => {
      const script2500 = Array(2500).fill('word').join(' ');
      const result = validateScriptQuality(script2500, 'sleep', 3000);
      
      // 2500 is ~83% of 3000, which is 17% below (fails)
      expect(result.wordCountInRange).toBe(false);
      expect(result.actualWordCount).toBe(2500);
    });
  });

  describe('Overall Quality Score', () => {
    it('should calculate perfect score for ideal script', () => {
      const idealScript = Array(3000).fill('You might notice the peaceful waves').join('. ') + 
        '. And now you can drift into peaceful sleep...';
      
      const result = validateScriptQuality(idealScript, 'sleep', 3000);
      
      expect(result.overallScore).toBe(100);
      expect(result.emergenceTypeMatch).toBe(true);
      expect(result.wordCountInRange).toBe(true);
      expect(result.functionalSuggestionsCount).toBeGreaterThanOrEqual(15);
    });

    it('should penalize for emergence type mismatch', () => {
      const script = Array(3000).fill('You might notice').join('. ') + 
        '. And when you open your eyes...'; // Wrong emergence
      
      const result = validateScriptQuality(script, 'sleep', 3000);
      
      expect(result.overallScore).toBeLessThan(100);
      expect(result.emergenceTypeMatch).toBe(false);
    });

    it('should penalize for word count out of range', () => {
      const shortScript = Array(2000).fill('word').join(' ') + 
        ' And now you can drift into peaceful sleep...';
      
      const result = validateScriptQuality(shortScript, 'sleep', 3000);
      
      expect(result.overallScore).toBeLessThan(100);
      expect(result.wordCountInRange).toBe(false);
    });

    it('should penalize for insufficient functional suggestions', () => {
      const script = Array(3000).fill('The waves are calm').join('. ') + 
        '. And now drift into sleep...'; // No functional suggestions
      
      const result = validateScriptQuality(script, 'sleep', 3000);
      
      expect(result.overallScore).toBeLessThan(100);
      expect(result.functionalSuggestionsCount).toBeLessThan(15);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty script', () => {
      const result = validateScriptQuality('', 'regular');
      
      expect(result.overallScore).toBe(0);
      expect(result.actualWordCount).toBe(0);
      expect(result.functionalSuggestionsCount).toBe(0);
    });

    it('should handle very short scripts', () => {
      const result = validateScriptQuality('You might notice.', 'regular', 10);
      
      expect(result.actualWordCount).toBe(3);
      expect(result.functionalSuggestionsCount).toBe(1);
    });

    it('should be case-insensitive for patterns', () => {
      const script = 'YOU MIGHT notice. You Might feel. you might sense.';
      const result = validateScriptQuality(script, 'regular');
      
      expect(result.functionalSuggestionsCount).toBeGreaterThanOrEqual(3);
    });

    it('should handle scripts with no emergence markers', () => {
      const script = Array(3000).fill('You might notice').join('. ');
      const result = validateScriptQuality(script, 'sleep', 3000);
      
      // Should fail both emergence types
      expect(result.emergenceTypeMatch).toBe(false);
    });
  });

  describe('Production Thresholds', () => {
    it('should enforce minimum quality standards', () => {
      const passingScript = Array(3000).fill('You might notice the peaceful waves').join('. ') + 
        '. And now you can drift into peaceful sleep...';
      
      const failingScript = 'Short script without proper content.';
      
      const passResult = validateScriptQuality(passingScript, 'sleep', 3000);
      const failResult = validateScriptQuality(failingScript, 'sleep', 3000);
      
      expect(passResult.overallScore).toBeGreaterThanOrEqual(90);
      expect(failResult.overallScore).toBeLessThan(50);
    });

    it('should validate all quality dimensions', () => {
      const script = Array(2900).fill('You might notice the peaceful waves').join('. ') + 
        '. And now you can drift into peaceful sleep...';
      
      const result = validateScriptQuality(script, 'sleep', 3000);
      
      // All dimensions should be checked
      expect(result).toHaveProperty('emergenceTypeMatch');
      expect(result).toHaveProperty('wordCountInRange');
      expect(result).toHaveProperty('functionalSuggestionsCount');
      expect(result).toHaveProperty('overallScore');
    });
  });
});
