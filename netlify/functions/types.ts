/**
 * Shared TypeScript types for Netlify Functions
 * Enhanced with comprehensive MailerLite marketing automation system
 * Following event-driven lifecycle management best practices
 */

// Modern Netlify Functions use Web Standards API (Request/Response)
// Legacy AWS Lambda-style interfaces removed in favor of standard web APIs

// ========================================
// EVENT-SPECIFIC CONSTANTS
// ========================================

// Event naming convention: ccv-2025-09-20 (event slug)
export const EVENT_SLUG = 'ccv-2025-09-20' as const;
export const EVENT_DATE = '2025-09-20' as const;
export const EVENT_NAME = 'Café com Vendas - Lisboa' as const;
export const EVENT_ADDRESS = 'Lisboa, Portugal' as const;
export const GOOGLE_MAPS_LINK = 'https://maps.google.com/?q=Lisboa,Portugal' as const;

// ========================================
// MAILERLITE GROUP HIERARCHY
// ========================================

// Lifecycle state groups following MailerLite best practices
export const MAILERLITE_EVENT_GROUPS = {
  // Lead nurture funnel
  CHECKOUT_STARTED: `${EVENT_SLUG}_checkout_started`,
  ABANDONED_PAYMENT: `${EVENT_SLUG}_abandoned_payment`,
  
  // Payment processing states
  BUYER_PENDING: `${EVENT_SLUG}_buyer_pending`, // Multibanco generated
  BUYER_PAID: `${EVENT_SLUG}_buyer_paid`,
  
  // Post-purchase lifecycle
  DETAILS_PENDING: `${EVENT_SLUG}_details_pending`,
  DETAILS_COMPLETE: `${EVENT_SLUG}_details_complete`,
  
  // Event participation
  ATTENDED: `${EVENT_SLUG}_attended`,
  NO_SHOW: `${EVENT_SLUG}_no_show`
} as const;

// Legacy groups for backward compatibility
export const MAILERLITE_LEGACY_GROUPS = {
  LEADS: '164068163344925725',
  BUYERS: '164071323193050164', 
  EVENT_ATTENDEES: '164071346948540099'
} as const;

// ========================================
// MAILERLITE CUSTOM FIELDS SCHEMA
// ========================================

// All 21 custom fields as specified in requirements
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

// Field types for validation
export const MAILERLITE_FIELD_TYPES = {
  // Text fields
  first_name: 'text',
  phone: 'text',
  payment_status: 'text',
  ticket_type: 'text',
  order_id: 'text',
  details_form_status: 'text',
  event_address: 'text',
  google_maps_link: 'text',
  mb_entity: 'text',
  mb_reference: 'text',
  utm_source: 'text',
  utm_medium: 'text',
  utm_campaign: 'text',
  marketing_opt_in: 'text',
  
  // Date fields
  checkout_started_at: 'date',
  event_date: 'date',
  mb_expires_at: 'date',
  
  // Number fields
  amount_paid: 'number',
  mb_amount: 'number'
} as const;

// Valid values for enum-like fields
export const FIELD_VALUES = {
  payment_status: ['lead', 'pending', 'paid'] as const,
  ticket_type: ['Standard', 'VIP'] as const,
  details_form_status: ['pending', 'submitted'] as const,
  marketing_opt_in: ['yes', 'no'] as const
} as const;

// ========================================
// SEGMENT DEFINITIONS
// ========================================

// Dynamic segment rules for targeting (created in MailerLite UI)
export const MAILERLITE_SEGMENTS = {
  // Top-of-funnel segments
  LEADS_NEVER_PAID_7D: 'ccv Leads — Never Paid (7d)',
  ABANDONED_PAYMENT_HOT_48H: 'ccv Abandoned Payment — Hot (48h)',
  MB_PENDING_EXPIRES_TODAY: 'ccv MB Pending — Expires Today', 
  HIGH_INTENT_CLICKED_2_NURTURE: 'ccv High Intent — Clicked ≥2 nurture',
  
  // Buyer segments
  BUYERS_DETAILS_MISSING: 'ccv Buyers — Details Missing',
  BUYERS_EVENT_IN_9_DAYS: 'ccv Buyers — Event in ≤9 days',
  BUYERS_EVENT_IN_10_DAYS: 'ccv Buyers — Event in ≥10 days',
  BUYERS_VIP: 'ccv Buyers — VIP',
  
  // Hygiene/compliance segments
  SUPPRESSION_NO_MARKETING: 'ccv Suppression — No Marketing',
  COLD_90D_NOT_BUYER: 'ccv Cold 90d (not buyer)'
} as const;

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

// ========================================
// ENHANCED MAILERLITE INTERFACES
// ========================================

// Complete event-specific subscriber data interface
export interface EventSubscriberData {
  email: string;
  name: string;
  phone?: string;
  fields: EventCustomFields;
}

// All 21 custom fields with proper typing (compatible with MailerLite API)
export interface EventCustomFields extends Record<string, string | number | boolean | null> {
  // Core system fields
  first_name: string;
  phone: string;
  checkout_started_at: string; // ISO date string
  payment_status: 'lead' | 'pending' | 'paid';
  ticket_type: 'Standard' | 'VIP';
  order_id: string | null;
  amount_paid: number | null;
  details_form_status: 'pending' | 'submitted';
  
  // Event fields (seeded/static)
  event_date: string; // '2025-09-20'
  event_address: string; // 'Lisboa, Portugal'
  google_maps_link: string;
  
  // Multibanco fields (set by Stripe/webhook)
  mb_entity: string | null;
  mb_reference: string | null;
  mb_amount: number | null;
  mb_expires_at: string | null; // ISO date string
  
  // Attribution fields
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  
  // Marketing consent
  marketing_opt_in: 'yes' | 'no';
}

// State transition interface for lifecycle management
export interface SubscriberStateTransition {
  subscriberId: string;
  email: string;
  fromGroup?: string;
  toGroup: string;
  trigger: 'form_submit' | 'payment_success' | 'payment_pending' | 'details_submit' | 'event_attendance' | 'manual';
  metadata?: Record<string, unknown>;
}

// Automation trigger data
export interface AutomationTriggerData {
  subscriberId: string;
  email: string;
  automationType: 'lead_nurture' | 'multibanco_pending' | 'buyer_onboarding' | 'pre_event' | 'post_event';
  triggerCondition: string;
  customData?: Record<string, unknown>;
}

// MailerLite Types (Legacy + Enhanced)
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

// Enhanced subscriber data with lifecycle management
export interface MailerLiteEventSubscriber extends MailerLiteSubscriberData {
  fields: EventCustomFields;
  groups: string[]; // Group IDs to assign
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

// ========================================
// WEBHOOK & INTEGRATION INTERFACES 
// ========================================

// Enhanced payment metadata for event tracking
export interface EventPaymentMetadata extends PaymentIntentMetadata {
  event_slug: typeof EVENT_SLUG;
  marketing_opt_in: 'yes' | 'no';
  lead_score?: string; // String type required by Stripe metadata
  attribution_data?: string; // JSON string of attribution object
}

// Multibanco payment details
export interface MultibancoPaymentDetails {
  entity: string;
  reference: string;
  amount: number; // In euros (not cents)
  expiresAt?: string; // ISO date string
  generatedAt: string; // ISO date string
}

// Webhook processing result
export interface WebhookProcessingResult {
  success: boolean;
  subscriberId?: string;
  groupTransitions: string[]; // List of group changes made
  fieldsUpdated: string[]; // List of fields updated
  automationsTriggered: string[]; // List of automations triggered
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
  [key: string]: string | undefined; // Index signature for metadata
}

// ========================================
// UTILITY TYPES
// ========================================

// Type helpers for better type safety
export type EventGroupNames = keyof typeof MAILERLITE_EVENT_GROUPS;
export type EventFieldNames = keyof typeof MAILERLITE_CUSTOM_FIELDS;
export type PaymentStatus = typeof FIELD_VALUES.payment_status[number];
export type TicketType = typeof FIELD_VALUES.ticket_type[number];
export type DetailsFormStatus = typeof FIELD_VALUES.details_form_status[number];
export type MarketingOptIn = typeof FIELD_VALUES.marketing_opt_in[number];

// API response types for better error handling
export interface MailerLiteApiResponse<T = unknown> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Comprehensive error tracking
export interface MailerLiteOperationError extends Error {
  operation: 'subscriber_create' | 'group_assign' | 'field_update' | 'automation_trigger';
  subscriberEmail?: string;
  apiResponse?: MailerLiteApiResponse;
  retryable: boolean;
}