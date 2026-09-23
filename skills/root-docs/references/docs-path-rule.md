# Never name a `docs/` path in anything that reaches the remote

**Strict rule: no committed text may name a root `docs/` path.** Not a code
comment, not a commit message, not a PR description, not a review comment on the
hosting service — nothing that lands in this repository's remote or a sibling's.
This holds even when the document is the reason for the change and naming it
would be the natural thing to do.

## Why

Root `docs/` is untracked (ignored in `.gitignore` or excluded in
`.git/info/exclude`), so those files exist only on the machines that hold them. A
comment pointing at `docs/bug-fixed/…` is a dead reference for every other person
who reads it — **worse than no reference, because it reads as though something
is there to open.** The same goes for `docs/README.md`, `docs/unresolved/…`,
`docs/tasks/…` and any feature registry.

## What to write instead

Say the thing itself, in the comment, in as many words as it takes.

```ts
// ✗ never
// See docs/bug-fixed/search-endpoint-502.md for why this retries.

// ✓ instead
// The search API returns 502 while its container is still booting; retry once
// rather than surfacing the failure to the user.
```

If the explanation is genuinely too long for a comment, **name a durable anchor a
reader can actually reach** — the ticket, the branch, the function, the config
key — never the `docs/` path.

## `CLAUDE.md` and `AGENTS.md` are covered too

When they are untracked alongside `docs/`, a committed file citing
`CLAUDE.md:219` points at a line that exists on one machine — and line numbers in
a file that size move every time a section is added. Even when they are tracked,
a line number goes stale. **Cite the rule in words; never by file and line.**

## A tracked Markdown file is not `docs/`

A `README.md`, or a plan committed at the root (`task_<name>.md`), reaches the
remote like any source file, so **every rule above applies to its prose**, not
only to code comments. Where it needs something that lives in `docs/`, state the
fact itself and name an anchor a reader can reach: the service, the config key,
the migration, the branch.

## Documents committed before the ignore entry

`.gitignore` does not untrack what is already tracked. A few `docs/` files may
still be in the index (`git ls-files docs/`), sometimes because a test reads
them. Treat those as a **deliberate, recorded exemption** in the project's
`CLAUDE.md`, and never widen it: a new fixture a test needs goes somewhere
tracked, not into `docs/`.

## The rule is directional — and the second half is the half people miss

A `docs/` document **may** link out to a tracked file (`../../src/lib/retry.ts`,
`../../task_<name>.md`), because that link resolves for anyone holding the
checkout.

**Only the arrow pointing the other way breaks.**

## Where naming `docs/` is still correct

- Inside `docs/` Markdown itself — cross-links between documents are expected.
- Inside an untracked `CLAUDE.md` or `AGENTS.md`.
- Inside a project's local copy of this skill, when `.claude/` is untracked.
- In chat with the user.

None of those leave the machine.

## Before you commit

```bash
# Anything staged that names a docs/ path or cites CLAUDE.md / AGENTS.md by line.
# In a multi-repo estate, add the estate's docs/<repo>/ folder names to the group.
git diff --cached | grep -nE 'docs/(README|bug-fixed|unresolved|how-it-works|tasks|tools|learn|reports)|(CLAUDE|AGENTS)\.md:[0-9]'

# Nothing untracked on purpose was force-added.
git diff --cached --name-only | grep -E '^(docs/|\.claude/|CLAUDE\.md|AGENTS\.md)'
```

An empty result from both is the pass, apart from a file on the project's
recorded exemption list. Any other hit is a line to rewrite, not a line to
justify.
