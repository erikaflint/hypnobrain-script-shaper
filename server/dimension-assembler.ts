import type { TemplateJSON } from "@shared/schema";

export interface AssembledPrompt {
  systemPrompt: string;
  userPrompt: string;
  dimensionInstructions: string;
}

export interface IDimensionAssembler {
  assemblePrompt(
    template: TemplateJSON,
    presentingIssue: string,
    desiredOutcome: string,
    clientNotes?: string
  ): AssembledPrompt;
}

export class DimensionAssembler implements IDimensionAssembler {
  /**
   * Convert template JSON into structured AI prompt
   */
  assemblePrompt(
    template: TemplateJSON,
    presentingIssue: string,
    desiredOutcome: string,
    clientNotes: string = ""
  ): AssembledPrompt {
    const dimensionInstructions = this.buildDimensionInstructions(template.dimensions);
    const styleInstructions = this.buildStyleInstructions(template);
    const generationRules = this.buildGenerationRules(template.generation_rules);
    
    const systemPrompt = this.buildSystemPrompt(dimensionInstructions, styleInstructions, generationRules);
    const userPrompt = this.buildUserPrompt(presentingIssue, desiredOutcome, clientNotes);
    
    return {
      systemPrompt,
      userPrompt,
      dimensionInstructions,
    };
  }

  /**
   * Build dimension-specific instructions for AI
   */
  private buildDimensionInstructions(dimensions: TemplateJSON['dimensions']): string {
    const instructions: string[] = [];

    // Somatic dimension
    if (dimensions.somatic.level > 0) {
      instructions.push(this.buildSomaticInstructions(dimensions.somatic));
    }

    // Temporal dimension
    if (dimensions.temporal.level > 0) {
      instructions.push(this.buildTemporalInstructions(dimensions.temporal));
    }

    // Symbolic dimension
    if (dimensions.symbolic.level > 0) {
      instructions.push(this.buildSymbolicInstructions(dimensions.symbolic));
    }

    // Psychological dimension
    if (dimensions.psychological.level > 0) {
      instructions.push(this.buildPsychologicalInstructions(dimensions.psychological));
    }

    // Perspective dimension
    if (dimensions.perspective.level > 0) {
      instructions.push(this.buildPerspectiveInstructions(dimensions.perspective));
    }

    // Spiritual dimension (only if enabled)
    if (dimensions.spiritual.enabled && dimensions.spiritual.level > 0) {
      instructions.push(this.buildSpiritualInstructions(dimensions.spiritual));
    }

    // Relational dimension
    if (dimensions.relational.level > 0) {
      instructions.push(this.buildRelationalInstructions(dimensions.relational));
    }

    // Language dimension
    if (dimensions.language.level > 0) {
      instructions.push(this.buildLanguageInstructions(dimensions.language));
    }

    return instructions.join('\n\n');
  }

  private buildSomaticInstructions(config: TemplateJSON['dimensions']['somatic']): string {
    const level = config.level;
    let instruction = `**SOMATIC DIMENSION (${level}% emphasis)**\n`;
    
    // Add emphasis if specified
    if (config.emphasis) {
      instruction += `- SOMATIC EMPHASIS: ${config.emphasis}\n`;
    }
    
    // Add techniques if specified
    if (config.techniques && config.techniques.length > 0) {
      instruction += `- SOMATIC TECHNIQUES: ${config.techniques.join(', ')}\n`;
    }
    
    if (level >= 75) {
      instruction += `- HEAVY body-based focus: Guide client to notice breath, posture, temperature, physical sensations throughout\n`;
      instruction += `- Use extensive body scanning, progressive relaxation, somatic anchoring\n`;
      instruction += `- Reference physical sensations in every phase of the script`;
    } else if (level >= 50) {
      instruction += `- MODERATE body awareness: Include breath work, body scanning, physical anchoring\n`;
      instruction += `- Guide attention to somatic experiences regularly\n`;
      instruction += `- Use physical sensations to deepen trance state`;
    } else if (level >= 25) {
      instruction += `- LIGHT body connection: Mention breath and body awareness occasionally\n`;
      instruction += `- Use physical sensations as subtle anchors\n`;
      instruction += `- Keep body references gentle and brief`;
    } else {
      instruction += `- MINIMAL somatic content: Brief body relaxation at start only\n`;
      instruction += `- Focus on other dimensions, mention body sparingly`;
    }

    return instruction;
  }

  private buildTemporalInstructions(config: TemplateJSON['dimensions']['temporal']): string {
    const level = config.level;
    let instruction = `**TEMPORAL DIMENSION (${level}% emphasis)**\n`;
    
    // Add work types if specified
    if (config.work_types && config.work_types.length > 0) {
      instruction += `- TEMPORAL WORK TYPES: ${config.work_types.join(', ')}\n`;
    }
    
    // Add focus if specified
    if (config.focus) {
      instruction += `- TEMPORAL FOCUS: ${config.focus}\n`;
    }
    
    if (level >= 75) {
      instruction += `- HEAVY time-based work: Use extensive age regression, progression, timeline therapy\n`;
      instruction += `- Guide client through past experiences, future pacing, time distortion\n`;
      instruction += `- Leverage the fluid nature of time in hypnosis extensively`;
    } else if (level >= 50) {
      instruction += `- MODERATE temporal work: Include some regression or progression techniques\n`;
      instruction += `- Reference past learnings or future possibilities\n`;
      instruction += `- Use time as a therapeutic resource`;
    } else if (level >= 25) {
      instruction += `- LIGHT temporal elements: Occasional references to past wisdom or future self\n`;
      instruction += `- Brief timeline awareness\n`;
      instruction += `- Subtle time-based suggestions`;
    } else {
      instruction += `- MINIMAL temporal content: Stay mostly in present moment\n`;
      instruction += `- Focus on other dimensions`;
    }

    return instruction;
  }

  private buildSymbolicInstructions(config: TemplateJSON['dimensions']['symbolic']): string {
    const level = config.level;
    let instruction = `**SYMBOLIC DIMENSION (${level}% emphasis)**\n`;
    
    // Add metaphor/archetype if specified
    if (config.metaphor) {
      instruction += `- PRIMARY METAPHOR: ${config.metaphor}\n`;
    }
    if (config.archetype) {
      instruction += `- ARCHETYPE: ${config.archetype}\n`;
    }
    
    if (level >= 75) {
      instruction += `- HEAVY symbolic/metaphorical language: Use rich imagery, archetypal stories, metaphors throughout\n`;
      instruction += `- Build elaborate symbolic journeys and visual landscapes\n`;
      instruction += `- Weave mythic patterns and universal symbols`;
    } else if (level >= 50) {
      instruction += `- MODERATE symbolic content: Include metaphors, imagery, archetypal elements\n`;
      instruction += `- Use story-based suggestions\n`;
      instruction += `- Reference symbolic meanings`;
    } else if (level >= 25) {
      instruction += `- LIGHT symbolic touches: Occasional metaphor or imagery\n`;
      instruction += `- Brief symbolic references\n`;
      instruction += `- Subtle archetypal hints`;
    } else {
      instruction += `- MINIMAL symbolic content: Direct, literal language\n`;
      instruction += `- Focus on other dimensions`;
    }

    return instruction;
  }

  private buildPsychologicalInstructions(config: TemplateJSON['dimensions']['psychological']): string {
    const level = config.level;
    let instruction = `**PSYCHOLOGICAL DIMENSION (${level}% emphasis)**\n`;
    
    // Add approaches if specified
    if (config.approaches && config.approaches.length > 0) {
      instruction += `- PSYCHOLOGICAL APPROACHES: ${config.approaches.join(', ')}\n`;
    }
    
    // Add depth if specified
    if (config.depth) {
      instruction += `- PSYCHOLOGICAL DEPTH: ${config.depth}\n`;
    }
    
    if (level >= 75) {
      instruction += `- HEAVY psychological work: Engage deeply with beliefs, patterns, inner architecture\n`;
      instruction += `- Address cognitive structures, Parts work, inner dialogue\n`;
      instruction += `- Explore unconscious patterns and mental frameworks extensively`;
    } else if (level >= 50) {
      instruction += `- MODERATE psychological engagement: Work with beliefs and cognitive patterns\n`;
      instruction += `- Address thought structures and mental models\n`;
      instruction += `- Include some inner Parts or subconscious work`;
    } else if (level >= 25) {
      instruction += `- LIGHT psychological content: Occasional belief reframing\n`;
      instruction += `- Brief cognitive pattern references\n`;
      instruction += `- Subtle mental restructuring`;
    } else {
      instruction += `- MINIMAL psychological content: Stay experiential\n`;
      instruction += `- Focus on other dimensions`;
    }

    return instruction;
  }

  private buildPerspectiveInstructions(config: TemplateJSON['dimensions']['perspective']): string {
    const level = config.level;
    let instruction = `**PERSPECTIVE DIMENSION (${level}% emphasis)**\n`;
    
    // Add primary POV if specified
    if (config.primary_pov) {
      instruction += `- PRIMARY POV: ${config.primary_pov}\n`;
    }
    
    // Add techniques if specified
    if (config.techniques && config.techniques.length > 0) {
      instruction += `- PERSPECTIVE TECHNIQUES: ${config.techniques.join(', ')}\n`;
    }
    
    if (level >= 75) {
      instruction += `- HEAVY perspective shifting: Guide client to see from multiple viewpoints extensively\n`;
      instruction += `- Use dissociation, observer stance, role reversals\n`;
      instruction += `- Shift between first/second/third person perspectives`;
    } else if (level >= 50) {
      instruction += `- MODERATE perspective work: Include some viewpoint shifts\n`;
      instruction += `- Use observer position or alternative perspectives\n`;
      instruction += `- Help client see situation from different angles`;
    } else if (level >= 25) {
      instruction += `- LIGHT perspective shifts: Occasional viewpoint change\n`;
      instruction += `- Brief observer stance\n`;
      instruction += `- Subtle reframing through perspective`;
    } else {
      instruction += `- MINIMAL perspective work: Maintain primary viewpoint\n`;
      instruction += `- Focus on other dimensions`;
    }

    return instruction;
  }

  private buildSpiritualInstructions(config: TemplateJSON['dimensions']['spiritual']): string {
    const level = config.level;
    let instruction = `**SPIRITUAL DIMENSION (${level}% emphasis) - ENABLED**\n`;
    
    // Add framework if specified
    if (config.framework) {
      instruction += `- SPIRITUAL FRAMEWORK: ${config.framework}\n`;
    }
    
    if (level >= 75) {
      instruction += `- HEAVY spiritual/transpersonal work: Deep connection to meaning, purpose, higher wisdom\n`;
      instruction += `- Reference universal consciousness, spiritual guides, sacred experiences\n`;
      instruction += `- Tap into transcendent states and spiritual resources extensively`;
    } else if (level >= 50) {
      instruction += `- MODERATE spiritual content: Connect to sense of purpose and meaning\n`;
      instruction += `- Reference higher self or inner wisdom\n`;
      instruction += `- Include spiritual or transpersonal elements`;
    } else if (level >= 25) {
      instruction += `- LIGHT spiritual touches: Occasional reference to meaning or purpose\n`;
      instruction += `- Brief connection to inner wisdom\n`;
      instruction += `- Subtle transpersonal elements`;
    } else {
      instruction += `- MINIMAL spiritual content: Brief reference to personal meaning\n`;
      instruction += `- Keep spiritual elements very subtle`;
    }

    return instruction;
  }

  private buildRelationalInstructions(config: TemplateJSON['dimensions']['relational']): string {
    const level = config.level;
    let instruction = `**RELATIONAL DIMENSION (${level}% emphasis)**\n`;
    
    // Add approaches if specified
    if (config.approaches && config.approaches.length > 0) {
      instruction += `- RELATIONAL APPROACHES: ${config.approaches.join(', ')}\n`;
    }
    
    if (level >= 75) {
      instruction += `- HEAVY relational focus: Explore relationships, connection, belonging extensively\n`;
      instruction += `- Address interpersonal dynamics, social connections, sense of community\n`;
      instruction += `- Work with relationship patterns and experiences of connection`;
    } else if (level >= 50) {
      instruction += `- MODERATE relational content: Include relationship themes\n`;
      instruction += `- Reference connections with others\n`;
      instruction += `- Address interpersonal aspects`;
    } else if (level >= 25) {
      instruction += `- LIGHT relational touches: Occasional connection themes\n`;
      instruction += `- Brief relationship references\n`;
      instruction += `- Subtle interpersonal elements`;
    } else {
      instruction += `- MINIMAL relational content: Keep focus individual\n`;
      instruction += `- Focus on other dimensions`;
    }

    return instruction;
  }

  private buildLanguageInstructions(config: TemplateJSON['dimensions']['language']): string {
    const level = config.level;
    let instruction = `**LANGUAGE DIMENSION (${level}% emphasis)**\n`;
    
    // Add communication style if specified
    if (config.style) {
      instruction += `- COMMUNICATION STYLE: ${config.style}\n`;
    }
    
    // Add pacing if specified
    if (config.pacing) {
      instruction += `- PACING: ${config.pacing}\n`;
    }
    
    if (level >= 75) {
      instruction += `- HEAVY linguistic craft: Use advanced hypnotic language patterns extensively\n`;
      instruction += `- Employ embedded commands, nested loops, presuppositions, ambiguity\n`;
      instruction += `- Craft language with precision for maximum hypnotic effect`;
    } else if (level >= 50) {
      instruction += `- MODERATE linguistic attention: Use good hypnotic phrasing and pacing\n`;
      instruction += `- Include some embedded suggestions and language patterns\n`;
      instruction += `- Pay attention to word choice and rhythm`;
    } else if (level >= 25) {
      instruction += `- LIGHT linguistic craft: Basic hypnotic language\n`;
      instruction += `- Simple, clear suggestions\n`;
      instruction += `- Natural conversational flow`;
    } else {
      instruction += `- MINIMAL linguistic craft: Very simple, direct language\n`;
      instruction += `- Focus on content over linguistic patterns`;
    }

    return instruction;
  }

  /**
   * Build style-specific instructions
   */
  private buildStyleInstructions(template: TemplateJSON): string {
    const parts: string[] = [];

    // Overall communication style from language dimension (only if language dimension is active)
    const style = template.dimensions.language.style;
    if (style && template.dimensions.language.level > 0) {
      parts.push(`**OVERALL STYLE**: ${style}`);
    }

    // Archetype from symbolic dimension (only if symbolic dimension is active)
    const archetype = template.dimensions.symbolic.archetype;
    if (archetype && template.dimensions.symbolic.level > 0) {
      parts.push(`**THERAPEUTIC ARCHETYPE**: ${archetype} - embody this archetype's qualities`);
    }

    return parts.join('\n');
  }

  /**
   * Build generation rules instructions
   */
  private buildGenerationRules(rules: TemplateJSON['generation_rules']): string {
    const parts: string[] = [];

    if (rules.opening_style) {
      parts.push(`- **OPENING STYLE**: ${rules.opening_style}`);
    }

    if (rules.closing_style) {
      parts.push(`- **CLOSING STYLE**: ${rules.closing_style}`);
    }

    if (rules.voice_tone) {
      parts.push(`- **VOICE TONE**: ${rules.voice_tone}`);
    }

    if (rules.pacing) {
      parts.push(`- **PACING**: ${rules.pacing}`);
    }

    return parts.length > 0 ? `**GENERATION RULES**:\n${parts.join('\n')}` : '';
  }

  /**
   * Build system prompt for AI
   */
  private buildSystemPrompt(dimensionInstructions: string, styleInstructions: string, generationRules: string): string {
    let prompt = `You are an expert hypnotherapist using Erika Flint's 8-Dimensional Hypnosis Framework.

You will generate hypnotic content following these EXACT dimensional instructions:

${dimensionInstructions}

${styleInstructions}`;

    if (generationRules) {
      prompt += `\n\n${generationRules}`;
    }

    prompt += `

**CRITICAL RULES**:
1. Follow the dimensional emphasis levels precisely - higher percentages mean MORE content in that dimension
2. Only include dimensions that have emphasis > 0
3. If spiritual dimension is not enabled, do NOT include any spiritual content
4. Respect the specified style, archetype, metaphor, framework, and techniques
5. Create flowing, coherent content that integrates all active dimensions naturally
6. Use appropriate hypnotic language patterns based on the language dimension level
7. The output should feel unified, not like separate dimension sections

Follow the specific task instructions in the user message for what to generate (preview, full script, or remix).`;

    return prompt;
  }

  /**
   * Build user prompt for AI
   */
  private buildUserPrompt(
    presentingIssue: string,
    desiredOutcome: string,
    clientNotes: string
  ): string {
    let prompt = `**CLIENT CONTEXT**:\n\n`;
    prompt += `**PRESENTING ISSUE**: ${presentingIssue}\n\n`;
    prompt += `**DESIRED OUTCOME**: ${desiredOutcome}\n\n`;
    
    if (clientNotes.trim()) {
      prompt += `**ADDITIONAL NOTES**: ${clientNotes}\n\n`;
    }
    
    return prompt;
  }
}

// Export singleton instance
export const dimensionAssembler = new DimensionAssembler();
