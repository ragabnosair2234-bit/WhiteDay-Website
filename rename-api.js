const fs = require('fs');
const path = require('path');
const dir = 'Whit_day-master/Pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
let count = 0;
files.forEach(f => {
  const fp = path.join(dir, f);
  let c = fs.readFileSync(fp, 'utf8');
  // Replace any api.js reference (with or without ?v=N) with api-v5.js
  const updated = c.replace(/api\.js(\?v=\d+)?/g, 'api-v5.js');
  if (updated !== c) {
    fs.writeFileSync(fp, updated, 'utf8');
    count++;
    console.log('DONE: ' + f);
  } else {
    console.log('SKIP: ' + f + ' (no api.js reference)');
  }
});
console.log('\nUpdated ' + count + ' files to use api-v5.js');
