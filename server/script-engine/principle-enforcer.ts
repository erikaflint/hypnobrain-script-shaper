/**
 * PRINCIPLE ENFORCER
 * Translates the 6 Core Principles into structured AI prompt directives
 * Ensures every generated script follows the methodology
 */

import principlesConfig from './config/principles.json';
import languageMastery from './config/language-mastery.json';

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

    const languageMasteryRules = this.buildLanguageMasteryRules();

    const closing = `\n\nThese principles are non-negotiable. Every script you generate must honor all six principles.

Remember: The client is whole, not broken. Your role is to remind them of what they already know, remove obstacles, and allow natural healing to unfold.`;

    return intro + principleDescriptions + closing + '\n\n' + languageMasteryRules;
  }

  /**
   * Build language mastery rules from secret sauce
   */
  private buildLanguageMasteryRules(): string {
    const tonalBalance = `## LANGUAGE MASTERY RULES (Critical for Medicinal Quality)

### Tonal Balance: Direct Commands vs. Soft Invitations
**Pattern:** ${languageMastery.tonal_balance.ratio}
- Use direct commands ONLY for: opening, transitions, key somatic anchors, emergence
- Use soft invitations predominantly throughout deepening, metaphor journey, transformation
- NEVER stack more than 2 direct commands in a row

**Softening Techniques:**
1. Add "might" or "perhaps" → "You might notice your breath deepening..."
2. Make observations (not commands) → "Your breath finds its own rhythm..."
3. Use "as" clauses → "And as you breathe, your jaw softens..."
4. Body-as-subject → "Your heartbeat surfaces in awareness. Shoulders soften."
5. Awareness-based → "You become aware of..."`;

    const antiPatterns = `### CRITICAL: Language That DESTROYS Trance Depth
**NEVER use these phrases** (they pull client into analytical thinking):
${languageMastery.critical_anti_patterns.forbidden_phrases.map(p => `❌ "${p}"`).join('\n')}

**WHY this fails:**
- Creates cognitive load (asking them to search, select, analyze)
- Activates thinking mind instead of subconscious
- Pulls them OUT of trance into analytical mode

**INSTEAD, use direct hypnotic guidance:**
✅ "Your body remembers..." (not "remember a time when")
✅ "A feeling of [state] spreads through you..." (not "think about feeling")
✅ "Notice how [state] is already present..." (not "recall when you felt")
✅ "[State] arrives/surfaces/unfolds..." (not "select a memory of")

**RULE:** If it requires thinking, choosing, analyzing, or searching memory—REWRITE IT.
Hypnosis bypasses the thinking mind. Direct the experience; don't ask them to construct it.`;

    const bodyAsSubject = `### Eliminate "You...You...You" Repetition
**NEVER stack multiple "you" constructions in consecutive sentences**

❌ WRONG: "You notice your breath. You feel your shoulders. You sense your heartbeat."
✅ RIGHT: "Your breath deepens. Shoulders soften. And beneath it all, your heartbeat—steady, certain."

Use body-as-subject variations:
- Your [body part] + verb
- [Sensation] + verb (Warmth spreads, Tension releases)
- [State] arrives/emerges/unfolds`;

    const sensoryLanguage = `### Inclusive Sensory Language
**NEVER use visual-only commands:**
❌ "See the...", "Visualize...", "Picture..."

**ALWAYS use universal alternatives:**
✅ "Notice...", "Sense...", "Allow...", "Imagine...", "Experience...", "Become aware of..."`;

    const craftRules = `### Language Craft (Fresh, Natural, Poetic)
**FORBIDDEN:**
- Clichés: "Deeper and deeper", "10...9...8...", "More and more relaxed"
- Em dashes (—)
- AI patterns: "It's important to...", "You may find that...", "As you continue to..."

**Sentence Variety for Trance Modulation:**
- Short for emphasis (3-5 words): "Feel your breath. Notice now. Rest here."
- Medium for guidance (8-15 words): "Your shoulders soften, releasing the weight they've carried."
- Long for deepening (18-30 words): "And as you settle deeper into this peaceful state, your body remembers what it's always known..."`;

    return [tonalBalance, antiPatterns, bodyAsSubject, sensoryLanguage, craftRules].join('\n\n');
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

    // Core principle quality gates
    for (const principle of this.principles) {
      if (principle.quality_gates) {
        for (const gate of principle.quality_gates) {
          reminders.push(`✓ ${gate.check}`);
        }
      }
    }

    // Language mastery quality checks (from secret sauce)
    reminders.push('');
    reminders.push('=== LANGUAGE MASTERY CHECKS ===');
    reminders.push('✓ No hypnosis clichés or AI-style phrasing');
    reminders.push('✓ NO cognitive/reflective instructions ("think about", "remember times when", "consider", "recall")');
    reminders.push('✓ ALL language creates direct experience rather than asking client to search/select');
    reminders.push('✓ Body awareness anchors throughout');
    reminders.push('✓ Inclusive sensory language only ("notice" not "see")');
    reminders.push('✓ Natural, invitational tone (never lecturing or instructing)');
    reminders.push('✓ Maintains trance depth (never pulls them into analytical thinking)');
    reminders.push('✓ Feels restorative and medicinal, not mechanical');
    reminders.push('✓ Varied sentence length for rhythm');
    reminders.push('✓ No em dashes, no "you...you...you" stacking');
    reminders.push('');
    reminders.push('=== TRANCE DEPTH TEST ===');
    reminders.push('Read through script: If ANY sentence would cause client to pause and think, search memory, or make a decision—REWRITE IT.');
    reminders.push('Every sentence should deepen or maintain trance, never lighten it.');

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
