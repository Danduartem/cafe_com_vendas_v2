# /deploy

Deploy to Netlify production.

## Usage
```
/deploy                 # Deploy to production
/deploy --preview      # Deploy preview branch
/deploy --functions    # Include functions update
```

## What it does
1. Runs production build
2. Runs quality checks
3. Tests payment integration
4. Deploys to Netlify
5. Shows deployment URL
6. Monitors for errors

## Pre-deployment Checks
- ✓ Build successful
- ✓ Tests passing
- ✓ Lighthouse >90
- ✓ Payment working
- ✓ Environment vars set

## Netlify Features
- Automatic SSL
- Global CDN
- Instant rollback
- Preview deploys
- Function deployment

## URLs
- Production: https://cafecomvendas.com
- Preview: https://deploy-preview-*.netlify.app

## Rollback
If issues detected:
```
/deploy --rollback
```