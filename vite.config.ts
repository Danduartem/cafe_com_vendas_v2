import { defineConfig } from 'vite';
import { resolve } from 'path';
import compression from 'vite-plugin-compression';
import type { UserConfig } from 'vite';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/assets/js'),
      '@sections': resolve(__dirname, 'src/_includes/sections'),
      '@partials': resolve(__dirname, 'src/_includes/partials'),
      '@data': resolve(__dirname, 'src/_data'),
      '@platform': resolve(__dirname, 'src/platform'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@types': resolve(__dirname, 'src/assets/js/types')
    }
  },
  plugins: [
    // Only enable compression plugins in production mode
    ...(isProduction ? [
      // Enable gzip compression for production
      compression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
        compressionOptions: { level: 9 }
      }),
      // Enable brotli compression for modern browsers
      compression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
        compressionOptions: { level: 11 }
      })
    ] : [])
  ],
  build: {
    outDir: '_site/assets/js',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/assets/js/main.ts'),
      name: 'CafeComVendas',
      fileName: 'main',
      formats: ['iife'] // Self-executing function for browser compatibility
    },
    rollupOptions: {
      output: {
        // Ensure consistent file naming for library mode
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
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
    minify: isProduction ? 'terser' : false,
    terserOptions: {
      compress: {
        drop_console: isProduction,
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
  },
  // TypeScript specific options
  esbuild: {
    target: 'es2020'
  }
} satisfies UserConfig);