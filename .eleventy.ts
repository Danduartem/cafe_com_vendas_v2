import 'dotenv/config';
import 'tsx/esm';
import { HtmlBasePlugin, RenderPlugin, type UserConfig } from '@11ty/eleventy';
import { logger } from './src/utils/logger.ts';

export default function(eleventyConfig: UserConfig) {
  // Add essential Eleventy 3.x plugins
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPlugin(RenderPlugin);

  // Development server configuration
  eleventyConfig.setServerOptions({
    port: 8080
  });

  // Watch and passthrough configuration
  // Note: Some modern API methods may not be available in current TypeScript definitions

  // Utility filters
  eleventyConfig.addFilter('jsonifyArray', (array: unknown) => {
    return JSON.stringify(array as unknown[]);
  });
  eleventyConfig.addFilter('keys', (obj: unknown) => {
    return Object.keys(obj as Record<string, unknown>);
  });
  eleventyConfig.addFilter('values', (obj: unknown) => {
    return Object.values(obj as Record<string, unknown>);
  });
  
  // Line break filter - converts \n to <br> tags
  eleventyConfig.addFilter('nl2br', (str: unknown) => {
    if (typeof str !== 'string') return str;
    // First escape HTML to prevent XSS, then replace newlines with <br>
    const escaped = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    return escaped.replace(/\n/g, '<br>');
  });

  // TypeScript data file support for Eleventy 3.x
  eleventyConfig.addDataExtension("ts", {
    parser: async (_contents: string, filePath: string) => {
      const { pathToFileURL } = await import('node:url');
      const moduleUrl = pathToFileURL(filePath).href;
      
      try {
        const module = await import(moduleUrl) as { default: unknown };
        return typeof module.default === 'function' ? (module.default as () => unknown)() : module.default;
      } catch (error) {
        console.error(`Failed to load TypeScript data file ${filePath}:`, error);
        return {};
      }
    },
    read: false
  });

  // Static asset handling - aligned with Vite best practices
  eleventyConfig.addPassthroughCopy({ 'src/assets/css': 'assets/css' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/static/images': 'assets/pictures' });
  
  // Copy public directory to root for favicon and fonts (Eleventy 3.x best practice)
  eleventyConfig.addPassthroughCopy({ 'public': '.' });

  // Build events for development feedback
  eleventyConfig.on('eleventy.before', () => {
    logger.info('🚀 Starting Eleventy build...');
  });

  eleventyConfig.on('eleventy.after', () => {
    logger.info('✅ Eleventy build completed!');
  });

  // Return configuration object (stable approach)
  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site'
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    templateFormats: ['html', 'njk', 'md']
  };
}
