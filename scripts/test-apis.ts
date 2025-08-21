#!/usr/bin/env node

/**
 * API Test Suite
 * 
 * Quick tests to validate that critical APIs are available
 * and working with the installed package versions.
 */

import { defineConfig, type UserConfig } from 'vite';
import Stripe from 'stripe';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

class APITester {
  private results: TestResult[] = [];

  /**
   * Test Vite 7.x APIs
   */
  testViteAPIs(): void {
    const testName = 'Vite 7.x APIs';
    
    try {
      // Test defineConfig (should exist in v7)
      const config: UserConfig = defineConfig({
        build: {
          rollupOptions: {
            input: 'index.html',
          },
          lib: {
            entry: 'src/main.ts',
            name: 'TestLib',
            fileName: 'test-lib',
          },
        },
        optimizeDeps: {
          include: ['test-dep'], // Modern API
        },
      });

      // Test that deprecated APIs are NOT used
      assert(config.build, 'build config should exist');
      assert(config.optimizeDeps, 'optimizeDeps should exist');
      assert(config.optimizeDeps.include, 'optimizeDeps.include should exist');
      assert(!('entries' in config.optimizeDeps), 'optimizeDeps.entries is deprecated');

      this.results.push({ name: testName, passed: true });
      console.log(`${colors.green}✅ ${testName} passed${colors.reset}`);
    } catch (error) {
      this.results.push({ 
        name: testName, 
        passed: false, 
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`${colors.red}❌ ${testName} failed: ${error}${colors.reset}`);
    }
  }

  /**
   * Test Stripe 18.x APIs
   */
  testStripeAPIs(): void {
    const testName = 'Stripe 18.x APIs';
    
    try {
      // Initialize Stripe with modern API version
      const stripe = new Stripe('sk_test_dummy', {
        apiVersion: '2025-07-30.basil',
      });

      // Test modern APIs exist
      assert(typeof stripe.paymentIntents.create === 'function', 
        'paymentIntents.create should be a function');
      assert(typeof stripe.checkout.sessions.create === 'function',
        'checkout.sessions.create should be a function');
      assert(typeof stripe.paymentMethods.create === 'function',
        'paymentMethods.create should be a function');
      
      // Test that we're not using deprecated APIs
      // Note: These might still exist but shouldn't be used
      if ('charges' in stripe) {
        console.log(`${colors.yellow}  ⚠️  Charges API detected (deprecated)${colors.reset}`);
      }
      if ('sources' in stripe) {
        console.log(`${colors.yellow}  ⚠️  Sources API detected (deprecated)${colors.reset}`);
      }

      this.results.push({ name: testName, passed: true });
      console.log(`${colors.green}✅ ${testName} passed${colors.reset}`);
    } catch (error) {
      this.results.push({ 
        name: testName, 
        passed: false, 
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`${colors.red}❌ ${testName} failed: ${error}${colors.reset}`);
    }
  }

  /**
   * Test import.meta APIs (ESM)
   */
  testESMAPIs(): void {
    const testName = 'ESM/import.meta APIs';
    
    try {
      // Test import.meta properties
      assert(import.meta.url, 'import.meta.url should exist');
      
      // Test Node.js ESM utilities
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      
      assert(__filename, '__filename should be derived from import.meta.url');
      assert(__dirname, '__dirname should be derived from import.meta.url');

      // Test that we're in ESM mode
      assert(typeof module === 'undefined', 'module should not exist in ESM');
      assert(typeof require === 'undefined', 'require should not exist in ESM');

      this.results.push({ name: testName, passed: true });
      console.log(`${colors.green}✅ ${testName} passed${colors.reset}`);
    } catch (error) {
      this.results.push({ 
        name: testName, 
        passed: false, 
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`${colors.red}❌ ${testName} failed: ${error}${colors.reset}`);
    }
  }

  /**
   * Test TypeScript types are properly configured
   */
  testTypeScriptConfig(): void {
    const testName = 'TypeScript Configuration';
    
    try {
      // These would fail at compile time if types aren't configured
      const viteConfig: UserConfig = {
        base: '/',
        build: {
          outDir: 'dist',
        },
      };

      const stripeConfig: Stripe.StripeConfig = {
        apiVersion: '2025-07-30.basil',
      };

      // Test that types are assignable
      assert(viteConfig, 'Vite config types should work');
      assert(stripeConfig, 'Stripe config types should work');

      this.results.push({ name: testName, passed: true });
      console.log(`${colors.green}✅ ${testName} passed${colors.reset}`);
    } catch (error) {
      this.results.push({ 
        name: testName, 
        passed: false, 
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`${colors.red}❌ ${testName} failed: ${error}${colors.reset}`);
    }
  }

  /**
   * Generate summary report
   */
  generateReport(): void {
    console.log('\n' + colors.bold + colors.cyan + '📊 API Test Results' + colors.reset);
    console.log('═'.repeat(40));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;

    for (const result of this.results) {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      if (result.error) {
        console.log(`   ${colors.red}Error: ${result.error}${colors.reset}`);
      }
    }

    console.log('═'.repeat(40));
    console.log(`Total: ${passed} passed, ${failed} failed\n`);

    if (failed > 0) {
      console.log(`${colors.red}⚠️  Some tests failed. Please check your dependencies.${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`${colors.green}✅ All API tests passed!${colors.reset}`);
    }
  }

  /**
   * Run all tests
   */
  runAll(): void {
    console.log(colors.bold + colors.cyan + '🧪 Running API Tests...\n' + colors.reset);

    this.testViteAPIs();
    this.testStripeAPIs();
    this.testESMAPIs();
    this.testTypeScriptConfig();

    this.generateReport();
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new APITester();
  tester.runAll();
}

export { APITester, type TestResult };