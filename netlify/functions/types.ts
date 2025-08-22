/**
 * Shared TypeScript types for Netlify Functions
 */

// Netlify Function Types
export interface NetlifyEvent {
  httpMethod: string;
  headers: Record<string, string>;
  body: string | null;
  queryStringParameters?: Record<string, string> | null;
  multiValueQueryStringParameters?: Record<string, string[]> | null;
  path: string;
  pathParameters?: Record<string, string> | null;
  stageVariables?: Record<string, string> | null;
  requestContext?: {
    requestId: string;
    identity: {
      sourceIp: string;
      userAgent?: string;
    };
  };
  isBase64Encoded?: boolean;
}

export interface NetlifyContext {
  callbackWaitsForEmptyEventLoop?: boolean;
  functionName: string;
  functionVersion: string;
  invokedFunctionArn: string;
  memoryLimitInMB: string;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
  identity?: {
    sourceIp: string;
    userAgent?: string;
  };
  clientContext?: {
    client: {
      installationId: string;
      appTitle: string;
      appVersionName: string;
      appVersionCode: string;
      appPackageName: string;
    };
    custom?: Record<string, unknown>;
    env?: Record<string, string>;
  };
}

export interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
}

export type NetlifyHandler = (
  event: NetlifyEvent,
  context: NetlifyContext
) => Promise<NetlifyResponse>;

// Response Headers with proper typing
export type ResponseHeaders = Record<string, string>;

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
  [key: string]: unknown; // Index signature for dynamic access
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
  lead_id: string;
  full_name: string;
  email: string;
  phone: string;
  page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  [key: string]: unknown; // Index signature for dynamic access
}

export interface MailerLiteSubscriberData {
  email: string;
  name: string;
  phone?: string;
  fields: Record<string, string | number | null>;
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

// Stripe Webhook Types
export interface StripeWebhookEvent {
  id: string;
  object: 'event';
  api_version: string;
  created: number;
  data: {
    object: any;
    previous_attributes?: Record<string, unknown>;
  };
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string | null;
    idempotency_key: string | null;
  };
  type: string;
}

export interface FulfillmentRecord {
  timestamp: number;
  fulfilled: boolean;
  customerEmail?: string;
  paymentIntentId?: string;
  sessionId?: string;
  fulfillmentType?: string;
  fulfilledAt?: string;
}

export interface CircuitBreakerStatus {
  name: string;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  successCount: number;
  totalCalls: number;
  lastFailureTime: number | null;
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