---
description: Reconcile Claude Design's Design Reference and Design Handoff Plan with the actual boilerplate into canonical Product Specification and Implementation Plan documents
argument-hint: [project name]
---

# /finalize-build-docs — finalize the repository build documents

> Final completeness gate. For the first or any partial design release, use
> `/sync-build-docs <project name>` so Codex can start ready slices while Claude
> Design continues later screens.


**Project name:** $ARGUMENTS

## Final release requirement

Run `npm run design:validate-final` first. This accepts only an unchanged,
already synchronized final release. Require `design/design-release.json` with
`"status": "final"`. Required MVP scope must have no `stillInDesign`,
`planned`, `in-design`, or `revision-required` entries. If the release is
incremental or required design remains unfinished, stop and run
`/sync-build-docs <project name>` instead.

Read `design/design-sync.lock.json`. Reconcile the final release if it is newer
than the lock, then run `npm run design:ack` only after both root documents are
consistent. Preserve earlier synchronized phase history and completed engineering
decisions.

## Runtime inputs (resolve these FIRST, before any writing)

1. **Project name** — taken from the arguments above. If empty, ask me for it.
2. **Database target** — confirm the environment variable name (default: `MONGODB_URI`), the intended non-secret database name, and whether that variable is configured in the current environment. Never ask for, print, copy, or write the connection string or credentials. The docs must contain only the environment-variable name and a sanitized database identifier. If it is not configured, record a blocked setup task instead of requesting a secret.
3. **App mapping** — ask me which boilerplate app becomes which product surface, including renames and full-app removals (e.g. `apps/app-web` → `[project]-web` hosting BOTH the consumer app and `/admin`; `apps/app-mobile` removed with its push/auth needs re-covered via Capacitor). Do not assume a mapping.
4. **Stack overrides** — confirm the target stack. Default if I confirm no changes: Capacitor-wrapped Next.js web client (consumer app + `/admin` dashboard in ONE web app) · NestJS GraphQL API · MongoDB · AWS S3, with all app data over GraphQL via TanStack Query + graphql-request + GraphQL Code Generator; only S3 presigned + CDN are REST.

If the boilerplate's client stack differs from the confirmed target stack (e.g. repo ships Expo React Native but the target is Capacitor web-first), **stop and ask** which one wins before writing the plan — it changes every client-side task and can mean removing an entire app (see App mapping).

---

You are finalizing the canonical build documentation for **$ARGUMENTS**. Do not design new UI or write app code. Start from Claude Design's exported paired documents, verify every design claim against the export, reconcile engineering claims against the actual repository, and write the reviewed canonical copies to the repository root.

### Step 1 — Explore before writing

**Where the truth lives.** All product planning and UI/UX for this project was done in **Claude Design** and exported into `design/`. That export — not the boilerplate, not any prior repo — is the origin of the product's look, behavior, and scope. The boilerplate contributes reusable implementation architecture. Read the three source folders and the exported paired documents with different authority:

| Folder               | Contents                                              | Authority                                                                  | Feeds                              |
| -------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------- |
| `design/prototypes/` | `screen--<name>.html`, `logo--<name>.html`            | **Pixel/behavior contract inside `data-app-root`; implementation is target-platform native** | Product Specification §2, §3, §4 |
| `design/system/`     | tokens, type scale, color, style moves, motion, voice | **Normative** — the values in §1 must match exactly                        | Product Specification §1           |
| `design/planning/`   | flows, IA, user journeys, scope notes, PRD fragments  | **Context, not contract** — read for understanding; never ported as markup | Product Specification §5, §6; Implementation Plan phases |
| `design/handoff/[PROJECT] Design Reference.md` | Claude Design's UI/behavior summary | **Baseline summary** — preserve verified detail; prototypes win conflicts | Canonical repo-root Product Specification |
| `design/handoff/[PROJECT] Design Handoff Plan.md` | Design coverage and sequencing | **Planning input, not engineering plan** — verify all architecture | Canonical repo-root Implementation Plan |

Require exactly one Design Reference and one Design Handoff Plan in
`design/handoff/`. Read every source file and both handoff documents. Quote
nothing you have not verified. Then **list the files you're basing this on**,
grouped by folder, before writing anything. Do not edit the handoff pair; produce
reconciled canonical documents at the repository root.

**Prototype filename patterns:** prototype files may land as `screen--<name>.html` / `logo--<name>.html` **or** as Design Component exports named `<Screen Name>.dc.html` (e.g. `Video Factory Prototype.dc.html`). Treat every `*.dc.html` file exactly like a `screen--*.html` file — each one is a screen contract subject to the Completeness rule below; never skip a prototype because its filename doesn't match `screen--*`.

**Prototypes (`design/prototypes/`)** are the **pixel-exact, behavior-exact contract**, not loose inspiration. For every screen, require exactly one `data-prototype-surface` and one `data-app-root`. Extract every font-family/size/weight/line-height, hex color, spacing value, border/shadow/radius/rotation, element and its order, state, interaction, handler, and animation from inside the app root. Preserve visible copy verbatim. Do not treat `data-preview-shell`, `data-handoff="presentation-only"`, device frames, desktop centering canvases, browser chrome, measurement labels, or design-tool annotations as production UI.

**Completeness rule:** every prototype file (`screen--*.html` and `*.dc.html`) MUST produce its own §3 (or §4) subsection in the Product Specification. Before writing, map each prototype file to a planned section; if any file has no section, or `design/planning/` describes a screen that has no prototype file, surface the gap to me explicitly instead of silently omitting or inventing it.

**Scope rule:** `design/planning/` may describe screens, flows, or features that were never prototyped. Those are **not** silently dropped and **not** designed by you — list them in a "Planned but not prototyped" callout in File A §6 and give them Implementation Plan phases marked `⚠ needs design` (blocked on a prototype before implementation).

**Platform-aware fidelity mandate (read first, applies to everything below):** the shipped screen must match the UI inside `data-app-root` in appearance, content, states, and behavior. Fidelity does not mean copying cross-platform implementation code. For compatible web targets, reuse sound prototype markup and styles when appropriate. For Expo/React Native, translate the contract into native components, navigation, safe areas, scrolling, keyboard handling, gestures, sheets, and platform conventions; never ship the HTML in a WebView or reproduce its DOM/CSS mechanically. Exclude every preview shell and presentation-only element. Reference viewport dimensions are comparison targets, not fixed production widths. Mock data becomes real data through the confirmed application architecture.

**Conflict resolution (strict order):**

1. `design/prototypes/` — the `data-app-root` content wins on visual and behavioral outcomes; its HTML APIs do not override target-platform architecture.
2. `design/system/` — wins on tokens/values where a prototype is silent or a screen is unbuilt.
3. `design/planning/` — wins on scope, flow, and terminology only.
4. Repo conventions (`CLAUDE.md`, `AGENTS.md`, `.skills-source/conventions/`) — win on code structure, naming, and stack patterns. **Never on UI.**
5. Boilerplate UI — never wins. It is discarded (see Step 2).

Use the exported Design Reference and Design Handoff Plan as starting documents, not disposable notes. Preserve all verified design detail, terminology, screen mappings, states, and dependencies. Replace or mark only claims disproved by the prototypes, design system, planning sources, or actual repository scan. Also read any other task/plan/PRD files in the repo. The **logo prototype file** (`logo--*.html` and its chosen option) is the mark's source of truth; preserve the chosen visual outcome exactly using a production-appropriate asset or native implementation.

If the visual direction or scope is ambiguous after reading all three folders, ask me focused questions first.

### Step 2 — Lock the stack & constraints

Target stack: as confirmed in **Runtime inputs #4**.
Database connection: use the environment-variable name and sanitized database target confirmed in **Runtime inputs #2**. The plan must wire every data task through that variable, must never contain its value, and must mark configuration as blocked when the variable is unavailable.
API/data conventions: as confirmed in **Runtime inputs #4** (default: all app data over GraphQL via TanStack Query + graphql-request + GraphQL Code Generator; only S3 presigned + CDN are REST).

Boilerplate: **`github.com/jade-kenneth/app-boilerplate` (main)** — apps: `apps/app-web` (Next.js) · `apps/app-api` (NestJS GraphQL) · `apps/app-mobile` (Expo RN). **Scan the actual repo folder-by-folder** (every app, every subfolder); never describe it from memory — this list is a starting point, not a substitute for reading the tree. It provides: monorepo, GraphQL client+server+codegen, TanStack Query, auth/roles, S3 plumbing, push notifications, DataTable, CI.

App mapping: as confirmed in **Runtime inputs #3**. **Rename every surviving app after $ARGUMENTS** (`app-web` → `[project]-web`, `app-api` → `[project]-api`) so the workspace reads as the product, not the boilerplate. Renames/removals must list their ripples (nx/workspace config, package names, codegen paths, CI, docker-compose, root docs) as explicit tasks. Treat backend/plumbing boilerplate (GraphQL client+server, TanStack Query, auth, authz, S3, CI) as **reuse-not-rebuild**: for every feature, find the existing primitive and extend it in the established pattern; never re-implement auth, authz, or the client/codegen pipeline. Mark foundation tasks as already-provided rather than to-build.

**Boilerplate UI is the ONE exception — disregard it entirely.** Any starter/scaffold/default UI, theme, component library styling, or example screens from the boilerplate must be discarded and replaced. The prototypes and design system (§1) are the sole source of truth for look and interaction; never let a boilerplate default theme, layout, or component override the design. If a boilerplate screen conflicts with the Product Specification, the Product Specification wins and the boilerplate UI is rebuilt to match.

### Step 2.1 — Boilerplate trim audit (always required)

Apply the **app mapping** from Step 2 first — an app being renamed is audited under its new name; an app being **removed entirely** gets a one-line entry (all files, nothing salvaged as code) plus a note on where its responsibilities are re-covered, instead of a folder-by-folder table. Then scan **every folder of every surviving app** and classify each folder/module into exactly one bucket:

- **KEEP [BP]** — plumbing reused as-is: auth/session/roles, GraphQL client + codegen pipeline, repository layer, S3, push-token/push-notification plumbing, DataTable/ui primitives, hooks/utils, CI.
- **ADAPT** — file stays but its content is rebuilt for **$ARGUMENTS**: every screen/theme/asset (per the "boilerplate UI is discarded" rule), seed script, dashboard metrics, mail templates, env schema, privacy policy.
- **REMOVE** — the previous product's domain modules and leftovers with **no counterpart in $ARGUMENTS**: unused feature modules (client + API resolver/service/repository + `.gql` schema + generated types + react-query operations — remove the whole vertical slice, never just one layer), stale task/reference `.md` files, scaffold demo assets (default framework SVGs, old logos/mascots/photos), dead providers (e.g. multi-tenant, i18n, dark-mode if the design is single-theme), unused fonts.

**Assets are audited file-by-file** — every image, icon, font, logo, SVG, splash, and mail-branding asset is explicitly classified: **ADAPT** when the slot survives but the content is replaced with the project's art (app icon, splash, logo, header mark, fonts, onboarding art, notification icon), **REMOVE** when it has no slot in $ARGUMENTS (previous product's photos/mascots/landing art, default framework SVGs, duplicate icon exports). **No boilerplate asset ships as-is.**

Output the audit as a **"Boilerplate Trim List"** — one keep/adapt/remove table per app, every top-level folder accounted for — and include it in File B, with "execute the trim list" as an explicit early-phase task **before any feature work** so dead modules never ship. Where a removal is a judgment call (e.g. account-deletion flows required by app stores, push-tester dev tools), keep it and mark it `⚠ decision`.

### Step 2.5 — Seed data (always required)

The plan **must always** include a database seed step that populates the configured non-production database so the app is demonstrable on first run — no empty states at demo time. Seed at minimum:

- **A working login account** (seeded user with known email + password, credentials stated explicitly in the plan) so the app can be signed into immediately.
- **Initial display data** for every primary screen: the canonical demo entities from §5 (users/handles, posts, ratings, comments, notifications, map pins, etc.) so each screen renders populated on first load.

Make seeding **idempotent and re-runnable** (e.g. an `npm run seed` script), and cross-reference the seeded records to the canonical demo data in File A §5 so both surfaces tell one coherent story.

### Step 3 — Finalize the TWO paired files

**File A — `Product Specification.md` (UI & behavior source of truth).** Begin with the exported `design/handoff/[PROJECT] Design Reference.md`, preserve verified design detail, resolve discrepancies against the prototype's `data-app-root` contract, and ensure these sections:

0. **What it is** + product stack + an "API convention (read this first)" callout + a "⚠ the `design/` export from Claude Design is the origin of this product's UI, behavior, and scope; the boilerplate contributes backend plumbing only — build on it, don't scaffold from scratch, and discard its UI entirely" directive + the confirmed database environment-variable name and sanitized target (never its secret value) + a "database is always seeded (login + display data)" note. Include the conflict-resolution order from Step 1.
1. **Design system** — sourced from `design/system/` (and any values only present in the prototypes). Reproduce _exactly_: type scale/weights, a color-token table with hex + usage, the signature style moves (borders, shadows, radii, rotations, badges), key surface/background rendering, an explicit **imagery rule** (placeholders vs. real assets — no hand-drawn art), motion/animation specs, and voice/tone. Where `design/system/` and a prototype disagree, the prototype wins — note the discrepancy inline so I can fix the export.
2. **Logo & identity** — name the **logo prototype file + chosen option** as the source of truth (e.g. `design/prototypes/logo--options.html` option `1a`); preserve the chosen mark exactly using a production-appropriate asset or native implementation, with its exact variants (hero, horizontal lockup, reversed app-icon tile, small header). List everywhere it is reused (splash, header, onboarding, admin, app icon, notification avatar) and call out which options are NOT chosen.
3. **Every primary screen** (client) — one subsection per `screen--*.html` file, treated as a **platform-aware fidelity spec**, not a loose description. For each screen include: (a) the **source prototype file, declared surface, and `data-app-root` boundary** it comes from, so an engineer can inspect the real contract without copying preview chrome; (b) exact layout with real values (font-family/size/weight/line-height, hex colors, px spacing/gaps, borders, shadows, radii, rotations — lifted from the prototype, not approximated); (c) exact copy, verbatim; (d) **every** state, interaction, handler, and animation (nothing "minor" omitted — hover/press/active states, transitions, empty/loading/error states, toggles, moderation blocks, etc.); and (e) a closing **"Production mapping (Phase N)"** paragraph translating the screen into concrete backend/data operations on the stack. End each screen with a one-line **fidelity check**: "matches [prototype file] exactly — fonts, layout, spacing, colors, states, functions."
4. **Secondary surface(s)** (e.g. admin/desktop) — same treatment.
5. **Canonical demo data** — shared names/entities so all surfaces tell one coherent story. Draw entities and terminology from `design/planning/` and the copy visible in the prototypes.
6. **Build order** — condensed phase list mirroring File B, marking boilerplate phases. Derive scope and sequencing from `design/planning/`. Include the **"Planned but not prototyped"** callout listing anything `design/planning/` describes that has no prototype file (these are `⚠ needs design`, blocked before implementation).
7. **Non-negotiables checklist** — the must-nots and must-haves, including "backend boilerplate reused, boilerplate UI discarded", "UI matches the prototype's `data-app-root` exactly in visual and behavioral outcomes", "preview shells and presentation-only elements never ship", "web uses compatible production markup while mobile uses native primitives rather than WebView or copied DOM/CSS", "reference viewport dimensions never become a fixed production container", "no default/scaffold theme survives", "app wired through the confirmed database environment variable without exposing its value", and "database seeded with a working login + initial display data before any demo".

**File B — `Implementation Plan.md` (phased implementation).** Begin with the exported `design/handoff/[PROJECT] Design Handoff Plan.md`, preserve its verified design dependencies and phase intent, replace `VERIFY IN REPO` assumptions using the actual boilerplate scan, and open the file with an **"Executor: Codex"** header block stating: work one phase at a time top-to-bottom; check `[ ]` → `[~]` → `[x]` only after that phase's Fidelity QA rows pass; AGENTS.md governs code structure, the Product Specification governs everything visual; stop and ask on ambiguity rather than inventing. Then a dependency-ordered phase checklist (`[ ]/[~]/[x]`) covering setup (including wiring the confirmed database environment variable without recording its value) → auth/accounts → **seed data (login account + initial display data, re-runnable)** → media → core domain → discovery/core loop → social → moderation/safety → notifications → admin → polish/a11y → QA/launch. Include an explicit early phase that (a) executes the **Boilerplate Trim List** from §2.1 (embed the per-app tables in File B) and (b) discards any boilerplate UI and rebuilds screens to match §1–§4 of the Product Specification. For each item use the **real operation names** in the chosen convention (queries/mutations/subscriptions, not generic "endpoints"). Mark boilerplate-provided items **[BP] / verify & reuse**. End with a suggested build order + dependency graph, an **MVP cut**, and the **Fidelity QA checklist** below.

**Fidelity QA checklist (append to File B; run per screen before a screen is marked done).** A repeatable, checkbox gate that proves each built screen is a total faithful copy of its prototype — not "close enough". Structure it as one row per screen × these checks, plus a global row:

- [ ] **Fonts** — font-family, weight, size, line-height, letter-spacing match the prototype on every text element (no fallback/system font substituted).
- [ ] **Layout** — element order, structure, alignment, and responsive behavior match; nothing added, moved, or omitted.
- [ ] **Spacing** — padding, margin, and gap values match to the px.
- [ ] **Color** — every hex (bg, ink, borders, accents, states) matches the token table exactly.
- [ ] **Style moves** — borders, hard-offset shadows, radii, rotations, badges/pills render exactly as specified.
- [ ] **Copy** — all visible text is verbatim (labels, placeholders, empty-state and error strings, tips).
- [ ] **States** — hover, press/active, focus, disabled, empty, loading, error, selected/toggled all present and matching.
- [ ] **Functions/interactions** — every handler, navigation, toggle, animation/transition, and special behavior (e.g. moderation block, ping toggle, staggered pin pop-in) works as in the prototype. Specifically: no dead controls or silent no-ops (blocked actions give visible feedback — log entry / disabled styling); anything progress- or timeline-shaped is drag-scrubbable (pointer capture, works mid-drag and on touch); popovers/menus dismiss on click-outside and re-toggle; text inputs are controlled and save to the correct target.
- [ ] **State consistency** — an action updates ALL dependent state as in the prototype (e.g. costs → ledger + budget chip + progress bar; status changes → badges, dots, counts, buttons, event log); edits invalidate stale approvals/QC exactly as the prototype does.
- [ ] **Guardrails** — caps/limits from the prototype (e.g. budget 90% auto-pause, 100% hard stop, operator override; item caps) hold through every action; nothing spends or proceeds past a cap silently.
- [ ] **Imagery** — placeholder rule honored; no hand-drawn/invented art; real assets slotted where provided.
- [ ] **Data** — screen renders populated from the seeded configured database (no mock/hard-coded values, no empty states at demo).
- [ ] **Production boundary** — only `data-app-root` is implemented; device frames, preview shells, desktop canvases, annotations, and presentation-only elements are absent.
- [ ] **Platform-native conversion** — web uses production-compatible semantics; Expo/React Native uses native primitives, navigation, safe areas, scrolling, keyboard behavior, gestures, and sheets with no WebView or copied DOM/CSS.
- [ ] **Responsive devices** — the app root is verified at the reference viewport and representative smaller/larger devices; reference dimensions are not a fixed outer container.
- [ ] **Side-by-side** — the built app root and its prototype `data-app-root` are compared directly at matching viewports; any visible or behavioral diff is filed and fixed before sign-off.

Global: [ ] boilerplate UI fully removed · [ ] no default/scaffold theme leaking · [ ] seed login works end-to-end · [ ] every screen passes all rows above.

### Step 4 — Wire the two docs together (bidirectional)

- Top of **each** file: a "📋 Companion doc" header naming the other, stating the split (Product Specification = verified look and behavior; Implementation Plan = build order and approach) and the tie-break rule: **Product Specification wins on look and interaction; Implementation Plan wins on build order and approach.**
- **Implementation Plan → Product Specification:** every phase header carries a `UI: §…` pointer to the Product Specification section(s) it implements.
- **Product Specification → Implementation Plan:** every screen/section ends with `Production mapping (Phase N)`.
- Note in both that scope changes must update both docs together so the §/Phase links stay valid.

### Output rules

- Plain Markdown, skimmable, tables where they help.
- Never write secret values, connection strings, passwords, tokens, or credentials into either generated document; refer to environment-variable names and sanitized identifiers only.
- Every color/copy/interaction detail must come from the actual sources, not invented.
- Keep both files consistent with each other (same phase numbers, same demo data, same terminology).
- Write both files to the repo root as `Product Specification.md` and `Implementation Plan.md`.
- After writing, open `Product Specification.md` for me and give a 3–4 sentence summary of what each doc owns and how they link.

### Fallbacks

- If `design/design-release.json` is missing, incremental, or still lists unfinished required MVP scope, **stop and run `/sync-build-docs <project name>`**. Finalization is not the first-build gate.
- If `design/prototypes/` is empty or missing, **stop and tell me** — the export didn't land. Offer to work from the codebase / screenshots instead, but never invent UI.
- If a screen prototype lacks exactly one supported `data-prototype-surface` or exactly one `data-app-root`, **stop and run `/adapt-design-export <project name>`** to prepare the compatibility prompt for the existing Claude Design project. Do not guess which phone frame, preview canvas, or subtree belongs in production.
- If `design/handoff/[PROJECT] Design Reference.md` or `design/handoff/[PROJECT] Design Handoff Plan.md` is missing, **stop and tell me** to complete the export. Use `/adapt-design-export <project name>` when prototypes already exist, or `/prepare-claude-design <project name>` when design has not started; do not silently create replacement documents from scratch.
- If `design/system/` is missing, derive §1 from the prototypes themselves (extract the recurring tokens) and tell me it was inferred, so I can export the real system.
- If `design/planning/` is missing, derive scope and build order from the prototypes alone and flag that phase sequencing is your inference, not mine.
- For a single-surface product, drop File A §4 and the admin phase.
