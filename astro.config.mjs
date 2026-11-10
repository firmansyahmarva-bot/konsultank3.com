import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frozenUrlsPath = path.join(__dirname, 'scripts', 'frozen-urls.txt');
const frozenUrls = fs.existsSync(frozenUrlsPath)
  ? fs.readFileSync(frozenUrlsPath, 'utf8')
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean)
  : [];

const frozenHtmlSet = new Set(
  frozenUrls.filter(u => u.endsWith('.html'))
);

// Check whether any published articles exist in the content collection
const artikelDir = path.join(__dirname, 'src', 'content', 'artikel');
let hasPublishedArticles = false;
if (fs.existsSync(artikelDir)) {
  const files = fs.readdirSync(artikelDir);
  for (const f of files) {
    if (!f.startsWith('_') && (f.endsWith('.md') || f.endsWith('.mdx'))) {
      const content = fs.readFileSync(path.join(artikelDir, f), 'utf8');
      if (!/draft:\s*true/i.test(content)) {
        hasPublishedArticles = true;
        break;
      }
    }
  }
}

// https://astro.build/config
export default defineConfig({
  site: 'https://konsultank3.com',
  build: {
    format: 'preserve'
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        // Exact path match for 404 and 410 error pages
        if (pathname === '/404' || pathname === '/404/' || pathname === '/404.html') return false;
        if (pathname === '/410' || pathname === '/410/' || pathname === '/410.html') return false;
        // Exclude 301 bridge page
        if (pathname === '/program-pengendalian-kebisingan-331' || pathname === '/program-pengendalian-kebisingan-331/' || pathname === '/program-pengendalian-kebisingan-331.html') return false;
        // Exclude /artikel/ from sitemap until at least one published article exists
        if (!hasPublishedArticles && (pathname === '/artikel' || pathname === '/artikel/')) return false;
        return true;
      },
      serialize: (item) => {
        const parsed = new URL(item.url);
        const pathname = parsed.pathname;
        const cleanPath = pathname.replace(/\/$/, '');
        const htmlCandidate = cleanPath.endsWith('.html') ? cleanPath : `${cleanPath}.html`;

        if (frozenHtmlSet.has(htmlCandidate) || frozenHtmlSet.has(pathname)) {
          item.url = `https://konsultank3.com${htmlCandidate}`;
        } else {
          const slashCandidate = pathname.endsWith('/') ? pathname : `${pathname}/`;
          item.url = `https://konsultank3.com${slashCandidate}`;
        }
        return item;
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
