import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const scanDir = fs.existsSync(distDir) ? distDir : rootDir;

function getHtmlFiles(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.astro', 'src', 'scripts', 'docs', '_astro'].includes(entry.name)) continue;
      out = out.concat(getHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

const files = getHtmlFiles(scanDir);
console.log(`Checking WhatsApp pre-filled messages across ${files.length} HTML files...`);

let failed = false;
let waCount = 0;

for (const file of files) {
  const rel = path.relative(scanDir, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');

  if (/Halo(?:\s+|%20)(?:Admin(?:\s+|%20))?KonsultanK3/i.test(html)) {
    console.error(`❌ [${rel}]: Still contains formal "Halo KonsultanK3" greeting`);
    failed = true;
  }

  const htmlNoScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const waMatches = htmlNoScripts.match(/https:\/\/wa\.me\/6289510253435\?text=[^"'\s<>]+/gi) || [];
  for (const link of waMatches) {
    waCount++;
    const decoded = decodeURIComponent(link.split('?text=')[1] || '');
    if (!decoded.startsWith('Halo Kak')) {
      console.error(`❌ [${rel}]: WA link does not start with "Halo Kak": "${decoded}"`);
      failed = true;
    }
  }
}

if (failed) {
  console.error('\n❌ check:wa FAILED!');
  process.exit(1);
}

console.log(`✓ check:wa PASSED: ${waCount} WhatsApp links verified with friendly "Halo Kak" greeting across ${files.length} pages.`);
