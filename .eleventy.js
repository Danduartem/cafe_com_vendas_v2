module.exports = function(eleventyConfig) {
  // Passthrough copy for all static assets (css, js, fonts, pictures)
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  // Public files to site root (favicons)
  eleventyConfig.addPassthroughCopy({ 'src/public': '/' });

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
};
