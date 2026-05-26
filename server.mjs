import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createServer } from 'node:http';
import { renderAppShellDocument } from './src/App.tsx';

const root = join(process.cwd(), 'dist');
const port = Number(process.env.PORT || 3000);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

function resolvePath(urlPath) {
  const cleanPath = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^\.\.(\/|\\|$)/, '');
  const candidate = join(root, cleanPath === '/' ? 'index.html' : cleanPath);
  if (!candidate.startsWith(root)) return join(root, 'index.html');
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  return join(root, 'index.html');
}

createServer((req, res) => {
  if (req.url === '/health/live') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'personal-memory-ai-web' }));
    return;
  }
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const variant = requestUrl.searchParams.get('variant');
  if (requestUrl.pathname === '/' && variant) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(renderAppShellDocument(variant));
    return;
  }
  const filePath = resolvePath(req.url || '/');
  res.writeHead(200, { 'content-type': contentTypes[extname(filePath)] || 'application/octet-stream' });
  createReadStream(filePath).pipe(res);
}).listen(port, '0.0.0.0', () => {
  console.log(`personal-memory-ai-web listening on ${port}`);
});
