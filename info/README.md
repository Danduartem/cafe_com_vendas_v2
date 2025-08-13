# Info Directory - Project Reference Files

This directory contains all reference files for the Café com Vendas landing page project. These files serve as the single source of truth for design, content, and configuration.

## Current Structure

### Core Configuration Files

- **`DATA_design_tokens.json`** - Unified design system tokens
  - Colors (palette, semantic, gradients)
  - Typography (fonts, scale, line heights, tracking)
  - Spacing, sizing, shadows, animations
  - Voice and tone tokens
  - CSS variables for build process

- **`DATA_event.json`** - Event configuration
  - Event details (date, location, capacity)
  - Pricing tiers
  - Payment links and methods
  - Agenda and deliverables
  - Benefits and bonuses
  - Guarantee details

- **`DATA_avatar.json`** - Target audience persona
  - Demographics and psychographics
  - Pain points and goals
  - Purchase behavior
  - Objections and rebuttals
  - Customer journey mapping

- **`DATA_faq.json`** - Frequently asked questions data
  - Questions and answers for FAQ section
  - Structured data for easy templating

### Content & Guidelines

- **`CONTENT_copy_library.md`** - Pre-approved copy
  - Headlines and subheadlines
  - Body copy examples
  - CTAs and button text
  - Email templates

- **`GUIDE_voice_tone.md`** - Voice and tone guidelines
  - Writing principles
  - Language and vocabulary
  - Channel-specific guidelines
  - Message templates

- **`GUIDE_brand_visual.md`** - Brand direction
  - Visual guidelines
  - Creative principles
  - Design philosophy

- **`GUIDE_claude_instructions.md`** - Claude context and instructions
  - Development guidelines
  - Architecture principles
  - Implementation standards

- **`BUILD_landing_page.md`** - Development blueprint
  - Technical specifications
  - Build process documentation
  - Component architecture

## Usage in Templates

These files are automatically loaded into Eleventy's data layer:

```javascript
// Available in templates as:
{{ site }}    // Site metadata
{{ event }}   // DATA_event.json data
{{ avatar }}  // DATA_avatar.json data
{{ tokens }}  // DATA_design_tokens.json data
```

## Workflow

1. Update source files in this directory (never hardcode values)
2. Run `npm run tokens:build` after design token changes
3. Use Tailwind utilities that map to tokens
4. Reference data files in templates using Eleventy data

## Token Build Process

```
DATA_design_tokens.json
  └─> build-tokens.js
      └─> _tokens.generated.css
          └─> Tailwind CSS (@theme)
```

## Quick Reference

| Need | File |
|------|------|
| Change colors | `DATA_design_tokens.json` → colors |
| Update pricing | `DATA_event.json` → pricing |
| Add headlines | `CONTENT_copy_library.md` |
| Modify voice | `GUIDE_voice_tone.md` |
| Brand visuals | `GUIDE_brand_visual.md` |
| FAQ data | `DATA_faq.json` |
| Development guide | `BUILD_landing_page.md` |
| Claude instructions | `GUIDE_claude_instructions.md` |
