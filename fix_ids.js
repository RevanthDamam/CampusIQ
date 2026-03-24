const fs = require('fs');
const path = require('path');

function replaceInFiles(dir, searchValue, replaceValue) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInFiles(fullPath, searchValue, replaceValue);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(searchValue)) {
        content = content.replace(new RegExp('\\._id', 'g'), replaceValue);
        fs.writeFileSync(fullPath, content);
        console.log(`Replaced in ${fullPath}`);
      }
    }
  }
}

replaceInFiles('./client/src', '._id', '.id');
console.log('Done!');
