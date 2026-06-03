const fs = require('fs');
const path = require('path');

const directory = 'c:/keerthi/projects/capstone/frontend/src';

const replacements = {
  'bg-[#0F0F1A]': 'bg-slate-50 dark:bg-[#0F0F1A]',
  'bg-[#13131f]': 'bg-white dark:bg-[#13131f]',
  'text-white': 'text-slate-900 dark:text-white',
  'bg-white/\\[0\\.03\\]': 'bg-white dark:bg-white/[0.03]',
  'bg-white/\\[0\\.01\\]': 'bg-slate-50 dark:bg-white/[0.01]',
  'bg-white/\\[0\\.02\\]': 'bg-white dark:bg-white/[0.02]',
  'bg-white/\\[0\\.04\\]': 'bg-slate-100 dark:bg-white/[0.04]',
  'border-white/\\[0\\.08\\]': 'border-slate-200 dark:border-white/[0.08]',
  'border-white/\\[0\\.06\\]': 'border-slate-200 dark:border-white/[0.06]',
  'border-white/\\[0\\.1\\]': 'border-slate-300 dark:border-white/[0.1]',
  'text-slate-400': 'text-slate-500 dark:text-slate-400',
  'text-slate-300': 'text-slate-700 dark:text-slate-300',
  'bg-black/20': 'bg-slate-100 dark:bg-black/20'
};

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
  
  for (const [find, replace] of Object.entries(replacements)) {
    // Only replace if it hasn't already been replaced (doesn't contain dark:)
    const regex = new RegExp(`(?<!dark:)${find}`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, replace);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
