# Superseded documents — tag them, never silently leave them

A document goes stale the moment the code moves under it, and this estate's
documents routinely outlive the state they describe by weeks.

**When a change makes part of an existing document wrong, tag that document in the
same sitting as the change.** Not later, not as a follow-up someone has to request
— the person who made the change is the only one who knows which paragraph it broke.

**Never delete or silently rewrite the stale claim.** A document that quietly
changes its mind teaches nobody, and the old claim is usually still in someone's
head, in a chat thread, or in an HTML one-pager that was already sent out. **The
correction has to be visible *as* a correction**, or the next person re-derives the
whole thing to find out which version they are holding.

## The banner

A blockquote directly under the document's `#` title, **above** the `**Related:**`
and `**Scope:**` lines, so it cannot be scrolled past.

```markdown
> **⚠ Superseded in part — 2026-09-11.** `search-api` is now in
> `docker-compose.yml` (`search-db`, `search-api`, `mailpit`) behind a proxy
> vhost, so §2's "not wired up yet" row is wrong. Corrected in place and
> marked **[corrected 2026-09-11]**. Everything else on this page is still as
> measured 2026-09-02.
```

**Four things, and all four are load-bearing:**

1. **The date the supersession was established** — not the date of the original
   measurement. A reader compares the two, and **the gap is the warning**.
2. **What specifically is wrong** — the section, the table row, the claim. A banner
   reading "parts of this are out of date" taints the whole document, which is the
   opposite of the intent.
3. **What replaced it**, named concretely — the file, the service, the compose
   entry, the document that now holds the truth.
4. **What is still good.** *This is the half that gets skipped, and it is what
   decides whether the document keeps being read at all.*

Use **⚠ Superseded in part** when most of the page survives, and **⚠ Superseded**
when the document as a whole has been overtaken — in which case the banner's job is
to name its successor in the first sentence and stop.

## The inline sub-tag

The banner says a document is partly stale; the sub-tag says **where**. At each
claim the change broke, leave the correction inline and tag it.

```markdown
| `services/search-api` | **[corrected 2026-09-11]** ~~no compose entry in
either stack~~ — three compose services since 2026-09-08 … |
```

**Strike the wrong claim rather than deleting it** wherever it is short enough to
read, and put the replacement beside it. Where the wrong claim runs to a paragraph
rather than a phrase, leave the paragraph and open it with
**[superseded 2026-09-11 — see below]**.

Two tags, and the distinction is worth keeping:

| Tag | Meaning |
|---|---|
| **`[corrected <date>]`** | this document now states the truth itself |
| **`[superseded <date>]`** | the truth lives elsewhere and this document is only pointing at it — **name where** |

ISO dates in both, so the estate's corrections can be ordered by when they happened.

## Finding them — match on the words, not the glyph

Markdown carries a literal ⚠ and an HTML page carries `&#9888;`, so **a glyph grep
silently finds half**.

```bash
# Every tagged document, Markdown and HTML alike.
grep -rl 'Superseded in part' docs

# Every individual correction, with its line.
grep -rn '\[corrected \|\[superseded ' docs --include='*.md'
```

## An HTML page is tagged first, not last

**Every rule above applies to a `.html` companion, and applies to it more
urgently.** These pages are the ones that get **sent**, so a stale one is worse than
stale Markdown in a specific way: the recipient holds a copy that cannot be updated,
cannot see the banner added here afterwards, and has no reason to doubt what it
shows. **A superseded page that was already sent is actively misinforming somebody
right now.**

When a change supersedes a document that has a page beside it:

1. **Tag the page in the same sitting as the Markdown**, never as a follow-up. Put
   the banner immediately below the masthead, above the first section, in a panel
   that inherits the page's own tokens — **not a new colour scale**. A page's colour
   already means status.
2. **Say what the page still teaches**, in the banner, with the same weight as what
   it gets wrong. A demo whose trigger label moved still teaches its mechanism
   correctly, and a banner that does not say so retires a good page.
3. **Where the page is a *diagram* of something unbuilt, say which stages are
   unbuilt in the banner.** A map that draws a queue as running, when the claim
   function has no callers, reads as deployed architecture to everyone who was not
   in the room.
4. **Send it again.** Tagging the local file does nothing for the copy somebody
   already has. A material status change is a reason to re-send, and the banner's
   date is what tells a recipient which copy they are holding.

The one-pagers under `docs/unresolved/` have a stronger rule on top of this — a
status pill and state strip that flip in the same sitting as the tracker. See
`unresolved.md`; it is not replaced by this.

## When the banner comes off

**Only when the document has been re-measured end to end**, and its masthead date
moved to the day that was done.

Correcting the three paragraphs one change broke does not earn a clean masthead:
the rest of the page is exactly as old as it was, and **it is the undated remainder
that catches the next reader**. Fixing three paragraphs narrows the banner to name
what was re-measured; it does not remove it.

## Register it

Note the supersession **in that document's row in `docs/README.md`**, in the same
sitting. That table is where people choose what to open, and a reader who opened a
superseded document because its row read clean was failed by the index, not by the
document.

## And the diagram

A supersession is a documentation update like any other, so it ends the same way:
ask what the change did to the visualization, and write the answer down. See
`diagrams.md`.
