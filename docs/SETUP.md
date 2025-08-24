# Setup — Café com Vendas

Quick technical setup for the landing page.

---

## Environment Variables

### Required
```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key  
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

MAILERLITE_API_KEY=your_api_key
VITE_GTM_CONTAINER_ID=GTM-T63QRLFT
```

### Optional
```bash
VITE_CLOUDINARY_CLOUD_NAME=ds4dhbneq  # Default cloud name
VITE_FORMSPREE_FORM_ID=xanbnrvp      # Backup form handling
```

---

## Development

```bash
npm run dev          # Local development
npm run netlify:dev  # With serverless functions
npm run type-check   # TypeScript validation
npm run lint         # Code quality
npm test            # Unit tests
```

---

## Integrations

### GTM/GA4
- **Container**: `GTM-T63QRLFT` 
- **Key event**: `payment_completed` → GA4 `purchase`
- **Test**: Check `window.dataLayer` in browser console

### Stripe  
- **Mode**: Use test keys for development
- **Cards**: See `STRIPE_TEST_CARDS.md`
- **Testing**: See `PAYMENT_TESTING_SUMMARY.md`

### Cloudinary
- **Cloud**: `ds4dhbneq`
- **Usage**: Direct URLs in templates with responsive variants
- **Pattern**: `https://res.cloudinary.com/ds4dhbneq/image/upload/w_640,h_400,c_fill,q_auto,f_auto/image_id`

---

## Deployment

### Netlify
- Set environment variables in dashboard
- Functions auto-deploy from `netlify/functions/`
- Edge functions auto-deploy from `netlify/edge-functions/`

### Quality Gates
All must pass:
```bash
npm run type-check   # 0 errors
npm run lint        # 0 errors  
npm test           # All pass
```

---

*Essential setup only. Everything else is in code or comments.*