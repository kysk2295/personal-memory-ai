# PMI-009 — Frontend Benchmark Detail Comparison and One Detail Pass

## Task ID

PMI-009

## Status

ready_for_human_review

## Goal

Compare the current Personal Memory AI first-screen frontend against the user's benchmark reference site (CareerHacker Alex), identify concrete detail-level gaps, and implement one focused detail pass that moves the staging UI toward the benchmark's polish.

## Inputs

- Staging app: `https://web-production-bcaf6.up.railway.app`
- Current app source in this workspace
- Benchmark reference site identified by the user as "CareerHacker Alex"
- Prior evidence artifacts under `artifacts/design-baseline/`

## Deliverables

1. A benchmark comparison note listing concrete gaps:
   - typography hierarchy
   - spacing rhythm
   - card/section density
   - graph framing / chrome
   - annotation / label treatment
   - evidence panel polish
2. One implemented frontend detail pass in code
3. Verification evidence and a short result report

## Constraints

- Do not claim parity with the benchmark unless verified visually.
- Prefer one coherent high-signal detail pass over many shallow tweaks.
- Keep the Memory brain graph first-screen product structure intact.
- Record real-time progress in Paperclip on the active issue, not only the umbrella issue.

## Verification gate

Task is only ready for review if:
- benchmark reference and current staging evidence were both captured,
- at least one concrete detail gap was implemented in code,
- staging/local visual check shows the intended difference,
- report states exactly what changed and what remains.
