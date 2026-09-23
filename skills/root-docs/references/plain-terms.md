# *In plain terms* — the analogy rule, shared by every tier

Required in `unresolved/` and `how-it-works/` documents, and in `bug-fixed/`
whenever the cause crossed a service boundary or more than one fault stacked up.
Skip it only for a self-contained one-liner.

## The shape

Its own `##` section — **not a tail paragraph of *Cause***, so it is findable and
linkable. Inside it, an **In English** subsection and, when the project's
`CLAUDE.md` names a second language its readers need, a second `###` subsection
saying the same thing in that language.

The example below uses Tagalog (**Sa Tagalog**), the second language of the
estate this system was first written for. Its labels mirror the English ones:
**Ang solusyon:** for **The fix:**, **Bakit ayos na:** for **How that fixes it:**,
**Ang totoo pa rin:** for **What is still true:**. A project with no second
language writes the English subsection only and drops every second-language
line mentioned in these references.

```markdown
## In plain terms

<the analogy, set up once>

### In English

<paragraph 1>

<paragraph 2>

**The fix:** <the fix in the analogy's own terms> **How that fixes it:** <what
changes so the symptom stops>

### Sa Tagalog

<talata 1 — the same content as paragraph 1>

<talata 2 — the same content as paragraph 2>

**Ang solusyon:** <…> **Bakit ayos na:** <…>
```

## The rules

- **One everyday analogy a 15-year-old would follow** — a school, a shop, a queue,
  a canteen. No jargon, no industry setting.
- **Each part of the analogy maps to a named part of the real system.** An analogy
  that does not map is decoration.
- **Where there are two subsections, they say the same thing paragraph for
  paragraph**, so either can be read alone and the two can be compared line by
  line.
- **Short sentences, one idea each, with blank lines between them.** A dense
  paragraph in either language defeats the point.
- **Leave technical nouns in English in the second language** — `room number`, `flyer`,
  `lobby`, `callback`, `token`. Do not invent translations.
- **End both subsections with the fix**, in the analogy's own terms:
  - `unresolved/`: **The fix:**, **naming the numbered option
    it corresponds to**, so a reader who stops here still knows what to ask for.
  - `bug-fixed/`: the same, describing the fix that landed.
  - `how-it-works/`: **The fix:** mapping each numbered
    mechanism into the analogy.
- **Always include a `How that fixes it:` clause** saying what
  changes so the symptom stops. **An analogy that only describes the change leaves
  the reader to work out whether it helps, which is the one thing the analogy
  exists to spare them.**
- `how-it-works/` adds one more, and it is required there: **What is still true:**
  — what has *not* been proven yet, in the analogy's terms.

## One analogy, reused — never a second

**Reuse the analogy from the related document** rather than inventing a second for
the same subsystem. Continuing one analogy across the problem and its solution is
most of the value: a payments set can run on one canteen analogy from the
document that diagnosed the problem straight through the feature document that
fixed it.

Within one document, the analogy introduced here is the one used everywhere else —
in each solution option's blockquote, in each ruled-out entry, in the before/after
pairing. Never invent a second.

## Where the analogy reappears

| Tier | Where else it must appear |
|---|---|
| `unresolved/` | A `> **Analogy —**` blockquote (plus its second-language line) under **every** solution option's heading, each with its **How that fixes it:** clause. A one-line italic analogy on every **Ruled out** entry saying why it does *not* fix it, with its second-language line in the same blockquote. An italic line tying each failure trace back to it. |
| `how-it-works/` | The before/after section's **row-for-row pairing**, in English (and the second language), aligned with the paired diagram's rows — put it there rather than here, because before-and-after is where an analogy does its most work. Close that pairing with **what the analogy will not let you conclude**. |
| The one-pager | Where there is a second language, English and it **side by side**, paragraph for paragraph — except the before/after pairing, where the two tables go **one above the other**, because the pairing that matters there is before-versus-after across each row and a four-column split fights it. |

## Not the same as the per-mechanism gloss

A `how-it-works/` document also gives every mechanism a **one-line italic
plain-terms gloss** under its heading, before the technical explanation:

```markdown
### 3.5 The attempt is written before the call

*In plain terms: write down that you are about to ask, before you ask. Then a
question that never gets an answer still leaves a note behind.*
```

That gloss does **not** replace this section. The gloss makes one mechanism legible
in place; the analogy makes the whole feature legible to somebody who will never
read the code.
