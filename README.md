# Café com Vendas Landing Page

Premium landing page for an intimate business transformation event in Lisbon, designed for female entrepreneurs seeking to scale their businesses without burnout.

## 🎯 Project Overview

**Event**: Café com Vendas - Business transformation workshop  
**Date**: September 20, 2025  
**Location**: Lisbon, Portugal  
**Audience**: Female entrepreneurs (8 exclusive spots)  
**Language**: Portuguese (pt-PT)  

## 🛠 Tech Stack

- **Framework**: [Eleventy](https://www.11ty.dev/) 3.1.2 (Static Site Generator)
- **Templating**: Nunjucks (.njk files)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.1.12 + PostCSS 8.5.6 (pure CSS-based configuration)
- **Build Tool**: [Vite](https://vite.dev/) 7.1.2 (ES6 modules → optimized bundle)
- **Runtime**: Node.js 22.18.0 (LTS) + npm 10.9.3
- **Payments**: Stripe 18.4.0 (Node.js SDK)
- **Design System**: JSON tokens → CSS custom properties
- **Fonts**: Local Lora (display) + Century Gothic (body)
- **JavaScript**: Modular ES6 architecture (performance optimized)
- **Edge**: Netlify Edge Functions (CSP header)

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

# Clean build directory
npm run clean
```

## 📁 Project Structure

```
├── src/
│   ├── _includes/
│   │   ├── layout.njk           # Base HTML template
│   │   └── components/*.njk     # Section components
│   ├── _data/                   # Eleventy data layer
│   │   ├── site.js             # Site metadata
│   │   ├── event.js            # Event data (from DATA_event.json)
│   │   ├── avatar.js           # Target persona data
│   │   ├── testimonials.js     # Customer testimonials
│   │   └── tokens.js           # Design tokens
│   ├── index.njk               # Main landing page
│   ├── politica-privacidade.njk # Privacy policy
│   ├── termos-condicoes.njk    # Terms & conditions
│   └── assets/
│       ├── css/main.css        # Tailwind + tokens
│       ├── js/main.js          # All JavaScript
│       └── fonts/              # Local fonts
├── info/                       # Design system & content
│   ├── DATA_design_tokens.json      # Unified design system
│   ├── DATA_event.json               # Event details & pricing
│   ├── DATA_avatar.json              # Target persona & objections
│   ├── CONTENT_copy_library.md       # Copy examples & headlines
│   ├── GUIDE_voice_tone.md           # Voice & tone guidelines
│   ├── GUIDE_brand_visual.md         # Brand guidelines
│   └── BUILD_landing_page.md         # Development blueprint
├── docs/                       # Technical documentation
│   ├── GTM_SETUP_GUIDE.md      # Google Tag Manager configuration
│   ├── DEVELOPMENT_GUIDELINES.md    # Security & code patterns
│   ├── ACCESSIBILITY_GUIDELINES.md  # WCAG AA compliance guide
│   └── STRIPE_TEST_CARDS.md     # Payment testing procedures
├── .claude/                    # Custom Claude Code commands (14 total)
│   ├── commands/
│   │   ├── update-libs.md      # Dependency updates
│   │   ├── update-refactor.md  # Code refactoring
│   │   ├── commit.md           # Smart git commits
│   │   ├── push.md             # Safe deployment
│   │   ├── lighthouse.md       # Performance audits
│   │   ├── stripe-test.md      # Payment testing
│   │   ├── copy-pick.md        # Copy optimization
│   │   ├── design-pick.md      # Design prototyping
│   │   ├── conversion-optimize.md   # CRO techniques
│   │   ├── landing-page-strategy.md # Strategic optimization
│   │   ├── email-generator.md  # Email campaigns
│   │   ├── online-bizplan.md   # Business planning
│   │   └── rollback-deploy.md  # Emergency procedures
│   └── agents/                 # Specialized AI agents (9 total)
├── bizplan/                    # Business strategy artifacts
├── copy-pick/                  # Copy optimization experiments
├── strategy/                   # Strategic planning materials
└── CLAUDE.md                   # AI development guidelines
```

## 🎨 Design System

The design system is centralized in `info/DATA_design_tokens.json` and automatically converted to CSS custom properties:

- **Colors**: Navy `#191F3A`, Burgundy `#81171F`, Neutral `#ECECEC`
- **Typography**: Lora (headings), Century Gothic (body)
- **Spacing**: Consistent scale from `xs` to `5xl`
- **Build Process**: `npm run tokens:build` generates CSS variables

## 📄 Landing Page Sections

1. **Hero** - Hook + primary CTA
2. **Problem** - Pain point validation
3. **Solution** - 5-pillar transformation approach
4. **Social Proof** - Customer testimonials
5. **Offer** - Pricing + 90-day guarantee
6. **FAQ** - Common objections addressed
7. **Final CTA** - Urgency + scarcity

## 🔧 Development Guidelines

### Code Standards
- **CSS**: Pure Tailwind utilities only (NO custom CSS)
- **JavaScript**: Modular ES6 components (NO inline scripts)
- **Templates**: Semantic HTML with proper ARIA labels
- **Performance**: WebP images, lazy loading, LCP optimization

### Build Process
1. `DATA_design_tokens.json` → CSS custom properties
2. Tailwind v4 processes CSS via `@theme` block configuration
3. Vite bundles modular ES6 JavaScript into optimized output
4. Eleventy generates static HTML
5. PostCSS optimizes final CSS

**Note**: Modern ESM architecture with Vite bundling. Uses Tailwind v4's pure CSS-based configuration.

### Critical Rules
- ❌ No `element.style.*` assignments
- ❌ No `<style>` blocks or `style=""` attributes  
- ❌ No hardcoded colors/values (use design tokens)
- ❌ No inline event handlers (`onclick=""`, `onsubmit=""`)
- ❌ No inline JavaScript (`<script>` without src)
- ✅ Only `element.classList` manipulation
- ✅ Tailwind utilities for all styling
- ✅ Design token CSS variables
- ✅ Event handlers via `addEventListener()` only
- ✅ ARIA roles for interactive elements

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