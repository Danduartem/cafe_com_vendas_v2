/**
 * Final CTA Section Component
 * Handles interactive behaviors for the final call-to-action section
 */

import type { Component } from '@app-types/components/base.js';
import { safeQuery } from '@utils/dom.js';
import { Analytics } from '@/core/analytics.js';

interface FinalCTAComponent extends Component {
  bindEvents(): void;
  setupUrgencyElements(): void;
}

export const FinalCTA: FinalCTAComponent = {
  /**
   * Initialize final CTA section
   */
  init(): void {
    this.bindEvents();
    this.setupUrgencyElements();
  },

  /**
   * Bind event listeners for final CTA section interactions
   */
  bindEvents(): void {
    const section = safeQuery('#s-final-cta');
    if (!section) {
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
              section: 'final-cta',
              element_type: 'section_entry'
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(section);

    // Track final CTA button clicks
    const ctaButtons = section.querySelectorAll('[data-final-cta-button]');
    ctaButtons.forEach((button) => {
      button.addEventListener('click', () => {
        Analytics.track('final_cta_click', {
          event: 'final_cta_click',
          event_category: 'Conversion',
          section: 'final-cta',
          element_type: 'final_cta_button',
          element_text: button.textContent?.trim() || 'unknown'
        });
      });
    });

    // Track urgency message interactions
    const urgencyElements = section.querySelectorAll('[data-urgency-message]');
    urgencyElements.forEach((element) => {
      element.addEventListener('click', () => {
        Analytics.track('urgency_message_click', {
          event: 'urgency_message_click',
          event_category: 'Engagement',
          section: 'final-cta',
          element_type: 'urgency_message',
          element_text: element.textContent?.trim().substring(0, 50) || 'unknown'
        });
      });
    });
  },

  /**
   * Setup urgency-related visual elements
   */
  setupUrgencyElements(): void {
    const urgencyIndicators = document.querySelectorAll('[data-urgency-indicator]');

    urgencyIndicators.forEach((indicator) => {
      // Add pulsing animation to urgency indicators
      indicator.classList.add('animate-pulse');

      // Optional: Add hover effects
      indicator.addEventListener('mouseenter', () => {
        indicator.classList.remove('animate-pulse');
        indicator.classList.add('scale-105');
      });

      indicator.addEventListener('mouseleave', () => {
        indicator.classList.add('animate-pulse');
        indicator.classList.remove('scale-105');
      });
    });
  }
};