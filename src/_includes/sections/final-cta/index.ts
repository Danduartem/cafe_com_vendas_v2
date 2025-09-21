/**
 * Final CTA Section Component
 * Handles interactive behaviors for the final call-to-action section
 */

import type { Component } from '../../../types/components/base.js';
import { safeQuery } from '../../../utils/dom.js';
import { initSectionTracking, trackEvent } from '../../../utils/analytics-helpers.js';

interface FinalCTAComponent extends Component {
  bindEvents(): void;
  setupUrgencyElements(): void;
  initSectionTracking(): void;
}

export const FinalCTA: FinalCTAComponent = {
  /**
   * Initialize final CTA section
   */
  init(): void {
    this.bindEvents();
    this.setupUrgencyElements();
    this.initSectionTracking();
  },

  /**
   * Initialize section view tracking using standardized approach
   */
  initSectionTracking(): void {
    initSectionTracking('final-cta');
  },

  /**
   * Bind event listeners for final CTA section interactions
   */
  bindEvents(): void {
    const section = safeQuery('#s-final-cta');
    if (!section) {
      return;
    }

    // Section tracking is now handled by initSectionTracking()

    // Track final CTA button clicks
    const ctaButtons = section.querySelectorAll('[data-final-cta-button]');
    ctaButtons.forEach((button) => {
      button.addEventListener('click', () => {
        trackEvent('final_cta_click', {
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
        trackEvent('urgency_message_click', {
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
