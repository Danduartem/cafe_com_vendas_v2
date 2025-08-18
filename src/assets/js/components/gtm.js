/**
 * Google Tag Manager Loader
 * Single source of truth for all analytics and tracking
 */

import { ENV } from '../config/constants.js';

export const GTM = {
  loaded: false,

  init() {
    try {
      const containerId = ENV.gtm?.containerId || '';
      if (!containerId) return;

      // Initialize dataLayer immediately
      this.initializeDataLayer();

      // Load GTM immediately for better conversion tracking
      this.loadGTM(containerId);
    } catch {
      // no-op; analytics should not block UX
    }
  },

  /**
   * Initialize dataLayer with proper structure for GTM
   */
  initializeDataLayer() {
    window.dataLayer = window.dataLayer || [];

    // Push initial page data for enhanced tracking
    window.dataLayer.push({
      event: 'page_view_enhanced',
      page_data: {
        title: document.title,
        url: window.location.href,
        path: window.location.pathname,
        referrer: document.referrer || '(direct)'
      }
    });
  },

  /**
   * Helper function for consistent dataLayer event structure
   */
  pushEvent(eventName, parameters = {}) {
    if (!window.dataLayer) {
      this.initializeDataLayer();
    }

    window.dataLayer.push({
      event: eventName,
      ...parameters
    });
  },

  /**
   * Helper for enhanced ecommerce events
   */
  pushEcommerceEvent(eventName, ecommerceData) {
    this.pushEvent(eventName, {
      ecommerce: ecommerceData
    });
  },

  /**
   * Load GTM immediately for conversion tracking
   */
  loadGTM(containerId) {
    if (this.loaded) return;

    // Push GTM start event
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

    // Inject GTM script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}&l=dataLayer`;

    // Fire gtm_init event after script loads
    script.onload = () => {
      this.pushEvent('gtm_init', {
        event_category: 'Application',
        gtm_container_id: containerId
      });
    };

    document.head.appendChild(script);

    this.loaded = true;
  },

  /**
   * Track conversion events
   */
  trackConversion(eventName, eventData = {}) {
    this.pushEvent(eventName, {
      event_category: 'Conversion',
      ...eventData
    });
  },

  /**
   * Track engagement events
   */
  trackEngagement(eventName, eventData = {}) {
    this.pushEvent(eventName, {
      event_category: 'Engagement',
      ...eventData
    });
  }
};
