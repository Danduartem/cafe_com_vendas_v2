/**
 * CRM Integration Type Definitions
 * Types for the CRM contact card integration
 */

// CRM Contact Card Payload
export interface CRMContactPayload {
  company_id: string;
  board_id: string;
  column_id: string;
  name: string;
  phone: string;
  title: string;
  amount: string;
  obs: string;
  contact_tags: string[];
}

// Internal CRM Request (includes additional tracking fields)
export interface CRMIntegrationRequest extends CRMContactPayload {
  lead_id: string;
  email: string;
  // Optional enrichment fields
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  device_type?: string;
  lead_score?: number;
}

// CRM API Response
export interface CRMApiResponse {
  success: boolean;
  id?: string;
  message?: string;
  error?: string;
  details?: Record<string, unknown>;
}

// CRM Integration Result
export interface CRMResult {
  success: boolean;
  contactId?: string;
  reason?: string;
  recoverable?: boolean;
  action?: string; // Action taken (e.g., 'created', 'skipped', 'updated')
}

// CRM Configuration
export interface CRMConfig {
  companyId: string;
  boardId: string;
  columnId: string;
  apiUrl: string;
  apiKey?: string;
}

// Rate limit entry for CRM requests
export interface CRMRateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

// Validation rules for CRM data
export interface CRMValidationRules {
  required_fields: readonly string[];
  name_min_length: number;
  name_max_length: number;
  phone_min_length: number;
  phone_max_length: number;
  amount_pattern: RegExp;
}

// CRM Circuit Breaker Status
export interface CircuitBreakerStatus {
  name: string;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  successCount: number;
  totalCalls: number;
  lastFailureTime: number | null;
}

// Unvalidated request body from client
// Used for input validation before converting to CRMContactPayload
export interface UnvalidatedCRMRequest {
  // Required fields (strings that may be empty/invalid)
  name?: unknown;
  phone?: unknown;
  amount?: unknown;
  
  // Optional fields that may be provided
  company_id?: unknown;
  board_id?: unknown;
  column_id?: unknown;
  title?: unknown;
  obs?: unknown;
  contact_tags?: unknown;
  
  // Allow any other fields that might be sent
  [key: string]: unknown;
}