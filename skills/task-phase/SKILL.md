---
name: task-phase
description: Turn a project objective, feature, or documented problem into a detailed, phased, step-by-step implementation plan written to a task_NAME.md file. Use when asked to "create a task phase", "break this down into tasks", "make an implementation plan from the docs", "plan this feature", or "write a task file", especially when the source is a document under docs/ (how-it-works, unresolved, architecture, launch plan). Reads the source docs and the code they name first, then writes phases with ordered, checkable steps, files touched, checks owed, acceptance criteria and risks, followed by ASCII UI mockups for every affected screen. Not for a whole-product task file built from the product specification; that is /generate-project-tasks.
---

# Task phase — objective → phased implementation plan

Produce **one file**, `task_<name>.md`, that someone can work through top to
bottom without re-deriving anything. The plan is grounded in the docs and the
code, never in memory.

The project's root `CLAUDE.md` / `AGENTS.md` names its gate commands, its
invariants and its testing rules. Read them first; everything below that says
"the project's gate" means whatever those files name (a test command, a lint, a
build, or all three).

---

## 1 · Pin down the input

| Question | Default when the user didn't say |
|---|---|
| What is the objective or feature? | The document the user named or has open in the IDE |
| What is `<name>`? | Short kebab-case slug of the feature (`bulk-export`, `invoice-retry`). Never a ticket number or a date |
| Where does the file go? | `docs/tasks/task_<name>.md` (create the folder). A path the user gives wins |

Ask only when the objective itself is ambiguous (two plausible features, or no
source at all). Otherwise pick the default and say so in the reply.

If `task_<name>.md` already exists, read it and **update it in place** — keep
checked boxes checked, and never silently drop a task. Mark a removed task
`~~struck~~ — dropped <ISO date>: <reason>`.

---

## 2 · Research before writing

Do this in order. Don't write a step you haven't grounded.

1. **Read the source documents in full.** For an `unresolved/` doc, its
   resolution tracker and task cards are the scope. For a `how-it-works/` doc,
   its *deliberately not built* rows and known defects mark the edges.
2. **Read the project's invariants** (root `CLAUDE.md` / `AGENTS.md`) that the
   feature touches — tenant scoping, allowlists, gates, secrets, workflow order.
   Each one a phase could break becomes an explicit step or acceptance check, not
   a footnote.
3. **Open every file the docs name**, and find the real extension points
   (`grep`, not guesses). Record `path:line` for where each change lands.
4. **Note what the code contradicts.** The code is the final authority. Put
   each conflict in the plan's *Risks & open questions* rather than choosing
   silently.
5. **List what needs outside access** — database schema or permissions,
   identity-provider settings, hosting environment variables, third-party
   accounts. These become their own steps, tagged `settings only`, because a
   code rollback does not undo them. Tag any step that **spends money** (paid
   API credit, a billed provider call) `spends credit`.

---

## 3 · Shape the phases

- **Phase 0 is always *Decisions & prerequisites*** — open questions that block
  work, accounts or access needed, schema changes to agree on. If it has
  nothing, write "None" rather than deleting it.
- Then one phase per **independently shippable slice**, ordered by dependency:
  data/schema → server (domain logic, then handlers) → UI → docs/verification.
  Each phase ends in a state where the project's gate passes and the phase could
  be merged alone.
- **The last phase is always *Verify & document*** — the project's verify block
  if auth, scoping or a gate was touched, the documentation the change owes
  (`bug-fixed/`, `how-it-works/`, supersession banners, task-card status), and
  the doc-assistant rebuild where the project has one. **Its final step is
  always *Update `docs/` and `CLAUDE.md`*** (see *Closing out an executed
  plan*).
- Aim for 3–7 phases and 3–10 steps per phase. A step bigger than about half a
  day gets split.

### Every step

- Is a checkbox, starts with a verb, and is small enough to finish and check.
- Names the file(s) and `path:line` where known.
- Says **how it is checked**, following the project's own testing rules:
  - Where the project requires tests for a change (for example every server
    module ships unit tests), the test ships in the **same step** as the change.
  - A bug fix starts with a step that reproduces it — a failing test, or where
    there is no test runner a scripted request or click path with the wrong
    result written down — **before** the fix step.
  - Where the project has no test runner, name the honest check (lint, build, a
    scripted request with its status and body recorded, a manual pass through
    the screen) and never call it a test. Introducing a test runner is its own
    step in Phase 0 or 1, not an assumption.
- Carries a tag when it applies: `code change`, `settings only`, `testing`,
  `checking`, `needs a decision`, `security`, `before launch`, `spends credit`.

---

## 4 · File template

Use this structure exactly. Fill every section; write "None" where empty.

```markdown
# Task: <Feature name>

> **Objective:** <one or two sentences — the outcome for the people who use it, not the mechanism>
> **Source:** <doc paths / sections the plan was built from>
> **Created:** <ISO date> · **Status:** Not started · **Progress:** 0 / <N> steps

## Scope
- **In:** …
- **Out (deliberately):** …

## Invariants this touches
- <invariant, in words> → guarded by step <x.y>

## Phase 0 — Decisions & prerequisites
- [ ] **0.1** <step> — `needs a decision`

## Phase 1 — <name>
**Goal:** <what is true when this phase ends>
**Depends on:** Phase 0

- [ ] **1.1** Reproduce <behaviour>: failing test `<test file>`, or the request/click path and its wrong result — `testing`
- [ ] **1.2** <change> in `<path>:<line>` — `code change`
  - Detail / sub-steps if needed
- [ ] **1.3** Run the project's gate (`<command>`); all green

**Done when:** <one observable, checkable sentence>

## Phase N — Verify & document
- [ ] **N.1** Run the project's verify block (auth/scoping/gates) and record the output
- [ ] **N.2** Write/update the owed document(s) and rebuild the doc assistant
- [ ] **N.3** Update every `docs/` document tied to this task, then `CLAUDE.md` — last step, always

## Files touched
| File | Phase | Change |
|---|---|---|

## Environment & settings changes
| Variable / setting | Where | Phase | Notes |
|---|---|---|---|

## Risks & open questions
| # | Risk or question | Impact | Mitigation / who decides |
|---|---|---|---|

## Acceptance criteria
- [ ] <end-to-end check someone can run>

## UI mockups
<see section 5>
```

---

## 5 · UI mockups — always, right after the plan

After the phases, add ASCII mockups for **every surface the plan changes** —
pages, multi-step forms, dialogs, empty/loading/error states, and every client
the plan reaches (web, mobile, admin or back-office views). Draw each screen at
the widths the project supports (desktop and its phone layout at least). For
each:

- A boxed ASCII layout at realistic proportions, with real labels and sample
  data from the project, not lorem ipsum.
- **Component/style notes** naming what to reuse from the project's styling
  system — its component library, its utility classes, or its plain-CSS class
  names and tokens, whichever the project actually uses.
- **UX behaviour notes**: what happens on click/submit, the pending state while
  a slow call runs, the error sentence the server returns, what a gate message
  says when an earlier step is not done, empty state, double-click protection,
  and the narrow (phone) layout.

If the feature has no UI, write "No UI changes" and why.

---

## 6 · Finish

1. Update the masthead `Progress` count to match the checkboxes.
2. Add the file's row to `docs/README.md` if it lives under `docs/`.
3. If `docs/` is untracked, don't name the `docs/` path in any committed file
   (see the `root-docs` skill, `references/docs-path-rule.md`).
4. Reply with: the file path, the phase list (one line each), the defaults you
   picked, and the open questions that block Phase 1. Don't paste the whole
   file into chat.

### Marking steps done later

When asked to mark finished steps, check the code, tests, build output and
records, never memory. Tick only what they show. Under every ticked step, and
every step left open on purpose, add one `>` note saying what shows it (a file,
a test, a command's output and its date). Code that exists but gives a wrong
result stays unticked. A step that needs a browser, credentials or a decision
stays open until that has happened. Update the masthead `Status`, `Progress`
and `Last checked`. In the same sitting, tick the matching task-card steps
(`done_steps` in the card generator, where the project has one), refresh their
evidence, and update the source document's tracker and *Changes so far*,
without closing a row whose *Done when* hasn't been observed.

### Closing out an executed plan

When the last code step of a plan has been executed, **the final thing done,
every time, is updating the documents and `CLAUDE.md`.** The work isn't
finished until both are.

0. **Tick each step as it's finished, while executing**, not in one pass at
   the end: `- [x]` plus its `>` evidence note (see *Marking steps done
   later*), with the masthead `Progress` kept current. A step whose code
   landed in a different place or shape than planned is ticked only if its
   intent is met, and the note says where it went.
1. **`docs/` — every document the task touched or came from:**
   - the plan itself: every step checked against the code, ticked or left
     open with a `>` note, and the masthead `Status`, `Progress`,
     `Last checked`;
   - the source document's resolution tracker and *Changes so far*, and its
     task cards through the card generator (never by hand);
   - the tier the change owes: `how-it-works/` for a built feature,
     `bug-fixed/` for a fix, supersession banners and inline
     `[corrected]`/`[superseded]` tags on anything it made wrong (HTML page
     first);
   - the diagram question, answered in writing (wrong / needs a second
     diagram / unaffected);
   - `docs/README.md` rows, then the doc-assistant rebuild and `--check`.
2. **`CLAUDE.md` / `AGENTS.md` — whatever the change made stale or new:**
   invariants, the verify block and its expected counts, any card *Done when*
   table, the testing rules, the *deliberately does not have* table, the
   pre-launch notes. Say so in the reply if nothing needed changing, and why.
3. If the project shares its agent rules with sibling repositories, carry a
   working rule that is not specific to one app to them in the same sitting.
4. Reply with what was updated in each, and anything left open.

### Don't

- Invent file paths, functions, or line numbers — look them up.
- Write a phase that leaves the project's gate red.
- Plan a step that breaks one of the project's invariants — accepting an owner
  or tenant id from the request, widening a field allowlist, moving a secret
  toward the client, dropping a workflow gate, letting model output set an
  approval. If the objective seems to need that, it goes in *Risks & open
  questions* with a Phase 0 decision.
- Claim a step is "tested" when the check is a build.
- Start implementing. This skill plans; code changes happen when asked.
