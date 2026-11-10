import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = fs.existsSync(path.join(__dirname, '..', 'dist')) ? path.join(__dirname, '..', 'dist') : path.join(__dirname, '..');
const SKIP_DIRS = new Set(['.git', 'node_modules', 'docs', 'src', 'scripts', 'public', '_astro', '.astro']);
const rootDir = path.join(__dirname, '..');

function getAllFiles(dir, ext) {
  let res = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) { if (SKIP_DIRS.has(item.name)) continue; res = res.concat(getAllFiles(full, ext)); }
    else if (item.name.endsWith(ext)) res.push(full);
  }
  return res;
}

const htmlFiles = getAllFiles(distDir, '.html');

// Read sitemap.xml
let sitemapUrls = new Set();
const sitemapPath = path.join(distDir, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  let m;
  while ((m = locRegex.exec(sitemapContent)) !== null) {
    sitemapUrls.add(m[1].trim());
  }
}

// Check for server redirect files
const serverRedirectFiles = ['.htaccess', '_redirects', 'vercel.json', 'netlify.toml'];
const foundServerConfigs = {};
for (const f of serverRedirectFiles) {
  const p = path.join(rootDir, f);
  if (fs.existsSync(p)) {
    foundServerConfigs[f] = fs.readFileSync(p, 'utf8');
  }
}

// Analyze each HTML page
const pageReport = [];
const metaRedirects = [];
const internalLinks = [];

for (const file of htmlFiles) {
  const rel = path.relative(distDir, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');

  // Compute site URL path for this file
  let pageUrlPath;
  if (rel === 'index.html') pageUrlPath = '/';
  else if (rel.endsWith('/index.html')) pageUrlPath = '/' + rel.replace('/index.html', '/');
  else pageUrlPath = '/' + rel;

  const fullPageUrl = `https://konsultank3.com${pageUrlPath}`;

  // 1. Extract Canonical
  const canonicalMatch = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
    || html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);
  
  const canonical = canonicalMatch ? canonicalMatch[1] : null;

  // 2. Extract Meta Refresh Redirects
  const refreshMatch = html.match(/<meta\s+[^>]*http-equiv=["']refresh["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  let metaRefresh = null;
  if (refreshMatch) {
    const content = refreshMatch[1];
    const urlMatch = content.match(/url=(.+)/i);
    metaRefresh = {
      raw: content,
      target: urlMatch ? urlMatch[1].trim() : content
    };
    metaRedirects.push({ file: rel, pageUrl: fullPageUrl, ...metaRefresh });
  }

  // 3. Extract Robots meta
  const robotsMatch = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const robots = robotsMatch ? robotsMatch[1] : 'index, follow (default)';

  // 4. Collect internal links on this page
  const aRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let aMatch;
  while ((aMatch = aRegex.exec(html)) !== null) {
    const href = aMatch[1];
    if (href.startsWith('/') && !href.startsWith('//')) {
      internalLinks.push({ from: pageUrlPath, to: href });
    }
  }

  // Check canonical status
  const isSelf = canonical === fullPageUrl;
  const inSitemap = sitemapUrls.has(fullPageUrl);

  pageReport.push({
    file: rel,
    pageUrl: fullPageUrl,
    pageUrlPath,
    canonical,
    isSelf,
    inSitemap,
    hasCanonical: !!canonical,
    metaRefresh: !!metaRefresh,
    robots
  });
}

console.log('====================================================');
console.log(' 🔍 REDIRECTS & CANONICALS AUDIT REPORT');
console.log('====================================================');
console.log(`Total HTML files analyzed: ${pageReport.length}`);
console.log(`Total URLs in sitemap.xml: ${sitemapUrls.size}`);
console.log('');

// Check Canonicals
console.log('--- 1. CANONICAL TAG AUDIT ---');
const missingCanonical = pageReport.filter(p => !p.hasCanonical);
console.log(`Pages with missing canonical: ${missingCanonical.length}`);
if (missingCanonical.length > 0) {
  console.log('Missing in:', missingCanonical.map(p => p.file));
}

const crossCanonicals = pageReport.filter(p => p.hasCanonical && !p.isSelf);
console.log(`Pages with cross-page canonicals (pointing to another URL): ${crossCanonicals.length}`);
crossCanonicals.forEach(p => {
  console.log(`  ↪ ${p.pageUrlPath} -> canonical: ${p.canonical} (in sitemap: ${p.inSitemap})`);
});

const selfCanonicals = pageReport.filter(p => p.hasCanonical && p.isSelf);
console.log(`Pages with valid self-referencing canonicals: ${selfCanonicals.length}`);

// Check for canonical targets validity
console.log('\n--- 2. CANONICAL TARGET RESOLUTION ---');
const allKnownUrls = new Set(pageReport.map(p => p.pageUrl));
const brokenCanonicalTargets = [];
for (const p of pageReport) {
  if (p.canonical && !allKnownUrls.has(p.canonical)) {
    brokenCanonicalTargets.push({ from: p.pageUrl, target: p.canonical });
  }
}
console.log(`Broken canonical targets: ${brokenCanonicalTargets.length}`);
if (brokenCanonicalTargets.length > 0) {
  console.log(brokenCanonicalTargets);
} else {
  console.log('✓ All canonical targets resolve to existing, live pages.');
}

// Check Sitemap Alignment
console.log('\n--- 3. SITEMAP ALIGNMENT AUDIT ---');
// Are all sitemap URLs canonical?
const sitemapNonCanonical = [];
for (const sUrl of sitemapUrls) {
  const match = pageReport.find(p => p.pageUrl === sUrl);
  if (!match) {
    sitemapNonCanonical.push({ url: sUrl, reason: 'URL in sitemap does not exist in dist' });
  } else if (!match.isSelf) {
    sitemapNonCanonical.push({ url: sUrl, reason: `URL in sitemap has non-self canonical: ${match.canonical}` });
  } else if (match.metaRefresh) {
    sitemapNonCanonical.push({ url: sUrl, reason: 'URL in sitemap has a redirect' });
  }
}
console.log(`Non-canonical or redirecting URLs in sitemap: ${sitemapNonCanonical.length}`);
if (sitemapNonCanonical.length > 0) {
  console.log(sitemapNonCanonical);
} else {
  console.log('✓ 100% of URLs in sitemap.xml are 200 OK, self-referencing canonicals.');
}

// Check Redirects
console.log('\n--- 4. REDIRECT AUDIT ---');
console.log(`Meta refresh redirects found: ${metaRedirects.length}`);
metaRedirects.forEach(r => {
  console.log(`  ↪ From: ${r.pageUrl} -> Redirects To: ${r.target}`);
});

console.log('\n--- 5. INTERNAL LINKS TO REDIRECTING URLS ---');
const redirectPaths = new Set(metaRedirects.map(r => new URL(r.pageUrl).pathname));
const linksToRedirects = internalLinks.filter(l => redirectPaths.has(l.to));
console.log(`Internal links pointing to redirecting URLs: ${linksToRedirects.length}`);
if (linksToRedirects.length > 0) {
  console.log(linksToRedirects);
} else {
  console.log('✓ No internal links point to redirecting URLs (all link directly to destination).');
}

// Check Server Configs
console.log('\n--- 6. SERVER REDIRECT CONFIGS (.htaccess / _redirects) ---');
if (Object.keys(foundServerConfigs).length === 0) {
  console.log('No static server redirect files (.htaccess, _redirects) found in repository root.');
} else {
  for (const [name, content] of Object.entries(foundServerConfigs)) {
    console.log(`Found config file: ${name}`);
    console.log(content.slice(0, 300));
  }
}
