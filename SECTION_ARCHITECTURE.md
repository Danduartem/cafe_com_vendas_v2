# Section-First Architecture Guide

## 🎯 Overview

This project now uses a **section-first architecture** for improved findability, better developer experience, and consistent organization. Every section has its own folder with all related files.

## 📂 New Structure

```
src/_includes/sections/
├── manifest.ts              # Single source of truth for all sections
├── top-banner/              # Urgency messaging
├── hero/                    # Main value proposition  
├── problem/                 # Pain validation
├── solution/                # 5 pillars method
├── about/                   # Authority building
├── social-proof/            # Testimonials
├── offer/                   # Pricing & guarantee
├── faq/                     # Objections handling
├── final-cta/              # Final call to action
└── footer/                  # Footer & legal

Each section folder contains:
├── index.njk               # Template with section contract
├── index.ts                # Interactive functionality
├── schema.ts               # Content validation (optional)
├── analytics.ts            # Event tracking (optional)
└── README.md               # Documentation (optional)
```

## 🔧 Developer Experience Scripts

### Quick Navigation
```bash
# Find section files instantly
npm run find:section hero
npm run find:section problem

# Focus development on specific section  
npm run dev:section offer
npm run dev:section faq

# Scaffold new section automatically
npm run new:section testimonials
```

### Example Usage
```bash
$ npm run find:section hero

🎯 Section: Hero Section
📁 Path: src/_includes/sections/hero/
📄 Template: src/_includes/sections/hero/index.njk
⚡ Script: src/_includes/sections/hero/index.ts
🔗 Anchor: #s-hero

💡 Quick access:
   code src/_includes/sections/hero/index.njk
   code src/_includes/sections/hero/index.ts
```

## 📋 Section Contract

Every section **must** follow this contract:

### Template Requirements
```njk
<section
  id="s-{section-id}"           <!-- Standardized ID -->
  data-section="{section-id}"   <!-- Data attribute -->
  aria-label="Section Title"   <!-- Accessibility -->
  class="..."
>
  <!-- Section content -->
</section>
```

### TypeScript Module Pattern
```typescript
export const {sectionName}Section = {
  init(): void {
    this.bindEvents();
    this.setupAnalytics();
  },

  bindEvents(): void {
    // Event binding logic
  },

  setupAnalytics(): void {
    // Analytics tracking setup
  }
};
```

## 🎨 Path Aliases

Import with clean, muscle-memory paths:

```typescript
import { heroSection } from '@sections/hero/index.js';
import { trackEvent } from '@sections/hero/analytics.js';
import { validateContent } from '@sections/hero/schema.js';
import { safeQuery } from '@/utils/dom.js';
```

Available aliases:
- `@sections/*` → `src/_includes/sections/*`
- `@partials/*` → `src/_includes/partials/*`  
- `@data/*` → `src/_data/*`
- `@platform/*` → `src/platform/*`
- `@assets/*` → `src/assets/*`
- `@types/*` → `src/assets/js/types/*`

## 📊 Analytics Integration

Each section can track its own events:

```typescript
// In section analytics.ts
export const HERO_EVENTS = {
  SECTION_VIEW: 'hero_section_view',
  CTA_CLICK: 'hero_cta_click',
} as const;

export function trackHeroCTAClick(): void {
  if (typeof gtag !== 'undefined') {
    gtag('event', HERO_EVENTS.CTA_CLICK, {
      event_category: 'conversion',
      event_label: 'hero_to_problem',
    });
  }
}
```

## 🎯 Section Management

### Creating New Sections
```bash
npm run new:section pricing
```

This scaffolds:
- Template with section contract
- TypeScript functionality 
- Content validation schema
- Analytics event tracking
- Complete documentation

### Migrating Legacy Components
1. Run: `npm run new:section {name}`
2. Copy content from `sections-legacy/{name}.njk`  
3. Update IDs: `id="old-id"` → `id="s-{name}"`
4. Add: `data-section="{name}"`
5. Update `src/index.njk` path
6. Test with: `npm run dev:section {name}`

## 🔍 Finding Things Fast

### Universal Grep Targets
Every section has consistent selectors:

```bash
# Find section by ID
grep -r "s-hero" src/

# Find section by data attribute  
grep -r 'data-section="hero"' src/

# Find analytics events
grep -r "hero_section_view" src/
```

### VS Code Integration
Use Command Palette with section manifest:

```json
{
  "label": "Open Hero Section",
  "detail": "src/_includes/sections/hero/",
  "target": "src/_includes/sections/hero/index.njk"
}
```

## 🚀 Benefits

### ✅ Instant Navigation
- Jump to any section in seconds
- No hunting through mixed folders
- Predictable file locations

### ✅ Better Organization  
- Everything for a section in one place
- Template + logic + schema + docs together
- Clear separation of concerns

### ✅ Consistent Structure
- Every section follows same pattern
- Standardized IDs and data attributes
- Universal analytics approach

### ✅ Developer Experience
- Auto-scaffolding with `npm run new:section`
- Focus tools with `npm run dev:section`
- Path aliases for clean imports

### ✅ Scalability
- Easy to add new sections
- Simple to refactor existing ones
- Self-documenting architecture

## 🛠️ Migration Status

### ✅ Completed Sections
- ✅ Top Banner (`s-top-banner`)
- ✅ Hero (`s-hero`) 
- ✅ Problem (`s-problem`)
- ✅ Solution (`s-solution`)
- ✅ Offer (`s-offer`)
- ✅ FAQ (`s-faq`)

### 🔄 Legacy Sections (in `sections-legacy/`)
- 🔄 About (`about.njk`)
- 🔄 Social Proof (`social-proof.njk`) 
- 🔄 Final CTA (`final-cta.njk`)
- 🔄 Footer (`footer.njk`)

### Migration Commands
```bash
# Migrate remaining sections
npm run new:section about
npm run new:section social-proof  
npm run new:section final-cta
npm run new:section footer

# Test each migration
npm run dev:section about
npm run dev:section social-proof
```

## 📚 Next Steps

1. **Complete Migration**: Move all `sections-legacy/` to new structure
2. **Add Schema Validation**: Create `schema.ts` for content validation  
3. **Enhanced Analytics**: Add `analytics.ts` with typed events
4. **Documentation**: Add `README.md` to each section
5. **Testing**: Create `index.spec.ts` for component tests

This section-first architecture provides a solid foundation for scaling the project while maintaining developer productivity and code quality.