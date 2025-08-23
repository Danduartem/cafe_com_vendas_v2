import type {
  LoadedPageSection,
  SectionSlug,
  Section
} from '../types/sections/pages';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load section data from JSON files
function loadSection(slug: string): Section | null {
  try {
    const sectionPath = join(process.cwd(), 'src/_data/sections', `${slug}.json`);
    const sectionContent = readFileSync(sectionPath, 'utf-8');
    return JSON.parse(sectionContent);
  } catch (error) {
    console.error(`Failed to load section ${slug}:`, error);
    return null;
  }
}

/**
 * Thank You Page Data Loader - loads from JSON content files
 * @returns Thank you page sections
 */
export default function(): { sections: LoadedPageSection[] } {
  const sections: LoadedPageSection[] = [];
  
  // Thank you page configuration
  const thankYouSections = [
    { slug: 'thank-you-content', variant: 'default', enabled: true }
  ];

  for (const sectionConfig of thankYouSections) {
    if (!sectionConfig.enabled) {
      continue;
    }

    try {
      const sectionData = loadSection(sectionConfig.slug);

      if (sectionData) {
        sections.push({
          slug: sectionConfig.slug as SectionSlug,
          variant: sectionConfig.variant,
          enabled: sectionConfig.enabled,
          data: sectionData
        });
      }

    } catch (sectionError) {
      console.error(`Failed to load section ${sectionConfig.slug}:`, sectionError);
    }
  }

  return { sections };
}