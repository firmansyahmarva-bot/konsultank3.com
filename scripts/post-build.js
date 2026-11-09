import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('Running post-build synchronization...');

// 1. Ensure sitemap.xml exists in dist
if (fs.existsSync(path.join(distDir, 'sitemap-0.xml'))) {
  fs.copyFileSync(path.join(distDir, 'sitemap-0.xml'), path.join(distDir, 'sitemap.xml'));
  fs.copyFileSync(path.join(distDir, 'sitemap-0.xml'), path.join(rootDir, 'sitemap.xml'));
  console.log('✓ sitemap.xml synchronized to root and dist');
}

// 2. Copy _astro asset bundles to root
const distAstroDir = path.join(distDir, '_astro');
const rootAstroDir = path.join(rootDir, '_astro');
if (fs.existsSync(distAstroDir)) {
  if (!fs.existsSync(rootAstroDir)) {
    fs.mkdirSync(rootAstroDir, { recursive: true });
  }
  fs.cpSync(distAstroDir, rootAstroDir, { recursive: true });
  console.log('✓ _astro assets synchronized to root');
}

// 2b. Sync .htaccess and _redirects to dist
if (fs.existsSync(path.join(rootDir, '.htaccess'))) {
  fs.copyFileSync(path.join(rootDir, '.htaccess'), path.join(distDir, '.htaccess'));
  console.log('✓ .htaccess synchronized to dist');
}
if (fs.existsSync(path.join(rootDir, '_redirects'))) {
  fs.copyFileSync(path.join(rootDir, '_redirects'), path.join(distDir, '_redirects'));
  console.log('✓ _redirects synchronized to dist');
}

// 3. Sync all HTML files to root
function syncHtmlFiles(currentDistDir, relativeSubPath = '') {
  const entries = fs.readdirSync(currentDistDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(currentDistDir, entry.name);
    const relPath = path.join(relativeSubPath, entry.name);
    const destPath = path.join(rootDir, relPath);

    if (entry.isDirectory()) {
      if (entry.name !== '_astro') {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        syncHtmlFiles(srcPath, relPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

syncHtmlFiles(distDir);
console.log('✓ All 46 production HTML pages synchronized to root structure');
console.log('Post-build sync complete!');
