# HypnoBrain Script Shaper v2.0 - Build Specification
## JSON Template Architecture - Modular, Pluggable, Extensible

---

## 🎯 Project Vision

Build a professional hypnosis script generation tool where **templates are the product, not just a feature**. The system must be modular and data-driven so that:
- Adding new templates requires NO code changes (just JSON)
- Users can save their custom mixes as reusable templates
- Templates can be applied to any script
- The platform can evolve into a template marketplace

**Think:** WordPress themes, Shopify templates, VSCode extensions - but for hypnosis scripts.

---

## 🏗️ Recommended Architecture (Open to Replit's Suggestions)

We recommend a **JSON-based template system** for maximum extensibility, but **Replit Agent should feel empowered to suggest better approaches** based on its knowledge of modern web architecture, performance optimization, and scalability patterns.

### Core Architectural Principles:

1. **Templates as Data, Not Code**
   - Templates stored as JSON (database or files)
   - System reads templates dynamically
   - No hardcoded template logic

2. **Dimension Modules**
   - Each of 8 dimensions is independently configurable
   - Settings stored as structured data
   - Modules combine to create final prompt

3. **Modular Generation Pipeline**
   - User input → Template selection → Dimension assembly → Prompt generation → Script

4. **Extensibility First**
   - Add templates: Drop JSON file or create via UI
   - Add dimensions: Extend schema (future-proof)
   - Add features: Pluggable architecture

---

## 📋 Core Requirements

### Must-Have Features (v2.0):

#### 1. **Template System**
- Store templates as structured data (JSON recommended)
- System templates (curated by admin)
- User templates (created by users)
- Template metadata (name, description, category, tags, usage stats)

#### 2. **Smart Template Selection**
- User enters: presenting issue, desired outcome, notes
- System suggests 3-5 relevant templates
- Show preview of each template's approach
- User picks one or chooses "customize manually"

#### 3. **Dimension Mixer**
- 8 dimensions with appropriate UI controls:
  - **Somatic** - Slider (0-100%)
  - **Language** - Slider + style dropdown
  - **Symbolic** - Slider + archetype dropdown + metaphor selector
  - **Psychological** - Slider + checkboxes (parts work, beliefs, etc.)
  - **Temporal** - Slider + checkboxes (regression, progression, etc.)
  - **Perspective** - Slider + checkboxes (observer, first-person, etc.)
  - **Relational** - Slider + checkboxes (self-compassion, forgiveness, etc.)
  - **Spiritual** - Toggle (on/off) + framework dropdown + slider

#### 4. **"Save This Mix" Feature**
- After generating script, user can save dimension settings as template
- User names template, adds description, tags
- Saves to user's private template library
- Optional: Make public for community

#### 5. **"Apply Template to Script" Feature**
- User has existing script (generated or pasted)
- Can select template to apply
- System remixes script with new dimensional emphasis
- Shows what will change before applying
- Charges $2-3 for remix

#### 6. **Template Generator (Admin Tool)**
- Internal tool for creating system templates
- Visual dimension mixer
- Test generation with preview
- Export as JSON or save directly to database
- Publish to system template library

#### 7. **Free + Paid Tiers**
- **Free:** Weekly script with default template, simplified form
- **Paid:** Full customization, save templates, apply templates

---

## 🎨 User Flows

### Flow 1: Quick Generation with Template

```
User lands → Enters client info → System shows 3 template options → 
User picks template → Previews script (free) → Loves it → 
Pays $3 → Gets full script + assets
```

### Flow 2: Custom Mix Creation

```
User lands → "Customize manually" → Adjusts 8 dimension sliders → 
Previews script → Refines → Generates full script → 
"Save this mix!" → Names it → Added to user's template library
```

### Flow 3: Apply Template to Existing Script

```
User has script → "Apply different template" → 
Selects template → Previews changes → 
Pays $2 → Remixed script generated
```

### Flow 4: Admin Template Creation

```
Admin → Template Generator → Designs dimensions visually → 
Tests generation → Exports JSON → Publishes to system → 
All users see new template
```

---

## 📊 Data Models

### Suggested JSON Template Schema

**Note to Replit Agent:** This is a recommended structure. Feel free to optimize or suggest improvements based on best practices.

```json
{
  "id": "somatic_beginner",
  "version": "1.0",
  "name": "Somatic Beginner",
  "description": "Body-focused, gentle, perfect for first-timers",
  "category": "beginner",
  "tags": ["anxiety", "beginner", "body-focused"],
  
  "use_cases": [
    "First-time hypnosis clients",
    "Anxiety or overthinking",
    "General stress relief"
  ],
  
  "presenting_issues": ["anxiety", "stress", "overthinking"],
  
  "dimensions": {
    "somatic": {
      "level": 100,
      "emphasis": "body_awareness",
      "techniques": ["breath_focus", "body_scan"]
    },
    "language": {
      "level": 30,
      "style": "simple_direct",
      "pacing": "slow"
    },
    "symbolic": {
      "level": 20,
      "archetype": null,
      "metaphor": null
    },
    "psychological": {
      "level": 20,
      "approaches": [],
      "depth": "surface"
    },
    "temporal": {
      "level": 10,
      "work_types": [],
      "focus": "present_moment"
    },
    "perspective": {
      "level": 30,
      "primary_pov": "first_person"
    },
    "relational": {
      "level": 40,
      "approaches": ["self_compassion"]
    },
    "spiritual": {
      "enabled": false,
      "level": 0
    }
  },
  
  "generation_rules": {
    "opening_style": "gentle_grounding",
    "closing_style": "slow_emergence",
    "voice_tone": "warm_supportive"
  },
  
  "prompting_hints": {
    "priority": [
      "Start with breath and body awareness",
      "Use simple, concrete language"
    ],
    "avoid": [
      "Complex psychological concepts",
      "Abstract spiritual content"
    ]
  },
  
  "metadata": {
    "created_by": "system",
    "usage_count": 0,
    "is_public": true
  }
}
```

### Database Schema (PostgreSQL Recommended)

**Note to Replit Agent:** Optimize this schema as needed for performance and scalability.

```sql
-- Templates table
CREATE TABLE templates (
  id SERIAL PRIMARY KEY,
  template_id VARCHAR(255) UNIQUE NOT NULL,
  json_data JSONB NOT NULL,
  
  -- Denormalized for fast queries
  name VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  tags TEXT[],
  
  created_by VARCHAR(100),
  is_public BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  
  usage_count INTEGER DEFAULT 0,
  rating_avg DECIMAL(3,2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Script generations
CREATE TABLE generations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  email VARCHAR(255),
  
  generation_mode VARCHAR(20), -- 'create', 'remix', 'free'
  template_used VARCHAR(255),
  
  presenting_issue VARCHAR(255),
  desired_outcome TEXT,
  custom_notes TEXT,
  
  dimensions_json JSONB,
  
  preview_text TEXT,
  full_script TEXT,
  assets_json JSONB,
  
  price_paid_cents INTEGER DEFAULT 0,
  stripe_payment_intent_id VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Free tier rate limiting
CREATE TABLE free_script_usage (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  last_free_script_at TIMESTAMP NOT NULL,
  free_scripts_count INTEGER DEFAULT 1
);

-- User template libraries
CREATE TABLE user_template_libraries (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  template_id VARCHAR(255) NOT NULL,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);
```

---

## 🎨 UI/UX Requirements

### Landing Page

```
┌─────────────────────────────────────────┐
│ 🧠 HYPNOBRAIN SCRIPT SHAPER             │
│                                         │
│ The DAW for Hypnosis Scripts           │
│ Mix dimensions like audio. Generate     │
│ professional scripts in minutes.        │
│                                         │
│ [🎁 Get Free Script This Week]          │
│ [🎨 Create Custom Script]               │
│ [🔄 Remix Existing Script]              │
└─────────────────────────────────────────┘
```

### Smart Template Selection Screen

```
┌─────────────────────────────────────────┐
│ TELL US ABOUT YOUR CLIENT               │
├─────────────────────────────────────────┤
│ Presenting Issue:                       │
│ [Anxiety              ▼]               │
│                                         │
│ Desired Outcome:                        │
│ [Feel calm and in control_______]      │
│                                         │
│ Additional Notes:                       │
│ [First time with hypnosis_______]      │
│                                         │
│ [→ Show Me Template Options]            │
└─────────────────────────────────────────┘
```

### Template Options Display

```
┌─────────────────────────────────────────┐
│ RECOMMENDED TEMPLATES FOR YOU           │
├─────────────────────────────────────────┤
│                                         │
│ ⭐ SOMATIC BEGINNER (Recommended)       │
│ Body-focused, perfect for anxiety      │
│ [150-word preview shown here...]        │
│ Dimensions: 100% Somatic, 30% Language │
│ [💚 Choose This] [🔍 Details]           │
│                                         │
│ ─────────────────────────────────────  │
│                                         │
│ BALANCED THERAPEUTIC                    │
│ Well-rounded approach                  │
│ [150-word preview...]                   │
│ [💚 Choose This] [🔍 Details]           │
│                                         │
│ ─────────────────────────────────────  │
│                                         │
│ METAPHOR JOURNEY                        │
│ Story-based with Hero's Journey        │
│ [150-word preview...]                   │
│ [💚 Choose This] [🔍 Details]           │
│                                         │
│ ─────────────────────────────────────  │
│                                         │
│ [🎨 None of these - Customize from scratch] │
└─────────────────────────────────────────┘
```

### Dimension Mixer (Full Customization)

```
┌─────────────────────────────────────────┐
│ 8D DIMENSION MIXER                      │
├─────────────────────────────────────────┤
│ Somatic (Body)                          │
│ ████████░░ 80%                         │
│                                         │
│ Language (Hypnotic Patterns)            │
│ ██████░░░░ 60%                         │
│ Style: [Permissive/Ericksonian  ▼]    │
│                                         │
│ Symbolic (Metaphor & Story)             │
│ ████████░░ 75%                         │
│ Archetype: [Hero's Journey      ▼]    │
│ Metaphor: [Garden tending       ▼]    │
│                                         │
│ Psychological (Inner Work)              │
│ ██████░░░░ 60%                         │
│ ☑ Parts work  ☐ Beliefs  ☐ Shadow     │
│                                         │
│ Temporal (Time-Based)                   │
│ ████░░░░░░ 40%                         │
│ ☐ Regression  ☑ Future pacing          │
│                                         │
│ Perspective (Point of View)             │
│ █████░░░░░ 50%                         │
│ ☑ First person  ☐ Observer mode        │
│                                         │
│ Relational (Connection)                 │
│ ████░░░░░░ 45%                         │
│ ☑ Self-compassion  ☐ Forgiveness       │
│                                         │
│ Spiritual (Transpersonal)               │
│ ☑ Include spiritual dimension          │
│ Framework: [Non-denominational  ▼]    │
│ Intensity: ███░░░░░░░ 30%              │
│                                         │
│ [🎵 Generate Preview - Free]            │
│ [💾 Save This Mix as Template]          │
└─────────────────────────────────────────┘
```

### Save Template Dialog

```
┌─────────────────────────────────────────┐
│ 💾 SAVE THIS MIX AS TEMPLATE            │
├─────────────────────────────────────────┤
│ Template Name *                         │
│ [_____________________________]        │
│                                         │
│ Description *                           │
│ [_____________________________]        │
│ [_____________________________]        │
│                                         │
│ Category:                               │
│ [Intermediate          ▼]              │
│                                         │
│ Tags (comma-separated):                 │
│ [anxiety, grounding, custom_____]      │
│                                         │
│ Best for (check all):                   │
│ ☐ Beginners  ☑ Intermediate  ☐ Advanced│
│                                         │
│ ☐ Make this template public            │
│   (Share with HypnoBrain community)    │
│                                         │
│ Current Mix Summary:                    │
│ • Somatic: 80%                          │
│ • Symbolic: 75% (Garden metaphor)       │
│ • Language: 60% (Permissive style)      │
│ • [... other dimensions]                │
│                                         │
│ [💾 Save Template]  [📥 Export JSON]    │
│ [❌ Cancel]                             │
└─────────────────────────────────────────┘
```

### Template Generator (Admin Tool)

```
┌─────────────────────────────────────────┐
│ 🎨 TEMPLATE GENERATOR (Admin)           │
├─────────────────────────────────────────┤
│ Template Name: [________________]       │
│ Category: [Beginner     ▼]             │
│ Description: [________________]         │
│                                         │
│ ──────────────────────────────────────  │
│ DIMENSION DESIGNER:                     │
│ [Full dimension mixer here]             │
│                                         │
│ ──────────────────────────────────────  │
│ GENERATION RULES:                       │
│ Opening style: [Gentle grounding  ▼]   │
│ Voice tone: [Warm supportive      ▼]   │
│ Pacing: [Slow                     ▼]   │
│                                         │
│ Priority Instructions:                  │
│ [• Start with breath awareness____]    │
│ [• Use simple language_______]         │
│                                         │
│ Avoid:                                  │
│ [• Complex psychology_______]          │
│ [• Multiple metaphors_______]          │
│                                         │
│ ──────────────────────────────────────  │
│ [🎵 Test This Template]                 │
│ [💾 Save as System Template]            │
│ [📥 Export JSON File]                   │
└─────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Recommended Tech Stack

**Note to Replit Agent:** These are recommendations. Please suggest alternatives if you have better options.

- **Framework:** Next.js (TypeScript)
- **Database:** PostgreSQL with JSONB support
- **AI:** Claude API (Anthropic)
- **Payments:** Stripe
- **Styling:** Tailwind CSS
- **Auth:** Replit Auth or NextAuth.js

### Core System Components

#### 1. Template Loader

```typescript
// Pseudo-code - implement in best way for your architecture
interface Template {
  id: string;
  name: string;
  dimensions: DimensionConfig;
  generation_rules: GenerationRules;
  // ... rest of schema
}

class TemplateManager {
  async loadTemplate(templateId: string): Promise<Template> {
    // Load from database
    const result = await db.query(
      'SELECT json_data FROM templates WHERE template_id = $1',
      [templateId]
    );
    return result.rows[0].json_data;
  }
  
  async saveUserTemplate(userId: string, template: Template) {
    // Save user's custom template
  }
  
  async getSuggestedTemplates(
    presentingIssue: string,
    outcome: string
  ): Promise<Template[]> {
    // Smart template selection logic
  }
}
```

#### 2. Dimension Assembler

```typescript
// Pseudo-code
interface DimensionConfig {
  somatic: { level: number; /* ... */ };
  language: { level: number; style: string; /* ... */ };
  // ... all 8 dimensions
}

class DimensionAssembler {
  assemblePrompt(
    template: Template,
    userInput: UserInput
  ): string {
    // Each dimension contributes to final prompt
    const parts = [
      this.assembleSomatic(template.dimensions.somatic),
      this.assembleLanguage(template.dimensions.language),
      this.assembleSymbolic(template.dimensions.symbolic),
      // ... all dimensions
    ];
    
    return this.combineIntoMasterPrompt(parts, userInput);
  }
  
  private assembleSomatic(config: SomaticConfig): string {
    // Generate somatic-specific instructions
    if (config.level > 80) {
      return "Heavy emphasis on body awareness...";
    }
    // ... etc
  }
}
```

#### 3. Script Generator

```typescript
// Pseudo-code
class ScriptGenerator {
  async generate(config: GenerationConfig): Promise<Script> {
    const prompt = this.dimensionAssembler.assemblePrompt(
      config.template,
      config.userInput
    );
    
    const script = await this.claudeAPI.generate(prompt);
    
    return {
      text: script,
      template_used: config.template.id,
      dimensions: config.template.dimensions
    };
  }
  
  async remix(
    originalScript: string,
    newTemplate: Template
  ): Promise<Script> {
    // Apply new template to existing script
  }
}
```

#### 4. Template Smart Selector

```typescript
// Pseudo-code
class TemplateSelector {
  async suggest(
    presentingIssue: string,
    desiredOutcome: string,
    notes: string
  ): Promise<Template[]> {
    // Rule-based selection
    const suggestions: Template[] = [];
    
    // Always include beginner-friendly option for anxiety
    if (this.matchesIssue(presentingIssue, ['anxiety', 'stress'])) {
      suggestions.push(await this.loadTemplate('somatic_beginner'));
    }
    
    // Add balanced option
    suggestions.push(await this.loadTemplate('balanced_therapeutic'));
    
    // Check for specific indicators
    if (notes.includes('story') || notes.includes('creative')) {
      suggestions.push(await this.loadTemplate('metaphor_journey'));
    }
    
    // Fill remaining slots with popular templates
    while (suggestions.length < 3) {
      suggestions.push(await this.getPopularTemplate());
    }
    
    return suggestions;
  }
}
```

---

## 🎯 System Templates to Include

### Create These 8 Templates Initially:

1. **Somatic Beginner**
   - 100% Somatic, 30% Language, minimal other dimensions
   - For: First-timers, anxiety, overthinking

2. **Relaxation & Sleep**
   - 90% Somatic, 40% Language, 30% Symbolic
   - For: Insomnia, stress relief

3. **Balanced Therapeutic**
   - 60% across most dimensions, well-rounded
   - For: Standard therapeutic sessions

4. **Metaphor Journey**
   - 90% Symbolic (Hero's Journey), 60% Temporal
   - For: Story-lovers, creative clients

5. **Deep Psychological Work**
   - 95% Psychological (parts work + beliefs), 70% Language
   - For: Advanced clients, deep inner work

6. **Timeline Therapy**
   - 95% Temporal (regression + progression), 80% Perspective
   - For: Processing past, installing future success

7. **Spiritual Awakening**
   - 95% Spiritual (non-denominational), 85% Symbolic
   - For: Spiritual clients, meaning-seeking

8. **Nature Connection**
   - 80% Symbolic (garden metaphor), 70% Somatic, 80% Spiritual (nature-based)
   - For: Eco-conscious clients, grounding

**Each template should be a separate JSON file for easy editing.**

---

## 💰 Pricing & Business Model

### Free Tier:
- 1 script per week
- Email required
- Uses default "Balanced Therapeutic" template
- Simplified form (no dimension customization)
- No marketing assets
- 7-day cooldown

### Paid Tier:
- **$3 per script generation**
  - Full customization
  - All dimension controls
  - Choose or customize templates
  - 6 marketing assets included
  - Unlimited previews
  
- **$2 per remix**
  - Apply template to existing script
  
- **Future: $19/month subscription**
  - Unlimited generations
  - Save unlimited templates
  - Priority support

---

## 🚀 Development Phases

### Phase 1: Core System (Weeks 1-2)
- [ ] Database setup with template schema
- [ ] Template loader/manager
- [ ] Basic dimension mixer UI
- [ ] Script generation with Claude API
- [ ] 3-template smart selection
- [ ] Payment integration (Stripe)

### Phase 2: Template Features (Week 3)
- [ ] "Save This Mix" functionality
- [ ] User template library
- [ ] Template application to scripts
- [ ] Remix feature
- [ ] Free tier rate limiting

### Phase 3: Template Generator (Week 4)
- [ ] Admin-only Template Generator tool
- [ ] Visual dimension designer
- [ ] Test generation
- [ ] JSON export
- [ ] Publish to system templates

### Phase 4: Polish & Launch (Week 5)
- [ ] UI/UX polish
- [ ] Email delivery system
- [ ] Analytics tracking
- [ ] Documentation
- [ ] Beta testing
- [ ] Launch! 🚀

---

## 📝 Seed Data: System Templates

**Replit Agent:** Please create these 8 templates as JSON files or database seeds.

### Template 1: Somatic Beginner

```json
{
  "id": "somatic_beginner",
  "version": "1.0",
  "name": "Somatic Beginner",
  "description": "Body-focused, gentle, perfect for first-timers or anxiety",
  "category": "beginner",
  "tags": ["anxiety", "beginner", "body-focused", "grounding"],
  "use_cases": [
    "First-time hypnosis clients",
    "Clients with anxiety or overthinking",
    "When grounding is needed",
    "General stress relief"
  ],
  "presenting_issues": ["anxiety", "stress", "overthinking", "panic"],
  "best_for_experience": "beginner",
  "dimensions": {
    "somatic": {
      "level": 100,
      "emphasis": "body_awareness",
      "techniques": ["breath_focus", "progressive_relaxation", "body_scan"]
    },
    "language": {
      "level": 30,
      "style": "simple_direct",
      "embedding_density": "low",
      "pacing": "slow"
    },
    "symbolic": {
      "level": 20,
      "enabled": true,
      "archetype": null,
      "metaphor": null,
      "imagery_type": "minimal"
    },
    "psychological": {
      "level": 20,
      "approaches": [],
      "depth": "surface",
      "complexity": "low"
    },
    "temporal": {
      "level": 10,
      "work_types": [],
      "focus": "present_moment"
    },
    "perspective": {
      "level": 30,
      "primary_pov": "first_person",
      "shifts": false
    },
    "relational": {
      "level": 40,
      "approaches": ["self_compassion"],
      "focus": "self_relationship"
    },
    "spiritual": {
      "enabled": false,
      "level": 0,
      "framework": null
    }
  },
  "generation_rules": {
    "script_structure": "standard",
    "opening_style": "gentle_grounding",
    "closing_style": "slow_emergence",
    "voice_tone": "warm_supportive",
    "sentence_complexity": "simple",
    "paragraph_length": "short"
  },
  "prompting_hints": {
    "priority_instructions": [
      "Start with breath and body awareness",
      "Use simple, concrete language",
      "Avoid complex metaphors or psychology",
      "Return to breath frequently",
      "Build safety and trust",
      "Heavy emphasis on physical sensations"
    ],
    "avoid": [
      "Complex psychological concepts",
      "Multiple metaphors",
      "Time travel work",
      "Abstract spiritual content",
      "Dense hypnotic language patterns"
    ]
  },
  "metadata": {
    "created_by": "system",
    "created_at": "2025-01-15",
    "is_public": true,
    "is_premium": false
  }
}
```

**[Similar JSON structures for the other 7 templates - Replit Agent can generate these following the same pattern]**

---

## 🤖 AI Prompting Strategy

### Master Prompt Assembly

When generating scripts, the system should assemble a master prompt from:

1. **Base Instructions** (always included):
```
You are an expert hypnosis script writer using the 8-Dimensional Framework.
Generate a professional, therapeutic hypnosis script based on the specifications below.
```

2. **Client Context**:
```
Client Information:
- Presenting Issue: [user's input]
- Desired Outcome: [user's input]
- Additional Notes: [user's input]
```

3. **Dimensional Instructions** (assembled from template):
```
Dimensional Emphasis:

SOMATIC (100%):
- Heavy emphasis on body awareness and physical sensations
- Start with breath and grounding
- Return to body frequently
- Use concrete, sensory language
[... specific instructions based on level & config]

LANGUAGE (30%):
- Simple, direct language
- Low embedding density
- Slow pacing
- Minimal complex patterns
[... specific instructions]

[... continue for all 8 dimensions]
```

4. **Generation Rules**:
```
Script Structure:
- Opening: Gentle grounding
- Voice: Warm and supportive
- Sentences: Simple and short
- Closing: Slow emergence
```

5. **Priority Instructions & Avoid List**:
```
PRIORITY:
- Start with breath awareness
- Build safety and trust
- ...

AVOID:
- Complex psychology
- Multiple metaphors
- ...
```

6. **Format Requirements**:
```
Format:
- Length: 800-1500 words
- Include stage directions in [brackets]
- Clear sections: Induction → Deepening → Core Work → Emergence
```

**The key:** Each dimension module contributes its piece, then all assemble into one comprehensive prompt.

---

## 🎨 Design System Notes

### Color Palette (DAW-Inspired)
- Dark theme by default
- Primary: Deep blue/purple (like Ableton)
- Accent: Warm gold (for highlights)
- Sliders: Gradient fills showing intensity
- Success: Soft green
- Warning: Soft amber

### Typography
- Headers: Bold, clear, sans-serif
- Body: Readable, comfortable
- Code/JSON: Monospace when showing technical details

### Animations
- Smooth slider movements
- "Mixing" animation when generating
- Subtle pulse on selected template
- Progress indicators for generation

---

## ⚙️ Configuration & Environment

### Required Environment Variables:

```
DATABASE_URL=postgresql://...
CLAUDE_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_SERVICE_API_KEY=...
EMAIL_FROM=scripts@hypnobrain.ai
NEXT_PUBLIC_APP_URL=https://...
ADMIN_PASSWORD_HASH=...
FREE_SCRIPT_COOLDOWN_DAYS=7
```

---

## 🧪 Testing Requirements

### Critical Test Cases:

1. **Template Loading**
   - Load system template
   - Load user template
   - Handle missing template gracefully

2. **Template Application**
   - Apply template to fresh generation
   - Apply template to existing script
   - Verify dimension settings match template

3. **Save Template**
   - User saves custom mix
   - JSON structure is valid
   - Template appears in user's library

4. **Smart Selection**
   - Correct templates suggested for anxiety
   - Correct templates for other issues
   - Fallback to balanced when uncertain

5. **Free Tier**
   - Rate limiting works (1 per week)
   - Countdown displays correctly
   - Blocks second attempt

6. **Generation Quality**
   - Scripts match dimensional emphasis
   - Voice/tone consistent
   - Appropriate length
   - No hallucinations

---

## 📚 Documentation Needs

1. **User Guide**
   - How to use templates
   - How to save custom mixes
   - Understanding dimensions

2. **Template Guide**
   - What each system template is for
   - When to use which template
   - How to create custom templates

3. **API Documentation** (future)
   - For when you add API access
   - Template JSON schema
   - Integration guides

---

## 🎯 Success Metrics to Track

### Product Metrics:
- Templates used (which are most popular?)
- Custom templates created
- Template application rate
- Free → Paid conversion
- Script quality ratings

### Business Metrics:
- MRR (Monthly Recurring Revenue)
- Revenue per user
- Churn rate
- Template marketplace readiness

---

## 🚨 Important Notes for Replit Agent

### Architecture Flexibility:

**You (Replit Agent) are the expert in modern web development.** While we've recommended a JSON-based template system:

1. **Feel free to suggest alternatives** if you know better patterns
2. **Optimize the database schema** as you see fit
3. **Choose the best state management** for the dimension mixer
4. **Implement caching** where appropriate
5. **Add error handling** that makes sense for this architecture
6. **Suggest performance improvements**

### What's Non-Negotiable:

✅ Templates must be data-driven (not hardcoded)
✅ Users must be able to save their mixes
✅ Users must be able to apply templates to scripts
✅ Admin must be able to create templates easily
✅ System must be extensible without code changes

### What's Flexible:

🔧 Exact data structure (JSON vs. other)
🔧 Storage mechanism (database vs. files vs. hybrid)
🔧 UI framework (though Next.js recommended)
🔧 State management approach
🔧 Caching strategy
🔧 API structure

**Build it well. Build it smart. Use your knowledge to make this production-ready.**

---

## 🏁 Ready to Build?

This spec gives you:
- ✅ Clear product vision
- ✅ Recommended architecture (with flexibility)
- ✅ Complete feature list
- ✅ UI mockups
- ✅ Data models
- ✅ Business logic
- ✅ Seed data
- ✅ Success metrics

**Replit Agent: You have full autonomy to implement this in the best way possible. Suggest improvements. Optimize. Make it production-ready.**

Let's build a platform, not just an app. 🚀