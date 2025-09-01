/**
 * Analytics Types for Plugin Architecture
 * Comprehensive type definitions for the unified analytics system
 */

// Import all event types from local domain
export * from './events.js';
import type { AnalyticsEvent } from './events.js';

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
  payload?: any;
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
  methods?: Record<string, Function>;
  
  // Plugin configuration
  config?: any;
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
  plugins: Record<string, Record<string, Function>>;
}

/**
 * Plugin factory function signature
 */
export type PluginFactory<T = Record<string, unknown>> = (config?: T) => AnalyticsPlugin;

/**
 * Event payload for section tracking
 */
export interface SectionTrackingPayload {
  section_name: string;
  section_id: string;
  percent_visible?: number;
  timestamp: string;
}

/**
 * Error tracking payload
 */
export interface ErrorTrackingPayload {
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
export interface PerformanceTrackingPayload {
  metric_name: string;
  metric_value: number;
  metric_unit?: 'ms' | 's' | 'bytes' | 'count';
}

// GTMEventPayload is now defined in events.ts