/**
 * Enhanced Tracking Types for Phase 1 Implementation
 * Based on latest Stripe Node.js and MailerLite API best practices (2025)
 * 
 * Implements:
 * - Global event_id propagation across all systems
 * - Enhanced MailerLite custom fields following non-destructive patterns
 * - Stripe metadata best practices with proper typing
 * - CRM integration with lead-stage tracking
 */

import type { EventContext, EventAttribution } from '../utils/event-tracking.js';

// ================================
// ENHANCED MAILERLITE TYPES
// ================================

/**
 * Enhanced MailerLite subscriber payload following 2025 API best practices
 * Uses non-destructive upsert pattern - omitting fields won't remove existing data
 */
export interface EnhancedMailerLitePayload {
  // Required fields (MailerLite API requirement)
  email: string;

  // Standard subscriber fields (non-destructive)
  fields: {
    // Basic contact info
    name?: string;
    last_name?: string;
    phone?: string;
    company?: string;
    city?: string;
    country?: string;
    state?: string;
    zip?: string;

    // === PHASE 1 ENHANCED FIELDS ===
    // Event tracking (NEW - enables cross-system correlation)
    event_id: string;
    user_session_id: string;
    lead_created_at: string;
    checkout_started_at?: string;

    // Payment lifecycle (NEW - enables targeted campaigns)
    payment_status: 'lead' | 'paid' | 'refunded' | 'failed';

    // Attribution data (ENHANCED - complete UTM tracking)
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    first_utm_source?: string;
    first_utm_campaign?: string;
    referrer?: string;
    referrer_domain?: string;
    landing_page: string;

    // Behavioral data (ENHANCED)
    time_on_page?: number;
    scroll_depth?: number;
    sections_viewed?: string;
    page_views?: number;
    is_returning_visitor?: boolean;
    session_duration?: number;

    // Device & browser (NEW - for segmentation)
    device_type?: 'mobile' | 'tablet' | 'desktop';
    device_brand?: string;
    browser_name?: string;
    browser_version?: string;
    screen_resolution?: string;
    viewport_size?: string;

    // Business context (NEW - prepared for Phase 2)
    preferred_language?: string;
    timezone?: string;
    event_interest: string; // e.g., "cafe_com_vendas_lisbon_2025-09-20"
    intent_signal?: string; // e.g., "started_checkout", "completed_payment"
    lead_score?: number;
    signup_page: string;

    // === PHASE 2 PREPARATION FIELDS ===
    // Consent management (prepared for Phase 2)
    marketing_consent?: boolean;
    consent_method?: 'modal' | 'checkbox' | 'implied';
    consent_timestamp?: string;
    consent_ip?: string;
    consent_version?: string;

    // CRM integration (NEW - foreign key to CRM system)
    crm_contact_id?: string;
    crm_deal_status?: 'lead' | 'qualified' | 'paid' | 'churned';

    // Business qualification (prepared for future)
    business_stage?: string;
    business_type?: string;
    primary_goal?: string;
    main_challenge?: string;
  };

  // Group management (non-destructive - won't remove from unlisted groups)
  groups?: string[];

  // Optional subscriber status and timestamps
  status?: 'active' | 'unsubscribed' | 'unconfirmed' | 'bounced' | 'junk';
  subscribed_at?: string;
  ip_address?: string;
  opted_in_at?: string;
  optin_ip?: string;
}

/**
 * MailerLite API response type following latest patterns
 */
export interface EnhancedMailerLiteResponse {
  success: boolean;
  action: 'created' | 'updated';
  subscriber: {
    id: string;
    email: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  groups_added?: string[];
  reason?: string;
}

// ================================
// ENHANCED STRIPE TYPES
// ================================

/**
 * Enhanced Stripe PaymentIntent metadata following latest best practices
 * Stripe metadata values must be strings, max 500 chars per key, 50 keys max
 */
export interface EnhancedStripeMetadata {
  // Event tracking (NEW - unified tracking)
  event_id: string;
  user_session_id: string;

  // Contact information
  email: string;
  phone: string;
  full_name: string;

  // Product information (NEW - better reporting)
  product_id: string; // e.g., "cafe-com-vendas-ticket"
  product_name: string; // e.g., "Café com Vendas - Lisbon 2025"
  event_date: string; // e.g., "2025-09-20"
  product_category?: string; // e.g., "business-event"
  product_variant?: string; // e.g., "early-bird-ticket"

  // Attribution data (NEW - complete tracking)
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  
  // First-touch attribution (for cross-session tracking)
  first_utm_source?: string;
  first_utm_campaign?: string;
  first_landing_page?: string;

  // CRM integration (NEW - reference to CRM system)
  crm_contact_id?: string;
  crm_deal_id?: string;
  crm_pipeline_stage?: string;

  // Consent tracking (prepared for Phase 2)
  marketing_consent?: 'true' | 'false';
  consent_timestamp?: string;
  consent_method?: string;
  privacy_policy_version?: string;

  // Customer journey tracking
  lead_created_at?: string;
  checkout_started_at?: string;
  payment_attempt_count?: string;
  time_to_purchase_minutes?: string;

  // Device context (for fraud prevention)
  device_type?: string;
  user_agent_hash?: string; // Hashed for privacy
  ip_address_hash?: string; // Hashed for privacy
  browser_language?: string;
  screen_resolution?: string;
  timezone?: string;
  
  // Phase 2 server-side attribution
  server_attribution_enabled?: string;
  integration_version?: string;
  api_version?: string;
  client_ip_country?: string;
  referrer_domain?: string;
  customer_segment?: string;
  acquisition_channel?: string;
  conversion_path_length?: string;
  checkout_flow_version?: string;

  // Meta identifiers for CAPI matching (propagated from web)
  fbp?: string;
  fbc?: string;
}

/**
 * Enhanced create payment intent payload
 */
export interface EnhancedPaymentIntentPayload {
  // Standard Stripe fields
  amount: number;
  currency: string;

  // Enhanced metadata
  metadata: EnhancedStripeMetadata;

  // Event context for internal processing
  eventContext: EventContext;
  attribution: EventAttribution;

  // CRM data for correlation
  crm_contact_id?: string;

  // Customer info
  customer_email: string;
  customer_name: string;
  customer_phone: string;
}

// ================================
// ENHANCED CRM TYPES
// ================================

/**
 * Enhanced CRM payload supporting both lead and paid stages
 * Following your custom CRM API at mocha-smoky.vercel.app
 */
export interface EnhancedCRMPayload {
  // Required CRM fields (from your current implementation)
  company_id: string;
  board_id: string;
  column_id: string;
  name: string;
  phone: string;
  amount: string; // "0" for leads, actual amount for paid
  title: string;

  // Event tracking (NEW - unified tracking)
  event_id: string;
  user_session_id: string;

  // Contact lifecycle (NEW)
  contact_stage: 'lead' | 'qualified' | 'paid' | 'churned';
  lead_created_at: string;
  payment_completed_at?: string;

  // Attribution data (NEW)
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer_domain?: string;
  landing_page: string;

  // Business context
  event_interest: string;
  intent_signal: string;
  lead_score?: number;

  // Enhanced contact data
  email: string;
  contact_tags?: string[];
  obs?: string;

  // Device & behavior (for lead scoring)
  device_type?: string;
  time_on_page?: number;
  scroll_depth?: number;
  page_views?: number;
  is_returning_visitor?: boolean;

  // Consent (prepared for Phase 2)
  marketing_consent?: boolean;
  consent_timestamp?: string;
}

/**
 * CRM API response type
 */
export interface EnhancedCRMResponse {
  success: boolean;
  contact_id?: string;
  deal_id?: string;
  action: 'created' | 'updated';
  stage: 'lead' | 'qualified' | 'paid';
  reason?: string;
}

// ================================
// UNIFIED EVENT DATA TYPES
// ================================

/**
 * Complete event data combining all system payloads
 * Used for API calls that need to propagate data to multiple systems
 */
export interface UnifiedEventPayload {
  // Core event context
  eventContext: EventContext;
  attribution: EventAttribution;

  // Customer data
  customer: {
    full_name: string;
    email: string;
    phone: string;
    country_code: string;
  };

  // System-specific payloads (generated from core data)
  mailerlite: EnhancedMailerLitePayload;
  crm: EnhancedCRMPayload;
  stripe_metadata: EnhancedStripeMetadata;

  // Consent data (Phase 2)
  consent: {
    marketing_consent: boolean;
    consent_method: 'modal' | 'checkbox' | 'implied';
    consent_timestamp: string;
    consent_ip?: string;
  };
}

// ================================
// API RESPONSE TYPES
// ================================

/**
 * Unified API response for lead capture endpoint
 * Returns results from all integrated systems
 */
export interface UnifiedLeadCaptureResponse {
  success: boolean;
  event_id: string;
  timestamp: string;

  // MailerLite results
  mailerlite: {
    success: boolean;
    subscriber_id?: string;
    action?: 'created' | 'updated';
    groups_added?: string[];
    reason?: string;
  };

  // CRM results
  crm: {
    success: boolean;
    contact_id?: string;
    action?: 'created' | 'updated';
    stage: 'lead';
    recoverable?: boolean;
    reason?: string;
  };

  // Error tracking
  errors?: {
    mailerlite?: string;
    crm?: string;
    validation?: string[];
  };

  // Circuit breaker status (for monitoring)
  circuit_breaker_status?: {
    name: string;
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    failure_count: number;
    success_count: number;
  };
}

/**
 * Enhanced payment intent creation response
 */
export interface EnhancedPaymentIntentResponse {
  success: boolean;
  client_secret: string;
  payment_intent_id: string;
  event_id: string;

  // CRM correlation
  crm_contact_id?: string;
  crm_deal_id?: string;

  // Enhanced metadata stored
  metadata_keys: string[];

  // Error handling
  error?: string;
  validation_errors?: string[];
}

// ================================
// VALIDATION TYPES
// ================================

/**
 * Enhanced validation rules for all payload types
 */
export interface EnhancedValidationRules {
  // Event ID validation
  event_id: {
    required: true;
    format: 'uuid';
    max_length: 36;
  };

  // Customer validation
  email: {
    required: true;
    format: 'email';
    max_length: 254;
  };
  full_name: {
    required: true;
    min_length: 2;
    max_length: 100;
    pattern: RegExp; // No special chars except spaces, hyphens, apostrophes
  };
  phone: {
    required: true;
    min_length: 7;
    max_length: 20;
    pattern: RegExp; // International phone format
  };

  // Attribution validation
  utm_fields: {
    max_length: 250;
    allowed_chars: RegExp;
  };

  // Business validation
  amount: {
    format: 'decimal';
    min_value: 0;
    max_value: 99999.99;
  };
}

/**
 * Validation result type
 */
export interface ValidationResult {
  is_valid: boolean;
  errors: string[];
  field_errors?: {
    field: string;
    message: string;
    value?: unknown;
  }[];
  sanitized?: Record<string, unknown>;
}

// ================================
// ERROR TYPES
// ================================

/**
 * Enhanced error types for better error handling
 */
export interface EnhancedAPIError {
  code: string;
  message: string;
  system: 'mailerlite' | 'crm' | 'stripe' | 'validation';
  recoverable: boolean;
  retry_after?: number;
  details?: Record<string, unknown>;
  event_id?: string;
  timestamp: string;
}

// ================================
// EXPORT ALL TYPES
// ================================

// All types are exported via their individual export statements above
