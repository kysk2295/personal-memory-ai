# Capture / Import Product Surface Plan

## Goal

Expose the Phase 3 ingestion loop in the web product surface so the app/web split is visible: app capture creates a private `MemoryRecord`, while web import preview can apply or undo imported memories.

## Files

- `src/components/PatternPanel.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`
- `artifacts/web-second-brain-product-surface/local-first-screen.png`

## Required Behavior

1. Show an `App capture prototype` area.
2. Show the fast diary text input state and generated `MemoryRecord` id/source/privacy metadata.
3. Show import preview rows with source/date/duplicate state.
4. Show `Apply import` and `Undo import` controls as visible product commitments.
5. Keep copy clear that this is an app-capture prototype, not the full native app.

## Verification

```bash
npm run typecheck
npm test
npm run build
```

Capture an updated local screenshot after build.
