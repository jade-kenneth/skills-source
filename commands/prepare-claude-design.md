---
description: Prepare a reusable, copy-ready Claude Design master prompt and export contract before generating build documentation
argument-hint: [project name]
---

# /prepare-claude-design — create the Claude Design master prompt

**Project name:** $ARGUMENTS

Use this command before `/sync-build-docs`. It prepares the prompt that creates the
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
6. Declare the navigation graph and bind every control to a named action, so no
   screen is unreachable and no control is a decorative no-op.
7. Audit completeness, routing coverage, control coverage, responsiveness,
   accessibility, and cross-screen state consistency before export.

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
- the route, guard, and presentation of the screen itself, and the destination
  and observable result of every control, per the navigation and interaction
  contract below;
- every horizontally scrolling region — carousel, rail, chip row, tab strip, or
  overflow container — per the carousel and scroll-container contract below;
- accessibility: semantic hierarchy, focus order, visible focus, contrast, touch
  targets, reduced motion, screen-reader labels, and keyboard operation;
- platform-specific differences where native or responsive behavior requires them.

Do not invent a screen from a planning bullet and silently call it complete. When
scope is known but a design decision is unresolved, mark it explicitly as blocked.

### Navigation and interaction contract

A screen is not complete until it declares where it sits in the product's
navigation, and a control is not complete until it declares what it does.
Require both to be machine-checkable in the prototype itself, not only in prose,
so a missing route or an unbound button fails an audit instead of surviving to
implementation.

#### Screen and route identity

Every screen prototype declares its identity and routing on the same element
that carries `data-app-root`:

```html
<main data-app-root
      data-screen-id="booking-detail"
      data-route="/bookings/:bookingId"
      data-route-params="bookingId"
      data-nav-container="app-tabs > bookings-stack"
      data-presentation="push"
      data-route-guard="role:resident">
```

- `data-screen-id` is a stable kebab-case identity, reused verbatim by
  `screen-inventory.md`, `navigation-map.md`, `design-release.json`, and every
  control that targets the screen.
- `data-route` is the declared path template for that surface. Mobile screens
  declare a path even when the runtime uses native stack or tab navigation, so
  deep links and cross-surface parity stay explicit.
- `data-route-params` lists required params; omit it for paramless routes.
- `data-nav-container` names the owning tab, stack, drawer, or shell so nesting,
  tab persistence, and back stacks are unambiguous.
- `data-presentation` is one of `push`, `replace`, `tab`, `modal`, `sheet`,
  `dialog`, `drawer`, or `full-screen`.
- `data-route-guard` is `none`, `authenticated`, `unauthenticated`, or
  `role:<role>`.

#### Control action contract

Every interactive control — button, link, tab, menu item, list row, icon button,
chip, toggle, form submit, swipe action, and gesture target — declares what it
does:

```html
<button data-action-id="booking-detail.confirm"
        data-action="submit"
        data-action-target="booking-confirmed"
        data-action-states="default,hover,focus,pressed,disabled,loading,error"
        data-action-result="Confirms the booking, shows the success toast, and returns to Bookings.">
```

- `data-action` is exactly one of `navigate`, `back`, `submit`, `mutate`,
  `open`, `close`, `toggle`, `select`, `filter`, `sort`, `paginate`, `expand`,
  `copy`, `share`, `external`, `destructive`, or `none`.
- `data-action-target` names the destination `data-screen-id`, overlay id,
  target field, or `self`. A destination that is not designed yet is written as
  `needs-design:<screen-id>` and recorded in `open-decisions.md`; it is never
  left blank and never points at a placeholder.
- `data-action-states` lists the interaction states the control actually
  implements in the prototype.
- `data-action-result` is one plain sentence naming what the user observes.
- `destructive` additionally names its confirmation surface and states whether
  the action is reversible.
- `none` is allowed only for genuinely non-interactive display elements and must
  carry `data-action-note` explaining why. It is never a way to export an
  undesigned control.

#### Coverage rules that must hold before any export

1. Every screen has at least one declared inbound navigation and at least one
   declared exit. A screen with no inbound edge is a routing defect, not a
   stylistic one; a deliberately terminal screen must state why it terminates.
2. Every `data-action-target` naming a screen resolves to an existing
   `data-screen-id`, or is explicitly marked `needs-design:` and blocked.
3. Every interactive control carries exactly one `data-action`. Zero unbound
   controls, zero placeholder handlers, and no "coming soon" without a designed
   state.
4. Every screen declares back, cancel, and dismiss behavior and the exact screen
   each lands on, including Android hardware back, iOS swipe-back, and the
   browser back button on web.
5. Every parameterized route designs its loading, not-found, invalid-param, and
   permission-denied results as real states.
6. Every guarded route declares where a blocked visitor lands, whether it
   returns to the original destination after sign-in, and what a signed-in user
   without the required role sees.
7. Deep links, shareable URLs, tab and scroll restoration, nested navigation
   state, unsaved-changes interception, and post-submit destinations are
   declared wherever they apply.
8. Role differences are declared per route and per control. A control that is
   hidden, disabled, or retargeted for a role is designed in each of those
   variants.

### Carousel and scroll-container contract

Any horizontally scrolling region — carousel, media rail, chip or filter row,
scrollable tab strip, story tray, or table overflow container — is a designed
component, never incidental overflow. Each one declares its behavior on the
scroll container:

```html
<div data-scroller-id="home.featured"
     data-scroller="carousel"
     data-snap="item"
     data-items-visible="1.15 @mobile, 2.5 @tablet, 4 @desktop"
     data-peek="24px"
     data-autoplay="none"
     data-loop="false">
```

- `data-scroller` is one of `carousel`, `rail`, `chip-row`, `tab-strip`, or
  `overflow`.
- `data-snap` is `none`, `item`, or `page`.
- `data-items-visible` gives the real per-surface count, including the fractional
  count that produces the peek.
- `data-peek` is the exact amount of the next item left visible.
- `data-autoplay` is `none` or an interval, and an interval requires stated
  pause-on-hover, pause-on-focus, pause-on-touch, and a visible pause control.

**Hide the scrollbar on mobile and every touch surface.** A native horizontal
scrollbar over a carousel is platform chrome, not design; it must not appear on
mobile or tablet prototypes. Scrolling itself stays fully functional — hide the
indicator, never the ability to scroll:

```css
.scroller {
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;          /* Firefox */
  -ms-overflow-style: none;       /* legacy Edge */
}
.scroller::-webkit-scrollbar { display: none; }  /* WebKit and Blink */
```

Because the scrollbar is gone, the design must carry the discoverability itself.
Every touch scroller shows at least one affordance that more content exists: a
partial peek of the next item, pagination dots or an `n of m` counter, an edge
fade or gradient mask, or visible arrow controls. A hidden scrollbar with no
affordance is a design defect, not a clean look.

On pointer-driven web the same region may keep a slim styled scrollbar or use
visible arrow controls, but it must never depend on an invisible scrollbar for
discoverability. Never hide the vertical page scrollbar on desktop web, and
never hide a scrollbar on a scroll region a keyboard user must operate without
an equivalent visible control.

Every scroller must also design:

- **Its controls as real actions.** Previous/next arrows, dots, and "see all"
  are controls under the action contract above, with `data-action="paginate"` or
  `navigate`, a target, and an observable result.
- **Boundary and content states.** First and last item (arrows disabled, or an
  explicitly designed loop), fewer items than visible slots (align to the start,
  do not stretch), exactly one item (no carousel chrome at all), empty, loading
  skeleton items, and error.
- **Gesture boundaries.** Horizontal swipe must not trap the vertical page or
  screen scroll; declare which axis wins and where the region's momentum ends.
- **Accessibility.** Reachable and operable by keyboard with arrow keys or
  visible controls; focus must never land on an item clipped outside the visible
  area; position announced to screen readers as `item n of m`; and
  `prefers-reduced-motion` disables autoplay and replaces smooth scrolling with
  an instant jump.

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
├── navigation-map.md
├── user-flows.md
├── user-journeys.md
├── screen-inventory.md
├── interaction-inventory.md
├── roles-permissions.md
├── data-requirements.md
└── open-decisions.md
```

Planning describes scope and intent, not substitute markup. `screen-inventory.md`
must map every planned screen to its prototype filename and mark anything not yet
designed as `needs design`.

`navigation-map.md` is the normative route table. One row per screen: screen id,
route path, params, surface, navigation container, presentation, guard, the
screens and actions that reach it, its exits, its back/cancel/dismiss target,
deep-link support, and its not-found and permission-denied handling. Follow the
table with a navigation graph per role and an explicit list of any screen with no
inbound edge and any action target that does not yet resolve.

`interaction-inventory.md` is the normative control table. One row per control:
screen id, visible label, action id, action type, target, observable result,
implemented interaction states, confirmation requirement, and the business rule
it demonstrates. It must account for every interactive control in every exported
prototype. A control whose result is undecided belongs in `open-decisions.md`,
not in this table with an empty result. Mark mock records, component state used
as persistence, fake delays, and manual checks
`PROTOTYPE ONLY — MAP TO PRODUCTION ARCHITECTURE`.

### Design handoff documents

Require Claude Design to export both of these Markdown files under a dedicated
handoff folder:

```text
design/handoff/[PROJECT] Design Reference.md
design/handoff/[PROJECT] Design Handoff Plan.md
```

The **Design Reference** must consolidate the exact design system, identity,
screens, copy, interactions, states, responsive behavior, accessibility rules,
canonical demo data, prototype source mapping, the route and navigation graph,
the per-control action bindings, and planned-but-not-prototyped gaps. Prototype code remains the authority if its summary differs.

The **Design Handoff Plan** must describe screen, flow, route, and
control-action coverage, design dependencies, the MVP boundary, unresolved
design work, and per-screen Fidelity QA. It is not the engineering Implementation Plan. Repository structure, backend operations,
integrations, and reuse/removal decisions must be labeled `VERIFY IN REPO`
because Claude Design does not own the application architecture.

For every data-backed interaction, the handoff documents must identify the
observable result, required UI states, and applicable business rule while marking
mock records, local state, fake persistence, and manual prototype validation as
`PROTOTYPE ONLY — MAP TO PRODUCTION ARCHITECTURE`. They must not choose the
production data owner, transport, cache, validation library, or security layer.

Both files must link to each other. The Design Reference owns look and
interaction; the Design Handoff Plan owns design-derived sequencing. The later
`/sync-build-docs` pass reconciles them against the actual boilerplate and writes
the canonical repository-root `Product Specification.md` and
`Implementation Plan.md` without changing the untouched design export.

### Export contract

End the generated prompt with this required handoff structure:

```text
design/
├── prototypes/              # *.dc.html screen contracts and logo--*.html options
├── system/                  # normative design-system Markdown
├── planning/                # scope, IA, routes, flows, journeys, inventories, open decisions
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

`design/planning/screen-inventory.md` must include each screen's `data-screen-id`,
prototype, surface, route, design status, first-ready batch, and last-updated
batch. Use only:
`planned`, `in-design`, `ready-for-build`, `revision-required`, or
`superseded`.

Require a final export report containing:

- all files grouped by folder;
- every planned screen and its prototype filename;
- all supported states for each screen;
- route coverage: every screen's declared route, navigation container,
  presentation, and guard, plus any screen with no inbound navigation;
- control coverage: the number of interactive controls per screen, confirmation
  that each carries exactly one `data-action`, and every action target that does
  not yet resolve to a designed screen;
- scroller coverage: every carousel, rail, chip row, tab strip, and overflow
  container, its snap and peek values, its scrollbar treatment per surface, and
  the affordance that replaces the hidden scrollbar on touch;
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
