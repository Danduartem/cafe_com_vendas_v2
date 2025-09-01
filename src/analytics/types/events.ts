/**
 * Analytics Event Type Definitions
 * Domain-specific analytics event interfaces following DDD principles
 * All analytics-related event types consolidated in this location
 */

/**
 * Base analytics event interface
 */
export interface AnalyticsEvent extends Record<string, unknown> {
  event: string;
  event_category?: string;
  event_label?: string;
  value?: number;
}

/**
 * Performance tracking event
 */
export interface PerformanceEvent extends AnalyticsEvent {
  event: 'performance_metric';
  metric_name: string;
  metric_value: number;
  metric_unit?: 'ms' | 's' | 'bytes' | 'count';
}

/**
 * Error tracking event
 */
export interface ErrorEvent extends AnalyticsEvent {
  event: 'error';
  error_message: string;
  error_stack?: string;
  error_filename?: string;
  error_lineno?: number;
  error_colno?: number;
  component_name?: string;
}

/**
 * User interaction events
 */
export type InteractionEvent =
  | WhatsAppClickEvent
  | ScrollDepthEvent
  | ComponentInteractionEvent
  | FormSubmissionEvent;

export interface WhatsAppClickEvent extends AnalyticsEvent {
  event: 'whatsapp_click';
  link_url: string;
  link_text: string;
  location: string;
}

export interface ScrollDepthEvent extends AnalyticsEvent {
  event: 'scroll_depth';
  depth_percentage: number;
  depth_pixels: number;
}

export interface ComponentInteractionEvent extends AnalyticsEvent {
  event: 'component_interaction';
  component_name: string;
  action: string;
  element_id?: string;
}

export interface FormSubmissionEvent extends AnalyticsEvent {
  event: 'form_submission';
  form_name: string;
  form_method: 'POST' | 'GET';
  form_action?: string;
}

/**
 * Section view tracking event (GA4 2025 compliant)
 */
export interface SectionViewEvent extends AnalyticsEvent {
  event: 'section_view';
  section_name: string;
  section_id: string;
  percent_visible?: number;
  timestamp: string;
}

/**
 * Application lifecycle events
 */
export interface AppInitializedEvent extends AnalyticsEvent {
  event: 'app_initialized';
  components_count: number;
}

export interface ComponentsInitializedEvent extends AnalyticsEvent {
  event: 'components_initialized';
  success_count: number;
  failure_count: number;
  total_components: number;
}

/**
 * GTM normalized event payload
 */
export interface GTMEventPayload extends Record<string, unknown> {
  event: string;
}