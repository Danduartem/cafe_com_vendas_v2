/**
 * Shared State Management for Café com Vendas
 * Centralized state for the entire application
 */

export const state = {
    scrollDepth: {
        25: false,
        50: false,
        75: false
    },
    faqOpenTimes: {},
    isInitialized: false
};

/**
 * State management utilities
 */
export const StateManager = {
    /**
     * Reset scroll depth tracking
     */
    resetScrollDepth() {
        state.scrollDepth = {
            25: false,
            50: false,
            75: false
        };
    },

    /**
     * Mark FAQ as opened for engagement tracking
     */
    markFAQOpened(faqId) {
        state.faqOpenTimes[faqId] = Date.now();
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