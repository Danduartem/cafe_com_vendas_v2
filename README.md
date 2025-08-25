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

## 📖 Documentation

### Core Docs (`docs/`)
- **`SETUP.md`** - Environment variables, integrations, deployment
- **`edit-map.md`** - File structure map for content & code edits
- **`STRIPE_TEST_CARDS.md`** - Test card numbers for payment flows
- **`PAYMENT_TESTING_SUMMARY.md`** - Payment testing checklist
- **`TROUBLESHOOTING.md`** - Common issues and solutions
- **`GTM_CONFIGURATION_REFERENCE.md`** - Google Tag Manager setup
- **`PERFORMANCE.md`** - Lighthouse targets and optimization
- **`DEPLOYMENT.md`** - Production deployment checklist

### Development
- **`CLAUDE.md`** - AI coding guidelines & workflow
- **`.env.example`** - Required environment variables template

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