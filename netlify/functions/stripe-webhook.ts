/**
 * Netlify Function: Stripe Webhook Handler
 * Handles payment confirmations and triggers MailerLite integration
 */

import Stripe from 'stripe';
import type {
  FulfillmentRecord,
  CircuitBreakerStatus,
  MailerLiteSubscriberData,
  TimeoutPromise
} from './types';

// Initialize Stripe with secret key and timeout configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  timeout: 30000, // 30 second timeout for Stripe API calls
  maxNetworkRetries: 2
});

// Timeout configuration
const TIMEOUTS = {
  mailerlite_api: 15000,
  external_api: 10000,
  webhook_processing: 25000
};

/**
 * Timeout wrapper for async operations
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation = 'Operation'): TimeoutPromise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operation} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
}

// MailerLite integration
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID || 'cafe-com-vendas';

// Webhook retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay

// Circuit breaker configuration
interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

const CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  monitoringPeriod: 300000 // 5 minutes
};

// Fulfillment tracking to prevent duplicates
const fulfillmentStore = new Map();
const FULFILLMENT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Circuit breaker state management
const circuitBreakers = new Map();

/**
 * Circuit Breaker Pattern Implementation
 */
class CircuitBreaker {
  public name: string;
  public failureCount: number;
  public lastFailureTime: number | null;
  public state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  public config: CircuitBreakerConfig;
  public successCount: number;
  public totalCalls: number;

  constructor(name: string, config: CircuitBreakerConfig = CIRCUIT_BREAKER_CONFIG) {
    this.name = name;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.config = config;
    this.successCount = 0;
    this.totalCalls = 0;
  }
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.totalCalls++;
    
    if (this.state === 'OPEN') {
      if (this.lastFailureTime && Date.now() - this.lastFailureTime < this.config.resetTimeout) {
        throw new Error(`Circuit breaker is OPEN for ${this.name}`);
      } else {
        this.state = 'HALF_OPEN';
        logWithCorrelation('info', `Circuit breaker transitioning to HALF_OPEN for ${this.name}`);
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess(): void {
    this.successCount++;
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      logWithCorrelation('info', `Circuit breaker CLOSED for ${this.name}`);
    }
  }
  
  onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN';
      logWithCorrelation('warn', `Circuit breaker OPENED for ${this.name}`, {
        failureCount: this.failureCount,
        threshold: this.config.failureThreshold
      });
    }
  }
  
  getStatus(): CircuitBreakerStatus {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalCalls: this.totalCalls,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * Get or create circuit breaker for a service
 */
function getCircuitBreaker(serviceName: string): CircuitBreaker {
  if (!circuitBreakers.has(serviceName)) {
    circuitBreakers.set(serviceName, new CircuitBreaker(serviceName));
  }
  return circuitBreakers.get(serviceName);
}

/**
 * Fulfillment tracking utilities for idempotency
 */
class FulfillmentTracker {
  static cleanExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of fulfillmentStore.entries()) {
      if (now - entry.timestamp > FULFILLMENT_CACHE_TTL) {
        fulfillmentStore.delete(key);
      }
    }
  }
  
  static isAlreadyFulfilled(key: string): boolean {
    this.cleanExpiredEntries();
    return fulfillmentStore.has(key);
  }
  
  static markAsFulfilled(key: string, metadata: Partial<FulfillmentRecord> = {}): void {
    this.cleanExpiredEntries();
    fulfillmentStore.set(key, {
      timestamp: Date.now(),
      fulfilled: true,
      ...metadata
    });
  }
  
  static getFulfillmentInfo(key: string): FulfillmentRecord | undefined {
    this.cleanExpiredEntries();
    return fulfillmentStore.get(key);
  }
  
  static getStats() {
    return {
      size: fulfillmentStore.size,
      maxAge: FULFILLMENT_CACHE_TTL
    };
  }
}

// Logging with correlation IDs
function logWithCorrelation(level: string, message: string, data: Record<string, unknown> = {}, correlationId: string | null = null): string {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId: correlationId || `wh_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
    ...data
  };
  console.log(JSON.stringify(logEntry));
  return logEntry.correlationId;
}

export default async (request: Request): Promise<Response> => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Credentials': 'false'
  } as Record<string, string>;

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers
    });
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }

  let stripeEvent: Stripe.Event;

  try {
    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }

    // Get Stripe signature from headers
    const sig = request.headers.get('stripe-signature');
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig) {
      return new Response(JSON.stringify({ error: 'Missing Stripe signature' }), {
        status: 400,
        headers
      });
    }

    if (!endpointSecret) {
      console.warn('Stripe webhook secret not configured - skipping signature verification');
      // Parse event without verification (development mode)
      const body = await request.text();
      stripeEvent = JSON.parse(body || '{}') as Stripe.Event;
    } else {
      // Verify webhook signature using latest async pattern
      try {
        const body = await request.text();
        stripeEvent = await stripe.webhooks.constructEventAsync(
          body || '',
          sig,
          endpointSecret
        );
      } catch (err) {
        // Handle StripeSignatureVerificationError specifically
        if (err instanceof Error && err.name === 'StripeSignatureVerificationError') {
          logWithCorrelation('error', 'Stripe signature verification failed', {
            error: err.message,
            signature: sig?.substring(0, 20) + '...' // Log partial signature for debugging
          });
          return new Response(JSON.stringify({ error: 'Invalid signature' }), {
            status: 400,
            headers
          });
        }
        throw err; // Re-throw other errors
      }
    }

    const correlationId = logWithCorrelation('info', 'Received Stripe webhook event', {
      eventType: stripeEvent.type,
      eventId: stripeEvent.id,
      livemode: stripeEvent.livemode
    });

    // Handle different event types with retry logic
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(stripeEvent.data.object as Stripe.PaymentIntent, correlationId);
        break;

      case 'payment_intent.processing':
        await handlePaymentProcessing(stripeEvent.data.object as Stripe.PaymentIntent, correlationId);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object as Stripe.PaymentIntent, correlationId);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(stripeEvent.data.object as Stripe.PaymentIntent, correlationId);
        break;

      case 'payment_intent.requires_action':
        await handlePaymentRequiresAction(stripeEvent.data.object as Stripe.PaymentIntent, correlationId);
        break;

      case 'payment_intent.partially_funded':
        await handlePaymentPartiallyFunded(stripeEvent.data.object as Stripe.PaymentIntent, correlationId);
        break;

      case 'charge.dispute.created':
        await handleChargeDispute(stripeEvent.data.object as Stripe.Dispute, correlationId);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(stripeEvent.data.object as Stripe.Invoice, correlationId);
        break;

      case 'checkout.session.async_payment_succeeded':
        await handleCheckoutSessionAsyncPaymentSucceeded(stripeEvent.data.object as Stripe.Checkout.Session, correlationId);
        break;

      case 'checkout.session.async_payment_failed':
        await handleCheckoutSessionAsyncPaymentFailed(stripeEvent.data.object as Stripe.Checkout.Session, correlationId);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(stripeEvent.data.object as Stripe.Subscription, stripeEvent.type, correlationId);
        break;

      default:
        logWithCorrelation('info', `Unhandled event type: ${stripeEvent.type}`, {
          eventId: stripeEvent.id
        }, correlationId);
    }

    // Log circuit breaker status for monitoring
    const circuitBreakerStatuses = Array.from(circuitBreakers.entries()).map(([name, breaker]) => ({
      service: name,
      status: breaker.getStatus()
    }));
    
    if (circuitBreakerStatuses.length > 0) {
      logWithCorrelation('info', 'Circuit breaker statuses', {
        circuitBreakers: circuitBreakerStatuses
      }, correlationId);
    }
    
    // Log fulfillment tracker stats for monitoring
    const fulfillmentStats = FulfillmentTracker.getStats();
    if (fulfillmentStats.size > 0) {
      logWithCorrelation('info', 'Fulfillment tracker stats', {
        fulfillmentTracker: fulfillmentStats
      }, correlationId);
    }

    // Return success response
    return new Response(JSON.stringify({ 
      received: true, 
      event: stripeEvent.type,
      correlationId
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Webhook handler error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(JSON.stringify({ 
      error: 'Webhook handler failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers
    });
  }
};

/**
 * Retry wrapper with exponential backoff
 */
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = MAX_RETRIES, baseDelay = RETRY_DELAY_BASE): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      logWithCorrelation('warn', `Retry attempt ${attempt} failed, retrying in ${delay}ms`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        attempt,
        maxRetries
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Maximum retries exceeded');
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent, correlationId: string): Promise<void> {
  logWithCorrelation('info', `Payment succeeded: ${paymentIntent.id}`, {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency
  }, correlationId);
  
  try {
    // Check if this payment has already been fulfilled
    const fulfillmentKey = `payment_intent_${paymentIntent.id}`;
    
    if (FulfillmentTracker.isAlreadyFulfilled(fulfillmentKey)) {
      const existingFulfillment = FulfillmentTracker.getFulfillmentInfo(fulfillmentKey);
      logWithCorrelation('info', `Payment ${paymentIntent.id} already fulfilled`, {
        paymentIntentId: paymentIntent.id,
        existingFulfillment,
        fulfillmentKey
      }, correlationId);
      return; // Skip duplicate fulfillment
    }
    
    // Extract customer information from metadata
    const metadata = paymentIntent.metadata;
    const customerEmail = metadata.customer_email;
    const customerName = metadata.customer_name;
    const customerPhone = metadata.customer_phone;
    const leadId = metadata.lead_id;

    if (!customerEmail || !customerName) {
      throw new Error('Missing customer information in payment metadata');
    }

    // Add customer to MailerLite with retry logic and circuit breaker
    try {
      await retryWithBackoff(() => addToMailerLite({
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
        fields: {
          lead_id: leadId || '',
          payment_status: 'paid',
          payment_intent_id: paymentIntent.id,
          amount_paid: paymentIntent.amount / 100, // Convert from cents
          currency: paymentIntent.currency.toUpperCase(),
          event_name: metadata.event_name || 'Café com Vendas',
          event_date: metadata.event_date || '2024-09-20',
          spot_type: metadata.spot_type || 'first_lot_early_bird',
          source: metadata.source || 'checkout',
          payment_date: new Date().toISOString(),
          utm_source: metadata.utm_source || null,
          utm_medium: metadata.utm_medium || null,
          utm_campaign: metadata.utm_campaign || null
        }
      }));
    } catch (error) {
      // Log error but don't fail the webhook processing
      logWithCorrelation('error', 'Failed to add customer to MailerLite after retries', {
        error: error instanceof Error ? error.message : 'Unknown error',
        customerEmail,
        paymentIntentId: paymentIntent.id
      }, correlationId);
    }

    // Send confirmation email (via MailerLite automation)
    await triggerConfirmationEmail(customerEmail, {
      name: customerName,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      event_name: metadata.event_name || 'Café com Vendas',
      event_date: metadata.event_date || '20/09/2024'
    });

    // Mark as fulfilled to prevent duplicates
    FulfillmentTracker.markAsFulfilled(fulfillmentKey, {
      customerEmail,
      paymentIntentId: paymentIntent.id,
      fulfillmentType: 'payment_intent_succeeded',
      fulfilledAt: new Date().toISOString()
    });

    logWithCorrelation('info', `Successfully processed payment for ${customerEmail}`, {
      paymentIntentId: paymentIntent.id,
      customerEmail,
      fulfillmentKey
    }, correlationId);

  } catch (error) {
    logWithCorrelation('error', 'Error processing successful payment', {
      error: error instanceof Error ? error.message : 'Unknown error',
      paymentIntentId: paymentIntent.id,
      stack: error instanceof Error ? error.stack : undefined
    }, correlationId);
    // Don't throw - we don't want to retry webhook
  }
}

/**
 * Handle payment processing (async payments like bank transfers)
 */
async function handlePaymentProcessing(paymentIntent: Stripe.PaymentIntent, correlationId: string): Promise<void> {
  logWithCorrelation('info', `Payment processing: ${paymentIntent.id}`, {
    paymentIntentId: paymentIntent.id
  }, correlationId);
  
  try {
    const metadata = paymentIntent.metadata;
    const customerEmail = metadata.customer_email;
    
    if (customerEmail) {
      // Update MailerLite with processing status using retry logic
      await retryWithBackoff(() => updateMailerLiteSubscriber(customerEmail, {
        payment_status: 'processing',
        payment_intent_id: paymentIntent.id
      }));
    }
    
  } catch (error) {
    logWithCorrelation('error', 'Error processing payment processing event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      paymentIntentId: paymentIntent.id
    }, correlationId);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, correlationId: string): Promise<void> {
  logWithCorrelation('warn', `Payment failed: ${paymentIntent.id}`, {
    paymentIntentId: paymentIntent.id,
    lastPaymentError: paymentIntent.last_payment_error
  }, correlationId);
  
  try {
    const metadata = paymentIntent.metadata;
    const customerEmail = metadata.customer_email;
    
    if (customerEmail) {
      // Update MailerLite with failed status using retry logic
      await retryWithBackoff(() => updateMailerLiteSubscriber(customerEmail, {
        payment_status: 'failed',
        payment_intent_id: paymentIntent.id,
        failure_date: new Date().toISOString(),
        failure_reason: paymentIntent.last_payment_error?.message || 'Unknown error'
      }));

      // Trigger abandoned cart email sequence
      await retryWithBackoff(() => triggerAbandonedCartEmail(customerEmail, {
        name: metadata.customer_name,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        failure_reason: paymentIntent.last_payment_error?.message
      }));
    }
    
  } catch (error) {
    logWithCorrelation('error', 'Error processing payment failure', {
      error: error instanceof Error ? error.message : 'Unknown error',
      paymentIntentId: paymentIntent.id
    }, correlationId);
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent, correlationId: string): Promise<void> {
  logWithCorrelation('info', `Payment canceled: ${paymentIntent.id}`, {
    paymentIntentId: paymentIntent.id
  }, correlationId);
  
  try {
    const metadata = paymentIntent.metadata;
    const customerEmail = metadata.customer_email;
    
    if (customerEmail) {
      // Update MailerLite with canceled status using retry logic
      await retryWithBackoff(() => updateMailerLiteSubscriber(customerEmail, {
        payment_status: 'canceled',
        payment_intent_id: paymentIntent.id,
        canceled_date: new Date().toISOString()
      }));
    }
    
  } catch (error) {
    logWithCorrelation('error', 'Error processing payment cancellation', {
      error: error instanceof Error ? error.message : 'Unknown error',
      paymentIntentId: paymentIntent.id
    }, correlationId);
  }
}

/**
 * Handle payment that requires action (3D Secure, etc.)
 */
async function handlePaymentRequiresAction(paymentIntent: Stripe.PaymentIntent, correlationId: string): Promise<void> {
  logWithCorrelation('info', `Payment requires action: ${paymentIntent.id}`, {
    paymentIntentId: paymentIntent.id,
    nextAction: paymentIntent.next_action
  }, correlationId);
  
  try {
    const metadata = paymentIntent.metadata;
    const customerEmail = metadata.customer_email;
    
    if (customerEmail) {
      await retryWithBackoff(() => updateMailerLiteSubscriber(customerEmail, {
        payment_status: 'requires_action',
        payment_intent_id: paymentIntent.id,
        action_required_date: new Date().toISOString()
      }));
    }
    
  } catch (error) {
    logWithCorrelation('error', 'Error processing payment requires action', {
      error: error instanceof Error ? error.message : 'Unknown error',
      paymentIntentId: paymentIntent.id
    }, correlationId);
  }
}

/**
 * Handle partially funded payment
 */
async function handlePaymentPartiallyFunded(paymentIntent: Stripe.PaymentIntent, correlationId: string): Promise<void> {
  logWithCorrelation('warn', `Payment partially funded: ${paymentIntent.id}`, {
    paymentIntentId: paymentIntent.id,
    amountReceived: paymentIntent.amount_received
  }, correlationId);
  
  try {
    const metadata = paymentIntent.metadata;
    const customerEmail = metadata.customer_email;
    
    if (customerEmail) {
      await retryWithBackoff(() => updateMailerLiteSubscriber(customerEmail, {
        payment_status: 'partially_funded',
        payment_intent_id: paymentIntent.id,
        amount_received: paymentIntent.amount_received,
        partial_funding_date: new Date().toISOString()
      }));
    }
    
  } catch (error) {
    logWithCorrelation('error', 'Error processing partial funding', {
      error: error instanceof Error ? error.message : 'Unknown error',
      paymentIntentId: paymentIntent.id
    }, correlationId);
  }
}

/**
 * Handle charge dispute
 */
async function handleChargeDispute(dispute: Stripe.Dispute, correlationId: string): Promise<void> {
  logWithCorrelation('error', `Charge dispute created: ${dispute.id}`, {
    disputeId: dispute.id,
    chargeId: dispute.charge,
    amount: dispute.amount,
    reason: dispute.reason
  }, correlationId);
  
  try {
    // Implement dispute handling logic here
    // Could include:
    // - Notifying admin team
    // - Updating customer records
    // - Triggering dispute response workflow
    
    logWithCorrelation('info', `Dispute handling initiated for ${dispute.id}`, {
      disputeId: dispute.id
    }, correlationId);
    
  } catch (error) {
    logWithCorrelation('error', 'Error processing charge dispute', {
      error: error instanceof Error ? error.message : 'Unknown error',
      disputeId: dispute.id
    }, correlationId);
  }
}

/**
 * Handle invoice payment succeeded
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, correlationId: string): Promise<void> {
  logWithCorrelation('info', `Invoice payment succeeded: ${invoice.id}`, {
    invoiceId: invoice.id,
    subscriptionId: (invoice as any).subscription
  }, correlationId);
}

/**
 * Handle subscription changes
 */
async function handleSubscriptionChange(subscription: Stripe.Subscription, eventType: string, correlationId: string): Promise<void> {
  logWithCorrelation('info', `Subscription event: ${eventType}`, {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
    eventType
  }, correlationId);
}

/**
 * Handle successful async payments (delayed payment methods like Multibanco)
 */
async function handleCheckoutSessionAsyncPaymentSucceeded(session: Stripe.Checkout.Session, correlationId: string): Promise<void> {
  logWithCorrelation('info', `Async payment succeeded: ${session.id}`, {
    sessionId: session.id,
    paymentIntent: session.payment_intent,
    amount: session.amount_total,
    currency: session.currency,
    paymentStatus: session.payment_status
  }, correlationId);
  
  try {
    // Retrieve full session with expanded data
    const fullSession = await retryWithBackoff(() =>
      stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items', 'payment_intent']
      })
    );

    // Extract customer information from session
    const customerEmail = fullSession.customer_details?.email || fullSession.metadata?.customer_email;
    const customerName = fullSession.customer_details?.name || fullSession.metadata?.customer_name;
    const customerPhone = fullSession.metadata?.customer_phone;
    const leadId = fullSession.metadata?.lead_id;

    if (!customerEmail || !customerName) {
      throw new Error('Missing customer information in checkout session');
    }

    // Check if this session has already been fulfilled to prevent duplicates
    const fulfillmentKey = `checkout_session_${fullSession.id}`;
    const paymentIntentKey = (typeof fullSession.payment_intent === 'object' && fullSession.payment_intent?.id) ? `payment_intent_${fullSession.payment_intent.id}` : null;
    
    // Check both session and payment intent fulfillment to handle edge cases
    if (FulfillmentTracker.isAlreadyFulfilled(fulfillmentKey) || 
        (paymentIntentKey && FulfillmentTracker.isAlreadyFulfilled(paymentIntentKey))) {
      const existingFulfillment = FulfillmentTracker.getFulfillmentInfo(fulfillmentKey) || 
                                 (paymentIntentKey ? FulfillmentTracker.getFulfillmentInfo(paymentIntentKey) : undefined);
      logWithCorrelation('info', `Session ${fullSession.id} already fulfilled`, {
        sessionId: fullSession.id,
        existingFulfillment,
        fulfillmentKey,
        paymentIntentKey
      }, correlationId);
      return; // Skip duplicate fulfillment
    }
    
    logWithCorrelation('info', `Processing delayed payment fulfillment for session ${fullSession.id}`, {
      sessionId: fullSession.id,
      customerEmail,
      paymentIntent: typeof fullSession.payment_intent === 'object' ? (fullSession.payment_intent?.id || 'unknown') : (fullSession.payment_intent || 'unknown'),
      fulfillmentKey
    }, correlationId);

    // Add customer to MailerLite with retry logic and circuit breaker
    try {
      await retryWithBackoff(() => addToMailerLite({
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
        fields: {
          lead_id: leadId || '',
          payment_status: 'paid',
          payment_intent_id: typeof fullSession.payment_intent === 'object' ? (fullSession.payment_intent?.id || 'unknown') : (fullSession.payment_intent || 'unknown'),
          session_id: fullSession.id,
          amount_paid: (fullSession.amount_total || 0) / 100, // Convert from cents
          currency: fullSession.currency?.toUpperCase() || 'EUR',
          event_name: fullSession.metadata?.event_name || 'Café com Vendas',
          event_date: fullSession.metadata?.event_date || '2024-09-20',
          spot_type: fullSession.metadata?.spot_type || 'first_lot_early_bird',
          source: 'checkout_async_payment',
          payment_date: new Date().toISOString(),
          payment_method: 'delayed_notification', // Indicates Multibanco/delayed method
          utm_source: fullSession.metadata?.utm_source ?? null,
          utm_medium: fullSession.metadata?.utm_medium ?? null,
          utm_campaign: fullSession.metadata?.utm_campaign || null,
          fulfillment_trigger: 'async_payment_succeeded'
        }
      }));
    } catch (error) {
      // Log error but don't fail the webhook processing
      logWithCorrelation('error', 'Failed to add customer to MailerLite after retries (async payment)', {
        error: error instanceof Error ? error.message : 'Unknown error',
        customerEmail,
        sessionId: fullSession.id
      }, correlationId);
    }

    // Send confirmation email (via MailerLite automation)
    await triggerConfirmationEmail(customerEmail, {
      name: customerName,
      amount: (fullSession.amount_total || 0) / 100,
      currency: fullSession.currency?.toUpperCase() || 'EUR',
      event_name: fullSession.metadata?.event_name || 'Café com Vendas',
      event_date: fullSession.metadata?.event_date || '20/09/2024',
      payment_method: 'Multibanco'
    });

    // Mark both session and payment intent as fulfilled to prevent duplicates
    FulfillmentTracker.markAsFulfilled(fulfillmentKey, {
      customerEmail,
      sessionId: fullSession.id,
      paymentIntentId: typeof fullSession.payment_intent === 'object' ? (fullSession.payment_intent?.id || 'unknown') : (fullSession.payment_intent || 'unknown'),
      fulfillmentType: 'checkout_session_async_payment_succeeded',
      fulfilledAt: new Date().toISOString()
    });
    
    // Also mark payment intent to prevent duplicate processing from payment_intent.succeeded
    if (paymentIntentKey && typeof fullSession.payment_intent === 'object') {
      FulfillmentTracker.markAsFulfilled(paymentIntentKey, {
        customerEmail,
        sessionId: fullSession.id,
        paymentIntentId: fullSession.payment_intent && typeof fullSession.payment_intent === 'object' ? fullSession.payment_intent.id || 'unknown' : 'unknown',
        fulfillmentType: 'async_payment_cross_reference',
        fulfilledAt: new Date().toISOString()
      });
    }

    logWithCorrelation('info', `Successfully processed async payment for ${customerEmail}`, {
      sessionId: fullSession.id,
      customerEmail,
      paymentIntent: typeof fullSession.payment_intent === 'object' ? (fullSession.payment_intent?.id || 'unknown') : (fullSession.payment_intent || 'unknown'),
      fulfillmentKey,
      paymentIntentKey
    }, correlationId);

  } catch (error) {
    logWithCorrelation('error', 'Error processing async payment success', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId: session.id,
      stack: error instanceof Error ? error.stack : undefined
    }, correlationId);
    // Don't throw - we don't want to retry webhook
  }
}

/**
 * Handle failed async payments (delayed payment methods like Multibanco)
 */
async function handleCheckoutSessionAsyncPaymentFailed(session: Stripe.Checkout.Session, correlationId: string): Promise<void> {
  logWithCorrelation('warn', `Async payment failed: ${session.id}`, {
    sessionId: session.id,
    paymentIntent: session.payment_intent,
    amount: session.amount_total,
    currency: session.currency
  }, correlationId);
  
  try {
    // Retrieve full session with expanded data
    const fullSession = await retryWithBackoff(() =>
      stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items', 'payment_intent']
      })
    );

    const customerEmail = fullSession.customer_details?.email || fullSession.metadata?.customer_email;
    const customerName = fullSession.customer_details?.name || fullSession.metadata?.customer_name;
    
    if (customerEmail) {
      // Update MailerLite with failed status using retry logic
      await retryWithBackoff(() => updateMailerLiteSubscriber(customerEmail, {
        payment_status: 'failed_async',
        session_id: fullSession.id,
        failure_date: new Date().toISOString(),
        failure_reason: 'Async payment method failed (e.g., Multibanco timeout)',
        payment_method: 'delayed_notification'
      }));

      // Trigger abandoned cart email sequence for failed async payment
      await retryWithBackoff(() => triggerAbandonedCartEmail(customerEmail, {
        name: customerName,
        amount: (fullSession.amount_total || 0) / 100,
        currency: fullSession.currency?.toUpperCase() || 'EUR',
        failure_reason: 'Payment expired or failed to complete',
        payment_method: 'Multibanco'
      }));
    }
    
  } catch (error) {
    logWithCorrelation('error', 'Error processing async payment failure', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId: session.id
    }, correlationId);
  }
}

/**
 * Add subscriber to MailerLite
 */
async function addToMailerLite(subscriberData: MailerLiteSubscriberData): Promise<any> {
  if (!MAILERLITE_API_KEY) {
    logWithCorrelation('warn', 'MailerLite API key not configured - skipping email integration');
    return;
  }

  const circuitBreaker = getCircuitBreaker('mailerlite');
  
  try {
    return await circuitBreaker.execute(async () => {
      const response = await withTimeout(
        fetch('https://connect.mailerlite.com/api/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${MAILERLITE_API_KEY}`
          },
          body: JSON.stringify({
            email: subscriberData.email,
            name: subscriberData.name,
            fields: subscriberData.fields,
            groups: [MAILERLITE_GROUP_ID],
            status: 'active',
            subscribed_at: new Date().toISOString()
          })
        }),
        TIMEOUTS.mailerlite_api,
        'MailerLite subscriber creation'
      );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`MailerLite API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    logWithCorrelation('info', `Added subscriber to MailerLite: ${subscriberData.email}`, {
      email: subscriberData.email,
      subscriberId: result.data?.id
    });
      return result;
    });

  } catch (error) {
    // Handle circuit breaker open state gracefully
    if (error instanceof Error && error.message.includes('Circuit breaker is OPEN')) {
      logWithCorrelation('warn', 'MailerLite circuit breaker is open - skipping email integration', {
        email: subscriberData.email,
        circuitBreakerStatus: circuitBreaker.getStatus()
      });
      return; // Fail gracefully, don't throw
    }
    
    logWithCorrelation('error', 'MailerLite integration error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      email: subscriberData.email,
      circuitBreakerStatus: circuitBreaker.getStatus()
    });
    throw error;
  }
}

/**
 * Update existing MailerLite subscriber
 */
async function updateMailerLiteSubscriber(email: string, fields: Record<string, string | number>): Promise<void> {
  if (!MAILERLITE_API_KEY) {
    logWithCorrelation('warn', 'MailerLite API key not configured - skipping email integration');
    return;
  }

  const circuitBreaker = getCircuitBreaker('mailerlite');
  
  try {
    return await circuitBreaker.execute(async () => {
    // First, get the subscriber ID with timeout
    const searchResponse = await withTimeout(
      fetch(`https://connect.mailerlite.com/api/subscribers?filter[email]=${encodeURIComponent(email)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${MAILERLITE_API_KEY}`
        }
      }),
      TIMEOUTS.mailerlite_api,
      'MailerLite subscriber search'
    );

    if (!searchResponse.ok) {
      throw new Error(`Failed to find subscriber: ${searchResponse.status}`);
    }

    const searchResult = await searchResponse.json();
    
    if (!searchResult.data || searchResult.data.length === 0) {
      console.log(`Subscriber not found in MailerLite: ${email}`);
      return;
    }

    const subscriberId = searchResult.data[0].id;

    // Update the subscriber with timeout
    const updateResponse = await withTimeout(
      fetch(`https://connect.mailerlite.com/api/subscribers/${subscriberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${MAILERLITE_API_KEY}`
        },
        body: JSON.stringify({
          fields: fields
        })
      }),
      TIMEOUTS.mailerlite_api,
      'MailerLite subscriber update'
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Failed to update subscriber: ${updateResponse.status} - ${error}`);
    }

      logWithCorrelation('info', `Updated MailerLite subscriber: ${email}`, {
        email,
        subscriberId
      });
    });

  } catch (error) {
    // Handle circuit breaker open state gracefully
    if (error instanceof Error && error.message.includes('Circuit breaker is OPEN')) {
      logWithCorrelation('warn', 'MailerLite circuit breaker is open - skipping subscriber update', {
        email,
        circuitBreakerStatus: circuitBreaker.getStatus()
      });
      return; // Fail gracefully, don't throw
    }
    
    logWithCorrelation('error', 'Error updating MailerLite subscriber', {
      error: error instanceof Error ? error.message : 'Unknown error',
      email,
      circuitBreakerStatus: circuitBreaker.getStatus()
    });
    throw error;
  }
}

/**
 * Trigger confirmation email automation
 */
async function triggerConfirmationEmail(email: string, data: Record<string, unknown>): Promise<void> {
  if (!MAILERLITE_API_KEY) {
    return;
  }

  try {
    // This would trigger a specific automation in MailerLite
    // The automation would be set up in MailerLite dashboard
    // For now, we'll just log the action
    console.log(`Triggered confirmation email for: ${email}`, data);
    
    // You can implement specific MailerLite automation triggers here
    // Example: Add to a specific group that triggers the automation
    
  } catch (error) {
    console.error('Error triggering confirmation email:', error);
  }
}

/**
 * Trigger abandoned cart email sequence
 */
async function triggerAbandonedCartEmail(email: string, data: Record<string, unknown>): Promise<void> {
  if (!MAILERLITE_API_KEY) {
    return;
  }

  try {
    console.log(`Triggered abandoned cart email for: ${email}`, data);
    
    // Add to abandoned cart group or trigger specific automation
    // This would be configured in MailerLite dashboard
    
  } catch (error) {
    console.error('Error triggering abandoned cart email:', error);
  }
}