# Testing Documentation

This document describes the testing strategy for the Café com Vendas project, including the newly implemented GTM preview mode functionality.

## Test Structure

### Unit Tests (`/tests/unit/`)
- **Purpose**: Test individual functions and components in isolation
- **Framework**: Vitest
- **Examples**: 
  - `gtm-proxy.test.ts` - Tests the GTM proxy function logic
  - `mailerlite-helpers.test.ts` - Tests MailerLite integration functions
  - `render/landing-composition.test.ts` - Tests page rendering components

### Integration Tests (`/tests/integration/`)
- **Purpose**: Test interactions between multiple components
- **Framework**: Vitest with mocked DOM/browser APIs
- **Examples**:
  - `gtm-preview-integration.test.ts` - Tests GTM preview mode detection and proxy routing
  - `mailerlite-flow.test.ts` - Tests complete MailerLite integration flow
  - `mailerlite-api.test.ts` - Tests MailerLite API interactions

### End-to-End Tests (`/tests/e2e/`)
- **Purpose**: Test complete user journeys in a real browser environment
- **Framework**: Playwright
- **Examples**:
  - `user-journey.test.ts` - Tests complete user experience including GTM preview
  - `gtm-preview-e2e.test.ts` - Tests Server GTM preview functionality end-to-end
  - `multibanco-complete-flow.test.ts` - Tests payment flows

## GTM Preview Mode Testing

The GTM preview mode fix includes comprehensive tests at all levels:

### Unit Tests (`gtm-proxy.test.ts`)
Tests the core proxy function functionality:
- ✅ Preview mode detection from URL parameters, headers, and cookies
- ✅ URL building for different GTM endpoints (`/g/collect`, `/mp/collect`)
- ✅ Header forwarding and CORS handling
- ✅ Request proxying with proper error handling
- ✅ Response header management

### Integration Tests (`gtm-preview-integration.test.ts`)
Tests the interaction between client-side detection and proxy routing:
- ✅ Preview mode detection in browser environment
- ✅ Proxy endpoint integration with fetch API
- ✅ GTM configuration for preview vs production modes
- ✅ Cookie handling and security validation
- ✅ Error handling and fallback behavior

### End-to-End Tests (`gtm-preview-e2e.test.ts`)
Tests the complete user experience:
- ✅ Preview mode detection from URL parameters
- ✅ Proxy function availability and CORS handling
- ✅ GTM configuration and event tracking
- ✅ User interaction tracking (clicks, scrolls)
- ✅ Performance impact and error handling
- ✅ Production vs preview mode behavior

### Enhanced User Journey Tests
The existing `user-journey.test.ts` now includes:
- ✅ GTM preview mode parameter handling
- ✅ Preview mode detection validation
- ✅ Proxy configuration verification
- ✅ DataLayer functionality in preview mode

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

### GTM-Specific Tests
```bash
# Unit tests for GTM proxy
npx vitest tests/unit/functions/gtm-proxy.test.ts

# Integration tests for GTM preview
npx vitest tests/integration/gtm-preview-integration.test.ts

# E2E tests for GTM preview
npx playwright test tests/e2e/gtm-preview-e2e.test.ts
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

## Testing the GTM Preview Fix

### Manual Testing Steps
1. **Deploy the changes**
2. **Open Server GTM Preview** in GTM interface
3. **Visit site with debug parameter**: `?gtm_debug=1756895052790`
4. **Interact with site** (clicks, scrolls, etc.)
5. **Verify requests appear** in Server GTM Preview

### Automated Test Validation
```bash
# Run all GTM-related tests
npm run test:gtm

# This will run:
# - Unit tests for proxy function
# - Integration tests for preview detection
# - E2E tests for complete functionality
# - Enhanced user journey tests
```

### Test Coverage Areas

#### ✅ **Functional Testing**
- Preview mode detection accuracy
- Proxy function request handling
- Header forwarding and CORS
- Error handling and fallbacks

#### ✅ **Security Testing**
- Input validation and sanitization
- Cookie handling security
- CORS policy enforcement
- Preview token validation

#### ✅ **Performance Testing**
- Page load impact measurement
- Request routing efficiency
- Memory usage validation
- Network request optimization

#### ✅ **Compatibility Testing**
- Browser compatibility (Chrome, Firefox, Safari)
- Mobile device testing
- Different GTM configurations
- Production vs preview behavior

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

#### **GTM Proxy Tests Failing**
```bash
# Check if proxy function is properly mocked
# Verify environment variables are set
# Ensure Server GTM endpoint is accessible
```

#### **Preview Mode Detection Issues**
```bash
# Verify URL parameters are properly parsed
# Check cookie parsing logic
# Ensure DOM environment is properly mocked
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

This comprehensive testing strategy ensures the GTM preview mode fix works reliably across all environments and use cases.