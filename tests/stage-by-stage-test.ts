#!/usr/bin/env tsx
/**
 * 4-STAGE DREAM PIPELINE TEST SUITE
 * 
 * Tests each stage independently to identify where quality breaks down:
 * 
 * Stage 1: Story Shaper (journeyIdea → expandedStory)
 * Stage 2: Dream Maker (expandedStory → fullScript)
 * Stage 3: Pattern Refiner (fullScript → refinedScript)
 * Stage 4: Quality Guard (refinedScript → polishedScript)
 * 
 * Usage: tsx tests/stage-by-stage-test.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { analyzePatterns } from '../server/pattern-refiner';
import { analyzeGrammar } from '../server/grammar-checker';
import fs from 'fs/promises';
import path from 'path';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface TestCase {
  name: string;
  journeyIdea: string;
  archetype: {
    name: string;
    description: string;
  };
}

interface StageResult {
  stage: string;
  output: string;
  analysis: {
    wordCount: number;
    grammarScore?: number;
    grammarIssues?: any[];
    diversityScore?: number;
    overusedPatterns?: any[];
    [key: string]: any;
  };
  passed: boolean;
  issues: string[];
}

// Test case
const testCase: TestCase = {
  name: "Forest Sanctuary Journey",
  journeyIdea: "Walk through an ancient forest sanctuary at dawn, where mist rises from a crystal-clear stream and morning light filters through towering redwoods. Discover a moss-covered meditation circle where you can rest and connect with nature's peaceful wisdom.",
  archetype: {
    name: "Gentle Guide",
    description: "A calm, nurturing presence that guides you into peaceful rest with warmth and reassurance"
  }
};

/**
 * Stage 1: Story Shaper Test
 * Validates: Story expansion, word count, natural language
 */
async function testStage1_StoryShaper(testCase: TestCase): Promise<StageResult> {
  console.log('\n🔄 STAGE 1: Story Shaper');
  console.log('────────────────────────────────────────');
  
  const systemPrompt = `You are a master storyteller specializing in creating rich, immersive sleep journeys.

Your task: Take a brief journey idea and expand it into a detailed, vivid story (800-1200 words) that will become the foundation for a sleep hypnosis script.

Key Principles:
- NATURAL HYPNOTIC LANGUAGE: Use proper grammar with articles (the, a, your). Write "notice the breath flowing" NOT "notice breath flowing". Write "your body knows" NOT "bodies know". Sound like a skilled hypnotherapist, not a robot.
- CREATE VARIETY: Vary sentence structure while maintaining natural flow. Avoid repetitive openers but NEVER sacrifice grammar for variety.
- SENSORY RICHNESS: Engage all senses with specific, concrete details using natural phrasing
- FLOWING TRANSITIONS: Use connecting words (and, as, while, perhaps) to create smooth, hypnotic flow
- DREAM LOGIC: Allow the story to shift and transform naturally, like a dream
- SLEEP-CONDUCIVE: Maintain a peaceful, calming tone throughout

CRITICAL: The language must sound natural and hypnotic. Missing articles ("notice breath" instead of "notice the breath") creates robotic, unnatural text that breaks trance. Always use complete, grammatically correct phrases.`;

  const userPrompt = `Journey Idea: ${testCase.journeyIdea}

Voice/Archetype: ${testCase.archetype.name} - ${testCase.archetype.description}

Expand this into a rich, detailed story (800-1200 words) that captures:
1. The setting and atmosphere in vivid detail
2. A progression through different scenes or moments
3. Specific sensory experiences (sights, sounds, textures, scents, sensations)
4. A natural flow that builds toward deep rest

IMPORTANT: Vary your language throughout. Don't repeat the same phrases or patterns. Each paragraph should introduce something NEW while maintaining the peaceful journey.

Format as JSON:
{
  "expandedStory": "The full 800-1200 word story here...",
  "storyLength": "approximate word count"
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textContent = response.content[0];
  if (textContent.type !== 'text') {
    throw new Error('Expected text response');
  }

  let jsonText = textContent.text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
  }

  const result = JSON.parse(jsonText);
  const story = result.expandedStory;
  const wordCount = story.split(/\s+/).length;

  // Analyze grammar
  const grammarAnalysis = analyzeGrammar(story);

  // Check for issues
  const issues: string[] = [];
  let passed = true;

  if (wordCount < 800 || wordCount > 1200) {
    issues.push(`Word count ${wordCount} outside target range (800-1200)`);
    passed = false;
  }

  if (grammarAnalysis.score < 70) {
    issues.push(`Grammar score ${grammarAnalysis.score}% below threshold (70%)`);
    passed = false;
  }

  console.log(`✅ Generated: ${wordCount} words`);
  console.log(`📊 Grammar Score: ${grammarAnalysis.score}%`);
  if (grammarAnalysis.issues.length > 0) {
    console.log(`⚠️  Grammar Issues:`);
    grammarAnalysis.issues.forEach(issue => {
      console.log(`   • ${issue.type}: ${issue.description}`);
    });
  }

  return {
    stage: 'Story Shaper',
    output: story,
    analysis: {
      wordCount,
      grammarScore: grammarAnalysis.score,
      grammarIssues: grammarAnalysis.issues
    },
    passed,
    issues
  };
}

/**
 * Stage 2: Dream Maker Test
 * Validates: Script generation, word count, metaphor consistency
 */
async function testStage2_DreamMaker(expandedStory: string): Promise<StageResult> {
  console.log('\n🔄 STAGE 2: Dream Maker');
  console.log('────────────────────────────────────────');

  const systemPrompt = `You are a master hypnotherapist creating sleep hypnosis scripts.

Create a 30-minute (3000 word) sleep hypnosis script that guides someone into natural, peaceful sleep.

Key Requirements:
- Use the provided story as the foundation
- High somatic emphasis (70%): Body sensations, physical relaxation
- High symbolic emphasis (70%): Nature metaphors, dream imagery
- Sleep emergence (no counting up - let them drift to sleep)
- Peaceful, calming language with proper grammar`;

  const userPrompt = `Story Foundation: ${expandedStory}

Create a complete sleep hypnosis script (~3000 words) based on this story.

Requirements:
1. FULL SCRIPT with all phases:
   - Induction (guide into trance) - 500-700 words
   - Deepening (deepen trance) - 700-900 words
   - Therapeutic work (peaceful rest) - 900-1100 words
   - Sleep emergence (drift to sleep) - 300-500 words

2. Sleep emergence: NO counting up, allow them to drift into peaceful sleep

3. Maintain ALL details from the story throughout the script

Format as JSON:
{
  "fullScript": "The complete 3000-word hypnosis script here..."
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textContent = response.content[0];
  if (textContent.type !== 'text') {
    throw new Error('Expected text response');
  }

  let jsonText = textContent.text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
  }

  const result = JSON.parse(jsonText);
  const script = result.fullScript;
  const wordCount = script.split(/\s+/).length;

  // Analyze grammar
  const grammarAnalysis = analyzeGrammar(script);

  // Check for sleep emergence (should NOT have counting up)
  const hasCountingUp = /count(?:ing)?\s+(?:up|from|to|1|2|3|4|5)/i.test(script);

  const issues: string[] = [];
  let passed = true;

  if (wordCount < 2700 || wordCount > 3300) {
    issues.push(`Word count ${wordCount} outside target range (2700-3300)`);
    passed = false;
  }

  if (grammarAnalysis.score < 70) {
    issues.push(`Grammar score ${grammarAnalysis.score}% below threshold (70%)`);
    passed = false;
  }

  if (hasCountingUp) {
    issues.push('Sleep emergence has counting up (should drift to sleep)');
    passed = false;
  }

  console.log(`✅ Generated: ${wordCount} words`);
  console.log(`📊 Grammar Score: ${grammarAnalysis.score}%`);
  console.log(`🌙 Sleep Emergence: ${hasCountingUp ? '❌ Has counting up' : '✅ Drift to sleep'}`);
  if (grammarAnalysis.issues.length > 0) {
    console.log(`⚠️  Grammar Issues:`);
    grammarAnalysis.issues.forEach(issue => {
      console.log(`   • ${issue.type}: ${issue.description}`);
    });
  }

  return {
    stage: 'Dream Maker',
    output: script,
    analysis: {
      wordCount,
      grammarScore: grammarAnalysis.score,
      grammarIssues: grammarAnalysis.issues,
      hasCountingUp
    },
    passed,
    issues
  };
}

/**
 * Stage 3: Pattern Refiner Test
 * Validates: Pattern detection, variety improvement
 */
async function testStage3_PatternRefiner(fullScript: string): Promise<StageResult> {
  console.log('\n🔄 STAGE 3: Pattern Refiner');
  console.log('────────────────────────────────────────');

  // Analyze patterns BEFORE refining
  const beforeAnalysis = analyzePatterns(fullScript);
  const overusedBefore = beforeAnalysis.overusedPatterns.filter(p => p.needsRewrite);

  console.log(`📊 BEFORE Refining:`);
  console.log(`   Diversity Score: ${beforeAnalysis.diversityScore}%`);
  console.log(`   Overused Patterns: ${overusedBefore.length}`);
  
  if (overusedBefore.length > 0) {
    overusedBefore.slice(0, 3).forEach(p => {
      console.log(`   • "${p.pattern}" used ${p.count}x`);
    });
  }

  // For this test, we'll just analyze (actual refining happens in server)
  // In production, this would call runPatternRefiner
  const issues: string[] = [];
  let passed = true;

  if (beforeAnalysis.diversityScore < 85) {
    issues.push(`Diversity score ${beforeAnalysis.diversityScore}% indicates pattern issues`);
    passed = false;
  }

  return {
    stage: 'Pattern Refiner',
    output: fullScript, // In real flow, this would be refined
    analysis: {
      wordCount: fullScript.split(/\s+/).length,
      diversityScore: beforeAnalysis.diversityScore,
      overusedPatterns: overusedBefore
    },
    passed,
    issues
  };
}

/**
 * Stage 4: Quality Guard Test
 * Validates: All quality checks including grammar, patterns, word count
 */
async function testStage4_QualityGuard(refinedScript: string): Promise<StageResult> {
  console.log('\n🔄 STAGE 4: Quality Guard');
  console.log('────────────────────────────────────────');

  const wordCount = refinedScript.split(/\s+/).length;
  const grammarAnalysis = analyzeGrammar(refinedScript);
  const patternAnalysis = analyzePatterns(refinedScript);
  
  const issues: string[] = [];
  let passed = true;

  // Check 1: Grammar (70%+)
  if (grammarAnalysis.score < 70) {
    issues.push(`Grammar score ${grammarAnalysis.score}% below threshold (70%)`);
    passed = false;
  }

  // Check 2: Pattern diversity (85%+)
  if (patternAnalysis.diversityScore < 85) {
    issues.push(`Diversity score ${patternAnalysis.diversityScore}% below threshold (85%)`);
    passed = false;
  }

  // Check 3: Word count (within 15% of 3000)
  const targetWordCount = 3000;
  const tolerance = targetWordCount * 0.15;
  if (wordCount < targetWordCount - tolerance || wordCount > targetWordCount + tolerance) {
    issues.push(`Word count ${wordCount} outside tolerance (${targetWordCount - tolerance}-${targetWordCount + tolerance})`);
    passed = false;
  }

  // Check 4: Sleep emergence
  const hasCountingUp = /count(?:ing)?\s+(?:up|from|to|1|2|3|4|5)/i.test(refinedScript);
  if (hasCountingUp) {
    issues.push('Sleep emergence has counting up');
    passed = false;
  }

  console.log(`📊 Quality Checks:`);
  console.log(`   Grammar Score: ${grammarAnalysis.score}% ${grammarAnalysis.score >= 70 ? '✅' : '❌'}`);
  console.log(`   Diversity Score: ${patternAnalysis.diversityScore}% ${patternAnalysis.diversityScore >= 85 ? '✅' : '❌'}`);
  console.log(`   Word Count: ${wordCount} ${wordCount >= targetWordCount - tolerance && wordCount <= targetWordCount + tolerance ? '✅' : '❌'}`);
  console.log(`   Sleep Emergence: ${hasCountingUp ? '❌ Has counting up' : '✅ Drift to sleep'}`);

  if (grammarAnalysis.issues.length > 0) {
    console.log(`\n⚠️  Grammar Issues:`);
    grammarAnalysis.issues.forEach(issue => {
      console.log(`   • ${issue.type}: ${issue.description}`);
    });
  }

  const overusedPatterns = patternAnalysis.overusedPatterns.filter(p => p.needsRewrite);
  if (overusedPatterns.length > 0) {
    console.log(`\n⚠️  Pattern Issues:`);
    overusedPatterns.slice(0, 3).forEach(p => {
      console.log(`   • "${p.pattern}" used ${p.count}x`);
    });
  }

  return {
    stage: 'Quality Guard',
    output: refinedScript,
    analysis: {
      wordCount,
      grammarScore: grammarAnalysis.score,
      grammarIssues: grammarAnalysis.issues,
      diversityScore: patternAnalysis.diversityScore,
      overusedPatterns,
      hasCountingUp
    },
    passed,
    issues
  };
}

/**
 * Run complete test suite
 */
async function runTestSuite() {
  console.log('🧪 4-STAGE DREAM PIPELINE TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log(`\n📋 Test Case: ${testCase.name}`);
  console.log(`Journey: "${testCase.journeyIdea}"`);
  console.log(`Archetype: ${testCase.archetype.name}\n`);

  const results: StageResult[] = [];
  const artifactsDir = path.join(process.cwd(), 'tests', 'artifacts');
  await fs.mkdir(artifactsDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const baseFilename = `stage-test_${timestamp}`;

  try {
    // Stage 1: Story Shaper
    const stage1Result = await testStage1_StoryShaper(testCase);
    results.push(stage1Result);
    await fs.writeFile(
      path.join(artifactsDir, `${baseFilename}_stage1_story.txt`),
      stage1Result.output
    );

    if (!stage1Result.passed) {
      console.log('\n❌ Stage 1 FAILED - Stopping pipeline');
      console.log('Issues:', stage1Result.issues.join(', '));
    } else {
      // Stage 2: Dream Maker
      const stage2Result = await testStage2_DreamMaker(stage1Result.output);
      results.push(stage2Result);
      await fs.writeFile(
        path.join(artifactsDir, `${baseFilename}_stage2_script.txt`),
        stage2Result.output
      );

      if (!stage2Result.passed) {
        console.log('\n❌ Stage 2 FAILED - Stopping pipeline');
        console.log('Issues:', stage2Result.issues.join(', '));
      } else {
        // Stage 3: Pattern Refiner
        const stage3Result = await testStage3_PatternRefiner(stage2Result.output);
        results.push(stage3Result);

        // Stage 4: Quality Guard
        const stage4Result = await testStage4_QualityGuard(stage3Result.output);
        results.push(stage4Result);
        await fs.writeFile(
          path.join(artifactsDir, `${baseFilename}_stage4_final.txt`),
          stage4Result.output
        );
      }
    }

    // Print summary
    console.log('\n\n═══════════════════════════════════════════════════════════════════════');
    console.log('📊 PIPELINE RESULTS SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════════════\n');

    results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${result.stage}`);
      
      if (result.analysis.wordCount) {
        console.log(`   Word Count: ${result.analysis.wordCount}`);
      }
      if (result.analysis.grammarScore !== undefined) {
        console.log(`   Grammar: ${result.analysis.grammarScore}%`);
      }
      if (result.analysis.diversityScore !== undefined) {
        console.log(`   Diversity: ${result.analysis.diversityScore}%`);
      }
      if (result.issues.length > 0) {
        console.log(`   Issues: ${result.issues.join('; ')}`);
      }
      console.log('');
    });

    // Identify failure point
    const failedStage = results.find(r => !r.passed);
    if (failedStage) {
      console.log(`🎯 FAILURE POINT: ${failedStage.stage}`);
      console.log(`   This is where the pipeline broke down.\n`);
    } else {
      console.log(`🎉 ALL STAGES PASSED!\n`);
    }

    console.log(`💾 Artifacts saved to tests/artifacts/`);
    console.log(`   • ${baseFilename}_stage1_story.txt`);
    console.log(`   • ${baseFilename}_stage2_script.txt`);
    console.log(`   • ${baseFilename}_stage4_final.txt\n`);

  } catch (error: any) {
    console.error(`\n❌ Test suite error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

// Run test suite
runTestSuite().catch(console.error);
