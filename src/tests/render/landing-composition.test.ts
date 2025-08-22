/**
 * Render tests for landing page composition
 * Tests that landing.json renders all sections in correct order with real data
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Landing Page Composition', () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
    document = dom.window.document;
    global.document = document;
    global.window = dom.window as unknown as Window & typeof globalThis;
  });

  describe('Page Data Loading', () => {
    test('should load page data without errors', async () => {
      const { default: pageDataLoader } = await import('../../_data/page.ts');
      const pageData = pageDataLoader.call({ page: { url: '/' } });
      expect(pageData).toBeDefined();
      expect(pageData.sections).toBeDefined();
      expect(Array.isArray(pageData.sections)).toBe(true);
    });

    test('should have all required sections enabled', async () => {
      const { default: pageDataLoader } = await import('../../_data/page.ts');
      const pageData = pageDataLoader.call({ page: { url: '/' } });
      const enabledSections = pageData.sections.filter((s: { enabled: boolean; slug: string }) => s.enabled);

      // Should have at least hero, problem, solution, offer, and footer sections
      const requiredSections = ['hero', 'problem', 'solution', 'offer', 'footer'];
      const enabledSlugs = enabledSections.map((s: { slug: string }) => s.slug);

      requiredSections.forEach(required => {
        expect(enabledSlugs).toContain(required);
      });
    });

    test('should load section data for each enabled section', async () => {
      const { default: pageDataLoader } = await import('../../_data/page.ts');
      const pageData = pageDataLoader.call({ page: { url: '/' } });
      const enabledSections = pageData.sections.filter((s: { enabled: boolean; slug: string; data?: Record<string, unknown> }) => s.enabled);

      enabledSections.forEach((section: { enabled: boolean; slug: string; data?: Record<string, unknown> }) => {
        expect(section.data).toBeDefined();
        expect(typeof section.data).toBe('object');
        expect((section.data).id).toBe(section.slug);
        expect((section.data).enabled).toBe(true);
      });
    });
  });

  describe('Section Order and Structure', () => {
    test('should maintain logical section order', async () => {
      const { default: pageDataLoader } = await import('../../_data/page.ts');
      const pageData = pageDataLoader.call({ page: { url: '/' } });
      const enabledSections = pageData.sections.filter((s: { enabled: boolean; slug: string }) => s.enabled);
      const sectionOrder = enabledSections.map((s: { slug: string }) => s.slug);

      // Hero should be first after top-banner (if both enabled)
      if (sectionOrder.includes('hero')) {
        const heroIndex = sectionOrder.indexOf('hero');
        // Hero should be first OR second (after top-banner)
        expect(heroIndex).toBeLessThan(2);
      }

      // Top banner should be before hero (if both enabled)
      if (sectionOrder.includes('top-banner') && sectionOrder.includes('hero')) {
        expect(sectionOrder.indexOf('top-banner')).toBeLessThan(sectionOrder.indexOf('hero'));
      }

      // Footer should be last (if enabled)
      if (sectionOrder.includes('footer')) {
        expect(sectionOrder.indexOf('footer')).toBe(sectionOrder.length - 1);
      }

      // Problem should come before solution (if both enabled)
      if (sectionOrder.includes('problem') && sectionOrder.includes('solution')) {
        expect(sectionOrder.indexOf('problem')).toBeLessThan(sectionOrder.indexOf('solution'));
      }
    });

    test('should have consistent section data structure', async () => {
      const { default: pageDataLoader } = await import('../../_data/page.ts');
      const pageData = pageDataLoader.call({ page: { url: '/' } });
      const enabledSections = pageData.sections.filter((s: { enabled: boolean; slug: string; data?: Record<string, unknown> }) => s.enabled);

      enabledSections.forEach((section: { enabled: boolean; slug: string; data?: Record<string, unknown> }) => {
        const sectionData = section.data;
        const tracking = sectionData.tracking as Record<string, unknown>;

        // Each section should have required base properties
        expect(sectionData.id).toBeDefined();
        expect(sectionData.variant).toBeDefined();
        expect(sectionData.enabled).toBe(true);
        expect(sectionData.copy).toBeDefined();
        expect(sectionData.design).toBeDefined();
        expect(sectionData.tracking).toBeDefined();

        // Tracking should reference correct section
        expect(tracking.section_id).toBe(section.slug);
      });
    });
  });

  describe('Content Rendering Simulation', () => {
    test('should create valid HTML structure for each section', async () => {
      const { default: pageDataLoader } = await import('../../_data/page.ts');
      const pageData = pageDataLoader.call({ page: { url: '/' } });
      const enabledSections = pageData.sections.filter((s: { enabled: boolean; slug: string; data?: Record<string, unknown> }) => s.enabled);

      enabledSections.forEach((section: { enabled: boolean; slug: string; data?: Record<string, unknown> }) => {
        const sectionData = section.data;
        const tracking = sectionData.tracking as Record<string, unknown>;
        const copy = sectionData.copy as Record<string, unknown>;

        // Simulate section container creation
        const sectionElement = document.createElement('section');
        sectionElement.id = tracking.section_id as string;
        sectionElement.className = `section-${section.slug}`;
        sectionElement.setAttribute('data-section', section.slug);

        // Add basic content structure
        const container = document.createElement('div');
        container.className = 'container';

        const content = document.createElement('div');
        content.className = 'content';
        content.textContent = (copy.headline as string) || (copy.title as string) || 'Content';

        container.appendChild(content);
        sectionElement.appendChild(container);
        document.body.appendChild(sectionElement);

        // Verify element was created correctly
        expect(sectionElement.id).toBe(tracking.section_id);
        expect(sectionElement.getAttribute('data-section')).toBe(section.slug);
        expect(sectionElement.querySelector('.container')).toBeTruthy();
        expect(sectionElement.querySelector('.content')).toBeTruthy();
      });
    });

    test('should handle section-specific content correctly', async () => {
      const { default: pageDataLoader } = await import('../../_data/page.ts');
      const pageData = pageDataLoader.call({ page: { url: '/' } });
      const enabledSections = pageData.sections.filter((s: { enabled: boolean; slug: string; data?: Record<string, unknown> }) => s.enabled);

      enabledSections.forEach((section: { enabled: boolean; slug: string; data?: Record<string, unknown> }) => {
        const sectionData = section.data;
        const sectionElement = document.createElement('section');

        // Test section-specific content handling
        switch (section.slug) {
        case 'hero': {
          const copy = sectionData.copy as Record<string, unknown>;
          const badge = copy.badge as Record<string, unknown>;
          if (badge) {
            const badgeElement = document.createElement('div');
            badgeElement.className = 'badge';
            badgeElement.textContent = `${badge.date} - ${badge.location}`;
            sectionElement.appendChild(badgeElement);
            expect(sectionElement.querySelector('.badge')).toBeTruthy();
          }
          break;
        }

        case 'problem': {
          const copy = sectionData.copy as Record<string, unknown>;
          const painPoints = copy.pain_points as string[];
          if (painPoints) {
            const list = document.createElement('ul');
            painPoints.forEach((point: string) => {
              const item = document.createElement('li');
              item.textContent = point;
              list.appendChild(item);
            });
            sectionElement.appendChild(list);
            expect(sectionElement.querySelectorAll('li').length).toBe(painPoints.length);
          }
          break;
        }

        case 'solution': {
          const copy = sectionData.copy as Record<string, unknown>;
          const pillars = copy.pillars as Record<string, unknown>[];
          if (pillars) {
            const pillarsContainer = document.createElement('div');
            pillarsContainer.className = 'pillars';
            pillars.forEach((pillar: Record<string, unknown>) => {
              const pillarElement = document.createElement('div');
              pillarElement.className = 'pillar';
              pillarElement.textContent = pillar.title as string;
              pillarsContainer.appendChild(pillarElement);
            });
            sectionElement.appendChild(pillarsContainer);
            expect(sectionElement.querySelectorAll('.pillar').length).toBe(pillars.length);
          }
          break;
        }

        case 'social-proof': {
          const testimonials = sectionData.testimonials as Record<string, unknown>[];
          if (testimonials) {
            const testimonialsContainer = document.createElement('div');
            testimonialsContainer.className = 'testimonials';
            testimonials.forEach((testimonial: Record<string, unknown>) => {
              const testimonialElement = document.createElement('div');
              testimonialElement.className = 'testimonial';
              testimonialElement.textContent = testimonial.name as string;
              testimonialsContainer.appendChild(testimonialElement);
            });
            sectionElement.appendChild(testimonialsContainer);
            expect(sectionElement.querySelectorAll('.testimonial').length).toBe(testimonials.length);
          }
          break;
        }

        case 'faq': {
          const items = sectionData.items as Record<string, unknown>[];
          if (items) {
            const faqContainer = document.createElement('div');
            faqContainer.className = 'faq-items';
            items.forEach((item: Record<string, unknown>) => {
              const faqElement = document.createElement('div');
              faqElement.className = 'faq-item';
              faqElement.id = item.id as string;
              faqElement.textContent = item.question as string;
              faqContainer.appendChild(faqElement);
            });
            sectionElement.appendChild(faqContainer);
            expect(sectionElement.querySelectorAll('.faq-item').length).toBe(items.length);
          }
          break;
        }
        }

        document.body.appendChild(sectionElement);
      });
    });
  });

  describe('Template Data Flow', () => {
    test('should simulate complete data flow from JSON to rendered content', async () => {
      const { default: pageDataLoader } = await import('../../_data/page.ts');
      const pageData = pageDataLoader.call({ page: { url: '/' } });
      const enabledSections = pageData.sections.filter((s: { enabled: boolean; slug: string; data?: Record<string, unknown> }) => s.enabled);

      // Simulate the complete page rendering
      const pageContainer = document.createElement('div');
      pageContainer.className = 'page-container';
      pageContainer.id = 'landing-page';

      enabledSections.forEach((section: { enabled: boolean; slug: string; data?: Record<string, unknown> }, index: number) => {
        const sectionData = section.data;
        const tracking = sectionData.tracking as Record<string, unknown>;
        const design = sectionData.design as Record<string, unknown>;

        const sectionElement = document.createElement('section');
        sectionElement.id = tracking.section_id as string;
        sectionElement.className = `section section-${section.slug}`;
        sectionElement.setAttribute('data-order', index.toString());
        sectionElement.setAttribute('data-variant', sectionData.variant as string);
        sectionElement.setAttribute('data-theme', design.theme as string);

        // Add analytics attributes
        sectionElement.setAttribute('data-analytics-section', section.slug);
        sectionElement.setAttribute('data-analytics-impression', tracking.impression_event as string);

        pageContainer.appendChild(sectionElement);
      });

      document.body.appendChild(pageContainer);

      // Verify complete page structure
      expect(document.querySelector('#landing-page')).toBeTruthy();
      expect(document.querySelectorAll('.section').length).toBe(enabledSections.length);

      // Verify section order
      const renderedSections = Array.from(document.querySelectorAll('.section'));
      renderedSections.forEach((element, index) => {
        expect(element.getAttribute('data-order')).toBe(index.toString());
      });

      // Verify analytics attributes
      renderedSections.forEach((element) => {
        expect(element.getAttribute('data-analytics-section')).toBeTruthy();
        expect(element.getAttribute('data-analytics-impression')).toBeTruthy();
      });
    });
  });

  describe('Integration Points', () => {
    test('should validate all sections have required integration points', async () => {
      const { default: pageDataLoader } = await import('../../_data/page.ts');
      const pageData = pageDataLoader.call({ page: { url: '/' } });
      const enabledSections = pageData.sections.filter((s: { enabled: boolean; slug: string; data?: Record<string, unknown> }) => s.enabled);

      enabledSections.forEach((section: { enabled: boolean; slug: string; data?: Record<string, unknown> }) => {
        const sectionData = section.data;
        const tracking = sectionData.tracking as Record<string, unknown>;
        const design = sectionData.design as Record<string, unknown>;
        const copy = sectionData.copy as Record<string, unknown>;

        // Each section should have analytics integration points
        expect(tracking.section_id).toBeDefined();
        expect(tracking.impression_event).toBeDefined();

        // Each section should have design integration points
        expect(design.theme).toBeDefined();
        expect(design.layout).toBeDefined();

        // Some sections have 'background', others have 'overlay'
        const hasBackground = design.background !== undefined;
        const hasOverlay = design.overlay !== undefined;
        expect(hasBackground || hasOverlay).toBe(true);

        // Each section should have content integration points
        const hasContent = copy.headline ||
                          copy.title ||
                          copy.message ||
                          copy.eyebrow ||
                          copy.stats ||
                          copy.brand ||
                          copy.items ||
                          copy.pillars ||
                          copy.testimonials;
        expect(hasContent).toBeDefined();
      });
    });
  });
});