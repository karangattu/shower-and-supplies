const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT || 41731);
const root = path.resolve(__dirname, '..');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
};

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://127.0.0.1:${port}`).pathname);
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(root, `.${requestedPath}`);

  if (!filePath.startsWith(root)) {
    return null;
  }

  return filePath;
}

const server = http.createServer((request, response) => {
  const filePath = resolveRequestPath(request.url);

  if (!filePath) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
    });
    response.end(content);
  });
});

server.listen(port, '127.0.0.1');
