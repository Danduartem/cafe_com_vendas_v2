const fs = require('fs');
const path = require('path');

// Load event metadata from the info directory
module.exports = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../info/DATA_event.json'), 'utf8')
);