/**
 * Shared TypeScript types for Netlify Functions
 */

// Modern Netlify Functions use Web Standards API (Request/Response)
// Legacy AWS Lambda-style interfaces removed in favor of standard web APIs

// Payment Intent Request/Response Types
export interface PaymentIntentRequest {
  lead_id: string;
  full_name: string;
  email: string;
  phone: string;
  amount?: number;
  currency?: string;
  idempotency_key?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  [key: string]: unknown; // Needed for validation iteration
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: {
    lead_id: string;
    full_name: string;
    email: string;
    phone: string;
    amount: number;
    currency: string;
  };
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number | null;
}

export interface RateLimitRecord {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

export interface CustomerCacheEntry {
  customer: {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
  };
  timestamp: number;
  lastAccessed: number;
}

// MailerLite Types
export interface MailerLiteLeadRequest {
  // Basic lead info (required)
  lead_id: string;
  full_name: string;
  email: string;
  phone: string;
  page?: string;
  
  // Core high-leverage fields
  first_name?: string;
  preferred_language?: string;
  city?: string;
  country?: string;
  timezone?: string;
  business_stage?: string;
  business_type?: string;
  primary_goal?: string;
  main_challenge?: string;
  
  // Intent & lifecycle tracking
  event_interest?: string;
  intent_signal?: string;
  lead_score?: number;
  signup_page?: string;
  referrer_domain?: string;
  
  // Attribution data
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  first_utm_source?: string;
  first_utm_campaign?: string;
  referrer?: string;
  landing_page?: string;
  
  // Device & browser data
  device_type?: string;
  device_brand?: string;
  browser_name?: string;
  browser_version?: string;
  screen_resolution?: string;
  viewport_size?: string;
  
  // Behavioral data
  time_on_page?: number;
  scroll_depth?: number;
  sections_viewed?: string;
  page_views?: number;
  is_returning_visitor?: boolean;
  session_duration?: number;
  
  // Technical data
  online_status?: boolean;
  cookie_enabled?: boolean;
  javascript_enabled?: boolean;
  
  [key: string]: unknown; // Needed for validation iteration
}

export interface MailerLiteSubscriberData {
  email: string;
  name: string;
  phone?: string;
  fields: Record<string, string | number | boolean | null>;
}

export interface MailerLiteSuccess {
  success: true;
  action: 'created' | 'skipped';
  subscriberId?: string;
  reason?: string;
}

export interface MailerLiteError {
  success: false;
  reason: string;
  recoverable?: boolean;
}

export type MailerLiteResult = MailerLiteSuccess | MailerLiteError;

// Stripe webhook types are now handled by official Stripe.Event from stripe package

export interface FulfillmentRecord {
  timestamp: number;
  fulfilled: boolean;
  customerEmail?: string;
  paymentIntentId?: string;
  sessionId?: string;
  fulfillmentType?: string;
  fulfilledAt?: string;
  awaitingPaymentCompletion?: boolean;
}


// Timeout promise wrapper type
export type TimeoutPromise<T> = Promise<T>;

// Validation rules interface
export interface ValidationRules {
  required_fields: string[];
  email_regex: RegExp;
  phone_regex: RegExp;
  name_min_length: number;
  name_max_length: number;
  amount_min: number;
  amount_max: number;
  currency_allowed: string[];
  utm_params: string[];
}

// Error types
export interface APIError extends Error {
  statusCode?: number;
  code?: string;
  type?: string;
}

// Stripe Payment Intent metadata
export interface PaymentIntentMetadata {
  lead_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_name: string;
  event_date: string;
  spot_type: string;
  source: string;
  created_at: string;
  validation_version: string;
  idempotency_key: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  [key: string]: string | undefined; // Index signature for metadata
}