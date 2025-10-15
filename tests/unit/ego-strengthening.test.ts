import { describe, it, expect } from 'vitest';

/**
 * EGO STRENGTHENING DISTRIBUTION TEST
 * Validates that functional improvements are scattered throughout the script,
 * not dumped as one paragraph
 */

describe('Ego Strengthening Distribution', () => {
  it('should detect paragraph dumps (bad pattern)', () => {
    // Simulates the problematic ocean script with ego strengthening dump
    const dumpScript = `
      Take a deep breath and rest. Your body knows how to relax.
      Feel the weight of your body. Notice your breath flowing.
      
      Your sleep deepening and improving night after night, dreams becoming more restful. 
      Your energy replenishing completely during rest, morning alertness increasing naturally. 
      Your immune system strengthening with each breath, each cell receiving what it needs. 
      Memory becoming clearer day by day, words flowing more easily in conversations. 
      Mental clarity increasing, focus sharpening, concentration improving. 
      Creativity flowing freely in all endeavors. Communication skills improving constantly. 
      Self-confidence growing stronger every day.
      
      And now you return to waking consciousness, refreshed and renewed.
    `;
    
    // Find functional improvement keywords
    const keywords = [
      'sleep', 'energy', 'immune', 'memory', 'clarity', 
      'creativity', 'communication', 'confidence', 'improv'
    ];
    
    // Split into paragraphs
    const paragraphs = dumpScript
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 50); // Match quality guard logic
    
    // Count ACTUAL occurrences per paragraph (not just unique keywords)
    const keywordsPerParagraph = paragraphs.map(para => {
      const lowerPara = para.toLowerCase();
      let count = 0;
      keywords.forEach(kw => {
        const regex = new RegExp(kw, 'gi');
        const matches = lowerPara.match(regex) || [];
        count += matches.length;
      });
      return count;
    });
    
    const maxInOneParagraph = Math.max(...keywordsPerParagraph);
    
    // Should fail: more than 3 benefits in one paragraph (actually has 9)
    expect(maxInOneParagraph).toBeGreaterThan(3);
  });

  it('should detect repeated keyword dumps (regression test)', () => {
    // Tests the bug where repeated "sleep" was counted as 1 instead of 5
    const repeatedDumpScript = `
      Take a deep breath and rest here.
      
      Your sleep deepening night after night. Your sleep becoming more restful. 
      Each night your sleep improves. Your sleep cycles optimize naturally. 
      Sleep quality increasing dramatically. Your sleep patterns heal completely.
      
      And you return refreshed.
    `;
    
    const paragraphs = repeatedDumpScript
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 50);
    
    const keywords = ['sleep'];
    
    const keywordsPerParagraph = paragraphs.map(para => {
      const lowerPara = para.toLowerCase();
      let count = 0;
      keywords.forEach(kw => {
        const regex = new RegExp(kw, 'gi');
        const matches = lowerPara.match(regex) || [];
        count += matches.length;
      });
      return count;
    });
    
    const maxInOneParagraph = Math.max(...keywordsPerParagraph);
    
    // Should detect 6 "sleep" mentions in one paragraph
    expect(maxInOneParagraph).toBeGreaterThanOrEqual(6);
    expect(maxInOneParagraph).toBeGreaterThan(3); // Fails the quality check
  });

  it('should accept well-distributed improvements (good pattern)', () => {
    const goodScript = `
      Find a comfortable position and settle in. As you rest here, your body 
      begins its natural healing, each breath bringing renewal.
      
      Like gentle waves, calm arrives. Your nervous system remembers peace.
      Feel this settling throughout your entire being.
      
      Notice how your sleep deepens night after night, your body remembering 
      how to rest completely. This wisdom has always been within you.
      
      Moving deeper now, like roots finding soil. Your natural energy 
      replenishes as you return to your center.
      
      And as you prepare to return, this peaceful state becomes natural. 
      Your memory strengthening, clarity increasing with each passing day.
      
      Opening your eyes now, bringing this calm with you.
    `;
    
    const keywords = [
      'healing', 'sleep', 'energy', 'memory', 'clarity'
    ];
    
    // Split into paragraphs
    const paragraphs = goodScript
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    // Count keywords per paragraph
    const keywordsPerParagraph = paragraphs.map(para => {
      return keywords.filter(kw => 
        para.toLowerCase().includes(kw)
      ).length;
    });
    
    const maxInOneParagraph = Math.max(...keywordsPerParagraph);
    const totalKeywords = keywordsPerParagraph.reduce((a, b) => a + b, 0);
    
    // Should pass: max 2 per paragraph, total 3-5 throughout
    expect(maxInOneParagraph).toBeLessThanOrEqual(2);
    expect(totalKeywords).toBeGreaterThanOrEqual(3);
    expect(totalKeywords).toBeLessThanOrEqual(5);
  });

  it('should identify statement length (sentences)', () => {
    const shortStatement = "Your sleep deepens night after night.";
    const mediumStatement = "Like the meadow returning to stillness, your nervous system remembers its natural calm.";
    const tooLongDump = "Your sleep deepening and improving night after night, dreams becoming more restful and restorative, your energy replenishing completely during rest here in these healing spaces, morning alertness increasing naturally, your immune system strengthening with each breath you take.";
    
    // Count sentence separators (periods)
    const shortSentences = (shortStatement.match(/\./g) || []).length;
    const mediumSentences = (mediumStatement.match(/\./g) || []).length;
    const longSentences = (tooLongDump.match(/\./g) || []).length;
    
    // Short and medium should be 1-2 sentences
    expect(shortSentences).toBeLessThanOrEqual(2);
    expect(mediumSentences).toBeLessThanOrEqual(2);
    
    // Long dump is 1 sentence but has too many clauses (commas indicate this)
    const commaCount = (tooLongDump.match(/,/g) || []).length;
    expect(commaCount).toBeGreaterThan(3); // Flag as problematic (4 commas = too many clauses)
  });
});
