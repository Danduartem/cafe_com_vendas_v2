# /build

Production-ready build with your complete TypeScript toolchain.

## Usage
```
/build                  # Full production build
/build --clean          # Clean build directory first
/build --preview        # Build and serve locally
```

## Your Build Pipeline
1. **Clean**: `npm run clean` - Removes previous `_site/` 
2. **Design Tokens**: `npm run tokens:build` - Generates CSS variables
3. **CSS**: `npm run build:css` - PostCSS + Tailwind compilation
4. **JavaScript**: `npm run build:js` - Vite production bundle (TypeScript → optimized JS)
5. **HTML**: `npm run eleventy` - Static site generation from templates
6. **Quality Gates**: Type check → lint → build verification

## TypeScript Build Features
- **Full Type Safety**: All `.ts` files validated before build
- **ESM Output**: Modern JavaScript modules with proper imports
- **Tree Shaking**: Vite removes unused code automatically
- **Terser Minification**: Optimized bundle size
- **Source Maps**: Production debugging support

## Optimizations Applied
- **CSS**: PostCSS optimization, Tailwind purging
- **JavaScript**: Vite production mode, compression plugin
- **HTML**: Eleventy static generation, semantic markup
- **Assets**: Proper caching headers via `_headers`

## Output Structure
```
_site/
├── index.html              # Main landing page
├── assets/
│   ├── js/main.js         # Optimized TypeScript bundle
│   ├── css/tailwind.css   # Purged CSS with design tokens
│   └── images/            # Optimized images
├── politica-privacidade.html
└── _headers               # Netlify caching & CSP
```

## Quality Verification
- **TypeScript**: Zero compilation errors
- **Bundle Size**: Optimized for performance 
- **Static Analysis**: ESLint validation passed
- **Ready**: Deployable to Netlify