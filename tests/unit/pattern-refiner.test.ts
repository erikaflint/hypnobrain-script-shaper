import { describe, it, expect } from 'vitest';
import { analyzePatterns } from '../../server/pattern-refiner';

describe('Pattern Refiner', () => {
  describe('Sentence Pattern Detection', () => {
    it('should detect repetitive line-start patterns', () => {
      const script = `You might notice the gentle waves.
You might feel the soft sand.
You might hear the distant sounds.`;
      
      const result = analyzePatterns(script);
      const overused = result.overusedPatterns.filter(p => p.needsRewrite);
      
      expect(overused.length).toBeGreaterThan(0);
      expect(overused[0].pattern).toBe('you might');
    });

    it('should detect mid-paragraph repetition', () => {
      const script = 'As you settle in, you might notice the waves. And as you breathe, you might feel the peace. While resting, you might sense the calm.';
      
      const result = analyzePatterns(script);
      const overused = result.overusedPatterns.filter(p => p.needsRewrite);
      
      expect(overused.length).toBeGreaterThan(0);
    });

    it('should not flag natural variation', () => {
      const script = `Perhaps you notice the gentle rhythm.
The waves create a soothing melody.
And as you settle deeper, a sense of peace emerges.`;
      
      const result = analyzePatterns(script);
      const overused = result.overusedPatterns.filter(p => p.needsRewrite);
      
      expect(overused.length).toBe(0);
    });

    it('should handle sentence boundary splitting correctly', () => {
      const script = 'You might notice the waves. You might feel the sand. You might hear the sounds.';
      
      const result = analyzePatterns(script);
      
      // Should split into 3 sentences and detect pattern
      expect(result.overusedPatterns.some(p => p.count >= 3)).toBe(true);
    });
  });

  describe('Diversity Score Calculation', () => {
    it('should score 100% for highly varied script', () => {
      const script = `Perhaps you notice the gentle rhythm of the waves.
The soft sand cradles your presence.
And as you settle deeper, a sense of peace emerges.
While the ocean whispers its ancient song.`;
      
      const result = analyzePatterns(script);
      expect(result.diversityScore).toBe(100);
    });

    it('should score low for repetitive patterns', () => {
      const script = `You might notice this.
You might notice that.
You might notice everything.
You might notice anything.`;
      
      const result = analyzePatterns(script);
      expect(result.diversityScore).toBeLessThan(85);
    });

    it('should penalize based on repetition count', () => {
      const threeRepeats = `You might notice this. You might feel that. You might sense something.`;
      const fiveRepeats = `You might notice. You might feel. You might sense. You might hear. You might see.`;
      
      const resultThree = analyzePatterns(threeRepeats);
      const resultFive = analyzePatterns(fiveRepeats);
      
      expect(resultFive.diversityScore).toBeLessThan(resultThree.diversityScore);
    });
  });

  describe('Pattern Categories', () => {
    it('should detect "as you" patterns', () => {
      const script = 'As you breathe. As you relax. As you settle. As you drift.';
      
      const result = analyzePatterns(script);
      const asYouPattern = result.overusedPatterns.find(p => p.pattern === 'as you');
      
      expect(asYouPattern).toBeDefined();
      expect(asYouPattern?.count).toBe(4);
    });

    it('should detect "and as" patterns', () => {
      const script = 'And as the waves roll. And as the tide flows. And as the wind blows.';
      
      const result = analyzePatterns(script);
      const andAsPattern = result.overusedPatterns.find(p => p.pattern === 'and as');
      
      expect(andAsPattern).toBeDefined();
    });

    it('should detect "perhaps" patterns', () => {
      const script = 'Perhaps you notice. Perhaps you feel. Perhaps you sense.';
      
      const result = analyzePatterns(script);
      const perhapsPattern = result.overusedPatterns.find(p => p.pattern === 'perhaps');
      
      expect(perhapsPattern).toBeDefined();
    });
  });

  describe('Threshold Logic', () => {
    it('should flag patterns used 3+ times', () => {
      const exactlyThree = `You might notice. You might feel. You might sense.`;
      
      const result = analyzePatterns(exactlyThree);
      const flagged = result.overusedPatterns.filter(p => p.needsRewrite);
      
      expect(flagged.length).toBeGreaterThan(0);
    });

    it('should not flag patterns used only twice', () => {
      const onlyTwo = `You might notice. You might feel. The waves are gentle.`;
      
      const result = analyzePatterns(onlyTwo);
      const youMightPattern = result.overusedPatterns.find(p => p.pattern === 'you might');
      
      expect(youMightPattern?.needsRewrite).toBe(false);
    });

    it('should calculate diversity score at 85% threshold correctly', () => {
      const script = `You might notice. You might feel. You might sense.`;
      
      const result = analyzePatterns(script);
      
      // 3 repetitions should bring score to 85% or below
      expect(result.diversityScore).toBeLessThanOrEqual(85);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text', () => {
      const result = analyzePatterns('');
      expect(result.diversityScore).toBe(100);
      expect(result.overusedPatterns).toHaveLength(0);
    });

    it('should handle single sentence', () => {
      const result = analyzePatterns('You might notice the gentle waves.');
      expect(result.diversityScore).toBe(100);
    });

    it('should handle very long scripts', () => {
      const longScript = Array(100).fill('Perhaps you notice the waves.').join(' ');
      const result = analyzePatterns(longScript);
      
      expect(result.diversityScore).toBe(0); // Maximum penalty
      expect(result.overusedPatterns.length).toBeGreaterThan(0);
    });

    it('should be case-insensitive', () => {
      const script = 'You might notice. YOU MIGHT feel. you might sense.';
      const result = analyzePatterns(script);
      
      const youMightPattern = result.overusedPatterns.find(p => p.pattern === 'you might');
      expect(youMightPattern?.count).toBe(3);
    });
  });

  describe('Production Thresholds', () => {
    it('should enforce 85% minimum diversity', () => {
      const passingScript = `Perhaps you notice the waves.
The sand is soft beneath you.
And as you breathe, peace emerges.`;
      
      const failingScript = `You might notice. You might feel. You might sense.`;
      
      expect(analyzePatterns(passingScript).diversityScore).toBeGreaterThanOrEqual(85);
      expect(analyzePatterns(failingScript).diversityScore).toBeLessThan(85);
    });

    it('should identify patterns needing rewrite', () => {
      const script = `You might notice the waves.
You might feel the peace.
You might sense the calm.
You might hear the sounds.`;
      
      const result = analyzePatterns(script);
      const needsRewrite = result.overusedPatterns.filter(p => p.needsRewrite);
      
      expect(needsRewrite.length).toBeGreaterThan(0);
      expect(needsRewrite[0].count).toBeGreaterThanOrEqual(3);
    });
  });
});
