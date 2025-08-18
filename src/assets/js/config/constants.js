/**
 * Configuration constants for Café com Vendas
 * Centralized configuration for animations, breakpoints, and analytics
 */

import ENV from './environment.js';

export const CONFIG = {
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 700,
      verySlow: 1000
    },
    easing: 'ease-out',
    stagger: 150
  },
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    xl: 1280
  },
  scroll: {
    throttle: 16, // ~60fps
    thresholds: [25, 50, 75]
  },
  analytics: {
    events: {
      // Performance events (aligned with reference)
      PERFORMANCE_LCP: 'performance_lcp',
      PERFORMANCE_CLS: 'performance_cls',
      PERFORMANCE_FID: 'performance_fid',
      PAGE_LOAD_PERFORMANCE: 'page_load_performance',
      
      // Engagement events
      SCROLL_DEPTH: 'scroll_depth',
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
      
      // Page events (aligned with reference)
      PAGE_VIEW_ENHANCED: 'page_view_enhanced',
      
      // Conversion events (aligned with reference)
      LEAD_CAPTURE_STARTED: 'lead_capture_started',
      LEAD_FORM_SUBMITTED: 'lead_form_submitted',
      CHECKOUT_OPENED: 'checkout_opened',
      CHECKOUT_CLOSED: 'checkout_closed',
      CHECKOUT_INITIATED: 'checkout_initiated',
      PURCHASE_COMPLETED: 'purchase_completed',
      
      // Error events
      PAYMENT_FAILED: 'payment_failed',
      JAVASCRIPT_ERROR: 'javascript_error'
    }
  }
};

// Export environment configuration for easy access
export { ENV };