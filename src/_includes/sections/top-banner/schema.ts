/**
 * Top Banner Section Schema and Validation
 *
 * Type-safe contracts and runtime validation for the top banner section
 */

import type { TopBannerSection, SectionCTA, SectionMedia, SectionDesign, SectionTracking } from '../../../_data/types.js';
import { validateSectionBase, assertSectionBase } from '../../../_data/types.js';

// Extend the existing TopBannerSection interface for strict validation
export interface TopBannerProps extends TopBannerSection {
  id: 'top-banner';
  copy: {
    eyebrow?: string;
    headline: string;
    subhead?: string;
    description?: string;
    cta?: SectionCTA;
    message: string;
  };
  media?: SectionMedia;
  design: SectionDesign;
  tracking: SectionTracking;
}

// Validation functions
export function validateTopBannerCopy(copy: unknown): copy is TopBannerProps['copy'] {
  if (!copy || typeof copy !== 'object') return false;
  const copyObj = copy as Record<string, unknown>;

  // Required fields
  if (typeof copyObj.headline !== 'string') return false;
  if (typeof copyObj.message !== 'string') return false;

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

export function validateTopBannerMedia(media: unknown): media is SectionMedia {
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

export function validateTopBannerDesign(design: unknown): design is SectionDesign {
  if (!design || typeof design !== 'object') return false;
  const designObj = design as Record<string, unknown>;

  return (
    (designObj.theme === 'light' || designObj.theme === 'dark') &&
    typeof designObj.accent === 'string' &&
    typeof designObj.background === 'string' &&
    typeof designObj.layout === 'string'
  );
}

export function validateTopBannerTracking(tracking: unknown): tracking is SectionTracking {
  if (!tracking || typeof tracking !== 'object') return false;
  const trackingObj = tracking as Record<string, unknown>;

  return (
    typeof trackingObj.section_id === 'string' &&
    typeof trackingObj.impression_event === 'string'
  );
}

export function validateTopBannerSection(data: unknown): data is TopBannerProps {
  if (!validateSectionBase(data)) return false;

  const section = data as Record<string, unknown>;

  return (
    section.id === 'top-banner' &&
    validateTopBannerCopy(section.copy) &&
    validateTopBannerMedia(section.media) &&
    validateTopBannerDesign(section.design) &&
    validateTopBannerTracking(section.tracking)
  );
}

export function assertTopBannerSection(data: unknown): TopBannerProps {
  assertSectionBase(data, 'top-banner');

  if (!validateTopBannerSection(data)) {
    throw new Error(`Invalid top banner section data: ${JSON.stringify(data, null, 2)}`);
  }

  return data;
}

// Export the schema for runtime use
export const TopBannerSchema = {
  validate: validateTopBannerSection,
  assert: assertTopBannerSection,
  validateCopy: validateTopBannerCopy,
  validateMedia: validateTopBannerMedia,
  validateDesign: validateTopBannerDesign,
  validateTracking: validateTopBannerTracking
} as const;