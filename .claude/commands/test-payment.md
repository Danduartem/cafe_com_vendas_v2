# /test-payment

Test Stripe payment integration with various card scenarios.

## Usage
```
/test-payment              # Basic test with success card
/test-payment --full       # Test all card scenarios
/test-payment --webhook    # Test webhook handling
```

## What it does
1. Verifies Stripe environment variables
2. Tests payment form with test cards
3. Validates webhook signatures
4. Checks error handling
5. Reports success/failure

## Test Cards
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155
- **Insufficient**: 4000 0000 0000 9995

## Examples
```bash
# Quick payment test
/test-payment

# Full test suite
/test-payment --full

# Test webhook events
/test-payment --webhook
```

## Environment Check
- `VITE_STRIPE_PUBLIC_KEY`
- `STRIPE_SECRET_KEY` 
- `STRIPE_WEBHOOK_SECRET`

## Output
✅ Payment successful (€1797)
✅ Webhook received
✅ Email confirmation sent
❌ Card declined (test passed)