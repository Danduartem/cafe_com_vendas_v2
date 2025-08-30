/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

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
  
  // ── Ultra-Simple Import Standard (no path aliases needed) ──
  
  // ── Build Configuration ──
  esbuild: {
    target: 'es2023'
  }
});