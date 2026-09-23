# The four diagrams

One generator per question — the estate's rule — and for this tier the four
questions are fixed, because they are the four a learner asks.

| Generator | The question | Shape |
|---|---|---|
| `<concept>-map.build.py` | How does it actually work? | lanes and rows, like every estate map |
| `<concept>-without.build.py` | What if I do not use it? | paired track |
| `<concept>-risks.build.py` | What does adopting it break? | spine and ribs |
| `<concept>-neighbours.build.py` | What does it work with? | centre and four bands |

Everything in `root-docs` → `references/diagrams.md` applies: generated never
hand-placed, the generator kept beside the document, the page owns the palette,
**never hand-edit the emitted SVG**, and the diagram is re-examined on every
documentation change with the answer written down — including "unaffected".

## Start by copying, not by designing

Copy `docs/how-it-works/deployment/migrations-ride-the-deploy-map.build.py`. It
is the estate's best generator and the only one that gets two things right the
others do not:

- **It emits numeric entities**, so a standalone copy of the SVG is valid XML and
  can actually be rasterised. The earlier generators emit `&mdash;` and cannot,
  which means nobody could ever run the look-at-it check on them.
- **It places divider labels** rather than pinning them to the right edge —
  tries the right, falls back to the left, fails the build if a connector
  crosses both.

Its `glyphs()`, `shout()`, `xml_entities()`, `route()`, `crosses()` and
`note_rect()` helpers carry over to all four generators unchanged.

## The inherited assertions — all four generators carry them

1. **Every connector segment is checked against every box**, not only the two it
   joins, so a line through an unrelated box fails the build.
2. **Every label fits its box**, measured in **glyphs not source characters** —
   `&middot;` is nine characters and one glyph, and measuring source rejects
   labels that fit.
3. **No literal colour.** The build fails on a literal `fill="#` or `stroke="#`.
   One line, and it catches every light-mode-only drawing before a reader does.
4. A gutter shift stays strictly inside the gap between bands.
5. A link note fits without landing on a box, a divider label or the canvas
   edge. A gutter may hold two staggered rows; a third fails the build, and
   **the fix is to cut the words, not to stack them**.

Emit `class="d-box-ok"`, `d-box-t`, `d-box-w`, `d-box-x`, `d-name`, `d-sub`,
`d-line`, `d-line-ok`, `d-line-x`, `d-div`, `d-lbl`, `d-ok`, `d-warn`, `d-bad`
and the `.flow` overlay. The page's tokens decide what they look like.

## Render it and look at it

Assertions catch what you thought to check.

```bash
# macOS, nothing to install. The .svg.txt carries the height on line 1, so make
# a standalone copy first, then rasterise it and actually open the result.
tail -n +2 docs/learn/<topic>/<concept>-map.svg.txt > /tmp/m.svg
qlmanage -t -s 1500 -o /tmp/render /tmp/m.svg
```

The estate has shipped two diagrams whose only defect was visible in the raster
and in no assertion: `label.upper()` turning `&rsquo;` into the undefined entity
`&RSQUO;`, and a `font-size="10"` presentation attribute losing to the page's own
`.d-ok{font-size:11.5px}` so every evidence line rendered 15% wider than the
width model allowed. Use `style="font-size:10px"`, not the attribute.

---

## 1 · The mechanism map

The `how-it-works/` feature map, with one substitution: **colour means
provenance**, the four states from `references/provenance.md`.

| Class | Here it means |
|---|---|
| `d-box-ok` | **measured** — in the lab beside this document, or against this estate |
| `d-box-t` | **documented** — a named tool at a named version says so |
| `d-box-w` | **rule of thumb** — common practice, no number |
| `d-box-x` | **depends** — genuinely workload-specific, or outside what this document covers |

**Say that in the legend on the page.** A reader arriving from a `how-it-works/`
page reads green as *measured against our running system*, and from an
`unresolved/` page reads it as *this works*. Three tiers, three meanings, one
colour — the legend is the only thing keeping them apart.

**Two dividers**, as on every estate map, and here they mark:

- where **measurement** stops and documentation begins;
- where **this document's scope** stops.

Lanes are the participants the concept moves data between — for a load balancer:
client · the balancer · the backend pool · shared state. **The travelling dots
run in the measured colour only on hops the lab actually exercised.**

---

## 2 · The counterfactual — `<concept>-without.build.py`

Copy `migrations-ride-the-deploy-beforeafter.build.py`. Same paired track: a
column of step labels down the left, then two columns running level, so row *n*
of one sits beside row *n* of the other and the difference is a glance rather
than a memory test.

Three changes from the `how-it-works/` version:

- **The columns are WITHOUT and WITH**, not BEFORE and AFTER. This is a
  comparison of two designs, not two eras, so **do not date the columns** the way
  a before/after must — date the *lab run* in the sub-heading instead, once.
- **Both columns can be measured**, and should be: the lab runs the WITHOUT case
  too. A WITHOUT column drawn entirely in `depends` is a comparison built from
  imagination.
- **The WITH column is not uniformly green.** It is green only where the lab
  measured it, amber where a tool documents it. A uniformly green WITH column is
  the provenance rule broken in the place a reader is least likely to check.

**Its assertion is the reason the generator exists:** *the without and with cells
of a row must differ.* A copy-paste that leaves one row identical silently draws
a comparison claiming nothing changed, which is the single worst thing this
diagram could say and the one thing no reviewer will spot.

**Add one this tier needs:** at least one row must be *worse* with the pattern
than without it — more complex, slower, newly able to fail. If that is genuinely
false, the generator fails with a message saying so, and an explicit
`ALLOW_NO_REGRESSION = '<why>'` in the source is the only way past it. Adopting
a pattern is never free, and a comparison that says it is has stopped being a
comparison.

---

## 3 · The new failure modes — `<concept>-risks.build.py`

*What adopting it breaks that was not broken before.* This is not a flow, and
drawing it as one loses the thing the picture is for: that all of these come
from **one decision**.

**Shape — a spine and its ribs.** A tall box down the left spanning the full
height, reading *You adopted `<concept>`*. One row per new failure mode, each a
rib of four cells:

```
 ┌──────────────┐   ┌────────────┐  ┌───────────────┐  ┌──────────────┐  ┌────────────┐
 │              ├───│  Trigger   │──│  What fails   │──│  Mitigation  │──│  Residual  │
 │ You adopted  │   └────────────┘  └───────────────┘  └──────────────┘  └────────────┘
 │ load         │   ┌────────────┐  ┌───────────────┐  ┌──────────────┐  ┌────────────┐
 │ balancing    ├───│  Trigger   │──│  What fails   │──│  Mitigation  │──│  Residual  │
 │              │   └────────────┘  └───────────────┘  └──────────────┘  └────────────┘
 └──────────────┘
```

Colour the **mitigation** cell by whether a standard answer exists —
`d-box-ok` standard · `d-box-t` partial · `d-box-x` none — and the **residual**
cell by whether anything is left. The trigger and *what fails* cells are always
`d-box-x`: they are the failures, and they are real.

Layout model:

```python
COL_X = {'spine': 20, 'trigger': 210, 'fails': 480, 'mit': 750, 'resid': 1020}
SPINE_W, BOX_W, BOX_H, ROW_H, TOP = 170, 250, 58, 76, 92
```

**Its two assertions**, beyond the inherited five:

- **The residual cell must differ from the mitigation cell.** A mitigation whose
  residual restates it has claimed nothing.
- **At least one row's mitigation must be `none`.** A pattern with no
  unmitigated risk is a pattern you have not finished examining. If it is
  genuinely true, `ALLOW_NO_UNMITIGATED = '<why>'` in the source is the only way
  past, and the why is quoted in the page's caption.

---

## 4 · The neighbourhood — `<concept>-neighbours.build.py`

*What it works with, needs, competes with, and gets confused with.* A radial is
unassertable; four bands are not.

**Shape — the concept at the left, four stacked bands to the right.** Each band
has a label and a row of chips; a band wraps to a second row and **a third fails
the build** — the fix is fewer neighbours, not smaller text.

```
                  ┌─ WORKS WITH ──── [ health checks ] [ autoscaling ] [ shared sessions ]
 ┌────────────┐   │
 │   Load     ├───┼─ DEPENDS ON ──── [ stateless backends ] [ service discovery ]
 │  balancer  │   │
 └────────────┘   ├─ COMPETES WITH ─ [ client-side LB ] [ DNS round robin ] [ anycast ]
                  │
                  └─ CONFUSED WITH ─ [ reverse proxy ] [ API gateway ] [ CDN ]
```

Band edge styles, because the four relationships are not the same kind of thing:

| Band | Edge | Why |
|---|---|---|
| Works with | `d-line-ok` | composes; the pair does something neither does alone |
| Depends on | `d-line` + `d-box-t` chips | must be true first, or the concept misbehaves rather than fails cleanly |
| Competes with | `d-line` dashed | a different answer to the same problem |
| Confused with | `d-line-x` | conflating them is the mistake, so it draws as one |

**Its assertion:** the *confused with* band may not be empty. Every concept worth
a document has neighbours people mistake it for, and that band is the one a
beginner needs most. An empty one means you have not asked what the reader
already half-believes.

**Put the relationship on the edge, not only in the band label** — a short
italic gutter note saying what the pair achieves: *`health checks tell the pool
which backends exist`*. The bands say the category; the notes say the mechanism,
and the mechanism is what makes the section usable.
