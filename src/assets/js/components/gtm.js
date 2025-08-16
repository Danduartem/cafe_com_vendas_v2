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

    // Load on first user interaction
    const userEvents = ['click', 'scroll', 'keydown', 'touchstart'];
    const handleUserInteraction = () => {
      loadGTM();
      userEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction, { passive: true });
      });
    };

    userEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { passive: true });
    });

    // Load when page becomes idle using requestIdleCallback or fallback to 5 seconds
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        if (!this.loaded) loadGTM();
      }, { timeout: 5000 });
    } else {
      // Fallback: load after 5 seconds if no user interaction (increased from 3s)
      setTimeout(() => {
        if (!this.loaded) loadGTM();
      }, 5000);
    }
  }
};

