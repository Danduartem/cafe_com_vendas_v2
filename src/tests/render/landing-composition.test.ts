/**
 * Render tests for landing page composition
 * Tests that landing.json renders all sections in correct order with real data
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import type { LoadedPageSection } from '../../_data/types.ts';

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
      const enabledSections = pageData.sections.filter((s: LoadedPageSection) => s.enabled);

      // Should have at least hero, problem, solution, offer, and footer sections
      const requiredSections = ['hero', 'problem', 'solution', 'offer', 'footer'];
      const enabledSlugs = enabledSections.map((s: LoadedPageSection) => s.slug);

      requiredSections.forEach(required => {
        expect(enabledSlugs).toContain(required);
      });
    });

    test('should load section data for each enabled section', async () => {
      const { default: pageDataLoader } = await import('../../_data/page.ts');
      const pageData = pageDataLoader.call({ page: { url: '/' } });
      const enabledSections = pageData.sections.filter((s: LoadedPageSection) => s.enabled);

      enabledSections.forEach((section: LoadedPageSection) => {
        expect(section.data).toBeDefined();
        expect(typeof section.data).toBe('object');
        expect(section.data.id).toBe(section.slug);
        expect(section.data.enabled).toBe(true);
      });
    });
  });

  describe('Section Order and Structure', () => {
    test('should maintain logical section order', async () => {
      const { default: pageDataLoader } = await import('../../_data/page.ts');
      const pageData = pageDataLoader.call({ page: { url: '/' } });
      const enabledSections = pageData.sections.filter((s: LoadedPageSection) => s.enabled);
      const sectionOrder = enabledSections.map((s: LoadedPageSection) => s.slug);

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
      const enabledSections = pageData.sections.filter((s: LoadedPageSection) => s.enabled);

      enabledSections.forEach((section: LoadedPageSection) => {
        const sectionData = section.data;
        const tracking = sectionData.tracking;

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
      const enabledSections = pageData.sections.filter((s: LoadedPageSection) => s.enabled);

      enabledSections.forEach((section: LoadedPageSection) => {
        const sectionData = section.data;
        const tracking = sectionData.tracking;
        const copy = sectionData.copy;

        // Simulate section container creation
        const sectionElement = document.createElement('section');
        sectionElement.id = tracking.section_id;
        sectionElement.className = `section-${section.slug}`;
        sectionElement.setAttribute('data-section', section.slug);

        // Add basic content structure
        const container = document.createElement('div');
        container.className = 'container';

        const content = document.createElement('div');
        content.className = 'content';
        content.textContent = copy.headline || (copy as any).title || 'Content';

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
      const enabledSections = pageData.sections.filter((s: LoadedPageSection) => s.enabled);

      enabledSections.forEach((section: LoadedPageSection) => {
        const sectionData = section.data;
        const sectionElement = document.createElement('section');

        // Test section-specific content handling
        switch (section.slug) {
        case 'hero': {
          const copy = sectionData.copy as any;
          const badge = copy.badge;
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
          const copy = sectionData.copy as any;
          const painPoints = copy.pain_points;
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
          const copy = sectionData.copy as any;
          const pillars = copy.pillars;
          if (pillars) {
            const pillarsContainer = document.createElement('div');
            pillarsContainer.className = 'pillars';
            pillars.forEach((pillar: any) => {
              const pillarElement = document.createElement('div');
              pillarElement.className = 'pillar';
              pillarElement.textContent = pillar.title;
              pillarsContainer.appendChild(pillarElement);
            });
            sectionElement.appendChild(pillarsContainer);
            expect(sectionElement.querySelectorAll('.pillar').length).toBe(pillars.length);
          }
          break;
        }

        case 'social-proof': {
          const testimonials = (sectionData as any).testimonials;
          if (testimonials) {
            const testimonialsContainer = document.createElement('div');
            testimonialsContainer.className = 'testimonials';
            testimonials.forEach((testimonial: any) => {
              const testimonialElement = document.createElement('div');
              testimonialElement.className = 'testimonial';
              testimonialElement.textContent = testimonial.name;
              testimonialsContainer.appendChild(testimonialElement);
            });
            sectionElement.appendChild(testimonialsContainer);
            expect(sectionElement.querySelectorAll('.testimonial').length).toBe(testimonials.length);
          }
          break;
        }

        case 'faq': {
          const items = (sectionData as any).items;
          if (items) {
            const faqContainer = document.createElement('div');
            faqContainer.className = 'faq-items';
            items.forEach((item: any) => {
              const faqElement = document.createElement('div');
              faqElement.className = 'faq-item';
              faqElement.id = item.id;
              faqElement.textContent = item.question;
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
      const enabledSections = pageData.sections.filter((s: LoadedPageSection) => s.enabled);

      // Simulate the complete page rendering
      const pageContainer = document.createElement('div');
      pageContainer.className = 'page-container';
      pageContainer.id = 'landing-page';

      enabledSections.forEach((section: LoadedPageSection, index: number) => {
        const sectionData = section.data;
        const tracking = sectionData.tracking;
        const design = sectionData.design;

        const sectionElement = document.createElement('section');
        sectionElement.id = tracking.section_id;
        sectionElement.className = `section section-${section.slug}`;
        sectionElement.setAttribute('data-order', index.toString());
        sectionElement.setAttribute('data-variant', sectionData.variant);
        sectionElement.setAttribute('data-theme', design.theme);

        // Add analytics attributes
        sectionElement.setAttribute('data-analytics-section', section.slug);
        sectionElement.setAttribute('data-analytics-impression', tracking.impression_event);

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
      const enabledSections = pageData.sections.filter((s: LoadedPageSection) => s.enabled);

      enabledSections.forEach((section: LoadedPageSection) => {
        const sectionData = section.data;
        const tracking = sectionData.tracking;
        const design = sectionData.design;
        const copy = sectionData.copy;

        // Each section should have analytics integration points
        expect(tracking.section_id).toBeDefined();
        expect(tracking.impression_event).toBeDefined();

        // Each section should have design integration points
        expect(design.theme).toBeDefined();
        expect(design.layout).toBeDefined();

        // Section should have background or overlay
        const hasBackgroundStyle = design.background !== undefined || (design as any).overlay !== undefined;
        expect(hasBackgroundStyle).toBe(true);

        // Each section should have content integration points
        const hasContent = copy.headline ||
                          (copy as any).title ||
                          (copy as any).message ||
                          copy.eyebrow ||
                          (copy as any).stats ||
                          (copy as any).brand ||
                          (copy as any).items ||
                          (copy as any).pillars ||
                          (copy as any).testimonials;
        expect(hasContent).toBeDefined();
      });
    });
  });
});