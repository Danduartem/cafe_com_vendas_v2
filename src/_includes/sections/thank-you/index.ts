/**
 * Thank You Component for Café com Vendas
 * Handles thank-you page animations, progress bar, and celebration effects
 */

import { safeQuery } from '../../../platform/lib/utils/dom.ts';
import { PlatformAnimations, PlatformAnalytics } from '@platform/ui/components/index.ts';

export const ThankYou = {
  init() {
    try {
      this.initAnimations();
      this.initProgressBar();
      this.initInteractions();
      this.initCelebrationOverlay();
    } catch (error) {
      console.error('Error initializing ThankYou component:', error);
    }
  },

  initAnimations() {
    const thankYouSection = safeQuery('#thankyou');
    if (!thankYouSection) return;

    const revealElements = thankYouSection.querySelectorAll('[data-reveal]');

    PlatformAnimations.prepareRevealElements(Array.from(revealElements));

    const observer = PlatformAnimations.createObserver({
      callback: () => {
        PlatformAnimations.revealElements(Array.from(revealElements), {
          initialDelay: 200
        });
      },
      once: true,
      rootMargin: '0px 0px -10% 0px'
    });

    revealElements.forEach(element => observer.observe(element));
  },

  initProgressBar() {
    const progressBar = safeQuery('#progressBar');
    const progressLabel = safeQuery('#progressLabel');

    if (!progressBar || !progressLabel) return;

    // Animate progress bar on load
    setTimeout(() => {
      const targetWidth = progressLabel.textContent?.replace('%', '') || '80';
      (progressBar as HTMLElement).style.width = `${targetWidth}%`;
    }, 800);
  },

  initInteractions() {
    // Main CTA button
    const mainCtaButton = safeQuery('[data-analytics-click="cta_complete_form"]');
    if (mainCtaButton) {
      PlatformAnimations.addClickFeedback(mainCtaButton);

      mainCtaButton.addEventListener('mouseenter', function(this: HTMLElement) {
        this.classList.add('scale-[1.02]');
      });

      mainCtaButton.addEventListener('mouseleave', function(this: HTMLElement) {
        this.classList.remove('scale-[1.02]');
      });
    }

    // Calendar download button
    const calendarButton = safeQuery('[data-analytics-click="add_to_calendar"]');
    if (calendarButton) {
      PlatformAnimations.addClickFeedback(calendarButton);

      calendarButton.addEventListener('click', () => {
        // Track calendar download
        PlatformAnalytics.trackUIInteraction('calendar_download', {
          location: 'thank_you_page',
          file_type: 'ics'
        });
      });
    }

    // WhatsApp contact button
    const whatsappButton = safeQuery('[data-analytics-click="contact_whatsapp"]') as HTMLAnchorElement;
    if (whatsappButton) {
      PlatformAnimations.addClickFeedback(whatsappButton);
      PlatformAnalytics.trackWhatsAppClick(whatsappButton, 'thank_you_page');
    }

    // Add hover effects to step cards
    const stepCards = safeQuery('#thankyou')?.querySelectorAll('.hover\\:bg-neutral-50');
    stepCards?.forEach(card => {
      card.addEventListener('mouseenter', function(this: HTMLElement) {
        this.classList.add('shadow-md');
      });

      card.addEventListener('mouseleave', function(this: HTMLElement) {
        this.classList.remove('shadow-md');
      });
    });
  },

  initCelebrationOverlay() {
    const overlay = safeQuery('#celebrationOverlay');
    if (!overlay) return;

    // Show celebration effect on page load
    setTimeout(() => {
      this.showCelebration();
    }, 1000);
  },

  showCelebration() {
    const overlay = safeQuery('#celebrationOverlay');
    if (!overlay) return;

    // Create confetti-like effect
    overlay.innerHTML = `
      <div class="absolute inset-0 pointer-events-none">
        ${Array.from({ length: 12 }, (_, i) => `
          <div class="absolute animate-bounce" style="
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${i * 0.1}s;
            animation-duration: ${1 + Math.random()}s;
          ">
            <div class="w-2 h-2 bg-burgundy-400 rounded-full opacity-60"></div>
          </div>
        `).join('')}
      </div>
    `;

    // Fade in celebration
    overlay.classList.add('opacity-30');

    // Fade out after animation
    setTimeout(() => {
      overlay.classList.remove('opacity-30');
      overlay.classList.add('opacity-0');
    }, 2000);

    // Clean up
    setTimeout(() => {
      overlay.innerHTML = '';
    }, 3000);
  }
};