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
            HERO_LCP: 'hero_lcp_timing',
            SCROLL_DEPTH: 'scroll_depth',
            FAQ_TOGGLE: 'faq_toggle',
            TESTIMONIAL_VIEW: 'view_testimonial_slide',
            WHATSAPP_CLICK: 'whatsapp_click',
            SCROLL_INDICATOR: 'scroll_indicator_click',
            FORM_SUBMIT: 'form_submit',
            FORM_START: 'form_start',
            FORM_ABANDON: 'form_abandon'
        }
    }
};

// Export environment configuration for easy access
export { ENV };