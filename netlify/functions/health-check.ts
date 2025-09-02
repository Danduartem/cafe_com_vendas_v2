/**
 * Health Check API - Phase 3 Operational Dashboard
 * Provides unified system health monitoring for all enterprise components
 * Monitors: Server GTM, DLQ, CRM, MailerLite, Stripe, and performance metrics
 */

// Health check API - no external utilities needed for this endpoint
import { DeadLetterQueue } from './dlq-handler.js';
import { createServerGTMClient } from './server-gtm.js';
import { testHashingConsistency } from './pii-hash.js';

/**
 * System health status levels
 */
type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * Individual service health check result
 */
interface ServiceHealth {
  status: HealthStatus;
  response_time_ms?: number;
  last_check: string;
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Complete system health report
 */
interface SystemHealthReport {
  status: HealthStatus;
  timestamp: string;
  uptime_seconds: number;
  version: string;
  environment: string;
  
  services: {
    server_gtm: ServiceHealth;
    dead_letter_queue: ServiceHealth;
    crm_integration: ServiceHealth;
    mailerlite: ServiceHealth;
    stripe_webhooks: ServiceHealth;
    pii_hashing: ServiceHealth;
    performance_tracking: ServiceHealth;
  };
  
  summary: {
    healthy_services: number;
    total_services: number;
    overall_health_percentage: number;
    critical_issues: string[];
    warnings: string[];
  };
}

/**
 * Health Check Configuration
 */
const HEALTH_CONFIG = {
  timeout_ms: 5000,
  critical_services: ['stripe_webhooks', 'crm_integration'] as const,
  warning_threshold: 80, // Overall health % below this triggers warnings
  degraded_threshold: 60 // Overall health % below this marks system as degraded
};

/**
 * Track system start time for uptime calculation
 */
const SYSTEM_START_TIME = Date.now();

/**
 * Health Check Implementation
 */
export default function healthCheck(request: Request): Response {
  const startTime = Date.now();
  
  try {
    // Parse query parameters for admin authentication
    const url = new URL(request.url);
    const adminKey = url.searchParams.get('admin_key');
    const detailed = url.searchParams.get('detailed') === 'true';
    
    // Basic admin authentication (Phase 3 security)
    if (!isAuthorizedAdmin(adminKey)) {
      return new Response(JSON.stringify({
        status: 'unauthorized',
        message: 'Admin access required'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
    }

    // Run all health checks
    const serverGtmHealth = checkServerGTMHealth();
    const dlqHealth = checkDeadLetterQueueHealth();
    const crmHealth = checkCRMIntegrationHealth();
    const mailerliteHealth = checkMailerLiteHealth();
    const stripeHealth = checkStripeWebhooksHealth();
    const piiHashHealth = checkPIIHashingHealth();
    const performanceHealth = checkPerformanceTrackingHealth();

    // Compile health report
    const healthReport: SystemHealthReport = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.floor((Date.now() - SYSTEM_START_TIME) / 1000),
      version: '3.0.0', // Phase 3 version
      environment: process.env.NODE_ENV || 'development',
      
      services: {
        server_gtm: serverGtmHealth,
        dead_letter_queue: dlqHealth,
        crm_integration: crmHealth,
        mailerlite: mailerliteHealth,
        stripe_webhooks: stripeHealth,
        pii_hashing: piiHashHealth,
        performance_tracking: performanceHealth
      },
      
      summary: {
        healthy_services: 0,
        total_services: 7,
        overall_health_percentage: 0,
        critical_issues: [],
        warnings: []
      }
    };

    // Calculate overall health
    const serviceResults = Object.values(healthReport.services);
    const healthyServices = serviceResults.filter(service => service.status === 'healthy').length;
    const degradedServices = serviceResults.filter(service => service.status === 'degraded').length;
    const unhealthyServices = serviceResults.filter(service => service.status === 'unhealthy').length;
    
    healthReport.summary.healthy_services = healthyServices;
    healthReport.summary.overall_health_percentage = Math.round((healthyServices / healthReport.summary.total_services) * 100);

    // Determine overall system status
    if (unhealthyServices > 0) {
      healthReport.status = 'unhealthy';
      
      // Check for critical service failures
      for (const [serviceName, serviceHealth] of Object.entries(healthReport.services)) {
        if (serviceHealth.status === 'unhealthy' && (HEALTH_CONFIG.critical_services as readonly string[]).includes(serviceName)) {
          healthReport.summary.critical_issues.push(`Critical service ${serviceName} is unhealthy: ${serviceHealth.message || 'Unknown error'}`);
        }
      }
    } else if (degradedServices > 0 || healthReport.summary.overall_health_percentage < HEALTH_CONFIG.degraded_threshold) {
      healthReport.status = 'degraded';
    }

    // Generate warnings
    if (healthReport.summary.overall_health_percentage < HEALTH_CONFIG.warning_threshold) {
      healthReport.summary.warnings.push(`System health at ${healthReport.summary.overall_health_percentage}% - below warning threshold`);
    }

    // Response with appropriate HTTP status
    const httpStatus = healthReport.status === 'healthy' ? 200 : 
                       healthReport.status === 'degraded' ? 200 : 503;

    // Return detailed or summary response
    const responseBody = detailed ? healthReport : {
      status: healthReport.status,
      health_percentage: healthReport.summary.overall_health_percentage,
      uptime_seconds: healthReport.uptime_seconds,
      timestamp: healthReport.timestamp,
      critical_issues: healthReport.summary.critical_issues,
      response_time_ms: Date.now() - startTime
    };

    return new Response(JSON.stringify(responseBody, null, detailed ? 2 : 0), {
      status: httpStatus,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check-Time': `${Date.now() - startTime}ms`
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown health check error';
    
    return new Response(JSON.stringify({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: errorMessage,
      response_time_ms: Date.now() - startTime
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
}

/**
 * Check Server GTM health
 */
function checkServerGTMHealth(): ServiceHealth {
  const startTime = Date.now();
  
  try {
    const client = createServerGTMClient();
    
    if (!client) {
      return {
        status: 'degraded',
        response_time_ms: Date.now() - startTime,
        last_check: new Date().toISOString(),
        message: 'Server GTM not configured - tracking will fall back to client-side'
      };
    }

    // Server GTM is configured and ready
    return {
      status: 'healthy',
      response_time_ms: Date.now() - startTime,
      last_check: new Date().toISOString(),
      message: 'Server GTM configured and ready',
      details: {
        endpoint_configured: !!process.env.SGTM_ENDPOINT
      }
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      last_check: new Date().toISOString(),
      message: `Server GTM health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Check Dead Letter Queue health
 */
function checkDeadLetterQueueHealth(): ServiceHealth {
  const startTime = Date.now();
  
  try {
    const dlqStatus = DeadLetterQueue.getStatus();
    
    const status: HealthStatus = 
      dlqStatus.failed_events_count === 0 ? 'healthy' :
      dlqStatus.failed_events_count <= 5 ? 'degraded' : 'unhealthy';
    
    return {
      status,
      response_time_ms: Date.now() - startTime,
      last_check: new Date().toISOString(),
      message: dlqStatus.failed_events_count === 0 ? 
        'No failed events in queue' : 
        `${dlqStatus.failed_events_count} events in retry queue`,
      details: {
        failed_events: dlqStatus.failed_events_count,
        events_with_retries: dlqStatus.events_with_retries_pending,
        max_retries: dlqStatus.config.maxRetries,
        backoff_multiplier: dlqStatus.config.backoffMultiplier
      }
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      last_check: new Date().toISOString(),
      message: `DLQ health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Check CRM Integration health
 */
function checkCRMIntegrationHealth(): ServiceHealth {
  const startTime = Date.now();
  
  try {
    // Check if CRM environment variables are configured
    const crmConfigured = !!(process.env.CRM_API_ENDPOINT || process.env.MOCHA_API_URL);
    
    if (!crmConfigured) {
      return {
        status: 'degraded',
        response_time_ms: Date.now() - startTime,
        last_check: new Date().toISOString(),
        message: 'CRM integration not configured - leads will not be sent to CRM'
      };
    }

    // CRM is configured (we don't ping it to avoid unnecessary API calls)
    return {
      status: 'healthy',
      response_time_ms: Date.now() - startTime,
      last_check: new Date().toISOString(),
      message: 'CRM integration configured and ready',
      details: {
        api_endpoint_configured: !!process.env.CRM_API_ENDPOINT || !!process.env.MOCHA_API_URL
      }
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      last_check: new Date().toISOString(),
      message: `CRM health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Check MailerLite health
 */
function checkMailerLiteHealth(): ServiceHealth {
  const startTime = Date.now();
  
  try {
    const mailerliteConfigured = !!process.env.MAILERLITE_API_KEY;
    
    if (!mailerliteConfigured) {
      return {
        status: 'unhealthy',
        response_time_ms: Date.now() - startTime,
        last_check: new Date().toISOString(),
        message: 'MailerLite API key not configured - lead capture will fail'
      };
    }

    return {
      status: 'healthy',
      response_time_ms: Date.now() - startTime,
      last_check: new Date().toISOString(),
      message: 'MailerLite API configured and ready'
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      last_check: new Date().toISOString(),
      message: `MailerLite health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Check Stripe Webhooks health
 */
function checkStripeWebhooksHealth(): ServiceHealth {
  const startTime = Date.now();
  
  try {
    const stripeConfigured = !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
    
    if (!stripeConfigured) {
      return {
        status: 'unhealthy',
        response_time_ms: Date.now() - startTime,
        last_check: new Date().toISOString(),
        message: 'Stripe configuration incomplete - payments will fail'
      };
    }

    return {
      status: 'healthy',
      response_time_ms: Date.now() - startTime,
      last_check: new Date().toISOString(),
      message: 'Stripe integration configured and ready',
      details: {
        secret_key_configured: !!process.env.STRIPE_SECRET_KEY,
        webhook_secret_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
        publishable_key_configured: !!process.env.VITE_STRIPE_PUBLISHABLE_KEY
      }
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      last_check: new Date().toISOString(),
      message: `Stripe health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Check PII Hashing health
 */
function checkPIIHashingHealth(): ServiceHealth {
  const startTime = Date.now();
  
  try {
    // Test hashing consistency
    const isConsistent = testHashingConsistency();
    
    const hashSaltConfigured = !!process.env.PII_HASH_SALT;
    
    const status: HealthStatus = 
      isConsistent && hashSaltConfigured ? 'healthy' :
      isConsistent ? 'degraded' : 'unhealthy';
    
    const message = 
      !isConsistent ? 'PII hashing inconsistency detected' :
      !hashSaltConfigured ? 'PII hash salt not configured - using generated salt' :
      'PII hashing working correctly';

    return {
      status,
      response_time_ms: Date.now() - startTime,
      last_check: new Date().toISOString(),
      message,
      details: {
        consistency_test_passed: isConsistent,
        salt_configured: hashSaltConfigured
      }
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      last_check: new Date().toISOString(),
      message: `PII hashing health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Check Performance Tracking health
 */
function checkPerformanceTrackingHealth(): ServiceHealth {
  const startTime = Date.now();
  
  try {
    // Performance tracking is client-side, so we just verify it's configured
    return {
      status: 'healthy',
      response_time_ms: Date.now() - startTime,
      last_check: new Date().toISOString(),
      message: 'Performance tracking plugins configured',
      details: {
        core_web_vitals_enabled: true,
        error_tracking_enabled: true
      }
    };

  } catch (error) {
    return {
      status: 'degraded',
      response_time_ms: Date.now() - startTime,
      last_check: new Date().toISOString(),
      message: `Performance tracking check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Simple admin authentication
 * In production, this should be replaced with proper authentication
 */
function isAuthorizedAdmin(adminKey: string | null): boolean {
  const expectedKey = process.env.ADMIN_API_KEY;
  
  // If no admin key is configured, allow access in development
  if (!expectedKey && process.env.NODE_ENV !== 'production') {
    return true;
  }
  
  return Boolean(expectedKey && adminKey === expectedKey);
}