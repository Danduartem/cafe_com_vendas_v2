/**
 * Components barrel export
 * Centralized export for all page components
 * Mixes TypeScript and JavaScript components during migration
 */

import type { Component } from '@/types/component.js';

// Converted TypeScript components
export { Hero } from './hero.js';
export { FAQ } from './faq.js';
export { Banner } from './banner.js';
export { GTM } from './gtm.js';

// Components still in JavaScript - import with any type to avoid strict typing errors
// These should be converted to TypeScript incrementally

// @ts-ignore - JavaScript components without type declarations
export { YouTube } from './youtube.js';
// @ts-ignore - JavaScript components without type declarations
export { FinalCTA } from './final-cta.js';
// @ts-ignore - JavaScript components without type declarations
export { Footer } from './footer.js';
// @ts-ignore - JavaScript components without type declarations
export { Testimonials } from './testimonials.js';
// @ts-ignore - JavaScript components without type declarations
export { ThankYou } from './thank-you.js';
// @ts-ignore - JavaScript components without type declarations
export { Checkout } from './checkout.js';
// @ts-ignore - JavaScript components without type declarations
export { CloudinaryComponent } from './cloudinary.js';
// @ts-ignore - JavaScript components without type declarations
export { About } from './about.js';
// @ts-ignore - JavaScript components without type declarations
export { Offer } from './offer.js';

// Note: As components are converted to TypeScript, move them from the
// type assertion section to the direct TypeScript import section above