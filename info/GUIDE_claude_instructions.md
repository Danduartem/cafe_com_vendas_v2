---
file: GUIDE_claude_instructions.md
version: 2025-08-13
purpose: Comprehensive context and instructions for Claude Code when working with Café com Vendas project
dependencies: All files in info/ folder
---

# Claude Instructions — Café com Vendas Landing Page

## Project Overview

**Project**: High-converting landing page for "Café com Vendas" premium event
**Target**: Female entrepreneurs in Portugal seeking to scale their business
**Goal**: Drive event registrations with elegant design and proven conversion principles
**Tech Stack**: Eleventy + Tailwind + Vanilla JS
**Language**: Portuguese (pt-PT)

## File Organization System

### Naming Convention
- `DATA_*.json` - Single source of truth data files
- `GUIDE_*.md` - Instructions and guidelines  
- `CONTENT_*.md` - Marketing copy and content libraries
- `BUILD_*.md` - Development specifications

### Core Data Files (Always Reference These)
- `DATA_avatar.json` - Target customer persona (Amanda)
- `DATA_event.json` - Event details, pricing, guarantees, logistics
- `DATA_design_tokens.json` - Design system, colors, typography, spacing

### Guidelines & Instructions
- `GUIDE_voice_tone.md` - Brand voice, messaging patterns, compliance
- `GUIDE_brand_visual.md` - Visual brand direction, color usage
- `GUIDE_claude_instructions.md` - This file

### Content Libraries
- `CONTENT_copy_library.md` - Headlines, CTAs, elevator pitches

### Build Specifications  
- `BUILD_landing_page.md` - Complete development blueprint from Phase 4

## Priority Information for Marketing Context

### 1. Critical Pain Points (from DATA_avatar.json)
- High effort, low financial return
- Overworked without time for family
- Lack of scalable method
- Difficulty pricing and selling without guilt
- Need for results and support network

### 2. Key Value Propositions (from DATA_event.json)  
- 90-day action plan with clear steps
- Confidence to raise prices and communicate value
- Simple processes that free up schedule and increase profit
- Network of women with similar ambitions
- 20% sales increase guarantee

### 3. Conversion Elements
- **Scarcity**: Only 8 spots in first batch
- **Social Proof**: Required (cases, testimonials, metrics)
- **Guarantee**: 20% sales increase or money back
- **Premium Positioning**: €180 vs regular €1500 mentorship value
- **Urgency**: Limited time first batch pricing

### 4. Brand Voice Essentials
- **Tone**: Empathetic, confident, practical, elegant
- **Language**: Direct, scannable, solution-focused
- **Avoid**: Jargon, aggressive language, miracle promises
- **Key Phrases**: "Menos esforço, mais resultado", "Método prático", "Cobrar o que você vale"

## Common Tasks & Workflows

### Landing Page Content Creation
1. **Always reference** `DATA_event.json` for pricing, dates, guarantees
2. **Never hardcode** event details - use data file values
3. **Follow voice guide** patterns from `GUIDE_voice_tone.md`
4. **Use design tokens** from `DATA_design_tokens.json`

### Copy Development
1. **Target audience**: Refer to `DATA_avatar.json` for pain points and motivations
2. **Message hierarchy**: Problem → Solution → Proof → Offer → FAQ → CTA
3. **Voice patterns**: Use templates from `GUIDE_voice_tone.md`
4. **Compliance**: No miracle promises, always require proof for claims

### Design Implementation
1. **Colors**: Navy (#191F3A), Burgundy (#81171F), Neutral (#ECECEC) as anchors
2. **Typography**: Lora (display), CenturyGothic (body)
3. **Proportions**: Navy 30-55%, Neutral 20-45%, Burgundy 8-20%
4. **Reference**: `DATA_design_tokens.json` for complete system

### Component Development
1. **Follow patterns** from `BUILD_landing_page.md`
2. **Use semantic tokens** over raw hex values
3. **Ensure accessibility** WCAG AA compliance  
4. **No custom CSS** - Pure Tailwind only per project requirements

## Performance Metrics to Track

### Conversion Funnel (from DATA_event.json)
- **First lot fill target**: 100%
- **Checkout conversion**: 3% minimum
- **Email open rate**: 30% minimum

### Key Events to Track
- `hero_conversion_rate` - Primary CTA clicks
- `scroll_past_hero` - Engagement depth  
- `view_solution_details` - Method interest
- `testimonial_video_play_rate` - Social proof consumption
- `checkout_conversion_rate` - Final conversion

## Quality Standards

### Content Review Checklist
- [ ] Acknowledges pain and shows next step
- [ ] Simple and scannable text
- [ ] Method/proof present
- [ ] Single clear CTA per section
- [ ] References data files for concrete details

### Technical Requirements
- [ ] Pure Tailwind CSS (no custom styles)
- [ ] Semantic HTML5 structure
- [ ] WCAG AA accessibility
- [ ] Schema markup for SEO
- [ ] Mobile-first responsive design

### Brand Consistency
- [ ] Aligned with target avatar (Amanda)
- [ ] Follows voice and tone guide
- [ ] Uses approved vocabulary
- [ ] Maintains visual brand standards

## Dependencies Map

```
GUIDE_claude_instructions.md (this file)
├── DATA_avatar.json (persona, pain points, goals)
├── DATA_event.json (pricing, logistics, guarantees)  
├── DATA_design_tokens.json (visual system)
├── GUIDE_voice_tone.md (messaging, compliance)
├── GUIDE_brand_visual.md (color usage, proportions)
├── CONTENT_copy_library.md (approved headlines, CTAs)
└── BUILD_landing_page.md (technical implementation)
```

## Quick Reference

### Primary CTA
"Garantir minha vaga no primeiro lote" (from DATA_event.json)

### Key Message
"Menos esforço. Mais lucro. O mapa para a empreendedora que se recusa a escolher entre sucesso e liberdade."

### Event Details
- Date: 20/09 (Lisboa)
- Price: €180 (first batch)  
- Capacity: 8 spots
- Venue: Mesa Corrida (casarão secular)

### Guarantee
20% sales increase in 90 days or full refund (with method application required)

## Maintenance Notes

- Update this file when project requirements change
- Version control all info/ files with dates
- Always sync concrete data with source files
- Test messaging with target audience when possible
- Keep technical and marketing concerns separated

---

*This guide should be referenced for all Claude Code sessions on this project. It provides the essential context for high-quality, on-brand, conversion-focused work.*