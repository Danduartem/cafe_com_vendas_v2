# Setup & Configuration — Café com Vendas

Complete setup guide for development, testing, and deployment.

---

## Prerequisites

- **Node.js**: 22.17.1+ (required, enforced by `engines`)
- **npm**: 10.0.0+ (required)
- **Git**: For version control

## Environment Variables

### Required (.env)
```bash
# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key  
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Marketing
MAILERLITE_API_KEY=your_api_key

# Analytics (Production ID)
VITE_GTM_CONTAINER_ID=GTM-T63QRLFT

# Admin Dashboard (Optional)
ADMIN_ACCESS_TOKEN=your_secure_token
ADMIN_DASHBOARD_PASSWORD=your_secure_password

# Advanced Monitoring (Optional)
METRICS_COLLECTION_ENABLED=true
HEALTH_CHECK_ENABLED=true
```

### Optional
```bash
# CDN (defaults provided)
VITE_CLOUDINARY_CLOUD_NAME=ds4dhbneq  # Image CDN

# Backup form handler
VITE_FORMSPREE_FORM_ID=xanbnrvp      # Fallback contact form
```

### Files
- **`.env`** - Local development
- **`.env.example`** - Template with all variables
- **`.env.test`** - Test environment
- **Netlify Dashboard** - Production variables

---

## Development Workflow

### 1. Initial Setup
```bash
# Clone and install
git clone <repo>
cd cafe-com-vendas-v2
npm install

# Configure environment
cp .env.example .env
# Edit .env with your keys
```

### 2. Development Servers
```bash
# Recommended: Vite watch + Eleventy (hashed assets resolved via manifest)
npm run dev:watch           # http://localhost:8080

# Content-only (Eleventy)
npm run dev                 # http://localhost:8080

# With Netlify Functions (payments, emails)
npm run netlify:dev         # http://localhost:8888
```

### 3. Code Quality Checks
```bash
# Run all checks (required before commit)
npm run type-check   # TypeScript validation
npm run lint         # ESLint rules
npm test             # Vitest unit tests

# E2E Testing (requires Playwright browsers)
npx playwright install  # Install browsers (first time only)
npm run test:e2e         # Run E2E tests
npm run test:e2e:report  # View test results

# Single command for all checks
npm run type-check && npm run lint && npm test
```

---

## Third-Party Integrations

### Advanced Analytics System (Plugin-Based Architecture)
- **Container ID**: `GTM-T63QRLFT`
- **Implementation**: `src/analytics/` (sophisticated plugin-based system)
- **Architecture**: Plugin-based engine with specialized modules for different concerns
- **Event Flow**: AnalyticsHelpers → Plugin System → `window.dataLayer` → GTM → GA4/other platforms

#### Plugin System Overview
The analytics system uses a modern plugin architecture with these core plugins:

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

#### Initialization & Usage
**Automatic Initialization**:
```javascript
// In src/assets/js/app.ts - automatically called during app startup
import { initializeAnalytics, AnalyticsHelpers } from '../../analytics/index.js';
await initializeAnalytics();
```

**Common Usage Patterns**:
```javascript
// Import the unified analytics system
import { AnalyticsHelpers } from '../analytics/index.js';

// Payment completion (revenue critical)
AnalyticsHelpers.trackConversion('payment_completed', {
  transaction_id: 'pi_abc123...',
  value: 180,
  currency: 'EUR'
});

// Lead generation tracking
AnalyticsHelpers.trackConversion('lead_generated', {
  email: 'user@example.com',
  source_section: 'hero'
});

// Section visibility tracking (automatic)
AnalyticsHelpers.initSectionTracking('hero');

// CTA click tracking
AnalyticsHelpers.trackCTAClick('hero', {
  button_text: 'Reserve My Spot',
  button_location: 'above_fold'
});

// Error tracking with context
AnalyticsHelpers.trackError('payment_failed', error, {
  user_email: 'user@example.com',
  payment_amount: 180
});

// FAQ interaction tracking
AnalyticsHelpers.trackFAQ('1', true, 'How much does it cost?');

// Video progress tracking  
AnalyticsHelpers.trackVideoProgress('Testimonial Video', 50);

// WhatsApp click tracking (automatic)
AnalyticsHelpers.trackWhatsAppClick(linkUrl, linkText, location);
```

#### Testing & Debugging
- **Global Analytics Instance**: `window.analytics` (for debugging and direct plugin access)
- **Data Layer**: `window.dataLayer` (events flow through GTM plugin)
- **Plugin Access**: `window.analytics.getPlugin('pluginName')` for direct plugin methods
- **GTM Preview Mode**: For debugging event flow to GTM
- **GA4 Debug View**: For validating final GA4 events
- **Debug Mode**: Set `ENV.isDevelopment = true` for comprehensive logging

### Stripe Payments (Enhanced Integration)
- **Mode**: Test mode for development
- **Integration**: 
  - Client: `@stripe/stripe-js` in checkout modal
  - Server: Advanced Netlify Functions with enhanced tracking
- **Enhanced Functions**:
  - `create-payment-intent.ts` - Payment initialization with enhanced metadata
  - `stripe-webhook.ts` - Payment confirmation with CRM integration
  - `server-gtm.ts` - Server-side conversion tracking
- **Features**: 
  - Multibanco support for Portuguese customers
  - Enhanced payment tracking with attribution data
  - Server-side GTM integration for accurate conversion tracking
- **Testing**: See `docs/STRIPE_TEST_CARDS.md`
- **Dashboard**: https://dashboard.stripe.com/test

### MailerLite (Advanced Integration)
- **Purpose**: Lead capture, email marketing, and CRM integration
- **Enhanced Functions**:
  - `mailerlite-lead.ts` - Lead capture with enhanced tracking
  - `mailerlite-helpers.ts` - MailerLite API utilities and helpers
  - `crm-integration.ts` - Advanced CRM system integration
  - `crm-types.ts` - CRM type definitions and interfaces
- **Enhanced Fields**: 
  - Basic: email, name, pricing_tier
  - Enhanced: attribution data, behavior tracking, conversion context
- **Features**:
  - Automatic lead scoring and segmentation
  - Enhanced attribution tracking with UTM parameters
  - Behavioral data collection for better targeting
  - CRM synchronization and data enrichment
- **Groups**: Dynamically managed based on behavior and conversion data

### Cloudinary CDN
- **Cloud Name**: `ds4dhbneq`
- **Usage**: All marketing images
- **Transformations**:
  ```html
  <!-- Responsive image example -->
  https://res.cloudinary.com/ds4dhbneq/image/upload/
    w_640,h_400,c_fill,q_auto,f_auto/image_id
  ```
- **Images**:
  - Hero: `hero-bg-2_vjkcsn`
  - About: `sobre3_pnikcv`
  - Problem: `problem-overworked_p5ntju`

### Advanced Netlify Functions (13 Total)

#### Payment & Commerce Functions
- **`create-payment-intent.ts`**: Enhanced Stripe payment initialization with metadata tracking
- **`stripe-webhook.ts`**: Payment confirmation with CRM integration and server-side tracking

#### CRM & Lead Management Functions  
- **`mailerlite-lead.ts`**: Lead capture with enhanced behavioral tracking
- **`mailerlite-helpers.ts`**: MailerLite API utilities and helper functions
- **`crm-integration.ts`**: Advanced CRM system integration with data synchronization
- **`crm-types.ts`**: TypeScript type definitions for CRM integration

#### Analytics & Monitoring Functions
- **`server-gtm.ts`**: Server-side Google Tag Manager integration for accurate tracking
- **`health-check.ts`**: System health monitoring and status reporting

#### Infrastructure & Utility Functions
- **`dlq-handler.ts`**: Dead letter queue processing for failed operations
- **`pii-hash.ts`**: Privacy-compliant data hashing for sensitive information
- **`shared-utils.ts`**: Common utilities shared across functions
- **`types.ts`**: Shared TypeScript type definitions for all functions

### Admin Dashboard System
- **Location**: `src/admin/dashboard/index.ts`
- **Purpose**: Internal dashboard for monitoring event metrics, payments, and analytics
- **Features**:
  - Real-time payment status monitoring
  - Attendee registration tracking
  - Analytics performance overview
  - System health monitoring
  - Event capacity and registration metrics
- **Access Control**: Secured with environment-based authentication
- **Setup**: Configure `ADMIN_ACCESS_TOKEN` and `ADMIN_DASHBOARD_PASSWORD` in environment variables

### Enhanced Monitoring & Observability
<!-- Removed in cleanup: metrics-collection API and related monitoring utilities -->
- **Error Tracking**: Comprehensive error handling with deduplication via analytics error plugin
- **System Health**: Automated health checks for all critical systems
- **Attribution Tracking**: Advanced visitor attribution and behavior analysis
- **Privacy Compliance**: PII data hashing and privacy-compliant tracking

---

## Build & Deployment

### Local Build
```bash
# Production build
npm run build        # Vite CSS + Eleventy HTML

# Preview production build
npm run preview      # Serves _site directory
```

### Netlify Deployment

#### Configuration
- **Build command**: `npm run build`
- **Publish directory**: `_site`
- **Functions directory**: `netlify/functions`
- **Node version**: 22.x (set in `.nvmrc` or dashboard)

#### Environment Variables (Dashboard)
1. Go to Site Settings → Environment Variables
2. Add all variables from `.env.example`
3. Use production keys for live site

#### Automatic Deployments
- **Main branch**: Auto-deploys to production
- **Pull requests**: Deploy previews with unique URLs
- **Branch deploys**: Optional staging environments

### Pre-Deployment Checklist
```bash
# 1. Run all quality checks
npm run type-check && npm run lint && npm test

# 2. Test production build locally
npm run build && npm run preview

# 3. Verify Lighthouse scores (if UI changed)
npm run lighthouse -- https://your-url.com

# 4. Test payment flow with test cards
# See docs/PAYMENT_TESTING_SUMMARY.md
```

## TypeScript Configuration

### Key Settings
- **Target**: ES2023 (Node 22+ features)
- **Module**: ES2022 with ESM imports
- **Strict**: Full strict mode enabled
- **Imports**: Ultra-Simple Standard (relative paths with `.js` extensions)

### Import Rules
- Always use `.js` extensions for local imports
- TypeScript compiles to ESM JavaScript
- Example:
  ```typescript
  // Correct
  import { initCheckout } from './checkout/index.js';
  
  // Wrong (will fail at runtime)
  import { initCheckout } from './checkout/index.ts';
  import { initCheckout } from './checkout';
  ```

## Test Reports & Debugging

### Generated Reports
- **Playwright reports**: `reports/playwright/html/` (E2E test results)
- **Lighthouse reports**: `reports/lighthouse.*` (performance audits)
- **Test screenshots**: `reports/playwright-mcp/` (visual debugging)

### Quick Debugging
- **TypeScript errors**: `npm run type-check`
- **Netlify functions**: Check logs in terminal during `npm run netlify:dev`
- **Payment issues**: Verify test mode in Stripe Dashboard
- **Build failures**: `rm -rf node_modules _site .cache && npm ci`

*For detailed troubleshooting, see common issues in the main README.md*

---

*Updated: 2025-08-25 | Based on current codebase implementation*
## Vite Manifest & Asset Resolution

This project uses Vite’s manifest to serve hashed assets in production, with a safe dev fallback.

- Build step outputs `_site/manifest.json` with the final filenames.
- An Eleventy filter `asset` resolves entry keys to built paths:

```njk
{# CSS #}
<link rel="stylesheet" href="{{ 'src/assets/css/main.css' | asset }}">

{# JS #}
<script type="module" src="{{ 'src/assets/js/main.ts' | asset }}"></script>
```

In development (no manifest yet), the filter falls back to non‑hashed paths to keep DX smooth.

Tip: use `npm run dev:watch` to run `vite build --watch` alongside Eleventy for a seamless loop.
