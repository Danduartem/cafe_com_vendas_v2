import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { EventData } from './types.js';

/**
 * Load event data from JSON file
 * @returns Event data for the page
 */
export default function(): EventData {
  const eventPath = resolve(process.cwd(), 'info/DATA_event.json');
  const eventData = JSON.parse(readFileSync(eventPath, 'utf-8')) as EventData;
  return eventData;
}