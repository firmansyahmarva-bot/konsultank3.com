import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');

function getAllFiles(dir, ext) {
  let res = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) res = res.concat(getAllFiles(full, ext));
    else if (item.name.endsWith(ext)) res.push(full);
  }
  return res;
}

const htmlFiles = getAllFiles(distDir, '.html');
const allExistingUrls = new Set();
htmlFiles.forEach(f => {
  let rel = path.relative(distDir, f).replace(/\\/g, '/');
  if (rel === 'index.html') allExistingUrls.add('/');
  else if (rel.endsWith('/index.html')) allExistingUrls.add('/' + rel.replace('/index.html', '/'));
  else allExistingUrls.add('/' + rel);
});

const brokenNavLinks = [];
const extLinks = [];
const brokenAnchors = [];

for (const file of htmlFiles) {
  const relFile = path.relative(distDir, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');

  // Match only <a ... href="..."
  const aRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = aRegex.exec(html)) !== null) {
    const href = match[1];

    if (
      href.startsWith('tel:') ||
      href.startsWith('mailto:') ||
      href.startsWith('javascript:') ||
      href.includes('wa.me')
    ) {
      continue;
    }

    if (href.startsWith('http://') || href.startsWith('https://')) {
      extLinks.push({ file: relFile, href });
    } else if (href.startsWith('#')) {
      if (href !== '#' && !html.includes(`id="${href.slice(1)}"`)) {
        brokenAnchors.push({ file: relFile, anchor: href });
      }
    } else {
      let cleanHref = href.split('#')[0].split('?')[0];
      if (!cleanHref) continue;

      if (!allExistingUrls.has(cleanHref)) {
        if (!allExistingUrls.has(cleanHref + '/') && !allExistingUrls.has(cleanHref.replace(/\/$/, ''))) {
          brokenNavLinks.push({ file: relFile, target: href });
        }
      }
    }
  }
}

console.log('=== REAL BROKEN NAVIGATION LINKS (<a href="...">) ===');
if (brokenNavLinks.length === 0) {
  console.log('✓ 0 broken internal navigation links!');
} else {
  brokenNavLinks.forEach(b => console.log(`❌ In [${b.file}] -> target not found: "${b.target}"`));
}

console.log('\n=== BROKEN IN-PAGE ANCHORS (<a href="#...">) ===');
if (brokenAnchors.length === 0) {
  console.log('✓ 0 broken anchors!');
} else {
  brokenAnchors.forEach(b => console.log(`❌ In [${b.file}] -> #${b.anchor} not found on page`));
}

console.log('\n=== EXTERNAL LINKS (<a href="https://...">) ===');
const extMap = new Map();
for (const e of extLinks) {
  if (!extMap.has(e.href)) extMap.set(e.href, []);
  extMap.get(e.href).push(e.file);
}

for (const [url, flist] of extMap.entries()) {
  console.log(`🔗 ${url} (${flist.length} times):`);
  flist.slice(0, 3).forEach(f => console.log(`   └─ in ${f}`));
  if (flist.length > 3) console.log(`   └─ ... and ${flist.length - 3} more`);
}
