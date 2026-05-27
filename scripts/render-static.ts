import { mkdir, writeFile } from 'node:fs/promises';
import { renderAppShellDocument } from '../src/App';
import { renderAppCaptureDocument, renderPwaManifest } from '../src/AppCapture';

await mkdir('dist', { recursive: true });
await mkdir('dist/capture', { recursive: true });
await writeFile('dist/index.html', renderAppShellDocument(), 'utf8');
await writeFile('dist/capture/index.html', renderAppCaptureDocument(), 'utf8');
await writeFile('dist/manifest.webmanifest', renderPwaManifest(), 'utf8');
