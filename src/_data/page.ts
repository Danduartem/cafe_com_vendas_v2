import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type {
  LoadedPage,
  LoadedPageSection,
  PageComposition,
  Section,
  SectionSlug,
  SectionValidationError
} from './types.ts';

// Load centralized design configurations
let designConfigs: Record<string, unknown> | null = null;

function loadDesignConfigs(): Record<string, unknown> {
  if (designConfigs) return designConfigs;

  const designPath = join(process.cwd(), 'design/components.json');
  if (!existsSync(designPath)) {
    console.warn('Design components configuration not found at design/components.json');
    return {};
  }

  try {
    const rawData = JSON.parse(readFileSync(designPath, 'utf-8'));
    designConfigs = rawData;
    return rawData;
  } catch (error) {
    console.error('Failed to load design configurations:', error);
    return {};
  }
}

// Section-specific validation functions
function validateHeroSection(section: Record<string, unknown>): boolean {
  return !!(section.copy &&
           typeof section.copy === 'object' &&
           section.design &&
           typeof section.design === 'object' &&
           section.tracking &&
           typeof section.tracking === 'object');
}

function validateProblemSection(section: Record<string, unknown>): boolean {
  return !!(section.copy &&
           typeof section.copy === 'object' &&
           section.design &&
           typeof section.design === 'object');
}

function validateSolutionSection(section: Record<string, unknown>): boolean {
  return !!(section.copy &&
           typeof section.copy === 'object' &&
           section.design &&
           typeof section.design === 'object');
}

function validateAboutSection(section: Record<string, unknown>): boolean {
  return !!(section.copy &&
           typeof section.copy === 'object' &&
           section.schema &&
           typeof section.schema === 'object');
}

function validateSocialProofSection(section: Record<string, unknown>): boolean {
  return !!(section.testimonials &&
           Array.isArray(section.testimonials));
}

function validateOfferSection(section: Record<string, unknown>): boolean {
  return !!(section.copy &&
           typeof section.copy === 'object');
}

function validateFAQSection(section: Record<string, unknown>): boolean {
  return !!(section.items &&
           Array.isArray(section.items) &&
           section.contact &&
           typeof section.contact === 'object');
}

function validateFinalCTASection(section: Record<string, unknown>): boolean {
  return !!(section.copy &&
           typeof section.copy === 'object');
}

function validateFooterSection(section: Record<string, unknown>): boolean {
  return !!(section.copy &&
           typeof section.copy === 'object');
}

function validateTopBannerSection(section: Record<string, unknown>): boolean {
  return !!(section.copy &&
           typeof section.copy === 'object');
}

function validateThankYouContentSection(section: Record<string, unknown>): boolean {
  return !!(section.copy &&
           typeof section.copy === 'object' &&
           section.design &&
           typeof section.design === 'object' &&
           section.tracking &&
           typeof section.tracking === 'object');
}

/**
 * Validates section data against known section types
 */
function validateSection(data: unknown, slug: SectionSlug): data is Section {
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
function loadSection(slug: SectionSlug, _variant?: string): Section {
  const sectionPath = join(process.cwd(), `content/pt-PT/sections/${slug}.json`);

  if (!existsSync(sectionPath)) {
    const error = new Error(`Section file not found: ${sectionPath}`) as SectionValidationError;
    error.sectionSlug = slug;
    error.filePath = sectionPath;
    throw error;
  }

  try {
    const rawData = JSON.parse(readFileSync(sectionPath, 'utf-8'));

    // Load design configurations and merge them
    const designData = loadDesignConfigs();
    const mergedData = {
      ...rawData,
      design: designData.sections?.[slug] || {}
    };

    // For FAQ section, also merge individual item styles
    if (slug === 'faq' && designData.faq && mergedData.items) {
      mergedData.items = mergedData.items.map((item: Record<string, unknown>) => {
        // Apply special styles based on item ID or use defaults
        const specialStyles = designData.faq.special_item_styles?.[item.id] || designData.faq.default_item_styles || {};
        return {
          ...item,
          ...specialStyles
        };
      });
    }

    if (!validateSection(mergedData, slug)) {
      const error = new Error(`Invalid section data for ${slug}: ${JSON.stringify(mergedData, null, 2)}`) as SectionValidationError;
      error.sectionSlug = slug;
      error.filePath = sectionPath;
      throw error;
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
function getPageKey(context?: { page?: { url?: string } }): string {
  const url = context?.page?.url || '/';

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
export default function(this: { page?: { url?: string } }): LoadedPage {
  try {
    // Get the current page context
    const pageKey = getPageKey(this);
    const pagePath = join(process.cwd(), `content/pt-PT/pages/${pageKey}.json`);

    if (!existsSync(pagePath)) {
      throw new Error(`Page configuration not found: ${pagePath}`);
    }

    // Load page configuration
    const pageConfig: PageComposition = JSON.parse(readFileSync(pagePath, 'utf-8'));

    // Load all enabled sections
    const sections: LoadedPageSection[] = [];

    for (const sectionConfig of pageConfig.sections) {
      if (!sectionConfig.enabled) {
        continue; // Skip disabled sections
      }

      try {
        const sectionData = loadSection(sectionConfig.slug as SectionSlug, sectionConfig.variant);

        sections.push({
          slug: sectionConfig.slug as SectionSlug,
          variant: sectionConfig.variant,
          enabled: sectionConfig.enabled,
          data: sectionData
        });

      } catch (sectionError) {
        console.error(`Failed to load section ${sectionConfig.slug}:`, sectionError);
        // Continue with other sections instead of failing the entire build
      }
    }

    return {
      meta: {
        route: pageConfig.route,
        title: pageConfig.title,
        description: pageConfig.description,
        layout: pageConfig.layout,
        permalink: pageConfig.permalink,
        eleventyNavigation: pageConfig.eleventyNavigation
      },
      sections
    };

  } catch (error) {
    console.error('Page loader failed:', error);
    throw error;
  }
}