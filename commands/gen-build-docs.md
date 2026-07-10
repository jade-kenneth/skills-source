---
description: Generate paired [PROJECT]Reference.md + [PROJECT] Task Plan.md build docs from the Claude Design export in design/ (prototypes, system, planning)
argument-hint: [project name]
---

# /gen-build-docs — Paired "Reference + Task Plan" build docs

**Project name:** $ARGUMENTS

## Runtime inputs (resolve these FIRST, before any writing)

1. **Project name** — taken from the arguments above. If empty, ask me for it.
2. **MONGODB_URI** — ask me for the exact connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/<db>`). Never proceed with a placeholder; every data task in the plan wires against this exact database (via env var, never hard-coded).
3. **App mapping** — ask me which boilerplate app becomes which product surface, including renames and full-app removals (e.g. `apps/app-web` → `[project]-web` hosting BOTH the consumer app and `/admin`; `apps/app-mobile` removed with its push/auth needs re-covered via Capacitor). Do not assume a mapping.
4. **Stack overrides** — confirm the target stack. Default if I confirm no changes: Capacitor-wrapped Next.js web client (consumer app + `/admin` dashboard in ONE web app) · NestJS GraphQL API · MongoDB · AWS S3, with all app data over GraphQL via TanStack Query + graphql-request + GraphQL Code Generator; only S3 presigned + CDN are REST.

If the boilerplate's client stack differs from the confirmed target stack (e.g. repo ships Expo React Native but the target is Capacitor web-first), **stop and ask** which one wins before writing the plan — it changes every client-side task and can mean removing an entire app (see App mapping).

---

You are producing the canonical build documentation for **$ARGUMENTS**. Do not design new UI or write app code — your job is to **read what already exists and distill it into two paired Markdown files** that any engineer or AI agent can build from faithfully.

### Step 1 — Explore before writing

**Where the truth lives.** All product planning and UI/UX for this project was done in **Claude Design** and exported into `design/`. That export — not the boilerplate, not any prior repo — is the origin of the product's look, behavior, and scope. The boilerplate is a **headless recipient**: it contributes backend plumbing only. Read all three subfolders, but with **different authority**:

| Folder               | Contents                                              | Authority                                                                  | Feeds                              |
| -------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------- |
| `design/prototypes/` | `screen--<name>.html`, `logo--<name>.html`            | **Pixel/behavior contract — ported verbatim**                              | Reference §2, §3, §4               |
| `design/system/`     | tokens, type scale, color, style moves, motion, voice | **Normative** — the values in §1 must match exactly                        | Reference §1                       |
| `design/planning/`   | flows, IA, user journeys, scope notes, PRD fragments  | **Context, not contract** — read for understanding; never ported as markup | Reference §5, §6; Task Plan phases |

Read every file in all three. Quote nothing you haven't verified. Then **list the files you're basing this on**, grouped by folder, before writing anything.

**Prototypes (`design/prototypes/`)** are the **pixel-exact, behavior-exact contract**, not loose inspiration. Extract the _actual code_: every font-family/size/weight/line-height, every hex color, every px of padding/margin/gap, every border/shadow/radius/rotation, every element and its order, every state, interaction, handler, and animation. Do not summarize a screen into prose that drops details — if a value is in the prototype, it must survive into the docs verbatim.

**Completeness rule:** every `screen--*.html` file MUST produce its own §3 (or §4) subsection in the Reference. Before writing, map each prototype file to a planned section; if any file has no section, or `design/planning/` describes a screen that has no prototype file, surface the gap to me explicitly instead of silently omitting or inventing it.

**Scope rule:** `design/planning/` may describe screens, flows, or features that were never prototyped. Those are **not** silently dropped and **not** designed by you — list them in a "Planned but not prototyped" callout in File A §6 and give them Task Plan phases marked `⚠ needs design` (blocked on a prototype before implementation).

**Fidelity mandate (read first, applies to everything below):** the goal is a **total, faithful copy** of the provided prototype HTML — same fonts, same layout, same spacing, same colors, same micro-details, same functions/interactions. The implementation must look and behave identically to the prototype; the only thing that changes is that mock/hard-coded data becomes real data from the confirmed **MONGODB_URI**. Engineers should **port the prototype's markup + styles as the starting DOM and wire data into it**, NOT rebuild each screen from a written description. When in doubt, the prototype's literal code wins over any paraphrase — and over anything in `design/planning/` or `design/system/`.

**Conflict resolution (strict order):**

1. `design/prototypes/` — literal code wins on anything visual or interactive.
2. `design/system/` — wins on tokens/values where a prototype is silent or a screen is unbuilt.
3. `design/planning/` — wins on scope, flow, and terminology only.
4. Repo conventions (`CLAUDE.md`, `AGENTS.md`, `.skills-source/conventions/`) — win on code structure, naming, and stack patterns. **Never on UI.**
5. Boilerplate UI — never wins. It is discarded (see Step 2).

Also read: any existing task/plan/PRD files in the repo (reuse their phase structure rather than inventing one). The **logo prototype file** (`logo--*.html` and its chosen option) is the mark's source of truth; it is ported verbatim like any other screen.

If the visual direction or scope is ambiguous after reading all three folders, ask me focused questions first.

### Step 2 — Lock the stack & constraints

Target stack: as confirmed in **Runtime inputs #4**.
Database connection: the **MONGODB_URI** confirmed in **Runtime inputs #2** — the plan must wire the app to this exact connection string (via env var, never hard-coded) and every data task reads/writes against this database.
API/data conventions: as confirmed in **Runtime inputs #4** (default: all app data over GraphQL via TanStack Query + graphql-request + GraphQL Code Generator; only S3 presigned + CDN are REST).

Boilerplate: **`github.com/jade-kenneth/app-boilerplate` (main)** — apps: `apps/app-web` (Next.js) · `apps/app-api` (NestJS GraphQL) · `apps/app-mobile` (Expo RN). **Scan the actual repo folder-by-folder** (every app, every subfolder); never describe it from memory — this list is a starting point, not a substitute for reading the tree. It provides: monorepo, GraphQL client+server+codegen, TanStack Query, auth/roles, S3 plumbing, push notifications, DataTable, CI.

App mapping: as confirmed in **Runtime inputs #3**. **Rename every surviving app after $ARGUMENTS** (`app-web` → `[project]-web`, `app-api` → `[project]-api`) so the workspace reads as the product, not the boilerplate. Renames/removals must list their ripples (nx/workspace config, package names, codegen paths, CI, docker-compose, root docs) as explicit tasks. Treat backend/plumbing boilerplate (GraphQL client+server, TanStack Query, auth, authz, S3, CI) as **reuse-not-rebuild**: for every feature, find the existing primitive and extend it in the established pattern; never re-implement auth, authz, or the client/codegen pipeline. Mark foundation tasks as already-provided rather than to-build.

**Boilerplate UI is the ONE exception — disregard it entirely.** Any starter/scaffold/default UI, theme, component library styling, or example screens from the boilerplate must be discarded and replaced. The prototypes and design system (§1) are the sole source of truth for look and interaction; never let a boilerplate default theme, layout, or component override the design. If a boilerplate screen conflicts with the reference, the reference wins and the boilerplate UI is rebuilt to match.

### Step 2.1 — Boilerplate trim audit (always required)

Apply the **app mapping** from Step 2 first — an app being renamed is audited under its new name; an app being **removed entirely** gets a one-line entry (all files, nothing salvaged as code) plus a note on where its responsibilities are re-covered, instead of a folder-by-folder table. Then scan **every folder of every surviving app** and classify each folder/module into exactly one bucket:

- **KEEP [BP]** — plumbing reused as-is: auth/session/roles, GraphQL client + codegen pipeline, repository layer, S3, push-token/push-notification plumbing, DataTable/ui primitives, hooks/utils, CI.
- **ADAPT** — file stays but its content is rebuilt for **$ARGUMENTS**: every screen/theme/asset (per the "boilerplate UI is discarded" rule), seed script, dashboard metrics, mail templates, env schema, privacy policy.
- **REMOVE** — the previous product's domain modules and leftovers with **no counterpart in $ARGUMENTS**: unused feature modules (client + API resolver/service/repository + `.gql` schema + generated types + react-query operations — remove the whole vertical slice, never just one layer), stale task/reference `.md` files, scaffold demo assets (default framework SVGs, old logos/mascots/photos), dead providers (e.g. multi-tenant, i18n, dark-mode if the design is single-theme), unused fonts.

**Assets are audited file-by-file** — every image, icon, font, logo, SVG, splash, and mail-branding asset is explicitly classified: **ADAPT** when the slot survives but the content is replaced with the project's art (app icon, splash, logo, header mark, fonts, onboarding art, notification icon), **REMOVE** when it has no slot in $ARGUMENTS (previous product's photos/mascots/landing art, default framework SVGs, duplicate icon exports). **No boilerplate asset ships as-is.**

Output the audit as a **"Boilerplate Trim List"** — one keep/adapt/remove table per app, every top-level folder accounted for — and include it in File B, with "execute the trim list" as an explicit early-phase task **before any feature work** so dead modules never ship. Where a removal is a judgment call (e.g. account-deletion flows required by app stores, push-tester dev tools), keep it and mark it `⚠ decision`.

### Step 2.5 — Seed data (always required)

The plan **must always** include a database seed step that populates the confirmed **MONGODB_URI** so the app is demonstrable on first run — no empty states at demo time. Seed at minimum:

- **A working login account** (seeded user with known email + password, credentials stated explicitly in the plan) so the app can be signed into immediately.
- **Initial display data** for every primary screen: the canonical demo entities from §5 (users/handles, posts, ratings, comments, notifications, map pins, etc.) so each screen renders populated on first load.

Make seeding **idempotent and re-runnable** (e.g. an `npm run seed` script), and cross-reference the seeded records to the canonical demo data in File A §5 so both surfaces tell one coherent story.

### Step 3 — Produce TWO paired files

**File A — `[PROJECT]Reference.md` (UI & behavior source of truth).** Sections:

0. **What it is** + product stack + an "API convention (read this first)" callout + a "⚠ the `design/` export from Claude Design is the origin of this product's UI, behavior, and scope; the boilerplate contributes backend plumbing only — build on it, don't scaffold from scratch, and discard its UI entirely" directive + the confirmed **MONGODB_URI** connection + a "database is always seeded (login + display data)" note. Include the conflict-resolution order from Step 1.
1. **Design system** — sourced from `design/system/` (and any values only present in the prototypes). Reproduce _exactly_: type scale/weights, a color-token table with hex + usage, the signature style moves (borders, shadows, radii, rotations, badges), key surface/background rendering, an explicit **imagery rule** (placeholders vs. real assets — no hand-drawn art), motion/animation specs, and voice/tone. Where `design/system/` and a prototype disagree, the prototype wins — note the discrepancy inline so I can fix the export.
2. **Logo & identity** — name the **logo prototype file + chosen option** as the source of truth (e.g. `design/prototypes/logo--options.html` option `1a`); the mark is **ported verbatim from that file** (nested divs, not a re-traced SVG), with its exact variants (hero, horizontal lockup, reversed app-icon tile, small header). List everywhere it is reused (splash, header, onboarding, admin, app icon, notification avatar) and call out which options are NOT chosen.
3. **Every primary screen** (client) — one subsection per `screen--*.html` file, treated as a **faithful port spec**, not a description. For each screen include: (a) the **source prototype file + element/section** it comes from, so an engineer can copy the real markup; (b) exact layout with real values (font-family/size/weight/line-height, hex colors, px spacing/gaps, borders, shadows, radii, rotations — lifted from the prototype, not approximated); (c) exact copy, verbatim; (d) **every** state, interaction, handler, and animation (nothing "minor" omitted — hover/press/active states, transitions, empty/loading/error states, toggles, moderation blocks, etc.); and (e) a closing **"Production mapping (Phase N)"** paragraph translating the screen into concrete backend/data operations on the stack. End each screen with a one-line **fidelity check**: "matches [prototype file] exactly — fonts, layout, spacing, colors, states, functions."
4. **Secondary surface(s)** (e.g. admin/desktop) — same treatment.
5. **Canonical demo data** — shared names/entities so all surfaces tell one coherent story. Draw entities and terminology from `design/planning/` and the copy visible in the prototypes.
6. **Build order** — condensed phase list mirroring File B, marking boilerplate phases. Derive scope and sequencing from `design/planning/`. Include the **"Planned but not prototyped"** callout listing anything `design/planning/` describes that has no prototype file (these are `⚠ needs design`, blocked before implementation).
7. **Non-negotiables checklist** — the must-nots and must-haves, including "backend boilerplate reused, boilerplate UI discarded", "UI is a **total faithful copy** of the prototype HTML — exact fonts, layout, spacing, colors, micro-details, and functions; nothing approximated or omitted", "screens are ported from the prototype markup, not rebuilt from prose", "no default/scaffold theme survives", "app wired to the confirmed MONGODB_URI via env var", and "database seeded with a working login + initial display data before any demo".

**File B — `[PROJECT] Task Plan.md` (phased implementation).** A dependency-ordered phase checklist (`[ ]/[~]/[x]`) covering setup (incl. wiring the confirmed **MONGODB_URI**) → auth/accounts → **seed data (login account + initial display data, re-runnable)** → media → core domain → discovery/core loop → social → moderation/safety → notifications → admin → polish/a11y → QA/launch. Include an explicit early phase that (a) executes the **Boilerplate Trim List** from §2.1 (embed the per-app tables in File B) and (b) discards any boilerplate UI and rebuilds screens to match §1–§4 of the reference. For each item use the **real operation names** in the chosen convention (queries/mutations/subscriptions, not generic "endpoints"). Mark boilerplate-provided items **[BP] / verify & reuse**. End with a suggested build order + dependency graph, an **MVP cut**, and the **Fidelity QA checklist** below.

**Fidelity QA checklist (append to File B; run per screen before a screen is marked done).** A repeatable, checkbox gate that proves each built screen is a total faithful copy of its prototype — not "close enough". Structure it as one row per screen × these checks, plus a global row:

- [ ] **Fonts** — font-family, weight, size, line-height, letter-spacing match the prototype on every text element (no fallback/system font substituted).
- [ ] **Layout** — element order, structure, alignment, and responsive behavior match; nothing added, moved, or omitted.
- [ ] **Spacing** — padding, margin, and gap values match to the px.
- [ ] **Color** — every hex (bg, ink, borders, accents, states) matches the token table exactly.
- [ ] **Style moves** — borders, hard-offset shadows, radii, rotations, badges/pills render exactly as specified.
- [ ] **Copy** — all visible text is verbatim (labels, placeholders, empty-state and error strings, tips).
- [ ] **States** — hover, press/active, focus, disabled, empty, loading, error, selected/toggled all present and matching.
- [ ] **Functions/interactions** — every handler, navigation, toggle, animation/transition, and special behavior (e.g. moderation block, ping toggle, staggered pin pop-in) works as in the prototype.
- [ ] **Imagery** — placeholder rule honored; no hand-drawn/invented art; real assets slotted where provided.
- [ ] **Data** — screen renders populated from seeded MONGODB_URI data (no mock/hard-coded values, no empty states at demo).
- [ ] **Side-by-side** — built screen and its `design/prototypes/screen--*.html` compared directly; any visible diff filed and fixed before sign-off.

Global: [ ] boilerplate UI fully removed · [ ] no default/scaffold theme leaking · [ ] seed login works end-to-end · [ ] every screen passes all rows above.

### Step 4 — Wire the two docs together (bidirectional)

- Top of **each** file: a "📋 Companion doc" header naming the other, stating the split (Reference = look & behavior truth; Task Plan = build order & approach) and the tie-break rule: **reference wins on look/interaction, task plan wins on build order/approach.**
- **Task Plan → Reference:** every phase header carries a `UI: §…` pointer to the reference section(s) it implements.
- **Reference → Task Plan:** every screen/section ends with `Production mapping (Phase N)`.
- Note in both that scope changes must update both docs together so the §/Phase links stay valid.

### Output rules

- Plain Markdown, skimmable, tables where they help.
- Every color/copy/interaction detail must come from the actual sources, not invented.
- Keep both files consistent with each other (same phase numbers, same demo data, same terminology).
- Write both files to the repo root as `[PROJECT]Reference.md` and `[PROJECT] Task Plan.md`.
- After writing, open the reference file for me and give a 3–4 sentence summary of what each doc owns and how they link.

### Fallbacks

- If `design/prototypes/` is empty or missing, **stop and tell me** — the export didn't land. Offer to work from the codebase / screenshots instead, but never invent UI.
- If `design/system/` is missing, derive §1 from the prototypes themselves (extract the recurring tokens) and tell me it was inferred, so I can export the real system.
- If `design/planning/` is missing, derive scope and build order from the prototypes alone and flag that phase sequencing is your inference, not mine.
- For a single-surface product, drop File A §4 and the admin phase.
