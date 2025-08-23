/**
 * Platform GTM (Google Tag Manager) Component
 * Centralized dataLayer management with automatic normalization
 */

import { normalizeEventPayload } from '@/utils/gtm-normalizer';
import { ENV } from '@/config/constants';

interface GTMEventOptions {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: unknown;
}

interface EcommerceData {
  items?: Array<Record<string, unknown>>;
  value?: number;
  currency?: string;
  [key: string]: unknown;
}

export const PlatformGTM = {
  /**
   * Initialize GTM dataLayer
   */
  init(): void {
    window.dataLayer = window.dataLayer || [];

    // Push initial page data if needed
    this.pushPageData();
  },

  /**
   * Push initial page data to dataLayer
   */
  pushPageData(): void {
    const pageData = {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname
    };

    this.pushEvent('page_data', pageData);
  },

  /**
   * Push event to dataLayer with automatic normalization
   */
  pushEvent(eventName: string, parameters: GTMEventOptions = {}): void {
    window.dataLayer = window.dataLayer || [];

    const normalizedParams = normalizeEventPayload({
      event: eventName,
      ...parameters
    });

    window.dataLayer.push(normalizedParams);

    // Debug logging in development
    if (ENV.isDevelopment) {
      console.log('[GTM Event]', eventName, normalizedParams);
    }
  },

  /**
   * Push enhanced ecommerce event
   */
  pushEcommerceEvent(eventName: string, ecommerceData: EcommerceData): void {
    this.pushEvent(eventName, {
      ecommerce: ecommerceData
    });
  },

  /**
   * Track conversion event
   */
  trackConversion(eventName: string, eventData: GTMEventOptions = {}): void {
    this.pushEvent(eventName, {
      event_category: 'Conversion',
      ...eventData
    });
  },

  /**
   * Track engagement event
   */
  trackEngagement(eventName: string, eventData: GTMEventOptions = {}): void {
    this.pushEvent(eventName, {
      event_category: 'Engagement',
      ...eventData
    });
  },

  /**
   * Track error event
   */
  trackError(errorMessage: string, errorData: GTMEventOptions = {}): void {
    this.pushEvent('error', {
      event_category: 'Error',
      error_message: errorMessage,
      ...errorData
    });
  },

  /**
   * Track timing event
   */
  trackTiming(
    timingCategory: string,
    timingVar: string,
    timingValue: number,
    timingLabel?: string
  ): void {
    this.pushEvent('timing_complete', {
      event_category: 'Timing',
      timing_category: timingCategory,
      timing_var: timingVar,
      timing_value: timingValue,
      timing_label: timingLabel
    });
  },

  /**
   * Clear ecommerce data (useful between transactions)
   */
  clearEcommerce(): void {
    this.pushEvent('clear_ecommerce', {
      ecommerce: null
    });
  },

  /**
   * Get current dataLayer (for debugging)
   */
  getDataLayer(): unknown[] {
    return window.dataLayer || [];
  }
};