import type { BaseSection, SectionCopy } from './base';

export interface AboutSection extends BaseSection {
  id: 'about';
  copy: SectionCopy & {
    bio: string;
    micro_story: string;
    highlights: string[];
    social: {
      instagram: {
        url: string;
        handle: string;
      };
    };
  };
  schema: Record<string, unknown>;
}