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

type AnalyticsActivationSource = 'first_scroll' | 'cta_click' | 'pointer_interaction' | 'timeout_fallback';

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

const ANALYTICS_ACTIVATION_FALLBACK_DELAY_MS = 10000; // 10s safety net instead of immediate timeout

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

type HeartbeatTrigger = 'scroll' | 'pointer' | 'cta';

let notifyEngagementInteraction: ((trigger: HeartbeatTrigger) => void) | undefined;
let requestAnalyticsActivation: ((source: AnalyticsActivationSource) => void) | undefined;

function setupAnalyticsActivation(): void {
  if (analyticsActivationSetup) {
    return;
  }
  analyticsActivationSetup = true;

  const dataLayerWindow = window as unknown as { dataLayer?: Record<string, unknown>[] };
  dataLayerWindow.dataLayer = dataLayerWindow.dataLayer || [];
  const dataLayer = dataLayerWindow.dataLayer;
  const analyticsWindow = window as typeof window & { __preActivationPageViewSent?: boolean };

  let activated = false;
  let fallbackTimerId: number | undefined;
  const activationCleanups: (() => void)[] = [];
  const engagementCleanups: (() => void)[] = [];

  const HEARTBEAT_DELAY_MS = 1000;
  const SCROLL_ACTIVATION_THRESHOLD_PX = 150;
  const sessionStart = performance.now();

  const sessionState: {
    pageViewSent: boolean;
    pageLoadedSent: boolean;
    heartbeatSent: boolean;
    heartbeatTimerId?: number;
    maxScrollPercent: number;
    pointerInteraction: boolean;
    scrollInteraction: boolean;
    lastTrigger?: HeartbeatTrigger;
  } = {
    pageViewSent: false,
    pageLoadedSent: false,
    heartbeatSent: false,
    heartbeatTimerId: undefined,
    maxScrollPercent: 0,
    pointerInteraction: false,
    scrollInteraction: false,
    lastTrigger: undefined
  };

  const pushDataLayerEvent = (eventName: string, payload: Record<string, unknown>) => {
    dataLayer.push(normalizeEventPayload({
      event: eventName,
      ...payload
    }));
  };

  const getNavigationMetrics = () => {
    let navigationEntry: PerformanceNavigationTiming | undefined;
    if (typeof performance.getEntriesByType === 'function') {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        navigationEntry = navigationEntries[0] as PerformanceNavigationTiming;
      }
    }

    const legacyTiming = (performance as Performance & { timing?: PerformanceTiming }).timing;
    let loadTimeMs: number | undefined;
    let domContentLoadedMs: number | undefined;

    if (navigationEntry) {
      if (navigationEntry.loadEventEnd && Number.isFinite(navigationEntry.loadEventEnd)) {
        loadTimeMs = Math.round(navigationEntry.loadEventEnd);
      }
      if (navigationEntry.domContentLoadedEventEnd && Number.isFinite(navigationEntry.domContentLoadedEventEnd)) {
        domContentLoadedMs = Math.round(navigationEntry.domContentLoadedEventEnd);
      }
    } else if (legacyTiming) {
      if (legacyTiming.loadEventEnd) {
        loadTimeMs = Math.round(legacyTiming.loadEventEnd - legacyTiming.fetchStart);
      }
      if (legacyTiming.domContentLoadedEventEnd) {
        domContentLoadedMs = Math.round(legacyTiming.domContentLoadedEventEnd - legacyTiming.fetchStart);
      }
    }

    return { loadTimeMs, domContentLoadedMs };
  };

  const buildPageContext = (): Record<string, unknown> => ({
    page_location: window.location.href,
    page_title: document.title,
    load_timestamp: new Date().toISOString(),
    pre_activation: !activated
  });

  const recordInitialPageView = (): void => {
    if (sessionState.pageViewSent) {
      return;
    }
    sessionState.pageViewSent = true;

    const context = buildPageContext();
    const { domContentLoadedMs } = getNavigationMetrics();

    if (domContentLoadedMs !== undefined) {
      context['dom_content_loaded_ms'] = domContentLoadedMs;
    }

    pushDataLayerEvent('page_view', {
      ...context,
      load_state: 'dom_ready'
    });

    analyticsWindow.__preActivationPageViewSent = true;

    withAnalytics(module => {
      module.default.page({
        ...context,
        load_state: 'dom_ready',
        pre_activation_recorded: true
      });
    });
  };

  const recordPageLoaded = (): void => {
    if (sessionState.pageLoadedSent) {
      return;
    }
    sessionState.pageLoadedSent = true;

    const context = buildPageContext();
    const { loadTimeMs, domContentLoadedMs } = getNavigationMetrics();

    if (domContentLoadedMs !== undefined) {
      context['dom_content_loaded_ms'] = domContentLoadedMs;
    }

    if (loadTimeMs !== undefined) {
      context['load_time_ms'] = loadTimeMs;
    }

    pushDataLayerEvent('page_loaded', {
      ...context,
      activation_state: activated ? 'activated' : 'pending'
    });

    withAnalytics(module => {
      module.default.track('page_loaded', {
        ...context,
        event_category: 'Performance',
        event_label: 'Page Fully Loaded',
        skip_data_layer: true
      });
    });
  };

  const computeScrollPercent = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const docHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    if (docHeight === 0) {
      return 100;
    }
    return Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
  };

  const stopHeartbeatTimer = () => {
    if (sessionState.heartbeatTimerId !== undefined) {
      window.clearTimeout(sessionState.heartbeatTimerId);
      sessionState.heartbeatTimerId = undefined;
    }
  };

  const recordUserEngaged = (trigger: HeartbeatTrigger): void => {
    if (sessionState.heartbeatSent) {
      return;
    }
    sessionState.heartbeatSent = true;
    sessionState.lastTrigger = trigger;
    stopHeartbeatTimer();

    sessionState.maxScrollPercent = Math.round(Math.max(sessionState.maxScrollPercent, computeScrollPercent()));

    const engagementSourceMap: Record<HeartbeatTrigger, AnalyticsActivationSource> = {
      scroll: 'first_scroll',
      pointer: 'pointer_interaction',
      cta: 'cta_click'
    };

    if (!activated) {
      dispatchActivation(engagementSourceMap[trigger]);
    }

    const timeOnPageMs = Math.round(performance.now() - sessionStart);

    const payload = {
      engagement_trigger: trigger,
      time_on_page_ms: timeOnPageMs,
      max_scroll_percent: sessionState.maxScrollPercent,
      pointer_interaction: sessionState.pointerInteraction,
      scroll_interaction: sessionState.scrollInteraction,
      page_location: window.location.href,
      page_title: document.title
    };

    pushDataLayerEvent('user_engaged', payload);

    withAnalytics(module => {
      module.default.track('user_engaged', {
        ...payload,
        skip_data_layer: true
      });
    });

    engagementCleanups.forEach(task => {
      try {
        task();
      } catch {
        // noop
      }
    });
    engagementCleanups.length = 0;
    notifyEngagementInteraction = undefined;
  };

  const scheduleHeartbeat = (trigger: HeartbeatTrigger): void => {
    sessionState.lastTrigger = trigger;

    if (trigger === 'scroll') {
      sessionState.scrollInteraction = true;
    } else {
      sessionState.pointerInteraction = true;
    }

    if (sessionState.heartbeatSent) {
      return;
    }

    const elapsed = performance.now() - sessionStart;

    if (elapsed >= HEARTBEAT_DELAY_MS) {
      recordUserEngaged(trigger);
      return;
    }

    stopHeartbeatTimer();
    sessionState.heartbeatTimerId = window.setTimeout(() => {
      recordUserEngaged(trigger);
    }, HEARTBEAT_DELAY_MS - elapsed);
  };

  notifyEngagementInteraction = scheduleHeartbeat;

  const pointerHandler = (): void => {
    scheduleHeartbeat('pointer');
    dispatchActivation('pointer_interaction');
  };

  window.addEventListener('pointerdown', pointerHandler, { passive: true });
  engagementCleanups.push(() => window.removeEventListener('pointerdown', pointerHandler));

  const scrollHandler = (): void => {
    const percent = computeScrollPercent();
    sessionState.maxScrollPercent = Math.max(sessionState.maxScrollPercent, Math.round(percent));

    if (percent >= 1 && !sessionState.scrollInteraction) {
      sessionState.scrollInteraction = true;
      scheduleHeartbeat('scroll');
    }

    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (!activated && scrollTop >= SCROLL_ACTIVATION_THRESHOLD_PX) {
      dispatchActivation('first_scroll');
    }
  };

  window.addEventListener('scroll', scrollHandler, { passive: true });
  engagementCleanups.push(() => window.removeEventListener('scroll', scrollHandler));
  scrollHandler();

  const ctaInteractionHandler = (event: Event): void => {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    const cta = target.closest<HTMLElement>('[data-checkout-trigger], [data-cta], [data-analytics-cta]');
    if (!cta) {
      return;
    }

    scheduleHeartbeat('cta');
    dispatchActivation('cta_click');
  };

  document.addEventListener('click', ctaInteractionHandler, { passive: true });
  engagementCleanups.push(() => document.removeEventListener('click', ctaInteractionHandler));

  const scheduleInitialPageView = (): void => {
    queueMicrotask(() => recordInitialPageView());
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    scheduleInitialPageView();
  } else {
    document.addEventListener('DOMContentLoaded', scheduleInitialPageView, { once: true });
  }

  if (document.readyState === 'complete') {
    queueMicrotask(() => recordPageLoaded());
  } else {
    window.addEventListener('load', recordPageLoaded, { once: true });
  }

  const dispatchActivation = (source: AnalyticsActivationSource): void => {
    if (activated) {
      return;
    }
    activated = true;

    activationCleanups.forEach(task => {
      try {
        task();
      } catch {
        // noop
      }
    });
    activationCleanups.length = 0;

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

  fallbackTimerId = window.setTimeout(() => {
    dispatchActivation('timeout_fallback');
  }, ANALYTICS_ACTIVATION_FALLBACK_DELAY_MS);

  activationCleanups.push(() => {
    if (fallbackTimerId !== undefined) {
      window.clearTimeout(fallbackTimerId);
      fallbackTimerId = undefined;
    }
  });

  activationCleanups.push(() => {
    requestAnalyticsActivation = undefined;
  });

  requestAnalyticsActivation = dispatchActivation;
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
      const ensureAnalyticsInitialized = async (detail?: AnalyticsActivationDetail): Promise<void> => {
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
          const errorContext = detail ? { activation_source: detail.source } : undefined;
          trackAnalyticsError('analytics_initialization_failed', initError as Error, errorContext);
          console.error('[Analytics] Initialization failed:', initError);
        }
      };

      void ensureAnalyticsInitialized();

      onAnalyticsActivated(detail => {
        void ensureAnalyticsInitialized(detail);
      });

      // Initialize all components before analytics to avoid blocking UI work
      this.initializeComponents();

      // Setup global click handlers (analytics events will queue until activation)
      this.setupGlobalClickHandlers();

      StateManager.setInitialized(true);

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
        notifyEngagementInteraction?.('cta');
        requestAnalyticsActivation?.('cta_click');

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
