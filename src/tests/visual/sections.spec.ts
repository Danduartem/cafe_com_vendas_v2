/**
 * Visual regression tests for individual sections
 * Captures screenshots of each section for visual comparison
 */

import { test, expect } from '@playwright/test';

// Section slugs that should be tested
const sectionSlugs = [
  'top-banner',
  'hero',
  'problem',
  'solution',
  'about',
  'social-proof',
  'offer',
  'faq',
  'final-cta',
  'footer'
];

test.describe('Section Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait for any animations to complete
    await page.waitForTimeout(1000);
  });

  for (const sectionSlug of sectionSlugs) {
    test(`${sectionSlug} section visual appearance`, async ({ page }) => {
      // Find the section element
      const section = page.locator(`[data-analytics-section="${sectionSlug}"]`).first();

      // Check if section exists and is visible
      await expect(section).toBeVisible();

      // Scroll section into view
      await section.scrollIntoViewIfNeeded();

      // Wait for any lazy-loaded content
      await page.waitForTimeout(500);

      // Take screenshot of the section
      await expect(section).toHaveScreenshot(`${sectionSlug}-section.png`);
    });
  }

  test('Full page visual appearance', async ({ page }) => {
    // Take a full page screenshot
    await expect(page).toHaveScreenshot('full-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Above the fold visual appearance', async ({ page }) => {
    // Take screenshot of viewport (above the fold)
    await expect(page).toHaveScreenshot('above-the-fold.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });
});

test.describe('Section Interactive States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('FAQ section expanded state', async ({ page }) => {
    // Find FAQ section
    const faqSection = page.locator('[data-analytics-section="faq"]').first();
    await expect(faqSection).toBeVisible();

    // Find first FAQ item and click it
    const firstFaqItem = faqSection.locator('.faq-item, [data-faq-item]').first();
    if (await firstFaqItem.isVisible()) {
      await firstFaqItem.click();
      await page.waitForTimeout(500); // Wait for animation

      // Take screenshot with expanded FAQ
      await expect(faqSection).toHaveScreenshot('faq-section-expanded.png');
    }
  });

  test('Mobile menu state (mobile only)', async ({ page, isMobile }) => {
    if (!isMobile) {
      return; // Skip mobile-only test on desktop
    }

    // Look for mobile menu trigger
    const menuTrigger = page.locator('[data-mobile-menu], .mobile-menu-trigger, .hamburger').first();
    if (await menuTrigger.isVisible()) {
      await menuTrigger.click();
      await page.waitForTimeout(500);

      // Take screenshot with mobile menu open
      await expect(page).toHaveScreenshot('mobile-menu-open.png');
    }
  });
});

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1200, height: 800 },
    { name: 'large-desktop', width: 1920, height: 1080 }
  ];

  for (const viewport of viewports) {
    test(`Hero section responsive design - ${viewport.name}`, async ({ page }) => {
      // Set viewport size
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Find hero section
      const heroSection = page.locator('[data-analytics-section="hero"]').first();
      await expect(heroSection).toBeVisible();

      // Take screenshot
      await expect(heroSection).toHaveScreenshot(`hero-section-${viewport.name}.png`);
    });

    test(`Offer section responsive design - ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Find offer section
      const offerSection = page.locator('[data-analytics-section="offer"]').first();
      await expect(offerSection).toBeVisible();

      await offerSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Take screenshot
      await expect(offerSection).toHaveScreenshot(`offer-section-${viewport.name}.png`);
    });
  }
});

test.describe('Cross-browser Consistency', () => {
  test('Hero section cross-browser appearance', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const heroSection = page.locator('[data-analytics-section="hero"]').first();
    await expect(heroSection).toBeVisible();

    // Take browser-specific screenshot
    await expect(heroSection).toHaveScreenshot(`hero-section-${browserName}.png`);
  });

  test('Footer section cross-browser appearance', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const footerSection = page.locator('[data-analytics-section="footer"]').first();
    await expect(footerSection).toBeVisible();

    await footerSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Take browser-specific screenshot
    await expect(footerSection).toHaveScreenshot(`footer-section-${browserName}.png`);
  });
});