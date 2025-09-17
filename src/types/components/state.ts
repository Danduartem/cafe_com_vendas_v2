/**
 * Application state interface
 */
export interface AppState {
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
  components: Record<string, {
      initialized: boolean;
      error: Error | undefined;
    }>;
}

/**
 * State manager interface
 */
export interface StateManager {
  getState(): AppState;
  getSnapshot(): AppState;
  setInitialized(value: boolean): void;
  setLoading(value: boolean): void;
  setError(value: boolean): void;
  setCurrentSection(section: string | null): void;
  setScrollDepth(depth: number): void;
  updateViewport(width: number, height: number): void;
  setComponentStatus(name: string, initialized: boolean, error: Error | undefined): void;

  // FAQ-specific methods
  markFAQOpened(faqId: string): void;
  getFAQEngagementTime(faqId: string): number;
}


/**
 * Viewport change event
 */
export interface ViewportChangeEvent {
  type: 'viewport_change';
  viewport: AppState['viewport'];
  timestamp: number;
}
