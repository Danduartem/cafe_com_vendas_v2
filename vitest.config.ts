/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // ── Performance Configuration ──
    pool: 'threads',
    fileParallelism: true,
    
    // ── Test Environment ──
    environment: 'happy-dom',
    globals: true,
    
    // ── Test Discovery ──
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    exclude: [
      '**/node_modules/**',
      '_site/**',
      'tests/visual/**',
      'tests/e2e/**', // Exclude Playwright e2e tests from Vitest
      'netlify/**'
    ],
    
    // ── Setup Configuration ──
    setupFiles: ['./tests/setup.ts'],
    
    // ── Timeouts ──
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // ── Coverage Configuration ──
    coverage: {
      provider: 'v8',
      enabled: false,
      include: ['src/**/*.{js,ts}'],
      exclude: [
        'src/**/*.d.ts',
        'src/_data/**',
        'src/pages/**',
        'tests/**'
      ],
      reporter: ['text', 'html'],
      reportsDirectory: './coverage'
    }
  },
  
  // ── Module Resolution ──
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
  
  // ── Build Configuration ──
  esbuild: {
    target: 'es2023'
  }
});