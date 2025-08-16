/**
 * Main Application Controller for Café com Vendas
 * Orchestrates all components and manages application lifecycle
 */

import { CONFIG } from './config/constants.js';
import { state, StateManager } from './core/state.js';
import { Analytics } from './core/analytics.js';
import {
  Hero,
  Banner,
  YouTube,
  Offer,
  FAQ,
  FinalCTA,
  Footer,
  Testimonials,
  ThankYou,
  Checkout,
  CloudinaryComponent,
  GTM,
  About
} from './components/index.js';

export const CafeComVendas = {
  /**
     * Initialize all components and functionality with enhanced error handling
     */
  init() {
    if (state.isInitialized) {
      console.warn('CafeComVendas already initialized');
      return;
    }

    try {
      console.log('Initializing Café com Vendas landing page...');

      // Set up global error handling
      this.setupGlobalErrorHandling();

      // Initialize analytics first
      Analytics.initPerformanceTracking();
      Analytics.initScrollDepthTracking();

      // Initialize all components
      this.initializeComponents();

      StateManager.setInitialized(true);
      console.log('Café com Vendas initialized successfully');

      // Track successful initialization
      Analytics.track('app_initialized', {
        event_category: 'Application',
        components_count: this.getComponentCount()
      });

    } catch (error) {
      Analytics.trackError('app_initialization_failed', error);
      console.error('Failed to initialize Café com Vendas:', error);
    }
  },

  /**
     * Set up global error handling for better debugging
     */
  setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      Analytics.trackError('unhandled_promise_rejection', {
        message: event.reason?.message || 'Unknown promise rejection',
        stack: event.reason?.stack
      });
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      Analytics.trackError('global_javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });
  },

  /**
     * Initialize all page components with enhanced error handling
     */
  initializeComponents() {
    const components = [
      { name: 'CloudinaryComponent', component: CloudinaryComponent },
      { name: 'Checkout', component: Checkout },
      { name: 'Hero', component: Hero },
      { name: 'Banner', component: Banner },
      { name: 'GTM', component: GTM },
      { name: 'YouTube', component: YouTube },
      { name: 'About', component: About },
      { name: 'Offer', component: Offer },
      { name: 'FAQ', component: FAQ },
      { name: 'FinalCTA', component: FinalCTA },
      { name: 'Footer', component: Footer },
      { name: 'Testimonials', component: Testimonials },
      { name: 'ThankYou', component: ThankYou }
    ];

    let successCount = 0;
    let failureCount = 0;

    components.forEach(({ name, component }) => {
      try {
        if (component && typeof component.init === 'function') {
          component.init();
          console.log(`✓ ${name} component initialized`);
          successCount++;
        } else {
          console.warn(`⚠ ${name} component missing or invalid init method`);
          failureCount++;
        }
      } catch (error) {
        console.error(`✗ Failed to initialize ${name} component:`, error);
        Analytics.trackError('component_initialization_failed', error, {
          component_name: name
        });
        failureCount++;
      }
    });

    Analytics.track('components_initialized', {
      event_category: 'Application',
      success_count: successCount,
      failure_count: failureCount,
      total_components: components.length
    });

    this.components = components;
  },

  /**
     * Get total component count
     */
  getComponentCount() {
    return this.components ? this.components.length : 0;
  },

  /**
     * Get current state for debugging
     */
  getState() {
    return StateManager.getSnapshot();
  },

  /**
     * Get configuration
     */
  getConfig() {
    return CONFIG;
  },

  /**
     * Get component health status for debugging
     */
  getComponentStatus() {
    if (!this.components) return { status: 'not_initialized' };

    const status = this.components.map(({ name, component }) => ({
      name,
      initialized: component && typeof component.init === 'function',
      hasInit: typeof component?.init === 'function'
    }));

    return {
      status: 'initialized',
      components: status,
      total: status.length,
      healthy: status.filter(c => c.initialized).length
    };
  }
};