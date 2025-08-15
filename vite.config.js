import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: '_site/assets/js',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/assets/js/main.js'),
      name: 'CafeComVendas',
      fileName: 'main',
      formats: ['iife'] // Self-executing function for browser compatibility
    },
    rollupOptions: {
      output: {
        // Ensure consistent file naming with chunking for better caching
        entryFileNames: '[name].[hash].js',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: '[name].[hash].[ext]',
        // Manual chunk splitting for better caching (vendor vs app code)
        manualChunks: {
          // Split large utilities into separate chunks
          'utils': ['src/assets/js/utils/index.js'],
          'components': [
            'src/assets/js/components/hero.js',
            'src/assets/js/components/checkout.js',
            'src/assets/js/components/testimonials.js'
          ]
        }
      },
      // Enhanced tree-shaking for maximum bundle reduction
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      }
    },
    // Enable source maps for development
    sourcemap: process.env.NODE_ENV === 'development',
    // Minify in production with latest terser options
    minify: process.env.NODE_ENV === 'production' ? 'terser' : false,
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn']
      },
      format: {
        comments: false
      }
    },
    // Optimize chunk size splitting
    chunkSizeWarningLimit: 1000,
    // Target modern browsers for better optimization
    target: ['es2020', 'chrome80', 'firefox80', 'safari14']
  },
  // Development server settings optimized for Vite 7.x
  server: {
    watch: {
      include: ['src/assets/js/**']
    },
    // Enable hot reload for better dev experience
    hmr: {
      overlay: true
    }
  },
  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: [],
    exclude: []
  },
  // Enable advanced CSS code splitting
  css: {
    devSourcemap: process.env.NODE_ENV === 'development'
  }
});