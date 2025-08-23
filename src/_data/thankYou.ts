import type {
  LoadedPageSection,
  SectionSlug
} from '../types/sections/pages';
import { getSection } from './consolidated-sections.js';

/**
 * Thank You Page Data Loader - integrated with consolidated sections
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
      const sectionData = getSection(sectionConfig.slug);

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