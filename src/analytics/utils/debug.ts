/**
 * Analytics Debug Utilities
 * Centralized debug logging to avoid code duplication across plugins
 */

import { ENV } from '../../assets/js/config/constants.js';

/**
 * Check if debug logging should be enabled
 * Internal utility - not exported since it's only used within this module
 */
const shouldLogVerbose = (): boolean => 
  ENV.isDevelopment && import.meta.env?.VITE_ANALYTICS_DEBUG === 'verbose';

/**
 * Consistent debug logging for analytics system
 */
export const debugLog = (message: string, ...args: unknown[]): void => {
  if (shouldLogVerbose()) {
    console.warn(message, ...args);
  }
};

/**
 * Debug logging specifically for plugin config-based debugging
 */
export const pluginDebugLog = (enabled: boolean | undefined, message: string, ...args: unknown[]): void => {
  if (enabled && shouldLogVerbose()) {
    console.warn(message, ...args);
  }
};