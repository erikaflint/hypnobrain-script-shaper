/**
 * EGO STRENGTHENING MODULE
 * 
 * Based on Hartland's classic approach, modernized with Benefit Cascade Pattern.
 * This module can:
 * 1. Generate Benefit Cascade (causal chains showing transformation) - placed at script end
 * 2. Generate meaningful chunks for script endings (Hartland-style)
 * 3. Create standalone ego strengthening scripts
 * 
 * The Benefit Cascade Pattern replaces flat benefit lists with narrative causal chains
 * that show how changes naturally lead to the client's desired outcome.
 * 
 * Used by: ScriptEngine (clinical), DREAM pipeline, and standalone generation
 */

import egoConfig from './ego-config.json';

export interface EgoModuleInput {
  // Context
  presentingIssue?: string;
  desiredOutcome?: string;
  
  // Style
  mode: 'cascade' | 'chunk' | 'standalone';
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
  private config: typeof egoConfig;
  
  constructor() {
    this.config = egoConfig;
  }
  
  /**
   * Generate ego strengthening content
   */
  async generate(input: EgoModuleInput): Promise<EgoModuleOutput> {
    const directives: string[] = [];
    
    // Build directives based on mode
    switch (input.mode) {
      case 'cascade':
        return this.generateCascade(input);
      case 'chunk':
        return this.generateChunk(input);
      case 'standalone':
        return this.generateStandalone(input);
    }
  }
  
  /**
   * Cascade mode: Benefit cascade pattern showing transformation through causal chains
   */
  private async generateCascade(input: EgoModuleInput): Promise<EgoModuleOutput> {
    const directives = this.buildCascadeDirectives(input);
    
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
   * Build directives for cascade mode (Benefit Cascade Pattern)
   */
  private buildCascadeDirectives(input: EgoModuleInput): string[] {
    const directives: string[] = [];
    const cascadeMode = this.config.modes.cascade;
    const experientialCascades = this.config.experiential_cascades;
    
    // Core instruction
    directives.push('=== BENEFIT CASCADE PATTERN ===');
    directives.push('');
    directives.push(`PLACEMENT: ${cascadeMode.placement}`);
    directives.push(`TARGET: ${cascadeMode.target_words[0]}-${cascadeMode.target_words[1]} words`);
    directives.push('');
    
    // Core approach
    directives.push('LANGUAGE PHILOSOPHY:');
    directives.push('PAINT SCENES, don\'t explain causality.');
    directives.push('Client\'s mind is open at script end - they experience benefits in a new way.');
    directives.push(`APPROACH: ${cascadeMode.approach}`);
    directives.push('');
    
    // Language style
    directives.push('LANGUAGE STYLE:');
    directives.push(`PREFER: ${cascadeMode.language_style.prefer}`);
    directives.push(`AVOID: ${cascadeMode.language_style.avoid}`);
    directives.push('');
    directives.push('EXAMPLE:');
    directives.push(`❌ AVOID: "${cascadeMode.language_style.examples.avoid_explanatory}"`);
    directives.push(`✅ USE: "${cascadeMode.language_style.examples.use_experiential}"`);
    directives.push('');
    
    // Rules
    directives.push('CRITICAL RULES:');
    cascadeMode.rules.forEach((rule: string) => {
      directives.push(`- ${rule}`);
    });
    directives.push('');
    
    // Variation rules
    directives.push('VARIATION RULES:');
    cascadeMode.variation_rules.forEach((rule: string) => {
      directives.push(`- ${rule}`);
    });
    directives.push('');
    
    // Structure
    directives.push('STRUCTURE:');
    directives.push(`1. ANCHOR IN FUTURE PACING: "${cascadeMode.structure.anchor_future}"`);
    directives.push('');
    directives.push('2. PAINT VIVID SCENES with sensory details:');
    cascadeMode.connecting_phrases.forEach((phrase: string) => {
      directives.push(`   - "${phrase}"`);
    });
    directives.push('');
    directives.push(`3. ACKNOWLEDGE MOMENTUM: "${cascadeMode.structure.acknowledge_momentum}"`);
    directives.push('   OR: "One small shift creating the next."');
    directives.push('');
    directives.push(`4. TIE TO CLIENT'S DESIRED OUTCOME: "${cascadeMode.structure.tie_outcome}"`);
    if (input.desiredOutcome) {
      directives.push(`   Client's desired outcome: "${input.desiredOutcome}"`);
    }
    directives.push('');
    directives.push(`5. ANCHOR IN PRESENT: "${cascadeMode.structure.anchor_present}"`);
    directives.push('');
    
    // Sensory elements
    directives.push('SENSORY ELEMENTS:');
    cascadeMode.sensory_elements.forEach((element: string) => {
      directives.push(`- ${element}`);
    });
    directives.push('');
    
    // Experiential cascades (scene-based flows)
    directives.push('EXPERIENTIAL CASCADES (Scene-based flows, not logical chains):');
    directives.push('');
    
    Object.entries(experientialCascades).forEach(([key, cascade]: [string, any]) => {
      if (key === 'description' || key === 'approach') return;
      
      const categoryName = key.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      directives.push(`${categoryName}:`);
      
      if (cascade.scene_examples && cascade.scene_examples.length > 0) {
        cascade.scene_examples.slice(0, 1).forEach((example: string) => {
          directives.push(`  ✅ "${example}"`);
        });
      }
      
      if (cascade.avoid_logical && cascade.avoid_logical.length > 0) {
        cascade.avoid_logical.slice(0, 1).forEach((example: string) => {
          directives.push(`  ❌ AVOID: "${example}"`);
        });
      }
      directives.push('');
    });
    
    // Emergence-specific style
    const styleConfig = input.emergenceType === 'wake' 
      ? this.config.emergence_styles.wake 
      : this.config.emergence_styles.sleep;
    
    directives.push(`${input.emergenceType.toUpperCase()} STYLE: ${styleConfig.tone}`);
    directives.push(`- Tense: ${styleConfig.tense}`);
    directives.push(`- Emphasis: ${styleConfig.emphasis.join(', ')}`);
    directives.push('');
    
    // Functional categories to choose from
    directives.push('FUNCTIONAL IMPROVEMENT CATEGORIES (Use ALL relevant to issue):');
    directives.push('');
    
    const categories = this.config.functional_categories;
    Object.entries(categories).forEach(([key, category]: [string, any]) => {
      if (key === 'note') return;
      
      // Check if appropriate for emergence type
      if (category.when_to_use && !category.when_to_use.toLowerCase().includes(input.emergenceType)) {
        return;
      }
      
      const categoryName = key.split('_').map((w: string) => w.toUpperCase()).join(' ');
      directives.push(`${categoryName}:`);
      
      // Prefer experiential_examples, fall back to examples
      const examples = category.experiential_examples || category.examples;
      if (examples && examples.length > 0) {
        examples.slice(0, 1).forEach((example: string) => {
          directives.push(`  ✅ "${example}"`);
        });
      }
      
      // Show what to avoid
      if (category.avoid_explanatory && category.avoid_explanatory.length > 0) {
        category.avoid_explanatory.slice(0, 1).forEach((example: string) => {
          directives.push(`  ❌ AVOID: "${example}"`);
        });
      }
      directives.push('');
    });
    
    // Example (Experiential Scene-Setting)
    directives.push('EXAMPLE (Experiential Scene-Setting):');
    directives.push('');
    directives.push('Imagine it now. Tonight, when you lay your head down, you might notice your body settling more quickly into rest.');
    directives.push('');
    directives.push('And tomorrow morning, when your feet touch the floor, there\'s energy you haven\'t felt in months. Not forced. Just... there.');
    directives.push('');
    directives.push('Perhaps next time you sit down to work, you\'ll notice the fog isn\'t quite as thick. Your thoughts connecting like they used to, one idea leading naturally to the next.');
    directives.push('');
    directives.push('And with that clarity, decisions coming easier. You trust what you know. Your voice steady when it used to shake.');
    directives.push('');
    directives.push('Until you find yourself in moments you\'ve been avoiding, fully present, your relationships deepening in ways that surprise you.');
    directives.push('');
    directives.push('One small shift creating the next. Each change building on the last.');
    directives.push('');
    directives.push('Until you find yourself living exactly what you came here for: calm confidence and inner peace.');
    directives.push('');
    directives.push('This isn\'t hope. This is the natural cascade of change already beginning in your body right now.');
    
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
  validate(content: string, mode: 'cascade' | 'chunk' | 'standalone'): EgoQualityCheck[] {
    const checks: EgoQualityCheck[] = [];
    
    if (mode === 'cascade') {
      checks.push(this.checkCascadeStructure(content));
      checks.push(this.checkCausalConnections(content));
    }
    
    // Common checks
    checks.push(this.checkKeywordPresence(content));
    
    return checks;
  }
  
  /**
   * Check cascade has proper structure (future pacing, chains, momentum, outcome, present)
   */
  private checkCascadeStructure(content: string): EgoQualityCheck {
    const lowerContent = content.toLowerCase();
    
    // Check for key structural elements
    const hasFuturePacing = /imagine it now|picture this|see yourself/i.test(content);
    const hasCausalConnections = /(because|with that|which means|and as)/i.test(content);
    const hasMomentum = /(one small shift|all of these changes|building|creating momentum)/i.test(content);
    const hasPresent = /(already beginning|happening now|right now)/i.test(content);
    
    const elementsPresent = [hasFuturePacing, hasCausalConnections, hasMomentum, hasPresent].filter(Boolean).length;
    
    if (elementsPresent < 3) {
      return {
        name: "Cascade Structure",
        passed: false,
        details: `Missing cascade elements - found ${elementsPresent}/4 (future pacing, causal connections, momentum, present anchor)`
      };
    }
    
    return {
      name: "Cascade Structure",
      passed: true,
      details: `Proper cascade structure with ${elementsPresent}/4 key elements`
    };
  }
  
  /**
   * Check for causal connections (not flat list)
   */
  private checkCausalConnections(content: string): EgoQualityCheck {
    const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
    
    // Count causal connectors
    const causalWords = ['because', 'with that', 'which means', 'and as', 'as a result', 'this means'];
    let causalCount = 0;
    
    sentences.forEach(sentence => {
      const lower = sentence.toLowerCase();
      if (causalWords.some(word => lower.includes(word))) {
        causalCount++;
      }
    });
    
    if (causalCount < 2) {
      return {
        name: "Causal Connections",
        passed: false,
        details: `Only ${causalCount} causal connections - needs at least 2 to show transformation chain`
      };
    }
    
    return {
      name: "Causal Connections",
      passed: true,
      details: `${causalCount} causal connections showing transformation chain`
    };
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

  /**
   * STATIC: Validate ego strengthening distribution (for Quality Guard)
   * This is the single source of truth for ego strengthening validation
   */
  static validateDistribution(script: string): { passed: boolean; details: string } {
    const keywords = egoConfig.quality_rules.distribution.keywords;
    const maxPerParagraph = egoConfig.quality_rules.distribution.max_keywords_per_paragraph;
    const maxTotal = egoConfig.quality_rules.distribution.max_total_keywords;
    
    // Split into paragraphs
    const paragraphs = script
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 50);
    
    if (paragraphs.length === 0) {
      return {
        passed: false,
        details: "Script too short or improperly formatted"
      };
    }
    
    // Count actual keyword occurrences per paragraph
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
    const totalKeywords = keywordsPerParagraph.reduce((a, b) => a + b, 0);
    
    // Fail if more than maxPerParagraph in one paragraph (indicates dump)
    if (maxInOneParagraph > maxPerParagraph) {
      return {
        passed: false,
        details: `Functional improvements dumped in one paragraph (${maxInOneParagraph} keywords) - should be scattered throughout`
      };
    }
    
    // Fail if too many total
    if (totalKeywords > maxTotal) {
      return {
        passed: false,
        details: `Too many functional improvements (${totalKeywords}) - maximum ${maxTotal}, prefer 3-5`
      };
    }
    
    return {
      passed: true,
      details: `Good distribution - ${totalKeywords} functional improvements scattered naturally`
    };
  }
  
  /**
   * STATIC: Validate Benefit Cascade structure (for Quality Guard)
   * Checks for scene-setting/experiential language, NOT causal explanations
   */
  static validateCascadeStructure(script: string): { passed: boolean; details: string } {
    const lowerScript = script.toLowerCase();
    
    // Check for key cascade structural elements (all case-insensitive using lowerScript)
    const hasFuturePacing = /imagine it now|picture this|see yourself|envision|future.*unfold/.test(lowerScript);
    const hasExperientialFlow = /(and tonight|you might notice|perhaps tomorrow|next time|in moments when|with each)/.test(lowerScript);
    const hasMomentum = /(one small shift|all of these changes|building|creating momentum|each change building)/.test(lowerScript);
    const hasPresent = /(already beginning|happening now|right now|natural cascade)/.test(lowerScript);
    
    // Count experiential connectors (GOOD - scene-setting) - use lowerScript
    const experientialWords = ['and tonight', 'you might notice', 'perhaps', 'next time', 'in moments when', 'with each'];
    let experientialCount = 0;
    
    experientialWords.forEach(word => {
      const regex = new RegExp(word, 'g');
      const matches = lowerScript.match(regex) || [];
      experientialCount += matches.length;
    });
    
    // Count causal/explanatory language (BAD - STRICT: fail on first occurrence) - use lowerScript
    const causalWords = [
      'because', 'as a result', 'this means', 'therefore', 'consequently',
      'this causes', 'which results in', 'leading to', 'due to', 'since'
    ];
    let causalCount = 0;
    let foundCausalWords: string[] = [];
    
    causalWords.forEach(word => {
      const regex = new RegExp(word, 'g');
      const matches = lowerScript.match(regex) || [];
      if (matches.length > 0) {
        causalCount += matches.length;
        foundCausalWords.push(`"${word}" (${matches.length}x)`);
      }
    });
    
    // Check for temporal markers (GOOD - scene-setting)
    const temporalMarkers = /(tonight|tomorrow|next week|next time|in the morning|when you wake)/gi;
    const temporalMatches = script.match(temporalMarkers) || [];
    const hasTemporalFlow = temporalMatches.length >= 2;
    
    // Check for flat list indicators (BAD)
    const flatListIndicators = [
      /you\s+(will|can)\s+(also|additionally|furthermore)/gi,
      /\b(and also|as well as|in addition to)\b/gi,
      /\b(first|second|third|finally)\b.*\b(you\s+will|you\s+can)\b/gi
    ];
    
    let flatListCount = 0;
    flatListIndicators.forEach(pattern => {
      const matches = script.match(pattern) || [];
      flatListCount += matches.length;
    });
    
    const elementsPresent = [hasFuturePacing, hasExperientialFlow, hasMomentum, hasPresent].filter(Boolean).length;
    
    // FAIL on FIRST occurrence of causal/explanatory language (STRICT)
    if (causalCount >= 1) {
      return {
        passed: false,
        details: `Explanatory language detected (${foundCausalWords.join(', ')}) - MUST use scene-setting, NOT causal explanations`
      };
    }
    
    // Fail if flat list structure detected
    if (flatListCount >= 3) {
      return {
        passed: false,
        details: `Flat benefit list detected (${flatListCount} list indicators) - use experiential cascade`
      };
    }
    
    // Fail if missing cascade structure
    if (elementsPresent < 3) {
      return {
        passed: false,
        details: `Missing cascade elements - found ${elementsPresent}/4 (future pacing, experiential flow, momentum, present anchor)`
      };
    }
    
    // Fail if not enough experiential connections
    if (experientialCount < 2) {
      return {
        passed: false,
        details: `Only ${experientialCount} experiential connections - needs at least 2 scene-setting phrases`
      };
    }
    
    return {
      passed: true,
      details: `Experiential cascade validated - ${elementsPresent}/4 elements, ${experientialCount} scene-setting phrases, ${temporalMatches.length} temporal markers`
    };
  }
}
