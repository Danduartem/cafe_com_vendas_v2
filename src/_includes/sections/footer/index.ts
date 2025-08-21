/**
 * Footer Section TypeScript Support
 * Handles footer functionality and contact information
 */

export interface FooterBrand {
  name: string;
  tagline: string;
  description: string;
  guarantee: string;
}

export interface FooterNavigation {
  legal: Array<{
    label: string;
    url: string;
  }>;
}

export interface FooterContact {
  whatsapp: {
    url: string;
  };
  email: {
    address: string;
  };
}

export interface FooterCopyright {
  year: string;
  owner: string;
  text: string;
}

export interface FooterSection {
  brand: FooterBrand;
  navigation: FooterNavigation;
  contact: FooterContact;
  copyright: FooterCopyright;
}

export default {
  section: 'footer',
  template: 'sections/footer/index.njk',
  dependencies: ['footer'],
  analytics: {
    events: [
      'click_footer_legal',
      'click_footer_whatsapp',
      'click_footer_email'
    ]
  }
};