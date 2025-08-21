/**
 * Utilities barrel export
 * Centralized export for all utility functions
 */

export {
  throttle,
  debounce,
  throttleWithCounter,
  cancellableThrottle
} from './throttle.js';

export {
  safeQuery,
  safeQueryAll,
  calculateSlidesPerView,
  calculateSlidesPerViewDetailed,
  generateId,
  isElementVisible,
  getElementOffset
} from './dom.js';

export { Animations } from './animations.js';
export { CSSLoader } from './css-loader.js';
export { ScrollTracker } from './scroll-tracker.js';
export {
  GTMNormalizer,
  normalizeEventPayload,
  normalizeString,
  normalizeId,
  normalizeSection,
  normalizeUrl,
  normalizeAction,
  normalizePricingTier,
  normalizeQuestion,
  normalizeFormLocation,
  normalizeParameter
} from './gtm-normalizer.js';