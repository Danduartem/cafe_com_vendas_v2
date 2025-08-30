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
# Standard development (Eleventy only)
npm run dev          # http://localhost:8080

# With Netlify Functions (payments, emails)
npm run netlify:dev  # http://localhost:8888
```

### 3. Code Quality Checks
```bash
# Run all checks (required before commit)
npm run type-check   # TypeScript validation
npm run lint         # ESLint rules
npm test             # Vitest unit tests
npm run verify-apis  # API compatibility

# E2E Testing (requires Playwright browsers)
npx playwright install  # Install browsers (first time only)
npm run test:e2e         # Run E2E tests
npm run test:e2e:report  # View test results

# Single command for all checks
npm run type-check && npm run lint && npm test
```

---

## Third-Party Integrations

### Google Tag Manager (GTM)
- **Container ID**: `GTM-T63QRLFT`
- **Implementation**: `src/_includes/partials/gtm.njk`
- **Event Flow**: JavaScript → `window.dataLayer` → GTM → GA4

**Key Events (Revenue Critical)**:
```javascript
// Payment completion
window.dataLayer.push({
  event: 'payment_completed',
  transaction_id: 'pi_abc123...',
  value: 180,
  currency: 'EUR'
});

// Lead capture
window.dataLayer.push({
  event: 'lead_generated',
  email: 'user@example.com',
  source_section: 'hero'
});
```

**Testing**:
- Browser console: `window.dataLayer`
- GTM Preview Mode for debugging
- GA4 Debug View for event validation

### Stripe Payments
- **Mode**: Test mode for development
- **Integration**: 
  - Client: `@stripe/stripe-js` in checkout modal
  - Server: Netlify Functions for payment intents
- **Functions**:
  - `create-payment-intent.ts` - Payment initialization
  - `stripe-webhook.ts` - Payment confirmation
- **Testing**: See `docs/STRIPE_TEST_CARDS.md`
- **Dashboard**: https://dashboard.stripe.com/test

### MailerLite
- **Purpose**: Lead capture and email marketing
- **Function**: `mailerlite-lead.ts`
- **Fields**: email, name, pricing_tier
- **Groups**: Configured in MailerLite dashboard

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
- **Paths**: Aliased imports (`@components/*`, `@assets/*`)

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