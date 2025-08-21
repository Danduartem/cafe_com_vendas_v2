/**
 * GTM Normalizer Utility
 * Sanitizes string parameters to prevent cardinality explosion in GA4
 * Keeps values tidy and consistent across all tracking
 */

/**
 * Normalize a string value for GTM/GA4 tracking
 * - Converts to lowercase
 * - Trims whitespace
 * - Limits to safe characters (alphanumeric, dash, underscore, space)
 * - Limits length to prevent cardinality issues
 * - Returns 'other' for empty/invalid values
 *
 * @param {any} value - The value to normalize
 * @param {number} maxLength - Maximum length (default: 50)
 * @param {string} fallback - Fallback value (default: 'other')
 * @returns {string} Normalized string value
 */
export function normalizeString(value, maxLength = 50, fallback = 'other') {
  // Handle null/undefined/empty
  if (value == null || value === '') {
    return fallback;
  }

  // Convert to string and normalize
  const normalized = String(value)
    .toLowerCase()
    .trim()
    // Remove accents/diacritics (important for Portuguese)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Keep only safe characters: letters, numbers, dash, underscore, space
    .replace(/[^a-z0-9_\- ]+/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Trim to max length
    .slice(0, maxLength)
    .trim();

  // Return fallback if result is empty
  return normalized || fallback;
}

/**
 * Normalize an ID value (preserves uniqueness but sanitizes format)
 * @param {any} id - The ID to normalize
 * @returns {string} Normalized ID
 */
export function normalizeId(id) {
  if (!id) return 'unknown_id';

  // Keep alphanumeric, dash, underscore (common in IDs)
  return String(id)
    .toLowerCase()
    .replace(/[^a-z0-9_\-]+/g, '_')
    .slice(0, 100); // IDs can be longer
}

/**
 * Normalize a section/location value
 * @param {any} section - The section name
 * @returns {string} Normalized section name
 */
export function normalizeSection(section) {
  const knownSections = [
    'hero',
    'problem',
    'solution',
    'social_proof',
    'testimonials',
    'offer',
    'pricing_table',
    'faq',
    'final_cta',
    'footer',
    'checkout_modal',
    'floating_button',
    'top_banner'
  ];

  const normalized = normalizeString(section, 30, 'unknown');

  // Map to known section if close match
  const found = knownSections.find(known =>
    known === normalized || known.includes(normalized) || normalized.includes(known)
  );

  return found || normalized;
}

/**
 * Normalize a URL (keeps it readable but safe)
 * @param {any} url - The URL to normalize
 * @returns {string} Normalized URL
 */
export function normalizeUrl(url) {
  if (!url) return 'no_url';

  try {
    const urlObj = new URL(String(url));
    // Return just hostname and pathname for privacy
    return `${urlObj.hostname}${urlObj.pathname}`.slice(0, 100);
  } catch {
    // If not a valid URL, just sanitize as string
    return normalizeString(url, 100, 'invalid_url');
  }
}

/**
 * Normalize event action values
 * @param {any} action - The action value
 * @returns {string} Normalized action
 */
export function normalizeAction(action) {
  const validActions = ['open', 'close', 'click', 'submit', 'view', 'play', 'pause', 'complete'];
  const normalized = normalizeString(action, 20, 'unknown');

  // Map to valid action if match found
  return validActions.includes(normalized) ? normalized : 'other';
}

/**
 * Normalize pricing tier values
 * @param {any} tier - The pricing tier
 * @returns {string} Normalized tier
 */
export function normalizePricingTier(tier) {
  const validTiers = ['early_bird', 'regular', 'last_minute', 'vip', 'standard'];
  const normalized = normalizeString(tier, 30, 'standard');

  return validTiers.includes(normalized) ? normalized : 'standard';
}

/**
 * Normalize question text (keeps readable but limited)
 * @param {any} question - The question text
 * @returns {string} Normalized question
 */
export function normalizeQuestion(question) {
  // Questions can be longer but still need limits
  return normalizeString(question, 100, 'faq_question');
}

/**
 * Normalize form location values
 * @param {any} location - The form location
 * @returns {string} Normalized location
 */
export function normalizeFormLocation(location) {
  const validLocations = [
    'checkout_modal',
    'footer_form',
    'popup_leadgen',
    'inline_form',
    'sidebar_form',
    'header_form'
  ];

  const normalized = normalizeString(location, 30, 'unknown_form');
  return validLocations.includes(normalized) ? normalized : normalized;
}

/**
 * Normalize any GTM parameter based on type
 * @param {string} key - The parameter key/name
 * @param {any} value - The parameter value
 * @returns {any} Normalized value (keeps numbers as numbers)
 */
export function normalizeParameter(key, value) {
  // Don't normalize numbers
  if (typeof value === 'number') {
    return value;
  }

  // Don't normalize booleans
  if (typeof value === 'boolean') {
    return value;
  }

  // Don't normalize arrays or objects (like items array)
  if (typeof value === 'object' && value !== null) {
    return value;
  }

  // Apply specific normalizers based on parameter name
  switch (key) {
  case 'lead_id':
  case 'transaction_id':
  case 'testimonial_id':
  case 'payment_intent_id':
    return normalizeId(value);

  case 'source_section':
  case 'section':
  case 'location':
    return normalizeSection(value);

  case 'form_location':
    return normalizeFormLocation(value);

  case 'link_url':
    return normalizeUrl(value);

  case 'action':
    return normalizeAction(value);

  case 'pricing_tier':
    return normalizePricingTier(value);

  case 'question':
    return normalizeQuestion(value);

  case 'video_title':
  case 'link_text':
  case 'event_label':
  case 'event_category':
    return normalizeString(value, 50);

    // Default: general string normalization
  default:
    return typeof value === 'string' ? normalizeString(value) : value;
  }
}

/**
 * Normalize entire event payload
 * @param {object} payload - The event payload
 * @returns {object} Normalized payload
 */
export function normalizeEventPayload(payload) {
  const normalized = {};

  for (const [key, value] of Object.entries(payload)) {
    // Skip 'event' key itself (don't normalize event names)
    if (key === 'event' || key === 'timestamp') {
      normalized[key] = value;
    } else {
      normalized[key] = normalizeParameter(key, value);
    }
  }

  return normalized;
}

// Export all functions for flexibility
export const GTMNormalizer = {
  normalizeString,
  normalizeId,
  normalizeSection,
  normalizeUrl,
  normalizeAction,
  normalizePricingTier,
  normalizeQuestion,
  normalizeFormLocation,
  normalizeParameter,
  normalizeEventPayload
};