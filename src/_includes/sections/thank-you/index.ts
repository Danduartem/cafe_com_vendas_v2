/**
 * Thank You Component for Café com Vendas
 * Handles thank-you page animations, progress bar, and celebration effects
 */

import { safeQuery } from '../../../assets/js/utils/dom';
import { Animations } from '../../../components/ui';
import { logger } from '../../../utils/logger.js';

export const ThankYou = {
  init() {
    try {
      this.checkPaymentStatus();
      this.initAnimations();
      this.initInteractions();
    } catch (error) {
      logger.error('Error initializing ThankYou component:', error);
    }
  },

  checkPaymentStatus() {
    // Check if we came from a payment redirect (3DS, SEPA, etc.)
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntent = urlParams.get('payment_intent');
    const redirectStatus = urlParams.get('redirect_status');

    if (paymentIntent && redirectStatus === 'succeeded') {
      // Payment succeeded after redirect (e.g., 3DS authentication)
      // Track the conversion now since it wasn't tracked before redirect
      import('../../../components/ui/analytics').then(({ PlatformAnalytics }) => {
        PlatformAnalytics.trackConversion('payment_completed', {
          transaction_id: paymentIntent,
          value: 47,
          currency: 'EUR',
          items: [{ name: 'Café com Vendas Lisboa', quantity: 1, price: 47 }],
          pricing_tier: 'early_bird',
          payment_method: 'card_with_3ds' // Indicate this was a 3DS payment
        });
        logger.info('Payment completed event tracked for 3DS redirect');
      }).catch(() => {
        logger.debug('Payment completion analytics tracking unavailable');
      });
    }
  },

  initAnimations() {
    const thankYouSection = safeQuery('#thankyou');
    if (!thankYouSection) return;

    const revealElements = thankYouSection.querySelectorAll('[data-reveal]');

    Animations.prepareRevealElements(Array.from(revealElements));

    // Enhanced reveal sequence with staggered timing
    const observer = Animations.createObserver({
      callback: () => {
        // Premium staggered reveal
        Array.from(revealElements).forEach((element, index) => {
          setTimeout(() => {
            element.classList.add('animate-in');
            element.classList.remove('opacity-0', 'translate-y-4');
          }, index * 150 + 300);
        });

        // Add subtle pulse to current milestone after reveal
        setTimeout(() => {
          const currentMilestone = thankYouSection.querySelector('.animate-pulse');
          if (currentMilestone) {
            currentMilestone.parentElement?.classList.add('scale-105');
            setTimeout(() => {
              currentMilestone.parentElement?.classList.remove('scale-105');
            }, 600);
          }
        }, 1500);
      },
      once: true,
      rootMargin: '0px 0px -10% 0px'
    });

    revealElements.forEach(element => observer.observe(element));

    // Add premium entrance animation to page
    setTimeout(() => {
      this.initPageEntranceEffects();
    }, 100);
  },

  initPageEntranceEffects() {
    const thankYouSection = safeQuery('#thankyou') as HTMLElement;
    if (!thankYouSection) return;

    // Add a subtle fade-in to the entire section
    thankYouSection.style.opacity = '0';
    thankYouSection.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      thankYouSection.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
      thankYouSection.style.opacity = '1';
      thankYouSection.style.transform = 'translateY(0)';
    }, 50);
  },


  initInteractions() {
    // Enhanced Main CTA button
    const mainCtaButton = safeQuery('[data-analytics-click="cta_complete_form"]');
    if (mainCtaButton) {
      Animations.addClickFeedback(mainCtaButton);

      // Premium hover effects
      mainCtaButton.addEventListener('mouseenter', function(this: HTMLElement) {
        this.style.transform = 'scale(1.03) translateY(-2px)';
        this.style.boxShadow = '0 16px 40px rgb(129,23,31,0.35), 0 0 0 1px rgba(255,255,255,0.1)';
        
        // Add glow effect
        this.style.filter = 'drop-shadow(0 0 8px rgba(129,23,31,0.3))';
      });

      mainCtaButton.addEventListener('mouseleave', function(this: HTMLElement) {
        this.style.transform = 'scale(1) translateY(0)';
        this.style.boxShadow = '0 8px 24px rgb(129,23,31,0.3)';
        this.style.filter = 'none';
      });

      // Add subtle breathing animation
      const breathingInterval = setInterval(() => {
        if (!document.body.contains(mainCtaButton)) {
          clearInterval(breathingInterval);
          return;
        }
        
        const currentTransform = (mainCtaButton as HTMLElement).style.transform;
        (mainCtaButton as HTMLElement).style.transform = currentTransform + ' scale(1.005)';
        setTimeout(() => {
          if (document.body.contains(mainCtaButton)) {
            const updatedTransform = (mainCtaButton as HTMLElement).style.transform;
            (mainCtaButton as HTMLElement).style.transform = updatedTransform.replace(' scale(1.005)', '');
          }
        }, 1500);
      }, 3000);
    }

    // Calendar download button
    const calendarButton = safeQuery('[data-analytics-click="add_to_calendar"]');
    if (calendarButton) {
      Animations.addClickFeedback(calendarButton);

      calendarButton.addEventListener('click', () => {
        // Track calendar download
        import('../../../components/ui/analytics').then(({ PlatformAnalytics }) => {
          PlatformAnalytics.track('ui_interaction', {
            interaction: 'calendar_download',
            location: 'thank_you_page',
            file_type: 'ics'
          });
        }).catch(() => {
          logger.debug('Calendar download analytics tracking unavailable');
        });
      });
    }

    // WhatsApp contact button
    const whatsappButton = safeQuery('[data-analytics-click="contact_whatsapp"]') as HTMLAnchorElement;
    if (whatsappButton) {
      Animations.addClickFeedback(whatsappButton);
      import('../../../components/ui/analytics').then(({ PlatformAnalytics }) => {
        PlatformAnalytics.trackClick(whatsappButton, 'whatsapp_click', 'thank_you_page');
      }).catch(() => {
        logger.debug('WhatsApp analytics tracking unavailable');
      });
    }

    // Enhanced step cards interactions
    const stepCards = safeQuery('#thankyou')?.querySelectorAll('.group');
    stepCards?.forEach((card, index) => {
      if (card.classList.contains('rounded-2xl')) { // Only target step cards
        card.addEventListener('mouseenter', function(this: HTMLElement) {
          this.style.transform = 'translateY(-2px)';
          this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
          this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });

        card.addEventListener('mouseleave', function(this: HTMLElement) {
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = '';
          this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });

        // Add staggered entrance animation
        setTimeout(() => {
          const htmlCard = card as HTMLElement;
          htmlCard.style.opacity = '0';
          htmlCard.style.transform = 'translateX(-20px)';
          htmlCard.style.transition = 'all 0.6s ease-out';
          
          setTimeout(() => {
            htmlCard.style.opacity = '1';
            htmlCard.style.transform = 'translateX(0)';
          }, 50);
        }, 2000 + (index * 200));
      }
    });

    // Add premium interactions to feature cards in sidebar
    const featureCards = safeQuery('aside')?.querySelectorAll('.hover\\:shadow-md');
    featureCards?.forEach((card) => {
      card.addEventListener('mouseenter', function(this: HTMLElement) {
        this.style.transform = 'translateX(4px)';
        this.style.borderColor = 'rgb(129,23,31,0.2)';
      });

      card.addEventListener('mouseleave', function(this: HTMLElement) {
        this.style.transform = 'translateX(0)';
        this.style.borderColor = '';
      });
    });
  },

};