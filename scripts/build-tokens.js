#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const tokensPath = path.join(root, 'info', 'design-tokens.json');
const outDir = path.join(root, 'src', 'assets', 'css');
const outFile = path.join(outDir, '_tokens.generated.css');

function toCssVars(obj, indent = '  ') {
  return Object.entries(obj)
    .filter(([k]) => k.startsWith('--'))
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join('\n');
}

function main() {
  // Load unified design tokens
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  
  const themeHeader = `/* Generated from design-tokens.json. Do not edit directly. */\n/* Generated: ${new Date().toISOString()} */\n\n`;
  const themeBlocks = [];

  // Extract CSS variables from the unified tokens
  const cssVars = tokens.cssVariables || {};
  
  // :root block with all CSS custom properties
  const rootVars = [];
  
  // Colors
  if (cssVars.colors) {
    rootVars.push('  /* Color Palette */');
    rootVars.push(toCssVars(cssVars.colors));
  }
  
  // Typography
  if (cssVars.typography) {
    rootVars.push('\n  /* Typography */');
    rootVars.push(toCssVars(cssVars.typography));
  }
  
  // Semantic tokens
  if (cssVars.semantic) {
    rootVars.push('\n  /* Semantic Tokens */');
    rootVars.push(toCssVars(cssVars.semantic));
  }
  
  themeBlocks.push(`:root {\n${rootVars.join('\n')}\n}`);

  // Note: @theme directive removed for compatibility
  // Tailwind will use the CSS custom properties from :root block above

  const css = themeHeader + themeBlocks.join('\n\n') + '\n';
  
  // Ensure output directory exists
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  fs.writeFileSync(outFile, css, 'utf8');
  console.log(`✅ Tokens generated: ${path.relative(root, outFile)}`);
}

main();
