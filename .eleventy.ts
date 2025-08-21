// Load environment variables from .env.local for development
import 'dotenv/config';

export default function(eleventyConfig: any) {
  // Configure TypeScript support for data files
  eleventyConfig.addDataExtension('ts', {
    parser: async (contents: string, filePath: string) => {
      // Use dynamic import to load TypeScript files with tsx
      const module = await import(filePath);
      return typeof module.default === 'function' ? module.default() : module.default;
    }
  });
  // Eleventy 3.x ESM optimizations
  // Improved development server performance
  eleventyConfig.setServerOptions({
    port: 8080,
    showVersion: true
  });

  // Enhanced watch options for better development experience
  eleventyConfig.setWatchThrottleWaitTime(100);

  // Passthrough copy for static assets (css, fonts, pictures) - excluding js since Vite handles bundling
  eleventyConfig.addPassthroughCopy({ 'src/assets/css': 'assets/css' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/fonts': 'assets/fonts' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/pictures': 'assets/pictures' });
  // Public files to site root (favicons)
  eleventyConfig.addPassthroughCopy({ 'src/public': '/' });

  // Optimize build performance with Eleventy 3.x features
  eleventyConfig.setDataDeepMerge(true);

  // Add useful transforms for production optimization
  if (process.env.NODE_ENV === 'production') {
    // Minify HTML in production
    eleventyConfig.addTransform('htmlmin', function(content: any, outputPath: any) {
      if (outputPath && outputPath.endsWith('.html')) {
        return content
          .replace(/\s+/g, ' ')
          .replace(/>\s+</g, '><')
          .trim();
      }
      return content;
    });
  }

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
    // Optimize for modern ESM patterns
    dataTemplateEngine: 'njk'
  };
}
