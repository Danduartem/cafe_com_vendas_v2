import 'dotenv/config';
import { HtmlBasePlugin, RenderPlugin, InputPathToUrlTransformPlugin, type UserConfig } from '@11ty/eleventy';

export default function(eleventyConfig: UserConfig) {
  // Add essential Eleventy 3.x plugins
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPlugin(RenderPlugin);
  eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

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
  eleventyConfig.on('eleventy.before', async ({ runMode }: { runMode: string }) => {
    console.log(`🚀 Starting Eleventy build in ${runMode} mode...`);
  });

  eleventyConfig.on('eleventy.after', async ({ runMode }: { runMode: string }) => {
    console.log(`✅ Eleventy build completed in ${runMode} mode!`);
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
