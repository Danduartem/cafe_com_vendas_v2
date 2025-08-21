/**
 * Configuration constants for Café com Vendas
 * Centralized configuration for animations, breakpoints, and analytics
 */

import ENV from './environment.js';
import type { Constants as ConstantsType } from '@/types/config.js';

/**
 * Analytics event constants with type safety
 */
export const ANALYTICS_EVENTS = {
  // Performance events
  PERFORMANCE_LCP: 'performance_lcp',
  PERFORMANCE_CLS: 'performance_cls',
  PERFORMANCE_FID: 'performance_fid',
  PAGE_LOAD_PERFORMANCE: 'page_load_performance',

  // Engagement events
  FAQ_TOGGLE: 'faq_toggle',
  FAQ_MEANINGFUL_ENGAGEMENT: 'faq_meaningful_engagement',
  TESTIMONIAL_VIEW: 'view_testimonial_slide',
  VIDEO_PLAY: 'video_play',

  // Navigation events
  WHATSAPP_CLICK: 'whatsapp_click',
  SCROLL_INDICATOR: 'scroll_indicator_click',

  // Form events
  FORM_SUBMIT: 'form_submit',
  FORM_START: 'form_start',
  FORM_ABANDON: 'form_abandon',

  // Page events
  PAGE_VIEW_ENHANCED: 'page_view_enhanced',

  // Conversion events
  LEAD_CAPTURE_STARTED: 'lead_capture_started',
  LEAD_FORM_SUBMITTED: 'lead_form_submitted',
  CHECKOUT_OPENED: 'checkout_opened',
  CHECKOUT_CLOSED: 'checkout_closed',
  CHECKOUT_INITIATED: 'checkout_initiated',
  PURCHASE_COMPLETED: 'purchase_completed',

  // Error events
  PAYMENT_FAILED: 'payment_failed',
  JAVASCRIPT_ERROR: 'javascript_error'
} as const;

/**
 * Type for analytics event values
 */
export type AnalyticsEventType = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

/**
 * Main application configuration with strict typing
 */
export const CONFIG: ConstantsType = {
  version: '2.0.0',
  buildDate: new Date().toISOString(),

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
Object.freeze(ANALYTICS_EVENTS);

// Export environment configuration for easy access
export { ENV };

// Global types are now centralized in types/global.ts

// Make analytics events available globally for debugging (development only)
if (ENV.isDevelopment) {
  window.ANALYTICS_EVENTS = ANALYTICS_EVENTS;
}