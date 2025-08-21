/**
 * Integration with Playwright MCP Server
 * Extends the MCP browser instance with universal screenshot capability
 */

import { takeUniversalScreenshot, ScreenshotOptions, ScreenshotResult } from './universal-screenshot.js';

/**
 * Enhanced screenshot function that works with Playwright MCP browser instances
 * This function can be called when you have an active Playwright MCP session
 */
export async function takeUniversalScreenshotMCP(
  page: any,
  filename: string, 
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
  // Ensure we're working with a directory that exists
  const path = require('path');
  const fs = require('fs');
  
  const dir = path.dirname(filename);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Use our universal screenshot with the MCP page instance
  return await takeUniversalScreenshot(page, filename, {
    timeout: 30000,
    retries: 3,
    waitForNetworkIdle: true,
    optimizePage: true,
    sectionOverlap: 100,
    ...options
  });
}

/**
 * Wrapper function to make it easy to use with current Playwright MCP pattern
 */
export async function mcpTakeScreenshot(
  filename: string = 'screenshot.png',
  options: ScreenshotOptions = {}
): Promise<string> {
  // This would be used in the context where page is available globally
  // For now, return instruction for manual integration
  return `
To use universal screenshots with Playwright MCP, call:

import { takeUniversalScreenshotMCP } from './scripts/playwright-universal-screenshot.js';
const result = await takeUniversalScreenshotMCP(page, '${filename}', ${JSON.stringify(options, null, 2)});

This will:
1. ✅ Try full page screenshot first (fast when it works)
2. ✅ Automatically fallback to sectional screenshots (reliable)
3. ✅ Handle animations and lazy loading
4. ✅ Provide detailed feedback on success/failure
5. ✅ Return comprehensive result information

Example usage:
const result = await takeUniversalScreenshotMCP(page, 'my-site-full.png', {
  timeout: 45000,
  retries: 5,
  sectionOverlap: 150
});

if (result.success) {
  console.log(\`📸 Screenshot type: \${result.type}\`);
  console.log(\`📁 Files created: \${result.files.length}\`);
} else {
  console.error(\`❌ Failed: \${result.error}\`);
}
`;
}

/**
 * Default options for different use cases
 */
export const SCREENSHOT_PRESETS = {
  // Fast for simple pages
  fast: {
    timeout: 15000,
    retries: 2,
    waitForNetworkIdle: false,
    sectionOverlap: 50
  },
  
  // Standard for most websites  
  standard: {
    timeout: 30000,
    retries: 3,
    waitForNetworkIdle: true,
    sectionOverlap: 100
  },
  
  // Robust for complex/heavy websites
  robust: {
    timeout: 60000,
    retries: 5,
    waitForNetworkIdle: true,
    optimizePage: true,
    sectionOverlap: 200
  },
  
  // For SPA/React apps with lots of animations
  spa: {
    timeout: 45000,
    retries: 4,
    waitForNetworkIdle: true,
    optimizePage: true,
    sectionOverlap: 150
  }
} as const;

export type PresetName = keyof typeof SCREENSHOT_PRESETS;