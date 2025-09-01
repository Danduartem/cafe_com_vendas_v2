/**
 * Section Tracking Plugin
 * Combines section tracking from both PlatformAnalytics and Analytics systems
 * Uses IntersectionObserver for efficient section visibility tracking
 */

import type { PluginFactory, SectionTrackingPayload } from '../types/index.js';

interface SectionTrackingPluginConfig {
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

  return {
    name: 'section-tracking',

    initialize() {
      if (debug) {
        console.log('[Section Tracking Plugin] Initialized with threshold:', threshold);
      }
    },

    methods: {
      /**
       * Initialize section view tracking with IntersectionObserver
       * Best practice implementation following GA4 2025 guidelines
       * Combined from both systems
       */
      initSectionTracking(sectionName: string, customThreshold = threshold) {
        const section = document.querySelector(`#s-${sectionName}`);
        if (!section) {
          console.warn(`[Section Tracking Plugin] Section #s-${sectionName} not found`);
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
                this.trackSectionView(sectionName, {
                  percent_visible: Math.round(entry.intersectionRatio * 100)
                });
                
                // Mark as viewed and unobserve (fire once per session)
                viewedSections.add(sectionName);
                observer.unobserve(entry.target);

                if (debug) {
                  console.log(`[Section Tracking Plugin] Section viewed: ${sectionName}`);
                }
              }
            });
          },
          { 
            threshold: customThreshold,
            rootMargin 
          }
        );

        observer.observe(section);

        if (debug) {
          console.log(`[Section Tracking Plugin] Started tracking section: ${sectionName}`);
        }
      },

      /**
       * Track section views with standardized GA4-compliant structure
       * Combined from both PlatformAnalytics and Analytics approaches
       */
      trackSectionView(sectionName: string, data?: Record<string, unknown>) {
        // Get analytics instance from plugin context
        const instance = arguments[arguments.length - 1]; // Instance is injected as last argument
        
        if (!instance) {
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

        instance.track('section_view', sectionViewPayload);

        // Legacy compatibility - fire specific testimonials event if needed
        if (sectionName === 'testimonials' || sectionName === 'social-proof') {
          instance.track('view_testimonials_section', {
            section_name: sectionName,
            timestamp: new Date().toISOString(),
            ...data
          });
        }

        if (debug) {
          console.log('[Section Tracking Plugin] Section view tracked:', sectionViewPayload);
        }
      },

      /**
       * Track section engagement (user interactions within sections)
       */
      trackSectionEngagement(sectionName: string, action: string, data?: Record<string, unknown>) {
        const instance = arguments[arguments.length - 1]; // Instance is injected as last argument
        
        instance.track('section_engagement', {
          section: sectionName,
          element_type: action,
          timestamp: new Date().toISOString(),
          ...data
        });

        if (debug) {
          console.log('[Section Tracking Plugin] Section engagement tracked:', { sectionName, action, data });
        }
      },

      /**
       * Reset section tracking (useful for SPAs or testing)
       */
      resetSectionTracking() {
        viewedSections.clear();
        
        if (debug) {
          console.log('[Section Tracking Plugin] Section tracking reset');
        }
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