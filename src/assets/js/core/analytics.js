/**
 * Analytics Module for Café com Vendas
 * Handles all tracking and performance monitoring with modern Web APIs
 */

import { CONFIG } from '../config/constants.js';
import { state, StateManager } from './state.js';
import { throttle } from '../utils/throttle.js';

export const Analytics = {
  // Error tracking for improved reliability
  errors: new Set(),

  /**
     * Track event via GTM dataLayer (GTM → GA4 flow)
     */
  track(eventName, parameters = {}) {
    try {
      // Console logging for debugging
      console.log(`Analytics: ${eventName}`, parameters);

      // Send to GTM dataLayer instead of direct gtag
      if (window.dataLayer) {
        window.dataLayer.push({
          event: eventName,
          ...parameters
        });
      } else {
        // Fallback: queue event if dataLayer not yet available
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: eventName,
          ...parameters
        });
      }

      // Track to performance timeline for debugging
      if ('performance' in window && 'mark' in window.performance) {
        performance.mark(`analytics-${eventName}`);
      }
    } catch (error) {
      this.trackError('analytics_tracking_failed', error);
    }
  },

  /**
     * Track JavaScript errors for improved debugging
     */
  trackError(errorType, error, context = {}) {
    const errorKey = `${errorType}-${error.message}`;
    if (this.errors.has(errorKey)) return; // Prevent duplicate error reports

    this.errors.add(errorKey);
    console.error(`Error [${errorType}]:`, error, context);

    this.track('javascript_error', {
      event_category: 'Error',
      event_label: errorType,
      error_message: error.message,
      error_stack: error.stack?.substring(0, 500),
      ...context
    });
  },

  /**
     * Initialize comprehensive performance tracking with modern Web APIs
     */
  initPerformanceTracking() {
    try {
      // Core Web Vitals tracking
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.track(CONFIG.analytics.events.HERO_LCP, {
              custom_parameter: Math.round(entry.startTime),
              event_category: 'Core Web Vitals',
              metric_value: Math.round(entry.startTime)
            });
          }
        });
        lcpObserver.observe({entryTypes: ['largest-contentful-paint']});

        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          if (clsValue > 0) {
            this.track('core_web_vitals_cls', {
              custom_parameter: Math.round(clsValue * 1000),
              event_category: 'Core Web Vitals',
              metric_value: Math.round(clsValue * 1000)
            });
          }
        });
        clsObserver.observe({entryTypes: ['layout-shift']});

        // First Input Delay (FID) / Interaction to Next Paint (INP)
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.track('core_web_vitals_fid', {
              custom_parameter: Math.round(entry.processingStart - entry.startTime),
              event_category: 'Core Web Vitals',
              metric_value: Math.round(entry.processingStart - entry.startTime)
            });
          }
        });
        fidObserver.observe({entryTypes: ['first-input']});
      }

      // Page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
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
      this.trackError('performance_tracking_init_failed', error);
    }
  },

  /**
     * Initialize scroll depth tracking
     */
  initScrollDepthTracking() {
    const trackScrollDepth = throttle(() => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );

      CONFIG.scroll.thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !state.scrollDepth[threshold]) {
          state.scrollDepth[threshold] = true;
          this.track(CONFIG.analytics.events.SCROLL_DEPTH, {
            event_category: 'Engagement',
            event_label: `${threshold}%`,
            value: threshold
          });
        }
      });
    }, CONFIG.scroll.throttle);

    window.addEventListener('scroll', trackScrollDepth, { passive: true });
  },

  /**
     * Track FAQ engagement time
     */
  trackFAQEngagement(faqId, isOpening) {
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