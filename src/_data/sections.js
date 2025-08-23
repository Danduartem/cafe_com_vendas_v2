import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load centralized design configurations
/** @type {any} */
let designConfigs = null;

/**
 * @returns {any}
 */
function loadDesignConfigs() {
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
/**
 * @param {any} section
 * @returns {boolean}
 */
function validateHeroSection(section) {
  return !!(section.copy &&
           typeof section.copy === 'object' &&
           section.design &&
           typeof section.design === 'object' &&
           section.tracking &&
           typeof section.tracking === 'object');
}

/**
 * @param {any} section
 * @returns {boolean}
 */
function validateProblemSection(section) {
  return !!(section.copy &&
           typeof section.copy === 'object' &&
           section.design &&
           typeof section.design === 'object');
}

/**
 * @param {any} section
 * @returns {boolean}
 */
function validateSolutionSection(section) {
  return !!(section.copy &&
           typeof section.copy === 'object' &&
           section.design &&
           typeof section.design === 'object');
}

/**
 * @param {any} section
 * @returns {boolean}
 */
function validateAboutSection(section) {
  return !!(section.copy &&
           typeof section.copy === 'object' &&
           section.schema &&
           typeof section.schema === 'object');
}

/**
 * @param {any} section
 * @returns {boolean}
 */
function validateSocialProofSection(section) {
  return !!(section.testimonials &&
           Array.isArray(section.testimonials));
}

/**
 * @param {any} section
 * @returns {boolean}
 */
function validateOfferSection(section) {
  return !!(section.copy &&
           typeof section.copy === 'object');
}

/**
 * @param {any} section
 * @returns {boolean}
 */
function validateFAQSection(section) {
  return !!(section.items &&
           Array.isArray(section.items) &&
           section.contact &&
           typeof section.contact === 'object');
}

/**
 * @param {any} section
 * @returns {boolean}
 */
function validateFinalCTASection(section) {
  return !!(section.copy &&
           typeof section.copy === 'object');
}

/**
 * @param {any} section
 * @returns {boolean}
 */
function validateFooterSection(section) {
  return !!(section.copy &&
           typeof section.copy === 'object');
}

/**
 * @param {any} section
 * @returns {boolean}
 */
function validateTopBannerSection(section) {
  return !!(section.copy &&
           typeof section.copy === 'object');
}

/**
 * @param {any} section
 * @returns {boolean}
 */
function validateThankYouContentSection(section) {
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
/**
 * @param {any} data
 * @param {string} slug
 * @returns {boolean}
 */
function validateSection(data, slug) {
  if (!data || typeof data !== 'object') return false;

  const section = data;

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
/**
 * @param {string} slug
 * @param {string} _variant
 * @returns {any}
 */
function loadSection(slug, _variant) {
  const sectionPath = join(process.cwd(), `content/pt-PT/sections/${slug}.json`);

  if (!existsSync(sectionPath)) {
    const error = /** @type {any} */ (new Error(`Section file not found: ${sectionPath}`));
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
      design: designData.sections && designData.sections[slug] ? designData.sections[slug] : {}
    };

    // For FAQ section, also merge individual item styles
    if (slug === 'faq' && designData.faq && mergedData.items) {
      mergedData.items = mergedData.items.map((/** @type {any} */ item) => {
        // Apply special styles based on item ID or use defaults
        const itemId = String(item.id);
        const specialStyles = (designData.faq.special_item_styles && designData.faq.special_item_styles[itemId]) || designData.faq.default_item_styles || {};
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
    const error = /** @type {any} */ (new Error(`Failed to parse section file ${sectionPath}: ${parseError}`));
    error.sectionSlug = slug;
    error.filePath = sectionPath;
    throw error;
  }
}

/**
 * Determines the current page key from the Eleventy context
 */
/**
 * @param {any} context
 * @returns {string}
 */
function getPageKey(context) {
  const url = context && context.page && context.page.url ? context.page.url : '/';

  // Map URLs to page keys
  const urlMap = {
    '/': 'landing',
    '/thank-you/': 'thank-you',
    '/thank-you/index.html': 'thank-you',
    '/legal/privacy/': 'legal-privacy'
  };

  return (/** @type {any} */ (urlMap))[url] || 'landing';
}

/**
 * Generic page loader that assembles page data with sections
 * This replaces all individual data loaders (event.ts, faq.ts, testimonials.ts, etc.)
 */
/**
 * @this {any}
 * @returns {any[]}
 */
export default function() {
  try {
    // Get the current page context
    const pageKey = getPageKey(/** @type {any} */ (this));
    const pagePath = join(process.cwd(), `content/pt-PT/pages/${pageKey}.json`);

    if (!existsSync(pagePath)) {
      return [];
    }

    // Load page configuration
    const pageConfig = JSON.parse(readFileSync(pagePath, 'utf-8'));

    // Load all enabled sections
    const sections = [];

    for (const sectionConfig of pageConfig.sections) {
      if (!sectionConfig.enabled) {
        continue; // Skip disabled sections
      }

      try {
        const sectionData = loadSection(sectionConfig.slug, sectionConfig.variant);

        if (sectionData) { // Only push if section data is valid
          sections.push({
            slug: sectionConfig.slug,
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