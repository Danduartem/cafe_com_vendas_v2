import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type {
  Section,
  SectionSlug,
  LoadedPageSection,
} from './types';

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

// Basic validation function
function validateSection(data: unknown, slug: string): data is Section {
  if (!data || typeof data !== 'object') return false;
  const section = data as Record<string, unknown>;
  if (section.id !== slug) return false;
  return true; // Simplified validation for now
}

// Load section data from JSON file
function loadSection(slug: string, _variant?: string): Section | null {
  const sectionPath = join(process.cwd(), `content/pt-PT/sections/${slug}.json`);

  if (!existsSync(sectionPath)) {
    console.error(`Section file not found: ${sectionPath}`);
    return null;
  }

  try {
    const rawData = JSON.parse(readFileSync(sectionPath, 'utf-8')) as Record<string, unknown>;

    // Load design configurations and merge them
    const designData = loadDesignConfigs();
    const mergedData = {
      ...rawData,
      design: designData.sections?.[slug] ?? {}
    };

    if (!validateSection(mergedData, slug)) {
      console.warn(`Section validation failed for ${slug}, but continuing build`);
      return null;
    }

    return mergedData;
  } catch (parseError) {
    console.error(`Failed to parse section file ${sectionPath}:`, parseError);
    return null;
  }
}

// Load all page configurations and their sections
function loadAllPageSections(): Record<string, LoadedPageSection[]> {
  const pagesData: Record<string, LoadedPageSection[]> = {};
  const pageKeys = ['landing', 'thank-you', 'legal-privacy'];

  for (const pageKey of pageKeys) {
    const pagePath = join(process.cwd(), `content/pt-PT/pages/${pageKey}.json`);
    
    if (!existsSync(pagePath)) {
      pagesData[pageKey] = [];
      continue;
    }

    try {
      // Load page configuration
      const pageConfig = JSON.parse(readFileSync(pagePath, 'utf-8')) as PageConfig;
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
          console.error(`Failed to load section ${sectionConfig.slug} for page ${pageKey}:`, sectionError);
        }
      }
      
      pagesData[pageKey] = sections;

    } catch (error) {
      console.error(`Page loader failed for ${pageKey}:`, error);
      pagesData[pageKey] = [];
    }
  }

  return pagesData;
}

/**
 * Eleventy 3.x compatible data loader that provides sections for all pages
 * Following latest best practices with configData parameter
 */
export default function(): LoadedPageSection[] {
  try {
    // For the main landing page, return the landing page sections
    // This maintains compatibility with the existing template structure
    const allPagesData = loadAllPageSections();
    
    // Default to landing page sections for the main index
    return allPagesData.landing || [];

  } catch (error) {
    console.error('Sections data loader failed:', error);
    return [];
  }
}