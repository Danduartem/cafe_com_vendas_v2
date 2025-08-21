# Café com Vendas - Project File Structure (v2.0)

## 📋 Project Overview
**Café com Vendas** is a high-converting landing page for an intimate business event targeting female entrepreneurs in Portugal. The project uses a modern JAMstack architecture with **feature-first co-located sections** and **i18n-ready content structure**.

**Target**: 8-spot premium event (September 20, 2025, Lisbon)  
**Audience**: Overworked female entrepreneurs seeking business transformation  
**Language**: Portuguese (pt-PT) - **Ready for i18n expansion**  
**Architecture**: Feature-first co-located sections + platform layer foundation

---

## 🗂️ New Architecture File Structure

```
cafe-com-vendas-v2/
├── 📄 CLAUDE.md                          # Claude Code project instructions & guidelines
├── 📄 README.md                          # Project documentation and setup guide
├── 📄 package.json                       # NPM dependencies and build scripts
├── 📄 package-lock.json                  # Locked dependency versions
├── 📄 .eleventy.js                       # Eleventy SSG configuration (ESM)
├── 📄 vite.config.js                     # Vite bundler configuration
├── 📄 postcss.config.js                  # PostCSS + Tailwind CSS processing
├── 📄 eslint.config.js                   # ESLint code quality rules
├── 📄 netlify.toml                       # Netlify deployment & function configuration
├── 📄 file_structure.md                  # This documentation file
│
├── 📁 content/                            # 🌍 I18N-READY CONTENT STRUCTURE
│   └── 📁 pt-PT/                         # ✅ PORTUGUESE CONTENT (primary language)
│       ├── 📄 site.json                  # Global site metadata & SEO settings
│       ├── 📄 event.json                 # Event data (prices, dates, spots, logistics)
│       ├── 📄 avatar.json                # Customer persona & pain points analysis
│       ├── 📄 design_tokens.json         # Unified design system (colors, typography, spacing)
│       ├── 📄 faq.json                   # FAQ content & objection handling
│       ├── 📄 testimonials.json          # Customer testimonials & social proof
│       ├── 📄 presenter.json             # Speaker/presenter information & bio
│       ├── 📄 pillars.json               # Solution framework & methodology data
│       ├── 📄 footer.json                # Footer links, stats & company info
│       ├── 📄 legal.json                 # Legal pages content (privacy, terms, refund)
│       └── 📄 angles-library.json        # Copywriting angles & messaging library
│   └── 📁 en-GB/                         # 🔮 FUTURE: English content (ready for expansion)
│   └── 📁 es-ES/                         # 🔮 FUTURE: Spanish content (ready for expansion)
│
├── 📁 src/                               # 🎯 SOURCE CODE - All development files
│   ├── 📄 index.njk                      # Main landing page template (composes sections)
│   ├── 📄 garantia-reembolso.njk         # Legal: refund guarantee page
│   ├── 📄 politica-privacidade.njk       # Legal: privacy policy page
│   ├── 📄 termos-condicoes.njk           # Legal: terms & conditions page
│   ├── 📄 thank-you.njk                  # Post-purchase confirmation page
│   │
│   ├── 📁 _data/                         # 🗃️ DATA ADAPTERS - Load from content/pt-PT
│   │   ├── 📄 site.js                    # ✅ UPDATED: Loads content/pt-PT/site.json
│   │   ├── 📄 event.js                   # ✅ UPDATED: Loads content/pt-PT/event.json
│   │   ├── 📄 avatar.js                  # ✅ UPDATED: Loads content/pt-PT/avatar.json
│   │   ├── 📄 tokens.js                  # ✅ UPDATED: Loads content/pt-PT/design_tokens.json
│   │   ├── 📄 faq.js                     # ✅ UPDATED: Loads content/pt-PT/faq.json
│   │   ├── 📄 testimonials.js            # ✅ UPDATED: Loads content/pt-PT/testimonials.json
│   │   ├── 📄 presenter.js               # ✅ UPDATED: Loads content/pt-PT/presenter.json
│   │   ├── 📄 pillars.js                 # ✅ UPDATED: Loads content/pt-PT/pillars.json
│   │   ├── 📄 footer.js                  # ✅ UPDATED: Loads content/pt-PT/footer.json
│   │   ├── 📄 legal.js                   # ✅ UPDATED: Loads content/pt-PT/legal.json
│   │   └── 📄 csp.js                     # Content Security Policy configuration
│   │
│   ├── 📁 _includes/                     # 🧩 TEMPLATES & SECTIONS
│   │   ├── 📄 layout.njk                 # Base HTML layout with meta tags
│   │   │
│   │   ├── 📁 sections/                  # 🏗️ CO-LOCATED SECTIONS (template + logic together)
│   │   │   ├── 📁 hero/                  # ✅ MIGRATED: Complete co-located section
│   │   │   │   ├── 📄 index.njk          # Hero template (HTML structure)
│   │   │   │   └── 📄 index.ts           # Hero logic (interactions & animations)
│   │   │   │
│   │   │   ├── 📁 offer/                 # ✅ MIGRATED: Complete co-located section  
│   │   │   │   ├── 📄 index.njk          # Offer template (pricing & guarantee)
│   │   │   │   └── 📄 index.ts           # Offer logic (MBWay toggle & analytics)
│   │   │   │
│   │   │   ├── 📁 problem/               # 🔮 FUTURE: To be migrated to co-located
│   │   │   ├── 📁 solution/              # 🔮 FUTURE: To be migrated to co-located
│   │   │   ├── 📁 about/                 # 🔮 FUTURE: To be migrated to co-located
│   │   │   ├── 📁 social-proof/          # 🔮 FUTURE: To be migrated to co-located
│   │   │   ├── 📁 faq/                   # 🔮 FUTURE: To be migrated to co-located
│   │   │   ├── 📁 final-cta/             # 🔮 FUTURE: To be migrated to co-located
│   │   │   └── 📁 footer/                # 🔮 FUTURE: To be migrated to co-located
│   │   │
│   │   ├── 📁 components/                # 🔄 REMAINING SECTIONS (old structure - to be migrated)
│   │   │   ├── 📄 top-banner.njk         # Urgency banner (limited spots)
│   │   │   ├── 📄 problem.njk            # Pain point validation
│   │   │   ├── 📄 solution.njk           # 5-pillar framework solution
│   │   │   ├── 📄 about.njk              # Presenter credibility section
│   │   │   ├── 📄 social-proof.njk       # Testimonials & success stories
│   │   │   ├── 📄 faq.njk                # FAQ accordion
│   │   │   ├── 📄 final-cta.njk          # Bottom conversion section
│   │   │   ├── 📄 footer.njk             # Footer with legal links
│   │   │   ├── 📄 checkout-modal.njk     # Stripe payment modal
│   │   │   ├── 📄 whatsapp-button.njk    # WhatsApp contact widget
│   │   │   └── 📄 legal-page.njk         # Template for legal pages
│   │   │
│   │   └── 📁 partials/                  # 🔗 SHARED PARTIALS - Common elements
│   │       ├── 📄 back-navigation.njk    # Back button component
│   │       ├── 📄 footer-schema.njk      # Schema.org structured data
│   │       ├── 📄 footer-social-links.njk # Social media links
│   │       ├── 📄 footer-stat-card.njk   # Footer statistics cards
│   │       └── 📄 icons.njk              # SVG icon definitions
│   │
│   ├── 📁 assets/                        # 🎨 STATIC ASSETS - CSS, JS, Images, Fonts
│   │   │
│   │   ├── 📁 css/                       # 🎨 STYLES - Tailwind + Design System
│   │   │   ├── 📄 main.css               # Main CSS entry (Tailwind + tokens)
│   │   │   └── 📄 _tokens.generated.css  # ✅ UPDATED: Generated from content/pt-PT/design_tokens.json
│   │   │
│   │   ├── 📁 js/                        # ⚡ JAVASCRIPT - Current modular architecture
│   │   │   ├── 📄 main.js                # Entry point - imports & initializes app
│   │   │   ├── 📄 app.js                 # ✅ UPDATED: Imports co-located sections
│   │   │   │
│   │   │   ├── 📁 config/                # ⚙️ CONFIGURATION
│   │   │   │   ├── 📄 constants.js       # App constants & settings
│   │   │   │   └── 📄 environment.js     # Environment-specific config
│   │   │   │
│   │   │   ├── 📁 core/                  # 🧠 CORE SYSTEMS
│   │   │   │   ├── 📄 analytics.js       # GTM/GA4 tracking & events
│   │   │   │   └── 📄 state.js           # Application state management
│   │   │   │
│   │   │   ├── 📁 utils/                 # 🛠️ UTILITIES - Shared helpers
│   │   │   │   ├── 📄 dom.js             # DOM manipulation helpers
│   │   │   │   ├── 📄 animations.js      # Animation utilities
│   │   │   │   ├── 📄 throttle.js        # Performance throttling
│   │   │   │   ├── 📄 css-loader.js      # Dynamic CSS loading
│   │   │   │   ├── 📄 scroll-tracker.js  # Scroll behavior tracking
│   │   │   │   ├── 📄 gtm-normalizer.js  # GTM data normalization
│   │   │   │   └── 📄 index.js           # ✅ UPDATED: Utilities barrel export
│   │   │   │
│   │   │   └── 📁 components/            # 🧩 REMAINING COMPONENTS (old structure)
│   │   │       ├── 📄 banner.js          # Top banner interactions
│   │   │       ├── 📄 about.js           # About section behavior
│   │   │       ├── 📄 faq.js             # FAQ accordion functionality
│   │   │       ├── 📄 testimonials.js    # Testimonials carousel
│   │   │       ├── 📄 final-cta.js       # Final CTA behavior
│   │   │       ├── 📄 footer.js          # Footer interactions
│   │   │       ├── 📄 checkout.js        # Stripe checkout integration
│   │   │       ├── 📄 gtm.js             # Google Tag Manager setup
│   │   │       ├── 📄 youtube.js         # YouTube embed handling
│   │   │       ├── 📄 thank-you.js       # Thank you page logic
│   │   │       ├── 📄 cloudinary.js      # Image optimization
│   │   │       └── 📄 index.js           # ✅ UPDATED: Components barrel export (Hero/Offer removed)
│   │   │
│   │   ├── 📁 fonts/                     # 🔤 TYPOGRAPHY - Local font files
│   │   │   ├── 📁 Lora/                  # Display font (headings, elegance)
│   │   │   │   ├── 📄 Lora-400.woff2     # Regular weight
│   │   │   │   ├── 📄 Lora-500.woff2     # Medium weight  
│   │   │   │   ├── 📄 Lora-600.woff2     # Semi-bold weight
│   │   │   │   ├── 📄 Lora-700.woff2     # Bold weight
│   │   │   │   └── 📄 Lora-*-Italic.woff2 # Italic variants
│   │   │   │
│   │   │   └── 📁 CenturyGothic/         # Body font (readability, professional)
│   │   │       ├── 📄 CenturyGothic-Regular.woff
│   │   │       ├── 📄 CenturyGothic-Bold.woff
│   │   │       ├── 📄 CenturyGothic-Italic.woff
│   │   │       └── 📄 CenturyGothic-BoldItalic.woff
│   │   │
│   │   └── 📁 pictures/                  # 🖼️ IMAGES - Optimized visuals
│   │       ├── 📄 cafe.jpg               # Hero background image
│   │       ├── 📄 problem-overworked.jpg # Problem section visual
│   │       └── 📄 sobre3.jpeg            # About/presenter photo
│   │
│   ├── 📁 platform/                      # 🏗️ PLATFORM FOUNDATION - Future architecture
│   │   ├── 📁 lib/                       # 🛠️ PLATFORM UTILITIES (copied from assets/js/utils)
│   │   │   └── 📁 utils/                 # Animation, DOM, performance utilities
│   │   │       ├── 📄 animations.js      # Animation utilities
│   │   │       ├── 📄 dom.js             # DOM manipulation helpers
│   │   │       ├── 📄 throttle.js        # Performance throttling
│   │   │       ├── 📄 scroll-tracker.js  # Scroll behavior tracking
│   │   │       ├── 📄 gtm-normalizer.js  # GTM data normalization
│   │   │       ├── 📄 css-loader.js      # Dynamic CSS loading
│   │   │       └── 📄 index.js           # Utilities barrel export
│   │   │
│   │   ├── 📁 analytics/                 # 📊 PLATFORM ANALYTICS (copied from assets/js/core)
│   │   │   └── 📁 core/                  # Analytics and state management
│   │   │       ├── 📄 analytics.js       # GTM/GA4 tracking & events
│   │   │       └── 📄 state.js           # Application state management
│   │   │
│   │   ├── 📁 ui/                        # 🎨 PLATFORM UI - Global components & partials
│   │   │   ├── 📁 components/            # 🔮 FUTURE: Button, Badge, Card, etc.
│   │   │   └── 📁 partials/              # 🔮 FUTURE: Global partials
│   │   │
│   │   ├── 📁 styles/                    # 🎨 PLATFORM STYLES - Centralized CSS
│   │   │   ├── 📄 main.css               # 🔮 FUTURE: Tailwind entry + base layers
│   │   │   ├── 📄 base.css               # 🔮 FUTURE: Resets, typography
│   │   │   └── 📄 tokens.generated.css   # 🔮 FUTURE: Design tokens CSS
│   │   │
│   │   └── 📁 eleventy/                  # 🔧 PLATFORM ELEVENTY - Config modules
│   │       ├── 📄 filters.ts             # 🔮 FUTURE: Custom Nunjucks filters
│   │       ├── 📄 shortcodes.ts          # 🔮 FUTURE: Custom shortcodes
│   │       ├── 📄 collections.ts         # 🔮 FUTURE: Custom collections
│   │       └── 📄 transforms.ts          # 🔮 FUTURE: HTML transforms
│   │
│   ├── 📁 public/                        # 🌐 PUBLIC STATIC FILES - Copied as-is
│   │   ├── 📄 _headers                   # Netlify HTTP headers config
│   │   ├── 📄 favicon.ico                # Browser favicon
│   │   └── 📄 favicon.svg                # Modern SVG favicon
│   │
│   └── 📁 schema/                        # 🏷️ STRUCTURED DATA - SEO & rich snippets
│       └── 📄 faq.json.njk               # FAQ schema markup template
│
├── 📁 info/                              # ❌ DEPRECATED - Old content structure (still exists but unused)
│   ├── 📄 DATA_*.json                    # Old content files (superseded by content/pt-PT/)
│   ├── 📄 CONTENT_copy_library.md        # Copy examples & headlines
│   ├── 📄 GUIDE_voice_tone.md            # Brand voice guidelines
│   ├── 📄 GUIDE_brand_visual.md          # Visual brand guidelines
│   └── 📄 BUILD_landing_page.md          # Development blueprint
│
├── 📁 netlify/                           # ☁️ SERVERLESS FUNCTIONS - Backend logic
│   ├── 📁 functions/                     # 💳 PAYMENT & INTEGRATIONS
│   │   ├── 📄 create-payment-intent.js   # Stripe payment processing
│   │   ├── 📄 stripe-webhook.js          # Stripe webhook handler
│   │   └── 📄 mailerlite-lead.js         # Email list integration
│   │
│   └── 📁 edge-functions/                # ⚡ EDGE COMPUTING
│       └── 📄 csp.js                     # Content Security Policy enforcement
│
├── 📁 scripts/                           # 🔧 BUILD TOOLS - Development utilities
│   └── 📄 build-tokens.js                # ✅ UPDATED: Design tokens → CSS (reads from content/pt-PT)
│
├── 📁 _site/                             # 🏗️ BUILD OUTPUT - Generated static files
│   ├── 📄 index.html                     # Generated landing page
│   ├── 📁 assets/                        # Processed assets (CSS, JS, fonts, images)
│   ├── 📁 garantia-reembolso/            # Legal pages directories
│   ├── 📁 politica-privacidade/
│   ├── 📁 termos-condicoes/
│   └── 📁 thank-you/
│
├── 📁 tests/                             # 🧪 TESTING INFRASTRUCTURE (ready for Phase 7)
│   ├── 📁 unit/                          # 🔮 FUTURE: Vitest unit tests
│   └── 📁 e2e/                           # 🔮 FUTURE: Playwright E2E tests
│
├── 📁 docs/                              # 📖 TECHNICAL DOCUMENTATION
│   ├── 📄 DEVELOPMENT_GUIDELINES.md      # Development best practices
│   ├── 📄 ACCESSIBILITY_GUIDELINES.md    # WCAG compliance guide
│   ├── 📄 PERFORMANCE_MONITORING.md      # Performance optimization
│   ├── 📄 SECURITY_BEST_PRACTICES.md     # Security guidelines
│   ├── 📄 GTM_SETUP_GUIDE.md            # Google Tag Manager setup
│   ├── 📄 GTM_CONFIGURATION_REFERENCE.md # GTM configuration reference
│   ├── 📄 STRIPE_TEST_CARDS.md          # Payment testing guide
│   ├── 📄 PAYMENT_TESTING_SUMMARY.md    # Payment flow testing
│   └── 📄 CLOUDINARY_SETUP.md           # Image optimization setup
│
├── 📁 reports/                           # 📊 PERFORMANCE REPORTS - Lighthouse audits
│   ├── 📄 lighthouse-desktop.report.html
│   ├── 📄 lighthouse-mobile.report.html
│   └── 📁 lighthouse-* (various audit files)
│
├── 📁 copy-pick/                         # ✏️ COPY TESTING - A/B test variants
├── 📁 bizplan/                           # 📈 BUSINESS ANALYSIS
├── 📁 strategy/                          # 🎯 MARKETING STRATEGY
└── 📁 node_modules/                      # 📦 NPM DEPENDENCIES (auto-generated)
```

---

## 🏗️ New Architecture Explanation

### What Changed in v2.0 Refactoring?

#### **1. i18n-Ready Content Structure**
```
📁 content/pt-PT/     → Portuguese content (primary)
📁 content/en-GB/     → English content (future)
📁 content/es-ES/     → Spanish content (future)
```
- **Before**: Content mixed with code in `info/` directory
- **After**: Clean separation with language-specific folders
- **Benefit**: Easy to add new markets without touching code

#### **2. Co-located Section Architecture**
```
📁 src/_includes/sections/hero/
├── index.njk         → Template (HTML structure)  
└── index.ts          → Logic (interactions & animations)
```
- **Before**: Templates in `_includes/components/`, logic in `assets/js/components/`
- **After**: Each section contains both template and logic in one place
- **Benefit**: Single-touch edits, easier maintenance

#### **3. Platform Layer Foundation**
```
📁 src/platform/
├── lib/              → Shared utilities (DOM, animations, performance)
├── analytics/        → Analytics and state management
├── ui/               → Global components and partials (future)
├── styles/           → Centralized CSS system (future)
└── eleventy/         → Eleventy configuration modules (future)
```
- **Purpose**: Clean abstraction layer for shared functionality
- **Status**: Foundation created, ready for future phases

#### **4. Updated Data Flow**
```
📄 content/pt-PT/*.json 
    ↓ (loaded by)
📄 src/_data/*.js 
    ↓ (feeds)  
📄 src/_includes/*.njk 
    ↓ (compiled by)
📄 _site/*.html
```
- **Before**: Data adapters loaded from `info/DATA_*.json`
- **After**: Data adapters load from `content/pt-PT/*.json`
- **Benefit**: Content editors work in dedicated content directory

---

## 🎯 Migration Status & Roadmap

### ✅ **Completed (Phases 1-2)**

| Component | Status | Structure |
|-----------|--------|-----------|
| **Content System** | ✅ Complete | `content/pt-PT/` with all JSON files |
| **Data Adapters** | ✅ Complete | All `src/_data/` files updated |
| **Build System** | ✅ Complete | Token generation from new paths |
| **Hero Section** | ✅ Complete | Co-located in `sections/hero/` |
| **Offer Section** | ✅ Complete | Co-located in `sections/offer/` |

### 🔄 **In Progress (Phase 3)**

| Component | Status | Next Steps |
|-----------|--------|------------|
| **Platform Layer** | 🔄 Foundation | Fix import paths, complete extraction |

### 🔮 **Future Phases (4-8)**

| Phase | Components | Timeline |
|-------|------------|----------|
| **Phase 4** | TypeScript setup, type definitions | Next session |
| **Phase 5** | Remaining 8 sections → co-located | 2-3 sessions |
| **Phase 6** | Build optimization, Vite aliases | 1 session |
| **Phase 7** | Vitest + Playwright testing | 1 session |
| **Phase 8** | Documentation + cleanup | 1 session |

---

## 🌍 i18n Expansion Ready

### **Adding New Languages**
```bash
# 1. Create new content directory
mkdir content/en-GB

# 2. Copy and translate JSON files  
cp content/pt-PT/*.json content/en-GB/
# Edit English translations...

# 3. Add language to build config
# No code changes needed!
```

### **Language Structure**
```
content/
├── pt-PT/          # Portuguese (current)
├── en-GB/          # English (future)
├── es-ES/          # Spanish (future) 
├── fr-FR/          # French (future)
└── de-DE/          # German (future)
```

---

## ⚡ Updated Build System Flow

### **Development Workflow**
```bash
npm run dev
```
1. **Design Tokens**: `content/pt-PT/design_tokens.json` → `_tokens.generated.css`
2. **Content Loading**: Data adapters load from `content/pt-PT/`
3. **Section Compilation**: Co-located sections compile together
4. **Template Processing**: Eleventy + Nunjucks → HTML
5. **Development Server**: Live reload with co-located section updates

### **Production Build**
```bash
npm run build
```
1. **Clean**: Remove existing `_site` directory
2. **Content Processing**: Load Portuguese content from `content/pt-PT/`
3. **Design Tokens**: Generate CSS custom properties
4. **CSS Build**: PostCSS + Tailwind (purged & minified)
5. **JavaScript Build**: Vite bundles co-located sections + components
6. **Static Generation**: Eleventy builds HTML from templates
7. **Asset Optimization**: Compression (gzip + brotli)

---

## 🎯 Key Architectural Benefits

### **1. Single-Touch Editing**
- **Before**: Edit Hero → 3 files (`hero.njk` + `hero.js` + data files)
- **After**: Edit Hero → 1 location (`sections/hero/` folder)
- **Impact**: 3x faster maintenance

### **2. i18n-Ready Expansion**  
- **Before**: Content mixed with code, hard to internationalize
- **After**: Clean content separation, add languages without code changes
- **Impact**: Ready for European market expansion

### **3. Platform Abstraction**
- **Before**: Utilities scattered across components
- **After**: Centralized platform layer for shared functionality
- **Impact**: Consistent patterns, easier testing

### **4. Future-Proof Architecture**
- **TypeScript Ready**: Platform layer designed for TS integration
- **Testing Ready**: Structure supports unit and E2E testing
- **Component Library Ready**: Platform UI structure for shared components

### **5. Developer Experience**
- **Faster Builds**: Vite 7.x with optimized imports
- **Better Organization**: Clear separation of concerns
- **Easier Onboarding**: Self-documenting structure

---

## 🔧 Tech Stack (Updated)

### **Core Framework Stack**
| Technology | Version | Purpose |
|------------|---------|---------| 
| **Node.js** | v22.18.0 | Runtime environment (LTS until April 2027) |
| **Eleventy** | 3.0.0 | Static site generator with ESM support |
| **Vite** | 7.1.2 | Build tool & development server |
| **Tailwind CSS** | 4.1.11 | Utility-first CSS framework (v4 CSS-first config) |
| **PostCSS** | 8.5.6 | CSS processing & optimization |
| **Nunjucks** | - | Template engine (built into Eleventy) |

### **Architecture Patterns**
| Pattern | Implementation | Benefit |
|---------|----------------|---------|
| **Co-located Sections** | Template + Logic in same folder | Single-touch editing |
| **i18n Content Structure** | Language-specific JSON files | Easy internationalization |
| **Platform Layer** | Shared utilities abstraction | Consistent patterns |
| **Feature-First Organization** | Sections group related functionality | Better maintainability |

---

## 🚀 Quick Start (Updated)

```bash
# 1. Install dependencies
npm install

# 2. Start development (with new structure)
npm run dev

# 3. Edit content (new location)
# Edit files in content/pt-PT/*.json

# 4. Edit sections (co-located)
# Hero: src/_includes/sections/hero/
# Offer: src/_includes/sections/offer/

# 5. Build for production
npm run build
```

---

*This structure represents the completed Phase 1-2 refactoring toward a modern, maintainable, i18n-ready architecture while preserving all existing functionality and performance characteristics.*