const fs = require('fs');
const path = require('path');

// Script to split data.json into per-language JSON files
const dataPath = path.join(__dirname, 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
Object.keys(data).forEach(lang => {
  const outFile = path.join(__dirname, `data.${lang}.json`);
  fs.writeFileSync(outFile, JSON.stringify(data[lang], null, 2));
  console.log(`Created ${outFile}`);
});
