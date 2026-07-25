# Moved

`gen-build-docs` no longer exists. Build documents are produced by two canonical
commands, and this stub avoids two editable copies drifting apart:

- `../commands/sync-build-docs.md` — creates or incrementally reconciles the root
  `Product Specification.md` and `Implementation Plan.md` from the next validated
  Claude Design release. Use this for the first build and every partial batch.
- `../commands/finalize-build-docs.md` — the final completeness gate, valid only
  once `design/design-release.json` reaches `status: "final"`.

In Claude Code, run `/sync-build-docs <project name>` or
`/finalize-build-docs <project name>`.
