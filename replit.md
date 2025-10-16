# HypnoBrain Script Shaper v2.0

## Overview
HypnoBrain Script Shaper is a DAW-style web application for hypnotherapists, designed to generate customized hypnosis scripts based on Erika Flint's 8-Dimensional Hypnosis Framework. It aims to provide a robust, methodology-driven platform for script creation, leveraging AI to streamline the process while adhering to established hypnotherapy principles. The project is evolving into a "Positive Language Generator" that produces hypnotic scripts using experiential, scene-setting language for deeper trance states. The application also includes a "DREAM Hypnosis Series" for generating non-clinical sleep/meditation scripts.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder Z.
Do not make changes to the file Y.

## System Architecture

### UI/UX Decisions
The application features a DAW-inspired interface with a dark mode, purple accent colors, and uses Inter, DM Sans, and JetBrains Mono fonts along with shadcn/ui components. Key routes include `/`, `/free`, `/app-v2`, `/dream`, `/dashboard`, and `/admin`. The DREAM Library uses a horizontal split-screen design with an independently scrolling sidebar and main content area, offering a fullscreen mode.

### Technical Implementations
-   **Frontend**: React, TypeScript, Vite
-   **Backend**: Express.js, TypeScript
-   **Database**: PostgreSQL (Neon) with Drizzle ORM
-   **Authentication**: Replit Auth (OpenID Connect) for Google, GitHub, X, Apple, and Email/Password, with PostgreSQL-backed sessions.
-   **State Management**: TanStack Query (React Query v5)
-   **Styling**: Tailwind CSS
-   **Object Storage**: Replit App Storage (Google Cloud Storage) for permanent thumbnail storage.

### Feature Specifications
The system implements Erika Flint's 8-Dimensional Hypnosis Framework, allowing independent emphasis levels. It supports AI-generated script previews, full scripts (1500-2000 words; 3000 for DREAM), and 6 marketing assets, including AI-generated titles and support for "regular" or "sleep" emergence types. Features include a three-tier pricing model (Free, Create New, Remix), email-based rate limiting, a Dice Mix Helper for inspiration, type-ahead autocomplete, script version control and favorites, and the ability to save/apply custom dimension mixes. It provides full CRUD operations for scripts with ownership verification.

The **DREAM Hypnosis Series** generates non-clinical, 30-minute immersive scripts with a focus on journey-based input, sleep emergence, high somatic/symbolic emphasis, and AI-generated serene thumbnails. It utilizes a **4-Stage Quality Pipeline**:
1.  **Story Shaper**: Expands ideas into detailed story outlines (800-1200 words).
2.  **Dream Maker**: Generates full 3000-word scripts from outlines.
3.  **Pattern Refiner**: Rewrites repetitive sentence patterns.
4.  **Quality Guard**: Validates script quality against criteria like emergence type, suggestions, word count, and metaphor usage, strictly limiting metaphors to 5-7 uses. It also enforces the use of personal pronouns ("you" and "your") as critical hypnotic language.
A crowdsourced loading carousel displays recent DREAM thumbnails for an immersive experience.

An **External API (B2B)** offers RESTful endpoints (`/api/generate/clinical`, `/api/generate/dream`) for third-party integrations, secured by API key authentication with scopes and usage tracking.

### System Design Choices
The core architecture uses JSON Templates in PostgreSQL JSONB for dimension mixes. The **ScriptEngine** (`server/script-engine/`) is the IP layer, orchestrating Erika Flint's methodology, transforming template-based generation into methodology-driven transformation. It includes a Config System, StrategyPlanner, PrincipleEnforcer, and Main Orchestrator to generate AI directives based on 6 Core Principles and 30 Clinical Narrative Arcs. The system incorporates a **Benefit Cascade Pattern** for ego strengthening, using experiential, scene-setting language and strictly banning causal language within this section. The 4-Stage DREAM Quality Pipeline ensures consistent, high-quality output by assigning each AI call a single, focused responsibility to prevent degradation, with strict guidelines on metaphor usage and enforcement of personal pronouns.

**Hypnotic Rhythm & Flow** (Oct 2025): Language Mastery Rules now enforce smooth connectors to prevent choppy comma splices. Common errors like "You pay attention to that sensation, it grows stronger" are caught with guidance to use flow connectors: "As you pay attention to that sensation, it grows stronger." Essential connectors include: As, And as, When, While, And now as. This maintains unbroken hypnotic rhythm for deeper trance states.

## External Dependencies
-   **Database**: PostgreSQL (Neon)
-   **AI Services**: Anthropic Claude Sonnet 4, OpenAI DALL-E 3
-   **ORM**: Drizzle ORM
-   **Payment Gateway**: Stripe (currently mocked)