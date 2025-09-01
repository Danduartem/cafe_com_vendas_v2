/**
 * Metrics Collection API - Phase 3 Real-time Performance Tracking
 * Collects client-side performance metrics and feeds them to monitoring system
 * Supports Core Web Vitals, user interactions, and business events
 */

import { SystemMonitoringManager } from '../../src/utils/monitoring.js';

/**
 * Client-side metric types
 */
interface ClientMetric {
  metric_type: 'core_web_vital' | 'performance' | 'user_interaction' | 'business_event' | 'error';
  timestamp: string;
  session_id?: string;
  page_url?: string;
  user_agent?: string;
  
  // Core Web Vital data
  metric_name?: string;
  value?: number;
  
  // Performance data
  operation?: string;
  duration_ms?: number;
  
  // User interaction data
  interaction_type?: string;
  element_id?: string;
  
  // Business event data
  event_name?: string;
  event_data?: Record<string, unknown>;
  
  // Error data
  error_message?: string;
  error_stack?: string;
  
  // Additional metadata
  metadata?: Record<string, unknown>;
}

/**
 * Metrics collection response
 */
interface MetricsResponse {
  success: boolean;
  metrics_received: number;
  timestamp: string;
  error?: string;
}

/**
 * Rate limiting configuration
 */
const RATE_LIMIT = {
  max_requests_per_minute: 100,
  max_metrics_per_request: 10,
  cleanup_interval_ms: 60000 // 1 minute
};

/**
 * Simple in-memory rate limiting
 */
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();

/**
 * Metrics Collection API Handler
 */
export default async function metricsCollection(request: Request): Promise<Response> {
  const startTime = Date.now();
  
  try {
    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Only POST requests are allowed'
      }), {
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Allow': 'POST'
        }
      });
    }

    // Get client IP for rate limiting
    const clientIp = getClientIp(request);
    
    // Check rate limits
    const rateLimitResult = checkRateLimit(clientIp);
    if (!rateLimitResult.allowed) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Rate limit exceeded. Please slow down.',
        retry_after: rateLimitResult.retry_after
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': rateLimitResult.retry_after?.toString() || '60'
        }
      });
    }

    // Parse request body
    const body = await request.json() as ClientMetric | ClientMetric[];
    const metrics = Array.isArray(body) ? body : [body];

    // Validate metrics count
    if (metrics.length > RATE_LIMIT.max_metrics_per_request) {
      return new Response(JSON.stringify({
        success: false,
        error: `Too many metrics. Maximum ${RATE_LIMIT.max_metrics_per_request} per request.`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get monitoring manager
    const monitor = SystemMonitoringManager.getInstance();
    let processedCount = 0;

    // Process each metric
    for (const metric of metrics) {
      try {
        processMetric(metric, monitor);
        processedCount++;
      } catch (error) {
        console.error('Failed to process metric:', error);
        // Continue processing other metrics
      }
    }

    // Record API performance
    const responseTime = Date.now() - startTime;
    monitor.recordResponseTime('metrics-collection', responseTime, true);

    // Return success response
    const response: MetricsResponse = {
      success: true,
      metrics_received: processedCount,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const responseTime = Date.now() - startTime;
    
    // Record API error
    const monitor = SystemMonitoringManager.getInstance();
    monitor.recordResponseTime('metrics-collection', responseTime, false);
    monitor.recordError('metrics-collection', error instanceof Error ? error : new Error(errorMessage));

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Process individual metric based on type
 */
function processMetric(metric: ClientMetric, monitor: SystemMonitoringManager): void {
  // Validate required fields
  if (!metric.metric_type || !metric.timestamp) {
    throw new Error('Missing required metric fields: metric_type, timestamp');
  }

  switch (metric.metric_type) {
    case 'core_web_vital':
      processCoreWebVital(metric, monitor);
      break;
      
    case 'performance':
      processPerformanceMetric(metric, monitor);
      break;
      
    case 'user_interaction':
      processUserInteraction(metric, monitor);
      break;
      
    case 'business_event':
      processBusinessEvent(metric, monitor);
      break;
      
    case 'error':
      processClientError(metric, monitor);
      break;
      
    default:
      throw new Error(`Unknown metric type: ${metric.metric_type as string}`);
  }
}

/**
 * Process Core Web Vital metric (LCP, CLS, FID, etc.)
 */
function processCoreWebVital(metric: ClientMetric, monitor: SystemMonitoringManager): void {
  if (!metric.metric_name || typeof metric.value !== 'number') {
    throw new Error('Core Web Vital requires metric_name and value');
  }

  // Record performance event
  monitor.recordResponseTime(`cwv_${metric.metric_name}`, metric.value, true);

  // Emit monitoring event for significant metrics
  if (metric.metric_name === 'largest_contentful_paint' && metric.value > 2500) {
    monitor.recordBusinessEvent('poor_lcp', {
      value: metric.value,
      page_url: metric.page_url,
      user_agent: metric.user_agent?.substring(0, 100) // Truncate for storage
    });
  } else if (metric.metric_name === 'cumulative_layout_shift' && metric.value > 0.1) {
    monitor.recordBusinessEvent('poor_cls', {
      value: metric.value,
      page_url: metric.page_url,
      user_agent: metric.user_agent?.substring(0, 100)
    });
  } else if (metric.metric_name === 'first_input_delay' && metric.value > 100) {
    monitor.recordBusinessEvent('poor_fid', {
      value: metric.value,
      page_url: metric.page_url,
      user_agent: metric.user_agent?.substring(0, 100)
    });
  }
}

/**
 * Process general performance metric
 */
function processPerformanceMetric(metric: ClientMetric, monitor: SystemMonitoringManager): void {
  if (!metric.operation || typeof metric.duration_ms !== 'number') {
    throw new Error('Performance metric requires operation and duration_ms');
  }

  monitor.recordResponseTime(metric.operation, metric.duration_ms, true);

  // Alert on slow operations
  if (metric.duration_ms > 5000) {
    monitor.recordBusinessEvent('slow_client_operation', {
      operation: metric.operation,
      duration_ms: metric.duration_ms,
      page_url: metric.page_url,
      session_id: metric.session_id
    });
  }
}

/**
 * Process user interaction event
 */
function processUserInteraction(metric: ClientMetric, monitor: SystemMonitoringManager): void {
  if (!metric.interaction_type) {
    throw new Error('User interaction requires interaction_type');
  }

  monitor.recordBusinessEvent('user_interaction', {
    interaction_type: metric.interaction_type,
    element_id: metric.element_id,
    page_url: metric.page_url,
    session_id: metric.session_id,
    timestamp: metric.timestamp,
    ...metric.metadata
  });

  // Track conversion-critical interactions
  if (metric.interaction_type === 'checkout_started' || 
      metric.interaction_type === 'payment_form_focused' ||
      metric.interaction_type === 'purchase_button_clicked') {
    monitor.recordBusinessEvent('conversion_funnel', {
      step: metric.interaction_type,
      page_url: metric.page_url,
      session_id: metric.session_id,
      element_id: metric.element_id
    });
  }
}

/**
 * Process business event
 */
function processBusinessEvent(metric: ClientMetric, monitor: SystemMonitoringManager): void {
  if (!metric.event_name) {
    throw new Error('Business event requires event_name');
  }

  monitor.recordBusinessEvent(metric.event_name, {
    ...metric.event_data,
    page_url: metric.page_url,
    session_id: metric.session_id,
    timestamp: metric.timestamp,
    user_agent: metric.user_agent?.substring(0, 100)
  });
}

/**
 * Process client-side error
 */
function processClientError(metric: ClientMetric, monitor: SystemMonitoringManager): void {
  if (!metric.error_message) {
    throw new Error('Error metric requires error_message');
  }

  const error = new Error(metric.error_message);
  if (metric.error_stack) {
    error.stack = metric.error_stack;
  }

  monitor.recordError('client_error', error, {
    page_url: metric.page_url,
    session_id: metric.session_id,
    user_agent: metric.user_agent?.substring(0, 100),
    ...metric.metadata
  });
}

/**
 * Get client IP address from request
 */
function getClientIp(request: Request): string {
  // Try various headers in order of preference
  const headers = request.headers;
  
  return headers.get('cf-connecting-ip') || // Cloudflare
         headers.get('x-real-ip') || // Nginx
         headers.get('x-forwarded-for')?.split(',')[0] || // Load balancers
         headers.get('x-client-ip') || // Apache
         'unknown';
}

/**
 * Check rate limits for client IP
 */
function checkRateLimit(clientIp: string): { allowed: boolean; retry_after?: number } {
  const now = Date.now();
  const key = `rate_limit_${clientIp}`;
  
  // Clean up old entries periodically
  cleanupRateLimitStore();
  
  const existing = rateLimitStore.get(key);
  
  if (!existing) {
    // First request from this IP
    rateLimitStore.set(key, { count: 1, timestamp: now });
    return { allowed: true };
  }
  
  const timeDiff = now - existing.timestamp;
  
  if (timeDiff >= RATE_LIMIT.cleanup_interval_ms) {
    // Reset count after time window
    rateLimitStore.set(key, { count: 1, timestamp: now });
    return { allowed: true };
  }
  
  if (existing.count >= RATE_LIMIT.max_requests_per_minute) {
    // Rate limit exceeded
    const retry_after = Math.ceil((RATE_LIMIT.cleanup_interval_ms - timeDiff) / 1000);
    return { allowed: false, retry_after };
  }
  
  // Increment count
  existing.count++;
  return { allowed: true };
}

/**
 * Clean up old rate limit entries
 */
function cleanupRateLimitStore(): void {
  const now = Date.now();
  const cutoff = now - (RATE_LIMIT.cleanup_interval_ms * 2); // Keep double the window
  
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.timestamp < cutoff) {
      rateLimitStore.delete(key);
    }
  }
}

// Periodic cleanup
setInterval(cleanupRateLimitStore, RATE_LIMIT.cleanup_interval_ms);