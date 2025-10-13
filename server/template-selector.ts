import { templateManager } from "./template-manager";
import type { Template, TemplateJSON } from "@shared/schema";

export interface TemplateRecommendation {
  template: Template;
  matchScore: number;
  matchReasons: string[];
}

export interface ITemplateSelector {
  recommendTemplates(
    presentingIssue: string,
    desiredOutcome: string,
    notes?: string
  ): Promise<TemplateRecommendation[]>;
}

export class TemplateSelector implements ITemplateSelector {
  /**
   * Smart template recommendation based on user input
   * Returns 3-5 templates ordered by relevance
   */
  async recommendTemplates(
    presentingIssue: string,
    desiredOutcome: string,
    notes: string = ""
  ): Promise<TemplateRecommendation[]> {
    // Trim and validate input
    const trimmedIssue = presentingIssue.trim();
    const trimmedOutcome = desiredOutcome.trim();
    const trimmedNotes = notes.trim();
    
    // Get all available templates (system + public)
    const systemTemplates = await templateManager.getSystemTemplates();
    const publicTemplates = await templateManager.getPublicTemplates();
    
    console.log(`[TemplateSelector] System templates: ${systemTemplates.length}, Public templates: ${publicTemplates.length}`);
    
    // Combine and dedupe
    const allTemplates = this.dedupeTemplates([...systemTemplates, ...publicTemplates]);
    
    console.log(`[TemplateSelector] Total templates after dedupe: ${allTemplates.length}`);
    
    // Score each template
    const scored = allTemplates.map((template) => {
      const { score, reasons } = this.scoreTemplate(
        template,
        trimmedIssue,
        trimmedOutcome,
        trimmedNotes
      );
      
      return {
        template,
        matchScore: score,
        matchReasons: reasons,
      };
    });
    
    // Sort by score (highest first)
    scored.sort((a, b) => b.matchScore - a.matchScore);
    
    // Check if we have good matches (score > 10)
    const goodMatches = scored.filter(s => s.matchScore > 10);
    
    // If we have < 3 good matches, use fallback templates
    if (goodMatches.length < 3) {
      const fallbacks = await this.getFallbackTemplates(20);
      
      // Add fallbacks that aren't already in the list
      const existingIds = new Set(scored.map(s => s.template.templateId));
      for (const fallback of fallbacks) {
        if (!existingIds.has(fallback.templateId)) {
          scored.push({
            template: fallback,
            matchScore: 5, // Low score for fallback
            matchReasons: ['Popular beginner-friendly template'],
          });
          existingIds.add(fallback.templateId);
        }
      }
      
      // Re-sort after adding fallbacks
      scored.sort((a, b) => b.matchScore - a.matchScore);
    }
    
    // Ensure all recommendations have at least one reason
    scored.forEach((rec) => {
      if (rec.matchReasons.length === 0) {
        rec.matchReasons.push('Recommended for general use');
      }
    });
    
    // Return all matched templates (up to 20)
    const count = Math.min(20, scored.length);
    console.log(`[TemplateSelector] Returning ${count} templates out of ${scored.length} total`);
    return scored.slice(0, count);
  }

  /**
   * Score a template based on how well it matches user input
   */
  private scoreTemplate(
    template: Template,
    presentingIssue: string,
    desiredOutcome: string,
    notes: string
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];
    const templateData = template.jsonData as TemplateJSON;

    // Normalize text for comparison
    const issue = presentingIssue.toLowerCase();
    const outcome = desiredOutcome.toLowerCase();
    const userNotes = notes.toLowerCase();
    const combinedInput = `${issue} ${outcome} ${userNotes}`.trim();

    // 1. Check presenting_issues (high weight: +20 per match)
    // Only score if we have actual user input
    if (templateData.presenting_issues && issue.length > 0) {
      for (const templateIssue of templateData.presenting_issues) {
        const templateIssueLower = templateIssue.toLowerCase();
        if (issue.includes(templateIssueLower) || templateIssueLower.includes(issue)) {
          score += 20;
          reasons.push(`Matches presenting issue: ${templateIssue}`);
        }
      }
    }

    // 2. Check use_cases (medium weight: +15 per match)
    // Only score if we have actual combined input
    if (templateData.use_cases && combinedInput.length > 0) {
      for (const useCase of templateData.use_cases) {
        const useCaseLower = useCase.toLowerCase();
        if (combinedInput.includes(useCaseLower) || 
            (issue.length > 0 && useCaseLower.includes(issue))) {
          score += 15;
          reasons.push(`Matches use case: ${useCase}`);
        }
      }
    }

    // 3. Check tags (medium weight: +10 per match)
    // Only score if we have actual combined input
    if (templateData.tags && combinedInput.length > 0) {
      for (const tag of templateData.tags) {
        if (combinedInput.includes(tag.toLowerCase())) {
          score += 10;
          reasons.push(`Matches tag: ${tag}`);
        }
      }
    }

    // 4. Special keyword matching in notes (low weight: +5 each)
    const keywordMatches = this.checkKeywordMatches(userNotes, templateData);
    score += keywordMatches.score;
    reasons.push(...keywordMatches.reasons);

    // 5. Beginner boost (if user mentions first-time, beginner, new)
    if (combinedInput.match(/\b(first|beginner|new|never|novice)\b/)) {
      if (templateData.category === 'beginner' || 
          templateData.tags?.includes('beginner')) {
        score += 25;
        reasons.push('Beginner-friendly for first-time clients');
      }
    }

    // 6. Popularity boost (small weight to break ties)
    if (template.usageCount > 0) {
      score += Math.log10(template.usageCount + 1) * 2; // Log scale, max ~4 points
    }

    // 7. System template boost (slight preference for curated templates)
    if (template.isSystem) {
      score += 3;
    }

    // If no matches at all, give a minimal score based on category
    if (score === 0 && templateData.category === 'beginner') {
      score = 5;
      reasons.push('General beginner template');
    }

    return { score, reasons };
  }

  /**
   * Check for specific keywords that indicate template preferences
   */
  private checkKeywordMatches(
    notes: string,
    templateData: TemplateJSON
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Story/metaphor indicators
    if (notes.match(/\b(story|metaphor|creative|imagine|journey)\b/)) {
      if (templateData.dimensions.symbolic.level > 70) {
        score += 5;
        reasons.push('Story-based approach matches creative preference');
      }
    }

    // Body/somatic indicators
    if (notes.match(/\b(body|physical|breath|relaxation|tense)\b/)) {
      if (templateData.dimensions.somatic.level > 70) {
        score += 5;
        reasons.push('Body-focused approach matches somatic needs');
      }
    }

    // Deep psychological work indicators
    if (notes.match(/\b(trauma|inner|parts|deep|unconscious)\b/)) {
      if (templateData.dimensions.psychological.level > 70) {
        score += 5;
        reasons.push('Deep psychological approach for inner work');
      }
    }

    // Time/regression indicators
    if (notes.match(/\b(past|childhood|regression|memory|timeline)\b/)) {
      if (templateData.dimensions.temporal.level > 70) {
        score += 5;
        reasons.push('Time-based work for past processing');
      }
    }

    // Spiritual indicators
    if (notes.match(/\b(spiritual|meaning|purpose|soul|divine)\b/)) {
      if (templateData.dimensions.spiritual.enabled) {
        score += 5;
        reasons.push('Spiritual dimension for deeper meaning');
      }
    }

    return { score, reasons };
  }

  /**
   * Remove duplicate templates (same templateId)
   */
  private dedupeTemplates(templates: Template[]): Template[] {
    const seen = new Set<string>();
    return templates.filter((t) => {
      if (seen.has(t.templateId)) {
        return false;
      }
      seen.add(t.templateId);
      return true;
    });
  }

  /**
   * Get a specific number of fallback templates (popular, beginner-friendly)
   */
  async getFallbackTemplates(count: number = 3): Promise<Template[]> {
    const systemTemplates = await templateManager.getSystemTemplates();
    
    // Prioritize beginner templates, then by usage
    const sorted = systemTemplates.sort((a, b) => {
      const aData = a.jsonData as TemplateJSON;
      const bData = b.jsonData as TemplateJSON;
      
      // Beginner templates first
      if (aData.category === 'beginner' && bData.category !== 'beginner') return -1;
      if (bData.category === 'beginner' && aData.category !== 'beginner') return 1;
      
      // Then by usage count
      return b.usageCount - a.usageCount;
    });
    
    return sorted.slice(0, count);
  }
}

// Export singleton instance
export const templateSelector = new TemplateSelector();
