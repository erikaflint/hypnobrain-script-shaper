/**
 * Manual test: Generate real clinical script and verify ego strengthening distribution
 * Run with: npx tsx tests/manual-ego-clinical-test.ts
 */

import { AIService } from '../server/ai-service';

async function testClinicalEgoDistribution() {
  console.log('🧪 Testing Ego Strengthening in Clinical Script Generation\n');

  // Create a test template with balanced dimensions
  const template = {
    id: 999,
    name: 'Test Balanced Template',
    dimensions: {
      somatic: { level: 50, descriptor: 'Moderate' },
      symbolic: { level: 50, descriptor: 'Moderate' },
      temporal: { level: 40, descriptor: 'Light' },
      psychological: { level: 60, descriptor: 'Heavy' },
      perspective: { level: 40, descriptor: 'Light' },
      spiritual: { level: 30, descriptor: 'Very Light' },
      relational: { level: 40, descriptor: 'Light' },
      language: { level: 50, descriptor: 'Moderate' }
    }
  };

  console.log('📋 Template:', template.name);
  console.log('📊 Dimensions:', JSON.stringify(template.dimensions, null, 2));
  console.log('\n⏳ Generating clinical script (this takes ~30 seconds)...\n');

  const aiService = new AIService();
  const result = await aiService.generateFullScript({
    presentingIssue: 'stress and anxiety from work pressure',
    desiredOutcome: 'feel calm, confident, and in control',
    clientNotes: 'client wants to sleep better and feel more energized',
    template: template,
    emergenceType: 'wake', // Clinical script with wake emergence
    targetWordCount: 1750
  });

  console.log('✅ Script generated successfully!\n');
  
  // Check if ego directives were in the prompt
  const hasEgoDirectives = result.userPrompt?.includes('EGO STRENGTHENING') || 
                           result.userPrompt?.includes('functional improvements');
  
  console.log('📝 Ego directives in prompt:', hasEgoDirectives ? '✅ YES' : '❌ NO');
  
  // Analyze the final script for ego strengthening patterns
  const script = result.fullScript;
  const egoPatterns = [
    'confident', 'capable', 'strong', 'resilient', 'calm',
    'peaceful', 'energized', 'focused', 'clear', 'relaxed',
    'restored', 'refreshed', 'balanced', 'centered', 'grounded',
    'empowered', 'worthy', 'valuable', 'deserving', 'healthy'
  ];

  const matches = egoPatterns.map(pattern => ({
    pattern,
    count: (script.match(new RegExp(`\\b${pattern}\\b`, 'gi')) || []).length
  })).filter(m => m.count > 0);

  console.log(`\n🔍 Ego strengthening keywords found: ${matches.length} different patterns`);
  matches.slice(0, 10).forEach(m => {
    console.log(`   - "${m.pattern}": ${m.count} occurrences`);
  });

  // Check distribution by dividing script into 4 quarters
  const quarterLength = Math.floor(script.length / 4);
  const quarters = [
    script.slice(0, quarterLength),
    script.slice(quarterLength, quarterLength * 2),
    script.slice(quarterLength * 2, quarterLength * 3),
    script.slice(quarterLength * 3)
  ];

  console.log('\n📊 Distribution across script quarters:');
  quarters.forEach((quarter, i) => {
    const count = egoPatterns.reduce((sum, pattern) => 
      sum + (quarter.match(new RegExp(`\\b${pattern}\\b`, 'gi')) || []).length, 0
    );
    console.log(`   Quarter ${i + 1}: ${count} keywords`);
  });

  // Check for dumps (multiple keywords in same sentence)
  const sentences = script.split(/[.!?]+/);
  const dumpsFound = sentences.filter(sentence => {
    const keywordCount = egoPatterns.reduce((sum, pattern) => 
      sum + (sentence.match(new RegExp(`\\b${pattern}\\b`, 'gi')) || []).length, 0
    );
    return keywordCount > 3; // Flag if 4+ keywords in one sentence
  });

  console.log(`\n🚨 Potential dumps found: ${dumpsFound.length}`);
  if (dumpsFound.length > 0) {
    console.log('   First dump:', dumpsFound[0].slice(0, 150) + '...');
  }

  console.log('\n📄 Script length:', script.split(/\s+/).length, 'words');
  console.log('🎯 Target word count:', result.targetWordCount || 1750);
  
  console.log('\n✨ Test complete!');
  
  process.exit(0);
}

testClinicalEgoDistribution().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
