const fs = require('fs');
const path = require('path');

// Load avatar/persona data from info directory
const avatarData = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'info', 'DATA_avatar.json'),
    'utf-8'
  )
);

module.exports = avatarData;