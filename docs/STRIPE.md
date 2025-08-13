# Stripe Payment Integration Documentation

## Overview
Stripe is a comprehensive payment processing platform that provides APIs, SDKs, and UI components for accepting payments online. This guide focuses on integrating Stripe into the Café com Vendas landing page.

## Key Features
- **Payment Processing**: Accept credit cards, bank transfers, and digital wallets
- **Webhooks**: Real-time payment status notifications
- **Elements**: Pre-built, customizable UI components
- **Tax Calculation**: Automated tax handling with Stripe Tax
- **Security**: PCI-compliant payment collection

## Integration Architecture

### Frontend (JavaScript)
```javascript
// Initialize Stripe.js
const stripe = Stripe('YOUR_PUBLISHABLE_KEY');

// Create Elements with client secret
const elements = stripe.elements({
  clientSecret: 'pi_client_secret',
  appearance: {
    theme: 'stripe'
  }
});

// Create and mount Payment Element
const paymentElement = elements.create('payment', {
  layout: 'accordion'
});
paymentElement.mount('#payment-element');
```

### Payment Form Handling
```javascript
const form = document.getElementById('payment-form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: 'https://example.com/order/complete'
    }
  });

  if (error) {
    // Display error to customer
    document.querySelector('#error-message').textContent = error.message;
  }
});
```

### Backend Webhook Handling
```javascript
// Node.js Express webhook endpoint
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = 'whsec_...';

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      // Fulfill order, send confirmation email
      handleSuccessfulPayment(paymentIntent);
    }
    
    res.json({received: true});
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

## Key Events & Webhooks

### Essential Events
- **`payment_intent.succeeded`**: Payment completed successfully - fulfill order
- **`payment_intent.processing`**: Payment in progress (e.g., bank transfers)
- **`payment_intent.payment_failed`**: Payment failed - notify customer
- **`checkout.session.completed`**: Checkout session finished (instant payments)
- **`checkout.session.async_payment_succeeded`**: Delayed payment succeeded

### Event Handling Pattern
```javascript
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  // Create tax transaction if needed
  if (paymentIntent.metadata.tax_calculation) {
    await stripe.tax.transactions.createFromCalculation({
      calculation: paymentIntent.metadata.tax_calculation,
      reference: `order_${paymentIntent.id}`
    });
  }
  
  // Fulfill order
  await fulfillOrder(paymentIntent);
};
```

## Implementation for Café com Vendas

### 1. Payment Element Integration
- Use Stripe Elements for secure, PCI-compliant payment collection
- Customize appearance to match brand colors (Navy #191F3A, Burgundy #81171F)
- Enable Portuguese localization

### 2. Event Data Integration
```javascript
// Create PaymentIntent with event details
const paymentIntent = await stripe.paymentIntents.create({
  amount: eventData.price * 100, // Convert to cents
  currency: 'eur',
  customer: customer.id,
  setup_future_usage: 'off_session',
  metadata: {
    event_name: 'Café com Vendas',
    event_date: '2024-09-20',
    spot_number: spotNumber,
    customer_email: customer.email
  }
});
```

### 3. Webhook Processing
- Handle `payment_intent.succeeded` to confirm spot reservation
- Send confirmation email with event details
- Update availability counter
- Integrate with WhatsApp notifications

## Security Best Practices

### Client-Side
- Never expose secret keys in frontend code
- Use publishable keys only for Stripe.js initialization
- Validate all user inputs before sending to Stripe

### Server-Side
- Verify webhook signatures to ensure authenticity
- Use environment variables for API keys
- Implement proper error handling and logging

## Testing

### Test Cards
```javascript
// Successful payment
4242424242424242

// Requires authentication (3D Secure)
4000002500003155

// Declined card
4000000000000002
```

### Webhook Testing
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/webhook
```

## Error Handling

### Common Error Types
- **card_declined**: Payment method declined
- **insufficient_funds**: Insufficient balance
- **authentication_required**: 3D Secure authentication needed
- **processing_error**: General processing error

### Error Display Pattern
```javascript
if (error) {
  const errorElement = document.querySelector('#error-message');
  switch (error.code) {
    case 'card_declined':
      errorElement.textContent = 'Seu cartão foi recusado. Tente outro método de pagamento.';
      break;
    case 'insufficient_funds':
      errorElement.textContent = 'Saldo insuficiente. Verifique seu limite.';
      break;
    default:
      errorElement.textContent = error.message;
  }
}
```

## Portuguese Localization
- Set `locale: 'pt'` in Elements configuration
- Customize error messages in Portuguese
- Format currency and dates according to PT locale

## Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Elements Guide](https://stripe.com/docs/stripe-js)
- [Webhook Guide](https://stripe.com/docs/webhooks)
- [Testing Guide](https://stripe.com/docs/testing)