import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load legal data from content directory
const legalData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../content/pt-PT/legal.json'), 'utf8')
);

export default legalData;