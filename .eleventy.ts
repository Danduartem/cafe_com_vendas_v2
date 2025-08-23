import 'dotenv/config';
import { HtmlBasePlugin, RenderPlugin, InputPathToUrlPlugin, type UserConfig } from '@11ty/eleventy';

export default function(eleventyConfig: UserConfig) {
  // Add essential Eleventy 3.x plugins
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPlugin(RenderPlugin);
  eleventyConfig.addPlugin(InputPathToUrlPlugin);

  // Development server configuration
  eleventyConfig.setServerOptions({
    port: 8888,
    liveReload: true,
    domDiff: true
  });

  // Essential watch configuration
  eleventyConfig.setWatchJavaScriptDependencies(false);
  eleventyConfig.setServerPassthroughCopyBehavior('passthrough');

  // Utility filters
  eleventyConfig.addFilter('jsonifyArray', (array: unknown[]) => JSON.stringify(array));
  eleventyConfig.addFilter('keys', (obj: Record<string, unknown>) => Object.keys(obj));
  eleventyConfig.addFilter('values', (obj: Record<string, unknown>) => Object.values(obj));

  // Static asset handling
  eleventyConfig.addPassthroughCopy({ 'src/assets/css': 'assets/css' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/images': 'assets/pictures' });
  eleventyConfig.addPassthroughCopy({ 'src/public': '/' });

  // Build events for development feedback
  eleventyConfig.on('eleventy.before', async () => {
    console.log('🚀 Starting Eleventy build...');
  });

  eleventyConfig.on('eleventy.after', async () => {
    console.log('✅ Eleventy build completed!');
  });

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site'
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    templateFormats: ['html', 'njk', 'md'],
    dataTemplateEngine: 'njk'
  };
}
