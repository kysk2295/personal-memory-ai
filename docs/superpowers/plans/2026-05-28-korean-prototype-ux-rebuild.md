# Korean Prototype UX Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the first screen feel like a usable Korean prototype for quick diary capture/import, private second brain graph, related past memories, grounded AI session, and saveback.

**Architecture:** Keep the existing data/API/session engine intact and rebuild the visible first-screen contract around it. Add Playwright markers that fail if the screen slips back into English-heavy internal tooling instead of the user's diary-to-memory product flow.

**Tech Stack:** Vite/TypeScript, static HTML renderer in `src/App.tsx`, Playwright evidence script, Cytoscape graph runtime, local API on port 3001.

---

### Task 1: Failing UX Contract Evidence

**Files:**
- Modify: `scripts/verify-playwright-evidence.ts`

- [ ] **Step 1: Add prototype UX assertions**

Add assertions after the local page loads:

```ts
assert((await attribute(page, '.second-brain-shell', 'data-prototype-ux')) === 'korean-usable-mvp', 'Expected Korean usable MVP prototype marker');
assert((await page.locator('[data-prototype-flow="tonight-usable"]').count()) === 1, 'Expected visible tonight-usable product flow');
for (const step of ['quick-diary', 'diary-import', 'second-brain', 'related-memories', 'ai-session', 'saveback']) {
  assert((await page.locator(`[data-primary-flow-step="${step}"]`).count()) === 1, `Missing primary product flow step ${step}`);
}
assert((await attribute(page, '[data-llm-wiki-visible="true"]', 'data-llm-wiki-visible')) === 'true', 'Expected visible LLM Wiki memory structure panel');
assert((await page.locator('text=AI 세션 실행').count()) > 0, 'Expected Korean AI session action');
assert((await page.locator('text=세션 저장').count()) > 0, 'Expected Korean save session action');
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright
```

Expected: FAIL with missing Korean usable MVP marker or missing primary flow step.

### Task 2: First-Screen Korean Prototype Shell

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add the shell contract marker**

Set the root shell attributes:

```html
data-prototype-ux="korean-usable-mvp"
data-product-goal="quick-diary-to-private-second-brain-ai"
```

- [ ] **Step 2: Replace the top product strip**

Create a compact Korean primary flow with these visible steps:

```html
<ol class="prototype-flow-board" data-prototype-flow="tonight-usable">
  <li data-primary-flow-step="quick-diary">빠른 일기</li>
  <li data-primary-flow-step="diary-import">일기 DB 가져오기</li>
  <li data-primary-flow-step="second-brain">내 세컨브레인</li>
  <li data-primary-flow-step="related-memories">연관 과거 기억</li>
  <li data-primary-flow-step="ai-session">AI 고민 세션</li>
  <li data-primary-flow-step="saveback">다시 기억으로 저장</li>
</ol>
```

- [ ] **Step 3: Make LLM Wiki visible in product language**

Expose `원자 기억`, `출처`, `패턴`, `인용`, and retain/recall/reflect counts in a Korean panel near the graph with `data-llm-wiki-visible="true"`.

- [ ] **Step 4: Koreanize session controls**

Rename visible core controls:

```text
Ask My Past Self -> 과거의 나에게 묻기
Decision Replay -> 결정 되짚기
Weekly Report -> 주간 패턴
Run Memory Session -> AI 세션 실행
Save session -> 세션 저장
```

### Task 3: Layout De-overlap Pass

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Make the first screen graph-first but readable**

Adjust CSS for `.product-value-strip`, `.prototype-flow-board`, `.product-main-grid`, `.graph-stage`, `.memory-inspector`, and `.product-rail` so the first viewport has stable bounds and readable Korean text.

- [ ] **Step 2: Remove negative letter spacing from touched display text**

Set touched title/inspector letter spacing to `0`.

### Task 4: Verification, Commit, Deploy

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

- [ ] **Step 1: Add L90 to the execution plan**

Document the goal, acceptance criteria, and verification gates.

- [ ] **Step 2: Run verification**

Run:

```bash
npm run typecheck
npm test
npm run build
PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:service-flow
PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright
git diff --check
```

- [ ] **Step 3: Commit and deploy**

Run:

```bash
git add scripts/verify-playwright-evidence.ts src/App.tsx docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-28-korean-prototype-ux-rebuild.md
git commit -m "feat: rebuild korean prototype flow"
git push origin main
railway up --project e5526d1a-26f2-4026-ae19-e43f77f6097e --environment production --service fc01bcfc-8d5b-44bc-9f8f-879e15185dc4 --detach
```

