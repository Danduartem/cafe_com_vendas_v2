/**
 * Main Application Controller for Café com Vendas
 * Orchestrates all components and manages application lifecycle
 */

import { CONFIG } from '@/config/constants.ts';
import { state, StateManager } from '@/core/state.ts';
import { Analytics } from '@/core/analytics.ts';
import { ScrollTracker } from '../../platform/lib/utils/scroll-tracker.ts';
import type {
  Component,
  ComponentRegistration,
  ComponentHealthStatus,
  ComponentStatus
} from '@/types/component.ts';
import type {
  AppInitializedEvent,
  ComponentsInitializedEvent
} from '@/types/analytics.ts';
import type { AppState } from '@/types/state.ts';
import type { Constants } from '@/types/config.ts';

// Import platform utility components
import {
  PlatformYouTube,
  PlatformThankYou,
  PlatformGTM
} from '../../platform/ui/components/index.ts';

// Import co-located section components (new approach)
import { Hero } from '../../_includes/sections/hero/index.ts';
import { Offer } from '../../_includes/sections/offer/index.ts';
import { FAQ } from '../../_includes/sections/faq/index.ts';
import { SocialProof } from '../../_includes/sections/social-proof/index.ts';
import { Checkout } from '../../_includes/sections/checkout/index.ts';

/**
 * Main application interface
 */
interface CafeComVendasInterface {
  components: ComponentRegistration[] | undefined;
  init(): void;
  setupGlobalErrorHandling(): void;
  initializeComponents(): void;
  getComponentCount(): number;
  getState(): AppState;
  getConfig(): Constants;
  getComponentStatus(): ComponentHealthStatus;
  [key: string]: unknown;
}

/**
 * Error context for analytics
 */
interface ErrorContext {
  message: string | undefined;
  stack: string | undefined;
  filename: string | undefined;
  lineno: number | undefined;
  colno: number | undefined;
  component_name: string | undefined;
  [key: string]: unknown;
}

export const CafeComVendas: CafeComVendasInterface = {
  components: undefined,

  /**
   * Initialize all components and functionality with enhanced error handling
   */
  init(): void {
    if (state.isInitialized) {
      console.warn('CafeComVendas already initialized');
      return;
    }

    try {
      // Initializing Café com Vendas landing page...

      // Set up global error handling
      this.setupGlobalErrorHandling();

      // CSS now loaded directly in HTML for reliability

      // Initialize analytics first
      Analytics.initPerformanceTracking();

      // Initialize scroll depth tracking
      ScrollTracker.init();

      // Initialize all components
      this.initializeComponents();

      StateManager.setInitialized(true);
      // Café com Vendas initialized successfully

      // Track successful initialization
      const initEvent: AppInitializedEvent = {
        event: 'app_initialized',
        event_category: 'Application',
        components_count: this.getComponentCount()
      };
      Analytics.track('app_initialized', initEvent);

    } catch (error) {
      Analytics.trackError('app_initialization_failed', error as Error);
      console.error('Failed to initialize Café com Vendas:', error);
    }
  },

  /**
   * Set up global error handling for better debugging
   */
  setupGlobalErrorHandling(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent): void => {
      const errorContext: ErrorContext = {
        message: event.reason?.message ?? 'Unknown promise rejection',
        stack: event.reason?.stack,
        filename: undefined,
        lineno: undefined,
        colno: undefined,
        component_name: undefined
      };
      Analytics.trackError('unhandled_promise_rejection', new Error(errorContext.message), errorContext);
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event: ErrorEvent): void => {
      const errorContext: ErrorContext = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        component_name: undefined
      };
      Analytics.trackError('global_javascript_error', event.error ?? new Error(event.message), errorContext);
    });
  },

  /**
   * Initialize all page components with enhanced error handling
   */
  initializeComponents(): void {
    const components: ComponentRegistration[] = [
      // Platform utility components
      { name: 'GTM', component: { init: () => PlatformGTM.init() } },
      { name: 'YouTube', component: { init: () => PlatformYouTube.init() } },
      { name: 'ThankYou', component: { init: () => PlatformThankYou.init() } },

      // Co-located section components (new approach)
      { name: 'Hero', component: Hero as Component },
      { name: 'Offer', component: Offer as Component },
      { name: 'FAQ', component: FAQ as Component },
      { name: 'SocialProof', component: SocialProof as Component },
      { name: 'Checkout', component: Checkout as Component }
    ];

    let successCount = 0;
    let failureCount = 0;

    components.forEach(({ name, component }) => {
      try {
        if (component && typeof component.init === 'function') {
          component.init();
          // Component initialized: ${name}
          successCount++;
          StateManager.setComponentStatus(name, true, undefined);
        } else {
          console.warn(`⚠ ${name} component missing or invalid init method`);
          failureCount++;
          StateManager.setComponentStatus(name, false, new Error('Missing or invalid init method'));
        }
      } catch (error) {
        console.error(`✗ Failed to initialize ${name} component:`, error);
        Analytics.trackError('component_initialization_failed', error as Error, {
          component_name: name
        });
        failureCount++;
        StateManager.setComponentStatus(name, false, error as Error);
      }
    });

    const componentsEvent: ComponentsInitializedEvent = {
      event: 'components_initialized',
      event_category: 'Application',
      success_count: successCount,
      failure_count: failureCount,
      total_components: components.length
    };
    Analytics.track('components_initialized', componentsEvent);

    this.components = components;
  },

  /**
   * Get total component count
   */
  getComponentCount(): number {
    return this.components ? this.components.length : 0;
  },

  /**
   * Get current state for debugging
   */
  getState(): AppState {
    return StateManager.getSnapshot();
  },

  /**
   * Get configuration
   */
  getConfig(): Constants {
    return CONFIG;
  },

  /**
   * Get component health status for debugging
   */
  getComponentStatus(): ComponentHealthStatus {
    if (!this.components) {
      return {
        status: 'not_initialized',
        total: 0,
        healthy: 0
      };
    }

    const status: ComponentStatus[] = this.components.map(({ name, component }) => ({
      name,
      initialized: component && typeof component.init === 'function',
      hasInit: typeof component?.init === 'function'
    }));

    return {
      status: 'initialized',
      components: status,
      total: status.length,
      healthy: status.filter(c => c.initialized).length
    };
  }
};