# Stripe Payment Testing Command

Comprehensive testing suite for Stripe payment integration on Café com Vendas landing page, including Portuguese/Brazilian payment scenarios.

## 1) Intent
Goal: Validate complete payment flow from registration to confirmation for the September 2025 Lisbon event, ensuring reliability for Portuguese female entrepreneurs.
Non-Goals: No production payments or real transactions. Focus on test environment validation and error handling.

## 2) Inputs
Optional:
- `mode`: "quick" | "full" | "europe" | "brazil" (default: full)
- `cards`: "basic" | "3ds" | "errors" | "all" (default: all)
- `webhooks`: true|false (default: true) - test webhook handling
- `mobile`: true|false (default: true) - test mobile payment flow
- `performance`: true|false (default: true) - measure payment timing

## 3) Test Environment Setup

### Prerequisites Check
```bash
# Verify environment variables
echo "Checking Stripe test environment..."
echo "Public Key: ${VITE_STRIPE_PUBLIC_KEY:0:12}..."
echo "Secret Key: ${STRIPE_SECRET_KEY:0:12}..."
echo "Webhook Secret: ${STRIPE_WEBHOOK_SECRET:0:12}..."

# Verify Netlify Functions
echo "Checking Netlify Functions..."
ls -la netlify/functions/
node -c netlify/functions/create-payment-intent.js
node -c netlify/functions/stripe-webhook.js
```

### Development Server Validation
```bash
# Start development server
npm run dev

# Wait for server startup
sleep 5

# Verify payment endpoints
curl -s http://localhost:8080 | grep -q "Stripe" && echo "✅ Stripe loaded" || echo "❌ Stripe not found"
```

## 4) Payment Card Test Matrix

### 4.1) Basic Success Scenarios
```javascript
// Quick success cards
const basicCards = {
  visa: "4242424242424242",
  visaDebit: "4000056655665556", 
  mastercard: "5555555555554444",
  amex: "378282246310005",
  discover: "6011111111111117"
};
```

### 4.2) European Payment Methods
```javascript
// Portugal/Europe specific
const europeCards = {
  portugalVisa: "4000006200000007",    // Portugal Visa with 3D Secure
  euroDebit: "4000002760003184",       // Europe debit card
  sepaDebit: "4000003720000278"        // SEPA debit support
};
```

### 4.3) Brazilian Payment Methods  
```javascript
// Brazil market (secondary audience)
const brazilCards = {
  brazilVisa: "4000000760000002",      // Brazil Visa
  brazilMaster: "5555555555554444",    // Works in Brazil
  pixSimulation: "4000007600000002"    // PIX-compatible card
};
```

### 4.4) 3D Secure Authentication
```javascript
// Strong Customer Authentication (SCA)
const sca3dsCards = {
  authRequired: "4000002500003155",    // Always requires authentication
  authOptional: "4000002760003184",    // Sometimes requires authentication
  authDeclined: "4000008400001629"     // Authentication fails
};
```

### 4.5) Error Scenarios
```javascript
// Payment failures
const errorCards = {
  declined: "4000000000000002",        // Generic decline
  insufficientFunds: "4000000000009995", // Insufficient funds
  lostCard: "4000000000009987",        // Lost card
  stolenCard: "4000000000009979",      // Stolen card
  expiredCard: "4000000000000069",     // Expired card
  incorrectCvc: "4000000000000127",    // Incorrect CVC
  processingError: "4000000000000119"  // Processing error
};
```

## 5) Test Execution Flow

### Step 1: Payment Form Testing
```bash
# Test payment form interaction
echo "🧪 Testing payment form..."

# 1. Navigate to checkout
# 2. Fill event registration details
# 3. Enter test card numbers
# 4. Submit payment form
# 5. Verify Stripe.js interaction
```

### Step 2: Payment Intent Creation
```bash
# Test Netlify Function
echo "💳 Testing payment intent creation..."

curl -X POST http://localhost:8080/.netlify/functions/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 250000, "currency": "eur", "eventType": "cafe-com-vendas"}'
```

### Step 3: Webhook Testing
```bash
# Test webhook endpoint
echo "🔗 Testing Stripe webhooks..."

# Simulate successful payment event
curl -X POST http://localhost:8080/.netlify/functions/stripe-webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: whsec_test_signature" \
  -d '{"type": "payment_intent.succeeded", "data": {"object": {"id": "pi_test"}}}'
```

### Step 4: Error Handling Validation
```bash
# Test error scenarios
echo "❌ Testing error handling..."

# Test various decline reasons
# Test network failures
# Test timeout scenarios
# Test malformed data
```

## 6) Automated Test Scenarios

### Basic Payment Flow
1. **Registration Form → Payment**
   - Fill participant details
   - Select payment method
   - Process payment with test card
   - Verify success confirmation

2. **Mobile Payment Flow**
   - Test on mobile viewport
   - Touch interaction testing
   - Mobile Stripe elements
   - Payment modal behavior

3. **European Payment Methods**
   - Test Portugal-specific cards
   - 3D Secure authentication flow
   - SEPA payment methods
   - Euro currency handling

### Error Recovery Testing
1. **Payment Failures**
   - Card declined scenarios
   - Network timeout handling
   - Invalid card data
   - Insufficient funds

2. **Form Validation**
   - Required field validation
   - Email format checking
   - Card number validation
   - Expiry date validation

3. **Security Testing**
   - Webhook signature validation
   - Payment amount verification
   - Currency validation
   - Duplicate payment prevention

## 7) Performance Testing

### Payment Timing Metrics
```bash
# Measure payment performance
echo "⏱️ Testing payment performance..."

# Time to payment form load
# Stripe.js initialization time
# Payment intent creation speed
# Webhook processing time
# Overall checkout completion time
```

### Mobile Performance
```bash
# Mobile-specific performance
echo "📱 Testing mobile payment performance..."

# Mobile form rendering
# Touch response time
# 3G network simulation
# Payment modal loading
```

## 8) Webhook Validation

### Event Types to Test
1. **payment_intent.created**
2. **payment_intent.succeeded**
3. **payment_intent.payment_failed**
4. **charge.succeeded**
5. **invoice.payment_succeeded**

### Webhook Security
```bash
# Verify webhook signatures
echo "🔐 Testing webhook security..."

# Valid signature verification
# Invalid signature rejection
# Replay attack prevention
# Timeout handling
```

## 9) Test Results Analysis

### Success Criteria
- ✅ All basic cards process successfully
- ✅ 3D Secure authentication works
- ✅ Portuguese payment methods functional
- ✅ Error handling graceful and informative
- ✅ Webhooks process correctly
- ✅ Mobile payments work smoothly
- ✅ Performance within acceptable limits

### Performance Benchmarks
- **Payment form load**: <2 seconds
- **Payment processing**: <5 seconds
- **Webhook response**: <1 second
- **Error handling**: Immediate feedback
- **Mobile performance**: Matches desktop

## 10) Command Examples

```bash
# Quick basic test
/stripe-test mode="quick"

# Full European market test
/stripe-test mode="europe" cards="3ds" mobile=true

# Error scenario testing
/stripe-test cards="errors" webhooks=true

# Performance-focused testing
/stripe-test performance=true mobile=true

# Brazil market testing
/stripe-test mode="brazil" cards="all"
```

## 11) Output Reports

```
reports/stripe/
├── payment-test-results.json    # Test execution results
├── performance-metrics.json     # Payment timing data
├── error-scenarios.json         # Error handling results
├── webhook-validation.json      # Webhook test results
├── mobile-payment-audit.json    # Mobile-specific results
└── recommendations.md           # Optimization suggestions
```

## 12) Common Issues and Solutions

### Portuguese Market Considerations
1. **3D Secure Requirements**
   - Strong Customer Authentication (SCA) compliance
   - Bank authentication redirection
   - Mobile authentication apps

2. **Currency Display**
   - Euro symbol placement
   - Decimal separator (comma vs period)
   - Portuguese number formatting

3. **Payment Methods**
   - Local bank card preferences
   - SEPA debit support
   - MB WAY integration potential

### Error Handling Best Practices
1. **User-Friendly Messages**
   - Portuguese error translations
   - Clear next steps
   - Contact information
   - Alternative payment options

2. **Technical Monitoring**
   - Payment failure alerts
   - Webhook delivery monitoring
   - Performance degradation alerts
   - Error rate tracking

## 13) Security Checklist

- [ ] Test API keys properly configured
- [ ] Webhook signatures validated
- [ ] No sensitive data logged
- [ ] HTTPS enforced for all payment flows
- [ ] Card data never stored locally
- [ ] PCI compliance maintained
- [ ] Error messages don't leak sensitive info

## 14) Integration with Development Workflow

### Pre-deployment Testing
```bash
# Before each deployment
npm run build
/stripe-test mode="quick"
npm run lighthouse
```

### Continuous Monitoring
```bash
# Regular payment health checks
/stripe-test mode="europe" cards="basic"
# Monitor webhook delivery rates
# Track payment success rates
```

Focus on ensuring bulletproof payment reliability for your premium Portuguese event - every failed payment is potential lost revenue from your target audience of female entrepreneurs.