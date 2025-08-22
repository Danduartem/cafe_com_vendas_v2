/**
 * Global setup for Playwright visual tests
 * Ensures consistent environment for visual regression testing
 */

import type { FullConfig } from '@playwright/test';
import { chromium } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  if (!baseURL) {
    throw new Error('baseURL is not defined in the config');
  }

  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the dev server to be ready
    console.log('Waiting for dev server to be ready...');
    await page.goto(baseURL);

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check that essential elements are present
    await page.waitForSelector('body');

    console.log('Dev server is ready for visual testing');
  } catch (error) {
    console.error('Failed to prepare dev server for testing:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;