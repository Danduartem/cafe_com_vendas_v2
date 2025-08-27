import type {
  Section,
  SectionSlug,
  LoadedPageSection,
} from '../types/sections/pages';
import { readFileSync } from 'fs';
import { join } from 'path';

// All available sections mapped by page
const sectionsByPage = {
  'landing': [
    'top-banner',
    'hero', 
    'problem',
    'solution',
    'about',
    'social-proof',
    'offer',
    'faq',
    'final-cta',
    'footer'
  ],
  'thank-you': [
    'thank-you-content'
  ],
  'legal': [
    'footer'
  ]
} as const;

/**
 * Loads a section's data from its JSON file
 */
function loadSection(slug: string): Section | null {
  try {
    const sectionPath = join(process.cwd(), 'src/_data/sections', `${slug}.json`);
    const sectionContent = readFileSync(sectionPath, 'utf-8');
    return JSON.parse(sectionContent) as Section;
  } catch {
    console.warn(`Section ${slug} not found, skipping`);
    return null;
  }
}

/**
 * Global sections loader for Eleventy
 * Returns all unique sections - templates filter what they need
 */
export default function(): LoadedPageSection[] {
  try {
    const sections: LoadedPageSection[] = [];
    const uniqueSlugs = new Set<string>();
    
    // Collect all unique section slugs
    Object.values(sectionsByPage).forEach(pageSections => {
      pageSections.forEach(slug => uniqueSlugs.add(slug));
    });
    
    // Load each unique section
    uniqueSlugs.forEach(slug => {
      const sectionData = loadSection(slug);
      if (sectionData) {
        sections.push({
          slug: slug as SectionSlug,
          variant: 'default',
          enabled: true,
          data: sectionData
        });
      }
    });
    
    return sections;
  } catch (error) {
    console.error('Sections data loader failed:', error);
    return [];
  }
}