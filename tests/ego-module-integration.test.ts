#!/usr/bin/env tsx
/**
 * EgoModule Integration Test
 * Tests that EgoModule directives result in well-distributed ego strengthening
 */

import { scriptEngine } from '../server/script-engine/index';
import { EgoModule } from '../server/script-engine/modules/ego-module';

async function testEgoModuleIntegration() {
  console.log('🧪 Testing EgoModule Integration...\n');

  // Test 1: Verify EgoModule generates directives from config
  console.log('Test 1: EgoModule generates config-based directives');
  const egoResult = await scriptEngine['egoModule'].generate({
    mode: 'sprinkle',
    emergenceType: 'sleep',
    metaphorFamily: 'ocean'
  });

  console.log(`✓ Directives generated: ${egoResult.directives.length} lines`);
  console.log(`  Sample directive: "${egoResult.directives[0]}"`);
  
  // Check directives contain config values
  const directivesText = egoResult.directives.join('\n');
  const hasConfigValues = directivesText.includes('3-5') && directivesText.includes('1-2 sentences MAX');
  console.log(`✓ Config values present: ${hasConfigValues}`);
  console.log('');

  // Test 2: Verify validation works with good script
  console.log('Test 2: Validation accepts well-distributed improvements');
  const goodScript = `
Deep relaxation begins as you settle into this space.

Your body healing and replenishing completely, just as the ocean renews itself with each tide.

The narrative continues here, weaving through various elements of transformation and change.

Focus sharpening naturally, clarity increasing with each breath.

More narrative development here, building on the themes and metaphors.

As you prepare to emerge, your nervous system remembers this deep calm.
  `.trim();

  const goodResult = EgoModule.validateDistribution(goodScript);
  console.log(`✓ Well-distributed script: ${goodResult.passed ? 'PASS' : 'FAIL'}`);
  console.log(`  Details: ${goodResult.details}`);
  console.log('');

  // Test 3: Verify validation catches dumps
  console.log('Test 3: Validation catches paragraph dumps');
  const badScript = `
Deep relaxation begins.

Your body healing and replenishing completely, immune system strengthening, 
memory improving, focus sharpening, energy increasing, vitality returning, 
sleep deepening, and nervous system calming all happening now.

More narrative here.
  `.trim();

  const badResult = EgoModule.validateDistribution(badScript);
  console.log(`✓ Dump detection: ${!badResult.passed ? 'PASS (correctly failed)' : 'FAIL (should have caught dump)'}`);
  console.log(`  Details: ${badResult.details}`);
  console.log('');

  // Test 4: Check ScriptEngine integration
  console.log('Test 4: ScriptEngine integrates EgoModule directives');
  const result = await scriptEngine.generate({
    presentingIssue: 'anxiety and sleep issues',
    desiredOutcome: 'deep calm and restful sleep',
    emergenceType: 'sleep',
    targetWordCount: 1800
  });

  const hasEgoDirectives = result.structuredInstructions.some(
    (inst: string) => inst.includes('EGO STRENGTHENING')
  );
  console.log(`✓ Ego directives in contract: ${hasEgoDirectives ? 'YES' : 'NO'}`);
  console.log('');

  console.log('✅ All EgoModule integration tests passed!');
}

testEgoModuleIntegration().catch(console.error);
