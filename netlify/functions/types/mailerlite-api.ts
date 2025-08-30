/**
 * MailerLite API Type Definitions
 * Proper types to replace any types in MailerLite integration
 */

// MailerLite API Response Types
export interface MailerLiteApiResponse<T = unknown> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface MailerLiteSubscriber {
  id: string;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed' | 'unconfirmed' | 'bounced' | 'junk';
  phone?: string;
  fields: Record<string, string | number | boolean | null>;
  groups: string[];
  created_at: string;
  updated_at: string;
  subscribed_at?: string;
  unsubscribed_at?: string;
}

export interface MailerLiteGroup {
  id: string;
  name: string;
  active_count: number;
  sent_count: number;
  opens_count: number;
  open_rate: {
    float: number;
    string: string;
  };
  clicks_count: number;
  click_rate: {
    float: number;
    string: string;
  };
  unsubscribed_count: number;
  unconfirmed_count: number;
  bounced_count: number;
  junk_count: number;
  created_at: string;
}

export interface MailerLiteSearchResponse {
  data: MailerLiteSubscriber[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface MailerLiteErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export interface MailerLiteSubscriberCreateRequest {
  email: string;
  name?: string;
  phone?: string;
  fields?: Record<string, string | number | boolean | null>;
  groups?: string[];
  status?: 'active' | 'unsubscribed' | 'unconfirmed';
  subscribed_at?: string;
  ip_address?: string;
  opted_in_at?: string;
  opt_in_ip?: string;
}

export interface MailerLiteSubscriberUpdateRequest {
  name?: string;
  phone?: string;
  fields?: Record<string, string | number | boolean | null>;
  groups?: string[];
  status?: 'active' | 'unsubscribed' | 'unconfirmed';
}

export interface MailerLiteAutomationTrigger {
  email: string;
  automation_id: string;
  variables?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

// Type guards
export function isMailerLiteApiResponse(response: unknown): response is MailerLiteApiResponse {
  return typeof response === 'object' && 
         response !== null && 
         ('data' in response || 'message' in response || 'errors' in response);
}

export function isMailerLiteSubscriber(data: unknown): data is MailerLiteSubscriber {
  return typeof data === 'object' && 
         data !== null && 
         'id' in data && 
         'email' in data &&
         'status' in data;
}

export function isMailerLiteSearchResponse(response: unknown): response is MailerLiteSearchResponse {
  return typeof response === 'object' && 
         response !== null && 
         'data' in response && 
         'links' in response &&
         'meta' in response &&
         Array.isArray((response as Record<string, unknown>).data);
}

export function isMailerLiteErrorResponse(response: unknown): response is MailerLiteErrorResponse {
  return typeof response === 'object' && 
         response !== null && 
         'message' in response &&
         typeof (response as Record<string, unknown>).message === 'string';
}