const fs = require('fs');
const path = require('path');
const dir = 'Whit_day-master/Pages';

const noCache = [
  '    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">',
  '    <meta http-equiv="Pragma" content="no-cache">',
  '    <meta http-equiv="Expires" content="0">'
].join('\n');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
files.forEach(f => {
  const fp = path.join(dir, f);
  let c = fs.readFileSync(fp, 'utf8');
  if (c.includes('Cache-Control')) {
    console.log('SKIP (already has no-cache): ' + f);
    return;
  }
  const marker = '<meta charset="UTF-8">';
  c = c.replace(marker, marker + '\n' + noCache);
  fs.writeFileSync(fp, c, 'utf8');
  console.log('DONE: ' + f);
});
console.log('\nFinished.');
