#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  const parsedUrl = url.parse(req.url);
  let pathname = `.${parsedUrl.pathname}`;

  // Default to index.html
  if (pathname === './') {
    pathname = './web/index.html';
  } else if (pathname.startsWith('./web/')) {
    // Already has web prefix
  } else {
    pathname = `./web${parsedUrl.pathname}`;
  }

  const ext = path.parse(pathname).ext;
  const mimeType = mimeTypes[ext] || 'text/plain';

  fs.readFile(pathname, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('File not found');
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', mimeType);
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 BombLang Web REPL server running at http://localhost:${PORT}`);
  console.log(`💣 Open your browser and start bombing!`);
});
