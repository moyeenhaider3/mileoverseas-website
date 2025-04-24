// Script to append ES module export default to each translation file
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname);
fs.readdirSync(dir).filter(f => f.endsWith('.js') && f !== 'localization.js' && f !== 'addExports.js')
  .forEach(file => {
    const lang = path.basename(file, '.js');
    const varName = `${lang}Translations`;
    const filePath = path.join(dir, file);
    fs.appendFileSync(filePath, `\nexport default ${varName};\n`);
    console.log(`Appended export to ${file}`);
  });
