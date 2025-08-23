# Café com Vendas: Safe Restructuring Guide

## Overview

This guide provides a step-by-step approach to restructure the Café com Vendas project for cleaner architecture while maintaining site functionality throughout the process.

**⚠️ IMPORTANT**: Execute one sub-phase at a time. Test thoroughly before proceeding to the next step.

## General Safety Guidelines

### Before Starting Any Phase
```bash
# 1. Create a backup branch
git checkout -b restructure-backup
git push -u origin restructure-backup

# 2. Create working branch
git checkout main
git checkout -b restructure-phase-X

# 3. Ensure everything works
npm run type-check
npm run lint
npm run dev # Test in browser
```

### After Each Sub-Phase
```bash
# 1. Test the application
npm run type-check
npm run lint
npm run dev # Test in browser thoroughly

# 2. Commit changes
git add .
git commit -m "feat: complete phase X.Y - [description]"
```

### Emergency Rollback
```bash
# If something breaks, immediately:
git checkout restructure-backup
npm run dev # Verify backup works
# Then investigate the issue
```

---

## Phase 1: Type System Consolidation

**Goal**: Organize scattered type definitions into a logical structure without breaking existing functionality.

### Phase 1A: Create New Type Structure (ZERO RISK)

**✅ Pre-flight Checklist**
- [ ] Current site loads without errors
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes

**🔧 Tasks**
1. Create new type directory structure:
```bash
mkdir -p src/types/{data,sections,components,global}
```

2. Create index files (empty for now):
```bash
touch src/types/index.ts
touch src/types/data/index.ts
touch src/types/sections/index.ts
touch src/types/components/index.ts
touch src/types/global/index.ts
```

3. Add basic exports to each index file:
```typescript
// src/types/index.ts
// Central type exports - will be populated in later phases
export * from './data';
export * from './sections';
export * from './components';  
export * from './global';

// src/types/data/index.ts
// Data-related types
export {};

// src/types/sections/index.ts
// Section-specific types
export {};

// src/types/components/index.ts
// Component types
export {};

// src/types/global/index.ts
// Global utility types
export {};
```

**🧪 Verification**
- [ ] `npm run type-check` still passes
- [ ] `npm run lint` still passes
- [ ] Site loads normally in dev mode
- [ ] New directories exist but don't affect build

**↩️ Rollback Plan**
```bash
rm -rf src/types
git checkout -- .
```

**📝 Notes**
- This phase creates structure only, no existing imports are changed
- Zero risk of breaking existing functionality

---

### Phase 1B: Move Data-Related Types (LOW RISK)

**✅ Pre-flight Checklist**
- [ ] Phase 1A completed successfully
- [ ] Site is working normally

**🔧 Tasks**

1. Create site configuration types:
```bash
touch src/types/data/site.ts
```

Add to `src/types/data/site.ts`:
```typescript
// Site configuration types
export interface AnalyticsConfig {
  gtmId: string;
}

export interface SiteData {
  title: string;
  description: string;
  url: string;
  baseUrl: string;
  analytics: AnalyticsConfig;
}
```

2. Create event data types:
```bash
touch src/types/data/event.ts
```

Add to `src/types/data/event.ts`:
```typescript
// Event data structure
export interface EventData {
  title: string;
  subtitle?: string;
  date: string;
  location: string;
  price?: number;
  description?: string;
  [key: string]: unknown;
}
```

3. Create presenter types:
```bash
touch src/types/data/presenter.ts
```

Add to `src/types/data/presenter.ts`:
```typescript
// Presenter structure
export interface PresenterSchema {
  '@context': string;
  '@type': string;
  name: string;
  jobTitle: string;
  url: string;
  sameAs: string[];
}

export interface PresenterData {
  name: string;
  subtitle: string;
  bio: string;
  photoAlt: string;
  highlights: string[];
  microStory: string;
  social: {
    instagram: string;
  };
  schema: PresenterSchema;
}
```

4. Update `src/types/data/index.ts`:
```typescript
// Data-related types
export * from './site';
export * from './event';
export * from './presenter';
```

5. Add backward compatibility to existing `src/_data/types.ts`:
```typescript
// At the top of src/_data/types.ts, add:
// Re-export from new location for backward compatibility
export type { AnalyticsConfig, SiteData } from '../types/data/site';
export type { EventData } from '../types/data/event';
export type { PresenterSchema, PresenterData } from '../types/data/presenter';

// Keep existing definitions for now (will remove in Phase 1E)
```

**🧪 Verification**
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes  
- [ ] Site loads and functions normally
- [ ] New types are accessible via both old and new paths
- [ ] Import `import type { SiteData } from '@/types/data/site'` works
- [ ] Import `import type { SiteData } from '../_data/types'` still works

**↩️ Rollback Plan**
```bash
rm -f src/types/data/{site,event,presenter}.ts
git checkout -- src/_data/types.ts src/types/data/index.ts
```

**📝 Notes**
- Both import paths work during transition
- No existing imports need to change yet

---

### Phase 1C: Move Section Types (MEDIUM RISK)

**✅ Pre-flight Checklist**
- [ ] Phase 1B completed successfully
- [ ] Both import paths working for data types

**🔧 Tasks**

1. Create base section types:
```bash
touch src/types/sections/base.ts
```

Add to `src/types/sections/base.ts`:
```typescript
// Base section interfaces
export interface SectionCTA {
  label: string;
  href: string;
  variant: string;
}

export interface SectionMedia {
  image?: string;
  alt?: string;
  background?: string;
  aspect_ratio?: string;
}

export interface SectionDesign {
  theme: 'light' | 'dark';
  accent: string;
  background: string;
  layout: string;
}

export interface SectionTracking {
  section_id: string;
  impression_event: string;
  cta_event?: string;
  [key: string]: unknown;
}

export interface SectionCopy {
  eyebrow?: string;
  headline: string;
  subhead?: string;
  description?: string;
  cta?: SectionCTA;
  [key: string]: unknown;
}

export interface BaseSection {
  id: string;
  variant: string;
  enabled: boolean;
  copy: SectionCopy;
  media?: SectionMedia;
  design: SectionDesign;
  tracking: SectionTracking;
}

// Section slug type
export type SectionSlug =
  | 'top-banner' | 'hero' | 'problem' | 'solution' | 'about'
  | 'social-proof' | 'offer' | 'faq' | 'final-cta' | 'footer'
  | 'thank-you-content';

// Validation utilities
export function isValidSectionSlug(value: unknown): value is SectionSlug {
  const validSlugs: SectionSlug[] = [
    'top-banner', 'hero', 'problem', 'solution', 'about',
    'social-proof', 'offer', 'faq', 'final-cta', 'footer',
    'thank-you-content'
  ];
  return typeof value === 'string' && validSlugs.includes(value as SectionSlug);
}
```

2. Create specific section types:
```bash
touch src/types/sections/hero.ts
touch src/types/sections/problem.ts
touch src/types/sections/solution.ts
```

Add to `src/types/sections/hero.ts`:
```typescript
import type { BaseSection, SectionCopy } from './base';

export interface HeroSection extends BaseSection {
  id: 'hero';
  copy: SectionCopy & {
    badge?: {
      date: string;
      location: string;
      venue: string;
    };
    notice?: string;
  };
}
```

Add to `src/types/sections/problem.ts`:
```typescript
import type { BaseSection, SectionCopy } from './base';

export interface ProblemSection extends BaseSection {
  id: 'problem';
  copy: SectionCopy & {
    pain_points: string[];
    highlights: string[];
  };
}
```

Add to `src/types/sections/solution.ts`:
```typescript
import type { BaseSection, SectionCopy } from './base';

export interface SolutionSection extends BaseSection {
  id: 'solution';
  copy: SectionCopy & {
    pillars: Array<{
      number: string;
      title: string;
      description: string;
      icon: string;
      analytics_event: string;
      animation_delay: string;
    }>;
    supporting_text: string;
    trust_indicators: string[];
  };
}
```

3. Update `src/types/sections/index.ts`:
```typescript
// Section-specific types
export * from './base';
export * from './hero';
export * from './problem';
export * from './solution';

// Union type for all sections (will expand this in next steps)
export type { HeroSection, ProblemSection, SolutionSection } from './hero';
export type { HeroSection, ProblemSection, SolutionSection } from './problem';
export type { HeroSection, ProblemSection, SolutionSection } from './solution';
```

4. Add backward compatibility to `src/_data/types.ts`:
```typescript
// Add after previous exports:
export type {
  BaseSection,
  SectionCopy,
  SectionCTA,
  SectionMedia,
  SectionDesign,
  SectionTracking,
  SectionSlug,
  HeroSection,
  ProblemSection,
  SolutionSection
} from '../types/sections';
export { isValidSectionSlug } from '../types/sections';
```

**🧪 Verification**
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] Site loads and all sections render properly
- [ ] Hero, Problem, Solution sections display correctly
- [ ] Check each section loads without console errors

**↩️ Rollback Plan**
```bash
rm -f src/types/sections/{base,hero,problem,solution}.ts
git checkout -- src/_data/types.ts src/types/sections/index.ts
```

---

### Phase 1D: Move Component Types (MEDIUM RISK)

**✅ Pre-flight Checklist**
- [ ] Phase 1C completed successfully
- [ ] All sections rendering correctly

**🔧 Tasks**

1. Create component base types:
```bash
touch src/types/components/base.ts
```

Add to `src/types/components/base.ts`:
```typescript
// Component base interfaces
export interface Component {
  init(): void;
}

export interface ComponentWithCleanup extends Component {
  cleanup?(): void;
}

export interface ComponentRegistration {
  name: string;
  component: Component;
}

export interface ComponentStatus {
  name: string;
  initialized: boolean;
  hasInit: boolean;
}

export interface ComponentHealthStatus {
  status: 'not_initialized' | 'initialized';
  components?: ComponentStatus[];
  total: number;
  healthy: number;
}
```

2. Move analytics types:
```bash
touch src/types/components/analytics.ts
```

Copy analytics types from `src/assets/js/types/analytics.ts` to new location:
```typescript
// Analytics event types
export interface AnalyticsEvent {
  event: string;
  event_category: string;
  [key: string]: unknown;
}

// Add all other analytics types from the original file...
```

3. Move DOM types:
```bash
touch src/types/components/dom.ts
```

Copy DOM types from `src/assets/js/types/dom.ts`:
```typescript
// DOM utility types
export type SafeElement = Element | null;
export type SafeElements = NodeListOf<Element> | null;
export type SafeHTMLElement = HTMLElement | null;

// Add all other DOM types from the original file...
```

4. Update `src/types/components/index.ts`:
```typescript
// Component types
export * from './base';
export * from './analytics';
export * from './dom';
```

5. Update `src/assets/js/types/index.ts` for backward compatibility:
```typescript
// Re-export from new location
export * from '../../types/components';

// Keep existing exports for now
export * from './component';
export * from './analytics'; 
export * from './dom';
// ... other existing exports
```

**🧪 Verification**
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] Site loads with all interactive elements working
- [ ] Test all components (modals, accordions, YouTube embeds, etc.)
- [ ] Check browser console for any errors
- [ ] Test analytics tracking (check Network tab for GTM events)

**↩️ Rollback Plan**
```bash
rm -f src/types/components/{base,analytics,dom}.ts
git checkout -- src/assets/js/types/index.ts src/types/components/index.ts
```

---

### Phase 1E: Update Imports and Cleanup (LOW RISK)

**✅ Pre-flight Checklist**
- [ ] Phase 1D completed successfully
- [ ] All components and analytics working

**🔧 Tasks**

1. Update imports in data files:
```typescript
// Update src/_data/global.ts
// Change: import type { SiteData } from './types'
// To: import type { SiteData } from '../types/data'

// Update src/_data/sections.ts  
// Change imports from './types' to '../types/sections'

// Update other _data files similarly
```

2. Update imports in assets/js files:
```typescript
// Update src/assets/js/app.ts
// Change: import type { ComponentRegistration } from '@/types/component'
// To: import type { ComponentRegistration } from '@/types/components'

// Update other component files similarly
```

3. Create path alias for easier imports (optional):
```typescript
// Update tsconfig.json paths:
{
  "compilerOptions": {
    "paths": {
      "@/types/*": ["src/types/*"],
      // ... existing paths
    }
  }
}
```

4. Test all imports work with new paths

5. Remove backward compatibility exports from `src/_data/types.ts`:
```typescript
// Remove the re-export lines added in previous phases
// Keep only types that haven't been moved yet
```

6. Clean up old type files (once all imports updated):
```bash
# Only after verifying everything works:
rm src/assets/js/types/component.ts
rm src/assets/js/types/analytics.ts  
rm src/assets/js/types/dom.ts
# Keep index.ts for now as it might have other exports
```

**🧪 Verification**
- [ ] `npm run type-check` passes with zero errors
- [ ] `npm run lint` passes  
- [ ] Site loads completely normally
- [ ] All interactive features work
- [ ] Analytics events fire correctly
- [ ] Forms submit properly
- [ ] All sections display correctly
- [ ] Performance is unchanged

**↩️ Rollback Plan**
```bash
git checkout -- src/_data/ src/assets/js/
# Restore deleted files if needed
git checkout HEAD~1 -- src/assets/js/types/
```

**📝 Notes**
- This phase requires the most careful testing
- Update imports gradually, testing after each file
- Keep backward compatibility until all imports are updated

---

## Phase 2: Component Architecture Unification

**Goal**: Organize components in a consistent structure

### Phase 2A: Create Unified Component Structure (ZERO RISK)

**✅ Pre-flight Checklist**
- [ ] Phase 1 completed successfully
- [ ] All type imports working correctly

**🔧 Tasks**

1. Create new component directory structure:
```bash
mkdir -p src/components/{ui,sections}
mkdir -p src/components/ui/{modal,accordion,youtube,analytics,animations}
```

2. Create index files:
```bash
touch src/components/index.ts
touch src/components/ui/index.ts
touch src/components/sections/index.ts
```

3. Add basic exports:
```typescript
// src/components/index.ts
export * from './ui';
export * from './sections';

// src/components/ui/index.ts
// UI components will be exported here

// src/components/sections/index.ts  
// Section components will be exported here
```

**🧪 Verification**
- [ ] New directories created
- [ ] `npm run type-check` still passes
- [ ] Site functionality unchanged

**↩️ Rollback Plan**
```bash
rm -rf src/components
```

---

### Phase 2B: Move UI Components (MEDIUM RISK)

**✅ Pre-flight Checklist**
- [ ] Phase 2A completed successfully
- [ ] New component structure exists

**🔧 Tasks**

1. Copy UI component files to new locations:
```bash
cp src/assets/js/components/modal.ts src/components/ui/modal/index.ts
cp src/assets/js/components/accordion.ts src/components/ui/accordion/index.ts
cp src/assets/js/components/youtube.ts src/components/ui/youtube/index.ts
# Continue for other UI components...
```

2. Update component exports:
```typescript
// src/components/ui/index.ts
export { PlatformModal } from './modal';
export { PlatformAccordion } from './accordion';
export { PlatformYouTube } from './youtube';
// Add other components...
```

3. Add backward compatibility:
```typescript
// Update src/assets/js/components/index.ts
// Re-export from new location
export * from '../../components/ui';

// Keep existing exports for now
export { PlatformModal } from './modal';
export { PlatformAccordion } from './accordion';  
// etc...
```

**🧪 Verification**
- [ ] `npm run type-check` passes
- [ ] Site loads normally
- [ ] Test each UI component:
  - [ ] Modal opens/closes correctly
  - [ ] Accordion expands/collapses
  - [ ] YouTube videos play
  - [ ] Analytics tracking works

**↩️ Rollback Plan**
```bash
rm -rf src/components/ui/*/
git checkout -- src/assets/js/components/index.ts
```

---

### Phase 2C: Move Section Components (HIGH RISK)

**✅ Pre-flight Checklist**
- [ ] Phase 2B completed successfully
- [ ] All UI components working

**🔧 Tasks**

1. Copy section components (one at a time):
```bash
# Start with a simple section like top-banner
cp -r src/_includes/sections/top-banner src/components/sections/
```

2. Update section imports in `src/assets/js/app.ts`:
```typescript
// Change from:
import { TopBanner } from '../../_includes/sections/top-banner/index';
// To:
import { TopBanner } from '@/components/sections/top-banner/index';
```

3. Test that section works, then continue with next section

4. Update template includes (if needed):
```html
<!-- In layout templates, update include paths -->
<!-- From: {% include "sections/hero/index.njk" %} -->
<!-- To: {% include "../../components/sections/hero/index.njk" %} -->
```

**⚠️ CRITICAL**: Do this ONE section at a time, testing thoroughly after each move.

**🧪 Verification After Each Section**
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] Section renders correctly on page
- [ ] Section interactions work (buttons, animations, etc.)
- [ ] Section analytics fire correctly

**↩️ Rollback Plan**
```bash
# Restore individual section:
rm -rf src/components/sections/[section-name]
git checkout -- src/assets/js/app.ts src/_includes/sections/[section-name]
```

**📝 Notes**
- This is the highest risk phase
- Move sections one by one
- Test thoroughly after each move
- Consider doing this phase in multiple sub-phases

---

## Phase 3: Asset Management Simplification

### Phase 3A: Consolidate Asset Directories (MEDIUM RISK)

**✅ Pre-flight Checklist**
- [ ] Phase 2 completed successfully
- [ ] All components working in new locations

**🔧 Tasks**

1. Audit current asset structure:
```bash
find src/assets -type f
find src/public -type f
# Compare and identify duplicates
```

2. Create unified asset structure:
```bash
mkdir -p src/assets/static/{fonts,images,icons}
```

3. Move static assets:
```bash
# Move fonts (keeping only one copy)
mv src/public/fonts/* src/assets/static/fonts/
# Remove duplicates in src/assets/fonts if any

# Move images
mv src/assets/images/* src/assets/static/images/
```

4. Update build configuration:
```javascript
// Update vite.config.ts to handle new asset paths
// Ensure static assets are copied to build output
```

**🧪 Verification**
- [ ] `npm run build` succeeds
- [ ] All fonts load correctly
- [ ] All images display properly
- [ ] Favicons work
- [ ] Site performance unchanged

**↩️ Rollback Plan**
```bash
rm -rf src/assets/static
git checkout -- src/public/ src/assets/ vite.config.ts
```

---

### Phase 3B: Update Build Configuration (LOW RISK)

**✅ Pre-flight Checklist**
- [ ] Phase 3A completed successfully
- [ ] Build output includes all assets

**🔧 Tasks**

1. Update Eleventy configuration:
```typescript
// Update .eleventy.ts to handle new asset paths
// Ensure proper passthrough copy settings
```

2. Update Vite configuration:
```typescript
// Update vite.config.ts for optimized asset handling
// Configure asset optimization settings
```

3. Test build output:
```bash
npm run build
# Check _site directory contains all required assets
```

4. Clean up old configurations:
```bash
# Remove any old build configurations if needed
```

**🧪 Verification**
- [ ] `npm run build` creates complete output
- [ ] `npm run preview` serves correctly
- [ ] All assets load in production build
- [ ] Performance remains optimal
- [ ] Lighthouse scores unchanged

**↩️ Rollback Plan**
```bash
git checkout -- .eleventy.ts vite.config.ts
```

---

## Completion Checklist

After completing all phases:

### Final Verification
- [ ] `npm run type-check` passes with zero errors
- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run build` succeeds
- [ ] `npm run preview` serves working site
- [ ] All interactive features work
- [ ] All sections display correctly
- [ ] Analytics tracking functional
- [ ] Performance benchmarks met
- [ ] Lighthouse scores maintained

### Cleanup
- [ ] Remove old type files (if all imports updated)
- [ ] Remove temporary backward compatibility exports
- [ ] Update documentation to reflect new structure
- [ ] Delete unused files and directories

### Documentation
- [ ] Update CLAUDE.md with new file patterns
- [ ] Update architecture-overview.md with new structure
- [ ] Create migration notes for future developers

---

## Emergency Contacts & Resources

- **Immediate Help**: Check git history and recent commits
- **TypeScript Issues**: Verify import paths and type definitions
- **Build Issues**: Check Vite and Eleventy configurations
- **Component Issues**: Verify component registration in app.ts

Remember: **One phase at a time, test thoroughly, commit often!**