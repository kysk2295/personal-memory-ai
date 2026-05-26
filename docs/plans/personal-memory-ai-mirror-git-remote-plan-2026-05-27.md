# Personal Memory AI Mirror Git/Remote Plan

Status: active
Date: 2026-05-27

## Current state verified

Mirror workspace:
- `/Users/goyunseo/.hermes/workspaces/personal-memory-ai-rpi`

Original checkout path:
- `/Users/goyunseo/Documents/Codex/2026-05-25/personal-memory-ai`

Mirror git remote was previously missing.
It has now been attached as:

```text
origin -> /Users/goyunseo/Documents/Codex/2026-05-25/personal-memory-ai
```

This is a local-path remote, not yet a GitHub remote.

## Why this configuration

The original checkout is intermittently unstable for direct execution (`Interrupted system call`), but it still exists and can serve as the mirror's upstream sync target.

This gives the mirror workspace a concrete git remote target immediately, without inventing or guessing a GitHub URL.

## Operating rule

1. Execute implementation in the readable mirror workspace.
2. Commit work in the mirror workspace.
3. Treat `origin` as the sync target back to the original checkout.
4. Only after original checkout access is stable, inspect its own upstream GitHub remote and restore normal PR flow there.

## Known limitation

- `origin` currently points to the original local checkout path, not GitHub.
- PR creation against GitHub still requires the original checkout's own remote configuration to be inspected once the filesystem path is readable enough for git operations.

## Next git normalization step

When the original checkout becomes readable enough, verify:
- `git remote -v`
- active branch
- whether original checkout has GitHub `origin`
- whether mirror should rename local-path remote to `mirror-origin` and use GitHub URL as `origin`

Until then, the immediate no-remote problem on the mirror repo is resolved.