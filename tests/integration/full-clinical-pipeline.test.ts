import { describe, it, expect, beforeAll } from 'vitest';
import { AIService } from '../../server/ai-service';

/**
 * Full Clinical Pipeline Integration Test
 * 
 * This test exercises the COMPLETE production pipeline including:
 * - Template assembly
 * - ScriptEngine with EgoModule
 * - AI generation
 * - Pattern Refiner
 * - Quality Guard (including checkEgoStrengtheningDistribution)
 * 
 * This ensures all imports, requires, and module dependencies work correctly.
 * 
 * ⚠️ EXPENSIVE TESTS: These make real AI API calls and take 60-90 seconds each.
 * Run with: npm test -- tests/integration/full-clinical-pipeline.test.ts
 * 
 * These tests WOULD HAVE CAUGHT the require() bug in Quality Guard!
 */

describe.skip('Full Clinical Pipeline Integration (EXPENSIVE - Real AI)', () => {
  let aiService: AIService;

  beforeAll(() => {
    aiService = new AIService();
  });

  const mockTemplate = {
    id: 999,
    name: 'Test Clinical Template',
    dimensions: {
      somatic: { level: 50, descriptor: 'Moderate' },
      symbolic: { level: 50, descriptor: 'Moderate' },
      temporal: { level: 40, descriptor: 'Light' },
      psychological: { level: 60, descriptor: 'Heavy' },
      perspective: { level: 40, descriptor: 'Light' },
      spiritual: { level: 30, descriptor: 'Very Light' },
      relational: { level: 40, descriptor: 'Light' },
      language: { level: 50, descriptor: 'Moderate' }
    },
    generation_rules: {
      opening_style: 'conversational',
      closing_style: 'empowering',
      metaphor_frequency: 'moderate',
      direct_suggestions: true
    },
    prompting_hints: {
      tone: 'warm and professional',
      pacing: 'steady'
    }
  };

  it('should generate clinical script through full pipeline', async () => {
    const result = await aiService.generateFullScript({
      presentingIssue: 'anxiety and stress from work pressure',
      desiredOutcome: 'feel calm, confident, and in control',
      clientNotes: 'prefers gentle approach',
      template: mockTemplate,
      emergenceType: 'regular',
      targetWordCount: 1750
    });

    // Verify result structure
    expect(result).toBeDefined();
    expect(result.fullScript).toBeDefined();
    expect(typeof result.fullScript).toBe('string');
    expect(result.fullScript.length).toBeGreaterThan(100);

    // Verify word count is reasonable
    const wordCount = result.fullScript.split(/\s+/).length;
    expect(wordCount).toBeGreaterThan(500); // Should be substantial
    expect(wordCount).toBeLessThan(3000); // But not too long for test

    // Verify emergence type
    expect(result.emergenceType).toBe('regular');
    
    // Check that it has hypnotic language patterns
    const hasHypnoticLanguage = /perhaps|might|can|allow|notice|feel|sense|find yourself/i.test(result.fullScript);
    expect(hasHypnoticLanguage).toBe(true);

    // Marketing assets should be generated
    expect(result.marketingAssets).toBeDefined();
    expect(result.marketingAssets.postTitle).toBeDefined();
    expect(result.marketingAssets.emailSubject).toBeDefined();
  }, 90000); // 90 second timeout for full pipeline

  it('should generate script with sleep emergence', async () => {
    const result = await aiService.generateFullScript({
      presentingIssue: 'insomnia and restless sleep',
      desiredOutcome: 'deep, restful sleep',
      clientNotes: '',
      template: mockTemplate,
      emergenceType: 'sleep',
      targetWordCount: 1500
    });

    expect(result).toBeDefined();
    expect(result.fullScript).toBeDefined();
    expect(result.emergenceType).toBe('sleep');

    // Should have sleep language, not awakening language
    const hasSleepLanguage = /drift.*sleep|peaceful sleep|fall asleep|rest/i.test(result.fullScript);
    expect(hasSleepLanguage).toBe(true);

    // Should NOT have awakening language
    const hasAwakeningLanguage = /open.*eyes|alert|awaken|energized|count.*1.*2.*3.*4.*5/i.test(result.fullScript);
    expect(hasAwakeningLanguage).toBe(false);
  }, 90000);

  it('should include ego strengthening in clinical scripts', async () => {
    const result = await aiService.generateFullScript({
      presentingIssue: 'low self-confidence and self-doubt',
      desiredOutcome: 'feel confident and capable',
      clientNotes: '',
      template: mockTemplate,
      emergenceType: 'regular',
      targetWordCount: 1600
    });

    expect(result).toBeDefined();
    expect(result.fullScript).toBeDefined();

    // Check for ego strengthening keywords (from ego-config.json)
    const egoKeywords = [
      'confident', 'capable', 'strong', 'resilient', 'calm',
      'peaceful', 'energized', 'focused', 'clear', 'relaxed',
      'restored', 'refreshed', 'balanced', 'centered', 'empowered'
    ];

    const keywordCount = egoKeywords.reduce((count, keyword) => {
      const matches = result.fullScript.match(new RegExp(`\\b${keyword}\\b`, 'gi'));
      return count + (matches ? matches.length : 0);
    }, 0);

    // Should have some ego strengthening (not zero, but not excessive)
    expect(keywordCount).toBeGreaterThan(2);
    expect(keywordCount).toBeLessThan(20); // Not dumped
  }, 90000);

  it('should pass Quality Guard validation', async () => {
    const result = await aiService.generateFullScript({
      presentingIssue: 'chronic worry and overthinking',
      desiredOutcome: 'calm mind and present awareness',
      clientNotes: 'analytical thinker',
      template: mockTemplate,
      emergenceType: 'regular',
      targetWordCount: 1700
    });

    expect(result).toBeDefined();
    
    // Quality Guard should not throw errors
    // (If checkEgoStrengtheningDistribution has require() bug, this test fails)
    expect(result.fullScript).toBeDefined();
    expect(result.fullScript.length).toBeGreaterThan(0);

    // Script should have reasonable structure
    const sentences = result.fullScript.split(/[.!?]+/).filter(s => s.trim().length > 10);
    expect(sentences.length).toBeGreaterThan(15); // Substantial content
  }, 90000);
});
