# Edit Map — Where to Change What

Quick reference for common content edits in the Café com Vendas project.

---

## 📝 Content & Copy

### Section Content
All section content lives in `src/_data/sections/`:

- **Hero**: `src/_data/sections/hero.json`
- **Problem**: `src/_data/sections/problem.json` 
- **Solution**: `src/_data/sections/solution.json`
- **About**: `src/_data/sections/about.json`
- **Social Proof**: `src/_data/sections/social-proof.json`
- **Offer**: `src/_data/sections/offer.json`
- **FAQ**: `src/_data/sections/faq.json`
- **Final CTA**: `src/_data/sections/final-cta.json`
- **Footer**: `src/_data/sections/footer.json`
- **Thank You**: `src/_data/sections/thank-you-content.json`

### Site-wide Settings
- **Site metadata**: `src/_data/site.ts`
- **Page configurations**: `src/_data/pages.ts`

---

## 🎨 Images & Media

### Cloudinary Images
All images served via Cloudinary CDN (`ds4dhbneq`):

- **Hero background**: Referenced in `src/assets/css/main.css:338`
- **About presenter**: `src/_includes/sections/about/index.njk` (sobre3_pnikcv)
- **Problem illustration**: `src/_includes/sections/problem/index.njk` (problem-overworked_p5ntju)
- **YouTube thumbnails**: Auto-generated in `src/_data/sections/social-proof.json`

### Static Assets
- **Fonts**: `public/fonts/CenturyGothic/` and `public/fonts/Lora/`
- **Favicon**: `public/favicon.ico` and `public/favicon.svg`

---

## ⚙️ Configuration

### Environment Variables
- **Development**: `.env.local` 
- **Production**: Netlify dashboard
- **Example**: `.env.example`

### Build & Development
- **TypeScript**: `tsconfig.json`
- **Vite**: `vite.config.ts`
- **Eleventy**: `.eleventy.ts`
- **ESLint**: `eslint.config.ts`

---

## 🔧 Components & Logic

### Page Sections
Each section has two files:
- **Template**: `src/_includes/sections/{name}/index.njk`
- **Logic**: `src/_includes/sections/{name}/index.ts`

### UI Components
- **Path**: `src/components/ui/{name}/index.ts`
- **Examples**: accordion, analytics, animations, thank-you

### Utilities
- **DOM helpers**: `src/assets/js/utils/dom.ts`
- **Analytics**: `src/assets/js/utils/gtm-normalizer.ts`
- **Config**: `src/assets/js/config/constants.ts`

---

## 💳 Payment & Analytics

### Stripe Integration
- **Payment Intent**: `netlify/functions/create-payment-intent.ts`
- **Webhooks**: `netlify/functions/stripe-webhook.ts`
- **Test cards**: `docs/STRIPE_TEST_CARDS.md`

### Analytics & GTM
- **GTM Config**: Environment variable `VITE_GTM_CONTAINER_ID`
- **Event definitions**: `src/assets/js/config/constants.ts` (ANALYTICS_EVENTS)
- **Implementation**: Components use dynamic imports to `src/components/ui/analytics`

---

## 📄 Legal Pages

### Templates
- **Privacy**: `src/pages/politica-privacidade.njk`
- **Terms**: `src/pages/termos-condicoes.njk` 
- **Refund**: `src/pages/garantia-reembolso.njk`
- **Thank You**: `src/pages/thank-you.njk`

---

## 🛠️ Development Workflow

### Quality Checks
```bash
npm run type-check    # TypeScript validation
npm run lint         # ESLint validation
npm test            # Unit tests
npm run verify-apis  # API compatibility
```

### Local Development
```bash
npm run dev          # Eleventy dev server
npm run netlify:dev  # With serverless functions
```

---

*Based on actual project structure, not theoretical architecture.*