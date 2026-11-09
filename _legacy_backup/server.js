const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

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
  '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];

  // Emulate .htaccess 301 redirects
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

  // If path is a directory or ends with slash, look for index.html
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
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // 404 handler
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
  console.log(`Server running at http://localhost:${PORT}/`);
});
