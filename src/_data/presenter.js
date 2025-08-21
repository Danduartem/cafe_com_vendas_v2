// Presenter data for the About section
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load presenter data from content directory
const presenterData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../content/pt-PT/presenter.json'), 'utf8')
);

export default presenterData;