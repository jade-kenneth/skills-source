---
description: Adapt an existing Claude Design export to the platform-aware app-boilerplate handoff contract without redesigning it
argument-hint: [project name]
---

# /adapt-design-export — adapt an existing Claude Design export

**Project name:** $ARGUMENTS

Use this command when Claude Design screens already exist under
`design/prototypes/` but were created before the current export contract. This
workflow prepares a compatibility prompt for the existing Claude Design project.
It does not redesign screens, edit prototype files, write application code, or
generate the repository-root build documents.

## 1. Inspect the existing export

If the project name is empty, ask for it. Confirm that `design/prototypes/`
contains at least one `*.dc.html`, `screen--*.html`, or logo prototype. If it
does not, stop and use `/prepare-claude-design <project name>` for a new design.

Read all available files under:

- `design/prototypes/`
- `design/system/`
- `design/planning/`
- `design/handoff/`
- `design/assets/`

Also read any product brief or design notes that explain the existing work.
Inventory every screen, filename, intended target surface, existing device or
browser frame, presentation canvas, annotation, and current handoff metadata.
Record whether a file combines multiple screens.

Ask only focused questions when the intended target surface or the boundary of
the actual shipped application UI cannot be determined from the export. Never
guess the app root. Never request passwords, API keys, tokens, connection
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

Include the observed inventory and require these compatibility changes:

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
3. Tell them to re-export and replace the corresponding files under `design/`.
4. Run:

```bash
npm run design:validate
```

5. After validation passes, run in Claude Code:

```text
/finalize-build-docs <project name>
```

Do not finalize build documentation until the adapted export is present and
validation passes.
