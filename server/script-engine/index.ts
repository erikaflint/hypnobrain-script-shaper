/**
 * SCRIPT ENGINE - The IP Core
 * 
 * Orchestrates the Erika Flint 8D Hypnosis methodology:
 * - Selects narrative arcs based on client needs
 * - Enforces 6 core principles in every script
 * - Ensures metaphor consistency and quality
 * 
 * This is the "brain and heart" of HypnoBrain - the IP that transforms
 * template-based generation into methodology-driven transformation.
 */

import { StrategyPlanner, type GenerationContract, type PlannerInput } from './strategy-planner';
import { PrincipleEnforcer, type PrincipleDirectives, type EnforcerInput } from './principle-enforcer';
import type { ArcJourney } from '@shared/schema';

export interface ScriptEngineInput {
  // Client context
  presentingIssue: string;
  desiredOutcome: string;
  clientNotes?: string;
  
  // Manual arc selection (overrides auto-selection if provided)
  arcId?: string; // e.g., "earned-delight", "oasis-rest"
  
  // Arc Journey (multi-stage scripts)
  arcJourney?: ArcJourney;
  targetWordCount?: number; // For journey word distribution
  
  // Template context (from TemplateSelector)
  templatePreferredArcs?: string[];
  templateFallbackArcs?: string[];
  
  // Dimension context (from DimensionAssembler)
  symbolicDimensionLevel?: number;
  somaticDimensionLevel?: number;
  
  // Client experience level
  clientLevel?: 'beginner' | 'intermediate' | 'advanced';
  targetTranceDep?: 'light' | 'medium' | 'deep';
  
  // Emergence type
  emergenceType?: 'regular' | 'sleep'; // regular = count to alert, sleep = drift to sleep
}

export interface ScriptEngineOutput {
  // Strategy
  generationContract: GenerationContract;
  
  // Principles
  principleDirectives: PrincipleDirectives;
  
  // For AI prompting
  enhancedSystemPrompt: string;
  structuredInstructions: string[];
  
  // For logging/debugging
  reasoningLog: string[];
  engineVersion: string;
}

export class ScriptEngine {
  private planner: StrategyPlanner;
  private enforcer: PrincipleEnforcer;
  private version = '1.0.0';

  constructor() {
    this.planner = new StrategyPlanner();
    this.enforcer = new PrincipleEnforcer();
  }

  /**
   * Main orchestration method
   * Transforms client context + template into comprehensive generation directives
   */
  async generate(input: ScriptEngineInput): Promise<ScriptEngineOutput> {
    const reasoningLog: string[] = [];
    reasoningLog.push('=== SCRIPT ENGINE v1.0.0 ===');
    reasoningLog.push(`Presenting Issue: ${input.presentingIssue}`);
    reasoningLog.push(`Desired Outcome: ${input.desiredOutcome}`);
    reasoningLog.push('');

    // Step 1: Strategy Planning - select narrative arcs
    reasoningLog.push('STEP 1: STRATEGY PLANNING');
    const plannerInput: PlannerInput = {
      presentingIssue: input.presentingIssue,
      desiredOutcome: input.desiredOutcome,
      clientNotes: input.clientNotes,
      manualArcId: input.arcId, // Manual arc selection (overrides auto-selection)
      templatePreferredArcs: input.templatePreferredArcs,
      templateFallbackArcs: input.templateFallbackArcs,
      symbolicDimensionLevel: input.symbolicDimensionLevel || 30,
      // Journey parameters
      arcJourney: input.arcJourney,
      targetWordCount: input.targetWordCount
    };

    const generationContract = await this.planner.plan(plannerInput);
    reasoningLog.push(...generationContract.reasoningLog);
    reasoningLog.push('');

    // Step 2: Principle Enforcement - translate IP into prompts
    reasoningLog.push('STEP 2: PRINCIPLE ENFORCEMENT');
    const enforcerInput: EnforcerInput = {
      clientLevel: input.clientLevel || 'beginner',
      symbolicDimensionLevel: input.symbolicDimensionLevel || 30,
      targetTranceDep: input.targetTranceDep || 'medium',
      emergenceType: input.emergenceType || 'regular'
    };

    const principleDirectives = this.enforcer.generateDirectives(enforcerInput);
    reasoningLog.push(`Enforcing ${this.enforcer.getAllPrincipleIds().length} core principles`);
    reasoningLog.push(`Client level: ${input.clientLevel || 'beginner'}`);
    reasoningLog.push(`Target trance depth: ${input.targetTranceDep || 'medium'}`);
    reasoningLog.push('');

    // Step 3: Combine into enhanced AI prompts
    reasoningLog.push('STEP 3: PROMPT ASSEMBLY');
    const enhancedSystemPrompt = this.buildEnhancedSystemPrompt(
      principleDirectives,
      generationContract
    );

    const structuredInstructions = this.buildStructuredInstructions(
      principleDirectives,
      generationContract
    );

    reasoningLog.push(`System prompt: ${enhancedSystemPrompt.length} characters`);
    reasoningLog.push(`Instructions: ${structuredInstructions.length} items`);
    reasoningLog.push('');
    reasoningLog.push('=== ENGINE COMPLETE ===');

    return {
      generationContract,
      principleDirectives,
      enhancedSystemPrompt,
      structuredInstructions,
      reasoningLog,
      engineVersion: this.version
    };
  }

  /**
   * Build enhanced system prompt combining principles + narrative arcs
   */
  private buildEnhancedSystemPrompt(
    principles: PrincipleDirectives,
    contract: GenerationContract
  ): string {
    let prompt = principles.systemPrompt + '\n\n';

    // Check if this is a multi-stage Arc Journey
    if (contract.isJourney && contract.journeyStages) {
      const totalTarget = contract.journeyStages[contract.journeyStages.length - 1]?.cumulativeWordTarget || 2000;
      
      prompt += '## MULTI-STAGE ARC JOURNEY\n\n';
      prompt += `This is a ${contract.journeyStages.length}-stage therapeutic journey. Each stage moves the client through a specific transformation with allocated word budget.\n\n`;
      prompt += `**TOTAL SCRIPT TARGET: ~${totalTarget} words total** - Stay within this limit.\n\n`;
      prompt += '**CRITICAL**: Maintain smooth narrative flow between stages with seamless transitions. Each stage builds on the previous.\n\n';
      
      for (let i = 0; i < contract.journeyStages.length; i++) {
        const stage = contract.journeyStages[i];
        prompt += `### STAGE ${i + 1}: ${stage.arcName}\n`;
        prompt += `- Word Budget: ~${stage.wordBudget} words (${stage.weight}% of script)\n`;
        prompt += `- Cumulative Target: ${stage.cumulativeWordTarget} words by end of this stage\n`;
        if (stage.transitionGoal) {
          prompt += `- Transition Goal: ${stage.transitionGoal}\n`;
        }
        prompt += `- Key Language: ${stage.keyLanguage.slice(0, 3).join('; ')}\n`;
        prompt += `- Integration: ${stage.promptIntegration}\n\n`;
      }
      
      prompt += '**Journey Flow Instructions:**\n';
      prompt += '1. Begin with Stage 1 and write until you reach its cumulative word target\n';
      prompt += '2. Transition to the next stage when cumulative target is reached - use organic phrases like "And now...", "As you move deeper...", "This opens the way to..."\n';
      prompt += '3. Track your progress: check word count at each stage boundary\n';
      prompt += `4. Final stage should conclude near ${totalTarget} words and lead naturally into emergence/awakening\n`;
      prompt += `5. **STAY WITHIN TOTAL TARGET**: Do not exceed ${totalTarget} words for the complete script\n\n`;
    } else {
      // Standard single-arc or multi-arc (non-journey) script
      prompt += '## NARRATIVE ARCS FOR THIS SCRIPT\n\n';
      prompt += 'Weave the following narrative arcs into the script:\n\n';

      for (const arc of contract.selectedArcs) {
        prompt += `**${arc.arcName}**: ${arc.promptIntegration}\n`;
        prompt += `Key language: ${arc.keyLanguage.slice(0, 3).join('; ')}\n\n`;
      }
    }

    if (contract.primaryMetaphor) {
      prompt += `\n## PRIMARY METAPHOR\n\n`;
      prompt += `Use the "${contract.primaryMetaphor.family}" metaphor family.\n`;
      prompt += `Primary images: ${contract.primaryMetaphor.primaryImages.slice(0, 5).join(', ')}\n`;
      prompt += `Reason: ${contract.primaryMetaphor.reason}\n\n`;
      prompt += `**METAPHOR USAGE GUIDELINES:**\n`;
      prompt += `- Use metaphorical language 5-7 times maximum throughout the entire script\n`;
      prompt += `- Metaphors should ENHANCE the experience, not dominate it\n`;
      prompt += `- Most of the script should describe experiences directly without metaphorical comparison\n`;
      prompt += `- Avoid repetitive patterns like "like [metaphor thing]" in consecutive sentences\n`;
      prompt += `- When you do use the metaphor, make it count - use it for key moments and transitions\n`;
      prompt += `- Consistency means fitting within one metaphor world, NOT repeating it constantly\n\n`;
    }

    return prompt;
  }

  /**
   * Build structured instructions list
   */
  private buildStructuredInstructions(
    principles: PrincipleDirectives,
    contract: GenerationContract
  ): string[] {
    const instructions: string[] = [];

    // Add principle instructions
    instructions.push('=== CORE PRINCIPLES ===');
    instructions.push(...principles.structuredInstructions);
    instructions.push('');

    // Add arc-specific guidance
    instructions.push('=== NARRATIVE ARCS ===');
    for (const arc of contract.selectedArcs) {
      instructions.push(`${arc.arcName}: ${arc.promptIntegration}`);
    }
    instructions.push('');

    // Add quality reminders
    instructions.push('=== QUALITY CHECKLIST ===');
    instructions.push(...principles.qualityReminders);

    return instructions;
  }

  /**
   * Get specific examples for teaching/debugging
   */
  public getExamples(principleId: string) {
    return this.enforcer.getPrincipleExamples(principleId);
  }

  /**
   * Get metaphor examples for an issue
   */
  public getMetaphorExamples(issue: string) {
    return this.planner.getMetaphorExamples(issue);
  }
}

// Export singleton instance
export const scriptEngine = new ScriptEngine();

// Export types
export type { GenerationContract, PlannerInput, PrincipleDirectives, EnforcerInput };
