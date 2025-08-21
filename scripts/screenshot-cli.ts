#!/usr/bin/env node
/**
 * CLI tool for universal screenshots
 * Usage: npm run screenshot -- --url=https://example.com --output=screenshot.png
 */

import type { ScreenshotOptions } from './universal-screenshot.js';
import { takeScreenshotCLI } from './universal-screenshot.js';

interface CLIArgs {
  url?: string;
  output?: string;
  timeout?: number;
  retries?: number;
  'no-network-wait'?: boolean;
  'no-optimize'?: boolean;
  'section-overlap'?: number;
  help?: boolean;
}

function parseArgs(): CLIArgs {
  const args: CLIArgs = {};

  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

      if (value === undefined) {
        (args as Record<string, unknown>)[camelKey] = true;
      } else if (!isNaN(Number(value))) {
        (args as Record<string, unknown>)[camelKey] = Number(value);
      } else {
        (args as Record<string, unknown>)[camelKey] = value;
      }
    }
  });

  return args;
}

function showHelp() {
  console.log(`
🎯 Universal Screenshot CLI

Usage:
  npm run screenshot -- --url=<URL> --output=<filename>

Options:
  --url=<URL>              Website URL to screenshot (required)
  --output=<filename>      Output filename (default: screenshot.png)
  --timeout=<ms>          Timeout for full page attempts (default: 30000)
  --retries=<number>      Number of retry attempts (default: 3)
  --section-overlap=<px>  Overlap between sections (default: 100)
  --no-network-wait       Skip waiting for network idle
  --no-optimize          Skip page optimization
  --help                  Show this help message

Examples:
  npm run screenshot -- --url=http://localhost:8080 --output=my-site.png
  npm run screenshot -- --url=https://example.com --timeout=60000 --retries=5
  npm run screenshot -- --url=https://heavy-site.com --no-optimize --section-overlap=200
  `);
}

async function main() {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (!args.url) {
    console.error('❌ Error: --url parameter is required');
    console.log('Use --help for usage information');
    process.exit(1);
  }

  const output = args.output ?? 'screenshot.png';

  const options: ScreenshotOptions = {
    timeout: args.timeout,
    retries: args.retries,
    waitForNetworkIdle: !args['no-network-wait'],
    optimizePage: !args['no-optimize'],
    sectionOverlap: args['section-overlap']
  };

  try {
    console.log('🚀 Starting universal screenshot...');
    console.log(`   URL: ${args.url}`);
    console.log(`   Output: ${output}`);
    console.log('');

    const result = await takeScreenshotCLI(args.url, output, options);

    if (result.success) {
      console.log('');
      console.log('🎉 Screenshot completed successfully!');
      console.log(`   Type: ${result.type}`);
      console.log(`   Files: ${result.files.length}`);

      if (result.totalSections) {
        console.log(`   Sections: ${result.totalSections}`);
      }

      if (result.pageHeight) {
        console.log(`   Page height: ${result.pageHeight}px`);
      }

      console.log('');
      console.log('📁 Generated files:');
      result.files.forEach(file => console.log(`   - ${file}`));

    } else {
      console.error('');
      console.error('❌ Screenshot failed:');
      console.error(`   Error: ${result.error}`);
      process.exit(1);
    }

  } catch (error) {
    console.error('');
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}