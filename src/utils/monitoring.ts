/**
 * Unified System Monitoring Utility - Phase 3 Operational Excellence
 * Provides shared monitoring functions, performance tracking, and system metrics
 * Used by health check API, admin dashboard, and automated reporting
 */

/**
 * System performance metrics structure
 */
export interface SystemMetrics {
  timestamp: string;
  
  // Performance metrics
  response_times: {
    avg_ms: number;
    p95_ms: number;
    p99_ms: number;
  };
  
  // Business metrics  
  conversion_rate: number;
  error_rate: number;
  uptime_percentage: number;
  
  // Traffic metrics
  page_views: number;
  unique_visitors: number;
  bounce_rate: number;
  
  // System resource usage
  memory_usage_mb?: number;
  cpu_usage_percent?: number;
}

/**
 * Real-time monitoring event structure
 */
export interface MonitoringEvent {
  id: string;
  timestamp: string;
  event_type: 'error' | 'warning' | 'info' | 'performance' | 'business';
  service: string;
  message: string;
  metadata?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Performance tracking bucket for metrics aggregation
 */
interface PerformanceBucket {
  timestamp: number;
  response_times: number[];
  errors: number;
  requests: number;
}

/**
 * System Monitoring Manager
 * Handles metrics collection, aggregation, and real-time monitoring
 */
export class SystemMonitoringManager {
  private static instance: SystemMonitoringManager;
  private performanceBuckets = new Map<string, PerformanceBucket>();
  private monitoringEvents: MonitoringEvent[] = [];
  private metricsSubscribers = new Set<(metrics: SystemMetrics) => void>();
  
  // Configuration
  private readonly BUCKET_SIZE_MS = 60000; // 1 minute buckets
  private readonly MAX_EVENTS = 1000; // Keep last 1000 events
  private readonly MAX_BUCKETS = 60; // Keep 1 hour of buckets
  
  static getInstance(): SystemMonitoringManager {
    if (!SystemMonitoringManager.instance) {
      SystemMonitoringManager.instance = new SystemMonitoringManager();
    }
    return SystemMonitoringManager.instance;
  }

  /**
   * Record API response time for performance tracking
   */
  recordResponseTime(endpoint: string, responseTimeMs: number, success: boolean): void {
    const bucketKey = this.getBucketKey(endpoint);
    const bucket = this.getOrCreateBucket(bucketKey);
    
    bucket.response_times.push(responseTimeMs);
    bucket.requests++;
    
    if (!success) {
      bucket.errors++;
    }

    // Emit real-time event for slow responses
    if (responseTimeMs > 5000) {
      this.emitMonitoringEvent({
        event_type: 'warning',
        service: endpoint,
        message: `Slow response: ${responseTimeMs}ms`,
        metadata: { response_time_ms: responseTimeMs },
        severity: responseTimeMs > 10000 ? 'high' : 'medium'
      });
    }
  }

  /**
   * Record business event (conversion, error, etc.)
   */
  recordBusinessEvent(eventType: string, data: Record<string, unknown>): void {
    this.emitMonitoringEvent({
      event_type: 'business',
      service: 'business_metrics',
      message: `Business event: ${eventType}`,
      metadata: data,
      severity: 'low'
    });
  }

  /**
   * Record system error
   */
  recordError(service: string, error: Error, context?: Record<string, unknown>): void {
    this.emitMonitoringEvent({
      event_type: 'error',
      service,
      message: error.message,
      metadata: {
        error_stack: error.stack?.substring(0, 500),
        ...context
      },
      severity: 'high'
    });
  }

  /**
   * Get current system metrics
   */
  getCurrentMetrics(): SystemMetrics {
    const now = Date.now();
    const recentBuckets = Array.from(this.performanceBuckets.values())
      .filter(bucket => now - bucket.timestamp < this.BUCKET_SIZE_MS * 5) // Last 5 minutes
      .filter(bucket => bucket.requests > 0);

    // Calculate response time percentiles
    const allResponseTimes = recentBuckets
      .flatMap(bucket => bucket.response_times)
      .sort((a, b) => a - b);

    const avg_ms = allResponseTimes.length > 0 
      ? Math.round(allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length)
      : 0;

    const p95_ms = allResponseTimes.length > 0 
      ? Math.round(allResponseTimes[Math.floor(allResponseTimes.length * 0.95)] || 0)
      : 0;

    const p99_ms = allResponseTimes.length > 0 
      ? Math.round(allResponseTimes[Math.floor(allResponseTimes.length * 0.99)] || 0)
      : 0;

    // Calculate error rate
    const totalRequests = recentBuckets.reduce((sum, bucket) => sum + bucket.requests, 0);
    const totalErrors = recentBuckets.reduce((sum, bucket) => sum + bucket.errors, 0);
    const error_rate = totalRequests > 0 ? Math.round((totalErrors / totalRequests) * 100) : 0;

    return {
      timestamp: new Date().toISOString(),
      response_times: { avg_ms, p95_ms, p99_ms },
      conversion_rate: 0, // TODO: Calculate from business events
      error_rate,
      uptime_percentage: 99.9, // TODO: Calculate actual uptime
      page_views: 0, // TODO: Get from analytics
      unique_visitors: 0, // TODO: Get from analytics  
      bounce_rate: 0 // TODO: Get from analytics
    };
  }

  /**
   * Get recent monitoring events
   */
  getRecentEvents(limit = 50, severity?: MonitoringEvent['severity']): MonitoringEvent[] {
    let events = [...this.monitoringEvents];
    
    if (severity) {
      events = events.filter(event => event.severity === severity);
    }
    
    return events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Subscribe to real-time metrics updates
   */
  subscribeToMetrics(callback: (metrics: SystemMetrics) => void): () => void {
    this.metricsSubscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.metricsSubscribers.delete(callback);
    };
  }

  /**
   * Start real-time metrics broadcasting
   */
  startMetricsBroadcast(intervalMs = 30000): void {
    setInterval(() => {
      const metrics = this.getCurrentMetrics();
      this.metricsSubscribers.forEach(callback => {
        try {
          callback(metrics);
        } catch (error) {
          console.error('Metrics subscriber error:', error);
        }
      });
    }, intervalMs);
  }

  /**
   * Clear old data to prevent memory leaks
   */
  cleanup(): void {
    const cutoffTime = Date.now() - (this.BUCKET_SIZE_MS * this.MAX_BUCKETS);
    
    // Remove old buckets
    for (const [key, bucket] of this.performanceBuckets.entries()) {
      if (bucket.timestamp < cutoffTime) {
        this.performanceBuckets.delete(key);
      }
    }

    // Keep only recent events
    if (this.monitoringEvents.length > this.MAX_EVENTS) {
      this.monitoringEvents = this.monitoringEvents
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, this.MAX_EVENTS);
    }
  }

  /**
   * Get monitoring statistics
   */
  getMonitoringStats(): {
    total_events: number;
    events_by_severity: Record<MonitoringEvent['severity'], number>;
    events_by_service: Record<string, number>;
    buckets_count: number;
    memory_usage: {
      events_mb: number;
      buckets_mb: number;
    };
  } {
    // Count events by severity
    const events_by_severity = this.monitoringEvents.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<MonitoringEvent['severity'], number>);

    // Count events by service
    const events_by_service = this.monitoringEvents.reduce((acc, event) => {
      acc[event.service] = (acc[event.service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Rough memory usage calculation
    const events_mb = (JSON.stringify(this.monitoringEvents).length / 1024 / 1024);
    const buckets_mb = (JSON.stringify(Array.from(this.performanceBuckets.values())).length / 1024 / 1024);

    return {
      total_events: this.monitoringEvents.length,
      events_by_severity,
      events_by_service,
      buckets_count: this.performanceBuckets.size,
      memory_usage: {
        events_mb: Math.round(events_mb * 100) / 100,
        buckets_mb: Math.round(buckets_mb * 100) / 100
      }
    };
  }

  /**
   * Export monitoring data for analysis
   */
  exportMonitoringData(hours = 24): {
    metrics: SystemMetrics[];
    events: MonitoringEvent[];
    export_timestamp: string;
  } {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    
    const recentEvents = this.monitoringEvents.filter(
      event => new Date(event.timestamp).getTime() > cutoffTime
    );

    return {
      metrics: [this.getCurrentMetrics()], // TODO: Store historical metrics
      events: recentEvents,
      export_timestamp: new Date().toISOString()
    };
  }

  /**
   * Private helper methods
   */
  private getBucketKey(endpoint: string): string {
    const bucketTime = Math.floor(Date.now() / this.BUCKET_SIZE_MS) * this.BUCKET_SIZE_MS;
    return `${endpoint}-${bucketTime}`;
  }

  private getOrCreateBucket(bucketKey: string): PerformanceBucket {
    if (!this.performanceBuckets.has(bucketKey)) {
      this.performanceBuckets.set(bucketKey, {
        timestamp: Date.now(),
        response_times: [],
        errors: 0,
        requests: 0
      });
    }
    return this.performanceBuckets.get(bucketKey)!;
  }

  private emitMonitoringEvent(partialEvent: Omit<MonitoringEvent, 'id' | 'timestamp'>): void {
    const event: MonitoringEvent = {
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      ...partialEvent
    };

    this.monitoringEvents.push(event);

    // Auto-cleanup if we're getting too many events
    if (this.monitoringEvents.length > this.MAX_EVENTS) {
      this.cleanup();
    }
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}

/**
 * Performance monitoring decorator for API functions
 */
export function withPerformanceMonitoring<TArgs extends unknown[], TReturn>(
  endpoint: string,
  fn: (...args: TArgs) => Promise<TReturn>
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    const monitor = SystemMonitoringManager.getInstance();
    const startTime = Date.now();
    
    try {
      const result = await fn(...args);
      const responseTime = Date.now() - startTime;
      
      monitor.recordResponseTime(endpoint, responseTime, true);
      return result;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      monitor.recordResponseTime(endpoint, responseTime, false);
      monitor.recordError(endpoint, error instanceof Error ? error : new Error(String(error)));
      
      throw error;
    }
  };
}

/**
 * Simple client-side performance tracker
 */
export class ClientPerformanceTracker {
  private static measurements = new Map<string, number>();

  /**
   * Start timing an operation
   */
  static startTiming(operationName: string): void {
    this.measurements.set(operationName, Date.now());
  }

  /**
   * End timing and report to monitoring
   */
  static endTiming(operationName: string): number {
    const startTime = this.measurements.get(operationName);
    if (!startTime) {
      console.warn(`No start time found for operation: ${operationName}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.measurements.delete(operationName);

    // Send to server monitoring if available
    if (typeof window !== 'undefined' && 'fetch' in window) {
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: operationName,
          duration_ms: duration,
          timestamp: new Date().toISOString()
        })
      }).catch(error => {
        console.warn('Failed to report performance metric:', error);
      });
    }

    return duration;
  }

  /**
   * Report Core Web Vital
   */
  static reportCoreWebVital(metricName: string, value: number): void {
    if (typeof window !== 'undefined' && 'fetch' in window) {
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric_type: 'core_web_vital',
          metric_name: metricName,
          value,
          timestamp: new Date().toISOString()
        })
      }).catch(error => {
        console.warn('Failed to report Core Web Vital:', error);
      });
    }
  }
}

/**
 * Utility functions for monitoring
 */
export const MonitoringUtils = {
  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Format duration to human readable format
   */
  formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  },

  /**
   * Get health status color for UI
   */
  getHealthColor(status: 'healthy' | 'degraded' | 'unhealthy'): string {
    switch (status) {
      case 'healthy': return '#10B981'; // green-500
      case 'degraded': return '#F59E0B'; // amber-500
      case 'unhealthy': return '#EF4444'; // red-500
      default: return '#6B7280'; // gray-500
    }
  },

  /**
   * Calculate uptime percentage
   */
  calculateUptime(totalSeconds: number, downtimeSeconds: number): number {
    if (totalSeconds <= 0) return 100;
    return Math.round(((totalSeconds - downtimeSeconds) / totalSeconds) * 10000) / 100;
  }
};

// Initialize monitoring manager and start cleanup
if (typeof window === 'undefined') {
  // Server-side: Start cleanup interval
  const monitor = SystemMonitoringManager.getInstance();
  setInterval(() => monitor.cleanup(), 300000); // Cleanup every 5 minutes
}