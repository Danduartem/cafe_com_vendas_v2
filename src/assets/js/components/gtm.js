/**
 * Google Tag Manager Loader (no inline JS, CSP-friendly)
 */

import { ENV } from '../config/constants.js';

export const GTM = {
  loaded: false,
  init() {
    try {
      const containerId = ENV.gtm?.containerId || '';
      if (!containerId || this.loaded) return;

      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

      // Inject GTM script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}${'&l=dataLayer'}`;
      document.head.appendChild(script);

      this.loaded = true;
    } catch (_err) {
      // no-op; analytics should not block UX
    }
  }
};


