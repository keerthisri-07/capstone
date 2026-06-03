const fs = require('fs');
const path = require('path');

const directory = 'c:/keerthi/projects/capstone/frontend/src';

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walkDir(directory);
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('bg-[#0F0F1A]') && !content.includes('dark:bg-[#0F0F1A]')) {
    content = content.replace(/bg-\[#0F0F1A\]/g, 'bg-slate-50 dark:bg-[#0F0F1A]');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
