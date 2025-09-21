/**
 * Section Tracking Plugin
 * Modern IntersectionObserver-based section visibility tracking
 * Provides GA4-compliant section view events with viewport detection
 */

import { pluginDebugLog } from '../utils/debug.js';
import type { PluginFactory, SectionTrackingPayload, AnalyticsInstance } from '../types/index.js';

interface SectionTrackingPluginConfig extends Record<string, unknown> {
  threshold?: number;
  rootMargin?: string;
  debug?: boolean;
}

/**
 * Section Tracking Plugin - handles section view events
 */
const isAnalyticsActivated = (): boolean => Boolean((window as unknown as { __analyticsActivated?: boolean }).__analyticsActivated);

export const sectionTrackingPlugin: PluginFactory<SectionTrackingPluginConfig> = (config = {}) => {
  const {
    threshold = 0.5,
    rootMargin = '0px',
    debug = false
  } = config;

  // Track which sections have already been viewed
  const viewedSections = new Set<string>();
  let analyticsInstance: AnalyticsInstance | null = null;
  let activated = false;
  const pendingSections = new Map<string, number>();

  const activationHandler = (): void => {
    if (activated) {
      return;
    }
    activated = true;

    // Drain any queued sections now that analytics is permitted
    for (const [sectionName, customThreshold] of pendingSections) {
      pendingSections.delete(sectionName);
      initializeSectionObserver(sectionName, customThreshold ?? threshold);
    }
  };

  const initializeSectionObserver = (sectionName: string, customThreshold: number): void => {
    const section = document.querySelector(`#s-${sectionName}`);
    if (!section) {
      pluginDebugLog(debug, `[Section Tracking Plugin] Section #s-${sectionName} not found`);
      return;
    }

    if (viewedSections.has(sectionName)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !viewedSections.has(sectionName)) {
            const sectionViewPayload: SectionTrackingPayload = {
              section_name: sectionName,
              section_id: `s-${sectionName}`,
              percent_visible: Math.round(entry.intersectionRatio * 100),
              timestamp: new Date().toISOString()
            };

            if (analyticsInstance) {
              analyticsInstance.track('section_view', sectionViewPayload);
              pluginDebugLog(debug, '[Section Tracking Plugin] Section view tracked:', sectionViewPayload);
            }

            viewedSections.add(sectionName);
            observer.unobserve(entry.target);

            pluginDebugLog(debug, `[Section Tracking Plugin] Section viewed: ${sectionName}`);
          }
        });
      },
      {
        threshold: customThreshold,
        rootMargin
      }
    );

    observer.observe(section);

    pluginDebugLog(debug, `[Section Tracking Plugin] Started tracking section: ${sectionName}`);
  };

  return {
    name: 'section-tracking',

    initialize(context) {
      // Store analytics instance reference for methods
      analyticsInstance = context?.instance;
      pluginDebugLog(debug, '[Section Tracking Plugin] Initialized with threshold:', threshold);

      if (isAnalyticsActivated()) {
        activationHandler();
      } else {
        window.addEventListener('analytics:activated', activationHandler, { once: true });
      }
    },

    methods: {
      /**
       * Initialize section view tracking with IntersectionObserver
       * Best practice implementation following GA4 2025 guidelines
       * Combined from both systems
       */
      initSectionTracking(sectionName: string, customThreshold: number = threshold) {
        if (viewedSections.has(sectionName)) {
          return;
        }

        if (!activated) {
          pendingSections.set(sectionName, customThreshold);
          pluginDebugLog(debug, '[Section Tracking Plugin] Section queued until activation:', sectionName);
          return;
        }

        initializeSectionObserver(sectionName, customThreshold);
      },

      /**
       * Track section views with standardized GA4-compliant structure
       */
      trackSectionView(sectionName: string, data?: Record<string, unknown>) {
        if (!analyticsInstance) {
          console.error('[Section Tracking Plugin] Analytics instance not available');
          return;
        }

        // Standardized section view event following GA4 best practices
        const sectionViewPayload: SectionTrackingPayload = {
          section_name: sectionName,
          section_id: `s-${sectionName}`,
          percent_visible: 50, // default threshold
          timestamp: new Date().toISOString(),
          ...data
        };

        analyticsInstance.track('section_view', sectionViewPayload);

        pluginDebugLog(debug, '[Section Tracking Plugin] Section view tracked:', sectionViewPayload);
      },

      /**
       * Reset section tracking (useful for SPAs or testing)
       */
      resetSectionTracking() {
        viewedSections.clear();
        pendingSections.clear();
        
        pluginDebugLog(debug, '[Section Tracking Plugin] Section tracking reset');
      },

      /**
       * Get list of viewed sections
       */
      getViewedSections() {
        return Array.from(viewedSections);
      },

      /**
       * Check if a section has been viewed
       */
      hasViewedSection(sectionName: string) {
        return viewedSections.has(sectionName);
      }
    },

    config
  };
};
