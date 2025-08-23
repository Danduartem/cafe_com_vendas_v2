import type {
  Section,
  SectionSlug,
  LoadedPageSection,
} from '../types/sections/pages';
import { readFileSync } from 'fs';
import { join } from 'path';

// Page configuration for section organization
const pageConfigurations = {
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
  'legal-privacy': [
    'footer'
  ]
} as const;

// Load section data from clean JSON files
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
 * Clean sections data loader following Eleventy 2025 best practices
 * Uses JSON files for static content as recommended by official docs
 */
export default function(): LoadedPageSection[] {
  try {
    const sections: LoadedPageSection[] = [];
    
    for (const slug of pageConfigurations.landing) {
      const sectionData = loadSection(slug);
      if (sectionData) {
        sections.push({
          slug: slug as SectionSlug,
          variant: 'default',
          enabled: true,
          data: sectionData
        });
      }
    }
    
    return sections;

  } catch (error) {
    console.error('Sections data loader failed:', error);
    return [];
  }
}