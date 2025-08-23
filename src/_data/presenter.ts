import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { PresenterData } from './types';

/**
 * Load presenter data from JSON file
 * @returns Presenter information
 */
export default function(): PresenterData {
  const presenterPath = resolve(process.cwd(), 'content/pt-PT/presenter.json');
  const presenterData = JSON.parse(readFileSync(presenterPath, 'utf-8')) as PresenterData;
  return presenterData;
}