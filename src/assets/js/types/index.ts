/**
 * Central export for all TypeScript type definitions
 */

// Global types
export * from './global.js';

// Component types
export type {
  Component,
  ComponentWithCleanup,
  ComponentRegistration,
  ComponentStatus,
  ComponentHealthStatus
} from './component.js';

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
} from './analytics.js';

// DOM types
export type {
  SafeElement,
  SafeElements,
  SafeHTMLElement,
  SafeButton,
  SafeInput,
  SafeForm,
  SafeAnchor,
  SafeImage,
  SafeVideo,
  SafeDiv,
  SafeSection,
  AnimationConfig,
  RevealConfig,
  ObserverConfig,
  ScrollConfig,
  Breakpoints,
  SlideCalculation
} from './dom.js';

// Configuration types
export type {
  Environment,
  AnimationTimings,
  BreakpointConfig,
  ScrollTrackingConfig,
  AnalyticsConfig,
  AppConfig,
  Constants
} from './config.js';

// State types
export type {
  AppState,
  StateManager,
  StateChangeEvent,
  ViewportChangeEvent
} from './state.js';