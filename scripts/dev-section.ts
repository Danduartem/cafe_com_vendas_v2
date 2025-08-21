#!/usr/bin/env tsx
/**
 * Dev Section - Focus Development on Specific Section
 * 
 * Usage: npm run dev:section <section-id>
 * Example: npm run dev:section hero
 * 
 * This opens the section files and provides development guidance.
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

interface SectionConfig {
  path: string;
  template: string;
  script: string;
  anchor: string;
  title: string;
  description: string;
}

type SectionMap = Record<string, SectionConfig>;

const sectionId = process.argv[2];
if (!sectionId) {
  console.error('❌ Error: Please specify a section ID');
  console.log('\n📋 Available sections:');
  console.log('   top-banner, hero, problem, solution, about, social-proof, offer, faq, final-cta, footer');
  console.log('\n💡 Usage: npm run dev:section <section-id>');
  console.log('   Example: npm run dev:section hero');
  process.exit(1);
}

// Section definitions
const sections: SectionMap = {
  'top-banner': {
    path: 'src/_includes/sections/top-banner',
    template: 'index.njk',
    script: 'index.ts',
    anchor: 's-top-banner',
    title: 'Top Banner',
    description: 'Urgency messaging and event countdown'
  },
  'hero': {
    path: 'src/_includes/sections/hero',
    template: 'index.njk', 
    script: 'index.ts',
    anchor: 's-hero',
    title: 'Hero Section',
    description: 'Main headline, value proposition, and primary CTA'
  },
  'problem': {
    path: 'src/_includes/sections/problem',
    template: 'index.njk',
    script: 'index.ts', 
    anchor: 's-problem',
    title: 'Problem & Pain Points',
    description: 'Pain validation and problem agitation'
  },
  'solution': {
    path: 'src/_includes/sections/solution',
    template: 'index.njk',
    script: 'index.ts',
    anchor: 's-solution', 
    title: 'Solution & Benefits',
    description: '5 pillars approach and transformation promise'
  },
  'about': {
    path: 'src/_includes/sections/about',
    template: 'index.njk',
    script: 'index.ts',
    anchor: 's-about',
    title: 'About & Authority',
    description: 'Presenter credibility and authority building'
  },
  'social-proof': {
    path: 'src/_includes/sections/social-proof', 
    template: 'index.njk',
    script: 'index.ts',
    anchor: 's-social-proof',
    title: 'Social Proof & Testimonials',
    description: 'Customer testimonials and success stories'
  },
  'offer': {
    path: 'src/_includes/sections/offer',
    template: 'index.njk',
    script: 'index.ts',
    anchor: 's-offer',
    title: 'Offer & Pricing',
    description: 'Event details, pricing, and guarantee'
  },
  'faq': {
    path: 'src/_includes/sections/faq',
    template: 'index.njk', 
    script: 'index.ts',
    anchor: 's-faq',
    title: 'FAQ & Objections',
    description: 'Frequently asked questions and objection handling'
  },
  'final-cta': {
    path: 'src/_includes/sections/final-cta',
    template: 'index.njk',
    script: 'index.ts',
    anchor: 's-final-cta', 
    title: 'Final CTA',
    description: 'Urgency close and final call to action'
  },
  'footer': {
    path: 'src/_includes/sections/footer',
    template: 'index.njk',
    script: 'index.ts',
    anchor: 's-footer',
    title: 'Footer',
    description: 'Footer links, legal information, and contact'
  }
};

const section = sections[sectionId];
if (!section) {
  console.error(`❌ Error: Unknown section '${sectionId}'`);
  console.log('\n📋 Available sections:');
  Object.keys(sections).forEach(id => {
    console.log(`   ${id} - ${sections[id].title}`);
  });
  process.exit(1);
}

console.log(`🚀 Development Focus: ${section.title}`);
console.log(`📝 ${section.description}`);
console.log(`\n📁 Section Files:`);

// Check which files exist
const templatePath = join(projectRoot, section.path, section.template);
const scriptPath = join(projectRoot, section.path, section.script);
const schemaPath = join(projectRoot, section.path, 'schema.ts');
const analyticsPath = join(projectRoot, section.path, 'analytics.ts');
const readmePath = join(projectRoot, section.path, 'README.md');

console.log(`   📄 Template: ${section.path}/${section.template} ${existsSync(templatePath) ? '✅' : '❌'}`);
console.log(`   ⚡ Script: ${section.path}/${section.script} ${existsSync(scriptPath) ? '✅' : '❌'}`);
console.log(`   🔧 Schema: ${section.path}/schema.ts ${existsSync(schemaPath) ? '✅' : '❌'}`);
console.log(`   📊 Analytics: ${section.path}/analytics.ts ${existsSync(analyticsPath) ? '✅' : '❌'}`);
console.log(`   📚 README: ${section.path}/README.md ${existsSync(readmePath) ? '✅' : '❌'}`);

console.log(`\n🎯 Development Commands:`);
console.log(`   # Open section files`);
console.log(`   code ${section.path}/`);
console.log(`   \n   # Start development server`);
console.log(`   npm run dev`);
console.log(`   \n   # Navigate to section in browser`);
console.log(`   http://localhost:8080#${section.anchor}`);

console.log(`\n🔧 Section Development Guidelines:`);
console.log(`   1. Template must have: id="${section.anchor}" data-section="${sectionId}"`);
console.log(`   2. Use only Tailwind utilities (no inline styles)`);
console.log(`   3. Add data-analytics-event for tracking`);
console.log(`   4. Include accessibility attributes (aria-label, etc.)`);
console.log(`   5. Use design tokens from DATA_design_tokens.json`);

if (!existsSync(templatePath) || !existsSync(scriptPath)) {
  console.log(`\n⚠️  Missing files detected. Run to scaffold:`);
  console.log(`   npm run new:section ${sectionId}`);
}