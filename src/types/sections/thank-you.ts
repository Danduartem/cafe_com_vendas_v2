import type { BaseSection, SectionCopy } from './base';

export interface ThankYouContentSection extends BaseSection {
  id: 'thank-you-content';
  copy: SectionCopy & {
    badge: {
      text: string;
    };
    header: {
      title: string;
      subtitle: string;
    };
    progress: {
      label: string;
      percentage: string;
      value: number;
      message: string;
    };
    mainAction: {
      stepNumber: string;
      title: string;
      description: string;
      button: {
        text: string;
        url: string;
        analytics: string;
      };
    };
    steps: {
      number: string;
      color: string;
      title: string;
      description: string;
      button?: {
        text: string;
        url: string;
        classes: string;
        analytics: string;
        target?: string;
        rel?: string;
        icon: string;
      };
    }[];
    eventSummary: {
      title: string;
      subtitle: string;
      features: string[];
      important: string;
    };
  };
}