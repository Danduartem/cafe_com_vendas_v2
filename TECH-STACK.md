# Tech Stack Documentation

**Last Updated:** August 14, 2024

## Current Dependencies (Latest Stable)

### Core Build Tools
- **Vite**: `7.1.2` - Next-generation frontend build tool
- **Eleventy**: `3.1.2` - Static site generator with full ESM support
- **Node.js**: `22.12+` - Required runtime (Vite 7 minimum requirement)

### CSS Framework & Processing
- **Tailwind CSS**: `4.1.12` - Utility-first CSS framework
- **@tailwindcss/postcss**: `4.1.12` - Tailwind CSS PostCSS plugin
- **PostCSS**: `8.5.6` - CSS post-processor
- **postcss-cli**: `11.0.1` - PostCSS command line interface
- **Autoprefixer**: `10.4.21` - CSS vendor prefix automation

### Integrations
- **Stripe**: `18.4.0` - Payment processing (latest API)
- **@fontsource/lora**: `5.2.6` - Web font package

## Official Documentation Links

### Build Tools
- **Vite 7.x**: https://vite.dev/guide/
  - Migration from v6: https://vite.dev/guide/migration
  - Configuration: https://vite.dev/config/
  - API Reference: https://vite.dev/guide/api-javascript
  
- **Eleventy 3.x**: https://www.11ty.dev/docs/
  - ESM Guide: https://www.11ty.dev/docs/cjs-esm/
  - Configuration: https://www.11ty.dev/docs/config/
  - Data Files: https://www.11ty.dev/docs/data/

### CSS & Styling
- **Tailwind CSS v4**: https://tailwindcss.com/docs/v4
  - CSS-first Configuration: https://tailwindcss.com/docs/v4/configuration
  - Migration from v3: https://tailwindcss.com/docs/v4/migration
  
### Integrations
- **Stripe API v18**: https://docs.stripe.com/api
  - Node.js SDK: https://github.com/stripe/stripe-node
  - Payment Intents: https://docs.stripe.com/payments/payment-intents
  
- **Netlify Functions**: https://docs.netlify.com/functions/overview/
  - ESM Support: https://docs.netlify.com/functions/create/?fn-language=js#format

## Major Version Changes & Breaking Changes

### Vite 7.0 (Latest)
- **Node.js 20.19+ or 22.12+ required** (dropped Node.js 18 support)
- Browser target changed to `baseline-widely-available`
- New domain: `vite.dev` (updated from `vitejs.dev`)
- Improved Environment API

### Eleventy 3.0
- **Full ESM support** - can use `export default` in config files
- `.cjs` extensions no longer required with `"type": "module"`
- Configuration files support `.js`, `.cjs`, `.mjs` extensions
- Async configuration function support

### Tailwind CSS v4
- **CSS-first configuration** via `@theme` directive
- Simplified setup - no more JS config files required
- Better performance and smaller bundle sizes
- Improved CSS custom properties integration

### Stripe v18
- Updated Node.js SDK with improved TypeScript support
- New webhook handling improvements
- Enhanced payment method APIs

## Development Environment Requirements

### Node.js Version
```bash
# Check current Node.js version
node --version  # Should be 20.19+ or 22.12+

# Update Node.js via nvm (recommended)
nvm install 22
nvm use 22
```

### Package Manager
- **npm**: 10.8.2+ (comes with Node.js 22)
- **pnpm**: 9+ (recommended for faster installs)

## Key Configuration Files

### ESM Configuration Pattern
All configuration files use modern ESM syntax:

- **vite.config.js**: ESM export with `export default defineConfig()`
- **.eleventy.js**: ESM export with `export default function(eleventyConfig)`
- **postcss.config.js**: ESM imports and `export default`
- **Data files**: Use `export default` instead of `module.exports`
- **Netlify Functions**: Use `export const handler` instead of `exports.handler`

### Package.json Type
```json
{
  "type": "module"
}
```
This enables ESM as the default module system.

## Performance Optimizations

### Vite 7.x Features
- Improved cold start performance
- Better dependency optimization
- Enhanced HMR (Hot Module Replacement)

### Eleventy 3.x Features  
- Faster incremental builds
- Improved template processing
- Better watch mode performance

## Troubleshooting Common Issues

### Node.js Version Conflicts
If you encounter issues, ensure Node.js 22+ is being used:
```bash
nvm use 22  # If using nvm
node --version
```

### ESM Import Issues
All imports should use ESM syntax:
```javascript
// ✅ Correct
import fs from 'fs'
import { fileURLToPath } from 'url'

// ❌ Incorrect
const fs = require('fs')
```

### Vite Build Issues
Clear cache if encountering build issues:
```bash
rm -rf node_modules/.vite
npm run build
```

## Update Schedule

- **Weekly**: Check for patch updates (`npm outdated`)
- **Monthly**: Review and apply minor updates
- **Quarterly**: Evaluate major version updates
- **As needed**: Security updates

## Getting Help

When asking Claude for help, always reference this file so I know:
- Current versions in use
- Documentation links to reference
- Breaking changes to be aware of
- Configuration patterns being followed

This ensures I can provide accurate, version-specific guidance using the latest documentation.