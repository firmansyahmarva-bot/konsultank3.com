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

function getAllHtmlFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(rootDir, full).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (
        rel.startsWith('docs') ||
        rel.startsWith('node_modules') ||
        rel.startsWith('.git') ||
        rel.startsWith('.astro') ||
        rel.startsWith('src') ||
        rel.startsWith('scripts')
      ) {
        continue;
      }
      results = results.concat(getAllHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push({ full, rel });
    }
  }

  return results;
}

const htmlFiles = getAllHtmlFiles(rootDir);
console.log(`Checking stand-alone isolation on ${htmlFiles.length} built HTML files...`);

let failed = false;

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

if (failed) {
  console.error('\n❌ check:standalone FAILED: Found forbidden cross-references!');
  process.exit(1);
} else {
  console.log('✓ check:standalone PASSED: 0 cross-references found across all built HTML.');
  process.exit(0);
}
