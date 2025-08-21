/**
 * FAQ Section Schema and Validation
 *
 * Type-safe contracts and runtime validation for the FAQ section
 */

import type { FAQSection, SectionCTA, SectionMedia, SectionDesign, SectionTracking } from '../../../_data/types.js';
import { validateSectionBase, assertSectionBase } from '../../../_data/types.js';

// Extend the existing FAQSection interface for strict validation
export interface FAQProps extends FAQSection {
  id: 'faq';
  copy: {
    eyebrow?: string;
    headline: string;
    subhead?: string;
    description?: string;
    cta?: SectionCTA;
  };
  items: Array<{
    id: string;
    question: string;
    answer: Record<string, unknown>;
    analytics_event: string;
    [key: string]: unknown;
  }>;
  contact: {
    whatsapp_url: string;
    whatsapp_name: string;
    whatsapp_phone: string;
    response_time: string;
  };
  legal_links: Array<{
    text: string;
    url: string;
  }>;
  media?: SectionMedia;
  design: SectionDesign;
  tracking: SectionTracking;
}

// Validation functions
export function validateFAQItem(item: unknown): item is FAQProps['items'][0] {
  if (!item || typeof item !== 'object') return false;
  const itemObj = item as Record<string, unknown>;

  return (
    typeof itemObj.id === 'string' &&
    typeof itemObj.question === 'string' &&
    typeof itemObj.answer === 'object' &&
    itemObj.answer !== null &&
    typeof itemObj.analytics_event === 'string'
  );
}

export function validateFAQContact(contact: unknown): contact is FAQProps['contact'] {
  if (!contact || typeof contact !== 'object') return false;
  const contactObj = contact as Record<string, unknown>;

  return (
    typeof contactObj.whatsapp_url === 'string' &&
    typeof contactObj.whatsapp_name === 'string' &&
    typeof contactObj.whatsapp_phone === 'string' &&
    typeof contactObj.response_time === 'string'
  );
}

export function validateFAQLegalLink(link: unknown): link is FAQProps['legal_links'][0] {
  if (!link || typeof link !== 'object') return false;
  const linkObj = link as Record<string, unknown>;

  return (
    typeof linkObj.text === 'string' &&
    typeof linkObj.url === 'string'
  );
}

export function validateFAQCopy(copy: unknown): copy is FAQProps['copy'] {
  if (!copy || typeof copy !== 'object') return false;
  const copyObj = copy as Record<string, unknown>;

  // Required fields
  if (typeof copyObj.headline !== 'string') return false;

  // Optional fields
  if (copyObj.eyebrow !== undefined && typeof copyObj.eyebrow !== 'string') return false;
  if (copyObj.subhead !== undefined && typeof copyObj.subhead !== 'string') return false;
  if (copyObj.description !== undefined && typeof copyObj.description !== 'string') return false;

  // CTA validation
  if (copyObj.cta !== undefined) {
    if (!copyObj.cta || typeof copyObj.cta !== 'object') return false;
    const ctaObj = copyObj.cta as Record<string, unknown>;

    if (typeof ctaObj.label !== 'string' || typeof ctaObj.href !== 'string' || typeof ctaObj.variant !== 'string') {
      return false;
    }
  }

  return true;
}

export function validateFAQMedia(media: unknown): media is SectionMedia {
  if (media === undefined) return true;
  if (!media || typeof media !== 'object') return false;

  const mediaObj = media as Record<string, unknown>;

  return (
    (mediaObj.image === undefined || typeof mediaObj.image === 'string') &&
    (mediaObj.alt === undefined || typeof mediaObj.alt === 'string') &&
    (mediaObj.background === undefined || typeof mediaObj.background === 'string') &&
    (mediaObj.aspect_ratio === undefined || typeof mediaObj.aspect_ratio === 'string')
  );
}

export function validateFAQDesign(design: unknown): design is SectionDesign {
  if (!design || typeof design !== 'object') return false;
  const designObj = design as Record<string, unknown>;

  return (
    (designObj.theme === 'light' || designObj.theme === 'dark') &&
    typeof designObj.accent === 'string' &&
    typeof designObj.background === 'string' &&
    typeof designObj.layout === 'string'
  );
}

export function validateFAQTracking(tracking: unknown): tracking is SectionTracking {
  if (!tracking || typeof tracking !== 'object') return false;
  const trackingObj = tracking as Record<string, unknown>;

  return (
    typeof trackingObj.section_id === 'string' &&
    typeof trackingObj.impression_event === 'string'
  );
}

export function validateFAQSection(data: unknown): data is FAQProps {
  if (!validateSectionBase(data)) return false;

  const section = data as Record<string, unknown>;

  return (
    section.id === 'faq' &&
    validateFAQCopy(section.copy) &&
    Array.isArray(section.items) &&
    section.items.every(validateFAQItem) &&
    validateFAQContact(section.contact) &&
    Array.isArray(section.legal_links) &&
    section.legal_links.every(validateFAQLegalLink) &&
    validateFAQMedia(section.media) &&
    validateFAQDesign(section.design) &&
    validateFAQTracking(section.tracking)
  );
}

export function assertFAQSection(data: unknown): FAQProps {
  assertSectionBase(data, 'faq');

  if (!validateFAQSection(data)) {
    throw new Error(`Invalid FAQ section data: ${JSON.stringify(data, null, 2)}`);
  }

  return data;
}

// Export the schema for runtime use
export const FAQSchema = {
  validate: validateFAQSection,
  assert: assertFAQSection,
  validateCopy: validateFAQCopy,
  validateMedia: validateFAQMedia,
  validateDesign: validateFAQDesign,
  validateTracking: validateFAQTracking,
  validateItem: validateFAQItem,
  validateContact: validateFAQContact,
  validateLegalLink: validateFAQLegalLink
} as const;