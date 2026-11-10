import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const cdxUrl = 'https://web.archive.org/cdx/search/cdx?url=konsultank3.com/*&output=json&fl=original&filter=statuscode:200&filter=mimetype:text/html&collapse=urlkey&limit=20000';
const localCache = path.join(rootDir, 'wayback.json');
const legacyUrlsFile = path.join(__dirname, 'legacy-urls.txt');
const htaccessPath = path.join(rootDir, '.htaccess');
const redirectsPath = path.join(rootDir, '_redirects');
const frozenUrlsPath = path.join(__dirname, 'frozen-urls.txt');

let allCleanPaths = [];

// Prefer existing legacy-urls.txt if present, or fetch from CDX
if (fs.existsSync(legacyUrlsFile) && fs.statSync(legacyUrlsFile).size > 0) {
  const content = fs.readFileSync(legacyUrlsFile, 'utf8');
  allCleanPaths = content.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  console.log(`✓ Loaded ${allCleanPaths.length} clean paths from ${path.relative(rootDir, legacyUrlsFile)}`);
} else {
  console.log('Fetching Wayback CDX data for konsultank3.com...');
  let rawData = null;
  try {
    const resp = await fetch(cdxUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (resp.ok) {
      rawData = await resp.json();
      console.log(`✓ Fetched ${rawData.length} records from Wayback Machine API.`);
    }
  } catch (err) {
    console.warn(`Wayback fetch warning: ${err.message}. Checking local cache...`);
  }

  if (!rawData && fs.existsSync(localCache)) {
    rawData = JSON.parse(fs.readFileSync(localCache, 'utf8'));
    console.log(`✓ Loaded ${rawData.length} records from local cache.`);
  }

  if (!rawData) {
    console.error('❌ Could not fetch or load Wayback CDX data.');
    process.exit(1);
  }

  // Extract clean unique paths
  const rows = rawData.slice(1);
  const cleanPathsSet = new Set();
  for (const r of rows) {
    const original = r[0];
    try {
      const parsed = new URL(original);
      let p = parsed.pathname;
      if (p) {
        cleanPathsSet.add(p);
      }
    } catch {}
  }
  allCleanPaths = Array.from(cleanPathsSet).sort();
  fs.writeFileSync(legacyUrlsFile, allCleanPaths.join('\n') + '\n', 'utf8');
  console.log(`✓ Saved ${allCleanPaths.length} clean paths to ${path.relative(rootDir, legacyUrlsFile)}`);
}

// Load frozen URLs
const frozenUrls = fs.existsSync(frozenUrlsPath)
  ? fs.readFileSync(frozenUrlsPath, 'utf8')
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean)
  : [];

const frozenSet = new Set(frozenUrls);
frozenSet.add('/');

// 410 patterns
const p410Patterns = [
  /^training-pelatihan-dan-sertifikasi-.*-di-.*\.html$/,
  /^pdf\//,
  /^training\/.*\.html$/,
  /^page\//,
  /^tag\//
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const mappedRules = [];
const noMatchList = [];

for (const p of allCleanPaths) {
  const norm = p.startsWith('/') ? p : '/' + p;
  const noSlash = p.replace(/^\//, '');

  // 1) Skip frozen or existing built pages
  if (
    frozenSet.has(norm) ||
    frozenSet.has(noSlash) ||
    frozenSet.has(norm.replace(/\/$/, '')) ||
    frozenSet.has(norm + '/') ||
    fs.existsSync(path.join(rootDir, noSlash)) ||
    (noSlash && fs.existsSync(path.join(rootDir, noSlash, 'index.html')))
  ) {
    continue;
  }

  // 2) Skip 410 patterns
  if (p410Patterns.some(rx => rx.test(noSlash))) {
    continue;
  }

  // 3) Keyword mapping - order matters (first match wins):
  const slug = noSlash.toLowerCase();
  let target = null;

  if (slug === 'index.html' || slug === 'index.php') {
    target = '/';
  } else if (/iso-26000|tanggung-jawab-sosial|csr/i.test(slug)) {
    target = '/apa-pentingtinya-iso-26000-357.html';
  } else if (/ohsas/i.test(slug)) {
    target = '/apakah-ohsas-18001-35.html';
  } else if (/iso-9001/i.test(slug)) {
    target = '/apakah-iso-9001-2008-80.html';
  } else if (/ergonomi/i.test(slug)) {
    target = '/beberapa-prinsip-ergonomi-288.html';
  } else if (/iso-31000|manajemen-risiko|risk/i.test(slug)) {
    target = '/panduan-penerapan-smk3/';
  } else if (/bising|kebisingan/i.test(slug)) {
    target = '/program-pengendalian-kebisingan/';
  } else if (/\bapd\b|pelindung/i.test(slug)) {
    target = '/alat-pelindung-diri/';
  } else if (/penyakit|kesehatan[-_]kerja|\bpak\b/i.test(slug)) {
    target = '/penyakit-akibat-kerja/';
  } else if (/smk3|audit|hirarc|\bjsa\b|p2k3/i.test(slug)) {
    target = '/panduan-penerapan-smk3/';
  } else {
    // iso-14001 | iso-17025 | iso-iec | laboratorium | anything else: no redirect (leave 404)
    target = null;
  }

  if (target) {
    mappedRules.push({
      originalPath: norm,
      regexPath: escapeRegex(noSlash),
      target
    });
  } else {
    noMatchList.push(norm);
  }
}

console.log(`\nClassification Summary:`);
console.log(`- Mapped 301 URLs: ${mappedRules.length}`);
console.log(`- Unmatched URLs (remaining 404): ${noMatchList.length}`);

// Print unmatched list to console
console.log('\n--- Unmatched URLs (404 list) ---');
noMatchList.slice(0, 50).forEach(u => console.log(`   ${u}`));
if (noMatchList.length > 50) {
  console.log(`   ... and ${noMatchList.length - 50} more.`);
}

// Generate .htaccess block
const htaccessLines = [
  '# BEGIN legacy-301',
  '# Auto-generated historical Wayback 301 mappings to core pillars',
  ...mappedRules.map(r => `RewriteRule ^${r.regexPath}$ ${r.target} [R=301,L]`),
  '# END legacy-301'
];
const htaccessBlock = htaccessLines.join('\n');

if (fs.existsSync(htaccessPath)) {
  let htContent = fs.readFileSync(htaccessPath, 'utf8');
  if (htContent.includes('# BEGIN legacy-301')) {
    htContent = htContent.replace(/# BEGIN legacy-301[\s\S]*?# END legacy-301/, htaccessBlock);
  } else {
    // Insert after manual 301s
    const manualAnchor = '# 2. Reclaim Cited Backlink & Legacy URLs (1:1 301 Mapping)';
    if (htContent.includes(manualAnchor)) {
      htContent = htContent.replace(manualAnchor, manualAnchor + '\n\n' + htaccessBlock);
    } else {
      htContent += '\n\n' + htaccessBlock + '\n';
    }
  }
  fs.writeFileSync(htaccessPath, htContent, 'utf8');
  console.log(`✓ Updated ${htaccessPath} with ${mappedRules.length} legacy 301 rules.`);
}

// Generate _redirects block
const redirectLines = [
  '# BEGIN legacy-301',
  ...mappedRules
    .filter(r => !r.originalPath.slice(1).includes('/')) // root-level mapped paths
    .map(r => `${r.originalPath}   ${r.target}   301`),
  '# END legacy-301'
];
const redirectsBlock = redirectLines.join('\n');

if (fs.existsSync(redirectsPath)) {
  let rContent = fs.readFileSync(redirectsPath, 'utf8');
  if (rContent.includes('# BEGIN legacy-301')) {
    rContent = rContent.replace(/# BEGIN legacy-301[\s\S]*?# END legacy-301/, redirectsBlock);
  } else {
    rContent += '\n\n' + redirectsBlock + '\n';
  }
  fs.writeFileSync(redirectsPath, rContent, 'utf8');
  console.log(`✓ Updated ${redirectsPath} with legacy 301 rules.`);
}

// Clean up local cache if present
if (fs.existsSync(localCache)) {
  fs.unlinkSync(localCache);
}

console.log('✓ build-legacy-rules completed successfully!');
