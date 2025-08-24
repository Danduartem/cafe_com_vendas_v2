import type { BaseSection, SectionCopy } from './base';

export interface SolutionSection extends BaseSection {
  id: 'solution';
  copy: SectionCopy & {
    pillars: {
      number: string;
      title: string;
      description: string;
      icon: string;
      analytics_event: string;
      animation_delay: string;
    }[];
    supporting_text: string;
    trust_indicators: string[];
  };
}