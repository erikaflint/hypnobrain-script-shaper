/**
 * TRANCE DEPTH VALIDATOR
 * Detects language patterns that destroy trance depth by pulling client into analytical thinking
 * Based on the "secret sauce" language mastery rules
 */

import languageMastery from './config/language-mastery.json';

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100, higher is better
  violations: Violation[];
  warnings: string[];
  suggestions: string[];
}

export interface Violation {
  type: 'critical' | 'major' | 'minor';
  category: string;
  issue: string;
  location: string; // Line/section where found
  forbidden_phrase?: string;
  suggested_fix?: string;
}

export class TranceDepthValidator {
  private forbiddenPhrases: string[];
  private forbiddenCliches: string[];
  private forbiddenVisualCommands: string[];

  constructor() {
    this.forbiddenPhrases = languageMastery.critical_anti_patterns.forbidden_phrases;
    this.forbiddenCliches = languageMastery.language_craft.forbidden_cliches;
    this.forbiddenVisualCommands = languageMastery.inclusive_sensory_language.forbidden_visual_commands;
  }

  /**
   * Validate a complete script for trance depth issues
   */
  public validate(script: string): ValidationResult {
    const violations: Violation[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check for cognitive/reflective instructions (CRITICAL)
    const cognitiveViolations = this.detectCognitiveInstructions(script);
    violations.push(...cognitiveViolations);

    // Check for hypnosis clichés
    const clicheViolations = this.detectCliches(script);
    violations.push(...clicheViolations);

    // Check for visual-only commands
    const visualViolations = this.detectVisualCommands(script);
    violations.push(...visualViolations);

    // Check for "you...you...you" repetition
    const repetitionViolations = this.detectYouRepetition(script);
    violations.push(...repetitionViolations);

    // Check for em dashes
    if (script.includes('—')) {
      violations.push({
        type: 'minor',
        category: 'language_craft',
        issue: 'Em dashes detected - use commas or periods instead',
        location: 'Throughout script',
        suggested_fix: 'Replace em dashes with commas or break into separate sentences'
      });
    }

    // Check for AI patterns
    const aiPatterns = ['It\'s important to', 'You may find that', 'As you continue to'];
    for (const pattern of aiPatterns) {
      if (script.toLowerCase().includes(pattern.toLowerCase())) {
        violations.push({
          type: 'minor',
          category: 'language_craft',
          issue: `AI pattern detected: "${pattern}"`,
          location: 'In script',
          suggested_fix: 'Rewrite with more natural, poetic language'
        });
      }
    }

    // Generate warnings and suggestions
    if (cognitiveViolations.length > 0) {
      warnings.push('CRITICAL: Script contains cognitive/reflective instructions that pull client out of trance!');
      suggestions.push('Replace "think about/remember/recall" with direct experience: "Your body remembers...", "[State] arrives..."');
    }

    if (repetitionViolations.length > 0) {
      suggestions.push('Use body-as-subject to eliminate "you...you...you": "Your breath deepens. Shoulders soften."');
    }

    if (visualViolations.length > 0) {
      suggestions.push('Replace visual commands with inclusive language: "Notice..." instead of "See..."');
    }

    // Calculate score
    const score = this.calculateScore(violations);

    return {
      isValid: violations.filter(v => v.type === 'critical').length === 0,
      score,
      violations,
      warnings,
      suggestions
    };
  }

  /**
   * Detect cognitive/reflective instructions (CRITICAL violations)
   */
  private detectCognitiveInstructions(script: string): Violation[] {
    const violations: Violation[] = [];
    const lowerScript = script.toLowerCase();

    for (const phrase of this.forbiddenPhrases) {
      const lowerPhrase = phrase.toLowerCase();
      if (lowerScript.includes(lowerPhrase)) {
        // Find the sentence containing this phrase
        const sentences = script.split(/[.!?]+/);
        const matchingSentence = sentences.find(s => s.toLowerCase().includes(lowerPhrase));
        
        violations.push({
          type: 'critical',
          category: 'cognitive_load',
          issue: 'Cognitive/reflective instruction that pulls client out of trance',
          location: matchingSentence?.trim().substring(0, 100) + '...' || 'Unknown',
          forbidden_phrase: phrase,
          suggested_fix: languageMastery.critical_anti_patterns.replacement_patterns[0]
        });
      }
    }

    return violations;
  }

  /**
   * Detect hypnosis clichés
   */
  private detectCliches(script: string): Violation[] {
    const violations: Violation[] = [];
    const lowerScript = script.toLowerCase();

    for (const cliche of this.forbiddenCliches) {
      const lowerCliche = cliche.toLowerCase();
      if (lowerScript.includes(lowerCliche)) {
        violations.push({
          type: 'major',
          category: 'cliches',
          issue: `Hypnosis cliché detected: "${cliche}"`,
          location: 'In script',
          forbidden_phrase: cliche,
          suggested_fix: 'Use fresh, natural language instead of clichés'
        });
      }
    }

    return violations;
  }

  /**
   * Detect visual-only commands
   */
  private detectVisualCommands(script: string): Violation[] {
    const violations: Violation[] = [];

    for (const command of this.forbiddenVisualCommands) {
      const regex = new RegExp(`\\b${command.replace('.', '\\.')}`, 'gi');
      const matches = script.match(regex);
      
      if (matches && matches.length > 0) {
        violations.push({
          type: 'major',
          category: 'sensory_language',
          issue: `Visual-only command: "${command}"`,
          location: `${matches.length} occurrence(s)`,
          forbidden_phrase: command,
          suggested_fix: 'Use inclusive language: "Notice...", "Sense...", "Imagine..."'
        });
      }
    }

    return violations;
  }

  /**
   * Detect "you...you...you" repetition
   */
  private detectYouRepetition(script: string): Violation[] {
    const violations: Violation[] = [];
    const sentences = script.split(/[.!?]+/);

    for (let i = 0; i < sentences.length - 2; i++) {
      const s1 = sentences[i].trim().toLowerCase();
      const s2 = sentences[i + 1].trim().toLowerCase();
      const s3 = sentences[i + 2].trim().toLowerCase();

      // Check if 3 consecutive sentences all start with "you"
      if (s1.startsWith('you ') && s2.startsWith('you ') && s3.startsWith('you ')) {
        violations.push({
          type: 'major',
          category: 'repetition',
          issue: 'Three consecutive sentences starting with "you"',
          location: sentences.slice(i, i + 3).join('. ').substring(0, 150) + '...',
          suggested_fix: 'Use body-as-subject: "Your breath deepens. Shoulders soften. Peace settles."'
        });
      }
    }

    return violations;
  }

  /**
   * Calculate overall quality score
   */
  private calculateScore(violations: Violation[]): number {
    let score = 100;

    for (const violation of violations) {
      if (violation.type === 'critical') {
        score -= 25;
      } else if (violation.type === 'major') {
        score -= 10;
      } else if (violation.type === 'minor') {
        score -= 5;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Quick check: Does script pass minimum quality threshold?
   */
  public passesMinimumQuality(script: string): boolean {
    const result = this.validate(script);
    // Must have no critical violations and score > 60
    return result.violations.filter(v => v.type === 'critical').length === 0 && result.score > 60;
  }

  /**
   * Get summary report
   */
  public getSummaryReport(result: ValidationResult): string {
    const lines: string[] = [];
    
    lines.push('=== TRANCE DEPTH VALIDATION REPORT ===');
    lines.push(`Overall Score: ${result.score}/100`);
    lines.push(`Status: ${result.isValid ? '✓ PASSED' : '✗ FAILED'}`);
    lines.push('');

    if (result.violations.length > 0) {
      lines.push('VIOLATIONS:');
      for (const v of result.violations) {
        lines.push(`  [${v.type.toUpperCase()}] ${v.category}: ${v.issue}`);
        if (v.forbidden_phrase) {
          lines.push(`    Forbidden: "${v.forbidden_phrase}"`);
        }
        if (v.suggested_fix) {
          lines.push(`    Fix: ${v.suggested_fix}`);
        }
      }
      lines.push('');
    }

    if (result.warnings.length > 0) {
      lines.push('WARNINGS:');
      result.warnings.forEach(w => lines.push(`  ⚠ ${w}`));
      lines.push('');
    }

    if (result.suggestions.length > 0) {
      lines.push('SUGGESTIONS:');
      result.suggestions.forEach(s => lines.push(`  💡 ${s}`));
    }

    return lines.join('\n');
  }
}

export const tranceDepthValidator = new TranceDepthValidator();
