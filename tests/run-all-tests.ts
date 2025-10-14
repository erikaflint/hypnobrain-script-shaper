#!/usr/bin/env tsx
/**
 * Master Test Runner - Runs all DREAM pipeline tests
 * 
 * Usage: npm test
 */

import { execSync } from 'child_process';
import path from 'path';

interface TestResult {
  name: string;
  file: string;
  passed: boolean;
  duration: number;
  error?: string;
}

const tests = [
  {
    name: 'Pattern Detection (Unit)',
    file: 'pattern-detection-test.ts',
    description: 'Validates pattern detection logic for repetitive sentence openers'
  },
  {
    name: 'Context Preservation (Integration)',
    file: 'dream-context-test.ts',
    description: 'Tests context preservation through Story Shaper → Script Generator'
  },
  {
    name: 'Stage-by-Stage Pipeline (E2E)',
    file: 'stage-by-stage-test.ts',
    description: 'Full pipeline test: Story Shaper → Dream Maker → Pattern Refiner → Quality Guard'
  }
];

async function runTest(test: typeof tests[0]): Promise<TestResult> {
  const startTime = Date.now();
  const testPath = path.join(process.cwd(), 'tests', test.file);

  try {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🧪 ${test.name}`);
    console.log(`   ${test.description}`);
    console.log(`${'='.repeat(70)}\n`);

    execSync(`tsx ${testPath}`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    const duration = Date.now() - startTime;
    console.log(`\n✅ ${test.name} PASSED (${(duration / 1000).toFixed(2)}s)\n`);

    return {
      name: test.name,
      file: test.file,
      passed: true,
      duration
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.log(`\n❌ ${test.name} FAILED (${(duration / 1000).toFixed(2)}s)\n`);

    return {
      name: test.name,
      file: test.file,
      passed: false,
      duration,
      error: error.message
    };
  }
}

async function runAllTests() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                  HYPNOBRAIN TEST SUITE                            ║');
  console.log('║              4-Stage DREAM Pipeline Validation                    ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
  
  const results: TestResult[] = [];
  
  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);
    
    // Stop on first failure for faster debugging
    if (!result.passed) {
      console.log('\n⚠️  Stopping test suite on first failure for faster debugging\n');
      break;
    }
  }

  // Print summary
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const duration = (result.duration / 1000).toFixed(2);
    console.log(`${status} - ${result.name} (${duration}s)`);
    if (result.error) {
      console.log(`        Error: ${result.error}`);
    }
  });

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed} | Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`${'─'.repeat(70)}\n`);

  if (failed > 0) {
    console.log('❌ TEST SUITE FAILED\n');
    console.log('💡 Tip: Check tests/artifacts/ for generated outputs to debug\n');
    process.exit(1);
  } else {
    console.log('🎉 ALL TESTS PASSED - PRODUCTION READY!\n');
    process.exit(0);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});
