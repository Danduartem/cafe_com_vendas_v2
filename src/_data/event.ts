import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { EventData } from './types';

/**
 * Load event data from JSON file
 * @returns Event information
 */
export default function(): EventData {
  const eventPath = resolve(process.cwd(), 'content/pt-PT/event.json');
  const eventData = JSON.parse(readFileSync(eventPath, 'utf-8')) as EventData;
  return eventData;
}