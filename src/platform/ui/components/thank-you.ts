/**
 * Platform Thank You Page Component
 * Handles thank you page animations, progress bar, and celebration effects
 */

import { safeQuery } from '@platform/lib/utils/dom.ts';
import { PlatformAnimations } from './animations.ts';
import { PlatformAnalytics } from './analytics.ts';

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
      PlatformAnalytics.trackUIInteraction('progress_bar_animated', {
        progress_value: targetProgress
      });
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
      PlatformAnalytics.trackUIInteraction('celebration_shown', {
        page: 'thank_you'
      });
    }, 800);
  },

  /**
   * Initialize reveal animations
   */
  initAnimations(): void {
    const elements = document.querySelectorAll('#thankyou [data-reveal]');
    if (!elements.length) return;

    const elementsArray = Array.from(elements);
    PlatformAnimations.prepareRevealElements(elementsArray);

    const observer = PlatformAnimations.createObserver({
      callback: () => {
        PlatformAnimations.revealElements(elementsArray, {
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
      PlatformAnalytics.trackPersonalization('greeting_personalized', {
        page: 'thank_you'
      });
    }
  },

  /**
   * Track thank you page conversion
   */
  trackPageView(): void {
    // Track page view
    PlatformAnalytics.trackPageView('thank_you', {
      conversion: true
    });

    // Track purchase completion
    PlatformAnalytics.trackConversion('purchase_complete', {
      value: 1
    });

    // Check for Stripe session
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
      PlatformAnalytics.trackConversion('stripe_payment_success', {
        session_id: sessionId
      });
    }
  }
};