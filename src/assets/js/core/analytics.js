/**
 * Analytics Module for Café com Vendas
 * Handles all tracking and performance monitoring
 */

import { CONFIG } from '../config/constants.js';
import { state, StateManager } from './state.js';
import { throttle } from '../utils/throttle.js';

export const Analytics = {
    /**
     * Track event with Google Analytics if available
     */
    track(eventName, parameters = {}) {
        // Console logging for debugging
        console.log(`Analytics: ${eventName}`, parameters);
        
        // Google Analytics integration
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
    },
    
    /**
     * Initialize performance tracking
     */
    initPerformanceTracking() {
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        this.track(CONFIG.analytics.events.HERO_LCP, {
                            custom_parameter: entry.startTime,
                            event_category: 'Performance'
                        });
                    }
                }
            });
            lcpObserver.observe({entryTypes: ['largest-contentful-paint']});
        } catch (error) {
            console.warn('Performance tracking not available:', error);
        }
    },
    
    /**
     * Initialize scroll depth tracking
     */
    initScrollDepthTracking() {
        const trackScrollDepth = throttle(() => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            CONFIG.scroll.thresholds.forEach(threshold => {
                if (scrollPercent >= threshold && !state.scrollDepth[threshold]) {
                    state.scrollDepth[threshold] = true;
                    this.track(CONFIG.analytics.events.SCROLL_DEPTH, {
                        event_category: 'Engagement',
                        event_label: `${threshold}%`,
                        value: threshold
                    });
                }
            });
        }, CONFIG.scroll.throttle);
        
        window.addEventListener('scroll', trackScrollDepth, { passive: true });
    },
    
    /**
     * Track FAQ engagement time
     */
    trackFAQEngagement(faqId, isOpening) {
        if (isOpening) {
            StateManager.markFAQOpened(faqId);
        } else {
            const engagementTime = StateManager.getFAQEngagementTime(faqId);
            
            if (engagementTime > 3) {
                this.track('faq_meaningful_engagement', {
                    event_category: 'FAQ',
                    event_label: faqId,
                    value: engagementTime
                });
            }
        }
    }
};