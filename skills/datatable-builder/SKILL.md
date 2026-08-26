---
name: datatable-builder
description: Enforce the canonical DataTable for compatible web surfaces under apps/*-admin or apps/*-web, and build or rebuild it by porting DataTableReference when the web app does not already provide it. Use whenever a web build, fix, enhancement, or approved design includes a table, even when the user does not explicitly ask for a DataTable. Do not use for apps/*-mobile Expo/React Native screens; route native tabular displays through the mobile-app skill. Do not create a custom or one-off web table unless the user explicitly requests one.
---

# DataTable Builder

This skill routes every compatible web table requirement through the web
application's canonical `DataTable`. Reuse the existing foundation when present.
If the web application does not provide it, build `DataTable` by porting
`DataTableReference` (found in `references/` alongside this file) to the
current web dependency set.

Do not use this skill for `apps/*-mobile` Expo/React Native screens. Route
native tabular displays through `mobile-app` and its native UI guidance.

Before starting, infer the target output path from the request, the current app,
and the nearest table implementation. Ask only when multiple plausible targets
remain and choosing one would materially change the work.

## Required selection rule

1. Confirm the target is a compatible web surface under `apps/*-admin` or `apps/*-web`.
2. For `apps/*-mobile`, stop using this skill and route the work through `mobile-app`.
3. Use the web application's canonical `DataTable` when it already exists.
4. Port `DataTableReference` only when no supported canonical web `DataTable` exists.
5. Never create a custom, one-off, or alternative web table unless the user explicitly requests a custom table.
6. If this skill or its required references cannot satisfy the approved web architecture, stop and ask the user instead of silently implementing a custom table.

## How to use this skill

1. **Read this file fully** — it contains all constraints and rules.
2. **Read all files in `references/`** — `DataTableReference` is the single authoritative source for architecture, file structure, context boundaries, hook shape, and public API. Do not deviate from it unless a dependency is unsupported.
3. **Discover shadcn components via MCP before implementing:**
   - `mcp__shadcn__get_project_registries` → confirm registries
   - `mcp__shadcn__search_items_in_registries` → find relevant components
   - `mcp__shadcn__view_items_in_registries` → inspect component details
   - `mcp__shadcn__get_add_command_for_items` → generate add commands

---

## Goal

Use the web application's canonical `DataTable` for every compatible web table requirement. When that foundation is missing, rebuild `DataTable` by copying the **structure, architecture, composition model, and folder/file layout** of `DataTableReference` as closely as possible. Preserve the approved product design's visible outcomes and interactions while using that architecture.

`DataTableReference` is the **only** reference for:

- component architecture
- file splitting
- provider/context boundaries
- hook/store shape
- feature ownership
- composition pattern
- public API mindset

Do **not** use `DataTableTwo`, `DateTable`, or any other table implementation as an architectural reference.

---

## Critical Constraint

Copy `DataTableReference` code structure, architecture, and folder/file layout **strictly and completely**. Do not deviate from the structure unless a dependency is unsupported and has no supported equivalent.

Although `DataTableReference` is the only code and architecture reference, its original implementation uses some dependencies and aliases that may not be supported in the target app. You must therefore:

- copy the `DataTableReference` code structure exactly
- copy the `DataTableReference` architecture exactly
- copy the `DataTableReference` file/folder breakdown exactly
- keep the `DataTableReference` behavioral responsibilities exactly
- replace only the dependencies that are unsupported — everything else stays identical

---

## Priority Order (Strict)

When instructions compete, resolve in this order:

1. Approved product design for visible layout, controls, states, and interaction outcomes.
2. `DataTableReference` architecture and file/folder composition.
3. Existing web DataTable presentation only where the approved design is silent.
4. shadcn pre-built component usage when it preserves the authorities above.

Do not let the legacy table presentation override an approved design. Do not let
a pre-built component choice change the approved outcome or, where the design is
silent, the established web DataTable baseline.

---

## UI Rule

Implement the approved product design's table presentation and observable
interaction outcomes. Product design may intentionally change toolbar layout,
spacing, controls, states, or interactions; preserve those decisions while
retaining the canonical DataTable architecture.

Where the approved design is silent, use the existing web DataTable experience
as the visual and interaction baseline. Do not introduce an unapproved second
design language, and do not preserve legacy presentation when it contradicts the
approved design.

At minimum, use these `components/ui` files when relevant:

- `components/ui/table.tsx`
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/input.tsx`
- `components/ui/select.tsx`
- `components/ui/sheet.tsx`
- `components/ui/separator.tsx`
- `components/ui/skeleton.tsx`
- `components/ui/switch.tsx`
- `components/ui/tooltip.tsx`
- `components/ui/scroll-area.tsx`

Do **not** treat these as low-level primitives to hand-compose replacements for existing shadcn patterns.

Use **pre-built shadcn components first**. If a pre-built component exists for the behavior, use it instead of custom composition.

Also utilize additional **shadcn pre-built components** when they better match `DataTableReference` behavior:

- prefer pre-built `combobox` patterns over custom searchable dropdown logic
- prefer `calendar`-based pickers over native date inputs when date picker behavior is needed
- prefer `checkbox` components over raw checkbox inputs in table/filter selection UIs
- prefer `dropdown-menu` for preset/action menus instead of custom button lists
- avoid building custom controls from generic `button`/`input` wrappers when a matching shadcn pre-built exists
- do not replace existing DataTable interaction patterns solely to satisfy a pre-built pattern

Use no other UI system. This is non-negotiable:

- do not use Ark UI components
- do not use old custom `Field`, `Presence`, `Icon`, `Checkbox`, `Tooltip`, `Button`, or `Select`
- do not use `@untitled-theme/icons-react`
- do not use unsupported path aliases such as `~/...`

Use only supported imports available in the current app and installed packages it already uses.

---

## File/Folder Structure Requirement

Mirror the `DataTableReference` package structure as closely as possible.

Expected target structure (relative to the output path):

```text
DataTable/
  index.ts
  DataTable.tsx
  DataTableContext.tsx
  useDataTable.tsx
  Table.tsx
  Searchbar.tsx
  Pagination.tsx
  Reload.tsx
  Export.tsx
  ColumnControls/
    index.ts
    ColumnControls.tsx
    ColumnControlsContext.ts
  Filter/
    index.ts
    Filter.tsx
    FilterContext.ts
    Input.tsx
    Select.tsx
    MultiSelect.tsx
    Combobox.tsx
    MultiCombobox.tsx
    DatePicker.tsx
    DateRangePicker.tsx
    DualDateRangePicker.tsx
    NumberRangePicker.tsx
    Switch.tsx
```

If a `DataTableReference` file exists, `DataTable` should generally have a corresponding file with the same responsibility. Do not collapse the package into one file unless absolutely impossible.

---

## Architecture Requirement

Preserve the `DataTableReference` architecture:

1. `useDataTable.tsx` owns the compositional state model.
2. `DataTable.tsx` is the top-level composition shell.
3. `DataTableContext.tsx` exposes shared table state.
4. `Filter/*` owns filter UI and filter-local context.
5. `ColumnControls/*` owns column controls UI and column-controls-local context.
6. `Table.tsx` renders the actual table body/head/footer.
7. `Searchbar.tsx`, `Pagination.tsx`, `Reload.tsx`, and `Export.tsx` remain separate focused pieces.
8. `index.ts` exports the public surface.

The result should feel like `DataTableReference` reimplemented for the current app, not like `DataTableTwo` renamed to `DataTable`.

---

## Behavior Requirement

Keep `DataTableReference` behavior and responsibilities as closely as possible:

- collection-based table input
- internal table state hook
- column controls
- sortable columns
- hideable columns
- orderable columns
- persisted hidden columns / column order
- search
- filters
- pagination
- reload
- export
- row selection
- summary row support
- slot-based composition around the table shell

If `DataTableReference` has a behavior, preserve it unless the original behavior depends on an unsupported dependency. When a behavior must be adapted, preserve the intent and public contract.

---

## Dependency Adaptation Rule

When porting `DataTableReference`, replace unsupported dependencies with supported equivalents, but do not change architecture unless required.

Examples:

- replace legacy UI components with current `components/ui/*` and other supported shadcn pre-builts
- replace unsupported icon packages with `lucide-react`
- replace unsupported checkbox implementations with the supported shadcn `checkbox` component (use native checkbox only as fallback when no pre-built equivalent can satisfy the requirement)
- keep `@dnd-kit/*` for DnD-based ordering — it is supported and must not be replaced
- replace unsupported Ark/portal/presence abstractions with supported shadcn compositions (sheet/dialog/popover/scroll-area/table/etc.)

Important:

- adapt dependencies, not architecture
- simplify implementation only where dependency support forces simplification
- pre-built shadcn components are the default; primitive-only fallbacks are allowed only when no supported pre-built exists
- pre-built usage must preserve the approved product design and, where it is silent, the existing DataTable UI baseline

---

## Public API Rule

The public API should remain consistent with the `DataTableReference` mental model.

At minimum, preserve or recreate equivalent support for:

- `DataTable`
- `DataTable.collection(...)`
- `DataTable.clearStore()`
- collection input
- column config
- filter config
- search config
- pagination config
- sort config
- row selection config
- table shell slots

---

## Styling Rule

The web table presentation must follow this order:

- implement the approved product design's spacing, controls, states, and interaction outcomes
- where the design is silent, retain the existing web DataTable baseline
- use the shared `components/ui/table.tsx` primitives for the table structure
- use the app's `components/ui/*` components and supported shadcn pre-builts for controls
- avoid introducing an unapproved second design language
- do not recreate `DataTableReference`'s old visual system

In short: copy `DataTableReference` architecture and package structure, while
adapting the web presentation to the approved product design with supported
`components/ui/*` and shadcn components selected via MCP.

---

## Implementation Notes

- keep components small and focused
- keep file ownership clear
- avoid broad refactors outside `DataTable`
- avoid unrelated changes
- prefer maintainable code over clever abstractions
- use supported imports only
- preserve TypeScript typing quality

---

## Definition Of Done

The output is correct only if all of the following are true:

1. Every compatible web table requirement uses the web application's canonical `DataTable`; no custom or one-off web table is introduced unless the user explicitly requests one.
2. Native `apps/*-mobile` tabular displays are routed through `mobile-app`, never this DOM-oriented skill.
3. Approved product design controls visible table presentation and interactions.
4. When the canonical web foundation is missing, `DataTable` mirrors `DataTableReference` package structure and architecture.
5. `DataTable` does not depend on unsupported `DataTableReference` dependencies.
6. Where the approved design is silent, `DataTable` preserves the existing web UI and interaction baseline.
7. `DataTable` uses current `components/ui/*` plus supported shadcn pre-built components discovered through the shadcn MCP workflow.
8. `DataTable` remains modular, not monolithic.
9. `DataTable` feels like a supported, modernized port of `DataTableReference`, not a variant of `DataTableTwo`.
