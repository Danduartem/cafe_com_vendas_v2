import fs from 'fs';
import path from 'path';

// Load avatar/persona data from content directory
const avatarData = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'content', 'pt-PT', 'avatar.json'),
    'utf-8'
  )
);

export default avatarData;