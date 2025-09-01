/**
 * Global Event Tracking System for Café com Vendas
 * Manages unified event_id across all integrations (MailerLite, CRM, Stripe, GTM)
 * 
 * This system ensures consistent tracking and attribution across:
 * - MailerLite (email automation)
 * - Custom CRM (sales pipeline)
 * - Stripe (payment processing)
 * - GTM/GA4 (analytics)
 */

import { logger } from './logger.js';

/**
 * Event context that gets propagated across all systems
 */
export interface EventContext {
  event_id: string;
  user_session_id: string;
  created_at: string;
  page_url: string;
  user_agent: string;
}

/**
 * Attribution data that gets collected and propagated
 */
export interface EventAttribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  referrer_domain?: string;
  landing_page: string;
}

/**
 * Complete event data combining context and attribution
 */
export interface CompleteEventData {
  context: EventContext;
  attribution: EventAttribution;
  consent: {
    marketing_consent: boolean;
    consent_method: 'modal' | 'checkbox' | 'implied';
    consent_timestamp: string;
  };
}

/**
 * Global Event Tracking Manager
 * Singleton pattern ensures consistent event_id across all components
 */
export class EventTracker {
  private static instance: EventTracker;
  private eventContext: EventContext | null = null;
  private attribution: EventAttribution | null = null;
  
  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): EventTracker {
    if (!EventTracker.instance) {
      EventTracker.instance = new EventTracker();
    }
    return EventTracker.instance;
  }

  /**
   * Generate or get existing event context for this session
   */
  generateEventContext(): EventContext {
    if (this.eventContext) {
      return this.eventContext;
    }

    this.eventContext = {
      event_id: this.generateUUID(),
      user_session_id: this.getOrCreateSessionId(),
      created_at: new Date().toISOString(),
      page_url: window.location.href,
      user_agent: navigator.userAgent.substring(0, 200) // Truncate to prevent payload size issues
    };

    // Store in sessionStorage for persistence across page reloads
    sessionStorage.setItem('event_context', JSON.stringify(this.eventContext));

    logger.debug('Generated new event context:', {
      event_id: this.eventContext.event_id,
      user_session_id: this.eventContext.user_session_id
    });

    return this.eventContext;
  }

  /**
   * Get existing event context or generate new one
   */
  getEventContext(): EventContext {
    if (this.eventContext) {
      return this.eventContext;
    }

    // Try to restore from sessionStorage
    const stored = sessionStorage.getItem('event_context');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as EventContext;
        
        // Validate stored context has all required fields
        if (parsed.event_id && parsed.user_session_id && parsed.created_at) {
          this.eventContext = parsed;
          logger.debug('Restored event context from storage:', {
            event_id: this.eventContext.event_id
          });
          return this.eventContext;
        }
      } catch (error) {
        logger.warn('Failed to parse stored event context:', error);
      }
    }

    // Generate new context if none exists or stored is invalid
    return this.generateEventContext();
  }

  /**
   * Get just the event_id (most common use case)
   */
  getEventId(): string {
    return this.getEventContext().event_id;
  }

  /**
   * Get user session ID
   */
  getUserSessionId(): string {
    return this.getEventContext().user_session_id;
  }

  /**
   * Collect current attribution data from URL and referrer
   */
  collectAttribution(): EventAttribution {
    if (this.attribution) {
      return this.attribution;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer;
    
    // Store first-touch attribution if not already stored
    if (!sessionStorage.getItem('first_utm_source') && urlParams.get('utm_source')) {
      sessionStorage.setItem('first_utm_source', urlParams.get('utm_source') || '');
      sessionStorage.setItem('first_utm_campaign', urlParams.get('utm_campaign') || '');
      sessionStorage.setItem('first_utm_medium', urlParams.get('utm_medium') || '');
      sessionStorage.setItem('first_landing_page', window.location.pathname + window.location.search);
    }

    this.attribution = {
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      utm_content: urlParams.get('utm_content') || undefined,
      utm_term: urlParams.get('utm_term') || undefined,
      referrer: referrer || undefined,
      referrer_domain: referrer ? this.extractDomain(referrer) : undefined,
      landing_page: window.location.pathname + window.location.search
    };

    return this.attribution;
  }

  /**
   * Get complete event data for API calls
   */
  getCompleteEventData(options: {
    marketing_consent?: boolean;
    consent_method?: 'modal' | 'checkbox' | 'implied';
  } = {}): CompleteEventData {
    return {
      context: this.getEventContext(),
      attribution: this.collectAttribution(),
      consent: {
        marketing_consent: options.marketing_consent ?? false,
        consent_method: options.consent_method ?? 'implied',
        consent_timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Reset event context (useful for testing or new sessions)
   */
  reset(): void {
    this.eventContext = null;
    this.attribution = null;
    sessionStorage.removeItem('event_context');
    logger.debug('Event context reset');
  }

  /**
   * Generate UUID v4
   * Using crypto.randomUUID() if available, fallback to Math.random()
   */
  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Get or create user session ID
   * Session ID persists for the browser session (until tab close)
   */
  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('user_session_id');
    if (!sessionId) {
      sessionId = this.generateUUID();
      sessionStorage.setItem('user_session_id', sessionId);
      logger.debug('Generated new user session ID:', sessionId);
    }
    return sessionId;
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }
}

/**
 * Convenience functions for common use cases
 */

/**
 * Get global event ID (most common use case)
 */
export function getEventId(): string {
  return EventTracker.getInstance().getEventId();
}

/**
 * Get user session ID
 */
export function getUserSessionId(): string {
  return EventTracker.getInstance().getUserSessionId();
}

/**
 * Get complete event data for API payloads
 */
export function getEventData(options?: {
  marketing_consent?: boolean;
  consent_method?: 'modal' | 'checkbox' | 'implied';
}): CompleteEventData {
  return EventTracker.getInstance().getCompleteEventData(options);
}

/**
 * Initialize event tracking on page load
 * Call this early in your application bootstrap
 */
export function initializeEventTracking(): EventContext {
  const tracker = EventTracker.getInstance();
  const context = tracker.generateEventContext();
  
  logger.info('Event tracking initialized', {
    event_id: context.event_id,
    user_session_id: context.user_session_id
  });

  return context;
}

export default EventTracker;