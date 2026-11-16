import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const pubImgDir = path.join(rootDir, 'public', 'assets', 'images');
const rootImgDir = path.join(rootDir, 'assets', 'images');

async function optimizeJpgInPlace(filePath, maxWidth = 1280) {
  const origBuf = fs.readFileSync(filePath);
  const meta = await sharp(origBuf).metadata();
  let pipeline = sharp(origBuf).rotate();
  if (meta.width && meta.width > maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  }
  const nextBuf = await pipeline
    .jpeg({ quality: 75, mozjpeg: true, progressive: true })
    .toBuffer();

  if (nextBuf.length < origBuf.length) {
    fs.writeFileSync(filePath, nextBuf);
    return { before: origBuf.length, after: nextBuf.length, updated: true };
  }
  return { before: origBuf.length, after: origBuf.length, updated: false };
}

async function generateModernFormats(filePath) {
  const buf = fs.readFileSync(filePath);
  const base = filePath.replace(/\.(jpe?g)$/i, '');

  const webpBuf = await sharp(buf).webp({ quality: 76, effort: 6 }).toBuffer();
  fs.writeFileSync(`${base}.webp`, webpBuf);

  const avifBuf = await sharp(buf).avif({ quality: 58, effort: 4 }).toBuffer();
  fs.writeFileSync(`${base}.avif`, avifBuf);

  return { webp: webpBuf.length, avif: avifBuf.length };
}

async function main() {
  if (!fs.existsSync(pubImgDir)) {
    console.error('Missing directory:', pubImgDir);
    process.exit(1);
  }

  const files = fs.readdirSync(pubImgDir);
  console.log('Optimizing images in public/assets/images/...');

  for (const name of files) {
    const full = path.join(pubImgDir, name);
    if (!fs.statSync(full).isFile()) continue;

    if (/\.(jpe?g)$/i.test(name)) {
      const jpgRes = await optimizeJpgInPlace(full, 1280);
      const modernRes = await generateModernFormats(full);
      const pct = (((jpgRes.before - jpgRes.after) / jpgRes.before) * 100).toFixed(1);
      console.log(
        `  ${name}: ${(jpgRes.before / 1024).toFixed(1)}KB -> ${(jpgRes.after / 1024).toFixed(1)}KB (-${pct}%) | WebP ${(modernRes.webp / 1024).toFixed(1)}KB | AVIF ${(modernRes.avif / 1024).toFixed(1)}KB`
      );
    } else if (/\.png$/i.test(name)) {
      const orig = fs.readFileSync(full);
      const next = await sharp(orig).png({ compressionLevel: 9, palette: true, quality: 85 }).toBuffer();
      if (next.length < orig.length) {
        fs.writeFileSync(full, next);
        console.log(`  ${name}: ${(orig.length / 1024).toFixed(1)}KB -> ${(next.length / 1024).toFixed(1)}KB`);
      } else {
        console.log(`  ${name}: ${(orig.length / 1024).toFixed(1)}KB (already optimal)`);
      }
    }
  }

  // Sync to root assets/images/
  if (!fs.existsSync(rootImgDir)) {
    fs.mkdirSync(rootImgDir, { recursive: true });
  }
  fs.cpSync(pubImgDir, rootImgDir, { recursive: true });
  console.log('✓ Synced optimized images to root assets/images/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
