import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get current directory in ESM module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env
dotenv.config({ path: resolve(__dirname, '.env') });

/**
 * Playwright configuration for Café com Vendas user journey tests
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI for stability
  workers: process.env.CI ? 2 : undefined,
  
  // Maximum number of failures before stopping (CI only)
  maxFailures: process.env.CI ? 5 : undefined,
  
  // Global timeout for entire test run (CI only - 10 minutes)
  globalTimeout: process.env.CI ? 10 * 60 * 1000 : undefined,
  
  // Reporter to use - enhanced configuration
  reporter: process.env.CI 
    ? [['github'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results.json' }]]
    : [['html', { open: 'on-failure' }]],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.TEST_URL || 'http://localhost:8080',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure (CI only to save space locally)
    video: process.env.CI ? 'retain-on-failure' : 'off',
    
    // Use Playwright defaults for action/navigation timeouts unless overridden in tests
  },

  // Configure projects for major browsers (Firefox removed as agreed)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Firefox removed as per agreement (< 5% market share)
    
    // Mobile viewports - keeping both as requested
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 8080,
    reuseExistingServer: true,
    timeout: 30 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});