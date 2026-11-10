import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const allowedWahanaPages = new Set([
  'kontak/index.html',
  'kebijakan-privasi/index.html',
  'syarat-ketentuan/index.html'
]);

function getAllFiles(dir, matchExts, skipDirs = []) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(rootDir, full).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (skipDirs.some(skip => rel === skip || rel.startsWith(skip + '/'))) {
        continue;
      }
      results = results.concat(getAllFiles(full, matchExts, skipDirs));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (matchExts.includes(ext)) {
        results.push({ full, rel });
      }
    }
  }

  return results;
}

const skipDefault = ['docs', 'node_modules', '.git', '.astro', 'src', 'scripts'];

// 1. Gather all built HTML files
const htmlFiles = getAllFiles(rootDir, ['.html'], skipDefault);

// 2. Gather assets/**/*.js and *.css
const assetDirs = ['assets', 'public/assets'];
let assetJsFiles = [];
for (const ad of assetDirs) {
  const dirPath = path.join(rootDir, ad);
  if (fs.existsSync(dirPath)) {
    assetJsFiles = assetJsFiles.concat(getAllFiles(dirPath, ['.js', '.mjs', '.css'], []));
  }
}

// Also find all *.css in root and output
const cssFiles = getAllFiles(rootDir, ['.css'], ['docs', 'node_modules', '.git', 'src', 'scripts']);

// Combine unique JS & CSS files to check
const jsAndCssMap = new Map();
for (const f of [...assetJsFiles, ...cssFiles]) {
  jsAndCssMap.set(f.rel, f);
}
const jsAndCssFiles = Array.from(jsAndCssMap.values());

console.log(`Checking stand-alone isolation on ${htmlFiles.length} HTML files and ${jsAndCssFiles.length} JS/CSS asset files...`);

let failed = false;

// Check HTML files
for (const { full, rel } of htmlFiles) {
  const content = fs.readFileSync(full, 'utf8');

  // 1. Check wahanatotalita.com anywhere
  if (/wahanatotalita\.com/i.test(content)) {
    console.error(`❌ FAILED: Found "wahanatotalita.com" in [${rel}]`);
    failed = true;
  }

  // 2. Check wahana outside allowed pages
  const isAllowed = Array.from(allowedWahanaPages).some(allowed => 
    rel === allowed || rel.endsWith('/' + allowed) || rel === allowed.replace('/index.html', '.html')
  );

  if (/wahana/i.test(content) && !isAllowed) {
    console.error(`❌ FAILED: Found "wahana" outside allowed pages in [${rel}]`);
    failed = true;
  }
}

// Check JS and CSS asset files (no "wahana" allowed anywhere)
for (const { full, rel } of jsAndCssFiles) {
  const content = fs.readFileSync(full, 'utf8');
  if (/wahana/i.test(content)) {
    console.error(`❌ FAILED: Found "wahana" in asset file [${rel}]`);
    failed = true;
  }
}

if (failed) {
  console.error('\n❌ check:standalone FAILED: Found forbidden cross-references!');
  process.exit(1);
} else {
  console.log('✓ check:standalone PASSED: 0 cross-references found across all built HTML and JS/CSS assets.');
  process.exit(0);
}
