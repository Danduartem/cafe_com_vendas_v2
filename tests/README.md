# Testing Documentation

This document describes the testing strategy for the Café com Vendas project.

## Test Structure

### Unit Tests (`/tests/unit/`)
- **Purpose**: Test individual functions and components in isolation
- **Framework**: Vitest
- **Examples**: 
  - `mailerlite-helpers.test.ts` - Tests MailerLite integration functions
  - `render/landing-composition.test.ts` - Tests page rendering components

### Integration Tests (`/tests/integration/`)
- **Purpose**: Test interactions between multiple components
- **Framework**: Vitest with mocked DOM/browser APIs
- **Examples**:
  - `mailerlite-flow.test.ts` - Tests complete MailerLite integration flow
  - `mailerlite-api.test.ts` - Tests MailerLite API interactions

### End-to-End Tests (`/tests/e2e/`)
- **Purpose**: Test complete user journeys in a real browser environment
- **Framework**: Playwright
- **Examples**:
  - `user-journey.test.ts` - Tests complete user experience
  - `multibanco-complete-flow.test.ts` - Tests payment flows

## Analytics Testing

The project includes Google Tag Manager (GTM) Server-Side tracking with custom domain configuration:

### Analytics Integration Tests
- ✅ GTM Container initialization and dataLayer events
- ✅ Enhanced ecommerce tracking for payment flows  
- ✅ Event firing validation and attribution
- ✅ Server-side GTM configuration with custom domain

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### End-to-End Tests Only
```bash
npm run test:e2e
```

### Analytics Tests
```bash
# Run analytics-related tests
npx vitest tests/integration/mailerlite-flow.test.ts
npx playwright test tests/e2e/user-journey.test.ts
```

## Test Environment Setup

### Prerequisites
- Node.js 22.17.1+
- Vitest for unit/integration tests
- Playwright for E2E tests
- Test environment configured in `tests/setup.ts`

### Mock Configuration
- `window.dataLayer` mocked for analytics tests
- Console methods mocked to reduce noise
- Fetch API mocked for API integration tests
- DOM APIs mocked for browser environment simulation

## Analytics Testing Strategy

### Server-Side GTM with Custom Domain
The project uses Google Tag Manager Server-Side Tagging with a custom domain (`gtm.jucanamaximiliano.com.br`) for:
- Enhanced privacy and ad-blocker resistance
- First-party data collection context
- Improved conversion tracking accuracy

### Testing Best Practices
- Test event firing and dataLayer interactions
- Verify enhanced ecommerce tracking for payments
- Validate cross-domain tracking configuration
- Ensure GTM preview mode works with custom domain setup

## Continuous Integration

Tests are automatically run on:
- Pull request creation
- Merge to main branch
- Scheduled daily runs

### Test Results
- Unit tests should maintain >90% coverage
- Integration tests should pass without flaky behavior
- E2E tests should simulate real user scenarios
- All tests should complete within reasonable time limits

## Debugging Test Failures

### Common Issues and Solutions

#### **Analytics Tests Failing**
```bash
# Verify GTM container ID is configured correctly
# Check dataLayer events are properly structured
# Ensure custom domain is accessible
```

#### **E2E Test Timeouts**
```bash
# Increase timeout values for slow environments
# Check network connectivity
# Verify Playwright browser installation
```

### Test Data Management
- Use consistent test data across environments
- Mock external API responses
- Isolate tests to prevent interdependencies
- Clean up test state between runs

## Contributing

When adding new features:
1. **Write unit tests first** (TDD approach)
2. **Add integration tests** for component interactions
3. **Include E2E tests** for user-facing features
4. **Update documentation** with test examples
5. **Ensure all tests pass** before submitting PR

### Test Naming Conventions
- Use descriptive test names that explain the behavior
- Group related tests using `describe` blocks
- Use consistent naming patterns across test types
- Include both positive and negative test cases

This comprehensive testing strategy ensures reliable functionality across all environments and use cases.