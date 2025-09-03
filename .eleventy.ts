import 'dotenv/config';
import 'tsx/esm';
import { HtmlBasePlugin, RenderPlugin, type UserConfig } from '@11ty/eleventy';
import { logger } from './src/utils/logger.ts';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export default function(eleventyConfig: UserConfig) {
  // Enhanced Eleventy 3.x configuration with Context7 best practices
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPlugin(RenderPlugin);

  // Enhanced development server configuration - Context7 patterns
  eleventyConfig.setServerOptions({
    port: 8080,
    // Basic performance optimizations (TypeScript-safe)
    showAllHosts: false,
    showVersion: false
  });

  // Enhanced watch and passthrough configuration with Context7 optimizations
  // Note: Advanced API methods may not be available in current TypeScript definitions
  // These optimizations can be applied when TypeScript definitions are updated:
  // - setServerPassthroughCopyBehavior('passthrough')
  // - setDynamicPermalinks(false)
  // - setLayoutResolution(false)

  // Utility filters
  // Basic JSON stringify
  eleventyConfig.addFilter('json', (data: unknown) => JSON.stringify(data));

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

  // Asset manifest resolver (for Vite hashed filenames)
  // Usage in templates: {{ 'src/assets/js/main.ts' | asset }}
  let manifestCache: Record<string, { file: string; css?: string[] }> | null = null;
  // Vite v7 writes manifest to .vite/manifest.json inside outDir
  const manifestPath = join(process.cwd(), '_site', '.vite', 'manifest.json');
  const fallbackMap: Record<string, string> = {
    'src/assets/js/main.ts': '/js/main.js',
    'src/admin/dashboard/index.ts': '/js/admin.js',
    'src/assets/css/main.css': '/assets/css/styles.css'
  };

  function readManifest(): typeof manifestCache {
    if (manifestCache) return manifestCache;
    try {
      if (existsSync(manifestPath)) {
        const raw = readFileSync(manifestPath, 'utf-8');
        manifestCache = JSON.parse(raw) as Record<string, { file: string; css?: string[] }>;
        return manifestCache;
      }
    } catch (err) {
      console.warn('Failed to read Vite manifest:', err);
    }
    manifestCache = null;
    return manifestCache;
  }

  eleventyConfig.addFilter('asset', (entry: unknown) => {
    const key = String(entry);
    const manifest = readManifest();
    const rec = manifest ? manifest[key] : undefined;
    if (rec?.file) {
      return `/${rec.file}`;
    }
    // Fallback to non-hashed paths for dev convenience
    return fallbackMap[key] || key;
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

  // Static asset handling - delegate CSS/JS to Vite build output
  // Note: Keep only additional static assets here (images if any)
  // eleventyConfig.addPassthroughCopy({ 'src/assets/static/images': 'assets/pictures' });
  
  // Copy public directory to root for favicon and fonts (Eleventy 3.x best practice)
  eleventyConfig.addPassthroughCopy({ 'public': '.' });

  // Enhanced build events with Context7 async patterns
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
