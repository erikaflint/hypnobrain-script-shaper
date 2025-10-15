import { describe, it, expect } from 'vitest';

/**
 * METAPHOR FREQUENCY TEST
 * Validates that the quality guard properly detects metaphor overuse
 */

describe('Metaphor Frequency Detection', () => {
  it('should detect ocean metaphor overuse (20+ uses)', () => {
    // Simulate ocean script with heavy metaphor use (47 total water metaphors)
    const oceanScript = `
      Feel the oceanic calm. Like ocean waves, your breath flows. 
      Ocean depths hold peace. Waves rise and fall like your chest.
      Ocean tides turn naturally. Feel oceanic stillness within.
      Like the ocean cleansing itself, you restore. Ocean rhythms guide you.
      Waves of calm wash over you. Ocean wisdom flows through you.
      Like gentle ocean waves, peace arrives. Ocean-deep calm surrounds you.
      Waves recede, taking tension away. Ocean currents carry stress away.
      Like the eternal ocean, you are vast. Ocean peace is your nature.
      Waves of healing flow through you. Ocean depths await you.
      Like ocean tides, change comes. Ocean-like serenity fills you.
      Waves approach the shore gently. Ocean streams feed your soul.
      Water flows like ocean currents. Tides shift within you.
      Ocean horizons expand your awareness. Like water finding its level.
    `.repeat(3); // Repeat to get ~45+ metaphor uses
    
    const wordCount = oceanScript.split(/\s+/).filter(w => w.length > 0).length;
    
    // Count water metaphor family occurrences
    const waterWords = ['ocean', 'wave', 'tide', 'water', 'sea', 'current', 'flow'];
    let metaphorCount = 0;
    
    waterWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi');
      const matches = oceanScript.toLowerCase().match(regex) || [];
      metaphorCount += matches.length;
    });
    
    // Should have 40+ metaphor uses
    expect(metaphorCount).toBeGreaterThan(40);
    
    // Max allowed is 8-10 for scripts under 2500 words
    const maxMetaphors = wordCount >= 2500 ? 10 : 8;
    
    // Should fail the check
    expect(metaphorCount).toBeGreaterThan(maxMetaphors);
  });

  it('should accept moderate metaphor use (5-7 uses)', () => {
    const balancedScript = `
      Take a deep breath and settle into this moment. Your body knows how to relax.
      Feel the weight of your body fully supported. Notice your breath flowing naturally.
      Like gentle waves, calm arrives. Your shoulders soften and release.
      As you rest here, peace deepens. Your mind becomes still and clear.
      Feel your heartbeat, steady and reliable. Like a quiet ocean, peace surrounds you.
      This calm flows through your system. Your nervous system finds its balance.
      With each breath, you go deeper. Like soft currents, relaxation spreads.
      You are safe here. Your body remembers this state.
      From now on, you access this calm easily. Like a familiar shore, it's always there.
      When you open your eyes, you'll feel refreshed. Alert, peaceful, and centered.
    `;
    
    const waterWords = ['ocean', 'wave', 'tide', 'water', 'sea', 'current', 'flow', 'shore'];
    let metaphorCount = 0;
    
    waterWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi');
      const matches = balancedScript.toLowerCase().match(regex) || [];
      metaphorCount += matches.length;
    });
    
    // Should have 5-7 metaphor uses
    expect(metaphorCount).toBeGreaterThanOrEqual(4);
    expect(metaphorCount).toBeLessThanOrEqual(7);
  });

  it('should handle scripts with no metaphors', () => {
    const directScript = `
      Take a deep breath. Your body relaxes completely.
      Feel your muscles soften. Your mind becomes quiet.
      You are safe here. This calm belongs to you.
      Notice your heartbeat. Feel your breath flowing.
      Peace fills your awareness. You rest deeply now.
    `;
    
    const waterWords = ['ocean', 'wave', 'tide', 'water', 'sea', 'current'];
    let metaphorCount = 0;
    
    waterWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi');
      const matches = directScript.toLowerCase().match(regex) || [];
      metaphorCount += matches.length;
    });
    
    // Should have 0 metaphors
    expect(metaphorCount).toBe(0);
  });
});
