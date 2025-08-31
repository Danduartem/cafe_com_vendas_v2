/**
 * Netlify Function: CRM Integration
 * Captures leads from checkout forms and sends them to the CRM system
 * Non-blocking integration that ensures checkout flow reliability
 */

import type {
  CRMContactPayload,
  CRMApiResponse,
  CRMResult,
  CRMRateLimitEntry,
  CRMValidationRules,
  CircuitBreakerStatus,
  UnvalidatedCRMRequest
} from './crm-types';

// Environment configuration
const CRM_CONFIG = {
  companyId: process.env.CRM_COMPANY_ID || '',
  boardId: process.env.CRM_BOARD_ID || '',
  columnId: process.env.CRM_COLUMN_ID || '',
  apiUrl: process.env.CRM_API_URL || 'https://mocha-smoky.vercel.app/api/integrations/contact-card',
  apiKey: process.env.CRM_API_KEY // Optional, if your CRM requires authentication
};

// Timeout configuration
const TIMEOUTS = {
  crm_api: 10000, // 10 seconds for CRM API
  default: 8000
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 CRM submissions per 10 minutes per IP

// Validation rules - only require fields in the CRM payload spec
const VALIDATION_RULES: CRMValidationRules = {
  required_fields: ['name', 'phone', 'amount'],
  name_min_length: 2,
  name_max_length: 100,
  phone_min_length: 7,
  phone_max_length: 20,
  amount_pattern: /^\d+(\.\d{1,2})?$/ // Matches "180.00" format
};

// Simple in-memory rate limiting store
const rateLimitStore = new Map<string, CRMRateLimitEntry>();

/**
 * Circuit Breaker Pattern Implementation
 */
class CircuitBreaker {
  public name: string;
  public failureCount: number;
  public lastFailureTime: number | null;
  public state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  public failureThreshold: number;
  public resetTimeout: number;
  public successCount: number;
  public totalCalls: number;

  constructor(name: string, failureThreshold = 5, resetTimeout = 60000) {
    this.name = name;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED';
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.successCount = 0;
    this.totalCalls = 0;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.totalCalls++;

    if (this.state === 'OPEN') {
      if (this.lastFailureTime && Date.now() - this.lastFailureTime < this.resetTimeout) {
        throw new Error(`Circuit breaker is OPEN for ${this.name}`);
      } else {
        this.state = 'HALF_OPEN';
        console.log(`Circuit breaker transitioning to HALF_OPEN for ${this.name}`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess(): void {
    this.successCount++;
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log(`Circuit breaker CLOSED for ${this.name}`);
    }
  }

  onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log(`Circuit breaker OPENED for ${this.name} after ${this.failureCount} failures`);
    }
  }

  getStatus(): CircuitBreakerStatus {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalCalls: this.totalCalls,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// Single circuit breaker instance for CRM API
const crmCircuitBreaker = new CircuitBreaker('crm-api');

/**
 * Timeout wrapper for async operations
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation = 'Operation'): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operation} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
}

/**
 * Type guard to check if a value is a non-empty string
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard to check if a value is a string array
 */
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

/**
 * Validate CRM request data
 */
function validateCRMRequest(requestBody: UnvalidatedCRMRequest): { isValid: boolean; errors: string[]; sanitized?: CRMContactPayload } {
  const errors: string[] = [];

  // Check required fields exist and are non-empty strings
  for (const field of VALIDATION_RULES.required_fields) {
    if (!isNonEmptyString(requestBody[field])) {
      errors.push(`Missing or invalid required field: ${field}`);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // At this point, TypeScript knows the required fields are non-empty strings
  const name = requestBody.name as string;
  const phone = requestBody.phone as string;
  const amount = requestBody.amount as string;

  // Validate name
  const cleanName = name.trim();
  if (cleanName.length < VALIDATION_RULES.name_min_length || cleanName.length > VALIDATION_RULES.name_max_length) {
    errors.push(`Name must be between ${VALIDATION_RULES.name_min_length} and ${VALIDATION_RULES.name_max_length} characters`);
  }

  // Validate phone
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  if (cleanPhone.length < VALIDATION_RULES.phone_min_length || cleanPhone.length > VALIDATION_RULES.phone_max_length) {
    errors.push(`Phone number must be between ${VALIDATION_RULES.phone_min_length} and ${VALIDATION_RULES.phone_max_length} digits`);
  }

  // Validate amount format
  if (!VALIDATION_RULES.amount_pattern.test(amount)) {
    errors.push('Invalid amount format (expected: "180.00")');
  }

  // Check for suspicious patterns (basic XSS/injection prevention)
  const suspiciousPatterns = [/<script/i, /javascript:/i, /on\w+=/i, /\bselect\b.*\bfrom\b/i];
  const obsValue = typeof requestBody.obs === 'string' ? requestBody.obs : '';
  const stringValues = [name, phone, obsValue];

  for (const value of stringValues) {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(value)) {
        errors.push('Request contains potentially malicious content');
        break;
      }
    }
  }

  // Validate contact_tags if provided
  const contactTags = requestBody.contact_tags;
  if (contactTags !== undefined && !isStringArray(contactTags)) {
    errors.push('contact_tags must be an array of strings');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? {
      name: cleanName,
      phone: phone.trim(),
      amount: amount,
      company_id: typeof requestBody.company_id === 'string' ? requestBody.company_id : CRM_CONFIG.companyId,
      board_id: typeof requestBody.board_id === 'string' ? requestBody.board_id : CRM_CONFIG.boardId,
      column_id: typeof requestBody.column_id === 'string' ? requestBody.column_id : CRM_CONFIG.columnId,
      title: typeof requestBody.title === 'string' ? requestBody.title : cleanName,
      obs: obsValue,
      contact_tags: isStringArray(contactTags) ? contactTags : []
    } : undefined
  };
}

/**
 * Rate limiting check
 */
function checkRateLimit(clientIP: string): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const key = `crm:${clientIP}`;

  // Clean up old entries
  if (rateLimitStore.size > 500) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now - v.firstRequest > RATE_LIMIT_WINDOW) {
        rateLimitStore.delete(k);
      }
    }
  }

  const record = rateLimitStore.get(key);

  if (!record) {
    rateLimitStore.set(key, {
      count: 1,
      firstRequest: now,
      lastRequest: now
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  // Reset if window has passed
  if (now - record.firstRequest > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(key, {
      count: 1,
      firstRequest: now,
      lastRequest: now
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  // Increment counter
  record.count++;
  record.lastRequest = now;
  rateLimitStore.set(key, record);

  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - record.count);
  const allowed = record.count <= RATE_LIMIT_MAX_REQUESTS;

  return {
    allowed,
    remaining,
    retryAfter: allowed ? undefined : Math.ceil((record.firstRequest + RATE_LIMIT_WINDOW - now) / 1000)
  };
}

/**
 * Send contact to CRM
 */
async function sendToCRM(payload: CRMContactPayload): Promise<CRMResult> {
  if (!CRM_CONFIG.companyId || !CRM_CONFIG.boardId || !CRM_CONFIG.columnId) {
    console.warn('CRM configuration incomplete - skipping integration');
    return { success: false, reason: 'CRM not configured' };
  }

  try {
    return await crmCircuitBreaker.execute(async () => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Add API key if configured
      if (CRM_CONFIG.apiKey) {
        headers['Authorization'] = `Bearer ${CRM_CONFIG.apiKey}`;
      }

      const response = await withTimeout(
        fetch(CRM_CONFIG.apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        }),
        TIMEOUTS.crm_api,
        'CRM API call'
      );

      if (!response.ok) {
        const errorText = await response.text();

        // Handle specific error cases
        if (response.status === 401) {
          console.error('CRM authentication failed');
          return { success: false, reason: 'Authentication failed', recoverable: false };
        } else if (response.status === 429) {
          console.warn(`CRM rate limit exceeded`);
          return { success: false, reason: 'CRM rate limit exceeded', recoverable: true };
        } else if (response.status >= 500) {
          console.warn(`CRM server error (${response.status})`);
          return { success: false, reason: `CRM server error: ${response.status}`, recoverable: true };
        }

        throw new Error(`CRM API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json() as CRMApiResponse;
      console.log(`Successfully sent to CRM: ${payload.name}`, {
        contactId: result.id,
        amount: payload.amount
      });

      return { success: true, contactId: result.id };
    });

  } catch (error) {
    // Handle circuit breaker open state
    if (error instanceof Error && error.message.includes('Circuit breaker is OPEN')) {
      console.warn('CRM circuit breaker is open - skipping integration', {
        circuitBreakerStatus: crmCircuitBreaker.getStatus()
      });
      return { success: false, reason: 'Circuit breaker open', recoverable: true };
    }

    // Categorize errors
    let recoverable = true;
    let reason = 'Unknown error';

    if (error instanceof Error) {
      reason = error.message;

      if (error.message.includes('authentication') || error.message.includes('401')) {
        recoverable = false;
      } else if (error.message.includes('timed out') || error.message.includes('network')) {
        recoverable = true;
      }
    }

    console.error('CRM integration error', {
      error: reason,
      recoverable,
      circuitBreakerStatus: crmCircuitBreaker.getStatus()
    });

    return {
      success: false,
      reason,
      recoverable
    };
  }
}

/**
 * Main handler
 */
export default async (request: Request): Promise<Response> => {
  // CORS headers
  const allowedOrigins = [
    'https://jucanamaximiliano.com.br',
    'https://www.jucanamaximiliano.com.br',
    'http://localhost:8080',
    'http://localhost:8888',
    'https://netlify.app'
  ];

  const origin = request.headers.get('origin');
  const isAllowedOrigin = allowedOrigins.some(allowed =>
    origin === allowed || (allowed.includes('netlify.app') && origin?.includes('netlify.app'))
  );

  // Get client IP for rate limiting
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   request.headers.get('x-real-ip') ||
                   request.headers.get('cf-connecting-ip') ||
                   'unknown';

  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? (origin || 'https://jucanamaximiliano.com.br') : 'https://jucanamaximiliano.com.br',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }

  // Check rate limit
  const rateLimitResult = checkRateLimit(clientIP);

  if (!rateLimitResult.allowed) {
    headers['Retry-After'] = rateLimitResult.retryAfter?.toString() || '60';
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded',
      retryAfter: rateLimitResult.retryAfter
    }), {
      status: 429,
      headers
    });
  }

  try {
    // Parse request body
    let requestBody: unknown;
    try {
      const body = await request.text();
      requestBody = JSON.parse(body || '{}');
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers
      });
    }

    // Validate request (type assertion is safe here as validation handles unknown input)
    const validation = validateCRMRequest(requestBody as UnvalidatedCRMRequest);

    if (!validation.isValid) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: validation.errors
      }), {
        status: 400,
        headers
      });
    }

    const sanitized = validation.sanitized!;

    // Use exact payload structure as received (already contains all required fields)
    const crmPayload: CRMContactPayload = {
      company_id: sanitized.company_id || CRM_CONFIG.companyId,
      board_id: sanitized.board_id || CRM_CONFIG.boardId,
      column_id: sanitized.column_id || CRM_CONFIG.columnId,
      name: sanitized.name,
      phone: sanitized.phone,
      title: sanitized.title,
      amount: sanitized.amount,
      obs: sanitized.obs,
      contact_tags: sanitized.contact_tags
    };

    // Send to CRM
    const crmResult = await sendToCRM(crmPayload);

    // Log the attempt
    console.log(`CRM integration attempt for ${sanitized.name}`, {
      success: crmResult.success,
      amount: sanitized.amount
    });

    // Always return success to not block checkout
    return new Response(JSON.stringify({
      success: true,
      crm: {
        success: crmResult.success,
        contactId: crmResult.contactId,
        reason: crmResult.reason
      },
      circuitBreaker: crmCircuitBreaker.getStatus()
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('CRM handler error:', error);

    // Return success anyway to not block checkout
    return new Response(JSON.stringify({
      success: true,
      message: 'CRM integration attempted',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 200,
      headers
    });
  }
};