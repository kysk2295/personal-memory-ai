import { mkdir, writeFile } from 'node:fs/promises';
import { renderAppShellDocument } from '../src/App';

await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', renderAppShellDocument(), 'utf8');
