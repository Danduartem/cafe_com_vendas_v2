/**
 * Netlify Function: Create Stripe Payment Intent
 * Securely creates a PaymentIntent with customer metadata for Café com Vendas
 */

import Stripe from 'stripe';
import type {
  PaymentIntentRequest,
  ValidationResult,
  RateLimitResult,
  ValidationRules,
  TimeoutPromise,
  PaymentIntentMetadata
} from './types';

/**
 * Cache and rate limiting interfaces following TypeScript best practices
 */
interface CustomerCacheEntry {
  customer: Stripe.Customer;
  timestamp: number;
  lastAccessed: number;
}

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

// Initialize Stripe with secret key and timeout configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  timeout: 30000, // 30 second timeout for Stripe API calls
  maxNetworkRetries: 2
});

// Timeout configuration
const TIMEOUTS = {
  stripe_api: 30000,
  external_api: 15000,
  default: 10000
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

// Simple in-memory rate limiting store with proper typing
// In production, consider using Redis or another persistent store
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limiting configuration - different for development vs production
const PRODUCTION_RATE_LIMIT = {
  window: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // Max 5 payment attempts per 15 minutes per IP
};

const DEVELOPMENT_RATE_LIMIT = {
  window: 5 * 60 * 1000, // 5 minutes
  maxRequests: 20 // Max 20 payment attempts per 5 minutes per IP for testing
};

// Helper function to determine if request is from development environment
function isDevelopmentRequest(origin: string | undefined): boolean {
  if (!origin) return false;
  return origin.includes('localhost') || origin.includes('127.0.0.1');
}

// Get rate limit configuration based on environment
function getRateLimitConfig(origin: string | undefined) {
  return isDevelopmentRequest(origin) ? DEVELOPMENT_RATE_LIMIT : PRODUCTION_RATE_LIMIT;
}

// Customer caching to reduce Stripe API calls with proper typing
const customerCache = new Map<string, CustomerCacheEntry>();
const CUSTOMER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_SIZE = 1000; // Maximum number of cached customers

/**
 * Customer cache management
 */
class CustomerCacheManager {
  static cleanExpiredEntries() {
    const now = Date.now();
    for (const [email, entry] of customerCache.entries()) {
      if (now - entry.timestamp > CUSTOMER_CACHE_TTL) {
        customerCache.delete(email);
      }
    }
  }
  
  static evictOldestIfNeeded() {
    if (customerCache.size >= MAX_CACHE_SIZE) {
      // Remove oldest 10% of entries
      const entries = Array.from(customerCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = Math.floor(MAX_CACHE_SIZE * 0.1);
      for (let i = 0; i < toRemove && i < entries.length; i++) {
        customerCache.delete(entries[i][0]);
      }
    }
  }
  
  static get(email: string): Stripe.Customer | null {
    const entry = customerCache.get(email);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > CUSTOMER_CACHE_TTL) {
      customerCache.delete(email);
      return null;
    }
    
    // Update access time for LRU behavior
    entry.lastAccessed = now;
    return entry.customer;
  }
  
  static set(email: string, customer: Stripe.Customer): void {
    this.cleanExpiredEntries();
    this.evictOldestIfNeeded();
    
    customerCache.set(email, {
      customer,
      timestamp: Date.now(),
      lastAccessed: Date.now()
    });
  }
  
  static invalidate(email: string): void {
    customerCache.delete(email);
  }
  
  static getStats() {
    return {
      size: customerCache.size,
      maxSize: MAX_CACHE_SIZE,
      ttl: CUSTOMER_CACHE_TTL
    };
  }
}

// Validation schemas
const VALIDATION_RULES: ValidationRules = {
  required_fields: ['lead_id', 'full_name', 'email', 'phone'],
  email_regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone_regex: /^[+]?[0-9][\d\s\-()]{7,20}$/, // International format with spaces/dashes allowed
  name_min_length: 2,
  name_max_length: 100,
  amount_min: 50, // 50 cents minimum
  amount_max: 1000000, // €10,000 maximum
  currency_allowed: ['eur', 'usd', 'gbp'],
  utm_params: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
};

/**
 * Comprehensive input validation middleware
 */
function validatePaymentRequest(requestBody: PaymentIntentRequest): ValidationResult {
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
  
  const { lead_id, full_name, email, phone, amount, currency = 'eur' } = requestBody;
  
  // Validate lead_id format (UUID-like)
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
  
  // Check if it has at least 7 digits and starts with + or digit
  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    errors.push('Phone number must be between 7 and 15 digits');
  } else if (!/^[+]?[0-9]+$/.test(cleanPhone)) {
    errors.push('Phone number contains invalid characters');
  }
  
  // Validate amount if provided
  if (amount !== undefined) {
    const numAmount = parseInt(amount.toString());
    if (isNaN(numAmount) || numAmount < VALIDATION_RULES.amount_min || numAmount > VALIDATION_RULES.amount_max) {
      errors.push(`Amount must be between ${VALIDATION_RULES.amount_min} and ${VALIDATION_RULES.amount_max} cents`);
    }
  }
  
  // Validate currency
  if (!VALIDATION_RULES.currency_allowed.includes(currency.toLowerCase())) {
    errors.push(`Currency must be one of: ${VALIDATION_RULES.currency_allowed.join(', ')}`);
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
      phone: phone.trim(), // Keep original format for display
      amount: amount ? parseInt(amount.toString()) : 18000,
      currency: currency.toLowerCase()
    }
  };
}

/**
 * Rate limiting middleware with environment-aware configuration
 */
function checkRateLimit(clientIP: string, origin: string | undefined): RateLimitResult {
  const now = Date.now();
  const key = `ratelimit:${clientIP}`;
  const rateLimitConfig = getRateLimitConfig(origin);
  const isDev = isDevelopmentRequest(origin);
  
  // Clean up old entries
  if (rateLimitStore.size > 1000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now - v.firstRequest > rateLimitConfig.window) {
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
    
    // Log rate limit info for development
    if (isDev) {
      console.log(`[DEV] Rate limit initialized for ${clientIP}: ${rateLimitConfig.maxRequests} requests per ${rateLimitConfig.window / 60000} minutes`);
    }
    
    return { allowed: true, remaining: rateLimitConfig.maxRequests - 1 };
  }
  
  // Reset if window has passed
  if (now - record.firstRequest > rateLimitConfig.window) {
    rateLimitStore.set(key, {
      count: 1,
      firstRequest: now,
      lastRequest: now
    });
    
    if (isDev) {
      console.log(`[DEV] Rate limit window reset for ${clientIP}`);
    }
    
    return { allowed: true, remaining: rateLimitConfig.maxRequests - 1 };
  }
  
  // Increment counter
  record.count++;
  record.lastRequest = now;
  rateLimitStore.set(key, record);
  
  const remaining = Math.max(0, rateLimitConfig.maxRequests - record.count);
  const allowed = record.count <= rateLimitConfig.maxRequests;
  
  // Log rate limit status for development
  if (isDev) {
    console.log(`[DEV] Rate limit check for ${clientIP}: ${record.count}/${rateLimitConfig.maxRequests}, remaining: ${remaining}, allowed: ${allowed}`);
  }
  
  return { 
    allowed, 
    remaining,
    retryAfter: allowed ? null : Math.ceil((record.firstRequest + rateLimitConfig.window - now) / 1000)
  };
}

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
    'Access-Control-Allow-Origin': isAllowedOrigin ? (origin || 'https://jucanamaximiliano.com.br') : 'https://jucanamaximiliano.com.br',
    'Access-Control-Allow-Headers': 'Content-Type, X-Idempotency-Key',
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
  
  // Check rate limit with environment-aware configuration
  const rateLimitResult = checkRateLimit(clientIP, origin || undefined);
  const rateLimitConfig = getRateLimitConfig(origin || undefined);
  
  // Add rate limit headers - create mutable headers object
  const responseHeaders = { ...headers };
  responseHeaders['X-RateLimit-Limit'] = rateLimitConfig.maxRequests.toString();
  responseHeaders['X-RateLimit-Remaining'] = rateLimitResult.remaining.toString();
  responseHeaders['X-RateLimit-Window'] = (rateLimitConfig.window / 1000).toString();
  responseHeaders['X-RateLimit-Environment'] = isDevelopmentRequest(origin || undefined) ? 'development' : 'production';
  
  if (!rateLimitResult.allowed) {
    responseHeaders['Retry-After'] = rateLimitResult.retryAfter?.toString() || '60';
    return new Response(JSON.stringify({ 
      error: 'Rate limit exceeded. Too many payment attempts.',
      retryAfter: rateLimitResult.retryAfter,
      message: `Maximum ${rateLimitConfig.maxRequests} payment attempts per ${rateLimitConfig.window / 60000} minutes.`,
      environment: isDevelopmentRequest(origin || undefined) ? 'development' : 'production'
    }), {
      status: 429,
      headers: responseHeaders
    });
  }

  try {
    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }

    // Parse request body
    let requestBody: PaymentIntentRequest;
    try {
      const body = await request.text();
      requestBody = JSON.parse(body || '{}') as PaymentIntentRequest;
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: responseHeaders
      });
    }

    // Generate or use provided idempotency key
    const idempotencyKey = request.headers.get('x-idempotency-key') || 
      requestBody.idempotency_key || 
      `pi_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    // Comprehensive request validation
    const validation = validatePaymentRequest(requestBody);
    
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
    const { lead_id, full_name, email, phone, amount: paymentAmount, currency } = validation.sanitized!;

    // Create or retrieve customer with validated data
    const customerData = {
      email,
      name: full_name,
      phone,
      metadata: {
        lead_id,
        source: 'cafe_com_vendas_checkout',
        created_at: new Date().toISOString(),
        validation_passed: 'true'
      }
    };

    let customer;
    let cacheHit = false;
    
    try {
      // First, check cache for existing customer
      customer = CustomerCacheManager.get(customerData.email);
      
      if (customer) {
        cacheHit = true;
        console.log(`Customer cache hit for ${customerData.email}`);
        
        // Update customer with latest information if data has changed
        const needsUpdate = 
          customer.name !== customerData.name ||
          customer.phone !== customerData.phone;
          
        if (needsUpdate) {
          customer = await withTimeout(
            stripe.customers.update(customer.id, {
              name: customerData.name,
              phone: customerData.phone,
              metadata: {
                ...customer.metadata,
                ...customerData.metadata,
                updated_at: new Date().toISOString()
              }
            }),
            TIMEOUTS.stripe_api,
            'Customer update'
          );
          
          // Update cache with new customer data
          CustomerCacheManager.set(customerData.email, customer);
        }
      } else {
        console.log(`Customer cache miss for ${customerData.email}, querying Stripe`);
        
        // Try to find existing customer by email with timeout
        const existingCustomers = await withTimeout(
          stripe.customers.list({
            email: customerData.email,
            limit: 1
          }),
          TIMEOUTS.stripe_api,
          'Customer lookup'
        );

        if (existingCustomers.data.length > 0) {
          customer = existingCustomers.data[0];
          
          // Update customer with latest information
          customer = await withTimeout(
            stripe.customers.update(customer.id, {
              name: customerData.name,
              phone: customerData.phone,
              metadata: {
                ...customer.metadata,
                ...customerData.metadata,
                updated_at: new Date().toISOString()
              }
            }),
            TIMEOUTS.stripe_api,
            'Customer update'
          );
        } else {
          // Create new customer
          customer = await withTimeout(
            stripe.customers.create(customerData),
            TIMEOUTS.stripe_api,
            'Customer creation'
          );
        }
        
        // Cache the customer for future requests
        CustomerCacheManager.set(customerData.email, customer);
      }
    } catch (error) {
      console.error('Error managing customer:', error);
      
      // Handle timeout specifically
      if (error instanceof Error && error.message.includes('timed out')) {
        return new Response(JSON.stringify({ 
          error: 'Customer service temporarily unavailable. Please try again.',
          code: 'service_timeout'
        }), {
          status: 504,
          headers: responseHeaders
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Error processing customer information' 
      }), {
        status: 500,
        headers: responseHeaders
      });
    }

    // Prepare metadata for PaymentIntent with validated UTM parameters
    const metadata: PaymentIntentMetadata = {
      lead_id,
      customer_name: full_name,
      customer_email: email,
      customer_phone: phone.trim(),
      event_name: 'Café com Vendas - Lisboa',
      event_date: '2024-09-20',
      spot_type: 'first_lot_early_bird',
      source: 'checkout_modal',
      created_at: new Date().toISOString(),
      validation_version: '1.0',
      idempotency_key: idempotencyKey
    };
    
    // Add validated UTM parameters
    for (const utmParam of VALIDATION_RULES.utm_params) {
      if (requestBody[utmParam] && typeof requestBody[utmParam] === 'string') {
        metadata[utmParam] = requestBody[utmParam].trim().substring(0, 255);
      }
    }

    // Create PaymentIntent with idempotency key and timeout
    const paymentIntent = await withTimeout(
      stripe.paymentIntents.create({
        amount: paymentAmount,
        currency: currency,
        customer: customer.id,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'always'
        },
        // Payment method configuration for European market
        payment_method_configuration: undefined, // Use account default configuration
        metadata: {
          ...metadata,
          idempotency_key: idempotencyKey
        },
        description: `Café com Vendas - Lisboa: ${full_name}`,
        receipt_email: email,
        // Payment method options for different payment types
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic',
            setup_future_usage: 'off_session'
          },
          sepa_debit: {
            setup_future_usage: 'off_session'
          },
          ideal: {
            setup_future_usage: 'off_session'
          },
          bancontact: {
            setup_future_usage: 'off_session'
          }
        }
      }, {
        idempotencyKey: idempotencyKey
      }),
      TIMEOUTS.stripe_api,
      'PaymentIntent creation'
    );

    console.log(`Created PaymentIntent ${paymentIntent.id} for customer ${customer.email}`);
    
    // Log cache performance for monitoring
    const cacheStats = CustomerCacheManager.getStats();
    console.log(`Customer cache stats: ${JSON.stringify(cacheStats)}, Cache hit: ${cacheHit}`);

    // Return success response with client secret and idempotency info
    return new Response(JSON.stringify({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId: customer.id,
      amount: paymentAmount,
      currency: currency,
      idempotencyKey: idempotencyKey,
      cacheHit: cacheHit // For debugging/monitoring
    }), {
      status: 200,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);

    // Handle specific Stripe errors using proper type guards
    if (error instanceof Stripe.errors.StripeCardError) {
      return new Response(JSON.stringify({ 
        error: 'Card error: ' + error.message 
      }), {
        status: 400,
        headers: responseHeaders
      });
    }

    if (error instanceof Stripe.errors.StripeRateLimitError) {
      return new Response(JSON.stringify({ 
        error: 'Too many requests. Please try again later.' 
      }), {
        status: 429,
        headers: responseHeaders
      });
    }

    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      // Handle idempotency key conflicts specifically
      if (error instanceof Error && error.message?.includes('idempotency')) {
        return new Response(JSON.stringify({ 
          error: 'Duplicate request detected. Please try again with a new request.',
          code: 'idempotency_conflict'
        }), {
          status: 409,
          headers: responseHeaders
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Invalid request: ' + error.message 
      }), {
        status: 400,
        headers: responseHeaders
      });
    }

    if (error instanceof Stripe.errors.StripeAPIError) {
      return new Response(JSON.stringify({ 
        error: 'Payment service temporarily unavailable' 
      }), {
        status: 500,
        headers: responseHeaders
      });
    }

    if (error instanceof Stripe.errors.StripeConnectionError) {
      return new Response(JSON.stringify({ 
        error: 'Network error. Please try again.' 
      }), {
        status: 500,
        headers: responseHeaders
      });
    }

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
      error: 'Internal server error. Please try again later.' 
    }), {
      status: 500,
      headers: responseHeaders
    });
  }
};