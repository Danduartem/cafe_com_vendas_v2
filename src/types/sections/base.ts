// Base section interfaces
export interface SectionCTA {
  label: string;
  href: string;
  variant: string;
}

export interface SectionMedia {
  image?: string;
  alt?: string;
  background?: string;
  aspect_ratio?: string;
}

export interface SectionDesign {
  theme: 'light' | 'dark';
  accent: string;
  background: string;
  layout: string;
}

export interface SectionTracking {
  section_id: string;
  impression_event: string;
  cta_event?: string;
  [key: string]: unknown;
}

export interface SectionCopy {
  eyebrow?: string;
  headline: string;
  subhead?: string;
  description?: string;
  cta?: SectionCTA;
  [key: string]: unknown;
}

export interface BaseSection {
  id: string;
  variant: string;
  enabled: boolean;
  copy: SectionCopy;
  media?: SectionMedia;
  design: SectionDesign;
  tracking: SectionTracking;
}

// Section slug type
export type SectionSlug =
  | 'top-banner' | 'hero' | 'problem' | 'solution' | 'about'
  | 'social-proof' | 'offer' | 'faq' | 'final-cta' | 'footer'
  | 'thank-you-content';

// Validation utilities
export function isValidSectionSlug(value: unknown): value is SectionSlug {
  const validSlugs: SectionSlug[] = [
    'top-banner', 'hero', 'problem', 'solution', 'about',
    'social-proof', 'offer', 'faq', 'final-cta', 'footer',
    'thank-you-content'
  ];
  return typeof value === 'string' && validSlugs.includes(value as SectionSlug);
}

// Base section props for component system
export interface SectionPropsBase extends Record<string, unknown> {
  id: SectionSlug;
  variant?: string;
  enabled?: boolean;
}

// Runtime Validation Utilities
export function validateSectionBase(data: unknown): data is SectionPropsBase {
  if (!data || typeof data !== 'object') return false;
  const section = data as Record<string, unknown>;

  return (
    isValidSectionSlug(section.id) &&
    (section.variant === undefined || typeof section.variant === 'string') &&
    (section.enabled === undefined || typeof section.enabled === 'boolean')
  );
}

export function assertSectionBase(data: unknown, sectionName: string): void {
  if (!validateSectionBase(data)) {
    throw new Error(`Invalid section base properties for ${sectionName}: ${JSON.stringify(data)}`);
  }
}