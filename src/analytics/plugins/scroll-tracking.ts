/**
 * Scroll Tracking Plugin
 * Preserves scroll depth tracking functionality from ScrollTracker utility
 * Tracks scroll depth at 10%, 25%, 50%, 75%, and 90% thresholds
 */

import { throttle } from '../../assets/js/utils/throttle.js';
import type { PluginFactory, AnalyticsInstance } from '../types/index.js';

interface ScrollTrackingPluginConfig extends Record<string, unknown> {
  thresholds?: number[];
  throttleDelay?: number;
  debug?: boolean;
}

/**
 * Scroll Tracking Plugin - handles scroll depth events
 */
export const scrollTrackingPlugin: PluginFactory<ScrollTrackingPluginConfig> = (config = {}) => {
  const {
    thresholds = [10, 25, 50, 75, 90],
    throttleDelay = 500,
    debug = false
  } = config;

  // Track which thresholds have already fired
  const firedThresholds = new Map<number, boolean>();
  thresholds.forEach(threshold => firedThresholds.set(threshold, false));

  let scrollHandler: (() => void) | null = null;
  let resizeHandler: (() => void) | null = null;

  // Initialize scroll depth tracking
  const init = (analyticsInstance: AnalyticsInstance) => {
    // Create throttled scroll handler
    scrollHandler = throttle(() => {
      checkScrollDepth(analyticsInstance);
    }, throttleDelay);

    resizeHandler = throttle(() => {
      checkScrollDepth(analyticsInstance);
    }, 1000);

    // Listen for scroll events
    window.addEventListener('scroll', scrollHandler, { passive: true });

    // Also check on resize as viewport changes affect scroll percentages
    window.addEventListener('resize', resizeHandler, { passive: true });

    // Check initial scroll position (in case user lands mid-page)
    setTimeout(() => {
      checkScrollDepth(analyticsInstance);
    }, 1000);
  };

  // Calculate current scroll percentage and fire events at thresholds
  const checkScrollDepth = (analyticsInstance: AnalyticsInstance) => {
    try {
      // Calculate current scroll percentage
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

      // Prevent division by zero
      if (documentHeight <= windowHeight) {
        return; // Page is too short to scroll
      }

      // Calculate percentage (0-100)
      const scrollPercent = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );

      // Check each threshold
      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !firedThresholds.get(threshold)) {
          fireScrollEvent(threshold, analyticsInstance);
          firedThresholds.set(threshold, true);
        }
      });
    } catch (error) {
      console.error('[Scroll Tracking Plugin] Error in scroll depth tracking:', error);
    }
  };

  // Fire scroll depth event
  const fireScrollEvent = (threshold: number, analyticsInstance: AnalyticsInstance) => {
    const eventData = {
      depth_percentage: threshold,
      depth_pixels: window.scrollY || window.pageYOffset,
      timestamp: new Date().toISOString()
    };

    analyticsInstance.track('scroll_depth', eventData);

    if (debug) {
      console.warn(`[Scroll Tracking Plugin] Scroll depth reached: ${threshold}%`);
    }
  };

  return {
    name: 'scroll-tracking',

    initialize({ instance }) {
      try {
        init(instance);
        
        if (debug) {
          console.warn('[Scroll Tracking Plugin] Initialized with thresholds:', thresholds);
        }
      } catch (error) {
        console.error('[Scroll Tracking Plugin] Initialization failed:', error);
      }
    },

    methods: {
      /**
       * Reset tracking (useful for SPAs or dynamic content)
       */
      resetScrollTracking() {
        thresholds.forEach(threshold => firedThresholds.set(threshold, false));
        
        if (debug) {
          console.warn('[Scroll Tracking Plugin] Scroll tracking reset');
        }
      },

      /**
       * Get scroll progress
       */
      getScrollProgress() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY || window.pageYOffset;

        if (documentHeight <= windowHeight) {
          return 100; // Page is fully visible
        }

        return Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
      },

      /**
       * Get fired thresholds
       */
      getFiredThresholds() {
        return Array.from(firedThresholds.entries())
          .filter(([_, fired]) => fired)
          .map(([threshold]) => threshold);
      },

      /**
       * Cleanup event listeners
       */
      destroy() {
        if (scrollHandler) {
          window.removeEventListener('scroll', scrollHandler);
        }
        if (resizeHandler) {
          window.removeEventListener('resize', resizeHandler);
        }
        
        if (debug) {
          console.warn('[Scroll Tracking Plugin] Event listeners cleaned up');
        }
      }
    },

    config
  };
};