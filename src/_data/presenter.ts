import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { PresenterData } from './types.js';

/**
 * Load presenter data from JSON file
 * @returns Presenter data for the page
 */
export default function(): PresenterData {
  const presenterPath = resolve(process.cwd(), 'content/pt-PT/presenter.json');
  const presenterData = JSON.parse(readFileSync(presenterPath, 'utf-8')) as PresenterData;
  return presenterData;
}