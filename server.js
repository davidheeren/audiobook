const http = require('http');
const fs = require('fs');
const path = require('path');

const base = __dirname; // Set base to the current directory

http.createServer((req, res) => {
  let requestedPath = req.url === '/' ? 'index.html' : req.url;
  let filePath = path.join(base, requestedPath);

  // Sanitize the path to prevent directory traversal
  if (!filePath.startsWith(base)) {
    res.writeHead(403); // Forbidden
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();

  const type = {
    '.html': 'text/html',
    '.js':   'application/javascript',
    '.css':  'text/css',
    '.mp3':  'audio/mpeg',
    '.json': 'application/json',
    '.png':  'image/png',
  }[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') { // File not found
        res.writeHead(404);
        res.end('Not found');
      } else { // Other errors (e.g., permissions)
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': type });
      res.end(data);
    }
  });
}).listen(3000, '0.0.0.0', () => {
  console.log('Server running at http://<your-ip>:3000/');
});