# 18 — Core Web Vitals audit

Produce a static, evidence-grounded **Core Web Vitals** audit for the **web** surface
(the Next.js admin app). This is not a Lighthouse run — do **not** run the app, launch
a browser, run Lighthouse/PageSpeed/WebPageTest, profile, or measure. Infer only from
scanned components, layouts, config, dependencies, and confirmed source patterns. When
evidence is absent, write `Not detected from current files.`

Core Web Vitals are Google's user-centred loading/interactivity/stability metrics.
This audit maps each metric to the **static code smells** that tend to hurt it, so the
learner knows what to measure and where to look — it never asserts a score.

Where optimization asks "is the bundle/query cheap?" and UI/UX asks "does it feel
correct while I interact?", this audit asks "will the page load, respond, and settle
the way a real user perceives it?" — framed around the three metrics Google grades.

**Scope: web only.** Core Web Vitals are a web platform concept and apply to the
Next.js admin app (and any web landing). React Native has no Core Web Vitals — for the
mobile app write `Not applicable (native app) — see the mobile-startup category of the
optimization audit` and do not invent mobile CWV numbers.

## The three metrics (grade these)

| Metric | Full name | Measures | "Good" (field target, for context only — never claim a score) |
|---|---|---|---|
| **LCP** | Largest Contentful Paint | How fast the largest above-the-fold element renders (loading) | ≤ 2.5 s |
| **INP** | Interaction to Next Paint | How fast the page responds to a user input (interactivity) | ≤ 200 ms |
| **CLS** | Cumulative Layout Shift | How much visible content jumps around (visual stability) | ≤ 0.1 |

Also note the two supporting diagnostics when evidence appears: **FCP** (First
Contentful Paint) and **TTFB** (Time To First Byte) — they explain *why* LCP is slow
(slow server response / render-blocking head), so fold them into the LCP card rather
than grading them on their own.

## Inputs

- `data/manifest.json`, especially the CWV `audit_signals`
  (`raw_img_tag`, `img_no_dimensions`, `next_client_route_boundary`,
  `possible_heavy_client_import`, `render_blocking_head`) plus web frontend file paths
  and sizes, and `signals.dependencies`.
- Confirmed source reads for every CWV claim — open the cited component/layout.
- Existing generated content from the tech-stack, frontend, optimization, and
  full-stack-flow phases (reuse, don't re-derive).

## What hurts each metric (static signals to look for)

Only inspect the web/admin app (`apps/brgy-system-admin/**`) and any web landing.

- **LCP — Largest Contentful Paint (loading)**
  - Raw `<img>` tags in web UI instead of `next/image` — no automatic sizing, lazy
    strategy, or modern-format serving; the hero image is often the LCP element.
  - The likely LCP image (hero/banner/above-the-fold) with no `priority` prop on
    `next/image`, so it is lazy-loaded and paints late.
  - `'use client'` on a route `page`/`layout` that renders the main content, pushing
    first paint behind hydration instead of streaming server HTML.
  - Render-blocking work in `app/layout.tsx` `<head>` (synchronous third-party
    `<script>`, non-`display:swap` fonts) that delays FCP → LCP.
  - Data-driven above-the-fold content fetched client-side (spinner first, content
    later) where a server component / server fetch could paint it immediately.
  - Heavy client dependency (charts/PDF/editor/maps) imported into a first-view route
    with no `next/dynamic`, inflating the JS that must run before content settles.

- **INP — Interaction to Next Paint (interactivity)**
  - Large client bundles hydrating on the first interactive route (broad
    `'use client'` boundaries) — long tasks block the main thread on first input.
  - Expensive synchronous work in event handlers / effects run on mount (big
    `.map`/sort/filter over large lists, JSON parse) with no memoization, debounce,
    or deferral.
  - Un-virtualized long lists/tables rendered eagerly, so interaction re-renders are
    costly.
  - Third-party scripts loaded with default (blocking) strategy rather than
    `next/script` `strategy="lazyOnload"`/`afterInteractive`.

- **CLS — Cumulative Layout Shift (visual stability)**
  - `<img>` / `next/image` / `<video>` / embeds with no explicit `width`+`height`
    (or `fill` + a sized container) — media reserves no space and shoves content down
    when it loads.
  - Web fonts loaded without `display: swap` / `next/font` fallback metrics — a
    late-swapping font reflows text (FOUT/FOIT).
  - Content injected above existing content after load (banners, ads, async alerts,
    ad-hoc toasts pushing layout) instead of reserving space or overlaying.
  - Skeletons/placeholders whose dimensions do not match the final content, so the
    swap still shifts.
  - Buttons/inputs that grow when their label flips to a busy/loading state without a
    fixed min size.

## Finding format

For each Web Vitals card, include:

- **Metric** — one of `LCP`, `INP`, `CLS` (fold `FCP`/`TTFB` notes into the LCP card).
- **Priority** — use existing `P1 HIGH`, `P2 MEDIUM`, `P3 LOW` labels. Most CWV findings
  are P2 or P3. Use P1 only when the code clearly breaks a core first-view experience
  (e.g. the primary dashboard renders entirely client-side behind a spinner, or the main
  above-the-fold media has no dimensions on every page).
- **Evidence** — real `path:line` plus the exact pattern observed (the `<img>` tag, the
  `'use client'` route file, the font import).
- **User impact** — what the *user* perceives: hero image pops in late, the page freezes
  on first tap, text/buttons jump as media loads.
- **How to confirm** — the smallest measurement the developer can run later, e.g.
  "run Lighthouse (or the Web Vitals Chrome extension) on the admin route in an
  incognito window and read LCP/INP/CLS", "record a Performance trace and check the
  LCP element", "add `next/image` and re-measure CLS". **Do not run it yourself by
  default.**
- **Suggested fix** — concrete next step scoped to the owning component/layout (e.g.
  swap `<img>` for `next/image` with `width`/`height` + `priority` on the hero; add
  `display: swap` via `next/font`; move the `'use client'` boundary lower).
- **Confidence** — `high`, `medium`, or `low`. Heuristic-only findings start
  `low`/`medium`; confirm in-file before raising.

**Every heuristic must be confirmed by opening the cited file.** A `next/image` with
`fill` inside a sized wrapper is *not* a CLS bug even though it lacks `width`/`height`;
a raw `<img>` that already carries `width`/`height` attributes is a weaker LCP-only
finding. Drop false positives.

## HTML output

Add a `#web-vitals` section **after** `#optimization` and **before** `#uiux`. Use
existing `.card`, `.grid`, `.stat`, `.code-old`, `.code-new`, and `.topic-chat`
classes. Do not add new scripts or styles.

Lead with a compact **three-metric scorecard** (LCP · INP · CLS) built from `.stat`
tiles — each showing the metric, what it measures, and a qualitative static read
(e.g. "at risk — raw `<img>` on the dashboard", "looks handled — `next/image`
throughout") grounded in a `path:line`, never a fabricated numeric score.

Suggested shape:

```html
<section id="web-vitals">
  <h2><span class="num">§13</span> Core Web Vitals audit</h2>
  <p class="lede">Static signals for the three metrics Google grades — LCP (loading),
  INP (interactivity), and CLS (visual stability) — for the web admin app. These are
  code-based leads on what to measure and fix, not Lighthouse scores.</p>
  <!-- PLA:WEB_VITALS -->
</section>
```

Each Web Vitals card ends with its own `.topic-chat` box scoped to that card so the
learner can ask how to measure or fix that specific metric. Prefer a red **Current**
panel (e.g. raw `<img>` with no dimensions) beside a green **Better** panel
(`next/image` with `width`/`height`/`priority`).

## Markdown output

Write `web-vitals-report.md` with auto markers:

```markdown
<!-- pla:auto:start -->
## Core Web Vitals scorecard
...
## Findings
...
## How to measure next
...
<!-- pla:auto:end -->
```

Keep it actionable: list the top CWV wins first (usually an LCP or CLS quick win on
the primary route), then group findings by metric. Include the measurement command
under "How to measure next" so the developer can validate before/after.

## Integration with `audit-findings.json`

Web Vitals findings should also be folded into `data/audit-findings.json.findings` so
they appear in the general audit filters. Use `"category": "web-vitals"` and add the
optional `web_vital` + `how_to_confirm` fields:

```jsonc
{
  "category": "web-vitals",
  "web_vital": "LCP | INP | CLS | FCP | TTFB",
  "how_to_confirm": "smallest measurement, e.g. run Lighthouse on the route in incognito and read LCP"
}
```

Do not fabricate Lighthouse scores, LCP/INP/CLS numbers, byte counts, or timings. If
no measured number exists in the repo, describe the static signal and the measurement
command to run later.

## Output of this phase

- Core Web Vitals section HTML for `index.html`.
- `web-vitals-report.md`.
- Web Vitals entries folded into `data/audit-findings.json.findings` (category
  `web-vitals`).
