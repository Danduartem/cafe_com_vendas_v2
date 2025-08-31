/**
 * Shared utilities for Netlify Functions
 * Consolidates common timeout, retry, and configuration patterns
 */

// Centralized timeout configuration
export const SHARED_TIMEOUTS = {
  stripe_api: 30000,       // 30 seconds for Stripe API calls
  mailerlite_api: 15000,   // 15 seconds for MailerLite API calls
  crm_api: 15000,          // 15 seconds for CRM API calls
  external_api: 15000,     // 15 seconds for other external APIs
  default: 10000           // 10 seconds default
} as const;

// Centralized retry configuration
export const RETRY_CONFIG = {
  max_retries: 3,
  base_delay: 1000,        // 1 second base delay
  circuit_breaker: {
    failure_threshold: 5,
    reset_timeout: 60000   // 1 minute
  }
} as const;

/**
 * Timeout wrapper for async operations
 * Shared across all functions to ensure consistent timeout handling
 */
export function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number, 
  operation = 'Operation'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operation} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
}

/**
 * Retry with exponential backoff
 * Shared retry logic for all functions
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>, 
  maxRetries = RETRY_CONFIG.max_retries, 
  baseDelay = RETRY_CONFIG.base_delay
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`Retry attempt ${attempt + 1} failed, retrying in ${delay}ms`, {
        error: error instanceof Error ? error.message : String(error)
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Retry logic failed unexpectedly');
}

/**
 * Circuit breaker implementation
 * Shared circuit breaker pattern for all functions
 */
export class CircuitBreaker {
  public name: string;
  public failureCount: number;
  public lastFailureTime: number | null;
  public state: 'closed' | 'open' | 'half-open';
  public failureThreshold: number;
  public resetTimeout: number;

  constructor(
    name: string, 
    failureThreshold = RETRY_CONFIG.circuit_breaker.failure_threshold, 
    resetTimeout = RETRY_CONFIG.circuit_breaker.reset_timeout
  ) {
    this.name = name;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'closed';
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.lastFailureTime && Date.now() - this.lastFailureTime < this.resetTimeout) {
        throw new Error(`Circuit breaker ${this.name} is open`);
      }
      this.state = 'half-open';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      failureThreshold: this.failureThreshold,
      resetTimeout: this.resetTimeout
    };
  }
}