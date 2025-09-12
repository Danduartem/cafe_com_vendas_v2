/**
 * Google Tag Manager Plugin
 * Modern plugin architecture for GTM dataLayer interactions
 */

import { normalizeEventPayload } from '../../assets/js/utils/gtm-normalizer.js';
import { pluginDebugLog } from '../utils/debug.js';
import type { PluginFactory, GTMEventPayload } from '../types/index.js';

interface GTMPluginConfig extends Record<string, unknown> {
  containerId?: string;
  debug?: boolean;
  duplicatePreventionTTL?: number; // Time to keep transaction IDs cached (ms)
  maxTransactionCache?: number; // Maximum transactions to cache
}

// Plugin state management
interface TransactionRecord {
  id: string;
  timestamp: number;
}

interface GTMPluginState {
  trackedTransactions: Map<string, TransactionRecord>;
  initialized: boolean;
  eventCount: number;
  isPreviewMode: boolean;
}

/**
 * Generate structured event ID
 */
function generateEventId(eventName: string): string {
  const timestamp = Date.now();
  const uniqueId = Math.random().toString(36).substr(2, 9);
  return `${eventName}_${timestamp}_${uniqueId}`;
}

/**
 * Detect if GTM is in preview mode
 */
function detectGTMPreviewMode(): boolean {
  return !!((window as unknown as { google_tag_manager?: unknown }).google_tag_manager || 
           document.cookie.includes('gtm_auth') ||
           window.location.search.includes('gtm_preview') ||
           window.location.search.includes('gtm_debug'));
}

/**
 * GTM Plugin - handles all dataLayer interactions with enterprise features
 */
export const gtmPlugin: PluginFactory<GTMPluginConfig> = (config = {}) => {
  const {
    duplicatePreventionTTL = 3600000, // 1 hour default
    maxTransactionCache = 1000,
    debug = false
  } = config;

  // Plugin state
  const state: GTMPluginState = {
    trackedTransactions: new Map(),
    initialized: false,
    eventCount: 0,
    isPreviewMode: detectGTMPreviewMode()
  };

  // Define the plugin object to enable proper method binding
  const plugin = {
    name: 'gtm',
    
    initialize() {
      // Ensure dataLayer exists
      (window as unknown as { dataLayer: unknown[] }).dataLayer = 
        (window as unknown as { dataLayer?: unknown[] }).dataLayer || [];
      
      state.initialized = true;
      state.isPreviewMode = detectGTMPreviewMode();
      
      pluginDebugLog(debug, '[GTM Plugin] Initialized with dataLayer', {
        previewMode: state.isPreviewMode,
        duplicatePreventionTTL: duplicatePreventionTTL,
        maxTransactionCache: maxTransactionCache
      });

      // Setup periodic cleanup of old transactions
      const cleanupOldTransactions = () => {
        const now = Date.now();
        const idsToRemove: string[] = [];

        for (const [id, record] of state.trackedTransactions) {
          if (now - record.timestamp > duplicatePreventionTTL) {
            idsToRemove.push(id);
          }
        }

        idsToRemove.forEach(id => state.trackedTransactions.delete(id));
        
        // Also enforce max cache size
        if (state.trackedTransactions.size > maxTransactionCache) {
          const entries = Array.from(state.trackedTransactions.entries());
          entries.sort(([,a], [,b]) => a.timestamp - b.timestamp);
          const toRemove = entries.slice(0, state.trackedTransactions.size - maxTransactionCache);
          toRemove.forEach(([id]) => state.trackedTransactions.delete(id));
        }

        pluginDebugLog(debug, '[GTM Plugin] Transaction cleanup completed', {
          removedCount: idsToRemove.length,
          currentCacheSize: state.trackedTransactions.size
        });
      };

      setInterval(cleanupOldTransactions, duplicatePreventionTTL / 4);
    },

    /**
     * Cleanup old transactions from cache (exposed method)
     */
    cleanupOldTransactions() {
      const now = Date.now();
      const idsToRemove: string[] = [];

      for (const [id, record] of state.trackedTransactions) {
        if (now - record.timestamp > duplicatePreventionTTL) {
          idsToRemove.push(id);
        }
      }

      idsToRemove.forEach(id => state.trackedTransactions.delete(id));
      
      // Also enforce max cache size
      if (state.trackedTransactions.size > maxTransactionCache) {
        const entries = Array.from(state.trackedTransactions.entries());
        // Sort by timestamp and remove oldest entries
        entries.sort(([,a], [,b]) => a.timestamp - b.timestamp);
        const toRemove = entries.slice(0, state.trackedTransactions.size - maxTransactionCache);
        toRemove.forEach(([id]) => state.trackedTransactions.delete(id));
      }

      pluginDebugLog(debug, '[GTM Plugin] Transaction cleanup completed', {
        removedCount: idsToRemove.length,
        currentCacheSize: state.trackedTransactions.size
      });
    },

    /**
     * Enhanced push to dataLayer with event ID
     */
    pushToDataLayerWithEventId(payload: Record<string, unknown> & { event: string }) {
      state.eventCount++;
      
      const enhancedPayload = normalizeEventPayload({
        ...payload,
        event_id: generateEventId(payload.event),
        timestamp: new Date().toISOString(),
        debug_info: debug ? {
          event_count: state.eventCount,
          preview_mode: state.isPreviewMode,
          plugin_version: '2.0.0'
        } : undefined
      });

      (window as unknown as { dataLayer: unknown[] }).dataLayer.push(enhancedPayload);

      pluginDebugLog(debug, '[GTM Plugin] Enhanced event pushed:', enhancedPayload);
      return enhancedPayload.event_id;
    },

    /**
     * Handle all track events
     */
    track({ payload }: { payload?: Record<string, unknown> }) {
      try {
        if (!payload) {
          console.warn('[GTM Plugin] No payload provided for track event');
          return;
        }
        
        if (!payload.event || typeof payload.event !== 'string') {
          console.warn('[GTM Plugin] Payload missing required event property');
          return;
        }
        
        // Use enhanced push method
        plugin.pushToDataLayerWithEventId(payload as Record<string, unknown> & { event: string });
      } catch (error) {
        console.error('[GTM Plugin] Track failed:', error);
      }
    },

    /**
     * Handle page views
     */
    page({ payload }: { payload?: Record<string, unknown> }) {
      try {
        plugin.pushToDataLayerWithEventId({
          event: 'page_view',
          ...payload
        });
      } catch (error) {
        console.error('[GTM Plugin] Page tracking failed:', error);
      }
    },

    /**
     * Handle user identification
     */
    identify({ payload }: { payload?: Record<string, unknown> }) {
      try {
        plugin.pushToDataLayerWithEventId({
          event: 'identify',
          ...payload
        });
      } catch (error) {
        console.error('[GTM Plugin] Identify failed:', error);
      }
    },

    /**
     * Check if GTM is loaded
     */
    loaded() {
      return (window as unknown as { dataLayer?: unknown[] }).dataLayer !== undefined;
    },

    // Placeholder for methods - will be populated after object creation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    methods: {} as Record<string, (...args: any[]) => any>,  

    config
  };

  // Store enhanced push method for consistent access with proper binding
  const enhancedPush = plugin.pushToDataLayerWithEventId.bind(plugin);

  // Add methods after plugin object is defined with explicit method references
  plugin.methods = {
    /**
     * Track CTA clicks with both production and test events
     */
    trackCTAClick: (location: string, data?: Record<string, unknown>) => {
      // Fire GTM production event using enhanced push
      enhancedPush({
        event: 'checkout_opened',
        source_section: location,
        timestamp: new Date().toISOString(),
        ...data
      });
      
      // Fire test alias
      enhancedPush({
        event: 'cta_click',
        location,
        timestamp: new Date().toISOString(),
        ...data
      });

      pluginDebugLog(config.debug, '[GTM Plugin] CTA click tracked:', { location, data });
    },

    /**
     * Track conversion events with duplicate prevention
     */
    trackConversion: (event: string, data: Record<string, unknown>) => {
      // Special handling for purchase events
      if (event === 'purchase_completed' && data.transaction_id) {
        const transactionId = typeof data.transaction_id === 'object' && data.transaction_id !== null 
          ? JSON.stringify(data.transaction_id) 
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          : String(data.transaction_id);
        
        // Check for duplicate transaction
        if (state.trackedTransactions.has(transactionId)) {
          // Fire duplicate blocked event
          enhancedPush({
            event: 'purchase_blocked_duplicate',
            blocked_transaction_id: transactionId,
            blocked_at: new Date().toISOString(),
            original_timestamp: state.trackedTransactions.get(transactionId)?.timestamp
          });
          
          pluginDebugLog(debug, '[GTM Plugin] Duplicate purchase blocked:', { transactionId });
          return;
        }
        
        // Track this transaction
        state.trackedTransactions.set(transactionId, {
          id: transactionId,
          timestamp: Date.now()
        });
        
        pluginDebugLog(debug, '[GTM Plugin] Transaction registered:', { 
          transactionId, 
          cacheSize: state.trackedTransactions.size 
        });
      }

      // Track the conversion event with enhanced push
      enhancedPush({
        event,
        ...data
      });

      pluginDebugLog(debug, '[GTM Plugin] Conversion tracked:', { event, data });
    },

    /**
     * Track FAQ interactions
     */
    trackFAQ: (itemNumber: string, isOpen: boolean, question: string) => {
      enhancedPush({
        event: 'faq_toggle',
        action: isOpen ? 'open' : 'close',
        question,
        item: itemNumber
      });

      pluginDebugLog(debug, '[GTM Plugin] FAQ tracked:', { itemNumber, isOpen, question });
    },

    /**
     * Track FAQ meaningful engagement (threshold-based)
     */
    trackFAQMeaningfulEngagement: (toggleCount: number, data?: Record<string, unknown>) => {
      enhancedPush({
        event: 'faq_meaningful_engagement',
        toggle_count: toggleCount,
        ...data
      });

      pluginDebugLog(debug, '[GTM Plugin] FAQ meaningful engagement tracked:', { toggleCount, data });
    },

    /**
     * Track individual testimonial slide views
     */
    trackTestimonialSlide: (testimonialId: string, position: number, data?: Record<string, unknown>) => {
      enhancedPush({
        event: 'view_testimonial_slide',
        testimonial_id: testimonialId,
        testimonial_position: position,
        ...data
      });

      pluginDebugLog(debug, '[GTM Plugin] Testimonial slide tracked:', { testimonialId, position, data });
    },

    /**
     * Track WhatsApp clicks
     */
    trackWhatsAppClick: (linkUrl: string, linkText: string, location: string, data?: Record<string, unknown>) => {
      enhancedPush({
        event: 'whatsapp_click',
        link_url: linkUrl,
        link_text: linkText,
        location,
        ...data
      });

      pluginDebugLog(debug, '[GTM Plugin] WhatsApp click tracked:', { linkUrl, linkText, location, data });
    },

    /**
     * Track video play (start)
     */
    trackVideoPlay: (videoTitle: string, data?: Record<string, unknown>) => {
      enhancedPush({
        event: 'video_play',
        video_title: videoTitle,
        ...data
      });

      pluginDebugLog(debug, '[GTM Plugin] Video play tracked:', { videoTitle, data });
    },

    /**
     * Track video progress milestones
     */
    trackVideoProgress: (videoTitle: string, percentPlayed: number, data?: Record<string, unknown>) => {
      enhancedPush({
        event: 'video_progress',
        video_title: videoTitle,
        percent_played: percentPlayed,
        ...data
      });

      pluginDebugLog(debug, '[GTM Plugin] Video progress tracked:', { videoTitle, percentPlayed, data });
    },

    /**
     * Raw dataLayer push (for advanced usage)
     */
    pushToDataLayer: (data: GTMEventPayload) => {
      enhancedPush(data);
      
      pluginDebugLog(debug, '[GTM Plugin] Raw dataLayer push:', data);
    },

    /**
     * Get plugin state for debugging
     */
    getPluginState: () => {
      return {
        initialized: state.initialized,
        eventCount: state.eventCount,
        isPreviewMode: state.isPreviewMode,
        trackedTransactionsCount: state.trackedTransactions.size,
        config: {
          duplicatePreventionTTL,
          maxTransactionCache,
          debug
        }
      };
    },

    /**
     * Reset plugin state (useful for testing)
     */
    resetState: () => {
      state.trackedTransactions.clear();
      state.eventCount = 0;
      state.isPreviewMode = detectGTMPreviewMode();
      
      pluginDebugLog(debug, '[GTM Plugin] State reset completed');
    }
  };

  return plugin;
};
