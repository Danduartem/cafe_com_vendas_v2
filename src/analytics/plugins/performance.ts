/**
 * Performance Monitoring Plugin
 * Preserves Core Web Vitals tracking from the original Analytics system
 * Tracks LCP, CLS, FID, and page load performance
 */

import { pluginDebugLog } from '../utils/debug.js';
import type { PluginFactory, PerformanceTrackingPayload, AnalyticsInstance } from '../types/index.js';

interface PerformancePluginConfig extends Record<string, unknown> {
  trackCoreWebVitals?: boolean;
  trackPageLoad?: boolean;
  clsThreshold?: number; // Only report CLS above this threshold
  debug?: boolean;
}

/**
 * Performance entry interfaces (from original Analytics)
 */
interface CLSPerformanceEntry extends PerformanceEntry {
  hadRecentInput?: boolean;
  value?: number;
}

interface FIDPerformanceEntry extends PerformanceEntry {
  processingStart?: number;
}

interface NavigationTiming extends PerformanceNavigationTiming {
  domContentLoadedEventEnd: number;
  loadEventEnd: number;
  responseStart: number;
}

/**
 * Performance Plugin - handles Core Web Vitals and page performance
 */
export const performancePlugin: PluginFactory<PerformancePluginConfig> = (config = {}) => {
  const {
    trackCoreWebVitals = true,
    trackPageLoad = true,
    clsThreshold = 0.1,
    debug = false
  } = config;

  // Setup Core Web Vitals tracking
  const setupCoreWebVitals = (instance: AnalyticsInstance) => {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const performanceEvent: PerformanceTrackingPayload = {
          metric_name: 'largest_contentful_paint',
          metric_value: Math.round(entry.startTime),
          metric_unit: 'ms'
        };
        
        instance.track('performance_metric', {
          event_category: 'Core Web Vitals',
          event_label: 'LCP',
          ...performanceEvent
        });
      }
    });
    lcpObserver.observe({entryTypes: ['largest-contentful-paint']});

    // Cumulative Layout Shift (CLS) with smart batching
    let clsAccumulator = 0;
    let clsTimeoutId: number | null = null;
    
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        if (!(entry as CLSPerformanceEntry).hadRecentInput) {
          clsValue += (entry as CLSPerformanceEntry).value ?? 0;
        }
      }
      
      // Accumulate CLS values
      clsAccumulator += clsValue;
      
      // Clear existing timeout
      if (clsTimeoutId) {
        clearTimeout(clsTimeoutId);
      }
      
      // Debounce and only report significant shifts
      clsTimeoutId = window.setTimeout(() => {
        // Only report if CLS is significant (> threshold)
        if (clsAccumulator > clsThreshold) {
          const performanceEvent: PerformanceTrackingPayload = {
            metric_name: 'cumulative_layout_shift',
            metric_value: Math.round(clsAccumulator * 1000),
            metric_unit: 'count'
          };
          
          instance.track('performance_metric', {
            event_category: 'Core Web Vitals',
            event_label: 'CLS',
            ...performanceEvent
          });
        }
        // Reset accumulator
        clsAccumulator = 0;
        clsTimeoutId = null;
      }, 500); // Batch events over 500ms
    });
    clsObserver.observe({entryTypes: ['layout-shift']});

    // First Input Delay (FID) / Interaction to Next Paint (INP)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const performanceEvent: PerformanceTrackingPayload = {
          metric_name: 'first_input_delay',
          metric_value: Math.round(((entry as FIDPerformanceEntry).processingStart ?? 0) - entry.startTime),
          metric_unit: 'ms'
        };
        
        instance.track('performance_metric', {
          event_category: 'Core Web Vitals',
          event_label: 'FID',
          ...performanceEvent
        });
      }
    });
    fidObserver.observe({entryTypes: ['first-input']});

    pluginDebugLog(debug, '[Performance Plugin] Core Web Vitals observers initialized');
  };

  // Setup page load performance tracking
  const setupPageLoadTracking = (instance: AnalyticsInstance) => {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as NavigationTiming;
        if (navigation) {
          instance.track('page_load_performance', {
            event_category: 'Performance',
            dom_content_loaded: Math.round(navigation.domContentLoadedEventEnd),
            load_complete: Math.round(navigation.loadEventEnd),
            ttfb: Math.round(navigation.responseStart)
          });

          pluginDebugLog(debug, '[Performance Plugin] Page load performance tracked');
        }
      }, 1000);
    });
  };

  return {
    name: 'performance',

    initialize({ instance }) {
      if (!trackCoreWebVitals && !trackPageLoad) return;

      try {
        if (trackCoreWebVitals && 'PerformanceObserver' in window) {
          setupCoreWebVitals(instance);
        }

        if (trackPageLoad) {
          setupPageLoadTracking(instance);
        }

        pluginDebugLog(debug, '[Performance Plugin] Performance tracking initialized');
      } catch (error) {
        console.error('[Performance Plugin] Initialization failed:', error);
      }
    },

    methods: {
      /**
       * Mark performance events for debugging
       */
      markEvent(eventName: string) {
        if ('performance' in window && 'mark' in window.performance) {
          performance.mark(`analytics-${eventName}`);
        }
      }
    },

    config
  };
};