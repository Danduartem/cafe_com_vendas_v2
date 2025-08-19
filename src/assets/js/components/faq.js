/**
 * FAQ Component for Café com Vendas
 * Handles premium FAQ system with accordion functionality
 */

import { Analytics } from '../core/analytics.js';
import { safeQuery, safeQueryAll, Animations, normalizeEventPayload } from '../utils/index.js';

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

        // Track FAQ toggle for GTM
        const itemNumber = detailsEl.getAttribute('data-faq-item');
        const questionText = detailsEl.querySelector('summary')?.textContent?.trim() || `FAQ ${itemNumber}`;
        const label = `faq-${itemNumber}`;

        try {
          // Track engagement time
          Analytics.trackFAQEngagement(label, isOpen);

          // Push FAQ toggle event to dataLayer for GTM
          window.dataLayer = window.dataLayer || [];
          const faqPayload = normalizeEventPayload({
            event: 'faq_toggle',
            action: isOpen ? 'open' : 'close', // "open" or "close" (will be normalized)
            question: questionText // The actual question text (will be normalized to 100 chars)
          });
          window.dataLayer.push(faqPayload);
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