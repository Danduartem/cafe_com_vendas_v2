// Content structure types

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

// JSON file loading utility type
export interface JSONFileLoader<T> {
  (): T;
}