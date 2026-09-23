# `docs/learn/<topic>/<concept>.md` — the section order

Sections in this order. **None may be skipped** except where it says otherwise
(§22, §23, and the §11 estate anchor, depend on the mode chosen in SKILL.md §0) —
a short section is fine, an absent one is not, because the absent ones are always
the same five and they are the five a beginner needed.

The order is **the order somebody learns in**, which is not the order a reviewer
reads in. That is the whole difference between this tier and `how-it-works/`, and
it is why §6 sits where it does.

---

### 1 · Title

The concept in the words a learner would use. `# Load balancers`, not
`# Horizontal traffic distribution at L4 and L7`.

### 2 · Related

Sibling concepts in the same topic folder; the estate documents where this
concept shows up, **or where its absence does**; the tools the document leans on.

### 3 · What type of thing this is

*The user's first question, and the one tutorials answer last.* Four lines, no
more:

- **Category** — what kind of thing it is. *A traffic-distribution pattern.
  Infrastructure, not application code.*
- **Where it sits** — the layer, the boundary, what is upstream and downstream of
  it, named concretely.
- **What it is not** — the two or three things it gets confused with, one clause
  each. The long version is §16; this is the line that stops a reader building
  the wrong model in the first minute.
- **What you need before it makes sense** — the prerequisite concepts, named and
  linked. Say plainly if there are none.

### 4 · The 60-second version

What it is, why it exists, and **the single number that justifies it**, with its
provenance. A reader who stops here must leave with something true rather than
something vague.

End it with the honest counterweight in one sentence — what adopting it costs —
so the 60-second version is not a sales pitch.

### 5 · Vocabulary you will meet

The short table, **before any term of art appears anywhere in the document**.
Only the words this document leans on. Concrete definitions in the lab's or the
estate's terms, never abstract ones. The full glossary is §19; this one teaches
in reading order.

### 6 · In plain terms — the analogy

**Early, and this is the deliberate deviation from the root `CLAUDE.md`'s
ordering.** In `how-it-works/` the analogy sits near the end and serves a
reviewer who has already read the mechanism. Here it is the scaffold everything
else hangs on: a beginner who meets the code first has nothing to attach it to.

Everything else is unchanged and `root-docs` → `references/plain-terms.md`
governs it: one everyday analogy a 15-year-old would follow, every part mapping
to a named part of the real thing, an **In English** subsection (plus its
second-language twin, paragraph for paragraph, where the project writes one),
short sentences, technical nouns left in English, and the closing **The fix:**
with its **How that fixes it:** clause.

**One analogy for the whole document**, reused in every later section — the
counterfactual rows, each risk card, each neighbour. Never a second.

Prefer an analogy from this estate's own domain where one fits. A clinic system
gives you a reception desk, a queue, a records room, a duty roster; a shop gives
you a till, a stockroom and a delivery van. A reader who works on it every day
gets the mapping for free.

### 7 · Why it exists — the pain without it

*The user's "why is it needed", answered with measurements rather than adjectives.*

Bullets, each one a consequence a person meets, **each with a number from the
lab's WITHOUT run**. This is the section that most often degrades into
"scalability and reliability"; the lab exists so it cannot.

### 8 · The counterfactual — what happens if you do not use it

*The user's explicit ask, and the section no tutorial has.*

The `<concept>-without.build.py` paired track, plus the same rows as a table:
the step, what happens without the pattern, what happens with it, and the
measured difference. Keep it to rows that actually differ — the generator
asserts it.

Close with the row that **did not improve**, or the table is marketing. There is
always one: something got slower, or more complex, or newly able to fail.

### 9 · How it works, stage by stage

The core. One `###` per mechanism, in the order a request meets them, each with
**all five** of:

1. **A one-line italic plain-terms gloss** under the heading, before anything
   technical.
2. **A picture** — either *"drawn as the `pick a backend` box on the map, §10"*,
   naming the box so the reader can find it, or its own small generated figure.
   **No mechanism ships without one**, and the prose says which it is.
3. **The real thing** — actual config, actual code, from a named tool at a named
   version or from the lab. Commented for *what the line is for*, never a
   restatement of the syntax.
4. **A `Why this matters` block**, leading with the consequence in the reader's
   terms as a bold headline they could quote, then a concrete scenario about the
   document's one cast. Same rule as `how-it-works/`.
5. **A provenance tag** on every load-bearing claim inside it.

And say what each mechanism **deliberately does not do**. A beginner who learns
only the happy path has learned the thing that will hurt them.

### 10 · The mechanism map

The `<concept>-map.build.py` diagram, its legend saying what the colours mean
*here*, and beneath it a table giving every stage that is external, optional or
commonly skipped two lines: **why it exists** and **what it sits between**.

### 11 · In real life

*The user's "how it works in real life or application".*

**Three named implementations**, with the actual directive or API, the version,
and what each one does differently from the others. Not a feature matrix — the
point is that the concept survives contact with three different products and the
differences are where the design decisions show.

Then **the estate anchor**: where this shows up in our own stack, or where its
absence is measurable. Honest either way, and never implying we use something we
do not.

**Standalone mode** (SKILL.md §0): leave the estate anchor out. The three named
implementations carry the section on their own.

### 12 · When you need it — and when you do not

*The user's "when do we need it", answered so it can be acted on.*

Three subsections, and the second is the one that gets skipped:

- **Signals you need it now** — each observable, each with the threshold and how
  to measure it on your own system.
- **Signals you do not need it yet** — the honest half. Most systems adopt this
  kind of thing early and pay for it. Say what the cheaper answer is.
- **What has to be true first** — the prerequisites that make it work at all,
  each with what breaks if it is not true.

This section stays general on purpose. **In repo-anchored mode the
project-specific answer is the fit map, §22**, and this section ends with one
line pointing at it and giving its count.

### 13 · What it buys you, and what each gain costs

*The user's "its advantage", with the counterweight that stops it being a
brochure.* A table: **gain · how much, measured · what it costs**. Every row has
all three. A gain whose cost column reads "none" is a row you have not finished
thinking about.

### 14 · What it breaks — the new failure modes

*The user's "caveats and risks", as the thing it actually is: adopting a pattern
is not free, and the new failures are new, not merely reduced old ones.*

The `<concept>-risks.build.py` tree, then one card per failure mode:

- **Trigger** — what has to happen.
- **Blast radius** — who notices, and how it looks to them.
- **Mitigation** — the standard answer, with its own cost.
- **Is the mitigation standard?** — standard · partial · none. **The `none` rows
  are the most valuable in the document** and must not be quietly omitted.

### 15 · Common misconceptions

*The beginner-critical section.* One entry per wrong mental model: **what people
believe · why it is appealing · what actually happens · the one-line correction.**
These come from real confusions, so prefer ones you have watched somebody have.

### 16 · The neighbourhood — what works with it

*The user's "suggested related system design that work with each other".*

The `<concept>-neighbours.build.py` diagram plus four short tables. The fourth is
the one beginners need most:

| Band | What it holds |
|---|---|
| **Works with** | Composes to form a working system. Say what the pair achieves that neither does alone. |
| **Depends on** | Must be true first, or the concept misbehaves rather than fails cleanly. |
| **Competes with** | A different answer to the same problem. Say when you would pick it instead. |
| **Is confused with** | Adjacent things that are not this. The difference in one sentence each. |

### 17 · See it for yourself

The lab, block by block. Same rules as `how-it-works/` and they are not relaxed:
**every block stands alone** pasted into a terminal that has never seen the
document; the long invocation written out in full; **the transcript is pasted
from a real run**, never written from expectation; and each block closes with
*what to look at* — which number is the proof, and **what a different value
there would mean**.

Prefer probes that change nothing. Where a probe mutates, show the restore in the
same block. Say what a probe does **not** prove.

**Then paste your own blocks into `zsh -f` and run them** — not the shell you
wrote them in, which has your history and your variables and will hide exactly
the failure a reader hits first.

### 18 · What you can say about it now — and what you still cannot

The closing, and the section most readers will quote. The estate's story format:
a heading that is the outcome in a person's terms, numbered steps of what
somebody actually does, then **Without** and **With** in ordinary speech.

**Both halves get the same treatment.** The things you still cannot claim are
stories too, each ending with a **Still unknown:** line naming what would settle
it. A closing summary where the good news is illustrated and the limits are
abstract is a sales document.

Then **one sentence a person could repeat in a corridor**, carrying both halves.
If it is all good news, it is wrong.

### 19 · Glossary

The full reference version of §5. Both exist on purpose: §5 teaches in reading
order, this one is what somebody comes back to.

### 20 · Provenance ledger

Every load-bearing claim, its state, its source. `references/provenance.md` has
the shape. **The masthead count comes from here**, not from an estimate.

### 21 · Changes so far

Dated, newest last, one row per thing that actually moved, and what it did to the
document's claims. A re-measurement that confirmed a number is a row.

### 22 · Where it fits in this project — repo-anchored mode only

*The owner's question: now that I understand it, where should it be doing work
here, where should it not, and how sure am I?* Leave it out entirely in
standalone mode. Full method: `references/fit-map.md`.

1. **The feature inventory** — a short table of what the project is for and what
   it does (feature · where it lives · state), read on the day from the root
   `CLAUDE.md`, the architecture and schema documents, `how-it-works/`,
   `unresolved/` and its cards, `docs/tasks/`, the code and `git log --all`.
2. **The fit table** — one row per feature and capability that meet:
   `# · Capability · Feature it serves · Status · Why (evidence) · Cost / what it
   touches · Next step · who decides`. Statuses, in this order: **in use · most
   likely · likely · possible · unlikely · ruled out**. `in use` rows first.
3. **A short paragraph under the table** for each `most likely` row (what it
   replaces or adds, its cost, what goes wrong if it is done badly, the first
   step) and each `ruled out` row (the rule, why it still holds, and whether
   revisiting it is a live question the user has been asked).

Every claim under a grade carries its provenance tag and has a ledger row. The
fit count goes in the masthead. **Nothing in this section gets built while the
lesson is written.**

A `most likely` fit that answers an existing card names that card. One with no
card is a suggestion: it becomes an `A-` card in §23 only if the user asks.

### 23 · Task cards — repo-anchored mode only

**The last section of a repo-anchored lesson, in both the `.md` and the
`.html`.** Leave it out entirely in standalone mode.

One audit card per gap the audit found between what the concept requires and
what the repo does today, in the **current** task-card format: the unresolved
tier's generator and the *Task cards* field table in the root `CLAUDE.md` are
the source, read on the day. Ids `A-1`, `A-2`…, every card tagged `audit`,
**Before** carrying the file, line and date the audit saw, **After** left as the
placeholder until every step is done and checked.

Generated between the `task-cards:begin` / `task-cards:end` sentinels by
`docs/learn/<topic>/task-cards.build.py`, never written by hand. A clean audit
still writes the section: one line saying what was checked, when, and that no
card was needed.

---

## The five that always go missing

If you are short of time, these are the ones to protect. They are what separates
this tier from the tutorial the reader could already have found:

1. **§8 the counterfactual** — nobody writes it, and it is the fastest way to
   understand why a thing exists.
2. **§12's middle subsection** — *signals you do not need it yet*.
3. **§14's `none` rows** — the risks with no standard mitigation.
4. **§15 misconceptions** — the wrong models, not just the right one.
5. **§18's second half** — what you still cannot claim.
