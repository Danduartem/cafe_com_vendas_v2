import fs from 'fs';
import path from 'path';

// Load design tokens from content directory
const tokensData = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'content', 'pt-PT', 'design_tokens.json'),
    'utf-8'
  )
);

export default tokensData;