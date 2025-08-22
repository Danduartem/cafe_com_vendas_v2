/**
 * Problem Section Component
 * Handles interactive behaviors for the problem section
 */

import type { Component } from '../../../assets/js/types/component.js';
import { safeQuery } from '../../../platform/lib/utils/dom.js';
import { Analytics } from '../../../assets/js/core/analytics.js';

interface ProblemComponent extends Component {
  bindEvents(): void;
}

export const Problem: ProblemComponent = {
  /**
   * Initialize problem section
   */
  init(): void {
    this.bindEvents();
  },

  /**
   * Bind event listeners for problem section interactions
   */
  bindEvents(): void {
    const section = safeQuery('#s-problem');
    if (!section) {
      console.warn('Problem section not found');
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
              section: 'problem',
              element_type: 'section_entry'
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(section);

    // Track interactions with problem points
    const problemPoints = section.querySelectorAll('[data-problem-point]');
    problemPoints.forEach((point) => {
      point.addEventListener('click', () => {
        Analytics.track('problem_point_click', {
          event: 'problem_point_click',
          event_category: 'Engagement',
          section: 'problem',
          element_type: 'problem_point',
          element_text: point.textContent?.trim().substring(0, 50) || 'unknown'
        });
      });
    });
  }
};