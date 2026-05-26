#!/usr/bin/env python3
"""External runner for Personal Memory AI RPI.
Runs outside the problematic Documents checkout so Python import startup does not
scan the unreadable repo script directory. It writes state under ~/.hermes/rpi and
invokes Codex against the repo one bounded cycle at a time.
"""
from __future__ import annotations

import argparse, json, shlex, subprocess
from datetime import datetime, timezone
from pathlib import Path

DEFAULT_REPO = Path('/Users/goyunseo/Documents/Codex/2026-05-25/personal-memory-ai')
DEFAULT_STATE_DIR = Path('/Users/goyunseo/.hermes/rpi/personal-memory-foundation')

CONSTRAINTS = '''# User Review Constraints
- North star: 나보다 나를 더 잘 아는 개인 기억 AI.
- Notion/Obsidian/Markdown imports are P0.
- Core loop: app quick diary capture/import -> MemoryRecord -> web second-brain graph -> pattern detection -> Ask My Past Self -> Decision Replay -> graph evidence.
- Graph is evidence layer, not the product.
- No generic advice without memory citations.
- Label statuses: implemented, partial, skeleton, fake/sample, planned, blocked.
- Never read/print secrets, .env, OAuth codes, tokens, passwords, keychain values.
- Default mode can stop after each cycle for Ko Yunseo review, but if Ko asks for continuous execution, run automatically and emit review artifacts/checkpoints instead of idling.
- App development is in scope: app means fast diary/memory capture; web means second-brain graph/analysis workspace. Do not collapse them into one generic web dashboard.
- Delivery target for the web surface is browser/URL/web runtime/responsive UI. Native iOS/Android/macOS app is later unless explicitly requested, but the app-capture flow must be specified/prototyped now.
- Product requirement is two-surface behavior, not static-web output: quick app diary capture plus persistent web second-brain visualization/analysis with remembered context and evidence-backed AI actions.
- A marketing site, landing page, demo page, disconnected dashboard, or graph-only demo is insufficient for completion.
- Previously planned surfaces must be implemented or explicitly labeled: app quick diary capture, web graph workspace, import preview, Ask My Past Self, pattern panel, Decision Replay, weekly report, evidence drawer.
- Frontend completion reports need screenshot/visual evidence, not only tests.
'''

BACKLOG = [
  {
    'id':'pattern-detector-v1',
    'title':'Pattern detector v1 over imported/captured MemoryRecord fixtures',
    'goal':'Implement deterministic repeated-pattern detection over MemoryRecord data, including anxiety -> scope expansion -> launch delay fixtures.',
    'expected_files':['src/lib/patternDetector.ts','src/lib/patternDetector.test.ts','src/lib/__fixtures__/personalMemoryRecords.ts'],
    'acceptance':['uses MemoryRecord, not UI-only samples','returns pattern id/title/confidence/supporting memory ids/emotions/decisions/outcomes/explanation','includes freeze-vs-feature-addition fixture','labels insufficient evidence']
  },
  {
    'id':'ask-my-past-self-contract',
    'title':'Ask My Past Self answer contract with citations + graph highlight ids',
    'goal':'Implement evidence-backed Ask My Past Self answer builder with citations and graph highlight ids.',
    'expected_files':['src/lib/askMyPastSelf.ts','src/lib/askMyPastSelf.test.ts'],
    'acceptance':['evidence bullets + recommendation + citation ids + graphHighlightIds','highlights current question/related memories/emotion/decision/outcome','insufficient evidence instead of generic advice','works with imported records']
  },
  {
    'id':'decision-replay-v1',
    'title':'Decision Replay v1 contract',
    'goal':'Compare current decision with similar past decisions and return structured evidence/recommendation/uncertainty.',
    'expected_files':['src/lib/decisionReplay.ts','src/lib/decisionReplay.test.ts'],
    'acceptance':['current decision, similar past decisions, emotions, choices, outcomes, citations, pattern, recommendation, confidence','graph highlight ids','insufficient evidence fallback']
  },
  {
    'id':'graph-evidence-contract',
    'title':'Graph evidence contract for Ask/Pattern/Decision Replay',
    'goal':'Add typed graph evidence adapter so UI can highlight evidence nodes/edges from Ask, patterns, and Decision Replay.',
    'expected_files':['src/lib/graphEvidence.ts','src/lib/graphEvidence.test.ts'],
    'acceptance':['stable graph node ids','all highlights trace to MemoryRecord or current query','evidence drawer payload with source/date/citation/status']
  },
  {
    'id':'fast-diary-capture-app-contract',
    'title':'App fast diary/memory capture contract',
    'goal':'Specify and implement the fast app-side diary capture path that turns quick memory entries into MemoryRecord data for the web second-brain. This may be a prototype/contract in the current repo if native app tooling is absent, but it must not be confused with the web graph workspace.',
    'expected_files':['src/lib/fastDiaryCapture.ts','src/lib/fastDiaryCapture.test.ts'],
    'acceptance':['fast text-first diary capture input model','timestamp/source metadata','optional emotion/decision/project hints','outputs MemoryRecord-compatible data','clearly labeled app-capture contract/prototype when not native']
  },
  {
    'id':'import-preview-ui-contract',
    'title':'Import preview UI contract and integration seam',
    'goal':'Create integration seam for import preview with records, duplicates, provenance, apply/undo actions.',
    'expected_files':['src/lib/importPreview.ts','src/lib/importPreview.test.ts'],
    'acceptance':['summary by source/date/duplicates/status','status labels','no live OAuth requirement for P0']
  },
  {
    'id':'app-shell-evidence-layout',
    'title':'Web second-brain first-screen graph workspace with panels and evidence drawer',
    'goal':'Implement or wire the web second-brain shell so the first web screen is a memory-brain graph: diary entries captured from the app and imported memories are primary nodes connected by emotion/project/decision/outcome/source. Ask, pattern, import preview, Decision Replay, and evidence drawer support the web graph rather than replacing it.',
    'expected_files':['src/App.tsx','src/components/MemoryGraph.tsx','src/components/EvidenceDrawer.tsx','src/components/PatternPanel.tsx'],
    'acceptance':['visible app shell exists','first screen is an initial loaded daily diary memory-brain graph','daily diary/imported memory entries are primary nodes linked by emotion/project/decision/outcome/source','planned/skeleton/fake surfaces are labeled','screenshot of initial loaded memory-brain graph is required','no library-only completion claim']
  },
  {
    'id':'ask-graph-visual-flow',
    'title':'Ask My Past Self visual flow with citations and graph highlight',
    'goal':'Wire Ask My Past Self into the frontend so the contract question shows cited answer, citation list, graph highlights, and evidence drawer.',
    'expected_files':['src/App.tsx','src/components/AskMyPastSelfPanel.tsx','src/components/MemoryGraph.tsx','src/components/EvidenceDrawer.tsx'],
    'acceptance':['question input visible','answer includes citations','graph highlights current question/memory/emotion/decision/outcome','screenshot evidence required before completion']
  },
  {
    'id':'decision-replay-visual-flow',
    'title':'Decision Replay visual flow',
    'goal':'Wire Decision Replay into the frontend with similar decisions, emotions, choices, outcomes, citations, recommendation/uncertainty, and graph highlights.',
    'expected_files':['src/App.tsx','src/components/DecisionReplayPanel.tsx','src/components/MemoryGraph.tsx','src/components/EvidenceDrawer.tsx'],
    'acceptance':['current decision input visible','similar decisions with citations visible','graph highlights relevant nodes','screenshot evidence required before completion']
  },
  {
    'id':'weekly-report-and-capture',
    'title':'Weekly report and new memory capture app surfaces',
    'goal':'Add app surfaces for weekly/recent pattern report and manual new memory capture, both backed by MemoryRecord evidence/status labels.',
    'expected_files':['src/App.tsx','src/components/WeeklyPatternReport.tsx','src/components/NewMemoryCapture.tsx'],
    'acceptance':['weekly report visible with citations or insufficient evidence','new memory capture creates MemoryRecord-compatible data','graph/evidence can update from capture','status labels visible']
  },
  {
    'id':'visual-verification-package',
    'title':'Frontend visual verification package',
    'goal':'Run local app/build where possible and produce visual evidence for import preview, Ask answer, graph highlight, and Decision Replay.',
    'expected_files':['docs/rpi/visual-verification.md'],
    'acceptance':['typecheck/build results recorded','screenshots or explicit blocker paths recorded','Paperclip checkpoint includes visual evidence','no production/private-beta claim without evidence']
  },
]

def now(): return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')
def jread(p):
    return json.loads(p.read_text()) if p.exists() else {'completed_backlog_ids':[], 'cycles':[]}
def jwrite(p,d):
    p.parent.mkdir(parents=True, exist_ok=True); p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def next_task(state):
    done=set(state.get('completed_backlog_ids',[]))
    return next((x for x in BACKLOG if x['id'] not in done), None)
def run(cmd,cwd,log,timeout=None):
    log.parent.mkdir(parents=True,exist_ok=True)
    with log.open('w') as f:
        f.write('$ '+' '.join(shlex.quote(x) for x in cmd)+'\n\n'); f.flush()
        try:
            r=subprocess.run(cmd,cwd=str(cwd),stdout=f,stderr=subprocess.STDOUT,text=True,timeout=timeout)
            f.write(f'\n[exit_code] {r.returncode}\n'); return r.returncode
        except subprocess.TimeoutExpired:
            f.write('\n[timeout]\n'); return 124
        except Exception as e:
            f.write(f'\n[exception] {type(e).__name__}: {e}\n'); return 125

def prompt(task):
    return f'''Implement one bounded RPI cycle in personal-memory-ai.

Task: {task['id']} — {task['title']}
Goal: {task['goal']}
Expected files:\n{chr(10).join('- '+x for x in task['expected_files'])}
Acceptance:\n{chr(10).join('- '+x for x in task['acceptance'])}

Hard constraints:\n{CONSTRAINTS}

Rules: add/update tests where practical; keep this cycle narrow; no secrets; stop after this task; document blockers honestly.
Environment: do not run `npx` dependency fetch/install commands. If a tool is unavailable offline, document the blocker clearly and still complete code scaffolding with explicit status markers.'''

def verify(repo, cdir, task=None):
    """Verify code plus cycle acceptance gates.

    This is intentionally stricter than the early harness. A cycle is not
    "verified" just because Codex exits 0 and a small TS subset compiles.
    For frontend cycles, required files and real screenshot artifacts must exist.
    """
    results = []

    def record(name, code, detail=''):
        results.append((name, code, detail))
        return code

    package_json = repo / 'package.json'
    local_tsc = repo / 'node_modules' / '.bin' / 'tsc'

    # Prefer repo scripts so UI/components/tests are included. Do not fetch deps here.
    if package_json.exists() and local_tsc.exists():
        record('npm run typecheck', run(['npm', 'run', 'typecheck'], repo, cdir/'verify-typecheck.log', 300))
        record('npm test', run(['npm', 'test'], repo, cdir/'verify-test.log', 300))
    else:
        candidates=['src/lib/memoryRecord.ts','src/lib/importers/markdownImporter.ts','src/lib/importers/notionExportImporter.ts','src/lib/importBatch.ts','src/lib/patternDetector.ts','src/lib/askMyPastSelf.ts','src/lib/decisionReplay.ts','src/lib/graphEvidence.ts','src/lib/importPreview.ts']
        files=[str(repo/x) for x in map(Path,candidates) if (repo/x).exists()]
        if not files:
            record('typescript subset', 1, 'No files found')
        elif local_tsc.exists():
            args = ['--pretty', 'false', '--noEmit', '--strict', '--moduleResolution', 'bundler', '--module', 'esnext', '--target', 'es2022', *files]
            record('typescript subset', run([str(local_tsc), *args], Path('/'), cdir/'verify-typecheck.log', 240))
        else:
            record('typescript subset', 127, 'local node_modules/.bin/tsc missing; refusing npx fetch in harness')

    if task:
        missing = [f for f in task.get('expected_files', []) if not (repo / f).exists()]
        record('expected files', 0 if not missing else 2, 'missing: ' + ', '.join(missing) if missing else 'all present')

        needs_screenshot = any('screenshot' in a.lower() or 'visual' in a.lower() for a in task.get('acceptance', []))
        if needs_screenshot:
            artifact_dir = repo / 'artifacts' / task['id']
            pngs = sorted(artifact_dir.glob('*.png')) if artifact_dir.exists() else []
            valid_pngs = [p for p in pngs if p.stat().st_size > 1000]
            detail = 'valid pngs: ' + ', '.join(str(p) for p in valid_pngs) if valid_pngs else f'no >1KB PNG in {artifact_dir}'
            record('visual artifact', 0 if valid_pngs else 3, detail)

    summary = ['# verify summary']
    for name, code, detail in results:
        summary.append(f'- {name}: exit {code}' + (f' — {detail}' if detail else ''))
    exit_code = 0 if results and all(code == 0 for _, code, _ in results) else 1
    summary.append(f'overall: {exit_code}')
    (cdir/'verify.log').write_text('\n'.join(summary) + '\n')
    return exit_code

def write_review(sdir,cdir,task,result):
    text=f'''# RPI Review — {task['title']}

- Status: `{result['status']}`
- Cycle: {result['cycle']}
- Task id: `{task['id']}`
- Started: {result['started_at']}
- Finished: {result['finished_at']}
- Codex exit: {result['codex_exit_code']}
- Verify exit: {result['verify_exit_code']}

## Allowed files
{chr(10).join('- `'+x+'`' for x in task['expected_files'])}

## Acceptance checklist
{chr(10).join('- [ ] '+x for x in task['acceptance'])}

## Ko Yunseo review
- Does this preserve “나보다 나를 더 잘 아는 개인 기억 AI”?
- Are imports P0?
- Are citations/evidence ids present where advice is generated?
- Are fake/sample/skeleton parts labeled?

## Logs
- Codex: `{cdir/'codex.log'}`
- Verify: `{cdir/'verify.log'}`
- State: `{sdir/'state.json'}`
'''
    (cdir/'review.md').write_text(text)
    (sdir/'review').mkdir(parents=True,exist_ok=True)
    (sdir/'review/latest.md').write_text(text)

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--repo',default=str(DEFAULT_REPO)); ap.add_argument('--state-dir',default=str(DEFAULT_STATE_DIR)); ap.add_argument('--dry-run',action='store_true'); ap.add_argument('--max-cycles',type=int,default=1); ap.add_argument('--review-gate',default='each-cycle',choices=['each-cycle','none']); ap.add_argument('--codex-mode',default='workspace-write',choices=['workspace-write','prompt-only']); args=ap.parse_args()
    repo=Path(args.repo); sdir=Path(args.state_dir); state_path=sdir/'state.json'; sdir.mkdir(parents=True,exist_ok=True)
    (sdir/'constraints.md').write_text(CONSTRAINTS); (sdir/'backlog.json').write_text(json.dumps(BACKLOG,ensure_ascii=False,indent=2)+'\n')
    state=jread(state_path); state.update({'repo':str(repo),'state_dir':str(sdir),'updated_at':now(),'review_gate':args.review_gate,'status':state.get('status','active')}); jwrite(state_path,state)
    if args.dry_run:
        print(json.dumps({'dry_run':True,'next_task':next_task(state),'state_path':str(state_path),'constraints_path':str(sdir/'constraints.md')},ensure_ascii=False,indent=2)); return 0
    for _ in range(args.max_cycles):
        task=next_task(state)
        if not task: state['status']='complete'; jwrite(state_path,state); print('complete'); return 0
        n=len(state.get('cycles',[]))+1; cdir=sdir/'logs'/f'cycle-{n:03d}-{task["id"]}'; cdir.mkdir(parents=True,exist_ok=True); (cdir/'prompt.md').write_text(prompt(task))
        started=now(); code=0 if args.codex_mode=='prompt-only' else run(['codex','exec','--sandbox','workspace-write','--skip-git-repo-check',prompt(task)], repo, cdir/'codex.log', 3600)
        vcode=verify(repo,cdir,task) if code==0 else None
        passed = code == 0 and vcode == 0
        status = ('review_required' if args.review_gate == 'each-cycle' else 'verified') if passed else 'blocked'
        finished=now()
        result={'cycle':n,'task_id':task['id'],'title':task['title'],'status':status,'started_at':started,'finished_at':finished,'cycle_dir':str(cdir),'codex_exit_code':code,'verify_exit_code':vcode,'review_path':str(cdir/'review.md'),'review_gate':args.review_gate}
        write_review(sdir,cdir,task,result); state.setdefault('cycles',[]).append(result); state['updated_at']=now(); state['status']=status
        if passed:
            state.setdefault('completed_backlog_ids',[]).append(task['id'])
        jwrite(state_path,state); print(json.dumps(result,ensure_ascii=False,indent=2))
        if not passed:
            return 1
        if args.review_gate == 'each-cycle':
            return 0
        # Continuous mode: keep moving to the next backlog item until max-cycles,
        # completion, timeout, or a real verification/blocker failure.
    state['status']='active' if next_task(state) else 'complete'
    state['updated_at']=now(); jwrite(state_path,state)
    return 0
if __name__=='__main__': raise SystemExit(main())

