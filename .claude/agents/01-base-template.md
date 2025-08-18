# Base Agent Template

This template provides shared context and directives for all Café com Vendas agents.

## 🔄 Planning Before Action Directive

**MANDATORY: ALWAYS plan before executing any changes**

Before taking any action, you MUST:
1. **Analyze** the request and identify required data sources
2. **Outline** 3-5 specific steps with clear deliverables
3. **Present** your plan clearly to the user
4. **Wait** for explicit approval before proceeding
5. **Execute** only after confirmation

## 📋 Shared Project Context

### Event Details
- **Event**: Café com Vendas - Business Transformation for Female Entrepreneurs
- **Date**: September 20, 2025
- **Location**: Lisbon, Portugal
- **Capacity**: 8 exclusive spots (scarcity factor)
- **Investment**: €1797 (early bird pricing)
- **Language**: Portuguese (pt-PT)

### Target Audience
- **Demographics**: Portuguese female entrepreneurs, 30-45 years
- **Psychographics**: Ambitious but overwhelmed, revenue-focused, work-life balance seekers
- **Pain Points**: Burnout, inconsistent revenue, imposter syndrome, isolation
- **Aspirations**: Sustainable growth, confidence, strategic clarity, community
- **Investment Mindset**: Quality over price, ROI-focused, cautious but decisive

### Technical Stack
- **Platform**: Eleventy 3.x + Vite 7.x (ESM architecture)
- **Styling**: Tailwind CSS v4 + design tokens
- **Payments**: Stripe integration with Portuguese test cards
- **Analytics**: GTM with GDPR compliance
- **Hosting**: Netlify with Edge Functions
- **Security**: CSP-compliant, no inline scripts/styles

## 📁 Standard Data Sources

### Primary Configuration Files
- `info/DATA_design_tokens.json` - Unified design system
- `info/DATA_event.json` - Event data (prices, dates, guarantees)
- `info/DATA_avatar.json` - Target audience personas and objections
- `info/CONTENT_copy_library.md` - Proven copy patterns and headlines
- `info/GUIDE_voice_tone.md` - Brand voice and communication guidelines
- `info/GUIDE_brand_visual.md` - Visual identity and brand standards

### Code Structure References
- `src/_data/*.js` - Eleventy data layer
- `src/_includes/components/*.njk` - Template components
- `src/assets/js/components/*.js` - JavaScript modules
- `netlify/functions/*.js` - Serverless functions

## 🚨 Critical Compliance Rules

### Zero Tolerance Policies
- ❌ NEVER use inline styles (`style=""`, `element.style.*`)
- ❌ NEVER use inline scripts (`<script>` without src, `onclick=""`)
- ❌ NEVER use custom CSS outside design tokens
- ❌ NEVER violate WCAG AA contrast ratios (4.5:1 minimum)
- ✅ ALWAYS use Tailwind utilities and `classList` manipulation
- ✅ ALWAYS use `addEventListener()` for event handling
- ✅ ALWAYS reference design tokens from `DATA_design_tokens.json`
- ✅ ALWAYS maintain CSP compliance

### Security Requirements
- Content Security Policy compliance (no `'unsafe-inline'` for scripts)
- GDPR compliance for Portuguese market
- Stripe PCI compliance for payment handling
- Environment variable security (never expose secrets)

## 🎯 Performance Standards

### Target Metrics
- **Lighthouse Performance**: >90
- **Lighthouse Accessibility**: >95
- **Core Web Vitals**: All in green zone
- **Bundle Size**: <200 KB JavaScript, <50 KB CSS
- **Load Time**: <2.5s LCP, <100ms FID, <0.1 CLS

### Optimization Patterns
- Lazy loading for third-party scripts (Stripe.js saves 187 KiB)
- Cloudinary WebP optimization (saves 178 KiB on hero image)
- Critical CSS inlining with async non-critical loading
- ES6 module tree-shaking via Vite

## 📊 Analytics & Tracking

### GTM Configuration
- Container ID: `VITE_GTM_CONTAINER_ID`
- Enhanced Ecommerce for €1797 event registration
- Portuguese market compliance and GDPR consent
- Custom dimensions for female entrepreneur behavior

### Key Events to Track
- `page_view` - Landing page visits
- `view_item` - Event details engagement  
- `begin_checkout` - Stripe modal opens
- `purchase` - Registration completion
- `email_capture` - Newsletter signups

## 📝 Standard Output Format

All agents should provide:

### Analysis Section
- Current state assessment
- Data sources consulted
- Key findings or insights

### Recommendations Section  
- Specific, actionable items
- Priority levels (high/medium/low)
- Expected impact and rationale

### Implementation Section
- Step-by-step instructions
- Code examples (when applicable)
- File paths and references

### Success Metrics
- Measurable outcomes
- How to validate success
- Monitoring recommendations

## 🔗 Agent Coordination

When your expertise overlaps with other agents:
1. **Reference** specific agents for complementary work
2. **Suggest** multi-agent coordination when beneficial
3. **Avoid** duplicating work done by specialized agents
4. **Collaborate** rather than compete for scope

## 📚 Context Inheritance

Agents inheriting from this base should:
- **Remove** redundant project context from their descriptions
- **Focus** on their unique specialization and expertise
- **Reference** this base for shared standards and requirements
- **Add** only agent-specific context and methodologies