# /test

Unified testing command for Vitest unit tests and Playwright visual tests.

## Usage
```
/test                    # Run unit tests (Vitest)
/test --visual           # Run visual tests (Playwright)
/test --all              # Run all tests (unit + visual)
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

## Test Categories
- **Analytics**: GTM/GA4 event tracking validation
- **Render**: Template rendering with real data
- **Schemas**: Content structure validation
- **Visual**: Playwright screenshot comparison
- **Integration**: End-to-end user flows

## Examples
```bash
# Quick unit test run
/test

# Visual regression testing
/test --visual

# Complete test suite
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

## Output
✅ Unit tests: 15/15 passed
✅ Visual tests: 8/8 passed  
📊 Coverage: 85% (src/platform/, src/_data/)
📸 Screenshots: 3 updated, 5 unchanged