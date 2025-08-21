/**
 * Universal Screenshot Utility
 * Handles full-page screenshots with automatic fallback to sectional screenshots
 */

/**
 * Page interface for universal screenshot operations
 */
interface UniversalPage {
  addStyleTag: (options: { content: string }) => Promise<void>;
  evaluate: <T>(fn: (...args: unknown[]) => T, ...args: unknown[]) => Promise<T>;
  waitForTimeout: (timeout: number) => Promise<void>;
  waitForLoadState?: (state: string, options?: { timeout: number }) => Promise<void>;
  screenshot: (options: Record<string, unknown>) => Promise<Buffer>;
  goto?: (url: string, options?: Record<string, unknown>) => Promise<void>;
}

export interface ScreenshotOptions {
  timeout?: number;
  retries?: number;
  waitForNetworkIdle?: boolean;
  optimizePage?: boolean;
  sectionOverlap?: number;
}

export interface ScreenshotResult {
  success: boolean;
  type: 'fullpage' | 'sectional';
  files: string[];
  error?: string;
  totalSections?: number;
  pageHeight?: number;
}

/**
 * Optimizes page for better screenshot capture
 */
async function optimizePageForScreenshot(page: UniversalPage): Promise<void> {
  try {
    // Disable animations and transitions for faster capture
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-delay: -0.01ms !important;
          transition-duration: 0.01ms !important;
          transition-delay: -0.01ms !important;
          scroll-behavior: auto !important;
        }
      `
    });

    // Wait for lazy-loaded images and content
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const images = Array.from(document.querySelectorAll('img[loading="lazy"]'));

        if (images.length === 0) {
          resolve();
          return;
        }

        let loadedCount = 0;
        const checkComplete = () => {
          loadedCount++;
          if (loadedCount === images.length) {
            resolve();
          }
        };

        images.forEach((img: HTMLImageElement) => {
          if (img.complete) {
            checkComplete();
          } else {
            img.onload = checkComplete;
            img.onerror = checkComplete; // Don't hang on broken images
          }
        });

        // Fallback timeout
        setTimeout(resolve, 5000);
      });
    });

    // Scroll to trigger any scroll-based lazy loading
    const _totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

  } catch (error) {
    console.warn('Page optimization failed:', error);
  }
}

/**
 * Attempts full-page screenshot with smart retry logic
 */
async function attemptFullPageScreenshot(
  page: UniversalPage,
  filename: string,
  options: ScreenshotOptions
): Promise<boolean> {
  const { timeout = 30000, retries = 3, waitForNetworkIdle = true } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Wait for network to be idle
      if (waitForNetworkIdle) {
        await page.waitForLoadState('networkidle', { timeout: 10000 });
      }

      // Additional wait for content to settle
      await page.waitForTimeout(1000);

      // Attempt full page screenshot
      await page.screenshot({
        path: filename,
        fullPage: true,
        timeout,
        type: 'png'
      });

      console.log(`✅ Full page screenshot successful on attempt ${attempt}`);
      return true;

    } catch (error) {
      console.log(`⚠️ Full page attempt ${attempt} failed: ${error.message}`);

      if (attempt === retries) {
        console.log(`❌ Full page screenshot failed after ${retries} attempts`);
        return false;
      }

      // Progressive backoff
      await page.waitForTimeout(1000 * attempt);
    }
  }

  return false;
}

/**
 * Takes sectional screenshots as fallback
 */
async function takeSectionalScreenshots(
  page: UniversalPage,
  baseFilename: string,
  options: ScreenshotOptions
): Promise<string[]> {
  const { sectionOverlap = 100 } = options;

  // Get page dimensions
  const { totalHeight, viewportHeight } = await page.evaluate(() => ({
    totalHeight: Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
      document.body.scrollHeight,
      document.body.offsetHeight
    ),
    viewportHeight: window.innerHeight
  }));

  // Calculate sections with overlap
  const effectiveHeight = viewportHeight - sectionOverlap;
  const sections = Math.ceil((totalHeight - sectionOverlap) / effectiveHeight);
  const screenshots: string[] = [];

  console.log(`📄 Taking ${sections} sectional screenshots (page height: ${totalHeight}px)`);

  // Reset to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  for (let i = 0; i < sections; i++) {
    try {
      const scrollY = i * effectiveHeight;

      // Ensure we don't scroll past the page
      const actualScrollY = Math.min(scrollY, totalHeight - viewportHeight);

      await page.evaluate((y) => window.scrollTo(0, y), actualScrollY);
      await page.waitForTimeout(500); // Let content settle

      const filename = baseFilename.replace(/\.png$/, `-section-${i + 1}.png`);

      await page.screenshot({
        path: filename,
        timeout: 10000,
        type: 'png'
      });

      screenshots.push(filename);
      console.log(`📸 Section ${i + 1}/${sections} captured: ${filename}`);

    } catch (error) {
      console.error(`❌ Section ${i + 1} failed:`, error);
      // Continue with other sections
    }
  }

  // Reset scroll position
  await page.evaluate(() => window.scrollTo(0, 0));

  return screenshots;
}

/**
 * Universal screenshot function with automatic fallback
 */
export async function takeUniversalScreenshot(
  page: UniversalPage,
  filename: string,
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
  const startTime = Date.now();

  try {
    console.log(`🚀 Starting universal screenshot: ${filename}`);

    // Step 1: Optimize page if requested
    if (options.optimizePage !== false) {
      await optimizePageForScreenshot(page);
    }

    // Get page height for reporting
    const pageHeight = await page.evaluate(() =>
      Math.max(
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
        document.body.scrollHeight,
        document.body.offsetHeight
      )
    );

    // Step 2: Try full page screenshot first
    const fullPageSuccess = await attemptFullPageScreenshot(page, filename, options);

    if (fullPageSuccess) {
      const duration = Date.now() - startTime;
      console.log(`✅ Full page screenshot completed in ${duration}ms`);

      return {
        success: true,
        type: 'fullpage',
        files: [filename],
        pageHeight
      };
    }

    // Step 3: Fallback to sectional screenshots
    console.log('🔄 Falling back to sectional screenshots...');
    const sectionFiles = await takeSectionalScreenshots(page, filename, options);

    if (sectionFiles.length > 0) {
      const duration = Date.now() - startTime;
      console.log(`✅ Sectional screenshots completed in ${duration}ms (${sectionFiles.length} sections)`);

      return {
        success: true,
        type: 'sectional',
        files: sectionFiles,
        totalSections: sectionFiles.length,
        pageHeight
      };
    }

    // Step 4: Complete failure
    throw new Error('Both full page and sectional screenshots failed');

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Universal screenshot failed after ${duration}ms:`, error);

    return {
      success: false,
      type: 'fullpage',
      files: [],
      error: error.message
    };
  }
}

/**
 * Standalone function for CLI usage
 */
export async function takeScreenshotCLI(url: string, output: string, options: ScreenshotOptions = {}) {
  const { chromium } = await import('@playwright/test');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  try {
    console.log(`🌐 Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const result = await takeUniversalScreenshot(page, output, options);

    return result;

  } finally {
    await browser.close();
  }
}