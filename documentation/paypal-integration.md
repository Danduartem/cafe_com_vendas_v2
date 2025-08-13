# PayPal Integration Documentation

This document outlines how PayPal is integrated into this project for processing payments for the Café com Vendas event.

## Overview

PayPal is used as the primary payment processor for event registrations. The integration is implemented as a simple redirect to a pre-configured PayPal checkout page.

## Current Implementation

### Payment Link
The PayPal payment link is stored in the event metadata and used throughout the application:

```json
// info/DATA_event.json
{
  "payments": {
    "links": {
      "paypal": "https://www.paypal.com/ncp/payment/ZH553KMCW5XQJ"
    }
  }
}
```

### Integration in Templates
The PayPal payment link is accessed via the Eleventy data cascade:

```njk
<!-- In offer.njk component -->
<a href="{{ event.payments.links.paypal }}" 
   class="primary-cta-button"
   data-analytics-event="click_to_checkout"
   aria-label="Garantir vaga via PayPal">
  Sim — quero garantir a minha vaga agora!
</a>
```

## Payment Flow

1. **User clicks CTA button** on the offer section
2. **Redirected to PayPal** checkout page (external)
3. **User completes payment** on PayPal's secure platform
4. **PayPal handles confirmation** and payment processing
5. **User receives confirmation** via email from PayPal

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
1. **External PayPal processing** - All sensitive payment data handled by PayPal
2. **HTTPS enforcement** - All payment links use secure connections  
3. **No card data storage** - No payment information stored locally
4. **Secure redirects** - Uses `rel="noopener noreferrer"` on payment links

### PayPal Link Validation
The PayPal link should be validated to ensure:
- It's a legitimate PayPal domain
- The payment ID corresponds to the correct event
- The amount matches the expected price

## Testing and Validation

### Pre-Production Checklist
- [ ] Verify PayPal link redirects to correct checkout
- [ ] Test payment flow end-to-end
- [ ] Confirm payment amounts match event pricing
- [ ] Validate email confirmations are sent
- [ ] Test MBWay information display
- [ ] Verify analytics tracking fires correctly

### Payment Link Format
PayPal NCP (New Checkout Platform) links follow this pattern:
```
https://www.paypal.com/ncp/payment/{PAYMENT_ID}
```

## Potential Improvements

### Enhanced Integration Options

1. **PayPal JavaScript SDK**
   - Embed PayPal buttons directly in the page
   - Better user experience with in-page checkout
   - More control over the payment flow

2. **Webhook Integration**
   - Receive real-time payment notifications
   - Automatic confirmation emails
   - Integration with CRM/mailing list

3. **Payment Status Tracking**
   - Track payment completion
   - Handle failed payments
   - Provide order status to customers

### Example Enhanced Integration
```html
<!-- PayPal JavaScript SDK Integration -->
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=EUR"></script>

<div id="paypal-button-container"></div>

<script>
paypal.Buttons({
  createOrder: function(data, actions) {
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: '180.00',
          currency_code: 'EUR'
        },
        description: 'Café com Vendas - Edição Portugal'
      }]
    });
  },
  onApprove: function(data, actions) {
    return actions.order.capture().then(function(details) {
      // Handle successful payment
      window.location.href = '/thank-you';
    });
  }
}).render('#paypal-button-container');
</script>
```

## Error Handling

### Common Issues and Solutions

1. **Link Not Working**
   - Verify PayPal link in DATA_event.json
   - Check for expired payment links
   - Ensure proper URL encoding

2. **Payment Failures**
   - Direct users to contact support
   - Provide alternative payment methods
   - Clear error messaging

3. **Double Payments**
   - Implement payment tracking
   - Add confirmation dialogs
   - Monitor for duplicate orders

## Compliance and Legal

### GDPR Considerations
- PayPal handles personal data processing
- Include PayPal in privacy policy
- Inform users about data transfer to PayPal

### PCI Compliance
- No card data handled locally
- PayPal maintains PCI compliance
- Secure transmission of payment data

## Monitoring and Analytics

### Key Metrics to Track
- Payment conversion rates
- Abandonment at PayPal redirect
- MBWay vs PayPal usage
- Payment completion times
- Error rates and types

### Google Analytics Events
```javascript
// Track payment button clicks
gtag('event', 'click_to_checkout', {
  'event_category': 'Payment',
  'event_label': 'PayPal Checkout',
  'value': event.pricing.tiers[0].price
});

// Track MBWay option views
gtag('event', 'view_mbway_option', {
  'event_category': 'Payment',
  'event_label': 'Alternative Payment'
});
```

## Support and Documentation

### PayPal Resources
- [PayPal Developer Documentation](https://developer.paypal.com/)
- [PayPal Checkout Experience](https://www.paypal.com/webapps/mpp/logo-center)
- [PayPal Integration Guide](https://developer.paypal.com/docs/checkout/)

### Project-Specific Support
- Payment issues: Contact via WhatsApp button
- Technical issues: Check browser console for errors
- Failed payments: Direct to alternative MBWay option

## Configuration Management

### Environment-Specific Links
Consider using different PayPal links for different environments:

```javascript
// _data/environment.js
export default {
  paypal: {
    production: "https://www.paypal.com/ncp/payment/PROD_ID",
    staging: "https://www.paypal.com/ncp/payment/STAGING_ID",
    development: "https://www.paypal.com/ncp/payment/DEV_ID"
  }
}
```

This allows for proper testing without affecting production payments.