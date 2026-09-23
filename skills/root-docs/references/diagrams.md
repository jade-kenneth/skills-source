# The diagrams — generated, asserted, and looked at

**The diagram is part of the document.** Prose and pictures go stale together, and
only the prose gets fixed. Updating a document's text while leaving its diagram
alone is the most common way this estate ships a correction that does not land: the
reader who scrolls looks at the picture, and the picture still shows the old world.

## Every documentation update ends by asking what the change did to the diagram

There are only three answers, **and the middle one is the one that gets missed**.
Write the answer down — an unexamined diagram and an examined one that needed
nothing look identical afterwards, and only the second is trustworthy.

1. **The diagram is now wrong.** Change the generator, re-run it, re-embed the
   output. **Never hand-edit the emitted SVG** — the generator is the source, and an
   edit made in the page is lost the next time anybody runs it.
2. **The diagram is still correct, but no longer covers the live part of the
   document.** Nothing looks broken, which is why this is the failure mode worth
   naming. A map drawn for the half that has since been fixed is *accurate and
   useless*: it quietly tells a reader the open problem has no picture, which they
   read as the open problem being small. **The fix is a second generated diagram,
   not a caption** — one generator per question, each beside the document, each with
   its own toggle bound to the page's single animation key. Say in the prose which
   diagram answers which question, and why the older one is deliberately historical.
3. **Genuinely unaffected.** Say so in the change record, in one line.

## Generate anything with more than a handful of boxes, and keep the generator

Hand-placed connectors run through boxes, and nobody notices until someone else
reads the page. Keep the script beside the document —
`docs/<tier>/<topic>/<name>-map.build.py` — with a layout model and assertions that
**fail the build**.

### The estate's three inherited assertions

1. **Every connector segment is checked against every box**, not only its
   neighbours, so a line through an unrelated box is an error.
2. **Every label is checked to fit its box** beside its role chip.
3. **No literal colour** — the build fails on a literal `fill="#` or `stroke="#`.
   One line, and it catches the whole class of light-mode-only drawings.

### Assertions later generators added, worth copying

- A gutter shift must stay **inside** the gap between bands.
- A link note must fit **without landing on a box, a divider label, or the edge of
  the canvas**; a gutter may hold two staggered rows, and a third fails the build —
  *the fix is to cut the words, not to stack them*.
- A divider label is **placed** rather than pinned to the right edge: try the right,
  fall back to the left, fail the build if a connector crosses both.
- Emit **numeric entities**, so a standalone copy is valid XML and can actually be
  rasterised. The estate's earlier generators emit `&mdash;` and cannot.

These are not theoretical. On the generators this recipe came from, four of one
map's five assertions fired while it was being written, and three fired on the
next one.

### Render it and look at it before shipping

Assertions catch what you thought to check; **the render catches the rest.**

```bash
# macOS, nothing to install. Rasterise the SVG and open it.
qlmanage -t -s 1500 -o /tmp/render docs/how-it-works/<topic>/<name>-map.svg
# Or the whole page.
qlmanage -t -s 1000 -o /tmp/render docs/how-it-works/<topic>/<name>.html
```

Defects that passed a green build and were obvious in the raster:

- `label.upper()` turning `&rsquo;` into the undefined entity `&RSQUO;`.
- A `font-size="10"` presentation attribute losing to the page's own
  `.d-ok{font-size:11.5px}`, so every evidence line rendered 15% wider than the
  width model allowed.
- An unlabelled failure dash floating in an empty lane.
- A caption anchored to no box.

None is expressible as an assertion; all are obvious to an eye.

## The page owns the palette — the generator emits classes

Emit `class="d-box-ok"`, `d-box-t`, `d-box-x`, `d-name`, `d-sub`, `d-line`,
`d-line-ok`, `d-line-x`, `d-div`, `d-lbl`, `d-ok`, `d-warn`, `d-bad` and the
`.flow` overlay, and let the page's tokens decide what they look like. A generator
that hard-codes a hex is correct in light mode and wrong in dark, and the author —
who wrote it in light mode — will not see it.

---

## The `unresolved/` map — four rules, and the first two get skipped

- **Show the whole feature, not the broken part.** Lanes for the systems involved —
  browser, our API, the estate, the third party — and every stage from the user's
  first screen to the final state. A reader has to see how much stands behind the
  one blocked link.
- **Verify every stage's status against the code before drawing it.** Four states:
  built and proven · built but never exercised · stub · blocked or not wired.
  **Existence is not implementation** — on the payments map `orders`,
  `subscriptions` and the reconciler were stubs, and the trial reaper did not exist
  at all. **Draw a line across the diagram where reality stops.**
- **Mark the failure where the *user* meets it**, not where the cause lives. Those
  are usually different rows, and the gap between them is the point.
- **Put the owning role on every stage that needs work** — a small chip: `BE`,
  `FE`, `OPS`, `QA`, `EXT` (an external party such as a payment provider), and
  **`UX·FE` on anything a customer looks at**. A
  screen has two owners, and naming only the frontend one hides the question of
  what it should say. Keep role chips neutral and **tint only the external
  blocker** — colour on these pages already means status, and two colour scales in
  one diagram fight.
- **Annotate the *links*, not only the boxes.** Two stages that each explain
  themselves still leave the relationship between them unexplained, and that is
  where a reader's understanding actually breaks. Put a short italic note in the
  gutter on the links that matter — `invoice_no is minted here and travels on as
  referenceId`, `we ask for a page, get a URL, never see the card`. Skip the links
  between things that are built and obvious; a note on every arrow is noise.
- **Say what every unbuilt or not-ours stage is *for*.** A box labelled
  `Reconciler · does not exist` tells a reader its state and nothing about why
  anyone wants it. **Put the one-line purpose inside the box on the diagram
  itself** — a reader looking at the map should not have to scroll to find out what
  an unbuilt stage is for — with a taller band, text wrapped to the box width, and
  an assertion that it fits in two lines. Then under the map, give each stub,
  about-to-be-built or externally-owned stage two short lines: **why it exists**
  (the purpose, and what goes wrong without it) and **what it sits between**
  (upstream → downstream, named concretely). Two lines is the budget; the value is
  in being specific rather than long. **Mirror the same notes in the Markdown as a
  table**, so the source of truth carries them too.

**A diagram of something unbuilt must say so on the page.** Where a drawing carries
a consequence that has been reasoned to rather than observed — a box reading
*Clinic locked out* when no clinic has been — the caption says which stages have
actually run and which are proven by reading the code. A dashed rule across the
diagram at that boundary is the clearest way. **Without it, a map of an argument
reads as a map of an outage.**

---

## The `how-it-works/` pair — two diagrams, two questions

### 1 · The feature map — `<name>-map.build.py`

*What is built, and how do we know.* The `unresolved/` recipe applies in full, with
three differences, all consequences of the honesty rule:

- **Colour means how we know, not whether it works.** Four box states matching
  measured · tested only · never exercised · deliberately not built. **Say so in
  the legend**, because a reader arriving from an `unresolved/` page will otherwise
  read green as "works".
- **Draw a rule across the diagram where measurement stops**, and a second where
  the feature's deliberate boundary begins. The stages below those lines are the
  reason the page exists.
- **The travelling dots run in the measured colour only on hops that have actually
  happened.** The animation then carries the distinction on its own, the same way a
  failing hop's dots stop short on an `unresolved/` page.

Adapt what the four colours *mean* where the subject demands it, and say so: on the
deployment map `never observed` means *it runs, and nobody holding this checkout
has watched it* — a claim about our visibility, not about the code — so its two
dividers are where our **sight** stops and where our **ownership** stops.

### 2 · The before/after comparison — `<name>-beforeafter.build.py`

*The same thing happened; here is what used to follow and what follows now.*

**This one is not a flow with lanes**, and trying to make it one produces two
diagrams nobody can hold side by side. Draw it as a **paired track**: a column of
step labels down the left, then a BEFORE column and an AFTER column running level
with each other, so row *n* of one sits beside row *n* of the other and the
difference is a glance rather than a memory test. Same principle as the paired
analogy rows in the prose.

- **Date both columns** in a sub-heading. A comparison with no dates is an opinion,
  and the *after* column is the one that will silently become historical.
- **Use the feature map's colours**: the before column in the failure treatment,
  the after column **green only where measured and amber where a test is all that
  has taken it**. An after column that is uniformly green is the honesty rule
  broken in the place a reader is least likely to check.
- **The before track and the after track get the same neutral connector.** A dashed
  failure-coloured line between two dashed failure-coloured boxes merges with their
  borders into one ragged shape, and the hop between two old states is not itself
  the failure — the boxes carry the status. In motion, the dots carry the two
  journeys apart.
- **Its own assertion, and the reason the generator exists: the before and after
  cells of a row must differ.** A copy-paste that leaves one row identical silently
  draws a comparison claiming nothing changed — the single worst thing this diagram
  could say, and the one thing no reviewer will spot.
- **Keep it to the rows that actually moved.** A row where nothing changed belongs
  in the prose, not here.

---

## Register the generator

In `docs/README.md`, **beside the document's own row**, naming what it draws and
what its assertions catch — so the next person knows a picture exists to be
regenerated rather than redrawn.
