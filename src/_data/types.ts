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
  content: string;
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
  title: string;
  description: string;
  url: string;
  baseUrl: string;
  analytics: AnalyticsConfig;
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
  social: Array<{
    platform: string;
    username?: string;
    url: string;
  }>;
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

// Presenter structure
export interface PresenterSchema {
  '@context': string;
  '@type': string;
  name: string;
  jobTitle: string;
  url: string;
  sameAs: string[];
}

export interface PresenterData {
  name: string;
  subtitle: string;
  bio: string;
  photoAlt: string;
  highlights: string[];
  microStory: string;
  social: {
    instagram: string;
  };
  schema: PresenterSchema;
}

// JSON file loading utility type
export interface JSONFileLoader<T> {
  (): T;
}