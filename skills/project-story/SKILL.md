---
name: project-story
description: Write the whole-project story in plain, non-technical language, from the first commit to today, by reading every document in `docs/`. Explains what the project is, why it exists, the problem it solves, then walks the work in chronological order (problem found → plan → fix → what it means), and ends on what is still open and who it waits on. Unlike `plain-report`, which is a short update covering only unreported items, this is the full account for someone arriving cold. Use when asked to "explain the whole project", "what is this project about", "summarise the docs", "write a report of the work from start to finish", "onboard someone", "give me the story so far", "explain this to a non-techy person end to end", or "walk me through what we've done".
---

# Project story: the whole arc, in plain terms

Produce **one report** that takes a reader who knows nothing about this project
from "what is it?" to "what is left?" without needing a developer beside them.

It reads as a narrative with a beginning, a middle and an unfinished end. It is
long enough to be complete and plain enough that nobody has to ask what a word
means.

**Scope.** The source is the repository's `docs/` folder (the tiers the
`root-docs` skill defines) and its git history. Where the estate keeps per-repo
folders (`docs/bug-fixed/<repo>/`), a story may span more than one repo's
folder. The report is a file under `docs/reports/`, never an Artifact and never
published. **If the project is client-facing**, a fault can be something a real
client saw, and the story must say plainly whether one did. Where a security
document describes a breach path, describe the risk in plain terms without
writing a recipe for it.

---

## 0 · Know who is reading before you write

Ask once, in a single `AskUserQuestion` call, unless the user already said.

| Question | Header | Options, default first |
|---|---|---|
| Who is this story for? | Reader | **Someone arriving cold** (new stakeholder or developer, needs the whole thing) · The client or business owner (cares about outcomes and decisions) · A manager needing the state of play · Us, as a record |

The reader changes emphasis, never honesty:

- **Arriving cold** → keep every section, including how the paperwork works.
- **Client or owner** → lead harder on privacy, risk to their own clients, and
  the decisions waiting on them; shorten the engineering lessons.
- **Manager** → keep the timeline and the open list; shorten the mechanism.
- **A record** → keep everything, drop the explanatory analogies.

Say in your chat reply which reader you wrote for. If the user declines to
answer, use the default and say so.

---

## 1 · Read in this order, and read everything

Do not sample. A story that skips a document gets the chronology wrong.

1. **`docs/README.md`** first. Its rows say what each document answers and its
   current status. This is your map and your status source.
2. **The architecture and schema documents** that `docs/README.md` lists as the
   system's reference, for what the system is before any fault is discussed.
3. **`docs/how-it-works/**/*.md`** for how it behaves. Read the supersession
   banners at the top carefully: they are the clearest record of what changed
   and when.
4. **`docs/unresolved/**/*.md`** for problems. From each, take the title, the
   intro, `## The resolution tracker`, `## Symptom`, `## Cause` and
   `## In plain terms`.
5. **`docs/bug-fixed/**/*.md`** for fixes. Take Symptom, Cause, The fix,
   Evidence and `## In plain terms`.
6. **`docs/tasks/task_*.md`** mastheads only, for how the work was planned and
   how far each plan got.
7. **`docs/reports/*.md`** for the plain wording already agreed with the reader.
   **Reuse that wording.** If a fault was already described plainly in a past
   report, do not reinvent the phrasing.
8. **`CLAUDE.md`** for the invariants, the open-issue registry and anything
   listed as required before launch, and **any launch or release test plan** the
   index lists, for what is meant to be proven before real users arrive, and
   what has been.

Then the history, for dates you can trust:

```bash
git log --format='%ad | %h | %s' --date=short | tail -40   # the build phase
git log --format='%ad | %h | %s' --date=short | head -25   # recent work
```

Skip `*.build.py`, `*.mjs`, `*.html` and `*.svg`. The `.md` is the source; the
`.html` beside it is a copy of the same words.

---

## 2 · Build the timeline before you write a sentence

Lay out, in a scratch list, every dated event you found: first release, each
feature phase, the day documentation started, each problem found, each fix, each
decision still open. Sort by date.

Phases usually fall out on their own. Name each phase by **what it was really
about**, not by its dates: "building it", "writing it down and finding the
cracks", "the day we assumed the request was hostile". A phase heading that
reads like a date range teaches nobody anything.

**The chronology the user asked for is the spine**: a problem is found and
written into `unresolved/` with a tracker, a plan goes into `tasks/`, the work is
done, the fix is written into `bug-fixed/`, the tracker row closes, and a report
goes out. Show that loop happening. It is how the project actually works, and it
is more useful to a new reader than any single fix.

---

## 3 · The shape of the report

Keep these sections, in this order. Drop one only when the reader choice in
step 0 says to, and say in your reply that you dropped it.

| # | Section | Holds |
|---|---|---|
| 1 | What it is, in one paragraph | Who signs in, what they can see, what it produces |
| 2 | The problem it was built to solve | The two or three things that go wrong without it, told as situations, not as features |
| 3 | How it works, in plain terms | The main journey as a table, then the one or two rules the whole design rests on (for a multi-tenant system, how one customer's data is kept apart from another's) |
| 4 | The story, in order | One sub-section per phase. The bulk of the report |
| 5 | Where things stand today | Three lists: what is solid, what has never actually been run, what waits on a business decision |
| 6 | What this project has learned | The durable lessons, each traced to a real fault |
| 7 | How the paperwork is organised | The `docs/` tiers, the per-repo folders, and the loop from step 2 |
| 8 | The short version | Five or six sentences. Someone who reads only this should not be misled |

Open with a **written-for line, the date range covered, and the date written.**
State plainly that it is the full account, not a status update.

### Writing each phase

A phase is a small story, not a changelog. For each one:

- **Set the scene.** What was believed to be true before.
- **Show the fault as a situation someone lived through.** "A client opened
  their documents page and one file belonging to another business was listed."
  Not "a missing tenant predicate in the collection query".
- **Give the cause in one plain paragraph.** Cause is the part a non-technical
  reader can genuinely follow, and it is what makes the fix make sense. Never
  skip it because it sounds technical; translate it.
- **Say what the fix means for them**, not what changed in the code.
- **Say how it was checked, honestly**, carrying the source document's wording.
- **For anything client-facing, say whether a real client was affected**, and if
  the documents do not say, say that they do not say.

**Quote a document when it said it better than you can.** A blockquote of an
`## In plain terms` paragraph is often stronger than a paraphrase, and it shows
the reader the project's own voice.

**Use the real numbers and the real quoted strings.** A specific example lands;
a category does not.

---

## 4 · Plain language, non-negotiable

The user asks for this report because jargon failed them. Treat every technical
word as a cost.

- **Translate every term on sight.** The place files are kept, not the
  storage product's name. Signing in, not "the auth flow". The part that saves the data, not
  "the route handler".
- **Never print a status code.** "Refused", "the page showed nothing", "it
  answered with an error naming what was missing".
- **Never print a filename, function name, commit hash or issue id** in the
  body. Dates and plain descriptions carry the same information. Those belong in
  the source documents, which this report points at.
- **Explain a word the first time if you must use it at all.**
- **Analogies earn their place.** One good one per report beats five.
- **No em dashes.** Use a comma, a full stop or a colon.
- **Banned words**, same list the repository uses for pull requests: leverage,
  robust, comprehensive, seamless, utilise, utilize, streamlined, cutting-edge,
  best-in-class. Add: delve, underscore, testament, crucial, pivotal.
- **Run the draft through the `humanizer` skill** before saving.

Check the draft:

```bash
f=docs/reports/<name>.md
grep -c '—' "$f"                                          # expect 0
grep -noiE 'leverage|robust|comprehensive|seamless|utilis|utiliz|streamlin|cutting-edge|best-in-class|delve|underscore|testament|crucial|pivotal' "$f"
grep -noE '\b(40[0-9]|409|500|201|200)\b' "$f"            # status codes leaking in
```

---

## 5 · Carry the honesty rule all the way through

This is the rule that makes the report worth trusting, and it is the easiest one
to lose while writing a flowing narrative.

- **Measured, and never exercised, never share a sentence.** A fix checked
  against a local stand-in has not been checked against the real system. Say
  which.
- **Section 5 must contain a "what has never actually been run" list**, given
  the same weight as the list of what works. A story that only lists wins is a
  sales page.
- **Never upgrade a document's confidence.** If the source says "built, not yet
  tried", the report says the same.
- **A decision is not unfinished work.** Keep the two apart in section 5, and
  name the role that owns each decision, never a person.
- **A tracker row is closed only when its document says so.** Not when the code
  looks right, and not when a task card is ticked.
- **Never state or imply that client data was safe if no document says it was
  checked.** "No document records whether any client saw this" is the honest
  sentence, and it is the one to write.
- If something is genuinely unclear in the sources, leave it out of the report
  and name it in your chat reply.

---

## 6 · Saving it, and what to update afterwards

**Save to `docs/reports/<YYYY-MM-DD>-<name>.md`.** Name it after the thing
(`project-story`, `the-story-so-far`), never after a ticket.

**Never write a `<!-- reported: … -->` tag.** That tag belongs to `plain-report`
and tells it to skip a document. This report is not an update and must not
consume anything from that queue.

Then, in the same sitting:

1. **Add its row to `docs/README.md`**, in the reports table, saying what it
   covers and who it was written for.
2. **Do not build a companion `.html` page.** One-pagers are required for
   `how-it-works/` and `unresolved/`, not for reports. If the user wants one to
   send, say so first and build it as a file, never an Artifact.
3. **Do not change any source document.** This report reads; it does not close
   rows, tick cards or tag anything. If writing it uncovers a fault or a
   contradiction between documents, **tell the user and stop**. Do not quietly
   fix code or documents while writing a report.

In your chat reply: name the reader you wrote for, the date range covered, how
many documents you read, and anything you left out because the sources
disagreed.

---

## Not this skill

| The ask | Use instead |
|---|---|
| A short update on what has been fixed since last time | `plain-report` |
| How one built feature works, in detail | `root-docs`, `how-it-works/` tier |
| A plan for work not yet done | `task-phase` |
| Why one specific thing broke | `root-docs`, `bug-fixed/` tier |
