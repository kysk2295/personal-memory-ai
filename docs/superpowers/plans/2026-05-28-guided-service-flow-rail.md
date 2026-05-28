# Guided Service Flow Rail Feature Batch

## Phase / Epic / Goal

- Phase: app/web diary intake to private second brain
- Epic: user-visible prototype legibility
- Goal: make the core product flow obvious without relying on scattered cards.

## Contract

The first web screen must show one Korean-first guided flow rail:

1. 기록
2. 세컨브레인
3. 연관 기억
4. AI 실행
5. 미래 기억 저장

The rail must:

- expose stable `data-guided-service-flow` and current-step attributes for evidence scripts
- update when the user imports, selects a memory, runs a related-memory AI action, runs a guided session, and saves a grounded result
- avoid adding another floating/card-heavy layer that can overlap the graph
- keep the graph/data path based on real `MemoryRecord` relationships

## Verification

- RED/GREEN layout test for rail markup and script wiring
- Playwright evidence for step state transitions
- standard typecheck, tests, build, service-flow, Playwright, diff check
