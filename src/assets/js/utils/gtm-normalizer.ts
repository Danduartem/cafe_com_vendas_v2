/**
 * GTM Event Normalizer
 * Provides essential sanitization for GA4 tracking
 */

/**
 * Normalize event payload for GTM/GA4
 */
export function normalizeEventPayload(payload: Record<string, unknown> & { event: string }): Record<string, unknown> & { event: string } {
  const cleaned: Record<string, unknown> & { event: string } = {
    event: payload.event
  };

  const sanitizedKeys = new Set([
    'event',
    'event_name',
    'event_category',
    'event_type',
    'action',
    'engagement_type'
  ]);

  const sanitizeString = (value: string): string => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_\- ]/g, '')
      .replace(/\s+/g, ' ')
      .slice(0, 50)
      .trim() || 'unknown';
  };

  for (const [key, value] of Object.entries(payload)) {
    if (key === 'event') {
      cleaned[key] = value as string;
    } else if (key === 'timestamp' || key === 'event_id' || key === 'debug_info') {
      // Keep structured data as-is
      cleaned[key] = value;
    } else if (typeof value === 'string') {
      if (sanitizedKeys.has(key)) {
        cleaned[key] = sanitizeString(value);
      } else {
        const trimmedValue = value.trim();
        if (trimmedValue.length === 0) {
          continue;
        }
        cleaned[key] = trimmedValue.length > 250 ? trimmedValue.slice(0, 250) : trimmedValue;
      }
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      cleaned[key] = value;
    } else if (value === null || value === undefined) {
      continue; // Skip null/undefined
    } else if (typeof value === 'object') {
      cleaned[key] = value; // Keep objects and arrays as-is
    } else {
      // Convert other types to trimmed string without altering case
      let valueStr: string;
      if (typeof value === 'object' && value !== null) {
        valueStr = JSON.stringify(value);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        valueStr = String(value);
      }
      const trimmedValue = valueStr.trim();
      if (trimmedValue.length === 0) {
        continue;
      }
      cleaned[key] = trimmedValue.length > 250 ? trimmedValue.slice(0, 250) : trimmedValue;
    }
  }

  return cleaned;
}
