/**
 * Central export for all TypeScript type definitions
 */

// Global types
export * from './global';

// Component types
export type {
  Component,
  ComponentWithCleanup,
  ComponentRegistration,
  ComponentStatus,
  ComponentHealthStatus
} from './component';

// Analytics types
export type {
  AnalyticsEvent,
  PerformanceEvent,
  ErrorEvent,
  InteractionEvent,
  WhatsAppClickEvent,
  ScrollDepthEvent,
  ComponentInteractionEvent,
  FormSubmissionEvent,
  AppInitializedEvent,
  ComponentsInitializedEvent,
  GTMEventPayload
} from './analytics';

// DOM types
export type {
  SafeElement,
  SafeElements,
  SafeHTMLElement,
  AnimationConfig,
  RevealConfig,
  ObserverConfig
} from './dom';

// Configuration types
export type {
  Environment,
  AnimationTimings,
  BreakpointConfig,
  ScrollTrackingConfig,
  AnalyticsConfig,
  AppConfig,
  Constants
} from './config';


// State types
export type {
  AppState,
  StateManager,
  StateChangeEvent,
  ViewportChangeEvent
} from './state';