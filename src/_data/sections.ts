import type { SectionSlug } from '../types/sections/pages';

// Simple page configuration for component-driven sections
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

/**
 * Simplified sections data loader for component-driven architecture
 * Returns section slugs for template iteration - data is co-located in components
 */
export default function(): SectionSlug[] {
  try {
    // Return simple array of section slugs for template rendering
    // Each section manages its own data and logic in its directory
    return pageConfigurations.landing.map(slug => slug as SectionSlug);

  } catch (error) {
    console.error('Sections data loader failed:', error);
    return [];
  }
}