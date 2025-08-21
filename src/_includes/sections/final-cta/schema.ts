/**
 * Final CTA Section Schema and Validation
 *
 * Type-safe contracts and runtime validation for the final CTA section
 */

import type { FinalCTASection, SectionCTA, SectionMedia, SectionDesign, SectionTracking } from '../../../_data/types.js';
import { validateSectionBase, assertSectionBase } from '../../../_data/types.js';

// Extend the existing FinalCTASection interface for strict validation
export interface FinalCTAProps extends FinalCTASection {
  id: 'final-cta';
  copy: {
    eyebrow?: string;
    headline: string;
    subhead?: string;
    description?: string;
    cta?: SectionCTA;
    urgency_points: string[];
    alternative_cta: SectionCTA;
  };
  media?: SectionMedia;
  design: SectionDesign;
  tracking: SectionTracking;
}

// Validation functions
export function validateFinalCTACopy(copy: unknown): copy is FinalCTAProps['copy'] {
  if (!copy || typeof copy !== 'object') return false;
  const copyObj = copy as Record<string, unknown>;

  // Required fields
  if (typeof copyObj.headline !== 'string') return false;
  if (!Array.isArray(copyObj.urgency_points) || !copyObj.urgency_points.every(p => typeof p === 'string')) return false;

  // Alternative CTA validation
  if (!copyObj.alternative_cta || typeof copyObj.alternative_cta !== 'object') return false;
  const altCta = copyObj.alternative_cta as Record<string, unknown>;
  if (typeof altCta.label !== 'string' || typeof altCta.href !== 'string' || typeof altCta.variant !== 'string') {
    return false;
  }

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

export function validateFinalCTAMedia(media: unknown): media is SectionMedia {
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

export function validateFinalCTADesign(design: unknown): design is SectionDesign {
  if (!design || typeof design !== 'object') return false;
  const designObj = design as Record<string, unknown>;

  return (
    (designObj.theme === 'light' || designObj.theme === 'dark') &&
    typeof designObj.accent === 'string' &&
    typeof designObj.background === 'string' &&
    typeof designObj.layout === 'string'
  );
}

export function validateFinalCTATracking(tracking: unknown): tracking is SectionTracking {
  if (!tracking || typeof tracking !== 'object') return false;
  const trackingObj = tracking as Record<string, unknown>;

  return (
    typeof trackingObj.section_id === 'string' &&
    typeof trackingObj.impression_event === 'string'
  );
}

export function validateFinalCTASection(data: unknown): data is FinalCTAProps {
  if (!validateSectionBase(data)) return false;

  const section = data as Record<string, unknown>;

  return (
    section.id === 'final-cta' &&
    validateFinalCTACopy(section.copy) &&
    validateFinalCTAMedia(section.media) &&
    validateFinalCTADesign(section.design) &&
    validateFinalCTATracking(section.tracking)
  );
}

export function assertFinalCTASection(data: unknown): FinalCTAProps {
  assertSectionBase(data, 'final-cta');

  if (!validateFinalCTASection(data)) {
    throw new Error(`Invalid final CTA section data: ${JSON.stringify(data, null, 2)}`);
  }

  return data;
}

// Export the schema for runtime use
export const FinalCTASchema = {
  validate: validateFinalCTASection,
  assert: assertFinalCTASection,
  validateCopy: validateFinalCTACopy,
  validateMedia: validateFinalCTAMedia,
  validateDesign: validateFinalCTADesign,
  validateTracking: validateFinalCTATracking
} as const;