import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.join(__dirname, '..', 'src', 'pages');

function getAstroFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of list) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(getAstroFiles(fullPath));
    } else if (file.name.endsWith('.astro')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = getAstroFiles(pagesDir);
console.log(`Auditing ${files.length} pages for duplicate content...\n`);

const pages = [];

for (const file of files) {
  const relPath = path.relative(pagesDir, file).replace(/\\/g, '/');
  const raw = fs.readFileSync(file, 'utf8');

  // Extract title
  const titleMatch = raw.match(/title\s*=\s*(?:\{`([^`]+)`\}|"([^"]+)"|'([^']+)')/i);
  const title = titleMatch ? (titleMatch[1] || titleMatch[2] || titleMatch[3]) : 'NO_TITLE';

  // Extract description
  const descMatch = raw.match(/description\s*=\s*(?:\{`([^`]+)`\}|"([^"]+)"|'([^']+)'|\{description\})/i);
  let desc = descMatch ? (descMatch[1] || descMatch[2] || descMatch[3]) : 'NO_DESC';
  if (desc === undefined) {
    const descVarMatch = raw.match(/const\s+description\s*=\s*["']([^"']+)["']/i);
    desc = descVarMatch ? descVarMatch[1] : 'NO_DESC';
  }

  // Extract clean text body
  const bodyText = raw
    .replace(/---[\s\S]*?---/, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  // Create word shingles (set of 5-grams) for Jaccard similarity comparison
  const words = bodyText.split(' ').filter(w => w.length > 2);
  const shingles = new Set();
  for (let i = 0; i < words.length - 4; i++) {
    shingles.add(words.slice(i, i + 5).join(' '));
  }

  pages.push({
    file: relPath,
    title,
    desc,
    wordsCount: words.length,
    bodyText,
    shingles
  });
}

// 1. Check duplicate titles
console.log('=== 1. TITLE DUPLICATION CHECK ===');
const titleMap = new Map();
pages.forEach(p => {
  const normTitle = p.title.toLowerCase().replace(/»\s*konsultan\s*k3.*/, '').trim();
  if (!titleMap.has(normTitle)) titleMap.set(normTitle, []);
  titleMap.get(normTitle).push(p.file);
});

let foundTitleDups = false;
for (const [title, flist] of titleMap.entries()) {
  if (flist.length > 1) {
    foundTitleDups = true;
    console.log(`⚠️ DUPLICATE TITLE DETECTED: "${title}"`);
    flist.forEach(f => console.log(`   └─ ${f}`));
  }
}
if (!foundTitleDups) console.log('✓ All 46 page titles are unique.');

// 2. Check duplicate meta descriptions
console.log('\n=== 2. META DESCRIPTION DUPLICATION CHECK ===');
const descMap = new Map();
pages.forEach(p => {
  const normDesc = p.desc.trim().toLowerCase();
  if (!descMap.has(normDesc)) descMap.set(normDesc, []);
  descMap.get(normDesc).push(p.file);
});

let foundDescDups = false;
for (const [desc, flist] of descMap.entries()) {
  if (flist.length > 1) {
    foundDescDups = true;
    console.log(`⚠️ DUPLICATE DESCRIPTION: "${desc.substring(0, 70)}..."`);
    flist.forEach(f => console.log(`   └─ ${f}`));
  }
}
if (!foundDescDups) console.log('✓ All page meta descriptions are unique.');

// 3. Check Body Content Similarity (Jaccard similarity > 60%)
console.log('\n=== 3. BODY TEXT SIMILARITY / OVERLAP CHECK ===');
let foundSimilar = false;

for (let i = 0; i < pages.length; i++) {
  for (let j = i + 1; j < pages.length; j++) {
    const p1 = pages[i];
    const p2 = pages[j];

    // Jaccard similarity between shingles
    const s1 = p1.shingles;
    const s2 = p2.shingles;
    if (s1.size === 0 || s2.size === 0) continue;

    let intersection = 0;
    for (const shingle of s1) {
      if (s2.has(shingle)) intersection++;
    }
    const union = s1.size + s2.size - intersection;
    const similarity = intersection / union;

    if (similarity > 0.5) {
      foundSimilar = true;
      console.log(`⚠️ HIGH CONTENT SIMILARITY (${Math.round(similarity * 100)}%):`);
      console.log(`   Page 1: ${p1.file} (${p1.wordsCount} words)`);
      console.log(`   Page 2: ${p2.file} (${p2.wordsCount} words)`);
    }
  }
}
if (!foundSimilar) {
  console.log('✓ Zero high-similarity content pairs detected (all >50% threshold clear).');
}

// 4. Check specific legacy vs modern cannibalization cases
console.log('\n=== 4. CANNIBALIZATION / URL COLLISION CHECK ===');
const kebisingan1 = pages.find(p => p.file.includes('program-pengendalian-kebisingan-331'));
const kebisingan2 = pages.find(p => p.file === 'program-pengendalian-kebisingan/index.astro');

if (kebisingan1 && kebisingan2) {
  console.log('⚠️ POTENTIAL CANNIBALIZATION CASE FOUND:');
  console.log(`   - Legacy URL: ${kebisingan1.file}`);
  console.log(`   - Modern Hub: ${kebisingan2.file}`);
}
