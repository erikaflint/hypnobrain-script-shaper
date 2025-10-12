# HypnoBrain Script Shaper v2.0

## Project Overview
A DAW-style web application for hypnotherapists to generate customized hypnosis scripts using Erika Flint's 8-Dimensional Hypnosis Framework.

**v2.0 Architecture**: JSON template-based system with embedded ScriptEngine IP layer that enforces 6 core principles and 13 narrative arcs.

## Architecture Evolution: v1 → v2

### v1.0 (Original)
- Database-driven dimension/archetype/style system
- Direct AI generation from dimension values
- IP methodology "baked into" AI prompts (not portable)

### v2.0 (Current - JSON Template Architecture)
**Separation of Concerns:**
1. **Templates (JSON)**: Dimension mixes stored as data (PostgreSQL JSONB)
2. **ScriptEngine**: Erika's IP methodology as config-driven orchestration layer
3. **AI Service**: Execution engine (receives comprehensive directives from ScriptEngine)

**New Data Flow:**
```
Client Intake → TemplateSelector → DimensionAssembler → ScriptEngine → AI Service
                                                          ↑
                                                    (The IP Layer)
```

### ScriptEngine: The IP Core
Located in `server/script-engine/`, this is the **portable IP** that transforms template-based generation into methodology-driven transformation.

**Components:**
1. **Config System** (`config/`):
   - `principles.json` - 6 core principles with prompt directives, quality gates, examples
   - `narrative-arcs.json` - 13 narrative arcs (7 currently implemented)
   - `metaphor-library.json` - Metaphor families mapped to presenting issues

2. **StrategyPlanner** (`strategy-planner.ts`):
   - Detects presenting issues from keywords (anxiety, confidence, stuck, habits, trauma, etc.)
   - Selects narrative arcs with priority: always_include > issue_specific > template_preferred
   - Chooses primary metaphor based on issue + symbolic dimension level
   - Returns `GenerationContract` with selected arcs, metaphor, reasoning log

3. **PrincipleEnforcer** (`principle-enforcer.ts`):
   - Translates 6 principles into AI prompt directives
   - Adapts to client level (beginner/intermediate/advanced)
   - Builds language hierarchy (permissive vs directive ratios)
   - Generates quality reminders for validation

4. **Main Orchestrator** (`index.ts`):
   - `ScriptEngine.generate()` combines StrategyPlanner + PrincipleEnforcer
   - Returns comprehensive directives for AI: enhanced system prompts, structured instructions
   - Complete reasoning logs for transparency

**6 Core Principles:**
1. Somatic Anchoring Early
2. Metaphor Consistency  
3. Adaptive Language Complexity
4. Permissive-to-Directive Gradient
5. Safety Language Always
6. Ego Strengthening Closure

**13 Narrative Arcs** (7 implemented):
- ✅ Effortlessness of Change
- ✅ Re-Minding (Not Learning)
- ✅ Two Tempos of Change
- ✅ Recognition & Ego Strengthening
- ✅ Relief to New Life
- ✅ Emotional-Physical Chain
- ✅ Brain as Master Skill
- ⏳ 6 more to backfill

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **AI**: Anthropic Claude Sonnet 4
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query (React Query v5)

### Three-Tier Pricing Model
1. **Free Tier**: Weekly script (email-gated, 7-day rate limiting)
   - Balanced dimension values (50%)
   - Default archetype (The Healer)
   - Default style (Conversational)
   - No marketing assets

2. **Create New Mode ($3)**: Full customization
   - 8-dimensional sliders (4 enabled: Direct/Authoritarian, Analytical/Rational, Paternal/Parental, Inward/Introspective)
   - 6 archetype options
   - 3 style approaches
   - 6 marketing assets
   - PDF/Word download
   - Unlimited previews

3. **Remix Mode ($3)**: Transform existing scripts
   - AI dimension analysis
   - Adjust dimensional emphasis
   - Before/after comparison
   - 6 marketing assets
   - PDF/Word download

## Implementation Status

### ✅ Task 1: Schema & Frontend (Completed)
- Database schema with 7 tables (dimensions, archetypes, styles, pricing, generations, free_script_usage, admin_users)
- Design system with purple accent colors (260 70% 62%), dark mode
- Complete component library (Landing, Free tier, Main app with dual modes)
- All interactive elements instrumented with data-testid

### ✅ Task 2: Backend Implementation (Completed)
- Database connection via Drizzle ORM
- DatabaseStorage with all CRUD operations
- AI Service using Anthropic Claude Sonnet 4
- MockPaymentService (STRIPE_ENABLED=false feature flag)
- Complete API routes:
  - GET /api/dimensions, /api/archetypes, /api/styles
  - POST /api/check-free-eligibility (7-day rate limiting)
  - POST /api/generate-preview
  - POST /api/generate-free-script
  - POST /api/create-payment-intent (mock)
  - POST /api/generate-paid-script
  - POST /api/analyze-script
- Database seeded with initial data

### ✅ Task 3: Integration & Testing (Completed)
- ✅ Free tier page connected to backend
- ✅ Main app page connected to backend
- ✅ Dimension sliders loading from database
- ✅ Archetype/style selectors using real data
- ✅ Preview generation integrated
- ✅ Full script generation for paid tier
- ✅ Admin dashboard for viewing all generations

## Key Features

### 8-Dimensional Framework
The application implements Erika Flint's 8D Hypnosis Framework with 8 independent dimensions (NOT opposing pairs):

1. **Somatic** - Body-based: Uses breath, posture, temperature, physical sensations to anchor transformation
2. **Temporal** - Time-based: Leverages fluid experience of time through regression/progression
3. **Symbolic** - Metaphor & Archetype: Uses symbolic language, imagery, and archetypal stories
4. **Psychological** - Inner Architecture: Engages cognitive patterns, beliefs, and mental structures
5. **Perspective** - Point of View: Shifts viewpoint for insight and integration
6. **Spiritual** - Transpersonal: Taps into meaning, purpose, and connection to something greater
7. **Relational** - Connection & Dialogue: Integrates relationships and experiences of belonging
8. **Language** - Linguistic Craft: Employs hypnotic phrasing, pacing, and embedded suggestions

All 8 dimensions are independent emphasis levels (0-100%), not opposing pairs.

### AI Script Generation
- **Preview**: 150-200 word preview showing style and approach
- **Full Script**: 1500-2000 word complete hypnosis script
- **Marketing Assets**: 6 promotional materials (social post, email, video script, ad copy)
- **Remix Analysis**: AI detects dimensional emphasis in existing scripts

### Rate Limiting (Free Tier)
- Email-based tracking in `free_script_usage` table
- 7-day cooldown period
- Upsert logic prevents duplicate email violations
- Clear eligibility messaging with next available date

## Database Schema Highlights

### Core Tables
- `dimensions`: 8D framework configuration (enabled/disabled flags)
- `archetypes`: 6 therapeutic archetypes
- `styles`: 3 hypnotic communication styles
- `pricing`: 3 pricing tiers
- `generations`: Complete generation history
- `free_script_usage`: Rate limiting tracking
- `admin_users`: Admin access (future use)

### Key Field Names
- Use snake_case in database (e.g., `sort_order`, `last_free_script_at`)
- Drizzle schema uses camelCase in TypeScript (e.g., `sortOrder`, `lastFreeScriptAt`)

## Payment Integration
Currently using MockPaymentService with feature flag:
- `STRIPE_ENABLED=false` (default)
- Generations saved with `pending_payment` status
- Payment modal shows "Coming Monday" message
- Ready to swap in real Stripe when keys available

## Design System
- **Colors**: Purple primary (hsl(260 70% 62%))
- **Fonts**: Inter (body), DM Sans (display), JetBrains Mono (code)
- **Theme**: Dark mode optimized, DAW-inspired interface
- **Components**: shadcn/ui with custom dimension sliders, archetype cards

## Running the Project
```bash
npm run dev  # Starts Express backend + Vite frontend on port 5000
npm run db:push  # Push schema changes to database
npx tsx server/seed.ts  # Seed database with initial data
```

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `ANTHROPIC_API_KEY`: Claude AI API key
- `STRIPE_ENABLED`: Feature flag for payment integration (default: false)
- `SESSION_SECRET`: Session encryption key

## Implementation Status

### ✅ Task SE1: ScriptEngine Foundation (Completed)
- **Config System** (`server/script-engine/config/`):
  - principles.json: All 6 core principles with prompt directives, quality gates, examples
  - narrative-arcs.json: 7 of 13 arcs implemented (effortlessness, re-minding, two-tempos, recognition-ego-strengthening, relief-to-new-life, emotional-physical-chain, brain-master-skill)
  - metaphor-library.json: 8 metaphor families mapped to presenting issues
- **StrategyPlanner** (`strategy-planner.ts`): Issue detection, arc selection, metaphor choosing
- **PrincipleEnforcer** (`principle-enforcer.ts`): IP to AI prompt translation
- **Main Orchestrator** (`index.ts`): Complete generation workflow
- **Testing**: Console tests verify end-to-end flow (anxiety → nature_gentle metaphor, confidence → tree metaphor)

### 🔄 Next Tasks
- SE4: Build PromptOrchestrator - 3-stage generation (Outline → Draft → Polish)
- SE5: Build Validator - quality gates & auto-repair
- SE6: Integrate ScriptEngine into AI service
- SE7: Update templates to support preferred arcs
- SE8: Test end-to-end generation with ScriptEngine

## Recent Changes (2025-10-12)

### ✅ MAJOR: ScriptEngine v1.0 Implementation
- **What**: Created portable IP layer that sits between templates and AI generation
- **Architecture**: 
  - StrategyPlanner: Detects issues → selects narrative arcs → chooses metaphors
  - PrincipleEnforcer: Translates 6 principles into AI prompt directives
  - Main Orchestrator: Combines both into comprehensive generation package
- **Test Results**:
  - Anxiety client → nature_gentle metaphor (clouds, breeze, meadow)
  - Confidence client → tree metaphor (roots, strength, grounding)
  - Generated 2,689 char system prompts + 52 structured instructions
- **Files Created**: 
  - `server/script-engine/index.ts`
  - `server/script-engine/strategy-planner.ts`
  - `server/script-engine/principle-enforcer.ts`
  - `server/script-engine/config/principles.json`
  - `server/script-engine/config/narrative-arcs.json`
  - `server/script-engine/config/metaphor-library.json`
- **Why Important**: IP is now versioned, portable, and can be A/B tested without code changes

### CRITICAL FIX #4: Paid Script Generation Not Saving to Database
- **Issue**: User generated scripts twice but /admin showed empty - scripts weren't being saved
- **Root Cause**: Payment modal's "Queue My Generation" button only showed toast, never called backend API
- **Resolution**: 
  - Implemented `generateFullScriptMutation` in app.tsx that properly calls:
    1. `/api/create-payment-intent` (mock payment)
    2. `/api/generate-paid-script` (generates + saves to DB)
  - Added loading state to payment modal (shows "Generating Script..." spinner)
  - Fixed TypeScript errors with proper type annotations
- **Verification**: Manual API tests confirmed 2 scripts saved successfully (~8,500 chars each)
- **Files Changed**: `client/src/pages/app.tsx`, `client/src/components/payment-modal.tsx`

### CRITICAL FIX #1: Corrected 8D Framework Dimensions
- **Issue**: Application was built with incorrect paired dimensions (Direct/Authoritarian vs Indirect/Permissive, etc.)
- **Resolution**: Replaced with actual Erika Flint 8D Framework dimensions:
  - Somatic, Temporal, Symbolic, Psychological, Perspective, Spiritual, Relational, Language
  - All 8 are independent emphasis levels (0-100%), NOT opposing pairs
- **Changes Made**:
  - Updated seed.ts with correct dimension names and descriptions
  - Rewrote AI service (ai-service.ts) to use correct DimensionValues interface
  - Updated all AI prompts to reference proper 8D framework
  - Fixed frontend dimension mapping in app.tsx
  - Updated backend routes validation schemas
  - Cleared database and reseeded with correct dimensions

### CRITICAL FIX #2: Frontend API Request Bug
- **Issue**: apiRequest function had wrong parameter order causing "not a valid HTTP method" errors
- **Root Cause**: Function defined as (method, url, data) but called as (url, options) throughout codebase
- **Resolution**: Changed apiRequest signature to (url, options) to match standard fetch API pattern
- **Additional Fix**: Function now auto-parses JSON responses for cleaner mutation/query code

### CRITICAL FIX #3: AI JSON Parsing Bug  
- **Issue**: Claude sometimes wraps JSON in markdown code blocks (```json\n{...}```) breaking JSON.parse()
- **Error**: "Unexpected token '`'" when parsing AI responses
- **Resolution**: Added cleanJsonResponse() helper to strip markdown before parsing
- **Applied To**: All 3 AI methods (generatePreview, generateFullScript, analyzeScriptDimensions)
  
### Earlier Session Fixes
- Fixed free-tier eligibility check to use correct field names
- Implemented upsert logic for repeat free script usage
- Connected frontend to backend APIs using TanStack Query
- Replaced all mock data with real database queries
- Added loading states and error handling throughout
