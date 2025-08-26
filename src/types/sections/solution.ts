import type { BaseSection, SectionCopy } from './base';

export interface SolutionSection extends BaseSection {
  id: 'solution';
  copy: SectionCopy & {
    pillars: {
      number: string;
      title: string;
      description: string;
      icon: string;
    }[];
    transitionText: string;
    supportingText: string;
    trustIndicators: string[];
  };
}