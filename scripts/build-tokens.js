#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const root = process.cwd();
const tokensPath = path.join(root, 'content', 'pt-PT', 'design_tokens.json');
const outDir = path.join(root, 'src', 'assets', 'css');
const outFile = path.join(outDir, '_tokens.generated.css');

function toCssVars(obj, indent = '  ') {
  return Object.entries(obj)
    .filter(([k]) => k.startsWith('--'))
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join('\n');
}

function main() {
  try {
    // Load unified design tokens
    const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

    const themeHeader = `/* Generated from content/pt-PT/design_tokens.json. Do not edit directly. */\n/* Generated: ${new Date().toISOString()} */\n\n`;
    const themeBlocks = [];

    // Extract CSS variables from the unified tokens
    const cssVars = tokens.cssVariables || {};

    // :root block with all CSS custom properties
    if (Object.keys(cssVars).length > 0) {
      const rootVars = toCssVars(cssVars);
      themeBlocks.push(`:root {\n${rootVars}\n}`);
    }

    // Ensure output directory exists
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    // Write the generated CSS
    const output = themeHeader + themeBlocks.join('\n\n') + '\n';
    fs.writeFileSync(outFile, output);
    
    console.log(`✅ Design tokens compiled to ${outFile}`);
    console.log(`📊 Generated ${Object.keys(cssVars).length} CSS variables`);
  } catch (error) {
    console.error('❌ Error building tokens:', error.message);
    process.exit(1);
  }
}

main();