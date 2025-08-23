/**
 * Simple GTM Normalizer - Clean & Maintainable
 * Provides essential sanitization without over-engineering
 */

/**
 * Clean string values for GTM/GA4 tracking
 * @param {unknown} value - Value to clean
 * @param {number} maxLength - Max length (default: 50)
 * @returns {string} Cleaned string
 */
export function cleanString(value: unknown, maxLength: number = 50): string {
  if (!value) return 'unknown';

  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_\- ]/g, '') // Keep safe characters only
    .replace(/\s+/g, ' ')          // Normalize whitespace
    .slice(0, maxLength)           // Limit length
    .trim() || 'unknown';
}

/**
 * Normalize event payload for GTM
 * @param {Record<string, unknown>} payload - Event data
 * @returns {Record<string, unknown>} Normalized payload
 */
export function normalizeEventPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (key === 'event' || key === 'timestamp') {
      // Keep event names and timestamps as-is
      cleaned[key] = value;
    } else if (typeof value === 'string') {
      // Clean string values
      cleaned[key] = cleanString(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      // Keep numbers and booleans as-is
      cleaned[key] = value;
    } else {
      // Convert other types to string and clean
      cleaned[key] = cleanString(value);
    }
  }

  return cleaned;
}