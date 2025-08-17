/**
 * Google Tag Manager Loader (no inline JS, CSP-friendly)
 */

import { ENV } from '../config/constants.js';

export const GTM = {
  loaded: false,
  init() {
    try {
      const containerId = ENV.gtm?.containerId || '';
      if (!containerId) return;

      // Initialize dataLayer immediately for early events
      window.dataLayer = window.dataLayer || [];

      // Delay GTM loading until user interaction or page idle (optimized for performance)
      this.setupLazyLoading(containerId);
    } catch (_err) {
      // no-op; analytics should not block UX
    }
  },

  setupLazyLoading(containerId) {
    const loadGTM = () => {
      if (this.loaded) return;

      // Push GTM start event
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

      // Inject GTM script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}&l=dataLayer`;
      document.head.appendChild(script);

      this.loaded = true;
    };

    // Immediate loading triggers for conversion-intent actions
    const setupConversionTriggers = () => {
      // CTA buttons and offer interactions
      const ctaSelectors = [
        '[data-analytics-event*="cta"]',
        '[data-analytics-event*="checkout"]', 
        '[data-analytics-event*="offer"]',
        'button[class*="checkout"]',
        'button[class*="stripe"]',
        'a[href*="#oferta"]'
      ];
      
      ctaSelectors.forEach(selector => {
        document.addEventListener('click', (e) => {
          if (e.target.closest(selector)) {
            loadGTM();
          }
        }, { passive: true });
      });
    };

    // Meaningful engagement triggers
    const setupEngagementTriggers = () => {
      let scrollTriggered = false;
      
      // Load when user scrolls past hero section (25% of page)
      const handleMeaningfulScroll = () => {
        if (scrollTriggered) return;
        
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent >= 25) {
          scrollTriggered = true;
          loadGTM();
          window.removeEventListener('scroll', handleMeaningfulScroll);
        }
      };
      
      window.addEventListener('scroll', handleMeaningfulScroll, { passive: true });
      
      // Load on FAQ interaction
      document.addEventListener('click', (e) => {
        if (e.target.closest('[data-faq-toggle]') || e.target.closest('.faq')) {
          loadGTM();
        }
      }, { passive: true });
    };

    // Basic user interaction (keep for immediate responsiveness)
    const userEvents = ['keydown', 'touchstart'];
    const handleUserInteraction = () => {
      loadGTM();
      userEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction, { passive: true });
      });
    };

    userEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { passive: true });
    });

    // Set up progressive loading triggers
    setupConversionTriggers();
    setupEngagementTriggers();

    // Progressive fallback: minimum 10s delay, then idle check, max 15s
    setTimeout(() => {
      if (this.loaded) return;
      
      // After 10 seconds, check if browser is idle for deferred loading
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          if (!this.loaded) loadGTM();
        }, { timeout: 5000 }); // Max 5s additional wait (total: 15s)
      } else {
        // Immediate load after 10s minimum wait
        loadGTM();
      }
    }, 10000); // Minimum 10-second delay before any automatic loading
  }
};

