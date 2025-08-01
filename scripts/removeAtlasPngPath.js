// removeAtlasPngPath.js
// Script to remove all lines containing 'atlasPath' or 'pngPath' from public/data.json

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/data.json');

const lines = fs.readFileSync(filePath, 'utf8').split('\n');
const filtered = lines.filter(line => !line.includes('atlasPath') && !line.includes('pngPath'));
fs.writeFileSync(filePath, filtered.join('\n'), 'utf8');

console.log('Removed all lines containing atlasPath or pngPath from data.json'); 