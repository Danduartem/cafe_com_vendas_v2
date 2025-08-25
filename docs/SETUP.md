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
- **Implementation**: Injected via `src/_includes/partials/gtm.njk`
- **DataLayer Events**:
  - `payment_completed` → Maps to GA4 `purchase`
  - `lead_generated` → Maps to GA4 `generate_lead`
- **Testing**: 
  ```javascript
  // Browser console
  window.dataLayer
  // GTM Preview Mode for event debugging
  ```

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

## Troubleshooting

### Common Issues

#### TypeScript Errors
- Run `npm run type-check` to see all errors
- Check import extensions (must be `.js`)
- Verify path aliases in `tsconfig.json`

#### Netlify Functions Not Working
- Ensure `npm run netlify:dev` is running
- Check function logs in terminal
- Verify environment variables are set

#### Payment Issues
- Confirm test mode in Stripe Dashboard
- Check webhook secret is correct
- See `docs/PAYMENT_TESTING_SUMMARY.md`

#### Build Failures
- Clear cache: `rm -rf node_modules _site .cache`
- Reinstall: `npm ci`
- Check Node version: `node --version` (needs 22.17.1+)

#### Test Reports
- **Playwright reports**: `reports/playwright/html/` (generated by E2E tests)
- **Lighthouse reports**: `reports/lighthouse.*` (generated by performance audits)
- **Test screenshots**: Saved in `reports/playwright-mcp/` for visual debugging

---

*Updated: 2025-08-25 | Based on current codebase implementation*