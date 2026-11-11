import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const ROOT = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];

  // 301 Redirects
  const redirectMap = {
    '/training/dokumen-amdal-pabrik-kayu.html': '/contoh-lembar-checklist-amdal-gedung-862.html',
    '/training/contoh-pembuatan-jsa-penggalian-dengan-cangkul.html': '/contoh-job-safety-analysis-pengelasan-815.html',
    '/training/pengenalan-peralatan-basic-trauma-life-support-for-jpam.html': '/bclsbasic-cardiac-life-support-for-paramedic-111.html',
    '/pdf/faktor-penyebab-akibat-kerja.html': '/penyakit-akibat-kerja/',
    '/category/konsultan-industri-perusahaan': '/',
    '/category/konsultan-industri-perusahaan/': '/',
    '/category/industri': '/',
    '/category/industri/': '/',
    '/category/penyakit-akibat-kerja-2': '/penyakit-akibat-kerja/',
    '/category/penyakit-akibat-kerja-2/': '/penyakit-akibat-kerja/',
    '/rambu-rambu-k3-beserta-penjelasannya-993.html': '/alat-pelindung-diri/',
    '/program-pengendalian-kebisingan-331.html': '/program-pengendalian-kebisingan/',
    '/privacy-policy': '/kebijakan-privasi/',
    '/privacy-policy/': '/kebijakan-privasi/',
    '/hubungi-kami': '/kontak/',
    '/hubungi-kami/': '/kontak/',
    '/arsip': '/',
    '/arsip/': '/'
  };

  if (redirectMap[reqUrl]) {
    res.writeHead(301, { 'Location': redirectMap[reqUrl] });
    return res.end();
  }

  // Legacy 301 Redirects
  if (reqUrl === '/program-pengendalian-kebisingan-331.html') {
    res.writeHead(301, { 'Location': '/program-pengendalian-kebisingan/' });
    return res.end();
  }
  if (reqUrl === '/privacy-policy' || reqUrl === '/privacy-policy/') {
    res.writeHead(301, { 'Location': '/kebijakan-privasi/' });
    return res.end();
  }
  if (reqUrl === '/hubungi-kami' || reqUrl === '/hubungi-kami/') {
    res.writeHead(301, { 'Location': '/kontak/' });
    return res.end();
  }

  let filePath = path.join(ROOT, decodeURIComponent(reqUrl));

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '/index.html')) {
    filePath = filePath + '/index.html';
  } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    const headers = { 'Content-Type': mime };
    if (filePath.endsWith('Rambu-Rambu-K3-Beserta-Penjelasannya.png')) {
      headers['Link'] = '<https://konsultank3.com/alat-pelindung-diri/>; rel="canonical"';
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    }
    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  } else {
    const notFoundPage = path.join(ROOT, '404.html');
    if (fs.existsSync(notFoundPage)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(notFoundPage).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Local production server running at http://localhost:${PORT}/ serving dist/`);
});
