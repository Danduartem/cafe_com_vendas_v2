# Development Guide — Café com Vendas

Complete guide to file structure, testing strategy, and deployment workflows.

---

## 🏗️ Architecture Overview

### JAMstack System (JavaScript, APIs, Markup)
- **Static Generation**: Eleventy 3.x (pre-rendered HTML)
- **Build Optimization**: Vite 7.x (CSS processing & bundling)
- **Serverless Functions**: Netlify Functions
- **External APIs**: Stripe, MailerLite, Cloudinary
- **CDN Distribution**: Netlify Edge Network

### Core Principles
1. **Performance First**: Static generation, edge caching, optimal bundling
2. **Type Safety**: 100% TypeScript, strict mode, build-time validation
3. **Developer Experience**: Hot reload, comprehensive testing, quality gates
4. **Business Continuity**: Payment redundancy, analytics reliability, graceful degradation

---

## 📁 File Structure & Architecture

### Content Management
```
src/_data/
├── sections/           # Section content (JSON)
│   ├── hero.json       # Event details, pricing
│   ├── about.json      # Presenter bio
│   ├── problem.json    # Problem statement
│   ├── solution.json   # Solution presentation
│   ├── offer.json      # Pricing & benefits
│   ├── faq.json        # Questions & answers
│   └── ...
├── site.ts             # Site metadata, base price
├── pages.ts            # Page configurations
├── sections.ts         # Section exports
└── types.ts            # Shared interfaces
```

### Section Architecture (Consistent Pattern)
```
src/_includes/sections/{section}/
├── index.njk           # Nunjucks template (HTML structure)
└── index.ts            # TypeScript logic (interactivity)
```

**Available Sections**:
- `hero` - Landing section with event details
- `problem` - Problem statement  
- `solution` - Solution presentation
- `about` - Presenter bio
- `social-proof` - Testimonials/videos
- `offer` - Pricing and benefits
- `faq` - Frequently asked questions
- `final-cta` - Closing call-to-action
- `checkout` - Payment modal (TS only)

### UI Components
```
src/components/ui/
├── index.ts            # Component exports
├── accordion/          # FAQ accordion (PlatformAccordion)
├── analytics/          # GTM integration (PlatformAnalytics)
├── animations/         # Intersection observers (Animations)
└── thank-you/          # Thank you page logic (PlatformThankYou)
```

### Core Utilities
```
src/assets/js/
├── config/
│   ├── constants.ts    # App constants, analytics events
│   └── environment.ts  # Environment configuration
├── core/
│   ├── analytics.ts    # Comprehensive analytics & performance
│   └── state.ts        # State management
├── utils/
│   ├── gtm-normalizer.ts # Analytics event formatting
│   ├── scroll-tracker.ts # Scroll position tracking
│   ├── throttle.ts      # Performance utilities
│   └── index.ts         # Utility exports
├── app.ts              # Application initialization
└── main.ts             # Main entry point
```

### Serverless Functions
```
netlify/functions/
├── create-payment-intent.ts  # Initialize Stripe payment
├── stripe-webhook.ts         # Handle payment confirmation
├── mailerlite-lead.ts        # Add lead to email list
├── mailerlite-helpers.ts     # MailerLite utilities
├── types.ts                  # Shared function types
└── types/mailerlite-api.ts   # MailerLite API definitions
```

---

## 🧪 Testing Strategy

### Testing Pyramid
```
   🔺 E2E Tests (Playwright)
     - Complete user journeys
     - Payment flows
     - Cross-browser validation
   
  🔹 Integration Tests (Vitest)
    - Component interactions
    - API integrations
    - Data flow validation
  
 🔷 Unit Tests (Vitest)
   - Pure functions
   - Utilities
   - Business logic
```

### Test Coverage Goals
- **Unit Tests**: ≥ 80% line coverage
- **Integration Tests**: All critical paths
- **E2E Tests**: Complete user journeys
- **Performance Tests**: Core Web Vitals monitoring

### Test Structure
```
tests/
├── setup.ts                    # Global test configuration
├── unit/                       # Unit tests (Vitest)
│   ├── functions/              # Serverless function tests
│   │   ├── mailerlite-api.test.ts
│   │   └── mailerlite-helpers.test.ts
│   └── render/
│       └── landing-composition.test.ts
├── integration/                # Integration tests
│   └── mailerlite-api.test.ts
├── e2e/                       # End-to-end tests (Playwright)
│   ├── mailerlite-flow.test.ts
│   ├── multibanco-complete-flow.test.ts
│   └── user-journey.test.ts
└── utils/
    └── section-loader.ts       # Test utilities
```

### Running Tests
```bash
# Unit & integration tests
npm test                        # Run all tests
npm test -- --coverage         # With coverage report
npm test -- --watch           # Watch mode

# E2E tests
npm run test:e2e               # Run Playwright tests
npm run test:e2e:report        # View test results
```

---

## 🚀 Deployment Workflow

### Pre-Deployment Checklist

#### 1. Code Quality Gates (Must Pass)
```bash
npm run type-check             # TypeScript validation
npm run lint                   # ESLint rules
npm test                       # Vitest unit tests
```

**Zero Tolerance For**:
- TypeScript errors
- ESLint failures
- Failing unit tests
- Broken build process

#### 2. Integration Testing
```bash
# E2E tests with Playwright
npm run test:e2e

# Manual critical path verification:
# ✓ Homepage loads correctly
# ✓ All sections render properly  
# ✓ Checkout modal opens
# ✓ Payment flow with test cards
# ✓ Analytics events fire correctly
```

#### 3. Performance Validation
```bash
# Production build test
npm run build && npm run preview

# Lighthouse audit
npm run lighthouse -- http://localhost:4173
```

**Performance Requirements**:
- Lighthouse Performance: ≥ 90 (mobile)
- Lighthouse Accessibility: ≥ 95
- Build size: < 1MB total
- First Contentful Paint: < 2s

### Production Deployment (Netlify)

#### Environment Variables
Set in **Netlify Dashboard** → Site Settings → Environment Variables:

```bash
# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# MailerLite (Production)
MAILERLITE_API_KEY=eyJ0eXAi...

# Analytics & CDN
VITE_GTM_CONTAINER_ID=GTM-T63QRLFT
VITE_CLOUDINARY_CLOUD_NAME=ds4dhbneq
```

#### Build Configuration
**File**: `netlify.toml`
```toml
[context.production]
  command = "npm ci --include=dev && npm run build"
  
  [context.production.environment]
    NODE_ENV = "production"
    ELEVENTY_ENV = "production" 
    NODE_VERSION = "22.17.1"
```

#### Deployment Process
```bash
# Automatic deployment (recommended)
git checkout main
git pull origin main
git push origin main    # Triggers production deploy

# Manual deployment via Netlify CLI
netlify build
netlify deploy --prod
```

---

## 🔧 Development Conventions

### File Naming
- **TypeScript**: `.ts` extension for source files
- **Imports**: `.js` extension for local imports (ESM output)
- **Components**: `index.ts` in component folders
- **Data**: `.json` or `.ts` in `_data` folder

### Import Rules (Critical)
**Always use path aliases with `.js` extensions** for ESM compliance:

```typescript
// ✅ Correct (path aliases + ESM extensions)
import { initCheckout } from '@sections/checkout/index.js';
import { PlatformAccordion } from '@components/ui/index.js';
import { siteData } from '@data/site.js';
import { throttle } from '@utils/throttle.js';
import type { BaseComponent } from '@app-types/components/base.js';

// ❌ Wrong (relative imports, missing extensions, .ts extensions)
import { initCheckout } from './checkout/index.ts';
import { siteData } from '../../../_data/site';
import { throttle } from '../../../utils/throttle';
```

**Available Path Aliases**:
- `@/` → `src/assets/js/` (core utilities)
- `@components/` → `src/components/`
- `@sections/` → `src/_includes/sections/`
- `@utils/` → `src/utils/`
- `@data/` → `src/_data/`
- `@app-types/` → `src/types/`
- `@test-mocks/` → `tests/mocks/`
- `@styles/` → `src/assets/css/`

### CSS & Styling
- **Framework**: Tailwind CSS v4 (CSS-first configuration)
- **Entry Point**: `src/assets/css/main.css`
- **Design Tokens**: `@theme` directive for variables
- **Utility-first**: All styles via Tailwind classes
- **No inline styles**: Keep styles in CSS/classes only

### Payment Flow Architecture
```
1. User clicks checkout → create-payment-intent function
2. Stripe processes payment
3. Webhook confirms → stripe-webhook function  
4. Analytics fires payment_completed event
5. GTM maps to GA4 purchase event
```

---

## 📊 Analytics Integration

### Event Flow
```
JavaScript Code → window.dataLayer → GTM → GA4 + other platforms
```

### Key Events (Revenue Critical)
```javascript
// Payment completion
window.dataLayer.push({
  event: 'payment_completed',
  transaction_id: 'pi_abc123...',
  value: 180,
  currency: 'EUR'
});

// Lead generation  
window.dataLayer.push({
  event: 'lead_generated',
  email: 'user@example.com',
  source_section: 'hero'
});
```

### Implementation Files
- **Event Definitions**: `src/assets/js/config/constants.ts`
- **Platform Analytics**: `src/components/ui/analytics/index.ts` (simple tracking)
- **Core Analytics**: `src/assets/js/core/analytics.ts` (comprehensive + performance)
- **Event Normalization**: `src/assets/js/utils/gtm-normalizer.ts`

---

## 🛠 Development Commands

### Development Servers
```bash
npm run dev                    # Eleventy dev server (port 8080)
npm run netlify:dev            # With serverless functions (port 8888)
npm run netlify:dev:chrome     # Auto-opens Chrome
```

### Build & Preview
```bash
npm run build                  # Production build
npm run preview                # Serve production build
```

### Quality Assurance
```bash
npm run type-check             # TypeScript validation
npm run lint                   # ESLint validation
npm test                       # Unit tests
npm run verify-apis            # API compatibility check
npm run lighthouse             # Performance audit
```

### Testing
```bash
npm run test:e2e               # Playwright E2E tests
npm run test:e2e:report        # View E2E results
```

---

*Updated: 2025-08-30 | Consolidated from multiple technical documentation files*