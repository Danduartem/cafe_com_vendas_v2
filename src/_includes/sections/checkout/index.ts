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
import type { Component } from '../../../types/components/base.js';

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
  isValidEmail(email: string): boolean;
  isValidPhone(phone: string): boolean;
  getUTMParams(): Record<string, string>;
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

  init(): void {
    try {
      // Ensure DOM is fully loaded before initialization
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', this.performInitialization.bind(this));
      } else {
        this.performInitialization();
      }
    } catch (error) {
      console.error('Error initializing Checkout section:', error);
    }
  },

  performInitialization(): void {
    this.initializeCheckout();
    this.setupCheckoutTriggers();
    this.setupModalBehavior();
  },

  initializeCheckout(): void {
    // Get dialog element for native HTML5 dialog API
    this.modal = safeQuery('#checkoutModal') as HTMLDialogElement;

    if (!this.modal) {
      console.error('Modal element not found');
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
        console.error('Error handling lead submit:', error);
      });
    });

    // Payment button
    const payButton = safeQuery('#payBtn');
    payButton?.addEventListener('click', () => {
      this.handlePayment().catch(error => {
        console.error('Error handling payment:', error);
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
      console.error('Modal not initialized');
      return;
    }

    // Use standard dialog API
    this.modal.showModal();

    // Track checkout opened using platform analytics
    import('../../../components/ui/analytics').then(({ PlatformAnalytics }) => {
      PlatformAnalytics.track('section_engagement', {
        section: 'checkout',
        action: 'modal_opened',
        trigger_location: this.getSourceSection()
      });
    }).catch(() => {
      console.debug('Checkout modal analytics tracking unavailable');
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

  async initializeStripe(): Promise<void> {
    if (!ENV.stripe.publishableKey) {
      throw new Error('Stripe publishable key not configured');
    }

    this.stripe = await this.loadStripeScript();
    
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

      // Prepare request payload
      const requestPayload = {
        // Required fields for Netlify Function
        lead_id: this.leadId,
        full_name: this.leadData.fullName,
        email: this.leadData.email,
        phone: `${this.leadData.countryCode}${this.leadData.phone}`,
        amount: 18000, // €180.00 in cents
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

      // Always attempt to create a proper PaymentIntent
      const response = await fetch(`${ENV.urls.base}/.netlify/functions/create-payment-intent`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' })) as PaymentErrorResponse;

        // If validation failed, show specific validation errors to user
        if (errorData.error === 'Validation failed' && errorData.details) {
          console.error('Validation errors:', errorData.details);
        }

        throw new Error(`Payment service error: ${errorData.error || response.statusText}`);
      }

      const data = await response.json() as PaymentIntentResponse;
      this.clientSecret = data.clientSecret;

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
      // @ts-expect-error - Payment element exists at runtime but not in current type definitions
      this.paymentElement = this.elements.create('payment', {
        layout: {
          type: 'accordion', // Modern layout pattern recommended by Stripe
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
        business: {
          name: 'Café com Vendas'
        },
        // Enable automatic payment method creation for better UX
        paymentMethodCreation: 'automatic',
        // Terms acceptance for SEPA and other European payment methods
        terms: {
          bancontact: 'always',
          card: 'never',
          ideal: 'always',
          sepaDebit: 'always',
          sofort: 'always'
        }
      }) as StripePaymentElement;

      // Mount the Payment Element to the container
      const paymentElementContainer = document.querySelector('#payment-element');
      if (paymentElementContainer && this.paymentElement) {
        this.paymentElement.mount('#payment-element');

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
          console.log('Payment Element ready - payment methods loaded from Dashboard');
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
      console.error('Error initializing payment element:', error);

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
      const submitText = submitBtn?.querySelector('#leadSubmitText') as HTMLElement | null;
      const submitSpinner = submitBtn?.querySelector('#leadSubmitSpinner') as HTMLElement | null;

      if (submitBtn) (submitBtn as HTMLButtonElement).disabled = true;
      if (submitText) submitText.classList.add('opacity-0');
      if (submitSpinner) submitSpinner.classList.remove('hidden');

      // TODO: Submit to your lead capture service (Formspree, etc.)
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.setStep(2);

      // Load Stripe lazily when needed
      if (!this.stripeLoaded) {
        await this.initializeStripe();
      }

      // Initialize Stripe Elements for payment form
      await this.initializePaymentElement();

      // Track lead conversion
      import('../../../components/ui/analytics').then(({ PlatformAnalytics }) => {
        PlatformAnalytics.track('section_engagement', {
          section: 'checkout',
          action: 'lead_submitted',
          lead_id: this.leadId
        });
      }).catch(() => {
        console.debug('Lead submission analytics tracking unavailable');
      });
    } catch (error: unknown) {
      console.error('Lead submission error:', error);
      this.showError('leadError', 'Erro ao processar inscrição. Tente novamente.');
    } finally {
      // Reset loading state
      const submitBtn = form.querySelector('#leadSubmit');
      const submitText = submitBtn?.querySelector('#leadSubmitText') as HTMLElement | null;
      const submitSpinner = submitBtn?.querySelector('#leadSubmitSpinner') as HTMLElement | null;

      if (submitBtn) (submitBtn as HTMLButtonElement).disabled = false;
      if (submitText) submitText.classList.remove('opacity-0');
      if (submitSpinner) submitSpinner.classList.add('hidden');
    }
  },

  async handlePayment(): Promise<void> {
    // Check if we're in development mode with mock payment
    if (this.clientSecret === 'mock_payment_intent_development') {
      // Mock payment processing for development
      try {
        const payBtn = document.querySelector('#payBtn');
        const payBtnText = payBtn?.querySelector('#payBtnText') as HTMLElement | null;
        const payBtnSpinner = payBtn?.querySelector('#payBtnSpinner') as HTMLElement | null;

        if (payBtn) (payBtn as HTMLButtonElement).disabled = true;
        if (payBtnText) payBtnText.classList.add('opacity-0');
        if (payBtnSpinner) payBtnSpinner.classList.remove('hidden');

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Show success
        this.setStep('success');

        // Track payment success
        import('../../../components/ui/analytics').then(({ PlatformAnalytics }) => {
          PlatformAnalytics.trackConversion('payment_completed', {
            transaction_id: `mock_${  Date.now()}`,
            value: 180,
            currency: 'EUR',
            items: [{ name: 'Café com Vendas Lisboa', quantity: 1, price: 180 }],
            pricing_tier: 'early_bird'
          });
        }).catch(() => {
          console.debug('Payment completion analytics tracking unavailable');
        });

        // Auto-redirect after success
        setTimeout(() => {
          window.location.href = '/thank-you';
        }, 3000);

        return;
      } catch (error) {
        console.error('Mock payment error:', error);
        this.showError('payError', 'Erro no processamento do pagamento. Tente novamente.');
      }
    }

    if (!this.stripe || !this.elements || !this.clientSecret) {
      this.showError('payError', 'Erro no sistema de pagamento. Recarregue a página.');
      return;
    }

    try {
      // Show loading state
      const payBtn = document.querySelector('#payBtn');
      const payBtnText = payBtn?.querySelector('#payBtnText') as HTMLElement | null;
      const payBtnSpinner = payBtn?.querySelector('#payBtnSpinner') as HTMLElement | null;

      if (payBtn) (payBtn as HTMLButtonElement).disabled = true;
      if (payBtnText) payBtnText.classList.add('opacity-0');
      if (payBtnSpinner) payBtnSpinner.classList.remove('hidden');

      // Confirm the payment with Stripe using the Payment Element
      // This handles all payment methods configured in Dashboard (cards, SEPA, iDEAL, MB Way, etc.)
      const { error } = await this.stripe.confirmPayment({
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
        redirect: 'if_required' // Stay on page if possible, redirect if required (e.g., for SEPA)
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
          console.debug('Payment error analytics tracking unavailable');
        });
      } else {
        // Payment succeeded
        this.setStep('success');

        // Track payment success
        import('../../../components/ui/analytics').then(({ PlatformAnalytics }) => {
          PlatformAnalytics.trackConversion('payment_completed', {
            transaction_id: this.clientSecret?.split('_secret')[0],
            value: 47,
            currency: 'EUR',
            items: [{ name: 'Café com Vendas Lisboa', quantity: 1, price: 47 }],
            pricing_tier: 'early_bird'
          });
        }).catch(() => {
          console.debug('Payment completion analytics tracking unavailable');
        });

        // Auto-redirect after success
        setTimeout(() => {
          window.location.href = '/thank-you';
        }, 3000);
      }
    } catch (error: unknown) {
      console.error('Payment error:', error);
      this.showError('payError', 'Erro no processamento do pagamento. Tente novamente.');
    } finally {
      // Reset loading state
      const payBtn = document.querySelector('#payBtn');
      const payBtnText = payBtn?.querySelector('#payBtnText') as HTMLElement | null;
      const payBtnSpinner = payBtn?.querySelector('#payBtnSpinner') as HTMLElement | null;

      if (payBtn) (payBtn as HTMLButtonElement).disabled = false;
      if (payBtnText) payBtnText.classList.remove('opacity-0');
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
    const leadSubmitText = safeQuery('#leadSubmitText');
    const leadSubmitSpinner = safeQuery('#leadSubmitSpinner');

    if (leadSubmit) (leadSubmit as HTMLButtonElement).disabled = false;
    if (leadSubmitText) leadSubmitText.classList.remove('opacity-0');
    if (leadSubmitSpinner) leadSubmitSpinner.classList.add('hidden');

    const payBtn = safeQuery('#payBtn');
    const payBtnText = safeQuery('#payBtnText');
    const payBtnSpinner = safeQuery('#payBtnSpinner');

    if (payBtn) (payBtn as HTMLButtonElement).disabled = true;
    if (payBtnText) payBtnText.classList.remove('opacity-0');
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
    return `idm_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
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

  getUTMParams(): Record<string, string> {
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
      const value = params.get(key);
      if (value) utm[key] = value;
    });

    return utm;
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