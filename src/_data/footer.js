// Footer Data Layer - Loads footer-specific content and settings
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load footer data from content directory
const footerData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../content/pt-PT/footer.json'), 'utf8')
);

export default footerData;