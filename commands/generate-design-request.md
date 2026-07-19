---
description: Scan the engineering task tracker for design gaps and produce the copy-ready prompt that requests those designs from Claude Design
argument-hint: [project name]
---

# /generate-design-request — turn task-tracker design gaps into a Claude Design request

**Project name:** $ARGUMENTS

Use this command when engineering work is blocked on missing or unfinished
designs. It scans the detailed task tracker, collects every gap that requires
design work, and writes one copy-ready prompt addressed to the product's
existing Claude Design project. It does not design screens, edit prototypes,
change the task tracker, or generate build documents.

## 1. Load canonical context

If the project name is empty, derive it from the single `TASK_<project-slug>.md`
at the repository root when unambiguous; otherwise ask the user.

Read, in this order:

1. root `TASK_<project-slug>.md` — required. If it is missing, stop and direct
   the user to `/generate-project-tasks <project name>`.
2. root `Product Specification.md` and `Implementation Plan.md`;
3. `design/planning/screen-inventory.md` and `design/design-release.json`, when
   present;
4. `design/handoff/[PROJECT] Design Reference.md` and
   `design/handoff/[PROJECT] Design Handoff Plan.md`, when present;
5. the actual `design/prototypes/` contents, including each relevant
   prototype's declared surface and implemented states.

Planning documents describe intent only; a screen exists as design source only
when its prototype file exists. Do not treat a planning bullet, handoff
summary, or inventory row as a substitute for a prototype.

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

## 3. Write the copy-ready request prompt

Create `design/CLAUDE_DESIGN_REQUEST.md`, creating `design/` when necessary.
When the file already exists, confirm its previous request was exported or is
being superseded, show the proposed changes, and ask before replacing it.

The generated file must be a self-contained prompt addressed directly to Claude
Design as a continuation of the existing project — never a restart. Include
every section below, resolved with the actual gap data; leave no generic
placeholders for information the scan already produced.

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
Claude Design to answer or escalate — not as scope to improvise.

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

## 4. Hand off to the user

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

## Output

Write or update only `design/CLAUDE_DESIGN_REQUEST.md`. Summarize the gaps
found grouped by surface and flow, the blocked task references behind each,
any open decisions carried into the request, and the next commands.
