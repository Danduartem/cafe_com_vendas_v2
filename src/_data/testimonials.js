// Testimonials data for social proof section

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load testimonials data from content directory
const testimonialsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../content/pt-PT/testimonials.json'), 'utf8')
);

export default testimonialsData;