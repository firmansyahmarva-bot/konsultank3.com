import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const frozenListFile = path.join(__dirname, 'frozen-urls.txt');

if (!fs.existsSync(frozenListFile)) {
  console.error(`❌ frozen-urls.txt not found at: ${frozenListFile}`);
  process.exit(1);
}

const lines = fs
  .readFileSync(frozenListFile, 'utf8')
  .split(/\r?\n/)
  .map(l => l.trim())
  .filter(Boolean);

console.log(`Checking ${lines.length} frozen URLs against build output in dist/...`);

const missing = [];

for (const urlPath of lines) {
  const cleanPath = urlPath.replace(/^\//, '');
  
  let targetFile;
  let targetFolderIndex;

  if (urlPath === '/' || cleanPath === '') {
    targetFile = path.join(distDir, 'index.html');
  } else if (urlPath.endsWith('/')) {
    targetFile = path.join(distDir, cleanPath, 'index.html');
  } else {
    targetFile = path.join(distDir, cleanPath);
    targetFolderIndex = path.join(distDir, cleanPath, 'index.html');
  }

  const exists =
    (targetFile && fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) ||
    (targetFolderIndex && fs.existsSync(targetFolderIndex) && fs.statSync(targetFolderIndex).isFile());

  if (!exists) {
    missing.push(urlPath);
  }
}

if (missing.length > 0) {
  console.error(`❌ Error: ${missing.length} frozen URLs are missing from build output:`);
  missing.forEach(m => console.error(`   - ${m}`));
  process.exit(1);
}

console.log(`✓ All ${lines.length} frozen URLs exist in build output!`);
process.exit(0);
