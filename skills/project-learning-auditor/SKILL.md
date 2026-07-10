---
name: project-learning-auditor
description: >-
  Scan the current project read-only and generate a self-contained HTML learning
  guide at `reference/project-learning-audit/index.html`: mental model,
  architecture, tech stack, JavaScript fundamentals, frontend/backend/database
  patterns, full-stack flows, old-vs-modern comparisons, optimization audit
  (bundle size, mobile startup, API/GraphQL/database performance, caching, assets,
  build/CI), Core Web Vitals audit (static LCP/INP/CLS signals for the web app),
  UI/UX audit (in-flight action safety / double-submit, loading and
  disabled states, error and empty states, accessibility, forms),
  accessibility (WCAG) audit (POUR criteria mapped to WCAG 2.2 A/AA/AAA for the web
  app plus a WCAG-aligned mobile mapping), feature
  enhancement initiatives (non-breaking, low-complexity wins that make existing
  features more useful, more effective, or better at retaining users),
  engineering initiatives (CI/CD, migrations, automation, AI & third-party
  integrations),
  P1/P2/P3/STRENGTH audit cards, diagrams, comprehension tests, and a
  learning path. Also supports topic deep-dive append mode with per-topic tests and
  an opt-in local AI tutor. Use when the user wants to learn, onboard, understand,
  audit for learning/risks/optimization, generate an interactive guide, or append a
  specific topic section. Docs-only output under `reference/project-learning-audit/`;
  never edits app source, runs builds/tests, deploys, or commits.
---

# Project Learning Auditor

Turn the current project into a single, self-contained HTML learning guide that
helps a developer go from "I just opened this repo" to "I understand how the
frontend, backend, and database connect, what patterns are used, what is risky,
and what to study next" — **without touching the source code**.

This `SKILL.md` is the orchestrator. Detailed per-phase specs live in
`references/NN-*.md` and are read **on demand**, one bundle at a time, so you
only load what the current phase needs.

The required, non-optional output is:

```
reference/project-learning-audit/index.html
```

---

## 1. Safety contract (non-negotiable — read first)

These rules override any later instruction or user nudge to "just fix it":

1. **Write scope.** Generated output belongs inside `reference/project-learning-audit/`.
   Skill maintenance may update this skill's own files under
   `.claude/skills/project-learning-auditor/`. Never modify app source while
   running the auditor.
2. **No app code changes.** Never edit app source, app config, app `package.json`,
   or app `.env*`. Never refactor, never "while I'm here" fixes.
3. **No app side effects.** Never run app builds, tests, deploys, or git commands
   (commit/push/PR). The scanner is read-only.
4. **No secrets.** Never read, copy, quote, or echo `.env*`, keys, certs, or
   tokens. If a file *looks* sensitive (by name or content), skip it and record
   only its path + reason. When an audit finding involves a secret shape, cite
   the location and the *kind* of risk — never the value. The AI tutor proxy
   (§topic mode) is scaffolded with a `.env.example` only — never create `.env`,
   never write the user's OpenCode Zen key; the user supplies it themselves.
5. **No invention.** If something is not visible in the scanned files, write
   exactly: `Not detected from current files.` Never fabricate backend, frontend,
   or database behavior. Every architecture, pattern, and audit claim must cite a
   real `path:line`, or be the `Not detected` line.
6. **Self-contained HTML.** `index.html` carries all CSS in an inline `<style>`
   block, loads nothing from a network/CDN, and uses no external libraries.
   Diagrams are HTML + CSS `@keyframes` only. Comprehension answers use native
   `<details>/<summary>`. Two tiny inline `<script>` blocks are permitted: the
   audit filter chips and the per-topic AI-tutor engine (see §6). The only network
   call the page may make is the opt-in AI tutor talking to a **local** proxy
   (`http://localhost:8788`) — never an external/CDN/remote call from the page.
   Everything still works (including every comprehension test) with JS disabled or
   the proxy offline.
7. **Preserve user notes.** If the supporting markdown companions already exist,
   refresh only the auto-generated regions delimited by
   `<!-- pla:auto:start -->` / `<!-- pla:auto:end -->`. `index.html` is fully
   regenerated each run and stamped with the generation date.

If a request would violate any of these, do the safe part and state plainly what
you did not do and why.

---

## 2. Run procedure

1. **Scan.** Run the deterministic scanner from the project root:
   ```bash
   python3 .claude/skills/project-learning-auditor/scripts/safe_scan.py \
     --out reference/project-learning-audit/data/manifest.json
   ```
   If Python is unavailable, fall back to a manual scan following the rules in
   `references/00-scanning.md`. Read the resulting `manifest.json` — it lists
   every readable file (`class`, `ext`, `size`), the detected
   `signals.markers`/`signals.dependencies`, `signals.initiative_surfaces`, the
   `skipped` list, and the heuristic `audit_signals` (each `kind` + `path` +
   `line` + `note`). The scanner also writes `manifest-summary.json` beside the
   manifest; it includes `signals.initiative_surfaces` for cheap later reads.
   **Ground every later claim in this manifest.**

2. **Bootstrap output.** Create the `reference/project-learning-audit/` tree (§3).
   For any companion markdown that already exists, read it and keep user content
   (merge inside the auto markers, don't clobber).

3. **Generate phase by phase.** Work the phases below in order. For each, read
   the matching `references/NN-*.md`, then produce its content. Build
   `data/audit-findings.json` during the audit phase. Tick each phase off in §3.

4. **Assemble `index.html` last.** Following `references/11-html-assembly.md`,
   fill `assets/index-template.html` with the generated content and the
   `audit-findings.json` summary. This is a required default output every run.

5. **Write the diagrams and companions.** Emit the six `diagrams/*.html` files
   (also embedded in `index.html`) and the optional supporting markdown.

   Also **scaffold the AI-tutor proxy**: copy this skill's `assets/tutor-server/`
   to `reference/project-learning-audit/tutor-server/` (server + `package.json` +
   `.env.example` + `.gitignore` + `README.md`) if it doesn't exist yet. Every
   Frontend/Backend pattern card, Old-vs-modern comparison, Best-practices finding,
   and Strength card carries its **own per-card** AI tutor box, and the Test-yourself
   section has an AI "generate from this repo" control — all need this local proxy
   (`POST /topic-chat` and `POST /generate`). **Never create `.env`; never write a
   key.** Leave an existing `tutor-server/` untouched (don't clobber the user's setup).

6. **Report.** Summarize what was generated, what was `Not detected`, and what
   was skipped as sensitive — without echoing any secret value.

---

## 2.5 Two modes

| Mode | Trigger | What it does |
|---|---|---|
| **Full guide** (default) | "build/scan/generate a learning guide", "explain this whole project" | Runs all phases (§2–§3) and (re)writes the whole `index.html`. |
| **Topic deep dive** (append) | "add a section about X", "deep dive on X and append it", "explain X in the guide" | Generates **one** focused section for the named topic (cards + optional flow + a **per-topic comprehension test** + an opt-in **AI tutor chat**) and appends/refreshes it in the existing `index.html`. Does not regenerate the rest. See `references/12-topic-deepdive.md`. |

**Topic mode rules:**
- If `index.html` doesn't exist yet, run the full guide first, then append the topic.
- Reuse a fresh `data/manifest.json` if present; otherwise re-scan. Ground the
  topic in real `path:line`. If the topic isn't in the codebase, say
  `Not detected from current files.` and stop.
- Each topic section ends with (a) a **comprehension test** of 3–5 graded
  `<details>` questions grounded in this topic's `path:line`, and (b) an **AI tutor
  chat** (`.topic-chat`) for continuous, topic-scoped conversation.
- On the **first** topic, scaffold the AI-tutor proxy by copying this skill's
  `assets/tutor-server/` to `reference/project-learning-audit/tutor-server/`
  (server + `package.json` + `.env.example` + `.gitignore` + `README.md`). **Never
  create `.env`; never write a key.** The chat CSS/engine already ship in
  `index.html`, so add no new `<style>`/`<script>`.
- Insert the new `<section class="topic" id="topic-<slug>">` immediately before
  `<!-- PLA:TOPICS:end -->` and a nav link before `<!-- PLA:TOPIC_NAV:end -->`.
  If the same `topic-<slug>` already exists, **replace it in place** (no
  duplicates). Remove the `.topics-empty` placeholder on the first topic. Re-stamp
  the date. Touch nothing else in §0–§15.
- Stay self-contained: reuse the page's existing CSS classes; add no new `<style>`
  or `<script>` or external assets. The only network use is the opt-in AI tutor
  calling the **local** proxy.

---

## 3. Output map (tick every box)

```
reference/project-learning-audit/
├── index.html                  [P-assemble] → references/11-html-assembly.md   (REQUIRED)
├── audit-report.md             [P-audit]    → references/08-audit-and-strengths.md
├── best-practices.md           [P-audit]
├── risky-patterns.md           [P-audit]
├── optimization-report.md       [P-optimization] → references/15-optimization-audit.md
├── web-vitals-report.md        [P-web-vitals] → references/18-web-vitals.md
├── uiux-report.md              [P-uiux]      → references/16-uiux-audit.md
├── wcag-report.md              [P-wcag]      → references/20-wcag-accessibility.md
├── feature-initiatives.md      [P-initiatives] → references/17-feature-initiatives.md
├── engineering-initiatives.md  [P-eng-initiatives] → references/19-engineering-initiatives.md
├── learning-guide.md           [P-flows/path]
├── concept-map.md              [P-architecture]
├── data/
│   ├── manifest.json           [P-scan]     → references/00-scanning.md
│   └── audit-findings.json     [P-audit]    → references/08-audit-and-strengths.md
├── tutor-server/               [P-assemble + topic mode] → references/12-topic-deepdive.md
│   ├── server.mjs              (local OpenCode Zen proxy; holds the key, adds CORS)
│   ├── package.json · .env.example · .gitignore · README.md
│   └── (.env is created by the USER, never by the skill — no key is ever written)
└── diagrams/                   [P-diagrams] → references/09-diagrams.md
    ├── api-request-flow.html
    ├── auth-flow.html
    ├── form-submission-flow.html
    ├── database-flow.html
    ├── notification-flow.html
    ├── frontend-state-flow.html
    └── n1-query-flow.html       (only if an N+1 signal was detected)
```

`tutor-server/` is scaffolded on a full build (every Frontend/Backend pattern card
and every Best-practices-audit finding card ships its own per-card AI tutor box) and
also in topic deep-dive mode (each topic gets its own tutor box). It is created once
and never overwritten; the user supplies the key in a git-ignored `.env`.

Phase order: **scan → mental model → architecture → tech stack → JavaScript
fundamentals → frontend → backend → database → full-stack flows → old-vs-modern →
optimization audit → Core Web Vitals audit → UI/UX audit → accessibility (WCAG) audit
→ audit & strengths → feature initiatives → engineering initiatives → diagrams →
comprehension & learning path → assemble index.html.**

`index.html` is required on every normal run. Do not skip it unless the user
explicitly asks for a limited phase run (e.g. "just the audit findings").

---

## 4. Wording rules (apply everywhere)

**Hedge uncertain findings.** You are reading a snapshot, not running the app.
Prefer: *"This project appears to…", "This structure suggests…", "This pattern
may be present because…"*. When evidence is absent, say
`Not detected from current files.`

**Potential ≠ confirmed.** Risks and bugs are labeled `potential` unless the code
clearly proves the issue. Heuristic `audit_signals` are starting points, not
verdicts — open the cited file and confirm before asserting.

**Teach, don't just label.** For every important concept use: a simple
explanation, a mental model, a real-world analogy, a step-by-step trace, the
triggering user action, the files involved (`path:line`), a common beginner
mistake, the best-practice rule, and the risk if done poorly.

**Never say the old way is always wrong.** In old-vs-modern comparisons, frame
the older approach as fine for small projects but harder to maintain as the
project grows. Always include the tradeoff.

---

## 5. Audit priority vocabulary (use these exact labels)

Tag every audit card with one of:

| Label | Meaning |
|---|---|
| `P1 HIGH` | Can cause security issues, data leaks, duplicate actions, broken core flows, or serious production bugs. |
| `P2 MEDIUM` | Can cause maintainability, performance, UX, reliability, or scaling issues. |
| `P3 LOW` | Small cleanup, consistency, readability, or learning improvement. |
| `STRENGTH` | Good implementation worth copying elsewhere in the project. |
| `INITIATIVE` | A safe, **non-breaking, low-complexity** opportunity. It has two flavors sharing one label: **feature initiatives** (§17: goal = `effectiveness`/`usefulness`/`retention`/`adoption`, category `feature`, IDs `INI-###`) and **engineering initiatives** (§19: `track` = `cicd`/`migration`/`automation`/`ai`/`third-party`, goal = `velocity`/`reliability`/`safety`/`reach`, category `engineering`, IDs `ENG-###`). Not a defect — an opportunity. Ranked by value-vs-effort, never by severity, and rendered in dedicated initiative sections, never in `#audit`. |

Every card carries a `confidence` of `high` · `medium` · `low`, and a real
`path:line`. Heuristic-only findings are `low` or `medium`.

`INITIATIVE` findings always carry an `effort` (`S`/`M` only — never `L`), a
`value` (`high`/`medium`/`low`), and `breaking: false`. An `L` idea is parked under
"Out of scope (bigger bets)". Feature initiatives additionally carry a `goal`
(`effectiveness` · `usefulness` · `retention` · `adoption`) and render in
`#initiatives`; see `references/17-feature-initiatives.md`. Engineering initiatives
add `category: "engineering"`, a `track`
(`cicd` · `migration` · `automation` · `ai` · `third-party`), and a `goal`
(`velocity` · `reliability` · `safety` · `reach`), and render in
`#eng-initiatives`; see `references/19-engineering-initiatives.md`.

**Proposal-grounding rule:** an engineering initiative proposes something that may
not exist yet, but its *motivation* must cite real evidence — the `path:line` of the
config/script/module it builds on or replaces, or the objective statement in the
repo's own docs (README/requirements). Current-state claims still obey "No
invention": what exists is cited; what doesn't gets `Not detected from current
files.`

**Fixed findings stay visible.** When a finding has been resolved in the code, never
delete it or collapse it into a "Resolved" summary. Keep its card and mark it
**FIXED** — a green FIXED badge beside its struck-through original priority badge,
plus a `.fix-note` saying what changed and the `path:line` that proves it. Priority is
the unchanging severity; `open`/`fixed` is a separate status. See
`references/08-audit-and-strengths.md`.

---

## 6. Self-contained HTML rules

- One `<style>` block in `<head>`; no `<link rel=stylesheet>`, no CDN, no fonts
  loaded over the network (use a system font stack).
- Diagrams animate with CSS `@keyframes` only — one step highlighted at a time,
  slow and readable, responsive on desktop and mobile.
- Comprehension answers are hidden with `<details><summary>Show answer</summary>…</details>`.
- Filter chips for the audit section may use the CSS `:checked` + sibling pattern,
  or one small inline `<script>` (≈20 lines). Either way the page must remain
  fully readable with scripting disabled.
- Code-comparison blocks: a red "current / risky" panel beside a green "better"
  panel. Escape `<`, `>`, `&` inside code samples. Never paste secret values.
- **AI tutor (topic mode only).** A second tiny inline `<script>` wires each
  `.topic-chat` box to a **local** proxy at `http://localhost:8788` (the
  `tutor-server/` scaffolded on the first topic). The page never holds a key; the
  proxy reads the user's OpenCode Zen key from a git-ignored `.env`. This is the
  page's *only* permitted network call, it is opt-in, and the page (and every
  comprehension test) stays fully usable when JS is off or the proxy is down.
- **Voice output default.** If the generated guide includes any repo-wide
  voice-output assistant (for example J.A.R.V.I.S. using the browser Web Speech
  API), its voice picker must default to a UK English male voice when the browser
  exposes one. Detect both `en-GB` language tags and UK/British voice names, prefer
  likely male names such as Daniel, Arthur, George, Ryan, Oliver, Jamie, Thomas,
  Guy, or "male", and keep high-quality neural/natural English voices as fallback.
  Preserve the user's manual voice selection after they choose a different voice.
- **Voice input UI stability.** If the generated guide includes browser speech
  recognition, the microphone button's active state must follow the user's
  listening session (`wantListening` / explicit start-stop intent), not raw
  `SpeechRecognition.onstart` / `onend` events. Do not auto-reopen
  `SpeechRecognition` after `onend`; that can make the laptop mic/privacy
  indicator switch on and off nonstop. Prefer one continuous browser recognition
  session per click (`continuous = true`) so a short pause does not end the user's
  turn. If the session ends with text, wait about 3 seconds before submitting so
  the assistant does not interrupt while the user is still forming the next phrase.
  If the user taps the mic again during that grace period, cancel the pending answer
  and preserve the transcript so they can continue. Browser `onend` and silence
  timeout paths both use the 3-second grace delay; only an explicit second mic click
  may submit immediately. Stop clicks should clear the active UI immediately.
- **Interview feedback visuals.** If the generated guide includes a repo-wide
  technical interview mode, each post-answer feedback card should show a concise
  visual map of the model answer: a 3-7 line ASCII flow, layer map, or responsibility
  map grounded in real repo files/patterns. Keep the visual on-screen only; spoken
  replies should stay natural and should not read raw diagrams aloud.

---

## 7. Reference bundles (read the one you need, when you need it)

| Read when you reach… | File | Produces |
|---|---|---|
| Scanning / fallback rules | `references/00-scanning.md` | `data/manifest.json` + evidence |
| Mental model | `references/01-mental-model.md` | whole-project analogy section |
| Architecture | `references/02-architecture.md` | architecture section + `concept-map.md` |
| Tech stack (extensive) | `references/13-tech-stack.md` | tech-stack table + per-tech deep-dive cards + connect-the-stack flow |
| JavaScript fundamentals | `references/14-js-fundamentals.md` | core JS-topics table + grouped explainer cards |
| Frontend deep dive | `references/03-frontend.md` | frontend pattern cards |
| Backend deep dive | `references/04-backend.md` | backend pattern cards |
| Database | `references/05-database.md` | data-model section |
| Full-stack flows | `references/06-fullstack-flows.md` | flow traces + `learning-guide.md` |
| Old vs modern | `references/07-old-vs-modern.md` | comparison blocks |
| Optimization audit | `references/15-optimization-audit.md` | bundle/API/database/caching/assets optimization section + `optimization-report.md` |
| Core Web Vitals audit | `references/18-web-vitals.md` | LCP/INP/CLS scorecard + cards for the web app + `web-vitals-report.md` |
| UI/UX audit | `references/16-uiux-audit.md` | interaction-safety/loading/error/accessibility/forms UI-UX section + `uiux-report.md` |
| Accessibility (WCAG) audit | `references/20-wcag-accessibility.md` | POUR scorecard + WCAG 2.2 criterion/level cards (web) + mobile a11y mapping + `wcag-report.md` |
| Audit & strengths | `references/08-audit-and-strengths.md` | `audit-findings.json` + `*.md` |
| Feature initiatives | `references/17-feature-initiatives.md` | non-breaking, low-complexity enhancement section (effectiveness/usefulness/retention/adoption) + `feature-initiatives.md` |
| Engineering initiatives | `references/19-engineering-initiatives.md` | CI/CD · migrations · automation · AI · third-party initiative section + `engineering-initiatives.md` |
| Diagrams | `references/09-diagrams.md` | `diagrams/*.html` |
| Comprehension & path | `references/10-comprehension-and-path.md` | test + learning path |
| Assemble HTML | `references/11-html-assembly.md` | `index.html` |
| Topic deep dive (append mode) | `references/12-topic-deepdive.md` | one appended `<section class="topic">` (cards + comprehension test + AI tutor chat) + nav link; scaffolds `tutor-server/` on the first topic |

Shared assets: `assets/index-template.html` (the self-contained skeleton + CSS +
the audit-filter and AI-tutor scripts), `assets/diagrams/flow-diagram.html` (a
reusable HTML/CSS animated-flow snippet), and `assets/tutor-server/` (the local
OpenCode Zen proxy copied into the output on the first topic deep dive) are
starting points you copy and fill. Keep their structure and CSS intact; adapt only
repository-specific content. **Never add a key to `tutor-server/`.**

---

## 8. Scope reminder (what this skill never does)

Documentation, analysis, learning, and audit-for-learning **only**. No app source
edits, no app deletes, no app installs, no app builds/tests, no exposing secrets,
no new app features, no app refactors, no deploys, no commits/pushes/PRs. Edits
inside `reference/project-learning-audit/` and this skill's own files are allowed.

The topic-mode AI tutor proxy (`tutor-server/`) is **generated study tooling**, not
app code: the skill writes the proxy source and a `.env.example`, but never creates
`.env`, never writes or echoes a key, and never runs `npm install`/`npm start` for
the user — they run it themselves. The proxy explains the project; it never touches
app source.
