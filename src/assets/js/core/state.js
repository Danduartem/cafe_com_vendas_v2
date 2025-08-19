/**
 * Shared State Management for Café com Vendas
 * Centralized state for the entire application
 */

import { normalizeEventPayload } from '../utils/gtm-normalizer.js';

export const state = {
  faqOpenTimes: {},
  faqToggleCount: 0, // Track total FAQ toggles for meaningful engagement
  isInitialized: false
};

/**
 * State management utilities
 */
export const StateManager = {
  /**
     * Mark FAQ as opened for engagement tracking
     */
  markFAQOpened(faqId) {
    state.faqOpenTimes[faqId] = Date.now();
    state.faqToggleCount++; // Increment toggle count
    
    // Check for meaningful engagement (3+ toggles)
    if (state.faqToggleCount === 3) {
      // Push meaningful engagement event to dataLayer
      window.dataLayer = window.dataLayer || [];
      const engagementPayload = normalizeEventPayload({
        event: 'faq_meaningful_engagement',
        engagement_type: 'faq_meaningful', // Will be normalized
        toggle_count: 3 // Number, not normalized
      });
      window.dataLayer.push(engagementPayload);
    }
  },

  /**
     * Get FAQ open duration and cleanup
     */
  getFAQEngagementTime(faqId) {
    const openTime = state.faqOpenTimes[faqId];
    if (openTime) {
      const engagementTime = Date.now() - openTime;
      delete state.faqOpenTimes[faqId];
      return Math.round(engagementTime / 1000);
    }
    return 0;
  },

  /**
     * Mark application as initialized
     */
  setInitialized(initialized = true) {
    state.isInitialized = initialized;
  },

  /**
     * Get current state snapshot for debugging
     */
  getSnapshot() {
    return { ...state };
  }
};