/**
 * About Section Schema and Validation
 *
 * Type-safe contracts and runtime validation for the about section
 */

import type { AboutSection, SectionCTA, SectionMedia, SectionDesign, SectionTracking } from '../../../_data/types.ts';
import { validateSectionBase, assertSectionBase } from '../../../_data/types.ts';

// Extend the existing AboutSection interface for strict validation
export interface AboutProps extends AboutSection {
  id: 'about';
  copy: {
    eyebrow?: string;
    headline: string;
    subhead?: string;
    description?: string;
    cta?: SectionCTA;
    bio: string;
    micro_story: string;
    highlights: string[];
    social: {
      instagram: {
        url: string;
        handle: string;
      };
    };
  };
  media?: SectionMedia;
  design: SectionDesign;
  tracking: SectionTracking;
  schema: Record<string, unknown>;
}

// Validation functions
export function validateAboutSocial(social: unknown): social is AboutProps['copy']['social'] {
  if (!social || typeof social !== 'object') return false;
  const socialObj = social as Record<string, unknown>;

  if (!socialObj.instagram || typeof socialObj.instagram !== 'object') return false;
  const instagram = socialObj.instagram as Record<string, unknown>;

  return (
    typeof instagram.url === 'string' &&
    typeof instagram.handle === 'string'
  );
}

export function validateAboutCopy(copy: unknown): copy is AboutProps['copy'] {
  if (!copy || typeof copy !== 'object') return false;
  const copyObj = copy as Record<string, unknown>;

  // Required fields
  if (typeof copyObj.headline !== 'string') return false;
  if (typeof copyObj.bio !== 'string') return false;
  if (typeof copyObj.micro_story !== 'string') return false;
  if (!Array.isArray(copyObj.highlights) || !copyObj.highlights.every(h => typeof h === 'string')) return false;
  if (!validateAboutSocial(copyObj.social)) return false;

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

export function validateAboutMedia(media: unknown): media is SectionMedia {
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

export function validateAboutDesign(design: unknown): design is SectionDesign {
  if (!design || typeof design !== 'object') return false;
  const designObj = design as Record<string, unknown>;

  return (
    (designObj.theme === 'light' || designObj.theme === 'dark') &&
    typeof designObj.accent === 'string' &&
    typeof designObj.background === 'string' &&
    typeof designObj.layout === 'string'
  );
}

export function validateAboutTracking(tracking: unknown): tracking is SectionTracking {
  if (!tracking || typeof tracking !== 'object') return false;
  const trackingObj = tracking as Record<string, unknown>;

  return (
    typeof trackingObj.section_id === 'string' &&
    typeof trackingObj.impression_event === 'string'
  );
}

export function validateAboutSchema(schema: unknown): schema is Record<string, unknown> {
  return schema !== undefined && typeof schema === 'object' && schema !== null;
}

export function validateAboutSection(data: unknown): data is AboutProps {
  if (!validateSectionBase(data)) return false;

  const section = data as Record<string, unknown>;

  return (
    section.id === 'about' &&
    validateAboutCopy(section.copy) &&
    validateAboutMedia(section.media) &&
    validateAboutDesign(section.design) &&
    validateAboutTracking(section.tracking) &&
    validateAboutSchema(section.schema)
  );
}

export function assertAboutSection(data: unknown): AboutProps {
  assertSectionBase(data, 'about');

  if (!validateAboutSection(data)) {
    throw new Error(`Invalid about section data: ${JSON.stringify(data, null, 2)}`);
  }

  return data;
}

// Export the schema for runtime use
export const AboutSchema = {
  validate: validateAboutSection,
  assert: assertAboutSection,
  validateCopy: validateAboutCopy,
  validateMedia: validateAboutMedia,
  validateDesign: validateAboutDesign,
  validateTracking: validateAboutTracking,
  validateSocial: validateAboutSocial,
  validateSchema: validateAboutSchema
} as const;