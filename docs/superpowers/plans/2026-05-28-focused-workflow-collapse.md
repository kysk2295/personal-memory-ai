# Focused Workflow Collapse Batch

## Goal

Make the first-screen service flow easier to use by showing one clear step at a time:
quick diary/import, second-brain graph, or AI result. Non-active workflow sections should
stay discoverable but visually collapsed.

## Contract

- The app shell starts in capture focus with a guided collapse mode.
- Capture, graph, and AI workflow sections expose active/collapsed visibility state.
- The focus switcher tells the user what is hidden and what to do next in Korean.
- Switching focus updates shell attributes, active button state, section state, and visibility.
- Playwright evidence verifies the flow in the browser.

## Verification

- `npm test -- src/lib/appShellEvidenceLayout.test.ts`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run evidence:service-flow`
- `npm run evidence:playwright`
