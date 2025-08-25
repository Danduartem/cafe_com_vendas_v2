# Edit Map — Complete File Structure Guide

Comprehensive guide to the Café com Vendas codebase structure and where to make changes.

---

## 📝 Content & Copy

### Section Content
All section content lives in `src/_data/sections/`:

- **Hero**: `src/_data/sections/hero.json`
- **Problem**: `src/_data/sections/problem.json` 
- **Solution**: `src/_data/sections/solution.json`
- **About**: `src/_data/sections/about.json`
- **Social Proof**: `src/_data/sections/social-proof.json`
- **Offer**: `src/_data/sections/offer.json`
- **FAQ**: `src/_data/sections/faq.json`
- **Final CTA**: `src/_data/sections/final-cta.json`
- **Footer**: `src/_data/sections/footer.json`
- **Thank You**: `src/_data/sections/thank-you-content.json`

### Site-wide Settings
- **Site metadata**: `src/_data/site.ts`
- **Page configurations**: `src/_data/pages.ts`

---

## 🎨 Images & Media

### Cloudinary Images
All images served via Cloudinary CDN (`ds4dhbneq`):

- **Hero background**: Referenced in `src/assets/css/main.css:338`
- **About presenter**: `src/_includes/sections/about/index.njk` (sobre3_pnikcv)
- **Problem illustration**: `src/_includes/sections/problem/index.njk` (problem-overworked_p5ntju)
- **YouTube thumbnails**: Auto-generated in `src/_data/sections/social-proof.json`

### Static Assets
- **Fonts**: `public/fonts/CenturyGothic/` and `public/fonts/Lora/`
- **Favicon**: `public/favicon.ico` and `public/favicon.svg`

---

## ⚙️ Configuration Files

### Environment
- **`.env`** - Local development variables
- **`.env.example`** - Template with all required vars
- **`.env.test`** - Test environment configuration
- **Production** - Set in Netlify Dashboard

### Build Tools
- **`tsconfig.json`** - TypeScript compiler settings (ES2023, strict mode)
- **`vite.config.ts`** - Vite bundler for CSS processing
- **`.eleventy.ts`** - Eleventy SSG configuration
- **`vitest.config.ts`** - Test runner configuration
- **`eslint.config.mjs`** - Code quality rules
- **`tailwind.config.ts`** - Tailwind CSS v4 theme
- **`package.json`** - Dependencies and scripts

---

## 🔧 Code Architecture

### Section Components
Each section follows a consistent pattern:
```
src/_includes/sections/{section-name}/
├── index.njk    # Nunjucks template (HTML structure)
└── index.ts     # TypeScript logic (interactivity)
```

**Available sections:**
- `top-banner` - Promotional banner
- `hero` - Landing hero section
- `problem` - Problem statement
- `solution` - Solution presentation  
- `about` - Presenter bio
- `social-proof` - Testimonials/videos
- `offer` - Pricing and benefits
- `faq` - Frequently asked questions
- `final-cta` - Closing call-to-action
- `footer` - Site footer
- `thank-you` - Post-purchase confirmation
- `checkout` - Payment modal (TS only)

### UI Components
```
src/components/ui/
├── accordion/     # FAQ accordion
├── analytics/     # GTM/dataLayer integration
├── animations/    # Intersection observer effects
└── thank-you/     # Thank you page logic
```

### Core Utilities
```
src/assets/js/
├── config/
│   ├── constants.ts    # App constants, analytics events
│   └── stripe.ts       # Stripe configuration
├── utils/
│   ├── dom.ts          # DOM query helpers
│   └── gtm-normalizer.ts # Analytics event formatting
└── main.ts             # Main entry point
```

---

## 💳 Serverless Functions

### Netlify Functions
```
netlify/functions/
├── create-payment-intent.ts  # Initialize Stripe payment
├── stripe-webhook.ts         # Handle payment confirmation
├── mailerlite-lead.ts        # Add lead to email list
└── types.ts                  # Shared TypeScript types
```

### Utility Scripts
```
scripts/
└── verify-apis.ts            # API compatibility checker
```

### Generated Reports
```
reports/                      # Auto-generated (excluded from git)
├── lighthouse.*              # Performance audit results
└── playwright/               # E2E test results & screenshots
    ├── html/                 # Test report dashboard
    └── playwright-mcp/       # Visual debugging screenshots
```

### Payment Flow
1. User clicks checkout → `create-payment-intent`
2. Stripe processes payment
3. Webhook confirms → `stripe-webhook`
4. Analytics fires `payment_completed` event

### Analytics Integration
- **GTM Container**: Set via `VITE_GTM_CONTAINER_ID`
- **Event Canon**: 
  - `payment_completed` → GA4 `purchase`
  - `lead_generated` → GA4 `generate_lead`
- **Implementation**: `src/components/ui/analytics/index.ts`
- **Event Definitions**: `src/assets/js/config/constants.ts`

---

## 📄 Static Pages

### Page Templates
```
src/pages/
├── index.njk                  # Main landing page
├── thank-you.njk              # Post-purchase page
├── politica-privacidade.njk   # Privacy policy
├── termos-condicoes.njk       # Terms of service
└── garantia-reembolso.njk     # Refund policy
```

### Shared Templates
```
src/_includes/
├── layout.njk                 # Base HTML layout
└── partials/
    ├── checkout-modal.njk     # Payment modal
    ├── footer-stat-card.njk   # Footer statistics
    ├── gtm.njk                # GTM snippets
    ├── icons.njk              # SVG icon library
    ├── legal-page.njk         # Legal page template
    └── whatsapp-button.njk    # WhatsApp CTA

---

## 🛠️ Development Workflow

### File Naming Conventions
- **TypeScript**: Use `.ts` extension
- **Imports**: Use `.js` extension (ESM output)
- **Components**: `index.ts` in component folder
- **Data**: `.json` or `.ts` in `_data` folder

### CSS & Styling
- **Entry**: `src/assets/css/main.css`
- **Framework**: Tailwind CSS v4 (CSS-first)
- **Variables**: Design tokens in `@theme`
- **Classes**: Utility-first in templates
- **No inline styles**: All styles via classes

### Testing Structure
```
tests/
├── setup.ts                                # Test configuration
├── unit/                                   # Unit tests (Vitest)
│   └── render/
│       └── landing-composition.test.ts     # Landing page rendering tests
├── e2e/                                   # End-to-end tests (Playwright)
│   └── user-journey.test.ts               # Complete user flow validation
└── utils/                                 # Test utilities
    └── section-loader.ts                  # Section loading helpers
```

### Quick Commands
```bash
# Development
npm run dev              # Port 8080
npm run netlify:dev      # Port 8888 with functions

# Quality checks (run before commit)
npm run type-check       # TypeScript
npm run lint             # ESLint
npm test                 # Vitest

# Build & preview
npm run build            # Production build
npm run preview          # Serve production build

# Utilities
npm run verify-apis      # Check API compatibility
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:report  # View test results
npm run lighthouse       # Run Lighthouse performance audit
```

## 📝 Quick Edit Guide

### To change...

**Event details (date, location, price)**
→ `src/_data/sections/hero.json`, `offer.json`

**Presenter bio**
→ `src/_data/sections/about.json`

**Testimonials/videos**
→ `src/_data/sections/social-proof.json`

**FAQ questions**
→ `src/_data/sections/faq.json`

**Payment amount**
→ `netlify/functions/create-payment-intent.ts`

**Email capture**
→ `netlify/functions/mailerlite-lead.ts`

**Analytics events**
→ `src/assets/js/config/constants.ts`

**Site metadata (title, description)**
→ `src/_data/site.ts`

**Color scheme/fonts**
→ `src/assets/css/main.css` (@theme section)

---

*Updated: 2025-08-25 | Reflects current codebase structure*