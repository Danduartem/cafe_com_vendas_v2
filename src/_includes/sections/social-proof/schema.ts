/**
 * Social Proof Section Schema and Validation
 *
 * Type-safe contracts and runtime validation for the social proof section
 */

import type { SocialProofSection, SectionCTA, SectionMedia, SectionDesign, SectionTracking } from '../../../_data/types.ts';
import { validateSectionBase, assertSectionBase } from '../../../_data/types.ts';

// Extend the existing SocialProofSection interface for strict validation
export interface SocialProofProps extends SocialProofSection {
  id: 'social-proof';
  copy: {
    eyebrow?: string;
    headline: string;
    subhead?: string;
    description?: string;
    cta?: SectionCTA;
  };
  testimonials: Array<{
    id: number;
    name: string;
    profession: string;
    location: string;
    result: string;
    video_id: string;
    thumbnail: string;
  }>;
  media?: SectionMedia;
  design: SectionDesign;
  tracking: SectionTracking;
}

// Validation functions
export function validateTestimonial(testimonial: unknown): testimonial is SocialProofProps['testimonials'][0] {
  if (!testimonial || typeof testimonial !== 'object') return false;
  const testimObj = testimonial as Record<string, unknown>;

  return (
    typeof testimObj.id === 'number' &&
    typeof testimObj.name === 'string' &&
    typeof testimObj.profession === 'string' &&
    typeof testimObj.location === 'string' &&
    typeof testimObj.result === 'string' &&
    typeof testimObj.video_id === 'string' &&
    typeof testimObj.thumbnail === 'string'
  );
}

export function validateSocialProofCopy(copy: unknown): copy is SocialProofProps['copy'] {
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

export function validateSocialProofMedia(media: unknown): media is SectionMedia {
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

export function validateSocialProofDesign(design: unknown): design is SectionDesign {
  if (!design || typeof design !== 'object') return false;
  const designObj = design as Record<string, unknown>;

  return (
    (designObj.theme === 'light' || designObj.theme === 'dark') &&
    typeof designObj.accent === 'string' &&
    typeof designObj.background === 'string' &&
    typeof designObj.layout === 'string'
  );
}

export function validateSocialProofTracking(tracking: unknown): tracking is SectionTracking {
  if (!tracking || typeof tracking !== 'object') return false;
  const trackingObj = tracking as Record<string, unknown>;

  return (
    typeof trackingObj.section_id === 'string' &&
    typeof trackingObj.impression_event === 'string'
  );
}

export function validateSocialProofSection(data: unknown): data is SocialProofProps {
  if (!validateSectionBase(data)) return false;

  const section = data as Record<string, unknown>;

  return (
    section.id === 'social-proof' &&
    validateSocialProofCopy(section.copy) &&
    Array.isArray(section.testimonials) &&
    section.testimonials.every(validateTestimonial) &&
    validateSocialProofMedia(section.media) &&
    validateSocialProofDesign(section.design) &&
    validateSocialProofTracking(section.tracking)
  );
}

export function assertSocialProofSection(data: unknown): SocialProofProps {
  assertSectionBase(data, 'social-proof');

  if (!validateSocialProofSection(data)) {
    throw new Error(`Invalid social proof section data: ${JSON.stringify(data, null, 2)}`);
  }

  return data;
}

// Export the schema for runtime use
export const SocialProofSchema = {
  validate: validateSocialProofSection,
  assert: assertSocialProofSection,
  validateCopy: validateSocialProofCopy,
  validateMedia: validateSocialProofMedia,
  validateDesign: validateSocialProofDesign,
  validateTracking: validateSocialProofTracking,
  validateTestimonial
} as const;