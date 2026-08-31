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
- routing coverage: every screen's route, params, navigation container,
  presentation, and guard, plus any screen with no inbound navigation and any
  navigation that lands nowhere;
- control coverage: every button, link, tab, menu item, row, icon button,
  toggle, form submit, swipe action, and gesture target, and whether each one
  has a defined destination and observable result rather than a dead handler;
- horizontally scrolling regions: carousels, rails, chip rows, scrollable tab
  strips, and overflow containers, including any that expose a native scrollbar
  on a touch surface, hide one without leaving a discoverability affordance, or
  lack boundary, single-item, empty, loading, and error states;
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
an HTML file exists. An unreachable screen, an undefined back/cancel target, or
an unbound control is `needs-correction`, never `ready` — a screen that looks
finished but strands the user is an incomplete screen.

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
10. Declare each screen's identity and routing on the same element that carries
    `data-app-root`: `data-screen-id` (stable kebab-case, reused by the planning
    documents and by every control that targets the screen), `data-route`,
    `data-route-params` where params exist, `data-nav-container`,
    `data-presentation` (`push`, `replace`, `tab`, `modal`, `sheet`, `dialog`,
    `drawer`, or `full-screen`), and `data-route-guard` (`none`,
    `authenticated`, `unauthenticated`, or `role:<role>`). Mobile screens
    declare a path even when the runtime uses native stack or tab navigation.
11. Bind every interactive control to exactly one action: `data-action-id`,
    `data-action` (one of `navigate`, `back`, `submit`, `mutate`, `open`,
    `close`, `toggle`, `select`, `filter`, `sort`, `paginate`, `expand`, `copy`,
    `share`, `external`, `destructive`, or `none`), `data-action-target` (a real
    `data-screen-id`, overlay id, field, `self`, or `needs-design:<screen-id>`
    for an undesigned destination), `data-action-states`, and
    `data-action-result` as one plain sentence naming what the user observes.
    `destructive` names its confirmation surface and states reversibility;
    `none` is only for genuinely non-interactive display elements and must carry
    `data-action-note`. Adding these bindings is a completeness repair, not a
    restyle — do not change a control's existing behavior while annotating it.
12. Declare every horizontally scrolling region on its scroll container with
    `data-scroller-id`, `data-scroller` (`carousel`, `rail`, `chip-row`,
    `tab-strip`, or `overflow`), `data-snap`, `data-items-visible`, `data-peek`,
    `data-autoplay`, and `data-loop`. On mobile and every touch surface the
    native scrollbar is hidden — `scrollbar-width: none`,
    `-ms-overflow-style: none`, and a `::-webkit-scrollbar { display: none }`
    rule — while scrolling stays fully functional, and the region carries a
    replacement affordance: a peek of the next item, pagination dots or an
    `n of m` counter, an edge fade, or visible arrows. Never hide the vertical
    page scrollbar on desktop web. Repair boundary, single-item, empty, loading,
    and error states, gesture-axis boundaries, keyboard operation, position
    announcement, and reduced-motion behavior for each region, and treat its
    arrows and dots as controls under the action contract.

Rehabilitation is not finished while a routing or control gap remains. Before any
release: every screen has at least one declared inbound navigation and one
declared exit; every action target that names a screen resolves to an existing
`data-screen-id` or is marked `needs-design:` and blocked; every screen declares
back, cancel, and dismiss behavior and the exact screen each lands on, including
Android hardware back, iOS swipe-back, and the browser back button; every
parameterized route designs its loading, not-found, invalid-param, and
permission-denied results; every guarded route declares the blocked-visitor
destination, the post-sign-in return, and the wrong-role result; and role
differences are designed per route and per control. Existing screens that already
satisfy a rule keep their current design.

For mobile, fixed reference dimensions belong on the preview shell, never the
application root. Document reference viewport, tested size range, safe-area
ownership, system bars, keyboard, scrolling, orientation, gestures, and
platform differences. Exported HTML is a visual and behavioral contract;
production Expo/React Native uses native primitives, not WebView or copied
DOM/CSS.

For web, document supported breakpoints, responsive reflow, overflow, focus and
keyboard behavior, and accessible semantics. Do not treat a fixed presentation
canvas as the production viewport.

Audit prototype runtime shortcuts as part of rehabilitation. Preserve the
observable outcome and the underlying approved business rule, but label local mock
data, component state used as persistence, fake delays, inline/manual validation,
hard-coded permissions, and simulated network behavior as prototype-only. Do not
promote those mechanics into the handoff as engineering requirements.

## 4. Refresh the handoff contract

Require Claude Design to preserve and refresh system, planning, and asset
documents. `design/planning/navigation-map.md` and
`design/planning/interaction-inventory.md` must be created when absent and
regenerated from the repaired prototypes when present: the navigation map is the
normative route table (screen id, route, params, surface, container,
presentation, guard, entry points, exits, back/cancel/dismiss target, deep-link
support, not-found and permission-denied handling) followed by a navigation graph
per role and a list of unresolved targets; the interaction inventory is the
normative control table (screen id, label, action id, action type, target,
observable result, implemented states, confirmation requirement, business rule)
and must account for every interactive control in every exported prototype.

Export exactly:

```text
design/handoff/[PROJECT] Design Reference.md
design/handoff/[PROJECT] Design Handoff Plan.md
```

The Design Reference owns the verified design source, visual and interaction
contract, prototype mappings, surfaces, application boundaries, the route and
navigation graph, the per-control action bindings, and presentation-only
exclusions. The Design Handoff Plan owns design-derived scope, gap recovery,
screen/flow/route/control-action coverage, sequencing, dependencies, open design
work, and per-screen fidelity QA. Engineering architecture remains `VERIFY IN REPO`.

For each data-backed interaction, record its observable result, required states,
and approved business rule, then mark any mock/local/manual implementation as
`PROTOTYPE ONLY — MAP TO PRODUCTION ARCHITECTURE`. Production state ownership,
GraphQL operations, cache behavior, validation layers, authorization, persistence,
and error contracts remain repository decisions.

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

Refresh `design/planning/screen-inventory.md` with `data-screen-id`, prototype,
surface, route, design status, first-ready batch, and last-updated batch. Use only `planned`,
`in-design`, `ready-for-build`, `revision-required`, or `superseded`.

## 6. Require a rehabilitation report

End the generated prompt by requiring:

- the completed design gap audit and all remaining ambiguous decisions;
- every repaired, created, unchanged, deferred, and superseded screen;
- evidence for intentional changes and confirmation that unrelated valid design
  decisions were preserved;
- old-to-new filename mappings;
- each screen's surface and `data-app-root`;
- route coverage: each screen's route, container, presentation, and guard, plus
  any screen still lacking inbound navigation;
- control coverage: controls repaired from dead or undefined handlers, controls
  now bound to an action, and every action target that does not yet resolve to a
  designed screen;
- scroller coverage: every carousel, rail, chip row, tab strip, and overflow
  container, its scrollbar treatment per surface, and the affordance that
  replaces a hidden scrollbar on touch;
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
