/**
 * Netlify Function: Create Stripe Payment Intent
 * Securely creates a PaymentIntent with customer metadata for Café com Vendas
 */

const Stripe = require('stripe');

// Initialize Stripe with secret key from environment variables
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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

  try {
    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    // Validate required fields
    const { lead_id, full_name, email, phone, amount, currency = 'eur' } = requestBody;
    
    if (!lead_id || !full_name || !email || !phone) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: lead_id, full_name, email, phone' 
        })
      };
    }

    // Validate amount
    const paymentAmount = amount || 18000; // Default to €180.00
    if (paymentAmount < 50) { // Minimum 50 cents
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid amount. Minimum is 50 cents.' 
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    // Create or retrieve customer
    const customerData = {
      email: email.toLowerCase().trim(),
      name: full_name.trim(),
      phone: phone.trim(),
      metadata: {
        lead_id,
        source: 'cafe_com_vendas_checkout',
        created_at: new Date().toISOString()
      }
    };

    let customer;
    try {
      // Try to find existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: customerData.email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        // Update customer with latest information
        customer = await stripe.customers.update(customer.id, {
          name: customerData.name,
          phone: customerData.phone,
          metadata: {
            ...customer.metadata,
            ...customerData.metadata,
            updated_at: new Date().toISOString()
          }
        });
      } else {
        // Create new customer
        customer = await stripe.customers.create(customerData);
      }
    } catch (error) {
      console.error('Error managing customer:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Error processing customer information' 
        })
      };
    }

    // Prepare metadata for PaymentIntent
    const metadata = {
      lead_id,
      customer_name: full_name.trim(),
      customer_email: email.toLowerCase().trim(),
      customer_phone: phone.trim(),
      event_name: 'Café com Vendas - Lisboa',
      event_date: '2024-09-20',
      spot_type: 'first_lot_early_bird',
      source: 'checkout_modal',
      created_at: new Date().toISOString(),
      // Include UTM parameters if provided
      ...(requestBody.utm_source && { utm_source: requestBody.utm_source }),
      ...(requestBody.utm_medium && { utm_medium: requestBody.utm_medium }),
      ...(requestBody.utm_campaign && { utm_campaign: requestBody.utm_campaign }),
      ...(requestBody.utm_term && { utm_term: requestBody.utm_term }),
      ...(requestBody.utm_content && { utm_content: requestBody.utm_content })
    };

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentAmount,
      currency: currency.toLowerCase(),
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always'
      },
      metadata,
      description: `Café com Vendas - Lisboa: ${full_name}`,
      receipt_email: email.toLowerCase().trim()
    });

    console.log(`Created PaymentIntent ${paymentIntent.id} for customer ${customer.email}`);

    // Return success response with client secret
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        customerId: customer.id,
        amount: paymentAmount,
        currency: currency.toLowerCase()
      })
    };

  } catch (error) {
    console.error('Error creating payment intent:', error);

    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Card error: ' + error.message 
        })
      };
    }

    if (error.type === 'StripeRateLimitError') {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ 
          error: 'Too many requests. Please try again later.' 
        })
      };
    }

    if (error.type === 'StripeInvalidRequestError') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid request: ' + error.message 
        })
      };
    }

    if (error.type === 'StripeAPIError') {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Payment service temporarily unavailable' 
        })
      };
    }

    if (error.type === 'StripeConnectionError') {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Network error. Please try again.' 
        })
      };
    }

    // Generic error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error. Please try again later.' 
      })
    };
  }
};