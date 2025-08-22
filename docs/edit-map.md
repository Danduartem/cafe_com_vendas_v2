# Edit Map - Where to Change What

Quick reference for the 20+ most common content and configuration edits in the Café com Vendas project.

## 🎯 Content Edits (Copy & Messaging)

### Hero Section
- **Headline**: `content/pt-PT/sections/hero.json` → `copy.headline`
- **Subheadline**: `content/pt-PT/sections/hero.json` → `copy.subhead`
- **CTA Button Text**: `content/pt-PT/sections/hero.json` → `copy.cta.primary.label`
- **Event Badge (Date/Location)**: `content/pt-PT/sections/hero.json` → `copy.badge`

### Event Details
- **Event Date**: `content/pt-PT/event.json` → `date`
- **Event Location**: `content/pt-PT/event.json` → `location`
- **Event Price**: `content/pt-PT/event.json` → `pricing.early_bird.price`
- **Ticket Limits**: `content/pt-PT/event.json` → `pricing.early_bird.limit`

### Offer Section
- **Product Name**: `content/pt-PT/sections/offer.json` → `copy.title`
- **Price Display**: `content/pt-PT/sections/offer.json` → `copy.pricing`
- **Features List**: `content/pt-PT/sections/offer.json` → `copy.features`
- **Guarantee Text**: `content/pt-PT/sections/offer.json` → `copy.guarantee`

### FAQ Section
- **FAQ Questions**: `content/pt-PT/sections/faq.json` → `copy.items[].question`
- **FAQ Answers**: `content/pt-PT/sections/faq.json` → `copy.items[].answer`

### About Section (Presenter)
- **Bio Text**: `content/pt-PT/sections/about.json` → `copy.description`
- **Presenter Name**: `content/pt-PT/presenter.json` → `name`
- **Presenter Image**: `content/pt-PT/presenter.json` → `photo.src`

### Social Proof
- **Testimonials**: `content/pt-PT/testimonials.json` → `items[]`
- **Statistics**: `content/pt-PT/sections/social-proof.json` → `copy.stats`

### Footer
- **Contact Info**: `content/pt-PT/sections/footer.json` → `copy.contact`
- **Social Links**: `content/pt-PT/sections/footer.json` → `copy.social`
- **Legal Links**: `content/pt-PT/sections/footer.json` → `copy.legal`

## 🎨 Design & Styling

### Design Tokens
- **Colors**: `design/tokens.json` → `cssVariables.colors`
- **Typography**: `design/tokens.json` → `cssVariables.typography`
- **Spacing**: `design/tokens.json` → `cssVariables.semantic`

### Section Themes
- **Section Background**: `content/pt-PT/sections/{section}.json` → `design.background`
- **Section Accent Color**: `content/pt-PT/sections/{section}.json` → `design.accent`
- **Layout Variant**: `content/pt-PT/sections/{section}.json` → `design.layout`

### Images
- **Hero Background**: `content/pt-PT/sections/hero.json` → `media.background`
- **Product Images**: `src/assets/images/` (then reference in content)
- **Presenter Photo**: `src/assets/images/` (then reference in `presenter.json`)

## ⚙️ Configuration & Settings

### Site-wide Settings
- **Site Title**: `content/pt-PT/site.json` → `title`
- **Site Description**: `content/pt-PT/site.json` → `description`
- **Default Language**: `content/pt-PT/site.json` → `lang`

### Analytics & Tracking
- **GTM Container**: `src/assets/js/config/constants.ts` → `GTM_ID`
- **Section Tracking IDs**: `content/pt-PT/sections/{section}.json` → `tracking.section_id`
- **Event Names**: `content/pt-PT/sections/{section}.json` → `tracking.impression_event`

### Payment Integration
- **Stripe Public Key**: `netlify/functions/create-payment-intent.ts` → `STRIPE_PUBLISHABLE_KEY`
- **Product Prices**: `netlify/functions/create-payment-intent.ts` → price mapping
- **Webhook Endpoint**: `netlify/functions/stripe-webhook.ts`

### Email Integration
- **MailerLite API**: `netlify/functions/mailerlite-lead.ts` → `MAILERLITE_API_KEY`
- **Email Groups**: `netlify/functions/mailerlite-lead.ts` → group IDs

## 📱 Legal Pages

### Privacy Policy
- **Content**: `content/pt-PT/pages/legal-privacy.json`
- **Template**: `src/pages/politica-privacidade.njk`

### Terms & Conditions
- **Content**: `content/pt-PT/legal.json` → `terms`
- **Template**: `src/pages/termos-condicoes.njk`

### Refund Policy
- **Content**: `content/pt-PT/legal.json` → `refund`
- **Template**: `src/pages/garantia-reembolso.njk`

## 🔧 Development & Build

### Adding New Sections
1. Create directory: `src/_includes/sections/{name}/`
2. Add files: `index.njk`, `index.ts`, `schema.ts`
3. Add content: `content/pt-PT/sections/{name}.json`
4. Register in: `src/_includes/sections/manifest.ts`

### Build Configuration
- **Vite Config**: `vite.config.ts`
- **Eleventy Config**: `.eleventy.ts`
- **PostCSS Config**: `postcss.config.ts`
- **TypeScript Config**: `tsconfig.json`

### Environment Variables
- **Local Development**: `.env.local` (create if needed)
- **Netlify Environment**: Set in Netlify dashboard
- **Required Variables**: See `netlify/functions/types.ts` for list

## 🚀 Deployment & Testing

### Pre-deployment Checklist
1. Run: `npm run validate:content`
2. Run: `npm run type-check`
3. Run: `npm run lint`
4. Run: `npm run test:all`
5. Run: `npm run build`

### Performance Testing
- **Lighthouse**: `npm run lighthouse`
- **Mobile Performance**: `npm run lighthouse:mobile`
- **Desktop Performance**: `npm run lighthouse:desktop`

## 💡 Pro Tips

### Search & Replace
With the new path aliases, you can now grep for:
```bash
# Find all hero references
grep -r "@sections/hero" src/

# Find all content references
grep -r "@content" src/

# Find all design token usage
grep -r "@design" src/
```

### Content Validation
Before committing content changes:
```bash
npm run validate:content
```

### Quick Section Development
Use the development scripts:
```bash
npm run find:section hero
npm run dev:section hero
npm run new:section my-new-section
```

### Import Path Examples
```typescript
// Old way
import hero from '../../../content/pt-PT/sections/hero.json';

// New way with aliases
import hero from '@content/pt-PT/sections/hero.json';
import tokens from '@design/tokens.json';
import { validateHeroSection } from '@sections/hero/schema.ts';
```