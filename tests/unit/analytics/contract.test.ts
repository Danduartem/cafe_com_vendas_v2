/**
 * Analytics contract testing
 * Ensures all analytics events match predefined schema and GTM keys exist
 */

import { describe, test, expect, beforeEach } from 'vitest';
import type {
  SectionViewEvent,
  CTAClickEvent,
  WhatsAppClickEvent,
  FAQToggleEvent
} from './events-schema.ts';
import {
  validateAnalyticsEvent,
  getExpectedEventProperties,
  REQUIRED_GTM_EVENTS
} from './events-schema.ts';

describe('Analytics Contract Testing', () => {
  let mockDataLayer: Record<string, unknown>[];

  beforeEach(() => {
    mockDataLayer = [];
    (global as unknown as { window: { dataLayer: Record<string, unknown>[] } }).window = {
      dataLayer: mockDataLayer
    };
  });

  describe('Event Schema Validation', () => {
    test('should validate section view events', () => {
      const validEvent: SectionViewEvent = {
        event: 'section_view',
        section_id: 'hero',
        section_variant: 'default',
        viewport_percentage: 100
      };

      expect(validateAnalyticsEvent(validEvent)).toBe(true);

      const invalidEvent = {
        event: 'section_view',
        section_id: 'invalid_section', // Invalid section ID
        viewport_percentage: 100
      };

      expect(validateAnalyticsEvent(invalidEvent)).toBe(false);
    });

    test('should validate CTA click events', () => {
      const validEvent: CTAClickEvent = {
        event: 'cta_click',
        cta_text: 'Inscrever-me Agora',
        cta_location: 'hero',
        cta_type: 'primary',
        cta_destination: '#offer'
      };

      expect(validateAnalyticsEvent(validEvent)).toBe(true);

      const invalidEvent = {
        event: 'cta_click',
        cta_text: 'Button Text',
        cta_location: 'hero',
        cta_type: 'invalid_type' // Invalid CTA type
      };

      expect(validateAnalyticsEvent(invalidEvent)).toBe(false);
    });

    test('should validate WhatsApp click events', () => {
      const validEvent: WhatsAppClickEvent = {
        event: 'whatsapp_click',
        link_url: 'https://wa.me/351912345678',
        link_text: 'Falar no WhatsApp',
        location: 'faq'
      };

      expect(validateAnalyticsEvent(validEvent)).toBe(true);

      const invalidEvent = {
        event: 'whatsapp_click',
        link_url: 'https://wa.me/351912345678',
        // Missing required link_text property
        location: 'faq'
      };

      expect(validateAnalyticsEvent(invalidEvent)).toBe(false);
    });

    test('should validate FAQ toggle events', () => {
      const validEvent: FAQToggleEvent = {
        event: 'faq_toggle',
        faq_id: 'faq-1',
        faq_question: 'Quando é o evento?',
        action: 'expand'
      };

      expect(validateAnalyticsEvent(validEvent)).toBe(true);

      const invalidEvent = {
        event: 'faq_toggle',
        faq_id: 'faq-1',
        faq_question: 'Question text',
        action: 'invalid_action' // Invalid action
      };

      expect(validateAnalyticsEvent(invalidEvent)).toBe(false);
    });

    test('should reject events with invalid event names', () => {
      const invalidEvent = {
        event: 'invalid_event_name',
        some_property: 'value'
      };

      expect(validateAnalyticsEvent(invalidEvent)).toBe(false);
    });

    test('should reject non-object events', () => {
      expect(validateAnalyticsEvent(null)).toBe(false);
      expect(validateAnalyticsEvent(undefined)).toBe(false);
      expect(validateAnalyticsEvent('string')).toBe(false);
      expect(validateAnalyticsEvent(123)).toBe(false);
    });
  });

  describe('Event Properties Validation', () => {
    test('should return expected properties for each event type', () => {
      const pageViewProps = getExpectedEventProperties('page_view');
      expect(pageViewProps).toContain('event');
      expect(pageViewProps).toContain('page_title');
      expect(pageViewProps).toContain('page_location');
      expect(pageViewProps).toContain('page_language');

      const sectionViewProps = getExpectedEventProperties('section_view');
      expect(sectionViewProps).toContain('event');
      expect(sectionViewProps).toContain('section_id');
      expect(sectionViewProps).toContain('section_variant');

      const ctaClickProps = getExpectedEventProperties('cta_click');
      expect(ctaClickProps).toContain('event');
      expect(ctaClickProps).toContain('cta_text');
      expect(ctaClickProps).toContain('cta_location');
      expect(ctaClickProps).toContain('cta_type');
    });
  });

  describe('GTM Integration Validation', () => {
    test('should validate that dataLayer exists', () => {
      expect(window.dataLayer).toBeDefined();
      expect(Array.isArray(window.dataLayer)).toBe(true);
    });

    test('should track all required GTM events', () => {
      REQUIRED_GTM_EVENTS.forEach(eventName => {
        expect(typeof eventName).toBe('string');
        expect(eventName.length).toBeGreaterThan(0);
      });

      // Ensure we have the essential events
      expect(REQUIRED_GTM_EVENTS).toContain('page_view');
      expect(REQUIRED_GTM_EVENTS).toContain('section_view');
      expect(REQUIRED_GTM_EVENTS).toContain('cta_click');
    });
  });

  describe('Section Analytics Integration', () => {
    test('should validate section tracking configuration', async () => {
      // Load page data to check section tracking
      const { default: sectionsLoader } = await import('../../../src/_data/sections.ts');
      const sections = sectionsLoader.call({ page: { url: '/' } });
      const enabledSections = sections.filter((s: { enabled: boolean }) => s.enabled);

      enabledSections.forEach((section: { slug: string; enabled: boolean; data: { id: string; enabled: boolean; copy: object } }) => {
        // Each section should have basic configuration
        expect(section.data.id).toBeDefined();
        expect(section.data.enabled).toBeDefined();
        expect(section.data.copy).toBeDefined();

        // Section ID should match slug and be valid
        expect(section.data.id).toBe(section.slug);
        const validSectionIds = [
          'top-banner', 'hero', 'problem', 'solution', 'about',
          'social-proof', 'offer', 'faq', 'final-cta', 'footer'
        ];
        expect(validSectionIds).toContain(section.data.id);

        // Section should be enabled
        expect(section.data.enabled).toBe(true);
      });
    });

    test('should validate FAQ items have required structure', async () => {
      // Load FAQ section data
      const { loadSectionData } = await import('../../utils/section-loader.ts');
      const faqData = loadSectionData('faq') as { items?: Array<{ id: string; question: string; answer: object }> };

      if (faqData.items && Array.isArray(faqData.items)) {
        faqData.items.forEach((item: { id: string; question: string; answer: object }) => {
          expect(item.id).toBeDefined();
          expect(typeof item.id).toBe('string');
          expect(item.question).toBeDefined();
          expect(typeof item.question).toBe('string');
          expect(item.answer).toBeDefined();
          expect(typeof item.answer).toBe('object');
        });
      }
    });

    test('should validate solution pillars have required structure', async () => {
      const { loadSectionData } = await import('../../utils/section-loader.ts');
      const solutionData = loadSectionData('solution') as { copy: { pillars?: Array<{ number: string; title: string; description: string; icon: string }> } };

      if (solutionData.copy.pillars && Array.isArray(solutionData.copy.pillars)) {
        solutionData.copy.pillars.forEach((pillar: { number: string; title: string; description: string; icon: string }) => {
          expect(pillar.number).toBeDefined();
          expect(typeof pillar.number).toBe('string');
          expect(pillar.title).toBeDefined();
          expect(typeof pillar.title).toBe('string');
          expect(pillar.description).toBeDefined();
          expect(typeof pillar.description).toBe('string');
          expect(pillar.icon).toBeDefined();
          expect(typeof pillar.icon).toBe('string');
        });
      }
    });
  });

  describe('Analytics Event Simulation', () => {
    test('should simulate section view event tracking', () => {
      // Simulate tracking a section view
      const sectionViewEvent: SectionViewEvent = {
        event: 'section_view',
        section_id: 'hero',
        section_variant: 'default',
        viewport_percentage: 100
      };

      // Simulate pushing to dataLayer
      window.dataLayer.push(sectionViewEvent);

      expect(window.dataLayer).toHaveLength(1);
      expect(window.dataLayer[0]).toEqual(sectionViewEvent);
      expect(validateAnalyticsEvent(window.dataLayer[0])).toBe(true);
    });

    test('should simulate CTA click event tracking', () => {
      const ctaClickEvent: CTAClickEvent = {
        event: 'cta_click',
        cta_text: 'Inscrever-me Agora',
        cta_location: 'hero',
        cta_type: 'primary',
        cta_destination: '#offer'
      };

      window.dataLayer.push(ctaClickEvent);

      expect(window.dataLayer).toHaveLength(1);
      expect(validateAnalyticsEvent(window.dataLayer[0])).toBe(true);
    });

    test('should reject invalid events in dataLayer', () => {
      const invalidEvent = {
        event: 'invalid_event',
        some_property: 'value'
      };

      window.dataLayer.push(invalidEvent);

      expect(window.dataLayer).toHaveLength(1);
      expect(validateAnalyticsEvent(window.dataLayer[0])).toBe(false);
    });
  });

  describe('Real-world Event Examples', () => {
    test('should validate realistic section view events', () => {
      const realEvents = [
        {
          event: 'section_view',
          section_id: 'hero',
          section_variant: 'default',
          viewport_percentage: 100,
          timestamp: Date.now()
        },
        {
          event: 'section_view',
          section_id: 'offer',
          section_variant: 'pricing',
          viewport_percentage: 80,
          timestamp: Date.now()
        }
      ];

      realEvents.forEach(event => {
        expect(validateAnalyticsEvent(event)).toBe(true);
      });
    });

    test('should validate realistic interaction events', () => {
      const realEvents = [
        {
          event: 'whatsapp_click',
          link_url: 'https://wa.me/351912345678?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20evento',
          link_text: 'Tirar Dúvidas no WhatsApp',
          location: 'faq'
        },
        {
          event: 'cta_click',
          cta_text: 'Garantir Minha Vaga',
          cta_location: 'offer',
          cta_type: 'primary',
          cta_destination: 'https://checkout.stripe.com/pay/...'
        },
        {
          event: 'faq_toggle',
          faq_id: 'faq-quando-evento',
          faq_question: 'Quando é o evento?',
          action: 'expand'
        }
      ];

      realEvents.forEach(event => {
        expect(validateAnalyticsEvent(event)).toBe(true);
      });
    });
  });
});