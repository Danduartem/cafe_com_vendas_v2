/**
 * Google Tag Manager Helper
 * Provides helper functions for dataLayer events with automatic normalization
 */

import { normalizeEventPayload } from '../utils/gtm-normalizer.js';

export const GTM = {
  init() {
    // Just ensure dataLayer exists (GTM is loaded via HTML)
    window.dataLayer = window.dataLayer || [];
  },

  /**
   * Helper function for consistent dataLayer event structure with normalization
   */
  pushEvent(eventName, parameters = {}) {
    // Ensure dataLayer exists
    window.dataLayer = window.dataLayer || [];

    // Normalize all parameters to prevent cardinality issues
    const normalizedParams = normalizeEventPayload({
      event: eventName,
      ...parameters
    });

    window.dataLayer.push(normalizedParams);
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
