/**
 * Solution Section - Interactive Functionality
 *
 * Handles pillar interactions and checkout triggers for the solution section.
 */

import { safeQuery, safeQueryAll } from '@/utils/dom.js';

export const solutionSection = {
  /**
   * Initialize the solution section
   */
  init(): void {
    this.bindEvents();
    this.setupAnalytics();
  },

  /**
   * Bind event listeners
   */
  bindEvents(): void {
    const section = safeQuery('#s-solution');
    if (!section) return;

    // Track CTA button clicks
    const ctaButton = safeQuery('[data-checkout-trigger]', section);
    if (ctaButton) {
      ctaButton.addEventListener('click', this.handleCtaClick.bind(this));
    }

    // Track pillar card interactions
    const pillarCards = safeQueryAll('[data-analytics-event]', section);
    pillarCards.forEach(card => {
      card.addEventListener('mouseenter', this.handlePillarHover.bind(this));
      card.addEventListener('click', this.handlePillarClick.bind(this));
    });
  },

  /**
   * Setup analytics tracking
   */
  setupAnalytics(): void {
    const section = safeQuery('#s-solution');
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
      gtag('event', 'solution_section_view', {
        event_category: 'engagement',
        event_label: 'solution'
      });
    }
  },

  /**
   * Handle CTA button clicks
   */
  handleCtaClick(event: Event): void {
    const target = event.target as HTMLElement;
    const button = target.closest('[data-checkout-trigger]');

    if (button && typeof gtag !== 'undefined') {
      gtag('event', 'click_solution_cta', {
        event_category: 'conversion',
        event_label: 'solution_to_checkout'
      });
    }
  },

  /**
   * Handle pillar card hover
   */
  handlePillarHover(event: Event): void {
    const target = event.target as HTMLElement;
    const card = target.closest('[data-analytics-event]');

    if (card && card instanceof HTMLElement) {
      const eventName = card.dataset.analyticsEvent;

      if (eventName && typeof gtag !== 'undefined') {
        gtag('event', 'pillar_hover', {
          event_category: 'engagement',
          event_label: eventName
        });
      }
    }
  },

  /**
   * Handle pillar card clicks
   */
  handlePillarClick(event: Event): void {
    const target = event.target as HTMLElement;
    const card = target.closest('[data-analytics-event]');

    if (card && card instanceof HTMLElement) {
      const eventName = card.dataset.analyticsEvent;

      if (eventName && typeof gtag !== 'undefined') {
        gtag('event', 'pillar_click', {
          event_category: 'interaction',
          event_label: eventName
        });
      }
    }
  }
};