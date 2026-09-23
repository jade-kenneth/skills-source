# The one-pager — only what differs

The house style is owned by `root-docs` → `references/one-pager.md` and is not
restated here. **Copy the closest existing page and change its content** —
`docs/how-it-works/deployment/migrations-ride-the-deploy.html` is the cleanest
starting point. Never design a second visual system: these pages are read as a
set, and a page in its own palette reads as a different team's work even when
its content is better.

Carried over wholesale: the token block, the three typefaces with real fallback
stacks, the class vocabulary, the sticky grouped nav with its progress rail and
current-section label, the single animation toggle bound to every `.switch`
through one `localStorage` key, everything inline, and no Artifact — **the page
is a file written straight into the topic folder**.

## What is different

**The masthead pill counts claims, not stages.**

```html
<div class="overall">
  <span class="dot-lg"></span>
  <span>Learn &middot; 23 of 31 claims measured</span>
</div>
```

**The state strip's three tiles are fixed for this tier**, and the third is the
one that makes the page worth trusting:

| Tile | Carries |
|---|---|
| `is-ok` **Measured here** | what the lab actually demonstrated, with a number |
| `is-warn` **Taken on documentation** | what rests on a vendor's manual rather than a run — named tool, named version |
| `is-flag` **What this page will not teach you** | the edges, stated plainly |

A page whose three tiles are all good news is not a status, it is a poster. The
third tile is not a disclaimer — it is the section that tells a learner where to
keep reading, which is the single most useful thing a teaching page can do.

**A 60-second panel directly under the strip**, before the nav. Use `.onesentence`.
A reader who stops there leaves with something true.

**The analogy sits early**, matching the Markdown's §6 — after the vocabulary and
before the mechanism. On the page it is still the two-column `.plain`/`.langs`
block: English and the project's second language side by side, paragraph for
paragraph, where the project writes one; English alone otherwise.

**Four diagrams**, each with its own `.switch`, all sharing the one key. The nav
groups them so a reader can get to the counterfactual without scrolling:

```
Start here      → what type of thing · 60 seconds · vocabulary · in plain terms
Why it exists   → the pain without it · the counterfactual
How it works    → stage by stage · the map · in real life
Should you      → when you need it · what it costs · what it breaks
Getting it wrong→ misconceptions · the neighbourhood
Check it        → see it for yourself · what you can say now
```

**The counterfactual section is the one to get right on the page** — it is what
gets skimmed to and screenshotted, the same way the before/after is on a
`how-it-works/` page. Diagram, then the row table, then the row that did not
improve, in that order.

**The lab section is carried in full**, transcripts included, with the
*what to look at* line under each block and the note saying which probes change
nothing. A reader who can paste four lines and watch a backend get ejected stops
needing to take the page's word for anything — and summarising that section into
a table throws away the only part of the page that is self-verifying.

**The legend on every diagram says what the colours mean here** — *measured ·
documented · rule of thumb · depends*. Three tiers now use the same green for
three different claims; the legend is the only thing keeping them apart.
