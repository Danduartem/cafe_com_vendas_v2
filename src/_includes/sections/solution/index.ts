/**
 * Solution Section Component
 * Handles interactive behaviors for the solution section
 */

import type { Component } from '../../../types/components/base.js';
import { safeQuery } from '../../../assets/js/utils/dom.js';
import { Analytics } from '../../../assets/js/core/analytics.js';

interface SolutionComponent extends Component {
  bindEvents(): void;
}

export const Solution: SolutionComponent = {
  /**
   * Initialize solution section
   */
  init(): void {
    this.bindEvents();
  },

  /**
   * Bind event listeners for solution section interactions
   */
  bindEvents(): void {
    const section = safeQuery('#s-solution');
    if (!section) {
      console.warn('Solution section not found');
      return;
    }

    // Track section visibility
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            Analytics.track('section_view', {
              event: 'section_view',
              event_category: 'Engagement',
              section: 'solution',
              element_type: 'section_entry'
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(section);

    // Track interactions with solution pillars
    const solutionPillars = section.querySelectorAll('[data-solution-pillar]');
    solutionPillars.forEach((pillar, index) => {
      pillar.addEventListener('click', () => {
        Analytics.track('solution_pillar_click', {
          event: 'solution_pillar_click',
          event_category: 'Engagement',
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
        Analytics.track('solution_cta_click', {
          event: 'solution_cta_click',
          event_category: 'Conversion',
          section: 'solution',
          element_type: 'cta_button',
          element_text: button.textContent?.trim() || 'unknown'
        });
      });
    });
  }
};