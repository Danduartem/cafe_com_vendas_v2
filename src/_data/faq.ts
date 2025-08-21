import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { FAQData } from './types.js';

/**
 * Load FAQ data from JSON file
 * @returns FAQ data for the page
 */
export default function(): FAQData {
  const faqPath = resolve(process.cwd(), 'content/pt-PT/faq.json');
  const faqData = JSON.parse(readFileSync(faqPath, 'utf-8')) as FAQData;
  return faqData;
}