# The companion one-pager — `<same-basename>.html`

The form a document takes when it has to be **sent to the person who owns the
fix**, rather than only read by whoever meets the symptom. A page can put the whole
feature, the failure point and the ask in front of a solution architect in one
scroll where the Markdown makes them assemble it.

**Required for every `unresolved/` and every `how-it-works/` document.** Same
basename, same folder. Optional — same recipe — for a `bug-fixed/` document worth
sending. Nothing else in this repository needs one.

**The Markdown stays the source of truth; the page cites it in its footer.**

## One file. Not an Artifact.

- Written **straight to** `docs/<tier>/<topic>/<name>.html`. No scratchpad source,
  no fragment, no split step, no publish step.
- **When it already exists, read it first and edit it.** Never rewrite from
  scratch: the parts you did not come to change are the parts most likely to be
  lost.
- A **standalone** document — its own `<!doctype>`, `<html lang="en">`, `<head>`
  with `charset`, `viewport` and `color-scheme`, and a minimal reset — because the
  only way it is ever opened is by double-clicking it, or by someone opening the
  copy you sent them.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>Checkout Dead Ends</title>
<style>html{color-scheme:light dark}body{margin:0}img{max-width:100%}
[hidden]{display:none!important}</style>
<style>/* the page's own palette and layout */</style>
</head>
<body>
<div class="page">…</div>
</body>
</html>
```

Give it a real `<title>` — a short noun phrase, not a caption — and keep it stable,
because it names the browser tab for whoever you sent it to.

## Everything local is inline

`docs/` is untracked, so the file never reaches the remote: it exists on the
machine that wrote it and **travels by being sent**. That has a consequence worth
stating rather than discovering — **CSS, JS and images (as `data:` URIs) must all
be inline**, so the file works as a single attachment on a machine with no network
and no access to this repo. A page that only renders correctly next to its own
assets is a page that arrives broken.

A Google Fonts `<link>` is the **single permitted exception**, and only behind full
fallback stacks (`"Spectral", Georgia, serif`), so an offline reader gets a correct
page rather than a broken one. Nothing else may be fetched.

## A copy you sent is a copy you cannot update

Once a page has gone to somebody, editing the file here does not change theirs. So:

- Put **the date the evidence was measured** in the masthead where they cannot miss
  it.
- When a document's status changes materially, **send the page again** rather than
  assuming the one they hold has kept up.

## One house style — copy an existing page, never invent a second

**A new page starts by copying the closest existing one rather than by designing
anything.** These pages are read as a set: somebody who has seen two should
recognise the third instantly and not have to work out what a colour, chip or strip
means a second time. A page in its own palette reads as a different team's work
even when its content is better.

Carried over wholesale:

- **The token block** — `--ground --surface --surface-2 --ink --ink-2 --muted
  --rule --rule-soft --accent --flag --flag-bg --ok --ok-bg --warn --warn-bg`,
  defined on bare `:root` and redefined in both dark blocks. **Never a new scale.**
- **The type** — `--serif` Spectral for headings and the analogy, `--sans` Source
  Sans 3 for body, `--mono` JetBrains Mono for eyebrows, chips and code, each with
  a real fallback stack.
- **The furniture, by class name** — the names are the shared vocabulary:
  `.page` `.mast` `.dek` `.overall` `.mast-meta` `.note-strip` `.strip`/`.state`
  `.sec-head` `.eyebrow` `.tw`/`.tw.compact` `.figure`/`.frame`/`.fig-bar`
  `.legend` `.snote` `.rolechip` `.tag` `.stage` `.fixcard` `.hand` `.story`
  `.plain`/`.langs` `.why` `.panel` `.onesentence` `.toc` and the `.switch`.
- **The behaviour** — the sticky grouped nav with its progress rail and
  current-section label, and the one animation toggle bound to every `.switch` on
  the page through a single `localStorage` key.

**Diagrams take the page's classes, never their own colours.** A generator emitting
`fill="#e8f5ee"` produces a drawing correct in light mode and wrong in dark — and
the author, who wrote it in light mode, will not see it. See `diagrams.md`.

What legitimately differs between pages is **what the colours mean**, and that
belongs in the legend beside the map, not in the stylesheet: on an `unresolved/`
page green means *this works*; on a `how-it-works/` page it means *this is
measured*. **Say which, on the page, every time.**

## Design constraints

- Complete light palette as tokens on bare `:root`; dark redefined under **both** a
  guarded `prefers-color-scheme` block **and** `[data-theme="dark"]`.
- An explicit `background` on `body`.
- Semantic colour reserved for status.
- Wide diagrams and tables scroll in their own `overflow-x: auto` container so the
  page body never scrolls sideways.

## Navigation is not optional, and a flat list of links is not navigation

These pages run to twenty-five sections, and the ones a recipient actually wants —
the asks, the evidence, the plain-language version — sit two thirds of the way
down. A reader who has to scroll to find out what is on the page reads the first
third and stops. Every one-pager carries a **sticky section nav**, directly under
the masthead and state strip so the page still opens with its headline.

- **Give every `<section>` a meaningful `id`** — `#asks`, `#evidence-11sep`,
  `#plain-terms`, never `#s7`. Anchors are how a page gets discussed once it has
  been sent: "read `#asks`" is a usable instruction; "scroll about two thirds down"
  is not.
- **Build it as a real `<nav>` of real `<a href="#…">` links**, so the whole thing
  works with JavaScript off. Everything below is an enhancement on top of markup
  that already functions.
- **Group the links by what a reader is looking for**, each group with a short
  heading — *Where it stands*, *The whole feature*, *The asks & the evidence*, *The
  diagnosis*, *Who acts, and how to check*. Twenty-five undifferentiated entries is
  a second problem, not a solution to the first.
- **Name the current section in the bar at all times.** What a reader loses in a
  long document is not the map, it is their own position in it.
- **Add a progress rail.** A page this length gives no other clue how much is left,
  and a reader who cannot tell rations their attention wrongly.
- **Pick the current section by the nearest heading above the fold, not with
  `IntersectionObserver`.** The observer answers "which section is most visible",
  and where one section is two thousand pixels of diagram that stops matching what
  the reader is looking at.
- **`scroll-margin-top` on every `section[id]`** — roughly the sticky bar's height
  plus a little — or the bar covers the heading it just jumped to, which looks like
  a broken link.
- **Scope smooth scrolling to `prefers-reduced-motion: no-preference`**, and
  collapse the panel when a link is chosen or `Escape` is pressed.

**Adding a section means renumbering.** A new figure section changes the eyebrow
numbers below it, the nav's group `start` attributes and its section count. Check
that every `<section id>` still has exactly one nav entry pointing at it and that
the count in the bar matches — a nav that disagrees with the page is worse than no
nav, because it is trusted.

## The animation toggle

Diagrams with a flow animate along it: travelling dots as a `.flow` overlay path
with `stroke-dasharray` and an animated `stroke-dashoffset` — no library, works
everywhere. **On a hop that fails, stop the dots short of the box** so the
animation itself carries the failure.

Every page with one needs a visible on/off switch:

- **Gate every animation behind a body class**, so "off" is genuinely static rather
  than paused.
- **One setting, synced across every diagram on the page**, persisted in
  `localStorage` inside `try`/`catch`. A reader who turns the animation off at the
  second diagram must not leave the first one still moving behind them.
- **Default it off under `prefers-reduced-motion`, and still let the switch opt
  in** — which means scoping the reduced-motion rule to `body:not(.anim-on)`, or
  `animation: none !important` silently overrides the reader's own click.

## Section order — `unresolved/` page

The Markdown's sections plus three things Markdown cannot do: the feature map, the
replay, and the today/expected comparison. The nav sits between 2 and 3.

1. **Masthead** — the failure in a sentence, the **overall status pill**
   (`open — blocked`, with how many numbered items are closed), then status, where,
   and the date the evidence was measured. Style the pill so flipping it to
   resolved is one class change, not a redesign.
2. **A three-tile state strip** — what is proven, and each open question by number.
3. **The resolution tracker** — the same numbered rows as the Markdown, with owners
   and per-row status, and a line stating what flipping to resolved requires.
4. **What has changed so far** — the change table, with the effect on the blockage
   in its own column.
5. **The whole feature, top to bottom** — the generated map.
6. **If it is resolved** — the unblock cascade.
7. The close-up call path, with the failing hop dashed.
8. **In action** — the real commands and real responses, hop by hop.
9. **Today vs expected**, side by side.
10. What "done" means afterwards, quoting the exit criterion that defines it.
11. The technical detail the diagnosis rests on — a decoded token, a payload, a
    query plan — as a labelled panel rather than prose.
12. The asks, numbered, each naming who answers.
13. Evidence, step trace, the why-chain to a root cause.
14. **In plain terms** — English, and the second language side by side, paragraph
    for paragraph, where the project writes one.
15. **Expected UI and UX** — whenever the failure touches something a customer
    sees. One card per surface: what it **must show**, what it **must never** say
    or do, an edge case, and the section of the source document each line came
    from. Derive every line from a written requirement and cite it. Copy here is
    often a *correctness* question rather than a style one: a return page that says
    "paid" before anything has been verified is a defect, and so is calling an
    abandoned checkout cancelled when no cancel endpoint exists. **Say plainly
    which of it can start today** — UX specification is usually unblocked while
    everything around it waits.
16. Who does what, including the roles whose answer is "nothing, yet".
17. Ruled out · verify commands · what is in place today · footer naming the source
    document and the related set.

### The unblock cascade — "if resolved, then what"

A **numbered queue, not a menu**: each rung starts only when the one above lands,
and each names its role, what it does, and what it unblocks in the next line. Mark
any rung that needs something the resolution does *not* supply with an explicit
**Also needs**, and close with what stays blocked even after the last rung. Without
that, a reader takes the cascade as the whole remaining plan.

## Section order — `how-it-works/` page

Follows the Markdown's order, with these differences:

- The masthead pill carries the **measured-stage count** (`7 of 14 stages
  measured`), not closed rows.
- The three-tile state strip carries **what is proven · what is tested only · what
  is still open**. Where the document records a defect found while writing it, that
  goes in the strip too. **A page whose three tiles are all good news is not a
  status, it is a poster.**
- **Both diagrams**, each with its own toggle button, sharing one setting.
- **The hands-on section in full** — the part a recipient is most likely to act on.
  A reviewer who can paste four lines and watch a `422` come back stops needing to
  take the document's word for anything. Do not summarise it to a table: keep the
  transcripts, keep the *what to look at* line under each, and keep the note saying
  which probes change nothing, since that decides whether somebody runs them on a
  shared stack.
- **The before/after section is the one to get right on the page**, more than in the
  Markdown — it is what gets skimmed to, screenshotted and quoted back at you. It
  carries all three views (numbers, paired diagram, paired analogy) and closes on
  the caveat. Put the two analogy tables **one above the other**, not side by side.

## Honesty, the same as the Markdown's

Measured facts and expected facts never share a treatment. Evidence carries the
date it was run; anything not yet observed is **dashed, labelled *not yet
observed*, and says so in its caption**. If a check would pass while the thing is
still broken — a `200` from an identity provider, a green health probe built from a
different base — say that beside it.

## Before it is done

Run the doc-assistant build across every HTML page — see `doc-assistant.md`. Every
standalone `.html` under `docs/` carries the *Ask this page* panel.
