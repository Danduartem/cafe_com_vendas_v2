/**
 * Google Tag Manager Helper
 * Provides helper functions for dataLayer events with automatic normalization
 */

import { normalizeEventPayload } from '@/utils/gtm-normalizer.js';
import type { Component } from '@/types/component.js';

interface GTMComponent extends Component {
  pushEvent(eventName: string, parameters?: Record<string, unknown>): void;
  pushEcommerceEvent(eventName: string, ecommerceData: Record<string, unknown>): void;
  trackConversion(eventName: string, eventData?: Record<string, unknown>): void;
  trackEngagement(eventName: string, eventData?: Record<string, unknown>): void;
}

export const GTM: GTMComponent = {
  init(): void {
    // Just ensure dataLayer exists (GTM is loaded via HTML)
    window.dataLayer = window.dataLayer || [];
  },

  /**
   * Helper function for consistent dataLayer event structure with normalization
   */
  pushEvent(eventName: string, parameters: Record<string, unknown> = {}): void {
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
  pushEcommerceEvent(eventName: string, ecommerceData: Record<string, unknown>): void {
    this.pushEvent(eventName, {
      ecommerce: ecommerceData
    });
  },

  /**
   * Track conversion events
   */
  trackConversion(eventName: string, eventData: Record<string, unknown> = {}): void {
    this.pushEvent(eventName, {
      event_category: 'Conversion',
      ...eventData
    });
  },

  /**
   * Track engagement events
   */
  trackEngagement(eventName: string, eventData: Record<string, unknown> = {}): void {
    this.pushEvent(eventName, {
      event_category: 'Engagement',
      ...eventData
    });
  }
};