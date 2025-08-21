/**
 * Top Banner Section - Interactive Functionality
 *
 * Handles the sticky banner with urgency messaging and event countdown.
 */

import { safeQuery } from '@/utils/dom.js';

export const topBannerSection = {
  /**
   * Initialize the top-banner section
   */
  init(): void {
    this.setupAnalytics();
  },

  /**
   * Setup analytics tracking
   */
  setupAnalytics(): void {
    const section = safeQuery('#s-top-banner');
    if (!section) return;

    // Track section visibility (always visible due to fixed positioning)
    this.trackSectionView();
  },

  /**
   * Track section view
   */
  trackSectionView(): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'top_banner_section_view', {
        event_category: 'engagement',
        event_label: 'top-banner'
      });
    }
  }
};