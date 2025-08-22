# /deploy

Deploy to Netlify production.

## Usage
```
/deploy                 # Deploy to production
/deploy --preview      # Deploy preview branch
/deploy --functions    # Include functions update
```

## What it does
1. **Build Verification**: `npm run build` - ensures clean production build
2. **Quality Gates**: `npm run type-check && npm run lint && npm run test`
3. **Performance Check**: Quick lighthouse audit
4. **Environment Check**: Validates required Netlify environment variables
5. **Deploy**: Uses Netlify CLI or git push for automatic deployment
6. **Verification**: Shows deployment URL and monitors initial response

## Pre-deployment Checklist
- ✓ TypeScript compilation successful
- ✓ ESLint validation passed  
- ✓ Unit and visual tests passing
- ✓ Lighthouse performance >90 (mobile)
- ✓ Stripe payment integration working
- ✓ Environment variables set (VITE_STRIPE_PUBLIC_KEY, VITE_GTM_CONTAINER_ID)

## Netlify Features
- Automatic SSL
- Global CDN
- Instant rollback
- Preview deploys
- Function deployment

## URLs
- Production: https://jucanamaximiliano.com.br
- Preview: https://deploy-preview-*.netlify.app

## Rollback
If issues detected:
```
/deploy --rollback
```