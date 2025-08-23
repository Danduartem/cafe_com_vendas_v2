import type { BaseSection } from './base';

export interface SocialProofSection extends BaseSection {
  id: 'social-proof';
  testimonials: Array<{
    id: number;
    name: string;
    profession: string;
    location: string;
    result: string;
    video_id: string;
    thumbnail: string;
  }>;
}