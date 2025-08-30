/**
 * MailerLite Helper Functions
 * Shared utilities for email automation and subscriber management
 */

import {
  MAILERLITE_CUSTOM_FIELDS,
  MAILERLITE_LEGACY_GROUPS
} from './types';

// API configuration
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_API_BASE = 'https://connect.mailerlite.com/api';

// Timeout configuration
const API_TIMEOUT = 15000; // 15 seconds

/**
 * Helper to make MailerLite API calls with timeout
 */
async function mailerliteApiCall(
  endpoint: string,
  options: RequestInit,
  timeoutMs: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${MAILERLITE_API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        ...options.headers
      }
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Trigger confirmation email through MailerLite automation
 * Creates or updates subscriber and triggers the confirmation automation
 */
export async function triggerConfirmationEmail(
  email: string,
  data: {
    name?: string;
    amount: number;
    currency: string;
    event_name: string;
    event_date: string;
    payment_method: string;
    order_id?: string;
    ticket_type?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!MAILERLITE_API_KEY) {
    console.warn('MailerLite API key not configured - skipping confirmation email');
    return { success: false, error: 'API key not configured' };
  }

  try {
    // Prepare subscriber data with confirmation fields
    const subscriberData = {
      email,
      name: data.name || email.split('@')[0],
      fields: {
        [MAILERLITE_CUSTOM_FIELDS.payment_status]: 'paid',
        [MAILERLITE_CUSTOM_FIELDS.amount_paid]: data.amount,
        [MAILERLITE_CUSTOM_FIELDS.order_id]: data.order_id || '',
        [MAILERLITE_CUSTOM_FIELDS.ticket_type]: data.ticket_type || 'Standard',
        payment_method: data.payment_method,
        currency: data.currency,
        confirmation_sent_at: new Date().toISOString()
      },
      groups: [
        MAILERLITE_LEGACY_GROUPS.BUYERS, // Add to buyers group
        // TODO: Add automation trigger group when configured in MailerLite
        // 'trigger_confirmation_email'
      ],
      status: 'active'
    };

    // Update subscriber and trigger automation
    const response = await mailerliteApiCall('/subscribers', {
      method: 'POST',
      body: JSON.stringify(subscriberData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Handle "already exists" as success (update existing)
      if (response.status === 422 && errorText.includes('already exists')) {
        // Try to update existing subscriber
        return await updateSubscriberForConfirmation(email, subscriberData.fields);
      }
      
      throw new Error(`MailerLite API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json() as { data?: { id?: string; groups?: string[] } };
    console.log(`Confirmation email triggered for: ${email}`, {
      subscriberId: result.data?.id,
      groups: result.data?.groups
    });

    // Log automation trigger
    logAutomationTrigger(email, 'confirmation_email', {
      amount: data.amount,
      currency: data.currency,
      payment_method: data.payment_method
    });

    return { success: true };

  } catch (error) {
    console.error('Error triggering confirmation email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update existing subscriber for confirmation
 */
async function updateSubscriberForConfirmation(
  email: string,
  fields: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    // First, find the subscriber
    const searchResponse = await mailerliteApiCall(
      `/subscribers?filter[email]=${encodeURIComponent(email)}`,
      { method: 'GET' }
    );

    if (!searchResponse.ok) {
      throw new Error(`Failed to find subscriber: ${searchResponse.status}`);
    }

    const searchResult = await searchResponse.json() as { data?: { id: string }[] };
    
    if (!searchResult.data || searchResult.data.length === 0) {
      return { success: false, error: 'Subscriber not found' };
    }

    const subscriberId = searchResult.data[0].id;

    // Update the subscriber
    const updateResponse = await mailerliteApiCall(
      `/subscribers/${subscriberId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          fields,
          groups: [MAILERLITE_LEGACY_GROUPS.BUYERS]
        })
      }
    );

    if (!updateResponse.ok) {
      throw new Error(`Failed to update subscriber: ${updateResponse.status}`);
    }

    console.log(`Updated subscriber for confirmation: ${email}`);
    return { success: true };

  } catch (error) {
    console.error('Error updating subscriber for confirmation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Trigger abandoned cart email sequence
 * Adds subscriber to abandoned cart automation group
 */
export async function triggerAbandonedCartEmail(
  email: string,
  data: {
    name?: string;
    amount: number;
    currency: string;
    failure_reason?: string;
    cart_url?: string;
    expires_at?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!MAILERLITE_API_KEY) {
    console.warn('MailerLite API key not configured - skipping abandoned cart email');
    return { success: false, error: 'API key not configured' };
  }

  try {
    // Update subscriber with abandoned cart data
    const response = await mailerliteApiCall('/subscribers', {
      method: 'POST',
      body: JSON.stringify({
        email,
        name: data.name || email.split('@')[0],
        fields: {
          [MAILERLITE_CUSTOM_FIELDS.payment_status]: 'abandoned',
          abandoned_amount: data.amount,
          abandoned_currency: data.currency,
          abandoned_reason: data.failure_reason || 'Payment not completed',
          abandoned_at: new Date().toISOString(),
          cart_recovery_url: data.cart_url || '',
          cart_expires_at: data.expires_at || ''
        },
        groups: [
          MAILERLITE_LEGACY_GROUPS.LEADS,
          // TODO: Add abandoned cart automation group
          // MAILERLITE_EVENT_GROUPS.ABANDONED_PAYMENT
        ],
        status: 'active'
      })
    });

    if (!response.ok && response.status !== 422) {
      const errorText = await response.text();
      throw new Error(`MailerLite API error: ${response.status} - ${errorText}`);
    }

    console.log(`Abandoned cart email triggered for: ${email}`, {
      amount: data.amount,
      reason: data.failure_reason
    });

    // Log automation trigger
    logAutomationTrigger(email, 'abandoned_cart', {
      amount: data.amount,
      reason: data.failure_reason
    });

    return { success: true };

  } catch (error) {
    console.error('Error triggering abandoned cart email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Trigger Multibanco voucher email
 * Sends payment instructions for Multibanco
 */
export async function triggerMultibancoVoucherEmail(
  email: string,
  data: {
    name?: string;
    entity: string;
    reference: string;
    amount: number;
    expires_at: string;
    event_name: string;
    event_date: string;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!MAILERLITE_API_KEY) {
    console.warn('MailerLite API key not configured - skipping Multibanco voucher email');
    return { success: false, error: 'API key not configured' };
  }

  try {
    // Update subscriber with Multibanco details
    const response = await mailerliteApiCall('/subscribers', {
      method: 'POST',
      body: JSON.stringify({
        email,
        name: data.name || email.split('@')[0],
        fields: {
          [MAILERLITE_CUSTOM_FIELDS.payment_status]: 'pending',
          [MAILERLITE_CUSTOM_FIELDS.mb_entity]: data.entity,
          [MAILERLITE_CUSTOM_FIELDS.mb_reference]: data.reference,
          [MAILERLITE_CUSTOM_FIELDS.mb_amount]: data.amount,
          [MAILERLITE_CUSTOM_FIELDS.mb_expires_at]: data.expires_at,
          voucher_sent_at: new Date().toISOString()
        },
        groups: [
          MAILERLITE_LEGACY_GROUPS.LEADS,
          // TODO: Add Multibanco pending group
          // MAILERLITE_EVENT_GROUPS.BUYER_PENDING
        ],
        status: 'active'
      })
    });

    if (!response.ok && response.status !== 422) {
      const errorText = await response.text();
      throw new Error(`MailerLite API error: ${response.status} - ${errorText}`);
    }

    console.log(`Multibanco voucher email triggered for: ${email}`, {
      entity: data.entity,
      reference: data.reference,
      amount: data.amount
    });

    // Log automation trigger
    logAutomationTrigger(email, 'multibanco_voucher', {
      entity: data.entity,
      reference: data.reference,
      amount: data.amount
    });

    return { success: true };

  } catch (error) {
    console.error('Error triggering Multibanco voucher email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Trigger event reminder email
 * Sends reminder emails as event approaches
 */
export async function triggerEventReminderEmail(
  email: string,
  data: {
    name?: string;
    event_name: string;
    event_date: string;
    event_address: string;
    google_maps_link: string;
    days_until_event: number;
    ticket_type: string;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!MAILERLITE_API_KEY) {
    return { success: false, error: 'API key not configured' };
  }

  try {
    // Update subscriber with reminder data
    const response = await mailerliteApiCall('/subscribers', {
      method: 'POST',
      body: JSON.stringify({
        email,
        name: data.name || email.split('@')[0],
        fields: {
          days_until_event: data.days_until_event,
          last_reminder_sent: new Date().toISOString(),
          reminder_count: 1 // Increment this on each reminder
        },
        groups: [
          MAILERLITE_LEGACY_GROUPS.BUYERS,
          MAILERLITE_LEGACY_GROUPS.EVENT_ATTENDEES
        ],
        status: 'active'
      })
    });

    if (!response.ok && response.status !== 422) {
      const errorText = await response.text();
      throw new Error(`MailerLite API error: ${response.status} - ${errorText}`);
    }

    console.log(`Event reminder email triggered for: ${email}`, {
      days_until_event: data.days_until_event
    });

    return { success: true };

  } catch (error) {
    console.error('Error triggering event reminder email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Add subscriber to specific automation workflow
 * Generic function to trigger any automation by adding to trigger group
 */
export async function addToAutomationWorkflow(
  email: string,
  workflowGroupId: string,
  customFields?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  if (!MAILERLITE_API_KEY) {
    return { success: false, error: 'API key not configured' };
  }

  try {
    // Add subscriber to workflow trigger group
    const response = await mailerliteApiCall('/subscribers', {
      method: 'POST',
      body: JSON.stringify({
        email,
        fields: {
          ...customFields,
          workflow_triggered_at: new Date().toISOString()
        },
        groups: [workflowGroupId],
        status: 'active'
      })
    });

    if (!response.ok && response.status !== 422) {
      const errorText = await response.text();
      throw new Error(`MailerLite API error: ${response.status} - ${errorText}`);
    }

    console.log(`Added ${email} to workflow group: ${workflowGroupId}`);
    return { success: true };

  } catch (error) {
    console.error('Error adding to automation workflow:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Log automation trigger for monitoring
 * Helps track email automation performance
 */
function logAutomationTrigger(
  email: string,
  automationType: string,
  metadata: Record<string, unknown>
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    email,
    automation_type: automationType,
    metadata,
    environment: process.env.NODE_ENV || 'production'
  };

  // In production, this could send to a monitoring service
  console.log('Automation triggered:', JSON.stringify(logEntry));
}

/**
 * Check if subscriber exists in MailerLite
 */
export async function checkSubscriberExists(
  email: string
): Promise<{ exists: boolean; subscriberId?: string; error?: string }> {
  if (!MAILERLITE_API_KEY) {
    return { exists: false, error: 'API key not configured' };
  }

  try {
    const response = await mailerliteApiCall(
      `/subscribers?filter[email]=${encodeURIComponent(email)}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error(`Failed to check subscriber: ${response.status}`);
    }

    const result = await response.json() as { data?: { id: string }[] };
    
    if (result.data && result.data.length > 0) {
      return { 
        exists: true, 
        subscriberId: result.data[0].id 
      };
    }

    return { exists: false };

  } catch (error) {
    console.error('Error checking subscriber:', error);
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get subscriber groups
 * Returns list of groups the subscriber belongs to
 */
export async function getSubscriberGroups(
  email: string
): Promise<{ success: boolean; groups?: string[]; error?: string }> {
  if (!MAILERLITE_API_KEY) {
    return { success: false, error: 'API key not configured' };
  }

  try {
    const response = await mailerliteApiCall(
      `/subscribers?filter[email]=${encodeURIComponent(email)}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error(`Failed to get subscriber groups: ${response.status}`);
    }

    const result = await response.json() as { data?: { groups?: (string | { id: string })[] }[] };
    
    if (result.data && result.data.length > 0) {
      const groups = result.data[0].groups || [];
      return { 
        success: true, 
        groups: groups.map((g) => typeof g === 'string' ? g : g.id)
      };
    }

    return { success: false, error: 'Subscriber not found' };

  } catch (error) {
    console.error('Error getting subscriber groups:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export all functions
export default {
  triggerConfirmationEmail,
  triggerAbandonedCartEmail,
  triggerMultibancoVoucherEmail,
  triggerEventReminderEmail,
  addToAutomationWorkflow,
  checkSubscriberExists,
  getSubscriberGroups,
  logAutomationTrigger
};