import type {
  Section,
  SectionSlug,
  LoadedPageSection,
} from '../types/sections/pages';
import { readFileSync } from 'fs';
import { join } from 'path';

// Unified page configuration for all section organization
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
  ],
  'politica-privacidade': [
    'footer'
  ],
  'termos-condicoes': [
    'footer'
  ],
  'garantia-reembolso': [
    'footer'
  ]
} as const;

// Shared section loader function
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
 * Unified sections data loader for all pages
 * Follows Eleventy v3 best practices with dynamic page detection
 */
export default function(configData?: any): LoadedPageSection[] {
  try {
    const sections: LoadedPageSection[] = [];
    
    // Determine which page we're building based on context
    // Default to landing page if no context available
    let pageType: keyof typeof pageConfigurations = 'landing';
    
    if (configData?.page?.fileSlug) {
      const slug = configData.page.fileSlug;
      if (slug in pageConfigurations) {
        pageType = slug as keyof typeof pageConfigurations;
      }
    }
    
    // Load sections for the current page
    const sectionsToLoad = pageConfigurations[pageType] || pageConfigurations.landing;
    
    for (const slug of sectionsToLoad) {
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