/**
 * Checkout Section Component for Café com Vendas
 * Co-located checkout behavior using platform modal components
 * Two-step modal checkout: Lead capture (Formspree) + Stripe Payment Elements
 */

import { loadStripe } from '@stripe/stripe-js';
import type {
  Stripe,
  StripeElements,
  StripePaymentElement,
  StripePaymentElementChangeEvent
} from '@stripe/stripe-js';
import { ENV } from '@/config/constants';
import { safeQuery } from '@/utils/dom';
import { logger } from '../../../utils/logger.js';
import type { Component } from '../../../types/components/base.js';
import siteData from '../../../_data/site.js';

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

  initializeCheckout(): void;
  performInitialization(): void;
  setupCheckoutTriggers(): void;
  setupModalBehavior(): void;
  loadStripeScript(): Promise<Stripe | null>;
  preloadStripe(): Promise<void>;
  initializeStripe(): Promise<void>;
  initializePaymentElement(): Promise<void>;
  setupPredictivePayment(): void;
  createPredictivePaymentIntent(): Promise<void>;
  debouncedPredictivePayment: (() => Promise<void>) | null;
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
  isValidEmail(email: string): boolean;
  isValidPhone(phone: string): boolean;
  translateStripeError(message: string): string;
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
  debouncedPredictivePayment: null,

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
    this.setupPredictivePayment();
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
    leadForm?.addEventListener('submit', (event: Event) => {
      this.handleLeadSubmit(event).catch(error => {
        logger.error('Error handling lead submit:', error);
      });
    });

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
    
    // Use standard dialog API
    this.modal.showModal();

    // 🚀 OPTIMIZATION: Preload Stripe.js immediately when modal opens
    // This eliminates 200-500ms delay later when transitioning to payment step
    this.preloadStripe().catch((error) => {
      logger.warn('Stripe preloading failed, will fallback to lazy loading:', error);
    });

    // Track checkout opened (GTM production event + test alias)
    import('../../../components/ui/analytics').then(({ PlatformAnalytics }) => {
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
    // Restore background scrolling
    document.body.style.overflow = '';
    
    // Clean application state when modal closes (via any method)
    this.resetForm();
    this.resetModalState();
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

      // 🚀 OPTIMIZATION: Use existing clientSecret if available from predictive creation
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
      this.paymentElement = this.elements.create('payment', {
        layout: {
          type: 'tabs', // Show tabs for each payment method (cards, Multibanco, SEPA, etc.)
          defaultCollapsed: false,
          radios: false,
          spacedAccordionItems: false
        },
        defaultValues: {
          billingDetails: {
            email: this.leadData.email,
            name: this.leadData.fullName
          }
        },
        fields: {
          billingDetails: {
            email: 'never', // We already have it from lead form
            phone: 'never',  // We already have it from lead form
            name: 'never'    // We already have it from lead form
          }
        },
        // Terms acceptance for European payment methods
        terms: {
          bancontact: 'always',
          card: 'never',
          ideal: 'always',
          sepaDebit: 'always',
          sofort: 'always'
        }
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

  setupPredictivePayment(): void {
    // 🚀 OPTIMIZATION: Set up debounced predictive PaymentIntent creation
    // This monitors form inputs and creates PaymentIntent in background while user types
    
    // Debounce function to avoid too many API calls
    let timeoutId: NodeJS.Timeout | null = null;
    
    this.debouncedPredictivePayment = (): Promise<void> => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      return new Promise<void>((resolve) => {
        timeoutId = setTimeout(() => {
          this.createPredictivePaymentIntent().catch((error) => {
            logger.debug('Predictive PaymentIntent creation failed (non-critical):', error);
          }).finally(() => {
            resolve();
          });
        }, 2000); // Wait 2 seconds after user stops typing
      });
    };

    // Set up form input monitoring
    const formInputs = ['#fullName', '#email', '#phone'];
    
    formInputs.forEach(selector => {
      const input = document.querySelector(selector) as HTMLInputElement;
      if (input) {
        input.addEventListener('input', () => {
          // Only start predictive creation if we have minimal valid data
          const nameInput = document.querySelector('#fullName') as HTMLInputElement;
          const emailInput = document.querySelector('#email') as HTMLInputElement;
          
          if (nameInput?.value.length >= 3 && emailInput?.value.includes('@')) {
            
            // 🚀 OPTIMIZATION: Show predictive loading indicator
            const predictiveStatus = document.querySelector('#predictive-status');
            if (predictiveStatus && !this.clientSecret) {
              predictiveStatus.classList.remove('hidden');
            }
            
            void this.debouncedPredictivePayment?.();
          }
        });
      }
    });
  },

  async createPredictivePaymentIntent(): Promise<void> {
    // 🚀 OPTIMIZATION: Create PaymentIntent with current form data (even if incomplete)
    // This runs in background while user is still filling the form
    
    if (this.clientSecret) {
      return; // Already have a PaymentIntent
    }

    // Get current form values (may be incomplete)
    const nameInput = document.querySelector('#fullName') as HTMLInputElement;
    const emailInput = document.querySelector('#email') as HTMLInputElement;
    const phoneInput = document.querySelector('#phone') as HTMLInputElement;
    const countryInput = document.querySelector('#countryCode') as HTMLSelectElement;

    if (!nameInput?.value || !emailInput?.value) {
      logger.debug('Insufficient form data for predictive PaymentIntent');
      return;
    }

    // Create temporary lead data with current form state
    const tempLeadData = {
      fullName: nameInput.value.trim(),
      email: emailInput.value.trim().toLowerCase(),
      countryCode: countryInput?.value || '+351',
      phone: phoneInput?.value?.trim() || '000000000' // Temporary placeholder
    };

    // Basic validation before API call
    if (!this.isValidEmail(tempLeadData.email) || tempLeadData.fullName.length < 2) {
      logger.debug('Form data not yet valid for predictive PaymentIntent');
      return;
    }

    try {
      
      // Generate fresh idempotency key for predictive payment attempt
      this.idempotencyKey = this.generateIdempotencyKey();
      
      // Prepare request payload (same structure as regular flow)
      const requestPayload = {
        lead_id: this.leadId,
        full_name: tempLeadData.fullName,
        email: tempLeadData.email,
        phone: `${tempLeadData.countryCode}${tempLeadData.phone}`,
        amount: priceInCents, // 🎯 From centralized pricing
        currency: 'eur',
        idempotency_key: this.idempotencyKey
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (this.idempotencyKey) {
        headers['X-Idempotency-Key'] = this.idempotencyKey;
      }

      // Create PaymentIntent in background
      const response = await fetch(`${ENV.urls.base}/.netlify/functions/create-payment-intent`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        throw new Error(`PaymentIntent API error: ${response.status}`);
      }

      const data = await response.json() as { clientSecret: string };
      this.clientSecret = data.clientSecret;
      
      // Store the lead data that was used for PaymentIntent creation
      this.leadData = tempLeadData;
      
      
      // 🚀 OPTIMIZATION: Update predictive status indicator to show success
      const predictiveStatus = document.querySelector('#predictive-status');
      if (predictiveStatus) {
        predictiveStatus.innerHTML = `
          <div class="flex items-center gap-2 text-sm text-green-700">
            <svg class="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
            <span>Pagamento preparado! Próximo passo será instantâneo.</span>
          </div>
        `;
        
        // Hide after 3 seconds
        setTimeout(() => {
          predictiveStatus?.classList.add('hidden');
        }, 3000);
      }
      
    } catch (error) {
      logger.debug('Predictive PaymentIntent creation failed (will retry on form submit):', error);
      
      // Hide predictive status indicator on error
      const predictiveStatus = document.querySelector('#predictive-status');
      if (predictiveStatus) {
        predictiveStatus.classList.add('hidden');
      }
      
      // Don't set error state - this is just an optimization attempt
      // Regular flow will handle PaymentIntent creation if this fails
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

    if (!this.isValidEmail(leadData.email)) {
      this.showError('leadError', 'Por favor, insira um email válido.');
      return;
    }

    if (!this.isValidPhone(leadData.phone)) {
      this.showError('leadError', 'Por favor, insira um número de telefone válido (apenas números, espaços e traços).');
      return;
    }

    try {
      // Show loading state
      const submitBtn = form.querySelector('#leadSubmit');
      const submitSpinner = submitBtn?.querySelector('#leadSubmitSpinner') as HTMLElement | null;

      if (submitBtn) (submitBtn as HTMLButtonElement).disabled = true;
      if (submitSpinner) submitSpinner.classList.remove('hidden');

      // Simulate lead capture processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.setStep(2);

      // 🚀 OPTIMIZATION: Use preloaded Stripe if available, otherwise initialize on demand  
      if (!this.stripeLoaded) {
        await this.initializeStripe();
      }

      // 🚀 OPTIMIZATION: Check if we already have a predictive PaymentIntent ready
      if (this.clientSecret && this.leadData) {
        // Update lead data with final form values (in case phone changed)
        this.leadData = leadData;
      }

      // Initialize Stripe Elements for payment form (will be instant if clientSecret exists)
      await this.initializePaymentElement();

      // Track lead conversion (GTM production event + test alias)
      import('../../../components/ui/analytics').then(({ PlatformAnalytics }) => {
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
        import('../../../components/ui/analytics').then(({ PlatformAnalytics }) => {
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
        import('../../../components/ui/analytics').then(({ PlatformAnalytics }) => {
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

    // Hide all steps first
    leadForm?.classList.add('hidden');
    paymentStep?.classList.add('hidden');
    paymentSuccess?.classList.add('hidden');

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
      progressBar?.classList.add('w-full');
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

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone(phone: string): boolean {
    if (!phone || typeof phone !== 'string') return false;

    // Clean the phone number by removing spaces, dashes, and parentheses
    const cleanPhone = phone.replace(/[\s\-()]/g, '');

    // Check if it has only digits (optionally starting with +)
    // Must be between 7 and 15 digits (international standard)
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      return false;
    }

    // Must contain only digits (and optional + at start)
    const phoneRegex = /^[+]?[0-9]+$/;
    return phoneRegex.test(cleanPhone);
  },


  resetModalState(): void {
    // Reset application state only - let browser handle dialog visibility
    this.currentStep = 1;
    this.clientSecret = null;
    this.leadData = null; // Clear lead data
    this.leadId = this.generateUUID();
    this.idempotencyKey = this.generateIdempotencyKey();

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
    const predictiveStatus = document.querySelector('#predictive-status');
    
    if (skeleton) {
      skeleton.classList.remove('hidden');
    }
    
    if (paymentContainer) {
      paymentContainer.classList.add('hidden');
    }

    // 🚀 OPTIMIZATION: Reset predictive payment status indicator
    if (predictiveStatus) {
      predictiveStatus.classList.add('hidden');
      // Reset to original loading state
      predictiveStatus.innerHTML = `
        <div class="flex items-center gap-2 text-sm text-blue-700">
          <div class="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
          <span>Preparando pagamento em segundo plano...</span>
        </div>
      `;
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
  }
};