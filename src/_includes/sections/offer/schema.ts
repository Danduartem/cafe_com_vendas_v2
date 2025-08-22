/**
 * Offer Section Schema and Validation
 *
 * Type-safe contracts and runtime validation for the offer section
 */

import type { OfferSection, SectionCTA, SectionMedia, SectionDesign, SectionTracking } from '../../../_data/types.ts';
import { validateSectionBase, assertSectionBase } from '../../../_data/types.ts';

// Extend the existing OfferSection interface for strict validation
export interface OfferProps extends OfferSection {
  id: 'offer';
  copy: {
    eyebrow?: string;
    headline: string;
    subhead?: string;
    description?: string;
    cta?: SectionCTA;
    pricing: {
      first_lot: {
        label: string;
        original_price: number;
        discounted_price: number;
        currency: string;
        capacity: number;
        bonuses: string[];
      };
      second_lot: {
        label: string;
        price: number;
        currency: string;
        capacity: number;
      };
    };
    includes: string[];
    guarantee: {
      type: string;
      claim: string;
      period: string;
      policy: string;
    };
  };
  media?: SectionMedia;
  design: SectionDesign;
  tracking: SectionTracking;
}

// Validation functions
export function validateOfferPricing(pricing: unknown): pricing is OfferProps['copy']['pricing'] {
  if (!pricing || typeof pricing !== 'object') return false;
  const pricingObj = pricing as Record<string, unknown>;

  // First lot validation
  if (!pricingObj.first_lot || typeof pricingObj.first_lot !== 'object') return false;
  const firstLot = pricingObj.first_lot as Record<string, unknown>;

  if (
    typeof firstLot.label !== 'string' ||
    typeof firstLot.original_price !== 'number' ||
    typeof firstLot.discounted_price !== 'number' ||
    typeof firstLot.currency !== 'string' ||
    typeof firstLot.capacity !== 'number' ||
    !Array.isArray(firstLot.bonuses) ||
    !firstLot.bonuses.every(b => typeof b === 'string')
  ) return false;

  // Second lot validation
  if (!pricingObj.second_lot || typeof pricingObj.second_lot !== 'object') return false;
  const secondLot = pricingObj.second_lot as Record<string, unknown>;

  return (
    typeof secondLot.label === 'string' &&
    typeof secondLot.price === 'number' &&
    typeof secondLot.currency === 'string' &&
    typeof secondLot.capacity === 'number'
  );
}

export function validateOfferGuarantee(guarantee: unknown): guarantee is OfferProps['copy']['guarantee'] {
  if (!guarantee || typeof guarantee !== 'object') return false;
  const guaranteeObj = guarantee as Record<string, unknown>;

  return (
    typeof guaranteeObj.type === 'string' &&
    typeof guaranteeObj.claim === 'string' &&
    typeof guaranteeObj.period === 'string' &&
    typeof guaranteeObj.policy === 'string'
  );
}

export function validateOfferCopy(copy: unknown): copy is OfferProps['copy'] {
  if (!copy || typeof copy !== 'object') return false;
  const copyObj = copy as Record<string, unknown>;

  // Required fields
  if (typeof copyObj.headline !== 'string') return false;
  if (!validateOfferPricing(copyObj.pricing)) return false;
  if (!Array.isArray(copyObj.includes) || !copyObj.includes.every(i => typeof i === 'string')) return false;
  if (!validateOfferGuarantee(copyObj.guarantee)) return false;

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

export function validateOfferMedia(media: unknown): media is SectionMedia {
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

export function validateOfferDesign(design: unknown): design is SectionDesign {
  if (!design || typeof design !== 'object') return false;
  const designObj = design as Record<string, unknown>;

  return (
    (designObj.theme === 'light' || designObj.theme === 'dark') &&
    typeof designObj.accent === 'string' &&
    typeof designObj.background === 'string' &&
    typeof designObj.layout === 'string'
  );
}

export function validateOfferTracking(tracking: unknown): tracking is SectionTracking {
  if (!tracking || typeof tracking !== 'object') return false;
  const trackingObj = tracking as Record<string, unknown>;

  return (
    typeof trackingObj.section_id === 'string' &&
    typeof trackingObj.impression_event === 'string'
  );
}

export function validateOfferSection(data: unknown): data is OfferProps {
  if (!validateSectionBase(data)) return false;

  const section = data as Record<string, unknown>;

  return (
    section.id === 'offer' &&
    validateOfferCopy(section.copy) &&
    validateOfferMedia(section.media) &&
    validateOfferDesign(section.design) &&
    validateOfferTracking(section.tracking)
  );
}

export function assertOfferSection(data: unknown): OfferProps {
  assertSectionBase(data, 'offer');

  if (!validateOfferSection(data)) {
    throw new Error(`Invalid offer section data: ${JSON.stringify(data, null, 2)}`);
  }

  return data;
}

// Export the schema for runtime use
export const OfferSchema = {
  validate: validateOfferSection,
  assert: assertOfferSection,
  validateCopy: validateOfferCopy,
  validateMedia: validateOfferMedia,
  validateDesign: validateOfferDesign,
  validateTracking: validateOfferTracking,
  validatePricing: validateOfferPricing,
  validateGuarantee: validateOfferGuarantee
} as const;