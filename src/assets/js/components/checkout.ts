/**
 * Checkout Component for Café com Vendas
 * Two-step modal checkout: Lead capture (Formspree) + Stripe Payment Elements
 * Follows strict Tailwind-only CSS approach with class manipulation only
 */

import { ENV } from '@/config/constants.js';
import { Analytics } from '@/core/analytics.js';
import { safeQuery } from '@/utils/dom.js';
import { normalizeEventPayload } from '@/utils/gtm-normalizer.js';
import type { Component } from '@/types/component.js';

// Note: Global types are declared in src/assets/js/types/global.ts

// Pricing tier interface (currently unused but kept for future functionality)
// interface PricingTier {
//   id: string;
//   label: string;
//   price: number;
//   vat: boolean;
//   discountPercent: number;
//   capacity: number;
//   notes: string;
// }

/**
 * Basic Stripe types for payment processing
 */
interface StripeError {
  message: string;
  type?: string;
  code?: string;
  status?: number;
}

interface StripeElements {
  create: (type: string, options?: Record<string, unknown>) => StripeElement;
}

interface StripeElement {
  mount: (selector: string) => void;
  on: (event: string, handler: (event: StripeElementChangeEvent) => void) => void;
}

interface StripeElementChangeEvent {
  complete: boolean;
  error?: StripeError;
}

interface StripeInstance {
  elements: (options?: Record<string, unknown>) => StripeElements;
  confirmPayment: (options: Record<string, unknown>) => Promise<{ error?: StripeError }>;
}

interface LeadData {
  lead_id: string;
  status: string;
  full_name: string;
  email: string;
  phone: string;
  page: string;
  timestamp: string;
  [key: string]: string | undefined; // For UTM params
}

interface _SubmitElements {
  submitButton: HTMLButtonElement | null;
  submitText: HTMLElement | null;
  submitSpinner: HTMLElement | null;
}

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  fullPhone: string;
}

// Pricing tier detection for dynamic analytics
const PricingManager = {
  // Event data cache (would be loaded from API in production)
  eventData: {
    pricing: {
      currency: 'EUR',
      tiers: [
        {
          id: 'first_lot_early_bird',
          label: 'Primeiro lote (8 vagas)',
          price: 180,
          vat: true,
          discountPercent: 25,
          capacity: 8,
          notes: 'Mais de 25% de desconto + brindes exclusivos'
        },
        {
          id: 'second_lot',
          label: 'Segundo lote',
          price: 240,
          vat: true,
          discountPercent: 0,
          capacity: 12,
          notes: 'Preço regular'
        }
      ]
    }
  },

  // Simulate current tier detection
  // In production, this would check sales count via API or local storage
  getCurrentPricingTier() {
    // Logic to determine current active tier
    // For now, you can manually switch between tiers for testing
    const currentSalesCount = this.getCurrentSalesCount();

    // Determine which tier is currently active
    let activeTier = this.eventData.pricing.tiers[0]; // Default to first tier
    let totalCapacityUsed = 0;

    for (const tier of this.eventData.pricing.tiers) {
      if (currentSalesCount < (totalCapacityUsed + tier.capacity)) {
        activeTier = tier;
        break;
      }
      totalCapacityUsed += tier.capacity;
    }

    return {
      tier_id: activeTier.id,
      price: activeTier.price,
      currency: this.eventData.pricing.currency,
      label: activeTier.label,
      discount_percent: activeTier.discountPercent,
      sales_count: currentSalesCount,
      capacity_remaining: (totalCapacityUsed + activeTier.capacity) - currentSalesCount
    };
  },

  // Simulate sales count - in production this would come from your backend
  getCurrentSalesCount() {
    // You can modify this number to test different tiers
    // 0-7: first tier active (€180)
    // 8+: second tier active (€240)
    return parseInt(localStorage.getItem('cafecomvendas_sales_count') ?? '0', 10);
  },

  // Utility to manually set sales count for testing
  setSalesCountForTesting(count: number) {
    localStorage.setItem('cafecomvendas_sales_count', count.toString());
    console.log(`🧪 Testing: Sales count set to ${count}`);

    const tier = this.getCurrentPricingTier();
    console.log(`🎯 Active tier: ${tier.label} (€${tier.price})`);
  },

  // Convert Stripe amount (cents) to euros
  stripeAmountToEuros(amountInCents: number) {
    return Math.round(amountInCents / 100);
  },

  // Get pricing display info for UI
  getPricingDisplayInfo() {
    const tier = this.getCurrentPricingTier();
    return {
      price: tier.price,
      currency: 'EUR',
      formatted: `€${tier.price}`,
      tier_label: tier.label,
      discount: tier.discount_percent > 0 ? `${tier.discount_percent}% desconto` : null,
      urgency: tier.capacity_remaining <= 3 ? `Apenas ${tier.capacity_remaining} vagas restantes` : null
    };
  }
};

// Make PricingManager available globally for testing
if (ENV.isDevelopment) {
  window.PricingManager = PricingManager;
  console.log('🧪 PricingManager available globally for testing');
  console.log('🧪 Try: PricingManager.setSalesCountForTesting(5) or PricingManager.setSalesCountForTesting(10)');
}

interface CheckoutComponent extends Component {
  // Component state
  stripe: StripeInstance | null;
  elements: StripeElements | null;
  paymentElement: StripeElement | null;
  clientSecret: string | null;
  leadId: string | null;
  currentStep: number | string;
  idempotencyKey: string | null;
  stripeLoaded: boolean;
  stripeLoadPromise: Promise<void> | null;
  scrollPosition: number;
  isScrollLocked: boolean;
  // Methods
  initializeComponent(): void;
  bindEvents(): void;
  initializeStripe(): void;
  handleOpenClick(event: Event): void;
  openModal(): void;
  closeModal(): void;
  getLeadFormElements(): _SubmitElements;
  extractLeadFormData(): CheckoutFormData;
  getSourceSection(): string;
  trackLeadConversion(): void;
  handleLeadSubmissionError(error: StripeError): void;
  validateLeadForm(fullName: string, email: string, phone: string): boolean;
  setStep(step: number | string): void;
  setButtonLoading(button: HTMLButtonElement | null, textElement: HTMLElement | null, spinnerElement: HTMLElement | null, isLoading: boolean): void;
  showError(elementId: string, message: string): void;
  clearError(elementId: string): void;
  clearErrors(): void;
  resetForm(): void;
  generateUUID(): string;
  generateIdempotencyKey(): string;
  isValidEmail(email: string): boolean;
  getUTMParams(): Record<string, string>;
  translateStripeError(message: string): string;
  lockScroll(): void;
  unlockScroll(): void;
}

// Add missing interfaces
interface _PricingTier {
  id: string;
  label: string;
  price: number;
  vat: boolean;
  discountPercent: number;
  capacity: number;
  notes: string;
}

interface _FormElements {
  fullName: HTMLInputElement | null;
  email: HTMLInputElement | null;
  phone: HTMLInputElement | null;
}

export const Checkout: CheckoutComponent = {
  // Component state
  stripe: null as StripeInstance | null,
  elements: null as StripeElements | null,
  paymentElement: null as StripeElement | null,
  clientSecret: null as string | null,
  leadId: null as string | null,
  currentStep: 1 as number | string,
  idempotencyKey: null as string | null,
  stripeLoaded: false as boolean,
  stripeLoadPromise: null as Promise<void> | null,
  // Scroll lock state
  scrollPosition: 0 as number,
  isScrollLocked: false as boolean,

  init(): void {
    try {
      this.initializeComponent();
      this.bindEvents();
      // Stripe is now loaded lazily when checkout is opened
    } catch (error) {
      console.error('Error initializing Checkout component:', error);
    }
  },

  initializeComponent(): void {
    // Make methods available globally for event handlers if needed
    window.openCheckout = this.openModal.bind(this);
    window.closeCheckout = this.closeModal.bind(this);

    // Initialize modal elements
    const modal = safeQuery('#checkoutModal');
    if (!modal) {
      console.warn('Checkout modal not found');
      return;
    }

    // Set initial state
    this.setStep(1);
    this.leadId = this.generateUUID();
    this.idempotencyKey = this.generateIdempotencyKey();

    // Ensure spinner is hidden on initialization
    const spinner = safeQuery('#leadSubmitSpinner');
    if (spinner) {
      spinner.classList.add('hidden');
    }
  },

  bindEvents(): void {
    // Modal open/close events - use event delegation for dynamic buttons
    document.addEventListener('click', (e) => {
      const triggerButton = (e.target as HTMLElement).closest('[data-checkout-trigger]');
      if (triggerButton) {
        e.preventDefault();
        this.handleOpenClick(e);
      }
    });

    const closeButton = safeQuery('#closeCheckout');
    closeButton?.addEventListener('click', this.closeModal.bind(this));

    // Close on backdrop click
    const modal = safeQuery('#checkoutModal');
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !safeQuery('#checkoutModal')?.classList.contains('hidden')) {
        this.closeModal();
      }
    });

    // Safety unlock scroll on page unload
    window.addEventListener('beforeunload', () => {
      this.unlockScroll();
    });

    // Lead form submission
    const leadForm = safeQuery('#leadForm');
    leadForm?.addEventListener('submit', this.handleLeadSubmit.bind(this));

    // Payment button
    const payButton = safeQuery('#payBtn');
    payButton?.addEventListener('click', this.handlePayment.bind(this));
  },

  async loadStripeScript(): Promise<void> {
    // Return existing promise if already loading
    if (this.stripeLoadPromise) {
      return this.stripeLoadPromise;
    }

    // Return resolved promise if already loaded
    if (this.stripeLoaded && this.stripe) {
      return Promise.resolve();
    }

    // Create new loading promise
    this.stripeLoadPromise = new Promise<void>((resolve, reject) => {
      // Check if Stripe is already available globally
      if (typeof Stripe !== 'undefined') {
        this.initializeStripe();
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      // Let CSP edge function inject the correct nonce; no inline code used
      script.async = true;

      // Handle successful load
      script.onload = () => {
        try {
          this.initializeStripe();
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      // Handle error
      script.onerror = () => {
        reject(new Error('Failed to load Stripe.js'));
      };

      // Add to document head
      document.head.appendChild(script);
    });

    return this.stripeLoadPromise;
  },

  initializeStripe(): void {
    if (!ENV.stripe.publishableKey) {
      throw new Error('Stripe publishable key not configured');
    }

    const stripeConstructor = window.Stripe;
    if (typeof stripeConstructor === 'function') {
      this.stripe = stripeConstructor(ENV.stripe.publishableKey);
    } else {
      this.stripe = null;
    }
    this.stripeLoaded = true;

    if (!this.stripe) {
      throw new Error('Failed to initialize Stripe');
    }
  },

  async loadStripe(): Promise<void> {
    try {
      await this.loadStripeScript();
    } catch (error) {
      console.error('Error loading Stripe:', error);
      this.showError('payError', 'Erro ao carregar sistema de pagamento. Tente novamente.');
      throw error;
    }
  },


  handleOpenClick(event: Event): void {
    event.preventDefault();
    this.openModal();

    // Get current pricing tier for analytics
    const currentTier = PricingManager.getCurrentPricingTier();

    // Track checkout opened event for GTM (matches GA4 Begin Checkout)
    window.dataLayer = window.dataLayer || [];
    const checkoutPayload = normalizeEventPayload({
      event: 'checkout_opened',
      value: currentTier.price, // Number, no quotes
      currency: 'EUR', // 3-letter uppercase
      pricing_tier: currentTier.tier_id,
      items: [{
        item_id: 'SKU_CCV_PT_2025',
        item_name: 'Café com Vendas – Portugal 2025',
        price: currentTier.price, // Number
        quantity: 1,
        item_category: 'Event'
      }]
    });
    window.dataLayer.push(checkoutPayload);
  },

  async openModal(): Promise<void> {
    const modal = safeQuery('#checkoutModal');
    const modalContent = safeQuery('#modalContent');

    if (!modal || !modalContent) return;

    // Show modal with backdrop
    modal.classList.remove('hidden');

    // Animate modal in
    requestAnimationFrame(() => {
      modalContent.classList.remove('scale-95', 'opacity-0');
      modalContent.classList.add('scale-100', 'opacity-100');
    });

    // Reset to step 1
    this.setStep(1);
    this.clearErrors();

    // Ensure spinner is hidden when modal opens
    const spinner = safeQuery('#leadSubmitSpinner');
    if (spinner) {
      spinner.classList.add('hidden');
    }

    // Load Stripe.js lazily when modal opens (only first time)
    if (!this.stripeLoaded) {
      try {
        await this.loadStripe();
        console.log('🎯 Stripe.js loaded lazily on modal open');
      } catch (error) {
        console.error('Failed to load Stripe on modal open:', error);
        // Don't prevent modal from opening, error will be shown if user tries to proceed to payment
      }
    }

    // Focus first input
    const firstInput = safeQuery('#fullName');
    setTimeout(() => (firstInput as HTMLInputElement)?.focus(), 300);

    // Lock background scroll completely
    this.lockScroll();

    // Track conversion event - modal opened
    Analytics.track('lead_capture_started', {
      event_category: 'Conversion',
      event_label: 'Checkout Modal Opened',
      form_location: 'modal'
    });
  },

  closeModal(): void {
    const modal = safeQuery('#checkoutModal');
    const modalContent = safeQuery('#modalContent');

    if (!modal || !modalContent) return;

    // Animate modal out
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');

    // Hide modal after animation
    setTimeout(() => {
      modal.classList.add('hidden');
      this.unlockScroll();
      this.resetForm();
    }, 300);

    // Track analytics
    Analytics.track('checkout_closed', {
      step: this.currentStep,
      lead_captured: this.currentStep > 1
    });
  },

  async handleLeadSubmit(event: Event): Promise<void> {
    event.preventDefault();

    const elements = this.getLeadFormElements();
    const formData = this.extractLeadFormData();

    // Validate required fields
    if (!this.validateLeadForm(formData.fullName, formData.email, formData.phone)) return;

    // Show loading state
    this.setButtonLoading(elements.submitButton, elements.submitText, elements.submitSpinner, true);
    this.clearErrors();

    try {
      await this.processLeadSubmission(formData);
    } catch (error) {
      this.handleLeadSubmissionError(error);
    } finally {
      this.setButtonLoading(elements.submitButton, elements.submitText, elements.submitSpinner, false);
    }
  },

  getLeadFormElements(): _SubmitElements {
    return {
      submitButton: safeQuery('#leadSubmit'),
      submitText: safeQuery('#leadSubmitText'),
      submitSpinner: safeQuery('#leadSubmitSpinner')
    };
  },

  extractLeadFormData(): CheckoutFormData {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const fullNameEl = safeQuery('#fullName') as HTMLInputElement;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const emailEl = safeQuery('#email') as HTMLInputElement;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const countryCodeEl = safeQuery('#countryCode') as HTMLSelectElement;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const phoneEl = safeQuery('#phone') as HTMLInputElement;

    const fullName = fullNameEl?.value?.trim() ?? '';
    const email = emailEl?.value?.trim() ?? '';
    const countryCode = countryCodeEl?.value ?? '';
    const phone = phoneEl?.value?.trim() ?? '';
    const fullPhone = `${countryCode} ${phone}`.trim();

    return { fullName, email, phone, fullPhone };
  },

  async processLeadSubmission(formData: CheckoutFormData): Promise<void> {
    // Prepare lead data
    const leadData = {
      lead_id: this.leadId,
      status: 'started_checkout',
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.fullPhone,
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      ...this.getUTMParams()
    };

    // Submit to both Formspree and MailerLite in parallel
    // Formspree is required, MailerLite is enhancement
    const [formspreeResult, mailerliteResult] = await Promise.allSettled([
      this.submitToFormspreeWithValidation(leadData),
      this.submitToMailerLiteWithValidation(leadData)
    ]);

    // Continue to payment step only if Formspree succeeds
    if (formspreeResult.status === 'rejected') {
      throw formspreeResult.reason;
    }

    // Log MailerLite result for monitoring (don't fail on MailerLite errors)
    if (mailerliteResult.status === 'rejected') {
      console.warn('MailerLite lead capture failed:', mailerliteResult.reason);
    } else if (mailerliteResult.status === 'fulfilled') {
      console.log('MailerLite lead capture succeeded:', mailerliteResult.value);
    }

    // Create payment intent
    const clientSecret = await this.createPaymentIntentWithValidation(leadData);
    this.clientSecret = clientSecret;

    // Initialize Stripe Elements and move to payment step
    await this.initializeStripeElements();
    this.setStep(2);

    // Track successful conversion events
    this.trackLeadConversion();
  },

  async submitToFormspreeWithValidation(leadData: LeadData): Promise<void> {
    const formspreeResponse = await this.submitToFormspree(leadData);
    if (!formspreeResponse.ok) {
      throw new Error('Erro ao salvar dados. Tente novamente.');
    }
  },

  async createPaymentIntentWithValidation(leadData: LeadData): Promise<string> {
    const paymentIntentResponse = await this.createPaymentIntent(leadData);

    if (!paymentIntentResponse.ok) {
      const errorMessage = await this.extractPaymentErrorMessage(paymentIntentResponse);
      const error = new Error(errorMessage);
      (error as StripeError).status = paymentIntentResponse.status;
      throw error;
    }

    const { clientSecret } = await paymentIntentResponse.json();
    return clientSecret;
  },

  async extractPaymentErrorMessage(response: Response): Promise<string> {
    let errorMessage = 'Erro ao processar pagamento. Tente novamente.';
    try {
      const errorData = await response.json();
      if (errorData.details && Array.isArray(errorData.details)) {
        errorMessage = errorData.details.join(', ');
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Keep default error message if JSON parsing fails
    }
    return errorMessage;
  },

  getSourceSection(): string {
    // Determine which section the user clicked from
    const trigger = document.querySelector('[data-checkout-trigger]:focus');
    if (trigger) {
      const section = trigger.closest('section');
      if (section?.id) {
        return section.id; // hero, pricing_table, footer, etc.
      }
    }
    return 'unknown';
  },

  trackLeadConversion(): void {
    // Track lead form submission for GTM (matches GA4 Generate Lead)
    window.dataLayer = window.dataLayer || [];
    const leadPayload = normalizeEventPayload({
      event: 'lead_form_submitted',
      lead_id: this.leadId, // String, unique per lead (will be normalized)
      form_location: 'checkout_modal', // Where the form is located (will be normalized)
      source_section: this.getSourceSection() // Optional: where user clicked from (will be normalized)
    });
    window.dataLayer.push(leadPayload);

    // Track checkout initiation
    Analytics.track('checkout_initiated', {
      event_category: 'Conversion',
      event_label: 'Payment Step Started',
      value: 180 // Event price in EUR
    });
  },

  handleLeadSubmissionError(error: StripeError): void {
    console.error('Lead submission error:', error);

    // Handle specific error types
    if (error.status === 409) {
      // Idempotency conflict - regenerate key and retry once
      this.idempotencyKey = this.generateIdempotencyKey();
      this.showError('leadError', 'Solicitação duplicada detectada. Tente novamente.');
    } else if (error.status === 400) {
      // Validation error - show specific message
      this.showError('leadError', error.message ?? 'Dados inválidos. Verifique as informações e tente novamente.');
    } else if (error.status === 429) {
      // Rate limit exceeded
      this.showError('leadError', 'Muitas tentativas. Aguarde alguns minutos e tente novamente.');
    } else {
      this.showError('leadError', error.message ?? 'Erro inesperado. Tente novamente.');
    }
  },

  validateLeadForm(fullName: string, email: string, phone: string): boolean {
    if (!fullName || fullName.length < 2) {
      this.showError('leadError', 'Por favor, digite seu nome completo.');
      return false;
    }

    if (!email || !this.isValidEmail(email)) {
      this.showError('leadError', 'Por favor, digite um email válido.');
      return false;
    }

    if (!phone || phone.length < 7) {
      this.showError('leadError', 'Por favor, digite um número de telefone válido.');
      return false;
    }

    return true;
  },

  async submitToFormspree(leadData: LeadData): Promise<Response> {
    return fetch(ENV.formspree.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(leadData)
    });
  },

  async submitToMailerLiteWithValidation(leadData: LeadData): Promise<Record<string, unknown>> {
    const response = await this.submitToMailerLite(leadData);
    if (!response.ok) {
      throw new Error('MailerLite lead capture failed');
    }
    return response.json();
  },

  async submitToMailerLite(leadData: LeadData): Promise<Response> {
    // Use local functions server during development
    const functionsUrl = window.location.hostname === 'localhost' ?
      'http://localhost:9999/.netlify/functions/mailerlite-lead' :
      '/.netlify/functions/mailerlite-lead';

    return fetch(functionsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(leadData)
    });
  },

  async createPaymentIntent(leadData: LeadData): Promise<Response> {
    // Use local functions server during development
    const functionsUrl = window.location.hostname === 'localhost' ?
      'http://localhost:9999/.netlify/functions/create-payment-intent' :
      '/.netlify/functions/create-payment-intent';

    return fetch(functionsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': this.idempotencyKey
      },
      body: JSON.stringify({
        ...leadData,
        amount: 18000, // €180.00 in cents
        currency: 'eur',
        idempotency_key: this.idempotencyKey
      })
    });
  },

  async initializeStripeElements(): Promise<void> {
    if (!this.stripe || !this.clientSecret) {
      throw new Error('Stripe not initialized or missing client secret');
    }

    // Create Elements with theme
    this.elements = this.stripe.elements({
      clientSecret: this.clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#191F3A', // Navy
          colorBackground: '#ffffff',
          colorText: '#191F3A',
          colorDanger: '#81171F', // Burgundy
          fontFamily: 'Century Gothic, -apple-system, BlinkMacSystemFont, sans-serif',
          spacingUnit: '4px',
          borderRadius: '12px'
        }
      },
      locale: 'pt'
    });

    // Create and mount Payment Element
    this.paymentElement = this.elements.create('payment', {
      layout: 'accordion',
      terms: {
        card: 'never'
      },
      wallets: {
        applePay: 'auto',
        googlePay: 'auto'
      },
      paymentMethodOrder: ['apple_pay', 'google_pay', 'card', 'mb_way']
    });

    const paymentElementContainer = safeQuery('#payment-element');
    if (paymentElementContainer) {
      await this.paymentElement.mount('#payment-element');
    }

    // Enable payment button when Elements are ready
    this.paymentElement.on('ready', () => {
      const payBtn = safeQuery('#payBtn');
      payBtn?.removeAttribute('disabled');
    });

    // Handle real-time validation
    this.paymentElement.on('change', (event: StripeElementChangeEvent) => {
      this.clearError('payError');

      if (event.error) {
        this.showError('payError', this.translateStripeError(event.error.message));
      }
    });
  },

  async handlePayment(): Promise<void> {
    if (!this.stripe || !this.elements) {
      this.showError('payError', 'Erro no sistema de pagamento. Recarregue a página.');
      return;
    }

    const payButton = safeQuery('#payBtn');
    const payText = safeQuery('#payBtnText');
    const paySpinner = safeQuery('#payBtnSpinner');

    // Show loading state
    this.setButtonLoading(payButton, payText, paySpinner, true);
    this.clearError('payError');

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: `${window.location.origin}${ENV.urls.thankYou}`
        },
        redirect: 'if_required'
      });

      if (error) {
        throw new Error(this.translateStripeError(error.message));
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful
        this.setStep('success');

        // Get pricing tier for analytics
        const currentTier = PricingManager.getCurrentPricingTier();

        // Track purchase completed event for GTM (matches GA4 Purchase)
        const purchaseValue = PricingManager.stripeAmountToEuros(paymentIntent.amount);
        window.dataLayer = window.dataLayer || [];
        const purchasePayload = normalizeEventPayload({
          event: 'purchase_completed',
          transaction_id: paymentIntent.id, // String, unique (will be normalized)
          value: purchaseValue, // Number, no quotes (not normalized)
          currency: 'EUR', // 3-letter uppercase
          items: [{
            item_id: 'SKU_CCV_PT_2025',
            item_name: 'Café com Vendas – Portugal 2025',
            price: purchaseValue, // Number
            quantity: 1,
            item_category: 'Event'
          }],
          pricing_tier: currentTier.tier_id // Optional (will be normalized)
        });
        window.dataLayer.push(purchasePayload);

        // Redirect to thank you page after delay
        setTimeout(() => {
          // Unlock scroll before redirect to ensure clean state
          this.unlockScroll();
          window.location.href = ENV.urls.thankYou;
        }, 2000);
      }

    } catch (error) {
      console.error('Payment error:', error);
      this.showError('payError', (error as Error).message || 'Erro no pagamento. Tente novamente.');

      // Track payment failure
      Analytics.track('payment_failed', {
        lead_id: this.leadId,
        error: (error as Error).message
      });
    } finally {
      this.setButtonLoading(payButton, payText, paySpinner, false);
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
      // Step 1: Lead form
      leadForm?.classList.remove('hidden');
      progressBar?.classList.remove('w-full');
      progressBar?.classList.add('w-1/2');

    } else if (step === 2) {
      // Step 2: Payment
      paymentStep?.classList.remove('hidden');
      progressBar?.classList.remove('w-1/2');
      progressBar?.classList.add('w-full');

    } else if (step === 'success') {
      // Success state
      paymentSuccess?.classList.remove('hidden');
      progressBar?.classList.add('w-full');
    }
  },


  setButtonLoading(button: HTMLButtonElement | null, textElement: HTMLElement | null, spinnerElement: HTMLElement | null, isLoading: boolean): void {
    if (!button) return;

    if (isLoading) {
      button.disabled = true;
      textElement?.classList.add('opacity-50');
      spinnerElement?.classList.remove('hidden');
    } else {
      button.disabled = false;
      textElement?.classList.remove('opacity-50');
      spinnerElement?.classList.add('hidden');
    }
  },

  showError(elementId: string, message: string): void {
    const errorElement = safeQuery(`#${elementId}`);
    if (errorElement && message) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
    }
  },

  clearError(elementId: string): void {
    const errorElement = safeQuery(`#${elementId}`);
    if (errorElement) {
      errorElement.classList.add('hidden');
      errorElement.textContent = '';
    }
  },

  clearErrors(): void {
    this.clearError('leadError');
    this.clearError('payError');
  },

  resetForm(): void {
    // Reset form fields
    const form = safeQuery('#leadForm');
    (form as HTMLFormElement)?.reset();

    // Reset component state
    this.currentStep = 1;
    this.clientSecret = null;
    this.leadId = this.generateUUID();
    this.idempotencyKey = this.generateIdempotencyKey();

    // Destroy Stripe elements (but keep Stripe.js loaded for reuse)
    if (this.paymentElement) {
      this.paymentElement.destroy();
      this.paymentElement = null;
    }

    if (this.elements) {
      this.elements = null;
    }

    // Note: We don't reset stripeLoaded or stripeLoadPromise to keep Stripe.js cached

    this.clearErrors();
  },

  // Utility methods
  generateUUID(): string {
    return crypto?.randomUUID ?
      crypto.randomUUID() :
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  },

  generateIdempotencyKey(): string {
    return `idm_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  },

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

  // Scroll lock methods - prevent background page scroll when modal is open
  lockScroll(): void {
    if (this.isScrollLocked) return;

    // Store current scroll position
    this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // Apply scroll lock using pure Tailwind classes
    document.body.classList.add('fixed', 'inset-x-0', 'overflow-hidden');

    // Set the top offset to maintain visual position - use negative margin
    // Note: Using style for precise positioning as Tailwind doesn't have arbitrary negative top values
    const topOffset = -this.scrollPosition;
    document.body.style.top = `${topOffset}px`;

    this.isScrollLocked = true;
  },

  unlockScroll(): void {
    if (!this.isScrollLocked) return;

    // Remove scroll lock classes
    document.body.classList.remove('fixed', 'inset-x-0', 'overflow-hidden');

    // Clear the top offset style
    document.body.style.top = '';

    // Restore scroll position
    window.scrollTo(0, this.scrollPosition);

    this.isScrollLocked = false;
    this.scrollPosition = 0;
  }
};