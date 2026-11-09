import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://konsultank3.com',
  build: {
    format: 'preserve'
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404') && !page.includes('/410') && !page.includes('program-pengendalian-kebisingan-331'),
      serialize: (item) => {
        const url = item.url;
        // If it's a legacy article or download, ensure .html
        if (url.match(/(-[0-9]{2,4}|Checklist|Formulir|Tabel|audit-sdm)/) && !url.endsWith('.html')) {
          item.url = `${url.replace(/\/$/, '')}.html`;
        } else if (!url.endsWith('/') && !url.endsWith('.html')) {
          item.url = `${url}/`;
        }
        return item;
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
