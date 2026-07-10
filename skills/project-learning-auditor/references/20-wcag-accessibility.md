# 20 — WCAG accessibility audit

Produce a static, evidence-grounded **accessibility** audit mapped to **WCAG 2.2**
success criteria. This is not an automated conformance scan — do **not** run axe,
Lighthouse, WAVE, a screen reader, or the app. Infer only from scanned components,
layouts, forms, and confirmed source patterns. When evidence is absent, write
`Not detected from current files.`

WCAG (Web Content Accessibility Guidelines) is organised under four principles —
**Perceivable, Operable, Understandable, Robust** ("POUR") — each with numbered
success criteria at conformance levels **A**, **AA**, **AAA**. Tag every finding with
its criterion **and** level, e.g. `1.1.1 Non-text Content (A)` or
`1.4.3 Contrast (Minimum) (AA)`. Most products target **AA**.

**Honesty rule — static can't prove conformance.** A code scan can find *missing*
alt text, unlabeled controls, or click-only handlers; it **cannot** measure colour
contrast ratios, real focus order, screen-reader output, or reflow. For anything that
needs runtime, state the criterion, cite the `path:line` of the at-risk pattern, and
give the manual/tool check — never assert pass/fail on a contrast ratio or a
keyboard-flow claim from source alone.

## Scope: web-primary, with a mobile-accessibility mapping

- **Web app (Next.js admin/landing)** is the true WCAG target — grade it against the
  criteria below.
- **Mobile app (React Native)** has no formal WCAG conformance, but the same intent
  applies. Add a **"Mobile accessibility (WCAG-aligned)"** subsection that maps each
  relevant criterion to its RN equivalent (`accessibilityRole`, `accessibilityLabel`,
  `accessibilityState`, `accessibilityHint`, `accessible`, touch-target size, Dynamic
  Type / `allowFontScaling`), and label it clearly as *WCAG-aligned*, not *WCAG
  conformant*.

## Inputs

- `data/manifest.json`, especially the accessibility `audit_signals`
  (`interactive_no_a11y_label`, `img_missing_alt`, `clickable_non_interactive`,
  `positive_tabindex`, `html_missing_lang`) plus frontend file paths.
- Confirmed source reads for every finding — open the cited component.
- Existing generated content from the frontend, UI/UX, and tech-stack phases (the
  UI/UX audit already carries a lighter accessibility category — this section is the
  deeper, criterion-mapped version; cross-reference, don't duplicate wholesale).

## Required criteria coverage (grade what has evidence)

Render one compact scorecard (by POUR principle) plus focused cards. Cover at least:

| Principle | Criterion (level) | What to inspect | Typical static signal |
|---|---|---|---|
| **Perceivable** | 1.1.1 Non-text Content (A) | every `<img>`/`next/image` has an `alt` (empty `alt=""` for decorative is valid) | `img_missing_alt` |
| Perceivable | 1.3.1 Info & Relationships (A) | semantic elements/landmarks/headings, not `<div>` soup; lists as lists; `<th>` for tables | non-semantic containers doing structural work |
| Perceivable | 1.4.1 Use of Color (A) | status shown by colour alone (badge/dot) with no text/icon | colour-only status keys |
| Perceivable | 1.4.3 Contrast (Minimum) (AA) | text/background token pairs | hardcoded colours vs design tokens — **manual contrast check only** |
| **Operable** | 2.1.1 Keyboard (A) | `onClick`/`onPress` on non-interactive `<div>`/`<span>` with no key handler/role | `clickable_non_interactive` |
| Operable | 2.4.3 Focus Order (A) | positive `tabIndex`; DOM order vs visual order | `positive_tabindex` |
| Operable | 2.4.4 Link Purpose / 4.1.2 Name, Role, Value (A) | icon-only controls without an accessible name | `interactive_no_a11y_label` |
| Operable | 2.4.7 Focus Visible (AA) | `outline:none`/`focus:outline-none` with no `focus-visible` replacement | focus ring removed with no replacement |
| Operable | 2.5.5 / 2.5.8 Target Size (AA) | touch targets smaller than ~24–44px | tiny icon buttons / dense tap targets |
| **Understandable** | 3.1.1 Language of Page (A) | `<html lang>` present | `html_missing_lang` |
| Understandable | 3.3.2 Labels or Instructions (A) | every input has an associated `<label>`/`aria-label`/`aria-labelledby` | form control with no label association |
| Understandable | 3.3.1 Error Identification (A) | validation errors announced (`aria-describedby`/`role="alert"`), not colour-only | error text not linked to the field |
| **Robust** | 4.1.2 Name, Role, Value (A) | `aria-*` on correct roles; native elements over re-implemented widgets | ARIA misuse; custom widgets without roles/state |

Lean on the project's own conventions: shadcn/ui + Radix primitives generally ship
correct roles/focus management (a **strength** worth citing); raw `<div onClick>`,
missing `alt`, and unlabeled icon buttons are the usual gaps. Compare a weak spot
against a place the app already does it right.

## Finding format

For each accessibility card, include:

- **Criterion** — the WCAG number + name + level, e.g. `1.1.1 Non-text Content (A)`.
- **Priority** — use existing `P1 HIGH`, `P2 MEDIUM`, `P3 LOW`. A blocking barrier on a
  core flow (a keyboard-inoperable primary action, an unlabeled auth control, missing
  `lang`) is **P1/P2**; single-screen polish is P3. Do not equate WCAG level with
  priority — an A-level miss on the main flow can outrank an AA-level miss on a rare
  screen.
- **Evidence** — real `path:line` plus the exact pattern (the `<img>` with no `alt`,
  the `<div onClick>`).
- **User impact** — who is blocked and how: screen-reader users hear "button" with no
  name; keyboard users can't reach the control; low-vision users lose focus.
- **How to confirm** — the smallest manual/tool check: "tab through the form and
  confirm every control is reachable and named", "run axe DevTools on the route",
  "check the token pair in a contrast checker for ≥ 4.5:1". **Do not run it by default.**
- **Suggested fix** — concrete next step scoped to the component (add `alt`; use a
  `<button>`; associate a `<label htmlFor>`; add `aria-describedby` for the error).
- **Confidence** — `high`/`medium`/`low`. Contrast and focus-order findings are `low`
  until measured.

**Every heuristic must be confirmed by opening the cited file.** An icon button whose
label sits on a wrapping component, or an `<img>` inside a component that injects
`alt` via props, is a false positive — drop it.

## HTML output

Add an `#accessibility` section **after** `#uiux` and **before** `#audit`. Use existing
`.card`, `.grid`, `.stat`, `.code-old`, `.code-new`, and `.topic-chat` classes. Do not
add new scripts or styles.

Lead with a **POUR scorecard** (four `.stat` tiles: Perceivable · Operable ·
Understandable · Robust) giving a qualitative static read per principle grounded in a
`path:line` — never a fabricated conformance percentage or contrast ratio. Then one
card per finding (grouped by principle), ending each with its own `.topic-chat` box.
Close with the **Mobile accessibility (WCAG-aligned)** subsection.

Suggested shape:

```html
<section id="accessibility">
  <h2><span class="num">§14</span> Accessibility (WCAG) audit</h2>
  <p class="lede">Static accessibility signals mapped to WCAG 2.2 success criteria
  (Perceivable · Operable · Understandable · Robust) for the web app, plus a
  WCAG-aligned mapping for the mobile app. Code-based leads and manual checks, not an
  automated conformance scan — contrast and focus order need runtime tools.</p>
  <!-- PLA:WCAG -->
</section>
```

Prefer a red **Current** panel (e.g. `<div onClick>`) beside a green **Better** panel
(`<button onClick>` / `<img alt>` / `<label htmlFor>`).

## Markdown output

Write `wcag-report.md` with auto markers:

```markdown
<!-- pla:auto:start -->
## Accessibility scorecard (POUR)
...
## Findings (by WCAG criterion)
...
## Needs runtime tools (contrast, focus order, screen reader)
...
<!-- pla:auto:end -->
```

Keep it actionable: list the top accessibility wins first (usually missing `alt`,
unlabeled controls, or click-only handlers), then group by principle. Put every
criterion that needs a tool under the "Needs runtime tools" heading with the check to
run.

## Integration with `audit-findings.json`

Accessibility findings should also be folded into `data/audit-findings.json.findings`
so they appear in the general audit filters. Use `"category": "accessibility"` and add
optional `wcag` fields:

```jsonc
{
  "category": "accessibility",
  "wcag_criterion": "1.1.1 Non-text Content",
  "wcag_level": "A | AA | AAA",
  "how_to_confirm": "smallest manual/tool check, e.g. run axe DevTools on the route"
}
```

Do not fabricate contrast ratios, conformance scores/percentages, or screen-reader
transcripts. If a criterion needs runtime, describe the static signal and the tool to
run later.

## Output of this phase

- Accessibility (WCAG) section HTML for `index.html`.
- `wcag-report.md`.
- Accessibility entries folded into `data/audit-findings.json.findings` (category
  `accessibility`).
