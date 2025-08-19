# /build

Production build with optimizations and checks.

## Usage
```
/build                  # Production build
/build --analyze       # Show bundle analysis
/build --preview       # Preview after build
```

## What it does
1. Cleans previous build
2. Builds design tokens
3. Compiles CSS with PostCSS
4. Bundles JS with Vite
5. Generates static HTML
6. Optimizes assets
7. Runs quality checks

## Optimizations
- CSS purging (removes unused)
- JS minification
- Image optimization
- HTML minification
- Critical CSS inlining
- Tree shaking

## Output
- Static files in `_site/`
- Ready for deployment
- Optimized for performance
- WCAG AA compliant

## Quality Checks
✓ No broken links
✓ Valid HTML
✓ Accessibility passed
✓ Bundle size < 200KB