/**
 * Netlify Function: Stripe Webhook Handler
 * Handles payment confirmations and triggers MailerLite integration
 */

// Enhanced Stripe webhook handler with event-driven lifecycle management
import Stripe from 'stripe';
import type {
  FulfillmentRecord,
  MailerLiteSubscriberData,
  EventCustomFields
} from './types';
import {
  MAILERLITE_EVENT_GROUPS,
  MAILERLITE_CUSTOM_FIELDS,
  EVENT_DATE,
  EVENT_ADDRESS,
  GOOGLE_MAPS_LINK
} from './types';
import {
  isStripePaymentIntent,
  hasMultibancoDetails,
  getMultibancoDetails
} from '../../src/types/stripe.js';
import { SHARED_TIMEOUTS, withTimeout, retryWithBackoff } from './shared-utils.js';

// MailerLite API response interfaces
interface MailerLiteSubscriberResponse {
  data: {
    id: string;
    email: string;
    name: string;
    status: string;
    subscribed_at: string;
    [key: string]: unknown;
  };
}

interface MailerLiteSearchResponse {
  data: {
    id: string;
    email: string;
    name: string;
    status: string;
    [key: string]: unknown;
  }[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    [key: string]: unknown;
  };
}


// Enhanced Stripe initialization with Context7 best practices
const initializeStripe = () => {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  
  if (!apiKey) {
    throw new Error('Stripe secret key not configured - check STRIPE_SECRET_KEY environment variable');
  }
  
  if (!apiKey.startsWith('sk_')) {
    throw new Error('Invalid Stripe secret key format - must start with "sk_"');
  }
  
  return new Stripe(apiKey, {
    apiVersion: '2025-07-30.basil', // Lock API version for consistency
    timeout: 30000, // 30 second timeout for Stripe API calls
    maxNetworkRetries: 2,
    telemetry: false, // Disable telemetry for better performance
    appInfo: {
      name: 'cafe-com-vendas-webhook',
      version: '1.0.0'
    }
  });
};

const stripe = initializeStripe();

// Use shared timeout configuration
const TIMEOUTS = SHARED_TIMEOUTS;

// Using shared withTimeout from shared-utils.js

// MailerLite integration with event-driven lifecycle groups
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;

// 100% lifecycle group automation for sophisticated email marketing

// Helper to validate and retrieve lifecycle group ID
function getLifecycleGroupId(groupName: keyof typeof MAILERLITE_EVENT_GROUPS): string {
  const groupId = GROUP_ID_MAPPING[MAILERLITE_EVENT_GROUPS[groupName]];
  if (!groupId) {
    throw new Error(`Lifecycle group not configured: ${groupName} (${MAILERLITE_EVENT_GROUPS[groupName]})`);
  }
  return groupId;
}

// Direct Group ID mapping to actual MailerLite lifecycle groups
// These IDs correspond exactly to the groups created in MailerLite admin
const GROUP_ID_MAPPING: Record<string, string> = {
  [MAILERLITE_EVENT_GROUPS.CHECKOUT_STARTED]: '164084418309260989',
  [MAILERLITE_EVENT_GROUPS.ABANDONED_PAYMENT]: '164084418758051029',
  [MAILERLITE_EVENT_GROUPS.BUYER_PENDING]: '164084419130295829',
  [MAILERLITE_EVENT_GROUPS.BUYER_PAID]: '164084419571745998',
  [MAILERLITE_EVENT_GROUPS.DETAILS_PENDING]: '164084420038362902',
  [MAILERLITE_EVENT_GROUPS.DETAILS_COMPLETE]: '164084420444161819',
  [MAILERLITE_EVENT_GROUPS.ATTENDED]: '164084420929652588',
  [MAILERLITE_EVENT_GROUPS.NO_SHOW]: '164084421314479574'
};

// Using shared retry configuration from shared-utils.js


// Fulfillment tracking to prevent duplicates with proper typing
const fulfillmentStore = new Map<string, FulfillmentRecord>();
const FULFILLMENT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours



// Fulfillment tracking utilities for idempotency
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
    // Enhanced environment validation with Context7 best practices
    const requiredEnvVars = {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
    };
    
    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);
    
    if (missingVars.length > 0) {
      const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}`;
      logWithCorrelation('error', errorMsg);
      return new Response(JSON.stringify({ error: 'Configuration error' }), {
        status: 500,
        headers
      });
    }

    // Enhanced signature validation with better error context
    const sig = request.headers.get('stripe-signature');
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    if (!sig) {
      logWithCorrelation('error', 'Missing Stripe signature header', {
        receivedHeaders: Object.fromEntries(
          [...request.headers.entries()]
            .filter(([key]) => key.toLowerCase().includes('stripe'))
        )
      });
      return new Response(JSON.stringify({ error: 'Missing Stripe signature' }), {
        status: 400,
        headers
      });
    }

    // Enhanced webhook signature verification with detailed error logging
    try {
      const body = await request.text();
      
      // Validate request body
      if (!body || body.trim() === '') {
        logWithCorrelation('error', 'Empty request body received', {
          contentLength: request.headers.get('content-length'),
          contentType: request.headers.get('content-type')
        });
        return new Response(JSON.stringify({ error: 'Empty request body' }), {
          status: 400,
          headers
        });
      }
      
      // Use synchronous webhook construction for better error handling
      stripeEvent = stripe.webhooks.constructEvent(
        body,
        sig,
        endpointSecret
      );
      
      logWithCorrelation('info', 'Webhook signature verified successfully', {
        eventType: stripeEvent.type,
        eventId: stripeEvent.id
      });
      
    } catch (err) {
      // Enhanced error handling with Context7 patterns
      if (err instanceof Error) {
        const errorContext = {
          errorName: err.name,
          errorMessage: err.message,
          signaturePrefix: sig.substring(0, 20) + '...',
          bodyLength: (await request.clone().text()).length,
          timestamp: new Date().toISOString()
        };
        
        if (err.name === 'StripeSignatureVerificationError') {
          logWithCorrelation('error', 'Stripe signature verification failed', errorContext);
          return new Response(JSON.stringify({ 
            error: 'Invalid signature',
            code: 'SIGNATURE_VERIFICATION_FAILED'
          }), {
            status: 400,
            headers
          });
        }
        
        logWithCorrelation('error', 'Webhook construction failed', {
          ...errorContext,
          stack: err.stack?.split('\n').slice(0, 5).join('\n')
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Webhook processing failed',
        code: 'WEBHOOK_CONSTRUCTION_ERROR'
      }), {
        status: 400,
        headers
      });
    }

    const correlationId = logWithCorrelation('info', 'Received Stripe webhook event', {
      eventType: stripeEvent.type,
      eventId: stripeEvent.id,
      livemode: stripeEvent.livemode
    });

    // Enhanced event processing with Context7 error handling patterns
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(stripeEvent.data.object, correlationId);
        break;

      case 'payment_intent.processing':
        await handlePaymentProcessing(stripeEvent.data.object, correlationId);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object, correlationId);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(stripeEvent.data.object, correlationId);
        break;

      case 'payment_intent.requires_action':
        await handlePaymentRequiresAction(stripeEvent.data.object, correlationId);
        break;

      case 'payment_intent.partially_funded':
        await handlePaymentPartiallyFunded(stripeEvent.data.object, correlationId);
        break;

      case 'charge.dispute.created':
        await handleChargeDispute(stripeEvent.data.object, correlationId);
        break;

      case 'checkout.session.async_payment_succeeded':
        await handleCheckoutSessionAsyncPaymentSucceeded(stripeEvent.data.object, correlationId);
        break;

      case 'checkout.session.async_payment_failed':
        await handleCheckoutSessionAsyncPaymentFailed(stripeEvent.data.object, correlationId);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(stripeEvent.data.object, correlationId);
        break;


      default:
        logWithCorrelation('info', `Unhandled event type: ${stripeEvent.type}`, {
          eventId: stripeEvent.id
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

// Using shared retryWithBackoff from shared-utils.js

// Handle successful payment
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
    // const leadId = metadata.lead_id; // Available but not needed in enhanced version

    if (!customerEmail || !customerName) {
      throw new Error('Missing customer information in payment metadata');
    }

    // Add customer to MailerLite with retry logic and circuit breaker
    try {
      // Create comprehensive event-specific subscriber data
      const eventFields: EventCustomFields = {
        [MAILERLITE_CUSTOM_FIELDS.first_name]: customerName.split(' ')[0] || customerName,
        [MAILERLITE_CUSTOM_FIELDS.phone]: customerPhone || '',
        [MAILERLITE_CUSTOM_FIELDS.checkout_started_at]: metadata.created_at || new Date().toISOString(),
        [MAILERLITE_CUSTOM_FIELDS.payment_status]: 'paid',
        [MAILERLITE_CUSTOM_FIELDS.ticket_type]: (metadata.spot_type as 'Standard' | 'VIP') || 'Standard',
        [MAILERLITE_CUSTOM_FIELDS.order_id]: paymentIntent.id,
        [MAILERLITE_CUSTOM_FIELDS.amount_paid]: paymentIntent.amount / 100,
        [MAILERLITE_CUSTOM_FIELDS.details_form_status]: 'pending', // Will be updated when form submitted
        
        // Event fields (static for this event)
        [MAILERLITE_CUSTOM_FIELDS.event_date]: EVENT_DATE,
        [MAILERLITE_CUSTOM_FIELDS.event_address]: EVENT_ADDRESS,
        [MAILERLITE_CUSTOM_FIELDS.google_maps_link]: GOOGLE_MAPS_LINK,
        
        // Multibanco fields (initially null, updated if applicable)
        [MAILERLITE_CUSTOM_FIELDS.mb_entity]: null,
        [MAILERLITE_CUSTOM_FIELDS.mb_reference]: null,
        [MAILERLITE_CUSTOM_FIELDS.mb_amount]: null,
        [MAILERLITE_CUSTOM_FIELDS.mb_expires_at]: null,
        
        // Attribution fields
        [MAILERLITE_CUSTOM_FIELDS.utm_source]: metadata.utm_source || null,
        [MAILERLITE_CUSTOM_FIELDS.utm_medium]: metadata.utm_medium || null,
        [MAILERLITE_CUSTOM_FIELDS.utm_campaign]: metadata.utm_campaign || null,
        
        // Marketing consent
        [MAILERLITE_CUSTOM_FIELDS.marketing_opt_in]: 'yes' // Default for paid customers
      };

      await retryWithBackoff(() => addToMailerLite({
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
        fields: eventFields
      }));
    } catch (error) {
      // Log error but don't fail the webhook processing
      logWithCorrelation('error', 'Failed to add customer to MailerLite after retries', {
        error: error instanceof Error ? error.message : 'Unknown error',
        customerEmail,
        paymentIntentId: paymentIntent.id
      }, correlationId);
    }

    // 🔄 ENHANCED LIFECYCLE MANAGEMENT: Implement complete state machine
    try {
      await retryWithBackoff(() => moveSubscriberBetweenGroups(
        customerEmail,
        getLifecycleGroupId('CHECKOUT_STARTED'),    // From: checkout_started
        getLifecycleGroupId('BUYER_PAID')           // To: buyer_paid
      ));
      
      logWithCorrelation('info', 'Successfully executed payment success lifecycle transition', {
        customerEmail,
        paymentIntentId: paymentIntent.id,
        transition: `${MAILERLITE_EVENT_GROUPS.CHECKOUT_STARTED} → ${MAILERLITE_EVENT_GROUPS.BUYER_PAID}`,
        lifecycleStage: 'buyer_paid'
      }, correlationId);
    } catch (error) {
      // Log but don't fail webhook for lifecycle management errors
      logWithCorrelation('error', 'Failed to execute lifecycle transition', {
        error: error instanceof Error ? error.message : 'Unknown error',
        customerEmail,
        paymentIntentId: paymentIntent.id,
        lifecycleStage: 'buyer_paid_failed'
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

// Handle payment processing (async payments like bank transfers)
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
      
      // 🏦 MULTIBANCO: If this is a Multibanco payment, extract and store voucher details
      if (isStripePaymentIntent(paymentIntent) && hasMultibancoDetails(paymentIntent)) {
        const multibancoDetails = getMultibancoDetails(paymentIntent);
        if (multibancoDetails) {
          await retryWithBackoff(() => updateMultibancoFields(customerEmail, {
            entity: multibancoDetails.entity,
            reference: multibancoDetails.reference,
            amount: paymentIntent.amount / 100, // Convert from cents
            expiresAt: multibancoDetails.expires_at ? new Date(multibancoDetails.expires_at * 1000).toISOString() : undefined
          }));
          
          logWithCorrelation('info', 'Updated Multibanco voucher details', {
            customerEmail,
            entity: multibancoDetails.entity,
            reference: multibancoDetails.reference,
            paymentIntentId: paymentIntent.id
          }, correlationId);
        }
      }
    }
    
  } catch (error) {
    logWithCorrelation('error', 'Error processing payment processing event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      paymentIntentId: paymentIntent.id
    }, correlationId);
  }
}

// Handle failed payment
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

// Handle canceled payment
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

// Handle payment that requires action (3D Secure, etc.)
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

// Handle partially funded payment
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

// Handle charge dispute
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
    
    await Promise.resolve(); // Placeholder for future async dispute handling
    
  } catch (error) {
    logWithCorrelation('error', 'Error processing charge dispute', {
      error: error instanceof Error ? error.message : 'Unknown error',
      disputeId: dispute.id
    }, correlationId);
  }
}



// Handle successful async payments (delayed payment methods like Multibanco)
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

// Handle checkout session completed (immediate processing for all payment methods)
// This handles the initial checkout completion before async payment resolution
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, correlationId: string): Promise<void> {
  logWithCorrelation('info', `Checkout session completed: ${session.id}`, {
    sessionId: session.id,
    paymentIntent: session.payment_intent,
    paymentStatus: session.payment_status,
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

    // Extract customer information from session
    const customerEmail = fullSession.customer_details?.email || fullSession.metadata?.customer_email;
    const customerName = fullSession.customer_details?.name || fullSession.metadata?.customer_name;

    if (!customerEmail || !customerName) {
      logWithCorrelation('warn', 'Missing customer information in checkout session', {
        sessionId: fullSession.id,
        paymentStatus: fullSession.payment_status
      }, correlationId);
      return;
    }

    // Check fulfillment status to prevent duplicates
    const fulfillmentKey = `checkout_session_${fullSession.id}`;
    if (FulfillmentTracker.isAlreadyFulfilled(fulfillmentKey)) {
      logWithCorrelation('info', `Session ${fullSession.id} already processed`, {
        sessionId: fullSession.id
      }, correlationId);
      return;
    }

    // Handle based on payment status
    switch (fullSession.payment_status) {
      case 'paid':
        // Payment completed immediately (e.g., cards with successful authorization)
        await processImmediatePaymentSuccess(fullSession, correlationId);
        break;
        
      case 'unpaid':
        // Payment pending (e.g., Multibanco voucher generated but not yet paid)
        await processPaymentPending(fullSession, correlationId);
        break;
        
      case 'no_payment_required':
        // Free order or promotional checkout
        processFreeOrder(fullSession, correlationId);
        break;
        
      default:
        logWithCorrelation('info', `Unhandled payment status: ${String(fullSession.payment_status)}`, {
          sessionId: fullSession.id,
          paymentStatus: fullSession.payment_status
        }, correlationId);
    }

  } catch (error) {
    logWithCorrelation('error', 'Error processing checkout session completion', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId: session.id,
      stack: error instanceof Error ? error.stack : undefined
    }, correlationId);
  }
}

/**
 * Process immediate payment success (cards, instant payment methods)
 */
async function processImmediatePaymentSuccess(session: Stripe.Checkout.Session, correlationId: string): Promise<void> {
  const customerEmail = session.customer_details?.email || session.metadata?.customer_email;
  const customerName = session.customer_details?.name || session.metadata?.customer_name;
  const customerPhone = session.metadata?.customer_phone;
  const leadId = session.metadata?.lead_id;
  const fulfillmentKey = `checkout_session_${session.id}`;

  logWithCorrelation('info', `Processing immediate payment success for session ${session.id}`, {
    sessionId: session.id,
    customerEmail,
    paymentIntent: typeof session.payment_intent === 'object' ? session.payment_intent?.id : session.payment_intent
  }, correlationId);

  try {
    // Add customer to MailerLite immediately for successful payments
    await retryWithBackoff(() => addToMailerLite({
      email: customerEmail!,
      name: customerName!,
      phone: customerPhone,
      fields: {
        lead_id: leadId || '',
        payment_status: 'paid',
        payment_intent_id: typeof session.payment_intent === 'object' ? session.payment_intent?.id || 'unknown' : session.payment_intent || 'unknown',
        session_id: session.id,
        amount_paid: (session.amount_total || 0) / 100,
        currency: session.currency?.toUpperCase() || 'EUR',
        event_name: session.metadata?.event_name || 'Café com Vendas',
        event_date: session.metadata?.event_date || '2024-09-20',
        spot_type: session.metadata?.spot_type || 'first_lot_early_bird',
        source: 'checkout_immediate_payment',
        payment_date: new Date().toISOString(),
        payment_method: 'card_or_instant',
        utm_source: session.metadata?.utm_source || null,
        utm_medium: session.metadata?.utm_medium || null,
        utm_campaign: session.metadata?.utm_campaign || null,
        fulfillment_trigger: 'checkout_session_completed_paid'
      }
    }));

    // Send confirmation email
    await triggerConfirmationEmail(customerEmail!, {
      name: customerName,
      amount: (session.amount_total || 0) / 100,
      currency: session.currency?.toUpperCase() || 'EUR',
      event_name: session.metadata?.event_name || 'Café com Vendas',
      event_date: session.metadata?.event_date || '20/09/2024',
      payment_method: 'immediate'
    });

    // Mark as fulfilled
    FulfillmentTracker.markAsFulfilled(fulfillmentKey, {
      customerEmail,
      sessionId: session.id,
      paymentIntentId: typeof session.payment_intent === 'object' ? session.payment_intent?.id : session.payment_intent,
      fulfillmentType: 'checkout_session_completed_immediate',
      fulfilledAt: new Date().toISOString()
    });

    logWithCorrelation('info', `Successfully processed immediate payment for ${customerEmail}`, {
      sessionId: session.id,
      fulfillmentKey
    }, correlationId);

  } catch (error) {
    logWithCorrelation('error', 'Failed to process immediate payment success', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId: session.id,
      customerEmail
    }, correlationId);
  }
}

/**
 * Process payment pending state (Multibanco and other delayed payment methods)
 */
async function processPaymentPending(session: Stripe.Checkout.Session, correlationId: string): Promise<void> {
  const customerEmail = session.customer_details?.email || session.metadata?.customer_email;
  const customerName = session.customer_details?.name || session.metadata?.customer_name;
  const customerPhone = session.metadata?.customer_phone;
  const leadId = session.metadata?.lead_id;
  const fulfillmentKey = `checkout_session_${session.id}`;

  logWithCorrelation('info', `Processing payment pending for session ${session.id}`, {
    sessionId: session.id,
    customerEmail,
    paymentIntent: typeof session.payment_intent === 'object' ? session.payment_intent?.id : session.payment_intent
  }, correlationId);

  try {
    // Add customer to MailerLite with pending status - this creates the lead
    // but doesn't trigger full fulfillment until payment completes
    await retryWithBackoff(() => addToMailerLite({
      email: customerEmail!,
      name: customerName!,
      phone: customerPhone,
      fields: {
        lead_id: leadId || '',
        payment_status: 'pending_payment',
        payment_intent_id: typeof session.payment_intent === 'object' ? session.payment_intent?.id || 'unknown' : session.payment_intent || 'unknown',
        session_id: session.id,
        amount_pending: (session.amount_total || 0) / 100,
        currency: session.currency?.toUpperCase() || 'EUR',
        event_name: session.metadata?.event_name || 'Café com Vendas',
        event_date: session.metadata?.event_date || '2024-09-20',
        spot_type: session.metadata?.spot_type || 'first_lot_early_bird',
        source: 'checkout_pending_payment',
        checkout_date: new Date().toISOString(),
        payment_method: 'delayed_notification', // Likely Multibanco
        utm_source: session.metadata?.utm_source || null,
        utm_medium: session.metadata?.utm_medium || null,
        utm_campaign: session.metadata?.utm_campaign || null,
        fulfillment_trigger: 'checkout_session_completed_pending',
        voucher_generated: 'true' // Indicates Multibanco voucher was created
      }
    }));

    // Send voucher/instructions email for Multibanco
    await triggerVoucherInstructionsEmail(customerEmail!, {
      name: customerName,
      amount: (session.amount_total || 0) / 100,
      currency: session.currency?.toUpperCase() || 'EUR',
      event_name: session.metadata?.event_name || 'Café com Vendas',
      event_date: session.metadata?.event_date || '20/09/2024',
      payment_method: 'Multibanco',
      session_id: session.id
    });

    // Mark as processed (but not fully fulfilled - that happens on async_payment_succeeded)
    FulfillmentTracker.markAsFulfilled(fulfillmentKey, {
      customerEmail,
      sessionId: session.id,
      paymentIntentId: typeof session.payment_intent === 'object' ? session.payment_intent?.id : session.payment_intent,
      fulfillmentType: 'checkout_session_completed_pending',
      fulfilledAt: new Date().toISOString(),
      awaitingPaymentCompletion: true // Flag to indicate partial processing
    });

    logWithCorrelation('info', `Successfully processed pending payment setup for ${customerEmail}`, {
      sessionId: session.id,
      fulfillmentKey,
      awaitingPaymentCompletion: true
    }, correlationId);

  } catch (error) {
    logWithCorrelation('error', 'Failed to process pending payment setup', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId: session.id,
      customerEmail
    }, correlationId);
  }
}

/**
 * Process free orders (no payment required)
 */
function processFreeOrder(session: Stripe.Checkout.Session, correlationId: string): void {
  const customerEmail = session.customer_details?.email || session.metadata?.customer_email;
  const customerName = session.customer_details?.name || session.metadata?.customer_name;
  
  if (!customerEmail || !customerName) {
    return;
  }

  console.log(`Processing free order for session ${session.id}`, {
    sessionId: session.id,
    customerEmail,
    correlationId
  });

  // Free order processing is intentionally minimal - only logging
  // Current business model focuses on paid events/courses
  // If free checkout flows are needed in the future, implement similar to
  // processImmediatePaymentSuccess but with payment_status: 'free'
}

/**
 * Trigger voucher instructions email (for Multibanco)
 */
async function triggerVoucherInstructionsEmail(email: string, data: Record<string, unknown>): Promise<void> {
  if (!MAILERLITE_API_KEY) {
    return;
  }

  try {
    logWithCorrelation('info', `Triggered voucher instructions email for: ${email}`, {
      email,
      paymentMethod: data.payment_method,
      sessionId: data.session_id
    });
    
    // This would trigger a specific Multibanco instructions automation in MailerLite
    // The automation would include the voucher details and payment instructions
    await Promise.resolve(); // Placeholder for future async automation API calls
    
  } catch (error) {
    logWithCorrelation('error', 'Error triggering voucher instructions email', {
      error: error instanceof Error ? error.message : 'Unknown error',
      email
    });
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
 * Update subscriber with Multibanco voucher details
 */
async function updateMultibancoFields(email: string, multibancoDetails: {
  entity: string;
  reference: string;
  amount: number;
  expiresAt?: string;
}): Promise<void> {
  if (!MAILERLITE_API_KEY) {
    console.log('MailerLite API key not configured - skipping Multibanco field updates');
    return;
  }
  
  try {
    await updateMailerLiteSubscriber(email, {
      payment_method: 'multibanco',
      [MAILERLITE_CUSTOM_FIELDS.mb_entity]: multibancoDetails.entity,
      [MAILERLITE_CUSTOM_FIELDS.mb_reference]: multibancoDetails.reference,
      [MAILERLITE_CUSTOM_FIELDS.mb_amount]: multibancoDetails.amount,
      [MAILERLITE_CUSTOM_FIELDS.mb_expires_at]: multibancoDetails.expiresAt || '',
      voucher_generated_at: new Date().toISOString()
    });
    
    console.log(`Updated Multibanco fields for ${email}`, {
      entity: multibancoDetails.entity,
      reference: multibancoDetails.reference
    });
  } catch (error) {
    console.error('Error updating Multibanco fields:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Move subscriber from one group to another (Leads → Buyers transition)
 */
async function moveSubscriberBetweenGroups(email: string, fromGroupId: string, toGroupId: string): Promise<void> {
  if (!MAILERLITE_API_KEY) {
    console.log('MailerLite API key not configured - skipping group management');
    return;
  }
  
  try {
    // First find the subscriber
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

    const searchResult = await searchResponse.json() as MailerLiteSearchResponse;
    
    if (!searchResult.data || searchResult.data.length === 0) {
      console.log(`Subscriber not found in MailerLite: ${email}`);
      return;
    }

    const subscriberId = searchResult.data[0].id;

    // Remove from old group (Leads)
    if (fromGroupId) {
      await withTimeout(
        fetch(`https://connect.mailerlite.com/api/subscribers/${subscriberId}/groups/${fromGroupId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${MAILERLITE_API_KEY}`
          }
        }),
        TIMEOUTS.mailerlite_api,
        'MailerLite group removal'
      );
      console.log(`Removed ${email} from group ${fromGroupId}`);
    }

    // Add to new group (Buyers)
    await withTimeout(
      fetch(`https://connect.mailerlite.com/api/subscribers/${subscriberId}/groups/${toGroupId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MAILERLITE_API_KEY}`
        }
      }),
      TIMEOUTS.mailerlite_api,
      'MailerLite group assignment'
    );

    console.log(`Successfully moved ${email} from group ${fromGroupId} to ${toGroupId}`);
    
  } catch (error) {
    console.error('Error moving subscriber between groups:', error instanceof Error ? error.message : 'Unknown error');
    // Fail gracefully for group management errors
    return;
  }
}

/**
 * Add subscriber to MailerLite
 */
async function addToMailerLite(subscriberData: MailerLiteSubscriberData): Promise<MailerLiteSubscriberResponse | void> {
  if (!MAILERLITE_API_KEY) {
    console.log('MailerLite API key not configured - skipping email integration');
    return;
  }
  
  try {
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
          groups: [getLifecycleGroupId('BUYER_PAID')], // Add to buyer_paid lifecycle state
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

    const result = await response.json() as MailerLiteSubscriberResponse;
    console.log(`Added subscriber to MailerLite: ${subscriberData.email}`);
    return result;
    
  } catch (error) {
    console.error('MailerLite integration error:', error instanceof Error ? error.message : 'Unknown error');
    // Fail gracefully for email integration errors
    return;
  }
}

/**
 * Update existing MailerLite subscriber
 */
async function updateMailerLiteSubscriber(email: string, fields: Record<string, string | number>): Promise<void> {
  if (!MAILERLITE_API_KEY) {
    console.log('MailerLite API key not configured - skipping email integration');
    return;
  }
  
  try {
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

    const searchResult = await searchResponse.json() as MailerLiteSearchResponse;
    
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

    console.log(`Updated MailerLite subscriber: ${email}`);
    
  } catch (error) {
    console.error('Error updating MailerLite subscriber:', error instanceof Error ? error.message : 'Unknown error');
    // Fail gracefully for email integration errors
    return;
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
    await Promise.resolve(); // Placeholder for future async automation API calls
    
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
    await Promise.resolve(); // Placeholder for future async automation API calls
    
  } catch (error) {
    console.error('Error triggering abandoned cart email:', error);
  }
}

// Removed unnecessary config export - over-engineered for basic webhook handling