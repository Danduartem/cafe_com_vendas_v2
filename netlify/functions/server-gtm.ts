/**
 * Server-Side Google Tag Manager Integration
 * Implements 2025 GA4 enhanced ecommerce patterns for accurate attribution
 * Bypasses ad blockers and provides reliable purchase event tracking
 */

import { withTimeout, SHARED_TIMEOUTS } from './shared-utils.js';

/**
 * GA4 Enhanced Ecommerce Item Structure (2025 Standard)
 */
interface GA4EcommerceItem {
  item_id: string;
  item_name: string;
  category?: string;
  category2?: string;
  category3?: string;
  category4?: string;
  category5?: string;
  quantity: number;
  price: number;
  item_brand?: string;
  item_variant?: string;
  index?: number;
  currency: string;
}

/**
 * GA4 Purchase Event Data Structure (Latest 2025 Format)
 */
interface GA4PurchaseEvent {
  // Core event identification
  event_name: 'purchase';
  client_id: string;
  timestamp_micros?: number;
  
  // Enhanced attribution data
  event_id?: string;
  session_id?: string;
  
  // Transaction details
  transaction_id: string;
  value: number;
  currency: string;
  
  // Enhanced ecommerce data
  items: GA4EcommerceItem[];
  
  // Attribution parameters
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  
  // Customer context (hashed for privacy)
  user_data?: {
    email_address?: string; // SHA-256 hashed
    phone_number?: string;  // SHA-256 hashed
    address?: {
      first_name?: string;
      last_name?: string;
      city?: string;
      region?: string;
      postal_code?: string;
      country?: string;
    };
  };
  
  // Custom parameters for enhanced tracking
  custom_parameters?: {
    payment_method?: string;
    customer_type?: 'new' | 'returning';
    affiliate_id?: string;
    coupon?: string;
    integration_version?: string;
  };
}

/**
 * Server-Side GTM Configuration
 */
interface ServerGTMConfig {
  endpoint: string;
  measurement_id: string;
  api_secret: string;
  debug_mode?: boolean;
}

/**
 * Server-Side GTM Client for GA4 Enhanced Ecommerce
 * Follows 2025 best practices for server-side attribution
 */
export class ServerGTMClient {
  private config: ServerGTMConfig;
  private readonly TIMEOUT_MS = SHARED_TIMEOUTS.external_api;

  constructor(config: ServerGTMConfig) {
    this.config = {
      ...config,
      debug_mode: process.env.NODE_ENV !== 'production' || config.debug_mode
    };
  }

  /**
   * Send purchase event to GA4 via server-side GTM
   * Uses latest 2025 Measurement Protocol v2 format
   */
  async sendPurchaseEvent(eventData: GA4PurchaseEvent): Promise<{ success: boolean; error?: string }> {
    try {
      // Construct GA4 Measurement Protocol payload (2025 format)
      const payload = {
        client_id: eventData.client_id,
        timestamp_micros: eventData.timestamp_micros || Date.now() * 1000,
        events: [{
          name: 'purchase',
          params: {
            // Core ecommerce parameters
            transaction_id: eventData.transaction_id,
            value: eventData.value,
            currency: eventData.currency,
            items: eventData.items,
            
            // Enhanced attribution (when available)
            ...(eventData.event_id && { event_id: eventData.event_id }),
            ...(eventData.session_id && { session_id: eventData.session_id }),
            
            // UTM parameters
            ...(eventData.source && { source: eventData.source }),
            ...(eventData.medium && { medium: eventData.medium }),
            ...(eventData.campaign && { campaign: eventData.campaign }),
            ...(eventData.term && { term: eventData.term }),
            ...(eventData.content && { content: eventData.content }),
            
            // Custom parameters
            ...eventData.custom_parameters
          }
        }],
        
        // User data for enhanced attribution (already hashed)
        ...(eventData.user_data && { user_data: eventData.user_data })
      };

      // Send to GA4 Measurement Protocol
      const response = await withTimeout(
        fetch(this.buildEndpointUrl(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'cafe-com-vendas-server/1.0'
          },
          body: JSON.stringify(payload)
        }),
        this.TIMEOUT_MS,
        'Server GTM API call'
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server GTM API error: ${response.status} - ${errorText}`);
        return { 
          success: false, 
          error: `GA4 API returned ${response.status}: ${errorText}` 
        };
      }

      // Log success in debug mode
      if (this.config.debug_mode) {
        console.log('Server GTM purchase event sent successfully', {
          transaction_id: eventData.transaction_id,
          value: eventData.value,
          items_count: eventData.items.length,
          client_id: eventData.client_id.substring(0, 8) + '...' // Partial ID for privacy
        });
      }

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Server GTM integration error:', errorMessage);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  /**
   * Build GA4 Measurement Protocol endpoint URL (2025 format)
   */
  private buildEndpointUrl(): string {
    const params = new URLSearchParams({
      measurement_id: this.config.measurement_id,
      api_secret: this.config.api_secret
    });

    // Use debug endpoint in development
    const baseUrl = this.config.debug_mode 
      ? 'https://www.google-analytics.com/debug/mp/collect'
      : 'https://www.google-analytics.com/mp/collect';

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Validate event data before sending
   */
  static validatePurchaseEvent(eventData: GA4PurchaseEvent): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!eventData.client_id) errors.push('client_id is required');
    if (!eventData.transaction_id) errors.push('transaction_id is required');
    if (!eventData.value || eventData.value <= 0) errors.push('value must be greater than 0');
    if (!eventData.currency) errors.push('currency is required');
    if (!eventData.items || eventData.items.length === 0) errors.push('at least one item is required');

    // Items validation
    eventData.items?.forEach((item, index) => {
      if (!item.item_id) errors.push(`item[${index}].item_id is required`);
      if (!item.item_name) errors.push(`item[${index}].item_name is required`);
      if (!item.quantity || item.quantity <= 0) errors.push(`item[${index}].quantity must be greater than 0`);
      if (typeof item.price !== 'number') errors.push(`item[${index}].price must be a number`);
    });

    return { valid: errors.length === 0, errors };
  }
}

/**
 * Initialize Server GTM client with environment configuration
 */
export function createServerGTMClient(): ServerGTMClient | null {
  const endpoint = process.env.SGTM_ENDPOINT;
  const measurement_id = process.env.GA4_MEASUREMENT_ID;
  const api_secret = process.env.GA4_API_SECRET;

  if (!endpoint || !measurement_id || !api_secret) {
    console.warn('Server GTM configuration incomplete:', {
      endpoint: !!endpoint,
      measurement_id: !!measurement_id,  
      api_secret: !!api_secret
    });
    return null;
  }

  return new ServerGTMClient({
    endpoint,
    measurement_id,
    api_secret,
    debug_mode: process.env.NODE_ENV !== 'production'
  });
}

/**
 * Convenience function for sending purchase events
 * Handles client creation and validation automatically
 */
export async function sendPurchaseToGA4(eventData: GA4PurchaseEvent): Promise<{ success: boolean; error?: string }> {
  // Validate event data first
  const validation = ServerGTMClient.validatePurchaseEvent(eventData);
  if (!validation.valid) {
    return { 
      success: false, 
      error: `Validation failed: ${validation.errors.join(', ')}` 
    };
  }

  // Create and use client
  const client = createServerGTMClient();
  if (!client) {
    return { 
      success: false, 
      error: 'Server GTM not configured' 
    };
  }

  return await client.sendPurchaseEvent(eventData);
}

// Export types for use in other modules
export type { GA4PurchaseEvent, GA4EcommerceItem, ServerGTMConfig };