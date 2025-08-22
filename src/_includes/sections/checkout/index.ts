/**
 * Checkout Section Component for Café com Vendas
 * Co-located checkout behavior using platform modal components
 * Two-step modal checkout: Lead capture (Formspree) + Stripe Payment Elements
 */

import { ENV } from '@/config/constants.ts';
import { safeQuery } from '@platform/lib/utils/dom.ts';
import { PlatformModal, PlatformAnalytics } from '@platform/ui/components/index.ts';
import type { Component } from '@/types/component.ts';

// Stripe types (inline to avoid dependencies)
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
  destroy?: () => void;
}

interface StripeElementChangeEvent {
  complete: boolean;
  error?: StripeError;
}

interface StripeInstance {
  elements: (options?: Record<string, unknown>) => StripeElements;
  confirmPayment: (options: Record<string, unknown>) => Promise<{ error?: StripeError }>;
}


interface CheckoutSectionComponent extends Component {
  modal: PlatformModal | null;
  stripe: StripeInstance | null;
  elements: StripeElements | null;
  paymentElement: StripeElement | null;
  clientSecret: string | null;
  leadId: string | null;
  currentStep: number | string;
  idempotencyKey: string | null;
  stripeLoaded: boolean;
  stripeLoadPromise: Promise<void> | null;

  initializeCheckout(): void;
  setupCheckoutTriggers(): void;
  setupModalBehavior(): void;
  loadStripeScript(): Promise<void>;
  initializeStripe(): void;
  handleLeadSubmit(event: Event): Promise<void>;
  handlePayment(): Promise<void>;
  handleOpenClick(event: Event): void;
  getSourceSection(): string;
  showError(elementId: string, message: string): void;
  setStep(step: number | string): void;
  resetForm(): void;
  generateUUID(): string;
  generateIdempotencyKey(): string;
  isValidEmail(email: string): boolean;
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
  currentStep: 1,
  idempotencyKey: null,
  stripeLoaded: false,
  stripeLoadPromise: null,

  init(): void {
    try {
      this.initializeCheckout();
      this.setupCheckoutTriggers();
      this.setupModalBehavior();
    } catch (error) {
      console.error('Error initializing Checkout section:', error);
    }
  },

  initializeCheckout(): void {
    // Initialize modal using platform component
    this.modal = new PlatformModal({
      modalId: 'checkoutModal',
      lockScroll: true,
      focusFirstInput: true,
      animationDuration: 300
    });

    // Set initial state
    this.setStep(1);
    this.leadId = this.generateUUID();
    this.idempotencyKey = this.generateIdempotencyKey();
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
    // Lead form submission
    const leadForm = safeQuery('#leadForm');
    leadForm?.addEventListener('submit', this.handleLeadSubmit.bind(this));

    // Payment button
    const payButton = safeQuery('#payBtn');
    payButton?.addEventListener('click', this.handlePayment.bind(this));
  },

  handleOpenClick(event: Event): void {
    event.preventDefault();

    if (!this.modal) {
      console.error('Modal not initialized');
      return;
    }

    this.modal.open();

    // Track checkout opened using platform analytics
    PlatformAnalytics.trackSectionEngagement('checkout', 'modal_opened', {
      trigger_location: this.getSourceSection()
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

  async loadStripeScript(): Promise<void> {
    if (this.stripeLoadPromise) {
      return this.stripeLoadPromise;
    }

    if (this.stripeLoaded && this.stripe) {
      return Promise.resolve();
    }

    this.stripeLoadPromise = new Promise<void>((resolve, reject) => {
      if (typeof Stripe !== 'undefined') {
        this.initializeStripe();
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;

      script.onload = () => {
        try {
          this.initializeStripe();
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      script.onerror = () => {
        reject(new Error('Failed to load Stripe.js'));
      };

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

    // Basic validation
    if (!leadData.fullName || !leadData.email || !leadData.phone) {
      this.showError('leadError', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!this.isValidEmail(leadData.email)) {
      this.showError('leadError', 'Por favor, insira um email válido.');
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
        await this.loadStripeScript();
      }

      // Track lead conversion
      PlatformAnalytics.trackSectionEngagement('checkout', 'lead_submitted', {
        lead_id: this.leadId
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
    if (!this.stripe || !this.elements) {
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

      // TODO: Implement actual Stripe payment processing
      // For now, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.setStep('success');

      // Track payment success
      PlatformAnalytics.trackSectionEngagement('checkout', 'payment_completed');

      // Auto-redirect after success
      setTimeout(() => {
        window.location.href = '/thank-you';
      }, 3000);
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
    const form = safeQuery('#leadForm');
    (form as HTMLFormElement)?.reset();

    this.currentStep = 1;
    this.clientSecret = null;
    this.leadId = this.generateUUID();
    this.idempotencyKey = this.generateIdempotencyKey();

    if (this.paymentElement?.destroy) {
      this.paymentElement.destroy();
      this.paymentElement = null;
    }

    if (this.elements) {
      this.elements = null;
    }
  },

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
  }
};