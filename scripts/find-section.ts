#!/usr/bin/env tsx
/**
 * Find Section - Instant Navigation to Section Files
 * 
 * Usage: npm run find:section <section-id>
 * Example: npm run find:section hero
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

interface SectionInfo {
  path: string;
  template: string;
  script: string;
  anchor: string;
  title: string;
}

type SectionMap = Record<string, SectionInfo>;

// Load the section manifest
try {
  const manifestPath = join(projectRoot, 'src/_includes/sections/manifest.ts');
  const manifestContent = readFileSync(manifestPath, 'utf-8');
  
  // Extract SECTIONS object (simple regex parsing for this case)
  const sectionsMatch = manifestContent.match(/export const SECTIONS: Record<SectionId, SectionConfig> = ({[\s\S]*?});/);
  if (!sectionsMatch) {
    throw new Error('Could not parse SECTIONS from manifest.ts');
  }

  const sectionId = process.argv[2];
  if (!sectionId) {
    console.error('❌ Error: Please specify a section ID');
    console.log('\n📋 Available sections:');
    console.log('   top-banner, hero, problem, solution, about, social-proof, offer, faq, final-cta, footer');
    console.log('\n💡 Usage: npm run find:section <section-id>');
    console.log('   Example: npm run find:section hero');
    process.exit(1);
  }

  // Simple section lookup (hardcoded for reliability)
  const sections: SectionMap = {
    'top-banner': {
      path: 'src/_includes/sections/top-banner',
      template: 'index.njk',
      script: 'index.ts',
      anchor: 's-top-banner',
      title: 'Top Banner'
    },
    'hero': {
      path: 'src/_includes/sections/hero',
      template: 'index.njk', 
      script: 'index.ts',
      anchor: 's-hero',
      title: 'Hero Section'
    },
    'problem': {
      path: 'src/_includes/sections/problem',
      template: 'index.njk',
      script: 'index.ts', 
      anchor: 's-problem',
      title: 'Problem & Pain Points'
    },
    'solution': {
      path: 'src/_includes/sections/solution',
      template: 'index.njk',
      script: 'index.ts',
      anchor: 's-solution', 
      title: 'Solution & Benefits'
    },
    'about': {
      path: 'src/_includes/sections/about',
      template: 'index.njk',
      script: 'index.ts',
      anchor: 's-about',
      title: 'About & Authority'
    },
    'social-proof': {
      path: 'src/_includes/sections/social-proof', 
      template: 'index.njk',
      script: 'index.ts',
      anchor: 's-social-proof',
      title: 'Social Proof & Testimonials'
    },
    'offer': {
      path: 'src/_includes/sections/offer',
      template: 'index.njk',
      script: 'index.ts',
      anchor: 's-offer',
      title: 'Offer & Pricing'
    },
    'faq': {
      path: 'src/_includes/sections/faq',
      template: 'index.njk', 
      script: 'index.ts',
      anchor: 's-faq',
      title: 'FAQ & Objections'
    },
    'final-cta': {
      path: 'src/_includes/sections/final-cta',
      template: 'index.njk',
      script: 'index.ts',
      anchor: 's-final-cta', 
      title: 'Final CTA'
    },
    'footer': {
      path: 'src/_includes/sections/footer',
      template: 'index.njk',
      script: 'index.ts',
      anchor: 's-footer',
      title: 'Footer'
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

  // Output section information
  console.log(`🎯 Section: ${section.title}`);
  console.log(`📁 Path: ${section.path}/`);
  console.log(`📄 Template: ${section.path}/${section.template}`);
  console.log(`⚡ Script: ${section.path}/${section.script}`);
  console.log(`🔗 Anchor: #${section.anchor}`);
  console.log(`\n💡 Quick access:`);
  console.log(`   code ${section.path}/${section.template}`);
  console.log(`   code ${section.path}/${section.script}`);

} catch (error) {
  console.error('❌ Error loading section manifest:', (error as Error).message);
  process.exit(1);
}