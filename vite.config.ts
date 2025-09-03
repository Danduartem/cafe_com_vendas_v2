import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  publicDir: resolve(__dirname, 'public'),
  
  // Ultra-Simple Import Standard - no path aliases needed
  
  plugins: [
    tailwindcss()
  ],
  
  // Enhanced dependency optimization with Context7 best practices
  optimizeDeps: {
    include: [
      '@stripe/stripe-js' // Include only Stripe client SDK for browser
    ],
    // Optimize cold start performance - Context7 pattern
    holdUntilCrawlEnd: false, // Process dependencies in parallel
    // Force fresh optimization when needed
    force: false,
    // Enhanced esbuild options for better performance
    esbuildOptions: {
      target: 'es2023'
    }
  },
  
  build: {
    outDir: '_site',
    emptyOutDir: true,
    manifest: true,
    target: 'es2023',
    minify: 'esbuild', // Fastest minification option
    // Context7 performance optimizations
    reportCompressedSize: false, // Skip compression reporting for faster builds
    sourcemap: process.env.NODE_ENV === 'development',
    cssCodeSplit: true, // Enable CSS code splitting
    cssMinify: 'esbuild', // Use esbuild for CSS minification
    assetsInlineLimit: 4096, // Inline small assets
    // Enhanced chunk size warnings
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/assets/js/main.ts'),
        admin: resolve(__dirname, 'src/admin/dashboard/index.ts'),
        styles: resolve(__dirname, 'src/assets/css/main.css')
      },
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Optimize asset file naming for better caching
          if (!assetInfo.names || assetInfo.names.length === 0) {
            return `assets/[name]-[hash][extname]`;
          }
          const name = assetInfo.names[0];
          const ext = name.split('.').pop()?.toLowerCase();
          if (ext && /png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (ext === 'css') {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        // Enhanced manual chunks for optimal code splitting
        manualChunks: {
          vendor: ['@stripe/stripe-js']
        }
      }
    }
  },
  
  css: {
    devSourcemap: process.env.NODE_ENV === 'development',
    // Context7 performance enhancement for CSS preprocessing
    preprocessorMaxWorkers: true // Enable threaded CSS preprocessing
  },
  
  esbuild: {
    target: 'es2023'
  }
});
