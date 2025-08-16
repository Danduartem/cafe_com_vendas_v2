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

      // Delay GTM loading until user interaction or 3 seconds (whichever comes first)
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

    // Fallback: load after 3 seconds if no user interaction
    setTimeout(loadGTM, 3000);
  }
};


