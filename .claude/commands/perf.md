# /perf

Quick performance audit using Lighthouse.

## Usage
```
/perf                    # Run full audit
/perf --mobile          # Mobile only
/perf --desktop         # Desktop only
/perf --quick           # Performance metrics only
```

## What it does
1. Starts dev server if needed
2. Runs Lighthouse audit
3. Generates HTML report
4. Shows key metrics
5. Opens report in browser

## Key Metrics
- **Performance**: >90 target
- **Accessibility**: >95 target
- **Core Web Vitals**: LCP, FID, CLS
- **Best Practices**: >95 target
- **SEO**: >95 target

## Examples
```bash
# Full audit (mobile + desktop)
/perf

# Quick mobile check
/perf --mobile --quick

# Desktop performance only
/perf --desktop --quick
```

## Output
- HTML reports in `./reports/`
- Console summary of scores
- Auto-opens in browser

## Conversion Impact
Performance directly affects conversion rates. Every second of delay can reduce conversions by 7%.