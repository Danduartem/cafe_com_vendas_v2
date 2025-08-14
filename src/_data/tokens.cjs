const fs = require('fs');
const path = require('path');

// Load design tokens from info directory
const tokensData = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'info', 'DATA_design_tokens.json'),
    'utf-8'
  )
);

module.exports = tokensData;