/**
 * STRATEGY PLANNER
 * The brain of the ScriptEngine - selects narrative arcs based on:
 * - Client presenting issue
 * - Desired outcome
 * - Template preferences
 * - Arc selection rules
 */

import narrativeArcsConfig from './config/narrative-arcs.json';
import metaphorLibraryConfig from './config/metaphor-library.json';

export interface GenerationContract {
  selectedArcs: SelectedArc[];
  primaryMetaphor: MetaphorSelection | null;
  arcPriority: string[];
  reasoningLog: string[];
}

export interface SelectedArc {
  arcId: string;
  arcName: string;
  reason: string;
  keyLanguage: string[];
  promptIntegration: string;
}

export interface MetaphorSelection {
  family: string;
  primaryImages: string[];
  reason: string;
}

export interface PlannerInput {
  presentingIssue: string;
  desiredOutcome: string;
  clientNotes?: string;
  manualArcId?: string; // Manual arc selection (overrides auto-selection if provided)
  templatePreferredArcs?: string[];
  templateFallbackArcs?: string[];
  symbolicDimensionLevel?: number;
}

export class StrategyPlanner {
  private narrativeArcs: any;
  private metaphorLibrary: any;
  private arcSelectionRules: any;

  constructor() {
    this.narrativeArcs = narrativeArcsConfig.arcs;
    this.metaphorLibrary = metaphorLibraryConfig;
    this.arcSelectionRules = narrativeArcsConfig.arc_selection_rules;
  }

  /**
   * Main method: Generate a complete generation contract
   */
  public async plan(input: PlannerInput): Promise<GenerationContract> {
    const reasoningLog: string[] = [];
    
    // Check for manual arc selection first (overrides auto-selection)
    if (input.manualArcId) {
      reasoningLog.push(`MANUAL ARC SELECTION: ${input.manualArcId}`);
      const arc = this.narrativeArcs.find((a: any) => a.id === input.manualArcId);
      if (!arc) {
        reasoningLog.push(`WARNING: Manual arc "${input.manualArcId}" not found, falling back to auto-selection`);
      } else {
        // Include foundation arcs + manual arc only
        const alwaysIncludeArcs = this.arcSelectionRules.always_include;
        const finalArcs = [...alwaysIncludeArcs, input.manualArcId];
        const detectedIssues = this.detectIssues(input.presentingIssue, input.clientNotes);
        
        reasoningLog.push(`Using manual arc with foundation arcs: ${finalArcs.join(', ')}`);
        
        const selectedArcs = finalArcs.map(arcId => this.buildArcDetails(arcId, detectedIssues));
        const primaryMetaphor = this.selectMetaphor(
          detectedIssues,
          input.symbolicDimensionLevel || 0
        );
        
        if (primaryMetaphor) {
          reasoningLog.push(`Primary metaphor: ${primaryMetaphor.family} (${primaryMetaphor.reason})`);
        }
        
        return {
          selectedArcs,
          primaryMetaphor,
          arcPriority: finalArcs,
          reasoningLog
        };
      }
    }
    
    // Auto-selection logic (when no manual arc provided)
    // Step 1: Always include foundation arcs
    const alwaysIncludeArcs = this.arcSelectionRules.always_include;
    reasoningLog.push(`Including foundation arcs: ${alwaysIncludeArcs.join(', ')}`);
    
    // Step 2: Detect presenting issue keywords
    const detectedIssues = this.detectIssues(input.presentingIssue, input.clientNotes);
    reasoningLog.push(`Detected issues: ${detectedIssues.join(', ') || 'none specific'}`);
    
    // Step 3: Select issue-specific arcs
    const issueSpecificArcs = this.selectIssueSpecificArcs(detectedIssues);
    reasoningLog.push(`Issue-specific arcs: ${issueSpecificArcs.join(', ') || 'none'}`);
    
    // Step 4: Consider template preferences
    const templateArcs = input.templatePreferredArcs || [];
    if (templateArcs.length > 0) {
      reasoningLog.push(`Template preferred arcs: ${templateArcs.join(', ')}`);
    }
    
    // Step 5: Prioritize and limit to max arcs
    const prioritizedArcs = this.prioritizeArcs(
      alwaysIncludeArcs,
      issueSpecificArcs,
      templateArcs,
      this.arcSelectionRules.max_arcs_per_script
    );
    
    reasoningLog.push(`Final arc selection: ${prioritizedArcs.join(', ')}`);
    
    // Step 6: Build detailed arc selections
    const selectedArcs = prioritizedArcs.map(arcId => this.buildArcDetails(arcId, detectedIssues));
    
    // Step 7: Select primary metaphor if symbolic dimension is high
    const primaryMetaphor = this.selectMetaphor(
      detectedIssues,
      input.symbolicDimensionLevel || 0
    );
    
    if (primaryMetaphor) {
      reasoningLog.push(`Primary metaphor: ${primaryMetaphor.family} (${primaryMetaphor.reason})`);
    }
    
    return {
      selectedArcs,
      primaryMetaphor,
      arcPriority: prioritizedArcs,
      reasoningLog
    };
  }

  /**
   * Detect issue keywords from presenting issue and notes
   */
  private detectIssues(presentingIssue: string, clientNotes?: string): string[] {
    const text = `${presentingIssue} ${clientNotes || ''}`.toLowerCase();
    const detectedIssues: string[] = [];
    
    // Issue keyword mappings
    const issuePatterns = {
      'anxiety': ['anxiety', 'anxious', 'worry', 'worried', 'nervous', 'stress', 'stressed'],
      'confidence': ['confidence', 'self-esteem', 'self-worth', 'imposter', 'doubt', 'insecure'],
      'stuck': ['stuck', 'trapped', 'stagnant', 'can\'t move forward', 'blocked', 'know what to do but can\'t'],
      'habits': ['habit', 'pattern', 'automatic', 'addiction', 'compulsion', 'routine'],
      'trauma': ['trauma', 'ptsd', 'past hurt', 'abuse', 'painful memory', 'post-divorce', 'death', 'grief'],
      'self-worth': ['worth', 'value', 'deserve', 'self-love', 'self-acceptance'],
      'life-change': ['transition', 'change', 'new chapter', 'life change', 'transformation'],
      'chronic-pain': ['chronic pain', 'pain', 'headache', 'body pain', 'physical discomfort'],
      'internal-conflict': ['conflict', 'torn', 'ambivalent', 'part of me wants', 'self-sabotage'],
      'confusion': ['confused', 'unclear', 'don\'t know', 'uncertain', 'lost', 'indecision', 'overwhelmed by options', 'analysis paralysis', 'can\'t see the path'],
      'overwhelm': ['overwhelmed', 'too much', 'can\'t cope', 'drowning', 'exhausted', 'information overload', 'chaos'],
      'disconnection': ['disconnected', 'numb', 'detached', 'can\'t feel', 'out of touch'],
      'perfectionism': ['perfectionism', 'perfectionist', 'fear of failure', 'not good enough', 'have to be perfect', 'afraid to fail', 'rigid'],
      'learning-blocks': ['learning', 'can\'t learn', 'struggling to learn', 'difficulty learning', 'learning block'],
      'weight-loss': ['weight loss', 'lose weight', 'losing weight', 'diet', 'eating', 'food cravings', 'overeating'],
      'exhaustion': ['exhausted', 'drained', 'depleted', 'worn out', 'tired', 'no energy', 'can\'t go on'],
      'burnout': ['burnout', 'burned out', 'burnt out', 'done', 'can\'t keep going'],
      'crisis': ['crisis', 'emergency', 'breakdown', 'serious illness', 'major disruption', 'life fell apart']
    };
    
    for (const [issue, keywords] of Object.entries(issuePatterns)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        detectedIssues.push(issue);
      }
    }
    
    return detectedIssues;
  }

  /**
   * Select arcs based on detected issues
   */
  private selectIssueSpecificArcs(detectedIssues: string[]): string[] {
    const arcs = new Set<string>();
    
    for (const issue of detectedIssues) {
      const mappedArcs = this.arcSelectionRules.issue_mappings[issue];
      if (mappedArcs) {
        mappedArcs.forEach((arc: string) => arcs.add(arc));
      }
    }
    
    return Array.from(arcs);
  }

  /**
   * Prioritize arcs: always_include > issue_specific > template_preferred
   * Limit to max_arcs_per_script
   */
  private prioritizeArcs(
    alwaysInclude: string[],
    issueSpecific: string[],
    templatePreferred: string[],
    maxArcs: number
  ): string[] {
    const prioritized: string[] = [];
    const seen = new Set<string>();
    
    // Priority 1: Always include arcs
    for (const arc of alwaysInclude) {
      if (!seen.has(arc) && prioritized.length < maxArcs) {
        prioritized.push(arc);
        seen.add(arc);
      }
    }
    
    // Priority 2: Issue-specific arcs
    for (const arc of issueSpecific) {
      if (!seen.has(arc) && prioritized.length < maxArcs) {
        prioritized.push(arc);
        seen.add(arc);
      }
    }
    
    // Priority 3: Template preferred arcs
    for (const arc of templatePreferred) {
      if (!seen.has(arc) && prioritized.length < maxArcs) {
        prioritized.push(arc);
        seen.add(arc);
      }
    }
    
    return prioritized;
  }

  /**
   * Build detailed arc selection with language and integration
   */
  private buildArcDetails(arcId: string, detectedIssues: string[]): SelectedArc {
    const arc = this.narrativeArcs.find((a: any) => a.id === arcId);
    
    if (!arc) {
      return {
        arcId,
        arcName: arcId,
        reason: 'Arc not found in config',
        keyLanguage: [],
        promptIntegration: ''
      };
    }
    
    // Determine reason for selection
    let reason = 'Foundation arc';
    if (this.arcSelectionRules.always_include.includes(arcId)) {
      reason = 'Foundation arc (always included)';
    } else if (detectedIssues.some(issue => arc.presenting_issues?.includes(issue))) {
      const matchedIssues = detectedIssues.filter(issue => arc.presenting_issues?.includes(issue));
      reason = `Matches presenting issue: ${matchedIssues.join(', ')}`;
    }
    
    return {
      arcId: arc.id,
      arcName: arc.name,
      reason,
      keyLanguage: arc.key_language || [],
      promptIntegration: arc.prompt_integration || ''
    };
  }

  /**
   * Select primary metaphor based on issues and symbolic dimension level
   */
  private selectMetaphor(
    detectedIssues: string[],
    symbolicLevel: number
  ): MetaphorSelection | null {
    // Only select metaphor if symbolic dimension is above threshold
    if (symbolicLevel < 40) {
      return null;
    }
    
    // Find best metaphor family for detected issues
    for (const issue of detectedIssues) {
      const mapping = this.metaphorLibrary.issue_to_metaphor_mapping[issue];
      if (mapping?.recommended && mapping.recommended.length > 0) {
        const familyName = mapping.recommended[0];
        const family = this.metaphorLibrary.metaphor_families[familyName];
        
        if (family) {
          return {
            family: familyName,
            primaryImages: family.primary_images || [],
            reason: `Best match for ${issue} (symbolic level: ${symbolicLevel}%)`
          };
        }
      }
    }
    
    // Default to gentle nature if no specific match
    const defaultFamily = this.metaphorLibrary.metaphor_families['nature_gentle'];
    return {
      family: 'nature_gentle',
      primaryImages: defaultFamily.primary_images || [],
      reason: `Default gentle metaphor (symbolic level: ${symbolicLevel}%)`
    };
  }

  /**
   * Get specific metaphor examples for an issue
   */
  public getMetaphorExamples(issue: string): any[] {
    const mapping = this.metaphorLibrary.issue_to_metaphor_mapping[issue];
    return mapping?.specific_images || [];
  }
}
