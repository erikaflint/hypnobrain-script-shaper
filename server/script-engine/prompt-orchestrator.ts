/**
 * PROMPT ORCHESTRATOR
 * 
 * Multi-stage generation system:
 * Stage 1: Outline (structure the script)
 * Stage 2: Draft (flesh out the content)
 * Stage 3: Polish (refine language and principles)
 * 
 * Each stage enforces IP principles and builds on previous stage.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { ScriptEngineOutput } from './index';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

export interface OrchestrationInput {
  engineOutput: ScriptEngineOutput;
  presentingIssue: string;
  desiredOutcome: string;
  dimensionPrompt: string; // From DimensionAssembler
  targetWordCount?: number;
  emergenceType?: 'regular' | 'sleep'; // How to bring them out
}

export interface OrchestrationResult {
  outline: string;
  draft: string;
  final: string;
  stageReasoningLogs: {
    outline: string[];
    draft: string[];
    polish: string[];
  };
}

export class PromptOrchestrator {
  /**
   * Main orchestration: 3-stage generation
   */
  async orchestrate(input: OrchestrationInput): Promise<OrchestrationResult> {
    const wordCount = input.targetWordCount || 1500;
    const stageReasoningLogs = {
      outline: [] as string[],
      draft: [] as string[],
      polish: [] as string[]
    };

    // Stage 1: Generate Outline
    stageReasoningLogs.outline.push('=== STAGE 1: OUTLINE ===');
    const outline = await this.generateOutline(input);
    stageReasoningLogs.outline.push('Outline generated with 4 phases: Induction, Deepening, Work, Emergence');

    // Stage 2: Generate Draft from Outline
    stageReasoningLogs.draft.push('=== STAGE 2: DRAFT ===');
    const draft = await this.generateDraft(input, outline, wordCount);
    stageReasoningLogs.draft.push(`Draft generated (~${wordCount} words)`);

    // Stage 3: Polish Draft
    stageReasoningLogs.polish.push('=== STAGE 3: POLISH ===');
    const final = await this.polishDraft(input, draft);
    stageReasoningLogs.polish.push('Final script polished for principles and flow');

    return {
      outline,
      draft,
      final,
      stageReasoningLogs
    };
  }

  /**
   * Stage 1: Generate structural outline
   */
  private async generateOutline(input: OrchestrationInput): Promise<string> {
    const { engineOutput, presentingIssue, desiredOutcome, emergenceType = 'regular' } = input;

    const systemPrompt = `${engineOutput.enhancedSystemPrompt}

You are creating a STRUCTURAL OUTLINE for a hypnosis script. Focus on the architecture, not the full language.`;

    const userPrompt = `CLIENT CONTEXT:
- Presenting Issue: ${presentingIssue}
- Desired Outcome: ${desiredOutcome}

SELECTED NARRATIVE ARCS:
${engineOutput.generationContract.selectedArcs.map(a => `- ${a.arcName}: ${a.promptIntegration}`).join('\n')}

${engineOutput.generationContract.primaryMetaphor ? `PRIMARY METAPHOR: ${engineOutput.generationContract.primaryMetaphor.family}
Images to use: ${engineOutput.generationContract.primaryMetaphor.primaryImages.join(', ')}` : ''}

TASK: Create a STRUCTURAL OUTLINE (not full script) with 4 phases:

1. INDUCTION (5-7 bullet points)
   - How will you ground them somatically? (Principle 1)
   - What opening language sets the permissive tone?

2. DEEPENING (4-6 bullet points)
   - How will you deepen the trance?
   - Which narrative arc(s) introduce the work?

3. THERAPEUTIC WORK (6-8 bullet points)
   - How will each selected narrative arc be woven in?
   - How will the primary metaphor be maintained?
   - What's the progression of language (permissive → directive)?

4. EMERGENCE (3-5 bullet points)
   ${emergenceType === 'sleep' 
     ? '- How will you allow them to drift naturally into sleep?\n   - Keep the metaphor flowing as they settle into rest\n   - No counting up, no "alert and awake" - let them sleep peacefully'
     : '- How will you bring them out safely?\n   - Where is the ego strengthening? (Principle 6)\n   - Count from 1-5 to full alert awareness'}

Output the outline as clear, structured bullet points. This is architectural planning, not script writing.`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Expected text response');
    }

    return textContent.text;
  }

  /**
   * Stage 2: Generate full draft from outline
   */
  private async generateDraft(
    input: OrchestrationInput,
    outline: string,
    targetWords: number
  ): Promise<string> {
    const { engineOutput, presentingIssue, desiredOutcome, dimensionPrompt } = input;

    const systemPrompt = `${engineOutput.enhancedSystemPrompt}

You are now writing the FULL DRAFT of the hypnosis script based on the approved outline.`;

    const userPrompt = `${dimensionPrompt}

CLIENT CONTEXT:
- Presenting Issue: ${presentingIssue}
- Desired Outcome: ${desiredOutcome}

APPROVED OUTLINE:
${outline}

STRUCTURED INSTRUCTIONS:
${engineOutput.structuredInstructions.join('\n')}

TASK: Write the COMPLETE HYPNOSIS SCRIPT (~${targetWords} words) following the outline exactly.

Requirements:
1. Follow the outline structure precisely
2. Apply all ${engineOutput.structuredInstructions.length} instructions above
3. Maintain ${engineOutput.generationContract.primaryMetaphor?.family || 'consistent'} metaphor throughout
4. Weave in narrative arcs: ${engineOutput.generationContract.selectedArcs.map(a => a.arcName).join(', ')}
5. Language progression: permissive (opening) → directive (work) → permissive (close)

Write the full script now. No JSON, just the script text.`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Expected text response');
    }

    return textContent.text;
  }

  /**
   * Stage 3: Polish the draft for principles and flow
   */
  private async polishDraft(
    input: OrchestrationInput,
    draft: string
  ): Promise<string> {
    const { engineOutput } = input;

    const systemPrompt = `${engineOutput.enhancedSystemPrompt}

You are POLISHING the final hypnosis script. Focus on refinement, not rewriting.`;

    const userPrompt = `DRAFT SCRIPT:
${draft}

QUALITY CHECKLIST:
${engineOutput.principleDirectives.qualityReminders.join('\n')}

TASK: Polish this draft to ensure ALL 6 core principles are perfectly executed:

1. Somatic Anchoring Early - Is it in first 100-150 words? ✓
2. Metaphor Consistency - Is ONE metaphor used throughout? ✓
3. Adaptive Language - Does complexity match client level? ✓
4. Permissive-Directive Gradient - Clear progression? ✓
5. Safety Language - Present throughout? ✓
6. Ego Strengthening - Strong closure? ✓

CRITICAL TONAL BALANCE CHECK:
- Pattern: 1 direct command → 2-3 soft invitations
- Scan for "you...you...you" repetition and rewrite using body-as-subject
- Remove ANY cognitive instructions (think about, remember times when, recall, consider)
- Replace visual commands (see, visualize) with inclusive language (notice, sense, imagine)
- Eliminate clichés and em dashes
- Ensure varied sentence length for trance modulation

Output the POLISHED FINAL SCRIPT. Preserve the draft's flow but refine for principles AND language mastery.`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Expected text response');
    }

    return textContent.text;
  }

  /**
   * Quick single-stage generation (for backwards compatibility)
   */
  async generateSingleStage(
    input: OrchestrationInput
  ): Promise<string> {
    const { engineOutput, presentingIssue, desiredOutcome, dimensionPrompt } = input;

    const systemPrompt = `${engineOutput.enhancedSystemPrompt}

## GENERATION CONTRACT
Selected Narrative Arcs: ${engineOutput.generationContract.selectedArcs.map(a => a.arcName).join(', ')}
Primary Metaphor: ${engineOutput.generationContract.primaryMetaphor?.family || 'None'}`;

    const userPrompt = `${dimensionPrompt}

CLIENT CONTEXT:
- Presenting Issue: ${presentingIssue}
- Desired Outcome: ${desiredOutcome}

STRUCTURED INSTRUCTIONS:
${engineOutput.structuredInstructions.join('\n')}

TASK: Generate a COMPLETE hypnosis script (1500-2000 words) following ALL instructions above.

Requirements:
1. All phases: Induction → Deepening → Therapeutic Work → Emergence
2. Somatic anchoring in first 100-150 words (Principle 1)
3. Maintain ${engineOutput.generationContract.primaryMetaphor?.family || 'consistent'} metaphor (Principle 2)
4. Apply all selected narrative arcs
5. Safety language throughout (Principle 5)
6. Ego strengthening in closure (Principle 6)

Write the script now. No JSON, just the script text.`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Expected text response');
    }

    return textContent.text;
  }
}

export const promptOrchestrator = new PromptOrchestrator();
