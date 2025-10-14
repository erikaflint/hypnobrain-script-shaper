# HypnoBrain Script Shaper v2.0

## Overview
HypnoBrain Script Shaper is a DAW-style web application for hypnotherapists, designed to generate customized hypnosis scripts based on Erika Flint's 8-Dimensional Hypnosis Framework. The project aims to provide a robust, methodology-driven platform for script creation, leveraging AI to streamline the process while adhering to established hypnotherapy principles. It targets professional hypnotherapists seeking high-quality, customizable content. The application also includes a "DREAM Hypnosis Series" for generating non-clinical sleep/meditation scripts, offering immersive journeys without therapeutic goals.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder Z.
Do not make changes to the file Y.

## System Architecture

### Tech Stack
-   **Frontend**: React + TypeScript + Vite
-   **Backend**: Express.js + TypeScript
-   **Database**: PostgreSQL (Neon) + Drizzle ORM
-   **Authentication**: Replit Auth (OpenID Connect)
-   **AI**: Anthropic Claude Sonnet 4, OpenAI DALL-E 3
-   **Object Storage**: Replit App Storage (Google Cloud Storage)
-   **Styling**: Tailwind CSS + shadcn/ui components
-   **State Management**: TanStack Query (React Query v5)

### Core Architecture (JSON Template Architecture)
The system separates concerns: Templates (JSON) for dimension mixes in PostgreSQL JSONB, a ScriptEngine as the core IP layer orchestrating Erika Flint's methodology, and an AI Service executing script generation directives. The data flow is: Client Intake → TemplateSelector → DimensionAssembler → ScriptEngine → AI Service.

The ScriptEngine (`server/script-engine/`) is the IP layer transforming template-based generation into methodology-driven transformation. It includes a Config System (principles, narrative arcs, metaphor library), a StrategyPlanner, a PrincipleEnforcer, and a Main Orchestrator to generate AI directives. Key elements include 6 Core Principles and 14 Narrative Arcs (including a new "Playful Learning" arc).

### 4-Stage DREAM Quality Pipeline
To prevent quality degradation and ensure consistency, DREAM scripts pass through a 4-stage pipeline where each AI call has ONE focused responsibility:

1. **Story Shaper (Stage 1)**: Expands journey idea into detailed 800-1200 word story outline with rich sensory details. Saved to database for transparency.
2. **Dream Maker (Stage 2)**: Generates full 3000-word hypnosis script from story outline using ScriptEngine methodology.
3. **Pattern Refiner (Stage 3)**: Analyzes script for repetitive sentence patterns (e.g., "you might...", "as you...") and rewrites overused openers for variety. Preserves ALL content and context.
4. **Quality Guard (Stage 4)**: Validates emergence type matches (sleep vs regular), checks for 15+ functional suggestions, verifies word count within 15% of target, ensures metaphor consistency. Applies micro-polish to fix issues.

**Key Innovation**: Separation of concerns prevents the "50% degradation problem" where AI trying to do everything (plan + write + variety + quality) resulted in generic content. Each stage focuses on ONE job, with explicit "PRESERVE ALL details" instructions to maintain historical/contextual integrity.

### Feature Specifications
-   **8-Dimensional Framework**: Implements Erika Flint's 8D Hypnosis Framework with independent emphasis levels (0-100%).
-   **AI Script Generation**: Generates script previews (150-200 words), full scripts (1500-2000 words, 3000 for DREAM), and 6 marketing assets. Includes AI-generated titles and supports "regular" or "sleep" emergence types.
-   **Three-Tier Pricing Model**: Free (weekly script), Create New ($3 for full customization), Remix Mode ($3 for AI analysis and adjustment of existing scripts).
-   **Rate Limiting**: Email-based 7-day cooldown for the Free Tier.
-   **Dice Mix Helper**: Randomly pre-fills presenting issue and desired outcome for inspiration.
-   **Type-Ahead Autocomplete**: Suggestions for "Presenting Issue" and context-aware "Desired Outcome" while allowing free-text input.
-   **Version Control & Favorites**: Star scripts, parent-child tracking for remixes, and API endpoints for managing them.
-   **Save/Apply Mix (Custom Templates)**: Users can save and apply custom dimension configurations.
-   **Script Package Generator**: Allows creating sellable collections of themed scripts, with AI generating concepts, and user modification and generation.
-   **Full CRUD Operations**: Complete Create, Read, Update, Delete functionality for all scripts with ownership verification. Edit modal for script text, delete with confirmation dialog, hover-to-reveal UI controls.
-   **DREAM Hypnosis Series**: Generates non-clinical, 30-minute immersive sleep/meditation scripts (3000 words). Features journey-based input, sleep emergence, high somatic/symbolic emphasis, full-screen crowdsourced loading carousel, and AI-generated serene thumbnails (DALL-E 3) with permanent storage. Includes 13 DREAM-specific Narrative Arcs and 8 Blended Archetypes. Also offers voice controls for playback. **4-Stage Quality Pipeline**: Story Shaper (800-1200 word outline) → Dream Maker (script generation) → Pattern Refiner (fix repetitive patterns) → Quality Guard (validate emergence, suggestions, word count, metaphors). **Story Outline Preservation**: The story outline from Stage 1 is saved in the database and displayed in the UI for full creative journey transparency.
-   **Permanent Thumbnail Storage**: DALL-E generated images are immediately downloaded and stored permanently in Replit App Storage (expires in 1 hour if not saved). Thumbnails are served via `/public-objects/dream-thumbnails/{uuid}.png` with 1-year cache headers.
-   **Crowdsourced Loading Carousel**: Full-screen immersive loading experience displays up to 50 recent DREAM thumbnails from ALL users (not just current user) to create a community-driven calming experience. Falls back to curated Unsplash landscapes for first-time users.
-   **External API (B2B)**: RESTful endpoints for third-party integrations. API key authentication with scopes, SHA-256 hashed keys, usage tracking. `/api/analyze/clinical` and `/api/analyze/dream` endpoints analyze scripts using AI to extract 8D dimensions, narrative patterns, quality metrics, and improvement recommendations.

### UI/UX Decisions
-   **Design System**: Purple accent colors, dark mode, DAW-inspired interface, Inter, DM Sans, and JetBrains Mono fonts. Uses shadcn/ui components.
-   **Page Routes**: `/` (Landing), `/free`, `/app-v2` (Current production), `/dream`, `/dashboard`, `/admin`.
-   **DREAM Library Layout**: Horizontal split-screen design - 320px scrollable left sidebar displays condensed dream grid, flex-1 right panel shows large 21:9 hero image with full script content. Both sections scroll independently with `calc(100vh - 4rem)` height. Fullscreen mode available for immersive viewing.

### Authentication System
-   **Provider**: Replit Auth (OpenID Connect) supporting Google, GitHub, X, Apple, and Email/Password.
-   **Session Management**: PostgreSQL-backed sessions with 7-day TTL.
-   **User Storage**: `users` table for user information.
-   **Protected Routes**: Script generation and dashboard require authentication.
-   **Client Integration**: `useAuth()` hook for authentication state and automatic redirects.
-   **Middleware**: `isAuthenticated` middleware for API route protection and token refresh.

### Database Schema Highlights
-   **Core Tables**: `users`, `sessions`, `dimensions`, `archetypes`, `styles`, `pricing`, `generations`, `free_script_usage`, `admin_users`, `api_keys`.
-   **User Ownership**: `generations.userId` links scripts to users.
-   **API Keys**: SHA-256 hashed keys with scopes, active/inactive status, usage tracking.
-   **Naming Convention**: `snake_case` in database, `camelCase` in Drizzle ORM.

## External Dependencies
-   **Database**: PostgreSQL (via Neon)
-   **ORM**: Drizzle ORM
-   **AI Service**: Anthropic Claude Sonnet 4
-   **Payment Gateway**: Stripe (currently mocked)