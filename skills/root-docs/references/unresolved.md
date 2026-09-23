# `docs/unresolved/<topic>/` — a problem diagnosed but not fixed

Grouped **by topic, not by repo**, because a fault is met as a symptom in a
subsystem long before anyone knows which repo owns it, and most of the interesting
ones span two.

## Where it goes

- `docs/unresolved/<topic>/` — `payments/`, `onboarding/`, `auth/`, `search/`,
  `deployment/`. **Topics are few and broad on purpose**: someone asking
  about checkout idempotency is asking about payments, so it goes in `payments/`
  rather than starting an `idempotency/` folder. A folder per issue is a flat list
  with extra steps. A new folder is right only when a problem genuinely belongs to
  no existing topic.
- **Everything for one issue lives together in that folder:** the Markdown, its
  same-basename HTML one-pager, and the generator that draws the page's diagrams.
  Moving it later is then a folder move and a path fix rather than a hunt.
- **Title it after the failure, not the ticket.**
- A topic folder may also carry a **topic page** — one HTML covering the whole
  chain across every issue in the folder (for example `payments-path-dead-ends.html`).
  It answers *"where are we on payments"*; an issue page answers *"what do I have
  to build"*. It **shows where each issue sits and does not repeat each issue's
  detail** — that is the only reason a second page is allowed to exist. A fourth
  issue means adding *a section* there **and** *a page* here, not choosing.

Use the project's best existing unresolved document as the format, when there is
one. Brief, bulleted, no narrative. Keep the whole thing scannable on one
screen-and-a-bit; the long-form investigation belongs in the repo-folder document
this one links to.

## Sections, in this order

1. **Title** — the failure in plain words, not the ticket name.
2. **Status / Where** — two bold lines: what is blocking the fix, and which
   environments are affected (**and explicitly which are not**).
3. **The resolution tracker**, directly under *Status / Where* — see below.
4. **Symptom** — bullets. What a person sees, in the order they see it.
5. **Cause** — bullets, one link in the chain per bullet, ending at the observed
   symptom. Keep it technical; the plain-language version is its own section.
6. **In plain terms** — its own `##` section, not a tail paragraph of *Cause*, so
   it is findable and linkable. Full rule in `plain-terms.md`. End both language
   subsections with the fix **naming the numbered option it corresponds to**, so a
   reader who stops here still knows what to ask for.
7. **Evidence** — a table of measured facts (URL/input → result → verdict). Real
   numbers from a real run, never recalled.
8. **Current behaviour — why it fails** — the request/call trace as it runs today,
   numbered, one step per line, **✗** on the step that breaks, a closing italic
   line naming why. One trace per distinct symptom, plus a short subsection for
   anything that *appears* to work and why that is misleading. Tie each trace back
   to the analogy in one italic line.
9. **Possible solutions — and who to approach** — the long section, below.
10. **Verify after the change** — a copy-pasteable command plus expected output.
11. **Currently in place** — any workaround holding the line, what it costs, and
    the instruction to delete it when the real fix lands.
12. **`## Changes so far`** — dated, newest last, one row per thing that actually
    moved: what changed, and **what it did to the blockage** — including "none".
    This stops the document reading as though nothing has happened for a
    fortnight, and equally stops a burst of activity reading as progress when the
    blocker has not moved. Record deferrals here too.
13. A closing link to the full diagnosis document if one exists.
14. **`## Task cards`** — one card per tracker row, generated. See `task-cards.md`.

## The resolution tracker

One numbered row per thing that must happen, each with its owner and its own
status, and above it a single **overall tag** — `OPEN`, `BLOCKED` or `RESOLVED`.

- The overall tag is what a reader sees first.
- It flips to resolved **only when every numbered row is closed**. One open row
  keeps the whole document open, however much has landed around it.
- **Number the rows to match the *Possible solutions* options ①②③**, so "③ landed"
  needs no further explanation.

Partial progress never earns the resolved tag. A document where two of three rows
are closed is an open document with a good tracker.

## *Possible solutions — and who to approach*, in detail

**Grouped by the role that would make the change**, so a reader knows who to talk
to rather than reading a solution list and then hunting for its owner.

- One `###` per role — **not a table**; tables squeeze this into unreadable cells.
- Head each with the role and a **bold three-word verdict**: *owns the fix*,
  *decides the shape*, *cleans up after*, *nothing*.
- Under the heading, one italic line on why it is them, then their options as
  `####` sub-headings. Each option carries:
  - a summary of what it does and what it costs;
  - **the actual code or config change** — a function, a diff, a shell snippet, an
    nginx block — real and copy-pasteable, not pseudocode. A console-only setting
    still gets the setting quoted verbatim;
  - a bold **Why it works** paragraph tracing the change against the evidence
    table, so a reader can check it without deploying;
  - a blockquote directly under the heading carrying a `> **Analogy —**` line
    (and its second-language line, where the project writes one) extending the
    *In plain terms* analogy, with a bold **How that fixes it:** clause. An analogy that only
    describes the change leaves the reader to work out whether it helps, which is
    the one thing the analogy exists to spare them;
  - a `→ Needs:` line naming the access or sign-off required.
- **Number options ①②③ across the whole section**, recommended first, so later text
  can name one by number. Order the roles by who to approach first.
- **Cover every role that could contribute** — DevOps/cloud, backend, frontend,
  solution architect, QA, DBA — and **list a role even when its answer is
  "nothing"**, saying so outright. That rules it out instead of leaving people
  guessing. If no role can act at all, write `None — <why>` and stop there.
- Close with a **Ruled out** subsection — the options someone will otherwise
  propose, each with the one sentence explaining why it fails, a one-line italic
  analogy saying why it does *not* fix it (with its second-language line in the
  same blockquote, where there is one), and an honest note on what it costs or fails to cover.
- Close with a **Fastest path** line naming who to approach first, with which
  numbered option.

## Tagging one resolved is a procedure, not a status edit

When the last numbered row closes, **all four happen in the same sitting**, or the
estate ends up with a fixed problem still described as open:

1. Flip the overall tag to **RESOLVED**, with the date, and close the last rows in
   the tracker.
2. Add the final `Changes so far` row — what closed it, and who closed it.
3. **Move the document.** It becomes a `docs/bug-fixed/` (or `bug-fixed/<repo>/`) document in that
   tier's format, and its row moves from the `unresolved` table to the `bug-fixed`
   table in `docs/README.md`. **Do not leave a copy behind.**
4. Update the companion one-pager's **status pill and state strip** in the same
   sitting. A stale page is worse than stale Markdown, because it is the version
   that was sent to other people.

Note where the two grouping schemes meet: `unresolved/` is by topic and
`bug-fixed/` is flat or by repo, so resolving moves a document *across* schemes. That is
deliberate — an open problem is looked for by symptom, a fixed one by the code
that fixed it — but it means the move is never a straight rename, and **the
relative links inside the document all change depth with it.**

A how-it-works document does **not** move an unresolved one. A feature usually
closes some numbered rows and leaves others open; the two cross-link and each
answers its own question.

## The companion one-pager

**Every unresolved document gets one**, same basename, same topic folder. Full
recipe, section order and house style in `one-pager.md`. The one-pagers here carry
a stronger rule than the rest of the estate: a **status pill and state strip that
must flip in the same sitting as the tracker**.

Where older documents predate the rule and have no page, **build one when you
next touch the document, not in a sweep** — a page written without the issue fresh in
mind is the kind nobody trusts.
