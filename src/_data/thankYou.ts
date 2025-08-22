/**
 * Thank You Page Data Loader
 * Loads thank-you page sections using the same pattern as the main page loader
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type {
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

// Re-use the same validation functions from page.ts
function validateThankYouContentSection(section: Record<string, unknown>): boolean {
  return !!(section.copy &&
           typeof section.copy === 'object' &&
           section.design &&
           typeof section.design === 'object' &&
           section.tracking &&
           typeof section.tracking === 'object');
}

function validateSection(data: unknown, slug: SectionSlug): data is Section {
  if (!data || typeof data !== 'object') return false;

  const section = data as Record<string, unknown>;

  // Basic section validation
  if (section.id !== slug) return false;
  if (typeof section.variant !== 'string' && section.variant !== undefined) return false;
  if (typeof section.enabled !== 'boolean' && section.enabled !== undefined) return false;

  // Section-specific validation
  if (slug === 'thank-you-content') {
    return validateThankYouContentSection(section);
  }

  return false;
}

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

export default function(): { sections: LoadedPageSection[] } {
  try {
    const pageConfigPath = join(process.cwd(), 'content/pt-PT/pages/thank-you.json');

    if (!existsSync(pageConfigPath)) {
      throw new Error(`Thank you page configuration not found: ${pageConfigPath}`);
    }

    const pageConfig: PageComposition = JSON.parse(readFileSync(pageConfigPath, 'utf-8'));
    const sections: LoadedPageSection[] = [];

    for (const sectionConfig of pageConfig.sections) {
      if (!sectionConfig.enabled) {
        continue;
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
      }
    }

    return { sections };

  } catch (error) {
    console.error('Thank you page loader failed:', error);
    return { sections: [] };
  }
}