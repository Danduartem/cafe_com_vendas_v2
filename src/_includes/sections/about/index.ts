/**
 * About Section TypeScript Support
 * Handles the about section functionality and data types
 */

export interface AboutSection {
  id: string;
  name: string;
  subtitle: string;
  bio: string;
  highlights: string[];
  microStory?: string;
  photoAlt: string;
  social: {
    instagram?: string;
  };
  schema: object;
}

export default {
  section: 'about',
  template: 'sections/about/index.njk',
  dependencies: ['presenter'],
  analytics: {
    events: ['click_about_checkout_cta', 'click_about_instagram']
  }
};