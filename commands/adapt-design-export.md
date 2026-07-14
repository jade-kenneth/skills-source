---
description: Adapt an existing Claude Design export to the platform-aware app-boilerplate handoff contract without redesigning it
argument-hint: [project name]
---

# /adapt-design-export — adapt an existing Claude Design export

**Project name:** $ARGUMENTS

Use this command when screens already exist in a Claude Design project, whether
they are still only inside Claude Design or have already been exported under
`design/prototypes/`. This workflow prepares a compatibility prompt for that
existing Claude Design project. It does not redesign screens, edit prototype
files, write application code, or generate the repository-root build documents.

## 1. Resolve where the existing design lives

If the project name is empty, ask for it. Then choose one mode:

- **Still in Claude Design:** the screens exist in the current Claude Design
  project but have not been exported. Confirm this with the user, read the
  available product brief, brand files, requirements, and planning documents in
  the repository, and generate the adaptation prompt before the first export.
  The prompt must tell Claude Design to inventory its current screens, states,
  flows, assets, and platform targets before changing export structure.
- **Already exported:** `design/prototypes/` contains at least one
  `*.dc.html`, `screen--*.html`, or logo prototype. Inspect those files and
  tailor the adaptation prompt to the observed export.

If there is no existing Claude Design project and no existing export, stop and
use `/prepare-claude-design <project name>` for a new design.

For an existing export, read all available files under:

- `design/prototypes/`
- `design/system/`
- `design/planning/`
- `design/handoff/`
- `design/assets/`

In either mode, also read any product brief or design notes that explain the
existing work. When an export exists, inventory every screen, filename, intended
target surface, existing device or browser frame, presentation canvas,
annotation, and current handoff metadata, including whether a file combines
multiple screens. When the design is still only in Claude Design, put this
inventory task into the generated prompt so Claude Design performs it against
its live project before adapting the export.

Ask only focused questions when the intended target surface cannot be determined
from repository context. Never guess the app root; when it is visible only in
Claude Design, require Claude Design to identify and report it. Never request passwords, API keys, tokens, connection
strings, private production data, or other secrets.

## 2. Write the adaptation prompt

Create `design/CLAUDE_DESIGN_ADAPTATION_PROMPT.md`. If it already exists, show
the proposed changes and ask before replacing it. Do not directly rewrite,
move, restyle, or split the prototypes; Claude Design owns those source changes.

The generated file must be a self-contained prompt addressed to Claude Design
and tailored to the inspected export. It must tell Claude Design to update the
existing design project and re-export it while preserving the current design
exactly. Explicitly forbid redesigning, restyling, simplifying, changing copy,
changing flows, removing states, changing interactions, or inventing missing
product behavior merely to satisfy the file contract.

Include the observed repository/export inventory. If the screens are still only
in Claude Design, explicitly state that Claude Design must first list its current
screen inventory and report any ambiguity without changing the design. Then
require these compatibility changes:

1. Export one screen or materially distinct surface per `*.dc.html` or
   `screen--*.html` file. Split combined files without changing the designs.
2. Declare exactly one supported target surface on every screen prototype:
   `data-prototype-surface="web"`, `"mobile"`, `"tablet"`, or
   `"desktop"`.
3. Wrap exactly the UI that belongs in the shipped application with one
   `data-app-root`.
4. Mark any device frame, browser frame, centered review canvas, or other preview
   container with `data-preview-shell`. It must remain outside the production
   boundary.
5. Keep labels, measurement notes, alternate-device examples, annotations, and
   other presentation material outside `data-app-root` and mark them
   `data-handoff="presentation-only"`. A presentation-only element must never
   contain the app root.
6. Preserve the current visual and behavioral result: layout, typography, color,
   spacing, assets, copy, states, navigation, controls, motion, responsive
   behavior, and accessibility intent.

For mobile designs, require fixed reference dimensions to live on the preview
shell, never on the application root. Require the handoff to document the
reference viewport, tested size range, safe-area ownership, status/navigation
bars, keyboard behavior, scrolling boundaries, orientation, gestures, and
relevant iOS/Android differences. State that exported HTML is a visual and
behavioral contract only: production Expo/React Native must use native
primitives, not a WebView or copied DOM/CSS.

Require Claude Design to preserve and refresh the existing system and planning
documents where present. It must export exactly these project-named handoff
documents:

```text
design/handoff/[PROJECT] Design Reference.md
design/handoff/[PROJECT] Design Handoff Plan.md
```

The Design Reference owns the original design source, exact visual and
interaction contract, prototype mappings, surface declarations, production
boundaries, and presentation-only exclusions. The Design Handoff Plan owns
design-derived scope, coverage, sequencing, dependencies, open design work, and
per-screen fidelity QA. Engineering architecture must remain `VERIFY IN REPO`.
Claude Design must not create or replace root `Product Specification.md` or
`Implementation Plan.md`; `/finalize-build-docs` creates those after repository
verification.

### Incremental design release contract

Do not wait for the entire app design before the first export. As soon as the
design foundation and at least one complete end-to-end MVP slice are coherent,
export Design Batch 1 and continue designing later scope.

Every export must create or update `design/design-release.json` using this schema:

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
  "notes": "First buildable design slice."
}
```

Batch numbers advance when new buildable scope is released. Corrections to the
same scope increment `revision`. Keep prototype filenames stable. Claude Design
must never create or edit `design/design-sync.lock.json`; the repository writes
that file only after `/sync-build-docs` succeeds.

`design/planning/screen-inventory.md` must include each screen's prototype,
surface, design status, first-ready batch, and last-updated batch. Use only:
`planned`, `in-design`, `ready-for-build`, `revision-required`, or
`superseded`.

End the generated prompt by requiring an adaptation report with:

- every file changed or created;
- old-to-new filename mappings for split or renamed exports;
- each screen's target surface and `data-app-root` boundary;
- every preview-only shell or presentation-only element;
- a confirmation that design, copy, flows, states, and interactions were not
  intentionally changed;
- all remaining ambiguities or items that still need design;
- the refreshed system, planning, and paired handoff document inventory.

Require the re-export to contain no secrets or private production data.

## 3. Hand off to the user

After writing `design/CLAUDE_DESIGN_ADAPTATION_PROMPT.md`:

1. Open the file for the user.
2. Tell them to paste its full contents into the existing Claude Design project,
   not a new blank design.
3. Tell them to export the corrected project into `design/` for the first time,
   or replace the corresponding files there when an older export exists.
4. Run:

```bash
npm run design:validate
```

5. After validation passes, run in Claude Code:

```text
/sync-build-docs <project name>
```

6. Use `/finalize-build-docs <project name>` only for the final complete MVP design.

Do not wait for the whole app before syncing the first buildable batch. Finalize
only after the required MVP design is complete.
