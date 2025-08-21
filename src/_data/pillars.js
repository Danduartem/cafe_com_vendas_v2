import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load pillars data from content directory
const pillarsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../content/pt-PT/pillars.json'), 'utf8')
);

export default pillarsData;