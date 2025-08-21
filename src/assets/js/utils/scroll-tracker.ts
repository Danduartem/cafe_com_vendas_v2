/**
 * Scroll Depth Tracking Utility for GTM
 * Tracks scroll depth at 10%, 25%, 50%, 75%, and 90% thresholds
 */

import { throttle } from './throttle.js';
import type { ScrollDepthEvent } from '@/types/analytics.js';

/**
 * Scroll depth thresholds to track
 */
const THRESHOLDS = [10, 25, 50, 75, 90] as const;

/**
 * Type for threshold values
 */
type Threshold = typeof THRESHOLDS[number];

/**
 * Fired thresholds tracking
 */
type FiredThresholds = Record<Threshold, boolean>;

/**
 * Scroll depth event data
 */
interface ScrollEventData extends ScrollDepthEvent {
  timestamp: string;
}

export const ScrollTracker = {
  // Track which thresholds have already fired
  firedThresholds: {
    10: false,
    25: false,
    50: false,
    75: false,
    90: false
  } as FiredThresholds,

  /**
   * Initialize scroll depth tracking
   */
  init(): void {
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
  checkScrollDepth(): void {
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
      THRESHOLDS.forEach(threshold => {
        if (scrollPercent >= threshold && !this.firedThresholds[threshold]) {
          this.fireScrollEvent(threshold, scrollTop);
          this.firedThresholds[threshold] = true;
        }
      });
    } catch (error) {
      console.error('Error in scroll depth tracking:', error);
    }
  },

  /**
   * Fire scroll depth event to GTM dataLayer
   */
  fireScrollEvent(threshold: Threshold, scrollPixels: number): void {
    const eventData: ScrollEventData = {
      event: 'scroll_depth',
      depth_percentage: threshold,
      depth_pixels: scrollPixels,
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
  reset(): void {
    this.firedThresholds = {
      10: false,
      25: false,
      50: false,
      75: false,
      90: false
    };
  },

  /**
   * Get current scroll percentage
   */
  getCurrentScrollPercentage(): number {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

    if (documentHeight <= windowHeight) {
      return 100; // Page is fully visible
    }

    return Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
  },

  /**
   * Check if a specific threshold has been fired
   */
  hasThresholdFired(threshold: Threshold): boolean {
    return this.firedThresholds[threshold];
  },

  /**
   * Get all fired thresholds
   */
  getFiredThresholds(): Threshold[] {
    return THRESHOLDS.filter(threshold => this.firedThresholds[threshold]);
  }
};