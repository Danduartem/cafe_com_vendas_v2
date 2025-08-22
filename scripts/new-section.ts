#!/usr/bin/env tsx
/**
 * New Section - Scaffold New Section Structure
 *
 * Usage: npm run new:section <section-id>
 * Example: npm run new:section testimonials
 *
 * This creates all required files for a new section.
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const sectionId = process.argv[2];
if (!sectionId) {
  console.error('❌ Error: Please specify a section ID');
  console.log('\n💡 Usage: npm run new:section <section-id>');
  console.log('   Example: npm run new:section testimonials');
  process.exit(1);
}

// Validate section ID format
if (!/^[a-z]+(-[a-z]+)*$/.test(sectionId)) {
  console.error('❌ Error: Section ID must be kebab-case (lowercase with hyphens)');
  console.log('   Valid: hero, social-proof, final-cta');
  console.log('   Invalid: Hero, socialProof, final_cta');
  process.exit(1);
}

const sectionPath = join(projectRoot, 'src/_includes/sections', sectionId);
const anchor = `s-${sectionId}`;
const title = sectionId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

// Check if section already exists
if (existsSync(sectionPath)) {
  console.error(`❌ Error: Section '${sectionId}' already exists at ${sectionPath}`);
  process.exit(1);
}

console.log(`🔧 Scaffolding new section: ${title}`);
console.log(`📁 Path: src/_includes/sections/${sectionId}/`);

// Create directory
mkdirSync(sectionPath, { recursive: true });

// Template content
const templateContent = `{# ${sectionId}.njk - ${title} Section Template #}

<!-- ${title} Section Start -->
<section
  id="${anchor}"
  data-section="${sectionId}"
  class="relative w-full py-16 lg:py-20"
  aria-label="${title}"
>
  <div class="container mx-auto px-4">
    <div class="max-w-4xl mx-auto text-center">
      
      <!-- Section Header -->
      <h2 class="text-3xl lg:text-4xl font-lora font-bold text-navy-900 mb-6">
        ${title} Headline
      </h2>
      
      <p class="text-lg text-navy-700 mb-8">
        ${title} description goes here.
      </p>
      
      <!-- Section Content -->
      <div class="space-y-8">
        <!-- Add your content here -->
      </div>
      
    </div>
  </div>
</section>
<!-- ${title} Section End -->`;

// TypeScript content
const scriptContent = `/**
 * ${title} Section - Interactive Functionality
 * 
 * Handles all interactive elements and behaviors for the ${sectionId} section.
 */

import { safeQuery, safeQueryAll } from '@/utils/dom.js';

export const ${sectionId.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}Section = {
  /**
   * Initialize the ${sectionId} section
   */
  init(): void {
    this.bindEvents();
    this.setupAnalytics();
  },

  /**
   * Bind event listeners
   */
  bindEvents(): void {
    const section = safeQuery('#${anchor}');
    if (!section) return;

    // Add your event listeners here
    // Example:
    // const buttons = safeQueryAll('[data-action]', section);
    // buttons.forEach(button => {
    //   button.addEventListener('click', this.handleAction.bind(this));
    // });
  },

  /**
   * Setup analytics tracking
   */
  setupAnalytics(): void {
    const section = safeQuery('#${anchor}');
    if (!section) return;

    // Track section visibility
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.trackSectionView();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(section);
  },

  /**
   * Track section view
   */
  trackSectionView(): void {
    // Analytics implementation
    if (typeof gtag !== 'undefined') {
      gtag('event', '${sectionId}_section_view', {
        event_category: 'engagement',
        event_label: '${sectionId}',
      });
    }
  },

  /**
   * Handle user actions
   */
  handleAction(event: Event): void {
    const target = event.target as HTMLElement;
    const action = target.dataset.action;

    switch (action) {
      // Add your action handlers here
      default:
        console.warn('Unknown action:', action);
    }
  }
};`;

// Schema content
const schemaContent = `/**
 * ${title} Section - Content Schema
 * 
 * Defines the expected shape and validation for ${sectionId} section content.
 */

import { z } from 'zod';

/**
 * ${title} section content schema
 */
export const ${sectionId.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}Schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  isVisible: z.boolean().default(true),
  
  // Add your specific content fields here
  // Example:
  // items: z.array(z.object({
  //   title: z.string(),
  //   description: z.string(),
  //   image: z.string().url().optional()
  // })).optional()
});

export type ${title.replace(/\s+/g, '')}Content = z.infer<typeof ${sectionId.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}Schema>;

/**
 * Validate ${sectionId} content
 */
export function validate${title.replace(/\s+/g, '')}Content(data: unknown): ${title.replace(/\s+/g, '')}Content {
  return ${sectionId.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}Schema.parse(data);
}`;

// Analytics content
const analyticsContent = `/**
 * ${title} Section - Analytics Events
 * 
 * Centralized analytics event definitions and tracking helpers for ${sectionId} section.
 */

/**
 * Analytics event names for ${sectionId} section
 */
export const ${sectionId.toUpperCase().replace(/-/g, '_')}_EVENTS = {
  SECTION_VIEW: '${sectionId}_section_view',
  INTERACTION: '${sectionId}_interaction',
  // Add more events as needed
} as const;

/**
 * Track ${sectionId} section view
 */
export function track${title.replace(/\s+/g, '')}SectionView(): void {
  if (typeof gtag !== 'undefined') {
    gtag('event', ${sectionId.toUpperCase().replace(/-/g, '_')}_EVENTS.SECTION_VIEW, {
      event_category: 'engagement',
      event_label: '${sectionId}',
    });
  }
}

/**
 * Track ${sectionId} interaction
 */
export function track${title.replace(/\s+/g, '')}Interaction(action: string): void {
  if (typeof gtag !== 'undefined') {
    gtag('event', ${sectionId.toUpperCase().replace(/-/g, '_')}_EVENTS.INTERACTION, {
      event_category: 'interaction',
      event_label: \`${sectionId}_\${action}\`,
    });
  }
}`;

// README content
const readmeContent = `# ${title} Section

## Overview
The ${sectionId} section handles [describe the section's purpose].

## Files
- \`index.njk\` - Nunjucks template
- \`index.ts\` - TypeScript functionality  
- \`schema.ts\` - Content validation schema
- \`analytics.ts\` - Analytics event tracking
- \`README.md\` - This documentation

## Props
The section expects the following data structure:

\`\`\`typescript
{
  title: string;
  description?: string;
  isVisible: boolean;
  // Add more props as needed
}
\`\`\`

## Events
- \`${sectionId}_section_view\` - Fired when section comes into view
- \`${sectionId}_interaction\` - Fired on user interactions

## Development
\`\`\`bash
# Focus development on this section
npm run dev:section ${sectionId}

# Navigate to section in browser
http://localhost:8080#${anchor}
\`\`\`

## Design Requirements
- Use only Tailwind utility classes
- Include accessibility attributes
- Add analytics tracking to interactive elements
- Follow responsive design patterns
- Use design tokens from \`design/tokens.json\`

## Pitfalls & Notes
- [Document any gotchas or important considerations]
- Remember to add the section root contract: \`id="${anchor}"\` + \`data-section="${sectionId}"\`
- Test on mobile devices for responsive behavior
`;

// Write all files
writeFileSync(join(sectionPath, 'index.njk'), templateContent);
writeFileSync(join(sectionPath, 'index.ts'), scriptContent);
writeFileSync(join(sectionPath, 'schema.ts'), schemaContent);
writeFileSync(join(sectionPath, 'analytics.ts'), analyticsContent);
writeFileSync(join(sectionPath, 'README.md'), readmeContent);

console.log(`\n✅ Section '${sectionId}' scaffolded successfully!`);
console.log('\n📄 Created files:');
console.log('   ├── index.njk      (Template with section contract)');
console.log('   ├── index.ts       (TypeScript functionality)');
console.log('   ├── schema.ts      (Content validation)');
console.log('   ├── analytics.ts   (Event tracking)');
console.log('   └── README.md      (Documentation)');

console.log('\n🎯 Next Steps:');
console.log('   1. Update src/_includes/sections/manifest.ts');
console.log(`   2. Add to src/index.njk: {% include "sections/${sectionId}/index.njk" %}`);
console.log('   3. Import in src/assets/js/app.ts');
console.log(`   4. Test with: npm run dev:section ${sectionId}`);

console.log('\n💡 Quick commands:');
console.log(`   code src/_includes/sections/${sectionId}/`);
console.log(`   npm run dev:section ${sectionId}`);
console.log(`   http://localhost:8080#${anchor}`);