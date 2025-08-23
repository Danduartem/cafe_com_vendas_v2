import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type {
  Section,
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
  TopBannerSection,
  ThankYouContentSection,
  LoadedPageSection,
  SectionValidationError
} from './types.js';

// Design configuration interfaces
interface DesignConfig {
  sections?: Record<string, Record<string, unknown>>;
  faq?: {
    special_item_styles?: Record<string, Record<string, unknown>>;
    default_item_styles?: Record<string, unknown>;
  };
}

interface PageConfig {
  sections: Array<{
    slug: string;
    variant?: string;
    enabled: boolean;
  }>;
}

interface EleventyContext {
  page?: {
    url?: string;
  };
}

// Load centralized design configurations
let designConfigs: DesignConfig | null = null;

function loadDesignConfigs(): DesignConfig {
  if (designConfigs) return designConfigs;

  const designPath = join(process.cwd(), 'design/components.json');
  if (!existsSync(designPath)) {
    console.warn('Design components configuration not found at design/components.json');
    return {};
  }

  try {
    const rawData = JSON.parse(readFileSync(designPath, 'utf-8')) as DesignConfig;
    designConfigs = rawData;
    return rawData;
  } catch (error) {
    console.error('Failed to load design configurations:', error);
    return {};
  }
}

// Section-specific validation functions
function validateHeroSection(section: unknown): section is HeroSection {
  const s = section as Record<string, unknown>;
  return !!(s.copy &&
           typeof s.copy === 'object' &&
           s.design &&
           typeof s.design === 'object' &&
           s.tracking &&
           typeof s.tracking === 'object');
}

function validateProblemSection(section: unknown): section is ProblemSection {
  const s = section as Record<string, unknown>;
  return !!(s.copy &&
           typeof s.copy === 'object' &&
           s.design &&
           typeof s.design === 'object');
}

function validateSolutionSection(section: unknown): section is SolutionSection {
  const s = section as Record<string, unknown>;
  return !!(s.copy &&
           typeof s.copy === 'object' &&
           s.design &&
           typeof s.design === 'object');
}

function validateAboutSection(section: unknown): section is AboutSection {
  const s = section as Record<string, unknown>;
  return !!(s.copy &&
           typeof s.copy === 'object' &&
           s.schema &&
           typeof s.schema === 'object');
}

function validateSocialProofSection(section: unknown): section is SocialProofSection {
  const s = section as Record<string, unknown>;
  return !!(s.testimonials &&
           Array.isArray(s.testimonials));
}

function validateOfferSection(section: unknown): section is OfferSection {
  const s = section as Record<string, unknown>;
  return !!(s.copy &&
           typeof s.copy === 'object');
}

function validateFAQSection(section: unknown): section is FAQSection {
  const s = section as Record<string, unknown>;
  return !!(s.items &&
           Array.isArray(s.items) &&
           s.contact &&
           typeof s.contact === 'object');
}

function validateFinalCTASection(section: unknown): section is FinalCTASection {
  const s = section as Record<string, unknown>;
  return !!(s.copy &&
           typeof s.copy === 'object');
}

function validateFooterSection(section: unknown): section is FooterSection {
  const s = section as Record<string, unknown>;
  return !!(s.copy &&
           typeof s.copy === 'object');
}

function validateTopBannerSection(section: unknown): section is TopBannerSection {
  const s = section as Record<string, unknown>;
  return !!(s.copy &&
           typeof s.copy === 'object');
}

function validateThankYouContentSection(section: unknown): section is ThankYouContentSection {
  const s = section as Record<string, unknown>;
  return !!(s.copy &&
           typeof s.copy === 'object' &&
           s.design &&
           typeof s.design === 'object' &&
           s.tracking &&
           typeof s.tracking === 'object');
}

/**
 * Validates section data against known section types
 */
function validateSection(data: unknown, slug: string): data is Section {
  if (!data || typeof data !== 'object') return false;

  const section = data as Record<string, unknown>;

  // Basic section validation
  if (section.id !== slug) return false;
  if (typeof section.variant !== 'string' && section.variant !== undefined) return false;
  if (typeof section.enabled !== 'boolean' && section.enabled !== undefined) return false;

  // Section-specific validation based on slug
  switch (slug) {
  case 'hero':
    return validateHeroSection(section);
  case 'problem':
    return validateProblemSection(section);
  case 'solution':
    return validateSolutionSection(section);
  case 'about':
    return validateAboutSection(section);
  case 'social-proof':
    return validateSocialProofSection(section);
  case 'offer':
    return validateOfferSection(section);
  case 'faq':
    return validateFAQSection(section);
  case 'final-cta':
    return validateFinalCTASection(section);
  case 'footer':
    return validateFooterSection(section);
  case 'top-banner':
    return validateTopBannerSection(section);
  case 'thank-you-content':
    return validateThankYouContentSection(section);
  default:
    console.warn(`Unknown section slug: ${slug}`);
    return false;
  }
}

/**
 * Loads section data from JSON file with validation and merges design configurations
 */
function loadSection(slug: string, _variant?: string): Section | null {
  const sectionPath = join(process.cwd(), `content/pt-PT/sections/${slug}.json`);

  if (!existsSync(sectionPath)) {
    const error = new Error(`Section file not found: ${sectionPath}`) as SectionValidationError;
    error.sectionSlug = slug;
    error.filePath = sectionPath;
    throw error;
  }

  try {
    const rawData = JSON.parse(readFileSync(sectionPath, 'utf-8')) as Record<string, unknown>;

    // Load design configurations and merge them
    const designData = loadDesignConfigs();
    const mergedData = {
      ...rawData,
      design: designData.sections?.[slug] ?? {}
    };

    // For FAQ section, also merge individual item styles
    if (slug === 'faq' && designData.faq && 'items' in mergedData && Array.isArray(mergedData.items)) {
      const faqItems = mergedData.items as Array<Record<string, unknown>>;
      mergedData.items = faqItems.map((item) => {
        // Apply special styles based on item ID or use defaults
        const itemId = String(item.id);
        const specialStyles = designData.faq!.special_item_styles?.[itemId] ?? designData.faq!.default_item_styles ?? {};
        return {
          ...item,
          ...specialStyles
        };
      });
    }

    if (!validateSection(mergedData, slug)) {
      console.warn(`Section validation failed for ${slug}, but continuing build`);
      return null; // Return null instead of throwing to continue with other sections
    }

    return mergedData;
  } catch (parseError) {
    const error = new Error(`Failed to parse section file ${sectionPath}: ${parseError}`) as SectionValidationError;
    error.sectionSlug = slug;
    error.filePath = sectionPath;
    throw error;
  }
}

/**
 * Determines the current page key from the Eleventy context
 */
function getPageKey(context?: EleventyContext): string {
  const url = context?.page?.url ?? '/';

  // Map URLs to page keys
  const urlMap: Record<string, string> = {
    '/': 'landing',
    '/thank-you/': 'thank-you',
    '/thank-you/index.html': 'thank-you',
    '/legal/privacy/': 'legal-privacy'
  };

  return urlMap[url] || 'landing';
}

/**
 * Generic page loader that assembles page data with sections
 * This replaces all individual data loaders (event.ts, faq.ts, testimonials.ts, etc.)
 */
export default function(this: EleventyContext): LoadedPageSection[] {
  try {
    // Get the current page context
    const pageKey = getPageKey(this);
    const pagePath = join(process.cwd(), `content/pt-PT/pages/${pageKey}.json`);

    if (!existsSync(pagePath)) {
      return [];
    }

    // Load page configuration
    const pageConfig = JSON.parse(readFileSync(pagePath, 'utf-8')) as PageConfig;

    // Load all enabled sections
    const sections: LoadedPageSection[] = [];

    for (const sectionConfig of pageConfig.sections) {
      if (!sectionConfig.enabled) {
        continue; // Skip disabled sections
      }

      try {
        const sectionData = loadSection(sectionConfig.slug, sectionConfig.variant);

        if (sectionData) { // Only push if section data is valid
          sections.push({
            slug: sectionConfig.slug as SectionSlug,
            variant: sectionConfig.variant,
            enabled: sectionConfig.enabled,
            data: sectionData
          });
        }

      } catch (sectionError) {
        console.error(`Failed to load section ${sectionConfig.slug}:`, sectionError);
        // Continue with other sections instead of failing the entire build
      }
    }
    return sections;

  } catch (error) {
    console.error('Page loader failed:', error);
    return [];
  }
}