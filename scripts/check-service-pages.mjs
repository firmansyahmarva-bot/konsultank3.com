import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const servicePages = [
  'pelatihan-k3-kebakaran',
  'pelatihan-k3-listrik',
  'pelatihan-ahli-k3-umum',
  'pelatihan-k3-ruang-terbatas',
  'pelatihan-pppa-popal',
  'pelatihan-pppu-poippu'
];

function countWords(text) {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

const requiredHeadings = [
  'Apa itu',
  'Jenjang / Jenis Pelatihan',
  'Dasar Hukum',
  'Silabus Pembelajaran',
  'Alur Pelatihan dan Ujian',
  'Persyaratan Peserta',
  'Pertanyaan yang Sering Diajukan'
];

const forbiddenStrings = [
  'Garansi',
  'Kuota Terbatas',
  'Batch Terdekat:',
  '3 – 6 Hari',
  '3 &ndash; 6 Hari',
  '3 - 6 Hari'
];

let totalErrors = 0;

for (const page of servicePages) {
  console.log(`\n========================================`);
  console.log(`Checking service page: ${page}`);
  console.log(`========================================`);

  const htmlPath = fs.existsSync(path.join(distDir, page, 'index.html'))
    ? path.join(distDir, page, 'index.html')
    : path.join(rootDir, page, 'index.html');

  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ FAILED: File not found: ${htmlPath}`);
    totalErrors++;
    continue;
  }

  const html = fs.readFileSync(htmlPath, 'utf8');

  // 1. Word count >= 1400
  const words = countWords(html);
  if (words < 1400) {
    console.error(`❌ FAILED: Word count is ${words} (< 1400 words)`);
    totalErrors++;
  } else {
    console.log(`✓ Word count: ${words} (>= 1400)`);
  }

  // 2. Required headings
  for (const heading of requiredHeadings) {
    const headingRegex = new RegExp(`<h[1-4][^>]*>[\\s\\S]*?${heading.replace('/', '\\/')}[\\s\\S]*?<\\/h[1-4]>`, 'i');
    if (!headingRegex.test(html) && !html.includes(heading)) {
      console.error(`❌ FAILED: Missing heading "${heading}"`);
      totalErrors++;
    } else {
      console.log(`✓ Contains heading "${heading}"`);
    }
  }

  // 3. Has >= 7 FAQ questions
  const faqItems = (html.match(/class=["'][^"']*faq-item[^"']*["']/gi) || []).length;
  const faqH3s = (html.match(/<h3[^>]*>[\s\S]*?\?[\s\S]*?<\/h3>/gi) || []).length;
  const faqCount = Math.max(faqItems, faqH3s);

  if (faqCount < 7) {
    console.error(`❌ FAILED: Found only ${faqCount} FAQ questions (< 7)`);
    totalErrors++;
  } else {
    console.log(`✓ Contains ${faqCount} FAQ questions (>= 7)`);
  }

  // 4. Forbidden strings
  for (const forbidden of forbiddenStrings) {
    if (html.includes(forbidden)) {
      console.error(`❌ FAILED: Contains forbidden string "${forbidden}"`);
      totalErrors++;
    } else {
      console.log(`✓ Does not contain "${forbidden}"`);
    }
  }
}

if (totalErrors > 0) {
  console.error(`\n❌ Service page checks FAILED with ${totalErrors} error(s)!`);
  process.exit(1);
} else {
  console.log(`\n✓ All ${servicePages.length} service page checks PASSED!`);
  process.exit(0);
}
