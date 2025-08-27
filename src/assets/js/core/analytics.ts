/**
 * Analytics Module for Café com Vendas
 * Centralized tracking through Google Tag Manager dataLayer
 */

import { ENV } from '@/config/constants';
import { StateManager } from './state';
import { logger } from '../../../utils/logger.js';
import type {
  AnalyticsEvent,
  ErrorEvent,
  PerformanceEvent
} from '../../../types/components/analytics.js';

/**
 * Performance navigation timing interface
 */
interface NavigationTiming extends PerformanceNavigationTiming {
  domContentLoadedEventEnd: number;
  loadEventEnd: number;
  responseStart: number;
}

/**
 * Extended Error interface with optional browser properties
 */
interface ExtendedError extends Error {
  filename?: string;
  lineno?: number;
  colno?: number;
}

/**
 * Performance entry with CLS-specific properties
 */
interface CLSPerformanceEntry extends PerformanceEntry {
  hadRecentInput?: boolean;
  value?: number;
}

/**
 * Performance entry with FID-specific properties
 */
interface FIDPerformanceEntry extends PerformanceEntry {
  processingStart?: number;
}

/**
 * Analytics interface
 */
interface AnalyticsInterface {
  errors: Set<string>;
  track<T extends AnalyticsEvent>(eventName: T['event'], parameters?: Omit<T, 'event'>): void;
  trackError(errorType: string, error: Error, context?: Record<string, unknown>): void;
  initPerformanceTracking(): void;
  trackFAQEngagement(faqId: string, isOpening: boolean): void;
}

export const Analytics: AnalyticsInterface = {
  // Error tracking for improved reliability
  errors: new Set<string>(),

  /**
   * Track event via GTM dataLayer with optional aliases for test compatibility
   * All events flow through GTM for centralized tag management
   */
  track<T extends AnalyticsEvent>(eventName: T['event'], parameters: Omit<T, 'event'> = {} as Omit<T, 'event'>): void {
    try {
      // Always ensure dataLayer exists before pushing
      window.dataLayer = window.dataLayer || [];

      // Standardized event structure for GTM
      const eventData: AnalyticsEvent = {
        event: eventName,
        timestamp: new Date().toISOString(),
        ...parameters
      };

      // Push primary event to dataLayer
      window.dataLayer.push(eventData);

      // Debug logging in development
      if (ENV.isDevelopment) {
        logger.debug(`[GTM Event] ${eventName}:`, parameters);
      }

      // Track to performance timeline for debugging
      if ('performance' in window && 'mark' in window.performance) {
        performance.mark(`analytics-${eventName}`);
      }
    } catch (error) {
      // Prevent infinite loop by not tracking analytics errors
      console.error('Analytics tracking failed:', error);
    }
  },


  /**
   * Track JavaScript errors for improved debugging
   */
  trackError(errorType: string, error: Error, context: Record<string, unknown> = {}): void {
    const errorKey = `${errorType}-${error.message}`;
    if (this.errors.has(errorKey)) return; // Prevent duplicate error reports

    this.errors.add(errorKey);
    console.error(`Error [${errorType}]:`, error, context);

    const errorEvent: ErrorEvent = {
      event: 'error',
      event_category: 'Error',
      event_label: errorType,
      error_message: error.message,
      error_stack: error.stack?.substring(0, 500),
      error_filename: (error as ExtendedError).filename,
      error_lineno: (error as ExtendedError).lineno,
      error_colno: (error as ExtendedError).colno,
      ...context
    };

    this.track('error', errorEvent);
  },

  /**
   * Initialize comprehensive performance tracking with modern Web APIs
   */
  initPerformanceTracking(): void {
    try {
      // Core Web Vitals tracking
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const performanceEvent: PerformanceEvent = {
              event: 'performance_metric',
              event_category: 'Core Web Vitals',
              event_label: 'LCP',
              metric_name: 'largest_contentful_paint',
              metric_value: Math.round(entry.startTime),
              metric_unit: 'ms'
            };
            this.track('performance_metric', performanceEvent);
          }
        });
        lcpObserver.observe({entryTypes: ['largest-contentful-paint']});

        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as CLSPerformanceEntry).hadRecentInput) {
              clsValue += (entry as CLSPerformanceEntry).value ?? 0;
            }
          }
          if (clsValue > 0) {
            const performanceEvent: PerformanceEvent = {
              event: 'performance_metric',
              event_category: 'Core Web Vitals',
              event_label: 'CLS',
              metric_name: 'cumulative_layout_shift',
              metric_value: Math.round(clsValue * 1000),
              metric_unit: 'count'
            };
            this.track('performance_metric', performanceEvent);
          }
        });
        clsObserver.observe({entryTypes: ['layout-shift']});

        // First Input Delay (FID) / Interaction to Next Paint (INP)
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const performanceEvent: PerformanceEvent = {
              event: 'performance_metric',
              event_category: 'Core Web Vitals',
              event_label: 'FID',
              metric_name: 'first_input_delay',
              metric_value: Math.round(((entry as FIDPerformanceEntry).processingStart ?? 0) - entry.startTime),
              metric_unit: 'ms'
            };
            this.track('performance_metric', performanceEvent);
          }
        });
        fidObserver.observe({entryTypes: ['first-input']});
      }

      // Page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as NavigationTiming;
          if (navigation) {
            this.track('page_load_performance', {
              event_category: 'Performance',
              dom_content_loaded: Math.round(navigation.domContentLoadedEventEnd),
              load_complete: Math.round(navigation.loadEventEnd),
              ttfb: Math.round(navigation.responseStart)
            });
          }
        }, 1000);
      });

    } catch (error) {
      this.trackError('performance_tracking_init_failed', error as Error);
    }
  },

  /**
   * Track FAQ engagement time
   */
  trackFAQEngagement(faqId: string, isOpening: boolean): void {
    if (isOpening) {
      StateManager.markFAQOpened(faqId);
    } else {
      const engagementTime = StateManager.getFAQEngagementTime(faqId);

      if (engagementTime > 3) {
        this.track('faq_meaningful_engagement', {
          event_category: 'FAQ',
          event_label: faqId,
          value: engagementTime
        });
      }
    }
  }
};

// Global types are now centralized in types/global.ts