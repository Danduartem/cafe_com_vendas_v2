/**
 * FAQ Section Component for Café com Vendas
 * Co-located with template and schema
 * Handles FAQ accordion interactions using platform components
 */

import { PlatformAccordion } from '../../../components/ui';
import { safeQuery } from '../../../utils/dom.js';
import { logger } from '../../../utils/logger.js';
import type { Component } from '../../../types/components/base.js';

interface FAQSectionComponent extends Component {
  initializeFAQ(): void;
  setupSectionAnalytics(): void;
}

export const FAQ: FAQSectionComponent = {
  init(): void {
    try {
      this.initializeFAQ();
      this.setupSectionAnalytics();
    } catch (error) {
      console.error('Error initializing FAQ section:', error);
    }
  },

  initializeFAQ(): void {
    PlatformAccordion.createFAQ({
      containerSelector: '[data-faq-container]',
      itemSelector: 'details[data-faq-item]',
      revealAnimation: true,
      trackAnalytics: true
    });
  },

  setupSectionAnalytics(): void {
    const section = safeQuery('#s-faq');
    if (!section) return;

    // Track section visibility using platform analytics
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            import('../../../components/ui/analytics').then(({ PlatformAnalytics }) => {
              PlatformAnalytics.track('section_engagement', {
                section: 'faq',
                action: 'section_view'
              });
            }).catch(() => {
              logger.debug('FAQ section view analytics tracking unavailable');
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(section);
  }
};