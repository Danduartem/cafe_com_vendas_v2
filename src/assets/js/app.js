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
    Checkout
} from './components/index.js';

export const CafeComVendas = {
    /**
     * Initialize all components and functionality
     */
    init() {
        if (state.isInitialized) {
            console.warn('CafeComVendas already initialized');
            return;
        }
        
        try {
            console.log('Initializing Café com Vendas landing page...');
            
            // Initialize analytics first
            Analytics.initPerformanceTracking();
            Analytics.initScrollDepthTracking();
            
            // Initialize all components
            this.initializeComponents();
            
            StateManager.setInitialized(true);
            console.log('Café com Vendas initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Café com Vendas:', error);
        }
    },
    
    /**
     * Initialize all page components
     */
    initializeComponents() {
        const components = [
            { name: 'Checkout', component: Checkout }, // Initialize first for modal availability
            { name: 'Hero', component: Hero },
            { name: 'Banner', component: Banner },
            { name: 'YouTube', component: YouTube },
            { name: 'Offer', component: Offer },
            { name: 'FAQ', component: FAQ },
            { name: 'FinalCTA', component: FinalCTA },
            { name: 'Footer', component: Footer },
            { name: 'Testimonials', component: Testimonials },
            { name: 'ThankYou', component: ThankYou }
        ];
        
        components.forEach(({ name, component }) => {
            try {
                if (component && typeof component.init === 'function') {
                    component.init();
                    console.log(`✓ ${name} component initialized`);
                }
            } catch (error) {
                console.error(`✗ Failed to initialize ${name} component:`, error);
            }
        });
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
    }
};