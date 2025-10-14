#!/usr/bin/env tsx
/**
 * DREAM Context Preservation Test Suite
 * 
 * Tests how well the DREAM generation pipeline preserves specific context:
 * 1. Story Shaper (Step 1): Journey → Story Outline
 * 2. Script Generator (Step 2): Story Outline → Full Script
 * 
 * Usage: tsx tests/dream-context-test.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface TestCase {
  name: string;
  journeyInput: string;
  keywordChecks: {
    [category: string]: string[]; // e.g., "historical": ["1854", "Thoreau"]
  };
}

interface AnalysisResult {
  testCase: string;
  storyOutlineAnalysis: {
    found: string[];
    missing: string[];
    score: number;
  };
  fullScriptAnalysis: {
    found: string[];
    missing: string[];
    score: number;
  };
  degradationPoint: string;
}

// Test cases
const testCases: TestCase[] = [
  {
    name: "Historical Context - Walden Pond 1854",
    journeyInput: "Walk through Walden Pond in the autumn of 1854, when Thoreau published his book. Experience the simple life at his hand-built cabin, listening to the loons call across the water as twilight settles over the Massachusetts woods.",
    keywordChecks: {
      "Historical": ["1854", "Thoreau"],
      "Location": ["Walden", "Massachusetts"],
      "Setting": ["cabin"],
      "Season": ["autumn", "fall"],
      "Sensory": ["loons", "loon"],
      "Time": ["twilight", "evening"]
    }
  }
];

/**
 * Check if keywords are present in text (case-insensitive)
 */
function checkKeywords(
  text: string,
  keywordChecks: { [category: string]: string[] }
): { found: string[]; missing: string[]; score: number } {
  const textLower = text.toLowerCase();
  const found: string[] = [];
  const missing: string[] = [];

  Object.entries(keywordChecks).forEach(([category, keywords]) => {
    const categoryFound = keywords.some(keyword => 
      textLower.includes(keyword.toLowerCase())
    );
    
    if (categoryFound) {
      const matchedKeyword = keywords.find(k => textLower.includes(k.toLowerCase()));
      found.push(`${category}: ${matchedKeyword}`);
    } else {
      missing.push(`${category}: [${keywords.join(', ')}]`);
    }
  });

  const totalCategories = Object.keys(keywordChecks).length;
  const score = Math.round((found.length / totalCategories) * 100);

  return { found, missing, score };
}

/**
 * Simulate DREAM generation (Story Shaper + Script Generator)
 */
async function generateTestDream(journeyInput: string): Promise<{
  storyOutline: string;
  fullScript: string;
}> {
  console.log('\n🔄 Step 1: Story Shaper...');
  
  // Step 1: Story Shaper
  const storySystemPrompt = `You are a master storyteller specializing in creating rich, immersive sleep journeys.

Your task: Take a brief journey idea and expand it into a detailed, vivid story (800-1200 words) that will become the foundation for a sleep hypnosis script.

Key Principles:
- CREATE VARIETY: Each section should introduce new elements, scenes, or sensations - avoid repetitive language
- SENSORY RICHNESS: Engage all senses with specific, concrete details
- NATURAL FLOW: The story should unfold like a gentle journey, not a repetitive pattern
- DREAM LOGIC: Allow the story to shift and transform naturally, like a dream
- SLEEP-CONDUCIVE: Maintain a peaceful, calming tone throughout
- PRESERVE SPECIFICITY: Keep ALL specific details from the journey idea (dates, names, places, historical context)

The story should be a standalone narrative - vivid enough that a hypnotist could easily convert it into a script.`;

  const storyUserPrompt = `Journey Idea: ${journeyInput}

Voice/Archetype: Gentle Guide - A calm, nurturing presence that guides you into peaceful rest

Expand this into a rich, detailed story (800-1200 words) that captures:
1. The setting and atmosphere in vivid detail
2. A progression through different scenes or moments
3. Specific sensory experiences (sights, sounds, textures, scents, sensations)
4. A natural flow that builds toward deep rest

IMPORTANT: Vary your language throughout. Don't repeat the same phrases or patterns. Each paragraph should introduce something NEW while maintaining the peaceful journey.

CRITICAL: Preserve ALL specific details from the journey idea:
- Historical periods, dates, and eras
- Specific locations and places
- Named individuals or characters
- Particular objects or settings
Don't genericize these - keep them specific!

Format as JSON:
{
  "expandedStory": "The full 800-1200 word story here...",
  "storyLength": "approximate word count"
}`;

  const storyResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    system: storySystemPrompt,
    messages: [{ role: 'user', content: storyUserPrompt }],
  });

  const storyContent = storyResponse.content[0];
  if (storyContent.type !== 'text') {
    throw new Error('Expected text response from Story Shaper');
  }

  let storyJson = storyContent.text.trim();
  if (storyJson.startsWith('```json')) {
    storyJson = storyJson.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
  } else if (storyJson.startsWith('```')) {
    storyJson = storyJson.replace(/```\n?/g, '').replace(/```\n?$/g, '');
  }

  const storyResult = JSON.parse(storyJson);
  console.log(`✅ Story Shaper complete (${storyResult.storyLength} words)`);

  console.log('\n🔄 Step 2: Script Generator...');

  // Step 2: Script Generator (simplified - focuses on the story)
  const scriptSystemPrompt = `You are a master hypnotherapist creating sleep hypnosis scripts.

Create a 30-minute (3000 word) sleep hypnosis script that guides someone into natural, peaceful sleep.

Key Requirements:
- Use the provided story as the foundation
- Preserve ALL specific details from the story (dates, names, places, etc.)
- Guide gradually from awakeness to sleep
- Sleep emergence (no counting up - let them drift to sleep)
- Peaceful, calming language`;

  const scriptUserPrompt = `Story Foundation: ${storyResult.expandedStory}

Create a complete sleep hypnosis script (~3000 words) based on this story.

CRITICAL: Preserve ALL specific details from the story:
- Historical periods, dates
- Locations and place names
- Named individuals
- Specific objects and settings
Keep these details throughout the script!

Format as JSON:
{
  "fullScript": "The complete 3000-word hypnosis script here..."
}`;

  const scriptResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    system: scriptSystemPrompt,
    messages: [{ role: 'user', content: scriptUserPrompt }],
  });

  const scriptContent = scriptResponse.content[0];
  if (scriptContent.type !== 'text') {
    throw new Error('Expected text response from Script Generator');
  }

  let scriptJson = scriptContent.text.trim();
  if (scriptJson.startsWith('```json')) {
    scriptJson = scriptJson.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
  } else if (scriptJson.startsWith('```')) {
    scriptJson = scriptJson.replace(/```\n?/g, '').replace(/```\n?$/g, '');
  }

  const scriptResult = JSON.parse(scriptJson);
  const wordCount = scriptResult.fullScript.split(/\s+/).length;
  console.log(`✅ Script Generator complete (${wordCount} words)`);

  return {
    storyOutline: storyResult.expandedStory,
    fullScript: scriptResult.fullScript
  };
}

/**
 * Run test suite
 */
async function runTests() {
  console.log('🧪 DREAM Context Preservation Test Suite\n');
  console.log('Testing how well context flows through the pipeline:');
  console.log('Journey Input → Story Shaper → Script Generator\n');
  console.log('='.repeat(70));

  const results: AnalysisResult[] = [];

  for (const testCase of testCases) {
    console.log(`\n\n📋 Test Case: ${testCase.name}`);
    console.log('-'.repeat(70));
    console.log(`\n📝 Journey Input:\n"${testCase.journeyInput}"\n`);
    console.log(`🎯 Keywords to Check:`);
    Object.entries(testCase.keywordChecks).forEach(([category, keywords]) => {
      console.log(`   • ${category}: [${keywords.join(', ')}]`);
    });

    try {
      // Generate DREAM
      const { storyOutline, fullScript } = await generateTestDream(testCase.journeyInput);

      // Analyze Story Outline
      console.log('\n🔍 Analyzing Story Outline...');
      const storyAnalysis = checkKeywords(storyOutline, testCase.keywordChecks);

      // Analyze Full Script
      console.log('🔍 Analyzing Full Script...');
      const scriptAnalysis = checkKeywords(fullScript, testCase.keywordChecks);

      // Determine degradation point
      let degradationPoint = '✅ No degradation detected';
      if (storyAnalysis.score === 100 && scriptAnalysis.score < 100) {
        degradationPoint = '❌ Script Generator (Step 2) - Context lost during script generation';
      } else if (storyAnalysis.score < 100 && scriptAnalysis.score < 100) {
        degradationPoint = '❌ Story Shaper (Step 1) - Context lost in initial story expansion';
      } else if (storyAnalysis.score < 100) {
        degradationPoint = '❌ Story Shaper (Step 1) - Partial context loss in story';
      }

      results.push({
        testCase: testCase.name,
        storyOutlineAnalysis: storyAnalysis,
        fullScriptAnalysis: scriptAnalysis,
        degradationPoint
      });

      // Print results
      console.log('\n' + '='.repeat(70));
      console.log('📊 RESULTS');
      console.log('='.repeat(70));

      console.log(`\n📖 Story Outline (Step 1):`);
      console.log(`   Score: ${storyAnalysis.score}%`);
      console.log(`   ✅ Found (${storyAnalysis.found.length}/${Object.keys(testCase.keywordChecks).length}):`);
      storyAnalysis.found.forEach(f => console.log(`      • ${f}`));
      if (storyAnalysis.missing.length > 0) {
        console.log(`   ❌ Missing (${storyAnalysis.missing.length}):`);
        storyAnalysis.missing.forEach(m => console.log(`      • ${m}`));
      }

      console.log(`\n📜 Full Script (Step 2):`);
      console.log(`   Score: ${scriptAnalysis.score}%`);
      console.log(`   ✅ Found (${scriptAnalysis.found.length}/${Object.keys(testCase.keywordChecks).length}):`);
      scriptAnalysis.found.forEach(f => console.log(`      • ${f}`));
      if (scriptAnalysis.missing.length > 0) {
        console.log(`   ❌ Missing (${scriptAnalysis.missing.length}):`);
        scriptAnalysis.missing.forEach(m => console.log(`      • ${m}`));
      }

      console.log(`\n🎯 Degradation Point: ${degradationPoint}`);

      // Save artifacts for inspection
      const fs = await import('fs');
      const path = await import('path');
      const artifactsDir = path.join(process.cwd(), 'tests', 'artifacts');
      await fs.promises.mkdir(artifactsDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const baseFilename = `${testCase.name.toLowerCase().replace(/\s+/g, '-')}_${timestamp}`;
      
      await fs.promises.writeFile(
        path.join(artifactsDir, `${baseFilename}_story.txt`),
        storyOutline
      );
      await fs.promises.writeFile(
        path.join(artifactsDir, `${baseFilename}_script.txt`),
        fullScript
      );
      
      console.log(`\n💾 Artifacts saved to tests/artifacts/`);
      console.log(`   • ${baseFilename}_story.txt`);
      console.log(`   • ${baseFilename}_script.txt`);

    } catch (error: any) {
      console.error(`\n❌ Test failed: ${error.message}`);
      if (error.stack) {
        console.error(error.stack);
      }
    }
  }

  console.log('\n\n' + '='.repeat(70));
  console.log('🏁 TEST SUITE COMPLETE');
  console.log('='.repeat(70) + '\n');
}

// Run tests
runTests().catch(console.error);
