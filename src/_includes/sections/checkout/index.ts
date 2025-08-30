/**
 * Checkout Section Component for Café com Vendas
 * Co-located checkout behavior using platform modal components
 * Two-step modal checkout: Lead capture (MailerLite) + Stripe Payment Elements
 */

import { loadStripe } from '@stripe/stripe-js';
import type {
  Stripe,
  StripeElements,
  StripePaymentElement,
  StripePaymentElementChangeEvent
} from '@stripe/stripe-js';
import { 
  getPaymentIntentId, 
  getPaymentIntentStatus,
  getPaymentIntentAmount,
  getPaymentIntentMetadata,
  isStripePaymentIntent,
  hasMultibancoDetails,
  getMultibancoDetails
} from '../../../types/stripe.js';
import { ENV } from '../../../assets/js/config/constants.js';
import { safeQuery } from '../../../utils/dom.js';
import { logger } from '../../../utils/logger.js';
import type { Component } from '../../../types/components/base.js';
import siteData from '../../../_data/site.js';
import { 
  BehaviorTracker, 
  getUserEnvironment, 
  getAttributionData,
  type BehaviorData,
  type UserEnvironment,
  type AttributionData 
} from '../../../utils/browser-data.js';
import { isValidEmail, isValidPhone } from '../../../utils/validation.js';

// 🎯 Get centralized pricing data - SINGLE SOURCE OF TRUTH
const site = siteData();
const eventPricing = site.event.pricing;
const basePrice = eventPricing.basePrice;
const priceInCents = eventPricing.tiers[0].priceInCents;
const eventName = site.event.name;

// API Response types
interface PaymentIntentResponse {
  clientSecret: string;
  id?: string;
  status?: string;
}

interface PaymentErrorResponse {
  error: string;
  details?: Record<string, unknown>;
}


interface CheckoutSectionComponent extends Component {
  modal: HTMLDialogElement | null;
  stripe: Stripe | null;
  elements: StripeElements | null;
  paymentElement: StripePaymentElement | null;
  clientSecret: string | null;
  leadId: string | null;
  leadData: { fullName: string; email: string; countryCode: string; phone: string } | null;
  currentStep: number | string;
  idempotencyKey: string | null;
  stripeLoaded: boolean;
  stripeLoadPromise: Promise<Stripe | null> | null;
  pendingRedirect: boolean;
  redirectTimeoutId: number | null;
  behaviorTracker: BehaviorTracker | null;

  initializeCheckout(): void;
  performInitialization(): void;
  setupCheckoutTriggers(): void;
  setupModalBehavior(): void;
  loadStripeScript(): Promise<Stripe | null>;
  preloadStripe(): Promise<void>;
  initializeStripe(): Promise<void>;
  initializePaymentElement(): Promise<void>;
  handleLeadSubmit(event: Event): Promise<void>;
  handlePayment(): Promise<void>;
  handleOpenClick(event: Event): void;
  handleModalClose(): void;
  handleBackdropClick(event: Event): void;
  getSourceSection(): string;
  showError(elementId: string, message: string): void;
  setStep(step: number | string): void;
  resetForm(): void;
  resetModalState(): void;
  generateUUID(): string;
  generateIdempotencyKey(): string;
  translateStripeError(message: string): string;
  showMultibancoInstructions(paymentIntent: unknown): void;
  createBackdrop(): void;
  removeBackdrop(): void;
  calculateLeadScore(behaviorData: BehaviorData, attributionData: AttributionData, userEnvironment: UserEnvironment): number;
}

export const Checkout: CheckoutSectionComponent = {
  modal: null,
  stripe: null,
  elements: null,
  paymentElement: null,
  clientSecret: null,
  leadId: null,
  leadData: null, // Store lead form data for payment intent
  currentStep: 1,
  idempotencyKey: null,
  stripeLoaded: false,
  stripeLoadPromise: null,
  pendingRedirect: false,
  redirectTimeoutId: null,
  behaviorTracker: null,

  init(): void {
    try {
      // Ensure DOM is fully loaded before initialization
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', this.performInitialization.bind(this));
      } else {
        this.performInitialization();
      }
    } catch (error) {
      logger.error('Error initializing Checkout section:', error);
    }
  },

  performInitialization(): void {
    this.initializeCheckout();
    this.setupCheckoutTriggers();
    this.setupModalBehavior();
    
    // Initialize behavior tracking
    this.behaviorTracker = new BehaviorTracker();
  },

  initializeCheckout(): void {
    // Get dialog element for native HTML5 dialog API
    this.modal = safeQuery('#checkoutModal') as HTMLDialogElement;

    if (!this.modal) {
      logger.error('Modal element not found');
      return;
    }

    // Initialize application state
    this.currentStep = 1;
    this.clientSecret = null;
    this.leadId = this.generateUUID();
    this.idempotencyKey = this.generateIdempotencyKey();

    // Set initial UI state
    this.setStep(1);
  },

  setupCheckoutTriggers(): void {
    // Setup triggers using platform modal utils
    document.addEventListener('click', (e) => {
      const triggerButton = (e.target as HTMLElement).closest('[data-checkout-trigger]');
      if (triggerButton) {
        e.preventDefault();
        this.handleOpenClick(e);
      }
    });
  },

  setupModalBehavior(): void {
    if (!this.modal) return;

    // Lead form submission
    const leadForm = safeQuery('#leadForm');
    if (leadForm) {
      leadForm.addEventListener('submit', (event: Event) => {
        this.handleLeadSubmit(event).catch(error => {
          logger.error('Error handling lead submit:', error);
        });
      });
      // Mark form as initialized for e2e tests
      leadForm.setAttribute('data-checkout-initialized', 'true');
    }

    // Payment button
    const payButton = safeQuery('#payBtn');
    payButton?.addEventListener('click', () => {
      this.handlePayment().catch(error => {
        logger.error('Error handling payment:', error);
      });
    });

    // Use native dialog close event instead of manual handling
    this.modal.addEventListener('close', () => {
      this.handleModalClose();
    });

    // Manual close button
    const closeButton = safeQuery('#closeCheckout');
    closeButton?.addEventListener('click', () => {
      this.modal?.close();
    });

    // Close on backdrop click (native dialog behavior)
    this.modal.addEventListener('click', this.handleBackdropClick.bind(this));
  },

  handleOpenClick(event: Event): void {
    event.preventDefault();

    if (!this.modal) {
      logger.error('Modal not initialized');
      return;
    }

    // Block background scrolling
    document.body.style.overflow = 'hidden';
    
    // Create custom backdrop to avoid top-layer issues
    this.createBackdrop();
    
    // One-frame reveal technique to prevent position flash
    this.modal.style.visibility = 'hidden';
    this.modal.show();
    requestAnimationFrame(() => {
      if (this.modal) {
        this.modal.style.visibility = 'visible';
      }
    });

    // 🚀 OPTIMIZATION: Preload Stripe.js immediately when modal opens
    // This eliminates 200-500ms delay later when transitioning to payment step
    this.preloadStripe().catch((error) => {
      logger.warn('Stripe preloading failed, will fallback to lazy loading:', error);
    });

    // Track checkout opened (GTM production event + test alias)
    import('../../../components/ui/analytics/index.js').then(({ PlatformAnalytics }) => {
      // Use new method that fires both events
      PlatformAnalytics.trackCTAClick(this.getSourceSection(), {
        trigger_location: this.getSourceSection(),
        action: 'modal_opened'
      });
    }).catch(() => {
      logger.debug('Checkout modal analytics tracking unavailable');
    });
  },

  getSourceSection(): string {
    const trigger = document.querySelector('[data-checkout-trigger]:focus');
    if (trigger) {
      const section = trigger.closest('section');
      if (section?.id) {
        return section.id;
      }
    }
    return 'unknown';
  },

  handleModalClose(): void {
    // Prevent modal closure if redirect is pending
    if (this.pendingRedirect) {
      logger.info('Modal close prevented: redirect pending for async payment');
      return;
    }
    
    // Restore background scrolling
    document.body.style.overflow = '';
    
    // Remove custom backdrop
    this.removeBackdrop();
    
    // Clean application state when modal closes (via any method)
    this.resetForm();
    this.resetModalState();
  },

  createBackdrop(): void {
    // Remove existing backdrop if present
    this.removeBackdrop();
    
    // Create backdrop element
    const backdrop = document.createElement('div');
    backdrop.id = 'checkoutBackdrop';
    backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm';
    backdrop.style.zIndex = '9998';
    backdrop.style.animation = 'backdropFadeIn 200ms ease-out';
    
    // Handle backdrop click to close modal
    backdrop.addEventListener('click', (e) => {
      // Only close if clicking directly on backdrop (not its children)
      if (e.target === backdrop) {
        this.modal?.close();
      }
    });
    
    // Add backdrop to document
    document.body.appendChild(backdrop);
  },

  removeBackdrop(): void {
    const backdrop = document.getElementById('checkoutBackdrop');
    if (backdrop) {
      backdrop.remove();
    }
  },

  handleBackdropClick(event: Event): void {
    // Only close if clicking directly on the dialog element (backdrop)
    if (event.target === this.modal) {
      this.modal?.close();
    }
  },

  async loadStripeScript(): Promise<Stripe | null> {
    if (this.stripeLoadPromise) {
      return this.stripeLoadPromise;
    }

    if (this.stripeLoaded && this.stripe) {
      return Promise.resolve(this.stripe);
    }

    this.stripeLoadPromise = loadStripe(ENV.stripe.publishableKey);
    
    try {
      this.stripe = await this.stripeLoadPromise;
      this.stripeLoaded = true;
      
      if (!this.stripe) {
        throw new Error('Failed to load Stripe.js');
      }
      
      return this.stripe;
    } catch (error) {
      this.stripeLoadPromise = null;
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  async preloadStripe(): Promise<void> {
    // 🚀 OPTIMIZATION: Preload Stripe.js without waiting for it to complete
    // This starts the download early while user is interacting with step 1
    if (!this.stripeLoaded && !this.stripeLoadPromise) {
      
      if (!ENV.stripe.publishableKey) {
        logger.warn('Stripe publishable key not configured, skipping preload');
        return;
      }

      // Start loading Stripe but don't await - let it load in background
      this.stripeLoadPromise = loadStripe(ENV.stripe.publishableKey);
      
      // Optionally await to ensure it's loaded (non-blocking for modal open)
      try {
        this.stripe = await this.stripeLoadPromise;
        this.stripeLoaded = true;
      } catch (error) {
        logger.warn('⚠️ Stripe.js preload failed, will retry on demand:', error);
        this.stripeLoadPromise = null;
      }
    }
  },

  async initializeStripe(): Promise<void> {
    if (!ENV.stripe.publishableKey) {
      // Graceful degradation for missing key (e.g., in test environments)
      logger.error('❌ Stripe publishable key not configured');
      
      // Show user-friendly error message
      const errorContainer = document.getElementById('checkout-error');
      if (errorContainer) {
        errorContainer.textContent = 'Payment system is currently unavailable. Please try again later.';
        errorContainer.classList.remove('hidden');
      }
      
      // Disable payment button
      const submitButton = document.getElementById('submit-payment') as HTMLButtonElement;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Payment Unavailable';
      }
      
      throw new Error('Stripe publishable key not configured');
    }

    // Use preloaded Stripe instance if available, otherwise load on demand
    if (!this.stripe) {
      this.stripe = await this.loadStripeScript();
    }
    
    if (!this.stripe) {
      throw new Error('Failed to initialize Stripe');
    }
  },

  async initializePaymentElement(): Promise<void> {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    try {
      // Ensure we have lead data
      if (!this.leadData) {
        throw new Error('Lead data not available');
      }

      // Create PaymentIntent for this checkout
      if (!this.clientSecret) {
        
        // Generate fresh idempotency key for each payment attempt to avoid conflicts during testing
        this.idempotencyKey = this.generateIdempotencyKey();
        
        // Prepare request payload
        const requestPayload = {
          // Required fields for Netlify Function
          lead_id: this.leadId,
          full_name: this.leadData.fullName,
          email: this.leadData.email,
          phone: `${this.leadData.countryCode}${this.leadData.phone}`,
          amount: priceInCents, // From centralized pricing
          currency: 'eur',
          idempotency_key: this.idempotencyKey
        };

        // Prepare headers with proper type handling
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };

        if (this.idempotencyKey) {
          headers['X-Idempotency-Key'] = this.idempotencyKey;
        }

        // Create PaymentIntent on demand
        const response = await fetch(`${ENV.urls.base}/.netlify/functions/create-payment-intent`, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestPayload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Network error' })) as PaymentErrorResponse;

          // If validation failed, show specific validation errors to user
          if (errorData.error === 'Validation failed' && errorData.details) {
            logger.error('Validation errors:', errorData.details);
          }

          throw new Error(`Payment service error: ${errorData.error || response.statusText}`);
        }

        const data = await response.json() as PaymentIntentResponse;
        this.clientSecret = data.clientSecret;
      }

      // Create Elements instance with proper Dashboard integration
      this.elements = this.stripe.elements({
        clientSecret: this.clientSecret,
        locale: 'pt', // Portuguese locale for Portugal market
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#7f1d1d', // burgundy-700 to match brand
            colorBackground: '#ffffff',
            colorText: '#1e293b', // navy-800
            colorDanger: '#dc2626',
            fontFamily: 'Inter, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '12px', // Matching rounded-xl
            fontSizeBase: '16px'
          },
          rules: {
            '.Tab': {
              border: '1px solid #e5e7eb',
              boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02)'
            },
            '.Tab:hover': {
              color: '#7f1d1d'
            },
            '.Tab--selected': {
              borderColor: '#7f1d1d',
              boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02), 0 0 0 2px #fef2f2'
            },
            '.Input': {
              borderRadius: '12px'
            }
          }
        }
      });

      // Create Payment Element with Dashboard control enabled
      // This will automatically show payment methods configured in Stripe Dashboard
      // Using type assertion due to TypeScript definitions not fully covering latest Stripe.js features
      this.paymentElement = this.elements.create('payment' as const, {
        layout: {
          type: 'tabs', // Show tabs for each payment method (cards, Multibanco, SEPA, etc.)
          defaultCollapsed: false
          // Removed incompatible options (radios, spacedAccordionItems) that only work with 'accordion' layout
        },
        defaultValues: {
          billingDetails: {
            email: this.leadData.email,
            name: this.leadData.fullName,
            address: {
              country: 'PT' // Default to Portugal for better Multibanco visibility
            }
          }
        },
        fields: {
          billingDetails: {
            email: 'never', // We already have it from lead form
            phone: 'never',  // We already have it from lead form
            name: 'never',   // We already have it from lead form
            address: {
              country: 'auto' // Auto-detect country but allow change
            }
          }
        },
        // Terms acceptance for European payment methods
        terms: {
          bancontact: 'always',
          card: 'never',
          ideal: 'always',
          sepaDebit: 'always',
          sofort: 'always'
        },
        // Payment method order preference (Multibanco will show prominently for PT customers)
        paymentMethodOrder: ['card', 'multibanco']
      });

      // Mount the Payment Element to the container
      const paymentElementContainer = document.querySelector('#payment-element');
      
      if (paymentElementContainer && this.paymentElement) {
        this.paymentElement.mount('#payment-element');

        // Hide skeleton loader and show payment element
        const skeleton = document.querySelector('#payment-skeleton');
        if (skeleton) {
          skeleton.classList.add('hidden');
        }
        
        // Show the payment element container
        paymentElementContainer.classList.remove('hidden');

        // Listen for changes to enable/disable pay button
        this.paymentElement?.on('change', (event: StripePaymentElementChangeEvent) => {
          const payBtn = document.querySelector('#payBtn') as HTMLButtonElement;
          if (payBtn) {
            payBtn.disabled = !event.complete;
          }

          // Clear any previous errors when user starts typing/selecting
          if (event.complete) {
            const payError = document.querySelector('#payError');
            if (payError) {
              payError.classList.add('hidden');
            }
          }
        });

        // Handle ready event to show payment methods loaded
        this.paymentElement?.on('ready', () => {
          // Ensure skeleton is hidden and payment element is visible when ready
          const skeleton = document.querySelector('#payment-skeleton');
          if (skeleton) {
            skeleton.classList.add('hidden');
          }
          
          // Ensure payment element container is visible
          const paymentContainer = document.querySelector('#payment-element');
          if (paymentContainer) {
            paymentContainer.classList.remove('hidden');
          }
        });

        // Handle focus events
        this.paymentElement?.on('focus', () => {
          // Clear errors when user focuses on payment form
          const payError = document.querySelector('#payError');
          if (payError) {
            payError.classList.add('hidden');
          }
        });
      }
    } catch (error) {
      logger.error('Error initializing payment element:', error);

      // Show specific error messages based on the type of error
      let errorMessage = 'Erro ao carregar formulário de pagamento.';

      if (error instanceof Error) {
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Problema de conexão. Verifique sua internet e tente novamente.';
        } else if (error.message.includes('Payment service')) {
          errorMessage = 'Serviço de pagamento temporariamente indisponível. Tente novamente em instantes.';
        }
      }

      this.showError('payError', errorMessage);

      // Disable the payment button
      const payBtn = document.querySelector('#payBtn') as HTMLButtonElement;
      if (payBtn) {
        payBtn.disabled = true;
      }
    }
  },


  async handleLeadSubmit(event: Event): Promise<void> {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const leadData = {
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      countryCode: formData.get('countryCode') as string,
      phone: formData.get('phone') as string
    };


    // Store lead data for use in payment intent creation
    this.leadData = leadData;

    // Basic validation
    if (!leadData.fullName || !leadData.email || !leadData.phone) {
      this.showError('leadError', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!isValidEmail(leadData.email)) {
      this.showError('leadError', 'Por favor, insira um email válido.');
      return;
    }

    if (!isValidPhone(leadData.phone)) {
      this.showError('leadError', 'Por favor, insira um número de telefone válido (apenas números, espaços e traços).');
      return;
    }

    try {
      // Show loading state
      const submitBtn = form.querySelector('#leadSubmit');
      const submitSpinner = submitBtn?.querySelector('#leadSubmitSpinner') as HTMLElement | null;

      if (submitBtn) (submitBtn as HTMLButtonElement).disabled = true;
      if (submitSpinner) submitSpinner.classList.remove('hidden');

      // Submit lead to MailerLite for immediate capture
      try {
        // Collect rich user data
        const userEnvironment = getUserEnvironment();
        const attributionData = getAttributionData();
        const behaviorData = this.behaviorTracker?.getBehaviorData() || {
          timeOnPage: 0,
          scrollDepth: 0,
          sectionsViewed: [],
          pageViews: 1,
          isReturningVisitor: false,
          sessionDuration: 0
        };
        
        const mailerlitePayload = {
          // Basic lead info
          lead_id: this.leadId,
          full_name: leadData.fullName,
          email: leadData.email,
          phone: `${leadData.countryCode}${leadData.phone}`,
          page: 'checkout_modal',
          
          // Core high-leverage fields
          preferred_language: userEnvironment.language,
          city: 'unknown', // Will be enhanced with geolocation later
          country: leadData.countryCode,
          timezone: userEnvironment.timezone,
          business_stage: 'unknown', // Future: add form field
          business_type: 'unknown', // Future: add form field
          primary_goal: 'unknown', // Future: add form field
          main_challenge: 'unknown', // Future: add form field
          
          // Intent & lifecycle
          event_interest: 'cafe_com_vendas_lisbon_2025-09-20',
          intent_signal: 'started_checkout',
          lead_score: this.calculateLeadScore(behaviorData, attributionData, userEnvironment),
          signup_page: window.location.pathname,
          referrer_domain: attributionData.referrer_domain,
          
          // Attribution data
          utm_source: attributionData.utm_source,
          utm_medium: attributionData.utm_medium,
          utm_campaign: attributionData.utm_campaign,
          utm_content: attributionData.utm_content,
          utm_term: attributionData.utm_term,
          first_utm_source: sessionStorage.getItem('first_utm_source'),
          first_utm_campaign: sessionStorage.getItem('first_utm_campaign'),
          referrer: attributionData.referrer,
          landing_page: attributionData.landing_page,
          
          // Device & browser data
          device_type: userEnvironment.deviceInfo.type,
          device_brand: userEnvironment.deviceInfo.brand,
          browser_name: userEnvironment.browserInfo.name,
          browser_version: userEnvironment.browserInfo.version,
          screen_resolution: userEnvironment.screenResolution,
          viewport_size: userEnvironment.viewportSize,
          
          // Behavioral data
          time_on_page: behaviorData.timeOnPage,
          scroll_depth: behaviorData.scrollDepth,
          sections_viewed: behaviorData.sectionsViewed.join(','),
          page_views: behaviorData.pageViews,
          is_returning_visitor: behaviorData.isReturningVisitor,
          session_duration: behaviorData.sessionDuration
        };

        const mailerliteResponse = await fetch(`${ENV.urls.base}/.netlify/functions/mailerlite-lead`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mailerlitePayload)
        });

        if (mailerliteResponse.ok) {
          const mailerliteResult = await mailerliteResponse.json() as {
            success: boolean;
            leadId: string;
            email: string;
            mailerlite: {
              success: boolean;
              action?: string;
              reason?: string;
            };
          };
          logger.info('Lead successfully submitted to MailerLite', {
            leadId: this.leadId,
            email: leadData.email,
            mailerliteSuccess: mailerliteResult.mailerlite.success
          });
        } else {
          logger.warn('MailerLite lead submission failed', {
            status: mailerliteResponse.status,
            leadId: this.leadId,
            email: leadData.email
          });
        }
      } catch (mailerliteError) {
        // Non-blocking error - don't prevent user from proceeding
        logger.warn('MailerLite API call failed, continuing with checkout', {
          error: mailerliteError instanceof Error ? mailerliteError.message : 'Unknown error',
          leadId: this.leadId,
          email: leadData.email
        });
      }

      // Simulate brief processing delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));

      this.setStep(2);

      // Initialize Stripe if not already loaded
      if (!this.stripeLoaded) {
        await this.initializeStripe();
      }

      // Initialize Stripe Elements for payment form
      await this.initializePaymentElement();

      // Track lead conversion (GTM production event + test alias)
      import('../../../components/ui/analytics/index.js').then(({ PlatformAnalytics }) => {
        // Fire the GTM production event
        PlatformAnalytics.trackConversion('lead_form_submitted', {
          lead_id: this.leadId,
          form_location: 'checkout_modal',
          pricing_tier: 'early_bird'
        });
        
        // Fire test alias for E2E compatibility
        PlatformAnalytics.track('form_submission', {
          section: 'checkout',
          action: 'lead_submitted',
          lead_id: this.leadId
        });
      }).catch(() => {
        logger.debug('Lead submission analytics tracking unavailable');
      });
    } catch (error: unknown) {
      logger.error('Lead submission error:', error);
      this.showError('leadError', 'Erro ao processar inscrição. Tente novamente.');
    } finally {
      // Reset loading state
      const submitBtn = form.querySelector('#leadSubmit');
      const submitSpinner = submitBtn?.querySelector('#leadSubmitSpinner') as HTMLElement | null;

      if (submitBtn) (submitBtn as HTMLButtonElement).disabled = false;
      if (submitSpinner) submitSpinner.classList.add('hidden');
    }
  },

  async handlePayment(): Promise<void> {

    if (!this.stripe || !this.elements || !this.clientSecret) {
      this.showError('payError', 'Erro no sistema de pagamento. Recarregue a página.');
      return;
    }

    // Show loading state
    const payBtn = document.querySelector('#payBtn');
    const payBtnText = payBtn?.querySelector('#payBtnText') as HTMLElement | null;
    const payBtnSpinner = payBtn?.querySelector('#payBtnSpinner') as HTMLElement | null;

    // Store original text to restore later
    const originalText = payBtnText?.textContent || '';

    try {
      if (payBtn) (payBtn as HTMLButtonElement).disabled = true;
      if (payBtnText) {
        payBtnText.textContent = 'Processando pagamento...';
        // Ensure text is visible by explicitly setting opacity and display
        payBtnText.style.opacity = '1';
        payBtnText.style.display = 'inline';
        logger.debug('Payment button text changed to:', payBtnText.textContent);
      }
      if (payBtnSpinner) payBtnSpinner.classList.remove('hidden');

      // Confirm the payment with Stripe using the Payment Element
      // This handles all payment methods configured in Dashboard (cards, SEPA, iDEAL, MB Way, etc.)
      const { error, paymentIntent } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: `${window.location.origin}/thank-you`,
          payment_method_data: {
            billing_details: {
              name: this.leadData!.fullName,
              email: this.leadData!.email,
              phone: `${this.leadData!.countryCode}${this.leadData!.phone}`
            }
          }
        },
        redirect: 'if_required' // Stay on page if possible, redirect if required (e.g., for SEPA/3DS)
      });

      if (error) {
        // Show localized error message
        const errorMessage = this.translateStripeError(error.message || 'Erro no pagamento');
        this.showError('payError', errorMessage);

        // Track payment error
        import('../../../components/ui/analytics/index.js').then(({ PlatformAnalytics }) => {
          PlatformAnalytics.track('section_engagement', {
            section: 'checkout',
            action: 'payment_error',
            error_type: error.type,
            error_code: error.code
          });
        }).catch(() => {
          logger.debug('Payment error analytics tracking unavailable');
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded without redirect (no 3DS required)
        this.setStep('success');

        // Track payment success immediately since we know it succeeded
        import('../../../components/ui/analytics/index.js').then(({ PlatformAnalytics }) => {
          PlatformAnalytics.trackConversion('payment_completed', {
            transaction_id: paymentIntent.id,
            value: basePrice, // 🎯 From centralized pricing
            currency: 'EUR',
            items: [{ name: eventName, quantity: 1, price: basePrice }], // 🎯 From centralized data
            pricing_tier: 'early_bird'
          });
        }).catch(() => {
          logger.debug('Payment completion analytics tracking unavailable');
        });

        // Auto-redirect after success
        setTimeout(() => {
          window.location.href = '/thank-you';
        }, 3000);
      } else if (paymentIntent && paymentIntent.status === 'processing') {
        // Payment is processing (typical for Multibanco and other async payment methods)
        const paymentMethodTypes = (paymentIntent as { payment_method_types?: string[] }).payment_method_types;
        const paymentMethod = paymentMethodTypes?.[0] || 'unknown';
        
        logger.info('Payment processing initiated', {
          paymentMethod,
          paymentIntentId: paymentIntent.id,
          hasNextAction: !!paymentIntent.next_action,
          nextActionType: paymentIntent.next_action?.type
        });
        
        // For Multibanco, display voucher details in our modal following Stripe best practices
        if (paymentMethod === 'multibanco' || paymentIntent.next_action?.type === 'multibanco_display_details') {
          // Add a visual indicator that we're transitioning to voucher display
          if (payBtnText) {
            payBtnText.textContent = 'Gerando referência Multibanco...';
          }
          
          // Small delay to ensure payment step cleanup before showing voucher
          setTimeout(() => {
            // Show success step with Multibanco voucher details in our modal
            this.setStep('success');
            
            // Display Multibanco voucher details using the dedicated method
            this.showMultibancoInstructions(paymentIntent);
            
            logger.info('Multibanco payment initiated - displaying voucher details in checkout modal');
          }, 200);
        } else {
          // For other async methods, show success state in our modal
          this.setStep('success');
          
          // Generic processing message for other async methods
          const successTitle = document.querySelector('#successTitle');
          const successMessage = document.querySelector('#successMessage');
          if (successTitle) successTitle.textContent = 'Processando pagamento...';
          if (successMessage) successMessage.textContent = 'Você será redirecionado em breve...';
        }

        // Track payment initiation (not completion yet)
        import('../../../components/ui/analytics/index.js').then(({ PlatformAnalytics }) => {
          PlatformAnalytics.track('section_engagement', {
            section: 'checkout',
            action: 'payment_processing',
            payment_method: paymentMethod,
            payment_intent_id: paymentIntent.id,
            lead_id: this.leadId
          });
        }).catch(() => {
          logger.debug('Payment processing analytics tracking unavailable');
        });

        // Enhanced redirect logic with better URL parameter handling
        // @ts-expect-error - Complex Stripe response type handling
        this.handleAsyncPaymentRedirect(paymentIntent, paymentMethod || 'unknown');
      } else {
        // Payment requires additional action (3DS, SEPA redirect, etc.)
        // User will be redirected automatically by Stripe
        // Analytics will be tracked on the thank-you page after redirect
      }
    } catch (error: unknown) {
      logger.error('Payment error:', error);
      this.showError('payError', 'Erro no processamento do pagamento. Tente novamente.');
    } finally {
      // Reset loading state
      if (payBtn) (payBtn as HTMLButtonElement).disabled = false;
      if (payBtnText) {
        payBtnText.textContent = originalText;
        // Ensure text remains visible after reset
        payBtnText.style.opacity = '1';
        payBtnText.style.display = 'inline';
        logger.debug('Payment button text restored to:', payBtnText.textContent);
      }
      if (payBtnSpinner) payBtnSpinner.classList.add('hidden');
    }
  },

  setStep(step: number | string): void {
    this.currentStep = step;

    const leadForm = safeQuery('#leadForm');
    const paymentStep = safeQuery('#paymentStep');
    const paymentSuccess = safeQuery('#paymentSuccess');
    const progressBar = safeQuery('#progressBar');

    // Force hide all steps with explicit display and visibility control
    const allSteps = [leadForm, paymentStep, paymentSuccess];
    allSteps.forEach(element => {
      if (element) {
        element.classList.add('hidden');
        // Ensure proper z-index reset
        (element as HTMLElement).style.zIndex = '';
      }
    });

    // Add small delay for better transition when moving to success step from payment
    const showStep = () => {
      if (step === 1) {
        leadForm?.classList.remove('hidden');
        progressBar?.classList.remove('w-full');
        progressBar?.classList.add('w-1/2');
      } else if (step === 2) {
        paymentStep?.classList.remove('hidden');
        progressBar?.classList.remove('w-1/2');
        progressBar?.classList.add('w-full');
      } else if (step === 'success') {
        paymentSuccess?.classList.remove('hidden');
        // Ensure success step has proper z-index for Multibanco instructions
        if (paymentSuccess) {
          (paymentSuccess as HTMLElement).style.zIndex = '20';
        }
        progressBar?.classList.add('w-full');
      }
    };

    // For success step transitions (especially from payment), add small delay
    if (step === 'success' && this.currentStep === 2) {
      setTimeout(showStep, 50);
    } else {
      showStep();
    }
  },

  showError(elementId: string, message: string): void {
    const errorElement = safeQuery(`#${elementId}`);
    if (errorElement && message) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
    }
  },

  resetForm(): void {
    // Reset form inputs
    const form = safeQuery('#leadForm');
    (form as HTMLFormElement)?.reset();

    // Hide all error messages
    const leadError = safeQuery('#leadError');
    const payError = safeQuery('#payError');

    leadError?.classList.add('hidden');
    payError?.classList.add('hidden');

    // Reset all button states
    const leadSubmit = safeQuery('#leadSubmit');
    const leadSubmitSpinner = safeQuery('#leadSubmitSpinner');

    if (leadSubmit) (leadSubmit as HTMLButtonElement).disabled = false;
    if (leadSubmitSpinner) leadSubmitSpinner.classList.add('hidden');

    const payBtn = safeQuery('#payBtn');
    const payBtnSpinner = safeQuery('#payBtnSpinner');

    if (payBtn) (payBtn as HTMLButtonElement).disabled = true;
    if (payBtnSpinner) payBtnSpinner.classList.add('hidden');
  },

  generateUUID(): string {
    if (crypto?.randomUUID) {
      // Use native crypto.randomUUID() which produces format: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      // Backend accepts [a-zA-Z0-9\-_]{8,} so this should pass validation
      return crypto.randomUUID();
    }

    // Fallback: create UUID-like string with only valid characters [a-zA-Z0-9\-_]
    // Generate a longer string to ensure it's unique and matches backend validation
    const timestamp = Date.now().toString(36); // Base36 encoding of timestamp
    const random1 = Math.random().toString(36).substr(2, 8); // 8 random chars
    const random2 = Math.random().toString(36).substr(2, 8); // 8 more random chars
    return `lead-${timestamp}-${random1}-${random2}`;
  },

  generateIdempotencyKey(): string {
    // Enhanced idempotency key with test environment isolation and crypto-level randomness
    const now = Date.now();
    const microTime = performance.now().toString().replace('.', '');
    const randomSuffix = Math.random().toString(36).substr(2, 15);
    const sessionId = Math.random().toString(36).substr(2, 8);
    
    // Detect test environment and add test-specific prefixes to prevent collisions
    const isTestEnvironment = typeof window !== 'undefined' && 
      (window.location?.hostname === 'localhost' || 
       window.navigator?.webdriver || 
       window.location?.port === '8888');
    
    // Add extra entropy and test isolation
    const extraEntropy = typeof window !== 'undefined' 
      ? (window.crypto?.getRandomValues 
          ? Array.from(window.crypto.getRandomValues(new Uint8Array(6)))
              .map(b => b.toString(36)).join('')
          : Math.random().toString(36).substr(2, 10))
      : Math.random().toString(36).substr(2, 10);
    
    // Generate unique worker/test identifier for test environments
    const testPrefix = isTestEnvironment 
      ? `test_${Math.random().toString(36).substr(2, 6)}_`
      : '';
    
    // Include page navigation count for additional uniqueness in rapid test scenarios
    const navCount = typeof window !== 'undefined' && window.performance 
      ? Math.floor(window.performance.now() / 1000) 
      : 0;
    
    return `${testPrefix}idm_${now}_${navCount}_${microTime}_${sessionId}_${randomSuffix}_${extraEntropy}`;
  },



  resetModalState(): void {
    // Reset application state only - let browser handle dialog visibility
    this.currentStep = 1;
    this.clientSecret = null;
    this.leadData = null; // Clear lead data
    this.leadId = this.generateUUID();
    this.idempotencyKey = this.generateIdempotencyKey();
    
    // Clear pending redirect state and timeout
    if (this.redirectTimeoutId) {
      clearTimeout(this.redirectTimeoutId);
      this.redirectTimeoutId = null;
    }
    this.pendingRedirect = false;

    // Clean up Stripe elements
    if (this.paymentElement?.destroy) {
      this.paymentElement.destroy();
      this.paymentElement = null;
    }
    if (this.elements) {
      this.elements = null;
    }

    // Reset payment element UI state
    const skeleton = document.querySelector('#payment-skeleton');
    const paymentContainer = document.querySelector('#payment-element');
    
    if (skeleton) {
      skeleton.classList.remove('hidden');
    }
    
    if (paymentContainer) {
      paymentContainer.classList.add('hidden');
    }

    // Reset UI to step 1
    this.setStep(1);
  },

  translateStripeError(message: string): string {
    const translations: Record<string, string> = {
      'Your card was declined.': 'Seu cartão foi recusado. Tente outro método de pagamento.',
      'Your card has insufficient funds.': 'Saldo insuficiente. Verifique seu limite.',
      'Your card has expired.': 'Cartão expirado. Use outro cartão.',
      'Your card number is incorrect.': 'Número do cartão incorreto.',
      'Your card\'s security code is incorrect.': 'Código de segurança incorreto.',
      'Processing error': 'Erro no processamento. Tente novamente.',
      'Authentication required': 'Autenticação necessária. Complete a verificação.'
    };

    return translations[message] || message;
  },

  handleAsyncPaymentRedirect(paymentIntent: unknown, paymentMethod: string): void {
    // Enhanced redirect logic with better error handling and state management
    // Validate payment intent and get safe values
    const paymentIntentId = getPaymentIntentId(paymentIntent);
     
    // @ts-expect-error - Safe unknown parameter handling with type guards
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const redirectDelay = this.getRedirectDelay(paymentMethod, paymentIntent);
    
     
    logger.info('Scheduling redirect for async payment', {
      paymentMethod,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      redirectDelay,
      paymentIntentId
    });
    
    // Clear any existing timeout to prevent conflicts
    if (this.redirectTimeoutId) {
      clearTimeout(this.redirectTimeoutId);
    }
    
    // Mark redirect as pending and store timeout reference
    this.pendingRedirect = true;
    
    this.redirectTimeoutId = window.setTimeout(() => {
      try {
         
        // @ts-expect-error - Safe unknown parameter handling with type guards  
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const redirectUrl = this.buildRedirectUrl(paymentIntent, paymentMethod);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        logger.info('Redirecting to thank-you page', { redirectUrl });
        
        // Clear redirect state before navigating
        this.pendingRedirect = false;
        this.redirectTimeoutId = null;
        
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        window.location.href = redirectUrl;
      } catch (error) {
        logger.error('Error during async payment redirect', error);
        
        // Clear redirect state on error
        this.pendingRedirect = false;
        this.redirectTimeoutId = null;
        
        // Fallback to basic redirect using safe getter
        window.location.href = `/thank-you?payment_intent=${paymentIntentId}`;
      }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    }, redirectDelay);
  },

  getRedirectDelay(paymentMethod: string, paymentIntent: unknown): number {
    // Determine appropriate redirect delay based on payment method and user needs
    // Safe type checking for payment intent
    const isMultibancoPayment = paymentMethod === 'multibanco' || 
      (isStripePaymentIntent(paymentIntent) && hasMultibancoDetails(paymentIntent));
    
    if (isMultibancoPayment) {
      return 12000; // Extended delay for Multibanco to allow user to see/copy voucher details
    }
    return 5000; // Standard delay for other async methods
  },

  buildRedirectUrl(paymentIntent: unknown, paymentMethod: string): string {
    // Safe extraction of payment intent properties
    const paymentId = getPaymentIntentId(paymentIntent);
    const status = getPaymentIntentStatus(paymentIntent);
    
    let redirectUrl = `/thank-you?payment_intent=${paymentId}`;
    
    // Always add payment method for proper detection
    redirectUrl += `&payment_method=${encodeURIComponent(paymentMethod)}`;
    
    // Add payment status for better detection logic
    if (status !== 'unknown') {
      redirectUrl += `&payment_status=${encodeURIComponent(status)}`;
    }
    
    // Add redirect status for consistency with Stripe's patterns
    if (status === 'processing') {
      redirectUrl += `&redirect_status=processing`;
    } else if (status === 'succeeded') {
      redirectUrl += `&redirect_status=succeeded`;
    }
    
    // Add lead ID for tracking
    if (this.leadId) {
      redirectUrl += `&lead_id=${encodeURIComponent(this.leadId)}`;
    }
    
    // Add session ID for Multibanco payments (critical for fallback logic)
    if (paymentMethod === 'multibanco' && isStripePaymentIntent(paymentIntent)) {
      // Try to extract session info from payment intent metadata
      const metadata = getPaymentIntentMetadata(paymentIntent);
      if (metadata.session_id) {
        redirectUrl += `&session_id=${encodeURIComponent(metadata.session_id)}`;
      }
    }
    
    // Add Multibanco details to URL if available
    if (isStripePaymentIntent(paymentIntent) && hasMultibancoDetails(paymentIntent)) {
      const details = getMultibancoDetails(paymentIntent);
      if (details?.entity && details?.reference) {
        redirectUrl += `&multibanco_entity=${encodeURIComponent(details.entity)}`;
        redirectUrl += `&multibanco_reference=${encodeURIComponent(details.reference)}`;
      }
      // Add amount for display consistency
      const amount = getPaymentIntentAmount(paymentIntent);
      if (amount !== undefined) {
        redirectUrl += `&amount=${encodeURIComponent(amount.toString())}`;
      }
    }
    
    return redirectUrl;
  },

  showMultibancoInstructions(paymentIntent: unknown): void {
    logger.info('Displaying Multibanco instructions in modal', {
      paymentIntentId: getPaymentIntentId(paymentIntent),
      hasNextAction: isStripePaymentIntent(paymentIntent) && paymentIntent.next_action !== undefined,
      nextActionType: isStripePaymentIntent(paymentIntent) ? paymentIntent.next_action?.type : undefined
    });
    
    // Hide competing elements to prevent stacking context issues
    const modalHeader = document.querySelector('#checkoutModal header');
    if (modalHeader) {
      (modalHeader as HTMLElement).style.display = 'none';
      logger.debug('Modal header hidden to prevent covering instructions');
    }
    
    // Update success message for Multibanco
    const successTitle = document.querySelector('#successTitle');
    const successMessage = document.querySelector('#successMessage');
    const multibancoInstructions = document.querySelector('#multibancoInstructions');
    
    if (successTitle) {
      successTitle.textContent = 'Referência Multibanco gerada! 🏦';
    }
    
    if (successMessage) {
      successMessage.textContent = 'Complete o pagamento usando a referência abaixo:';
    }
    
    // Show Multibanco instructions section with proper stacking context
    if (multibancoInstructions) {
      multibancoInstructions.classList.remove('hidden');
      
      // Add stacking context isolation to prevent z-index conflicts
      multibancoInstructions.classList.add('relative', 'isolate');
      
      // Extract Multibanco details if available
      if (isStripePaymentIntent(paymentIntent) && hasMultibancoDetails(paymentIntent)) {
        const details = getMultibancoDetails(paymentIntent);
        
        if (details) {
          const mbEntity = document.querySelector('#mbEntity');
          const mbReference = document.querySelector('#mbReference');
          const mbAmount = document.querySelector('#mbAmount');
          
          if (mbEntity && details.entity) {
            mbEntity.textContent = details.entity;
          }
          
          if (mbReference && details.reference) {
            // Format reference in groups of 3 digits for better readability
            const formattedRef = details.reference.replace(/(\d{3})(?=\d)/g, '$1 ');
            mbReference.textContent = formattedRef;
          }
          
          if (mbAmount) {
            const amount = getPaymentIntentAmount(paymentIntent);
            if (amount !== undefined) {
              mbAmount.textContent = `€${(amount / 100).toFixed(2)}`; // Stripe amounts are in cents
            }
          }
          
          logger.info('Multibanco voucher details populated', {
            entity: details.entity,
            reference: details.reference,
            amount: getPaymentIntentAmount(paymentIntent)
          });
        }
      } else {
        logger.warn('Multibanco details not available in next_action', {
          paymentIntentId: getPaymentIntentId(paymentIntent),
          hasPaymentIntent: isStripePaymentIntent(paymentIntent)
        });
      }
      
      // Ensure instructions are visible and scroll into view
      requestAnimationFrame(() => {
        multibancoInstructions.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
        logger.debug('Multibanco instructions scrolled into view');
      });
    }
    
    logger.debug('Multibanco instructions displayed', {
      paymentIntentId: getPaymentIntentId(paymentIntent),
      status: getPaymentIntentStatus(paymentIntent)
    });
  },

  /**
   * Calculate lead score based on behavior, attribution, and environment data
   */
  calculateLeadScore(behaviorData: BehaviorData, attributionData: AttributionData, userEnvironment: UserEnvironment): number {
    let score = 0;
    
    // Engagement signals (0-40 points)
    if (behaviorData.timeOnPage > 120) score += 10; // Spent 2+ minutes
    if (behaviorData.scrollDepth > 75) score += 10; // Scrolled through most content
    if (behaviorData.sectionsViewed.includes('testimonials')) score += 5; // Viewed social proof
    if (behaviorData.sectionsViewed.includes('faq')) score += 5; // Engaged with FAQ
    if (behaviorData.sectionsViewed.length > 3) score += 10; // Explored multiple sections
    
    // Attribution quality (0-30 points)
    if (attributionData.utm_source === 'direct') score += 15; // Direct traffic = high intent
    if (attributionData.utm_source === 'linkedin') score += 12; // Professional network
    if (attributionData.utm_source === 'referral') score += 10; // Word of mouth
    if (attributionData.utm_source === 'email') score += 8; // Email subscriber
    if (attributionData.utm_campaign?.includes('retargeting')) score += 5; // Returning visitor
    
    // Behavioral patterns (0-20 points)
    if (behaviorData.pageViews > 1) score += 5; // Multiple page views
    if (behaviorData.isReturningVisitor) score += 10; // Returning visitor
    if (behaviorData.sessionDuration > 300) score += 5; // Long session (5+ minutes)
    
    // Device and environment (0-10 points)
    if (userEnvironment.deviceInfo.type === 'desktop') score += 5; // Desktop users often more serious
    if (userEnvironment.timezone?.includes('Lisbon') || userEnvironment.timezone?.includes('Portugal')) score += 5; // Local audience
    
    return Math.min(score, 100); // Cap at 100
  }
};