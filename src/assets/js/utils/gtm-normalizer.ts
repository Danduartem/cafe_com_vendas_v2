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
export function cleanString(value: unknown, maxLength = 50): string {
  if (!value) return 'unknown';

  // Handle objects by serializing to JSON, otherwise convert to string
  let stringValue: string;
  if (typeof value === 'object' && value !== null) {
    stringValue = JSON.stringify(value);
  } else if (typeof value === 'string') {
    stringValue = value;
  } else if (typeof value === 'number' || typeof value === 'boolean') {
    stringValue = value.toString();
  } else {
    stringValue = 'unknown';
  }

  return stringValue
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_\- ]/g, '') // Keep safe characters only
    .replace(/\s+/g, ' ')          // Normalize whitespace
    .slice(0, maxLength)           // Limit length
    .trim() || 'unknown';
}

/**
 * Normalize event payload for GTM
 * @param {Record<string, unknown>} payload - Event data with required event property
 * @returns {Record<string, unknown> & { event: string }} Normalized payload with guaranteed event property
 */
export function normalizeEventPayload(payload: Record<string, unknown> & { event: string }): Record<string, unknown> & { event: string } {
  const cleaned: Record<string, unknown> & { event: string } = {
    event: payload.event // Guarantee event property exists
  };

  for (const [key, value] of Object.entries(payload)) {
    if (key === 'event') {
      // Event property is guaranteed to be string by function signature
      cleaned[key] = value as string;
    } else if (key === 'timestamp') {
      // Keep timestamps as-is
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