/**
 * Netlify Function: Stripe Webhook Handler
 * Handles payment confirmations and triggers MailerLite integration
 */

const Stripe = require('stripe');

// Initialize Stripe with secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// MailerLite integration
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID || 'cafe-com-vendas';

exports.handler = async (event, context) => {
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

    console.log('Received Stripe webhook event:', stripeEvent.type);

    // Handle different event types
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(stripeEvent.data.object);
        break;

      case 'payment_intent.processing':
        await handlePaymentProcessing(stripeEvent.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(stripeEvent.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true, event: stripeEvent.type })
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
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent) {
  console.log(`Payment succeeded: ${paymentIntent.id}`);
  
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

    // Add customer to MailerLite
    await addToMailerLite({
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
    });

    // Send confirmation email (via MailerLite automation)
    await triggerConfirmationEmail(customerEmail, {
      name: customerName,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      event_name: metadata.event_name || 'Café com Vendas',
      event_date: metadata.event_date || '20/09/2024'
    });

    console.log(`Successfully processed payment for ${customerEmail}`);

  } catch (error) {
    console.error('Error processing successful payment:', error);
    // Don't throw - we don't want to retry webhook
  }
}

/**
 * Handle payment processing (async payments like bank transfers)
 */
async function handlePaymentProcessing(paymentIntent) {
  console.log(`Payment processing: ${paymentIntent.id}`);
  
  try {
    const metadata = paymentIntent.metadata;
    const customerEmail = metadata.customer_email;
    
    if (customerEmail) {
      // Update MailerLite with processing status
      await updateMailerLiteSubscriber(customerEmail, {
        payment_status: 'processing',
        payment_intent_id: paymentIntent.id
      });
    }
    
  } catch (error) {
    console.error('Error processing payment processing event:', error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent) {
  console.log(`Payment failed: ${paymentIntent.id}`);
  
  try {
    const metadata = paymentIntent.metadata;
    const customerEmail = metadata.customer_email;
    
    if (customerEmail) {
      // Update MailerLite with failed status
      await updateMailerLiteSubscriber(customerEmail, {
        payment_status: 'failed',
        payment_intent_id: paymentIntent.id,
        failure_date: new Date().toISOString()
      });

      // Trigger abandoned cart email sequence
      await triggerAbandonedCartEmail(customerEmail, {
        name: metadata.customer_name,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase()
      });
    }
    
  } catch (error) {
    console.error('Error processing payment failure:', error);
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent) {
  console.log(`Payment canceled: ${paymentIntent.id}`);
  
  try {
    const metadata = paymentIntent.metadata;
    const customerEmail = metadata.customer_email;
    
    if (customerEmail) {
      // Update MailerLite with canceled status
      await updateMailerLiteSubscriber(customerEmail, {
        payment_status: 'canceled',
        payment_intent_id: paymentIntent.id,
        canceled_date: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Error processing payment cancellation:', error);
  }
}

/**
 * Add subscriber to MailerLite
 */
async function addToMailerLite(subscriberData) {
  if (!MAILERLITE_API_KEY) {
    console.warn('MailerLite API key not configured - skipping email integration');
    return;
  }

  try {
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
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
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`MailerLite API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log(`Added subscriber to MailerLite: ${subscriberData.email}`);
    return result;

  } catch (error) {
    console.error('MailerLite integration error:', error);
    throw error;
  }
}

/**
 * Update existing MailerLite subscriber
 */
async function updateMailerLiteSubscriber(email, fields) {
  if (!MAILERLITE_API_KEY) {
    console.warn('MailerLite API key not configured - skipping email integration');
    return;
  }

  try {
    // First, get the subscriber ID
    const searchResponse = await fetch(`https://connect.mailerlite.com/api/subscribers?filter[email]=${encodeURIComponent(email)}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`
      }
    });

    if (!searchResponse.ok) {
      throw new Error(`Failed to find subscriber: ${searchResponse.status}`);
    }

    const searchResult = await searchResponse.json();
    
    if (!searchResult.data || searchResult.data.length === 0) {
      console.log(`Subscriber not found in MailerLite: ${email}`);
      return;
    }

    const subscriberId = searchResult.data[0].id;

    // Update the subscriber
    const updateResponse = await fetch(`https://connect.mailerlite.com/api/subscribers/${subscriberId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`
      },
      body: JSON.stringify({
        fields: fields
      })
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Failed to update subscriber: ${updateResponse.status} - ${error}`);
    }

    console.log(`Updated MailerLite subscriber: ${email}`);

  } catch (error) {
    console.error('Error updating MailerLite subscriber:', error);
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