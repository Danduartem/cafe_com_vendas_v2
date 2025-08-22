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
      const { default: pageDataLoader } = await import('../../../src/_data/page.ts');
      const pageData = pageDataLoader.call({ page: { url: '/' } });
      const enabledSections = pageData.sections.filter((s: { enabled: boolean }) => s.enabled);

      enabledSections.forEach((section: { slug: string; enabled: boolean; data: { tracking: { section_id: string; impression_event: string } } }) => {
        // Each section should have tracking configuration
        expect(section.data.tracking).toBeDefined();
        expect(section.data.tracking.section_id).toBeDefined();
        expect(section.data.tracking.impression_event).toBeDefined();

        // Section ID should be valid
        const validSectionIds = [
          'top-banner', 'hero', 'problem', 'solution', 'about',
          'social-proof', 'offer', 'faq', 'final-cta', 'footer'
        ];
        expect(validSectionIds).toContain(section.data.tracking.section_id);

        // Impression event should follow naming convention
        expect(section.data.tracking.impression_event).toMatch(/^section_view|impression|view/);
      });
    });

    test('should validate FAQ items have analytics events', async () => {
      // Load FAQ section data
      const { loadSectionData } = await import('../../utils/section-loader.ts');
      const faqData = loadSectionData('faq') as { items?: Array<{ analytics_event: string; question: string; answer: string }> };

      if (faqData.items && Array.isArray(faqData.items)) {
        faqData.items.forEach((item: { analytics_event: string }) => {
          expect(item.analytics_event).toBeDefined();
          expect(typeof item.analytics_event).toBe('string');
          // Should follow FAQ event naming convention (open_faq_* pattern)
          expect(item.analytics_event).toMatch(/^(faq_|open_faq_)/);
        });
      }
    });

    test('should validate solution pillars have analytics events', async () => {
      const { loadSectionData } = await import('../../utils/section-loader.ts');
      const solutionData = loadSectionData('solution') as { copy: { pillars?: Array<{ analytics_event: string; icon: string; title: string; description: string }> } };

      if (solutionData.copy.pillars && Array.isArray(solutionData.copy.pillars)) {
        solutionData.copy.pillars.forEach((pillar: { analytics_event: string }) => {
          expect(pillar.analytics_event).toBeDefined();
          expect(typeof pillar.analytics_event).toBe('string');
          // Should follow pillar event naming convention (hover_pillar_* pattern)
          expect(pillar.analytics_event).toMatch(/^(pillar_|hover_pillar_)/);
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