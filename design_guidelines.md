# HypnoBrain Script Shaper - Design Guidelines

## Design Approach: Professional Creative Tool System

**Selected Approach:** Material Design foundation with DAW-inspired controls, drawing inspiration from Linear's precision and Notion's content-rich layouts. This creates a professional, productivity-focused interface that feels like creative software.

**Core Principle:** Bridge professional creative tools (Ableton, Logic Pro) with modern web app clarity. The interface should feel powerful yet approachable for hypnotherapy professionals.

---

## Color Palette

### Dark Mode (Primary Interface)
- **Background Foundation:** 
  - Primary: 240 8% 12% (deep slate)
  - Secondary panels: 240 8% 16%
  - Elevated cards: 240 8% 18%

- **Brand/Accent Colors:**
  - Primary (CTAs/emphasis): 260 70% 62% (calming purple - hypnosis/mindfulness association)
  - Success (preview ready): 150 60% 50%
  - Warning (upgrade prompts): 35 85% 60%
  
- **Text Hierarchy:**
  - Primary text: 240 8% 95%
  - Secondary text: 240 5% 70%
  - Tertiary/labels: 240 5% 55%

### Light Mode (Marketing Pages)
- **Background:** 240 20% 98%
- **Primary:** 260 70% 45%
- **Text:** 240 8% 15%

---

## Typography

**Font Families:**
- **Primary (Interface):** Inter (Google Fonts) - Clean, professional, excellent at small sizes
- **Display (Marketing/Headers):** DM Sans (Google Fonts) - Geometric, modern authority
- **Monospace (Script Preview):** JetBrains Mono - For script text display

**Type Scale:**
- Headers: text-4xl/5xl (marketing), text-2xl/3xl (app headers)
- Body: text-base (16px) for forms/content
- Labels: text-sm (14px) for input labels, UI chrome
- Captions: text-xs (12px) for metadata, helper text

**Weights:**
- Regular (400): Body text
- Medium (500): Input labels, button text
- Semibold (600): Section headers, emphasis
- Bold (700): Marketing headlines only

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Micro spacing (within components): 2, 4
- Component padding: 6, 8
- Section spacing: 12, 16, 20
- Major layout gaps: 24

**Grid Structure:**
- Marketing pages: max-w-7xl container, 12-column grid
- App interface: Fixed sidebar (280px) + fluid main area (max-w-6xl)
- Dimension controls: 2-column grid (lg:), single column (mobile)

---

## Component Library

### Navigation & Mode Switching
- **Top Bar:** Sticky header with logo left, mode switcher center, account/settings right
- **Mode Pills:** Segmented control style (rounded-full, bg change on active, smooth transition)
- **Tier Badge:** Small colored badge showing "Free" | "Paid" mode clearly

### Core Controls

**Dimension Sliders (Hero Component):**
- Vertical stack of 8 sliders (4 enabled initially, 4 disabled/grayed)
- Each slider row: Label (left) | Slider track (center, flex-1) | Value display (right)
- Enabled sliders: Purple track, white thumb with shadow
- Disabled sliders: 30% opacity, tooltip on hover explaining "Coming soon"
- Track style: h-2 rounded-full with gradient fill based on value
- Smooth transitions on all interactions (duration-200)

**Form Inputs:**
- Text fields: Outlined style, focus:ring-2 ring-primary/30, rounded-lg
- Dropdowns: Custom styled with chevron icon, same border treatment
- Text areas: Minimum h-32, resize-y enabled
- All inputs have floating labels or clear top labels (text-sm text-secondary)

### Cards & Panels
- **Preview Card:** Elevated (shadow-lg), rounded-xl, p-8, border border-white/5
- **Script Display:** Monospace font, leading-relaxed, max-h-96 overflow-y-auto
- **Asset Cards:** Grid layout, each asset in rounded-lg card with icon + copy button

### Buttons & CTAs

**Primary Actions:**
- Large CTAs: px-8 py-4, text-lg, rounded-lg, bg-primary hover:bg-primary/90
- Secondary: variant="outline" with border-2, hover:bg-primary/10
- Upgrade prompts: bg-gradient-to-r from-warning/20 to-primary/20, border-warning

**Micro Interactions:**
- Copy buttons: Icon only, hover:bg-white/10, click: checkmark animation
- Remix toggle: Switch component with smooth slide animation

### Marketing Assets Display
- 6-item grid (3 cols desktop, 2 tablet, 1 mobile)
- Each card: Icon header (email/social/web) + preview text + copy button
- Visual hierarchy: Asset type (bold) → Content (regular) → Action (button)

---

## Conversion & Upgrade UI

### Free Tier Limitations Visual
- **Locked State Pattern:** Dimension sliders shown but with lock icon overlay + blur effect
- **Countdown Timer:** Circular progress indicator showing days until next free script
- **Upgrade Prompt Card:** 
  - Border: 2px border-gradient (warning to primary)
  - Background: Subtle gradient bg-warning/5 to bg-primary/5
  - Layout: ❌ Missed features list | Large upgrade button | OR divider | Remix alternative

### Preview vs. Full Script Differentiation
- Preview: 150 words, fade-out gradient at bottom, "Continue reading..." overlay
- Full script: Complete text, download buttons (PDF/Word icons), sharing options

---

## Page-Specific Layouts

### Landing Page (Marketing)
**Hero Section (90vh):**
- Split layout: Left (60%) = Headline + subhead + dual CTA (Free + Paid), Right (40%) = Animated preview of slider interface
- Headline: "DAW-Style Hypnosis Script Generation" (text-5xl font-display)
- Dual CTA: Primary "Get Free Script" (large) + Secondary "See Full Features" (outline)

**Comparison Section:**
- 3-column table: Free vs Create New vs Remix
- Visual checkmarks/X marks for features
- Pricing cards with hover lift effect

**Trust Indicators:**
- "Based on Erika Flint's 8D Framework" badge
- Stats: "1,000+ scripts generated" with count-up animation

### App Interface
**Sidebar (Fixed):**
- Mode selector at top
- Progress indicator (which step)
- Quick dimension overview (mini sliders, non-interactive)

**Main Area (Scrollable):**
- Client Context form (if Create New) or Script input (if Remix)
- Dimension Control Panel (the star - give it space, p-12)
- Archetype selector (card grid, icon + description on hover)
- Style selector (3 large radio cards with examples)
- Preview Panel (sticky when scrolling dimensions)
- Payment/Generate CTA (sticky footer bar)

---

## Images

**Hero Section:** Use professional, calming imagery
- Abstract brain/mind visualization with purple/blue gradient overlay (opacity 20%)
- Or: Hypnotherapist session setting (professional, warm, inviting) with dark overlay
- Image should be background with content overlaid (z-index layering)

**Testimonial Section:** (if added) Include practitioner headshots, circular crops, subtle shadow

**Feature Showcases:** Screenshots of the actual slider interface with annotations, displayed in browser mockup frames

---

## Animation & Interaction

**Minimize Animations:**
- Slider value changes: Smooth number count-up (duration-300)
- Mode switching: Fade transition between layouts (duration-200)
- Preview generation: Skeleton loader → fade-in content
- NO: Page scroll animations, parallax, unnecessary hover effects

**Focus States:** 
- All interactive elements: ring-2 ring-primary/50 on focus
- High contrast mode support: ring-offset-2

---

## Accessibility & Polish

- Dark mode throughout app (light mode for marketing only)
- All form inputs maintain consistent dark styling with white/light text
- Sufficient contrast ratios (WCAG AA minimum)
- Clear visual hierarchy through size, weight, and spacing—not just color
- Tooltips on disabled features explaining "Coming in Phase 2"