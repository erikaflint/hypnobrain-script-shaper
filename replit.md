# HypnoBrain Script Shaper v2.0

## Overview
HypnoBrain Script Shaper is a DAW-style web application designed for hypnotherapists. Its primary purpose is to generate customized hypnosis scripts based on Erika Flint's 8-Dimensional Hypnosis Framework. The project aims to provide a robust, methodology-driven platform for script creation, leveraging AI while ensuring adherence to established hypnotherapy principles. This application targets professional hypnotherapists seeking to streamline script generation with a focus on customizable, high-quality content.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder Z.
Do not make changes to the file Y.

## System Architecture

### Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect) with Google, GitHub, email/password support
- **AI**: Anthropic Claude Sonnet 4
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query (React Query v5)

### Core Architecture - v2.0 (JSON Template Architecture)
The system employs a "separation of concerns" approach:
1.  **Templates (JSON)**: Dimension mixes are stored as data within PostgreSQL JSONB.
2.  **ScriptEngine**: Acts as the core IP layer, orchestrating Erika Flint's methodology through a config-driven system.
3.  **AI Service**: The execution engine that receives comprehensive directives from the ScriptEngine for script generation.

**Data Flow:** Client Intake → TemplateSelector → DimensionAssembler → ScriptEngine → AI Service

### ScriptEngine: The IP Core
The ScriptEngine (`server/script-engine/`) is the portable IP layer responsible for transforming template-based generation into methodology-driven transformation.

**Components:**
-   **Config System**: Contains `principles.json` (6 core principles), `narrative-arcs.json` (14 narrative arcs), and `metaphor-library.json`.
-   **StrategyPlanner**: Detects presenting issues, selects narrative arcs, and chooses primary metaphors.
-   **PrincipleEnforcer**: Translates the 6 core principles into AI prompt directives, adapting to client levels and building language hierarchies.
-   **Main Orchestrator**: Combines StrategyPlanner and PrincipleEnforcer to generate comprehensive AI directives and reasoning logs.

**6 Core Principles:** Somatic Anchoring Early, Metaphor Consistency, Adaptive Language Complexity, Permissive-to-Directive Gradient, Safety Language Always, Ego Strengthening Closure.

**14 Narrative Arcs:** Effortlessness of Change, Re-Minding (Not Learning), Two Tempos of Change, Recognition & Ego Strengthening, Relief to New Life, Emotional-Physical Chain, Brain as Master Skill, Mind-Body Unity, Parts Integration, Future Self Connection, Inner Wisdom Access, Sensory Amplification, Resource Activation, **Playful Learning** (new - learning through play, curiosity, and exploration).

### Feature Specifications
-   **8-Dimensional Framework**: Implements Erika Flint's 8D Hypnosis Framework (Somatic, Temporal, Symbolic, Psychological, Perspective, Spiritual, Relational, Language) as independent emphasis levels (0-100%).
-   **AI Script Generation**: 
    -   150-200 word preview, 1500-2000 word full hypnosis script, 6 marketing assets per script
    -   **Auto-Generated Titles**: AI creates memorable, unique titles from presenting issue and desired outcome
        - Format varies by template category: "Issue Relief" (beginner), "Issue Transformation" (specialized), "Issue to Outcome" (therapeutic/advanced)
        - Examples: "Anxiety Relief", "Chronic Pain Transformation", "Weight Loss to Feel energized"
    -   Remix Analysis for detecting dimensional emphasis in existing scripts
-   **Three-Tier Pricing Model**:
    -   **Free Tier**: Weekly script (email-gated, 7-day rate limiting) with balanced dimension values, default archetype, default style, and no marketing assets.
    -   **Create New Mode ($3)**: Full customization with 8-dimensional sliders, 6 archetype options, 3 style approaches, 6 marketing assets, PDF/Word download, and unlimited previews.
    -   **Remix Mode ($3)**: AI dimension analysis of existing scripts, adjustable dimensional emphasis, before/after comparison, 6 marketing assets, PDF/Word download.
-   **Rate Limiting (Free Tier)**: Email-based tracking with a 7-day cooldown period using upsert logic.
-   **Dice Mix Helper (New)**: Randomly pre-fills presenting issue + contextually matched desired outcome for quick inspiration. 10 issue types, 4 curated outcomes each (40 total suggestions).
-   **Type-Ahead Autocomplete (New)**:
    -   **Presenting Issue**: Fully editable text input with 10 common issue suggestions (not forced selection - users can type anything)
    -   **Desired Outcome**: Context-aware suggestions based on presenting issue + free-text input for custom outcomes
    -   Both fields allow free typing while offering helpful suggestions
    -   Helps hypnotherapists explore different script framing options
-   **Version Control & Favorites**: 
    -   Star scripts as favorites (appears in dedicated "Favorites" section in dashboard)
    -   Parent-child tracking for script remixes with version labels (v2, v3, etc.)
    -   `/api/generations/:id/favorite` (PATCH) and `/api/generations/:id/remix` (POST) endpoints
-   **Save/Apply Mix (Custom Templates)**:
    -   Users can save their current dimension configuration as a custom template for later reuse
    -   Backend: POST `/api/templates` (protected) saves user templates with name and dimension values
    -   Backend: GET `/api/user/templates` (protected) retrieves user's saved dimension mixes
    -   Templates stored in `templates` table with userId linkage
    -   Frontend UI: "Save Mix" button with dialog to name template, "Apply Saved Mix" button showing count and list of saved templates
    -   Clicking a saved template instantly applies its dimension values to sliders

### UI/UX Decisions
-   **Design System**: Purple accent colors (hsl(260 70% 62%)), dark mode optimized, DAW-inspired interface.
-   **Fonts**: Inter (body), DM Sans (display), JetBrains Mono (code).
-   **Components**: shadcn/ui with custom dimension sliders and archetype cards.
-   **Page Routes**:
    -   `/` - Landing page
    -   `/free` - Free tier script generation
    -   `/app-v2` - **Current production version** with template recommendations and full features
    -   `/dashboard` - Admin dashboard for viewing/managing generated scripts
    -   `/admin` - Admin panel
    -   Note: `/app` is deprecated (old v1 architecture)

###  Authentication System
-   **Provider**: Replit Auth (OpenID Connect)
-   **Login Methods**: Google, GitHub, X (Twitter), Apple, Email/Password
-   **Session Management**: PostgreSQL-backed sessions (`sessions` table) with 7-day TTL
-   **User Storage**: `users` table with UUID primary keys, stores email, first/last name, profile image
-   **Protected Routes**: Script generation and dashboard require authentication
-   **Client Integration**: `useAuth()` hook provides authentication state, automatic redirect to login when unauthorized
-   **Middleware**: `isAuthenticated` middleware protects API routes, handles token refresh automatically

### Database Schema Highlights
-   **Core Tables**: `users`, `sessions`, `dimensions`, `archetypes`, `styles`, `pricing`, `generations`, `free_script_usage`, `admin_users`.
-   **User Ownership**: `generations.userId` links scripts to authenticated users
-   **Naming Convention**: `snake_case` in database, `camelCase` in Drizzle ORM TypeScript schema.

## External Dependencies
-   **Database**: PostgreSQL (via Neon)
-   **ORM**: Drizzle ORM
-   **AI Service**: Anthropic Claude Sonnet 4
-   **Payment Gateway**: Stripe (currently mocked, `STRIPE_ENABLED=false` feature flag)