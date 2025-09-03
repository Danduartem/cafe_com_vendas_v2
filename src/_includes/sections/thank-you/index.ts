/**
 * Thank You Component for Café com Vendas
 * Handles thank-you page animations, milestone progress, and premium interactions
 */

import { safeQuery } from '../../../utils/dom.js';
import { Animations } from '../../../components/ui/index.js';
import { logger } from '../../../utils/logger.js';
import siteData from '../../../_data/site.js';

// 🎯 Get centralized pricing data - SINGLE SOURCE OF TRUTH
const site = siteData();
const eventPricing = site.event.pricing;
const basePrice = eventPricing.basePrice;
const eventName = site.event.name;
import { 
  generateIcsContent, 
  downloadIcsFile, 
  createCafeComVendasEvent, 
  generateCalendarUrls, 
  detectUserPlatform,
  type CalendarUrls,
  type CalendarEvent
} from '../../../utils/calendar.js';
import analytics, { AnalyticsHelpers } from '../../../analytics/index.js';

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
    try {
      // Enhanced URL parameter parsing with validation
      const urlParams = new URLSearchParams(window.location.search);
      const paymentIntent = urlParams.get('payment_intent')?.trim();
      const redirectStatus = urlParams.get('redirect_status')?.trim();
      const paymentStatus = urlParams.get('payment_status')?.trim();
      const paymentMethod = urlParams.get('payment_method')?.trim();
      const multibancoEntity = urlParams.get('multibanco_entity')?.trim();
      const multibancoReference = urlParams.get('multibanco_reference')?.trim();
      const sessionId = urlParams.get('session_id')?.trim();
      const leadId = urlParams.get('lead_id')?.trim();
      const amount = urlParams.get('amount')?.trim();

      logger.info('Checking payment status from URL parameters', {
        paymentIntent: paymentIntent ? paymentIntent.substring(0, 20) + '...' : null,
        redirectStatus,
        paymentStatus,
        paymentMethod,
        hasMultibancoEntity: !!multibancoEntity,
        hasMultibancoReference: !!multibancoReference,
        hasSessionId: !!sessionId,
        hasLeadId: !!leadId,
        hasAmount: !!amount
      });

      // Enhanced Multibanco payment detection with multiple fallback methods
      const isMultibancoPayment = (
        // Primary: explicit payment method
        paymentMethod === 'multibanco' ||
        // Secondary: presence of Multibanco voucher details
        (multibancoEntity && multibancoReference) ||
        // Tertiary: processing status with payment intent (likely async payment)
        (redirectStatus === 'processing' && paymentIntent) ||
        // Quaternary: payment status processing (direct from checkout)
        (paymentStatus === 'processing' && paymentIntent) ||
        // Fallback: session ID with processing status (webhook redirect scenario)
        (sessionId && (redirectStatus === 'processing' || paymentStatus === 'processing'))
      );

      if (isMultibancoPayment) {
        // Determine the amount to display
        const displayAmount = amount ? (parseInt(amount) / 100) : basePrice;
        
        // If we have complete voucher details, show them
        if (multibancoEntity && multibancoReference) {
          this.showMultibancoInstructions({
            entity: multibancoEntity,
            reference: multibancoReference,
            paymentIntent,
            sessionId,
            amount: displayAmount
          });
          
          logger.info('Multibanco payment detected with complete voucher details', {
            hasEntity: !!multibancoEntity,
            hasReference: !!multibancoReference,
            paymentMethod,
            displayAmount
          });
        } else {
          // Fallback: show generic pending payment with attempt to fetch details
          logger.warn('Multibanco payment detected but voucher details missing, using fallback', {
            paymentIntent,
            sessionId,
            paymentMethod,
            redirectStatus,
            paymentStatus
          });
          
          this.showMultibancoInstructionsWithFallback({
            paymentIntent,
            sessionId,
            amount: displayAmount,
            paymentMethod,
            leadId
          });
        }
        
        // Track Multibanco voucher display
        this.trackMultibancoVoucherDisplay({
          paymentIntent,
          hasEntity: !!multibancoEntity,
          hasReference: !!multibancoReference,
          paymentMethod: paymentMethod || 'multibanco',
          amount: displayAmount
        });
        
        return;
      }

      // Handle successful card payment (including 3DS)
      if (paymentIntent && redirectStatus === 'succeeded') {
        // Payment succeeded after redirect (e.g., 3DS authentication)
        // Track the conversion now since it wasn't tracked before redirect
        this.trackPaymentCompletion({
          paymentIntent,
          paymentMethod: paymentMethod === 'card' ? 'card_with_3ds' : paymentMethod || 'redirect_success',
          amount: basePrice,
          source: 'redirect_success'
        });
        return;
      }

      // Handle failed payments
      if (paymentIntent && redirectStatus === 'failed') {
        this.showPaymentFailure({
          paymentIntent,
          paymentMethod,
          reason: 'Payment failed during processing'
        });
        
        // Track payment failure
        this.trackPaymentFailure({
          paymentIntent,
          paymentMethod,
          reason: 'redirect_failed',
          source: 'thank_you_page'
        });
        return;
      }

      // Log if we have URL parameters but no clear action
      if (paymentIntent || paymentMethod || multibancoEntity) {
        logger.warn('Payment parameters detected but no clear status', {
          paymentIntent: paymentIntent ? paymentIntent.substring(0, 20) + '...' : null,
          redirectStatus,
          paymentMethod
        });
      }

    } catch (error) {
      logger.error('Error checking payment status from URL', error);
      // Fail gracefully - show default thank you page
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
    try {
      analytics.track('ui_interaction', {
        interaction: 'calendar_add',
        calendar_provider: provider,
        integration_method: method,
        location: 'thank_you_page',
        event_date: '2025-09-20',
        event_name: 'cafe_com_vendas_portugal',
        user_platform: detectUserPlatform()
      });
    } catch {
      logger.debug('Calendar analytics tracking unavailable');
    }
  },

  showMultibancoInstructions(multibancoData: {
    entity?: string | null;
    reference?: string | null;
    paymentIntent?: string | null;
    sessionId?: string | null;
    amount?: number;
  }) {
    const { entity, reference, paymentIntent, sessionId, amount = basePrice } = multibancoData;
    
    logger.info('Displaying Multibanco instructions', {
      hasEntity: !!entity,
      hasReference: !!reference,
      hasPaymentIntent: !!paymentIntent,
      amount
    });
    // Update the badge to reflect Multibanco status
    const badgeText = safeQuery('.font-century.text-base.font-bold');
    if (badgeText) {
      badgeText.textContent = '⏳ Pagamento Multibanco a aguardar';
    }

    // Update the badge container styling for processing state
    const badgeContainer = safeQuery('.from-burgundy-50.to-burgundy-100\\/80');
    if (badgeContainer) {
      badgeContainer.classList.remove('from-burgundy-50', 'to-burgundy-100/80', 'text-burgundy-700', 'border-burgundy-200/40');
      badgeContainer.classList.add('from-amber-50', 'to-amber-100/80', 'text-amber-700', 'border-amber-200/40');
    }

    // Update the progress milestone to show payment as "current" instead of "completed"
    const firstMilestone = safeQuery('[data-milestone="payment"]');
    if (firstMilestone) {
      firstMilestone.classList.remove('from-burgundy-500', 'to-burgundy-700');
      firstMilestone.classList.add('from-gold-400', 'to-gold-600', 'ring-4', 'ring-gold-100');
    }

    // Add Multibanco-specific instructions section
    const mainActionSection = safeQuery('.group.relative.rounded-3xl');
    if (mainActionSection && entity && reference) {
      // Create Multibanco instructions card
      const multibancoCard = document.createElement('div');
      multibancoCard.className = 'mb-8 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border-2 border-amber-200 shadow-md';
      multibancoCard.innerHTML = `
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-white shadow-md">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-lora text-xl font-bold text-amber-900 mb-3">🏦 Complete o seu pagamento Multibanco</h3>
            <p class="text-amber-800 mb-4">Para finalizar a sua inscrição, efetue o pagamento usando os dados abaixo:</p>
            
            <div class="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <div class="space-y-3">
                <div class="flex justify-between items-center pb-3 border-b border-amber-100">
                  <span class="text-sm font-medium text-gray-600">Entidade:</span>
                  <span class="font-mono font-bold text-lg text-amber-900">${entity}</span>
                </div>
                <div class="flex justify-between items-center pb-3 border-b border-amber-100">
                  <span class="text-sm font-medium text-gray-600">Referência:</span>
                  <span class="font-mono font-bold text-lg text-amber-900">${reference}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-gray-600">Valor:</span>
                  <span class="font-bold text-lg text-amber-900">€${amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div class="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p class="text-sm text-amber-800">
                <strong>⏰ Prazo:</strong> O pagamento deve ser efetuado nas próximas 72 horas.<br>
                <strong>✉️ Confirmação:</strong> Receberá um email assim que o pagamento for processado.
              </p>
            </div>
          </div>
        </div>
      `;
      
      // Insert before the main action section
      mainActionSection.parentNode?.insertBefore(multibancoCard, mainActionSection);
    } else {
      // If we don't have entity/reference details, show a generic pending message
      logger.warn('Missing Multibanco voucher details, showing generic pending message', {
        hasEntity: !!entity,
        hasReference: !!reference
      });
      
      this.showGenericPendingPayment({
        paymentIntent,
        sessionId,
        amount
      });
    }

    // Update the main headline to reflect Multibanco status
    const headline = safeQuery('h1.font-lora');
    if (headline) {
      headline.innerHTML = '<span class="text-amber-500">Quase lá!</span> Complete o pagamento<br class="hidden sm:block"/><span class="text-navy-700">para garantir a sua vaga</span>';
    }

    // Update the subtitle
    const subtitle = safeQuery('.max-w-\\[65ch\\] p');
    if (subtitle) {
      subtitle.innerHTML = 'O seu pedido foi registado com sucesso! Agora só precisa de <strong>efetuar o pagamento via Multibanco</strong> usando os dados fornecidos. <span class="font-semibold text-amber-700">Após o pagamento, receberá automaticamente o acesso completo.</span>';
    }
  },

  trackMultibancoVoucherDisplay(data: {
    paymentIntent?: string | null;
    hasEntity: boolean;
    hasReference: boolean;
    paymentMethod?: string;
    amount: number;
  }) {
    const { paymentIntent, hasEntity, hasReference, paymentMethod, amount } = data;
    
    try {
      // Track voucher display event
      analytics.track('payment_flow', {
        event_type: 'multibanco_voucher_displayed',
        payment_intent: paymentIntent ? paymentIntent.substring(0, 20) + '...' : undefined,
        payment_method: paymentMethod || 'multibanco',
        has_entity: hasEntity,
        has_reference: hasReference,
        amount: amount,
        currency: 'EUR',
        page_location: 'thank_you',
        timestamp: new Date().toISOString()
      });
      
      // Track as intermediate conversion step
      analytics.track('conversion_funnel', {
        funnel_step: 'payment_initiated',
        payment_method: 'multibanco',
        voucher_status: hasEntity && hasReference ? 'complete' : 'incomplete',
        amount: amount,
        currency: 'EUR'
      });
      
      logger.info('Multibanco voucher display tracked', {
        hasEntity,
        hasReference,
        amount
      });
    } catch {
      logger.debug('Multibanco voucher analytics tracking unavailable');
    }
  },

  trackPaymentCompletion(data: {
    paymentIntent: string;
    paymentMethod: string;
    amount: number;
    source: string;
  }) {
    const { paymentIntent, paymentMethod, amount, source } = data;
    
    try {
      // Track the main conversion event
      AnalyticsHelpers.trackConversion('purchase_completed', {
        transaction_id: paymentIntent,
        value: amount,
        currency: 'EUR',
        items: [{ name: eventName, quantity: 1, price: amount }],
        pricing_tier: 'early_bird',
        payment_method: paymentMethod,
        completion_source: source
      });
      
      // Track payment flow completion
      analytics.track('payment_flow', {
        event_type: 'purchase_completed',
        payment_intent: paymentIntent.substring(0, 20) + '...',
        payment_method: paymentMethod,
        amount: amount,
        currency: 'EUR',
        completion_source: source,
        page_location: 'thank_you',
        timestamp: new Date().toISOString()
      });
      
      logger.info('Payment completion tracked', {
        paymentIntent: paymentIntent.substring(0, 20) + '...',
        paymentMethod,
        source
      });
    } catch {
      logger.debug('Payment completion analytics tracking unavailable');
    }
  },

  trackPaymentFailure(data: {
    paymentIntent?: string | null;
    paymentMethod?: string | null;
    reason: string;
    source: string;
  }) {
    const { paymentIntent, paymentMethod, reason, source } = data;
    
    try {
      // Track payment failure
      analytics.track('payment_flow', {
        event_type: 'payment_failed',
        payment_intent: paymentIntent ? paymentIntent.substring(0, 20) + '...' : undefined,
        payment_method: paymentMethod || 'unknown',
        failure_reason: reason,
        failure_source: source,
        page_location: 'thank_you',
        timestamp: new Date().toISOString()
      });
      
      // Track conversion funnel dropout
      analytics.track('conversion_funnel', {
        funnel_step: 'payment_failed',
        payment_method: paymentMethod || 'unknown',
        failure_reason: reason,
        dropout_point: source
      });
      
      logger.warn('Payment failure tracked', {
        paymentIntent: paymentIntent ? paymentIntent.substring(0, 20) + '...' : null,
        paymentMethod,
        reason,
        source
      });
    } catch {
      logger.debug('Payment failure analytics tracking unavailable');
    }
  },

  showGenericPendingPayment(paymentData: {
    paymentIntent?: string | null;
    sessionId?: string | null;
    amount: number;
  }) {
    const { paymentIntent, sessionId, amount } = paymentData;
    
    logger.info('Showing generic pending payment message', {
      hasPaymentIntent: !!paymentIntent,
      hasSessionId: !!sessionId,
      amount
    });

    // Update the badge to reflect pending status
    const badgeText = safeQuery('.font-century.text-base.font-bold');
    if (badgeText) {
      badgeText.textContent = '⏳ Pagamento pendente';
    }

    // Update the badge container styling for processing state
    const badgeContainer = safeQuery('.from-burgundy-50.to-burgundy-100\\/80');
    if (badgeContainer) {
      badgeContainer.classList.remove('from-burgundy-50', 'to-burgundy-100/80', 'text-burgundy-700', 'border-burgundy-200/40');
      badgeContainer.classList.add('from-blue-50', 'to-blue-100/80', 'text-blue-700', 'border-blue-200/40');
    }

    // Update the main headline
    const headline = safeQuery('h1.font-lora');
    if (headline) {
      headline.innerHTML = '<span class="text-blue-500">Pagamento em processamento!</span><br class="hidden sm:block"/><span class="text-navy-700">Aguarde a confirmação</span>';
    }

    // Update the subtitle
    const subtitle = safeQuery('.max-w-\\[65ch\\] p');
    if (subtitle) {
      subtitle.innerHTML = 'O seu pagamento está a ser processado. <strong>Receberá uma confirmação por email</strong> assim que o pagamento for aprovado. <span class="font-semibold text-blue-700">Não é necessária nenhuma ação adicional.</span>';
    }
  },

  showMultibancoInstructionsWithFallback(fallbackData: {
    paymentIntent?: string | null;
    sessionId?: string | null;
    amount: number;
    paymentMethod?: string | null;
    leadId?: string | null;
  }) {
    const { paymentIntent, sessionId, amount, paymentMethod, leadId } = fallbackData;
    
    logger.info('Showing Multibanco fallback instructions', {
      hasPaymentIntent: !!paymentIntent,
      hasSessionId: !!sessionId,
      amount,
      paymentMethod,
      hasLeadId: !!leadId
    });

    // Update the badge to reflect Multibanco processing status
    const badgeText = safeQuery('.font-century.text-base.font-bold');
    if (badgeText) {
      badgeText.textContent = '🏦 Referência Multibanco gerada';
    }

    // Update the badge container styling for processing state
    const badgeContainer = safeQuery('.from-burgundy-50.to-burgundy-100\\/80');
    if (badgeContainer) {
      badgeContainer.classList.remove('from-burgundy-50', 'to-burgundy-100/80', 'text-burgundy-700', 'border-burgundy-200/40');
      badgeContainer.classList.add('from-blue-50', 'to-blue-100/80', 'text-blue-700', 'border-blue-200/40');
    }

    // Update the main headline
    const headline = safeQuery('h1.font-lora');
    if (headline) {
      headline.innerHTML = '<span class="text-blue-500">Referência Multibanco gerada!</span><br class="hidden sm:block"/><span class="text-navy-700">Complete o pagamento</span>';
    }

    // Update the subtitle with Multibanco-specific instructions
    const subtitle = safeQuery('.max-w-\\[65ch\\] p');
    if (subtitle) {
      subtitle.innerHTML = 'A sua referência Multibanco foi gerada com sucesso. <strong>Consulte o seu email</strong> para obter os detalhes completos da referência ou contacte-nos caso não tenha recebido. <span class="font-semibold text-blue-700">O pagamento deve ser efetuado nas próximas 72 horas.</span>';
    }

    // Add fallback Multibanco instructions section
    const mainActionSection = safeQuery('.group.relative.rounded-3xl');
    if (mainActionSection) {
      // Create fallback Multibanco card
      const multibancoCard = document.createElement('div');
      multibancoCard.className = 'mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 shadow-md';
      multibancoCard.innerHTML = `
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 7.89a1 1 0 001.42 0L21 7M5 12l6 6 6-6" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-lora text-xl font-bold text-blue-900 mb-3">🏦 Pagamento Multibanco Pendente</h3>
            <div class="bg-white rounded-xl p-5 border border-blue-200 shadow-sm mb-4">
              <div class="space-y-3">
                <div class="flex justify-between items-center pb-3 border-b border-blue-100">
                  <span class="text-sm font-medium text-gray-600">Valor:</span>
                  <span class="font-bold text-lg text-blue-900">€${amount.toFixed(2)}</span>
                </div>
                <div class="flex justify-between items-center pb-3 border-b border-blue-100">
                  <span class="text-sm font-medium text-gray-600">Estado:</span>
                  <span class="font-semibold text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">A processar</span>
                </div>
                ${paymentIntent ? `<div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-gray-600">Referência:</span>
                  <span class="font-mono text-xs text-gray-600">${paymentIntent.substring(0, 20)}...</span>
                </div>` : ''}
              </div>
            </div>
            
            <div class="space-y-3">
              <div class="p-4 bg-blue-600 text-white rounded-xl">
                <h6 class="font-semibold mb-2 flex items-center gap-2">
                  <span>📧</span>
                  Próximos passos:
                </h6>
                <ol class="text-sm space-y-1 list-decimal list-inside">
                  <li>Verifique o seu email para obter a entidade e referência</li>
                  <li>Use os dados no seu homebanking ou ATM Multibanco</li>
                  <li>Aguarde a confirmação automática após o pagamento</li>
                </ol>
              </div>
              
              <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p class="text-sm text-amber-800">
                  <strong>📞 Precisa de ajuda?</strong> Contacte-nos através do WhatsApp caso não receba o email com os detalhes da referência.
                </p>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Insert before the main action section
      mainActionSection.parentNode?.insertBefore(multibancoCard, mainActionSection);
    }
  },

  showPaymentFailure(failureData: {
    paymentIntent?: string | null;
    paymentMethod?: string | null;
    reason?: string;
  }) {
    const { paymentIntent, paymentMethod, reason } = failureData;
    
    logger.warn('Showing payment failure message', {
      hasPaymentIntent: !!paymentIntent,
      paymentMethod,
      reason
    });

    // Update the badge to reflect failure status
    const badgeText = safeQuery('.font-century.text-base.font-bold');
    if (badgeText) {
      badgeText.textContent = '❌ Pagamento falhado';
    }

    // Update the badge container styling for error state
    const badgeContainer = safeQuery('.from-burgundy-50.to-burgundy-100\\/80');
    if (badgeContainer) {
      badgeContainer.classList.remove('from-burgundy-50', 'to-burgundy-100/80', 'text-burgundy-700', 'border-burgundy-200/40');
      badgeContainer.classList.add('from-red-50', 'to-red-100/80', 'text-red-700', 'border-red-200/40');
    }

    // Update the main headline
    const headline = safeQuery('h1.font-lora');
    if (headline) {
      headline.innerHTML = '<span class="text-red-500">Houve um problema</span><br class="hidden sm:block"/><span class="text-navy-700">com o seu pagamento</span>';
    }

    // Update the subtitle with retry options
    const subtitle = safeQuery('.max-w-\\[65ch\\] p');
    if (subtitle) {
      subtitle.innerHTML = `Infelizmente o seu pagamento não pôde ser processado. <strong>Por favor, tente novamente</strong> ou contacte-nos para assistência. ${reason ? `<span class="text-sm text-red-600">Motivo: ${reason}</span>` : ''}`;
    }
  }

};
