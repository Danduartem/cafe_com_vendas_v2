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
        // Ensure consistent file naming
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    // Enable source maps for development
    sourcemap: process.env.NODE_ENV === 'development',
    // Minify in production
    minify: process.env.NODE_ENV === 'production'
  },
  // Development server settings (if needed)
  server: {
    watch: {
      include: ['src/assets/js/**']
    }
  }
});