import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { TestimonialsData } from './types.js';

/**
 * Load testimonials data from JSON file
 * @returns Testimonials data for the page
 */
export default function(): TestimonialsData {
  const testimonialsPath = resolve(process.cwd(), 'content/pt-PT/testimonials.json');
  const testimonialsData = JSON.parse(readFileSync(testimonialsPath, 'utf-8')) as TestimonialsData;
  return testimonialsData;
}