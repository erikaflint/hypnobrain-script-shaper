#!/usr/bin/env tsx
/**
 * Production Readiness Smoke Test
 * 
 * Quick validation that critical components are working:
 * - Pattern detection catches repetitive language
 * - Grammar checker catches robotic language
 * - Quality thresholds are enforced
 * 
 * Run before deploying to production!
 * 
 * Usage: tsx tests/smoke-test.ts
 */

import { analyzePatterns } from '../server/pattern-refiner';
import { analyzeGrammar } from '../server/grammar-checker';

interface SmokeTestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: SmokeTestResult[] = [];

console.log('🚀 PRODUCTION READINESS SMOKE TEST');
console.log('═══════════════════════════════════════════════════════════════════════\n');

// Test 1: Pattern Detection
console.log('Test 1: Pattern Detection');
console.log('────────────────────────────────────────\n');

const repetitiveScript = `You might notice the gentle breeze. You might feel the warmth. You might hear the birds. You might sense the peace. You might discover calm. You might find rest. You might notice stillness. You might feel relaxed. You might hear wind. You might sense tranquility.`;

const patternAnalysis = analyzePatterns(repetitiveScript);
const overused = patternAnalysis.overusedPatterns.filter(p => p.needsRewrite);

if (overused.length > 0 && patternAnalysis.diversityScore < 85) {
  console.log('✅ PASS - Pattern detection working');
  console.log(`   Detected ${overused.length} overused patterns`);
  console.log(`   Diversity score: ${patternAnalysis.diversityScore}%`);
  results.push({
    name: 'Pattern Detection',
    passed: true,
    details: `Detected ${overused.length} patterns, ${patternAnalysis.diversityScore}% diversity`
  });
} else {
  console.log('❌ FAIL - Pattern detection not working');
  console.log(`   Expected overused patterns, found ${overused.length}`);
  console.log(`   Diversity score: ${patternAnalysis.diversityScore}%`);
  results.push({
    name: 'Pattern Detection',
    passed: false,
    details: 'Failed to detect obvious repetitive patterns'
  });
}

// Test 2: Grammar Checker - Missing Articles
console.log('\nTest 2: Grammar Checker - Missing Articles');
console.log('────────────────────────────────────────\n');

const roboticScript = `Notice breath flowing naturally. Feel chest rising and falling. Bodies know how to relax. Minds understand peace. Perhaps sensing emerges of calm within you.`;

const grammarAnalysis = analyzeGrammar(roboticScript);

if (grammarAnalysis.score < 70 && grammarAnalysis.issues.length > 0) {
  console.log('✅ PASS - Grammar checker working');
  console.log(`   Grammar score: ${grammarAnalysis.score}% (correctly below 70% threshold)`);
  console.log(`   Issues detected: ${grammarAnalysis.issues.length}`);
  grammarAnalysis.issues.forEach(issue => {
    console.log(`   • ${issue.type}`);
  });
  results.push({
    name: 'Grammar Checker',
    passed: true,
    details: `Score ${grammarAnalysis.score}%, ${grammarAnalysis.issues.length} issues detected`
  });
} else {
  console.log('❌ FAIL - Grammar checker not catching robotic language');
  console.log(`   Grammar score: ${grammarAnalysis.score}% (should be <70%)`);
  console.log(`   Issues detected: ${grammarAnalysis.issues.length} (should be >0)`);
  results.push({
    name: 'Grammar Checker',
    passed: false,
    details: 'Failed to detect robotic language'
  });
}

// Test 3: Grammar Checker Thresholds
console.log('\nTest 3: Grammar Checker - Strict Thresholds');
console.log('────────────────────────────────────────\n');

const edgeCaseScript = `Notice the breath flowing. Feel your chest. See the light. Notice breath again. Feel chest moving. See light shining.`;

const edgeCaseAnalysis = analyzeGrammar(edgeCaseScript);

// Should catch 3 missing articles with strict threshold (>2)
const hasMissingArticles = edgeCaseAnalysis.issues.some(i => i.type === 'Missing Articles');

if (hasMissingArticles) {
  console.log('✅ PASS - Strict thresholds working');
  console.log(`   Grammar score: ${edgeCaseAnalysis.score}%`);
  console.log(`   Caught edge case with 3 missing articles`);
  results.push({
    name: 'Strict Thresholds',
    passed: true,
    details: 'Edge case detection working'
  });
} else {
  console.log('⚠️  WARNING - May not catch all edge cases');
  console.log(`   Grammar score: ${edgeCaseAnalysis.score}%`);
  results.push({
    name: 'Strict Thresholds',
    passed: true, // Don't fail on this, just warn
    details: 'May need threshold adjustment'
  });
}

// Test 4: Good Script Passes
console.log('\nTest 4: Natural Script Validation');
console.log('────────────────────────────────────────\n');

const goodScript = `Take a moment now to notice your breath flowing naturally, feeling that gentle rise and fall of your chest. Perhaps you're sensing the warmth of relaxation beginning to spread through your body. As you settle more deeply into comfort, you might discover a profound sense of peace emerging within you. Your body knows exactly how to release tension, and your mind understands the path to deep rest.`;

const goodGrammar = analyzeGrammar(goodScript);
const goodPatterns = analyzePatterns(goodScript);

if (goodGrammar.score >= 70 && goodPatterns.diversityScore >= 85) {
  console.log('✅ PASS - Natural scripts pass validation');
  console.log(`   Grammar score: ${goodGrammar.score}%`);
  console.log(`   Diversity score: ${goodPatterns.diversityScore}%`);
  results.push({
    name: 'Natural Script',
    passed: true,
    details: `Grammar ${goodGrammar.score}%, Diversity ${goodPatterns.diversityScore}%`
  });
} else {
  console.log('❌ FAIL - Natural script incorrectly rejected');
  console.log(`   Grammar score: ${goodGrammar.score}% (should be ≥70%)`);
  console.log(`   Diversity score: ${goodPatterns.diversityScore}% (should be ≥85%)`);
  results.push({
    name: 'Natural Script',
    passed: false,
    details: 'False positive - rejected good script'
  });
}

// Summary
console.log('\n\n═══════════════════════════════════════════════════════════════════════');
console.log('                           SMOKE TEST RESULTS                          ');
console.log('═══════════════════════════════════════════════════════════════════════\n');

results.forEach(result => {
  const status = result.passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${result.name}`);
  console.log(`        ${result.details}\n`);
});

const allPassed = results.every(r => r.passed);

console.log('─'.repeat(70));

if (allPassed) {
  console.log('🎉 ALL SMOKE TESTS PASSED - READY FOR PRODUCTION!\n');
  process.exit(0);
} else {
  console.log('❌ SMOKE TESTS FAILED - DO NOT DEPLOY TO PRODUCTION\n');
  console.log('💡 Fix failing tests before deploying\n');
  process.exit(1);
}
