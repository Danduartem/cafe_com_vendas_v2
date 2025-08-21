/**
 * Problem Section - Interactive Functionality
 * 
 * Handles interactive elements for the problem validation section.
 */

import { safeQuery, safeQueryAll } from '@/utils/dom.js';

export const problemSection = {
  /**
   * Initialize the problem section
   */
  init(): void {
    this.bindEvents();
    this.setupAnalytics();
  },

  /**
   * Bind event listeners
   */
  bindEvents(): void {
    const section = safeQuery('#s-problem');
    if (!section) return;

    // Track CTA clicks
    const ctaButton = safeQuery('[data-analytics-event="click_problem_cta"]', section);
    if (ctaButton) {
      ctaButton.addEventListener('click', this.handleCtaClick.bind(this));
    }

    // Add hover effects for pain point list items
    const listItems = safeQueryAll('li[tabindex="0"]', section);
    listItems.forEach(item => {
      item.addEventListener('mouseenter', this.handlePainPointHover.bind(this));
    });
  },

  /**
   * Setup analytics tracking
   */
  setupAnalytics(): void {
    const section = safeQuery('#s-problem');
    if (!section) return;

    // Track section visibility
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.trackSectionView();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(section);
  },

  /**
   * Track section view
   */
  trackSectionView(): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'problem_section_view', {
        event_category: 'engagement',
        event_label: 'problem',
      });
    }
  },

  /**
   * Handle CTA button clicks
   */
  handleCtaClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    if (typeof gtag !== 'undefined') {
      gtag('event', 'click_problem_cta', {
        event_category: 'engagement',
        event_label: 'problem_to_solution',
      });
    }
  },

  /**
   * Handle pain point item hover
   */
  handlePainPointHover(event: Event): void {
    const target = event.target as HTMLElement;
    const listItem = target.closest('li');
    
    if (listItem && typeof gtag !== 'undefined') {
      gtag('event', 'pain_point_hover', {
        event_category: 'engagement',
        event_label: 'problem_pain_point',
      });
    }
  }
};