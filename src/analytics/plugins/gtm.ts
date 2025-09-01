/**
 * Google Tag Manager Plugin
 * Modern plugin architecture for GTM dataLayer interactions
 * Handles event normalization and GA4-compliant tracking
 */

import { normalizeEventPayload } from '../../assets/js/utils/gtm-normalizer.js';
import { pluginDebugLog } from '../utils/debug.js';
import type { PluginFactory, GTMEventPayload } from '../types/index.js';

interface GTMPluginConfig extends Record<string, unknown> {
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
      
      pluginDebugLog(config.debug, '[GTM Plugin] Initialized with dataLayer');
    },

    /**
     * Handle all track events
     */
    track({ payload }) {
      try {
        if (!payload) {
          console.warn('[GTM Plugin] No payload provided for track event');
          return;
        }
        
        if (!payload.event || typeof payload.event !== 'string') {
          console.warn('[GTM Plugin] Payload missing required event property');
          return;
        }
        
        // Normalize and push to dataLayer
        const normalizedPayload = normalizeEventPayload(payload as Record<string, unknown> & { event: string });
        window.dataLayer.push(normalizedPayload);
        
        pluginDebugLog(config.debug, '[GTM Plugin] Event tracked:', payload.event, normalizedPayload);
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
        
        pluginDebugLog(config.debug, '[GTM Plugin] Page view tracked:', pageData);
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
        
        pluginDebugLog(config.debug, '[GTM Plugin] User identified:', identifyData);
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

        pluginDebugLog(config.debug, '[GTM Plugin] CTA click tracked:', { location, data });
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

        pluginDebugLog(config.debug, '[GTM Plugin] Conversion tracked:', { event, data });
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

        pluginDebugLog(config.debug, '[GTM Plugin] FAQ tracked:', { itemNumber, isOpen, question });
      },

      /**
       * Raw dataLayer push (for advanced usage)
       */
      pushToDataLayer(data: GTMEventPayload) {
        window.dataLayer.push(normalizeEventPayload(data));
        
        pluginDebugLog(config.debug, '[GTM Plugin] Raw dataLayer push:', data);
      }
    },

    config
  };
};