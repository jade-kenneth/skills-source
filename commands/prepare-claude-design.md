---
description: Prepare a reusable, copy-ready Claude Design master prompt and export contract before generating build documentation
argument-hint: [project name]
---

# /prepare-claude-design — create the Claude Design master prompt

**Project name:** $ARGUMENTS

Use this command before `/finalize-build-docs`. It prepares the prompt that creates the
product's design source; it does not design screens, write application code, or
generate `Product Specification.md` or `Implementation Plan.md` itself.

If usable screens already exist under `design/prototypes/`, do not overwrite them
or start a replacement design. Run `/adapt-design-export <project name>` instead
to prepare a compatibility pass for the existing Claude Design project.

## 1. Resolve the product brief

If the project name is empty, ask for it. Then gather only missing information,
grouping questions so the user can answer efficiently:

1. Product problem and one-sentence outcome.
2. Primary users, roles, and the most important job each role completes.
3. Target surfaces: consumer web, admin web, iOS/Android, tablet, desktop, or
   another explicit surface.
4. MVP flows and later-scope flows. Separate must-have from optional work.
5. Brand direction: personality, references, existing logo/assets, required or
   forbidden colors, typography constraints, and tone of voice.
6. Platform requirements: breakpoints, orientation, light/dark themes,
   localization, offline behavior, accessibility target, and supported devices.
7. Content, safety, privacy, moderation, or regulated-domain constraints that
   materially affect screens and states.

Never ask for passwords, API keys, connection strings, tokens, production data,
or other secrets. Product design needs representative demo content, not live data.

Read any existing product brief, PRD, task document, brand asset, or design file in
the repository before asking questions. Preserve verified decisions and surface
conflicts rather than silently replacing them.

## 2. Write the copy-ready prompt

Create `design/CLAUDE_DESIGN_PROMPT.md`, creating `design/` when necessary. If the
file already exists, show the proposed changes and ask before replacing it.

The generated file must be a self-contained prompt addressed directly to Claude
Design. Resolve the user's answers into it; do not leave generic placeholders for
information the user already provided. Include every section below.

### Role and goal

- State that Claude Design owns the product's UI, interaction behavior, visual
  system, and experience planning.
- Require production-grade, coherent designs rather than disconnected mockups.
- Require focused clarification before design whenever a missing decision would
  materially change navigation, platform behavior, scope, or brand direction.
- Forbid application implementation, backend code, database credentials, and
  architecture invented only to fill a visual gap.

### Confirmed product brief

Record the project name, problem, users/roles, target surfaces, MVP boundary,
later scope, brand direction, platform constraints, accessibility target, content
rules, and existing assets. Clearly label remaining decisions.

### Required design process

Instruct Claude Design to work in this order:

1. Confirm scope, roles, surfaces, and unresolved decisions.
2. Produce the information architecture and complete screen inventory.
3. Map every primary flow, alternate path, interruption, and recovery path.
4. Establish the reusable design system and content voice.
5. Create each screen and every required state using the shared system.
6. Connect navigation and interactions so controls are not decorative no-ops.
7. Audit completeness, responsiveness, accessibility, and cross-screen state
   consistency before export.

### Prototype contract

Require one exported prototype contract for every screen or materially distinct
surface. Use descriptive Design Component filenames such as
`Home.dc.html`, `Profile Settings.dc.html`, and `Admin Users.dc.html`. Logo option
exploration may use `logo--options.html`.

Every screen prototype must declare exactly one target surface and one production
boundary:

```html
<body data-prototype-surface="mobile">
  <div data-preview-shell>
    <main data-app-root>
      <!-- Actual application screen -->
    </main>
  </div>
</body>
```

Use `data-prototype-surface="web"`, `"mobile"`, `"tablet"`, or `"desktop"`.
`data-app-root` encloses only UI that belongs in the shipped application.
`data-preview-shell` may simulate a device or center the screen for review, but it
is never production UI. Put labels, measurement notes, alternate devices, browser
chrome, and other annotations outside `data-app-root` and mark them
`data-handoff="presentation-only"`. A presentation-only element must never contain
the app root.

For mobile prototypes, design the app root as a responsive viewport rather than a
fixed-width phone component. A reference size such as 390 × 844 is a review target,
not a production width. Declare safe-area ownership, system status/navigation bars,
keyboard behavior, scrolling boundaries, orientation support, native gestures,
and iOS/Android differences. HTML expresses visual and behavioral intent only;
production Expo/React Native code must use native primitives rather than a WebView
or copied DOM/CSS.

Prototype code may use local mock data, component state, fake delays, and manual
checks only to make intended states and interactions reviewable. Require the
handoff to label those mechanisms as prototype-only and describe the observable
outcome or business rule they demonstrate. Claude Design must not prescribe local
state, browser storage, manual validation, direct network calls, authentication,
authorization, persistence, or cache behavior as production architecture; those
are verified against the repository during build-document reconciliation.

Every prototype must specify and visibly implement:

- exact layout, element order, alignment, responsive behavior, and breakpoints;
- fonts, weights, sizes, line heights, letter spacing, colors, spacing, borders,
  radii, shadows, elevation, icon treatment, and imagery rules;
- real product copy rather than lorem ipsum;
- realistic, internally consistent demo data shared across screens;
- loading, skeleton, empty, error, success, disabled, offline, permission-denied,
  and destructive-confirmation states whenever applicable;
- hover, focus, pressed, selected, toggled, expanded, validation, and keyboard
  states for interactive controls;
- navigation, dialogs, drawers, menus, filtering, sorting, pagination, forms,
  gestures, animation, and transition behavior;
- accessibility: semantic hierarchy, focus order, visible focus, contrast, touch
  targets, reduced motion, screen-reader labels, and keyboard operation;
- platform-specific differences where native or responsive behavior requires them.

Do not invent a screen from a planning bullet and silently call it complete. When
scope is known but a design decision is unresolved, mark it explicitly as blocked.

### Design-system deliverables

Require exportable Markdown documentation for:

```text
design/system/
├── tokens.md
├── typography.md
├── colors.md
├── spacing-layout.md
├── components-states.md
├── motion.md
├── voice-content.md
└── accessibility.md
```

The system must name exact values, usage rules, component variants, interaction
states, responsive rules, and any intentional exceptions. Prototype code remains
the final authority when a prototype and system document disagree; Claude Design
must report such discrepancies before export.

### Planning deliverables

Require exportable Markdown documentation for:

```text
design/planning/
├── product-scope.md
├── information-architecture.md
├── user-flows.md
├── user-journeys.md
├── screen-inventory.md
├── roles-permissions.md
├── data-requirements.md
└── open-decisions.md
```

Planning describes scope and intent, not substitute markup. `screen-inventory.md`
must map every planned screen to its prototype filename and mark anything not yet
designed as `needs design`.

### Design handoff documents

Require Claude Design to export both of these Markdown files under a dedicated
handoff folder:

```text
design/handoff/[PROJECT] Design Reference.md
design/handoff/[PROJECT] Design Handoff Plan.md
```

The **Design Reference** must consolidate the exact design system, identity,
screens, copy, interactions, states, responsive behavior, accessibility rules,
canonical demo data, prototype source mapping, and planned-but-not-prototyped
gaps. Prototype code remains the authority if its summary differs.

The **Design Handoff Plan** must describe screen and flow coverage, design
dependencies, the MVP boundary, unresolved design work, and per-screen Fidelity
QA. It is not the engineering Implementation Plan. Repository structure, backend operations,
integrations, and reuse/removal decisions must be labeled `VERIFY IN REPO`
because Claude Design does not own the application architecture.

For every data-backed interaction, the handoff documents must identify the
observable result, required UI states, and applicable business rule while marking
mock records, local state, fake persistence, and manual prototype validation as
`PROTOTYPE ONLY — MAP TO PRODUCTION ARCHITECTURE`. They must not choose the
production data owner, transport, cache, validation library, or security layer.

Both files must link to each other. The Design Reference owns look and
interaction; the Design Handoff Plan owns design-derived sequencing. The later
`/finalize-build-docs` pass reconciles them against the actual boilerplate and writes
the canonical repository-root `Product Specification.md` and
`Implementation Plan.md` without changing the untouched design export.

### Export contract

End the generated prompt with this required handoff structure:

```text
design/
├── prototypes/              # *.dc.html screen contracts and logo--*.html options
├── system/                  # normative design-system Markdown
├── planning/                # scope, IA, flows, journeys, inventory, open decisions
└── handoff/
    ├── [PROJECT] Design Reference.md
    └── [PROJECT] Design Handoff Plan.md
```

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

Require a final export report containing:

- all files grouped by folder;
- every planned screen and its prototype filename;
- all supported states for each screen;
- planned but not prototyped items;
- unresolved decisions and design-system/prototype discrepancies;
- target surfaces, each prototype's `data-prototype-surface`, and its `data-app-root` boundary;
- presentation-only shells or annotations that production must exclude;
- responsive coverage, including the reference viewport and tested size range;
- accessibility checks completed and remaining risks.

The exported files must contain no passwords, API keys, tokens, connection strings,
private customer data, or other secrets.

## 3. Hand off to the user

After writing `design/CLAUDE_DESIGN_PROMPT.md`:

1. Open the file for the user.
2. Explain that its full contents should be pasted into Claude Design.
3. Explain that Claude Design's completed export must include
   `design/prototypes/`, `design/system/`, `design/planning/`,
   `design/handoff/[PROJECT] Design Reference.md`, and
   `design/handoff/[PROJECT] Design Handoff Plan.md`.
4. Give the next commands:

```bash
npm run design:validate
```

Then, in Claude Code for every design release:

```text
/sync-build-docs <project name>
```

Use `/finalize-build-docs <project name>` only after the final MVP design release.

Do not wait for every screen before the first sync. Sync only validated releases,
and finalize only after the required MVP design is complete.
