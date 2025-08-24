/**
 * Test utility for loading and validating section data
 * Uses production data loading logic to ensure tests validate actual runtime behavior
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
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

// Type definitions for design configuration
interface DesignConfigs {
  sections?: Record<SectionSlug, unknown>;
  faq?: {
    special_item_styles?: Record<string, unknown>;
    default_item_styles?: Record<string, unknown>;
  };
}

// Load centralized design configurations (same as production)
let designConfigs: DesignConfigs | null = null;

function loadDesignConfigs(): DesignConfigs {
  if (designConfigs) return designConfigs;

  const designPath = join(process.cwd(), 'design/components.json');
  if (!existsSync(designPath)) {
    console.warn('Design components configuration not found at design/components.json');
    return {};
  }

  try {
    const rawData = JSON.parse(readFileSync(designPath, 'utf-8')) as DesignConfigs;
    designConfigs = rawData;
    return rawData;
  } catch (error) {
    console.error('Failed to load design configurations:', error);
    return {};
  }
}

/**
 * Load section JSON data from content directory with design configurations merged
 * This mirrors the production loadSection() function in src/_data/page.ts
 */
export function loadSectionData(sectionSlug: SectionSlug): unknown {
  const sectionPath = resolve(process.cwd(), `src/_data/sections/${sectionSlug}.json`);

  if (!existsSync(sectionPath)) {
    throw new Error(`Section file not found: ${sectionPath}`);
  }

  try {
    const rawData = JSON.parse(readFileSync(sectionPath, 'utf-8')) as Record<string, unknown>;

    // Load design configurations and merge them (production behavior)
    const designData = loadDesignConfigs();
    const sectionsData = designData.sections;
    const mergedData = {
      ...rawData,
      design: sectionsData?.[sectionSlug] || {}
    };

    // For FAQ section, also merge individual item styles (production behavior)
    if (sectionSlug === 'faq' && designData.faq && 'items' in mergedData && Array.isArray(mergedData.items)) {
      const faqDesignData = designData.faq;
      const specialItemStyles = faqDesignData.special_item_styles;
      const defaultItemStyles = faqDesignData.default_item_styles;
      
      mergedData.items = mergedData.items.map((item: unknown) => {
        const itemRecord = item as Record<string, unknown>;
        // Apply special styles based on item ID or use defaults
        const itemStyles = (specialItemStyles)?.[itemRecord.id as string] 
          || (defaultItemStyles) 
          || {};
        return {
          ...itemRecord,
          ...itemStyles
        };
      });
    }

    return mergedData;
  } catch (error) {
    throw new Error(`Failed to load section data for ${sectionSlug}: ${error instanceof Error ? error.message : String(error)}`);
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