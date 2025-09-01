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
├── animations/         # Intersection observers (Animations)
└── thank-you/          # Thank you page logic (PlatformThankYou)
```

### Modern Analytics System
```
src/analytics/
├── core/
│   └── analytics.ts    # Plugin-based analytics engine
├── plugins/            # Specialized analytics plugins
│   ├── gtm.ts         # Google Tag Manager integration
│   ├── performance.ts  # Core Web Vitals & performance monitoring
│   ├── section-tracking.ts # IntersectionObserver section tracking
│   ├── scroll-tracking.ts  # Scroll depth events
│   └── error.ts        # Error tracking with deduplication
├── types/
│   ├── index.ts        # Plugin interfaces & types
│   └── events.ts       # Event type definitions
└── index.ts            # Unified API & AnalyticsHelpers
```

### Core Utilities
```
src/assets/js/
├── config/
│   ├── constants.ts    # App constants, configuration
│   └── environment.ts  # Environment configuration
├── core/
│   └── state.ts        # State management
├── utils/
│   ├── gtm-normalizer.ts # Analytics event formatting
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
└── types.ts                  # Shared function types
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
│   │   └── mailerlite-helpers.test.ts
│   └── render/
│       └── landing-composition.test.ts
├── integration/                # Integration tests
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
**Ultra-Simple Import Standard (2025)** - Two rules only:

```typescript
// ✅ Correct (Ultra-Simple Standard)
// Rule 1: External packages - no extension
import { describe, test, expect } from 'vitest';
import { loadStripe } from '@stripe/stripe-js';

// Rule 2: All internal files - relative paths with .js extensions
import { initCheckout } from '../../_includes/sections/checkout/index.js';
import { PlatformAccordion } from '../../../components/ui/index.js';
import { siteData } from '../../../_data/site.js';
import { throttle } from '../../../utils/throttle.js';
import type { BaseComponent } from '../../../types/components/base.js';

// ❌ Wrong (path aliases, missing extensions, .ts extensions)
import { initCheckout } from '@sections/checkout/index.js';
import { siteData } from '../../../_data/site';
import { throttle } from '../../../utils/throttle.ts';
```

**Benefits of Ultra-Simple Standard**:
- ✅ **Zero Mental Overhead**: Only 2 rules to remember
- ✅ **Universal Compatibility**: Works across all bundlers and Node.js
- ✅ **Explicit Dependencies**: Clear file relationships in imports
- ✅ **Future Proof**: No path alias configuration dependencies
- ✅ **Editor Support**: Perfect IntelliSense and go-to-definition

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

## 📊 Modern Analytics System

### Plugin-Based Architecture
The analytics system uses a modern plugin-based architecture inspired by industry best practices, providing:

- **Unified API**: Single initialization with `AnalyticsHelpers` for common patterns
- **Specialized Plugins**: Each concern handled by a focused plugin
- **Type Safety**: Full TypeScript support with event type definitions
- **Performance**: Optimized initialization and memory usage
- **Extensibility**: Easy to add new plugins or modify behavior

### Event Flow
```
JavaScript Code → Analytics Plugin → window.dataLayer → GTM → GA4 + other platforms
```

### Core Plugins

1. **GTM Plugin** (`src/analytics/plugins/gtm.ts`)
   - Google Tag Manager integration
   - Event normalization and validation
   - GA4-compliant event structure

2. **Performance Plugin** (`src/analytics/plugins/performance.ts`)
   - Core Web Vitals tracking (LCP, FID, CLS, INP)
   - Page load performance monitoring
   - Smart batching to reduce overhead

3. **Section Tracking Plugin** (`src/analytics/plugins/section-tracking.ts`)
   - IntersectionObserver-based section visibility
   - One-time section view events
   - Configurable visibility thresholds

4. **Error Plugin** (`src/analytics/plugins/error.ts`)
   - Global error handling setup
   - Error deduplication
   - Context-rich error reporting

5. **Scroll Tracking Plugin** (`src/analytics/plugins/scroll-tracking.ts`)
   - Scroll depth milestone tracking
   - Throttled for performance
   - Configurable thresholds

### Key Events (Revenue Critical)
```javascript
// Payment completion (via AnalyticsHelpers)
AnalyticsHelpers.trackConversion('payment_completed', {
  transaction_id: 'pi_abc123...',
  value: 180,
  currency: 'EUR'
});

// Lead generation (via AnalyticsHelpers)
AnalyticsHelpers.trackConversion('lead_generated', {
  email: 'user@example.com',
  source_section: 'hero'
});

// Section tracking (automatic)
AnalyticsHelpers.initSectionTracking('hero');
```

### Implementation Files
- **Main API**: `src/analytics/index.ts` (AnalyticsHelpers & initialization)
- **Plugin Engine**: `src/analytics/core/analytics.ts`
- **Event Types**: `src/analytics/types/events.ts`
- **Plugin Interfaces**: `src/analytics/types/index.ts`
- **Event Normalization**: `src/assets/js/utils/gtm-normalizer.ts`

### Analytics Initialization

The analytics system is initialized automatically in the main application (`src/assets/js/app.ts`):

```typescript
import { initializeAnalytics, AnalyticsHelpers } from '../../analytics/index.js';

// Automatic initialization during app startup
export const CafeComVendas = {
  async init() {
    // Initialize unified analytics system with all plugins
    await initializeAnalytics();
    
    // Analytics is now available globally
    // window.analytics contains the plugin instance
    // AnalyticsHelpers provides convenient wrapper methods
  }
}
```

### Common Usage Patterns

**Section Tracking** (most common):
```typescript
// In section component init() method
AnalyticsHelpers.initSectionTracking('hero');
// Automatically tracks when section becomes visible
```

**CTA Tracking**:
```typescript
// Button click handlers
AnalyticsHelpers.trackCTAClick('hero', {
  button_text: 'Reserve My Spot',
  button_location: 'above_fold'
});
```

**Error Tracking**:
```typescript
// Error boundaries or catch blocks
AnalyticsHelpers.trackError('payment_failed', error, {
  user_email: 'user@example.com',
  payment_amount: 180
});
```

**Advanced Plugin Usage**:
```typescript
// Direct plugin access for custom needs
const analytics = (window as any).analytics;
const performancePlugin = analytics.getPlugin('performance');
if (performancePlugin?.methods) {
  performancePlugin.methods.trackCustomMetric('checkout_time', 1250);
}
```

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
npm run lighthouse             # Performance audit
```

### Testing
```bash
npm run test:e2e               # Playwright E2E tests
npm run test:e2e:report        # View E2E results
```

---

*Updated: 2025-08-30 | Consolidated from multiple technical documentation files*