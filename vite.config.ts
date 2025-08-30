import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  publicDir: resolve(__dirname, 'public'),
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/assets/js'),
      '@sections': resolve(__dirname, 'src/_includes/sections'), 
      '@components': resolve(__dirname, 'src/components'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@app-types': resolve(__dirname, 'src/types'),
      '@data': resolve(__dirname, 'src/_data'),
      '@test-mocks': resolve(__dirname, 'tests/mocks')
    }
  },
  
  plugins: [
    tailwindcss()
  ],
  
  // Dependency optimization with Vite 7 performance improvements
  optimizeDeps: {
    include: [
      'stripe'
    ],
    // Improve cold start performance by processing dependencies in parallel
    holdUntilCrawlEnd: false
  },
  
  build: {
    outDir: '_site/assets',
    emptyOutDir: true,
    target: 'es2023',
    minify: 'esbuild',
    // Disable compressed size reporting for faster builds
    reportCompressedSize: false,
    sourcemap: process.env.NODE_ENV === 'development',
    // CSS code splitting for faster initial load
    cssCodeSplit: true,
    // Improve asset handling for images
    assetsInlineLimit: 4096, // Inline assets < 4kb as base64
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/assets/js/main.ts'),
        styles: resolve(__dirname, 'src/assets/css/main.css')
      },
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Optimize asset file naming for better caching
          const info = assetInfo.name?.split('.');
          const ext = info?.[info.length - 1];
          if (ext && /png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name][extname]`;
          }
          if (ext === 'css') {
            return `css/[name][extname]`;
          }
          return `assets/[name][extname]`;
        },
        // Manual chunks for better code splitting
        manualChunks: {
          'vendor': ['stripe']
        }
      }
    }
  },
  
  css: {
    devSourcemap: process.env.NODE_ENV === 'development'
  },
  
  esbuild: {
    target: 'es2023'
  }
});