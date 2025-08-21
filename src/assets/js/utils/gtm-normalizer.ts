/**
 * GTM Normalizer Utility
 * Sanitizes string parameters to prevent cardinality explosion in GA4
 * Keeps values tidy and consistent across all tracking
 */

/**
 * Known section names for validation
 */
const KNOWN_SECTIONS = [
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
] as const;

/**
 * Valid action types
 */
const VALID_ACTIONS = [
  'open', 'close', 'click', 'submit',
  'view', 'play', 'pause', 'complete'
] as const;

/**
 * Valid pricing tiers
 */
const VALID_TIERS = [
  'early_bird', 'regular', 'last_minute',
  'vip', 'standard'
] as const;

/**
 * Valid form locations
 */
const VALID_FORM_LOCATIONS = [
  'checkout_modal',
  'footer_form',
  'popup_leadgen',
  'inline_form',
  'sidebar_form',
  'header_form'
] as const;

/**
 * Type for known section names
 */
type KnownSection = typeof KNOWN_SECTIONS[number];

/**
 * Type for valid actions
 */
type ValidAction = typeof VALID_ACTIONS[number];

/**
 * Type for valid pricing tiers
 */
type ValidTier = typeof VALID_TIERS[number];

/**
 * Type for valid form locations
 */
type ValidFormLocation = typeof VALID_FORM_LOCATIONS[number];

/**
 * Normalize a string value for GTM/GA4 tracking
 * - Converts to lowercase
 * - Trims whitespace
 * - Limits to safe characters (alphanumeric, dash, underscore, space)
 * - Limits length to prevent cardinality issues
 * - Returns 'other' for empty/invalid values
 */
export function normalizeString(
  value: unknown,
  maxLength: number = 50,
  fallback: string = 'other'
): string {
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
 */
export function normalizeId(id: unknown): string {
  if (!id) return 'unknown_id';

  // Keep alphanumeric, dash, underscore (common in IDs)
  return String(id)
    .toLowerCase()
    .replace(/[^a-z0-9_\-]+/g, '_')
    .slice(0, 100); // IDs can be longer
}

/**
 * Normalize a section/location value
 */
export function normalizeSection(section: unknown): string {
  const normalized = normalizeString(section, 30, 'unknown');

  // Map to known section if close match
  const found = KNOWN_SECTIONS.find(known =>
    known === normalized || known.includes(normalized) || normalized.includes(known)
  );

  return found || normalized;
}

/**
 * Normalize a URL (keeps it readable but safe)
 */
export function normalizeUrl(url: unknown): string {
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
 */
export function normalizeAction(action: unknown): ValidAction | 'other' {
  const normalized = normalizeString(action, 20, 'unknown');

  // Map to valid action if match found
  return VALID_ACTIONS.includes(normalized as ValidAction)
    ? normalized as ValidAction
    : 'other';
}

/**
 * Normalize pricing tier values
 */
export function normalizePricingTier(tier: unknown): ValidTier {
  const normalized = normalizeString(tier, 30, 'standard');

  return VALID_TIERS.includes(normalized as ValidTier)
    ? normalized as ValidTier
    : 'standard';
}

/**
 * Normalize question text (keeps readable but limited)
 */
export function normalizeQuestion(question: unknown): string {
  // Questions can be longer but still need limits
  return normalizeString(question, 100, 'faq_question');
}

/**
 * Normalize form location values
 */
export function normalizeFormLocation(location: unknown): ValidFormLocation | string {
  const normalized = normalizeString(location, 30, 'unknown_form');

  return VALID_FORM_LOCATIONS.includes(normalized as ValidFormLocation)
    ? normalized as ValidFormLocation
    : normalized;
}

/**
 * Normalize any GTM parameter based on type
 */
export function normalizeParameter(key: string, value: unknown): unknown {
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
 */
export function normalizeEventPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};

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