# /lighthouse

Complete web audit using Google Lighthouse - performance, SEO, accessibility, and best practices.

## Usage
```
/lighthouse              # Full audit (mobile + desktop)
/lighthouse --mobile     # Mobile audit only
/lighthouse --desktop    # Desktop audit only  
/lighthouse --quick      # Performance metrics only
```

## What it does
1. Starts dev server if needed (http://localhost:8080)
2. Runs Google Lighthouse audit using your npm scripts
3. Generates HTML and JSON reports
4. Shows comprehensive scores across all categories
5. Opens reports in browser

## All Lighthouse Categories
- **Performance**: Core Web Vitals, LCP, CLS, FID (>90 target)
- **SEO**: Meta tags, structured data, mobile-friendly (>95 target)
- **Accessibility**: WCAG compliance, screen readers (>95 target)
- **Best Practices**: Security, modern standards (>95 target)

## Your Scripts Integration
- Uses `npm run lighthouse` (mobile + desktop)
- Uses `npm run lighthouse:mobile` (mobile only)
- Uses `npm run lighthouse:desktop` (desktop only)
- Uses `npm run lighthouse:quick` (performance only)

## Examples
```bash
# Complete audit (all categories, both devices)
/lighthouse

# Mobile-first audit (critical for conversions)
/lighthouse --mobile

# Quick performance check
/lighthouse --quick
```

## Output
- HTML reports in `./reports/lighthouse-mobile.report.html`
- JSON data in `./reports/lighthouse-desktop.report.json`
- Console summary of all scores
- Auto-opens reports in browser

## Business Impact
- **Performance**: Every second = 7% conversion loss
- **SEO**: Organic traffic → more leads
- **Accessibility**: Broader audience reach
- **Mobile**: 60%+ of traffic on mobile devices