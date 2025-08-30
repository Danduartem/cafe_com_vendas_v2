import type { SectionSlug } from './base.js';

// Re-export SectionSlug for convenience
export type { SectionSlug } from './base.js';
import type { HeroSection } from './hero.js';
import type { ProblemSection } from './problem.js';
import type { SolutionSection } from './solution.js';
import type { AboutSection } from './about.js';
import type { SocialProofSection } from './social-proof.js';
import type { OfferSection } from './offer.js';
import type { FAQSection } from './faq.js';
import type { FinalCTASection } from './final-cta.js';
import type { FooterSection } from './footer.js';
import type { TopBannerSection } from './top-banner.js';
import type { ThankYouContentSection } from './thank-you.js';

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
  sections?: PageSection[];  // Now optional since sections are loaded separately
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