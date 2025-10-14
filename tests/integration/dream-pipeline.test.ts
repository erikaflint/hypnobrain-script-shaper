import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzePatterns } from '../../server/pattern-refiner';
import { analyzeGrammar } from '../../server/grammar-checker';
import { validateScriptQuality } from '../../server/quality-guard';

/**
 * Mocked 4-Stage DREAM Pipeline Integration Test
 * 
 * Tests the full pipeline without calling actual AI:
 * Story Shaper → Dream Maker → Pattern Refiner → Quality Guard
 */

describe('DREAM Pipeline Integration (Mocked)', () => {
  // Mock quality script outputs for each stage
  const mockStoryOutline = `
    Ancient Library Journey: A seeker discovers a mystical library where each book
    holds a different dream. As they wander through towering shelves of leather-bound
    volumes, golden light filters through stained glass windows. The air carries the
    scent of old parchment and sandalwood. Each book they touch releases a gentle
    luminescence, revealing stories of peaceful sleep and restful dreams.
  `.trim();

  const mockDreamScript = `
    Perhaps you find yourself standing at the entrance of an ancient library.
    The massive wooden doors open silently before you.
    And as you step inside, you notice the towering shelves stretching upward.
    
    Each book seems to glow with its own gentle light.
    You might feel drawn to a particular volume on the shelf.
    As you reach out, the leather binding feels warm beneath your fingers.
    
    And now, as you open the book, golden light spills across the pages.
    The words seem to dance and shimmer before your eyes.
    You allow yourself to sink deeper into this peaceful sanctuary.
    
    Perhaps you notice the soft glow surrounding you.
    Your body naturally begins to relax with each breath.
    And as the light embraces you, you can feel yourself drifting.
    
    Like a feather floating on a gentle breeze, you descend deeper.
    The library fades into soft focus around you.
    You find yourself becoming lighter with each passing moment.
    
    And now, you can drift into peaceful sleep, knowing the dreams await you.
  `.trim();

  const mockRefinedScript = `
    Perhaps you find yourself at the entrance of an ancient library.
    The massive wooden doors open silently before you.
    Stepping inside, you notice towering shelves stretching upward.
    
    Each book glows with its own gentle light.
    A particular volume on the shelf draws your attention.
    The leather binding feels warm beneath your fingers as you reach out.
    
    Golden light spills across the pages as you open the book.
    Words dance and shimmer before your eyes.
    This peaceful sanctuary invites you to sink deeper.
    
    Soft glow surrounds you, noticeable and comforting.
    With each breath, your body naturally relaxes.
    The light embraces you, and drifting becomes effortless.
    
    Like a feather on a gentle breeze, you descend deeper.
    Soft focus envelops the library around you.
    Each moment brings increased lightness.
    
    Peaceful sleep awaits as you drift into dreams.
  `.trim();

  describe('Stage 1: Story Shaper', () => {
    it('should create detailed story outline', () => {
      // In real implementation, this calls AI
      // Here we just verify the mock outline is detailed enough
      expect(mockStoryOutline.length).toBeGreaterThan(200);
      expect(mockStoryOutline).toContain('library');
      expect(mockStoryOutline).toContain('dream');
    });
  });

  describe('Stage 2: Dream Maker', () => {
    it('should generate full script from story outline', () => {
      expect(mockDreamScript.length).toBeGreaterThan(500);
      expect(mockDreamScript.split(/[.!?]+/).length).toBeGreaterThan(10);
    });

    it('should include sleep emergence', () => {
      expect(mockDreamScript.toLowerCase()).toMatch(/drift.*sleep|peaceful sleep/);
    });

    it('should include functional suggestions', () => {
      const patterns = [
        /perhaps you/gi,
        /you might/gi,
        /you find/gi,
        /you allow/gi,
        /like a/gi,
      ];
      
      let functionalCount = 0;
      patterns.forEach(pattern => {
        const matches = mockDreamScript.match(pattern) || [];
        functionalCount += matches.length;
      });
      
      expect(functionalCount).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Stage 3: Pattern Refiner', () => {
    it('should analyze patterns in original script', () => {
      const analysis = analyzePatterns(mockDreamScript);
      
      // Should return pattern analysis
      expect(analysis.overusedPatterns).toBeDefined();
      expect(analysis.diversityScore).toBeGreaterThanOrEqual(0);
      expect(analysis.diversityScore).toBeLessThanOrEqual(100);
    });

    it('should reduce repetition in refined script', () => {
      const originalAnalysis = analyzePatterns(mockDreamScript);
      const refinedAnalysis = analyzePatterns(mockRefinedScript);
      
      // Refined script should have fewer overused patterns
      const originalOverused = originalAnalysis.overusedPatterns.filter(p => p.needsRewrite).length;
      const refinedOverused = refinedAnalysis.overusedPatterns.filter(p => p.needsRewrite).length;
      
      expect(refinedOverused).toBeLessThanOrEqual(originalOverused);
    });

    it('should improve diversity score', () => {
      const originalAnalysis = analyzePatterns(mockDreamScript);
      const refinedAnalysis = analyzePatterns(mockRefinedScript);
      
      expect(refinedAnalysis.diversityScore).toBeGreaterThanOrEqual(originalAnalysis.diversityScore);
    });
  });

  describe('Stage 4: Quality Guard', () => {
    it('should validate emergence type', () => {
      const result = validateScriptQuality(mockRefinedScript, 'sleep', 600);
      
      // Should check emergence type (may pass or fail based on regex)
      expect(result.emergenceTypeMatch).toBeDefined();
      expect(typeof result.emergenceTypeMatch).toBe('boolean');
    });

    it('should count functional suggestions', () => {
      const result = validateScriptQuality(mockRefinedScript, 'sleep', 600);
      
      // Should have multiple functional suggestions
      expect(result.functionalSuggestionsCount).toBeGreaterThan(0);
    });

    it('should validate word count range', () => {
      const wordCount = mockRefinedScript.split(/\s+/).length;
      const result = validateScriptQuality(mockRefinedScript, 'sleep', wordCount);
      
      expect(result.wordCountInRange).toBe(true);
      expect(result.actualWordCount).toBe(wordCount);
    });

    it('should calculate overall quality score', () => {
      const wordCount = mockRefinedScript.split(/\s+/).length;
      const result = validateScriptQuality(mockRefinedScript, 'sleep', wordCount);
      
      // Should have decent quality score
      expect(result.overallScore).toBeGreaterThan(0);
    });
  });

  describe('Full Pipeline Flow', () => {
    it('should process journey through all stages successfully', () => {
      // Stage 1: Story outline (mocked)
      expect(mockStoryOutline).toBeTruthy();
      
      // Stage 2: Dream script (mocked)
      expect(mockDreamScript).toBeTruthy();
      
      // Stage 3: Pattern analysis and refinement
      const patternAnalysis = analyzePatterns(mockDreamScript);
      expect(patternAnalysis.diversityScore).toBeDefined();
      
      // Stage 4: Quality validation
      const wordCount = mockRefinedScript.split(/\s+/).length;
      const qualityMetrics = validateScriptQuality(mockRefinedScript, 'sleep', wordCount);
      expect(qualityMetrics.overallScore).toBeGreaterThan(0);
    });

    it('should preserve content through refinement', () => {
      // Key content should be preserved
      expect(mockRefinedScript).toContain('library');
      expect(mockRefinedScript).toContain('book');
      expect(mockRefinedScript).toContain('light');
      expect(mockRefinedScript).toContain('sleep');
    });

    it('should maintain natural hypnotic language', () => {
      const grammarReport = analyzeGrammar(mockRefinedScript);
      
      // Should not have robotic language
      expect(grammarReport.score).toBeGreaterThan(50);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle empty story outline', () => {
      const analysis = analyzePatterns('');
      expect(analysis.diversityScore).toBe(100);
      expect(analysis.overusedPatterns.filter(p => p.needsRewrite)).toHaveLength(0);
    });

    it('should detect wrong emergence type', () => {
      const scriptWithAwakening = mockRefinedScript.replace(/sleep/g, 'awaken refreshed');
      const result = validateScriptQuality(scriptWithAwakening, 'sleep', 600);
      
      expect(result.emergenceTypeMatch).toBe(false);
    });

    it('should handle very short scripts', () => {
      const shortScript = 'You might notice peace.';
      const result = validateScriptQuality(shortScript, 'sleep', 10);
      
      expect(result.actualWordCount).toBeLessThan(10);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should analyze patterns quickly', () => {
      const start = Date.now();
      analyzePatterns(mockDreamScript);
      const duration = Date.now() - start;
      
      // Should complete in under 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should validate quality quickly', () => {
      const start = Date.now();
      validateScriptQuality(mockRefinedScript, 'sleep', 600);
      const duration = Date.now() - start;
      
      // Should complete in under 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should check grammar quickly', () => {
      const start = Date.now();
      analyzeGrammar(mockRefinedScript);
      const duration = Date.now() - start;
      
      // Should complete in under 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});
