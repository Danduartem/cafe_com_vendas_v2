# 1) Intent
Run comprehensive Lighthouse performance audits on the Café com Vendas landing page and generate actionable reports with conversion-focused performance metrics analysis.

Goal: Provide instant performance insights to optimize conversion rates and track optimization progress for the Portuguese female entrepreneur event.
Non-Goals: Do not make code changes or modify files. This is a read-only analysis tool focused on landing page performance.

# 2) Inputs
Optional:
- `url`: Custom URL to audit (default: http://localhost:8080)
- `format`: Output format - "html", "json", "both" (default: "both")  
- `device`: Device type - "mobile", "desktop", "both" (default: "both")
- `open`: Auto-open HTML reports in browser - true/false (default: true)
- `quick`: Run performance-only audit for faster results (default: false)

# 3) Prerequisites
- Development server must be running (`npm run dev`)
- Port 8080 should be accessible
- Lighthouse CLI available via npx

# 4) Process

## Start Dev Server (if not running)
```bash
# Check if server is running
curl -s http://localhost:8080 > /dev/null || npm run dev &
sleep 3
```

## Run Lighthouse Audits
Based on device parameter:

**Both Mobile & Desktop (default):**
```bash
# Mobile audit with simulated 3G
npx lighthouse http://localhost:8080 \
  --form-factor=mobile \
  --preset=perf \
  --output=html,json \
  --output-path=./reports/lighthouse-mobile \
  --chrome-flags="--headless --no-sandbox"

# Desktop audit  
npx lighthouse http://localhost:8080 \
  --form-factor=desktop \
  --preset=desktop \
  --output=html,json \
  --output-path=./reports/lighthouse-desktop \
  --chrome-flags="--headless --no-sandbox"
```

**Mobile Only:**
```bash
npx lighthouse http://localhost:8080 \
  --form-factor=mobile \
  --preset=perf \
  --output=html,json \
  --output-path=./reports/lighthouse-mobile \
  --chrome-flags="--headless --no-sandbox"
```

**Desktop Only:**
```bash
npx lighthouse http://localhost:8080 \
  --form-factor=desktop \
  --preset=desktop \
  --output=html,json \
  --output-path=./reports/lighthouse-desktop \
  --chrome-flags="--headless --no-sandbox"
```

**Quick Performance Only:**
```bash
npx lighthouse http://localhost:8080 \
  --only-categories=performance \
  --form-factor=mobile \
  --output=json \
  --output-path=./reports/lighthouse-quick \
  --chrome-flags="--headless --no-sandbox"
```

## Generate Analysis Report
```bash
node -e "
const reports = [];
try {
  if (require('fs').existsSync('./reports/lighthouse-mobile.report.json')) {
    reports.push({type: 'Mobile', data: JSON.parse(require('fs').readFileSync('./reports/lighthouse-mobile.report.json', 'utf8'))});
  }
  if (require('fs').existsSync('./reports/lighthouse-desktop.report.json')) {
    reports.push({type: 'Desktop', data: JSON.parse(require('fs').readFileSync('./reports/lighthouse-desktop.report.json', 'utf8'))});
  }
  
  console.log('🎯 LIGHTHOUSE PERFORMANCE AUDIT RESULTS');
  console.log('==========================================\n');
  
  reports.forEach(({type, data}) => {
    const perf = data.categories.performance;
    const acc = data.categories.accessibility;
    const seo = data.categories.seo;
    const bp = data.categories['best-practices'];
    
    console.log(\`📱 \${type.toUpperCase()} SCORES:\`);
    console.log(\`  Performance: \${Math.round(perf.score * 100)}/100 \${perf.score >= 0.9 ? '✅' : '❌'}\`);
    if (acc) console.log(\`  Accessibility: \${Math.round(acc.score * 100)}/100 \${acc.score >= 0.95 ? '✅' : '❌'}\`);
    if (seo) console.log(\`  SEO: \${Math.round(seo.score * 100)}/100 \${seo.score >= 0.9 ? '✅' : '❌'}\`);
    if (bp) console.log(\`  Best Practices: \${Math.round(bp.score * 100)}/100 \${bp.score >= 0.9 ? '✅' : '❌'}\`);
    
    console.log('  Core Web Vitals:');
    console.log(\`    FCP: \${data.audits['first-contentful-paint'].displayValue}\`);
    console.log(\`    LCP: \${data.audits['largest-contentful-paint'].displayValue}\`);
    console.log(\`    TBT: \${data.audits['total-blocking-time'].displayValue}\`);
    console.log(\`    CLS: \${data.audits['cumulative-layout-shift'].displayValue}\`);
    console.log(\`    Speed Index: \${data.audits['speed-index'].displayValue}\`);
    console.log('');
  });
  
  console.log('🎯 TARGETS (from CLAUDE.md):');
  console.log('  Performance: >90 (Critical for conversion)');
  console.log('  Accessibility: >95 (WCAG AA compliance)');
  console.log('  SEO: >90 (Portuguese market visibility)');
  console.log('');
  
  console.log('💰 CONVERSION IMPACT ANALYSIS:');
  reports.forEach(({type, data}) => {
    const lcp = parseFloat(data.audits['largest-contentful-paint'].numericValue / 1000);
    const fcp = parseFloat(data.audits['first-contentful-paint'].numericValue / 1000);
    const cls = parseFloat(data.audits['cumulative-layout-shift'].numericValue);
    
    console.log(\`📱 \${type} Conversion Metrics:\`);
    console.log(\`  Time to CTA visible: \${fcp.toFixed(2)}s \${fcp <= 1.8 ? '✅' : '❌'}\`);
    console.log(\`  Time to hero loaded: \${lcp.toFixed(2)}s \${lcp <= 2.5 ? '✅' : '❌'}\`);
    console.log(\`  Layout stability: \${cls.toFixed(3)} \${cls <= 0.1 ? '✅' : '❌'}\`);
    console.log(\`  Est. conversion impact: \${fcp <= 1.8 && lcp <= 2.5 && cls <= 0.1 ? 'Optimal' : 'Needs improvement'}\`);
    console.log('');
  });
  console.log('');
  
  console.log('📊 GENERATED REPORTS:');
  if (require('fs').existsSync('./reports/lighthouse-mobile.report.html')) {
    console.log('  📱 Mobile: ./reports/lighthouse-mobile.report.html');
  }
  if (require('fs').existsSync('./reports/lighthouse-desktop.report.html')) {
    console.log('  💻 Desktop: ./reports/lighthouse-desktop.report.html');
  }
  console.log('');
  
} catch (error) {
  console.error('Error analyzing reports:', error.message);
}
"
```

## Auto-open Reports (if enabled)
```bash
# macOS
if [[ \"\$OSTYPE\" == \"darwin\"* ]] && [ \"\$open\" = \"true\" ]; then
  [ -f ./reports/lighthouse-mobile.report.html ] && open ./reports/lighthouse-mobile.report.html
  [ -f ./reports/lighthouse-desktop.report.html ] && open ./reports/lighthouse-desktop.report.html
fi

# Linux
if [[ \"\$OSTYPE\" == \"linux\"* ]] && [ \"\$open\" = \"true\" ]; then
  [ -f ./reports/lighthouse-mobile.report.html ] && xdg-open ./reports/lighthouse-mobile.report.html
  [ -f ./reports/lighthouse-desktop.report.html ] && xdg-open ./reports/lighthouse-desktop.report.html
fi
```

# 5) Output Structure

```
reports/
├── lighthouse-mobile.report.html     # Mobile HTML report
├── lighthouse-mobile.report.json     # Mobile JSON data
├── lighthouse-desktop.report.html    # Desktop HTML report  
├── lighthouse-desktop.report.json    # Desktop JSON data
└── lighthouse-quick.report.json      # Quick performance data
```

# 6) Success Criteria
- ✅ Performance Score ≥90 (CLAUDE.md target)
- ✅ Accessibility Score ≥95 (CLAUDE.md target) 
- ✅ LCP <2.5s
- ✅ FCP <1.8s
- ✅ TBT <200ms
- ✅ CLS <0.1

# 7) Usage Examples

```bash
# Full audit (default)
lighthouse

# Mobile only, open in browser
lighthouse device="mobile" open=true

# Desktop only, JSON format
lighthouse device="desktop" format="json"

# Quick performance check
lighthouse quick=true

# Custom URL 
lighthouse url="http://localhost:3000"

# Production URL audit for Portuguese market
lighthouse url="https://cafecomvendas.com" device="mobile"

# Test Stripe checkout performance  
lighthouse url="http://localhost:8080" device="mobile" format="json"
```

# 8) Troubleshooting

**Server not running:**
```bash
npm run dev
# Wait 3 seconds, then retry
```

**Port conflicts:**
```bash
lsof -ti:8080 | xargs kill -9
npm run dev
```

**Lighthouse not found:**
```bash
# Lighthouse is run via npx (no install needed)
npx lighthouse --version
```

**Permission errors:**
```bash
mkdir -p reports
chmod 755 reports
```

# 9) Integration with Development Workflow

**After code changes:**
```bash
npm run build:css  # Rebuild CSS
lighthouse quick=true  # Quick performance check
```

**Before deployment:**
```bash
npm run build
lighthouse device="both" format="both"
# Review reports before pushing
```

**CI/CD Integration:**
Can be integrated with GitHub Actions using the lighthouse-ci action for automated performance monitoring.

# 10) Performance Insights for Café com Vendas

The command analyzes key metrics that directly impact conversion rates for your Portuguese event landing page:
- **LCP (Largest Contentful Paint)**: When hero section loads (critical for first impression)
- **FCP (First Contentful Paint)**: When CTA buttons first appear (conversion opportunity)  
- **TBT (Total Blocking Time)**: JavaScript blocking form interactions
- **CLS (Cumulative Layout Shift)**: Visual stability during Stripe checkout flow
- **Speed Index**: How quickly testimonials and trust signals load

## Landing Page Specific Considerations

**Portuguese Market Mobile Performance:**
- Test on 3G connections (common in Portugal)
- Prioritize mobile-first optimization (high mobile usage)
- Monitor Cloudinary image delivery performance

**Conversion Critical Elements:**
- Hero section loading speed (LCP target: <2.5s)
- CTA button interactivity (FID target: <100ms)
- Form field responsiveness 
- Stripe payment modal performance

**Event-Specific Optimizations:**
- Testimonials carousel loading
- FAQ accordion performance
- Countdown timer script efficiency
- Social proof elements visibility timing

Use these insights to prioritize optimizations for maximum conversion impact on your premium event registration.