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
├── site.ts             # Site metadata, centralized pricing (single source of truth)
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

### Admin Dashboard System
```
src/admin/
└── dashboard/
    └── index.ts        # Admin dashboard interface and functionality
```

**Admin Dashboard Features**:
- **Real-time Metrics**: Live event registration and payment status monitoring
- **Performance Monitoring**: Core Web Vitals and system health visualization  
- **Attendee Management**: Registration tracking and capacity monitoring
- **Analytics Overview**: Consolidated view of conversion metrics and user behavior
- **System Health**: Status monitoring for all critical systems and functions
- **Access Control**: Environment-based authentication with secure token validation

### Advanced Analytics System (Plugin-Based Architecture)
```
src/analytics/
├── core/
│   └── analytics.ts    # Sophisticated plugin-based analytics engine
├── plugins/            # Specialized analytics plugins
│   ├── gtm.ts         # Google Tag Manager integration & event normalization
│   ├── performance.ts  # Core Web Vitals & performance monitoring
│   ├── section-tracking.ts # IntersectionObserver section tracking
│   ├── scroll-tracking.ts  # Scroll depth milestone tracking
│   └── error.ts        # Error tracking with deduplication & context
├── types/
│   ├── index.ts        # Plugin interfaces & comprehensive types
│   └── events.ts       # Event type definitions & schemas
├── utils/
│   └── debug.ts        # Debug utilities and logging helpers
└── index.ts            # Unified API & AnalyticsHelpers interface
```

#### Analytics Architecture Deep Dive

**Plugin System Design**:
- **Modular Architecture**: Each plugin handles a specific analytics concern
- **Plugin Interface**: Consistent interface for all plugins with `init()`, `methods`, and `config`
- **Event Bus**: Central event bus for plugin communication
- **Lazy Loading**: Plugins are loaded and initialized on-demand
- **Error Isolation**: Plugin failures don't affect other plugins or core functionality

**Core Plugin Details**:

1. **GTM Plugin** (`src/analytics/plugins/gtm.ts`)
   - **Purpose**: Google Tag Manager integration with event normalization
   - **Features**: GA4-compliant event structure, automatic event validation
   - **Methods**: `track()`, `page()`, `trackConversion()`, `trackCTAClick()`, `trackFAQ()`
   - **Event Normalization**: Converts internal events to GTM/GA4 format

2. **Performance Plugin** (`src/analytics/plugins/performance.ts`)
   - **Purpose**: Core Web Vitals and performance monitoring
   - **Metrics**: LCP, FID, CLS, INP, page load times
   - **Features**: Smart batching, performance budgets, threshold alerts
   - **Integration**: Automatic metrics collection with `web-vitals` library

3. **Section Tracking Plugin** (`src/analytics/plugins/section-tracking.ts`)
   - **Purpose**: IntersectionObserver-based section visibility tracking
   - **Features**: One-time view events, configurable thresholds, viewport detection
   - **Methods**: `initSectionTracking()`, `trackSectionEngagement()`
   - **Performance**: Optimized IntersectionObserver usage with throttling

4. **Error Plugin** (`src/analytics/plugins/error.ts`)
   - **Purpose**: Global error handling and tracking
   - **Features**: Error deduplication, context enrichment, stack trace processing
   - **Methods**: `trackError()`, `setupGlobalErrorHandling()`
   - **Context**: Captures user environment, component state, and action context

5. **Scroll Tracking Plugin** (`src/analytics/plugins/scroll-tracking.ts`)
   - **Purpose**: Scroll depth milestone tracking
   - **Features**: Configurable thresholds, throttled events, engagement scoring
   - **Thresholds**: Default milestones at 10%, 25%, 50%, 75%, 90%
   - **Performance**: Throttled scroll event handling

### Core Utilities & Enhanced Systems
```
src/assets/js/
├── config/
│   ├── constants.ts    # App constants, configuration
│   └── environment.ts  # Environment configuration
├── core/
│   └── state.ts        # State management with enhanced tracking
├── utils/
│   ├── gtm-normalizer.ts # Analytics event formatting & normalization
│   ├── throttle.ts      # Performance utilities
│   └── index.ts         # Utility exports
├── app.ts              # Enhanced application initialization with analytics
└── main.ts             # Main entry point
```

### Enhanced Utility Functions
```
src/utils/
├── browser-data.ts     # Advanced browser data collection & attribution
├── event-tracking.ts   # Event tracking utilities & helpers
├── monitoring.ts       # Performance monitoring & observability  
├── youtube.ts          # YouTube API integration & video tracking
├── validation.ts       # Form validation & data validation utilities
├── calendar.ts         # Calendar integration utilities
├── dom.ts             # DOM manipulation utilities
└── logger.ts          # Enhanced logging with structured output
```

**Enhanced Utility Features**:
- **Browser Data Collection** (`browser-data.ts`): Advanced attribution tracking, user environment detection, behavior analysis
- **Event Tracking** (`event-tracking.ts`): Sophisticated event tracking with context enrichment and validation
- **Performance Monitoring** (`monitoring.ts`): Real-time performance monitoring, Core Web Vitals tracking, custom metrics
- **YouTube Integration** (`youtube.ts`): YouTube API integration for video tracking and engagement analytics
- **Validation** (`validation.ts`): Comprehensive form and data validation with type safety
- **Enhanced Logging** (`logger.ts`): Structured logging with different levels and enhanced context

### Advanced Serverless Functions (13 Total)
```
netlify/functions/
├── create-payment-intent.ts   # Enhanced Stripe payment initialization
├── stripe-webhook.ts          # Payment confirmation with CRM integration
├── mailerlite-lead.ts         # Lead capture with behavioral tracking
├── mailerlite-helpers.ts      # MailerLite API utilities and helpers
├── crm-integration.ts         # Advanced CRM system integration
├── crm-types.ts              # CRM type definitions and interfaces
├── server-gtm.ts             # Server-side Google Tag Manager
├── metrics-collection.ts      # Performance metrics collection
├── health-check.ts           # System health monitoring
├── dlq-handler.ts            # Dead letter queue processing
├── pii-hash.ts              # Privacy-compliant data hashing
├── shared-utils.ts           # Common function utilities
└── types.ts                  # Shared function type definitions
```

#### Function Categories & Purposes

**Payment & Commerce Functions**:
- **`create-payment-intent.ts`**: Enhanced Stripe payment initialization with metadata tracking, attribution data, and behavioral context
- **`stripe-webhook.ts`**: Payment confirmation with CRM integration, server-side conversion tracking, and fulfillment automation

**CRM & Lead Management Functions**:
- **`mailerlite-lead.ts`**: Lead capture with enhanced behavioral tracking, attribution data, and automatic segmentation
- **`mailerlite-helpers.ts`**: MailerLite API utilities, error handling, and data transformation helpers
- **`crm-integration.ts`**: Advanced CRM system integration with data synchronization, lead scoring, and automated workflows
- **`crm-types.ts`**: Comprehensive TypeScript type definitions for CRM integration and data structures

**Analytics & Monitoring Functions**:
- **`server-gtm.ts`**: Server-side Google Tag Manager integration for accurate conversion tracking and event forwarding
- **`metrics-collection.ts`**: Performance metrics collection, Core Web Vitals tracking, and custom performance reporting
- **`health-check.ts`**: System health monitoring, uptime tracking, and automated alerting

**Infrastructure & Utility Functions**:
- **`dlq-handler.ts`**: Dead letter queue processing for failed operations, retry logic, and error recovery
- **`pii-hash.ts`**: Privacy-compliant data hashing for sensitive information, GDPR compliance, and data anonymization
- **`shared-utils.ts`**: Common utilities shared across functions including validation, formatting, and helper functions
- **`types.ts`**: Shared TypeScript type definitions for all functions, ensuring type safety across the entire serverless architecture

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

## 📊 Advanced Analytics System

### Enterprise-Grade Plugin Architecture
The analytics system uses a sophisticated plugin-based architecture inspired by enterprise platforms like Segment, providing:

- **Unified API**: Single initialization with `AnalyticsHelpers` for common patterns and enterprise-grade event management
- **Specialized Plugins**: Each concern handled by a focused, independently tested plugin
- **Type Safety**: Full TypeScript support with comprehensive event type definitions and validation
- **Performance**: Optimized initialization, memory usage, and event batching with smart throttling
- **Extensibility**: Easy to add new plugins, modify behavior, and integrate with new platforms
- **Error Isolation**: Plugin failures don't affect other plugins or core functionality
- **Debug Mode**: Comprehensive logging and debugging tools for development and production

### Enhanced Event Flow
```
Component/User Action → AnalyticsHelpers → Plugin System → Event Bus → Multiple Destinations
                                        ↓
                      GTM Plugin → dataLayer → GTM → GA4/Multiple Platforms
                                        ↓
                     Performance Plugin → Core Web Vitals → Custom Dashboards
                                        ↓
                         Error Plugin → Error Tracking → Alerting Systems
```

### Analytics System Implementation

**Automatic Initialization with Enhanced Error Handling**:
```typescript
// In src/assets/js/app.ts - enterprise-grade initialization
import { initializeAnalytics, AnalyticsHelpers } from '../../analytics/index.js';

export const CafeComVendas = {
  async init() {
    try {
      // Initialize sophisticated analytics system with all plugins
      await initializeAnalytics();
      
      // Global analytics instance with type safety
      // window.analytics - for debugging and direct plugin access
      // AnalyticsHelpers - for common usage patterns
      
      // Track application initialization with enhanced context
      analytics.track('app_initialized', {
        event_category: 'Application',
        components_count: this.getComponentCount(),
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      // Graceful fallback if analytics fails
      AnalyticsHelpers.trackError('analytics_initialization_failed', error as Error);
      console.error('[Analytics] Failed to initialize:', error);
    }
  }
}
```

### Comprehensive Usage Patterns

**Revenue-Critical Conversion Tracking**:
```typescript
// Enhanced payment completion tracking with attribution
AnalyticsHelpers.trackConversion('payment_completed', {
  transaction_id: 'pi_abc123...',
  value: 180,
  currency: 'EUR',
  items: [{ item_id: 'SKU_CCV_PT_2025', quantity: 1 }],
  pricing_tier: 'early_bird',
  attribution_data: getAttributionData(),
  user_context: getUserEnvironment()
});

// Enhanced lead generation with behavioral context
AnalyticsHelpers.trackConversion('lead_generated', {
  email: 'user@example.com',
  source_section: 'hero',
  lead_score: calculateLeadScore(),
  attribution: getAttributionData(),
  engagement_data: getBehaviorData()
});
```

**Automated Section Visibility Tracking**:
```typescript
// In section component init() method - automatically tracks visibility
AnalyticsHelpers.initSectionTracking('hero', 0.5); // 50% visibility threshold
// Fires section_viewed event when section becomes visible
```

**Enhanced CTA and Interaction Tracking**:
```typescript
// Button click tracking with enhanced context
AnalyticsHelpers.trackCTAClick('hero', {
  button_text: 'Reserve My Spot',
  button_location: 'above_fold',
  click_timestamp: new Date().toISOString(),
  user_session_data: getSessionData()
});

// FAQ interaction tracking with engagement scoring
AnalyticsHelpers.trackFAQ('1', true, 'How much does it cost?');

// Video engagement tracking
AnalyticsHelpers.trackVideoProgress('Testimonial Video', 50, {
  video_duration: 120,
  viewer_behavior: getViewerBehavior()
});

// WhatsApp click tracking (automatic via global click handlers)
AnalyticsHelpers.trackWhatsAppClick(linkUrl, linkText, location, {
  attribution_data: getAttributionData()
});
```

**Advanced Error Tracking with Context**:
```typescript
// Error tracking with rich context for debugging
AnalyticsHelpers.trackError('payment_failed', error, {
  user_email: 'user@example.com',
  payment_amount: 180,
  stripe_error_type: error.type,
  browser_data: getUserEnvironment(),
  component_state: getComponentState()
});
```

**Direct Plugin Access for Advanced Use Cases**:
```typescript
// Advanced plugin access for custom requirements
const analytics = (window as any).analytics;

// Performance metrics with custom tracking
const performancePlugin = analytics.getPlugin('performance');
if (performancePlugin?.methods) {
  performancePlugin.methods.trackCustomMetric('checkout_time', 1250);
  performancePlugin.methods.trackCustomMetric('form_completion_time', 850);
}

// Section tracking with custom configuration
const sectionPlugin = analytics.getPlugin('section-tracking');
if (sectionPlugin?.methods) {
  sectionPlugin.methods.trackSectionEngagement('hero', 'video_play');
}
```

### Enhanced Implementation Files
- **Main API & Helpers**: `src/analytics/index.ts` (AnalyticsHelpers & initializeAnalytics)
- **Plugin Engine**: `src/analytics/core/analytics.ts` (sophisticated plugin management system)
- **Event Types & Schemas**: `src/analytics/types/events.ts` (comprehensive event definitions)
- **Plugin Interfaces**: `src/analytics/types/index.ts` (plugin system interfaces)
- **GTM Event Normalization**: `src/assets/js/utils/gtm-normalizer.ts` (GA4 compliance)
- **Debug Utilities**: `src/analytics/utils/debug.ts` (development and production debugging)
- **Enhanced Tracking Utilities**: `src/utils/event-tracking.ts`, `src/utils/browser-data.ts`

### Performance Optimizations
- **Smart Event Batching**: Events are batched and sent efficiently to reduce network overhead
- **Throttled Tracking**: Scroll and performance events are throttled to prevent excessive firing
- **Lazy Plugin Loading**: Plugins are loaded only when needed
- **Memory Management**: Automatic cleanup of event listeners and observers
- **Error Resilience**: Plugin failures are isolated and don't affect other functionality

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