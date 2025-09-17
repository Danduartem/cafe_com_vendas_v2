/**
 * Platform Thank You Page Component
 * Handles thank you page animations, progress bar, and celebration effects
 */

import { safeQuery } from '../../../utils/dom.js';
import { logger } from '../../../utils/logger.js';
import { Animations } from '../animations/index.js';
import analytics, { AnalyticsHelpers } from '../../../analytics/index.js';

interface ThankYouConfig {
  progressTarget?: number;
  showCelebration?: boolean;
  personalizeGreeting?: boolean;
  trackConversion?: boolean;
}

export const PlatformThankYou = {
  /**
   * Initialize thank you page features
   */
  init(config: ThankYouConfig = {}): void {
    const {
      progressTarget = 80,
      showCelebration = true,
      personalizeGreeting = true,
      trackConversion = true
    } = config;

    // Only initialize if on thank you page
    const thankYouSection = safeQuery('#thankyou');
    if (!thankYouSection) return;

    this.initProgressBar(progressTarget);

    if (showCelebration) {
      this.initCelebration();
    }

    this.initAnimations();

    if (personalizeGreeting) {
      this.personalizeGreeting();
    }

    if (trackConversion) {
      this.trackPageView();
    }
  },

  /**
   * Initialize and animate progress bar
   */
  initProgressBar(targetProgress: number): void {
    const progressBar = safeQuery('#progressBar') as HTMLElement;
    const progressLabel = safeQuery('#progressLabel');

    if (!progressBar || !progressLabel) return;

    // Animate progress bar after delay
    setTimeout(() => {
      progressBar.style.width = `${targetProgress}%`;

      // Update ARIA attributes
      const container = progressBar.parentElement;
      if (container) {
        container.setAttribute('aria-valuenow', targetProgress.toString());
      }

      // Update label if needed
      if (progressLabel) {
        progressLabel.textContent = `${targetProgress}%`;
      }

      // Track animation
      try {
        analytics.track('ui_interaction', {
          interaction: 'progress_bar_animated',
          progress_value: targetProgress
        });
      } catch {
        logger.debug('Progress bar analytics tracking unavailable');
      }
    }, 500);
  },

  /**
   * Initialize celebration effect
   */
  initCelebration(): void {
    const overlay = safeQuery('#celebrationOverlay') as HTMLElement;
    if (!overlay) return;

    // Check if already shown in session
    const hasShown = sessionStorage.getItem('thankYouCelebrationShown');
    if (hasShown) return;

    setTimeout(() => {
      // Add celebration classes
      overlay.classList.add(
        'bg-gradient-to-t',
        'from-transparent',
        'via-burgundy-100/10',
        'to-transparent',
        'animate-pulse',
        'opacity-100'
      );
      overlay.classList.remove('opacity-0');

      // Fade out after 3 seconds
      setTimeout(() => {
        overlay.classList.remove('opacity-100');
        overlay.classList.add('opacity-0');

        // Clean up after transition
        setTimeout(() => {
          overlay.classList.remove(
            'bg-gradient-to-t',
            'from-transparent',
            'via-burgundy-100/10',
            'to-transparent',
            'animate-pulse'
          );
        }, 1000);
      }, 3000);

      // Mark as shown
      sessionStorage.setItem('thankYouCelebrationShown', 'true');

      // Track event
      try {
        analytics.track('ui_interaction', {
          interaction: 'celebration_shown',
          page: 'thank_you'
        });
      } catch {
        logger.debug('Celebration analytics tracking unavailable');
      }
    }, 800);
  },

  /**
   * Initialize reveal animations
   */
  initAnimations(): void {
    const elements = document.querySelectorAll('#thankyou [data-reveal]');
    if (!elements.length) return;

    const elementsArray = Array.from(elements);
    Animations.prepareRevealElements(elementsArray);

    const observer = Animations.createObserver({
      callback: () => {
        Animations.revealElements(elementsArray, {
          initialDelay: 100,
          staggerDelay: 100
        });
      },
      once: true,
      threshold: 0.1
    });

    elements.forEach(el => observer.observe(el));
  },

  /**
   * Personalize greeting with user name
   */
  personalizeGreeting(): void {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');

    if (!name) return;

    const heading = safeQuery('#thankyou h1');
    if (heading) {
      const updatedHtml = heading.innerHTML.replace(
        'Falta só',
        `Obrigada, <em class="italic text-burgundy-600 font-black">${name}</em>! Falta só`
      );
      heading.innerHTML = updatedHtml;

      // Track personalization
      try {
        analytics.track('personalization', {
          type: 'greeting_personalized',
          page: 'thank_you'
        });
      } catch {
        logger.debug('Personalization analytics tracking unavailable');
      }
    }
  },

  /**
   * Track thank you page conversion
   */
  trackPageView(): void {
    try {
      // Track page view
      analytics.track('page_view', {
        page: 'thank_you',
        conversion: true
      });

      // Track purchase completion
      AnalyticsHelpers.trackConversion('purchase_completed', {
        value: 1
      });

      // Check for Stripe session
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');

      if (sessionId) {
        AnalyticsHelpers.trackConversion('stripe_payment_success', {
          session_id: sessionId
        });
      }
    } catch {
      logger.debug('Thank you page analytics tracking unavailable');
    }
  }
};
