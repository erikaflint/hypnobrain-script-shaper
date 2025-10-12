# HypnoBrain Script Shaper - Technical Specification

## Core Philosophy

This application is based on the **8-Dimensional (8D) Hypnosis Framework** created by Erika Flint. The framework provides a comprehensive approach to hypnosis script creation by weaving together eight distinct dimensions:

1. **Somatic** - Body-based awareness and physical sensations as entry points for transformation
2. **Language** - Hypnotic language patterns, linguistic precision, and embedded suggestions
3. **Symbolic** - Metaphors, imagery, and archetypal themes that speak to the subconscious
4. **Psychological** - Inner architecture, cognitive patterns, beliefs, and parts work
5. **Temporal** - Time-based work including regression, progression, and time perception shifts
6. **Perspective** - Point of view changes, observer mode, and future self embodiment
7. **Relational** - Connection, dialogue, self-relationship, and interpersonal dynamics
8. **Spiritual** - Transpersonal connection, meaning, purpose, and higher self alignment

**Key Principle:** Scripts don't need all eight dimensions every time, but layering multiple dimensions creates more impactful, transformative hypnosis. The dimension sliders allow practitioners to emphasize certain approaches based on client needs.

---

## Three-Tier Product Strategy

### 🎁 Free Tier: "Get Your Free Script This Week"
**Goal:** Acquisition + Demonstrate Quality

**What's Included:**
- Full-length script (800-1000 words)
- Email delivery
- High quality, professionally written

**What's Limited:**
- Balanced dimensions (all 50% - no customization)
- Default style (Permissive/Ericksonian)
- Generic archetype (Hero's Journey)
- No marketing assets
- 1 per week per email

**Conversion Path:** Show what they missed → Upgrade to paid for customization

---

### 💳 Paid Tier: "Create New Script" ($3)
**Goal:** Revenue + Power User Tool

**What's Included:**
- Full dimension control (8 sliders)
- Archetype selection (6+ options)
- Style selection (3 options)
- Custom notes & metaphors
- Preview before purchase
- Full script (800-1500 words)
- 6 marketing assets (auto-generated)
- PDF/Word download

**Use Cases:**
- Generate script from scratch with full control
- Unlimited previews (remix until perfect)

---

### 🎨 Remix Mode: "Transform Existing Script" ($3)
**Goal:** Unlock Hidden Value + Show Framework Power

**What's Included:**
- Paste existing script
- AI analyzes current dimensions
- Adjust sliders to shift emphasis
- See what changes in preview
- Full remixed script + assets
- Shows before/after comparison

**Unique Value:** "Refresh your tired scripts without starting from scratch"

---

## Project Overview
Build a web application called "HypnoBrain Script Shaper" - a DAW (Digital Audio Workstation) style interface for hypnotherapists to create customized hypnosis scripts. Think of it as "Ableton for hypnotic language" where practitioners mix different dimensions to craft the perfect script.

## Core Philosophy
- **Database-driven configuration** - All settings (dimensions, archetypes, styles, pricing) must be in the database, NOT config files
- **Modular architecture** - Design for extensibility; we're launching with 4 dimensions but need to support 8+ easily
- **Data-driven rendering** - Components should read from database/state, not be hardcoded

## Tech Stack
- **Framework:** Next.js (TypeScript preferred)
- **Database:** PostgreSQL
- **Payments:** Stripe (pay-per-generation model)
- **AI:** Claude API (for script generation)
- **Styling:** Tailwind CSS
- **Auth:** Replit Auth (built-in)

## Database Schema

```sql
-- Dimension configuration
CREATE TABLE dimensions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  default_value INTEGER DEFAULT 50,
  min_value INTEGER DEFAULT 0,
  max_value INTEGER DEFAULT 100,
  enabled BOOLEAN DEFAULT true,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Archetype templates
CREATE TABLE archetypes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  prompt_modifier TEXT,
  enabled BOOLEAN DEFAULT true,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Style options
CREATE TABLE styles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pricing configuration
CREATE TABLE pricing (
  id SERIAL PRIMARY KEY,
  tier_name VARCHAR(100) NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Generation history (for analytics)
CREATE TABLE generations (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255),
  email VARCHAR(255), -- Required for free tier, optional for paid
  generation_mode VARCHAR(20) NOT NULL, -- 'create_new', 'remix', or 'free_weekly'
  is_free BOOLEAN DEFAULT false,
  original_script TEXT, -- Only populated for remix mode
  original_dimensions_json JSONB, -- Analysis of original script (remix mode)
  presenting_issue VARCHAR(255),
  desired_outcome TEXT,
  benefits TEXT,
  custom_notes TEXT,
  dimensions_json JSONB, -- Target dimension settings
  archetype_id INTEGER REFERENCES archetypes(id),
  styles_json JSONB,
  preview_text TEXT,
  full_script TEXT,
  assets_json JSONB,
  price_paid_cents INTEGER DEFAULT 0,
  stripe_payment_intent_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Free script tracking (rate limiting)
CREATE TABLE free_script_usage (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  last_free_script_at TIMESTAMP NOT NULL,
  free_scripts_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(email)
);

CREATE INDEX idx_free_usage_email ON free_script_usage(email);
CREATE INDEX idx_free_usage_last_script ON free_script_usage(last_free_script_at);

-- Admin users (simple)
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Initial Seed Data

**Dimensions (launch with 4 enabled, 4 disabled):**
1. Somatic (enabled) - "Body awareness, physical sensations, embodied experience"
2. Language (enabled) - "Hypnotic language patterns, linguistic precision, embedded suggestions"
3. Symbolic (enabled) - "Metaphors, imagery, archetypal themes and stories"
4. Psychological (enabled) - "Inner architecture, cognitive patterns, beliefs, parts work"
5. Temporal (disabled) - "Time-based work, regression, progression, time perception"
6. Perspective (disabled) - "Point of view shifts, observer mode, future self perspective"
7. Relational (disabled) - "Connection, dialogue, self-relationship, interpersonal dynamics"
8. Spiritual (disabled) - "Transpersonal connection, meaning, purpose, higher self"

**Archetypes:**
- Hero's Journey
- Garden/Growth
- Mountain Climbing
- River Flow
- Inner Child
- Custom (user provides their own)

**Styles:**
- Direct/Authoritarian
- Permissive/Ericksonian
- Conversational/Informal

**Pricing:**
- Full Script Generation: $3.00 (includes marketing assets)

## Core Use Cases

### Use Case 0: Free Weekly Script (Freemium Hook)
**User Story:** "I'm curious about this tool but not ready to pay. I want to try it risk-free."

**Flow:**
1. Landing page prominently features: **"Get Your Free Script This Week"**
2. User fills out **simplified form:**
   - Email (required - for delivery + rate limiting)
   - Presenting Issue (dropdown only)
   - Desired Outcome (single line text)
   - **Hidden/Locked:** Dimension sliders (set to balanced defaults), archetype, style, custom notes
3. Clicks "Generate My Free Script"
4. Gets **full-length script** (800-1000 words) but with:
   - Balanced dimensions (all at 50%)
   - Default style (Permissive/Ericksonian)
   - Generic archetype (Hero's Journey)
   - NO marketing assets
5. **Below the free script, show upgrade prompt:**

```
┌─────────────────────────────────────────┐
│ 🎨 WANT TO CUSTOMIZE THIS SCRIPT?      │
├─────────────────────────────────────────┤
│ Your free script used balanced settings │
│                                         │
│ ❌ You missed out on:                   │
│   • Dimension control (emphasize what   │
│     works best for your client)         │
│   • 6 archetype options                 │
│   • 3 style approaches                  │
│   • Custom notes/metaphors              │
│   • 6 marketing assets (save hours!)    │
│                                         │
│ [🎯 Unlock Full Customization - $3]    │
│                                         │
│ OR paste this script into Remix Mode    │
│ to adjust the dimensions!               │
└─────────────────────────────────────────┘
```

**Rate Limiting:**
- 1 free script per email per week (7-day cooldown)
- Email required for delivery
- Shows countdown: "Your next free script unlocks in 4 days"

**Conversion Strategy:**
- Free script is GOOD (shows quality)
- But experienced hypnotists will immediately want control
- Upgrade button = "Make this script perfect for YOUR client"

---

### Use Case 1: Generate Script from Scratch
**User Story:** "I have a new client coming in for anxiety. I want to create a custom script for them."

**Flow:**
1. User clicks "Create New Script"
2. Fills in client context (presenting issue, desired outcome, benefits)
3. Adjusts dimension sliders to emphasize certain approaches
4. Selects archetype and style
5. Clicks "Generate Preview" (free, unlimited)
6. Reviews 150-word preview
7. **Options:**
   - **"Love it! Generate Full Script"** → Pay $3 → Get full script + assets
   - **"Remix"** → Adjust sliders, regenerate preview (free, can do this many times)
   - **"Start Over"** → Clear all settings

### Use Case 2: Remix an Existing Script
**User Story:** "I have a script I've been using for years, but it feels stale. I want to add more symbolic elements and reduce the direct language."

**Flow:**
1. User clicks "Start with Existing Script"
2. Pastes their existing script into text area
3. AI analyzes the script and sets dimension sliders to match current emphasis
   - Shows: "Your script is currently: Somatic 40%, Language 80%, Symbolic 20%..."
4. User adjusts sliders (e.g., crank Symbolic to 90%, reduce Language to 50%)
5. Clicks "Remix Preview" (free)
6. Reviews how the script changed
7. **Options:**
   - **"Love it! Generate Full Remixed Script"** → Pay $3 → Get full version + assets
   - **"Keep Remixing"** → Adjust sliders again, see another preview
   - **"Revert to Original"** → Reset to original script analysis

**Key Difference:** In remix mode, the AI preserves the core structure/content but shifts the dimensional emphasis. Think of it like changing the EQ on a song - same song, different feel.

---

## User Flow

### 1. Landing Page
- Hero section explaining the tool
- **PRIMARY CTA: "Get Your Free Script This Week"** (large, prominent)
- Three secondary CTAs below:
  - **"Create New Script"** (full paid experience)
  - **"Remix Existing Script"** (full paid experience)
  - Show free vs paid comparison table
- No login required for any mode

### 2. Script Shaper Interface (Main App)

**Mode Switcher:**
```
[ Create New ] [ Remix Existing ]
```

---

#### Mode A: Create New Script

**Input Section:**
```
┌─────────────────────────────────────────┐
│ CLIENT CONTEXT                          │
├─────────────────────────────────────────┤
│ Presenting Issue: [Dropdown + text]    │
│   Options: Anxiety, Weight Loss,       │
│   Smoking, Confidence, Sleep, etc.     │
│                                         │
│ Desired Outcome: [Text field]          │
│   e.g., "Feel calm and in control"    │
│                                         │
│ Key Benefits: [Text area]              │
│   e.g., "Better sleep, reduced stress" │
│                                         │
│ Additional Notes: [Text area]          │
│   e.g., "Client loves nature metaphors"│
│                                         │
│ ⚠️ Important: Do not include client    │
│    names or private information        │
└─────────────────────────────────────────┘
```

---

#### Mode B: Remix Existing Script

**Upload Section:**
```
┌─────────────────────────────────────────┐
│ YOUR EXISTING SCRIPT                    │
├─────────────────────────────────────────┤
│ [Large text area for pasting script]   │
│                                         │
│ Paste your hypnosis script here...     │
│ (500-2000 words recommended)           │
│                                         │
│ [Analyze Script Button]                │
│                                         │
│ After analysis, we'll show you the     │
│ current dimensional emphasis of your   │
│ script, then you can adjust the sliders│
│ to shift the style and approach.       │
└─────────────────────────────────────────┘
```

**After Analysis Shows:**
```
┌─────────────────────────────────────────┐
│ CURRENT SCRIPT ANALYSIS                 │
├─────────────────────────────────────────┤
│ Your script currently emphasizes:       │
│                                         │
│ Language         ████████░░ 80%        │
│ Psychological    ██████░░░░ 60%        │
│ Somatic          ███░░░░░░░ 30%        │
│ Symbolic         ██░░░░░░░░ 20%        │
│                                         │
│ Detected Style: Direct/Authoritarian    │
│ Detected Archetype: Problem-solving     │
│                                         │
│ ✨ Now adjust the sliders below to     │
│    change your script's emphasis        │
└─────────────────────────────────────────┘
```

---

#### Common to Both Modes:

**PII Warning:**
- Client-side JavaScript checks for common PII patterns (names in title case, phone numbers, emails, addresses)
- Shows warning overlay if detected: "Possible private information detected. Please remove client names and identifying details before continuing."
- Doesn't submit if PII detected

**Dimension Mixer Section:**
```
┌─────────────────────────────────────────┐
│ 8D DIMENSION MIXER                      │
├─────────────────────────────────────────┤
│ [Dynamically loaded from database]     │
│                                         │
│ Somatic          ████████░░ 80%        │
│ Language         ██████░░░░ 60%        │
│ Symbolic         ██████████ 100%       │
│ Psychological    █████░░░░░ 50%        │
│                                         │
│ [Future dimensions appear here when    │
│  enabled in admin panel]               │
└─────────────────────────────────────────┘
```

**Style & Archetype Section:**
```
┌─────────────────────────────────────────┐
│ STYLE & APPROACH                        │
├─────────────────────────────────────────┤
│ Style (checkboxes - can select multiple):│
│ ☐ Direct/Authoritarian                 │
│ ☐ Permissive/Ericksonian               │
│ ☐ Conversational/Informal              │
│                                         │
│ Archetype:                              │
│ [Hero's Journey        ▼]              │
│                                         │
│ OR Custom Archetype:                    │
│ [_____________________________]        │
└─────────────────────────────────────────┘
```

**Action Buttons:**

*Create New Mode:*
```
[🎵 Generate Preview]  [↻ Reset All]  [💾 Save Mix]
```

*Remix Mode:*
```
[🎵 Remix Preview]  [↻ Revert to Original]  [💾 Save Mix]
```

### 3. Preview Display

**Create New Mode:**
After clicking "Generate Preview":
- Show loading animation (like "mixing" in a DAW)
- Display 150-200 word preview of the script
- Show which dimensions are active and their levels
- Display estimated token cost (for transparency)

```
┌─────────────────────────────────────────┐
│ PREVIEW (150 words)                     │
├─────────────────────────────────────────┤
│ [Script preview text here...]          │
│                                         │
│ Active Dimensions:                      │
│ • Somatic (80%) - Body-centered        │
│ • Symbolic (100%) - Rich metaphors    │
│                                         │
│ [❤️ Love it! Generate Full Script - $3]│
│ [🔄 Not quite right? Remix It]         │
└─────────────────────────────────────────┘
```

**Remix Mode:**
After clicking "Remix Preview":
- Show loading: "Remixing your script..."
- Display 150-200 word preview showing the CHANGES
- Highlight what shifted dimensionally

```
┌─────────────────────────────────────────┐
│ REMIXED PREVIEW (150 words)             │
├─────────────────────────────────────────┤
│ [Modified script preview...]           │
│                                         │
│ What Changed:                           │
│ • Symbolic ↑ from 20% to 90%           │
│   Added nature metaphors throughout    │
│ • Language ↓ from 80% to 50%           │
│   Softened direct commands             │
│                                         │
│ [❤️ Perfect! Get Full Remix - $3]      │
│ [🔄 Keep Remixing]                      │
│ [↩️ Back to Original]                   │
└─────────────────────────────────────────┘
```

### 4. Purchase Flow
When user clicks "Generate Full Script":
1. Redirect to Stripe Checkout
2. Price pulled from database (pricing table)
3. After successful payment → return to results page
4. Generate full script (800-1500 words)
5. Generate marketing assets automatically (included)

### 5. Results Page
Display:
- **Full Script** (with copy button)
- **Marketing Assets** (all auto-generated, included in $3):
  - Social media post (Instagram/Facebook - 150 chars)
  - Email subject + preview (50 chars)
  - Booking page description (100 words)
  - YouTube/Podcast description (200 words)
  - Client handout summary (150 words)
  - Follow-up session angle (2-3 sentences)
- **Download Options:**
  - Download as PDF
  - Download as Word Doc
  - Copy all text
- **Share/Save:**
  - Email to myself
  - Save mix settings (for future use)

## Admin Panel (/admin)

**Protected by simple auth** (admin_users table)

### Dimensions Management
- List all dimensions
- Add/Edit/Delete dimensions
- Enable/Disable dimensions (makes them appear in UI)
- Set default values and ranges
- Reorder dimensions (sort_order)

### Archetypes Management
- List all archetypes
- Add/Edit/Delete archetypes
- Enable/Disable
- Edit prompt modifiers (how they affect generation)

### Styles Management
- List all styles
- Add/Edit/Delete styles
- Enable/Disable

### Pricing Management
- View/Edit current pricing
- Price history (show when prices changed)
- Enable/Disable pricing tiers

### Analytics Dashboard
- Total generations (split by free vs paid, create_new vs remix)
- Revenue (sum of price_paid_cents)
- **Free tier metrics:**
  - Free scripts generated this week/month
  - Free → Paid conversion rate
  - Average time from free script to first purchase
  - Blocked attempts (users trying to get 2nd free script)
- Most popular dimensions (from generations.dimensions_json)
- Most popular archetypes
- Average dimension settings (compare free defaults vs paid customization)
- Conversion rate (previews → purchases)
- **Remix analytics:**
  - What dimensions do people increase most when remixing?
  - What dimensions do people decrease?
  - Average shift amount per dimension

## AI Integration

### Claude API Prompts

#### 1. Script Analysis (Remix Mode Only)
**When user pastes existing script and clicks "Analyze Script":**

```
You are an expert hypnosis script analyst using the 8-Dimensional Framework.

Analyze this hypnosis script and determine the emphasis level (0-100%) for each dimension:

Dimensions to analyze:
- Somatic (body awareness, physical sensations, embodied experience)
- Language (hypnotic patterns, linguistic precision, embedded commands)
- Symbolic (metaphors, imagery, archetypal themes)
- Psychological (inner architecture, cognitive patterns, beliefs, parts work)
- Temporal (time-based work, regression, progression, time perception)
- Perspective (point of view shifts, observer mode, future self)
- Relational (connection, dialogue, self-relationship, interpersonal dynamics)
- Spiritual (transpersonal connection, meaning, purpose, higher self)

Script to analyze:
"""
{user_pasted_script}
"""

Return a JSON object with:
{
  "dimensions": {
    "somatic": 0-100,
    "language": 0-100,
    ...
  },
  "detected_style": "Direct/Authoritarian" | "Permissive/Ericksonian" | "Conversational",
  "detected_archetype": "brief description",
  "summary": "2-3 sentence summary of current emphasis"
}
```

#### 2. Preview Generation (Create New Mode)

**For Preview Generation (150-200 words):**
```
You are an expert hypnosis script writer using the 8-Dimensional Framework.

Client Context:
- Presenting Issue: {presenting_issue}
- Desired Outcome: {desired_outcome}
- Benefits: {benefits}
- Notes: {custom_notes}

Dimension Settings (emphasize higher values):
{dimension_name}: {value}%
...

Style: {selected_styles}
Archetype: {archetype_name}

Generate a 150-200 word preview of a hypnosis script that emphasizes the dimensions with higher values. Make it compelling and professional. This is just a preview to show the style and approach.
```

#### 3. Remix Preview Generation (Remix Mode)

**For remixing existing scripts:**
```
You are an expert hypnosis script remixer using the 8-Dimensional Framework.

Original Script Analysis:
{original_dimension_levels}

Target Dimension Settings:
{new_dimension_levels}

Original Script:
"""
{original_script}
"""

Generate a 150-200 word preview showing how this script would be remixed with the new dimensional emphasis. Preserve the core therapeutic intent and structure, but shift the language and approach to match the new dimension settings.

Focus on what CHANGED from the original.
```

#### 4. Full Script Generation (Create New Mode - 800-1500 words)

**For Full Script Generation (800-1500 words):**
```
You are an expert hypnosis script writer using the 8-Dimensional Framework.

[Same context as preview, but...]

Generate a complete, professional hypnosis script (800-1500 words) that:
1. Has a clear induction phase
2. Develops the main therapeutic content
3. Includes appropriate deepeners
4. Has a proper emergence/awakening
5. Emphasizes dimensions with higher percentages
6. Uses the {archetype} throughout
7. Maintains a {style} approach

Format with clear sections and stage directions.
```

#### 5. Full Remix Generation (Remix Mode - 800-1500 words)

**For full script remix:**
```
You are an expert hypnosis script remixer using the 8-Dimensional Framework.

Original Script:
"""
{original_script}
"""

Original Dimensional Analysis:
{original_dimensions}

Target Dimensional Settings:
{new_dimensions}

Remix this script to match the new dimensional emphasis while:
1. Preserving the core therapeutic intent
2. Maintaining the original structure (induction → content → emergence)
3. Keeping key therapeutic metaphors that work
4. Shifting language, pacing, and approach to match new dimensions
5. Creating a fresh experience that still honors the original

Generate the complete remixed script (800-1500 words).
```

#### 6. Marketing Assets Generation

**For Marketing Assets:**
After generating the full script (either new or remixed), make 6 separate API calls (or one structured call) to generate:

1. **Social Media Post:** "Create a 150-character Instagram/Facebook post promoting this hypnosis session. Make it engaging and benefit-focused."

2. **Email Subject + Preview:** "Create an email subject line (50 chars) and preview text (100 chars) for promoting this session."

3. **Booking Page Description:** "Create a 100-word description for a booking/scheduling page that explains what this hypnosis session addresses."

4. **YouTube/Podcast Description:** "Create a 200-word description for a YouTube video or podcast episode featuring this hypnosis session."

5. **Client Handout:** "Create a 150-word 'what to expect' handout for clients before this session."

6. **Follow-up Angle:** "Suggest 2-3 sentences for how to frame a follow-up session that builds on this work."

## Key Technical Requirements

### Free Tier Rate Limiting

**Business Logic:**
1. User enters email + presenting issue + desired outcome
2. Check `free_script_usage` table:
   - If email exists AND `last_free_script_at` < 7 days ago → **DENY**
     - Show: "You've already used your free script this week. Next one available in X days."
     - Offer: "Want it now? Unlock full customization for $3"
   - If email doesn't exist OR `last_free_script_at` >= 7 days ago → **ALLOW**
3. Generate script with default settings:
   - All dimensions: 50%
   - Style: Permissive/Ericksonian
   - Archetype: Hero's Journey
   - Length: 800-1000 words
   - NO marketing assets
4. Insert/update `free_script_usage` table
5. Save to `generations` table with `is_free = true`
6. Email script to user (backup delivery)
7. Show upgrade prompt below script

**Important:** Free scripts should still be GOOD quality - just not customizable. This shows the value.

### Modular Design Patterns

**Dimension Slider Component:**
```typescript
interface Dimension {
  id: number;
  name: string;
  description: string;
  defaultValue: number;
  minValue: number;
  maxValue: number;
  enabled: boolean;
}

// Component reads from database, not hardcoded
const DimensionMixer = ({ dimensions }: { dimensions: Dimension[] }) => {
  // Render sliders dynamically
}
```

**All configuration is loaded from database on page load** - no hardcoded values in components.

### Caching Strategy
- Cache dimension/archetype/style/pricing data for 5 minutes (reduce DB queries)
- Cache Claude API preview responses for 10 minutes (if exact same inputs)
- Store generation history for analytics
- **Remix mode:** Keep original script + analysis in session state for "Revert to Original" button

### State Management for Remix Mode
When user analyzes a script:
1. Store original script text in session/state
2. Store analyzed dimension levels
3. Allow slider adjustments
4. "Revert to Original" button resets sliders to analyzed levels
5. Preview shows comparison (what changed)
6. Full generation preserves original script reference for user

### Error Handling
- Graceful API failures (Claude API, Stripe)
- Clear user feedback on errors
- Retry logic for transient failures
- Admin notifications on repeated failures

### Security
- Admin panel requires authentication
- Rate limiting on preview generation (max 10 per IP per hour)
- Validate all user inputs server-side
- Sanitize text before storing in database
- Secure Stripe webhook handling

## Deployment Considerations

### Environment Variables Needed
```
DATABASE_URL=postgresql://...
CLAUDE_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_SERVICE_API_KEY=... (Resend, SendGrid, or similar)
EMAIL_FROM_ADDRESS=scripts@hypnobrain.ai
NEXT_PUBLIC_APP_URL=https://...
ADMIN_PASSWORD_HASH=...
FREE_SCRIPT_COOLDOWN_DAYS=7
```

### Email Service Integration
**Use Resend or SendGrid for email delivery:**

1. **Free Script Delivery Email:**
   - Subject: "Your Free HypnoBrain Script is Ready!"
   - Body: Include full script + upgrade CTA
   - Track opens/clicks

2. **Weekly Reminder (Optional):**
   - "Your free script has reset! Create another one this week"
   - Only send to users who used their free script last week

3. **Upgrade Nudge (Optional):**
   - Day 3 after free script: "Want to customize that script?"
   - Show what they missed

### Stripe Setup
- Create product: "HypnoBrain Script Generation"
- Create price: $3.00 (one-time payment)
- Set up webhook for payment confirmation
- Handle success/failure redirects

## UI/UX Notes

### Design Aesthetic
- **DAW-inspired** - Think Ableton, Logic Pro color schemes
- Dark mode by default (easier on eyes, "studio" vibe)
- Smooth animations on sliders
- Visual feedback when "mixing"
- Professional but creative feel

### Loading States
- "Mixing your script..." (with animation)
- Progress indicators for generation
- Skeleton loaders for database-driven content

### Mobile Responsive
- Sliders should work on touch devices
- Collapsible sections on mobile
- Simplified layout for small screens

## Success Metrics to Track

### Conversion Funnel
1. **Landing page visits**
2. **Free script starts** (email entered)
3. **Free scripts completed** 
4. **Free → Paid conversions** (within 24hrs, 7 days, 30 days)
5. **Paid previews generated**
6. **Paid purchases completed**

### Key Metrics
1. **Free Tier Performance:**
   - Free scripts per week
   - Free → Paid conversion rate
   - Email capture rate
   - Blocked repeat attempts (good indicator of desire)
   - Average days until first purchase
2. **Paid Tier Performance:**
   - Conversion Rate: Previews → Purchases (by mode)
   - Mode Preference: Create New vs Remix usage split
3. **Product Usage:**
   - Average Dimension Settings: What do people actually use?
   - Popular Archetypes: Which ones convert best?
   - Time to First Preview: How long does it take users to engage?
   - Asset Usage: Which marketing assets get downloaded most?
4. **Remix Behavior:**
   - Average number of remixes before purchase
   - Most commonly adjusted dimensions
   - Direction of changes (increase/decrease)
5. **Revenue:** 
   - Daily/weekly/monthly (by mode)
   - Average revenue per user
   - Lifetime value from free converts

## Future Considerations (Not v1)

- User accounts (save favorite mixes)
- Collaboration (share mixes with colleagues)
- Credit system (buy credits in bulk)
- Subscription tier (unlimited mixing)
- More asset types
- Custom dimension creation
- Template library
- Export to Google Docs
- Integration with booking systems

---

## Build Instructions for Replit Agent

Please build this application following these specifications:

1. Start with Next.js TypeScript template
2. Set up PostgreSQL database with provided schema
3. Seed initial data (4 enabled dimensions, archetypes, styles, pricing)
4. **Build TWO-MODE interface:**
   - **Create New Script mode** (generate from scratch)
   - **Remix Existing Script mode** (analyze + modify existing scripts)
5. Build dimension mixer with dynamic rendering from database
6. Integrate Claude API for:
   - Script analysis (remix mode)
   - Preview generation (both modes)
   - Full script generation (both modes)
   - Marketing assets (both modes)
7. Set up Stripe checkout flow
8. Build results page with marketing assets + download options
9. Create admin panel with CRUD for all configuration tables
10. Add analytics to admin dashboard (including remix-specific metrics)
11. Implement PII detection on client side
12. Add proper error handling and loading states
13. Implement state management for "Revert to Original" in remix mode
14. Make it responsive and visually appealing (DAW aesthetic)

**Key Priority:** Database-driven, modular architecture that's easy to extend. The two-mode system (Create New vs Remix) is a core v1 feature.