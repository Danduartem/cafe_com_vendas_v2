/**
 * Solution Section Schema and Validation
 *
 * Type-safe contracts and runtime validation for the solution section
 */

import type { SolutionSection, SectionCTA, SectionMedia, SectionDesign, SectionTracking } from '../../../_data/types.js';
import { validateSectionBase, assertSectionBase } from '../../../_data/types.js';

// Extend the existing SolutionSection interface for strict validation
export interface SolutionProps extends SolutionSection {
  id: 'solution';
  copy: {
    eyebrow?: string;
    headline: string;
    subhead?: string;
    description?: string;
    cta?: SectionCTA;
    pillars: Array<{
      number: string;
      title: string;
      description: string;
      icon: string;
      analytics_event: string;
      animation_delay: string;
    }>;
    supporting_text: string;
    trust_indicators: string[];
  };
  media?: SectionMedia;
  design: SectionDesign;
  tracking: SectionTracking;
}

// Validation functions
export function validateSolutionPillar(pillar: unknown): pillar is SolutionProps['copy']['pillars'][0] {
  if (!pillar || typeof pillar !== 'object') return false;
  const pillarObj = pillar as Record<string, unknown>;

  return (
    typeof pillarObj.number === 'string' &&
    typeof pillarObj.title === 'string' &&
    typeof pillarObj.description === 'string' &&
    typeof pillarObj.icon === 'string' &&
    typeof pillarObj.analytics_event === 'string' &&
    typeof pillarObj.animation_delay === 'string'
  );
}

export function validateSolutionCopy(copy: unknown): copy is SolutionProps['copy'] {
  if (!copy || typeof copy !== 'object') return false;
  const copyObj = copy as Record<string, unknown>;

  // Required fields
  if (typeof copyObj.headline !== 'string') return false;
  if (typeof copyObj.supporting_text !== 'string') return false;
  if (!Array.isArray(copyObj.trust_indicators) || !copyObj.trust_indicators.every(t => typeof t === 'string')) return false;

  // Pillars validation
  if (!Array.isArray(copyObj.pillars) || !copyObj.pillars.every(validateSolutionPillar)) return false;

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

export function validateSolutionMedia(media: unknown): media is SectionMedia {
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

export function validateSolutionDesign(design: unknown): design is SectionDesign {
  if (!design || typeof design !== 'object') return false;
  const designObj = design as Record<string, unknown>;

  return (
    (designObj.theme === 'light' || designObj.theme === 'dark') &&
    typeof designObj.accent === 'string' &&
    typeof designObj.background === 'string' &&
    typeof designObj.layout === 'string'
  );
}

export function validateSolutionTracking(tracking: unknown): tracking is SectionTracking {
  if (!tracking || typeof tracking !== 'object') return false;
  const trackingObj = tracking as Record<string, unknown>;

  return (
    typeof trackingObj.section_id === 'string' &&
    typeof trackingObj.impression_event === 'string'
  );
}

export function validateSolutionSection(data: unknown): data is SolutionProps {
  if (!validateSectionBase(data)) return false;

  const section = data as Record<string, unknown>;

  return (
    section.id === 'solution' &&
    validateSolutionCopy(section.copy) &&
    validateSolutionMedia(section.media) &&
    validateSolutionDesign(section.design) &&
    validateSolutionTracking(section.tracking)
  );
}

export function assertSolutionSection(data: unknown): SolutionProps {
  assertSectionBase(data, 'solution');

  if (!validateSolutionSection(data)) {
    throw new Error(`Invalid solution section data: ${JSON.stringify(data, null, 2)}`);
  }

  return data;
}

// Export the schema for runtime use
export const SolutionSchema = {
  validate: validateSolutionSection,
  assert: assertSolutionSection,
  validateCopy: validateSolutionCopy,
  validateMedia: validateSolutionMedia,
  validateDesign: validateSolutionDesign,
  validateTracking: validateSolutionTracking,
  validatePillar: validateSolutionPillar
} as const;