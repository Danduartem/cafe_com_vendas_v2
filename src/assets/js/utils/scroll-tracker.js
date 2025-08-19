/**
 * Scroll Depth Tracking Utility for GTM
 * Tracks scroll depth at 10%, 25%, 50%, 75%, and 90% thresholds
 */

import { throttle } from './throttle.js';

export const ScrollTracker = {
  // Track which thresholds have already fired
  firedThresholds: {
    10: false,
    25: false,
    50: false,
    75: false,
    90: false
  },

  /**
   * Initialize scroll depth tracking
   */
  init() {
    // Ensure dataLayer exists
    window.dataLayer = window.dataLayer || [];
    
    // Create throttled scroll handler
    const handleScroll = throttle(() => {
      this.checkScrollDepth();
    }, 500);

    // Listen for scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also check on resize as viewport changes affect scroll percentages
    window.addEventListener('resize', throttle(() => {
      this.checkScrollDepth();
    }, 1000), { passive: true });

    // Check initial scroll position (in case user lands mid-page)
    setTimeout(() => {
      this.checkScrollDepth();
    }, 1000);
  },

  /**
   * Calculate current scroll percentage and fire events at thresholds
   */
  checkScrollDepth() {
    try {
      // Calculate current scroll percentage
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      
      // Prevent division by zero
      if (documentHeight <= windowHeight) {
        return; // Page is too short to scroll
      }
      
      // Calculate percentage (0-100)
      const scrollPercent = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );

      // Check each threshold
      const thresholds = [10, 25, 50, 75, 90];
      
      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !this.firedThresholds[threshold]) {
          this.fireScrollEvent(threshold);
          this.firedThresholds[threshold] = true;
        }
      });
    } catch (error) {
      console.error('Error in scroll depth tracking:', error);
    }
  },

  /**
   * Fire scroll depth event to GTM dataLayer
   * @param {number} threshold - The scroll percentage threshold reached
   */
  fireScrollEvent(threshold) {
    const eventData = {
      event: 'scroll_depth',
      percent_scrolled: threshold,
      timestamp: new Date().toISOString()
    };

    // Push to dataLayer
    window.dataLayer.push(eventData);

    // Debug logging in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log(`[GTM Scroll] Depth reached: ${threshold}%`);
    }
  },

  /**
   * Reset tracking (useful for SPAs or dynamic content)
   */
  reset() {
    this.firedThresholds = {
      10: false,
      25: false,
      50: false,
      75: false,
      90: false
    };
  }
};