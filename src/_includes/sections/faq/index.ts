/**
 * FAQ Section - Interactive Functionality
 *
 * Handles FAQ accordion interactions and analytics tracking.
 */

import { safeQuery, safeQueryAll } from '@/utils/dom.js';

export const faqSection = {
  /**
   * Initialize the FAQ section
   */
  init(): void {
    this.bindEvents();
    this.setupAnalytics();
  },

  /**
   * Bind event listeners
   */
  bindEvents(): void {
    const section = safeQuery('#s-faq');
    if (!section) return;

    // Track FAQ item interactions
    const faqItems = safeQueryAll('details[data-faq-item]', section);
    faqItems.forEach(item => {
      item.addEventListener('toggle', this.handleFaqToggle.bind(this));
    });
  },

  /**
   * Setup analytics tracking
   */
  setupAnalytics(): void {
    const section = safeQuery('#s-faq');
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
      gtag('event', 'faq_section_view', {
        event_category: 'engagement',
        event_label: 'faq'
      });
    }
  },

  /**
   * Handle FAQ item toggle
   */
  handleFaqToggle(event: Event): void {
    const target = event.target as HTMLDetailsElement;
    const faqNumber = target.dataset.faqItem;
    const analyticsEvent = target.dataset.analyticsEvent;

    if (typeof gtag !== 'undefined') {
      gtag('event', target.open ? 'faq_open' : 'faq_close', {
        event_category: 'engagement',
        event_label: analyticsEvent ?? `faq_${faqNumber}`
      });
    }
  }
};