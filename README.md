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
- **Design System**: JSON tokens → CSS custom properties
- **Fonts**: Local Lora (display) + Century Gothic (body)
- **JavaScript**: Vanilla JS (performance optimized)

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
├── documentation/              # API integration docs
│   ├── eleventy-11ty.md        # Eleventy reference
│   ├── tailwind-css.md         # Tailwind reference
│   ├── paypal-integration.md   # Payment integration
│   ├── google-analytics.md     # Analytics setup
│   ├── whatsapp-integration.md # WhatsApp contact
│   └── youtube-api.md          # Video embeds
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
- **JavaScript**: Vanilla JS in `main.js` only (NO inline scripts)
- **Templates**: Semantic HTML with proper ARIA labels
- **Performance**: WebP images, lazy loading, LCP optimization

### Build Process
1. `DATA_design_tokens.json` → CSS custom properties
2. Tailwind v4 processes CSS via `@theme` block configuration
3. Eleventy generates static HTML
4. PostCSS optimizes final CSS

**Note**: Uses Tailwind v4's pure CSS-based configuration - no `tailwind.config.js` file needed.

### Critical Rules
- ❌ No `element.style.*` assignments
- ❌ No `<style>` blocks or `style=""` attributes  
- ❌ No hardcoded colors/values (use design tokens)
- ✅ Only `element.classList` manipulation
- ✅ Tailwind utilities for all styling
- ✅ Design token CSS variables

## 📊 Analytics & Conversion

- **Google Analytics 4** with custom events
- **PayPal** payment integration
- **WhatsApp** direct contact button
- **Performance tracking** (LCP, scroll depth, CTAs)

## 🚀 Deployment

Built static files are generated in `_site/` directory and can be deployed to any static hosting provider (Netlify, Vercel, AWS S3, etc.).

## 📖 Documentation

- `/documentation/` - API integration references
- `CLAUDE.md` - Development guidelines for AI assistance
- Component templates and development patterns included

## 🎯 Business Goals

- **Target**: 8 exclusive event spots
- **Conversion Focus**: Premium pricing with social proof
- **User Experience**: Elegant, mobile-first, fast loading
- **Trust Elements**: Testimonials, guarantee, secure payment

---

**Note**: This is a conversion-optimized landing page following proven direct marketing principles while maintaining an elegant, sophisticated aesthetic suitable for the target demographic of successful female entrepreneurs.