# Café com Vendas - Project File Structure

## 📋 Project Overview
**Café com Vendas** is a high-converting landing page for an intimate business event targeting female entrepreneurs in Portugal. The project uses a modern JAMstack architecture with static site generation, serverless functions, and performance-first design principles.

**Target**: 8-spot premium event (September 20, 2025, Lisbon)  
**Audience**: Overworked female entrepreneurs seeking business transformation  
**Language**: Portuguese (pt-PT)

---

## 🗂️ Complete File Structure

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
│
├── 📁 src/                               # 🎯 SOURCE CODE - All development files
│   ├── 📄 index.njk                      # Main landing page template
│   ├── 📄 garantia-reembolso.njk         # Legal: refund guarantee page
│   ├── 📄 politica-privacidade.njk       # Legal: privacy policy
│   ├── 📄 termos-condicoes.njk           # Legal: terms & conditions
│   ├── 📄 thank-you.njk                  # Post-purchase confirmation page
│   │
│   ├── 📁 _data/                         # 🗃️ ELEVENTY DATA LAYER - Feeds templates
│   │   ├── 📄 site.js                    # Global site metadata & SEO
│   │   ├── 📄 event.js                   # Event data (prices, dates, spots)
│   │   ├── 📄 avatar.js                  # Customer persona & pain points
│   │   ├── 📄 testimonials.js            # Customer testimonials & social proof
│   │   ├── 📄 tokens.js                  # Design system integration
│   │   ├── 📄 pillars.js                 # Solution framework data
│   │   ├── 📄 faq.js                     # FAQ content & objection handling
│   │   ├── 📄 footer.js                  # Footer links & company info
│   │   ├── 📄 legal.js                   # Legal pages metadata
│   │   ├── 📄 presenter.js               # Speaker/presenter information
│   │   └── 📄 csp.js                     # Content Security Policy config
│   │
│   ├── 📁 _includes/                     # 🧩 NUNJUCKS TEMPLATES - Reusable components
│   │   ├── 📄 layout.njk                 # Base HTML layout with meta tags
│   │   │
│   │   ├── 📁 components/                # 🎨 PAGE SECTIONS - Modular landing page parts
│   │   │   ├── 📄 top-banner.njk         # Urgency banner (limited spots)
│   │   │   ├── 📄 hero.njk               # Hero section with main CTA
│   │   │   ├── 📄 problem.njk            # Pain point validation
│   │   │   ├── 📄 solution.njk           # 5-pillar framework solution
│   │   │   ├── 📄 about.njk              # Presenter credibility section
│   │   │   ├── 📄 social-proof.njk       # Testimonials & success stories
│   │   │   ├── 📄 offer.njk              # Pricing & guarantee section
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
│   │   │   └── 📄 _tokens.generated.css  # Auto-generated from design tokens
│   │   │
│   │   ├── 📁 js/                        # ⚡ JAVASCRIPT - Modular ES6 Architecture
│   │   │   ├── 📄 main.js                # Entry point - imports & initializes app
│   │   │   ├── 📄 app.js                 # Application controller - orchestrates components
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
│   │   │   │   └── 📄 index.js           # Utilities barrel export
│   │   │   │
│   │   │   └── 📁 components/            # 🧩 UI COMPONENTS - Page section logic
│   │   │       ├── 📄 banner.js          # Top banner interactions
│   │   │       ├── 📄 hero.js            # Hero section logic
│   │   │       ├── 📄 about.js           # About section behavior
│   │   │       ├── 📄 faq.js             # FAQ accordion functionality
│   │   │       ├── 📄 offer.js           # Offer section interactions
│   │   │       ├── 📄 testimonials.js    # Testimonials carousel
│   │   │       ├── 📄 final-cta.js       # Final CTA behavior
│   │   │       ├── 📄 footer.js          # Footer interactions
│   │   │       ├── 📄 checkout.js        # Stripe checkout integration
│   │   │       ├── 📄 gtm.js             # Google Tag Manager setup
│   │   │       ├── 📄 youtube.js         # YouTube embed handling
│   │   │       ├── 📄 thank-you.js       # Thank you page logic
│   │   │       ├── 📄 cloudinary.js      # Image optimization
│   │   │       └── 📄 index.js           # Components barrel export
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
│   ├── 📁 public/                        # 🌐 PUBLIC STATIC FILES - Copied as-is
│   │   ├── 📄 _headers                   # Netlify HTTP headers config
│   │   ├── 📄 favicon.ico                # Browser favicon
│   │   └── 📄 favicon.svg                # Modern SVG favicon
│   │
│   └── 📁 schema/                        # 🏷️ STRUCTURED DATA - SEO & rich snippets
│       └── 📄 faq.json.njk               # FAQ schema markup template
│
├── 📁 info/                              # 📚 CONTENT & DESIGN SYSTEM - Single source of truth
│   ├── 📄 DATA_design_tokens.json        # 🎨 UNIFIED DESIGN SYSTEM (colors, typography, spacing)
│   ├── 📄 DATA_event.json                # 📅 EVENT DATA (prices, dates, logistics)
│   ├── 📄 DATA_avatar.json               # 🎯 CUSTOMER PERSONA (pains, objections, jobs-to-be-done)
│   ├── 📄 DATA_faq.json                  # ❓ FAQ CONTENT (objection handling)
│   ├── 📄 CONTENT_copy_library.md        # ✍️ COPY EXAMPLES & HEADLINES
│   ├── 📄 GUIDE_voice_tone.md            # 🗣️ BRAND VOICE GUIDELINES
│   ├── 📄 GUIDE_brand_visual.md          # 🎨 VISUAL BRAND GUIDELINES
│   ├── 📄 BUILD_landing_page.md          # 🏗️ DEVELOPMENT BLUEPRINT
│   └── 📄 angles-library.json            # 📐 COPYWRITING ANGLES LIBRARY
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
│   └── 📄 build-tokens.js                # Design token → CSS transformation
│
├── 📁 _site/                             # 🏗️ BUILD OUTPUT - Generated static files
│   ├── 📄 index.html                     # Generated landing page
│   ├── 📁 assets/                        # Processed assets (CSS, JS, fonts, images)
│   ├── 📁 garantia-reembolso/            # Legal pages directories
│   ├── 📁 politica-privacidade/
│   ├── 📁 termos-condicoes/
│   └── 📁 thank-you/
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

## 🏗️ Architecture Explanation

### Why This Structure?

#### **1. Modern JAMstack Architecture**
- **Static Site Generation (SSG)**: Eleventy pre-builds HTML at build time for maximum performance
- **Serverless Functions**: Netlify Functions handle payment processing and integrations
- **CDN Distribution**: Static files served globally via Netlify's CDN
- **Modern Build Pipeline**: Vite provides fast development and optimized production builds

#### **2. Separation of Concerns**
```
📁 info/     → Content & design decisions (business layer)
📁 src/      → Implementation & templates (presentation layer)  
📁 netlify/  → Server-side logic (service layer)
📁 scripts/  → Build & development tools (build layer)
```

#### **3. Component-Based Design**
- **Modular Templates**: Each section is a separate `.njk` component
- **Modular JavaScript**: Each component has its own `.js` logic file
- **Reusable Partials**: Common elements shared across templates
- **Design System**: Centralized tokens for consistent styling

#### **4. Performance-First Structure**
- **Asset Optimization**: Vite bundles and compresses JavaScript
- **CSS Optimization**: PostCSS + Tailwind with purging and minification  
- **Image Optimization**: WebP formats with lazy loading
- **Caching Strategy**: Separate asset folders for optimal cache headers

---

## 🔧 Tech Stack & Dependencies

### **Core Framework Stack**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | v22.18.0 | Runtime environment (LTS until April 2027) |
| **Eleventy** | 3.0.0 | Static site generator with ESM support |
| **Vite** | 7.1.2 | Build tool & development server |
| **Tailwind CSS** | 4.1.11 | Utility-first CSS framework (v4 CSS-first config) |
| **PostCSS** | 8.5.6 | CSS processing & optimization |
| **Nunjucks** | - | Template engine (built into Eleventy) |

### **Build & Development Tools**
| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | 9.33.0 | Code quality & style enforcement |
| **Autoprefixer** | 10.4.21 | CSS vendor prefix automation |
| **Terser** | 5.43.1 | JavaScript minification |
| **Cross-env** | 10.0.0 | Cross-platform environment variables |
| **PostCSS CLI** | 11.0.1 | CSS processing command line interface |

### **Payment & Integrations**
| Service | Version | Purpose |
|---------|---------|---------|
| **Stripe** | 18.4.0 | Payment processing & subscription management |
| **Dotenv** | 17.2.1 | Environment variable management |

### **Performance & Optimization**
| Plugin | Version | Purpose |
|---------|---------|---------|
| **vite-plugin-compression** | 0.5.1 | Gzip & Brotli compression |
| **@fontsource/lora** | 5.2.6 | Local font optimization |

### **Deployment & Hosting**
| Platform | Purpose |
|----------|---------|
| **Netlify** | Static hosting, CDN, serverless functions |
| **Netlify Functions** | Payment processing, webhook handling |
| **Netlify Edge Functions** | Content Security Policy enforcement |

---

## ⚡ Build System Flow

### **Development Workflow**
```bash
npm run dev
```
1. **Design Tokens**: `build-tokens.js` → `_tokens.generated.css`
2. **CSS Processing**: PostCSS + Tailwind → `tailwind.css`  
3. **JavaScript Bundling**: Vite (development mode) → `main.js`
4. **Template Compilation**: Eleventy + Nunjucks → HTML
5. **Development Server**: Live reload on changes

### **Production Build**
```bash
npm run build
```
1. **Clean**: Remove existing `_site` directory
2. **Design Tokens**: Generate CSS custom properties
3. **CSS Build**: PostCSS + Tailwind (purged & minified)
4. **JavaScript Build**: Vite (minified IIFE bundle)
5. **Static Generation**: Eleventy builds HTML from templates
6. **Asset Optimization**: Compression (gzip + brotli)

### **Data Flow Architecture**
```
📄 info/DATA_*.json 
    ↓ (loaded by)
📄 src/_data/*.js 
    ↓ (feeds)  
📄 src/_includes/*.njk 
    ↓ (compiled by)
📄 _site/*.html
```

---

## 📁 Directory Purpose Guide

### **🎯 Core Development (`src/`)**
- **Purpose**: All source code and templates
- **Why**: Single source of truth for development files
- **Contains**: Templates, data, assets, components

### **📚 Content System (`info/`)**  
- **Purpose**: Business content and design decisions
- **Why**: Non-technical team members can edit content safely
- **Contains**: Design tokens, event data, copy, guidelines

### **☁️ Backend Logic (`netlify/`)**
- **Purpose**: Server-side functionality  
- **Why**: Handles payments and integrations securely
- **Contains**: Stripe integration, webhooks, email capture

### **🔧 Build Tools (`scripts/`)**
- **Purpose**: Development utilities and automation
- **Why**: Transforms design tokens to CSS, automates repetitive tasks
- **Contains**: Token builder, development helpers

### **📖 Documentation (`docs/`)**
- **Purpose**: Technical guides and best practices
- **Why**: Ensures consistent development standards
- **Contains**: Setup guides, security practices, testing procedures

### **📊 Quality Assurance (`reports/`)**
- **Purpose**: Performance monitoring and audits
- **Why**: Maintains high performance standards
- **Contains**: Lighthouse reports, performance metrics

---

## 🎯 Key Architectural Benefits

### **1. Maintainability**
- Clear separation between content, presentation, and logic
- Modular components enable easy updates and testing
- Centralized configuration reduces duplication

### **2. Performance**
- Static generation provides instant loading times
- Aggressive caching strategies for optimal repeat visits  
- Modern build tools ensure minimal bundle sizes

### **3. Developer Experience**
- Hot reload development server for rapid iteration
- ESLint ensures code quality and consistency
- Comprehensive documentation for easy onboarding

### **4. Business Flexibility**
- Content editors can modify copy without touching code
- Design system enables consistent brand application
- A/B testing structure supports conversion optimization

### **5. Production Reliability**
- Serverless functions scale automatically
- Static files eliminate server management
- Edge functions provide global performance

---

*This structure reflects modern web development best practices while maintaining simplicity and performance for a high-converting business landing page.*