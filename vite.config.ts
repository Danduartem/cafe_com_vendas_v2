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
  
  build: {
    outDir: '_site/assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/assets/js/main.ts'),
        styles: resolve(__dirname, 'src/assets/css/main.css')
      },
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    },
    target: 'es2022',
    sourcemap: process.env.NODE_ENV === 'development'
  },
  
  // Vite 7 optimized dependency handling
  optimizeDeps: {
    include: ['stripe']
  },
  
  // Simplified CSS configuration
  css: {
    devSourcemap: process.env.NODE_ENV === 'development'
  },
  
  esbuild: {
    target: 'es2022'
  }
});