/**
 * Error Tracking Plugin
 * Preserves error tracking functionality from the original Analytics system
 * Includes error deduplication and structured error reporting
 */

import type { PluginFactory, ErrorTrackingPayload, AnalyticsInstance } from '../types/index.js';

interface ErrorPluginConfig extends Record<string, unknown> {
  enableDeduplication?: boolean;
  maxStackLength?: number;
  debug?: boolean;
}

/**
 * Extended Error interface with optional browser properties
 */
interface ExtendedError extends Error {
  filename?: string;
  lineno?: number;
  colno?: number;
}

/**
 * Error Plugin - handles error tracking with deduplication
 */
export const errorPlugin: PluginFactory<ErrorPluginConfig> = (config = {}) => {
  const {
    enableDeduplication = true,
    maxStackLength = 500,
    debug = false
  } = config;

  // Error deduplication set (from original Analytics system)
  const errors = new Set<string>();

  return {
    name: 'error',

    initialize() {
      if (debug) {
        console.warn('[Error Plugin] Error tracking initialized with deduplication:', enableDeduplication);
      }
    },

    methods: {
      /**
       * Track JavaScript errors for improved debugging
       * Preserves deduplication logic from original Analytics system
       */
      trackError(errorType: string, error: Error, context: Record<string, unknown> = {}) {
        const instance = (globalThis as { analytics?: AnalyticsInstance }).analytics;
        
        if (!instance) {
          console.error('[Error Plugin] Analytics instance not available');
          return;
        }

        // Create error key for deduplication
        const errorKey = `${errorType}-${error.message}`;
        
        // Skip if already reported (when deduplication is enabled)
        if (enableDeduplication && errors.has(errorKey)) {
          return;
        }

        // Add to error tracking set
        if (enableDeduplication) {
          errors.add(errorKey);
        }

        // Log error for debugging
        console.error(`Error [${errorType}]:`, error, context);

        // Create structured error payload
        const errorPayload: ErrorTrackingPayload = {
          error_message: error.message,
          error_stack: error.stack?.substring(0, maxStackLength),
          error_filename: (error as ExtendedError).filename,
          error_lineno: (error as ExtendedError).lineno,
          error_colno: (error as ExtendedError).colno,
          ...context
        };

        // Track the error event
        instance.track('error', {
          event_category: 'Error',
          event_label: errorType,
          ...errorPayload
        });

        if (debug) {
          console.warn('[Error Plugin] Error tracked:', { errorType, errorKey, context });
        }
      },

      /**
       * Track application initialization errors
       */
      trackInitializationError(error: Error, context?: Record<string, unknown>) {
        this.trackError('app_initialization_failed', error, context);
      },

      /**
       * Track component initialization errors
       */
      trackComponentError(componentName: string, error: Error, context?: Record<string, unknown>) {
        this.trackError('component_initialization_failed', error, {
          component_name: componentName,
          ...context
        });
      },

      /**
       * Track unhandled promise rejections
       */
      trackUnhandledRejection(reason: unknown, context?: Record<string, unknown>) {
        const errorMessage = typeof reason === 'string' ? reason : 
                           (reason instanceof Error ? reason.message : 'Unknown promise rejection');
        
        const error = new Error(errorMessage);
        this.trackError('unhandled_promise_rejection', error, context);
      },

      /**
       * Track global JavaScript errors
       */
      trackGlobalError(message: string, filename?: string, lineno?: number, colno?: number, error?: Error) {
        const errorToPass = error || new Error(message);
        
        // Enhance error with browser context
        if (filename) (errorToPass as ExtendedError).filename = filename;
        if (lineno) (errorToPass as ExtendedError).lineno = lineno;
        if (colno) (errorToPass as ExtendedError).colno = colno;

        this.trackError('global_javascript_error', errorToPass);
      },

      /**
       * Setup global error handlers
       */
      setupGlobalErrorHandling() {
        
        // Global error handler
        window.addEventListener('error', (event) => {
          this.trackGlobalError(
            event.message,
            event.filename,
            event.lineno,
            event.colno,
            event.error
          );
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
          this.trackUnhandledRejection(event.reason, {
            type: 'unhandled_promise_rejection'
          });
        });

        if (debug) {
          console.warn('[Error Plugin] Global error handlers configured');
        }
      },

      /**
       * Clear error tracking cache
       */
      clearErrors() {
        errors.clear();
        
        if (debug) {
          console.warn('[Error Plugin] Error cache cleared');
        }
      },

      /**
       * Get tracked error count
       */
      getErrorCount() {
        return errors.size;
      },

      /**
       * Get all tracked error keys
       */
      getTrackedErrors() {
        return Array.from(errors);
      }
    },

    config
  };
};