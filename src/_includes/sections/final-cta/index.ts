/**
 * Final CTA Section TypeScript Support
 * Handles the final call-to-action functionality
 */

export interface FinalCTASection {
  headline: {
    main: string;
    secondary: string;
    highlight: string;
  };
  description: {
    primary: string;
    secondary: string;
  };
  urgency: {
    date: string;
    location: string;
    capacity: string;
  };
}

export default {
  section: 'final-cta',
  template: 'sections/final-cta/index.njk',
  dependencies: ['event'],
  analytics: {
    events: ['click_final_cta']
  },
  interactive: {
    checkout: true
  }
};