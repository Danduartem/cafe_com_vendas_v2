/**
 * Lazy analytics helper proxies to avoid eager-loading the analytics bundle.
 * All functions wait for the analytics activation lifecycle before importing
 * the heavy analytics module, then invoke the requested helper or track call.
 */

type AnalyticsModule = typeof import('../analytics/index.js');
type AnalyticsHelpersModule = AnalyticsModule['AnalyticsHelpers'];

type AnalyticsInstance = AnalyticsModule['default'];

interface CafeComVendasGlobal {
  waitForAnalyticsActivation?: () => Promise<unknown>;
}

type AnalyticsWindow = Window & {
  __analyticsActivated?: boolean;
  CafeComVendas?: CafeComVendasGlobal;
};

const analyticsWindow = window as AnalyticsWindow;

let activationPromise: Promise<void> | undefined;
let analyticsModulePromise: Promise<AnalyticsModule> | undefined;
let cachedModule: AnalyticsModule | undefined;

const ACTIVATION_FALLBACK_TIMEOUT_MS = 15000;

function ensureActivation(): Promise<void> {
  if (activationPromise) {
    return activationPromise;
  }

  activationPromise = new Promise(resolve => {
    if (analyticsWindow.__analyticsActivated) {
      resolve();
      return;
    }

    const cafeComVendas = analyticsWindow.CafeComVendas;
    if (cafeComVendas?.waitForAnalyticsActivation) {
      cafeComVendas.waitForAnalyticsActivation()
        .then(() => resolve())
        .catch(() => resolve());
      return;
    }

    const handleActivation = (): void => {
      window.removeEventListener('analytics:activated', handleActivation as EventListener);
      resolve();
    };

    window.addEventListener('analytics:activated', handleActivation as EventListener, { once: true });

    window.setTimeout(() => {
      window.removeEventListener('analytics:activated', handleActivation as EventListener);
      resolve();
    }, ACTIVATION_FALLBACK_TIMEOUT_MS);
  });

  return activationPromise;
}

function loadAnalyticsModule(): Promise<AnalyticsModule> {
  if (cachedModule) {
    return Promise.resolve(cachedModule);
  }

  if (!analyticsModulePromise) {
    analyticsModulePromise = import('../analytics/index.js')
      .then(module => {
        cachedModule = module;
        return module;
      });
  }

  return analyticsModulePromise;
}

function runWithAnalyticsModule(callback: (module: AnalyticsModule) => void): void {
  void (async () => {
    try {
      await ensureActivation();
      const module = await loadAnalyticsModule();
      callback(module);
    } catch (error) {
      console.warn('[Analytics Helpers] Unable to execute analytics callback', error);
    }
  })();
}

function runWithHelpers(callback: (helpers: AnalyticsHelpersModule, instance: AnalyticsInstance) => void): void {
  runWithAnalyticsModule(module => {
    callback(module.AnalyticsHelpers, module.default);
  });
}

export function trackEvent(event: string, data?: Record<string, unknown>): void {
  runWithAnalyticsModule(module => {
    try {
      module.default.track(event, data);
    } catch (error) {
      console.warn('[Analytics Helpers] trackEvent failed', { event, error });
    }
  });
}

export function trackPage(payload?: Record<string, unknown>): void {
  runWithAnalyticsModule(module => {
    try {
      module.default.page(payload ?? {});
    } catch (error) {
      console.warn('[Analytics Helpers] trackPage failed', { error });
    }
  });
}

export function trackIdentify(payload?: Record<string, unknown>): void {
  runWithAnalyticsModule(module => {
    try {
      module.default.identify(payload ?? {});
    } catch (error) {
      console.warn('[Analytics Helpers] trackIdentify failed', { error });
    }
  });
}

export function initSectionTracking(sectionName: string, threshold?: number): void {
  runWithHelpers((helpers) => {
    try {
      helpers.initSectionTracking(sectionName, threshold);
    } catch (error) {
      console.warn('[Analytics Helpers] initSectionTracking failed', { sectionName, error });
    }
  });
}

export function trackCTAClick(location: string, data?: Record<string, unknown>): void {
  runWithHelpers((helpers) => {
    try {
      helpers.trackCTAClick(location, data);
    } catch (error) {
      console.warn('[Analytics Helpers] trackCTAClick failed', { location, error });
    }
  });
}

export function trackConversion(event: string, data: Record<string, unknown>): void {
  runWithHelpers((helpers) => {
    try {
      helpers.trackConversion(event, data);
    } catch (error) {
      console.warn('[Analytics Helpers] trackConversion failed', { event, error });
    }
  });
}

export function trackFAQ(itemNumber: string, isOpen: boolean, question: string): void {
  runWithHelpers((helpers) => {
    try {
      helpers.trackFAQ(itemNumber, isOpen, question);
    } catch (error) {
      console.warn('[Analytics Helpers] trackFAQ failed', { itemNumber, error });
    }
  });
}

export function trackFAQMeaningfulEngagement(toggleCount: number, data?: Record<string, unknown>): void {
  runWithHelpers((helpers) => {
    try {
      helpers.trackFAQMeaningfulEngagement(toggleCount, data);
    } catch (error) {
      console.warn('[Analytics Helpers] trackFAQMeaningfulEngagement failed', { toggleCount, error });
    }
  });
}

export function trackTestimonialSlide(testimonialId: string, position: number, data?: Record<string, unknown>): void {
  runWithHelpers((helpers) => {
    try {
      helpers.trackTestimonialSlide(testimonialId, position, data);
    } catch (error) {
      console.warn('[Analytics Helpers] trackTestimonialSlide failed', { testimonialId, error });
    }
  });
}

export function trackWhatsAppClick(linkUrl: string, linkText: string, location: string, data?: Record<string, unknown>): void {
  runWithHelpers((helpers) => {
    try {
      helpers.trackWhatsAppClick(linkUrl, linkText, location, data);
    } catch (error) {
      console.warn('[Analytics Helpers] trackWhatsAppClick failed', { linkUrl, error });
    }
  });
}

export function trackVideoPlay(videoTitle: string, data?: Record<string, unknown>): void {
  runWithHelpers((helpers) => {
    try {
      helpers.trackVideoPlay(videoTitle, data);
    } catch (error) {
      console.warn('[Analytics Helpers] trackVideoPlay failed', { videoTitle, error });
    }
  });
}

export function trackVideoProgress(videoTitle: string, percentPlayed: number, data?: Record<string, unknown>): void {
  runWithHelpers((helpers) => {
    try {
      helpers.trackVideoProgress(videoTitle, percentPlayed, data);
    } catch (error) {
      console.warn('[Analytics Helpers] trackVideoProgress failed', { videoTitle, error });
    }
  });
}
