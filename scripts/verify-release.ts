import { execFileSync } from 'node:child_process';
import { buildReleaseChecklist } from '../src/lib/releaseChecklist';

function git(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

const localUrl = process.env.PMI_LOCAL_URL ?? 'http://127.0.0.1:3001';
const checklist = buildReleaseChecklist({
  localUrl,
  branch: git(['rev-parse', '--abbrev-ref', 'HEAD']),
  commitSha: git(['rev-parse', '--short', 'HEAD']),
});

console.log(JSON.stringify(checklist, null, 2));
