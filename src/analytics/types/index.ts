/**
 * Analytics Types for Plugin Architecture
 * Comprehensive type definitions for the unified analytics system
 */

// Import all event types from local domain
export * from './events.js';
import type { AnalyticsEvent, GTMEventPayload } from './events.js';

/**
 * Analytics configuration
 */
export interface AnalyticsConfig {
  app: string;
  version?: number;
  debug?: boolean;
  plugins?: AnalyticsPlugin[];
}

/**
 * Plugin context passed to all plugin methods
 */
export interface PluginContext {
  payload?: Record<string, unknown>;
  config: AnalyticsConfig;
  instance: AnalyticsInstance;
}

/**
 * Analytics plugin interface
 */
export interface AnalyticsPlugin {
  name: string;
  
  // Lifecycle hooks
  bootstrap?(context: PluginContext): Promise<void> | void;
  initialize?(context: PluginContext): Promise<void> | void;
  
  // Event hooks
  trackStart?(context: PluginContext): void;
  track?(context: PluginContext): void;
  trackEnd?(context: PluginContext): void;
  
  page?(context: PluginContext): void;
  identify?(context: PluginContext): void;
  
  // Plugin status
  loaded?(): boolean;
  
  // Custom methods exposed to analytics.plugins.{pluginName}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  methods?: Record<string, (...args: any[]) => any>;
  
  // Plugin configuration
  config?: Record<string, unknown>;
}

/**
 * Main analytics instance interface
 */
export interface AnalyticsInstance {
  init(): Promise<void>;
  track<T extends AnalyticsEvent>(eventName: T['event'], data?: Omit<T, 'event'>): void;
  page(data?: Record<string, unknown>): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  ready(callback: () => void): void;
  getPlugin(name: string): AnalyticsPlugin | undefined;
  plugins: Record<string, Record<string, PluginMethod>>;
}

/**
 * Plugin factory function signature
 */
export type PluginFactory<T = Record<string, unknown>> = (config?: T) => AnalyticsPlugin;

/**
 * Event payload for section tracking
 */
export interface SectionTrackingPayload extends Record<string, unknown> {
  section_name: string;
  section_id: string;
  percent_visible?: number;
  timestamp: string;
}

/**
 * Error tracking payload
 */
export interface ErrorTrackingPayload extends Record<string, unknown> {
  error_message: string;
  error_stack?: string;
  error_filename?: string;
  error_lineno?: number;
  error_colno?: number;
  component_name?: string;
}

/**
 * Performance tracking payload
 */
export interface PerformanceTrackingPayload extends Record<string, unknown> {
  metric_name: string;
  metric_value: number;
  metric_unit?: 'ms' | 's' | 'bytes' | 'count';
}

/**
 * Plugin method signature - flexible to allow various method signatures
 */
export type PluginMethod = (...args: unknown[]) => unknown;

/**
 * Analytics instance interface for plugins
 */
export interface AnalyticsInstance {
  track(event: string, payload?: Record<string, unknown>): void;
  page(payload?: Record<string, unknown>): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
}

/**
 * Specific plugin method interfaces for common patterns
 */
export interface GTMPluginMethods {
  trackCTAClick(location: string, data?: Record<string, unknown>): void;
  trackConversion(event: string, data: Record<string, unknown>): void;
  trackFAQ(itemNumber: string, isOpen: boolean, question: string): void;
  trackFAQMeaningfulEngagement(toggleCount: number, data?: Record<string, unknown>): void;
  trackTestimonialSlide(testimonialId: string, position: number, data?: Record<string, unknown>): void;
  trackWhatsAppClick(linkUrl: string, linkText: string, location: string, data?: Record<string, unknown>): void;
  trackVideoProgress(videoTitle: string, percentPlayed: number, data?: Record<string, unknown>): void;
  pushToDataLayer(data: GTMEventPayload): void;
  getPluginState(): Record<string, unknown>;
  resetState(): void;
}

export interface SectionTrackingPluginMethods {
  initSectionTracking(sectionName: string, threshold?: number): void;
  trackSectionView(sectionName: string, data?: Record<string, unknown>): void;
  trackSectionEngagement(sectionName: string, action: string, data?: Record<string, unknown>): void;
  resetSectionTracking(): void;
  getViewedSections(): string[];
  hasViewedSection(sectionName: string): boolean;
}

export interface ErrorPluginMethods {
  trackError(errorType: string, error: Error, context?: Record<string, unknown>): void;
  setupGlobalErrorHandling(): void;
}

export interface PerformancePluginMethods {
  trackCustomMetric(name: string, value: number, unit?: string): void;
}

export interface ScrollTrackingPluginMethods {
  updateScrollThresholds(thresholds: number[]): void;
}

// GTMEventPayload is now defined in events.ts