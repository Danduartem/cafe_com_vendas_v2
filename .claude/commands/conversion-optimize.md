# Conversion Optimization Command

Analyze and optimize conversion funnel for Café com Vendas premium event landing page targeting Portuguese female entrepreneurs.

## 1) Intent
Goal: Identify conversion bottlenecks and implement data-driven optimizations to maximize event registration rates for the September 2025 Lisbon event.
Non-Goals: No major design overhauls or brand changes. Focus on incremental improvements with measurable impact.

## 2) Inputs
Optional:
- `focus`: "funnel" | "mobile" | "checkout" | "trust" | "copy" (default: funnel)
- `audience`: "primary" | "secondary" | "all" (default: primary - female entrepreneurs)
- `test-mode`: true|false (default: true) - use Stripe test mode
- `performance-check`: true|false (default: true) - run Lighthouse audit
- `analytics-period`: days to analyze (default: 30)

## 3) Analysis Areas

### Conversion Funnel Analysis
1. **Landing → Interest** (scroll to value proposition)
2. **Interest → Consideration** (testimonials/social proof engagement)
3. **Consideration → Intent** (CTA clicks, pricing section views)
4. **Intent → Action** (Stripe checkout initiation)
5. **Action → Completion** (successful payment)

### Mobile Conversion Focus
- Portuguese market mobile usage patterns
- Touch-friendly CTA buttons (44px minimum)
- Mobile checkout flow optimization
- 3G connection performance

### Trust Signal Optimization
- Testimonial placement and credibility
- Social proof effectiveness
- Security badges and guarantees
- Event scarcity indicators (8 spots remaining)

### Copy Performance
- Headline conversion impact
- CTA text effectiveness
- Value proposition clarity
- Objection handling in FAQ

## 4) Method

### Step 1: Baseline Analysis
```bash
# Performance baseline
npm run lighthouse

# Check current conversion elements
# - Hero CTA visibility time
# - Mobile responsiveness
# - Form field accessibility
# - Stripe integration health
```

### Step 2: Funnel Audit
```bash
# Analyze conversion path
# 1. Hero section impact measurement
# 2. Testimonials engagement tracking  
# 3. Pricing section clarity
# 4. FAQ objection handling
# 5. Final CTA positioning

# Check mobile conversion flow
# - Thumb-friendly navigation
# - Form field usability
# - Payment modal performance
```

### Step 3: Technical Optimizations
```bash
# Critical render path analysis
# - Above-fold content loading
# - CTA button interaction time
# - Form validation speed
# - Payment processing flow

# Portuguese market considerations
# - Euro currency display
# - Portuguese UI patterns
# - Local payment preferences
```

## 5) Optimization Areas

### High-Impact Quick Wins
1. **CTA Button Optimization**
   - Color contrast for accessibility
   - Text urgency and clarity
   - Size and positioning
   - Mobile tap target size

2. **Trust Signal Enhancement**
   - Money-back guarantee prominence
   - Testimonial photo quality
   - Security badge placement
   - Social proof numbers

3. **Mobile Experience**
   - Form field optimization
   - Touch-friendly interactions
   - Loading speed improvements
   - Stripe mobile checkout

### Medium-Impact Improvements
1. **Copy Optimization**
   - Headline clarity and urgency
   - Value proposition strength
   - Feature vs. benefit focus
   - Objection handling in FAQ

2. **Social Proof Enhancement**
   - Testimonial relevance
   - Success story placement
   - Trust indicator visibility
   - Scarcity messaging

### Advanced Optimizations
1. **Psychological Triggers**
   - Urgency creation (limited spots)
   - Social proof amplification
   - Authority building
   - Risk reversal emphasis

2. **User Experience Flow**
   - Scroll trigger optimizations
   - Progressive disclosure
   - Friction point elimination
   - Cognitive load reduction

## 6) Testing Recommendations

### A/B Test Ideas
1. **CTA Variations**
   - "Garantir vaga" vs "Reservar lugar"
   - Button color variations
   - Urgency messaging tests

2. **Pricing Presentation**
   - Payment plan options
   - Early bird vs regular pricing
   - Bundle vs individual pricing

3. **Social Proof Types**
   - Video testimonials vs text
   - Before/after stories
   - Number of attendees vs success stories

### Performance Tests
1. **Mobile Performance**
   - 3G loading simulation
   - Touch interaction testing
   - Form completion flow

2. **Checkout Flow**
   - Stripe payment completion rates
   - Error handling effectiveness
   - Security perception testing

## 7) Output Structure

```
reports/conversion/
├── funnel-analysis.json      # Conversion step analytics
├── mobile-audit.json        # Mobile-specific issues
├── trust-signal-audit.json  # Trust element effectiveness
├── copy-performance.json    # Content engagement metrics
├── recommendations.md       # Prioritized optimization list
└── testing-plan.md         # A/B test recommendations
```

## 8) Success Metrics

### Primary KPIs
- **Overall conversion rate**: Visitors → Paid registrations
- **Funnel step completion**: Each conversion stage percentage
- **Mobile conversion rate**: Mobile-specific performance
- **Payment completion rate**: Stripe checkout success

### Secondary Metrics
- **Engagement depth**: Time on page, scroll depth
- **Trust indicators**: Testimonial interaction rates
- **CTA performance**: Click-through rates by position
- **Form optimization**: Completion vs abandonment rates

### Portuguese Market Benchmarks
- **Landing page conversion**: 2-5% (premium events)
- **Mobile traffic ratio**: 60-70% (Portugal market)
- **Payment completion**: 85%+ (after checkout initiation)
- **Page load speed**: <3s on mobile 3G

## 9) Command Examples

```bash
# Full conversion audit
/conversion-optimize

# Focus on mobile experience
/conversion-optimize focus="mobile" performance-check=true

# Checkout flow optimization
/conversion-optimize focus="checkout" test-mode=true

# Trust signal analysis
/conversion-optimize focus="trust" audience="primary"

# Copy performance review
/conversion-optimize focus="copy" analytics-period=14
```

## 10) Integration Points

### Analytics Integration
- GTM conversion event tracking
- Stripe payment funnel analysis
- Mobile vs desktop performance comparison
- Portuguese traffic source analysis

### Performance Integration
- Lighthouse conversion impact scoring
- Core Web Vitals for conversion pages
- Real User Monitoring integration
- A/B testing statistical significance

### Content Integration
- Portuguese copy library utilization
- Female entrepreneur persona alignment
- Event-specific messaging optimization
- Premium positioning maintenance

## 11) Recommendations Template

### Immediate Actions (0-2 days)
- [ ] CTA button contrast improvement
- [ ] Mobile form field optimization
- [ ] Trust badge repositioning
- [ ] Loading speed optimization

### Short-term Tests (1-2 weeks)
- [ ] A/B test headline variations
- [ ] Test payment plan options
- [ ] Optimize testimonial placement
- [ ] Improve mobile checkout flow

### Long-term Strategy (1+ months)
- [ ] Advanced personalization
- [ ] Dynamic pricing tests
- [ ] Video testimonial integration
- [ ] Multi-step funnel optimization

Focus on incremental improvements with measurable conversion impact for maximum ROI on your premium Portuguese event.