import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const excludedFiles = new Set([
  '404.html',
  '410.html',
  'program-pengendalian-kebisingan-331.html'
]);

function getAllHtmlFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(dir === distDir ? distDir : rootDir, full).replace(/\\/g, '/');

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

// Prefer scanning distDir if it exists, otherwise root
const scanDir = fs.existsSync(distDir) ? distDir : rootDir;
const files = getAllHtmlFiles(scanDir);

console.log(`Checking SEO meta on ${files.length} HTML files...`);

let failed = false;

for (const { full, rel } of files) {
  if (
    excludedFiles.has(rel) ||
    excludedFiles.has(path.basename(rel)) ||
    rel.startsWith('docs/') ||
    rel.includes('/_')
  ) {
    continue;
  }

  const html = fs.readFileSync(full, 'utf8');

  // 1. Title
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // 2. Meta description
  const descMatch =
    html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const desc = descMatch ? descMatch[1].trim() : '';

  // 3. Canonical
  const canonMatch =
    html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) ||
    html.match(/<link\s+[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["']/i);
  const canonical = canonMatch ? canonMatch[1].trim() : '';

  const errors = [];

  if (!title) {
    errors.push('Missing <title>');
  } else if (title.length > 60) {
    errors.push(`Title length ${title.length} > 60 ("${title}")`);
  }

  if (!desc) {
    errors.push('Missing meta description');
  } else if (desc.length < 70) {
    errors.push(`Description length ${desc.length} < 70 ("${desc}")`);
  } else if (desc.length > 160) {
    errors.push(`Description length ${desc.length} > 160 ("${desc}")`);
  }

  if (!canonical) {
    errors.push('Missing canonical <link>');
  }

  if (errors.length > 0) {
    console.error(`❌ [${rel}]:`);
    errors.forEach(e => console.error(`   - ${e}`));
    failed = true;
  }
}

if (failed) {
  console.error('\n❌ check:seo FAILED: Found SEO title, description, or canonical violations!');
  process.exit(1);
} else {
  console.log('✓ check:seo PASSED: All pages meet title <= 60, desc 70-160, and canonical requirements.');
  process.exit(0);
}
