# Café com Vendas Landing Page

Premium landing page for an intimate business transformation event in Lisbon, designed for female entrepreneurs seeking to scale their businesses without burnout.

## 🎯 Project Overview

**Event**: Café com Vendas - Business transformation workshop  
**Date**: February 15, 2025  
**Location**: Lisbon, Portugal  
**Audience**: Female entrepreneurs (20 exclusive spots)  
**Language**: Portuguese (pt-PT)

## 🚨 Current Status

✅ **TypeScript Migration Complete**: The codebase has been fully migrated to TypeScript with comprehensive type definitions. All type errors resolved, achieving complete type safety across the entire application.  

## 🛠 Tech Stack

- **Framework**: [Eleventy](https://www.11ty.dev/) 3.1.2 (Static Site Generator)
- **Language**: **TypeScript** 5.9.2 (**migration complete**)
- **Templating**: Nunjucks (.njk files)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.1.12 + PostCSS 8.5.6 (pure CSS-based configuration)
- **Build Tool**: [Vite](https://vite.dev/) 7.1.3 (TypeScript modules → optimized bundle)
- **Runtime**: Node.js >=22.17.1 + npm >=10.0.0
- **Payments**: Stripe 18.4.0 (Node.js SDK) - TypeScript
- **Design System**: JSON tokens → CSS custom properties
- **Fonts**: Local Lora (display) + Century Gothic (body)
- **Architecture**: **TypeScript-first** modular architecture with **complete type safety**
- **Testing**: [Playwright](https://playwright.dev/) 1.55.0 (End-to-end browser testing)
- **Edge**: Netlify Edge Functions (TypeScript CSP header)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development server (with file watching)
npm run dev

# Build for production
npm run build

# Build design tokens only
npm run tokens:build

# TypeScript validation (zero errors)
npm run type-check

# ESLint validation
npm run lint

# Clean build directory
npm run clean

# Run visual regression tests (Playwright)
npm run test:visual

# Run unit tests (Vitest)
npm run test

# Run visual regression tests
npm run test:visual

# Run visual tests with UI
npm run test:visual:ui

# Run visual tests headed (browser visible)
npm run test:visual:headed

# Run all tests (unit + visual)
npm run test:all

# Validate content structure
npm run validate:content

# Verify API configurations
npm run verify-apis
```

## 📁 Project Structure

```
├── content/                    # 🌍 i18n-Ready Content Structure
│   └── pt-PT/                 # Portuguese content (primary language)
│       ├── site.json          # Global site metadata & SEO
│       ├── event.json         # Event data (prices, dates, logistics)
│       ├── pages/             # Page-specific content
│       ├── sections/          # Section-specific content
│       └── strings/           # Localized strings
│
├── design/                     # 🎨 Design System (Language-Agnostic)
│   └── tokens.json            # Unified design tokens & CSS variables
│
├── tests/                      # 🧪 Test Suite (Top-Level Organization)
│   ├── unit/                  # Unit tests (analytics, render)
│   │   ├── analytics/         # Analytics contract testing
│   │   └── render/            # Template rendering tests
│   ├── visual/                # Visual regression tests (Playwright)
│   │   ├── global-setup.ts   # Playwright global configuration
│   │   ├── sections.spec.ts   # Playwright visual tests
│   │   └── sections.spec.ts-snapshots/ # Visual baselines
│   ├── schemas/               # Data validation tests
│   ├── utils/                 # Test utilities and helpers
│   └── setup.ts              # Test configuration
│
├── src/
│   ├── _includes/
│   │   ├── layout.njk         # Base HTML template
│   │   ├── partials/          # Reusable template parts
│   │   │   ├── legal-page.njk # Legal page template
│   │   │   ├── whatsapp-button.njk
│   │   │   └── *.njk          # Other partials
│   │   └── sections/          # 🏗️ Co-located Sections (TypeScript)
│   │       ├── hero/
│   │       │   ├── index.njk  # Template
│   │       │   ├── index.ts   # Logic (TypeScript)
│   │       │   └── schema.ts  # Data validation
│   │       ├── offer/         # Same pattern for all sections
│   │       ├── problem/
│   │       ├── solution/
│   │       ├── about/
│   │       ├── social-proof/
│   │       ├── faq/
│   │       ├── final-cta/
│   │       ├── footer/
│   │       ├── top-banner/
│   │       ├── checkout/
│   │       └── manifest.ts    # Section registry
│   │
│   ├── _data/                 # 🗃️ Data Adapters (TypeScript)
│   │   ├── site.ts           # Loads content/pt-PT/site.json
│   │   ├── event.ts          # Loads content/pt-PT/event.json
│   │   ├── presenter.ts      # Presenter data
│   │   ├── page.ts           # Page-specific data loader
│   │   ├── pages.ts          # Multi-page data system
│   │   ├── global.ts         # Global data aggregator
│   │   └── types.ts          # Data type definitions
│   │
│   ├── pages/                 # 📄 Page Templates (Organized)
│   │   ├── index.njk          # Main landing page
│   │   ├── politica-privacidade.njk # Privacy policy
│   │   ├── termos-condicoes.njk  # Terms & conditions
│   │   ├── garantia-reembolso.njk # Guarantee & refund policy
│   │   └── thank-you.njk      # Thank you page
│   │
│   ├── assets/
│   │   ├── css/
│   │   │   ├── main.css      # Tailwind + tokens entry
│   │   │   └── _tokens.generated.css # Generated from design/tokens.json
│   │   │
│   │   ├── js/               # ⚡ Complete TypeScript Architecture
│   │   │   ├── main.ts       # Entry point (TypeScript)
│   │   │   ├── app.ts        # Application controller (TypeScript)
│   │   │   ├── types/        # 🏷️ TypeScript Definitions
│   │   │   │   ├── global.ts  # Global types
│   │   │   │   ├── component.ts # Component interfaces
│   │   │   │   ├── analytics.ts # Analytics types
│   │   │   │   ├── config.ts   # Configuration types
│   │   │   │   ├── state.ts    # State types
│   │   │   │   └── window.d.ts # Window extensions
│   │   │   ├── core/
│   │   │   │   ├── analytics.ts # GTM/GA4 tracking (TypeScript)
│   │   │   │   └── state.ts    # State management (TypeScript)
│   │   │   └── config/
│   │   │       ├── constants.ts # App constants
│   │   │       └── environment.ts # Environment config
│   │   │
│   │   ├── fonts/            # Local Lora & Century Gothic
│   │   │   ├── Lora/         # Lora font variants
│   │   │   └── CenturyGothic/ # Century Gothic variants
│   │   │
│   │   └── images/           # Static images (Unified)
│   │       ├── cafe.jpg
│   │       └── problem-overworked.jpg
│   │
│   ├── platform/             # 🏗️ Platform Foundation (TypeScript)
│   │   ├── lib/utils/        # Shared utilities (TypeScript)
│   │   │   ├── animations.ts # Animation helpers
│   │   │   ├── dom.ts        # DOM utilities
│   │   │   ├── scroll-tracker.ts # Scroll tracking
│   │   │   └── *.ts          # Other utilities
│   │   └── ui/components/    # 🔧 UI Component Library (Consolidated)
│   │       ├── analytics.ts  # Analytics tracking components
│   │       ├── animations.ts # Animation components
│   │       ├── accordion.ts  # Accordion UI pattern
│   │       ├── gtm.ts        # GTM integration
│   │       ├── modal.ts      # Modal UI pattern
│   │       ├── thank-you.ts  # Thank you page components
│   │       ├── youtube.ts    # YouTube integration
│   │       └── index.ts      # Component registry
│   │
│   ├── public/               # Static assets
│   │   ├── favicon.ico
│   │   ├── favicon.svg
│   │   └── _headers          # Netlify headers
│
├── netlify/                  # ☁️ Serverless Functions (TypeScript)
│   ├── functions/
│   │   ├── create-payment-intent.ts # Stripe payments (TypeScript)
│   │   ├── stripe-webhook.ts        # Stripe webhooks (TypeScript)
│   │   ├── mailerlite-lead.ts       # Email integration (TypeScript)
│   │   └── types.ts                 # Shared function types
│   └── edge-functions/
│       └── csp.ts                   # Content Security Policy (TypeScript)
│
├── scripts/                  # 🔧 Build Tools (TypeScript)
│   ├── screenshot-cli.ts     # CLI screenshot system (TypeScript)
│   ├── universal-screenshot.ts # Screenshot system (TypeScript)
│   ├── dev-section.ts        # Section development tools
│   ├── find-section.ts       # Section finder utility
│   ├── new-section.ts        # Section scaffolding
│   ├── validate-content.ts   # Content validation
│   └── verify-apis.ts        # API configuration verification
│
├── docs/                     # 📖 Technical Documentation
│   ├── architecture-overview.md
│   ├── coding-standards.md
│   ├── GTM_SETUP_GUIDE.md
│   ├── STRIPE_TEST_CARDS.md
│   └── *.md                  # Other documentation
│
├── reports/                  # 📊 Performance & Quality Reports
│   ├── lighthouse-desktop.report.html
│   ├── lighthouse-mobile.report.html
│   └── lighthouse-*/         # Lighthouse report directories
│
├── _site/                    # 🏭 Generated Static Site (Build Output)
│   ├── index.html            # Generated pages
│   ├── assets/               # Optimized assets
│   └── */                    # Other generated content
│
├── .eleventy.ts              # ⚙️ Eleventy config (TypeScript)
├── vite.config.ts            # ⚙️ Vite bundler config (TypeScript)
├── tsconfig.json             # ⚙️ TypeScript configuration
├── eslint.config.ts          # ⚙️ ESLint config (TypeScript)
├── playwright.config.ts      # ⚙️ Playwright test config (TypeScript)
├── vitest.config.ts          # ⚙️ Vitest unit test config (TypeScript)
├── netlify.toml              # ⚙️ Netlify deployment config
│
└── CLAUDE.md                 # 🤖 AI development guidelines
```

### 🏗️ Architecture Highlights

- **TypeScript Migration**: **100% Complete** - Full migration with comprehensive type safety
- **Clean File Organization**: Restructured for maintainability and clarity
  - Design tokens: Language-agnostic in `/design/tokens.json`
  - Page templates: Organized in `src/pages/`
  - Tests: Top-level `/tests/` with clear categorization
  - Components: Consolidated in `src/platform/ui/components/`
- **Co-located Sections**: Template + TypeScript logic in same folder for all sections
- **i18n-Ready**: Content separated by language (`content/pt-PT/`)
- **Platform Layer**: Shared utilities, analytics, and UI components with TypeScript interfaces
- **Type-Safe Data Flow**: `content/*.json` → `_data/*.ts` → templates with full type validation
- **Unified Component Library**: Single source for reusable UI patterns in platform layer
- **Quality Assurance**: Comprehensive testing with organized test structure
- **Testing Architecture**: Unit, visual, schema, and E2E tests in dedicated directories

## 🎨 Design System (TypeScript-Powered)

The design system is centralized in `design/tokens.json` and automatically converted to CSS custom properties via TypeScript:

- **Colors**: Navy `#191F3A`, Burgundy `#81171F`, Neutral `#ECECEC`
- **Typography**: Lora (headings), Century Gothic (body)
- **Spacing**: Consistent scale from `xs` to `5xl`
- **Build Process**: `npm run tokens:build` (TypeScript) generates type-safe CSS variables
- **Type Safety**: All design tokens have comprehensive TypeScript definitions with full IDE support

## 🧪 Testing Architecture

### Comprehensive Test Suite
- **Unit Tests**: Vitest for data adapters, utilities, and component logic
- **Visual Regression**: Playwright visual testing with baseline screenshots  
- **Visual Regression Testing**: Playwright screenshot comparison and browser automation
- **Schema Validation**: Type-safe content and data structure validation
- **Analytics Testing**: GTM/GA4 event tracking validation

### Test Categories
```
tests/                  # Top-level test organization
├── unit/              # Unit tests
│   ├── analytics/     # Analytics contract testing
│   └── render/        # Template rendering tests  
├── visual/            # Visual regression tests (Playwright)
├── schemas/           # Data validation tests
├── utils/             # Test utilities and helpers
└── setup.ts          # Test configuration
```

### Quality Gates
- **TypeScript**: Zero compilation errors enforced
- **Visual Consistency**: Automated screenshot comparison
- **User Experience**: Visual regression and component validation
- **Performance**: Core Web Vitals tracking in tests

## 📄 Landing Page Sections

1. **Hero** - Hook + primary CTA  
2. **Problem** - Pain point validation
3. **Solution** - 5-pillar transformation approach
4. **Social Proof** - Customer testimonials
5. **Offer** - Pricing + 90-day guarantee
6. **FAQ** - Common objections addressed
7. **Final CTA** - Urgency + scarcity

## 🔧 Development Guidelines

### Code Standards (TypeScript-First)
- **CSS**: Pure Tailwind utilities only (NO custom CSS)
- **TypeScript**: Modular TypeScript components with type safety (NO JavaScript files)
- **Templates**: Semantic HTML with proper ARIA labels
- **Performance**: WebP images, lazy loading, LCP optimization
- **Type Safety**: All APIs (Stripe, Analytics, DOM) properly typed with comprehensive type definitions
- **Component Architecture**: Platform UI library for reusable patterns

### TypeScript Build Process (Production Ready)
1. **TypeScript Compilation**: All `.ts` files validated and compiled with type checking
2. **Design Tokens**: `design/tokens.json` → CSS custom properties (TypeScript)
3. **Content Loading**: TypeScript data adapters load from `content/pt-PT/` with type safety
4. **Tailwind CSS**: v4 processes CSS via `@theme` block configuration
5. **Vite Bundling**: TypeScript modules → optimized output with tree-shaking
6. **Eleventy Generation**: Static HTML from templates using type-safe data
7. **PostCSS Optimization**: Final CSS optimization and purging

**Benefits**: Compile-time error detection, superior IDE support, type-safe refactoring, self-documenting code through comprehensive TypeScript interfaces.

### Critical Rules (TypeScript-First)
- ❌ No `element.style.*` assignments
- ❌ No `<style>` blocks or `style=""` attributes  
- ❌ No hardcoded colors/values (use design tokens)
- ❌ No inline event handlers (`onclick=""`, `onsubmit=""`)
- ❌ No inline JavaScript (`<script>` without src)
- ❌ No JavaScript files (`.js`) - **TypeScript only** (`.ts`)
- ✅ Only `element.classList` manipulation
- ✅ Tailwind utilities for all styling
- ✅ Design token CSS variables
- ✅ Event handlers via `addEventListener()` only
- ✅ ARIA roles for interactive elements
- ✅ TypeScript interfaces for all APIs (Stripe, Analytics, DOM)
- ✅ Type-safe data loading from content files

## 📊 Analytics & Conversion

- **Google Tag Manager (GTM)** with advanced lazy loading (Container: GTM-T63QRLFT)
- **Google Analytics 4** events via GTM dataLayer (no direct gtag calls)
- **Performance Tracking** - Core Web Vitals (LCP, CLS, FID), scroll depth, engagement
- **Conversion Tracking** - Complete funnel from checkout to payment completion
- **Error Monitoring** - JavaScript error tracking for improved UX
- **Stripe** payment integration with conversion events
- **WhatsApp** contact tracking

### GTM Advanced Features
- **3-Tier Lazy Loading**: Conversion intent → Engagement → Fallback (10-15s)
- **22+ Tracked Events**: Performance, user behavior, conversions, errors
- **Performance Optimized**: GTM loads only when user shows purchase intent
- **DataLayer Architecture**: All events flow through `window.dataLayer` → GTM → GA4

### GTM Environment Setup
```bash
VITE_GTM_CONTAINER_ID=GTM-T63QRLFT
```
- Production: Configure in Netlify environment variables
- Local: Add to `.env.local` for development testing
- Implementation: `src/platform/ui/components/gtm.ts` with CSP-compliant loading
- Complete guide: `docs/GTM_SETUP_GUIDE.md`

## 🔒 Security Features

### Content Security Policy (CSP)
- Managed via Netlify Edge Function (`netlify/edge-functions/csp.js`)
- No inline scripts: All JavaScript in external files
- style-src `'unsafe-inline'` kept (Tailwind utilities)
- Whitelisted script/frame/connect targets include Stripe, GTM, GA, YouTube
- Event handler security: No `onclick=""` attributes, only `addEventListener()`

### Performance Security
- **Lazy-loaded third-party scripts**: Stripe.js loads only when needed (saves 187 KiB)
- **ARIA compliance**: Proper roles for all interactive elements
- **Accessibility score**: 95/100 Lighthouse rating

## 📈 Performance Metrics

### Latest Lighthouse Scores (Aug 2025)
- **Performance**: 82/100 (Mobile), 99/100 (Desktop) 
- **Accessibility**: 96/100 (Desktop) - WCAG AA compliance
- **Best Practices**: 100/100 (Desktop) - Perfect security & performance
- **SEO**: 100/100 (Desktop) - Full search optimization

### Core Web Vitals (Desktop Results)
- **LCP (Largest Contentful Paint)**: 0.9s (96/100 score) - Excellent
- **FCP (First Contentful Paint)**: 0.7s (97/100 score) - Excellent  
- **CLS (Cumulative Layout Shift)**: 0.00005 (100/100 score) - Perfect
- **TBT (Total Blocking Time)**: 0ms (100/100 score) - Perfect

### Performance Optimizations Implemented
- **GTM Lazy Loading**: 3-tier loading strategy reduces initial payload
- **Stripe.js Lazy Loading**: -187 KiB (-1.65s) from initial load
- **Image Optimization**: WebP format with Cloudinary CDN
- **Font Optimization**: Local fonts with proper preloading
- **JavaScript**: Tree-shaken ES6 modules, minimal bundle size
- **CSS**: Pure Tailwind utilities with PostCSS optimization
- **Error Tracking**: JavaScript error monitoring for UX quality

## 🚀 Deployment

Built static files are generated in `_site/` and deployed to Netlify with automated builds from GitHub.

### Environment Variables
- `VITE_STRIPE_PUBLIC_KEY` (publishable)
- `STRIPE_SECRET_KEY` (functions)
- `VITE_GTM_CONTAINER_ID=GTM-T63QRLFT` (analytics)
- `VITE_FORMSPREE_FORM_ID` (optional contact forms)

### Netlify Secrets Scanning
`netlify.toml` is configured to omit scanning for:
`VITE_FORMSPREE_FORM_ID`, `VITE_STRIPE_PUBLIC_KEY`, `VITE_GTM_CONTAINER_ID`.

### Edge Function
- `[[edge_functions]]` registers `csp` for all paths.

## 📖 Documentation & AI Assistance

- `CLAUDE.md` - Complete development guidelines for Claude Code
- Custom slash commands: `/update-libs` and `/update-refactor`
- Fresh documentation via Context7 MCP integration

## 🎯 Business Goals

- **Target**: 20 exclusive event spots
- **Conversion Focus**: Premium pricing with social proof
- **User Experience**: Elegant, mobile-first, fast loading
- **Trust Elements**: Testimonials, guarantee, secure payment

## 📅 Recent Updates

### August 2025
- **🏗️ Complete File Structure Restructure**: Major reorganization for improved maintainability
  - **Design tokens**: Moved from locale-specific to language-agnostic `/design/tokens.json`
  - **Page templates**: Consolidated all pages in `src/pages/` directory
  - **Tests**: Moved to top-level `/tests/` with organized subdirectories (`unit/`, `visual/`, `schemas/`)
  - **Components**: Unified all UI components in `src/platform/ui/components/`
  - **Static assets**: Consolidated images in `src/assets/images/`
  - **Documentation**: Updated all references and import paths
  - **Configuration**: Updated TypeScript, ESLint, Vitest, and Playwright configs
  - **Quality**: All type-checking and linting passes after restructure
- **Hero Scroll Arrow Fix**: Optimized scroll down functionality in hero section
  - Removed non-existent `#inscricao` reference that caused unnecessary DOM queries
  - Direct targeting of problem section (`#s-problem`) for improved performance
  - Enhanced keyboard navigation with consistent scroll behavior
  - Verified functionality with Playwright end-to-end testing
- **Quality Assurance**: Integrated Playwright browser testing for UI validation
- **Performance**: Eliminated redundant DOM queries for smoother user experience

### December 2024
- Migrated entire codebase to TypeScript (100% file coverage)
- Implemented new platform UI component library
- Consolidated data loaders into unified page system
- Added comprehensive Portuguese content architecture
- Enhanced checkout component functionality
- Improved TypeScript type definitions across all modules

---

**Note**: This is a conversion-optimized landing page following proven direct marketing principles while maintaining an elegant, sophisticated aesthetic suitable for the target demographic of successful female entrepreneurs.