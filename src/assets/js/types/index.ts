/**
 * Central export for all TypeScript type definitions
 */

// Global types
export * from './global.ts';

// Component types
export type {
  Component,
  ComponentWithCleanup,
  ComponentRegistration,
  ComponentStatus,
  ComponentHealthStatus
} from './component.ts';

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
} from './analytics.ts';

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
} from './dom.ts';

// Configuration types
export type {
  Environment,
  AnimationTimings,
  BreakpointConfig,
  ScrollTrackingConfig,
  AnalyticsConfig,
  AppConfig,
  Constants
} from './config.ts';

// State types
export type {
  AppState,
  StateManager,
  StateChangeEvent,
  ViewportChangeEvent
} from './state.ts';