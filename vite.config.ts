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
      '@assets': resolve(__dirname, 'src/assets')
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
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/assets/js/main.ts'),
        styles: resolve(__dirname, 'src/assets/css/main.css')
      },
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: 'css/[name].[ext]'
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