import type { BaseSection, SectionCopy } from './base';

export interface TopBannerSection extends BaseSection {
  id: 'top-banner';
  copy: SectionCopy & {
    message: string;
  };
}