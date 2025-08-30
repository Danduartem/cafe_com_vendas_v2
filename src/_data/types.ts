/**
 * Shared TypeScript interfaces for Eleventy data files
 */

// Analytics and tracking
export interface AnalyticsConfig {
  gtmId: string;
}

// Event data structure
export interface EventData {
  title: string;
  subtitle?: string;
  date: string;
  location: string;
  price?: number;
  description?: string;
  payments?: {
    alternative?: {
      mbway?: {
        phone: string;
        instruction: string;
      };
    };
  };
  capacity?: {
    firstLot: number;
    totalCapacity: number;
  };
  [key: string]: unknown;
}

// FAQ structure
export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

export type FAQData = FAQItem[];

// Testimonial structure
export interface Testimonial {
  name: string;
  role?: string;
  company?: string;
  message: string;
  rating?: number;
  image?: string;
  verified?: boolean;
}

export type TestimonialsData = Testimonial[];

// Pillar structure
export interface Pillar {
  number: string;
  title: string;
  description: string;
  icon: string;
  animationDelay: string;
  analyticsEvent: string;
}

export interface PillarsData {
  title: string;
  subtitle: string;
  description: string;
  pillars: Pillar[];
}

// Site configuration
export interface SiteData {
  name?: string;
  title: string;
  description: string;
  url: string;
  baseUrl: string;
  lang?: string;
  locale?: string;
  meta?: {
    author: string;
    keywords: string;
    twitterCard: string;
  };
  contact?: {
    whatsapp: string;
    email: string;
  };
  analytics: AnalyticsConfig;
  cloudinaryCloudName?: string;
}

// Footer structure
export interface FooterStat {
  value: number | string;
  label: string;
  counter: boolean;
}

export interface FooterBrand {
  name: string;
  tagline: string;
  description: string;
  guarantee: string;
}

export interface FooterLink {
  label: string;
  url: string;
  external?: boolean;
}

export interface FooterContact {
  whatsapp: {
    number: string;
    message: string;
    url: string;
  };
  email: {
    address: string;
    url: string;
  };
  social: {
    platform: string;
    username?: string;
    url: string;
  }[];
}

export interface FooterOrganization {
  name: string;
  description: string;
  url: string;
  logo: string;
  phone: string;
  country: string;
  city: string;
  founderName: string;
  founderTitle: string;
}

export interface FooterCopyright {
  year: string;
  owner: string;
  text: string;
  madein?: string;
}

export interface FooterNavigation {
  legal: FooterLink[];
}

export interface FooterData {
  stats: FooterStat[];
  brand: FooterBrand;
  navigation: FooterNavigation;
  contact: FooterContact;
  organization: FooterOrganization;
  copyright: FooterCopyright;
}


// Section-based content structure
export interface SectionCTA {
  label: string;
  href: string;
  variant: string;
}

export interface SectionMedia {
  image?: string;
  alt?: string;
  background?: string;
  aspect_ratio?: string;
}

export interface SectionDesign {
  theme: 'light' | 'dark';
  accent: string;
  background: string;
  layout: string;
}

export interface SectionTracking {
  section_id: string;
  impression_event: string;
  cta_event?: string;
  [key: string]: unknown;
}

export interface SectionCopy {
  eyebrow?: string;
  headline: string;
  subhead?: string;
  description?: string;
  cta?: SectionCTA;
  [key: string]: unknown;
}

export interface BaseSection {
  id: string;
  variant: string;
  enabled: boolean;
  copy: SectionCopy;
  media?: SectionMedia;
  design: SectionDesign;
  tracking: SectionTracking;
}

// Specific section types
export interface HeroSection extends BaseSection {
  id: 'hero';
  copy: SectionCopy & {
    cta?: {
      primary?: SectionCTA;
      secondary?: SectionCTA;
    } | SectionCTA;
    badge?: {
      date: string;
      location: string;
      venue: string;
    };
    notice?: string;
  };
}

export interface ProblemSection extends BaseSection {
  id: 'problem';
  copy: SectionCopy & {
    pain_points: string[];
    highlights: string[];
  };
}

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

export interface SocialProofSection extends BaseSection {
  id: 'social-proof';
  testimonials: {
    id: number;
    name: string;
    profession: string;
    location: string;
    result: string;
    video_id: string;
    thumbnail: string;
  }[];
}

export interface OfferSection extends BaseSection {
  id: 'offer';
  copy: SectionCopy & {
    pricing: {
      first_lot: {
        label: string;
        original_price: number;
        discounted_price: number;
        currency: string;
        capacity: number;
        bonuses: string[];
      };
      second_lot: {
        label: string;
        price: number;
        currency: string;
        capacity: number;
      };
    };
    includes: string[];
    guarantee: {
      type: string;
      claim: string;
      period: string;
      policy: string;
    };
  };
}

export interface FAQSection extends BaseSection {
  id: 'faq';
  items: {
    id: string;
    question: string;
    answer: Record<string, unknown>;
    [key: string]: unknown;
  }[];
  contact: {
    whatsapp_url: string;
    whatsapp_name: string;
    whatsapp_phone: string;
    response_time: string;
  };
  legal_links: {
    text: string;
    url: string;
  }[];
}

export interface FinalCTASection extends BaseSection {
  id: 'final-cta';
  copy: SectionCopy & {
    urgency_points: string[];
    alternative_cta: SectionCTA;
  };
}

export interface FooterSection extends BaseSection {
  id: 'footer';
  copy: SectionCopy & {
    stats: {
      value: number | string;
      label: string;
      counter: boolean;
    }[];
    brand: {
      name: string;
      tagline: string;
      description: string;
      guarantee: string;
    };
    navigation: {
      legal: {
        label: string;
        url: string;
        external?: boolean;
      }[];
    };
    contact: {
      whatsapp: {
        number: string;
        message: string;
        url: string;
      };
      email: {
        address: string;
        url: string;
      };
      social: {
        platform: string;
        username?: string;
        url: string;
      }[];
    };
    organization: {
      name: string;
      description: string;
      url: string;
      logo: string;
      phone: string;
      country: string;
      city: string;
      founderName: string;
      founderTitle: string;
    };
  };
}

export interface TopBannerSection extends BaseSection {
  id: 'top-banner';
  copy: SectionCopy & {
    message: string;
  };
}

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

// Union type for all sections
export type Section =
  | HeroSection
  | ProblemSection
  | SolutionSection
  | AboutSection
  | SocialProofSection
  | OfferSection
  | FAQSection
  | FinalCTASection
  | FooterSection
  | TopBannerSection
  | ThankYouContentSection;

// Section Contract System
export type SectionSlug =
  | 'top-banner' | 'hero' | 'problem' | 'solution' | 'about'
  | 'social-proof' | 'offer' | 'faq' | 'final-cta' | 'footer'
  | 'thank-you-content';

export interface SectionPropsBase extends Record<string, unknown> {
  id: SectionSlug;
  variant?: string;
  enabled?: boolean;
}


// Page Composition Types (moved from pages.ts)
export interface PageSection {
  slug: string;
  variant?: string;
  enabled: boolean;
  data?: string;
}

export interface PageComposition {
  route: string;
  title: string;
  description?: string;
  layout: string;
  permalink?: string;
  eleventyNavigation?: {
    key: string;
  };
  sections: PageSection[];
  customTemplate?: string;
}

export type PagesData = Record<string, PageComposition>;

// Page Loading System Types
export interface LoadedPageSection {
  slug: SectionSlug;
  variant?: string;
  enabled: boolean;
  data: Section;
}

export interface LoadedPage {
  meta: {
    route: string;
    title: string;
    description?: string;
    layout: string;
    permalink?: string;
    eleventyNavigation?: {
      key: string;
    };
  };
  sections: LoadedPageSection[];
}

export type PageLoader = (context?: { page?: { url?: string } }) => LoadedPage;

export interface SectionValidationError extends Error {
  sectionSlug: string;
  filePath: string;
}

// Global strings structure
export interface GlobalStrings {
  nav: Record<string, string>;
  common: Record<string, string>;
  legal: Record<string, string>;
  contact: Record<string, string>;
  event: Record<string, string>;
  currency: Record<string, string>;
  time: Record<string, string>;
}