/**
 * Main Application Controller for Café com Vendas
 * Orchestrates all components and manages application lifecycle
 */

import { CONFIG } from './config/constants.js';
import { state, StateManager } from './core/state.js';
import { normalizeEventPayload } from './utils/gtm-normalizer.js';
import type {
  ComponentRegistration,
  ComponentHealthStatus,
  ComponentStatus
} from '../../types/components/base.js';
import type {
  AppInitializedEvent,
  ComponentsInitializedEvent
} from '../../analytics/types/events.js';
import type { AppState } from '../../types/components/state.js';
import type { Constants } from '../../types/components/config.js';

type AnalyticsModule = typeof import('../../analytics/index.js');

let analyticsModulePromise: Promise<AnalyticsModule> | undefined;
let analyticsModuleCache: AnalyticsModule | undefined;
let analyticsInitializationStarted = false;
let analyticsInitialized = false;

type AnalyticsCallback = (module: AnalyticsModule) => void;
const pendingAnalyticsCallbacks: AnalyticsCallback[] = [];

type AnalyticsActivationSource = 'first_scroll' | 'cta_click' | 'timeout_fallback';

interface AnalyticsActivationDetail {
  source: AnalyticsActivationSource;
  timestamp: string;
}

let latestActivationDetail: AnalyticsActivationDetail | undefined;
type ActivationCallback = (detail: AnalyticsActivationDetail) => void;
const activationCallbacks: ActivationCallback[] = [];

let analyticsActivationSetup = false;
let resolveAnalyticsActivation: ((detail: AnalyticsActivationDetail) => void) | undefined;

const analyticsActivationPromise = new Promise<AnalyticsActivationDetail>(resolve => {
  resolveAnalyticsActivation = resolve;
});

const ANALYTICS_ACTIVATION_FALLBACK_DELAY_MS = 15000; // 15s safety net instead of immediate timeout

async function loadAnalyticsModule(): Promise<AnalyticsModule> {
  if (analyticsModuleCache) {
    return analyticsModuleCache;
  }

  if (!analyticsModulePromise) {
    analyticsModulePromise = import('../../analytics/index.js');
  }

  analyticsModuleCache = await analyticsModulePromise;
  return analyticsModuleCache;
}

function withAnalytics(callback: (module: AnalyticsModule) => void): void {
  if (analyticsInitialized && analyticsModuleCache) {
    try {
      callback(analyticsModuleCache);
    } catch (error) {
      console.warn('[Analytics] Callback execution failed after initialization.', error);
    }
    return;
  }

  pendingAnalyticsCallbacks.push(callback);
}

function flushPendingAnalyticsCallbacks(module: AnalyticsModule): void {
  while (pendingAnalyticsCallbacks.length > 0) {
    const queuedCallback = pendingAnalyticsCallbacks.shift();
    if (!queuedCallback) {
      continue;
    }

    try {
      queuedCallback(module);
    } catch (error) {
      console.warn('[Analytics] Deferred callback execution failed.', error);
    }
  }
}

function trackAnalyticsError(type: string, error: Error, context?: Record<string, unknown>): void {
  withAnalytics(module => {
    module.AnalyticsHelpers.trackError(type, error, context);
  });
}

// Import utility components
import {
  PlatformThankYou
} from '../../components/ui/index.js';

// Import co-located section components (new approach)
import { Hero } from '../../_includes/sections/hero/index.js';
import { Vision } from '../../_includes/sections/problem/index.js';
import { Solution } from '../../_includes/sections/solution/index.js';
import { About } from '../../_includes/sections/about/index.js';
import { SocialProof } from '../../_includes/sections/social-proof/index.js';
import { Offer } from '../../_includes/sections/offer/index.js';
import { FAQ } from '../../_includes/sections/faq/index.js';
import { FinalCTA } from '../../_includes/sections/final-cta/index.js';
import { TopBanner } from '../../_includes/sections/top-banner/index.js';
import { ThankYou } from '../../_includes/sections/thank-you/index.js';
import { Checkout } from '../../_includes/sections/checkout/index.js';

function setupAnalyticsActivation(): void {
  if (analyticsActivationSetup) {
    return;
  }
  analyticsActivationSetup = true;

  const dataLayerWindow = window as unknown as { dataLayer?: Record<string, unknown>[] };
  dataLayerWindow.dataLayer = dataLayerWindow.dataLayer || [];
  const dataLayer = dataLayerWindow.dataLayer;

  let activated = false;
  let fallbackTimerId: number | undefined;
  const cleanupTasks: (() => void)[] = [];

  const dispatchActivation = (source: AnalyticsActivationSource): void => {
    if (activated) {
      return;
    }
    activated = true;

    cleanupTasks.forEach(task => {
      try {
        task();
      } catch {
        // noop
      }
    });
    cleanupTasks.length = 0;

    if (fallbackTimerId !== undefined) {
      window.clearTimeout(fallbackTimerId);
      fallbackTimerId = undefined;
    }

    const timestamp = new Date().toISOString();
    const basePayload = {
      activation_source: source,
      activation_timestamp: timestamp
    };
    const detail: AnalyticsActivationDetail = { source, timestamp };
    latestActivationDetail = detail;
    (window as typeof window & { __analyticsActivated?: boolean }).__analyticsActivated = true;

    dataLayer.push(normalizeEventPayload({
      event: 'ga4_activate',
      engagement_type: source,
      analytics_activated: true,
      ...basePayload
    }));

    dataLayer.push(normalizeEventPayload({
      event: 'meta_activate',
      intent: source,
      analytics_activated: true,
      ...basePayload
    }));

    dataLayer.push(normalizeEventPayload({
      event: 'analytics_state',
      analytics_activated: true,
      ...basePayload
    }));

    if (resolveAnalyticsActivation) {
      resolveAnalyticsActivation(detail);
      resolveAnalyticsActivation = undefined;
    }

    activationCallbacks.splice(0).forEach(callback => {
      try {
        callback(detail);
      } catch (error) {
        console.warn('[Analytics] Activation callback failed.', error);
      }
    });

    window.dispatchEvent(new CustomEvent<AnalyticsActivationDetail>('analytics:activated', {
      detail
    }));
  };

  const scrollThreshold = 150;
  const handleScroll = (): void => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollTop >= scrollThreshold) {
      dispatchActivation('first_scroll');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  cleanupTasks.push(() => window.removeEventListener('scroll', handleScroll));

  // If the user loads partway down the page, fire immediately.
  handleScroll();

  const primaryCTASelector = '[data-cta="primary"], [data-checkout-trigger]';
  const ctas = Array.from(document.querySelectorAll<HTMLElement>(primaryCTASelector));
  const handleCtaClick = (): void => dispatchActivation('cta_click');

  ctas.forEach(cta => {
    cta.addEventListener('click', handleCtaClick, { once: true });
    cleanupTasks.push(() => cta.removeEventListener('click', handleCtaClick));
  });

  fallbackTimerId = window.setTimeout(() => {
    dispatchActivation('timeout_fallback');
  }, ANALYTICS_ACTIVATION_FALLBACK_DELAY_MS);

  cleanupTasks.push(() => {
    if (fallbackTimerId !== undefined) {
      window.clearTimeout(fallbackTimerId);
    }
  });
}

function onAnalyticsActivated(callback: ActivationCallback): void {
  if (latestActivationDetail) {
    try {
      callback(latestActivationDetail);
    } catch (error) {
      console.warn('[Analytics] Activation callback failed post-activation.', error);
    }
    return;
  }

  activationCallbacks.push(callback);
}

/**
 * Main application interface - matches global CafeComVendasApp type
 */
interface CafeComVendasInterface {
  Analytics: {
    track: (event: string, data?: Record<string, unknown>) => void;
    trackError: (type: string, error: Error, context?: Record<string, unknown>) => void;
  };
  components: ComponentRegistration[] | undefined;
  init(): Promise<void>;
  setupGlobalErrorHandling(): void;
  setupGlobalClickHandlers(): void;
  waitForAnalyticsActivation(): Promise<AnalyticsActivationDetail>;
  extractWhatsAppLinkText(link: HTMLAnchorElement): string;
  determineWhatsAppClickLocation(link: HTMLAnchorElement, analyticsEvent?: string | null): string;
  extractUTMParams(url: string): Record<string, string | undefined>;
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
  // Expose Analytics module with compatible interface
  Analytics: {
    track: (event: string, data?: Record<string, unknown>) => {
      withAnalytics(module => {
        module.default.track(event, data);
      });
    },
    trackError: (type: string, error: Error, context?: Record<string, unknown>) => {
      trackAnalyticsError(type, error, context);
    }
  },

  components: undefined,

  /**
   * Initialize all components and functionality with enhanced error handling
   */
  init(): Promise<void> {
    if (state.isInitialized) {
      console.warn('CafeComVendas already initialized');
      return Promise.resolve();
    }

    try {
      const ensureAnalyticsInitialized = async (detail: AnalyticsActivationDetail): Promise<void> => {
        if (analyticsInitializationStarted) {
          return;
        }

        analyticsInitializationStarted = true;

        try {
          const analyticsModule = await loadAnalyticsModule();
          await analyticsModule.initializeAnalytics();

          analyticsInitialized = true;
          flushPendingAnalyticsCallbacks(analyticsModule);

          this.setupGlobalErrorHandling();
        } catch (initError) {
          analyticsInitialized = false;
          analyticsInitializationStarted = false;
          trackAnalyticsError('analytics_initialization_failed', initError as Error, {
            activation_source: detail.source
          });
          console.error('[Analytics] Initialization failed after activation:', initError);
        }
      };

      onAnalyticsActivated(detail => {
        void ensureAnalyticsInitialized(detail);
      });

      // Initialize all components before analytics to avoid blocking UI work
      this.initializeComponents();

      // Setup global click handlers (analytics events will queue until activation)
      this.setupGlobalClickHandlers();

      StateManager.setInitialized(true);

      withAnalytics(module => {
        module.default.page({
          page_title: document.title,
          page_location: window.location.href
        });
      });

      withAnalytics(module => {
        const initEvent: AppInitializedEvent = {
          event: 'app_initialized',
          event_category: 'Application',
          components_count: this.getComponentCount()
        };
        module.default.track('app_initialized', initEvent);
      });

      // Activation guard registers after callbacks so no events are missed
      setupAnalyticsActivation();

    } catch (error) {
      trackAnalyticsError('app_initialization_failed', error as Error);
      console.error('Failed to initialize Café com Vendas:', error);
    }

    return Promise.resolve();
  },

  /**
   * Set up global error handling for better debugging
   */
  setupGlobalErrorHandling(): void {
    withAnalytics(({ AnalyticsHelpers }) => {
      const helpers = AnalyticsHelpers;

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent): void => {
        const reason: unknown = event.reason;
        const errorMessage = reason instanceof Error ? reason.message : String(reason);
        const errorStack = reason instanceof Error ? reason.stack : undefined;

        const errorContext: ErrorContext = {
          message: errorMessage,
          stack: errorStack,
          filename: undefined,
          lineno: undefined,
          colno: undefined,
          component_name: undefined
        };
        helpers.trackError('unhandled_promise_rejection', new Error(errorContext.message), errorContext);
      });

      // Handle JavaScript errors
      window.addEventListener('error', (event: ErrorEvent): void => {
        const error: unknown = event.error;
        const errorStack = error instanceof Error ? error.stack : undefined;
        const errorToPass = error instanceof Error ? error : new Error(event.message);

        const errorContext: ErrorContext = {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: errorStack,
          component_name: undefined
        };
        helpers.trackError('global_javascript_error', errorToPass, errorContext);
      });
    });
  },

  /**
   * Setup global click handlers for analytics tracking
   */
  setupGlobalClickHandlers(): void {
    // Click deduplication state
    const clickDebounce = new Map<string, number>();
    const CLICK_DEBOUNCE_MS = 500; // Prevent rapid double-clicks

    // WhatsApp click tracking - handles all WhatsApp links with optimizations
    document.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href*="whatsapp.com"], a[href*="wa.me"]') as HTMLAnchorElement;
      
      if (link) {
        const linkUrl = link.href;
        const linkId = `${linkUrl}-${link.textContent?.slice(0, 20)}`;
        
        // Prevent rapid double-clicks
        const now = Date.now();
        const lastClick = clickDebounce.get(linkId);
        if (lastClick && (now - lastClick) < CLICK_DEBOUNCE_MS) {
          event.preventDefault();
          return;
        }
        clickDebounce.set(linkId, now);

        // Enhanced link text extraction
        const linkText = this.extractWhatsAppLinkText(link);
        const analyticsEvent = link.getAttribute('data-analytics-event');
        
        // Enhanced location detection with hierarchy
        const location = this.determineWhatsAppClickLocation(link, analyticsEvent);

        // Extract UTM parameters from WhatsApp URL
        const utmParams = this.extractUTMParams(linkUrl);

        // Track WhatsApp click with enhanced data
         
        withAnalytics(({ AnalyticsHelpers }) => {
          AnalyticsHelpers.trackWhatsAppClick(linkUrl, linkText, location, {
            analytics_event: analyticsEvent || 'whatsapp_click',
            click_timestamp: new Date().toISOString(),
            utm_source: utmParams.utm_source,
            utm_medium: utmParams.utm_medium,
            utm_campaign: utmParams.utm_campaign,
            page_location: window.location.href,
            page_referrer: document.referrer,
            page_title: document.title
          });
        });
      }
    }, { passive: true });
  },

  waitForAnalyticsActivation(): Promise<AnalyticsActivationDetail> {
    return analyticsActivationPromise;
  },

  /**
   * Extract meaningful text from WhatsApp link
   */
  extractWhatsAppLinkText(link: HTMLAnchorElement): string {
    // Priority order: explicit text, aria-label, title, generic fallback
    const textContent = link.textContent?.trim();
    const ariaLabel = link.getAttribute('aria-label');
    const title = link.getAttribute('title');
    const spanText = link.querySelector('span')?.textContent?.trim();
    
    return (textContent && textContent.length > 0) ? textContent :
           (ariaLabel && ariaLabel.length > 0) ? ariaLabel :
           (title && title.length > 0) ? title :
           (spanText && spanText.length > 0) ? spanText :
           'WhatsApp Contact';
  },

  /**
   * Determine WhatsApp click location with enhanced hierarchy detection
   */
  determineWhatsAppClickLocation(link: HTMLAnchorElement, analyticsEvent?: string | null): string {
    // First check explicit analytics event mapping
    if (analyticsEvent === 'whatsapp_button_click') {
      return 'floating_button';
    } else if (analyticsEvent === 'click_footer_whatsapp') {
      return 'footer';
    }

    // Check for section hierarchy
    const section = link.closest('[data-section]')?.getAttribute('data-section');
    if (section?.trim()) {
      return section.trim();
    }

    // Check for common parent elements
    if (link.closest('header')) return 'header';
    if (link.closest('footer')) return 'footer';
    if (link.closest('[class*="hero"]')) return 'hero';
    if (link.closest('[class*="cta"]')) return 'cta';
    if (link.closest('[class*="contact"]')) return 'contact';

    // Check by ID patterns
    const elementId = link.id || link.closest('[id]')?.id;
    if (elementId?.includes('whatsapp-button')) return 'floating_button';
    if (elementId?.includes('footer')) return 'footer';

    // Check by class patterns
    const elementClasses = link.className || link.closest('[class]')?.className;
    if (elementClasses?.includes('floating')) return 'floating_button';
    if (elementClasses?.includes('fixed')) return 'floating_button';

    return 'unknown';
  },

  /**
   * Extract UTM parameters from URL
   */
  extractUTMParams(url: string): Record<string, string | undefined> {
    try {
      const urlObj = new URL(url);
      return {
        utm_source: urlObj.searchParams.get('utm_source') || undefined,
        utm_medium: urlObj.searchParams.get('utm_medium') || undefined,
        utm_campaign: urlObj.searchParams.get('utm_campaign') || undefined,
        utm_term: urlObj.searchParams.get('utm_term') || undefined,
        utm_content: urlObj.searchParams.get('utm_content') || undefined
      };
    } catch {
      return {};
    }
  },

  /**
   * Initialize all page components with enhanced error handling
   * Only initialize components whose root selector exists on the page
   */
  initializeComponents(): void {
    // Registry with DOM gating per component
    const registry: { name: string; selector: string; init: () => void }[] = [
      // Utility components (thank-you platform features)
      { name: 'PlatformThankYou', selector: '#thankyou', init: () => PlatformThankYou.init() },

      // Co-located section components (new approach)
      { name: 'TopBanner', selector: '#s-top-banner', init: () => TopBanner.init() },
      { name: 'Hero', selector: '#s-hero', init: () => Hero.init() },
      { name: 'Vision', selector: '#s-vision', init: () => Vision.init() },
      { name: 'Solution', selector: '#s-solution', init: () => Solution.init() },
      { name: 'About', selector: '#s-about', init: () => About.init() },
      { name: 'SocialProof', selector: '#s-social-proof', init: () => SocialProof.init() },
      { name: 'Offer', selector: '#s-offer', init: () => Offer.init() },
      { name: 'FAQ', selector: '#s-faq', init: () => FAQ.init() },
      { name: 'FinalCTA', selector: '#s-final-cta', init: () => FinalCTA.init() },
      // Thank-you specific co-located section logic
      { name: 'ThankYouSection', selector: '#thankyou', init: () => ThankYou.init() },
      // Checkout modal / triggers (only when modal exists on page)
      { name: 'Checkout', selector: '#checkoutModal', init: () => Checkout.init() }
    ];

    let successCount = 0;
    let failureCount = 0;
    const initialized: ComponentRegistration[] = [];

    registry.forEach(({ name, selector, init }) => {
      // Only initialize if the component's root exists
      if (!document.querySelector(selector)) {
        return; // silently skip components not present on this page
      }
      try {
        init();
        successCount++;
        initialized.push({ name, component: { init } });
        StateManager.setComponentStatus(name, true, undefined);
      } catch (error) {
        console.error(`✗ Failed to initialize ${name} component:`, error);
        trackAnalyticsError('component_initialization_failed', error as Error, {
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
      total_components: initialized.length
    };
    withAnalytics(module => {
      module.default.track('components_initialized', componentsEvent);
    });

    this.components = initialized;
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
