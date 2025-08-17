# Intelligent Hooks for Café com Vendas

This directory contains intelligent, project-aware hooks specifically optimized for the **Café com Vendas** landing page - a premium €2,500 event for Portuguese female entrepreneurs.

## 🎯 Project Context

- **Event**: September 20, 2025 in Lisbon
- **Audience**: Portuguese female entrepreneurs  
- **Price**: €2,500 (premium positioning)
- **Spots**: 8 available (scarcity-driven)
- **Tech Stack**: Eleventy 3.x + Vite 7.x + Tailwind CSS v4 + Stripe

## 🚀 Intelligent Hooks Overview

These hooks go beyond basic file watching to provide:
- **File-type aware validation** (Nunjucks, JavaScript, CSS, JSON)
- **Conversion-critical file monitoring** (Hero, Offer, Checkout, Payment)
- **Portuguese market compliance** (language, currency, date formats)
- **WCAG AA accessibility enforcement** (4.5:1 contrast, ARIA)
- **Payment security validation** (PCI compliance, Stripe best practices)
- **Performance optimization monitoring** (Core Web Vitals, mobile-first)

## 📁 Hook Files

### Core File Operation Hooks

#### `pre-file-edit.sh`
**Context-aware pre-editing warnings**
- Shows file-specific guidance before editing
- Warns when editing conversion-critical files  
- Provides context about file importance and impact
- Displays current event pricing and countdown

**Features:**
- Component type detection (Hero, Offer, Payment, etc.)
- Conversion criticality assessment
- Portuguese market context

#### `post-file-edit.sh`  
**Intelligent post-editing validation**
- File-type aware validation rules
- Tailwind CSS compliance checking
- Design token validation
- API security scanning
- WCAG AA accessibility checks

**Validation by file type:**
- **Nunjucks templates**: Tailwind compliance, accessibility, Portuguese content
- **JavaScript modules**: API security, error handling, performance
- **Payment code**: Extra security checks, error handling, webhook validation
- **Stylesheets**: Design token usage, Tailwind v4 compliance
- **Event data**: JSON validation, pricing consistency, date integrity

#### `post-file-create.sh`
**File creation guidance and setup**
- Type-specific creation best practices
- Security warnings for payment files
- Accessibility reminders for templates
- Portuguese localization guidance

### Specialized Monitoring Hooks

#### `performance-guard.sh`
**Conversion performance monitoring**
- Core Web Vitals validation for Portuguese mobile users
- JavaScript bundle size monitoring (200KB limit)
- Image optimization validation (WebP via Cloudinary)
- Third-party script loading patterns
- Mobile performance impact assessment

**Key features:**
- Cloudinary WebP optimization validation
- Stripe.js lazy loading verification  
- Mobile-first performance targeting
- Portuguese market connection considerations

#### `stripe-guard.sh` 
**Payment security and compliance monitoring**
- Stripe API key security validation
- Webhook signature verification
- PCI compliance pattern checking
- Payment amount consistency (€2,500 = 250,000 cents)
- Portuguese payment method support

**Security checks:**
- No live keys in code
- Environment variable usage
- Webhook security implementation
- Payment flow error handling
- Test card validation

#### `accessibility-validator.sh`
**WCAG AA compliance enforcement**
- Color contrast validation (4.5:1 minimum)
- ARIA attributes and semantic HTML
- Keyboard navigation support
- Portuguese language considerations
- Screen reader compatibility

**Approved color combinations:**
- `text-navy-800/80` (light backgrounds)
- `text-navy-800/70` (medium backgrounds) 
- `text-neutral-300` (dark backgrounds)
- `text-gold-200` (dark gradients)

#### `event-data-sentinel.sh`
**Critical event data monitoring**
- Event date validation (2025-09-20)
- Pricing consistency across components
- Portuguese localization validation
- Countdown timer accuracy
- Data integrity across templates

**Monitors:**
- `info/DATA_event.json` changes
- Template data binding
- Payment processing amounts
- Portuguese date/currency formats
- Guarantee terms consistency

#### `conversion-monitor.sh`
**Overall conversion funnel health**
- Conversion component analysis
- Mobile optimization assessment (80% mobile traffic)
- Portuguese market fit validation
- Urgency/scarcity element checking
- Revenue impact analysis

**Conversion factors:**
- Critical component presence
- Mobile-first optimization
- Trust signal implementation
- Payment flow security
- Analytics tracking setup

### Utility Scripts

#### `utils/colors.sh`
**Consistent terminal output formatting**
```bash
success "Operation completed"      # Green text
warning "Review recommended"       # Yellow text  
error "Action required"           # Red text
info "Additional information"     # Blue text
```

#### `utils/validators.sh`
**Common validation functions**
- Tailwind CSS compliance checking
- Design token validation
- API security scanning
- JSON syntax validation
- Accessibility pattern checking
- Portuguese content validation

#### `utils/project-helpers.sh`
**Project-specific helper functions**
- File type detection and classification
- Conversion criticality assessment
- Event data extraction
- Build status checking
- Component type identification

### Legacy Hooks

#### `auto-build.sh`
**Automated build process for landing page**
- Design tokens generation
- CSS compilation with PostCSS
- JavaScript bundling with Vite
- Eleventy static site generation

#### `project-context.sh`  
**Dynamic project information display**
- Real-time event countdown
- Current pricing display
- Build status monitoring
- Git branch information

## 🔧 Installation & Configuration

### Prerequisites
- Node.js 22.18.0+ (see `.nvmrc`)
- Claude Code with hooks support
- Bash 4.0+ (macOS/Linux)

### Setup
1. Ensure hooks are executable:
```bash
chmod +x .claude/hooks/*.sh
chmod +x .claude/hooks/utils/*.sh
```

2. Configure in `.claude/settings.json`:
```json
{
  "hooks": {
    "pre-file-edit": {
      "type": "command",
      "command": ".claude/hooks/pre-file-edit.sh"
    },
    "post-file-edit": {
      "type": "command", 
      "command": ".claude/hooks/post-file-edit.sh"
    },
    "post-file-create": {
      "type": "command",
      "command": ".claude/hooks/post-file-create.sh"
    }
  }
}
```

### Manual Execution
Run specialized hooks manually:
```bash
# Performance monitoring
./.claude/hooks/performance-guard.sh

# Payment security check
./.claude/hooks/stripe-guard.sh

# Accessibility validation
./.claude/hooks/accessibility-validator.sh

# Event data integrity
./.claude/hooks/event-data-sentinel.sh

# Conversion health check
./.claude/hooks/conversion-monitor.sh
```

## 🎯 File Type Detection

The hooks automatically detect and handle different file types:

| Pattern | Type | Validation Focus |
|---------|------|------------------|
| `*.njk` | Nunjucks Template | Tailwind compliance, accessibility, Portuguese content |
| `components/*.js` | Component JavaScript | ES6 modules, error handling, analytics |
| `*stripe*/*.js` | Payment JavaScript | Security, error handling, PCI compliance |
| `*.css` | Stylesheet | Design tokens, Tailwind v4, mobile-first |
| `DATA_*.json` | Event Data | Pricing consistency, date validation, Portuguese format |
| `*.md` | Documentation | Content accuracy, technical correctness |

## 🇵🇹 Portuguese Market Optimizations

### Language Considerations
- Date format: DD/MM/YYYY (20/09/2025)
- Currency: Euro symbol (€2,500)
- Cultural terms: "empresárias", "transformação", "garantia"
- Location: "Lisboa" (not "Lisbon")

### Trust Factors
- Portuguese testimonials and social proof
- Local payment methods support
- GDPR compliance messaging
- Security certifications display

### Mobile Optimization
- 80% mobile traffic expected
- 3G/4G connection optimization
- Touch-friendly interface (44px+ targets)
- Reduced data usage (WebP images)

## 🔒 Security Features

### Payment Security
- No API keys in code (environment variables only)
- Webhook signature verification
- PCI compliance patterns
- Input validation and sanitization
- Proper error handling

### Accessibility Security
- WCAG AA compliance (4.5:1 contrast)
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Semantic HTML structure

### Performance Security
- CSP compliance (no inline scripts/styles)
- Lazy loading for third-party scripts
- Optimized asset delivery
- Mobile performance protection

## 📊 Conversion Optimization

### Critical Components Monitored
1. **Hero Section**: First impression, value proposition
2. **Offer Section**: Pricing, scarcity, guarantee
3. **Checkout Flow**: Payment security, error handling
4. **Final CTA**: Last chance conversion
5. **Social Proof**: Trust building, testimonials

### Performance Targets
- Lighthouse Performance: >90
- Lighthouse Accessibility: >95
- Core Web Vitals: LCP <2.5s
- Mobile-first optimization
- €2,500 high-value conversion focus

### Urgency Elements
- Countdown to September 20, 2025
- 8 spots scarcity messaging
- Recent social proof
- Time-limited offers

## 🛠️ Troubleshooting

### Common Issues

**Hook not executing:**
```bash
# Check permissions
ls -la .claude/hooks/*.sh

# Make executable if needed
chmod +x .claude/hooks/*.sh
```

**Validation errors:**
- Check file paths are absolute
- Verify JSON syntax in event data
- Ensure environment variables are set
- Validate Tailwind class usage

**Performance warnings:**
- Optimize images with Cloudinary
- Implement lazy loading
- Check JavaScript bundle size
- Validate Core Web Vitals

### Debug Mode
Add debug output to any hook:
```bash
export DEBUG=1
./.claude/hooks/conversion-monitor.sh
```

## 📈 Analytics & Monitoring

### Conversion Tracking
- Analytics implementation validation
- Conversion event setup
- A/B testing readiness
- Revenue impact analysis

### Performance Monitoring  
- Core Web Vitals tracking
- Mobile performance focus
- Payment flow optimization
- Portuguese market metrics

### Data Integrity
- Event data consistency
- Pricing synchronization
- Date calculation accuracy
- Portuguese localization

## 🔄 Maintenance

### Regular Checks
- Update event countdown calculations
- Validate payment processing amounts
- Check Portuguese content accuracy
- Monitor conversion performance
- Review accessibility compliance

### Seasonal Updates
- Adjust urgency messaging based on event proximity
- Update pricing tiers if needed
- Refresh testimonials and social proof
- Optimize for seasonal traffic patterns

## 📚 Resources

### Documentation
- [CLAUDE.md](../CLAUDE.md) - Project guidelines
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards
- [Stripe Documentation](https://stripe.com/docs) - Payment integration
- [Tailwind CSS v4](https://tailwindcss.com/docs) - Utility-first CSS

### Tools
- Lighthouse - Performance and accessibility auditing
- Cloudinary - Image optimization and WebP delivery
- Stripe CLI - Payment testing and webhook validation
- Claude Code - AI-powered development assistance

---

**Last Updated**: August 2025  
**Project**: Café com Vendas Landing Page  
**Target**: Portuguese Female Entrepreneurs  
**Event**: September 20, 2025, Lisbon