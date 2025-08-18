/**
 * Checkout Component for Café com Vendas
 * Two-step modal checkout: Lead capture (Formspree) + Stripe Payment Elements
 * Follows strict Tailwind-only CSS approach with class manipulation only
 */

import { ENV } from '../config/constants.js';
import { Analytics } from '../core/analytics.js';
import { safeQuery } from '../utils/index.js';

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
    return parseInt(localStorage.getItem('cafecomvendas_sales_count') || '0', 10);
  },

  // Utility to manually set sales count for testing
  setSalesCountForTesting(count) {
    localStorage.setItem('cafecomvendas_sales_count', count.toString());
    console.log(`🧪 Testing: Sales count set to ${count}`);

    const tier = this.getCurrentPricingTier();
    console.log(`🎯 Active tier: ${tier.label} (€${tier.price})`);
  },

  // Convert Stripe amount (cents) to euros
  stripeAmountToEuros(amountInCents) {
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

export const Checkout = {
  // Component state
  stripe: null,
  elements: null,
  paymentElement: null,
  clientSecret: null,
  leadId: null,
  currentStep: 1,
  idempotencyKey: null,
  stripeLoaded: false,
  stripeLoadPromise: null,

  init() {
    try {
      this.initializeComponent();
      this.bindEvents();
      // Stripe is now loaded lazily when checkout is opened
    } catch (error) {
      console.error('Error initializing Checkout component:', error);
    }
  },

  initializeComponent() {
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

  bindEvents() {
    // Modal open/close events - use event delegation for dynamic buttons
    document.addEventListener('click', (e) => {
      const triggerButton = e.target.closest('[data-checkout-trigger]');
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
      if (e.key === 'Escape' && !safeQuery('#checkoutModal').classList.contains('hidden')) {
        this.closeModal();
      }
    });

    // Lead form submission
    const leadForm = safeQuery('#leadForm');
    leadForm?.addEventListener('submit', this.handleLeadSubmit.bind(this));

    // Payment button
    const payButton = safeQuery('#payBtn');
    payButton?.addEventListener('click', this.handlePayment.bind(this));
  },

  async loadStripeScript() {
    // Return existing promise if already loading
    if (this.stripeLoadPromise) {
      return this.stripeLoadPromise;
    }

    // Return resolved promise if already loaded
    if (this.stripeLoaded && this.stripe) {
      return Promise.resolve();
    }

    // Create new loading promise
    this.stripeLoadPromise = new Promise((resolve, reject) => {
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

  initializeStripe() {
    if (!ENV.stripe.publishableKey) {
      throw new Error('Stripe publishable key not configured');
    }

    this.stripe = Stripe(ENV.stripe.publishableKey);
    this.stripeLoaded = true;

    if (!this.stripe) {
      throw new Error('Failed to initialize Stripe');
    }
  },

  async loadStripe() {
    try {
      await this.loadStripeScript();
    } catch (error) {
      console.error('Error loading Stripe:', error);
      this.showError('payError', 'Erro ao carregar sistema de pagamento. Tente novamente.');
      throw error;
    }
  },


  handleOpenClick(event) {
    event.preventDefault();
    this.openModal();

    // Get current pricing tier for analytics
    const currentTier = PricingManager.getCurrentPricingTier();

    // Track analytics with dynamic pricing data
    Analytics.track('checkout_opened', {
      source: event.target.closest('[data-checkout-trigger]')?.getAttribute('data-source') || 'unknown',
      amount: currentTier.price,
      currency: currentTier.currency,
      pricing_tier: currentTier.tier_id
    });
  },

  async openModal() {
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
    setTimeout(() => firstInput?.focus(), 300);

    // Prevent body scroll
    document.body.classList.add('overflow-hidden');
  },

  closeModal() {
    const modal = safeQuery('#checkoutModal');
    const modalContent = safeQuery('#modalContent');

    if (!modal || !modalContent) return;

    // Animate modal out
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');

    // Hide modal after animation
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      this.resetForm();
    }, 300);

    // Track analytics
    Analytics.track('checkout_closed', {
      step: this.currentStep,
      lead_captured: this.currentStep > 1
    });
  },

  async handleLeadSubmit(event) {
    event.preventDefault();

    const submitButton = safeQuery('#leadSubmit');
    const submitText = safeQuery('#leadSubmitText');
    const submitSpinner = safeQuery('#leadSubmitSpinner');

    // Get form data
    const fullName = safeQuery('#fullName').value.trim();
    const email = safeQuery('#email').value.trim();
    const countryCode = safeQuery('#countryCode').value;
    const phone = safeQuery('#phone').value.trim();
    const fullPhone = `${countryCode} ${phone}`.trim();

    // Validate required fields
    if (!this.validateLeadForm(fullName, email, phone)) return;

    // Show loading state
    this.setButtonLoading(submitButton, submitText, submitSpinner, true);
    this.clearErrors();

    try {
      // Prepare lead data
      const leadData = {
        lead_id: this.leadId,
        status: 'started_checkout',
        full_name: fullName,
        email,
        phone: fullPhone,
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
        ...this.getUTMParams()
      };

      // Submit to Formspree immediately
      const formspreeResponse = await this.submitToFormspree(leadData);

      if (!formspreeResponse.ok) {
        throw new Error('Erro ao salvar dados. Tente novamente.');
      }

      // Create payment intent
      const paymentIntentResponse = await this.createPaymentIntent(leadData);

      if (!paymentIntentResponse.ok) {
        // Try to get detailed error message
        let errorMessage = 'Erro ao processar pagamento. Tente novamente.';
        try {
          const errorData = await paymentIntentResponse.json();
          if (errorData.details && Array.isArray(errorData.details)) {
            errorMessage = errorData.details.join(', ');
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Keep default error message if JSON parsing fails
        }
        const error = new Error(errorMessage);
        error.status = paymentIntentResponse.status;
        throw error;
      }

      const { clientSecret } = await paymentIntentResponse.json();
      this.clientSecret = clientSecret;

      // Initialize Stripe Elements
      await this.initializeStripeElements();

      // Move to step 2
      this.setStep(2);

      // Track successful lead capture
      Analytics.track('lead_captured', {
        lead_id: this.leadId,
        source: 'checkout_modal'
      });

    } catch (error) {
      console.error('Lead submission error:', error);

      // Handle specific error types
      if (error.status === 409) {
        // Idempotency conflict - regenerate key and retry once
        this.idempotencyKey = this.generateIdempotencyKey();
        this.showError('leadError', 'Solicitação duplicada detectada. Tente novamente.');
      } else if (error.status === 400) {
        // Validation error - show specific message
        this.showError('leadError', error.message || 'Dados inválidos. Verifique as informações e tente novamente.');
      } else if (error.status === 429) {
        // Rate limit exceeded
        this.showError('leadError', 'Muitas tentativas. Aguarde alguns minutos e tente novamente.');
      } else {
        this.showError('leadError', error.message || 'Erro inesperado. Tente novamente.');
      }
    } finally {
      this.setButtonLoading(submitButton, submitText, submitSpinner, false);
    }
  },

  validateLeadForm(fullName, email, phone) {
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

  async submitToFormspree(leadData) {
    return fetch(ENV.formspree.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(leadData)
    });
  },

  async createPaymentIntent(leadData) {
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

  async initializeStripeElements() {
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
    this.paymentElement.on('change', (event) => {
      this.clearError('payError');

      if (event.error) {
        this.showError('payError', this.translateStripeError(event.error.message));
      }
    });
  },

  async handlePayment() {
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

        // Track successful payment with dynamic pricing data
        Analytics.track('payment_completed', {
          transaction_id: paymentIntent.id,
          lead_id: this.leadId,
          amount: PricingManager.stripeAmountToEuros(paymentIntent.amount),
          currency: currentTier.currency,
          pricing_tier: currentTier.tier_id,
          payment_intent_id: paymentIntent.id
        });

        // Redirect to thank you page after delay
        setTimeout(() => {
          window.location.href = ENV.urls.thankYou;
        }, 2000);
      }

    } catch (error) {
      console.error('Payment error:', error);
      this.showError('payError', error.message || 'Erro no pagamento. Tente novamente.');

      // Track payment failure
      Analytics.track('payment_failed', {
        lead_id: this.leadId,
        error: error.message
      });
    } finally {
      this.setButtonLoading(payButton, payText, paySpinner, false);
    }
  },

  setStep(step) {
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


  setButtonLoading(button, textElement, spinnerElement, isLoading) {
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

  showError(elementId, message) {
    const errorElement = safeQuery(`#${elementId}`);
    if (errorElement && message) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
    }
  },

  clearError(elementId) {
    const errorElement = safeQuery(`#${elementId}`);
    if (errorElement) {
      errorElement.classList.add('hidden');
      errorElement.textContent = '';
    }
  },

  clearErrors() {
    this.clearError('leadError');
    this.clearError('payError');
  },

  resetForm() {
    // Reset form fields
    const form = safeQuery('#leadForm');
    form?.reset();

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
  generateUUID() {
    return crypto?.randomUUID ?
      crypto.randomUUID() :
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  },

  generateIdempotencyKey() {
    return `idm_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  },

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    const utm = {};

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
      const value = params.get(key);
      if (value) utm[key] = value;
    });

    return utm;
  },

  translateStripeError(message) {
    const translations = {
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