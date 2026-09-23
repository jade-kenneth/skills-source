---
name: root-docs
description: The documentation system for a project's untracked root docs/ folder and the documentation rules in its root CLAUDE.md, for a single repository or a multi-repo estate. Use BEFORE answering "how does X work" or changing a feature (there is a mandatory reading order), and AFTER any fix, feature, or behaviour change, because each one owes a document. Covers routing a new document to the right tier (how-it-works, bug-fixed, unresolved, general or per-repo docs), the required sections of each, the task cards at the bottom of every unresolved document, the sendable HTML one-pager and its house style, generated diagrams and their assertions, the supersession banner and inline tags, the Ask-this-page doc-assistant rebuild, and the rule that no committed file may name a docs/ path. Triggers on writing or updating documentation, documenting a bug fix, a feature landing, diagnosing a fault, marking something superseded or stale, building or sending a one-pager, regenerating a diagram, or registering a doc in the index.
---

# Root docs — the documentation estate

Root `docs/` is the project's single documentation set, organised in tiers. It is
**not tracked by git** — ignored in `.gitignore` (`docs/` or `docs/*`) or excluded
locally in `.git/info/exclude` — so it exists only on the machines that hold it
and **travels by being sent**.

*The estate* means whatever one `docs/` covers: a single repository, or a root
checkout with sibling repositories cloned inside it.

The root `CLAUDE.md` is the authority and is always already in context. This
skill is the **router and the checklists** — use it to find the right tier fast
and to finish a document without dropping one of the steps that make it
trustworthy. Where the project's `CLAUDE.md` fixes a folder, a name or a rule
differently, **`CLAUDE.md` wins**; say so in the reply when you notice.

### Two shapes, one system

Read the shape off the disk (`references/estate-map.md`), never assume it.

| | Single repository | Multi-repo estate |
|---|---|---|
| Built features | `docs/how-it-works/<topic>/` | same |
| Open problems | `docs/unresolved/<topic>/` | same |
| Fixed bugs | `docs/bug-fixed/` (flat) | `docs/bug-fixed/<repo>/` — the repo you changed |
| Everything else | `docs/`, or a topic folder under it | `docs/<repo>/` — the repo whose code it describes |
| Repo-local legacy docs | — | `<repo>/docs/` — read, never added to |

`<repo>` is always the **checkout directory name**, never the remote repository's
name.

---

## 1 · Read before you act — the mandatory order

Check every row, in order. Do not stop at the first hit; do not skip a tier
because an earlier one answered.

| # | Where | What it holds |
|---|-------|---------------|
| 1 | `docs/how-it-works/<topic>/` | How a built thing works and how we know. **Read before the feature's code or its task plan.** |
| 1a | `docs/bug-fixed/` (or `bug-fixed/<repo>/`) | A symptom met and fixed before. **Check first when something is misbehaving.** |
| 1b | `docs/unresolved/<topic>/` | A symptom diagnosed and still open. Check alongside `bug-fixed/`. |
| 1c | `docs/` general documents (or `docs/<repo>/`) | Consolidated cross-cutting explanations, guides and references. |
| 2 | `docs/README.md` | The index. Every document has a row. |
| 3 | `<repo>/docs/` | Multi-repo estates only: repo-local detail that never left the repo. Narrower and older. |
| 4 | Nearest `CLAUDE.md` | Walk up from the file you are editing to the root, reading every one you pass. |

**Conflicts:** the more specific source wins — `CLAUDE.md` > repo-local docs >
root docs. **Say so when you notice a conflict** rather than silently picking
one. **The code is the final authority over any document.**

`git grep`, `rg` and editor search skip ignored trees, and a recursive search
over an ignored folder returns empty rather than an error. Name the path
explicitly (`grep -rn … docs/`, `rg --no-ignore … docs`).

---

## 2 · Route the document you are about to write

Answer one question: **what is this document explaining?**

| The document explains… | It goes in | Read |
|---|---|---|
| How a built feature works, and why it is shaped that way | `docs/how-it-works/<topic>/` | `references/how-it-works.md` |
| Why something broke, and how it was fixed | `docs/bug-fixed/` (per repo in an estate) | `references/bug-fixed.md` |
| Why something is still broken | `docs/unresolved/<topic>/` | `references/unresolved.md` |
| Anything else — an operational guide, a data walkthrough, a subsystem reference | `docs/` (or `docs/<repo>/`) | `references/repo-docs.md` |
| A phased implementation plan | `docs/tasks/task_<name>.md` | the `task-phase` skill |
| Why a built feature looks and behaves the way it does, for a non-technical reader | `docs/feature-rationale/<topic>/<feature>.html` (a page, no `.md`) | the `feature-rationale` skill |
| A lesson on a concept or a tool the project runs on | `docs/learn/<topic>/` | the `learn` skill |
| A progress report or the whole-project story | `docs/reports/` | the `plain-report` or `project-story` skill |

**Every new document goes under root `docs/`.** Never write a new one into a
repo-local `<repo>/docs/`; that tier is existing material only. Create the folder
if it does not exist.

**Topics are few and broad** — `payments/`, `onboarding/`, `auth/`, `search/`,
`deployment/` — and `unresolved/` and `how-it-works/` share topic names on
purpose, so a problem and the feature that solved it sit under one word.

**Spanning repos:** file under the one you would edit to change the behaviour,
and name the rest in a `**Related:**` line at the top.

**Name the file after the thing, not the ticket.** After the failure for a fault
(`search-endpoint-502-api-container-down.md`), after the mechanism for a feature
(`repeat-safe-payment-funnel.md`). Where a feature closes an unresolved document,
the two names should be visibly different — the problem named after what failed,
the feature after what now works — and each links to the other.

---

## 3 · The rules that are never traded away

1. **No committed file may name a `docs/` path or cite `CLAUDE.md` / `AGENTS.md`
   by line.** Not a code comment, commit message, PR description, review comment,
   or the prose of a tracked Markdown plan. See `references/docs-path-rule.md`.
2. **A one-pager is a file, not an Artifact.** Standalone `.html` written straight
   into the topic folder, everything inline. Never publish it. See
   `references/one-pager.md`.
3. **Supersession is same-sitting work.** The change that makes a document wrong
   tags that document — banner, inline tag, the HTML page first, and the index
   row — before the sitting ends. See `references/supersession.md`.
4. **The diagram is part of the document.** Every documentation update ends by
   asking what the change did to the visualization, and the answer is written
   down — including "unaffected". See `references/diagrams.md`.
5. **Never hand-edit a generated block** — not an emitted SVG, not the
   doc-assistant block in an HTML page, not the task-card block. Change the
   generator, re-run it.
6. **Measured and expected never share a treatment.** Transcripts are run, not
   written from expectation. Anything not observed is labelled *not yet
   observed*.
7. **Every `unresolved/` document ends with task cards**, one per tracker row,
   generated from one source into both the Markdown and its page. See
   `references/task-cards.md`.

---

## 4 · Finishing checklist — a document is not done until all of these

Run this at the end of every documentation change, whatever the tier.

- [ ] Document written to the right tier, folder created if new.
- [ ] `**Related:**` line naming the other repos, the document it closes, the
      feature it belongs to.
- [ ] **Companion HTML one-pager** built or updated, same basename, same folder
      (required for `unresolved/` and `how-it-works/`; optional but same recipe
      for a `bug-fixed/` document worth sending). `references/one-pager.md`
- [ ] **Task cards** at the bottom of every `unresolved/` document, generated,
      with a *Last checked* line. `references/task-cards.md`
- [ ] **Diagrams** regenerated from their `.build.py`, assertions passing, and the
      SVG **rasterised and looked at**. `references/diagrams.md`
- [ ] **Doc-assistant rebuilt across every HTML page**, and `--check` clean:
      ```bash
      python3 docs/tools/doc-assistant/build.py
      python3 docs/tools/doc-assistant/build.py --check   # must say 0 pages would change
      ```
      A project without `docs/tools/doc-assistant/` copies this skill's
      `assets/doc-assistant/` there first. `references/doc-assistant.md`
- [ ] **Registered** — a row in the right table in `docs/README.md` (and a new
      section for a new folder); for a feature, an entry in the estate's feature
      registry if it keeps one.
- [ ] **Superseded documents tagged** — anything this change made wrong, Markdown
      *and* its HTML page, plus the note in its `docs/README.md` row.
- [ ] If it resolved an `unresolved/` document: tracker flipped, final change row
      added, document **moved** to `bug-fixed/`, index row moved, page updated.
      All four, same sitting. `references/unresolved.md`
- [ ] Nothing committed, in this repo or a sibling, names a `docs/` path.

---

## 5 · Shared rules that cut across every tier

Read these when the tier reference points at them.

| Reference | What it carries |
|---|---|
| `references/plain-terms.md` | The one-analogy rule, the *In plain terms* section (with its second-language twin where the project writes one), and the **How that fixes it:** clause. Required in every tier. |
| `references/one-pager.md` | The standalone HTML recipe: shell, sticky grouped nav, the house style token block and class vocabulary, the animation toggle, design constraints, section order. |
| `references/diagrams.md` | Generators, the assertions that must fail the build, the feature map vs the paired before/after track, the render-and-look check. |
| `references/supersession.md` | The banner's four load-bearing parts, `[corrected]` vs `[superseded]`, when the banner comes off, HTML pages first. |
| `references/task-cards.md` | The card fields, writing for a beginner, *Before*/*After*, *Before pushing to production*, the generator, and checking whether a card is done. |
| `references/doc-assistant.md` | The *Ask this page* panel, the build command, the bundled source in `assets/doc-assistant/`, and the security boundary around the reader's API key. |
| `references/docs-path-rule.md` | What may never name a `docs/` path, what to write instead, and the one direction the link is allowed to point. |
| `references/estate-map.md` | How to read the estate's shape off the disk, what a project records about itself, and the commands that work against an ignored tree. |
| `references/repo-docs.md` | The general tier, and registering a document. |

---

## 6 · Writing quality — the rule most often broken

Write for somebody **competent and unfamiliar**: they read code fine and have
never seen this subsystem, this estate's vocabulary, or the argument that led
here.

- **Comment every code block and every command** — what the line is *for* and
  what it accomplishes, not a restatement of the syntax.
- **Define the vocabulary before the reader meets it** — a short table near the
  top, in this system's concrete terms, with the full glossary at the end.
- **Use real identifiers and real amounts** from the system, and **one cast for
  the whole document** — the same customer, person, plan and invoice number in
  every scenario, so the episodes compound.
- **Lead with the consequence in the customer's or the money's terms.** Not
  "this ensures request idempotency" — "without it, a customer can be charged
  twice for the same month".
- **Say so plainly when a fix is uncomfortable.** A document that only flatters
  its subject is not read twice.

The worked examples across these references (a clinic paying for a plan, a
payments topic, a Docker estate behind a reverse proxy) come from the estate this
system was first written for. Keep the rules; take the cast, the names and the
numbers from your own project.
