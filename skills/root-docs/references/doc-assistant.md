# The *Ask this page* reading assistant

**Every standalone `.html` document created anywhere under `docs/` must include the
shared assistant before the work is complete.** How-it-works and unresolved
one-pagers, bug-fixed companions, reference visualisations, lesson plans, demo
pages — all of them.

It does **not** apply to Markdown: Markdown remains the source of truth, while the
assistant reads the rendered HTML page it is embedded in.

## The one source

`docs/tools/doc-assistant/`:

| File | What it is |
|---|---|
| `assistant.js` | page indexing, local BM25 passage retrieval, Claude Messages API streaming, citations, settings/transcript behaviour |
| `assistant.css` | the host-palette-aware panel styles |
| `build.py` | injects both files and per-page metadata between generated sentinel comments immediately before `</body>` |

**Never hand-edit the generated block in an HTML page.** Change the shared source,
then regenerate.

**Bootstrapping a project.** This skill bundles the canonical copy in
`assets/doc-assistant/`. A project without `docs/tools/doc-assistant/` copies
those three files there (the builder finds `docs/` two levels above itself), then
runs the build. A change to the assistant made in a project is carried back to
the bundled copy, so every project stays on one version.

## Always rebuild every page

Even when adding or editing only one. Each page's generated metadata includes the
other HTML pages, so **a new title or page changes the estate-wide sibling index**.

```bash
# Run after creating or changing any standalone HTML document. Updates the
# assistant runtime and the cross-page metadata in every HTML page under docs/.
python3 docs/tools/doc-assistant/build.py

# Required completion check. The final line must say 0 pages would change; any
# other result means the generated copies have drifted or the build is not
# idempotent.
python3 docs/tools/doc-assistant/build.py --check
```

The generator is deliberately idempotent. **A build followed immediately by
`--check` must be clean.** Metadata extraction must inspect **visible document
prose only** — never generated scripts, styles or comments — or the assistant can
make its own output change the next build.

## The security boundary is strict

- **Never put a Claude API key in the builder, an HTML file, a command-line option,
  source control or documentation.** The reader supplies their own key in the panel
  settings.
- The key is kept in that browser's `localStorage` and sent directly to
  `api.anthropic.com` only when the reader asks a question. Direct browser use
  means the page's JavaScript can see it, so **the panel must continue to state
  that plainly**, and standalone pages must not load external JavaScript.
- **Without a key, the assistant must remain useful as local passage search.** Do
  not make indexing, retrieval, citations or section links depend on a network call.
- **Send only** the retrieved passages, the current question and the small recent
  conversation needed for follow-ups. **Do not silently widen the assistant from
  "this page" to the repository, sibling files or general model knowledge.**
