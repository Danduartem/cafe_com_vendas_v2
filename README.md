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
- **Analytics**: Advanced plugin-based architecture with GTM, Performance, Section Tracking, Error Handling, and Scroll Tracking plugins
- **Deployment**: Netlify (Functions + static hosting)

## 🚀 Quick Start

```bash
# Install dependencies (requires Node 22.17.1+)
npm install

# Development (recommended: Vite watch + Eleventy)
npm run dev:watch         # Vite build --watch + Eleventy dev server

# Alternative (content-only)
npm run dev               # Eleventy dev server (port 8080)

# With Netlify Functions
npm run netlify:dev       # Full stack (site + functions) on 8888

# Quality checks (must pass all)
npm run type-check        # TypeScript validation
npm run lint              # ESLint validation  
npm test                  # Vitest unit tests

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
- **Analytics**: `src/analytics/` (unified plugin-based system)
- **Assets** (hashed): Use the Eleventy filter to resolve built assets

```njk
{# CSS #}
<link rel="stylesheet" href="{{ 'src/assets/css/main.css' | asset }}">

{# JS #}
<script type="module" src="{{ 'src/assets/js/main.ts' | asset }}"></script>
```

This uses Vite’s manifest (generated on build) and falls back to non‑hashed paths in dev.

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
- **Dev flow**: `npm run dev:watch` (Vite watch + Eleventy)
- **Asset filter**: `{{ 'src/assets/js/main.ts' | asset }}` resolves hashed file from manifest

### Project Structure
```
src/
├── _data/              # JSON/TS data files
│   ├── sections/       # Section content (hero, about, etc.)
│   ├── site.ts         # Site metadata & centralized pricing
│   ├── pages.ts        # Page configurations
│   └── types.ts        # Data type definitions
├── _includes/          # Templates & components
│   ├── sections/       # Section templates + logic (co-located)
│   └── partials/       # Reusable template parts
├── admin/              # Admin dashboard system
│   └── dashboard/      # Admin interface components
├── analytics/          # Advanced plugin-based analytics system
│   ├── core/           # Analytics engine with plugin architecture
│   ├── plugins/        # GTM, Performance, Section, Error, Scroll plugins
│   ├── types/          # TypeScript definitions & event schemas
│   ├── utils/          # Debug utilities and helpers
│   └── index.ts        # Unified API & AnalyticsHelpers
├── assets/             # Static assets
│   ├── css/            # Tailwind CSS entry
│   └── js/             # TypeScript app, config, and utilities
├── components/         # UI components
│   └── ui/             # Accordion, animations, thank-you modal
├── types/              # Comprehensive TypeScript definitions
│   ├── components/     # Component interfaces
│   ├── data/           # Data type definitions
│   ├── sections/       # Section-specific types
│   └── global/         # Global type definitions
├── utils/              # Utility functions
│   ├── browser-data.ts # Enhanced tracking & attribution
│   ├── event-tracking.ts # Event tracking utilities
│   ├── monitoring.ts   # Performance monitoring
│   ├── youtube.ts      # YouTube API integration
│   └── validation.ts   # Form validation utilities
└── pages/              # Page templates (privacy, terms, etc.)

netlify/functions/      # Advanced serverless functions (13 total)
├── create-payment-intent.ts   # Payment initialization
├── stripe-webhook.ts          # Payment confirmation
├── mailerlite-lead.ts         # Lead capture integration
├── mailerlite-helpers.ts      # MailerLite utilities
├── crm-integration.ts         # CRM system integration
├── crm-types.ts              # CRM type definitions
├── server-gtm.ts             # Server-side GTM tracking
├── metrics-collection.ts      # Performance metrics
├── health-check.ts           # System health monitoring
├── dlq-handler.ts            # Dead letter queue processing
├── pii-hash.ts              # Privacy-compliant data hashing
├── shared-utils.ts           # Shared function utilities
└── types.ts                  # Function type definitions
```

---

## 🔧 Advanced Features

### Admin Dashboard
- **Location**: `src/admin/dashboard/index.ts`
- **Purpose**: Internal dashboard for monitoring event metrics, payments, and analytics
- **Access**: Requires proper authentication (see docs/SETUP.md)
- **Features**: Real-time metrics, payment status, attendee management

### Enhanced Analytics System
- **Architecture**: Plugin-based system with 5+ specialized plugins
- **Core Plugins**:
  - **GTM Plugin**: Google Tag Manager integration with event normalization
  - **Performance Plugin**: Core Web Vitals tracking (LCP, FID, CLS, INP)
  - **Section Tracking Plugin**: IntersectionObserver-based section visibility
  - **Error Plugin**: Global error handling with deduplication
  - **Scroll Tracking Plugin**: Scroll depth milestone tracking
- **API**: Unified AnalyticsHelpers interface for common tracking patterns
- **Initialization**: Automatic setup with `initializeAnalytics()` in main app

### Advanced Netlify Functions (13 total)
**Payment & Commerce**:
- `create-payment-intent.ts` - Stripe payment initialization
- `stripe-webhook.ts` - Payment confirmation and fulfillment

**CRM & Lead Management**:
- `mailerlite-lead.ts` - Lead capture integration
- `mailerlite-helpers.ts` - MailerLite API utilities  
- `crm-integration.ts` - Advanced CRM system integration
- `crm-types.ts` - CRM type definitions

**Analytics & Monitoring**:
- `server-gtm.ts` - Server-side Google Tag Manager
- `metrics-collection.ts` - Performance metrics collection
- `health-check.ts` - System health monitoring

**Infrastructure**:
- `dlq-handler.ts` - Dead letter queue processing
- `pii-hash.ts` - Privacy-compliant data hashing
- `shared-utils.ts` - Common function utilities
- `types.ts` - Shared function type definitions

### Enhanced Monitoring
- **Browser Data Collection**: Advanced attribution and behavior tracking
- **Performance Monitoring**: Real-time Core Web Vitals and custom metrics
- **Event Tracking**: Sophisticated event tracking with enhanced context
- **Error Handling**: Comprehensive error tracking with deduplication

---

**Note**: Conversion-optimized landing page for female entrepreneurs in Lisbon, following direct marketing principles with elegant design and enterprise-grade technical architecture.
