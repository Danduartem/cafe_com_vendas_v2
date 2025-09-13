/**
 * Unified Analytics System
 * Plugin-based architecture with GTM, performance tracking, and error handling
 */

import { createAnalytics } from './core/analytics.js';
import { gtmPlugin } from './plugins/gtm.js';
import { performancePlugin } from './plugins/performance.js';
import { sectionTrackingPlugin } from './plugins/section-tracking.js';
import { errorPlugin } from './plugins/error.js';
import { ENV } from '../assets/js/config/constants.js';
import { debugLog } from './utils/debug.js';
import type { 
  AnalyticsInstance, 
  GTMPluginMethods,
  SectionTrackingPluginMethods,
  ErrorPluginMethods
} from './types/index.js';

// Main analytics instance with all plugins configured
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
    
    // Scroll depth is handled by GTM's built-in trigger; app plugin disabled to avoid duplicates
  ]
});

// Initialize analytics and setup global error handling
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
    
    // Scroll depth handled by GTM; no app plugin initialization
    
    debugLog('[Analytics] Unified analytics system initialized');
    debugLog('[Analytics] Available plugins:', Object.keys(analytics.plugins || {}));
  } catch (error) {
    console.error('[Analytics] Initialization failed:', error);
  }
}

// Convenience methods for common tracking patterns
export const AnalyticsHelpers = {
  initSectionTracking(sectionName: string, threshold?: number): void {
    const plugin = analytics.getPlugin('section-tracking');
    if (plugin?.methods && 'initSectionTracking' in plugin.methods) {
      (plugin.methods as unknown as SectionTrackingPluginMethods).initSectionTracking(sectionName, threshold);
    }
  },

  trackCTAClick(location: string, data?: Record<string, unknown>): void {
    const plugin = analytics.getPlugin('gtm');
    if (plugin?.methods && 'trackCTAClick' in plugin.methods) {
      (plugin.methods as unknown as GTMPluginMethods).trackCTAClick(location, data);
    }
  },

  trackConversion(event: string, data: Record<string, unknown>): void {
    const plugin = analytics.getPlugin('gtm');
    if (plugin?.methods && 'trackConversion' in plugin.methods) {
      (plugin.methods as unknown as GTMPluginMethods).trackConversion(event, data);
    }
  },

  trackFAQ(itemNumber: string, isOpen: boolean, question: string): void {
    const plugin = analytics.getPlugin('gtm');
    if (plugin?.methods && 'trackFAQ' in plugin.methods) {
      (plugin.methods as unknown as GTMPluginMethods).trackFAQ(itemNumber, isOpen, question);
    }
  },

  trackError(errorType: string, error: Error, context?: Record<string, unknown>): void {
    const plugin = analytics.getPlugin('error');
    if (plugin?.methods && 'trackError' in plugin.methods) {
      (plugin.methods as unknown as ErrorPluginMethods).trackError(errorType, error, context);
    }
  },

  trackSectionEngagement(sectionName: string, action: string, data?: Record<string, unknown>): void {
    const plugin = analytics.getPlugin('section-tracking');
    if (plugin?.methods && 'trackSectionEngagement' in plugin.methods) {
      (plugin.methods as unknown as SectionTrackingPluginMethods).trackSectionEngagement(sectionName, action, data);
    }
  },

  trackFAQMeaningfulEngagement(toggleCount: number, data?: Record<string, unknown>): void {
    const plugin = analytics.getPlugin('gtm');
    if (plugin?.methods && 'trackFAQMeaningfulEngagement' in plugin.methods) {
      (plugin.methods as unknown as GTMPluginMethods).trackFAQMeaningfulEngagement(toggleCount, data);
    }
  },

  trackTestimonialSlide(testimonialId: string, position: number, data?: Record<string, unknown>): void {
    const plugin = analytics.getPlugin('gtm');
    if (plugin?.methods && 'trackTestimonialSlide' in plugin.methods) {
      (plugin.methods as unknown as GTMPluginMethods).trackTestimonialSlide(testimonialId, position, data);
    }
  },

  trackWhatsAppClick(linkUrl: string, linkText: string, location: string, data?: Record<string, unknown>): void {
    const plugin = analytics.getPlugin('gtm');
    if (plugin?.methods && 'trackWhatsAppClick' in plugin.methods) {
      (plugin.methods as unknown as GTMPluginMethods).trackWhatsAppClick(linkUrl, linkText, location, data);
    }
  },

  trackVideoPlay(videoTitle: string, data?: Record<string, unknown>): void {
    const plugin = analytics.getPlugin('gtm');
    if (plugin?.methods && 'trackVideoPlay' in plugin.methods) {
      (plugin.methods as unknown as GTMPluginMethods).trackVideoPlay(videoTitle, data);
    }
  },

  trackVideoProgress(videoTitle: string, percentPlayed: number, data?: Record<string, unknown>): void {
    const plugin = analytics.getPlugin('gtm');
    if (plugin?.methods && 'trackVideoProgress' in plugin.methods) {
      (plugin.methods as unknown as GTMPluginMethods).trackVideoProgress(videoTitle, percentPlayed, data);
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
  errorPlugin
};

// Export types
export type { AnalyticsInstance, AnalyticsPlugin } from './types/index.js';
