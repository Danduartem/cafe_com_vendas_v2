import 'dotenv/config';
import 'tsx/esm';
import { HtmlBasePlugin, RenderPlugin } from '@11ty/eleventy';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const logger = {
  info: (...args) => console.info(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args)
};

export default function(eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPlugin(RenderPlugin);

  eleventyConfig.setServerOptions({
    port: 8080,
    showAllHosts: false,
    showVersion: false
  });

  // Utility filters
  eleventyConfig.addFilter('json', (data) => JSON.stringify(data));
  eleventyConfig.addFilter('jsonifyArray', (array) => JSON.stringify(array));
  eleventyConfig.addFilter('keys', (obj) => Object.keys(obj || {}));
  eleventyConfig.addFilter('values', (obj) => Object.values(obj || {}));

  eleventyConfig.addFilter('nl2br', (str) => {
    if (typeof str !== 'string') return str;
    const escaped = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    return escaped.replace(/\n/g, '<br>');
  });

  // Asset manifest resolver
  let manifestCache = null;
  const manifestPath = join(process.cwd(), '_site', '.vite', 'manifest.json');
  const fallbackMap = {
    'src/assets/js/main.ts': '/js/main.js',
    'src/admin/dashboard/index.ts': '/js/admin.js',
    'src/assets/css/main.css': '/assets/css/styles.css'
  };
  function readManifest() {
    if (manifestCache) return manifestCache;
    try {
      if (existsSync(manifestPath)) {
        const raw = readFileSync(manifestPath, 'utf-8');
        manifestCache = JSON.parse(raw);
        return manifestCache;
      }
    } catch (err) {
      console.warn('Failed to read Vite manifest:', err);
    }
    manifestCache = null;
    return manifestCache;
  }

  eleventyConfig.addFilter('asset', (entry) => {
    const key = String(entry);
    const manifest = readManifest();
    const rec = manifest ? manifest[key] : undefined;
    if (rec && rec.file) {
      return `/${rec.file}`;
    }
    return fallbackMap[key] || key;
  });

  // Support importing TypeScript data files
  eleventyConfig.addDataExtension('ts', {
    parser: async (_contents, filePath) => {
      const { pathToFileURL } = await import('node:url');
      const moduleUrl = pathToFileURL(filePath).href;
      try {
        const module = await import(moduleUrl);
        return typeof module.default === 'function' ? module.default() : module.default;
      } catch (error) {
        console.error(`Failed to load TypeScript data file ${filePath}:`, error);
        return {};
      }
    },
    read: false
  });

  eleventyConfig.addPassthroughCopy({ public: '.' });

  eleventyConfig.on('eleventy.before', () => {
    logger.info('🚀 Starting Eleventy build...', {
      event: 'before',
      timestamp: new Date().toISOString()
    });
  });
  eleventyConfig.on('eleventy.after', () => {
    logger.info('✅ Eleventy build completed!', {
      event: 'after',
      timestamp: new Date().toISOString()
    });
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
    templateFormats: ['html', 'njk', 'md']
  };
}
