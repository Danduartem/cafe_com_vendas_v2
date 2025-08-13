# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Guidance for Claude Code when working with the Café com Vendas landing page.

## Project Context
**What**: Premium landing page for female entrepreneur event (Sept 20, Lisbon, 8 spots)  
**Audience**: See `info/DATA_avatar.json` - overworked female entrepreneurs seeking transformation  
**Language**: Portuguese (pt-PT)  
**Goal**: High-converting page with elegant design and proven conversion principles

## Commands
```bash
npm run dev          # Development with watch (tokens + CSS + JS + Eleventy)
npm run start        # Alternative development server 
npm run build        # Production build (tokens + CSS + JS + Eleventy)
npm run tokens:build # Generate CSS from JSON tokens
npm run build:css    # Build Tailwind CSS with PostCSS
npm run build:js     # Build JavaScript with Vite (production)
npm run build:js:dev # Build JavaScript with Vite (development + source maps)
npm run clean        # Clean build directory
```

**Note**: No test or lint commands are configured in this project. Don't assume their existence.

## Structure
```
src/
├── _includes/
│   ├── layout.njk           # Base HTML
│   └── components/*.njk     # Section components
├── _data/                   # Eleventy data layer
│   ├── site.js             # Site metadata
│   ├── event.js            # Loads DATA_event.json
│   ├── avatar.js           # Loads DATA_avatar.json
│   ├── testimonials.js     # Customer testimonials data
│   └── tokens.js           # Loads DATA_design_tokens.json
├── index.njk               # Main page (includes components in order)
└── assets/
    ├── css/
    │   ├── main.css        # Tailwind + tokens entry point
    │   └── _tokens.generated.css # Generated from JSON tokens
    ├── js/                 # Modular JavaScript architecture
    │   ├── main.js         # Entry point (imports app.js)
    │   ├── app.js          # Application controller
    │   ├── config/
    │   │   └── constants.js # Configuration constants
    │   ├── core/
    │   │   ├── analytics.js # Analytics tracking
    │   │   └── state.js    # State management
    │   ├── utils/
    │   │   ├── animations.js # Animation utilities
    │   │   ├── dom.js      # DOM helpers
    │   │   ├── throttle.js # Performance utilities
    │   │   └── index.js    # Utils barrel export
    │   └── components/
    │       ├── hero.js     # Hero section
    │       ├── banner.js   # Top banner
    │       ├── faq.js      # FAQ accordion
    │       ├── offer.js    # Offer section
    │       ├── testimonials.js # Testimonials carousel
    │       ├── footer.js   # Footer interactions
    │       ├── final-cta.js # Final CTA section
    │       ├── youtube.js  # YouTube embeds
    │       ├── navigation.js # Navigation utilities
    │       └── index.js    # Components barrel export
    └── fonts/              # Local Lora & Century Gothic

info/                       # Design system & content
├── DATA_design_tokens.json      # Unified design system
├── DATA_event.json              # Event data (prices, dates)
├── DATA_avatar.json             # Persona & objections
├── CONTENT_copy_library.md      # Copy examples & headlines
├── GUIDE_voice_tone.md          # Voice & tone guidelines
├── GUIDE_brand_visual.md        # Brand guidelines
├── GUIDE_claude_instructions.md # Claude context & instructions
├── BUILD_landing_page.md        # Development blueprint
└── *.md                         # Other guidelines

docs/
└── VITE.md                 # Vite configuration guide

vite.config.js              # Vite bundler configuration
```

## Critical Rules

### 🚨 CRITICAL: Pure Tailwind CSS Enforcement
**ZERO TOLERANCE POLICY - NO EXCEPTIONS**
- ❌ NEVER use `element.style.*` in JavaScript 
- ❌ NEVER write custom CSS in `<style>` blocks
- ❌ NEVER use `style=""` inline attributes
- ❌ NEVER create custom CSS properties outside design tokens
- ✅ ALWAYS use `element.classList.add/remove()` for state changes
- ✅ ALWAYS use Tailwind utilities: `max-h-*`, `rotate-*`, `transition-*`, `duration-*`
- ✅ ALWAYS check: scan all JavaScript for `style.` before submitting

**Pre-Implementation Checklist:**
- ✅ Can this animation be done with Tailwind `transition-*` classes?
- ✅ Can this state change be handled with class toggling?
- ✅ Are all animations using Tailwind utilities (`animate-*`, `transform`, `rotate-*`)?
- ✅ Am I only manipulating classes, never direct styles?

### Tech Stack & Architecture
- **Static Site Generator**: Eleventy (.eleventy.js config)
- **Templates**: Nunjucks (.njk files) 
- **Build Tool**: Vite for unified JS/CSS bundling and development server
- **CSS Framework**: Tailwind v4 with PostCSS (pure CSS-based configuration via @theme)
- **Data Layer**: Eleventy data files (src/_data/*.js) load from info/*.json
- **Design System**: JSON tokens → CSS custom properties via build-tokens.js
- **Fonts**: Local only (Lora display, Century Gothic body)
- **JavaScript**: Modular ES6 architecture with Vite bundling

**Data Flow**: `info/DATA_design_tokens.json` → `scripts/build-tokens.js` → `src/assets/css/_tokens.generated.css` → `@theme` block in main.css
**JS Architecture**: ES6 modules → Vite bundler → Single optimized IIFE bundle for browser

### Components
- Structure: `<section id="name" aria-label="Description">`
- Animations: Add `data-reveal` attribute
- Analytics: Add `data-analytics-event="event_name"`
- HTML templates in `src/_includes/components/`
- JavaScript modules in `src/assets/js/components/`

### JavaScript Architecture
- **Entry Point**: `main.js` imports and initializes the application
- **Application Controller**: `app.js` orchestrates all components
- **Modular Design**: Each component has its own dedicated file
- **Utilities**: Shared functions in `utils/` (DOM, animations, performance)
- **Configuration**: Centralized constants and state management
- **Build Output**: Single optimized IIFE bundle for browser compatibility
- **Development**: Source maps enabled for debugging
- **Production**: Minified and tree-shaken for performance

**Component Creation Pattern**:
1. Create `.njk` template in `src/_includes/components/`
2. Create `.js` module in `src/assets/js/components/`  
3. Export component object with `init()` method
4. Import and register in `src/assets/js/app.js`
5. Vite automatically bundles everything

### Design Tokens
- Colors: Navy `#191F3A`, Burgundy `#81171F`, Neutral `#ECECEC`
- Typography: `font-lora` (display), `font-century` (body)
- All tokens in `info/DATA_design_tokens.json` (unified file)
- Run `npm run tokens:build` after changes to generate CSS

### Performance
- Images: `loading="lazy"` `decoding="async"` WebP preferred
- One `<h1>` per page, sections use `<h2>`
- WCAG AA compliance required
- Target: Lighthouse Performance >90, Accessibility >95

### Content Rules
- Voice: Empathetic, authoritative, clear (see `info/GUIDE_voice_tone.md`)
- Copy library: `info/CONTENT_copy_library.md`
- Event details: Always from `info/DATA_event.json`
- Never hardcode prices, dates, or guarantees

## Section Order
1. Hero (hook + CTA)
2. Problem (pain validation)
3. Solution (5 pillars)
4. Social Proof (testimonials)
5. Offer (price + guarantee)
6. FAQ (objections)
7. Final CTA (urgency)

## Schema Markup
- Hero → Event
- Solution → HowTo
- Testimonials → Review
- FAQ → FAQPage
- Offer → Product/Offer

## Key Files Reference

| Need | File |
|------|------|
| Design System | `info/DATA_design_tokens.json` (unified colors, typography, spacing) |
| Copy/Headlines | `info/CONTENT_copy_library.md`, `GUIDE_voice_tone.md` |
| Event Details | `info/DATA_event.json` |
| Customer Pain | `info/DATA_avatar.json` |
| Brand Guidelines | `info/GUIDE_brand_visual.md` |

## Common Tasks

**Add Section**: Create in `components/`, include in `index.njk`, add id + aria-label

**Update Tokens**: Edit `DATA_design_tokens.json` → `npm run tokens:build` → available as CSS vars

**Change Copy**: Check CONTENT_copy_library → match GUIDE_voice_tone → pull data from DATA_event

**Build Process**: 
1. Edit `DATA_design_tokens.json` → `npm run tokens:build` 
2. `scripts/build-tokens.js` generates `_tokens.generated.css` with CSS custom properties
3. `@theme` block in main.css defines Tailwind configuration using CSS custom properties
4. `npm run build:css` processes with PostCSS (Tailwind + Autoprefixer)
5. `npm run build:js` bundles modular JavaScript with Vite (ES6 modules → IIFE)
6. Eleventy builds static HTML using data from src/_data layer

**Vite Benefits**: 
- Unified build pipeline (single command for dev/prod)
- Hot reload for both JS and CSS changes
- Optimized production output (minification, tree-shaking, purging)
- Direct CSS imports in JavaScript modules
- Source maps for development debugging

**Note**: This project uses Tailwind v4's pure CSS-based configuration with Vite as the unified build tool.

**MANDATORY Code Review Checklist for ALL Components:**
- 🚨 **SCAN FOR VIOLATIONS**: Search entire component for `style.`, `<style>`, `style=""`
- ✅ No `<style>` blocks or `style=""` attributes  
- ✅ No `element.style.*` assignments in JavaScript
- ✅ All JavaScript in modular ES6 files (not inline)
- ✅ Only design token colors (no hex codes like `#f59e0b`)
- ✅ Standard Tailwind animations (no custom animation classes)
- ✅ Tailwind utilities only (no custom CSS classes)
- ✅ All interactions use class manipulation: `classList.add/remove/toggle()`

**Access Data in Templates**: Use Eleventy data (`{{ site }}`, `{{ event }}`, `{{ avatar }}`, `{{ tokens }}`)

## Git Commit Guidelines
- Write clear, descriptive commit messages
- Use conventional commit format when appropriate
- **Do NOT include Claude Code attribution or co-author lines in commits**
- Keep commit messages focused on the actual changes made

## Conversion Elements
- Social proof with numbers
- 90-day guarantee (see DATA_event)
- Limited spots (8 first batch)
- Stripe integration
- WhatsApp button

## Don'ts
- No inline CSS/JS (includes `<style>` blocks and `style=""` attributes)
- No Google Fonts
- No hardcoded values (use tokens)
- No custom CSS (use Tailwind utilities)
- No breaking elegant aesthetic for function
- No custom animation classes (use Tailwind: `animate-pulse`, `animate-bounce`, etc.)
- No hardcoded colors like `#f59e0b` (use design token classes: `burgundy-*`, `navy-*`)
- No complex glassmorphism with custom shadows (use Tailwind: `backdrop-blur-md`, `bg-white/90`)