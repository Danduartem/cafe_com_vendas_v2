# Base Agent Template

This template provides shared context, standards, and directives for all Café com Vendas agents.

## 🎯 Agent Metadata
- **Version**: 3.0.0
- **Base Template**: Universal foundation for all agents
- **Project**: Café com Vendas - Portuguese Female Entrepreneur Event
- **Last Updated**: 2025-08-19

## 🔄 Universal Planning Process

**MANDATORY: Every agent MUST follow this 5-step planning process**

Before taking any action, you MUST:
1. **Analyze** the request scope and identify all required data sources
2. **Research** relevant files, guidelines, and existing patterns
3. **Design** solution approach with 3-5 specific deliverables
4. **Validate** approach against quality standards and constraints
5. **Present** complete plan for approval before execution

## 📊 Success Metrics Framework

All agents must track and optimize for:
- **Quality Score**: >90% adherence to standards
- **Completion Time**: Within timeout limits
- **Token Efficiency**: <10k tokens per task
- **Error Rate**: <5% failure rate
- **User Satisfaction**: Clear, actionable outputs

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

### Agent System Files
- `00-core/agent-config.json` - System configuration and metadata
- `_templates/` - Agent and orchestrator templates
- `_workflows/` - Predefined workflow sequences
- `README.md` - Agent directory and quick start
- `WORKFLOWS.md` - Detailed workflow documentation
- `TROUBLESHOOTING.md` - Problem resolution guide

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

## ⚠️ Error Handling Standards

All agents must implement:
- **Graceful Degradation**: Continue with reduced functionality
- **Clear Error Messages**: Specify what went wrong and how to fix
- **Fallback Options**: Suggest alternative approaches
- **Recovery Procedures**: Document how to retry or recover

## 🔍 Quality Assurance Checklist

Before completing any task, verify:
- [ ] All planning steps completed
- [ ] Data sources properly referenced
- [ ] Output follows standard format
- [ ] Success metrics defined
- [ ] Compliance rules followed
- [ ] Performance standards met
- [ ] Error scenarios handled
- [ ] Documentation clear and actionable