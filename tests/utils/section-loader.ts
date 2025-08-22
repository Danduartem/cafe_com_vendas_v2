/**
 * Test utility for loading and validating section data
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import type {
  SectionSlug,
  HeroSection,
  ProblemSection,
  SolutionSection,
  AboutSection,
  SocialProofSection,
  OfferSection,
  FAQSection,
  FinalCTASection,
  FooterSection,
  TopBannerSection
} from '../../src/_data/types.ts';

/**
 * Load section JSON data from content directory
 */
export function loadSectionData(sectionSlug: SectionSlug): unknown {
  const filePath = resolve(process.cwd(), `content/pt-PT/sections/${sectionSlug}.json`);
  try {
    const content = readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load section data for ${sectionSlug}: ${error}`);
  }
}

/**
 * Load all section data
 */
export function loadAllSectionData(): Record<SectionSlug, unknown> {
  const sections: SectionSlug[] = [
    'top-banner', 'hero', 'problem', 'solution', 'about',
    'social-proof', 'offer', 'faq', 'final-cta', 'footer'
  ];

  return sections.reduce((acc, slug) => {
    acc[slug] = loadSectionData(slug);
    return acc;
  }, {} as Record<SectionSlug, unknown>);
}

/**
 * Type guards for section validation
 */

export function isHeroSection(data: unknown): data is HeroSection {
  if (!data || typeof data !== 'object') return false;
  const section = data as Record<string, unknown>;

  return (
    section.id === 'hero' &&
    typeof section.variant === 'string' &&
    typeof section.enabled === 'boolean' &&
    typeof section.copy === 'object' &&
    section.copy !== null &&
    typeof section.design === 'object' &&
    section.design !== null &&
    typeof section.tracking === 'object' &&
    section.tracking !== null
  );
}

export function isProblemSection(data: unknown): data is ProblemSection {
  if (!data || typeof data !== 'object') return false;
  const section = data as Record<string, unknown>;

  return (
    section.id === 'problem' &&
    typeof section.variant === 'string' &&
    typeof section.enabled === 'boolean' &&
    typeof section.copy === 'object' &&
    section.copy !== null
  );
}

export function isSolutionSection(data: unknown): data is SolutionSection {
  if (!data || typeof data !== 'object') return false;
  const section = data as Record<string, unknown>;

  return (
    section.id === 'solution' &&
    typeof section.variant === 'string' &&
    typeof section.enabled === 'boolean' &&
    typeof section.copy === 'object' &&
    section.copy !== null
  );
}

export function isAboutSection(data: unknown): data is AboutSection {
  if (!data || typeof data !== 'object') return false;
  const section = data as Record<string, unknown>;

  return (
    section.id === 'about' &&
    typeof section.variant === 'string' &&
    typeof section.enabled === 'boolean' &&
    typeof section.copy === 'object' &&
    section.copy !== null
  );
}

export function isSocialProofSection(data: unknown): data is SocialProofSection {
  if (!data || typeof data !== 'object') return false;
  const section = data as Record<string, unknown>;

  return (
    section.id === 'social-proof' &&
    typeof section.variant === 'string' &&
    typeof section.enabled === 'boolean' &&
    Array.isArray(section.testimonials)
  );
}

export function isOfferSection(data: unknown): data is OfferSection {
  if (!data || typeof data !== 'object') return false;
  const section = data as Record<string, unknown>;

  return (
    section.id === 'offer' &&
    typeof section.variant === 'string' &&
    typeof section.enabled === 'boolean' &&
    typeof section.copy === 'object' &&
    section.copy !== null
  );
}

export function isFAQSection(data: unknown): data is FAQSection {
  if (!data || typeof data !== 'object') return false;
  const section = data as Record<string, unknown>;

  return (
    section.id === 'faq' &&
    typeof section.variant === 'string' &&
    typeof section.enabled === 'boolean' &&
    Array.isArray(section.items)
  );
}

export function isFinalCTASection(data: unknown): data is FinalCTASection {
  if (!data || typeof data !== 'object') return false;
  const section = data as Record<string, unknown>;

  return (
    section.id === 'final-cta' &&
    typeof section.variant === 'string' &&
    typeof section.enabled === 'boolean' &&
    typeof section.copy === 'object' &&
    section.copy !== null
  );
}

export function isFooterSection(data: unknown): data is FooterSection {
  if (!data || typeof data !== 'object') return false;
  const section = data as Record<string, unknown>;

  return (
    section.id === 'footer' &&
    typeof section.variant === 'string' &&
    typeof section.enabled === 'boolean' &&
    typeof section.copy === 'object' &&
    section.copy !== null
  );
}

export function isTopBannerSection(data: unknown): data is TopBannerSection {
  if (!data || typeof data !== 'object') return false;
  const section = data as Record<string, unknown>;

  return (
    section.id === 'top-banner' &&
    typeof section.variant === 'string' &&
    typeof section.enabled === 'boolean' &&
    typeof section.copy === 'object' &&
    section.copy !== null
  );
}

/**
 * Validate section data against its expected type
 */
export function validateSectionData(sectionSlug: SectionSlug, data: unknown): boolean {
  switch (sectionSlug) {
  case 'hero':
    return isHeroSection(data);
  case 'problem':
    return isProblemSection(data);
  case 'solution':
    return isSolutionSection(data);
  case 'about':
    return isAboutSection(data);
  case 'social-proof':
    return isSocialProofSection(data);
  case 'offer':
    return isOfferSection(data);
  case 'faq':
    return isFAQSection(data);
  case 'final-cta':
    return isFinalCTASection(data);
  case 'footer':
    return isFooterSection(data);
  case 'top-banner':
    return isTopBannerSection(data);
  default:
    return false;
  }
}