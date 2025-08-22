import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import type { PageComposition, PagesData } from './types.ts';

export default function(): PagesData {
  const pagesDir = join(process.cwd(), 'content/pt-PT/pages');
  const pages: PagesData = {};

  try {
    const files = readdirSync(pagesDir).filter(file => file.endsWith('.json'));

    for (const file of files) {
      const filePath = join(pagesDir, file);
      const content = readFileSync(filePath, 'utf8');
      const pageData: PageComposition = JSON.parse(content);

      // Use filename without extension as key
      const key = file.replace('.json', '');
      pages[key] = pageData;
    }
  } catch (error) {
    console.warn('Could not load page compositions:', error);
  }

  return pages;
}