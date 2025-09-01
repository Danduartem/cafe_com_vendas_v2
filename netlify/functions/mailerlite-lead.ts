/**
 * Netlify Function: MailerLite Lead Capture
 * Captures leads from checkout forms and sends them to MailerLite
 * Primary lead capture system for the application
 */

// Enhanced MailerLite integration with event-driven lifecycle management
import type {
  MailerLiteLeadRequest,
  MailerLiteResult,
  MailerLiteSuccess,
  ValidationResult,
  RateLimitResult,
  ValidationRules,
  EventCustomFields,
  EventSubscriberData
} from './types';

// Import enhanced tracking types for Phase 1
import type {
  EnhancedMailerLitePayload,
  EnhancedCRMPayload,
  UnifiedLeadCaptureResponse
} from '../../src/types/enhanced-tracking.js';

// Import CRM integration
import type {
  CRMContactPayload,
  CRMResult
} from './crm-types';

// Import the new constants (values, not types)
import {
  MAILERLITE_EVENT_GROUPS,
  MAILERLITE_CUSTOM_FIELDS,
  EVENT_DATE,
  EVENT_ADDRESS,
  GOOGLE_MAPS_LINK
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

// Simple in-memory rate limiting store for lead capture with proper typing
const rateLimitStore = new Map<string, MailerLiteRateLimitEntry>();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 8; // Max 8 lead submissions per 10 minutes per IP

// MailerLite configuration with event-driven lifecycle groups
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;

// Event-specific Group Names (will be resolved to IDs)
// Following naming convention: ccv-2025-09-20_lifecycle_state
const EVENT_GROUPS = MAILERLITE_EVENT_GROUPS;

// Direct Group ID mapping to actual MailerLite groups
// IMPORTANT: Group IDs MUST remain as strings to avoid JavaScript precision loss
// These are the actual group IDs from your MailerLite account
const GROUP_ID_MAPPING: Record<string, string> = {
  [EVENT_GROUPS.CHECKOUT_STARTED]: process.env.MAILERLITE_CHECKOUT_STARTED_GROUP_ID || '164084418309260989',
  [EVENT_GROUPS.BUYER_PENDING]: process.env.MAILERLITE_BUYER_PENDING_GROUP_ID || '164084419130295829',
  [EVENT_GROUPS.BUYER_PAID]: process.env.MAILERLITE_BUYER_PAID_GROUP_ID || '164084419571745998',
  [EVENT_GROUPS.DETAILS_PENDING]: process.env.MAILERLITE_DETAILS_PENDING_GROUP_ID || '164084420038362902',
  [EVENT_GROUPS.DETAILS_COMPLETE]: process.env.MAILERLITE_DETAILS_COMPLETE_GROUP_ID || '164084420444161819',
  [EVENT_GROUPS.ATTENDED]: process.env.MAILERLITE_ATTENDED_GROUP_ID || '164084420929652588',
  [EVENT_GROUPS.NO_SHOW]: process.env.MAILERLITE_NO_SHOW_GROUP_ID || '164084421314479574',
  [EVENT_GROUPS.ABANDONED_PAYMENT]: process.env.MAILERLITE_ABANDONED_PAYMENT_GROUP_ID || '164084418758051029'
};

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

// Enhanced field mapping for MailerLite custom fields
const MAILERLITE_FIELD_MAPPING = {
  // Core fields (direct mapping)
  preferred_language: 'language',
  city: 'city',
  country: 'country',
  timezone: 'timezone',
  
  // Business profile
  business_stage: 'business_stage',
  business_type: 'business_type', 
  primary_goal: 'primary_goal',
  main_challenge: 'main_challenge',
  
  // Intent & lifecycle
  event_interest: 'event_interest',
  intent_signal: 'intent_signal',
  lead_score: 'lead_score',
  signup_page: 'signup_page',
  referrer_domain: 'referrer_domain',
  
  // Attribution (first touch)
  first_utm_source: 'first_utm_source',
  first_utm_campaign: 'first_utm_campaign',
  referrer: 'referrer',
  landing_page: 'landing_page',
  
  // Device & browser
  device_type: 'device_type',
  device_brand: 'device_brand', 
  browser_name: 'browser_name',
  browser_version: 'browser_version',
  screen_resolution: 'screen_resolution',
  viewport_size: 'viewport_size',
  
  // Behavioral data
  time_on_page: 'time_on_page',
  scroll_depth: 'scroll_depth',
  sections_viewed: 'sections_viewed',
  page_views: 'page_views',
  is_returning_visitor: 'is_returning_visitor',
  session_duration: 'session_duration'
} as const;

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
  
  const { lead_id, full_name, email, phone, event_id, user_session_id } = requestBody;
  
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
      event_id: typeof event_id === 'string' ? event_id : '',
      user_session_id: typeof user_session_id === 'string' ? user_session_id : '',
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
 * Send contact to CRM with enhanced event tracking
 * Integrated from the CRM function for Phase 1 implementation
 */
async function sendToCRM(payload: EnhancedCRMPayload): Promise<CRMResult> {
  const CRM_CONFIG = {
    companyId: process.env.CRM_COMPANY_ID || '',
    boardId: process.env.CRM_BOARD_ID || '',
    columnId: process.env.CRM_COLUMN_ID || '',
    apiUrl: process.env.CRM_API_URL || 'https://mocha-smoky.vercel.app/api/integrations/contact-card',
    apiKey: process.env.CRM_API_KEY // Optional
  };

  if (!CRM_CONFIG.companyId || !CRM_CONFIG.boardId || !CRM_CONFIG.columnId) {
    console.warn('CRM configuration incomplete - skipping CRM integration');
    return { success: false, reason: 'CRM not configured' };
  }

  // Map enhanced payload to CRM API format
  const crmPayload: CRMContactPayload = {
    company_id: CRM_CONFIG.companyId,
    board_id: CRM_CONFIG.boardId,
    column_id: CRM_CONFIG.columnId,
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    title: payload.title || payload.name,
    amount: payload.amount,
    obs: payload.obs || `Lead created via event tracking. Event ID: ${payload.event_id}`,
    contact_tags: payload.contact_tags || ['lead', 'cafe-com-vendas-2025']
  };

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (CRM_CONFIG.apiKey) {
      headers['Authorization'] = `Bearer ${CRM_CONFIG.apiKey}`;
    }

    const response = await withTimeout(
      fetch(CRM_CONFIG.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(crmPayload)
      }),
      TIMEOUTS.external_api,
      'CRM API call'
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`CRM API error (${response.status}) for ${payload.email}:`, errorText);
      
      // Handle specific error cases gracefully
      if (response.status === 409) {
        // Contact already exists in CRM - this is actually success for our use case
        console.log(`Contact already exists in CRM for ${payload.email} - treating as success`);
        
        // Try to extract existing contact ID from the error response
        try {
          const errorData = JSON.parse(errorText);
          const existingContactId = errorData.existing_card?.contact?.id;
          return { 
            success: true, 
            contactId: existingContactId, 
            reason: 'Contact already exists',
            action: 'skipped'
          };
        } catch {
          return { success: true, reason: 'Contact already exists', action: 'skipped' };
        }
      } else if (response.status === 429) {
        return { success: false, reason: 'CRM rate limit exceeded', recoverable: true };
      } else if (response.status >= 500) {
        return { success: false, reason: `CRM server error: ${response.status}`, recoverable: true };
      } else if (response.status === 401) {
        return { success: false, reason: 'CRM authentication failed', recoverable: false };
      }
      
      return { success: false, reason: `CRM API error: ${response.status}`, recoverable: true };
    }

    const result = await response.json() as { success: boolean; id?: string; message?: string };
    
    console.log(`Successfully sent to CRM: ${payload.email}`, {
      contactId: result.id,
      eventId: payload.event_id,
      stage: payload.contact_stage
    });

    return { success: true, contactId: result.id };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown CRM error';
    console.error('CRM integration error', {
      error: errorMessage,
      email: payload.email,
      eventId: payload.event_id
    });

    // Non-blocking: CRM failure shouldn't stop lead capture
    return {
      success: false,
      reason: errorMessage,
      recoverable: true
    };
  }
}

/**
 * Add lead to MailerLite with comprehensive error handling and enhanced fields
 */
async function addLeadToMailerLite(leadData: EnhancedMailerLitePayload): Promise<MailerLiteResult> {
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
            fields: {
              // Core contact info
              name: leadData.fields.name,
              last_name: leadData.fields.last_name,
              phone: leadData.fields.phone,
              company: leadData.fields.company,
              city: leadData.fields.city,
              country: leadData.fields.country,
              state: leadData.fields.state,
              zip: leadData.fields.zip,

              // Enhanced Phase 1 fields - Event tracking
              event_id: leadData.fields.event_id,
              user_session_id: leadData.fields.user_session_id,
              lead_created_at: leadData.fields.lead_created_at,
              checkout_started_at: leadData.fields.checkout_started_at,

              // Payment lifecycle
              payment_status: leadData.fields.payment_status,

              // Attribution data
              utm_source: leadData.fields.utm_source,
              utm_medium: leadData.fields.utm_medium,
              utm_campaign: leadData.fields.utm_campaign,
              utm_content: leadData.fields.utm_content,
              utm_term: leadData.fields.utm_term,
              first_utm_source: leadData.fields.first_utm_source,
              first_utm_campaign: leadData.fields.first_utm_campaign,
              referrer: leadData.fields.referrer,
              referrer_domain: leadData.fields.referrer_domain,
              landing_page: leadData.fields.landing_page,

              // Behavioral data
              time_on_page: leadData.fields.time_on_page,
              scroll_depth: leadData.fields.scroll_depth,
              sections_viewed: leadData.fields.sections_viewed,
              page_views: leadData.fields.page_views,
              is_returning_visitor: leadData.fields.is_returning_visitor,
              session_duration: leadData.fields.session_duration,

              // Device & browser
              device_type: leadData.fields.device_type,
              device_brand: leadData.fields.device_brand,
              browser_name: leadData.fields.browser_name,
              browser_version: leadData.fields.browser_version,
              screen_resolution: leadData.fields.screen_resolution,
              viewport_size: leadData.fields.viewport_size,

              // Business context
              preferred_language: leadData.fields.preferred_language,
              timezone: leadData.fields.timezone,
              event_interest: leadData.fields.event_interest,
              intent_signal: leadData.fields.intent_signal,
              lead_score: leadData.fields.lead_score,
              signup_page: leadData.fields.signup_page,

              // CRM integration
              crm_contact_id: leadData.fields.crm_contact_id,
              crm_deal_status: leadData.fields.crm_deal_status
            },
            groups: (leadData.groups || [GROUP_ID_MAPPING[EVENT_GROUPS.CHECKOUT_STARTED]]),
            status: leadData.status || 'active',
            subscribed_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
            ip_address: leadData.ip_address,
            opted_in_at: leadData.opted_in_at,
            optin_ip: leadData.optin_ip
          })
        }),
        TIMEOUTS.mailerlite_api,
        'MailerLite lead submission'
      );

      if (!response.ok) {
        const errorText = await response.text();
        
        // Enhanced error logging for debugging
        console.error('MailerLite API error response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText,
          email: leadData.email,
          requestUrl: 'https://connect.mailerlite.com/api/subscribers',
          requestGroups: leadData.groups || [GROUP_ID_MAPPING[EVENT_GROUPS.CHECKOUT_STARTED]]
        });
        
        // Handle specific MailerLite error cases
        if (response.status === 422) {
          // Validation error or subscriber already exists
          try {
            const errorData = JSON.parse(errorText) as MailerLiteErrorResponse;
            if (errorData.message?.includes('already exists')) {
              console.log(`Lead already exists in MailerLite: ${leadData.email}`);
              return { success: true, reason: 'Lead already exists', action: 'skipped' };
            }
            // Enhanced validation error handling with specific field details
            if (errorData.errors) {
              const errorDetails = Object.entries(errorData.errors).map(([field, messages]) => {
                const messageStr = Array.isArray(messages) 
                  ? messages.join(', ') 
                  : typeof messages === 'string' 
                    ? messages 
                    : JSON.stringify(messages);
                return `${field}: ${messageStr}`;
              }).join('; ');
              
              console.warn(`MailerLite validation errors for ${leadData.email}:`, {
                email: leadData.email,
                errors: errorData.errors,
                errorDetails,
                requestPayload: {
                  groups: (leadData.groups || [GROUP_ID_MAPPING[EVENT_GROUPS.CHECKOUT_STARTED]]),
                  subscribed_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
                  status: leadData.status || 'active'
                }
              });
              
              return { 
                success: false, 
                reason: `Validation failed: ${errorDetails}`, 
                recoverable: true 
              };
            }
          } catch (parseError) {
            console.warn(`Could not parse MailerLite 422 error response: ${errorText}`, {
              parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
            });
          }
        } else if (response.status === 400) {
          // Bad Request - often due to malformed data like invalid group IDs
          console.error(`MailerLite 400 Bad Request for ${leadData.email}:`, errorText);
          return { 
            success: false, 
            reason: `Bad request: ${errorText}. Check group IDs and field values.`, 
            recoverable: true 
          };
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
    'http://localhost:8080',   // Vite dev server
    'http://localhost:8888',   // Netlify dev server (for E2E testing)
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
    
    // Use sanitized data and extract enhanced tracking fields
    const { lead_id, full_name, email, phone } = validation.sanitized!;

    // Extract names
    const nameParts = full_name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Map request to Enhanced MailerLite Payload following 2025 best practices
    const enhancedMailerLitePayload: EnhancedMailerLitePayload = {
      email: email,
      fields: {
        // Basic contact info
        name: firstName,
        last_name: lastName,
        phone: phone,
        company: requestBody.company as string || undefined,
        city: requestBody.city as string || undefined,
        country: requestBody.country as string || undefined,
        state: requestBody.state as string || undefined,
        zip: requestBody.zip as string || undefined,

        // Enhanced event tracking fields
        event_id: requestBody.event_id as string || lead_id, // Use event_id from EventTracker
        user_session_id: requestBody.user_session_id as string || lead_id,
        lead_created_at: requestBody.lead_created_at as string || new Date().toISOString(),
        checkout_started_at: requestBody.checkout_started_at as string || new Date().toISOString(),

        // Payment lifecycle
        payment_status: 'lead' as const,

        // Attribution data (complete UTM tracking)
        utm_source: requestBody.utm_source as string || undefined,
        utm_medium: requestBody.utm_medium as string || undefined,
        utm_campaign: requestBody.utm_campaign as string || undefined,
        utm_content: requestBody.utm_content as string || undefined,
        utm_term: requestBody.utm_term as string || undefined,
        first_utm_source: requestBody.first_utm_source as string || requestBody.utm_source as string || undefined,
        first_utm_campaign: requestBody.first_utm_campaign as string || requestBody.utm_campaign as string || undefined,
        referrer: requestBody.referrer as string || undefined,
        referrer_domain: requestBody.referrer_domain as string || undefined,
        landing_page: requestBody.landing_page as string || '/',

        // Behavioral data
        time_on_page: requestBody.time_on_page as number || undefined,
        scroll_depth: requestBody.scroll_depth as number || undefined,
        sections_viewed: requestBody.sections_viewed as string || undefined,
        page_views: requestBody.page_views as number || undefined,
        is_returning_visitor: requestBody.is_returning_visitor as boolean || undefined,
        session_duration: requestBody.session_duration as number || undefined,

        // Device & browser
        device_type: requestBody.device_type as 'mobile' | 'tablet' | 'desktop' || undefined,
        device_brand: requestBody.device_brand as string || undefined,
        browser_name: requestBody.browser_name as string || undefined,
        browser_version: requestBody.browser_version as string || undefined,
        screen_resolution: requestBody.screen_resolution as string || undefined,
        viewport_size: requestBody.viewport_size as string || undefined,

        // Business context
        preferred_language: requestBody.preferred_language as string || undefined,
        timezone: requestBody.timezone as string || undefined,
        event_interest: `cafe_com_vendas_lisbon_2025-09-20`, // Event-specific
        intent_signal: requestBody.intent_signal as string || 'started_checkout',
        lead_score: requestBody.lead_score as number || undefined,
        signup_page: requestBody.signup_page as string || '/checkout',

        // CRM integration (will be populated after CRM call)
        crm_contact_id: undefined, // Will be set after CRM response
        crm_deal_status: 'lead' as const
      },
      groups: [GROUP_ID_MAPPING[EVENT_GROUPS.CHECKOUT_STARTED]],
      status: 'active' as const,
      subscribed_at: new Date().toISOString(),
      ip_address: clientIP !== 'unknown' ? clientIP : undefined
    };

    // Prepare CRM payload for Phase 1 integration
    const enhancedCRMPayload: EnhancedCRMPayload = {
      // Required CRM fields
      company_id: process.env.CRM_COMPANY_ID || '',
      board_id: process.env.CRM_BOARD_ID || '',
      column_id: process.env.CRM_COLUMN_ID || '',
      name: full_name,
      phone: phone,
      amount: '0', // Lead stage - no payment yet
      title: `Lead: ${full_name}`,

      // Event tracking
      event_id: enhancedMailerLitePayload.fields.event_id,
      user_session_id: enhancedMailerLitePayload.fields.user_session_id,

      // Contact lifecycle
      contact_stage: 'lead' as const,
      lead_created_at: enhancedMailerLitePayload.fields.lead_created_at,

      // Attribution data
      utm_source: enhancedMailerLitePayload.fields.utm_source,
      utm_medium: enhancedMailerLitePayload.fields.utm_medium,
      utm_campaign: enhancedMailerLitePayload.fields.utm_campaign,
      utm_content: enhancedMailerLitePayload.fields.utm_content,
      utm_term: enhancedMailerLitePayload.fields.utm_term,
      referrer_domain: enhancedMailerLitePayload.fields.referrer_domain,
      landing_page: enhancedMailerLitePayload.fields.landing_page,

      // Business context
      event_interest: enhancedMailerLitePayload.fields.event_interest,
      intent_signal: enhancedMailerLitePayload.fields.intent_signal || 'started_checkout',
      lead_score: enhancedMailerLitePayload.fields.lead_score,

      // Enhanced contact data
      email: email,
      contact_tags: ['lead', 'cafe-com-vendas-2025', 'checkout-started'],
      obs: `Lead captured via enhanced tracking. Event ID: ${enhancedMailerLitePayload.fields.event_id}`,

      // Device & behavior for lead scoring
      device_type: enhancedMailerLitePayload.fields.device_type,
      time_on_page: enhancedMailerLitePayload.fields.time_on_page,
      scroll_depth: enhancedMailerLitePayload.fields.scroll_depth,
      page_views: enhancedMailerLitePayload.fields.page_views,
      is_returning_visitor: enhancedMailerLitePayload.fields.is_returning_visitor
    };

    // Execute both MailerLite and CRM in parallel for better performance
    const [mailerliteResult, crmResult] = await Promise.allSettled([
      addLeadToMailerLite(enhancedMailerLitePayload),
      sendToCRM(enhancedCRMPayload)
    ]);

    // Process MailerLite result
    const mailerliteSuccess = mailerliteResult.status === 'fulfilled' ? mailerliteResult.value : 
      { success: false, reason: mailerliteResult.reason instanceof Error ? mailerliteResult.reason.message : 'MailerLite call failed' };

    // Process CRM result
    const crmSuccess = crmResult.status === 'fulfilled' ? crmResult.value : 
      { success: false, reason: crmResult.reason instanceof Error ? crmResult.reason.message : 'CRM call failed', recoverable: true };

    // If CRM succeeded, update MailerLite with CRM contact ID
    if (crmSuccess.success && crmSuccess.contactId && mailerliteSuccess.success) {
      enhancedMailerLitePayload.fields.crm_contact_id = crmSuccess.contactId;
      // Note: In production, you might want to update the MailerLite record with the CRM ID
      console.log(`CRM contact ID ${crmSuccess.contactId} linked to MailerLite subscriber for ${email}`);
    }

    // Prepare enhanced event tracking fields
    const eventFields: EventCustomFields = {
      // Core system fields following MailerLite best practices
      [MAILERLITE_CUSTOM_FIELDS.first_name]: firstName,
      [MAILERLITE_CUSTOM_FIELDS.phone]: phone,
      [MAILERLITE_CUSTOM_FIELDS.checkout_started_at]: new Date().toISOString(),
      [MAILERLITE_CUSTOM_FIELDS.payment_status]: 'lead' as const,
      [MAILERLITE_CUSTOM_FIELDS.ticket_type]: (requestBody.ticket_type as 'Standard' | 'VIP') || 'Standard',
      [MAILERLITE_CUSTOM_FIELDS.order_id]: null, // Will be set when payment intent is created
      [MAILERLITE_CUSTOM_FIELDS.amount_paid]: null,
      [MAILERLITE_CUSTOM_FIELDS.details_form_status]: 'pending' as const,
      
      // Event fields (consistent across all events)
      [MAILERLITE_CUSTOM_FIELDS.event_date]: EVENT_DATE,
      [MAILERLITE_CUSTOM_FIELDS.event_address]: EVENT_ADDRESS,
      [MAILERLITE_CUSTOM_FIELDS.google_maps_link]: GOOGLE_MAPS_LINK,
      
      // Multibanco fields (initially null, set during payment)
      [MAILERLITE_CUSTOM_FIELDS.mb_entity]: null,
      [MAILERLITE_CUSTOM_FIELDS.mb_reference]: null,
      [MAILERLITE_CUSTOM_FIELDS.mb_amount]: null,
      [MAILERLITE_CUSTOM_FIELDS.mb_expires_at]: null,
      
      // Attribution fields (current touch)
      [MAILERLITE_CUSTOM_FIELDS.utm_source]: requestBody.utm_source || null,
      [MAILERLITE_CUSTOM_FIELDS.utm_medium]: requestBody.utm_medium || null,
      [MAILERLITE_CUSTOM_FIELDS.utm_campaign]: requestBody.utm_campaign || null,
      
      // Marketing consent (defaulting to opt-in for checkout form)
      [MAILERLITE_CUSTOM_FIELDS.marketing_opt_in]: 'yes' as const
    };

    const leadData: EventSubscriberData = {
      email: email,
      name: full_name,        // MailerLite built-in field for full name
      phone: phone,
      fields: eventFields
    };
    
    // Map enriched data to MailerLite custom fields
    for (const [frontendField, mailerliteField] of Object.entries(MAILERLITE_FIELD_MAPPING)) {
      const value = requestBody[frontendField];
      
      if (value !== undefined && value !== null && value !== '') {
        // Handle different data types appropriately
        if (typeof value === 'string') {
          leadData.fields[mailerliteField] = value.toString().substring(0, 255);
        } else if (typeof value === 'number') {
          leadData.fields[mailerliteField] = value;
        } else if (typeof value === 'boolean') {
          leadData.fields[mailerliteField] = value.toString();
        }
      }
    }
    
    // Add validated UTM parameters (current touch attribution)
    for (const utmParam of VALIDATION_RULES.utm_params) {
      if (requestBody[utmParam] && typeof requestBody[utmParam] === 'string') {
        leadData.fields[utmParam] = requestBody[utmParam].trim().substring(0, 255);
      }
    }

    // Enhanced event fields complete for Phase 1 clean implementation
    
    // Log comprehensive Phase 1 results
    console.log(`Enhanced lead capture attempt for ${email}`, {
      eventId: enhancedMailerLitePayload.fields.event_id,
      userSessionId: enhancedMailerLitePayload.fields.user_session_id,
      clientIP: clientIP,
      mailerlite: {
        success: mailerliteSuccess.success,
        action: mailerliteSuccess.success ? (mailerliteSuccess as MailerLiteSuccess).action : 'failed',
        reason: mailerliteSuccess.reason
      },
      crm: {
        success: crmSuccess.success,
        contactId: crmSuccess.contactId,
        reason: crmSuccess.reason
      },
      enrichedFields: {
        eventId: enhancedMailerLitePayload.fields.event_id,
        leadScore: enhancedMailerLitePayload.fields.lead_score,
        deviceType: enhancedMailerLitePayload.fields.device_type,
        utmSource: enhancedMailerLitePayload.fields.utm_source,
        intentSignal: enhancedMailerLitePayload.fields.intent_signal,
        timeOnPage: enhancedMailerLitePayload.fields.time_on_page,
        fieldsCount: Object.keys(enhancedMailerLitePayload.fields).filter(k => enhancedMailerLitePayload.fields[k as keyof typeof enhancedMailerLitePayload.fields] !== undefined).length
      }
    });

    // Return unified Phase 1 response following UnifiedLeadCaptureResponse interface
    const unifiedResponse: UnifiedLeadCaptureResponse = {
      success: true, // Always true to not block checkout
      event_id: enhancedMailerLitePayload.fields.event_id,
      timestamp: new Date().toISOString(),
      
      // MailerLite results
      mailerlite: {
        success: mailerliteSuccess.success,
        subscriber_id: mailerliteSuccess.success ? (mailerliteSuccess as MailerLiteSuccess).subscriberId : undefined,
        action: mailerliteSuccess.success ? 
          ((mailerliteSuccess as MailerLiteSuccess).action === 'skipped' ? 'updated' : 'created') : 
          undefined,
        reason: mailerliteSuccess.reason
      },
      
      // CRM results
      crm: {
        success: crmSuccess.success,
        contact_id: crmSuccess.contactId,
        action: crmSuccess.success ? 'created' : undefined,
        stage: 'lead' as const,
        recoverable: !crmSuccess.success ? (crmSuccess.recoverable ?? true) : undefined,
        reason: crmSuccess.reason
      },
      
      // Error tracking
      errors: {
        ...(mailerliteSuccess.success ? {} : { mailerlite: mailerliteSuccess.reason }),
        ...(crmSuccess.success ? {} : { crm: crmSuccess.reason })
      },
      
      // Circuit breaker status for monitoring
      circuit_breaker_status: {
        name: mailerliteCircuitBreaker.name,
        state: mailerliteCircuitBreaker.state,
        failure_count: mailerliteCircuitBreaker.failureCount,
        success_count: mailerliteCircuitBreaker.successCount
      }
    };

    return new Response(JSON.stringify(unifiedResponse), {
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
      message: 'Please try again or contact support if the issue persists.'
    }), {
      status: 500,
      headers: responseHeaders
    });
  }
};

// Removed unnecessary config export - over-engineered for basic lead capture