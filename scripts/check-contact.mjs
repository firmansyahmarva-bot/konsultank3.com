import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const expectedWaNumber = '6289510253435';
const forbiddenStrings = ['81392943146', '813-9294-3146', '813 9294 3146'];

function getAllHtmlFiles(dir, skipDirs = []) {
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
      results = results.concat(getAllHtmlFiles(full, skipDirs));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push({ full, rel });
    }
  }

  return results;
}

const skipDefault = ['docs', 'node_modules', '.git', '.astro', 'src', 'scripts'];
const htmlFiles = getAllHtmlFiles(rootDir, skipDefault);

console.log(`Checking contact consistency across ${htmlFiles.length} HTML files...`);

let hasErrors = false;

for (const { full, rel } of htmlFiles) {
  const content = fs.readFileSync(full, 'utf8');

  // 1. Check any wa.me link
  const waRegex = /https?:\/\/wa\.me\/([^\s"'?&#]+)/gi;
  let match;
  while ((match = waRegex.exec(content)) !== null) {
    const foundNumber = match[1].replace(/[^0-9]/g, '');
    if (foundNumber !== expectedWaNumber) {
      console.error(`❌ FAILED in [${rel}]: wa.me link uses "${match[0]}" (expected number "${expectedWaNumber}")`);
      hasErrors = true;
    }
  }

  // 2. Check forbidden strings
  for (const forbidden of forbiddenStrings) {
    if (content.includes(forbidden)) {
      console.error(`❌ FAILED in [${rel}]: Found forbidden phone number string "${forbidden}"`);
      hasErrors = true;
    }
  }
}

if (hasErrors) {
  console.error('\n❌ Contact check FAILED!');
  process.exit(1);
} else {
  console.log(`✓ All ${htmlFiles.length} HTML files verified: all wa.me links use ${expectedWaNumber} and no old phone numbers found.`);
  process.exit(0);
}
