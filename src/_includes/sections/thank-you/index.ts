/**
 * Thank You Component for Café com Vendas
 * Handles thank-you page animations, milestone progress, and premium interactions
 */

import { safeQuery } from '../../../assets/js/utils/dom';
import { Animations } from '../../../components/ui';
import { logger } from '../../../utils/logger.js';
import { 
  generateIcsContent, 
  downloadIcsFile, 
  createCafeComVendasEvent, 
  generateCalendarUrls, 
  detectUserPlatform,
  type CalendarUrls,
  type CalendarEvent
} from '../../../utils/calendar.js';

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
    this.initPageEntranceEffects();
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
    }

    // Calendar dropdown functionality
    this.initCalendarDropdown();

    // Enhanced step cards interactions  
    const stepCards = safeQuery('#thankyou')?.querySelectorAll('.step-card');
    stepCards?.forEach((card) => {
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

  initCalendarDropdown() {
    const dropdownContainer = safeQuery('[data-calendar-dropdown]');
    if (!dropdownContainer) return;

    const dropdownButton = dropdownContainer.querySelector('[data-dropdown-button]') as HTMLButtonElement;
    const dropdownMenu = dropdownContainer.querySelector('[data-dropdown-menu]') as HTMLElement;
    const dropdownIcon = dropdownContainer.querySelector('[data-dropdown-icon]') as SVGElement;
    
    if (!dropdownButton || !dropdownMenu || !dropdownIcon) return;

    // Generate calendar URLs once
    const eventData = createCafeComVendasEvent();
    const calendarUrls = generateCalendarUrls(eventData);
    const userPlatform = detectUserPlatform();

    // Highlight recommended option based on platform
    this.highlightRecommendedOption(userPlatform);

    // Toggle dropdown visibility
    const toggleDropdown = (show?: boolean) => {
      const isVisible = show ?? dropdownMenu.classList.contains('opacity-100');
      
      if (!isVisible) {
        dropdownMenu.classList.remove('opacity-0', 'invisible', 'scale-95');
        dropdownMenu.classList.add('opacity-100', 'visible', 'scale-100');
        dropdownButton.setAttribute('aria-expanded', 'true');
        dropdownIcon.style.transform = 'rotate(180deg)';
      } else {
        dropdownMenu.classList.remove('opacity-100', 'visible', 'scale-100');
        dropdownMenu.classList.add('opacity-0', 'invisible', 'scale-95');
        dropdownButton.setAttribute('aria-expanded', 'false');
        dropdownIcon.style.transform = 'rotate(0deg)';
      }
    };

    // Button click handler
    dropdownButton.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleDropdown();
    });

    // Calendar option handlers
    const calendarOptions = dropdownMenu.querySelectorAll('[data-calendar-option]');
    calendarOptions.forEach((option) => {
      option.addEventListener('click', (event) => {
        event.stopPropagation();
        
        const calendarType = (option as HTMLElement).getAttribute('data-calendar-option') as string;
        this.handleCalendarSelection(calendarType, calendarUrls, eventData);
        toggleDropdown(true); // Close dropdown
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (!dropdownContainer.contains(event.target as Node)) {
        toggleDropdown(true);
      }
    });

    // Close dropdown on escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        toggleDropdown(true);
        dropdownButton.focus();
      }
    });
  },

  highlightRecommendedOption(platform: string) {
    // Remove existing recommended badges
    const existingBadges = document.querySelectorAll('.bg-gold-100');
    existingBadges.forEach(badge => {
      if (badge.textContent?.includes('Recomendado')) {
        badge.remove();
      }
    });

    // Add platform-specific recommendation
    let recommendedOption = 'google'; // Default
    
    if (platform === 'ios') {
      recommendedOption = 'apple';
    } else if (platform === 'windows') {
      recommendedOption = 'outlook';
    }

    const targetOption = document.querySelector(`[data-calendar-option="${recommendedOption}"]`);
    if (targetOption) {
      const textContainer = targetOption.querySelector('.flex-1 .flex');
      if (textContainer && !textContainer.querySelector('.bg-gold-100')) {
        const badge = document.createElement('span');
        badge.className = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gold-100 text-gold-700';
        badge.textContent = 'Recomendado';
        textContainer.appendChild(badge);
      }
    }
  },

  handleCalendarSelection(calendarType: string, calendarUrls: CalendarUrls, eventData: CalendarEvent) {
    try {
      switch (calendarType) {
        case 'google':
          window.open(calendarUrls.google, '_blank');
          this.trackCalendarInteraction('google', 'direct_link');
          break;
          
        case 'outlook':
          window.open(calendarUrls.outlook, '_blank');
          this.trackCalendarInteraction('outlook', 'direct_link');
          break;
          
        case 'apple':
        default: {
          // For iPhone/Apple devices, create an optimized ICS file
          const icsContent = generateIcsContent(eventData);
          downloadIcsFile(icsContent, 'cafe-com-vendas-evento.ics');
          this.trackCalendarInteraction('apple', 'ics_download');
          break;
        }
      }
      
      logger.info(`Calendar ${calendarType} integration successful`);
      
    } catch (error) {
      logger.error(`Error with calendar ${calendarType} integration:`, error);
      alert('Erro ao criar o evento no calendário. Por favor, tente novamente.');
    }
  },

  trackCalendarInteraction(provider: string, method: string) {
    import('../../../components/ui/analytics').then(({ PlatformAnalytics }) => {
      PlatformAnalytics.track('ui_interaction', {
        interaction: 'calendar_add',
        calendar_provider: provider,
        integration_method: method,
        location: 'thank_you_page',
        event_date: '2025-09-20',
        event_name: 'cafe_com_vendas_portugal',
        user_platform: detectUserPlatform()
      });
    }).catch(() => {
      logger.debug('Calendar analytics tracking unavailable');
    });
  },

};