/**
 * Footer Section Schema and Validation
 *
 * Type-safe contracts and runtime validation for the footer section
 */

import type { FooterSection, SectionCTA, SectionMedia, SectionDesign, SectionTracking } from '../../../_data/types';
import { validateSectionBase, assertSectionBase } from '../../../_data/types';

// Extend the existing FooterSection interface for strict validation
export interface FooterProps extends FooterSection {
  id: 'footer';
  copy: {
    eyebrow?: string;
    headline: string;
    subhead?: string;
    description?: string;
    cta?: SectionCTA;
    stats: Array<{
      value: number | string;
      label: string;
      counter: boolean;
    }>;
    brand: {
      name: string;
      tagline: string;
      description: string;
      guarantee: string;
    };
    navigation: {
      legal: Array<{
        label: string;
        url: string;
        external?: boolean;
      }>;
    };
    contact: {
      whatsapp: {
        number: string;
        message: string;
        url: string;
      };
      email: {
        address: string;
        url: string;
      };
      social: Array<{
        platform: string;
        username?: string;
        url: string;
      }>;
    };
    organization: {
      name: string;
      description: string;
      url: string;
      logo: string;
      phone: string;
      country: string;
      city: string;
      founderName: string;
      founderTitle: string;
    };
  };
  media?: SectionMedia;
  design: SectionDesign;
  tracking: SectionTracking;
}

// Validation functions
export function validateFooterStat(stat: unknown): stat is FooterProps['copy']['stats'][0] {
  if (!stat || typeof stat !== 'object') return false;
  const statObj = stat as Record<string, unknown>;

  return (
    (typeof statObj.value === 'number' || typeof statObj.value === 'string') &&
    typeof statObj.label === 'string' &&
    typeof statObj.counter === 'boolean'
  );
}

export function validateFooterBrand(brand: unknown): brand is FooterProps['copy']['brand'] {
  if (!brand || typeof brand !== 'object') return false;
  const brandObj = brand as Record<string, unknown>;

  return (
    typeof brandObj.name === 'string' &&
    typeof brandObj.tagline === 'string' &&
    typeof brandObj.description === 'string' &&
    typeof brandObj.guarantee === 'string'
  );
}

export function validateFooterLegalLink(link: unknown): link is FooterProps['copy']['navigation']['legal'][0] {
  if (!link || typeof link !== 'object') return false;
  const linkObj = link as Record<string, unknown>;

  return (
    typeof linkObj.label === 'string' &&
    typeof linkObj.url === 'string' &&
    (linkObj.external === undefined || typeof linkObj.external === 'boolean')
  );
}

export function validateFooterNavigation(nav: unknown): nav is FooterProps['copy']['navigation'] {
  if (!nav || typeof nav !== 'object') return false;
  const navObj = nav as Record<string, unknown>;

  return (
    Array.isArray(navObj.legal) &&
    navObj.legal.every(validateFooterLegalLink)
  );
}

export function validateFooterSocial(social: unknown): social is FooterProps['copy']['contact']['social'][0] {
  if (!social || typeof social !== 'object') return false;
  const socialObj = social as Record<string, unknown>;

  return (
    typeof socialObj.platform === 'string' &&
    typeof socialObj.url === 'string' &&
    (socialObj.username === undefined || typeof socialObj.username === 'string')
  );
}

export function validateFooterContact(contact: unknown): contact is FooterProps['copy']['contact'] {
  if (!contact || typeof contact !== 'object') return false;
  const contactObj = contact as Record<string, unknown>;

  // WhatsApp validation
  if (!contactObj.whatsapp || typeof contactObj.whatsapp !== 'object') return false;
  const whatsapp = contactObj.whatsapp as Record<string, unknown>;
  if (typeof whatsapp.number !== 'string' || typeof whatsapp.message !== 'string' || typeof whatsapp.url !== 'string') {
    return false;
  }

  // Email validation
  if (!contactObj.email || typeof contactObj.email !== 'object') return false;
  const email = contactObj.email as Record<string, unknown>;
  if (typeof email.address !== 'string' || typeof email.url !== 'string') {
    return false;
  }

  // Social validation
  if (!Array.isArray(contactObj.social) || !contactObj.social.every(validateFooterSocial)) {
    return false;
  }

  return true;
}

export function validateFooterOrganization(org: unknown): org is FooterProps['copy']['organization'] {
  if (!org || typeof org !== 'object') return false;
  const orgObj = org as Record<string, unknown>;

  return (
    typeof orgObj.name === 'string' &&
    typeof orgObj.description === 'string' &&
    typeof orgObj.url === 'string' &&
    typeof orgObj.logo === 'string' &&
    typeof orgObj.phone === 'string' &&
    typeof orgObj.country === 'string' &&
    typeof orgObj.city === 'string' &&
    typeof orgObj.founderName === 'string' &&
    typeof orgObj.founderTitle === 'string'
  );
}

export function validateFooterCopy(copy: unknown): copy is FooterProps['copy'] {
  if (!copy || typeof copy !== 'object') return false;
  const copyObj = copy as Record<string, unknown>;

  // Required fields
  if (typeof copyObj.headline !== 'string') return false;
  if (!Array.isArray(copyObj.stats) || !copyObj.stats.every(validateFooterStat)) return false;
  if (!validateFooterBrand(copyObj.brand)) return false;
  if (!validateFooterNavigation(copyObj.navigation)) return false;
  if (!validateFooterContact(copyObj.contact)) return false;
  if (!validateFooterOrganization(copyObj.organization)) return false;

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

export function validateFooterMedia(media: unknown): media is SectionMedia {
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

export function validateFooterDesign(design: unknown): design is SectionDesign {
  if (!design || typeof design !== 'object') return false;
  const designObj = design as Record<string, unknown>;

  return (
    (designObj.theme === 'light' || designObj.theme === 'dark') &&
    typeof designObj.accent === 'string' &&
    typeof designObj.background === 'string' &&
    typeof designObj.layout === 'string'
  );
}

export function validateFooterTracking(tracking: unknown): tracking is SectionTracking {
  if (!tracking || typeof tracking !== 'object') return false;
  const trackingObj = tracking as Record<string, unknown>;

  return (
    typeof trackingObj.section_id === 'string' &&
    typeof trackingObj.impression_event === 'string'
  );
}

export function validateFooterSection(data: unknown): data is FooterProps {
  if (!validateSectionBase(data)) return false;

  const section = data as Record<string, unknown>;

  return (
    section.id === 'footer' &&
    validateFooterCopy(section.copy) &&
    validateFooterMedia(section.media) &&
    validateFooterDesign(section.design) &&
    validateFooterTracking(section.tracking)
  );
}

export function assertFooterSection(data: unknown): FooterProps {
  assertSectionBase(data, 'footer');

  if (!validateFooterSection(data)) {
    throw new Error(`Invalid footer section data: ${JSON.stringify(data, null, 2)}`);
  }

  return data;
}

// Export the schema for runtime use
export const FooterSchema = {
  validate: validateFooterSection,
  assert: assertFooterSection,
  validateCopy: validateFooterCopy,
  validateMedia: validateFooterMedia,
  validateDesign: validateFooterDesign,
  validateTracking: validateFooterTracking,
  validateStat: validateFooterStat,
  validateBrand: validateFooterBrand,
  validateNavigation: validateFooterNavigation,
  validateContact: validateFooterContact,
  validateOrganization: validateFooterOrganization,
  validateSocial: validateFooterSocial,
  validateLegalLink: validateFooterLegalLink
} as const;