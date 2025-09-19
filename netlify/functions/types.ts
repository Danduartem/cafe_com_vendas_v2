/**
 * Shared TypeScript types for Netlify Functions
 * Enhanced with comprehensive MailerLite marketing automation system
 * Following event-driven lifecycle management best practices
 */

// Modern Netlify Functions using Web Standards API (Request/Response)

// Event-specific constants

// Event naming convention: ccv-2025-10-04 (event slug)
export const EVENT_SLUG = 'ccv-2025-10-04' as const;
export const EVENT_DATE = '2025-10-04' as const;
export const EVENT_NAME = 'Café com Vendas - Lisboa' as const;
export const EVENT_ADDRESS = 'Lisboa, Portugal' as const;
export const GOOGLE_MAPS_LINK = 'https://maps.google.com/?q=Lisboa,Portugal' as const;

// MailerLite group hierarchy

// Lifecycle state groups following MailerLite best practices
export const MAILERLITE_EVENT_GROUPS = {
  // Lead nurture funnel
  CHECKOUT_STARTED: `${EVENT_SLUG}_checkout_started`,
  ABANDONED_PAYMENT: `${EVENT_SLUG}_abandoned_payment`,

  // Payment processing states
  BUYER_PENDING: `${EVENT_SLUG}_buyer_pending`,
  BUYER_PAID: `${EVENT_SLUG}_buyer_paid`,

  // Post-purchase lifecycle
  DETAILS_PENDING: `${EVENT_SLUG}_details_pending`,
  DETAILS_COMPLETE: `${EVENT_SLUG}_details_complete`,

  // Event participation
  ATTENDED: `${EVENT_SLUG}_attended`,
  NO_SHOW: `${EVENT_SLUG}_no_show`
} as const;


// MailerLite custom fields schema

export const MAILERLITE_CUSTOM_FIELDS = {
  // Core fields
  first_name: 'first_name',
  phone: 'phone',
  checkout_started_at: 'checkout_started_at',
  payment_status: 'payment_status',
  ticket_type: 'ticket_type',
  order_id: 'order_id',
  amount_paid: 'amount_paid',
  details_form_status: 'details_form_status',

  // Event fields (consistent across events)
  event_date: 'event_date',
  event_address: 'event_address',
  google_maps_link: 'google_maps_link',

  // Multibanco fields
  mb_entity: 'mb_entity',
  mb_reference: 'mb_reference',
  mb_amount: 'mb_amount',
  mb_expires_at: 'mb_expires_at',

  // Attribution fields
  utm_source: 'utm_source',
  utm_medium: 'utm_medium',
  utm_campaign: 'utm_campaign',

  // Marketing consent
  marketing_opt_in: 'marketing_opt_in'
} as const;


// Valid enum values
export const FIELD_VALUES = {
  payment_status: ['lead', 'pending', 'paid'] as const,
  ticket_type: ['Standard', 'VIP'] as const,
  details_form_status: ['pending', 'submitted'] as const,
  marketing_opt_in: ['yes', 'no'] as const
} as const;


// Enhanced for Phase 1
export interface PaymentIntentRequest {
  // Event tracking fields
  event_id: string;
  user_session_id: string;

  // Core payment fields
  lead_id?: string;
  full_name: string;
  email: string;
  phone: string;
  amount?: number;
  currency?: string;
  idempotency_key?: string;

  // Attribution data
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;

  // CRM integration
  crm_contact_id?: string;
  crm_deal_id?: string;

  // Consent tracking
  marketing_consent?: boolean;
  consent_timestamp?: string;
  consent_method?: string;

  // Customer journey tracking
  lead_created_at?: string;
  checkout_started_at?: string;
  payment_attempt_count?: string;

  // Device context
  device_type?: string;
  user_agent_hash?: string;
  ip_address_hash?: string;

  [key: string]: unknown;
}

// Enhanced for Phase 1
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: {
    event_id: string;
    user_session_id: string;
    lead_id: string; // Fallback to event_id if not provided
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

// Enhanced MailerLite interfaces

export interface EventSubscriberData {
  email: string;
  name: string;
  phone?: string;
  fields: EventCustomFields;
}

export interface EventCustomFields extends Record<string, string | number | boolean | null> {
  // Core system fields
  first_name: string;
  phone: string;
  checkout_started_at: string;
  payment_status: 'lead' | 'pending' | 'paid';
  ticket_type: 'Standard' | 'VIP';
  order_id: string | null;
  amount_paid: number | null;
  details_form_status: 'pending' | 'submitted';

  // Event fields (seeded/static)
  event_date: string;
  event_address: string;
  google_maps_link: string;

  // Multibanco fields (set by Stripe/webhook)
  mb_entity: string | null;
  mb_reference: string | null;
  mb_amount: number | null;
  mb_expires_at: string | null;

  // Attribution fields
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;

  // Marketing consent
  marketing_opt_in: 'yes' | 'no';
}

export interface SubscriberStateTransition {
  subscriberId: string;
  email: string;
  fromGroup?: string;
  toGroup: string;
  trigger: 'form_submit' | 'payment_success' | 'payment_pending' | 'details_submit' | 'event_attendance' | 'manual';
  metadata?: Record<string, unknown>;
}

export interface AutomationTriggerData {
  subscriberId: string;
  email: string;
  automationType: 'lead_nurture' | 'multibanco_pending' | 'buyer_onboarding' | 'pre_event' | 'post_event';
  triggerCondition: string;
  customData?: Record<string, unknown>;
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

  [key: string]: unknown;
}

export interface MailerLiteSubscriberData {
  email: string;
  name: string;
  phone?: string;
  fields: Record<string, string | number | boolean | null>;
}

export interface MailerLiteEventSubscriber extends MailerLiteSubscriberData {
  fields: EventCustomFields;
  groups: string[];
  status: 'active' | 'unsubscribed' | 'unconfirmed';
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

// CRM error response types
export interface CRMExistingContact {
  contact?: {
    id?: string;
  };
}

export interface CRMErrorResponse {
  existing_card?: CRMExistingContact;
  message?: string;
  error?: string;
}

// Type guard for CRM error responses
export function isCRMErrorResponse(obj: unknown): obj is CRMErrorResponse {
  return typeof obj === 'object' && obj !== null;
}

// Type guard for existing contact data
export function hasExistingContactId(obj: unknown): obj is { existing_card: { contact: { id: string } } } {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const record = obj as Record<string, unknown>;
  if (!('existing_card' in record)) {
    return false;
  }

  const existingCard = record.existing_card;
  if (typeof existingCard !== 'object' || existingCard === null) {
    return false;
  }

  const existingCardRecord = existingCard as Record<string, unknown>;
  if (!('contact' in existingCardRecord)) {
    return false;
  }

  const contact = existingCardRecord.contact;
  if (typeof contact !== 'object' || contact === null) {
    return false;
  }

  const contactRecord = contact as Record<string, unknown>;
  return 'id' in contactRecord && typeof contactRecord.id === 'string';
}

// Webhook & integration interfaces

// Enhanced payment metadata for event tracking
export interface EventPaymentMetadata extends PaymentIntentMetadata {
  event_slug: typeof EVENT_SLUG;
  marketing_opt_in: 'yes' | 'no';
  lead_score?: string;
  attribution_data?: string;
}

// Multibanco payment details
export interface MultibancoPaymentDetails {
  entity: string;
  reference: string;
  amount: number;
  expiresAt?: string;
  generatedAt: string;
}

// Webhook processing result
export interface WebhookProcessingResult {
  success: boolean;
  subscriberId?: string;
  groupTransitions: string[];
  fieldsUpdated: string[];
  automationsTriggered: string[];
  error?: string;
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
  [key: string]: string | undefined;
}

// Utility types

export type EventGroupNames = keyof typeof MAILERLITE_EVENT_GROUPS;
export type EventFieldNames = keyof typeof MAILERLITE_CUSTOM_FIELDS;
export type PaymentStatus = typeof FIELD_VALUES.payment_status[number];
export type TicketType = typeof FIELD_VALUES.ticket_type[number];
export type DetailsFormStatus = typeof FIELD_VALUES.details_form_status[number];
export type MarketingOptIn = typeof FIELD_VALUES.marketing_opt_in[number];

export interface MailerLiteApiResponse<T = unknown> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface MailerLiteOperationError extends Error {
  operation: 'subscriber_create' | 'group_assign' | 'field_update' | 'automation_trigger';
  subscriberEmail?: string;
  apiResponse?: MailerLiteApiResponse;
  retryable: boolean;
}