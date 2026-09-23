# `docs/how-it-works/<topic>/` — how the built thing actually works

`bug-fixed/` says why something broke. `unresolved/` says why something is still
broken. **Neither says how the thing that was built actually works**, and that is
the document people most often need and least often have.

**Write one whenever a feature, subsystem or multi-phase task lands — not when
somebody asks.** The moment to write it is while the reasoning is still in your
head, because the rejected alternatives are the half nobody can reconstruct
afterwards.

A task plan (`task_<name>.md`, at the repository root or under `docs/tasks/`)
is a **plan**: it says what to build and goes stale the day the work
lands. This document says what *was* built, measured against the running system.

## Where it goes

- `docs/how-it-works/<topic>/` — **the same topic names as `unresolved/`**, so a
  problem and the feature that solved it sit under one word. Create the folder if
  it does not exist.
- Everything for one feature lives there together: the Markdown, its same-basename
  HTML one-pager, and the generators that draw the page's two diagrams.
- **Name it after the mechanism**, not the ticket and not the fault:
  `repeat-safe-payment-funnel.md`, not `payment-safety.md` and not `task-9.md`.

## The honesty rule — what this tier is really for

Everything here is built, so *does it work* is the wrong question and **how do we
know** is the right one. Every mechanism, diagram box and table row carries one of
four states, never blurred:

| State | Meaning |
|---|---|
| **measured** | exercised against the running system, with the number and the date in the document |
| **tested only** | the code path exists and only a test has ever taken it |
| **never exercised** | built, and no real user or real payment has been through it |
| **deliberately not built** | the edge of the feature, drawn on purpose |

**Count them in the masthead** (`7 of 14 stages measured`). A document presenting a
feature as working when half of it has only ever been run by a unit test is the
specific failure this tier exists to prevent — and an easy one to commit, because
everything compiles and every test is green.

## Sections, in this order

A floor, not a ceiling. Add sections freely where they help.

1. **Title** — the mechanism in plain words.
2. **Related** — the `unresolved/` rows it closes, the `bug-fixed/` documents it
   supersedes, the root-level task breakdown it was built from, the flow reference.
   *(A how-it-works document **may** link to a tracked root-level file; the arrow
   the other way is what breaks — see `docs-path-rule.md`.)*
3. **Built / Where** — two bold lines: the date, branches and shape of the change;
   and which environments carry it, **stating explicitly which do not**. A feature
   that exists only on a local branch is the normal case here and must not read as
   deployed.
4. **What it does now, in one paragraph** — the version somebody can repeat in a
   meeting. End with what did *not* change, which is usually what a reader is
   quietly worried about. Follow it with the short **vocabulary table**.
5. **The problem it solved** — bullets: what was broken, what it cost or would have
   cost, why it was worth doing when it was.
6. **How it works, stage by stage** — the core. One `###` per mechanism, in the
   order a request meets them. Each opens with a **one-line italic plain-terms
   gloss**, then the actual code and `file:line`, then a **`Why this matters`
   block** (below). Say what each mechanism does *and what it deliberately does
   not do*. Every code block carries comments.
7. **The feature map** — the generated diagram, plus a table of what every
   not-built stage is *for*. See `diagrams.md`.
8. **Why this architecture** — one `###` per decision, and **each one names the
   option it beat**. Three parts every time: **Chosen**, **Rejected** (with why),
   and **Costs** — the part that gets skipped and the part a reader is actually
   looking for. Where a choice was forced rather than made (a database that will
   not build the obvious index), say *forced, not chosen* and say what forced it.
   Where the new code contradicts a comment that argued the opposite, quote the old
   reasoning and say what changed underneath it.
9. **Before and after** — **three things; a table alone is not enough.**
   - **The numbers** — measured facts, with a column saying how each was read.
     **Include at least one row that did not improve**, or the table is marketing.
   - **A paired visualization** — the same journey drawn twice, before beside
     after, generated. See `diagrams.md`.
   - **The same rows, in the analogy** — row-for-row (with the second language,
     where the project writes one), aligned
     with the diagram's rows, so the three views are the same facts told three
     ways. Continue the analogy from *In plain terms*; do not invent a second.
   - Close with **what the analogy will not let you conclude.** A before/after is
     the most quotable thing in the document and the easiest to over-read.
10. **Risk, before and after** — a table: risk · before · after · **residual**. The
    residual column is the point. A feature that closed five risks and left three
    is the normal outcome, and a document hiding the three is worse than none.
11. **In plain terms** — full rule in `plain-terms.md`. **Reuse the analogy from
    the related `unresolved/` document.** Required extra clause here:
    **What is still true:** — what has *not* been proven yet.
12. **See it for yourself, mechanism by mechanism** — the section that turns a
    document somebody believes into one they can check. Detail below.
13. **What it deliberately does not do** — the boundary, with the reason for each
    omission. This stops the next person implementing it twice.
14. **What could still bite** — residual risks as prose, each with an owner.
    Anything found by measurement while writing goes here, as sharply as you can
    make it, **including when it is a defect in the work the document describes**.
    Do not soften it and do not quietly fix it in the prose.
15. **Verify it still works** — short, and **not a second copy of §12**. Twelve is
    evidence for a reader meeting the feature; fifteen is a regression check for
    somebody who already believes it — the two or three commands you would run
    after a deploy, a rebase or a database restore. Include the check that the
    mechanism is not merely being **masked**.
16. **How to extend it** — where the next person adds to this safely, and the
    invariants they must not break. Write it as rules, so it applies to the case
    you did not foresee.
17. **What you can expect now — and what is still not true** — detail below.
18. **Glossary** — the full version of §4's vocabulary table. Both exist on
    purpose: the table teaches in reading order, this is what people come back to.
19. **Changes so far** — dated, newest last, one row per thing that moved.

## §6 · The `Why this matters` block — not optional

After each mechanism's explanation, as a blockquote (a tinted panel on the page).
**Lead with the consequence in the customer's or the money's terms**, as a bold
headline a reader can quote without reading the paragraph:

> **Why this matters — without it, a clinic can be charged twice for the same
> month.**

Not *"this ensures request idempotency"*. Then, underneath:

- **What actually goes wrong without it**, as a sequence a person can picture.
- **Why the obvious cheaper version does not work**, when there is one. This stops
  the next person re-introducing the bug while thinking they are simplifying.
- **The second-order cost** — usually the expensive half, usually left out.
- **Whose problem it is.**

**Every block carries a scenario, and four rules make it land:**

1. **One cast for the whole document.** Name a clinic, a person, a plan, an amount
   and an invoice number once near the top, and use them in every scenario. Eight
   unrelated stories are eight things to hold in your head; eight episodes about
   the same person compound, and let scenarios reference each other.
2. **Real identifiers and real amounts**, taken from the system. A scenario built
   from real rows cannot quietly describe something the system would not do.
3. **Make the behaviour ordinary.** The person must be doing something completely
   reasonable. **A fault only reached by misuse is not worth this much prose.**
4. **Structure it setup → Before → Now.** *Before* runs the old behaviour all the
   way to its real end — not "two pages are created" but "₱40,320 has left the
   clinic and nothing flagged it". The *Before* half is usually longer, and that is
   correct: it is the half nobody would otherwise believe.

## §12 · See it for yourself — four parts per mechanism

- **Where it lives** — the file and line, *and* the table and column, *and* the
  endpoint. "It's in the payments module" is not a location.
- **Before** — stated as an observation, not a description: *`idempotency_keys`
  had 0 rows and had never had one*, not *idempotency was not wired up*.
- **Now** — the command, then its **actual output pasted as a transcript**. Run it.
  A transcript nobody ran is the most convincing wrong thing a document can hold.
- **What to look at** — which line is the proof, **and what a different value there
  would mean**. *A third `201` here means the interceptor is detached again* tells
  the next reader how to interpret a failure; *expect 422* only says it broke.

**Every block must stand alone** — pasted into a terminal that has never seen this
document. Write the long invocation out in full (`docker exec … psql -U … -d …`)
rather than hiding it behind a variable or a shell function. Verbose beats clever.
The one exception is a value that is genuinely the reader's (a token, an id): set
it in a short opening block, derive it with a query, and say plainly that shell
variables live only in the terminal that set them.

**Then paste your own blocks into `zsh -f` and run them.** Not the shell you wrote
them in — that one has your history, your functions and your environment, and it
hides exactly the failures a reader hits first. This estate published an evidence
section twice with a broken helper before a virgin shell was tried: a `PSQL="docker
exec …"` variable, which zsh does not word-split; then a `psqlc()` function, which
works beautifully until somebody pastes the second block into a new tab.

**Prefer probes that change nothing** — a `begin; … rollback;`, a callback aimed at
a reference that does not exist, a column set by hand and set back. Where a probe
does mutate, show the restore in the same block.

**Say what a probe does not prove.** A SQL-level proof that `UPDATE … WHERE status
<> 'paid'` affects zero rows the second time is not a proof that two concurrent
HTTP callbacks behave correctly. Write that line yourself or a reader will
over-read the transcript.

**A transcript goes stale in two directions**, and both need a durable substitute:

- *It decays.* A gap computed from `updated_at` is a **last-write** stamp, not an
  event log, so any later status change destroys it. Keep the original figure with
  its timestamp and give a query that still works — usually a count of states.
- *It grows, because the reader ran it.* A probe that writes a row changes the
  output of the query printed beneath it. Say so, and publish a second form that
  answers the same question independently of how many people have been through — a
  grouped count (*written by the old code* versus *written by this one*) rather
  than the newest N rows. Then name the number in it that should never move.

## §17 · The closing summary — write it as stories, not prose

The section most readers will quote back at you: the whole document restated as
**outcomes**, not mechanisms.

```markdown
#### ① She clicks twice, and pays once

1. Ana opens the payment page and picks her plan.
2. She clicks **Continue**.
3. The clinic's internet is slow. Nothing happens for five seconds.
4. She clicks **Continue** again.

**Before.** The second click made a second payment page. Both pages worked. Ana
paid one. Three days later her co-worker found the other one still open in a
browser tab, thought it was the bill, and paid that one too. The clinic paid
₱40,320 for one month.

**Now.** The second click carries the same ticket number as the first. The server
says "I already answered this one" and sends back the same page. One page. One
charge of ₱20,160.00.
```

- **Numbered steps of what the person actually does** — not what the system does.
  The same steps in both halves are what make Before and Now comparable.
- **A heading that is the outcome from the person's side**: *"She clicks twice, and
  pays once"*, not *"Idempotency enforcement"*.
- **Both halves get the same treatment.** The things still not true are stories
  too, each ending with a **Waiting on:** line. A summary where the good news is
  illustrated and the bad news is abstract is a sales document.
- **Everyday words — translate the vocabulary out.** *Ticket number*, not
  *idempotency key*. *A message from CPD*, not *a callback*. *The page has run
  out*, not *the checkout has expired*. The precise terms live in §6.
- **Short sentences, one idea each.** If a sentence needs a dash to hold two
  thoughts together, it is two sentences. Read it out loud.
- **One sentence at the very end** a person could repeat in a corridor, carrying
  both halves. **If that sentence is all good news, it is wrong.**
- **Cross-reference by story, not by section number** — *"that is the same lost
  page as story ④, arriving through the rule from story ②"*.

## Diagrams and the one-pager

- **Two diagrams, not one:** the feature map (`<name>-map.build.py`) and the
  before/after paired track (`<name>-beforeafter.build.py`). They answer different
  questions and need different shapes. Full rules in `diagrams.md`.
- **The one-pager is required** — same basename, same folder. Recipe in
  `one-pager.md`. Its masthead pill counts **measured stages, not closed rows**,
  which is the difference between this tier and `unresolved/`. Its state strip
  carries **what is proven · what is tested only · what is still open**, including
  any defect found while writing. A page whose three tiles are all good news is not
  a status, it is a poster.

## Registering it

In the same sitting: a row in the `how-it-works` table in `docs/README.md` (and a
new section for a new topic folder), and an entry in the estate's feature
registry if it keeps one — a how-it-works document is by definition a feature
document.

**If it closes rows in an `unresolved/` document, update that document's tracker in
the same sitting**, and its one-pager with it. It does **not** replace or move the
unresolved document: that moves to `bug-fixed/` only when every numbered row
closes, and most features close some and leave others open.
