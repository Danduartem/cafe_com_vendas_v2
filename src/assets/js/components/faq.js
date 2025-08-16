/**
 * FAQ Component for Café com Vendas
 * Handles premium FAQ system with accordion functionality
 */

import { Analytics } from '../core/analytics.js';
import { safeQuery, safeQueryAll, Animations } from '../utils/index.js';

export const FAQ = {
  init() {
    try {
      this.initializeNativeDetailsFAQ();
    } catch (error) {
      console.error('Error initializing FAQ component:', error);
    }
  },

  initializeNativeDetailsFAQ() {
    const faqContainer = safeQuery('[data-faq-container]');
    const faqDetails = safeQueryAll('details[data-faq-item]');

    if (!faqContainer || !faqDetails.length) {
      console.warn('FAQ elements not found - FAQ functionality disabled');
      return;
    }

    // Reveal animation on cards
    this.initializeFAQRevealAnimation(faqDetails);

    // Accordion behavior: only one open at a time
    faqDetails.forEach((detailsEl) => {
      detailsEl.addEventListener('toggle', () => {
        const isOpen = detailsEl.open;
        if (isOpen) {
          // Close others
          faqDetails.forEach((other) => {
            if (other !== detailsEl && other.open) other.open = false;
          });
        }

        // Track analytics
        const analyticsEvent = detailsEl.getAttribute('data-analytics-event');
        const itemNumber = detailsEl.getAttribute('data-faq-item');
        const label = `faq-${itemNumber}`;
        try {
          Analytics.trackFAQEngagement(label, isOpen);
          Analytics.track('faq_toggle', {
            event_category: 'FAQ',
            event_label: analyticsEvent || label,
            action: isOpen ? 'open' : 'close'
          });
        } catch { /* no-op */ }
      }, { passive: true });
    });
  },

  initializeFAQRevealAnimation(faqItems) {
    Animations.prepareRevealElements(faqItems, {
      transitionClasses: ['transition-all', 'duration-500', 'ease-out']
    });

    const observer = Animations.createObserver({
      callback: (entry, index) => {
        setTimeout(() => {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-4');
        }, index * 100);
      },
      once: true,
      rootMargin: '0px 0px -50px 0px'
    });

    faqItems.forEach(item => observer.observe(item));
  }
};