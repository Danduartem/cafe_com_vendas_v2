# Accessibility Guidelines - Café com Vendas

## Overview
This document outlines accessibility best practices and requirements for the Café com Vendas landing page, ensuring WCAG AA compliance and optimal user experience for all visitors.

## 🎯 Accessibility Standards

### WCAG AA Compliance Requirements
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text (18pt+)
- **Keyboard Navigation**: All interactive elements must be keyboard accessible
- **Screen Reader**: Proper semantic markup and ARIA attributes
- **Focus Management**: Visible focus indicators and logical tab order

### Target Lighthouse Scores
- **Accessibility**: 95+ (Current: 95/100)
- **Performance**: 90+ (Current: 84/100)
- **Best Practices**: 100 (Current: 100/100)

## 🚨 Critical Rules - ZERO TOLERANCE

### ARIA Attributes
- ❌ **NEVER** use invalid ARIA roles (`role="tab"` without proper tabpanel)
- ❌ **NEVER** use `aria-controls` pointing to non-existent elements
- ❌ **NEVER** use `aria-selected` on non-tab elements
- ✅ **ALWAYS** use `aria-current` for pagination/carousel indicators
- ✅ **ALWAYS** use proper semantic HTML before adding ARIA
- ✅ **ALWAYS** validate ARIA usage with accessibility testing tools

**Example - Carousel Pagination (CORRECT):**
```javascript
// ✅ CORRECT: Simple pagination buttons
const dot = document.createElement('button');
dot.setAttribute('type', 'button');
dot.setAttribute('aria-label', `Ir para página ${i + 1} dos testemunhos`);
dot.setAttribute('aria-current', 'false'); // 'true' for active page

// ❌ WRONG: Invalid tab semantics
// dot.setAttribute('role', 'tab'); // Don't use unless proper tablist/tabpanel structure
// dot.setAttribute('aria-controls', 'non-existent-id'); // Don't reference missing elements
```

### Color Contrast Requirements

#### Navy Blue Text (Primary Brand Color)
```css
/* ✅ CORRECT: WCAG AA Compliant */
.text-navy-800/80  /* Contrast ratio: 5.2:1 - AA compliant */
.text-navy-800/70  /* Contrast ratio: 4.7:1 - AA compliant */

/* ❌ WRONG: Insufficient contrast */
.text-navy-800/60  /* Contrast ratio: 3.1:1 - Fails AA */
.text-navy-800/50  /* Contrast ratio: 2.4:1 - Fails AA */
```

#### Gold Accent Text (On Dark Backgrounds)
```css
/* ✅ CORRECT: Better contrast on dark backgrounds */
.text-gold-200     /* Use on burgundy/navy gradients */
.text-gold-100     /* Use on very dark backgrounds */

/* ❌ WRONG: Poor contrast */
.text-gold-300     /* Can fail on burgundy backgrounds */
.text-gold-400     /* Often fails on dark gradients */
```

#### Footer & Low-Contrast Areas
```css
/* ✅ CORRECT: Sufficient contrast on dark backgrounds */
.text-neutral-300  /* Contrast ratio: 5.5:1 on navy-900 */
.text-neutral-200  /* Contrast ratio: 7.2:1 on navy-900 */

/* ❌ WRONG: Insufficient contrast */
.text-neutral-400  /* Contrast ratio: 3.5:1 - Fails AA */
.text-neutral-500  /* Contrast ratio: 2.8:1 - Fails AA */
```

## 🛠️ Implementation Checklist

### Before Adding New Components
- [ ] Use semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`)
- [ ] Add proper heading hierarchy (`h1` → `h2` → `h3`)
- [ ] Include `aria-label` for sections without visible headings
- [ ] Ensure keyboard navigation works without mouse
- [ ] Test with screen reader (VoiceOver on macOS, NVDA on Windows)

### Interactive Elements Checklist
- [ ] All buttons have `type="button"` (or `type="submit"` for forms)
- [ ] Focus states are visible (`focus:outline-none focus:ring-4`)
- [ ] Click targets are minimum 44x44px
- [ ] Touch targets have adequate spacing (8px minimum)
- [ ] Hover states don't rely solely on color change

### ARIA Implementation Checklist
- [ ] Use native HTML elements when possible
- [ ] Add ARIA only when semantic HTML isn't sufficient
- [ ] Validate all `aria-*` attributes point to existing elements
- [ ] Test with accessibility tree in browser dev tools
- [ ] Ensure `aria-hidden="true"` on decorative elements

## 🔧 Testing & Validation

### Automated Testing
```bash
# Run Lighthouse accessibility audit
npm run lighthouse

# Quick accessibility-only check
npm run lighthouse:quick
```

### Manual Testing Checklist
- [ ] **Keyboard Navigation**: Tab through all interactive elements
- [ ] **Screen Reader**: Test with VoiceOver (Cmd+F5 on macOS)
- [ ] **Color Blindness**: Test with browser's vision simulation
- [ ] **Zoom Test**: Ensure usability at 200% zoom level
- [ ] **Focus Management**: Visible focus indicators on all controls

### Browser Dev Tools Validation
1. **Chrome DevTools** → Lighthouse → Accessibility
2. **Firefox** → Inspector → Accessibility tab
3. **Safari** → Develop → Show Web Inspector → Audit tab

## 📋 Common Issues & Solutions

### Issue: Invalid ARIA Attributes
**Problem**: Using `role="tab"` without proper tablist structure
**Solution**: Use semantic pagination buttons with `aria-current`

### Issue: Poor Color Contrast
**Problem**: Text failing WCAG AA 4.5:1 ratio
**Solution**: Use tested color combinations from design tokens

### Issue: Missing Focus States
**Problem**: Interactive elements not keyboard accessible
**Solution**: Add Tailwind focus utilities (`focus:ring-4 focus:ring-gold-400/30`)

### Issue: Decorative Elements Confusing Screen Readers
**Problem**: Background graphics being announced
**Solution**: Add `aria-hidden="true"` to decorative elements

## 🎨 Design Token Accessibility

### Approved Color Combinations
All combinations below meet WCAG AA standards:

```css
/* Light backgrounds */
.bg-peach-50 .text-navy-800     /* 12.5:1 - AAA */
.bg-neutral-100 .text-navy-800  /* 11.8:1 - AAA */

/* Dark backgrounds */
.bg-navy-900 .text-neutral-300  /* 5.5:1 - AA */
.bg-navy-900 .text-gold-200     /* 6.2:1 - AA */
.bg-burgundy-800 .text-gold-200 /* 4.8:1 - AA */

/* Medium backgrounds */
.bg-white .text-navy-800/80     /* 5.2:1 - AA */
.bg-neutral-50 .text-navy-800/70 /* 4.7:1 - AA */
```

## 🚀 Performance Impact

### Accessibility Optimizations That Improve Performance
- **Semantic HTML**: Reduces need for ARIA attributes
- **Proper Focus Management**: Eliminates unnecessary DOM queries
- **Efficient Color Usage**: Leverages design token CSS variables
- **Screen Reader Optimization**: Uses `aria-hidden` to reduce noise

### Accessibility Features Cost
- **Impact**: <1KB additional JavaScript for ARIA management
- **Benefit**: 95/100 Lighthouse accessibility score
- **ROI**: Increased user base, legal compliance, better SEO

## 📚 Resources & References

### WCAG Guidelines
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/?levels=aaa)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [WAVE Web Accessibility Evaluator](https://wave.webaim.org/)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)

### Design System References
- [Design Tokens](../info/DATA_design_tokens.json) - WCAG AA compliant colors
- [Brand Guidelines](../info/GUIDE_brand_visual.md) - Accessibility considerations
- [Component Examples](../src/_includes/components/) - Accessible implementation patterns

---

## 🔄 Maintenance

### Regular Audits
- **Weekly**: Run `npm run lighthouse` during development
- **Pre-deployment**: Full accessibility test with real screen readers
- **Post-deployment**: Monitor Core Web Vitals and accessibility metrics

### Update Process
1. Test new components with accessibility checklist
2. Validate ARIA attributes with browser dev tools
3. Check color contrast ratios with design tokens
4. Update this documentation with new patterns/solutions

**Last Updated**: August 15, 2025
**Next Review**: September 15, 2025