/**
 * Section Manifest - Single Source of Truth
 * 
 * This file defines all sections in the landing page with their file paths,
 * enabling instant navigation, scaffolding, and tooling automation.
 */

export type SectionId =
  | "top-banner"
  | "hero" 
  | "problem"
  | "solution"
  | "about"
  | "social-proof"
  | "offer"
  | "faq"
  | "final-cta"
  | "footer";

export interface SectionConfig {
  path: string;          // Folder path relative to src/_includes/sections
  template: string;      // Template file name (usually index.njk)
  script?: string;       // TypeScript file name (usually index.ts)
  anchor: `s-${SectionId}`; // Standardized anchor ID
  title: string;         // Human readable title
  description: string;   // Brief description for tooling
}

export const SECTIONS: Record<SectionId, SectionConfig> = {
  "top-banner": {
    path: "src/_includes/sections/top-banner",
    template: "index.njk",
    script: "index.ts",
    anchor: "s-top-banner",
    title: "Top Banner",
    description: "Urgency messaging and event countdown"
  },
  hero: {
    path: "src/_includes/sections/hero", 
    template: "index.njk",
    script: "index.ts",
    anchor: "s-hero",
    title: "Hero Section",
    description: "Main headline, value proposition, and primary CTA"
  },
  problem: {
    path: "src/_includes/sections/problem",
    template: "index.njk", 
    script: "index.ts",
    anchor: "s-problem",
    title: "Problem & Pain Points",
    description: "Pain validation and problem agitation"
  },
  solution: {
    path: "src/_includes/sections/solution",
    template: "index.njk",
    script: "index.ts", 
    anchor: "s-solution",
    title: "Solution & Benefits",
    description: "5 pillars approach and transformation promise"
  },
  about: {
    path: "src/_includes/sections/about",
    template: "index.njk",
    script: "index.ts",
    anchor: "s-about", 
    title: "About & Authority",
    description: "Presenter credibility and authority building"
  },
  "social-proof": {
    path: "src/_includes/sections/social-proof",
    template: "index.njk",
    script: "index.ts",
    anchor: "s-social-proof",
    title: "Social Proof & Testimonials", 
    description: "Customer testimonials and success stories"
  },
  offer: {
    path: "src/_includes/sections/offer",
    template: "index.njk", 
    script: "index.ts",
    anchor: "s-offer",
    title: "Offer & Pricing",
    description: "Event details, pricing, and guarantee"
  },
  faq: {
    path: "src/_includes/sections/faq",
    template: "index.njk",
    script: "index.ts",
    anchor: "s-faq",
    title: "FAQ & Objections",
    description: "Frequently asked questions and objection handling"
  },
  "final-cta": {
    path: "src/_includes/sections/final-cta", 
    template: "index.njk",
    script: "index.ts",
    anchor: "s-final-cta",
    title: "Final CTA",
    description: "Urgency close and final call to action"
  },
  footer: {
    path: "src/_includes/sections/footer",
    template: "index.njk", 
    script: "index.ts",
    anchor: "s-footer",
    title: "Footer",
    description: "Footer links, legal information, and contact"
  }
};

/**
 * Get section configuration by ID
 */
export function getSection(id: SectionId): SectionConfig {
  return SECTIONS[id];
}

/**
 * Get all section IDs in order
 */
export function getSectionIds(): SectionId[] {
  return Object.keys(SECTIONS) as SectionId[];
}

/**
 * Get all sections in order
 */
export function getAllSections(): SectionConfig[] {
  return getSectionIds().map(id => SECTIONS[id]);
}

/**
 * Find section by anchor ID
 */
export function findSectionByAnchor(anchor: string): SectionConfig | undefined {
  return getAllSections().find(section => section.anchor === anchor);
}