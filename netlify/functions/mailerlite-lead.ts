/**
 * Netlify Function: MailerLite Lead Capture
 * Captures leads from checkout forms and sends them to MailerLite
 * Works alongside Formspree to ensure complete lead capture
 */

import type {
  MailerLiteLeadRequest,
  MailerLiteSubscriberData,
  MailerLiteResult,
  ValidationResult,
  RateLimitResult,
  ValidationRules,
  TimeoutPromise
} from './types';

/**
 * MailerLite API response interfaces
 */
interface MailerLiteApiResponse {
  data?: {
    id?: string;
    [key: string]: unknown;
  };
  message?: string;
  errors?: Record<string, unknown>;
  [key: string]: unknown;
}

interface MailerLiteErrorResponse {
  message?: string;
  errors?: Record<string, unknown>;
  [key: string]: unknown;
}

// Rate limiting interface for MailerLite
interface MailerLiteRateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

// Timeout configuration
const TIMEOUTS = {
  mailerlite_api: 15000,
  external_api: 10000,
  default: 8000
};

/**
 * Timeout wrapper for async operations
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation = 'Operation'): TimeoutPromise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operation} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
}

// Simple in-memory rate limiting store for lead capture with proper typing
const rateLimitStore = new Map<string, MailerLiteRateLimitEntry>();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 8; // Max 8 lead submissions per 10 minutes per IP

// MailerLite configuration
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;

// Validation schemas for lead data
const VALIDATION_RULES: ValidationRules = {
  required_fields: ['lead_id', 'full_name', 'email', 'phone'],
  email_regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone_regex: /^[+]?[0-9][\d\s\-()]{7,20}$/, 
  name_min_length: 2,
  name_max_length: 100,
  amount_min: 50,
  amount_max: 1000000,
  currency_allowed: ['eur', 'usd', 'gbp'],
  utm_params: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
};

/**
 * Circuit Breaker Pattern Implementation for MailerLite API
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
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
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
  
  getStatus() {
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

// Single circuit breaker instance for MailerLite API
const mailerliteCircuitBreaker = new CircuitBreaker('mailerlite-lead-api');

/**
 * Comprehensive input validation for lead data
 */
function validateLeadRequest(requestBody: MailerLiteLeadRequest): ValidationResult {
  const errors = [];
  
  // Check required fields
  for (const field of VALIDATION_RULES.required_fields) {
    if (!requestBody[field] || typeof requestBody[field] !== 'string' || !requestBody[field].trim()) {
      errors.push(`Missing or invalid required field: ${field}`);
    }
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  const { lead_id, full_name, email, phone } = requestBody;
  
  // Validate lead_id format
  if (!/^[a-zA-Z0-9\-_]{8,}$/.test(lead_id.trim())) {
    errors.push('Invalid lead_id format');
  }
  
  // Validate full name
  const cleanName = full_name.trim();
  if (cleanName.length < VALIDATION_RULES.name_min_length || cleanName.length > VALIDATION_RULES.name_max_length) {
    errors.push(`Name must be between ${VALIDATION_RULES.name_min_length} and ${VALIDATION_RULES.name_max_length} characters`);
  }
  
  if (!/^[a-zA-ZÀ-ÿ\u0100-\u017F\s\-'.]+$/.test(cleanName)) {
    errors.push('Name contains invalid characters');
  }
  
  // Validate email
  const cleanEmail = email.toLowerCase().trim();
  if (!VALIDATION_RULES.email_regex.test(cleanEmail)) {
    errors.push('Invalid email format');
  }
  
  if (cleanEmail.length > 254) {
    errors.push('Email address too long');
  }
  
  // Validate phone - clean and check
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    errors.push('Phone number must be between 7 and 15 digits');
  } else if (!/^[+]?[0-9]+$/.test(cleanPhone)) {
    errors.push('Phone number contains invalid characters');
  }
  
  // Validate UTM parameters if present
  for (const utmParam of VALIDATION_RULES.utm_params) {
    if (requestBody[utmParam] && (typeof requestBody[utmParam] !== 'string' || requestBody[utmParam].length > 255)) {
      errors.push(`Invalid ${utmParam}: must be string under 255 characters`);
    }
  }
  
  // Check for suspicious patterns (basic XSS/injection prevention)
  const suspiciousPatterns = [/<script/i, /javascript:/i, /on\w+=/i, /\bselect\b.*\bfrom\b/i];
  const allStringValues = [full_name, email, phone, ...(requestBody.utm_source ? [requestBody.utm_source] : [])];
  
  for (const value of allStringValues) {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(value)) {
        errors.push('Request contains potentially malicious content');
        break;
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      lead_id: lead_id.trim(),
      full_name: cleanName,
      email: cleanEmail,
      phone: phone.trim(),
      amount: 18000,
      currency: 'eur'
    }
  };
}

/**
 * Rate limiting middleware for lead capture
 */
function checkRateLimit(clientIP: string): RateLimitResult {
  const now = Date.now();
  const key = `leadlimit:${clientIP}`;
  
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
    retryAfter: allowed ? null : Math.ceil((record.firstRequest + RATE_LIMIT_WINDOW - now) / 1000)
  };
}

// MailerLite result types are now defined in types.ts

/**
 * Add lead to MailerLite with comprehensive error handling
 */
async function addLeadToMailerLite(leadData: MailerLiteSubscriberData): Promise<MailerLiteResult> {
  if (!MAILERLITE_API_KEY) {
    console.warn('MailerLite API key not configured - skipping lead integration');
    return { success: false, reason: 'API key not configured' };
  }

  try {
    return await mailerliteCircuitBreaker.execute(async () => {
      const response = await withTimeout(
        fetch('https://connect.mailerlite.com/api/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${MAILERLITE_API_KEY}`
          },
          body: JSON.stringify({
            email: leadData.email,
            name: leadData.name,
            phone: leadData.phone,
            fields: leadData.fields,
            status: 'active'
          })
        }),
        TIMEOUTS.mailerlite_api,
        'MailerLite lead submission'
      );

      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle specific MailerLite error cases
        if (response.status === 422) {
          // Validation error or subscriber already exists
          try {
            const errorData = JSON.parse(errorText) as MailerLiteErrorResponse;
            if (errorData.message?.includes('already exists')) {
              console.log(`Lead already exists in MailerLite: ${leadData.email}`);
              return { success: true, reason: 'Lead already exists', action: 'skipped' };
            }
            // Handle other validation errors more gracefully
            if (errorData.errors) {
              console.warn(`MailerLite validation errors for ${leadData.email}:`, errorData.errors);
              return { success: false, reason: `Validation error: ${JSON.stringify(errorData.errors)}`, recoverable: true };
            }
          } catch {
            console.warn(`Could not parse MailerLite 422 error response: ${errorText}`);
          }
        } else if (response.status === 401) {
          // Authentication error - not recoverable
          console.error('MailerLite authentication failed - check API key');
          return { success: false, reason: 'Authentication failed', recoverable: false };
        } else if (response.status === 429) {
          // Rate limited by MailerLite - recoverable
          console.warn(`MailerLite rate limit exceeded for ${leadData.email}`);
          return { success: false, reason: 'MailerLite rate limit exceeded', recoverable: true };
        } else if (response.status >= 500) {
          // Server error - recoverable
          console.warn(`MailerLite server error (${response.status}) for ${leadData.email}`);
          return { success: false, reason: `MailerLite server error: ${response.status}`, recoverable: true };
        }
        
        throw new Error(`MailerLite API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json() as MailerLiteApiResponse;
      console.log(`Successfully added lead to MailerLite: ${leadData.email}`, {
        email: leadData.email,
        subscriberId: result.data?.id
      });
      
      return { success: true, subscriberId: result.data?.id, action: 'created' };
    });

  } catch (error) {
    // Handle circuit breaker open state gracefully
    if (error instanceof Error && error.message.includes('Circuit breaker is OPEN')) {
      console.warn('MailerLite circuit breaker is open - skipping lead integration', {
        email: leadData.email,
        circuitBreakerStatus: mailerliteCircuitBreaker.getStatus()
      });
      return { success: false, reason: 'Circuit breaker open', recoverable: true };
    }
    
    // Enhanced error categorization
    let recoverable = true;
    let reason = 'Unknown error';
    
    if (error instanceof Error) {
      reason = error.message;
      
      // Categorize errors for better handling
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        recoverable = false; // Configuration errors are not recoverable
      } else if (error.message.includes('timed out') || error.message.includes('network')) {
        recoverable = true; // Network/timeout errors can be retried
      } else if (error.message.includes('fetch')) {
        recoverable = true; // Fetch failures are typically recoverable
      }
    }
    
    console.error('MailerLite integration error', {
      error: reason,
      email: leadData.email,
      recoverable,
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      circuitBreakerStatus: mailerliteCircuitBreaker.getStatus()
    });
    
    return { 
      success: false, 
      reason,
      recoverable
    };
  }
}

/**
 * Main handler for lead capture requests
 */
export default async (request: Request): Promise<Response> => {
  // Set CORS headers with proper domain restrictions
  const allowedOrigins = [
    'https://jucanamaximiliano.com',
    'https://www.jucanamaximiliano.com',
    'http://localhost:8080',
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
  
  const headers = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? (origin || 'https://cafecomvendas.com') : 'https://cafecomvendas.com',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'false',
    'Content-Type': 'application/json'
  } as Record<string, string>;

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers
    });
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }
  
  // Check rate limit
  const rateLimitResult = checkRateLimit(clientIP);
  
  // Add rate limit headers - create mutable headers object
  const responseHeaders = { ...headers };
  responseHeaders['X-RateLimit-Limit'] = RATE_LIMIT_MAX_REQUESTS.toString();
  responseHeaders['X-RateLimit-Remaining'] = rateLimitResult.remaining.toString();
  responseHeaders['X-RateLimit-Window'] = (RATE_LIMIT_WINDOW / 1000).toString();
  
  if (!rateLimitResult.allowed) {
    responseHeaders['Retry-After'] = rateLimitResult.retryAfter?.toString() || '60';
    return new Response(JSON.stringify({ 
      error: 'Rate limit exceeded. Too many lead submissions.',
      retryAfter: rateLimitResult.retryAfter,
      message: `Maximum ${RATE_LIMIT_MAX_REQUESTS} lead submissions per ${RATE_LIMIT_WINDOW / 60000} minutes.`
    }), {
      status: 429,
      headers: responseHeaders
    });
  }

  try {
    // Parse request body
    let requestBody: MailerLiteLeadRequest;
    try {
      const body = await request.text();
      requestBody = JSON.parse(body || '{}') as MailerLiteLeadRequest;
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: responseHeaders
      });
    }

    // Comprehensive request validation
    const validation = validateLeadRequest(requestBody);
    
    if (!validation.isValid) {
      return new Response(JSON.stringify({ 
        error: 'Validation failed',
        details: validation.errors
      }), {
        status: 400,
        headers: responseHeaders
      });
    }
    
    // Use sanitized data
    const { lead_id, full_name, email, phone } = validation.sanitized!;

    // Prepare lead data for MailerLite
    const leadData = {
      email: email,
      name: full_name,
      phone: phone,
      fields: {
        lead_id: lead_id,
        payment_status: 'lead',
        lead_date: new Date().toISOString(),
        source: 'checkout_form',
        event_name: 'Café com Vendas - Lisboa',
        event_date: '2024-09-20',
        page: requestBody.page || 'unknown',
        user_agent: request.headers.get('user-agent')?.substring(0, 255) || 'unknown'
      } as Record<string, string | number | null>
    };
    
    // Add validated UTM parameters
    for (const utmParam of VALIDATION_RULES.utm_params) {
      if (requestBody[utmParam] && typeof requestBody[utmParam] === 'string') {
        leadData.fields[utmParam] = requestBody[utmParam].trim().substring(0, 255);
      }
    }

    // Submit lead to MailerLite
    const mailerliteResult = await addLeadToMailerLite(leadData);
    
    // Log the attempt for monitoring
    console.log(`Lead capture attempt for ${email}`, {
      leadId: lead_id,
      clientIP: clientIP,
      success: mailerliteResult.success,
      action: mailerliteResult.success ? mailerliteResult.action : 'failed',
      reason: mailerliteResult.reason
    });

    // Return success response regardless of MailerLite result 
    // (this is a secondary capture, primary is Formspree)
    return new Response(JSON.stringify({
      success: true,
      leadId: lead_id,
      email: email,
      mailerlite: {
        success: mailerliteResult.success,
        action: mailerliteResult.success ? mailerliteResult.action : 'attempted',
        reason: mailerliteResult.reason,
        recoverable: !mailerliteResult.success && 'recoverable' in mailerliteResult ? (mailerliteResult.recoverable ?? false) : false
      },
      circuitBreaker: mailerliteCircuitBreaker.getStatus()
    }), {
      status: 200,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('Lead capture handler error:', error);

    // Handle timeout errors
    if (error instanceof Error && error.message?.includes('timed out')) {
      return new Response(JSON.stringify({ 
        error: 'Request timed out. Please try again.',
        code: 'request_timeout'
      }), {
        status: 504,
        headers: responseHeaders
      });
    }

    // Generic error response
    return new Response(JSON.stringify({ 
      error: 'Internal server error. Lead capture failed.',
      message: 'This is a secondary lead capture. Primary submission may have succeeded.'
    }), {
      status: 500,
      headers: responseHeaders
    });
  }
};