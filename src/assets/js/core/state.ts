/**
 * Shared State Management for Café com Vendas
 * Centralized state for the entire application
 */

import { normalizeEventPayload } from '@/utils/gtm-normalizer.js';
import type { AppState, StateManager as StateManagerInterface } from '@/types/state.js';

/**
 * FAQ open times tracking
 */
interface FAQOpenTimes {
  [faqId: string]: number;
}

/**
 * Component status tracking
 */
interface ComponentStatuses {
  [componentName: string]: {
    initialized: boolean;
    error?: Error;
  };
}

/**
 * Internal state structure (matches AppState but with more specific tracking)
 */
interface InternalState {
  faqOpenTimes: FAQOpenTimes;
  faqToggleCount: number;
  isInitialized: boolean;
  isLoading: boolean;
  hasError: boolean;
  currentSection: string | null;
  scrollDepth: number;
  viewport: {
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  };
  components: ComponentStatuses;
}

/**
 * Application state instance
 */
export const state: InternalState = {
  faqOpenTimes: {},
  faqToggleCount: 0,
  isInitialized: false,
  isLoading: false,
  hasError: false,
  currentSection: null,
  scrollDepth: 0,
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024
  },
  components: {}
};

/**
 * State management utilities with full typing
 */
export const StateManager: StateManagerInterface = {
  /**
   * Mark FAQ as opened for engagement tracking
   */
  markFAQOpened(faqId: string): void {
    state.faqOpenTimes[faqId] = Date.now();
    state.faqToggleCount++;

    // Check for meaningful engagement (3+ toggles)
    if (state.faqToggleCount === 3) {
      // Push meaningful engagement event to dataLayer
      window.dataLayer = window.dataLayer || [];
      const engagementPayload = normalizeEventPayload({
        event: 'faq_meaningful_engagement',
        engagement_type: 'faq_meaningful',
        toggle_count: 3
      });
      window.dataLayer.push(engagementPayload);
    }
  },

  /**
   * Get FAQ open duration and cleanup
   */
  getFAQEngagementTime(faqId: string): number {
    const openTime = state.faqOpenTimes[faqId];
    if (openTime) {
      const engagementTime = Date.now() - openTime;
      delete state.faqOpenTimes[faqId];
      return Math.round(engagementTime / 1000);
    }
    return 0;
  },

  /**
   * Mark application as initialized
   */
  setInitialized(initialized: boolean = true): void {
    state.isInitialized = initialized;
  },

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    state.isLoading = loading;
  },

  /**
   * Set error state
   */
  setError(hasError: boolean): void {
    state.hasError = hasError;
  },

  /**
   * Set current active section
   */
  setCurrentSection(section: string | null): void {
    state.currentSection = section;
  },

  /**
   * Update scroll depth
   */
  setScrollDepth(depth: number): void {
    state.scrollDepth = Math.max(0, Math.min(100, depth));
  },

  /**
   * Update viewport dimensions and breakpoint flags
   */
  updateViewport(width: number, height: number): void {
    state.viewport = {
      width,
      height,
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024
    };
  },

  /**
   * Set component initialization status
   */
  setComponentStatus(name: string, initialized: boolean, error?: Error): void {
    state.components[name] = {
      initialized,
      error
    };
  },

  /**
   * Get current state snapshot for debugging
   */
  getSnapshot(): AppState {
    return { ...state };
  },

  /**
   * Get current state (alias for getSnapshot)
   */
  getState(): AppState {
    return this.getSnapshot();
  },

  /**
   * Subscribe to state changes (basic implementation)
   * For more complex state management, consider using a library like Zustand
   */
  subscribe(callback: (state: AppState) => void): () => void {
    // Simple implementation - in a real app you might want a more sophisticated system
    const interval = setInterval(() => {
      callback(this.getSnapshot());
    }, 1000);

    // Return unsubscribe function
    return () => clearInterval(interval);
  }
};

/**
 * Initialize viewport tracking
 */
window.addEventListener('resize', () => {
  StateManager.updateViewport(window.innerWidth, window.innerHeight);
});

/**
 * Initialize scroll tracking
 */
window.addEventListener('scroll', () => {
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

  if (documentHeight > windowHeight) {
    const scrollPercent = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
    StateManager.setScrollDepth(scrollPercent);
  }
}, { passive: true });