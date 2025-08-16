# Café com Vendas Landing Page

Premium landing page for an intimate business transformation event in Lisbon, designed for female entrepreneurs seeking to scale their businesses without burnout.

## 🎯 Project Overview

**Event**: Café com Vendas - Business transformation workshop  
**Date**: September 20, 2025  
**Location**: Lisbon, Portugal  
**Audience**: Female entrepreneurs (8 exclusive spots)  
**Language**: Portuguese (pt-PT)  

## 🛠 Tech Stack

- **Framework**: [Eleventy](https://www.11ty.dev/) (Static Site Generator)
- **Templating**: Nunjucks (.njk files)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + PostCSS (pure CSS-based configuration)
- **Build Tool**: [Vite](https://vite.dev/) (ES6 modules → optimized bundle)
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
│   ├── GUIDE_claude_instructions.md  # Claude context & instructions
│   └── BUILD_landing_page.md         # Development blueprint
├── .claude/                    # Custom Claude Code commands
│   └── commands/
│       ├── update-libs.md      # Dependency update command
│       └── update-refactor.md  # Code refactoring command
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

- **Google Tag Manager (GTM)** loaded via module (no inline JS) with noscript iframe fallback
- **Google Analytics 4** events dispatched via app modules (optional through GTM)
- **Stripe** payment integration  
- **WhatsApp** direct contact button
- **Performance tracking** (LCP, scroll depth, CTAs)

### GTM Setup
- Set `VITE_GTM_CONTAINER_ID` in Netlify environment variables (e.g., `GTM-XXXXXXX`).
- GTM loads from `src/assets/js/components/gtm.js` (pushes `gtm.start` to `dataLayer` then injects `gtm.js`).
- Noscript iframe is rendered only when `site.analytics.gtmId` is present (mapped from `VITE_GTM_CONTAINER_ID`).

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
- **Performance**: 84/100 (Mobile), 90+ (Desktop)
- **Accessibility**: 95/100
- **Best Practices**: 100/100
- **SEO**: 95/100

### Optimizations Implemented
- **Stripe.js Lazy Loading**: -187 KiB (-1.65s) from initial load
- **Image Optimization**: WebP format with lazy loading
- **Font Optimization**: Local fonts with proper preloading
- **JavaScript**: Tree-shaken ES6 modules (41 KiB gzipped)
- **CSS**: Pure Tailwind utilities with PostCSS optimization

## 🚀 Deployment

Built static files are generated in `_site/` and deployed to Netlify with automated builds from GitHub.

### Environment Variables
- `VITE_STRIPE_PUBLIC_KEY` (publishable)
- `STRIPE_SECRET_KEY` (functions)
- `VITE_FORMSPREE_FORM_ID`
- `VITE_GTM_CONTAINER_ID`

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