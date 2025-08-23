import type { BaseSection, SectionCopy, SectionCTA } from './base';

export interface FinalCTASection extends BaseSection {
  id: 'final-cta';
  copy: SectionCopy & {
    urgency_points: string[];
    alternative_cta: SectionCTA;
  };
}