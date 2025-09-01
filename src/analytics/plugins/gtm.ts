/**
 * Google Tag Manager Plugin
 * Replaces PlatformAnalytics basic functionality with modern plugin architecture
 * Handles all GTM dataLayer interactions and event normalization
 */

import { normalizeEventPayload } from '../../assets/js/utils/gtm-normalizer.js';
import type { PluginFactory, GTMEventPayload } from '../types/index.js';

interface GTMPluginConfig {
  containerId?: string;
  debug?: boolean;
}

/**
 * GTM Plugin - handles all dataLayer interactions
 */
export const gtmPlugin: PluginFactory<GTMPluginConfig> = (config = {}) => {
  return {
    name: 'gtm',
    
    initialize() {
      // Ensure dataLayer exists
      window.dataLayer = window.dataLayer || [];
      
      if (config.debug) {
        console.log('[GTM Plugin] Initialized with dataLayer');
      }
    },

    /**
     * Handle all track events
     */
    track({ payload }) {
      try {
        // Normalize and push to dataLayer
        const normalizedPayload = normalizeEventPayload(payload);
        window.dataLayer.push(normalizedPayload);
        
        if (config.debug) {
          console.log('[GTM Plugin] Event tracked:', payload.event, normalizedPayload);
        }
      } catch (error) {
        console.error('[GTM Plugin] Track failed:', error);
      }
    },

    /**
     * Handle page views
     */
    page({ payload }) {
      try {
        const pageData = normalizeEventPayload({
          event: 'page_view',
          ...payload
        });
        
        window.dataLayer.push(pageData);
        
        if (config.debug) {
          console.log('[GTM Plugin] Page view tracked:', pageData);
        }
      } catch (error) {
        console.error('[GTM Plugin] Page tracking failed:', error);
      }
    },

    /**
     * Handle user identification
     */
    identify({ payload }) {
      try {
        const identifyData = normalizeEventPayload({
          event: 'identify',
          ...payload
        });
        
        window.dataLayer.push(identifyData);
        
        if (config.debug) {
          console.log('[GTM Plugin] User identified:', identifyData);
        }
      } catch (error) {
        console.error('[GTM Plugin] Identify failed:', error);
      }
    },

    /**
     * Check if GTM is loaded
     */
    loaded() {
      return window.dataLayer !== undefined;
    },

    /**
     * Custom methods for backward compatibility
     */
    methods: {
      /**
       * Track CTA clicks with both production and test events
       */
      trackCTAClick(location: string, data?: Record<string, unknown>) {
        // Fire GTM production event
        window.dataLayer.push(normalizeEventPayload({
          event: 'checkout_opened',
          source_section: location,
          timestamp: new Date().toISOString(),
          ...data
        }));
        
        // Fire test alias
        window.dataLayer.push(normalizeEventPayload({
          event: 'cta_click',
          location,
          timestamp: new Date().toISOString(),
          ...data
        }));

        if (config.debug) {
          console.log('[GTM Plugin] CTA click tracked:', { location, data });
        }
      },

      /**
       * Track conversion events
       */
      trackConversion(event: string, data: Record<string, unknown>) {
        window.dataLayer.push(normalizeEventPayload({
          event,
          timestamp: new Date().toISOString(),
          ...data
        }));

        if (config.debug) {
          console.log('[GTM Plugin] Conversion tracked:', { event, data });
        }
      },

      /**
       * Track FAQ interactions
       */
      trackFAQ(itemNumber: string, isOpen: boolean, question: string) {
        window.dataLayer.push(normalizeEventPayload({
          event: 'faq_toggle',
          action: isOpen ? 'open' : 'close',
          question,
          item: itemNumber
        }));

        if (config.debug) {
          console.log('[GTM Plugin] FAQ tracked:', { itemNumber, isOpen, question });
        }
      },

      /**
       * Raw dataLayer push (for advanced usage)
       */
      pushToDataLayer(data: GTMEventPayload) {
        window.dataLayer.push(normalizeEventPayload(data));
        
        if (config.debug) {
          console.log('[GTM Plugin] Raw dataLayer push:', data);
        }
      }
    },

    config
  };
};