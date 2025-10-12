# HypnoBrain Script Shaper

## Project Overview
A DAW-style web application for hypnotherapists to generate customized hypnosis scripts using Erika Flint's 8-Dimensional Hypnosis Framework.

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

## Recent Changes (2025-10-12)

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
