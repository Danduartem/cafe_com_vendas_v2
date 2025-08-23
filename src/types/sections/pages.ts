import type { SectionSlug } from './base';
import type { HeroSection } from './hero';
import type { ProblemSection } from './problem';
import type { SolutionSection } from './solution';
import type { AboutSection } from './about';
import type { SocialProofSection } from './social-proof';
import type { OfferSection } from './offer';
import type { FAQSection } from './faq';
import type { FinalCTASection } from './final-cta';
import type { FooterSection } from './footer';
import type { TopBannerSection } from './top-banner';
import type { ThankYouContentSection } from './thank-you';

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
  sections: PageSection[];
  customTemplate?: string;
}

export interface PagesData {
  [key: string]: PageComposition;
}

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

export interface PageLoader {
  (context?: { page?: { url?: string } }): LoadedPage;
}

export interface SectionValidationError extends Error {
  sectionSlug: string;
  filePath: string;
}