/**
 * EGO STRENGTHENING MODULE
 * 
 * Based on Hartland's classic approach, modernized for HypnoBrain.
 * This module can:
 * 1. Sprinkle ego strengthening throughout scripts (3-5 statements)
 * 2. Generate meaningful chunks for script endings
 * 3. Create standalone ego strengthening scripts
 * 
 * Used by: ScriptEngine (clinical), DREAM pipeline, and standalone generation
 */

export interface EgoModuleInput {
  // Context
  presentingIssue?: string;
  desiredOutcome?: string;
  
  // Style
  mode: 'sprinkle' | 'chunk' | 'standalone';
  emergenceType: 'wake' | 'sleep'; // wake = energizing, sleep = calming
  intensity?: 'gentle' | 'moderate' | 'powerful'; // Default: moderate
  
  // Integration
  scriptContext?: string; // Existing script text for context
  metaphorFamily?: string; // e.g., "ocean", "mountain" for integration
  
  // Length (for standalone only)
  targetWordCount?: number;
}

export interface EgoModuleOutput {
  // Generated content
  content: string;
  
  // Metadata
  statementsGenerated: number;
  categoriesUsed: string[];
  
  // Quality validation
  quality: {
    passed: boolean;
    issues: string[];
  };
  
  // For logging
  directives: string[];
}

/**
 * Quality validation for ego strengthening content
 */
export interface EgoQualityCheck {
  name: string;
  passed: boolean;
  details: string;
}

export class EgoModule {
  private version = '1.0.0';
  
  /**
   * Generate ego strengthening content
   */
  async generate(input: EgoModuleInput): Promise<EgoModuleOutput> {
    const directives: string[] = [];
    
    // Build directives based on mode
    switch (input.mode) {
      case 'sprinkle':
        return this.generateSprinkle(input);
      case 'chunk':
        return this.generateChunk(input);
      case 'standalone':
        return this.generateStandalone(input);
    }
  }
  
  /**
   * Sprinkle mode: 3-5 statements scattered throughout script
   */
  private async generateSprinkle(input: EgoModuleInput): Promise<EgoModuleOutput> {
    const directives = this.buildSprinkleDirectives(input);
    
    // TODO: Call AI service to generate
    // For now, return structure
    return {
      content: '', // Will be filled by AI
      statementsGenerated: 0,
      categoriesUsed: [],
      quality: {
        passed: true,
        issues: []
      },
      directives
    };
  }
  
  /**
   * Chunk mode: Meaningful segment for script ending (Hartland-style)
   */
  private async generateChunk(input: EgoModuleInput): Promise<EgoModuleOutput> {
    const directives = this.buildChunkDirectives(input);
    
    return {
      content: '',
      statementsGenerated: 0,
      categoriesUsed: [],
      quality: {
        passed: true,
        issues: []
      },
      directives
    };
  }
  
  /**
   * Standalone mode: Full Hartland-style ego strengthening script
   */
  private async generateStandalone(input: EgoModuleInput): Promise<EgoModuleOutput> {
    const directives = this.buildStandaloneDirectives(input);
    
    return {
      content: '',
      statementsGenerated: 0,
      categoriesUsed: [],
      quality: {
        passed: true,
        issues: []
      },
      directives
    };
  }
  
  /**
   * Build directives for sprinkle mode
   */
  private buildSprinkleDirectives(input: EgoModuleInput): string[] {
    const directives: string[] = [];
    const intensity = input.intensity || 'moderate';
    
    // Core instruction
    directives.push('=== EGO STRENGTHENING: SPRINKLE MODE ===');
    directives.push('');
    directives.push('SELECT 3-5 FUNCTIONAL IMPROVEMENTS MAXIMUM - choose from categories below');
    directives.push('DISTRIBUTE across script: 1 in opening, 1-2 in middle, 1-2 near end');
    directives.push('KEEP EACH STATEMENT TO 1-2 SENTENCES - then continue narrative');
    
    // Metaphor integration
    if (input.metaphorFamily) {
      directives.push(`TIE TO METAPHOR when possible: "Like the ${input.metaphorFamily}, your [improvement]..."`);
    }
    
    directives.push('NEVER DUMP AS A LIST - space naturally throughout the script flow');
    directives.push('');
    
    // Emergence-specific style
    if (input.emergenceType === 'wake') {
      directives.push('WAKE-UP STYLE: Energizing, forward-looking, activating');
      directives.push('- Use present progressive: "becoming stronger", "growing clearer"');
      directives.push('- Reference the day ahead: "as you move through today"');
      directives.push('- Emphasis on energy, clarity, confidence');
    } else {
      directives.push('SLEEP STYLE: Calming, settling, restorative');
      directives.push('- Use gentle present tense: "your body healing", "sleep deepening"');
      directives.push('- Reference the night: "as you rest tonight", "through the night"');
      directives.push('- Emphasis on restoration, peace, replenishment');
    }
    directives.push('');
    
    // Functional categories
    directives.push('Functional Improvement Categories (SELECT 3-5 TOTAL):');
    directives.push('');
    
    directives.push('PHYSICAL RESTORATION:');
    directives.push('- "Your body healing and replenishing completely"');
    directives.push('- "Immune system strengthening naturally"');
    directives.push('');
    
    directives.push('SLEEP QUALITY (if sleep emergence):');
    directives.push('- "Your sleep deepening night after night"');
    directives.push('- "Rest becoming more restorative"');
    directives.push('');
    
    directives.push('COGNITIVE ENHANCEMENT:');
    directives.push('- "Memory becoming clearer, words flowing easily"');
    directives.push('- "Focus sharpening, concentration improving"');
    directives.push('');
    
    directives.push('ENERGY & VITALITY (if wake emergence):');
    directives.push('- "Your energy replenishing completely"');
    directives.push('- "Vitality returning to every cell"');
    directives.push('');
    
    directives.push('STRESS RESPONSE:');
    directives.push('- "Your nervous system learning deeper calm"');
    directives.push('- "Stress response becoming more balanced"');
    directives.push('');
    
    // Distribution pattern
    directives.push('DISTRIBUTION PATTERN:');
    directives.push('- Opening (1 statement): Tie to body awareness or initial settling');
    directives.push('- Middle (1-2 statements): Weave into main narrative, tied to metaphor if possible');
    directives.push('- Near End (1-2 statements): As they prepare to emerge/drift');
    directives.push('');
    
    directives.push('CRITICAL: Each statement = 1-2 sentences MAX, then return to main narrative');
    
    return directives;
  }
  
  /**
   * Build directives for chunk mode (meaningful ending segment)
   */
  private buildChunkDirectives(input: EgoModuleInput): string[] {
    const directives: string[] = [];
    
    directives.push('=== EGO STRENGTHENING: CHUNK MODE (Hartland-Style) ===');
    directives.push('');
    directives.push('Generate a meaningful 150-250 word ego strengthening segment for script ending');
    directives.push('Based on Hartland\'s classic approach, modernized with permission language');
    directives.push('');
    
    directives.push('STRUCTURE:');
    directives.push('1. Acknowledge their deep state: "In this deeply relaxed state..."');
    directives.push('2. Build on wholeness: "Your mind and body already know..."');
    directives.push('3. Layer improvements (5-8 total):');
    directives.push('   - Physical strength & energy');
    directives.push('   - Mental clarity & focus');
    directives.push('   - Emotional stability & calm');
    directives.push('   - Confidence & self-reliance');
    directives.push('   - Overall well-being');
    directives.push('4. Future pacing: "Every day from this moment forward..."');
    directives.push('5. Seal it: "These changes happen naturally, powerfully, completely"');
    directives.push('');
    
    if (input.emergenceType === 'wake') {
      directives.push('WAKE STYLE: Forward momentum, ready to engage');
    } else {
      directives.push('SLEEP STYLE: Settling deeper, allowing rest to complete the work');
    }
    
    return directives;
  }
  
  /**
   * Build directives for standalone mode (full script)
   */
  private buildStandaloneDirectives(input: EgoModuleInput): string[] {
    const directives: string[] = [];
    const targetWords = input.targetWordCount || 1500;
    
    directives.push('=== EGO STRENGTHENING: STANDALONE SCRIPT ===');
    directives.push('');
    directives.push(`Target: ${targetWords} words of pure Hartland-style ego strengthening`);
    directives.push('');
    
    directives.push('FULL SCRIPT STRUCTURE:');
    directives.push('');
    directives.push('1. OPENING (200-300 words):');
    directives.push('   - Acknowledge deep relaxation');
    directives.push('   - Establish receptivity: "Your mind is highly sensitive and receptive..."');
    directives.push('   - Permission framework: "Everything you allow into your mind..."');
    directives.push('');
    
    directives.push('2. CORE STRENGTHENING (800-1000 words):');
    directives.push('   - Physical: Strength, energy, vitality, health');
    directives.push('   - Mental: Clarity, focus, memory, perspective');
    directives.push('   - Emotional: Calm, stability, confidence, resilience');
    directives.push('   - Social: Independence, self-reliance, standing your ground');
    directives.push('   - Each category builds in "every day" rhythm');
    directives.push('');
    
    directives.push('3. INTEGRATION (200-300 words):');
    directives.push('   - "Because all these things happen exactly as described..."');
    directives.push('   - Future pacing: "Every day from this moment forward..."');
    directives.push('   - Overall well-being, happiness, optimism');
    directives.push('');
    
    directives.push('4. EMERGENCE (100-200 words):');
    if (input.emergenceType === 'wake') {
      directives.push('   - Count up to alertness (1...2...3...)');
      directives.push('   - "Returning refreshed, energized, confident"');
      directives.push('   - "Carrying these truths with you"');
    } else {
      directives.push('   - Drift deeper into restorative sleep');
      directives.push('   - "These truths settling into every cell"');
      directives.push('   - "Night completing this powerful work"');
    }
    directives.push('');
    
    directives.push('HARTLAND PRINCIPLES:');
    directives.push('- Use "every day" rhythm for building momentum');
    directives.push('- "Much more... much less..." patterns for contrast');
    directives.push('- "Because of this..." for logical progression');
    directives.push('- Present progressive: "becoming stronger", "growing clearer"');
    directives.push('- Layer improvements systematically, not randomly');
    
    return directives;
  }
  
  /**
   * Validate generated ego strengthening content
   */
  validate(content: string, mode: 'sprinkle' | 'chunk' | 'standalone'): EgoQualityCheck[] {
    const checks: EgoQualityCheck[] = [];
    
    if (mode === 'sprinkle') {
      checks.push(this.checkDistribution(content));
      checks.push(this.checkNoDumps(content));
    }
    
    // Common checks
    checks.push(this.checkKeywordPresence(content));
    
    return checks;
  }
  
  /**
   * Check that ego strengthening is distributed (not dumped)
   */
  private checkDistribution(content: string): EgoQualityCheck {
    const keywords = [
      'sleep', 'immune', 'memory', 'energy', 'clarity', 'focus',
      'healing', 'replenish', 'strengthen', 'deepen', 'improv',
      'restor', 'vitality', 'nervous system', 'calm', 'stress'
    ];
    
    const paragraphs = content
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 50);
    
    if (paragraphs.length === 0) {
      return {
        name: "Ego Distribution",
        passed: false,
        details: "Content too short"
      };
    }
    
    // Count actual occurrences per paragraph
    const keywordsPerParagraph = paragraphs.map(para => {
      const lowerPara = para.toLowerCase();
      let count = 0;
      keywords.forEach(kw => {
        const regex = new RegExp(kw, 'gi');
        const matches = lowerPara.match(regex) || [];
        count += matches.length;
      });
      return count;
    });
    
    const maxInOneParagraph = Math.max(...keywordsPerParagraph);
    
    if (maxInOneParagraph > 3) {
      return {
        name: "Ego Distribution",
        passed: false,
        details: `Dumped in one paragraph (${maxInOneParagraph} keywords)`
      };
    }
    
    return {
      name: "Ego Distribution",
      passed: true,
      details: "Well distributed throughout"
    };
  }
  
  /**
   * Check no paragraph dumps
   */
  private checkNoDumps(content: string): EgoQualityCheck {
    // Same as checkDistribution for now
    return this.checkDistribution(content);
  }
  
  /**
   * Check functional improvement keywords are present
   */
  private checkKeywordPresence(content: string): EgoQualityCheck {
    const keywords = ['strong', 'clear', 'calm', 'confident', 'energy', 'focus'];
    const lowerContent = content.toLowerCase();
    
    const found = keywords.filter(kw => lowerContent.includes(kw));
    
    if (found.length < 3) {
      return {
        name: "Functional Keywords",
        passed: false,
        details: `Only ${found.length} functional improvement keywords found (need 3+)`
      };
    }
    
    return {
      name: "Functional Keywords",
      passed: true,
      details: `${found.length} functional improvement keywords present`
    };
  }
}
