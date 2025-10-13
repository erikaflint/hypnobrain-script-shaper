/**
 * PRINCIPLE ENFORCER
 * Translates the 6 Core Principles into structured AI prompt directives
 * Ensures every generated script follows the methodology
 */

import principlesConfig from './config/principles.json';

export interface PrincipleDirectives {
  systemPrompt: string;
  structuredInstructions: string[];
  qualityReminders: string[];
  principlesSummary: string;
}

export interface EnforcerInput {
  clientLevel?: 'beginner' | 'intermediate' | 'advanced';
  symbolicDimensionLevel?: number;
  targetTranceDep?: 'light' | 'medium' | 'deep';
  emergenceType?: 'regular' | 'sleep';
}

export class PrincipleEnforcer {
  private principles: any[];

  constructor() {
    this.principles = principlesConfig.principles;
  }

  /**
   * Main method: Generate comprehensive principle directives for AI
   */
  public generateDirectives(input: EnforcerInput = {}): PrincipleDirectives {
    const {
      clientLevel = 'beginner',
      symbolicDimensionLevel = 30,
      targetTranceDep = 'medium',
      emergenceType = 'regular'
    } = input;

    // Build system prompt embedding all principles
    const systemPrompt = this.buildSystemPrompt();
    
    // Build structured instructions for each principle
    const structuredInstructions = this.buildStructuredInstructions(
      clientLevel,
      symbolicDimensionLevel,
      targetTranceDep,
      emergenceType
    );
    
    // Build quality reminders (what to check)
    const qualityReminders = this.buildQualityReminders();
    
    // Build principles summary for logging
    const principlesSummary = this.buildPrinciplesSummary();
    
    return {
      systemPrompt,
      structuredInstructions,
      qualityReminders,
      principlesSummary
    };
  }

  /**
   * Build comprehensive system prompt
   */
  private buildSystemPrompt(): string {
    const intro = `You are an expert hypnotherapist trained in the Erika Flint 8-Dimensional Hypnosis methodology.

Your scripts must follow the 6 Core Principles that define transformative hypnosis:

`;

    const principleDescriptions = this.principles.map((p, i) => 
      `${i + 1}. **${p.name}**: ${p.description}\n   ${p.why}`
    ).join('\n\n');

    const closing = `\n\nThese principles are non-negotiable. Every script you generate must honor all six principles.

Remember: The client is whole, not broken. Your role is to remind them of what they already know, remove obstacles, and allow natural healing to unfold.`;

    return intro + principleDescriptions + closing;
  }

  /**
   * Build structured instructions based on client level and dimensions
   */
  private buildStructuredInstructions(
    clientLevel: string,
    symbolicLevel: number,
    tranceDepth: string,
    emergenceType: string
  ): string[] {
    const instructions: string[] = [];

    // Principle 1: Somatic Anchoring
    const somaticPrinciple = this.principles.find(p => p.id === 'somatic-anchoring');
    if (somaticPrinciple) {
      instructions.push(...somaticPrinciple.prompt_directives);
    }

    // Principle 2: Metaphor Consistency
    const metaphorPrinciple = this.principles.find(p => p.id === 'metaphor-consistency');
    if (metaphorPrinciple && symbolicLevel > 40) {
      instructions.push(...metaphorPrinciple.prompt_directives);
    } else if (symbolicLevel <= 40) {
      instructions.push('Use minimal metaphorical language - focus on direct, concrete suggestions');
    }

    // Principle 3: Language Rhythm
    const rhythmPrinciple = this.principles.find(p => p.id === 'language-rhythm');
    if (rhythmPrinciple) {
      const rhythmInstructions = this.buildRhythmInstructions(tranceDepth);
      instructions.push(...rhythmInstructions);
    }

    // Principle 4: Emotional Safety
    const safetyPrinciple = this.principles.find(p => p.id === 'emotional-safety');
    if (safetyPrinciple) {
      const safetyInstructions = this.buildSafetyInstructions(clientLevel);
      instructions.push(...safetyInstructions);
    }

    // Principle 5: Specificity Without Prescription
    const specificityPrinciple = this.principles.find(p => p.id === 'specificity-without-prescription');
    if (specificityPrinciple) {
      instructions.push(...specificityPrinciple.prompt_directives);
    }

    // Principle 6: Inherent Wholeness / Emergence
    const wholenessPrinciple = this.principles.find(p => p.id === 'inherent-wholeness');
    if (wholenessPrinciple) {
      if (emergenceType === 'sleep') {
        // Sleep emergence: No counting up, allow natural drift to sleep
        instructions.push('EMERGENCE (Sleep): Allow client to drift naturally into peaceful sleep');
        instructions.push('- Continue metaphor and somatic language as they settle deeper into rest');
        instructions.push('- Use language like "drifting", "settling", "resting peacefully"');
        instructions.push('- NO counting up, NO "alert and awake", NO return to full consciousness');
        instructions.push('- Let the script gently fade as they transition into natural sleep');
      } else {
        // Regular emergence: Standard ego strengthening + count up
        instructions.push(...wholenessPrinciple.prompt_directives);
      }
    }

    return instructions;
  }

  /**
   * Build rhythm instructions based on trance depth
   */
  private buildRhythmInstructions(tranceDepth: string): string[] {
    const rhythmPrinciple = this.principles.find(p => p.id === 'language-rhythm');
    if (!rhythmPrinciple) return [];

    const baseInstructions = rhythmPrinciple.prompt_directives || [];
    
    // Add depth-specific guidance
    const depthGuidance: Record<string, string> = {
      'light': 'Keep sentences mostly 8-12 words for light, accessible trance',
      'medium': 'Use 12-18 word sentences for medium trance depth',
      'deep': 'Use longer 18-25 word sentences for deep, meandering trance'
    };

    return [...baseInstructions, depthGuidance[tranceDepth] || depthGuidance.medium];
  }

  /**
   * Build safety instructions based on client level
   */
  private buildSafetyInstructions(clientLevel: string): string[] {
    const safetyPrinciple = this.principles.find(p => p.id === 'emotional-safety');
    if (!safetyPrinciple) return [];

    const hierarchy = safetyPrinciple.language_hierarchy[`${clientLevel}_anxious`] || 
                      safetyPrinciple.language_hierarchy.beginner_anxious;

    const instructions = [
      `Use ${hierarchy.permissive} permissive language (might, perhaps, could, if it feels right)`,
      `Use ${hierarchy.gentle_directive || '0%'} gentle directive language`,
      `Commands should be ${hierarchy.commands || '0%'} or less of the script`
    ];

    instructions.push(...(safetyPrinciple.safety_language_library?.slice(0, 5) || []).map(
      (phrase: string) => `Include phrases like: "${phrase}"`
    ));

    return instructions;
  }

  /**
   * Build quality reminders for validation
   */
  private buildQualityReminders(): string[] {
    const reminders: string[] = [];

    for (const principle of this.principles) {
      if (principle.quality_gates) {
        for (const gate of principle.quality_gates) {
          reminders.push(`✓ ${gate.check}`);
        }
      }
    }

    return reminders;
  }

  /**
   * Build principles summary for logging
   */
  private buildPrinciplesSummary(): string {
    return this.principles.map(p => `${p.name}: ${p.rule}`).join('\n');
  }

  /**
   * Get examples for a specific principle
   */
  public getPrincipleExamples(principleId: string): string[] {
    const principle = this.principles.find(p => p.id === principleId);
    return principle?.examples || [];
  }

  /**
   * Get quality gates for a specific principle
   */
  public getQualityGates(principleId: string): any[] {
    const principle = this.principles.find(p => p.id === principleId);
    return principle?.quality_gates || [];
  }

  /**
   * Get all principle IDs
   */
  public getAllPrincipleIds(): string[] {
    return this.principles.map(p => p.id);
  }

  /**
   * Check if a principle should be enforced based on context
   */
  public shouldEnforcePrinciple(principleId: string, context: EnforcerInput): boolean {
    // Metaphor consistency only enforced if symbolic level high
    if (principleId === 'metaphor-consistency') {
      return (context.symbolicDimensionLevel || 0) > 40;
    }

    // All other principles always enforced
    return true;
  }
}
