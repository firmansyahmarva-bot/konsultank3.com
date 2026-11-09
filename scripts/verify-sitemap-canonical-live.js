import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '..', 'dist');

const sitemap = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)].map(m => m[1]);

console.log('=== VERIFYING SITEMAP VS LIVE ON-PAGE CANONICALS ===');
console.log('Total URLs found in sitemap.xml:', locs.length);

let mismatches = [];
let redirectPagesInSitemap = [];

for (const url of locs) {
  const pathPart = url.replace('https://konsultank3.com', '');
  let filePath;
  if (pathPart === '' || pathPart === '/') {
    filePath = path.join(distDir, 'index.html');
  } else if (pathPart.endsWith('/')) {
    filePath = path.join(distDir, pathPart, 'index.html');
  } else {
    filePath = path.join(distDir, pathPart);
  }

  if (!fs.existsSync(filePath)) {
    mismatches.push({ url, issue: `File not found on disk: ${filePath}` });
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const canonicalMatch = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    || html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  
  const onPageCanonical = canonicalMatch ? canonicalMatch[1] : 'MISSING';

  // Check if page has meta refresh redirect
  if (html.includes('http-equiv="refresh"')) {
    redirectPagesInSitemap.push({ url, issue: 'Page in sitemap contains http-equiv refresh redirect!' });
  }

  if (onPageCanonical !== url) {
    mismatches.push({
      sitemapUrl: url,
      onPageCanonical,
      file: filePath
    });
  }
}

console.log('Redirecting pages in sitemap:', redirectPagesInSitemap.length);
if (redirectPagesInSitemap.length > 0) {
  console.log(redirectPagesInSitemap);
}

console.log('Mismatches between sitemap URL and on-page canonical:', mismatches.length);
if (mismatches.length > 0) {
  console.log(mismatches);
} else {
  console.log('✓ 100% PERFECT MATCH! Every URL in sitemap.xml matches the on-page canonical exactly.');
}
