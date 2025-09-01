/**
 * FAQ Section Component for Café com Vendas
 * Co-located with template and schema
 * Handles FAQ accordion interactions using platform components
 */

import { PlatformAccordion } from '../../../components/ui/index.js';
import { AnalyticsHelpers } from '../../../analytics/index.js';
import type { Component } from '../../../types/components/base.js';

interface FAQSectionComponent extends Component {
  initializeFAQ(): void;
  setupSectionAnalytics(): void;
  initSectionTracking(): void;
}

export const FAQ: FAQSectionComponent = {
  init(): void {
    try {
      this.initializeFAQ();
      this.setupSectionAnalytics();
      this.initSectionTracking();
    } catch (error) {
      console.error('Error initializing FAQ section:', error);
    }
  },

  /**
   * Initialize section view tracking using standardized approach
   */
  initSectionTracking(): void {
    AnalyticsHelpers.initSectionTracking('faq');
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
    // Section tracking is now handled by initSectionTracking()
    // This method can be used for other FAQ-specific analytics if needed
  }
};