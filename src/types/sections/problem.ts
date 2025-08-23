import type { BaseSection, SectionCopy } from './base';

export interface ProblemSection extends BaseSection {
  id: 'problem';
  copy: SectionCopy & {
    pain_points: string[];
    highlights: string[];
  };
}