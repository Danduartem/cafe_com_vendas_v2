# Stripe Integration Documentation

This document outlines how Stripe is integrated into this project for processing payments for the Café com Vendas event.

## Overview

Stripe is used as the primary payment processor for event registrations. The integration is implemented as a simple redirect to a pre-configured Stripe checkout page using Stripe Payment Links.

## Current Implementation

### Payment Link
The Stripe payment link is stored in the event metadata and used throughout the application:

```json
// info/DATA_event.json
{
  "payments": {
    "links": {
      "stripe": "https://buy.stripe.com/cafe-com-vendas-lisboa"
    }
  }
}
```

### Integration in Templates
The Stripe payment link is accessed via the Eleventy data cascade:

```njk
<!-- In offer.njk component -->
<a href="{{ event.payments.links.stripe }}" 
   class="primary-cta-button"
   data-analytics-event="click_to_checkout"
   aria-label="Garantir vaga via Stripe">
  Sim — quero garantir a minha vaga agora!
</a>
```

## Payment Flow

1. **User clicks CTA button** on the offer section
2. **Redirected to Stripe** checkout page (external)
3. **User completes payment** on Stripe's secure platform
4. **Stripe handles confirmation** and payment processing
5. **User receives confirmation** via email from Stripe
6. **Optional**: Redirect to thank you page after successful payment

## Alternative Payment Method

### MBWay Integration
An alternative payment method (MBWay) is also available:

```json
// info/DATA_event.json
{
  "payments": {
    "alternative": {
      "mbway": {
        "phone": "+351935251983",
        "contact": "Mónica",
        "instruction": "Avisar a Mónica que o pagamento foi realizado para garantir a vaga"
      }
    }
  }
}
```

### MBWay UI Implementation
```njk
<!-- MBWay toggle button -->
<button onclick="toggleMBWayInfo()" 
        class="w-full py-4 px-6 bg-white/90 border-2 border-neutral-300">
  <span class="flex items-center justify-center">
    Pagar com MBWay
  </span>
</button>

<!-- MBWay info panel -->
<div id="mbway-info" class="hidden">
  <div class="bg-neutral-50 rounded-xl p-6">
    <p class="font-semibold text-navy-800 mb-2">
      MBWay: <span class="text-burgundy-700">{{ event.payments.alternative.mbway.phone }}</span>
    </p>
    <p class="text-navy-600 text-sm">
      Após o pagamento, envie mensagem para <strong>{{ event.payments.alternative.mbway.contact }}</strong> 
      para confirmar a sua vaga.
    </p>
  </div>
</div>
```

## Analytics Tracking

### Payment Button Clicks
```javascript
// Event tracking for analytics
data-analytics-event="click_to_checkout"
```

### MBWay Interactions
```javascript
// In main.js
function toggleMBWayInfo() {
  const mbwayInfo = document.getElementById('mbway-info');
  const isHidden = mbwayInfo.classList.contains('hidden');
  
  // Analytics tracking
  if (typeof gtag !== 'undefined') {
    gtag('event', 'view_mbway_option', {
      'event_category': 'Payment',
      'event_label': 'MBWay Option Viewed',
      'value': isHidden ? 1 : 0
    });
  }
}
```

## Security Considerations

### Current Security Measures
1. **External Stripe processing** - All sensitive payment data handled by Stripe
2. **HTTPS enforcement** - All payment links use secure connections  
3. **PCI compliance** - Stripe maintains PCI DSS Level 1 certification
4. **No card data storage** - No payment information stored locally
5. **Secure redirects** - Uses `rel="noopener noreferrer"` on payment links

### Stripe Link Validation
The Stripe Payment Link should be validated to ensure:
- It's a legitimate Stripe domain (buy.stripe.com)
- The payment link corresponds to the correct event and pricing
- The link is active and properly configured

## Testing and Validation

### Pre-Production Checklist
- [ ] Verify Stripe Payment Link redirects to correct checkout
- [ ] Test payment flow end-to-end with test cards
- [ ] Confirm payment amounts match event pricing
- [ ] Validate email confirmations are sent by Stripe
- [ ] Test success and cancel redirect URLs
- [ ] Verify analytics tracking fires correctly
- [ ] Test MBWay information display

### Payment Link Format
Stripe Payment Links follow this pattern:
```
https://buy.stripe.com/{PAYMENT_LINK_ID}
```

## Potential Improvements

### Enhanced Integration Options

1. **Stripe Embedded Checkout**
   - Embed Stripe checkout directly in the page
   - Better user experience without redirect
   - More control over the checkout flow

2. **Webhook Integration**
   - Receive real-time payment notifications
   - Automatic confirmation emails from your domain
   - Integration with CRM/mailing list systems

3. **Payment Status Tracking**
   - Track payment completion in real-time
   - Handle failed payments gracefully
   - Provide order status to customers

### Example Enhanced Integration
```html
<!-- Stripe Embedded Checkout -->
<script src="https://js.stripe.com/v3/"></script>

<div id="checkout">
  <!-- Checkout will be inserted here -->
</div>

<script>
const stripe = Stripe('pk_live_YOUR_PUBLISHABLE_KEY');

stripe.redirectToCheckout({
  lineItems: [{
    price: 'price_1ABC123def456', // Your price ID
    quantity: 1,
  }],
  mode: 'payment',
  successUrl: 'https://your-website.com/success',
  cancelUrl: 'https://your-website.com/cancel',
});
</script>
```

## Error Handling

### Common Issues and Solutions

1. **Link Not Working**
   - Verify Stripe Payment Link in DATA_event.json
   - Check if link is properly activated in Stripe Dashboard
   - Ensure proper URL encoding

2. **Payment Failures**
   - Direct users to contact support via WhatsApp
   - Provide alternative payment methods (MBWay)
   - Clear error messaging with next steps

3. **Double Payments**
   - Stripe automatically prevents duplicate payments
   - Monitor Stripe Dashboard for unusual activity
   - Set up webhook notifications for payment events

## Compliance and Legal

### GDPR Considerations
- Stripe handles personal data processing as data processor
- Include Stripe in privacy policy
- Inform users about data transfer to Stripe (EU company)
- Stripe provides GDPR-compliant data processing

### PCI Compliance
- No card data handled locally
- Stripe maintains PCI DSS Level 1 compliance
- Secure transmission of all payment data
- Regular security audits by Stripe

## Monitoring and Analytics

### Key Metrics to Track
- Payment conversion rates from checkout page
- Abandonment at Stripe redirect
- MBWay vs Stripe usage patterns
- Payment completion times
- Error rates and failure types
- Mobile vs desktop payment success rates

### Google Analytics Events
```javascript
// Track payment button clicks
gtag('event', 'click_to_checkout', {
  'event_category': 'Payment',
  'event_label': 'Stripe Checkout',
  'value': event.pricing.tiers[0].price
});

// Track MBWay option views
gtag('event', 'view_mbway_option', {
  'event_category': 'Payment',
  'event_label': 'Alternative Payment'
});

// Track successful payments (via webhook)
gtag('event', 'purchase', {
  'transaction_id': 'stripe_payment_id',
  'value': event.pricing.tiers[0].price,
  'currency': 'EUR'
});
```

## Support and Documentation

### Stripe Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Payment Links Guide](https://stripe.com/docs/payment-links)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Stripe Status Page](https://status.stripe.com/)

### Project-Specific Support
- Payment issues: Contact via WhatsApp button
- Technical issues: Check browser console for errors
- Failed payments: Direct to alternative MBWay option
- Refunds: Process through Stripe Dashboard

## Configuration Management

### Environment-Specific Links
Consider using different Stripe Payment Links for different environments:

```javascript
// _data/environment.js
export default {
  stripe: {
    production: "https://buy.stripe.com/live_payment_link",
    staging: "https://buy.stripe.com/test_staging_link",
    development: "https://buy.stripe.com/test_dev_link"
  }
}
```

This allows for proper testing without affecting production payments.

## Stripe Dashboard Configuration

### Required Setup
1. **Create Product** - Café com Vendas event
2. **Set Price** - €180 EUR (one-time payment)
3. **Create Payment Link** - Configure with proper branding
4. **Set Success URL** - Redirect after successful payment
5. **Configure Webhooks** - For payment notifications (optional)
6. **Test Mode** - Use for development and testing

### Recommended Settings
- **Collect customer information**: Email address (required)
- **Allow promotion codes**: Optional discount functionality
- **Tax collection**: Configure if applicable in Portugal
- **After payment**: Redirect to thank you page
- **Branding**: Upload logo and brand colors

This implementation provides a secure, user-friendly payment experience while maintaining the project's high-quality standards.