/**
 * Dead Letter Queue Handler for Failed Webhook Processing
 * Implements exponential backoff retry mechanism for resilient webhook processing
 * Follows 2025 enterprise patterns for error handling and recovery
 */

// Simple logging utility for DLQ operations
const logger = {
  warn: (message: string, data?: unknown) => console.warn(`[DLQ] ${message}`, data || ''),
  info: (message: string, data?: unknown) => console.log(`[DLQ] ${message}`, data || ''),
  error: (message: string, data?: unknown) => console.error(`[DLQ] ${message}`, data || '')
};

/**
 * Failed webhook event structure for DLQ processing
 */
interface FailedWebhook {
  event_id: string;
  event_type: string;
  payload: unknown;
  failed_at: string;
  retry_count: number;
  max_retries: number;
  error: string;
  next_retry_at?: string;
}

/**
 * DLQ Configuration from environment
 */
interface DLQConfig {
  maxRetries: number;
  backoffMultiplier: number;
  baseDelayMs: number;
}

/**
 * Dead Letter Queue Implementation
 * Provides automatic retry with exponential backoff for failed webhook processing
 */
export class DeadLetterQueue {
  private static failedEvents = new Map<string, FailedWebhook>();
  private static retryTimeouts = new Map<string, NodeJS.Timeout>();
  
  private static config: DLQConfig = {
    maxRetries: parseInt(process.env.DLQ_MAX_RETRIES || '5', 10),
    backoffMultiplier: parseInt(process.env.DLQ_BACKOFF_MULTIPLIER || '2', 10),
    baseDelayMs: 1000 // Start with 1 second delay
  };

  /**
   * Add a failed webhook event to the DLQ for retry processing
   */
  static addFailedEvent(event: Omit<FailedWebhook, 'failed_at' | 'retry_count' | 'next_retry_at'>): void {
    const failedEvent: FailedWebhook = {
      ...event,
      failed_at: new Date().toISOString(),
      retry_count: 0,
      next_retry_at: undefined
    };

    // Store the failed event
    this.failedEvents.set(event.event_id, failedEvent);

    logger.warn('Webhook event added to DLQ for retry', {
      event_id: event.event_id,
      event_type: event.event_type,
      max_retries: event.max_retries,
      error: event.error
    });

    // Schedule first retry if under max retries
    this.scheduleRetry(failedEvent);
  }

  /**
   * Schedule a retry for a failed event with exponential backoff
   */
  private static scheduleRetry(event: FailedWebhook): void {
    if (event.retry_count >= event.max_retries) {
      logger.error('Webhook event exhausted all retries, giving up', {
        event_id: event.event_id,
        retry_count: event.retry_count,
        max_retries: event.max_retries,
        total_time_failed: this.calculateTotalFailureTime(event)
      });
      
      // Remove from failed events - no more retries
      this.failedEvents.delete(event.event_id);
      
      // TODO: Could send alert to monitoring system here
      return;
    }

    const delayMs = this.calculateBackoff(event.retry_count);
    const nextRetryAt = new Date(Date.now() + delayMs).toISOString();
    
    // Update event with next retry time
    event.next_retry_at = nextRetryAt;
    
    logger.info('Scheduling webhook retry', {
      event_id: event.event_id,
      retry_count: event.retry_count + 1,
      delay_ms: delayMs,
      next_retry_at: nextRetryAt
    });

    // Clear any existing timeout for this event
    const existingTimeout = this.retryTimeouts.get(event.event_id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Schedule the retry
    const timeout = setTimeout(() => {
      this.retryEvent(event).catch(error => {
        logger.error('Retry scheduling error', {
          event_id: event.event_id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      });
    }, delayMs);

    this.retryTimeouts.set(event.event_id, timeout);
  }

  /**
   * Calculate exponential backoff delay
   * Uses: baseDelay * (backoffMultiplier ^ retryCount)
   */
  private static calculateBackoff(retryCount: number): number {
    const delay = this.config.baseDelayMs * Math.pow(this.config.backoffMultiplier, retryCount);
    
    // Cap maximum delay at 30 minutes
    const maxDelay = 30 * 60 * 1000;
    return Math.min(delay, maxDelay);
  }

  /**
   * Calculate total time an event has been failing
   */
  private static calculateTotalFailureTime(event: FailedWebhook): string {
    const failedAt = new Date(event.failed_at).getTime();
    const now = Date.now();
    const durationMs = now - failedAt;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }

  /**
   * Retry a failed webhook event
   */
  private static async retryEvent(event: FailedWebhook): Promise<void> {
    event.retry_count++;
    
    logger.info('Retrying failed webhook event', {
      event_id: event.event_id,
      event_type: event.event_type,
      retry_count: event.retry_count,
      max_retries: event.max_retries
    });

    try {
      // Attempt to reprocess the webhook
      // This will be called by the webhook handler
      await this.processWebhookEvent(event);
      
      // Success - remove from failed events and cleanup
      this.failedEvents.delete(event.event_id);
      this.retryTimeouts.delete(event.event_id);
      
      logger.info('Webhook retry successful', {
        event_id: event.event_id,
        retry_count: event.retry_count,
        total_time_failed: this.calculateTotalFailureTime(event)
      });
      
    } catch (error) {
      // Update error information
      event.error = error instanceof Error ? error.message : 'Unknown retry error';
      
      logger.warn('Webhook retry failed', {
        event_id: event.event_id,
        retry_count: event.retry_count,
        max_retries: event.max_retries,
        error: event.error
      });
      
      // Schedule next retry if we haven't exhausted attempts
      this.scheduleRetry(event);
    }
  }

  /**
   * Process webhook event - this will be overridden by the actual webhook handler
   * This is a placeholder that throws an error by default
   */
  private static processWebhookEvent(_event: FailedWebhook): Promise<void> {
    throw new Error('processWebhookEvent must be implemented by webhook handler');
  }

  /**
   * Set the webhook processing function (called by webhook handler)
   */
  static setWebhookProcessor(processor: (failedEvent: FailedWebhook) => Promise<void>): void {
    this.processWebhookEvent = processor;
  }

  /**
   * Get current DLQ status for monitoring
   */
  static getStatus(): {
    failed_events_count: number;
    events_with_retries_pending: number;
    config: DLQConfig;
    failed_events: {
      event_id: string;
      event_type: string;
      retry_count: number;
      max_retries: number;
      failed_at: string;
      next_retry_at?: string;
      error: string;
    }[];
  } {
    const events = Array.from(this.failedEvents.values()).map(event => ({
      event_id: event.event_id,
      event_type: event.event_type,
      retry_count: event.retry_count,
      max_retries: event.max_retries,
      failed_at: event.failed_at,
      next_retry_at: event.next_retry_at,
      error: event.error
    }));

    return {
      failed_events_count: this.failedEvents.size,
      events_with_retries_pending: Array.from(this.retryTimeouts.keys()).length,
      config: this.config,
      failed_events: events
    };
  }

  /**
   * Clear all failed events (for testing or manual intervention)
   */
  static clearAll(): void {
    // Clear all retry timeouts
    for (const timeout of this.retryTimeouts.values()) {
      clearTimeout(timeout);
    }
    
    this.retryTimeouts.clear();
    this.failedEvents.clear();
    
    logger.info('DLQ cleared - all failed events and retries cancelled');
  }

  /**
   * Remove a specific event from DLQ (for manual intervention)
   */
  static removeEvent(eventId: string): boolean {
    const existed = this.failedEvents.has(eventId);
    
    // Clear retry timeout if exists
    const timeout = this.retryTimeouts.get(eventId);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(eventId);
    }
    
    // Remove from failed events
    this.failedEvents.delete(eventId);
    
    if (existed) {
      logger.info('Manually removed event from DLQ', { event_id: eventId });
    }
    
    return existed;
  }
}

/**
 * Export types for use in other modules
 */
export type { FailedWebhook, DLQConfig };