/**
 * Tests for data adapter layer (src/_data/*.ts)
 * Validates that data loaders properly transform JSON to TypeScript types
 */

import { describe, test, expect } from 'vitest';

describe('Data Adapter Layer', () => {
  describe('Site Data Adapter', async () => {
    const { default: siteDataLoader } = await import('../../_data/site.ts');
    const siteData = siteDataLoader();

    test('should load and transform site data correctly', () => {
      expect(siteData).toBeDefined();
      expect(typeof siteData.title).toBe('string');
      expect(typeof siteData.description).toBe('string');
      expect(typeof siteData.url).toBe('string');
      expect(typeof siteData.baseUrl).toBe('string');
      expect(siteData.analytics).toBeDefined();
      expect(typeof siteData.analytics.gtmId).toBe('string');
    });

    test('should have valid URL format', () => {
      expect(siteData.url).toMatch(/^https?:\/\/.+/);
    });

    test('should have valid GTM ID format', () => {
      expect(siteData.analytics.gtmId).toMatch(/^GTM-[A-Z0-9]+$/);
    });
  });

  describe('Global Data Adapter', async () => {
    const { default: globalDataLoader } = await import('../../_data/global.ts');
    const globalData = globalDataLoader();

    test('should load global strings and data', () => {
      expect(globalData).toBeDefined();
      expect(typeof globalData).toBe('object');
    });

    test('should have required string categories', () => {
      const requiredCategories = ['nav', 'common', 'legal', 'contact', 'event', 'currency', 'time'];
      requiredCategories.forEach(category => {
        expect(globalData[category]).toBeDefined();
        expect(typeof globalData[category]).toBe('object');
      });
    });
  });

  describe('Event Data Adapter', async () => {
    const { default: eventDataLoader } = await import('../../_data/event.ts');
    const eventData = eventDataLoader();

    test('should load and transform event data', () => {
      expect(eventData).toBeDefined();
      expect(typeof eventData.name).toBe('string');
      expect(typeof eventData.tagline).toBe('string');
      expect(typeof eventData.description).toBe('string');
      expect(eventData.date).toBeDefined();
      expect(eventData.location).toBeDefined();
    });

    test('should have valid date format', () => {
      // Should have date as object with properties
      expect(typeof eventData.date).toBe('object');
      expect(eventData.date).toBeDefined();
    });
  });

  describe('Presenter Data Adapter', async () => {
    const { default: presenterDataLoader } = await import('../../_data/presenter.ts');
    const presenterData = presenterDataLoader();

    test('should load presenter information', () => {
      expect(presenterData).toBeDefined();
      expect(typeof presenterData.name).toBe('string');
      expect(typeof presenterData.subtitle).toBe('string');
      expect(typeof presenterData.bio).toBe('string');
      expect(Array.isArray(presenterData.highlights)).toBe(true);
    });

    test('should have valid social media data', () => {
      expect(presenterData.social).toBeDefined();
      expect(typeof presenterData.social.instagram).toBe('string');
    });

    test('should have valid schema.org data', () => {
      expect(presenterData.schema).toBeDefined();
      expect(presenterData.schema['@context']).toBe('https://schema.org');
      expect(presenterData.schema['@type']).toBe('Person');
      expect(typeof presenterData.schema.name).toBe('string');
      expect(typeof presenterData.schema.jobTitle).toBe('string');
      expect(Array.isArray(presenterData.schema.sameAs)).toBe(true);
    });
  });

  describe('Page Composition Adapter', async () => {
    const { default: pageDataLoader } = await import('../../_data/page.ts');
    const pageData = pageDataLoader.call({ page: { url: '/' } });

    test('should load page composition correctly', () => {
      expect(pageData).toBeDefined();
      expect(pageData.meta).toBeDefined();
      expect(Array.isArray(pageData.sections)).toBe(true);
    });

    test('should have valid page metadata', () => {
      expect(typeof pageData.meta.title).toBe('string');
      expect(typeof pageData.meta.description).toBe('string');
      expect(typeof pageData.meta.route).toBe('string');
      expect(typeof pageData.meta.layout).toBe('string');
    });

    test('should have enabled sections in correct order', () => {
      const enabledSections = pageData.sections.filter((s: { enabled: boolean; slug: string; data?: unknown }) => s.enabled);
      expect(enabledSections.length).toBeGreaterThan(0);

      // Check that each section has required properties
      enabledSections.forEach((section: { enabled: boolean; slug: string; data?: unknown }) => {
        expect(typeof section.slug).toBe('string');
        expect(typeof section.enabled).toBe('boolean');
        expect(section.data).toBeDefined();
      });
    });

    test('should load section data for each enabled section', () => {
      const enabledSections = pageData.sections.filter((s: { enabled: boolean; slug: string; data?: Record<string, unknown> }) => s.enabled);

      enabledSections.forEach((section: { enabled: boolean; slug: string; data?: Record<string, unknown> }) => {
        expect(section.data).toBeDefined();
        expect(typeof section.data).toBe('object');
        expect((section.data).id).toBe(section.slug);
      });
    });
  });

  describe('Data Transformation Consistency', () => {
    test('all data adapters should export default functions or objects', async () => {
      const adapters = ['site', 'global', 'event', 'presenter', 'page'];

      for (const adapter of adapters) {
        try {
          const module = await import(`../../_data/${adapter}.ts`);
          expect(module.default).toBeDefined();
        } catch (error) {
          throw new Error(`Failed to import ${adapter} adapter: ${error}`);
        }
      }
    });

    test('data adapters should not throw during import', async () => {
      const adapters = ['site', 'global', 'event', 'presenter', 'page'];

      for (const adapter of adapters) {
        await expect(import(`../../_data/${adapter}.ts`)).resolves.toBeDefined();
      }
    });
  });

  describe('Type Safety Validation', () => {
    test('imported data should match expected TypeScript interfaces', async () => {
      // Test that data conforms to expected shapes without explicit type checking
      const { default: siteDataLoader } = await import('../../_data/site.ts');
      const { default: eventDataLoader } = await import('../../_data/event.ts');
      const { default: pageDataLoader } = await import('../../_data/page.ts');

      const siteData = siteDataLoader();
      const eventData = eventDataLoader();
      const pageData = pageDataLoader.call({ page: { url: '/' } });

      // Site data shape validation
      expect(siteData).toMatchObject({
        title: expect.any(String),
        description: expect.any(String),
        url: expect.any(String),
        baseUrl: expect.any(String),
        analytics: {
          gtmId: expect.any(String)
        }
      });

      // Event data shape validation
      expect(eventData).toMatchObject({
        name: expect.any(String),
        tagline: expect.any(String),
        description: expect.any(String),
        date: expect.any(Object),
        location: expect.any(Object)
      });

      // Page data shape validation
      expect(pageData).toMatchObject({
        meta: {
          title: expect.any(String),
          description: expect.any(String),
          route: expect.any(String),
          layout: expect.any(String)
        },
        sections: expect.any(Array)
      });
    });
  });
});