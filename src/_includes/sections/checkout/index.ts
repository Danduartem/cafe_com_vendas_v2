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
  type BehaviorData,
  type UserEnvironment,
  type AttributionData 
} from '../../../utils/browser-data.js';
import { isValidEmail, isValidPhone } from '../../../utils/validation.js';
import { 
  getEventData
} from '../../../utils/event-tracking.js';
// Type imports removed - using plain object for MailerLite request

// 🎯 Get centralized pricing data - SINGLE SOURCE OF TRUTH
const site = siteData();
const eventPricing = site.event.pricing;
const basePrice = eventPricing.basePrice;
const priceInCents = eventPricing.tiers[0].priceInCents;
const eventName = site.event.name;

// API Response types
interface PaymentIntentResponse {
  // Enhanced Phase 1 response structure
  success: boolean;
  client_secret: string;
  payment_intent_id: string;
  event_id: string;
  crm_contact_id?: string;
  crm_deal_id?: string;
  metadata_keys: string[];
}

// Removed unused interface to fix TypeScript warning

interface PaymentErrorResponse {
  error: string;
  details?: string[] | Record<string, unknown>;
  fieldErrors?: { field: string; message: string }[];
  debugInfo?: {
    receivedData?: Record<string, unknown>;
    validationRules?: Record<string, unknown>;
  };
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
  initializePaymentElement(): void;
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
  setupFieldValidation(): void;
  validateField(fieldName: string, value: string): { isValid: boolean; message: string };
  showFieldError(fieldName: string, message: string): void;
  clearFieldError(fieldName: string): void;
  sanitizeInput(value: string, type: 'name' | 'email' | 'phone'): string;
  handleValidationErrors(errors: string[]): void;
  handleStructuredValidationErrors(fieldErrors: { field: string; message: string }[]): void;
  validateAndCreatePaymentIntent(): Promise<void>;
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
    
    // Setup field validation
    this.setupFieldValidation();
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
    import('../../../analytics/index.js').then(({ AnalyticsHelpers }) => {
      // Use new method that fires both events
      AnalyticsHelpers.trackCTAClick(this.getSourceSection(), {
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

    // Enhanced error handling following Context7 patterns
    try {
      this.stripeLoadPromise = loadStripe(ENV.stripe.publishableKey);
      this.stripe = await this.stripeLoadPromise;
      this.stripeLoaded = true;
      
      if (!this.stripe) {
        throw new Error('Stripe.js failed to load - this may be due to network issues or an invalid publishable key');
      }
      
      return this.stripe;
    } catch (error) {
      this.stripeLoadPromise = null;
      
      // Enhanced error context for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during Stripe.js loading';
      logger.error('Stripe.js loading failed:', { error: errorMessage, publishableKey: ENV.stripe.publishableKey?.substring(0, 12) + '...' });
      
      throw new Error(`Failed to load Stripe.js: ${errorMessage}`);
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

  initializePaymentElement(): void {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    try {
      // Ensure we have lead data and client secret (should be created by validateAndCreatePaymentIntent)
      if (!this.leadData) {
        throw new Error('Lead data not available');
      }

      if (!this.clientSecret) {
        throw new Error('Client secret not available - payment intent must be created first');
      }

      // Create Elements instance with proper Dashboard integration
      this.elements = this.stripe.elements({
        clientSecret: this.clientSecret,
        locale: 'pt' as const, // Portuguese locale for Portugal market
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
        // Payment method order preference for Portuguese market
        // Multibanco first as it's the most trusted local payment method in Portugal
        paymentMethodOrder: ['multibanco', 'card', 'sepa_debit']
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

      // Show specific error messages based on the type of error - Portuguese market context
      let errorMessage = 'Erro ao carregar formulário de pagamento. O Multibanco continua disponível.';

      if (error instanceof Error) {
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Problema de ligação à internet. Verifique a sua conexão e tente novamente.';
        } else if (error.message.includes('Payment service')) {
          errorMessage = 'Serviço de pagamento temporariamente indisponível. Experimente Multibanco - funciona sempre!';
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
    
    // Debug: Log method entry
    logger.info('handleLeadSubmit method called');

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

    // === PHASE 1 ENHANCEMENT: Generate event_id and context ===
    const completeEventData = getEventData({
      marketing_consent: true, // Assume consent for now, Phase 2 will add consent modal
      consent_method: 'implied'
    });
    
    // Store event_id as the primary identifier (clean, no legacy compatibility)
    this.leadId = completeEventData.context.event_id;
    
    logger.info('Generated event context for lead submission', {
      event_id: completeEventData.context.event_id,
      user_session_id: completeEventData.context.user_session_id,
      lead_created_at: completeEventData.context.created_at
    });

    // Comprehensive client-side validation using our new validation methods
    let hasValidationErrors = false;
    
    // Clear any previous errors
    ['fullName', 'email', 'phone'].forEach(field => this.clearFieldError(field));
    
    // Validate each field and show specific errors
    const fullNameValidation = this.validateField('fullName', leadData.fullName);
    if (!fullNameValidation.isValid) {
      this.showFieldError('fullName', fullNameValidation.message);
      hasValidationErrors = true;
    }
    
    const emailValidation = this.validateField('email', leadData.email);
    if (!emailValidation.isValid) {
      this.showFieldError('email', emailValidation.message);
      hasValidationErrors = true;
    }
    
    const phoneValidation = this.validateField('phone', leadData.phone);
    if (!phoneValidation.isValid) {
      this.showFieldError('phone', phoneValidation.message);
      hasValidationErrors = true;
    }
    
    // If any validation failed, stop here - don't make any API calls
    if (hasValidationErrors) {
      return;
    }

    try {
      // Show loading state
      const submitBtn = form.querySelector('#leadSubmit');
      const submitSpinner = submitBtn?.querySelector('#leadSubmitSpinner') as HTMLElement | null;

      if (submitBtn) (submitBtn as HTMLButtonElement).disabled = true;
      if (submitSpinner) submitSpinner.classList.remove('hidden');

      // PERFORMANCE OPTIMIZATION: Create PaymentIntent first for server validation
      await this.validateAndCreatePaymentIntent();

      // PERFORMANCE OPTIMIZATION: Initialize Stripe Elements early while APIs run in background
      const stripeInitPromise = (async () => {
        if (!this.stripeLoaded) {
          await this.initializeStripe();
        }
      })();

      // Collect rich user data for API calls
      const userEnvironment = getUserEnvironment();
      const behaviorData = this.behaviorTracker?.getBehaviorData() || {
        timeOnPage: 0,
        scrollDepth: 0,
        sectionsViewed: [],
        pageViews: 1,
        isReturningVisitor: false,
        sessionDuration: 0
      };

      // PERFORMANCE OPTIMIZATION: Run MailerLite and CRM in parallel (non-blocking)
      const backgroundAPIPromises = [
        // MailerLite API call
        (async () => {
          try {
            const mailerlitePayload = {
              // Core required fields that backend expects
              lead_id: completeEventData.context.event_id,
              full_name: leadData.fullName,
              email: leadData.email,
              phone: `${leadData.countryCode}${leadData.phone}`,
              
              // Event tracking (required)
              event_id: completeEventData.context.event_id,
              user_session_id: completeEventData.context.user_session_id,
              
              // Attribution data 
              utm_source: completeEventData.attribution.utm_source,
              utm_medium: completeEventData.attribution.utm_medium,
              utm_campaign: completeEventData.attribution.utm_campaign,
              utm_content: completeEventData.attribution.utm_content,
              utm_term: completeEventData.attribution.utm_term,
              
              // Behavioral data
              time_on_page: behaviorData.timeOnPage,
              scroll_depth: behaviorData.scrollDepth,
              page_views: behaviorData.pageViews,
              is_returning_visitor: behaviorData.isReturningVisitor,
              session_duration: behaviorData.sessionDuration,
              
              // Device & browser
              device_type: userEnvironment.deviceInfo.type,
              device_brand: userEnvironment.deviceInfo.brand,
              browser_name: userEnvironment.browserInfo.name,
              browser_version: userEnvironment.browserInfo.version,
              screen_resolution: userEnvironment.screenResolution,
              viewport_size: userEnvironment.viewportSize,
              
              // Business context
              preferred_language: userEnvironment.language,
              timezone: userEnvironment.timezone,
              
              // Timestamps
              lead_created_at: completeEventData.context.created_at,
              checkout_started_at: completeEventData.context.created_at,
              
              // Consent
              marketing_consent: completeEventData.consent.marketing_consent,
              consent_method: completeEventData.consent.consent_method,
              consent_timestamp: completeEventData.consent.consent_timestamp
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
            logger.warn('MailerLite API call failed (non-blocking)', {
              error: mailerliteError instanceof Error ? mailerliteError.message : 'Unknown error',
              leadId: this.leadId,
              email: leadData.email
            });
          }
        })(),

        // CRM Integration - Non-blocking
        (async () => {
          try {
            const crmPayload = {
              company_id: ENV.crm?.companyId || 'b3f9a7c2-f20e-4e12-bc72-a75450240b98',
              board_id: ENV.crm?.boardId || 'becd6fb7-74a6-4517-b60e-4be31d9942c3',
              column_id: ENV.crm?.columnId || 'fbfa2479-c495-4a37-8d84-9c1109ddafc5',
              name: leadData.fullName.trim(),
              phone: `${leadData.countryCode}${leadData.phone}`,
              email: leadData.email,
              title: leadData.fullName.trim(),
              amount: `${basePrice}.00`, // Format as "180.00"
              obs: `Lead interessado no produto ${eventName} - Lisboa 2025`,
              contact_tags: [
                `${eventName} - Lisboa 2025`,
                'Lead'
              ]
            };

            const crmResponse = await fetch(`${ENV.urls.base}/.netlify/functions/crm-integration`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(crmPayload)
            });

            if (crmResponse.ok) {
              const result = await crmResponse.json() as { crm?: { success?: boolean } };
              logger.info('CRM integration successful', {
                leadId: this.leadId,
                crmSuccess: result.crm?.success
              });
            } else {
              logger.warn('CRM integration returned error status', {
                status: crmResponse.status,
                leadId: this.leadId
              });
            }
          } catch (crmError) {
            logger.warn('CRM integration failed (non-blocking)', {
              error: crmError instanceof Error ? crmError.message : 'Unknown error',
              leadId: this.leadId,
              email: leadData.email
            });
          }
        })()
      ];

      // Don't await background API calls - let them complete in parallel
      Promise.all(backgroundAPIPromises).catch(() => {
        logger.debug('Background API calls completed with some errors (non-blocking)');
      });

      // Wait for Stripe initialization to complete before transitioning
      await stripeInitPromise;

      // Transition to step 2 immediately after Stripe is ready
      this.setStep(2);

      // Initialize Stripe Elements for payment form
      this.initializePaymentElement();

      // Track lead conversion (GTM production event + test alias)
      import('../../../analytics/index.js').then(({ AnalyticsHelpers, default: analytics }) => {
        // Fire the GTM production event
        AnalyticsHelpers.trackConversion('lead_form_submitted', {
          lead_id: this.leadId,
          form_location: 'checkout_modal',
          pricing_tier: 'early_bird'
        });
        
        // Fire test alias for E2E compatibility
        analytics.track('form_submission', {
          section: 'checkout',
          action: 'lead_submitted',
          lead_id: this.leadId || undefined
        });
      }).catch(() => {
        logger.debug('Lead submission analytics tracking unavailable');
      });

    } catch (error: unknown) {
      logger.error('Lead submission error:', error);
      
      // Handle different types of errors
      if (error instanceof Error) {
        if (error.message === 'Server validation failed') {
          // Server validation already handled field-specific errors, don't show generic message
          logger.info('Server validation failed - field-specific errors already shown');
        } else {
          this.showError('leadError', 'Erro ao processar inscrição. Tente novamente.');
        }
      } else {
        this.showError('leadError', 'Erro ao processar inscrição. Tente novamente.');
      }
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
        payBtnText.textContent = 'A processar pagamento...'; // Portuguese European form
        // Ensure text is visible by explicitly setting opacity and display
        payBtnText.style.opacity = '1';
        payBtnText.style.display = 'inline';
        logger.debug('Payment button text changed to:', payBtnText.textContent);
      }
      if (payBtnSpinner) payBtnSpinner.classList.remove('hidden');

      // Enhanced payment confirmation with Context7 patterns
      // This handles all payment methods configured in Dashboard (cards, SEPA, iDEAL, MB Way, etc.)
      const confirmationResult = await this.stripe.confirmPayment({
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

      const { error, paymentIntent } = confirmationResult;

      if (error) {
        // Enhanced error handling with Context7 patterns
        const errorMessage = this.translateStripeError(error.message || 'Erro no pagamento');
        this.showError('payError', errorMessage);

        // Enhanced error logging with more context
        logger.error('Stripe payment confirmation failed:', {
          errorType: error.type,
          errorCode: error.code,
          errorMessage: error.message,
          leadId: this.leadId,
          paymentMethodTypes: paymentIntent ? [] : undefined
        });

        // Track payment error with enhanced data
        import('../../../analytics/index.js').then(({ default: analytics }) => {
          analytics.track('section_engagement', {
            section: 'checkout',
            action: 'payment_error',
            error_type: error.type,
            error_code: error.code,
            error_message: error.message,
            lead_id: this.leadId
          });
        }).catch(() => {
          logger.debug('Payment error analytics tracking unavailable');
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded without redirect (no 3DS required)
        this.setStep('success');

        // Enhanced success logging
        logger.info('Payment completed successfully:', {
          paymentIntentId: paymentIntent.id,
          leadId: this.leadId,
          amount: basePrice,
          currency: 'EUR'
        });

        // Track payment success immediately since we know it succeeded
        import('../../../analytics/index.js').then(({ AnalyticsHelpers }) => {
          AnalyticsHelpers.trackConversion('purchase_completed', {
            transaction_id: paymentIntent.id,
            value: basePrice, // 🎯 From centralized pricing
            currency: 'EUR',
            items: [{ name: eventName, quantity: 1, price: basePrice }], // 🎯 From centralized data
            pricing_tier: 'early_bird',
            lead_id: this.leadId
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
            payBtnText.textContent = 'A gerar referência Multibanco...'; // Portuguese European progressive form
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
          
          // Generic processing message for other async methods - Portuguese tone
          const successTitle = document.querySelector('#successTitle');
          const successMessage = document.querySelector('#successMessage');
          if (successTitle) successTitle.textContent = 'A processar o seu pagamento...';
          if (successMessage) successMessage.textContent = 'Será redirecionado em breve para confirmar...';
        }

        // Track payment initiation (not completion yet)
        import('../../../analytics/index.js').then(({ default: analytics }) => {
          analytics.track('section_engagement', {
            section: 'checkout',
            action: 'payment_processing',
            payment_method: paymentMethod,
            payment_intent_id: paymentIntent.id,
            lead_id: this.leadId || undefined
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
    const random1 = Math.random().toString(36).substring(2, 10); // 8 random chars
    const random2 = Math.random().toString(36).substring(2, 10); // 8 more random chars
    return `lead-${timestamp}-${random1}-${random2}`;
  },

  generateIdempotencyKey(): string {
    // Enhanced idempotency key with test environment isolation and crypto-level randomness
    const now = Date.now();
    const microTime = performance.now().toString().replace('.', '');
    const randomSuffix = Math.random().toString(36).substring(2, 17);
    const sessionId = Math.random().toString(36).substring(2, 10);
    
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
          : Math.random().toString(36).substring(2, 12))
      : Math.random().toString(36).substring(2, 12);
    
    // Generate unique worker/test identifier for test environments
    const testPrefix = isTestEnvironment 
      ? `test_${Math.random().toString(36).substring(2, 8)}_`
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
    // Enhanced error translation for Portuguese market following Context7 patterns
    const translations: Record<string, string> = {
      // Card errors - Portuguese European localization
      'Your card was declined.': 'O seu cartão foi recusado. Experimente outro método de pagamento ou use Multibanco.',
      'Your card has insufficient funds.': 'Saldo insuficiente no cartão. Verifique o seu limite ou use Multibanco.',
      'Your card has expired.': 'Cartão expirado. Use outro cartão ou escolha Multibanco.',
      'Your card number is incorrect.': 'Número do cartão incorreto. Verifique os dados ou use Multibanco.',
      'Your card\'s security code is incorrect.': 'Código de segurança incorreto. Confirme o CVV.',
      
      // Multibanco specific errors (Portugal's preferred payment method)
      'Multibanco payment failed.': 'Pagamento via Multibanco falhou. Tente gerar uma nova referência.',
      'Invalid Multibanco reference.': 'Referência Multibanco inválida. Contacte o nosso suporte.',
      
      // SEPA specific errors (European context)
      'Your bank account details are incorrect.': 'Os dados da conta bancária estão incorretos.',
      'SEPA payment requires additional verification.': 'Pagamento SEPA requer verificação adicional.',
      
      // Processing errors
      'Processing error': 'Erro no processamento. Tente novamente.',
      'Authentication required': 'Autenticação necessária. Complete a verificação.',
      
      // Network and API errors
      'Network error': 'Erro de conexão. Verifique sua internet e tente novamente.',
      'API error': 'Erro temporário no sistema. Tente novamente em instantes.',
      
      // Payment method specific - Portuguese market context
      'Your payment method is not available.': 'Este método de pagamento não está disponível. Recomendamos Multibanco - é seguro e instantâneo.',
      'Payment declined by issuer.': 'Pagamento recusado pelo banco emissor. O Multibanco pode ser uma alternativa.',
      'Transaction limit exceeded.': 'Limite de transação excedido. O Multibanco permite valores até €20.000.',
      
      // General fallbacks - European Portuguese tone
      'Something went wrong.': 'Algo correu mal. Por favor, tente novamente.',
      'Unable to process payment.': 'Não foi possível processar o pagamento. Experimente outro método ou contacte-nos.'
    };

    // Return translated message or fallback with Portuguese customer service tone
    return translations[message] || `Erro: ${message}. Se o problema persistir, contacte-nos através do email suporte@cafecomvendas.com.`;
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
    
    // Update success message for Multibanco - Portuguese market optimization
    const successTitle = document.querySelector('#successTitle');
    const successMessage = document.querySelector('#successMessage');
    const multibancoInstructions = document.querySelector('#multibancoInstructions');
    
    if (successTitle) {
      successTitle.textContent = 'Referência Multibanco criada com sucesso! 🏦';
    }
    
    if (successMessage) {
      successMessage.innerHTML = `
        <div class="space-y-2">
          <p class="text-lg font-medium text-navy-800">Pode agora efetuar o pagamento usando a referência abaixo:</p>
          <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p class="text-sm text-amber-800">
              <strong>Instruções:</strong> Aceda ao seu homebanking, MB WAY, ou terminal Multibanco e use os dados abaixo para completar o pagamento.
            </p>
          </div>
        </div>
      `;
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
            // Format reference in groups of 3 digits for Portuguese readability standards
            const formattedRef = details.reference.replace(/(\d{3})(?=\d)/g, '$1 ');
            mbReference.textContent = formattedRef;
            
            // Add copy functionality for better UX in Portugal market
            (mbReference as HTMLElement).style.cursor = 'pointer';
            (mbReference as HTMLElement).title = 'Clique para copiar a referência';
            mbReference.addEventListener('click', () => {
              navigator.clipboard.writeText(details.reference).then(() => {
                // Show temporary feedback
                const originalText = mbReference.textContent;
                mbReference.textContent = 'Copiado! \u2713';
                setTimeout(() => {
                  mbReference.textContent = originalText;
                }, 2000);
              }).catch(() => {
                logger.debug('Clipboard copy not supported');
              });
            });
          }
          
          if (mbAmount) {
            const amount = getPaymentIntentAmount(paymentIntent);
            if (amount !== undefined) {
              // Format amount according to Portuguese standards
              const formattedAmount = new Intl.NumberFormat('pt-PT', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(amount / 100);
              mbAmount.textContent = formattedAmount;
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
  },

  setupFieldValidation(): void {
    const fields = ['fullName', 'email', 'phone'];
    
    fields.forEach(fieldName => {
      const field = safeQuery(`#${fieldName}`) as HTMLInputElement;
      if (!field) return;

      // Input event for real-time validation
      field.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const sanitizedValue = this.sanitizeInput(target.value, fieldName as 'name' | 'email' | 'phone');
        
        // Update field with sanitized value if different
        if (target.value !== sanitizedValue) {
          target.value = sanitizedValue;
        }
        
        // Validate and show/hide errors
        const validation = this.validateField(fieldName, sanitizedValue);
        if (validation.isValid) {
          this.clearFieldError(fieldName);
        } else if (sanitizedValue.trim()) { // Only show errors if user has entered something
          this.showFieldError(fieldName, validation.message);
        }
      });

      // Blur event for final validation
      field.addEventListener('blur', (e) => {
        const target = e.target as HTMLInputElement;
        const validation = this.validateField(fieldName, target.value);
        if (!validation.isValid && target.value.trim()) {
          this.showFieldError(fieldName, validation.message);
        }
      });

      // Focus event to clear errors
      field.addEventListener('focus', () => {
        this.clearFieldError(fieldName);
      });

      // Paste event to sanitize pasted content
      field.addEventListener('paste', (e) => {
        setTimeout(() => {
          const target = e.target as HTMLInputElement;
          const sanitizedValue = this.sanitizeInput(target.value, fieldName as 'name' | 'email' | 'phone');
          target.value = sanitizedValue;
          
          const validation = this.validateField(fieldName, sanitizedValue);
          if (!validation.isValid) {
            this.showFieldError(fieldName, validation.message);
          }
        }, 10);
      });
    });
  },

  validateField(fieldName: string, value: string): { isValid: boolean; message: string } {
    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      return { isValid: false, message: 'Este campo é obrigatório.' };
    }

    switch (fieldName) {
      case 'fullName':
        if (trimmedValue.length < 2) {
          return { isValid: false, message: 'O nome deve ter pelo menos 2 caracteres.' };
        }
        if (trimmedValue.length > 100) {
          return { isValid: false, message: 'Nome demasiado longo (máximo 100 caracteres).' };
        }
        if (!/^[a-zA-ZÀ-ÿ\u0100-\u017F\s\-'.]+$/.test(trimmedValue)) {
          return { isValid: false, message: 'O nome contém caracteres inválidos. Só são permitidas letras, espaços e hífens.' };
        }
        // Check for email-like patterns in name field - Portuguese context
        if (trimmedValue.includes('@') || /\d/.test(trimmedValue)) {
          return { isValid: false, message: 'Parece que introduziu um email no campo do nome. Por favor, escreva apenas o seu nome completo.' };
        }
        break;

      case 'email':
        if (!isValidEmail(trimmedValue)) {
          return { isValid: false, message: 'Por favor, introduza um email válido.' };
        }
        if (trimmedValue.length > 254) {
          return { isValid: false, message: 'Email demasiado longo.' };
        }
        break;

      case 'phone': {
        if (!isValidPhone(trimmedValue)) {
          return { isValid: false, message: 'Por favor, introduza um número de telefone válido.' };
        }
        const cleanPhone = trimmedValue.replace(/[\s\-()]/g, '');
        if (cleanPhone.length < 7 || cleanPhone.length > 15) {
          return { isValid: false, message: 'O telefone deve ter entre 7 e 15 dígitos.' };
        }
        break;
      }
    }

    return { isValid: true, message: '' };
  },

  showFieldError(fieldName: string, message: string): void {
    const errorElement = safeQuery(`#${fieldName}Error`);
    const fieldElement = safeQuery(`#${fieldName}`) as HTMLInputElement;
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
    }
    
    if (fieldElement) {
      fieldElement.classList.add('border-burgundy-700', 'ring-burgundy-700');
      fieldElement.classList.remove('border-neutral-300');
    }
  },

  clearFieldError(fieldName: string): void {
    const errorElement = safeQuery(`#${fieldName}Error`);
    const fieldElement = safeQuery(`#${fieldName}`) as HTMLInputElement;
    
    if (errorElement) {
      errorElement.classList.add('hidden');
      errorElement.textContent = '';
    }
    
    if (fieldElement) {
      fieldElement.classList.remove('border-burgundy-700', 'ring-burgundy-700');
      fieldElement.classList.add('border-neutral-300');
    }
  },

  sanitizeInput(value: string, type: 'name' | 'email' | 'phone'): string {
    switch (type) {
      case 'name':
        // Remove any characters that aren't letters, spaces, hyphens, apostrophes, or dots
        // Also remove numbers and @ symbols that might indicate email confusion
        return value.replace(/[^a-zA-ZÀ-ÿ\u0100-\u017F\s\-'.]/g, '');
        
      case 'email':
        // Basic email sanitization - remove spaces and convert to lowercase
        return value.trim().toLowerCase();
        
      case 'phone':
        // Keep only digits, spaces, hyphens, and parentheses
        return value.replace(/[^0-9\s\-()]/g, '');
        
      default:
        return value;
    }
  },

  handleValidationErrors(errors: string[]): void {
    // Clear all previous errors
    ['fullName', 'email', 'phone'].forEach(field => this.clearFieldError(field));
    
    // Map server errors to specific fields
    errors.forEach(error => {
      const errorMessage = error.toLowerCase();
      
      if (errorMessage.includes('name contains invalid characters') || 
          errorMessage.includes('invalid required field: full_name') ||
          errorMessage.includes('name must be between')) {
        this.showFieldError('fullName', 'Nome contém caracteres inválidos ou não atende aos requisitos. Verifique se digitou apenas seu nome (sem email ou números).');
      } else if (errorMessage.includes('invalid email') || 
                 errorMessage.includes('email') ||
                 errorMessage.includes('invalid required field: email')) {
        this.showFieldError('email', 'Por favor, verifique se o email está correto.');
      } else if (errorMessage.includes('phone') || 
                 errorMessage.includes('telefone') ||
                 errorMessage.includes('invalid required field: phone')) {
        this.showFieldError('phone', 'Por favor, verifique se o telefone está correto.');
      } else {
        // Generic error - show in the main lead error area
        this.showError('leadError', `Erro de validação: ${error}`);
      }
    });

    // Also ensure we're back on step 1 so user can see and fix the errors
    this.setStep(1);
  },

  handleStructuredValidationErrors(fieldErrors: { field: string; message: string }[]): void {
    // Clear all previous errors
    ['fullName', 'email', 'phone'].forEach(field => this.clearFieldError(field));
    
    // Display errors directly using the structured field mapping
    fieldErrors.forEach(({ field, message }) => {
      if (field === 'fullName' || field === 'email' || field === 'phone') {
        // Convert server field names to client field names if needed
        const clientFieldName = field;
        
        // Provide user-friendly messages for common validation errors
        let userMessage = message;
        if (message.includes('Name contains invalid characters')) {
          userMessage = 'Nome contém caracteres inválidos. Por favor, digite apenas seu nome (sem números, @ ou outros símbolos).';
        } else if (message.includes('Invalid email format')) {
          userMessage = 'Por favor, verifique se o email está correto.';
        } else if (message.includes('Phone number')) {
          userMessage = 'Por favor, verifique se o telefone está correto.';
        }
        
        this.showFieldError(clientFieldName, userMessage);
      } else if (field === 'general') {
        // Generic errors go to the main error area
        this.showError('leadError', message);
      }
    });

    // Also ensure we're back on step 1 so user can see and fix the errors
    this.setStep(1);
  },

  async validateAndCreatePaymentIntent(): Promise<void> {
    try {
      // Ensure we have lead data
      if (!this.leadData) {
        throw new Error('Lead data not available');
      }

      // Only create PaymentIntent if we don't already have one
      if (!this.clientSecret) {
        
        // Generate fresh idempotency key for each payment attempt to avoid conflicts during testing
        this.idempotencyKey = this.generateIdempotencyKey();
        
        // === PHASE 1 ENHANCEMENT: Enhanced Payment Intent Payload ===
        // Get the event data that was generated earlier in handleLeadSubmit
        const completeEventData = getEventData({
          marketing_consent: true, // Assume consent for now, Phase 2 will add consent modal
          consent_method: 'implied'
        });

        // Collect rich user data for enhanced tracking
        const userEnvironment = getUserEnvironment();
        // Note: attributionData and behaviorData embedded in completeEventData below

        // Enhanced payload matching EnhancedPaymentIntentPayload interface
        const requestPayload = {
          // Phase 1 required fields
          event_id: completeEventData.context.event_id,
          user_session_id: completeEventData.context.user_session_id,

          // Core payment fields
          // Note: leadId = event_id for clean Phase 1 implementation
          full_name: this.leadData.fullName,
          email: this.leadData.email,
          phone: `${this.leadData.countryCode}${this.leadData.phone}`,
          amount: priceInCents,
          currency: 'eur',
          idempotency_key: this.idempotencyKey,

          // Attribution data
          utm_source: completeEventData.attribution.utm_source,
          utm_medium: completeEventData.attribution.utm_medium,
          utm_campaign: completeEventData.attribution.utm_campaign,
          utm_content: completeEventData.attribution.utm_content,
          utm_term: completeEventData.attribution.utm_term,

          // CRM integration (will be populated by MailerLite response if available)
          crm_contact_id: undefined, // Will be set by server if CRM integration succeeded
          crm_deal_id: undefined,

          // Consent tracking
          marketing_consent: completeEventData.consent.marketing_consent,
          consent_timestamp: completeEventData.consent.consent_timestamp,
          consent_method: completeEventData.consent.consent_method,

          // Customer journey tracking
          lead_created_at: completeEventData.context.created_at,
          checkout_started_at: completeEventData.context.created_at,
          payment_attempt_count: '1', // First attempt

          // Device context for fraud prevention
          device_type: userEnvironment.deviceInfo.type,
          user_agent_hash: undefined, // Will be generated server-side
          ip_address_hash: undefined // Will be generated server-side
        };

        // Prepare headers with proper type handling
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };

        if (this.idempotencyKey) {
          headers['X-Idempotency-Key'] = this.idempotencyKey;
        }

        // Create PaymentIntent with server validation
        const response = await fetch(`${ENV.urls.base}/.netlify/functions/create-payment-intent`, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestPayload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Network error' })) as PaymentErrorResponse;

          // If validation failed, show specific validation errors to user
          if (errorData.error === 'Validation failed') {
            logger.error('Server validation errors:', errorData.details);
            
            // Use structured field errors if available, otherwise fall back to details array
            if (errorData.fieldErrors && Array.isArray(errorData.fieldErrors)) {
              this.handleStructuredValidationErrors(errorData.fieldErrors);
            } else if (errorData.details) {
              this.handleValidationErrors(errorData.details as string[]);
            }
            
            // Log debug info in development
            if (errorData.debugInfo) {
              logger.debug('Server validation debug info:', errorData.debugInfo);
            }
            
            // Throw error to stop the submission flow
            throw new Error('Server validation failed');
          }

          throw new Error(`Payment service error: ${errorData.error || response.statusText}`);
        }

        const data = await response.json() as PaymentIntentResponse;
        
        // Handle clean enhanced response format
        this.clientSecret = data.client_secret;
        
        logger.info('Enhanced payment intent created successfully', { 
          eventId: data.event_id,
          paymentIntentId: data.payment_intent_id,
          crmContactId: data.crm_contact_id,
          metadataFields: data.metadata_keys?.length || 0
        });
      }
    } catch (error) {
      logger.error('Failed to validate and create payment intent:', error);
      // Re-throw the error to be handled by the calling function
      throw error;
    }
  }
};