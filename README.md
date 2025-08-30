# Café com Vendas Landing Page

[![Node.js](https://img.shields.io/badge/node-%3E%3D22.17.1-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![Eleventy](https://img.shields.io/badge/Eleventy-3.1.2-orange.svg)](https://www.11ty.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.12-38bdf8.svg)](https://tailwindcss.com/)

Premium landing page for an intimate business transformation event in Lisbon, designed for female entrepreneurs seeking to scale their businesses without burnout.

## 🎯 Project Overview

**Event**: Café com Vendas - Business transformation workshop  
**Date**: September 20, 2025  
**Location**: Lisbon, Portugal  
**Audience**: Female entrepreneurs (20 exclusive spots)  
**Language**: Portuguese (pt-PT)

## 🛠 Tech Stack

- **Framework**: Eleventy 3.1.2 (Static Site Generator)
- **Language**: TypeScript 5.9.2 (ESM-first, `.js` extensions)
- **Styling**: Tailwind CSS 4.1.12 (CSS-first, `@theme` configuration)
- **Build**: Vite 7.1.3 (CSS processing & optimization)
- **Payments**: Stripe 18.4.0 + Netlify Functions
- **Email**: MailerLite API integration
- **Testing**: Vitest 3.2.4 + Playwright 1.55.0
- **Analytics**: GTM/GA4 with typed dataLayer
- **Deployment**: Netlify (Functions + static hosting)

## 🚀 Quick Start

```bash
# Install dependencies (requires Node 22.17.1+)
npm install

# Development
npm run dev               # Eleventy dev server (port 8080)
npm run netlify:dev       # With serverless functions

# Quality checks (must pass all)
npm run type-check        # TypeScript validation
npm run lint              # ESLint validation  
npm test                  # Vitest unit tests
npm run verify-apis       # API compatibility check

# Production build
npm run build             # Vite + Eleventy production build
npm run preview           # Preview production build
```

## ⚡ Performance Targets

### Lighthouse Scores (Mobile)
- **Performance**: ≥ 90 (Critical for conversions)
- **Accessibility**: ≥ 95 (Legal compliance + UX)
- **Best Practices**: ≥ 90 (Security + reliability)
- **SEO**: ≥ 95 (Organic discovery)

### Core Web Vitals
- **LCP**: < 2.5s | **FID**: < 100ms | **CLS**: < 0.1 | **INP**: < 200ms

```bash
# Run performance audit
npm run lighthouse -- https://your-url.com
```

---

## 🛠 Quick Edit Guide

### Content Changes
- **Event details** (date, price): `src/_data/sections/hero.json`, `offer.json`
- **Presenter bio**: `src/_data/sections/about.json`
- **Testimonials/videos**: `src/_data/sections/social-proof.json`
- **FAQ questions**: `src/_data/sections/faq.json`
- **Payment amount**: `src/_data/site.ts` (single source of truth)
- **Site metadata**: `src/_data/site.ts`

### Code Changes
- **Section templates**: `src/_includes/sections/{section}/index.njk`
- **Section logic**: `src/_includes/sections/{section}/index.ts`
- **UI components**: `src/components/ui/`
- **Styling**: `src/assets/css/main.css` (Tailwind v4 theme)
- **Analytics**: `src/assets/js/config/constants.ts`

---

## 🚨 Common Issues

### TypeScript Errors
```bash
# Always use .js extensions for local imports (ESM requirement)
# ✅ Correct
import { initCheckout } from './checkout/index.js';

# ❌ Wrong
import { initCheckout } from './checkout/index.ts';

# Check all errors
npm run type-check
```

### Build Failures
```bash
# Clear caches and rebuild
rm -rf node_modules _site .cache
npm ci
npm run build
```

### Node.js Version Issues
```bash
# Check version (requires 22.17.1+)
node --version

# Fix with nvm
nvm install 22.17.1 && nvm use 22.17.1
```

### Environment Variables Not Loading
```bash
# Check .env file exists and has correct variables
cp .env.example .env
# Edit .env with your keys

# For Netlify functions
npm run netlify:dev  # Port 8888 (not 8080)
```

---

## 📖 Documentation

### Core Docs
- **`docs/SETUP.md`** - Environment setup & integrations
- **`docs/DEVELOPMENT.md`** - File structure & development guide  
- **`docs/STRIPE_TEST_CARDS.md`** - Payment testing cards
- **`docs/PAYMENT_TESTING_SUMMARY.md`** - Payment flow testing
- **`CLAUDE.md`** - AI coding guidelines
- **`docs/design/`** - Design principles & section guides

### Quick Reference
- **Environment template**: `.env.example`
- **Payment testing**: Use `docs/STRIPE_TEST_CARDS.md`
- **Performance audit**: `npm run lighthouse`
- **Type checking**: `npm run type-check`

### Project Structure
```
src/
├── _data/              # JSON/TS data files
│   ├── sections/       # Section content (hero, about, etc.)
│   ├── site.ts         # Site metadata
│   └── pages.ts        # Page configurations
├── _includes/          # Templates & components
│   ├── sections/       # Section templates + logic
│   └── partials/       # Reusable template parts
├── assets/             # Static assets
│   ├── css/            # Tailwind CSS entry
│   └── js/             # TypeScript utilities
├── components/         # UI components
│   └── ui/             # Accordion, analytics, animations
└── pages/              # Page templates (privacy, terms, etc.)

netlify/functions/      # Serverless functions
├── create-payment-intent.ts
├── mailerlite-lead.ts
└── stripe-webhook.ts
```

---

**Note**: Conversion-optimized landing page for female entrepreneurs in Lisbon, following direct marketing principles with elegant design.