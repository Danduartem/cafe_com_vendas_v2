# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Guidance for Claude Code when working with the Café com Vendas landing page.

## 📖 Quick Navigation
- [Tech Stack](#-current-tech-stack) • [Version Awareness](#-version-awareness-protocol) • [Project Context](#project-context) • [Commands](#commands)
- [Environment Variables](#-environment-variables) • [Claude Commands](#-claude-commands)
- [Critical Rules](#critical-rules) • [Development Workflow](#-development-workflow)
- [Deployment](#-deployment--production) • [Troubleshooting](#-troubleshooting)
- [Code Examples](#-appendix-code-examples)

## 🚀 Current Tech Stack (Updated: Aug 15, 2025)

### Latest Stable Versions
- **Node.js**: v22.18.0 (LTS until April 2027, optimal for all dependencies)
- **Vite**: 7.1.2 (latest stable) - https://vite.dev/
- **Eleventy**: 3.1.2 (ESM support) - https://www.11ty.dev/docs/
- **Tailwind CSS**: 4.1.12 (CSS-first config) - https://tailwindcss.com/docs/v4
- **Stripe**: 18.4.0 (latest Node.js SDK) - https://docs.stripe.com/api
- **PostCSS**: 8.5.6 + autoprefixer 10.4.21

**📋 Quick Reference**: Run `npm run versions` to see current installed versions  
**📋 Check Updates**: Run `npm run outdated` to check for new versions  
**📋 Current Versions**: Check `package.json` for exact dependency versions

### Modern ESM Architecture
- **All `.js` files use ESM syntax**: `import`/`export default`
- **No `.cjs` workarounds needed**: Eleventy 3.x has native ESM support
- **Vite 7.x requirements**: Node.js 22.17.1+ (current LTS, optimal performance)
- **Package.json**: `"type": "module"` enables ESM everywhere

## 🎯 Version Awareness Protocol

### MANDATORY Pre-Code Checklist
**BEFORE writing any code, you MUST:**

1. **Check Installed Versions**
   ```bash
   npm run versions  # View current installed packages
   cat package.json  # Check exact dependency versions
   ```

2. **Fetch Version-Specific Documentation**
   - Use Context7 MCP to load docs for EXACT installed versions
   - Example: If package.json shows `"vite": "^7.1.2"`, fetch docs for Vite 7.x
   - Command: `mcp__context7__get-library-docs` with the exact version

3. **Verify API Compatibility**
   ```bash
   npm run type-check  # Run TypeScript validation
   npm run verify-apis # Check API existence (if available)
   ```

### Version Check Workflow
**Every coding session MUST start with:**
```bash
# 1. Check what's installed
npm run versions

# 2. Check for updates (but don't update without permission)
npm run outdated

# 3. Run type checking to ensure compatibility
npm run type-check
```

### Using Context7 for Documentation
**ALWAYS use Context7 to fetch current docs:**
```typescript
// BEFORE: Using potentially outdated knowledge
import { someOldAPI } from 'vite';  // ❌ May not exist in v7

// AFTER: Check Context7 first
// 1. Resolve library ID: mcp__context7__resolve-library-id('vite')
// 2. Get docs: mcp__context7__get-library-docs('/vitejs/vite', topic: 'config')
// 3. Use the documented API from the fetched docs
import { defineConfig } from 'vite';  // ✅ Verified from v7 docs
```

### Banned Patterns (Common Outdated APIs)
**NEVER use these deprecated patterns:**

#### Vite
- ❌ `import.meta.globEager` → ✅ `import.meta.glob({ eager: true })`
- ❌ `optimizeDeps.entries` → ✅ `optimizeDeps.include`
- ❌ Old plugin API → ✅ Check current plugin docs via Context7

#### Eleventy
- ❌ `.eleventy.cjs` → ✅ `.eleventy.js` with ESM
- ❌ `module.exports` → ✅ `export default`
- ❌ Callback-based filters → ✅ Async/await patterns

#### Tailwind CSS v4
- ❌ `tailwind.config.js` → ✅ CSS-based `@theme` configuration
- ❌ JavaScript config → ✅ Pure CSS configuration
- ❌ `@apply` in components → ✅ Direct utility classes

#### Stripe
- ❌ Legacy checkout → ✅ Payment Intents API
- ❌ Charges API → ✅ Payment Intents + Payment Methods
- ❌ Sources → ✅ Payment Methods

### TypeScript Integration
**All verification scripts use TypeScript:**
```typescript
// scripts/verify-apis.ts
import * as vite from 'vite';
import Stripe from 'stripe';

// This file will fail TypeScript compilation if APIs don't exist
const config = vite.defineConfig({});
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', // Lock API version
});
```

### API Verification Command
Run `/version-check` at the start of each session to:
1. Display all installed package versions
2. Fetch latest docs via Context7
3. Run TypeScript validation
4. Show any deprecated patterns found
5. Suggest modern alternatives

### When Updating Dependencies
**Use `/update` command which:**
1. Checks current versions
2. Updates to latest stable
3. Fetches new documentation
4. Refactors code to use new APIs
5. Runs full validation suite

### CI/CD Version Gates
**Every build MUST pass:**
- `npm run type-check` - TypeScript validation
- `npm run verify-apis` - API existence checks
- `npm run build` - Full build process
- No deprecated API warnings

## Project Context
**What**: Premium landing page for female entrepreneur event (Sept 20, 2025, Lisbon, 8 spots)  
**Audience**: See `info/DATA_avatar.json` - overworked female entrepreneurs seeking transformation  
**Language**: Portuguese (pt-PT)  
**Goal**: High-converting page with elegant design and proven conversion principles

## Commands
```bash
npm run dev          # Development with watch (tokens + CSS + JS + Eleventy)
npm run start        # Alternative development server 
npm run build        # Production build (tokens + CSS + JS + Eleventy)
npm run tokens:build # Generate CSS from JSON tokens
npm run build:css    # Build Tailwind CSS with PostCSS
npm run build:js     # Build JavaScript with Vite (production)
npm run build:js:dev # Build JavaScript with Vite (development + source maps)
npm run clean        # Clean build directory
npm run versions     # Show current installed package versions
npm run outdated     # Check for package updates
npm run type-check   # Run TypeScript validation
npm run lint         # Run ESLint checks

# Universal Screenshot Commands
npm run screenshot -- --url=<URL> --output=<filename>  # Universal screenshot with auto-fallback
npm run screenshot:local --output=<filename>           # Screenshot localhost:8080
```

**Note**: TypeScript checking is available via `npm run type-check`. Linting is available via `npm run lint`.

## 📸 Universal Screenshot System

This project includes a robust universal screenshot system that automatically handles complex websites with smart fallbacks.

### Features
- ✅ **Full Page First**: Always attempts fast full-page screenshot
- ✅ **Automatic Fallback**: Switches to sectional screenshots if full-page fails
- ✅ **Smart Optimization**: Disables animations, waits for lazy loading
- ✅ **Configurable**: Timeout, retry, and overlap settings
- ✅ **Reliable**: Works with heavy sites, SPAs, and complex layouts

### Usage

**CLI Commands:**
```bash
# Basic screenshot
npm run screenshot -- --url=https://example.com --output=example.png

# Local development server
npm run screenshot:local --output=my-site.png

# With custom options
npm run screenshot -- --url=https://heavy-site.com --timeout=60000 --retries=5

# For SPAs with animations
npm run screenshot -- --url=https://app.com --no-optimize --section-overlap=200
```

**Available Options:**
- `--timeout=<ms>` - Timeout for full page attempts (default: 30000)
- `--retries=<number>` - Number of retry attempts (default: 3)  
- `--section-overlap=<px>` - Overlap between sections (default: 100)
- `--no-network-wait` - Skip waiting for network idle
- `--no-optimize` - Skip page optimization

**Playwright MCP Integration:**
When using Playwright MCP browser, import and use:
```typescript
import { takeUniversalScreenshotMCP, SCREENSHOT_PRESETS } from './scripts/playwright-universal-screenshot.js';

// Standard usage
const result = await takeUniversalScreenshotMCP(page, 'screenshot.png');

// With preset for complex sites
const result = await takeUniversalScreenshotMCP(page, 'complex-site.png', SCREENSHOT_PRESETS.robust);

// Custom options
const result = await takeUniversalScreenshotMCP(page, 'custom.png', {
  timeout: 45000,
  retries: 4,
  sectionOverlap: 150
});
```

**Result Information:**
```typescript
interface ScreenshotResult {
  success: boolean;           // Whether screenshot succeeded
  type: 'fullpage' | 'sectional'; // Method used
  files: string[];           // Generated file paths
  totalSections?: number;    // Number of sections (if sectional)
  pageHeight?: number;       // Total page height
  error?: string;           // Error message (if failed)
}
```

### Presets
- `SCREENSHOT_PRESETS.fast` - Quick for simple pages
- `SCREENSHOT_PRESETS.standard` - Default for most websites
- `SCREENSHOT_PRESETS.robust` - For complex/heavy websites  
- `SCREENSHOT_PRESETS.spa` - For React/Vue apps with animations

This system automatically handles the complexity that caused issues with your Café com Vendas site (11,506px height, animations) and will work reliably across different website types.

## 🔐 Environment Variables

Essential environment variables for the project:

```bash
# Stripe Configuration (required for payments)
STRIPE_SECRET_KEY=sk_...           # Stripe secret key
STRIPE_PUBLIC_KEY=pk_...           # Stripe public key  
STRIPE_WEBHOOK_SECRET=whsec_...    # Stripe webhook signature verification

# Build Configuration
NODE_ENV=production                # Build environment (development/production)
```

**Setup Instructions**:
- Create `.env.local` for local development (not tracked in git)
- Configure in Netlify dashboard for production deployment
- Webhook endpoint: `/.netlify/functions/stripe-webhook`

## 🤖 Claude Commands

Custom commands available in `.claude/commands/`:

```bash
/version-check         # Check versions and fetch latest docs via Context7
/update-libs           # Update all dependencies to latest stable versions
/update-refactor       # Refactor code to leverage latest framework features  
/commit                # Smart git commits with conventional messages
/push                  # Safely push current branch with checks and PR option
/update-documentation  # Sync all docs with current codebase state
```

## Structure
```
src/
├── _includes/
│   ├── layout.njk           # Base HTML
│   └── components/*.njk     # Section components
├── _data/                   # Eleventy data layer
│   ├── site.js             # Site metadata
│   ├── event.js            # Loads DATA_event.json
│   ├── avatar.js           # Loads DATA_avatar.json
│   ├── testimonials.js     # Customer testimonials data
│   ├── tokens.js           # Loads DATA_design_tokens.json
│   ├── pillars.js          # Solution pillars data
│   ├── faq.js              # FAQ data
│   ├── footer.js           # Footer links and data
│   └── legal.js            # Legal pages metadata
├── index.njk               # Main page (includes components in order)
└── assets/
    ├── css/
    │   ├── main.css        # Tailwind + tokens entry point
    │   └── _tokens.generated.css # Generated from JSON tokens
    ├── js/                 # Modular JavaScript architecture
    │   ├── main.js         # Entry point (imports app.js)
    │   ├── app.js          # Application controller
    │   ├── config/
    │   │   └── constants.js # Configuration constants
    │   ├── core/
    │   │   ├── analytics.js # Analytics tracking
    │   │   └── state.js    # State management
    │   ├── utils/
    │   │   ├── animations.js # Animation utilities
    │   │   ├── dom.js      # DOM helpers
    │   │   ├── throttle.js # Performance utilities
    │   │   └── index.js    # Utils barrel export
    │   └── components/
    │       ├── hero.js     # Hero section
    │       ├── banner.js   # Top banner
    │       ├── faq.js      # FAQ accordion
    │       ├── offer.js    # Offer section
    │       ├── testimonials.js # Testimonials carousel
    │       ├── footer.js   # Footer interactions
    │       ├── final-cta.js # Final CTA section
    │       ├── youtube.js  # YouTube embeds
    │       ├── navigation.js # Navigation utilities
    │       └── index.js    # Components barrel export
    └── fonts/              # Local Lora & Century Gothic

info/                       # Design system & content
├── DATA_design_tokens.json      # Unified design system
├── DATA_event.json              # Event data (prices, dates)
├── DATA_avatar.json             # Persona & objections
├── CONTENT_copy_library.md      # Copy examples & headlines
├── GUIDE_voice_tone.md          # Voice & tone guidelines
├── GUIDE_brand_visual.md        # Brand guidelines
├── GUIDE_claude_instructions.md # Claude context & instructions
├── BUILD_landing_page.md        # Development blueprint
└── *.md                         # Other guidelines

vite.config.js              # Vite bundler configuration
netlify/                    # Netlify Functions
├── functions/
│   ├── create-payment-intent.js # Stripe payment processing
│   └── stripe-webhook.js   # Stripe webhook handler
.claude/                    # Custom Claude Code commands
├── commands/
│   ├── commit.md           # Smart git commits
│   ├── push.md             # Safe git push with checks
│   ├── update-libs.md      # Dependency update command
│   ├── update-refactor.md  # Code refactoring command
│   └── update-documentation.md # Documentation sync
```

## Critical Rules

### 🚨 CRITICAL: Pure Tailwind CSS Enforcement
**ZERO TOLERANCE POLICY - NO EXCEPTIONS**
- ❌ NEVER use `element.style.*` in JavaScript 
- ❌ NEVER write custom CSS in `<style>` blocks
- ❌ NEVER use `style=""` inline attributes
- ❌ NEVER create custom CSS properties outside design tokens
- ✅ ALWAYS use `element.classList.add/remove()` for state changes
- ✅ ALWAYS use Tailwind utilities: `max-h-*`, `rotate-*`, `transition-*`, `duration-*`
- ✅ ALWAYS check: scan all JavaScript for `style.` before submitting

**Pre-Implementation Checklist:**
- ✅ Can this animation be done with Tailwind `transition-*` classes?
- ✅ Can this state change be handled with class toggling?
- ✅ Are all animations using Tailwind utilities (`animate-*`, `transform`, `rotate-*`)?
- ✅ Am I only manipulating classes, never direct styles?

### Tech Stack & Architecture
- **Static Site Generator**: Eleventy (.eleventy.js config)
- **Templates**: Nunjucks (.njk files) 
- **Build Tool**: Vite for unified JS/CSS bundling and development server
- **CSS Framework**: Tailwind v4 with PostCSS (pure CSS-based configuration via @theme)
- **Data Layer**: Eleventy data files (src/_data/*.js) load from info/*.json
- **Design System**: JSON tokens → CSS custom properties via build-tokens.js
- **Fonts**: Local only (Lora display, Century Gothic body)
- **JavaScript**: Modular ES6 architecture with Vite bundling

**Data Flow**: `info/DATA_design_tokens.json` → `scripts/build-tokens.js` → `src/assets/css/_tokens.generated.css` → `@theme` block in main.css
**JS Architecture**: ES6 modules → Vite bundler → Single optimized IIFE bundle for browser

### Components
- Structure: `<section id="name" aria-label="Description">`
- Animations: Add `data-reveal` attribute
- Analytics: Add `data-analytics-event="event_name"`
- HTML templates in `src/_includes/components/`
- JavaScript modules in `src/assets/js/components/`

### JavaScript Architecture
- **Entry Point**: `main.js` imports and initializes the application
- **Application Controller**: `app.js` orchestrates all components
- **Modular Design**: Each component has its own dedicated file
- **Utilities**: Shared functions in `utils/` (DOM, animations, performance)
- **Configuration**: Centralized constants and state management
- **Build Output**: Single optimized IIFE bundle for browser compatibility
- **Development**: Source maps enabled for debugging
- **Production**: Minified and tree-shaken for performance

**Component Creation Pattern**:
1. Create `.njk` template in `src/_includes/components/`
2. Create `.js` module in `src/assets/js/components/`  
3. Export component object with `init()` method
4. Import and register in `src/assets/js/app.js`
5. Vite automatically bundles everything

### Design Tokens
- **Color Palette**: Navy, Burgundy, Neutral, Gold (see JSON for all shades)
- **Typography**: `font-lora` (display), `font-century` (body)
- **Source**: All tokens in `info/DATA_design_tokens.json` (unified file)
- **Build**: Run `npm run tokens:build` after changes to generate CSS
- **Usage**: Tokens available as CSS custom properties and Tailwind utilities

### Performance
- Images: `loading="lazy"` `decoding="async"` WebP preferred
- One `<h1>` per page, sections use `<h2>`
- WCAG AA compliance required
- Target: Lighthouse Performance >90, Accessibility >95

### Content Rules
- Voice: Empathetic, authoritative, clear (see `info/GUIDE_voice_tone.md`)
- Copy library: `info/CONTENT_copy_library.md`
- Event details: Always from `info/DATA_event.json`
- Never hardcode prices, dates, or guarantees

## Section Order
1. **Top Banner** (`components/top-banner.njk`) - Urgency message
2. **Hero** (`components/hero.njk`) - Hook + primary CTA
3. **Problem** (`components/problem.njk`) - Pain validation
4. **Solution** (`components/solution.njk`) - 5 pillars approach
5. **Social Proof** (`components/social-proof.njk`) - Testimonials
6. **Offer** (`components/offer.njk`) - Price + guarantee
7. **FAQ** (`components/faq.njk`) - Objections handling
8. **Final CTA** (`components/final-cta.njk`) - Urgency close
9. **Footer** (`components/footer.njk`) - Links + legal

## Schema Markup
- Hero → Event
- Solution → HowTo
- Testimonials → Review
- FAQ → FAQPage
- Offer → Product/Offer

## Key Files Reference

| Need | File |
|------|------|
| Design System | `info/DATA_design_tokens.json` (unified colors, typography, spacing) |
| Copy/Headlines | `info/CONTENT_copy_library.md`, `GUIDE_voice_tone.md` |
| Event Details | `info/DATA_event.json` |
| Customer Pain | `info/DATA_avatar.json` |
| Brand Guidelines | `info/GUIDE_brand_visual.md` |

## Common Tasks

**Add Section**: Create in `components/`, include in `index.njk`, add id + aria-label

**Update Tokens**: Edit `DATA_design_tokens.json` → `npm run tokens:build` → available as CSS vars

**Change Copy**: Check CONTENT_copy_library → match GUIDE_voice_tone → pull data from DATA_event

**Build Process**: 
1. Edit `DATA_design_tokens.json` → `npm run tokens:build` 
2. `scripts/build-tokens.js` generates `_tokens.generated.css` with CSS custom properties
3. `@theme` block in main.css defines Tailwind configuration using CSS custom properties
4. `npm run build:css` processes with PostCSS (Tailwind + Autoprefixer)
5. `npm run build:js` bundles modular JavaScript with Vite (ES6 modules → IIFE)
6. Eleventy builds static HTML using data from src/_data layer

**Vite Benefits**: 
- Unified build pipeline (single command for dev/prod)
- Hot reload for both JS and CSS changes
- Optimized production output (minification, tree-shaking, purging)
- Direct CSS imports in JavaScript modules
- Source maps for development debugging

**Note**: This project uses Tailwind v4's pure CSS-based configuration with Vite as the unified build tool.

**MANDATORY Component Checklist:**
- 🚨 **No inline styles**: No `style.`, `<style>`, or `style=""` anywhere
- ✅ **Pure Tailwind**: Only utility classes, no custom CSS
- ✅ **ES6 modules**: All JavaScript in separate `.js` files  
- ✅ **Design tokens**: Only token colors (no hex codes)
- ✅ **Class manipulation**: Use `classList.add/remove/toggle()` only

**Access Data in Templates**: Use Eleventy data (`{{ site }}`, `{{ event }}`, `{{ avatar }}`, `{{ tokens }}`)

## 🔄 Development Workflow

### Getting Started
1. **Setup Environment**: Create `.env.local` with Stripe test keys
2. **Install Dependencies**: `npm install`
3. **Start Development**: `npm run dev` (opens at localhost:8080)
4. **Test Payments**: Use Stripe test cards in checkout

### Making Changes
1. **Content Updates**: Edit JSON files in `info/` directory
2. **Design Changes**: Update `DATA_design_tokens.json` → `npm run tokens:build`
3. **Component Logic**: Modify `.js` files in `src/assets/js/components/`
4. **HTML Structure**: Edit `.njk` templates in `src/_includes/components/`

### Quality Assurance
- **Code Quality**: Follow Pure Tailwind CSS rules (no inline styles)
- **Accessibility**: Test keyboard navigation and screen readers
- **Performance**: Target >90 Lighthouse Performance score
- **Browser Testing**: Chrome, Firefox, Safari (mobile and desktop)
- **Payment Testing**: Complete checkout flow with test cards

### Before Deployment
- [ ] Run full build: `npm run build`
- [ ] Test all payment flows
- [ ] Verify environment variables configured
- [ ] Check analytics tracking
- [ ] Performance audit passed
- [ ] Accessibility compliance verified

## 🤖 Custom Slash Commands

Commands in `.claude/commands/` extend and specialize the guidelines in this file.
When a slash command is invoked, follow its specific instructions which may add
additional requirements on top of these base guidelines.

### Command Hierarchy
1. **Slash command files** (`.claude/commands/*.md`) - specific requirements and workflows
2. **CLAUDE.md** - base project guidelines and context
3. **Default Claude Code behavior** - fallback when not specified

Commands inherit from CLAUDE.md but can add specific workflows, constraints, and output formats.

### `/version-check`
Ensure you're using correct library APIs:
- Display all installed package versions
- Fetch documentation via Context7 MCP for exact versions
- Run TypeScript type checking to validate APIs
- Identify deprecated patterns in codebase
- Suggest modern API alternatives

### `/update-libs`
Update all project dependencies to latest stable versions:
- Check outdated packages with `npm outdated`
- Fetch new documentation via Context7 for updated versions
- Update dependencies safely
- Test build compatibility with TypeScript checks
- Update documentation with new versions

### `/update-refactor`  
Refactor codebase to leverage latest framework features:
- Analyze code for modernization opportunities
- Apply current framework best practices
- Optimize performance and build configuration
- Ensure modern patterns throughout codebase

### `/commit`
Smart git commits with conventional messages:
- Operates on staged changes only
- Follows plan-then-apply workflow
- Creates 1-3 clean conventional commits
- No Claude Code attribution (inherits from Git Commit Guidelines below)

### `/push`
Safely push current branch to remote with comprehensive checks:
- Clean working tree verification and protected branch guards
- Optional rebase for fast-forward safety
- Run build/lint/typecheck checks before pushing
- Optional Pull Request creation with GitHub CLI integration

### `/update-documentation`
Audit and update ALL repository documentation to reflect current code:
- Sync documentation with actual codebase state
- Update package versions and scripts
- Fix stale or missing information
- Maintain consistency across README, CLAUDE.md, and project docs

### Command Execution Workflow
When any slash command is invoked:
1. **Read the command file** first (`.claude/commands/command-name.md`)
2. **Follow its specific workflow** (e.g., `review-mode: plan-then-apply`)
3. **Apply CLAUDE.md guidelines** where not overridden by the command
4. **Never apply defaults** that conflict with either file

**Usage**: Type `/` in Claude Code to see available commands

## Git Commit Guidelines
- Write clear, descriptive commit messages
- Use conventional commit format when appropriate
- **Do NOT include Claude Code attribution or co-author lines in commits**
- Keep commit messages focused on the actual changes made

## 🚀 Deployment & Production

### Netlify Configuration
- **Site URL**: Configure custom domain in Netlify dashboard
- **Build Command**: `npm run build` (ensure dev dependencies are installed)
- **Publish Directory**: `_site`
- **Node Version**: 22.18.0 (set in `.nvmrc`)

### Environment Variables Setup
1. **Local Development**: Create `.env.local` with Stripe test keys
2. **Production**: Configure in Netlify → Site Settings → Environment Variables
3. **Webhook URL**: `https://yourdomain.com/.netlify/functions/stripe-webhook`

### Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] Stripe webhook endpoint tested
- [ ] Build runs successfully (`npm run build`)
- [ ] All payment flows tested
- [ ] Forms submission working
- [ ] Analytics tracking verified
- [ ] Performance audit passed (>90 Lighthouse score)

### Security Considerations
- **Payment Processing**: All Stripe operations server-side only
- **HTTPS Enforced**: Netlify automatic SSL
- **Environment Variables**: Never exposed to client-side code
- **PII Protection**: No personal data stored locally

## Conversion Elements
- Social proof with numbers
- 90-day guarantee (see DATA_event)
- Limited spots (8 first batch)
- Stripe integration
- WhatsApp button

## 🔧 Troubleshooting

### Common Issues

**Build Errors**:
- Run `npm run clean && npm install` to clear cache and reinstall dependencies
- Check Node.js version matches `.nvmrc` (22.18.0)
- Ensure dev dependencies installed: `npm ci --include=dev`

**Design Token Issues**:
- Run `npm run tokens:build` after editing `DATA_design_tokens.json`
- Check CSS custom properties generated in `_tokens.generated.css`

**Payment Integration**:
- Verify Stripe environment variables are set
- Test webhook endpoint: `/.netlify/functions/stripe-webhook`
- Check browser console for client-side errors
- Validate Stripe public key format: `pk_test_...` or `pk_live_...`

**Development Server**:
- Port 8080 conflicts: Kill process `lsof -ti:8080 | xargs kill -9`
- File watching issues: Restart with `npm run dev`
- Vite HMR not working: Clear browser cache and restart

**Performance Issues**:
- Run Lighthouse audit to identify bottlenecks
- Check image optimization (WebP format, lazy loading)
- Verify Vite production build removes console.logs

## Don'ts
- No inline CSS/JS (includes `<style>` blocks and `style=""` attributes)
- No Google Fonts
- No hardcoded values (use tokens)
- No custom CSS (use Tailwind utilities)
- No breaking elegant aesthetic for function
- No custom animation classes (use Tailwind: `animate-pulse`, `animate-bounce`, etc.)
- No hardcoded colors like `#f59e0b` (use design token classes: `burgundy-*`, `navy-*`)
- No complex glassmorphism with custom shadows (use Tailwind: `backdrop-blur-md`, `bg-white/90`)

## 📚 Documentation Access

For latest framework/library docs, use Context7 MCP:
- **Vite 7**: Use Context7 for build configuration and latest features
- **Eleventy 3**: Use Context7 for ESM patterns and new APIs  
- **Tailwind CSS v4**: Use Context7 for CSS-first configuration
- **Stripe API**: Use Context7 for payment integration examples
- **Netlify Functions**: Use Context7 for ESM serverless functions

**Example**: Type `/context7 vite` to get fresh Vite documentation

---

## 📋 Appendix: Code Examples

### Component Development Pattern

#### Essential Component Structure
```javascript
// src/assets/js/components/my-component.js
import { safeQuery } from '../utils/index.js';

export const MyComponent = {
    init() {
        this.bindEvents();
        // Make toggle function available globally for onclick handlers
        window.toggleMyComponent = this.toggleComponent.bind(this);
    },
    
    bindEvents() {
        const container = safeQuery('#my-component');
        if (!container) return;
        container.addEventListener('click', this.handleClick.bind(this));
    },
    
    toggleComponent(elementId) {
        const element = safeQuery(`#${elementId}`);
        if (!element) return;
        
        // Use Tailwind classes only - NEVER element.style.*
        element.classList.toggle('hidden');
        element.classList.toggle('max-h-0');
        element.classList.toggle('max-h-96');
    }
};
```

#### HTML Template Pattern
```njk
<section id="component-name" aria-label="Description">
  <button onclick="toggleMyComponent('target-id')" 
          class="transition-all duration-300 hover:scale-105">
    Toggle
  </button>
  <div id="target-id" 
       class="hidden overflow-hidden transition-all duration-300 max-h-0">
    Content
  </div>
</section>
```

#### Registration in app.js
```javascript
import { MyComponent } from './components/my-component.js';
// Add to components array in initializeComponents()
```