# Landing Page Strategy Command

Run Phase 1→4 to create strategy, blueprint, creative, and a Tailwind CDN prototype for high-converting landing pages.

## 1) Intent
Goal: Generate complete landing page from strategy through implementation with production-ready artifacts.
Non-Goals: Not for quick fixes or partial updates. This is for comprehensive landing page creation.

## 2) Inputs
Required:
- TaskSpec file at `strategy/_inputs/task.json` with complete project definition

Optional:
- `skip-phases`: Array of phases to skip ["phase3", "phase4"] (default: run all)
- `output-path`: Custom output directory (default: from task.json)
- `force`: Overwrite existing outputs (default: false)
- `verbose`: Detailed agent coordination logs (default: false)

## 3) TaskSpec Structure

```json
{
  "project": {
    "company": "Nome da Empresa",
    "offer_name": "Nome do Produto/Serviço",
    "one_line": "Descreva em uma frase simples",
    "core_problem": "Qual dor específica você resolve?",
    "uvp": "Sua diferença incontornável",
    "brand_voice": ["Confiante", "Elegante", "Empática"],
    "core_emotion": "Confiança"
  },
  "audience": {
    "persona": {
      "role": "Ex.: Empreendedora de serviços",
      "industry": "Ex.: Coaching/Consultoria",
      "demographics": "Ex.: 29–45, Portugal/Brasil"
    },
    "pains": ["Dor 1", "Dor 2", "Dor 3"],
    "desired_outcome": "Como é o sucesso para ela?",
    "objections": ["Preço", "Complexidade", "Confiança"]
  },
  "market": {
    "competitors": ["Concorrente A", "Concorrente B"],
    "key_differentiator": "Como você é fundamentalmente melhor"
  },
  "conversion": {
    "traffic_sources": ["IG Ads", "Indicação", "YouTube"],
    "temperature": "cold|warm|hot",
    "primary_goal": "Ação #1 (ex.: Agendar sessão)",
    "secondary_goal": "Ação #2 (ex.: Download checklist)"
  },
  "tech": {
    "integrations": ["Stripe", "Fillout", "MailerLite", "GTM"],
    "seo": {
      "primary_kw": "palavra-chave principal",
      "secondary_kw": ["kw2", "kw3"]
    },
    "mandates": ["Usar paleta oficial", "Evitar stock clichê"]
  },
  "output": {
    "base_path": "./strategy/2025-08-17-landing",
    "lang": "pt-PT"
  }
}
```

## 4) Execution Phases

### Phase 1: Universal Landing Page Strategy
```bash
# Activities:
# - Parse and validate TaskSpec
# - Generate comprehensive strategy document
# - Validate with conversion-optimizer
# - Refine copy with portuguese-copywriter
# - Create completeness checklist

# Outputs:
# - phase1_universal_strategy.md
# - phase1_checklist.json

# Gates:
# - 100% fields populated
# - UVP unique and testable
# - Clear conversion goals
```

### Phase 2: High-Conversion Blueprint
```bash
# Activities:
# - Build section-by-section blueprint
# - Create GTM/GA4 event mapping
# - Design A/B testing strategy
# - Plan SEO implementation

# Outputs:
# - phase2_blueprint.md
# - phase2_events.json
# - phase2_abtests.md

# Gates:
# - All sections fully specified
# - Analytics events mapped
# - A/B tests defined with metrics
```

### Phase 3: Final Content & Art Direction
```bash
# Activities:
# - Generate Portuguese copy per section
# - Create art direction specifications
# - Validate WCAG AA compliance
# - Review design token usage

# Outputs:
# - phase3_copy/*.md
# - phase3_art_direction/*.md
# - qa/compliance_report.json

# Gates:
# - Native pt-PT quality copy
# - No critical accessibility issues
# - Complete visual specifications
```

### Phase 4: Development Implementation
```bash
# Activities:
# - Build Tailwind CDN prototype
# - Implement analytics tracking
# - Add structured data (JSON-LD)
# - Performance optimization

# Outputs:
# - phase4_build/landing.html
# - qa/perf_report.md
# - qa/schema_test.json

# Gates:
# - Lighthouse score >90
# - LCP ≤ 2.5s, CLS ≤ 0.1
# - Valid schema.org markup
```

## 5) Agent Orchestration

### Producer Agents
```javascript
const PRODUCERS = {
  'landing-page-orchestrator': 'Overall workflow coordination',
  'portuguese-copywriter': 'Native pt-PT content creation',
  'conversion-optimizer': 'Conversion strategy and testing',
  'gtm-analytics-tracker': 'Analytics implementation specs',
  'eleventy-njk-specialist': 'Template architecture advice'
};
```

### Critic Agents
```javascript
const CRITICS = {
  'design-compliance-specialist': 'WCAG AA and token validation',
  'performance-auditor': 'Lighthouse and Core Web Vitals',
  'beauty-critic': 'Aesthetic refinement suggestions'
};
```

## 6) Output Directory Structure

```
strategy/[base_path]/
├── phase1_universal_strategy.md
├── phase1_checklist.json
├── phase2_blueprint.md
├── phase2_events.json
├── phase2_abtests.md
├── phase3_copy/
│   ├── hero.md
│   ├── problem.md
│   ├── solution.md
│   ├── social-proof.md
│   ├── offer.md
│   ├── faq.md
│   └── final-cta.md
├── phase3_art_direction/
│   └── [matching sections]
├── phase4_build/
│   └── landing.html
├── qa/
│   ├── compliance_report.json
│   ├── perf_report.md
│   └── schema_test.json
└── review/
    └── scorecard.md
```

## 7) Quality Gates

### Phase 1 Gate
- [ ] All TaskSpec fields have values or N/A with rationale
- [ ] UVP is specific and differentiated
- [ ] Primary/secondary goals are single, measurable actions
- [ ] Top 3 objections identified with rebuttals

### Phase 2 Gate
- [ ] Every section has 5 expert perspectives
- [ ] Primary keyword in Hero H1 plan
- [ ] Analytics events cover full funnel
- [ ] A/B tests have sample size calculations

### Phase 3 Gate
- [ ] Copy is native pt-PT quality
- [ ] All sections have complete content
- [ ] WCAG AA compliance verified
- [ ] Design tokens properly used

### Phase 4 Gate
- [ ] Lighthouse Performance >90
- [ ] All interactions functional
- [ ] Mobile responsive 320px-4K
- [ ] Analytics tags implemented

## 8) Command Examples

### Basic Usage
```bash
# Create task.json first, then run:
/landing-page-strategy
```

### Skip Certain Phases
```bash
# Skip implementation, only do strategy and planning
/landing-page-strategy skip-phases=["phase4"]
```

### Force Overwrite
```bash
# Overwrite existing outputs
/landing-page-strategy force=true
```

### Verbose Mode
```bash
# See detailed agent coordination
/landing-page-strategy verbose=true
```

## 9) Success Metrics

### Process Metrics
- **Total Time**: <2 hours for complete generation
- **Gate Pass Rate**: 100% on first attempt
- **Agent Efficiency**: No duplicate work
- **Output Quality**: Production-ready artifacts

### Business Metrics
- **Conversion Potential**: 3-5% visitor → registration
- **Performance Score**: >90 across all Lighthouse metrics
- **Accessibility**: 100% WCAG AA compliant
- **SEO Readiness**: Complete schema.org implementation

## 10) Integration Path

### After Generation
1. Review all outputs in strategy folder
2. Select preferred variations from Phase 3
3. Test prototype HTML in browsers
4. Convert to Eleventy/Nunjucks templates
5. Migrate inline styles to Tailwind classes
6. Extract JS to external modules
7. Configure CSP headers
8. Deploy to Netlify

### Production Migration
```bash
# After approval, convert prototype to production:
# 1. Copy HTML structure to .njk templates
# 2. Replace inline CSS with Tailwind v4 utilities
# 3. Move JS to src/assets/js/components/
# 4. Update data files with content
# 5. Run build and test
```

## 11) Troubleshooting

### Common Issues
- **Missing TaskSpec**: Ensure `strategy/_inputs/task.json` exists
- **Gate Failures**: Review checklist and fix missing items
- **Agent Conflicts**: Check verbose logs for coordination issues
- **Performance Issues**: Run lighthouse command separately

### Quality Checklist
- [ ] TaskSpec complete and valid
- [ ] All phases executed successfully
- [ ] Output directory has all artifacts
- [ ] Prototype opens in browser
- [ ] Copy is in proper Portuguese
- [ ] Analytics events present
- [ ] Performance metrics met
- [ ] Accessibility validated

## 12) Portuguese Market Optimization

### Cultural Considerations
- **Language**: Native pt-PT (not Brazilian Portuguese)
- **Pricing**: Euro with psychological pricing (€180 vs €200)
- **Payment**: Stripe + MB Way options
- **Trust**: Local testimonials and guarantees
- **Imagery**: Authentic Portuguese lifestyle

### Café com Vendas Specifics
- **Event**: September 20, 2025, Lisbon
- **Venue**: Mesa Corrida (150-year historic house)
- **Capacity**: 8 spots (scarcity)
- **Price**: €180 first lot (25% discount)
- **Guarantee**: 20% sales increase promise
- **Audience**: Female entrepreneurs 29-45

## 13) A/B Testing Recommendations

### High-Impact Tests
1. **Headline Variations**
   - Pain-focused vs aspiration-focused
   - Question vs statement format
   - Short vs detailed

2. **CTA Text**
   - "Garantir vaga" vs "Reservar lugar"
   - Urgency vs value focus
   - Color and size variations

3. **Social Proof**
   - Video vs text testimonials
   - Numbers vs stories
   - Position on page

### Sample Size Calculations
- **Baseline Rate**: 3% conversion
- **Minimum Detectable Effect**: 20% relative
- **Statistical Power**: 80%
- **Required Sample**: ~2,600 visitors per variant

## 14) Analytics Implementation

### Core Events
```javascript
const REQUIRED_EVENTS = {
  'page_view': 'Landing page load',
  'view_hero': 'Hero section visible',
  'scroll_depth': '25%, 50%, 75%, 100%',
  'cta_click': 'Any CTA button click',
  'form_start': 'Begin filling form',
  'form_submit': 'Complete form submission',
  'checkout_begin': 'Start Stripe checkout',
  'purchase': 'Successful payment'
};
```

### Enhanced Tracking
```javascript
const ENHANCED_EVENTS = {
  'video_play': 'Testimonial video starts',
  'faq_expand': 'FAQ item opened',
  'social_proof_view': 'Testimonial in viewport',
  'guarantee_view': 'Guarantee section visible',
  'exit_intent': 'Mouse leaves viewport'
};
```

## 15) Performance Optimization

### Critical Optimizations
- **Font Loading**: Preload Lora and Century Gothic
- **Image Format**: WebP with JPEG fallback
- **CSS**: Inline critical, defer non-critical
- **JavaScript**: Async/defer all scripts
- **Lazy Loading**: Images below fold

### Target Metrics
- **LCP**: <2.5s (Largest Contentful Paint)
- **FID**: <100ms (First Input Delay)
- **CLS**: <0.1 (Cumulative Layout Shift)
- **TTI**: <3.8s (Time to Interactive)
- **Speed Index**: <3.4s

Focus on systematic, quality-driven landing page creation that maximizes conversion potential while maintaining technical excellence and Portuguese market fit.