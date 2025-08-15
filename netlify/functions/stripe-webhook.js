/**
 * Netlify Function: Stripe Webhook Handler
 * Handles payment confirmations and triggers MailerLite integration
 */

import Stripe from 'stripe';

// Initialize Stripe with secret key and timeout configuration
const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
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
function withTimeout(promise, timeoutMs, operation = 'Operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
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
const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  monitoringPeriod: 300000 // 5 minutes
};

// Circuit breaker state management
const circuitBreakers = new Map();

/**
 * Circuit Breaker Pattern Implementation
 */
class CircuitBreaker {
  constructor(name, config = CIRCUIT_BREAKER_CONFIG) {
    this.name = name;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.config = config;
    this.successCount = 0;
    this.totalCalls = 0;
  }
  
  async execute(operation) {
    this.totalCalls++;
    
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.config.resetTimeout) {
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
  
  onSuccess() {
    this.successCount++;
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      logWithCorrelation('info', `Circuit breaker CLOSED for ${this.name}`);
    }
  }
  
  onFailure() {
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
  
  getStatus() {
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
function getCircuitBreaker(serviceName) {
  if (!circuitBreakers.has(serviceName)) {
    circuitBreakers.set(serviceName, new CircuitBreaker(serviceName));
  }
  return circuitBreakers.get(serviceName);
}

// Logging with correlation IDs
function logWithCorrelation(level, message, data = {}, correlationId = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId: correlationId || `wh_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    ...data
  };
  console.log(JSON.stringify(logEntry));
  return logEntry.correlationId;
}

export const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let stripeEvent;

  try {
    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }

    // Get Stripe signature from headers
    const sig = event.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing Stripe signature' })
      };
    }

    if (!endpointSecret) {
      console.warn('Stripe webhook secret not configured - skipping signature verification');
      // Parse event without verification (development mode)
      stripeEvent = JSON.parse(event.body);
    } else {
      // Verify webhook signature
      try {
        stripeEvent = stripe.webhooks.constructEvent(
          event.body,
          sig,
          endpointSecret
        );
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid signature' })
        };
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

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(stripeEvent.data.object, correlationId);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(stripeEvent.data.object, stripeEvent.type, correlationId);
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

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        received: true, 
        event: stripeEvent.type,
        correlationId
      })
    };

  } catch (error) {
    console.error('Webhook handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Webhook handler failed',
        message: error.message 
      })
    };
  }
};

/**
 * Retry wrapper with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = MAX_RETRIES, baseDelay = RETRY_DELAY_BASE) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      logWithCorrelation('warn', `Retry attempt ${attempt} failed, retrying in ${delay}ms`, {
        error: error.message,
        attempt,
        maxRetries
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent, correlationId) {
  logWithCorrelation('info', `Payment succeeded: ${paymentIntent.id}`, {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency
  }, correlationId);
  
  try {
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
          lead_id: leadId,
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
        error: error.message,
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

    logWithCorrelation('info', `Successfully processed payment for ${customerEmail}`, {
      paymentIntentId: paymentIntent.id,
      customerEmail
    }, correlationId);

  } catch (error) {
    logWithCorrelation('error', 'Error processing successful payment', {
      error: error.message,
      paymentIntentId: paymentIntent.id,
      stack: error.stack
    }, correlationId);
    // Don't throw - we don't want to retry webhook
  }
}

/**
 * Handle payment processing (async payments like bank transfers)
 */
async function handlePaymentProcessing(paymentIntent, correlationId) {
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
      error: error.message,
      paymentIntentId: paymentIntent.id
    }, correlationId);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent, correlationId) {
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
      error: error.message,
      paymentIntentId: paymentIntent.id
    }, correlationId);
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent, correlationId) {
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
      error: error.message,
      paymentIntentId: paymentIntent.id
    }, correlationId);
  }
}

/**
 * Handle payment that requires action (3D Secure, etc.)
 */
async function handlePaymentRequiresAction(paymentIntent, correlationId) {
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
      error: error.message,
      paymentIntentId: paymentIntent.id
    }, correlationId);
  }
}

/**
 * Handle partially funded payment
 */
async function handlePaymentPartiallyFunded(paymentIntent, correlationId) {
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
      error: error.message,
      paymentIntentId: paymentIntent.id
    }, correlationId);
  }
}

/**
 * Handle charge dispute
 */
async function handleChargeDispute(dispute, correlationId) {
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
      error: error.message,
      disputeId: dispute.id
    }, correlationId);
  }
}

/**
 * Handle invoice payment succeeded
 */
async function handleInvoicePaymentSucceeded(invoice, correlationId) {
  logWithCorrelation('info', `Invoice payment succeeded: ${invoice.id}`, {
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription
  }, correlationId);
}

/**
 * Handle subscription changes
 */
async function handleSubscriptionChange(subscription, eventType, correlationId) {
  logWithCorrelation('info', `Subscription event: ${eventType}`, {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
    eventType
  }, correlationId);
}

/**
 * Add subscriber to MailerLite
 */
async function addToMailerLite(subscriberData) {
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
    if (error.message.includes('Circuit breaker is OPEN')) {
      logWithCorrelation('warn', 'MailerLite circuit breaker is open - skipping email integration', {
        email: subscriberData.email,
        circuitBreakerStatus: circuitBreaker.getStatus()
      });
      return; // Fail gracefully, don't throw
    }
    
    logWithCorrelation('error', 'MailerLite integration error', {
      error: error.message,
      email: subscriberData.email,
      circuitBreakerStatus: circuitBreaker.getStatus()
    });
    throw error;
  }
}

/**
 * Update existing MailerLite subscriber
 */
async function updateMailerLiteSubscriber(email, fields) {
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
    if (error.message.includes('Circuit breaker is OPEN')) {
      logWithCorrelation('warn', 'MailerLite circuit breaker is open - skipping subscriber update', {
        email,
        circuitBreakerStatus: circuitBreaker.getStatus()
      });
      return; // Fail gracefully, don't throw
    }
    
    logWithCorrelation('error', 'Error updating MailerLite subscriber', {
      error: error.message,
      email,
      circuitBreakerStatus: circuitBreaker.getStatus()
    });
    throw error;
  }
}

/**
 * Trigger confirmation email automation
 */
async function triggerConfirmationEmail(email, data) {
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
async function triggerAbandonedCartEmail(email, data) {
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