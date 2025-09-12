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
export const sectionTrackingPlugin: PluginFactory<SectionTrackingPluginConfig> = (config = {}) => {
  const {
    threshold = 0.5,
    rootMargin = '0px',
    debug = false
  } = config;

  // Track which sections have already been viewed
  const viewedSections = new Set<string>();
  let analyticsInstance: AnalyticsInstance | null = null;

  return {
    name: 'section-tracking',

    initialize(context) {
      // Store analytics instance reference for methods
      analyticsInstance = context?.instance;
      pluginDebugLog(debug, '[Section Tracking Plugin] Initialized with threshold:', threshold);
    },

    methods: {
      /**
       * Initialize section view tracking with IntersectionObserver
       * Best practice implementation following GA4 2025 guidelines
       * Combined from both systems
       */
      initSectionTracking(sectionName: string, customThreshold: number = threshold) {
        const section = document.querySelector(`#s-${sectionName}`);
        if (!section) {
          pluginDebugLog(debug, `[Section Tracking Plugin] Section #s-${sectionName} not found`);
          return;
        }

        // Skip if already tracking this section
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
                
                // Mark as viewed and unobserve (fire once per session)
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
       * Track section engagement (user interactions within sections)
       */
      trackSectionEngagement(sectionName: string, action: string, data?: Record<string, unknown>) {
        if (!analyticsInstance) {
          console.error('[Section Tracking Plugin] Analytics instance not available');
          return;
        }
        
        analyticsInstance.track('section_engagement', {
          section: sectionName,
          element_type: action,
          timestamp: new Date().toISOString(),
          ...data
        });

        pluginDebugLog(debug, '[Section Tracking Plugin] Section engagement tracked:', { sectionName, action, data });
      },

      /**
       * Reset section tracking (useful for SPAs or testing)
       */
      resetSectionTracking() {
        viewedSections.clear();
        
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
