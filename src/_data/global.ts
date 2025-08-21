import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { GlobalStrings } from './types.js';

/**
 * Load global strings from JSON file
 * @returns Global strings for the site
 */
export default function(): GlobalStrings {
  const globalPath = resolve(process.cwd(), 'content/pt-PT/strings/global.json');
  const globalData = JSON.parse(readFileSync(globalPath, 'utf-8')) as GlobalStrings;
  return globalData;
}