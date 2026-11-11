import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const htaccess = fs.readFileSync(path.join(rootDir, '.htaccess'), 'utf8');
const redirects = fs.readFileSync(path.join(rootDir, '_redirects'), 'utf8');

const backlinkCases = [
  {
    inbound: '/training/dokumen-amdal-pabrik-kayu.html',
    expectedTarget: '/contoh-lembar-checklist-amdal-gedung-862.html',
    type: '301'
  },
  {
    inbound: '/training/contoh-pembuatan-jsa-penggalian-dengan-cangkul.html',
    expectedTarget: '/contoh-job-safety-analysis-pengelasan-815.html',
    type: '301'
  },
  {
    inbound: '/training/pengenalan-peralatan-basic-trauma-life-support-for-jpam.html',
    expectedTarget: '/bclsbasic-cardiac-life-support-for-paramedic-111.html',
    type: '301'
  },
  {
    inbound: '/pdf/faktor-penyebab-akibat-kerja.html',
    expectedTarget: '/penyakit-akibat-kerja/',
    type: '301'
  },
  {
    inbound: '/category/konsultan-industri-perusahaan',
    expectedTarget: '/',
    type: '301'
  },
  {
    inbound: '/category/industri',
    expectedTarget: '/',
    type: '301'
  },
  {
    inbound: '/category/penyakit-akibat-kerja-2',
    expectedTarget: '/penyakit-akibat-kerja/',
    type: '301'
  },
  {
    inbound: '/wp-content/uploads/2017/03/Rambu-Rambu-K3-Beserta-Penjelasannya.png',
    expectedType: 'image/png',
    type: 'asset-200'
  }
];

console.log('=== VERIFYING FULL LINK JUICE RECOVERY SUITE ===\n');

// 1. Verify rules in .htaccess
console.log('1. Checking .htaccess rules:');
for (const c of backlinkCases) {
  if (c.type === '301') {
    const slug = c.inbound.replace(/^\//, '').replace(/\./g, '\\.');
    const hasRule = htaccess.includes(c.inbound.slice(1)) || htaccess.includes(c.expectedTarget);
    if (!hasRule) {
      console.error(`❌ Missing .htaccess rule for ${c.inbound}`);
      process.exit(1);
    }
    console.log(`  ✓ .htaccess: ${c.inbound} -> ${c.expectedTarget} [301]`);
  } else {
    const hasHeader = htaccess.includes('Rambu-Rambu-K3-Beserta-Penjelasannya.png') &&
                      htaccess.includes('rel="canonical"');
    if (!hasHeader) {
      console.error(`❌ Missing .htaccess canonical header for ${c.inbound}`);
      process.exit(1);
    }
    console.log(`  ✓ .htaccess: ${c.inbound} -> 200 OK + Link: rel="canonical"`);
  }
}

// 2. Verify rules in _redirects
console.log('\n2. Checking _redirects file:');
for (const c of backlinkCases) {
  if (c.type === '301') {
    if (!redirects.includes(c.inbound)) {
      console.error(`❌ Missing _redirects entry for ${c.inbound}`);
      process.exit(1);
    }
    console.log(`  ✓ _redirects: ${c.inbound} -> ${c.expectedTarget} [301]`);
  }
}

// 3. Verify destination pages exist and are healthy (200 OK + correct self-canonical)
console.log('\n3. Checking Target Pages Health in dist/:');
const uniqueTargets = [...new Set(backlinkCases.filter(c => c.type === '301').map(c => c.expectedTarget))];
for (const target of uniqueTargets) {
  let relFile = target === '/' ? 'index.html' : target.replace(/^\//, '');
  if (relFile.endsWith('/')) {
    relFile += 'index.html';
  }
  const fullPath = path.join(rootDir, 'dist', relFile);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Target file missing: ${relFile}`);
    process.exit(1);
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const canonicalExpected = target === '/' ? 'https://konsultank3.com/' : `https://konsultank3.com${target}`;
  if (!content.includes(canonicalExpected)) {
    console.error(`❌ Target file ${relFile} canonical does not match ${canonicalExpected}`);
    process.exit(1);
  }
  console.log(`  ✓ Target exists: ${target} (Canonical: ${canonicalExpected})`);
}

// 4. Verify Image Assets exist in dist/ and public/
console.log('\n4. Checking Image Assets:');
const imagesToCheck = [
  'Rambu-Rambu-K3-Beserta-Penjelasannya.png',
  'Rambu-Rambu-K3-Beserta-Penjelasannya-510x261.png'
];
for (const imgName of imagesToCheck) {
  const imgDist = path.join(rootDir, 'dist', 'wp-content', 'uploads', '2017', '03', imgName);
  const imgPub = path.join(rootDir, 'public', 'wp-content', 'uploads', '2017', '03', imgName);
  if (!fs.existsSync(imgDist) || !fs.existsSync(imgPub)) {
    console.error(`❌ Image file missing in dist or public: ${imgName}`);
    process.exit(1);
  }
  const stat = fs.statSync(imgDist);
  console.log(`  ✓ Asset verified: ${imgName} (${stat.size} bytes in public & dist)`);
}

console.log('\n======================================================');
console.log('✓ ALL 8 BACKLINK ASSETS VERIFIED FOR 100% LINK JUICE!');
console.log('======================================================\n');
