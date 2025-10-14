/**
 * Test that Pattern Refiner correctly detects repetitive sentence patterns
 */

import { analyzePatterns } from '../server/pattern-refiner';

const testScripts = [
  {
    name: "Good Variety",
    script: `Welcome to this peaceful journey. Find yourself in a comfortable position. The gentle breeze caresses your skin. Notice how your breathing naturally slows. Each breath brings deeper relaxation. As the sun sets, you feel completely at peace.`,
    expectedDiversity: 100
  },
  {
    name: "Repetitive 'You might'",
    script: `You might notice the gentle breeze. You might feel the warmth on your skin. You might hear the birds singing. You might sense the peace growing. You might discover a deep calm. You might find yourself drifting. You might notice the stillness. You might feel completely relaxed. You might hear the wind. You might sense the tranquility.`,
    expectedDiversity: 70 // Should detect overuse
  },
  {
    name: "Repetitive 'As you'",
    script: `As you breathe deeply, you relax. As you settle into comfort, you feel peace. As you release tension, you drift deeper. As you notice the stillness, you let go. As you hear the wind, you calm. As you sense the warmth, you soften. As you feel the ground, you rest. As you listen to the silence, you sleep. As you become aware, you release. As you drift away, you dream. As you rest here, you peace.`,
    expectedDiversity: 70 // Should detect overuse
  },
  {
    name: "Mid-Paragraph Repetition (Critical Test)",
    script: `Welcome to peace. You might notice the breeze caressing your skin. You might feel the warmth of the sun. You might hear the birds singing in the trees. The forest surrounds you. You might discover a deep sense of calm within. You might sense the gentle rhythm of your breathing. You might find yourself drifting into relaxation. The stillness embraces you. You might notice the peacefulness growing stronger. You might experience a wave of calm. You might become aware of deep rest.`,
    expectedDiversity: 70 // Should detect mid-paragraph "You might" repetition (9 occurrences)
  }
];

console.log('🧪 Pattern Detection Test Suite\n');
console.log('Testing Pattern Refiner\'s ability to detect repetitive openers...\n');
console.log('======================================================================\n');

testScripts.forEach(({ name, script, expectedDiversity }) => {
  console.log(`📋 Test: ${name}`);
  console.log('----------------------------------------------------------------------');
  
  const analysis = analyzePatterns(script);
  
  console.log(`Diversity Score: ${analysis.diversityScore}% (expected: ≤${expectedDiversity}%)`);
  console.log(`Total Sentences: ${analysis.totalSentences}`);
  
  const overused = analysis.overusedPatterns.filter(p => p.needsRewrite);
  if (overused.length > 0) {
    console.log(`\n⚠️  Overused Patterns Detected:`);
    overused.forEach(p => {
      console.log(`   • "${p.pattern}" used ${p.count}x (threshold: ${p.threshold})`);
    });
  } else {
    console.log(`\n✅ No overused patterns detected`);
  }
  
  console.log('\n');
});

console.log('======================================================================');
console.log('🏁 TEST COMPLETE\n');
