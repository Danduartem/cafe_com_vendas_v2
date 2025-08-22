/**
 * Application environment configuration
 */
export interface Environment {
  production: boolean;
  development: boolean;
  cloudinary: {
    cloudName: string;
  };
  stripe: {
    publicKey: string;
  };
}

/**
 * Animation timing configuration
 */
export interface AnimationTimings {
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
  delay: {
    short: number;
    normal: number;
    long: number;
  };
}

/**
 * Breakpoint configuration for responsive design
 */
export interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
  xl: number;
}

/**
 * Scroll tracking configuration
 */
export interface ScrollTrackingConfig {
  thresholds: number[];
  throttleMs: number;
}

/**
 * Analytics configuration
 */
export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  trackingId?: string;
}

/**
 * Main application configuration
 */
export interface AppConfig {
  animations: AnimationTimings;
  breakpoints: BreakpointConfig;
  scrollTracking: ScrollTrackingConfig;
  analytics: AnalyticsConfig;
  performance: {
    observerRootMargin: string;
    observerThreshold: number;
    throttleMs: number;
  };
}

/**
 * Build-time constants
 */
export interface Constants extends AppConfig {
  isDevelopment: boolean;
}