import type {
  Section,
  SectionSlug,
  LoadedPageSection,
} from '../types/sections/pages';
import { readFileSync } from 'fs';
import { join } from 'path';

// Page configuration interfaces
interface PageConfig {
  sections: Array<{
    slug: string;
    variant?: string;
    enabled: boolean;
  }>;
}

// Static page configurations (consolidated from external JSON files)
const pageConfigurations: Record<string, PageConfig> = {
  'landing': {
    sections: [
      { slug: 'top-banner', variant: 'default', enabled: true },
      { slug: 'hero', variant: 'default', enabled: true },
      { slug: 'problem', variant: 'default', enabled: true },
      { slug: 'solution', variant: 'default', enabled: true },
      { slug: 'about', variant: 'default', enabled: true },
      { slug: 'social-proof', variant: 'video-testimonials', enabled: true },
      { slug: 'offer', variant: 'pricing', enabled: true },
      { slug: 'faq', variant: 'accordion', enabled: true },
      { slug: 'final-cta', variant: 'urgency', enabled: true },
      { slug: 'footer', variant: 'full', enabled: true }
    ]
  },
  'thank-you': {
    sections: [
      { slug: 'thank-you-content', variant: 'default', enabled: true }
    ]
  },
  'legal-privacy': {
    sections: [
      { slug: 'footer', variant: 'minimal', enabled: true }
    ]
  }
};

// Load section data from JSON files - simplified for Eleventy v3
function loadSection(slug: string, _variant?: string): Section | null {
  try {
    const sectionPath = join(process.cwd(), 'src/_data/sections-data/sections', `${slug}.json`);
    const sectionContent = readFileSync(sectionPath, 'utf-8');
    const sectionData = JSON.parse(sectionContent) as Section;
    
    // Eleventy v3 handles missing files gracefully
    return sectionData;
  } catch {
    // Let Eleventy handle the error appropriately
    console.warn(`Section ${slug} not found, skipping`);
    return null;
  }
}

// Load all page configurations and their sections
function loadAllPageSections(): Record<string, LoadedPageSection[]> {
  const pagesData: Record<string, LoadedPageSection[]> = {};

  for (const [pageKey, pageConfig] of Object.entries(pageConfigurations)) {
    const sections: LoadedPageSection[] = [];

    for (const sectionConfig of pageConfig.sections) {
      if (!sectionConfig.enabled) {
        continue; // Skip disabled sections
      }

      try {
        const sectionData = loadSection(sectionConfig.slug, sectionConfig.variant);

        if (sectionData) {
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