/**
 * Configuration constants for Café com Vendas
 * Centralized configuration for animations, breakpoints, and analytics
 */

import ENV from './environment.js';
import type { Constants as ConstantsType } from '../../../types/components/config.js';

/**
 * Main application configuration with strict typing
 */
export const CONFIG: ConstantsType = {
  isDevelopment: ENV.isDevelopment,

  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 700
    },
    delay: {
      short: 100,
      normal: 300,
      long: 500
    }
  },

  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    xl: 1280
  },

  scrollTracking: {
    thresholds: [25, 50, 75, 90, 100],
    throttleMs: 16 // ~60fps
  },

  analytics: {
    enabled: true,
    debug: ENV.isDevelopment
  },

  performance: {
    observerRootMargin: '0px 0px -10% 0px',
    observerThreshold: 0.1,
    throttleMs: 16
  }
};

// Freeze configuration to prevent accidental modification
Object.freeze(CONFIG);

// Export environment configuration for easy access
export { ENV };
