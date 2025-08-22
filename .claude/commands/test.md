# /test

Unified testing command for Vitest unit tests, Playwright visual tests, and Stripe payment integration.

## Usage
```
/test                    # Run unit tests (Vitest)
/test --visual           # Run visual tests (Playwright)
/test --payment          # Run Stripe payment integration tests
/test --all              # Run all tests (unit + visual + payment)
/test --watch            # Watch mode for unit tests
/test --ui               # Open Vitest UI
```

## What it does

### Unit Tests (Vitest)
1. Tests data adapters and utility functions
2. Validates content loading and parsing
3. Tests analytics event tracking
4. Schema validation tests
5. Template rendering verification

### Visual Tests (Playwright)
1. Browser-based component testing
2. Visual regression detection
3. Cross-browser compatibility
4. Mobile/desktop layout validation
5. Screenshot comparison

### Payment Tests (Stripe Integration)
1. Test card validation (success, decline, 3D Secure)
2. Webhook signature verification
3. Payment intent creation and completion
4. Error handling scenarios
5. Environment variable validation

## Test Categories
- **Analytics**: GTM/GA4 event tracking validation
- **Render**: Template rendering with real data
- **Schemas**: Content structure validation
- **Visual**: Playwright screenshot comparison
- **Payment**: Stripe integration validation
- **Integration**: End-to-end user flows

## Examples
```bash
# Quick unit test run
/test

# Visual regression testing
/test --visual

# Stripe payment integration tests
/test --payment

# Complete test suite (everything)
/test --all

# Development with live testing
/test --watch

# Interactive test debugging
/test --ui
```

## Business Critical Tests
- **Payment Flow**: Stripe integration works correctly
- **Conversion Funnel**: All CTA buttons and forms functional
- **Analytics**: Proper event tracking for business metrics
- **Content**: Portuguese content renders without errors
- **Performance**: Core Web Vitals within targets

## Test Cards for Payment Tests
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002  
- **3D Secure**: 4000 0025 0000 3155
- **Insufficient**: 4000 0000 0000 9995

## Environment Variables (Payment Tests)
- `VITE_STRIPE_PUBLIC_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Output
✅ Unit tests: 15/15 passed
✅ Visual tests: 8/8 passed
✅ Payment tests: 4/4 passed
📊 Coverage: 85% (src/platform/, src/_data/)
📸 Screenshots: 3 updated, 5 unchanged