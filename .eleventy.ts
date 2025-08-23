import 'dotenv/config';
import 'tsx/esm';
import { HtmlBasePlugin, RenderPlugin, type UserConfig } from '@11ty/eleventy';

export default function(eleventyConfig: UserConfig) {
  // Add essential Eleventy 3.x plugins
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPlugin(RenderPlugin);

  // Development server configuration
  eleventyConfig.setServerOptions({
    port: 8888
  });

  // Watch and passthrough configuration
  // Note: Some modern API methods may not be available in current TypeScript definitions

  // Utility filters
  eleventyConfig.addFilter('jsonifyArray', (...args: unknown[]) => {
    const array = args[0] as unknown[];
    return JSON.stringify(array);
  });
  eleventyConfig.addFilter('keys', (...args: unknown[]) => {
    const obj = args[0] as Record<string, unknown>;
    return Object.keys(obj);
  });
  eleventyConfig.addFilter('values', (...args: unknown[]) => {
    const obj = args[0] as Record<string, unknown>;
    return Object.values(obj);
  });

  // TypeScript data file support - explicit configuration for Eleventy 3.x
  eleventyConfig.addDataExtension("ts", {
    parser: async (_contents: string, filePath: string) => {
      // Use dynamic import to load the compiled TypeScript module
      const { pathToFileURL } = await import('node:url');
      const moduleUrl = pathToFileURL(filePath).href + '?t=' + Date.now();
      
      try {
        const module = await import(moduleUrl);
        
        // If it exports a function, call it; otherwise use the default export
        if (typeof module.default === 'function') {
          return module.default();
        }
        return module.default;
      } catch (error) {
        console.error(`Failed to load TypeScript data file ${filePath}:`, error);
        return {};
      }
    },
    read: false // We'll handle the file reading via import
  });

  // Static asset handling
  eleventyConfig.addPassthroughCopy({ 'src/assets/css': 'assets/css' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/static/images': 'assets/pictures' });
  eleventyConfig.addPassthroughCopy({ 'src/public': '/' });

  // Build events for development feedback
  eleventyConfig.on('eleventy.before', async () => {
    console.log('🚀 Starting Eleventy build...');
  });

  eleventyConfig.on('eleventy.after', async () => {
    console.log('✅ Eleventy build completed!');
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
