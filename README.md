# Café com Vendas Landing Page

Premium landing page for an intimate business transformation event in Lisbon, designed for female entrepreneurs seeking to scale their businesses without burnout.

## 🎯 Project Overview

**Event**: Café com Vendas - Business transformation workshop  
**Date**: September 20, 2025  
**Location**: Lisbon, Portugal  
**Audience**: Female entrepreneurs (8 exclusive spots)  
**Language**: Portuguese (pt-PT)

## 🚨 Current Status

✅ **TypeScript Migration Complete**: The codebase has achieved **100% TypeScript compliance** with zero type errors. All JavaScript files have been successfully migrated to TypeScript with comprehensive type definitions and compile-time validation.  

## 🛠 Tech Stack

- **Framework**: [Eleventy](https://www.11ty.dev/) 3.1.2 (Static Site Generator)
- **Language**: **TypeScript** 5.9.2 (**migration complete**)
- **Templating**: Nunjucks (.njk files)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.1.12 + PostCSS 8.5.6 (pure CSS-based configuration)
- **Build Tool**: [Vite](https://vite.dev/) 7.1.3 (TypeScript modules → optimized bundle)
- **Runtime**: Node.js (LTS) + npm
- **Payments**: Stripe 18.4.0 (Node.js SDK) - TypeScript
- **Design System**: JSON tokens → CSS custom properties
- **Fonts**: Local Lora (display) + Century Gothic (body)
- **Architecture**: **TypeScript-first** modular architecture with **complete type safety**
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
```

## 📁 Project Structure

```
├── content/                    # 🌍 i18n-Ready Content Structure
│   └── pt-PT/                 # Portuguese content (primary language)
│       ├── site.json          # Global site metadata & SEO
│       ├── event.json         # Event data (prices, dates, logistics)
│       ├── design_tokens.json # Unified design system
│       └── *.json             # All content as structured data
│
├── src/
│   ├── _includes/
│   │   ├── layout.njk           # Base HTML template
│   │   ├── sections/             # 🏗️ Co-located Sections (TypeScript)
│   │   │   ├── hero/
│   │   │   │   ├── index.njk    # Template
│   │   │   │   └── index.ts     # Logic (TypeScript)
│   │   │   └── offer/           # Same pattern
│   │   └── components/*.njk     # Legacy components (templates only)
│   │
│   ├── _data/                   # 🗃️ Data Adapters (TypeScript)
│   │   ├── site.ts             # Loads content/pt-PT/site.json
│   │   ├── event.ts            # Loads content/pt-PT/event.json
│   │   ├── tokens.ts           # Loads content/pt-PT/design_tokens.json
│   │   └── *.ts                # All data adapters in TypeScript
│   │
│   ├── index.njk               # Main landing page
│   ├── politica-privacidade.njk # Privacy policy
│   ├── termos-condicoes.njk    # Terms & conditions
│   │
│   ├── assets/
│   │   ├── css/
│   │   │   ├── main.css        # Tailwind + tokens entry
│   │   │   └── _tokens.generated.css # Generated from design_tokens.json
│   │   │
│   │   ├── js/                 # ⚡ Complete TypeScript Architecture
│   │   │   ├── main.ts         # Entry point (TypeScript)
│   │   │   ├── app.ts          # Application controller (TypeScript)
│   │   │   ├── types/          # 🏷️ TypeScript Definitions
│   │   │   │   ├── global.ts    # Global types
│   │   │   │   ├── component.ts # Component interfaces
│   │   │   │   └── *.ts        # All type definitions
│   │   │   ├── core/
│   │   │   │   ├── analytics.ts # GTM/GA4 tracking (TypeScript)
│   │   │   │   └── state.ts    # State management (TypeScript)
│   │   │   ├── utils/
│   │   │   │   ├── dom.ts      # DOM helpers (TypeScript)
│   │   │   │   ├── animations.ts # Animation utilities (TypeScript)
│   │   │   │   └── index.ts    # Utils barrel export (TypeScript)
│   │   │   └── components/
│   │   │       ├── banner.ts   # Top banner (TypeScript)
│   │   │       ├── faq.ts      # FAQ accordion (TypeScript)
│   │   │       ├── gtm.ts      # Google Tag Manager (TypeScript)
│   │   │       └── *.ts        # All components in TypeScript
│   │   │
│   │   └── fonts/              # Local Lora & Century Gothic
│   │
│   └── platform/               # 🏗️ Platform Foundation (TypeScript)
│       ├── lib/utils/          # Shared utilities (TypeScript)
│       └── analytics/core/     # Analytics abstraction (TypeScript)
│
├── netlify/                    # ☁️ Serverless Functions (TypeScript)
│   ├── functions/
│   │   ├── create-payment-intent.ts # Stripe payments (TypeScript)
│   │   ├── stripe-webhook.ts        # Stripe webhooks (TypeScript)
│   │   └── mailerlite-lead.ts       # Email integration (TypeScript)
│   └── edge-functions/
│       └── csp.ts                   # Content Security Policy (TypeScript)
│
├── scripts/                    # 🔧 Build Tools (TypeScript)
│   ├── build-tokens.ts         # Design tokens → CSS (TypeScript)
│   ├── universal-screenshot.ts  # Screenshot system (TypeScript)
│   └── *.ts                    # All build scripts in TypeScript
│
├── .eleventy.ts                # ⚙️ Eleventy config (TypeScript)
├── vite.config.ts              # ⚙️ Vite bundler config (TypeScript)
├── tsconfig.json               # ⚙️ TypeScript configuration
├── eslint.config.ts            # ⚙️ ESLint config (TypeScript)
│
├── info/                       # ❌ DEPRECATED - Old content structure
│   └── *.json                  # Superseded by content/pt-PT/
├── docs/                       # 📖 Technical documentation
├── .claude/                    # 🤖 Custom Claude Code commands
├── bizplan/                    # 📈 Business strategy artifacts
├── copy-pick/                  # ✏️ Copy optimization experiments
├── strategy/                   # 🎯 Strategic planning materials
└── CLAUDE.md                   # 🤖 AI development guidelines
```

### 🏗️ Architecture Highlights

- **TypeScript Migration**: **Complete** - 100% type safety across entire codebase
- **Co-located Sections**: Template + TypeScript logic in same folder for all 10 sections
- **i18n-Ready**: Content separated by language (`content/pt-PT/`)
- **Platform Layer**: Shared utilities with comprehensive TypeScript interfaces
- **Type-Safe Data Flow**: `content/*.json` → `_data/*.ts` → templates with full type validation

## 🎨 Design System (TypeScript-Powered)

The design system is centralized in `content/pt-PT/design_tokens.json` and automatically converted to CSS custom properties via TypeScript:

- **Colors**: Navy `#191F3A`, Burgundy `#81171F`, Neutral `#ECECEC`
- **Typography**: Lora (headings), Century Gothic (body)
- **Spacing**: Consistent scale from `xs` to `5xl`
- **Build Process**: `npm run tokens:build` (TypeScript) generates type-safe CSS variables
- **Type Safety**: All design tokens have comprehensive TypeScript definitions with full IDE support

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
- **TypeScript**: Modular TypeScript components with complete type safety (NO JavaScript) - **Migration complete**
- **Templates**: Semantic HTML with proper ARIA labels
- **Performance**: WebP images, lazy loading, LCP optimization
- **Type Safety**: All APIs (Stripe, Analytics, DOM) properly typed with comprehensive type definitions

### TypeScript Build Process (Production Ready)
1. **TypeScript Compilation**: All `.ts` files validated and compiled with type checking (**zero errors**)
2. **Design Tokens**: `content/pt-PT/design_tokens.json` → CSS custom properties (TypeScript)
3. **Content Loading**: TypeScript data adapters load from `content/pt-PT/` with type safety
4. **Tailwind CSS**: v4 processes CSS via `@theme` block configuration
5. **Vite Bundling**: TypeScript modules → optimized output with tree-shaking
6. **Eleventy Generation**: Static HTML from templates using type-safe data
7. **PostCSS Optimization**: Final CSS optimization and purging

**Achieved Benefits**: Compile-time error detection, superior IDE support, type-safe refactoring, self-documenting code through comprehensive TypeScript interfaces.

### Critical Rules (TypeScript-First)
- ❌ No `element.style.*` assignments
- ❌ No `<style>` blocks or `style=""` attributes  
- ❌ No hardcoded colors/values (use design tokens)
- ❌ No inline event handlers (`onclick=""`, `onsubmit=""`)
- ❌ No inline JavaScript (`<script>` without src)
- ❌ No JavaScript files (`.js`) - **TypeScript only** (`.ts`) - **Zero JS files remaining**
- ✅ Only `element.classList` manipulation
- ✅ Tailwind utilities for all styling
- ✅ Design token CSS variables
- ✅ Event handlers via `addEventListener()` only
- ✅ ARIA roles for interactive elements
- ✅ **Complete TypeScript interfaces for all APIs** (Stripe, Analytics, DOM)
- ✅ **Fully type-safe data loading** from content files with compile-time validation

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
- Implementation: `src/assets/js/components/gtm.js` with CSP-compliant loading
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

- **Target**: 8 exclusive event spots
- **Conversion Focus**: Premium pricing with social proof
- **User Experience**: Elegant, mobile-first, fast loading
- **Trust Elements**: Testimonials, guarantee, secure payment

---

**Note**: This is a conversion-optimized landing page following proven direct marketing principles while maintaining an elegant, sophisticated aesthetic suitable for the target demographic of successful female entrepreneurs.