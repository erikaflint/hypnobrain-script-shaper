import { describe, it, expect } from 'vitest';
import { AIService } from '../../server/ai-service';
import { EgoModule } from '../../server/script-engine/modules/ego-module';
import { runQualityGuard } from '../../server/quality-guard';

/**
 * Pipeline Smoke Test
 * 
 * Fast tests that verify all module imports work correctly without making AI calls.
 * These would catch issues like:
 * - require() in ES modules
 * - Circular dependencies
 * - Missing imports
 * - Module initialization errors
 */

describe('Pipeline Smoke Test (Fast - No AI)', () => {
  
  it('should import AIService without errors', () => {
    expect(AIService).toBeDefined();
    const aiService = new AIService();
    expect(aiService).toBeDefined();
    expect(typeof aiService.generateFullScript).toBe('function');
  });

  it('should import EgoModule without errors', () => {
    expect(EgoModule).toBeDefined();
    expect(typeof EgoModule.validateDistribution).toBe('function');
    
    // Can instantiate
    const egoModule = new EgoModule();
    expect(egoModule).toBeDefined();
  });

  it('should import Quality Guard without errors', () => {
    expect(runQualityGuard).toBeDefined();
    expect(typeof runQualityGuard).toBe('function');
  });

  it('should validate ego strengthening distribution', () => {
    const goodScript = `
      You might notice your breathing becomes deeper and more relaxed.
      And as you continue, you find yourself feeling more calm with each breath.
      Perhaps you sense a growing confidence in your ability to manage stress.
      Your nervous system remembers this peaceful state, storing it for future use.
      And now you allow yourself to feel completely refreshed and centered.
    `.trim();

    // This calls EgoModule.validateDistribution through Quality Guard
    const result = EgoModule.validateDistribution(goodScript);
    
    expect(result).toBeDefined();
    expect(result.passed).toBeDefined();
    expect(typeof result.passed).toBe('boolean');
    expect(result.details).toBeDefined();
    expect(typeof result.details).toBe('string');
  });

  it('should detect ego strengthening dumps', () => {
    const dumpScript = `
      And in this moment, you find yourself feeling confident, capable, strong, resilient, 
      calm, peaceful, energized, focused, clear, relaxed, restored, refreshed, and balanced.
      You are centered, grounded, empowered, worthy, valuable, deserving, and healthy.
    `.trim();

    const result = EgoModule.validateDistribution(dumpScript);
    
    expect(result).toBeDefined();
    expect(result.passed).toBe(false); // Should fail - this is a dump
    expect(result.details).toContain('paragraph'); // Should mention paragraph issue
  });

  it('should have ego config loaded', () => {
    // EgoModule loads ego-config.json on import
    // If there was an import error, this test would fail
    const egoModule = new EgoModule();
    expect(egoModule).toBeDefined();
    
    // Validate distribution uses the config
    const testScript = "You feel confident and capable.";
    const result = EgoModule.validateDistribution(testScript);
    expect(result).toBeDefined();
  });

  it('should validate all imports work together', () => {
    // This test ensures the full import chain works:
    // pipeline-smoke-test → EgoModule → ego-config.json
    // pipeline-smoke-test → Quality Guard → EgoModule
    // If there's a require() instead of import, this fails
    
    expect(AIService).toBeDefined();
    expect(EgoModule).toBeDefined();
    expect(runQualityGuard).toBeDefined();
    expect(typeof EgoModule.validateDistribution).toBe('function');
  });
});
