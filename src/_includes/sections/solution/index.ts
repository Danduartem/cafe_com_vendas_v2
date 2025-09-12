/**
 * Solution Section Component
 * Handles interactive behaviors for the solution section
 */

import type { Component } from '../../../types/components/base.js';
import { safeQuery } from '../../../utils/dom.js';
import analytics, { AnalyticsHelpers } from '../../../analytics/index.js';

interface SolutionComponent extends Component {
  bindEvents(): void;
  initSectionTracking(): void;
}

export const Solution: SolutionComponent = {
  /**
   * Initialize solution section
   */
  init(): void {
    this.bindEvents();
    this.initSectionTracking();
  },

  /**
   * Initialize section view tracking using standardized approach
   */
  initSectionTracking(): void {
    // Lower threshold to 30% visibility to ensure firing on tall sections
    AnalyticsHelpers.initSectionTracking('solution', 0.3);
  },

  /**
   * Bind event listeners for solution section interactions
   */
  bindEvents(): void {
    const section = safeQuery('#s-solution');
    if (!section) {
      return;
    }

    // Track interactions with solution pillars
    const solutionPillars = section.querySelectorAll('[data-solution-pillar]');
    solutionPillars.forEach((pillar, index) => {
      pillar.addEventListener('click', () => {
        analytics.track('solution_pillar_click', {
          section: 'solution',
          element_type: 'solution_pillar',
          pillar_number: index + 1,
          element_text: pillar.textContent?.trim().substring(0, 50) || 'unknown'
        });
      });
    });

    // Track CTA clicks within solution section
    const ctaButtons = section.querySelectorAll('[data-cta-button]');
    ctaButtons.forEach((button) => {
      button.addEventListener('click', () => {
        analytics.track('solution_cta_click', {
          section: 'solution',
          element_type: 'cta_button',
          element_text: button.textContent?.trim() || 'unknown'
        });
      });
    });
  }
};
