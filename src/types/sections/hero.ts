import type { BaseSection, SectionCopy, SectionCTA } from './base';

export interface HeroSection extends BaseSection {
  id: 'hero';
  copy: SectionCopy & {
    cta?: {
      primary?: SectionCTA;
      secondary?: SectionCTA;
    } | SectionCTA;
    badge?: {
      date: string;
      location: string;
      venue: string;
    };
    notice?: string;
  };
}