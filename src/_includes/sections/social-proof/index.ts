/**
 * Social Proof Section TypeScript Support
 * Handles testimonials carousel and video functionality
 */

export interface TestimonialVideo {
  id: number;
  name: string;
  profession: string;
  location: string;
  result: string;
  videoId: string;
  thumbnail: string;
}

export interface SocialProofSection {
  videos: TestimonialVideo[];
}

export default {
  section: 'social-proof',
  template: 'sections/social-proof/index.njk',
  dependencies: ['testimonials'],
  analytics: {
    events: [
      'play_testimonial_video',
      'carousel_prev_testimonials',
      'carousel_next_testimonials',
      'click_testimonials_cta'
    ]
  },
  interactive: {
    carousel: true,
    youtube: true
  }
};