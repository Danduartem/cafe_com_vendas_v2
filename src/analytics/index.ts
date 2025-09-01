/**
 * Unified Analytics System for Café com Vendas
 * Modern plugin-based architecture following industry best practices (2025)
 * 
 * Replaces both:
 * - src/assets/js/core/analytics.ts (Core Web Vitals, error tracking)
 * - src/components/ui/analytics/index.ts (component tracking)
 */

import { createAnalytics } from './core/analytics.js';
import { gtmPlugin } from './plugins/gtm.js';
import { performancePlugin } from './plugins/performance.js';
import { sectionTrackingPlugin } from './plugins/section-tracking.js';
import { errorPlugin } from './plugins/error.js';
import { scrollTrackingPlugin } from './plugins/scroll-tracking.js';
import { ENV } from '../assets/js/config/constants.js';
import { debugLog } from './utils/debug.js';
import type { 
  AnalyticsInstance, 
  GTMPluginMethods,
  SectionTrackingPluginMethods,
  ErrorPluginMethods
} from './types/index.js';

/**
 * Main Analytics Instance
 * Configured with all necessary plugins
 */
export const analytics = createAnalytics({
  app: 'cafe-com-vendas',
  version: 1,
  debug: ENV.isDevelopment,
  plugins: [
    // GTM Plugin - handles all dataLayer interactions
    gtmPlugin({
      debug: ENV.isDevelopment
    }),
    
    // Performance Plugin - Core Web Vitals tracking  
    performancePlugin({
      trackCoreWebVitals: true,
      trackPageLoad: true,
      clsThreshold: 0.1, // Google's "needs improvement" threshold
      debug: ENV.isDevelopment
    }),
    
    // Section Tracking Plugin - IntersectionObserver-based
    sectionTrackingPlugin({
      threshold: 0.5,
      debug: ENV.isDevelopment
    }),
    
    // Error Plugin - with deduplication
    errorPlugin({
      enableDeduplication: true,
      maxStackLength: 500,
      debug: ENV.isDevelopment
    }),
    
    // Scroll Tracking Plugin - scroll depth events
    scrollTrackingPlugin({
      thresholds: [10, 25, 50, 75, 90],
      debug: ENV.isDevelopment
    })
  ]
});

/**
 * Initialize analytics and setup global error handling
 * Call this once in your app initialization
 */
export async function initializeAnalytics(): Promise<void> {
  try {
    await analytics.init();
    
    // Expose analytics instance globally for plugin access (typed)
    (globalThis as typeof globalThis & { analytics: AnalyticsInstance }).analytics = analytics;
    
    // Setup global error handling with type safety
    const errorPlugin = analytics.getPlugin('error');
    if (errorPlugin?.methods && 'setupGlobalErrorHandling' in errorPlugin.methods) {
      (errorPlugin.methods as unknown as ErrorPluginMethods).setupGlobalErrorHandling();
    }
    
    // Initialize scroll tracking
    const scrollPlugin = analytics.getPlugin('scroll-tracking');
    if (scrollPlugin?.methods) {
      // Scroll tracking is auto-initialized in the plugin
    }
    
    debugLog('[Analytics] Unified analytics system initialized');
    debugLog('[Analytics] Available plugins:', Object.keys(analytics.plugins || {}));
  } catch (error) {
    console.error('[Analytics] Initialization failed:', error);
  }
}

/**
 * Convenience methods for common tracking patterns
 * Maintains backward compatibility while using modern plugin architecture
 */
export const AnalyticsHelpers = {
  /**
   * Track section view - modern IntersectionObserver-based implementation
   */
  initSectionTracking(sectionName: string, threshold?: number): void {
    const plugin = analytics.getPlugin('section-tracking');
    if (plugin?.methods && 'initSectionTracking' in plugin.methods) {
      (plugin.methods as unknown as SectionTrackingPluginMethods).initSectionTracking(sectionName, threshold);
    }
  },

  /**
   * Track CTA clicks with GA4-compliant event structure
   */
  trackCTAClick(location: string, data?: Record<string, unknown>): void {
    const plugin = analytics.getPlugin('gtm');
    if (plugin?.methods && 'trackCTAClick' in plugin.methods) {
      (plugin.methods as unknown as GTMPluginMethods).trackCTAClick(location, data);
    }
  },

  /**
   * Track conversions with enhanced event tracking
   */
  trackConversion(event: string, data: Record<string, unknown>): void {
    const plugin = analytics.getPlugin('gtm');
    if (plugin?.methods && 'trackConversion' in plugin.methods) {
      (plugin.methods as unknown as GTMPluginMethods).trackConversion(event, data);
    }
  },

  /**
   * Track FAQ interactions and accordion engagement
   */
  trackFAQ(itemNumber: string, isOpen: boolean, question: string): void {
    const plugin = analytics.getPlugin('gtm');
    if (plugin?.methods && 'trackFAQ' in plugin.methods) {
      (plugin.methods as unknown as GTMPluginMethods).trackFAQ(itemNumber, isOpen, question);
    }
  },

  /**
   * Track errors with context and deduplication
   */
  trackError(errorType: string, error: Error, context?: Record<string, unknown>): void {
    const plugin = analytics.getPlugin('error');
    if (plugin?.methods && 'trackError' in plugin.methods) {
      (plugin.methods as unknown as ErrorPluginMethods).trackError(errorType, error, context);
    }
  },

  /**
   * Track section engagement
   */
  trackSectionEngagement(sectionName: string, action: string, data?: Record<string, unknown>): void {
    const plugin = analytics.getPlugin('section-tracking');
    if (plugin?.methods && 'trackSectionEngagement' in plugin.methods) {
      (plugin.methods as unknown as SectionTrackingPluginMethods).trackSectionEngagement(sectionName, action, data);
    }
  }
};

// Export main analytics instance as default
export default analytics;

// Export plugin factories for advanced usage
export {
  gtmPlugin,
  performancePlugin, 
  sectionTrackingPlugin,
  errorPlugin,
  scrollTrackingPlugin
};

// Export types
export type { AnalyticsInstance, AnalyticsPlugin } from './types/index.js';