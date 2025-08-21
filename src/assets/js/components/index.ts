/**
 * Components barrel export
 * Centralized export for all page components
 * Mixes TypeScript and JavaScript components during migration
 */


// Converted TypeScript components  
export { FAQ } from './faq.js';
export { Banner } from './banner.js';
export { GTM } from './gtm.js';

// Co-located section components (these override the old component versions)
export { Hero } from '../../../_includes/sections/hero/index.js';
export { Offer } from '../../../_includes/sections/offer/index.js';

// All components are now TypeScript
export { YouTube } from './youtube.js';
export { FinalCTA } from './final-cta.js';
export { Footer } from './footer.js';
export { Testimonials } from './testimonials.js';
export { ThankYou } from './thank-you.js';
export { Checkout } from './checkout.js';
export { CloudinaryComponent } from './cloudinary.js';
export { About } from './about.js';

// Note: As components are converted to TypeScript, move them from the
// type assertion section to the direct TypeScript import section above