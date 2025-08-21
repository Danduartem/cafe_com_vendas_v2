// src/assets/js/components/thank-you.ts

import { Analytics } from '@/core/analytics.js';
import { safeQuery } from '@/utils/dom.js';
import { Animations } from '@/utils/animations.js';
import type { Component } from '@/types/component.js';

export const ThankYou: Component = {
  init(): void {
    try {
      // Only initialize if we're on the thank-you page
      const thankYouSection = safeQuery('#thankyou');
      if (!thankYouSection) {
        return; // Not on thank-you page, skip initialization
      }

      this.initializeProgressBar();
      this.initCelebration();
      this.initAnimations();
      this.personalizeGreeting();
      this.trackPageView();
    } catch (error) {
      console.error('Error initializing ThankYou component:', error);
    }
  },

  initializeProgressBar() {
    const progressBar = safeQuery('#progressBar');
    const progressLabel = safeQuery('#progressLabel');

    if (!progressBar || !progressLabel) {
      console.warn('Progress bar elements not found');
      return;
    }

    // Animate progress bar after a short delay
    setTimeout(() => {
      progressBar.classList.remove('w-0');
      progressBar.classList.add('w-4/5'); // 80% progress

      // Update aria attributes
      const progressContainer = progressBar.parentElement;
      if (progressContainer) {
        progressContainer.setAttribute('aria-valuenow', '80');
      }

      // Track progress animation
      Analytics.track('thank_you_progress_animated', {
        event_category: 'UI',
        event_label: 'Progress Bar',
        value: 80
      });
    }, 500);
  },

  initCelebration() {
    const celebrationOverlay = safeQuery('#celebrationOverlay');

    if (!celebrationOverlay) {
      return;
    }

    // Check if this is the first visit to thank-you page in this session
    const hasShownCelebration = sessionStorage.getItem('thankYouCelebrationShown');

    if (!hasShownCelebration) {
      // Show subtle celebration effect
      setTimeout(() => {
        // Add gradient animation classes
        celebrationOverlay.classList.add(
          'bg-gradient-to-t',
          'from-transparent',
          'via-burgundy-100/10',
          'to-transparent',
          'animate-pulse'
        );
        celebrationOverlay.classList.remove('opacity-0');
        celebrationOverlay.classList.add('opacity-100');

        // Fade out after 3 seconds
        setTimeout(() => {
          celebrationOverlay.classList.remove('opacity-100');
          celebrationOverlay.classList.add('opacity-0');

          // Clean up classes after transition
          setTimeout(() => {
            celebrationOverlay.classList.remove(
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

        // Track celebration shown
        Analytics.track('thank_you_celebration_shown', {
          event_category: 'UI',
          event_label: 'Celebration Effect'
        });
      }, 800);
    }
  },

  initAnimations() {
    // Add reveal animations to elements
    const revealElements = document.querySelectorAll('#thankyou [data-reveal]');

    if (revealElements.length === 0) {
      return;
    }

    // Prepare elements for animation
    Animations.prepareRevealElements(Array.from(revealElements));

    // Create observer for staggered animations
    const observer = Animations.createObserver({
      callback: (_entry, _index) => {
        Animations.revealElements(Array.from(revealElements), {
          initialDelay: 100,
          staggerDelay: 100
        });
      },
      once: true,
      threshold: 0.1
    });

    // Observe each element
    revealElements.forEach(element => {
      observer.observe(element);
    });
  },

  personalizeGreeting() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');

    if (!name) return;

    const h1 = safeQuery('#thankyou h1');
    if (h1) {
      // Update the greeting with the user's name
      const nameSpan = document.createElement('span');
      nameSpan.className = 'text-burgundy-600 font-black';
      nameSpan.textContent = name;

      // Find the right place to insert the name
      const titleText = h1.innerHTML;
      const updatedTitle = titleText.replace(
        'Falta só',
        `Obrigada, <em class="italic text-burgundy-600 font-black">${name}</em>! Falta só`
      );
      h1.innerHTML = updatedTitle;

      // Track personalized greeting
      Analytics.track('thank_you_personalized', {
        event_category: 'Personalization',
        event_label: 'Name Display'
      });
    }
  },

  trackPageView() {
    // Track thank you page view
    Analytics.track('view_thank_you_page', {
      event_category: 'Conversion',
      event_label: 'Thank You Page',
      value: 1
    });

    // Track conversion completion
    Analytics.track('purchase_complete', {
      event_category: 'Conversion',
      event_label: 'Payment Success',
      value: 1
    });

    // Track if user came from Stripe
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
      Analytics.track('stripe_payment_success', {
        event_category: 'Conversion',
        event_label: 'Stripe Success',
        session_id: sessionId
      });
    }
  }
};