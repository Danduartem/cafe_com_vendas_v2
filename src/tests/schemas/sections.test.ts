/**
 * Schema validation tests for all sections
 * Tests that each section's JSON data conforms to its TypeScript interface
 */

import { describe, test, expect } from 'vitest';
import {
  loadSectionData,
  loadAllSectionData,
  validateSectionData,
  isHeroSection,
  isProblemSection,
  isSolutionSection,
  isAboutSection,
  isSocialProofSection,
  isOfferSection,
  isFAQSection,
  isFinalCTASection,
  isFooterSection,
  isTopBannerSection
} from '../utils/section-loader.ts';
import type { SectionSlug } from '../../_data/types.ts';

describe('Section Schema Validation', () => {
  const allSections: SectionSlug[] = [
    'top-banner', 'hero', 'problem', 'solution', 'about',
    'social-proof', 'offer', 'faq', 'final-cta', 'footer'
  ];

  describe('Section Data Loading', () => {
    test('should load all section JSON files without error', () => {
      expect(() => loadAllSectionData()).not.toThrow();
    });

    test.each(allSections)('should load %s section data', (sectionSlug) => {
      expect(() => loadSectionData(sectionSlug)).not.toThrow();
      const data = loadSectionData(sectionSlug);
      expect(data).toBeDefined();
      expect(typeof data).toBe('object');
    });
  });

  describe('Base Section Properties', () => {
    test.each(allSections)('%s section should have required base properties', (sectionSlug) => {
      const data = loadSectionData(sectionSlug) as Record<string, unknown>;

      expect(data.id).toBe(sectionSlug);
      expect(typeof data.variant).toBe('string');
      expect(typeof data.enabled).toBe('boolean');
      expect(data.copy).toBeDefined();
      expect(typeof data.copy).toBe('object');
      expect(data.design).toBeDefined();
      expect(typeof data.design).toBe('object');
      expect(data.tracking).toBeDefined();
      expect(typeof data.tracking).toBe('object');
    });
  });

  describe('Section-Specific Schema Validation', () => {
    test('Hero section should match HeroSection interface', () => {
      const data = loadSectionData('hero');
      expect(isHeroSection(data)).toBe(true);
      expect(validateSectionData('hero', data)).toBe(true);
    });

    test('Problem section should match ProblemSection interface', () => {
      const data = loadSectionData('problem');
      expect(isProblemSection(data)).toBe(true);
      expect(validateSectionData('problem', data)).toBe(true);
    });

    test('Solution section should match SolutionSection interface', () => {
      const data = loadSectionData('solution');
      expect(isSolutionSection(data)).toBe(true);
      expect(validateSectionData('solution', data)).toBe(true);
    });

    test('About section should match AboutSection interface', () => {
      const data = loadSectionData('about');
      expect(isAboutSection(data)).toBe(true);
      expect(validateSectionData('about', data)).toBe(true);
    });

    test('Social Proof section should match SocialProofSection interface', () => {
      const data = loadSectionData('social-proof');
      expect(isSocialProofSection(data)).toBe(true);
      expect(validateSectionData('social-proof', data)).toBe(true);
    });

    test('Offer section should match OfferSection interface', () => {
      const data = loadSectionData('offer');
      expect(isOfferSection(data)).toBe(true);
      expect(validateSectionData('offer', data)).toBe(true);
    });

    test('FAQ section should match FAQSection interface', () => {
      const data = loadSectionData('faq');
      expect(isFAQSection(data)).toBe(true);
      expect(validateSectionData('faq', data)).toBe(true);
    });

    test('Final CTA section should match FinalCTASection interface', () => {
      const data = loadSectionData('final-cta');
      expect(isFinalCTASection(data)).toBe(true);
      expect(validateSectionData('final-cta', data)).toBe(true);
    });

    test('Footer section should match FooterSection interface', () => {
      const data = loadSectionData('footer');
      expect(isFooterSection(data)).toBe(true);
      expect(validateSectionData('footer', data)).toBe(true);
    });

    test('Top Banner section should match TopBannerSection interface', () => {
      const data = loadSectionData('top-banner');
      expect(isTopBannerSection(data)).toBe(true);
      expect(validateSectionData('top-banner', data)).toBe(true);
    });
  });

  describe('Content Structure Validation', () => {
    test('Hero section should have badge and notice in copy', () => {
      const data = loadSectionData('hero') as Record<string, unknown>;
      const copy = data.copy as Record<string, unknown>;
      const badge = copy.badge as Record<string, unknown>;
      expect(badge).toBeDefined();
      expect(typeof badge).toBe('object');
      expect(badge.date).toBeDefined();
      expect(badge.location).toBeDefined();
      expect(badge.venue).toBeDefined();
    });

    test('Problem section should have pain_points and highlights', () => {
      const data = loadSectionData('problem') as Record<string, unknown>;
      const copy = data.copy as Record<string, unknown>;
      expect(Array.isArray(copy.pain_points)).toBe(true);
      expect(Array.isArray(copy.highlights)).toBe(true);
    });

    test('Solution section should have pillars array', () => {
      const data = loadSectionData('solution') as Record<string, unknown>;
      const copy = data.copy as Record<string, unknown>;
      const pillars = copy.pillars as Record<string, unknown>[];
      expect(Array.isArray(pillars)).toBe(true);
      expect(pillars.length).toBeGreaterThan(0);

      // Validate first pillar structure
      const firstPillar = pillars[0];
      expect(typeof firstPillar.number).toBe('string');
      expect(typeof firstPillar.title).toBe('string');
      expect(typeof firstPillar.description).toBe('string');
      expect(typeof firstPillar.icon).toBe('string');
      expect(typeof firstPillar.analytics_event).toBe('string');
      expect(typeof firstPillar.animation_delay).toBe('string');
    });

    test('Social Proof section should have testimonials with required fields', () => {
      const data = loadSectionData('social-proof') as Record<string, unknown>;
      const testimonials = data.testimonials as Record<string, unknown>[];
      expect(Array.isArray(testimonials)).toBe(true);
      expect(testimonials.length).toBeGreaterThan(0);

      // Validate first testimonial structure
      const firstTestimonial = testimonials[0];
      expect(typeof firstTestimonial.id).toBe('number');
      expect(typeof firstTestimonial.name).toBe('string');
      expect(typeof firstTestimonial.profession).toBe('string');
      expect(typeof firstTestimonial.location).toBe('string');
      expect(typeof firstTestimonial.result).toBe('string');
      expect(typeof firstTestimonial.video_id).toBe('string');
      expect(typeof firstTestimonial.thumbnail).toBe('string');
    });

    test('Offer section should have pricing structure', () => {
      const data = loadSectionData('offer') as Record<string, unknown>;
      const copy = data.copy as Record<string, unknown>;
      const pricing = copy.pricing as Record<string, unknown>;
      expect(pricing).toBeDefined();
      expect(pricing.first_lot).toBeDefined();
      expect(pricing.second_lot).toBeDefined();

      // Validate first lot pricing
      const firstLot = pricing.first_lot as Record<string, unknown>;
      expect(typeof firstLot.label).toBe('string');
      expect(typeof firstLot.original_price).toBe('number');
      expect(typeof firstLot.discounted_price).toBe('number');
      expect(typeof firstLot.currency).toBe('string');
      expect(typeof firstLot.capacity).toBe('number');
      expect(Array.isArray(firstLot.bonuses)).toBe(true);
    });

    test('FAQ section should have items and contact info', () => {
      const data = loadSectionData('faq') as Record<string, unknown>;
      const items = data.items as Record<string, unknown>[];
      const contact = data.contact as Record<string, unknown>;
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
      expect(contact).toBeDefined();
      expect(contact.whatsapp_url).toBeDefined();
      expect(contact.whatsapp_name).toBeDefined();
      expect(contact.whatsapp_phone).toBeDefined();

      // Validate first FAQ item
      const firstItem = items[0];
      expect(typeof firstItem.id).toBe('string');
      expect(typeof firstItem.question).toBe('string');
      expect(firstItem.answer).toBeDefined();
      expect(typeof firstItem.analytics_event).toBe('string');
    });
  });

  describe('Design and Tracking Properties', () => {
    test.each(allSections)('%s section should have valid design properties', (sectionSlug) => {
      const data = loadSectionData(sectionSlug) as Record<string, unknown>;
      const design = data.design as Record<string, unknown>;

      expect(['light', 'dark'].includes(design.theme as string)).toBe(true);
      expect(typeof design.accent).toBe('string');
      expect(typeof design.layout).toBe('string');

      // Some sections have 'background', others have 'overlay'
      const hasBackground = design.background !== undefined;
      const hasOverlay = design.overlay !== undefined;
      expect(hasBackground || hasOverlay).toBe(true);

      if (hasBackground) {
        expect(typeof design.background).toBe('string');
      }
      if (hasOverlay) {
        expect(typeof design.overlay).toBe('string');
      }
    });

    test.each(allSections)('%s section should have valid tracking properties', (sectionSlug) => {
      const data = loadSectionData(sectionSlug) as Record<string, unknown>;
      const tracking = data.tracking as Record<string, unknown>;

      expect(typeof tracking.section_id).toBe('string');
      expect(typeof tracking.impression_event).toBe('string');
      expect(tracking.section_id).toBe(sectionSlug);
    });
  });
});