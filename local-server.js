// Lightweight Static Web Server for Nothing Phone (4a) website
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  // Decode URL in case of spaces/special characters
  let decodedUrl = decodeURIComponent(req.url);
  
  let filePath = '.' + decodedUrl;
  if (filePath === './') {
    filePath = './index.html';
  }

  // Remove query parameters or hash from filepath
  filePath = filePath.split('?')[0].split('#')[0];

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code} ..\n`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Nothing Phone (4a) Server started successfully!`);
  console.log(`🔗 Local link: http://localhost:${PORT}/`);
  console.log(`==================================================\n`);
});
