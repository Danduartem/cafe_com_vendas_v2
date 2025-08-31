/**
 * MSW Handlers for CRM API Testing
 * Provides mock responses for various CRM integration scenarios
 */

import { http, HttpResponse } from 'msw';

// CRM API URL from environment (matches the actual endpoint)
const CRM_API_URL = 'https://mocha-smoky.vercel.app/api/integrations/contact-card';

// Mock CRM API responses
const mockCRMSuccess = {
  success: true,
  id: 'crm-contact-12345',
  message: 'Contact created successfully'
};

const mockCRMError401 = {
  success: false,
  error: 'Unauthorized',
  message: 'Invalid API key or authentication failed'
};

const mockCRMError429 = {
  success: false,
  error: 'Rate Limit Exceeded',
  message: 'Too many requests, please try again later',
  retryAfter: 60
};

const mockCRMError500 = {
  success: false,
  error: 'Internal Server Error',
  message: 'CRM system is temporarily unavailable'
};

// Default success handler
const defaultCRMHandler = http.post(CRM_API_URL, async ({ request }) => {
  const body = await request.json() as Record<string, unknown>;
  
  // Basic validation - ensure required fields are present
  const requiredFields = ['name', 'phone', 'amount', 'company_id', 'board_id', 'column_id'];
  const missingFields = requiredFields.filter(field => !body[field]);
  
  if (missingFields.length > 0) {
    return HttpResponse.json({
      success: false,
      error: 'Validation Error',
      message: `Missing required fields: ${missingFields.join(', ')}`
    }, { status: 400 });
  }

  // Simulate successful contact creation
  return HttpResponse.json({
    ...mockCRMSuccess,
    contact: {
      name: body.name,
      phone: body.phone,
      amount: body.amount
    }
  }, { status: 200 });
});

// Error scenario handlers
const createCRMTimeoutHandler = () => 
  http.post(CRM_API_URL, async () => {
    // Simulate timeout by delaying response beyond typical timeout threshold
    await new Promise(resolve => setTimeout(resolve, 15000));
    return HttpResponse.json(mockCRMSuccess, { status: 200 });
  });

const createCRMAuthErrorHandler = () =>
  http.post(CRM_API_URL, () => {
    return HttpResponse.json(mockCRMError401, { status: 401 });
  });

const createCRMRateLimitHandler = () =>
  http.post(CRM_API_URL, () => {
    return HttpResponse.json(mockCRMError429, { 
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0'
      }
    });
  });

const createCRMServerErrorHandler = () =>
  http.post(CRM_API_URL, () => {
    return HttpResponse.json(mockCRMError500, { status: 500 });
  });

const createCRMNetworkErrorHandler = () =>
  http.post(CRM_API_URL, () => {
    return HttpResponse.error();
  });

// Circuit breaker simulation - fails multiple times then succeeds
let circuitBreakerFailureCount = 0;
const createCRMCircuitBreakerHandler = () =>
  http.post(CRM_API_URL, () => {
    circuitBreakerFailureCount++;
    
    if (circuitBreakerFailureCount <= 5) {
      return HttpResponse.json(mockCRMError500, { status: 500 });
    }
    
    // Reset counter and return success
    circuitBreakerFailureCount = 0;
    return HttpResponse.json(mockCRMSuccess, { status: 200 });
  });

// Configuration error handler (missing required config)
const createCRMConfigErrorHandler = () =>
  http.post(CRM_API_URL, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    
    // Check for missing configuration IDs
    if (!body.company_id || !body.board_id || !body.column_id) {
      return HttpResponse.json({
        success: false,
        error: 'Configuration Error',
        message: 'Missing required CRM configuration (company_id, board_id, or column_id)'
      }, { status: 400 });
    }

    return HttpResponse.json(mockCRMSuccess, { status: 200 });
  });

// Factory function to create custom handlers for specific test scenarios
export function createCustomCRMHandler(scenario: string) {
  switch (scenario) {
    case 'timeout':
      return createCRMTimeoutHandler();
    case 'auth-error':
      return createCRMAuthErrorHandler();
    case 'rate-limit':
      return createCRMRateLimitHandler();
    case 'server-error':
      return createCRMServerErrorHandler();
    case 'network-error':
      return createCRMNetworkErrorHandler();
    case 'circuit-breaker':
      return createCRMCircuitBreakerHandler();
    case 'config-error':
      return createCRMConfigErrorHandler();
    default:
      return defaultCRMHandler;
  }
}

// Helper to reset circuit breaker state for testing
export function resetCRMCircuitBreaker() {
  circuitBreakerFailureCount = 0;
}

// Default handlers array for MSW setup
const crmHandlers = [defaultCRMHandler];

export { CRM_API_URL, mockCRMSuccess, mockCRMError401, mockCRMError429, mockCRMError500 };
export default crmHandlers;