import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const srcDir = path.join(rootDir, 'src');

let hasErrors = false;

// 1. Check ! test -d _legacy_backup
console.log('--- 1. Checking _legacy_backup directory absence ---');
const legacyBackupPath = path.join(rootDir, '_legacy_backup');
if (fs.existsSync(legacyBackupPath)) {
  console.error('❌ FAILED: _legacy_backup directory exists!');
  hasErrors = true;
} else {
  console.log('✓ _legacy_backup does not exist.');
}

// 2. Check ! grep -rn 'Tersisa' src
console.log('\n--- 2. Checking for forbidden string "Tersisa" in src/ ---');
function scanForForbidden(dir, term) {
  const matches = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      matches.push(...scanForForbidden(fullPath, term));
    } else if (entry.isFile()) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(term)) {
        matches.push(path.relative(rootDir, fullPath));
      }
    }
  }
  return matches;
}

const tersisaMatches = scanForForbidden(srcDir, 'Tersisa');
if (tersisaMatches.length > 0) {
  console.error(`❌ FAILED: Found "Tersisa" in files:\n${tersisaMatches.map(f => `  - ${f}`).join('\n')}`);
  hasErrors = true;
} else {
  console.log('✓ No occurrences of "Tersisa" found in src/.');
}

// Helper to collect all HTML files
function getAllFiles(dir, ext) {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) res = res.concat(getAllFiles(full, ext));
    else if (item.name.endsWith(ext)) res.push(full);
  }
  return res;
}

// Helper for counting words
function countWords(text) {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

// 3. Check Pillars Word Count, Required Phrases & Inbound Links
console.log('\n--- 3. Checking 4 Pillar Pages ---');
const targetPillars = [
  { id: 'kebisingan', path: '/program-pengendalian-kebisingan/', file: path.join(distDir, 'program-pengendalian-kebisingan', 'index.html') },
  { id: 'apd', path: '/alat-pelindung-diri/', file: path.join(distDir, 'alat-pelindung-diri', 'index.html') },
  { id: 'pak', path: '/penyakit-akibat-kerja/', file: path.join(distDir, 'penyakit-akibat-kerja', 'index.html') },
  { id: 'smk3', path: '/panduan-penerapan-smk3/', file: path.join(distDir, 'panduan-penerapan-smk3', 'index.html') }
];

// Read all HTML files in distDir to compute inbound links
const allHtmlFiles = getAllFiles(distDir, '.html');
const linkCounts = new Map();

for (const htmlFile of allHtmlFiles) {
  const content = fs.readFileSync(htmlFile, 'utf8');
  const aRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = aRegex.exec(content)) !== null) {
    let href = match[1].split('#')[0].split('?')[0].trim();
    if (!href) continue;
    if (href.startsWith('https://konsultank3.com')) {
      href = href.replace('https://konsultank3.com', '');
    }
    if (!href.startsWith('/')) continue;

    const norm = href;
    linkCounts.set(norm, (linkCounts.get(norm) || 0) + 1);
    if (norm.endsWith('/')) {
      const noSlash = norm.slice(0, -1);
      linkCounts.set(noSlash, (linkCounts.get(noSlash) || 0) + 1);
    } else {
      const withSlash = norm + '/';
      linkCounts.set(withSlash, (linkCounts.get(withSlash) || 0) + 1);
    }
  }
}

for (const pillar of targetPillars) {
  console.log(`\nEvaluating Pillar: ${pillar.path}`);
  const htmlPath = fs.existsSync(pillar.file) ? pillar.file : path.join(rootDir, pillar.path.replace(/^\//, ''), 'index.html');
  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ FAILED: Pillar HTML file not found: ${htmlPath}`);
    hasErrors = true;
    continue;
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  
  // Word count (>= 1200)
  const words = countWords(html);
  if (words < 1200) {
    console.error(`❌ FAILED: Word count is ${words} (< 1200 words)`);
    hasErrors = true;
  } else {
    console.log(`  ✓ Word count: ${words} (>= 1200)`);
  }

  // Contains "Daftar Pustaka"
  if (!html.includes('Daftar Pustaka')) {
    console.error(`❌ FAILED: Does not contain "Daftar Pustaka"`);
    hasErrors = true;
  } else {
    console.log(`  ✓ Contains "Daftar Pustaka"`);
  }

  // Contains "Terakhir diperbarui"
  if (!html.includes('Terakhir diperbarui')) {
    console.error(`❌ FAILED: Does not contain "Terakhir diperbarui"`);
    hasErrors = true;
  } else {
    console.log(`  ✓ Contains "Terakhir diperbarui"`);
  }

  // Inbound links (>= 10)
  const inbound = linkCounts.get(pillar.path) || linkCounts.get(pillar.path.replace(/\/$/, '')) || 0;
  if (inbound < 10) {
    console.error(`❌ FAILED: Inbound links count is ${inbound} (< 10 links)`);
    hasErrors = true;
  } else {
    console.log(`  ✓ Inbound links: ${inbound} (>= 10)`);
  }
}

// 4. Check every legacy article has >= 3 inbound links
console.log('\n--- 4. Checking Inbound Links for Legacy Articles ---');
const frozenUrlsPath = path.join(__dirname, 'frozen-urls.txt');
const frozenUrls = fs.existsSync(frozenUrlsPath)
  ? fs.readFileSync(frozenUrlsPath, 'utf8')
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean)
  : [];

// Legacy articles are frozen URLs ending with .html (excluding 301 bridge program-pengendalian-kebisingan-331.html)
const legacyArticles = frozenUrls.filter(u => u.endsWith('.html') && !u.includes('program-pengendalian-kebisingan-331'));

console.log(`Found ${legacyArticles.length} legacy articles to verify.`);
let legacyFailed = 0;

for (const art of legacyArticles) {
  const inbound = linkCounts.get(art) || 0;
  if (inbound < 3) {
    console.error(`❌ FAILED: Legacy article [${art}] has only ${inbound} inbound link(s) (< 3)`);
    legacyFailed++;
    hasErrors = true;
  }
}

if (legacyFailed === 0) {
  console.log(`✓ All ${legacyArticles.length} legacy articles have >= 3 inbound links!`);
}

console.log('\n====================================');
if (hasErrors) {
  console.error('❌ Check pillars FAILED!');
  process.exit(1);
} else {
  console.log('✓ All pillar and legacy checks PASSED!');
  process.exit(0);
}
