/**
 * Admin Dashboard - Phase 3 Operational Excellence
 * Real-time system monitoring dashboard with health status, metrics, and alerts
 * Following Tailwind v4 CSS-first patterns and TypeScript strict mode
 */

// Simplified imports to avoid build issues
// import type { SystemMetrics, MonitoringEvent } from '../../utils/monitoring.js';
// import { MonitoringUtils } from '../../utils/monitoring.js';

// Temporary type definitions
interface SystemMetrics {
  timestamp: string;
  response_times: { avg_ms: number; p95_ms: number; p99_ms: number };
  conversion_rate: number;
  error_rate: number;
  uptime_percentage: number;
  page_views: number;
  unique_visitors: number;
  bounce_rate: number;
}

interface MonitoringEvent {
  id: string;
  timestamp: string;
  event_type: string;
  service: string;
  message: string;
  severity: string;
  metadata?: Record<string, unknown>;
}

/**
 * Dashboard configuration
 */
interface DashboardConfig {
  apiEndpoint: string;
  adminKey: string;
  refreshInterval: number;
  maxEvents: number;
  enableRealTime: boolean;
}

/**
 * Health data structure from API
 */
interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime_seconds: number;
  version: string;
  environment: string;
  services: Record<string, {
    status: 'healthy' | 'degraded' | 'unhealthy';
    response_time_ms: number;
    last_check: string;
    message?: string;
    details?: Record<string, unknown>;
  }>;
  summary: {
    healthy_services: number;
    total_services: number;
    overall_health_percentage: number;
    critical_issues: string[];
    warnings: string[];
  };
}

/**
 * Dashboard state management
 */
interface DashboardState {
  isLoading: boolean;
  lastUpdate: Date | null;
  healthData: HealthData | null;
  metrics: SystemMetrics | null;
  events: MonitoringEvent[];
  error: string | null;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

/**
 * Admin Dashboard Main Class
 * Handles real-time monitoring, data visualization, and user interactions
 */
export class AdminDashboard {
  private config: DashboardConfig;
  private state: DashboardState;
  private refreshTimer: number | null = null;
  private eventSource: EventSource | null = null;
  private container: HTMLElement | null = null;

  constructor(config: Partial<DashboardConfig> = {}) {
    this.config = {
      apiEndpoint: '/api/health-check',
      adminKey: '',
      refreshInterval: 30000, // 30 seconds
      maxEvents: 100,
      enableRealTime: true,
      ...config
    };

    this.state = {
      isLoading: false,
      lastUpdate: null,
      healthData: null,
      metrics: null,
      events: [],
      error: null,
      connectionStatus: 'disconnected'
    };
  }

  /**
   * Initialize the dashboard
   */
  async initialize(containerId: string): Promise<void> {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Dashboard container "${containerId}" not found`);
    }

    // Create dashboard structure
    this.renderDashboardStructure();

    // Load initial data
    await this.refreshData();

    // Start auto-refresh
    this.startAutoRefresh();

    // Set up real-time updates
    if (this.config.enableRealTime) {
      this.setupRealTimeUpdates();
    }

    // Set up event listeners
    this.setupEventListeners();

    console.warn('[Admin Dashboard] Dashboard initialized successfully');
  }

  /**
   * Refresh dashboard data
   */
  async refreshData(): Promise<void> {
    this.setState({ isLoading: true, error: null });

    try {
      // Fetch health data
      const healthResponse = await fetch(
        `${this.config.apiEndpoint}?admin_key=${encodeURIComponent(this.config.adminKey)}&detailed=true`,
        {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache'
          }
        }
      );

      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
      }

      const healthData = await healthResponse.json() as HealthData;

      this.setState({
        isLoading: false,
        healthData,
        lastUpdate: new Date(),
        connectionStatus: 'connected'
      });

      this.renderHealthStatus();
      this.renderSystemMetrics();
      this.renderServiceStatus();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.setState({
        isLoading: false,
        error: errorMessage,
        connectionStatus: 'disconnected'
      });

      this.renderError();
    }
  }

  /**
   * Create dashboard HTML structure
   */
  private renderDashboardStructure(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="admin-dashboard">
        <!-- Dashboard Header -->
        <header class="dashboard-header">
          <div class="header-content">
            <h1 class="dashboard-title">System Dashboard</h1>
            <div class="header-actions">
              <button id="refresh-btn" class="btn btn-primary" aria-label="Refresh dashboard">
                <span class="btn-icon">🔄</span>
                <span>Refresh</span>
              </button>
              <div class="connection-status">
                <span id="connection-indicator" class="status-indicator"></span>
                <span id="last-update">Never</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Dashboard Content -->
        <main class="dashboard-content">
          <!-- System Health Overview -->
          <section class="dashboard-section">
            <h2 class="section-title">System Health</h2>
            <div id="health-overview" class="health-overview">
              <div class="loading-state">Loading system health...</div>
            </div>
          </section>

          <!-- Performance Metrics -->
          <section class="dashboard-section">
            <h2 class="section-title">Performance Metrics</h2>
            <div id="metrics-grid" class="metrics-grid">
              <div class="loading-state">Loading performance metrics...</div>
            </div>
          </section>

          <!-- Service Status -->
          <section class="dashboard-section">
            <h2 class="section-title">Service Status</h2>
            <div id="services-list" class="services-list">
              <div class="loading-state">Loading service status...</div>
            </div>
          </section>

          <!-- Recent Events -->
          <section class="dashboard-section">
            <h2 class="section-title">Recent Events</h2>
            <div id="events-list" class="events-list">
              <div class="loading-state">Loading recent events...</div>
            </div>
          </section>

          <!-- Error Display -->
          <div id="error-display" class="error-display hidden" role="alert">
            <div class="error-content">
              <span class="error-icon">⚠️</span>
              <div class="error-message">
                <p id="error-text">An error occurred</p>
                <button id="retry-btn" class="btn btn-secondary">Try Again</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  }

  /**
   * Render system health overview
   */
  private renderHealthStatus(): void {
    const healthOverview = document.getElementById('health-overview');
    if (!healthOverview || !this.state.healthData) return;

    const { status, summary } = this.state.healthData;
    const healthColor = this.getHealthColor(status);

    healthOverview.innerHTML = `
      <div class="health-card">
        <div class="health-status" style="--health-color: ${healthColor}">
          <div class="status-icon ${status}"></div>
          <div class="status-info">
            <h3 class="status-title">${status.toUpperCase()}</h3>
            <p class="status-detail">${summary.overall_health_percentage}% system health</p>
          </div>
        </div>
        
        <div class="health-stats">
          <div class="stat-item">
            <span class="stat-label">Services</span>
            <span class="stat-value">${summary.healthy_services}/${summary.total_services}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Uptime</span>
            <span class="stat-value">${this.formatDuration(this.state.healthData.uptime_seconds)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Version</span>
            <span class="stat-value">${this.state.healthData.version}</span>
          </div>
        </div>

        ${summary.critical_issues.length > 0 ? `
          <div class="critical-issues">
            <h4 class="issues-title">Critical Issues</h4>
            <ul class="issues-list">
              ${summary.critical_issues.map((issue: string) => 
                `<li class="issue-item critical">${this.escapeHtml(issue)}</li>`
              ).join('')}
            </ul>
          </div>
        ` : ''}

        ${summary.warnings.length > 0 ? `
          <div class="warnings">
            <h4 class="warnings-title">Warnings</h4>
            <ul class="warnings-list">
              ${summary.warnings.map((warning: string) => 
                `<li class="warning-item">${this.escapeHtml(warning)}</li>`
              ).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render performance metrics
   */
  private renderSystemMetrics(): void {
    const metricsGrid = document.getElementById('metrics-grid');
    if (!metricsGrid || !this.state.healthData) return;

    // For now, we'll show basic metrics from health data
    // TODO: Replace with actual metrics from monitoring utility
    const responseTime = Object.values(this.state.healthData.services)
      .map((service) => service.response_time_ms || 0)
      .reduce((sum: number, time: number) => sum + time, 0) / 
      Object.keys(this.state.healthData.services).length;

    metricsGrid.innerHTML = `
      <div class="metric-card">
        <div class="metric-header">
          <h3 class="metric-title">Avg Response Time</h3>
          <span class="metric-icon">⚡</span>
        </div>
        <div class="metric-value">${Math.round(responseTime)}ms</div>
        <div class="metric-trend positive">↗ Good</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <h3 class="metric-title">System Health</h3>
          <span class="metric-icon">💚</span>
        </div>
        <div class="metric-value">${this.state.healthData.summary.overall_health_percentage}%</div>
        <div class="metric-trend ${this.state.healthData.summary.overall_health_percentage >= 95 ? 'positive' : 'negative'}">
          ${this.state.healthData.summary.overall_health_percentage >= 95 ? '↗ Excellent' : '↘ Needs attention'}
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <h3 class="metric-title">Uptime</h3>
          <span class="metric-icon">⏱️</span>
        </div>
        <div class="metric-value">${this.formatDuration(this.state.healthData.uptime_seconds)}</div>
        <div class="metric-trend positive">↗ Stable</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <h3 class="metric-title">Active Services</h3>
          <span class="metric-icon">🔧</span>
        </div>
        <div class="metric-value">${this.state.healthData.summary.healthy_services}</div>
        <div class="metric-trend positive">All operational</div>
      </div>
    `;
  }

  /**
   * Render individual service status
   */
  private renderServiceStatus(): void {
    const servicesList = document.getElementById('services-list');
    if (!servicesList || !this.state.healthData) return;

    const servicesHtml = Object.entries(this.state.healthData.services)
      .map(([serviceName, serviceData]) => {
        const healthColor = this.getHealthColor(serviceData.status);
        const statusIcon = serviceData.status === 'healthy' ? '✅' : 
                          serviceData.status === 'degraded' ? '⚠️' : '❌';

        return `
          <div class="service-card">
            <div class="service-header">
              <div class="service-info">
                <span class="service-icon">${statusIcon}</span>
                <div class="service-details">
                  <h3 class="service-name">${this.formatServiceName(serviceName)}</h3>
                  <p class="service-message">${serviceData.message || 'No additional information'}</p>
                </div>
              </div>
              <div class="service-status" style="--status-color: ${healthColor}">
                <span class="status-badge ${serviceData.status}">${serviceData.status}</span>
                <span class="response-time">${serviceData.response_time_ms}ms</span>
              </div>
            </div>
            
            ${serviceData.details ? `
              <div class="service-details-expanded">
                <details class="service-details-toggle">
                  <summary>Details</summary>
                  <pre class="service-details-json">${JSON.stringify(serviceData.details, null, 2)}</pre>
                </details>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');

    servicesList.innerHTML = servicesHtml;
  }

  /**
   * Render error state
   */
  private renderError(): void {
    const errorDisplay = document.getElementById('error-display');
    const errorText = document.getElementById('error-text');
    
    if (!errorDisplay || !errorText) return;

    errorText.textContent = this.state.error || 'An unknown error occurred';
    errorDisplay.classList.remove('hidden');
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn?.addEventListener('click', () => {
      void this.refreshData();
    });

    // Retry button  
    const retryBtn = document.getElementById('retry-btn');
    retryBtn?.addEventListener('click', () => {
      const errorDisplay = document.getElementById('error-display');
      errorDisplay?.classList.add('hidden');
      void this.refreshData();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      if (event.key === 'F5' || (event.metaKey && event.key === 'r')) {
        event.preventDefault();
        void this.refreshData();
      }
    });
  }

  /**
   * Set up real-time updates
   */
  private setupRealTimeUpdates(): void {
    // TODO: Implement Server-Sent Events for real-time updates
    console.warn('[Admin Dashboard] Real-time updates would be implemented here');
  }

  /**
   * Start auto-refresh timer
   */
  private startAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = window.setInterval(() => {
      if (this.state.connectionStatus === 'connected') {
        void this.refreshData();
      }
    }, this.config.refreshInterval);
  }

  /**
   * Stop auto-refresh timer
   */
  private stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Update dashboard state
   */
  private setState(newState: Partial<DashboardState>): void {
    this.state = { ...this.state, ...newState };
    
    // Update connection indicator
    this.updateConnectionStatus();
    
    // Update last update time
    if (newState.lastUpdate) {
      this.updateLastUpdateTime();
    }
  }

  /**
   * Update connection status indicator
   */
  private updateConnectionStatus(): void {
    const indicator = document.getElementById('connection-indicator');
    if (!indicator) return;

    indicator.className = `status-indicator ${this.state.connectionStatus}`;
    indicator.setAttribute('aria-label', `Connection status: ${this.state.connectionStatus}`);
  }

  /**
   * Update last update timestamp
   */
  private updateLastUpdateTime(): void {
    const lastUpdateElement = document.getElementById('last-update');
    if (!lastUpdateElement || !this.state.lastUpdate) return;

    lastUpdateElement.textContent = `Last updated: ${this.state.lastUpdate.toLocaleTimeString()}`;
  }

  /**
   * Utility methods
   */
  private formatServiceName(serviceName: string): string {
    return serviceName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  private getHealthColor(status: string): string {
    switch (status) {
      case 'healthy':
        return '#10b981'; // green-500
      case 'degraded':
        return '#f59e0b'; // amber-500
      case 'unhealthy':
        return '#ef4444'; // red-500
      default:
        return '#6b7280'; // gray-500
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopAutoRefresh();
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    console.warn('[Admin Dashboard] Dashboard destroyed');
  }
}

/**
 * Initialize dashboard when DOM is ready
 */
export function initializeAdminDashboard(config: Partial<DashboardConfig> = {}): AdminDashboard {
  const dashboard = new AdminDashboard(config);
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      void dashboard.initialize('admin-dashboard-container');
    });
  } else {
    void dashboard.initialize('admin-dashboard-container');
  }
  
  return dashboard;
}

// Ensure functions are preserved in build by making them globally available
declare global {
  interface Window {
    initializeAdminDashboard?: typeof initializeAdminDashboard;
    AdminDashboard?: typeof AdminDashboard;
  }
}

if (typeof globalThis !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (globalThis as any).initializeAdminDashboard = initializeAdminDashboard;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (globalThis as any).AdminDashboard = AdminDashboard;
}