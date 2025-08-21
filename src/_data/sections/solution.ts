import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { SolutionSection } from '../types.js';

/**
 * Validate basic section structure
 */
function validateSectionBase(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const section = data as Record<string, unknown>;

  const validSlugs = [
    'top-banner', 'hero', 'problem', 'solution', 'about',
    'social-proof', 'offer', 'faq', 'final-cta', 'footer'
  ];

  return (
    typeof section.id === 'string' && validSlugs.includes(section.id) &&
    (section.variant === undefined || typeof section.variant === 'string') &&
    (section.enabled === undefined || typeof section.enabled === 'boolean')
  );
}

/**
 * Load solution section data from JSON file with validation
 * @returns Validated solution section data for the page
 */
export default function(): SolutionSection {
  const solutionPath = resolve(process.cwd(), 'content/pt-PT/sections/solution.json');
  const rawData = JSON.parse(readFileSync(solutionPath, 'utf-8'));

  // Validate the data at build time - fails fast if content is invalid
  if (!validateSectionBase(rawData)) {
    throw new Error(`Invalid solution section base properties: ${JSON.stringify(rawData, null, 2)}`);
  }

  if (rawData.id !== 'solution') {
    throw new Error(`Expected solution section, got: ${rawData.id}`);
  }

  return rawData as SolutionSection;
}