# CLAUDE.md

Guidance for Claude Code when working with the Café com Vendas landing page.

## Project Context
**What**: Premium landing page for female entrepreneur event (Sept 20, Lisbon, 8 spots)  
**Audience**: See `info/DATA_avatar.json` - overworked female entrepreneurs seeking transformation  
**Language**: Portuguese (pt-PT)  
**Goal**: High-converting page with elegant design and proven conversion principles

## Commands
```bash
npm run dev          # Development with watch
npm run build        # Production build  
npm run tokens:build # Generate CSS from JSON tokens
npm run clean        # Clean build directory
```

## Structure
```
src/
├── _includes/
│   ├── layout.njk           # Base HTML
│   └── components/*.njk    # Section components
├── _data/                   # Eleventy data layer
│   ├── site.js             # Site metadata
│   ├── event.js            # Loads DATA_event.json
│   ├── avatar.js           # Loads DATA_avatar.json
│   ├── testimonials.js     # Customer testimonials data
│   └── tokens.js           # Loads DATA_design_tokens.json
├── index.njk               # Main page (includes components in order)
└── assets/
    ├── css/main.css       # Tailwind + tokens
    ├── js/main.js         # All JS here (no inline)
    └── fonts/             # Local Lora & Century Gothic

info/                      # Design system & content
├── DATA_design_tokens.json     # Unified design system (colors, typography, spacing)
├── DATA_event.json             # Event data (prices, dates)
├── DATA_avatar.json            # Persona & objections
├── CONTENT_copy_library.md     # Copy examples & headlines
├── GUIDE_voice_tone.md         # Voice & tone guidelines
├── GUIDE_brand_visual.md       # Brand guidelines  
├── GUIDE_claude_instructions.md # Claude context & instructions
├── BUILD_landing_page.md       # Development blueprint
└── *.md                        # Other guidelines
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

### Tech Stack
- Eleventy + Nunjucks templates (.njk)
- Tailwind v4 with PostCSS (no custom CSS)
- Local fonts only (Lora, Century Gothic)
- Vanilla JS in main.js only
- Design tokens → CSS custom properties

### Components
- Structure: `<section id="name" aria-label="Description">`
- Animations: Add `data-reveal` attribute
- Analytics: Add `data-analytics-event="event_name"`
- Each section in `src/_includes/components/`

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
2. Tokens become CSS vars in `_tokens.generated.css`
3. Tailwind uses vars via `@theme` directive
4. `npm run build:css` processes final CSS

**MANDATORY Code Review Checklist for ALL Components:**
- 🚨 **SCAN FOR VIOLATIONS**: Search entire component for `style.`, `<style>`, `style=""`
- ✅ No `<style>` blocks or `style=""` attributes  
- ✅ No `element.style.*` assignments in JavaScript
- ✅ All JavaScript in `main.js` (not inline)
- ✅ Only design token colors (no hex codes like `#f59e0b`)
- ✅ Standard Tailwind animations (no custom animation classes)
- ✅ Tailwind utilities only (no custom CSS classes)
- ✅ All interactions use class manipulation: `classList.add/remove/toggle()`

**Access Data in Templates**: Use Eleventy data (`{{ site }}`, `{{ event }}`, `{{ avatar }}`, `{{ tokens }}`)

## Conversion Elements
- Social proof with numbers
- 90-day guarantee (see DATA_event)
- Limited spots (8 first batch)
- PayPal integration
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