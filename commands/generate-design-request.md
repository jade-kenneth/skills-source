---
description: Scan the engineering task tracker for design gaps and produce the copy-ready request that asks Claude Design for those designs, or, in prompt-only mode, specify the missing designs locally and unblock the tasks
argument-hint: [project name] [--prompt-only | --claude-design]
---

# /generate-design-request — turn task-tracker design gaps into a design request

**Arguments:** $ARGUMENTS

Use this command when engineering work is blocked on missing or unfinished
designs. It scans the detailed task tracker, collects every gap that requires
design work, and writes one request covering them all. It follows the design
mode that `/prepare-claude-design` selected for the project:

- **Claude Design** — the request is a copy-ready prompt addressed to the
  product's existing Claude Design project. This command does not design
  screens, edit prototypes, change the task tracker, or generate build
  documents.
- **Prompt only** — no prototypes exist; the Design Reference's per-screen spec
  is the design source. The request is addressed to the implementer, and this
  command carries it out in the session: it specifies the missing designs in the
  `design/` documents, updates the build docs and task file so the blocked tasks
  unblock, and then offers to build them.

## 0. Resolve the design mode

Use the first source that settles it:

1. **Arguments.** `--prompt-only` selects prompt-only mode; `--claude-design`
   selects Claude Design mode.
2. **Recorded mode.** The `Design mode` line in the Confirmed product brief of
   `design/CLAUDE_DESIGN_PROMPT.md`.
3. **Design evidence.** `*.dc.html` files under `design/prototypes/` or a
   `design/design-release.json` mean Claude Design mode. No prototypes, no
   release file, and a Design Reference that carries per-screen specs — or a
   `screen-inventory.md` using the prompt-only statuses `specified`, `in-build`,
   `built`, or `blocked` — mean prompt-only mode.

If the sources conflict or none applies, ask once — never assume. When an
argument contradicts the recorded mode, say so and ask which applies: switching a
project's design mode is a `/prepare-claude-design` decision, not something this
command does silently. State the chosen mode back to the user in one line before
continuing.

## 1. Load canonical context

If the project name is empty, derive it from the single `TASK_<project-slug>.md`
at the repository root when unambiguous; otherwise ask the user.

Read, in this order:

1. root `TASK_<project-slug>.md` — required. If it is missing, stop and direct
   the user to `/generate-project-tasks <project name>`.
2. root `Product Specification.md` and `Implementation Plan.md`;
3. `design/planning/screen-inventory.md`, `navigation-map.md`,
   `interaction-inventory.md`, and `open-decisions.md`, plus
   `design/design-release.json` when present;
4. `design/handoff/[PROJECT] Design Reference.md` and
   `design/handoff/[PROJECT] Design Handoff Plan.md`, when present;
5. the design source for the mode:
   - **Claude Design:** the actual `design/prototypes/` contents, including each
     relevant prototype's declared surface and implemented states;
   - **Prompt only:** the Design Reference's per-screen spec sections, the
     `design/system/` documents, and the `UI skills` recorded in
     `design/CLAUDE_DESIGN_PROMPT.md`.

Planning documents describe intent only. In Claude Design mode, a screen exists
as design source only when its prototype file exists. In prompt-only mode, it
exists only when its Design Reference section is a complete per-screen spec —
declared surface, layout and element order, design-system values, verbatim copy,
every state, the route and guard, each control's action and result, and each
scroller's behavior. Do not treat a planning bullet, handoff summary, or
inventory row as a substitute for either.

## 2. Identify what needs design

Collect design gaps from the task tracker and verify each one against the
design source:

- tasks marked `⚠ blocked` whose blocker names a missing screen, state, flow,
  component, or unresolved design decision;
- tasks that reference a screen whose `screen-inventory.md` status is
  `planned`, `in-design`, or `revision-required`, or whose prototype file does
  not exist under `design/prototypes/`;
- tasks whose acceptance criteria or Fidelity QA rows require states — loading,
  skeleton, empty, error, success, disabled, offline, permission-denied,
  destructive-confirmation, or interaction states — that the referenced
  prototype does not implement;
- Fidelity QA checks that cannot run because their reference prototype is
  absent or `superseded`.

In prompt-only mode, read the same checks against the spec instead of a
prototype: a screen status of `planned`, `in-design`, or `blocked`; a screen with
no Design Reference section or an incomplete one; states or controls the tasks
require that the spec does not define; and routes or action targets missing from
`navigation-map.md` or `interaction-inventory.md`.

Rules:

- Cross-check every candidate against the Product Specification and the screen
  inventory. Never invent a screen, flow, or feature that no canonical document
  plans; record such a finding under open decisions instead of requesting it.
- Deduplicate by screen, then group by target surface and flow so one request
  covers all tasks waiting on the same design.
- Record, for every gap, the task references (phase and task identifier) that
  are blocked on it.
- If no gap qualifies, stop, report that the design source already covers the
  tracker, and write no file.

## 3. Write the request

Create `design/CLAUDE_DESIGN_REQUEST.md`, creating `design/` when necessary.
When the file already exists, confirm its previous request was exported (or, in
prompt-only mode, carried out) or is being superseded, show the proposed
changes, and ask before replacing it.

The generated file must be a self-contained request addressed directly to its
recipient as a continuation of the existing design — never a restart. Resolve it
with the actual gap data; leave no generic placeholders for information the scan
already produced. In Claude Design mode, include every section from
**Continuation contract** through **Export requirements** exactly as specified.

### Prompt-only request

In prompt-only mode the request is the brief you specify and build from, and
nothing is exported as a prototype. Address it to the implementer, not Claude
Design, and adapt the sections as follows. This list instructs you; it is never
request content.

- **Continuation contract:** the established design system, tokens, voice,
  recorded `UI skills`, and Design Reference remain authoritative. Revise a
  `specified`, `in-build`, or `built` screen only when the request lists it as a
  revision, and never touch screens outside the request. Keep the ban on
  backend architecture invented to fill a visual gap and on secrets or
  production data, and forbid mock data, fake persistence, and placeholder
  handlers as finished UI. Drop the prototype-only mechanism rules.
- **Requested designs:** replace the prototype filename with the Design
  Reference section each screen gets or revises. Everything else in the entry
  stays.
- **Replace Export requirements with Specification requirements:** every
  delivered screen gets a complete per-screen spec in the Design Reference, as
  `/prepare-claude-design` defines it under "Move the prototype's job into the
  Design Reference"; its route row in `navigation-map.md` and a row for every
  control in `interaction-inventory.md`; its `screen-inventory.md` status set to
  `specified`; the Design Handoff Plan's coverage updated; and `design/system/`
  changed only when the gap needs a new component, variant, or token.
- **Drop:** `data-*` prototype markup, `.dc.html` filenames,
  `design/prototypes/`, `design/design-release.json`, and
  `design/design-sync.lock.json` — they exist only for a prototype export.

### Continuation contract

- State that this is an incremental design request for the existing
  `[PROJECT]` Claude Design project and that the established design system,
  tokens, voice, and exported prototypes remain authoritative.
- Keep existing prototype filenames stable. Modify a `ready-for-build` screen
  only when this request explicitly lists it as a revision, and never touch
  screens outside the request.
- Forbid application implementation, backend architecture invented to fill a
  visual gap, and any credential, token, connection string, or production data.
- Prototype code may use local mock data, component state, fake delays, and
  manual checks only to make the requested states and interactions reviewable.
  Claude Design must label those mechanisms
  `PROTOTYPE ONLY — MAP TO PRODUCTION ARCHITECTURE` in the handoff updates and
  must not prescribe local state, browser storage, manual validation, direct
  network calls, authentication, authorization, persistence, or cache behavior
  as production architecture; the repository owns those decisions during
  build-document reconciliation.

### Requested designs

For every gap, one entry containing:

- screen or component name and target surface (`web`, `mobile`, `tablet`,
  `desktop`);
- the prototype filename: the existing `*.dc.html` file when revising, or a new
  descriptive Design Component filename when the screen is new;
- whether it is `new`, a `revision`, or `missing states` on an existing screen;
- the Product Specification section that defines the behavior;
- the blocked engineering task references waiting on it;
- the exact states, interactions, responsive behavior, and platform-specific
  behavior the tasks require, using the same completeness bar as the master
  prompt: real copy, consistent demo data, accessibility, and no decorative
  no-op controls.

List unresolved design decisions from the tracker as explicit questions for
Claude Design to answer or escalate — not as scope to improvise. In prompt-only
mode they are questions for the user.

### Export requirements

Require the export to follow the project's existing contracts:

- every delivered screen declares one `data-prototype-surface` and exactly one
  `data-app-root`, with presentation-only shells and annotations outside that
  boundary;
- `design/design-release.json` advances the batch (or increments `revision`
  for corrections to already-released scope) and lists each delivered screen
  under `readyForBuild` with its `change` type;
- `design/planning/screen-inventory.md` statuses are updated for every screen
  this request touches;
- both handoff documents are updated where the delivered scope changes them;
- `design/design-sync.lock.json` is never created or edited by Claude Design.

## 4. Hand off or carry out

### Claude Design

After writing `design/CLAUDE_DESIGN_REQUEST.md`:

1. Open the file and explain that its full contents should be pasted into the
   existing Claude Design project.
2. After Claude Design exports the requested batch, run:

```bash
npm run design:validate
```

Then, in Claude Code:

```text
/sync-build-docs <project name>
```

3. After the synced release, re-run `/generate-project-tasks <project name>` so
   the blocked tasks pick up the delivered designs and unblock.

### Prompt only — specify the designs directly

Do not send the request anywhere and do not create prototypes. Carry out
`design/CLAUDE_DESIGN_REQUEST.md` in this session, finishing every document
before any UI code:

1. **Clarify first.** Ask the request's open questions and wait; never fill a
   scope, navigation, platform, or brand gap with an invented decision. A gap
   that stays undecided remains `blocked` in `screen-inventory.md` and is
   recorded in `open-decisions.md`.
2. **Design system.** Only when a gap needs a new component, variant, or token,
   load the recorded `UI skills` and update `design/system/` with exact values.
   Existing values stay authoritative over any skill default.
3. **Planning and handoff.** Write each requested screen's per-screen spec in the
   Design Reference, add its rows to `navigation-map.md` and
   `interaction-inventory.md`, set its `screen-inventory.md` status to
   `specified`, and update the Design Handoff Plan's coverage. Both handoff
   documents keep their links to each other.
4. **Build docs.** Update the root `Product Specification.md` and
   `Implementation Plan.md` for the delivered scope, with the same substitutions
   as `/prepare-claude-design` prompt-only step 5. Preserve existing phase
   status.
5. **Tasks.** Re-run `/generate-project-tasks <project name>` so the blocked
   tasks pick up the new specs and unblock.
6. **Offer to build.** Ask whether to implement the unblocked tasks now. If the
   user agrees, follow `/prepare-claude-design` prompt-only steps 7–9 (build,
   verify, report) for those tasks only.

Do not create `design/prototypes/`, `design/design-release.json`, or
`design/design-sync.lock.json`, and do not run `npm run design:validate` or
`/sync-build-docs` — they validate a prototype export this mode never produces.
Never write secrets or private data.

## Output

In Claude Design mode, write or update only `design/CLAUDE_DESIGN_REQUEST.md`.
Summarize the gaps found grouped by surface and flow, the blocked task
references behind each, any open decisions carried into the request, and the
next commands.

In prompt-only mode, report the gaps found grouped by surface and flow, the
blocked task references behind each, the documents updated, the screens now
`specified`, the tasks unblocked, the gaps still `blocked` with their open
decisions, and — if the user chose to build — the implementation report.
