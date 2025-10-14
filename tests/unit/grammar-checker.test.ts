import { describe, it, expect } from 'vitest';
import { analyzeGrammar } from '../../server/grammar-checker';

describe('Grammar Checker', () => {
  describe('Missing Articles Detection', () => {
    it('should detect missing articles before nouns', () => {
      const text = 'Cat is sleeping. Dog is running. Bird is flying.';
      const result = analyzeGrammar(text);
      
      expect(result.issues.some(issue => issue.type === 'Missing Articles')).toBe(true);
      expect(result.score).toBeLessThan(100);
    });

    it('should pass for correct article usage', () => {
      const text = 'The cat is sleeping. A dog is running. The bird is flying.';
      const result = analyzeGrammar(text);
      
      expect(result.score).toBe(100);
      expect(result.issues).toHaveLength(0);
    });

    it('should apply -35 point deduction for >2 missing articles', () => {
      const text = 'Cat is here. Dog is there. Bird is everywhere.';
      const result = analyzeGrammar(text);
      
      expect(result.score).toBe(65); // 100 - 35
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: 'Missing Articles',
          severity: 'major'
        })
      );
    });

    it('should fail validation when score drops below 70%', () => {
      const text = 'Cat runs. Dog jumps. Bird flies. Mouse hides.';
      const result = analyzeGrammar(text);
      
      expect(result.score).toBeLessThan(70);
    });
  });

  describe('Awkward Constructions Detection', () => {
    it('should detect "seem to be" constructions', () => {
      const text = 'This seems to be working. That seems to be fine.';
      const result = analyzeGrammar(text);
      
      expect(result.issues.some(issue => issue.type === 'Awkward Constructions')).toBe(true);
    });

    it('should detect "kind of" constructions', () => {
      const text = 'It is kind of nice. This is kind of working.';
      const result = analyzeGrammar(text);
      
      expect(result.issues.some(issue => issue.type === 'Awkward Constructions')).toBe(true);
    });

    it('should apply -35 point deduction for >1 awkward construction', () => {
      const text = 'This seems to be good. That seems to be fine.';
      const result = analyzeGrammar(text);
      
      expect(result.score).toBe(65); // 100 - 35
    });
  });

  describe('Generic Plurals Detection', () => {
    it('should detect excessive generic plurals', () => {
      const text = 'You have feelings. You notice sensations. You experience emotions. You feel vibrations.';
      const result = analyzeGrammar(text);
      
      expect(result.issues.some(issue => issue.type === 'Generic Plurals')).toBe(true);
    });

    it('should allow some generic plurals', () => {
      const text = 'You have feelings of peace. The waves bring sensations.';
      const result = analyzeGrammar(text);
      
      // Should pass with only 2 generic plurals
      expect(result.score).toBe(100);
    });

    it('should apply -25 point deduction for >3 generic plurals', () => {
      const text = 'Feelings flow. Sensations arise. Emotions shift. Vibrations resonate.';
      const result = analyzeGrammar(text);
      
      expect(result.score).toBe(75); // 100 - 25
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text', () => {
      const result = analyzeGrammar('');
      expect(result.score).toBe(100);
      expect(result.issues).toHaveLength(0);
    });

    it('should handle single word', () => {
      const result = analyzeGrammar('Hello');
      expect(result.score).toBe(100);
    });

    it('should handle maximum strictness (3 missing articles)', () => {
      const text = 'Cat is here. Dog is there. Bird is flying.';
      const result = analyzeGrammar(text);
      
      expect(result.score).toBe(65); // Exactly at edge case
      expect(result.score).toBeLessThan(70); // Should fail
    });

    it('should stack multiple deductions correctly', () => {
      const text = 'Cat seems to be here. Dog seems to be there. Bird has feelings and sensations and emotions and vibrations.';
      const result = analyzeGrammar(text);
      
      // Should have multiple deductions stacked
      expect(result.score).toBeLessThan(70);
      expect(result.issues.length).toBeGreaterThan(1);
    });
  });

  describe('Production Thresholds', () => {
    it('should enforce 70% minimum score', () => {
      const passingText = 'The cat sleeps peacefully. A dog plays nearby.';
      const failingText = 'Cat runs. Dog jumps. Bird flies.';
      
      expect(analyzeGrammar(passingText).score).toBeGreaterThanOrEqual(70);
      expect(analyzeGrammar(failingText).score).toBeLessThan(70);
    });

    it('should catch robotic language patterns', () => {
      const roboticText = 'Cat is sleeping. Dog is running. Bird is flying. This seems to be working.';
      const result = analyzeGrammar(roboticText);
      
      expect(result.score).toBeLessThan(70);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });
});
