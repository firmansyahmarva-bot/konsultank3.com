import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const htmlPath = fs.existsSync(path.join(distDir, 'pelatihan-k3-kebakaran', 'index.html'))
  ? path.join(distDir, 'pelatihan-k3-kebakaran', 'index.html')
  : path.join(rootDir, 'pelatihan-k3-kebakaran', 'index.html');

console.log(`Checking service page: ${htmlPath}`);

if (!fs.existsSync(htmlPath)) {
  console.error(`❌ FAILED: File not found: ${htmlPath}`);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');

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

let hasErrors = false;

// 1. Word count >= 1400
const words = countWords(html);
if (words < 1400) {
  console.error(`❌ FAILED: Word count is ${words} (< 1400 words)`);
  hasErrors = true;
} else {
  console.log(`✓ Word count: ${words} (>= 1400)`);
}

// 2. Required headings: "Dasar Hukum", "Alur Pelatihan dan Ujian", "Pertanyaan yang Sering Diajukan"
const requiredHeadings = [
  'Dasar Hukum',
  'Alur Pelatihan dan Ujian',
  'Pertanyaan yang Sering Diajukan'
];

for (const heading of requiredHeadings) {
  const headingRegex = new RegExp(`<h[1-4][^>]*>[\\s\\S]*?${heading}[\\s\\S]*?<\\/h[1-4]>`, 'i');
  if (!headingRegex.test(html) && !html.includes(heading)) {
    console.error(`❌ FAILED: Missing heading "${heading}"`);
    hasErrors = true;
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
  hasErrors = true;
} else {
  console.log(`✓ Contains ${faqCount} FAQ questions (>= 7)`);
}

// 4. Does not contain "3 – 6 Hari" or "Garansi 100%"
if (html.includes('3 – 6 Hari') || html.includes('3 &ndash; 6 Hari') || html.includes('3 - 6 Hari')) {
  console.error(`❌ FAILED: Contains forbidden string "3 – 6 Hari"`);
  hasErrors = true;
} else {
  console.log(`✓ Does not contain "3 – 6 Hari"`);
}

if (html.includes('Garansi 100%')) {
  console.error(`❌ FAILED: Contains forbidden string "Garansi 100%"`);
  hasErrors = true;
} else {
  console.log(`✓ Does not contain "Garansi 100%"`);
}

if (hasErrors) {
  console.error('\n❌ Service page checks FAILED!');
  process.exit(1);
} else {
  console.log('\n✓ All service page checks PASSED!');
  process.exit(0);
}
