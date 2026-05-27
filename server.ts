import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, type IncomingMessage } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { Pool } from 'pg';
import { personalMemoryRecords } from './src/lib/__fixtures__/personalMemoryRecords';
import { buildLiveHealthPayload } from './src/lib/localServerHealth';
import { createLocalPersonalMemoryHttpHandler } from './src/lib/localHttpTransport';
import { createMemoryStoreRuntime } from './src/lib/memoryStoreRuntime';
import { createLocalPrivateVaultSession } from './src/lib/privateVault';

const root = join(process.cwd(), 'dist');
const port = Number(process.env.PORT || 3000);
const localUserId = process.env.PMI_LOCAL_USER_ID || 'local-user';

const contentTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

function resolvePath(urlPath: string): string {
  const cleanPath = normalize(decodeURIComponent(urlPath.split('?')[0] ?? '/')).replace(/^\.\.(\/|\\|$)/, '');
  const candidate = join(root, cleanPath === '/' ? 'index.html' : cleanPath);
  if (!candidate.startsWith(root)) return join(root, 'index.html');
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    const indexCandidate = join(candidate, 'index.html');
    if (existsSync(indexCandidate) && statSync(indexCandidate).isFile()) return indexCandidate;
  }
  return join(root, 'index.html');
}

async function readRequestBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

const memoryRuntime = await createMemoryStoreRuntime({
  env: process.env,
  pgPool: Pool,
  fixtureSeedRecords: personalMemoryRecords,
  seedUserId: localUserId,
});

const apiHandler = createLocalPersonalMemoryHttpHandler({
  store: memoryRuntime.store,
  session: createLocalPrivateVaultSession({
    userId: localUserId,
    sessionId: 'local-dev-session',
    createdAt: '2026-05-27T17:30:00.000Z',
  }),
});

const server = createServer(async (req, res) => {
  if (req.url === '/health/live') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(buildLiveHealthPayload(memoryRuntime)));
    return;
  }

  const urlPath = req.url || '/';
  if (urlPath.startsWith('/api/')) {
    const response = await apiHandler({
      method: req.method || 'GET',
      path: urlPath.split('?')[0] || '/',
      bodyText: await readRequestBody(req),
    });
    res.writeHead(response.statusCode, response.headers);
    res.end(response.bodyText);
    return;
  }

  const filePath = resolvePath(urlPath);
  res.writeHead(200, { 'content-type': contentTypes[extname(filePath)] || 'application/octet-stream' });
  createReadStream(filePath).pipe(res);
});

async function shutdown(): Promise<void> {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await memoryRuntime.close();
}

process.once('SIGINT', () => {
  void shutdown().finally(() => process.exit(0));
});

process.once('SIGTERM', () => {
  void shutdown().finally(() => process.exit(0));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`personal-memory-ai-web listening on ${port}`);
});
