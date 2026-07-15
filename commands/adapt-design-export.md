---
description: Audit, rehabilitate, and adapt an existing Claude Design project to the platform-aware app-boilerplate handoff contract without discarding valid design decisions
argument-hint: [project name]
---

# /adapt-design-export — rehabilitate an existing Claude Design project

**Project name:** $ARGUMENTS

Use this command when screens already exist in Claude Design or under
`design/prototypes/`, including older work that is incomplete, inconsistent, or
does not follow the current handoff contract. Preserve valid product and visual
decisions, but do not preserve missing states, broken flows, accessibility
failures, inconsistent components, incorrect platform behavior, or incomplete
required scope merely because they exist in the old design.

This workflow writes a self-contained prompt for the existing Claude Design
project. It does not directly edit prototypes, application code, or the
repository-root Product Specification and Implementation Plan.

## 1. Resolve the existing design and product evidence

If the project name is empty, ask for it. Choose one mode:

- **Still in Claude Design:** confirm that the user has an existing Claude Design
  project. Read repository product briefs, brand files, requirements, planning
  notes, and other approved scope. Require Claude Design to inventory the live
  project before modifying its export.
- **Already exported:** inspect every available file under
  `design/prototypes/`, `design/system/`, `design/planning/`,
  `design/handoff/`, and `design/assets/`. Inventory screens, states, flows,
  assets, target surfaces, filenames, combined screens, preview shells,
  annotations, and existing handoff metadata.

If neither an existing design project nor an export exists, stop and use
`/prepare-claude-design <project name>`.

Treat approved product requirements and existing coherent flows as evidence.
Do not infer business rules from generic design conventions. Ask focused
questions only when an unresolved decision would materially change product
behavior. Never request secrets or private production data.

## 2. Require a design standards and completeness audit

The generated prompt must require Claude Design to audit the existing project
before producing a release. Cover:

- required screens and every user-flow step;
- loading, empty, error, success, validation, disabled, permission, and
  destructive-action states where applicable;
- navigation continuity, back/cancel behavior, recovery paths, and edge cases;
- mobile safe areas, keyboard behavior, scrolling, orientation, gestures,
  offline handling, and relevant iOS/Android differences;
- web responsive breakpoints, overflow, focus, keyboard navigation, and
  accessible interaction;
- component, typography, spacing, color, icon, motion, and copy consistency;
- accessibility intent, touch targets, contrast, semantic labels, and focus
  order;
- duplicate, combined, obsolete, or contradictory screens.

Require `design/planning/design-gap-audit.md` with every screen or gap assigned
exactly one classification:

- **ready** — complete and compliant; eligible for `readyForBuild`;
- **needs-correction** — exists but must be repaired before release;
- **missing-defined** — absent, but approved requirements define enough behavior
  for Claude Design to create it;
- **ambiguous** — requires a product or business decision; ask the user and keep
  it blocked;
- **planned** — valid scope intentionally deferred to a later batch;
- **superseded** — obsolete and excluded from implementation.

Each row must include evidence, required action, affected flow, target surface,
and intended release batch when known. Do not mark a screen ready merely because
an HTML file exists.

Claude Design may repair `needs-correction` items and design
`missing-defined` items by following the approved requirements and the
project's established design system. It must not invent behavior for
`ambiguous` items. Ask the user only for those unresolved decisions, record the
answer, then continue.

## 3. Write the rehabilitation prompt

Create `design/CLAUDE_DESIGN_ADAPTATION_PROMPT.md`. If it exists, show proposed
changes and ask before replacing it. Address the prompt to the same existing
Claude Design project, never a new blank project.

The prompt must:

1. Preserve valid layout, branding, copy, flows, interactions, states, and assets.
2. Correct standards failures and complete approved missing scope without
   restyling unrelated, already-valid work.
3. Report before/after changes and cite the requirement or standard that
   justified every intentional design change.
4. Stop and ask for clarification instead of inventing undefined business rules.
5. Export one screen or materially distinct surface per `*.dc.html` or
   `screen--*.html`, splitting combined exports without changing their intended
   behavior.
6. Declare exactly one `data-prototype-surface="web"`, `"mobile"`,
   `"tablet"`, or `"desktop"` per screen.
7. Wrap exactly the shipped application UI with one `data-app-root`.
8. Keep device/browser frames and review canvases outside the app root and mark
   them `data-preview-shell`.
9. Keep annotations, measurements, alternate examples, and other presentation
   content outside the app root and mark them
   `data-handoff="presentation-only"`.

For mobile, fixed reference dimensions belong on the preview shell, never the
application root. Document reference viewport, tested size range, safe-area
ownership, system bars, keyboard, scrolling, orientation, gestures, and
platform differences. Exported HTML is a visual and behavioral contract;
production Expo/React Native uses native primitives, not WebView or copied
DOM/CSS.

For web, document supported breakpoints, responsive reflow, overflow, focus and
keyboard behavior, and accessible semantics. Do not treat a fixed presentation
canvas as the production viewport.

## 4. Refresh the handoff contract

Require Claude Design to preserve and refresh system, planning, and asset
documents, and export exactly:

```text
design/handoff/[PROJECT] Design Reference.md
design/handoff/[PROJECT] Design Handoff Plan.md
```

The Design Reference owns the verified design source, visual and interaction
contract, prototype mappings, surfaces, application boundaries, and
presentation-only exclusions. The Design Handoff Plan owns design-derived scope,
gap recovery, coverage, sequencing, dependencies, open design work, and
per-screen fidelity QA. Engineering architecture remains `VERIFY IN REPO`.

Claude Design must not create or replace root `Product Specification.md` or
`Implementation Plan.md`.

## 5. Release repaired work incrementally

Do not wait for every gap to be repaired. Export the first coherent end-to-end
slice as soon as its design foundation, required states, and flow are complete.
Only `ready` audit items may appear in `readyForBuild`. Map
`needs-correction` and unresolved `ambiguous` items to `stillInDesign`, and
deferred scope to `planned`.

Every export creates or updates `design/design-release.json`:

```json
{
  "schemaVersion": 1,
  "project": "[PROJECT]",
  "batch": 1,
  "revision": 0,
  "previousBatch": 0,
  "releaseId": "design-batch-001",
  "status": "incremental",
  "readyForBuild": [
    {
      "screen": "Sign in",
      "prototype": "prototypes/Sign In.dc.html",
      "change": "added"
    }
  ],
  "stillInDesign": [],
  "planned": [],
  "removedOrSuperseded": [],
  "notes": "First rehabilitated buildable slice."
}
```

Advance `batch` for newly buildable scope. Increment `revision` for
corrections to the current batch. Keep prototype filenames stable. Claude Design
must never create or edit `design/design-sync.lock.json`.

Refresh `design/planning/screen-inventory.md` with prototype, surface, design
status, first-ready batch, and last-updated batch. Use only `planned`,
`in-design`, `ready-for-build`, `revision-required`, or `superseded`.

## 6. Require a rehabilitation report

End the generated prompt by requiring:

- the completed design gap audit and all remaining ambiguous decisions;
- every repaired, created, unchanged, deferred, and superseded screen;
- evidence for intentional changes and confirmation that unrelated valid design
  decisions were preserved;
- old-to-new filename mappings;
- each screen's surface and `data-app-root`;
- preview-only and presentation-only exclusions;
- refreshed system, planning, handoff, and asset inventories;
- the first release batch and why each included screen is ready.

The export must contain no secrets or private production data.

## 7. Hand off to implementation

After writing `design/CLAUDE_DESIGN_ADAPTATION_PROMPT.md`:

1. Open it for the user.
2. Tell them to paste it into the same existing Claude Design project.
3. Let Claude Design audit, clarify ambiguous decisions, repair known gaps, and
   export the first ready batch into `design/`.
4. Run `npm run design:validate`.
5. After validation passes, run
   `/sync-build-docs <project name>`.
6. Repeat for later batches and revisions.
7. Use `/finalize-build-docs <project name>` only after the required MVP design
   is complete.

Do not block implementation on unfinished later batches. Do not release a screen
until its required states, flow, platform behavior, and accessibility intent are
complete.
