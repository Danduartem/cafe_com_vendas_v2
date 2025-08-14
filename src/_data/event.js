import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load event metadata from the info directory
export default JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../info/DATA_event.json'), 'utf8')
);