/**
 * Modern Analytics Core for Café com Vendas
 * Plugin-based architecture following industry best practices (2025)
 * 
 * Inspired by davidwells/analytics with custom plugins for:
 * - GTM integration with GA4-compliant event structure
 * - Performance monitoring with Core Web Vitals tracking
 * - Section tracking using modern IntersectionObserver API
 * - Error reporting with context and deduplication
 */

import type { AnalyticsEvent, AnalyticsPlugin, AnalyticsConfig, AnalyticsInstance } from '../types/index.js';

/**
 * Core Analytics Class - Manages plugins and event flow
 */
class Analytics {
  private pluginMap = new Map<string, AnalyticsPlugin>();
  private config: AnalyticsConfig;
  private initialized = false;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    
    // Register plugins
    config.plugins?.forEach(plugin => {
      this.pluginMap.set(plugin.name, plugin);
    });
  }

  /**
   * Initialize all plugins
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    // Call bootstrap on all plugins
    for (const [name, plugin] of this.pluginMap) {
      try {
        await plugin.bootstrap?.({ config: this.config, instance: this as unknown as AnalyticsInstance });
      } catch (error) {
        console.error(`Plugin ${name} bootstrap failed:`, error);
      }
    }

    // Call initialize on all plugins
    for (const [name, plugin] of this.pluginMap) {
      try {
        await plugin.initialize?.({ config: this.config, instance: this as unknown as AnalyticsInstance });
      } catch (error) {
        console.error(`Plugin ${name} initialization failed:`, error);
      }
    }

    this.initialized = true;
  }

  /**
   * Track generic events - routes to all plugins
   */
  track<T extends AnalyticsEvent>(eventName: T['event'], data?: Omit<T, 'event'>): void {
    if (!this.initialized) {
      console.warn('Analytics not initialized. Call analytics.init() first.');
      return;
    }

    const payload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      ...data
    } as unknown as T;

    // Call trackStart hooks
    this.pluginMap.forEach(plugin => {
      plugin.trackStart?.({ payload, config: this.config, instance: this as unknown as AnalyticsInstance });
    });

    // Call main track method on all plugins
    this.pluginMap.forEach(plugin => {
      try {
        plugin.track?.({ payload, config: this.config, instance: this as unknown as AnalyticsInstance });
      } catch (error) {
        console.error(`Plugin ${plugin.name} track failed:`, error);
      }
    });

    // Call trackEnd hooks
    this.pluginMap.forEach(plugin => {
      plugin.trackEnd?.({ payload, config: this.config, instance: this as unknown as AnalyticsInstance });
    });
  }

  /**
   * Page view tracking
   */
  page(data?: Record<string, unknown>): void {
    const payload = {
      event: 'page_view',
      timestamp: new Date().toISOString(),
      ...data
    };

    this.pluginMap.forEach(plugin => {
      try {
        plugin.page?.({ payload, config: this.config, instance: this as unknown as AnalyticsInstance });
      } catch (error) {
        console.error(`Plugin ${plugin.name} page failed:`, error);
      }
    });
  }

  /**
   * User identification
   */
  identify(userId: string, traits?: Record<string, unknown>): void {
    const payload = {
      event: 'identify',
      userId,
      traits,
      timestamp: new Date().toISOString()
    };

    this.pluginMap.forEach(plugin => {
      try {
        plugin.identify?.({ payload, config: this.config, instance: this as unknown as AnalyticsInstance });
      } catch (error) {
        console.error(`Plugin ${plugin.name} identify failed:`, error);
      }
    });
  }

  /**
   * Ready callback - when all plugins are loaded
   */
  ready(callback: () => void): void {
    // Check if all plugins are ready
    const allReady = Array.from(this.pluginMap.values()).every(plugin => {
      return plugin.loaded ? plugin.loaded() : true;
    });

    if (allReady) {
      callback();
    } else {
      // Poll until ready
      const checkReady = () => {
        const ready = Array.from(this.pluginMap.values()).every(plugin => {
          return plugin.loaded ? plugin.loaded() : true;
        });
        
        if (ready) {
          callback();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      
      setTimeout(checkReady, 100);
    }
  }

  /**
   * Get plugin by name
   */
  getPlugin(name: string): AnalyticsPlugin | undefined {
    return this.pluginMap.get(name);
  }

  /**
   * Access to plugin methods (for backward compatibility)
   */
  get plugins() {
    const pluginMethods: Record<string, Record<string, (...args: unknown[]) => unknown>> = {};
    
    for (const [name, plugin] of this.pluginMap) {
      if (plugin.methods) {
        pluginMethods[name] = plugin.methods;
      }
    }
    
    return pluginMethods;
  }
}

/**
 * Factory function to create analytics instance
 */
export function createAnalytics(config: AnalyticsConfig): AnalyticsInstance {
  const analytics = new Analytics(config);
  
  return {
    init: analytics.init.bind(analytics),
    track: analytics.track.bind(analytics),
    page: analytics.page.bind(analytics),
    identify: analytics.identify.bind(analytics),
    ready: analytics.ready.bind(analytics),
    getPlugin: analytics.getPlugin.bind(analytics),
    plugins: analytics.plugins
  };
}

export type { AnalyticsInstance, AnalyticsConfig, AnalyticsPlugin };