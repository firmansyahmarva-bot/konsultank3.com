import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

console.log('Running post-build synchronization...');

// Collect intrinsic metadata for images in public/
const imageMetaCache = new Map();

async function indexPublicImages(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await indexPublicImages(full);
    } else if (entry.isFile() && /\.(jpe?g|png|webp|avif)$/i.test(entry.name)) {
      const webPath = '/' + path.relative(publicDir, full).replace(/\\/g, '/');
      try {
        const meta = await sharp(full).metadata();
        const hasWebp = /\.(jpe?g)$/i.test(entry.name) && fs.existsSync(full.replace(/\.(jpe?g)$/i, '.webp'));
        const hasAvif = /\.(jpe?g)$/i.test(entry.name) && fs.existsSync(full.replace(/\.(jpe?g)$/i, '.avif'));
        imageMetaCache.set(webPath, {
          width: meta.width,
          height: meta.height,
          hasWebp,
          hasAvif
        });
      } catch {
        // Ignore unreadable image
      }
    }
  }
}

function enhanceImagesInHtml(html) {
  const mainStart = html.indexOf('<main');
  if (mainStart === -1) return html;

  // Determine hero cutoff (end of first <header> or first <section> inside <main>)
  const afterMain = html.slice(mainStart);
  const firstHeaderEnd = afterMain.search(/<\/header>/i);
  const firstSectionEnd = afterMain.search(/<\/section>/i);
  let heroCutoff = mainStart;
  if (firstHeaderEnd !== -1 && (firstSectionEnd === -1 || firstHeaderEnd < firstSectionEnd)) {
    heroCutoff = mainStart + firstHeaderEnd;
  } else if (firstSectionEnd !== -1) {
    heroCutoff = mainStart + firstSectionEnd;
  }

  let lcpAssigned = false;

  // Process only outside <script>, <style>, and <template> blocks
  const parts = html.split(/(<(?:script|style|template)\b[^>]*>[\s\S]*?<\/(?:script|style|template)>)/gi);
  let offset = 0;

  for (let i = 0; i < parts.length; i++) {
    const chunk = parts[i];
    const chunkStart = offset;
    offset += chunk.length;

    if (i % 2 === 1 || chunkStart < mainStart) continue;

    parts[i] = chunk.replace(
      /(<picture\b[^>]*>[\s\S]*?<\/picture>)|(<img\b[^>]*>)/gi,
      (match, existingPicture, imgTag, matchIdx) => {
        if (existingPicture) return existingPicture;

        const absPos = chunkStart + matchIdx;
        const srcMatch = imgTag.match(/\bsrc=["']([^"']+)["']/i);
        if (!srcMatch) return imgTag;

        const src = srcMatch[1];
        if (!src.startsWith('/')) return imgTag;

        const info = imageMetaCache.get(src);
        let updated = imgTag;
        const isSelfClosing = /\/>$/.test(updated);
        const closeBracket = isSelfClosing ? ' />' : '>';
        const stripEnd = (s) => s.replace(/\s*\/?>$/, '');

        // 1. Add decoding="async"
        if (!/\bdecoding=/i.test(updated)) {
          updated = `${stripEnd(updated)} decoding="async"${closeBracket}`;
        }

        // 2. Add intrinsic width & height when missing
        if (info?.width && info?.height && !/\bwidth=/i.test(updated) && !/\bheight=/i.test(updated)) {
          updated = `${stripEnd(updated)} width="${info.width}" height="${info.height}"${closeBracket}`;
        }

        // 3. Above-the-fold hero gets fetchpriority="high"; below-the-fold gets loading="lazy"
        const isHeroZone = absPos <= heroCutoff;
        const hasFetchPriority = /\bfetchpriority=/i.test(updated);
        const hasLoading = /\bloading=/i.test(updated);

        if (isHeroZone && !lcpAssigned && !hasLoading) {
          lcpAssigned = true;
          if (!hasFetchPriority) {
            updated = `${stripEnd(updated)} fetchpriority="high"${closeBracket}`;
          }
        } else if (!isHeroZone && !hasLoading && !hasFetchPriority) {
          updated = `${stripEnd(updated)} loading="lazy"${closeBracket}`;
        }

        // 4. Wrap in <picture> when AVIF / WebP siblings exist
        if (info && (info.hasAvif || info.hasWebp)) {
          const base = src.replace(/\.(jpe?g)$/i, '');
          const sources = [];
          if (info.hasAvif) sources.push(`<source srcset="${base}.avif" type="image/avif">`);
          if (info.hasWebp) sources.push(`<source srcset="${base}.webp" type="image/webp">`);
          return `<picture>${sources.join('')}${updated}</picture>`;
        }

        return updated;
      }
    );
  }

  return parts.join('');
}

async function processDistHtml(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '_astro') {
        count += await processDistHtml(full);
      }
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const orig = fs.readFileSync(full, 'utf8');
      const next = enhanceImagesInHtml(orig);
      if (next !== orig) {
        fs.writeFileSync(full, next, 'utf8');
      }
      count++;
    }
  }
  return count;
}

await indexPublicImages(publicDir);
const enhancedCount = await processDistHtml(distDir);
console.log(`✓ Optimized image attributes & <picture> tags across ${enhancedCount} HTML files`);

// 1. Ensure sitemap.xml exists in dist
if (fs.existsSync(path.join(distDir, 'sitemap-0.xml'))) {
  fs.copyFileSync(path.join(distDir, 'sitemap-0.xml'), path.join(distDir, 'sitemap.xml'));
  fs.copyFileSync(path.join(distDir, 'sitemap-0.xml'), path.join(rootDir, 'sitemap.xml'));
  console.log('✓ sitemap.xml synchronized to root and dist');
}

// 2. Replace _astro asset bundles in root (prunes stale hashed CSS/JS files)
const distAstroDir = path.join(distDir, '_astro');
const rootAstroDir = path.join(rootDir, '_astro');
if (fs.existsSync(distAstroDir)) {
  if (fs.existsSync(rootAstroDir)) {
    fs.rmSync(rootAstroDir, { recursive: true, force: true });
  }
  fs.mkdirSync(rootAstroDir, { recursive: true });
  fs.cpSync(distAstroDir, rootAstroDir, { recursive: true });
  console.log('✓ _astro assets synchronized to root (stale bundles pruned)');
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

// Root-hosted builds need the editable downloads copied alongside the HTML.
const distTemplatesDir = path.join(distDir, 'assets', 'templates');
if (fs.existsSync(distTemplatesDir)) {
  const rootTemplatesDir = path.join(rootDir, 'assets', 'templates');
  fs.mkdirSync(rootTemplatesDir, { recursive: true });
  for (const entry of fs.readdirSync(distTemplatesDir, { withFileTypes: true })) {
    if (entry.isFile() && /\.(xlsx|docx)$/i.test(entry.name)) {
      fs.copyFileSync(path.join(distTemplatesDir, entry.name), path.join(rootTemplatesDir, entry.name));
    }
  }
}

// 3. Sync all HTML files to root
function syncHtmlFiles(currentDistDir, relativeSubPath = '') {
  const entries = fs.readdirSync(currentDistDir, { withFileTypes: true });
  let synced = 0;

  for (const entry of entries) {
    const srcPath = path.join(currentDistDir, entry.name);
    const relPath = path.join(relativeSubPath, entry.name);
    const destPath = path.join(rootDir, relPath);

    if (entry.isDirectory()) {
      if (entry.name !== '_astro') {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        synced += syncHtmlFiles(srcPath, relPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      fs.copyFileSync(srcPath, destPath);
      synced++;
    }
  }
  return synced;
}

const totalSynced = syncHtmlFiles(distDir);
console.log(`✓ All ${totalSynced} production HTML pages synchronized to root structure`);
console.log('Post-build sync complete!');
