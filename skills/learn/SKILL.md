---
name: learn
description: Builds teaching material for a general engineering or system-design concept (a load balancer, a message queue, sharding, CQRS, idempotency, a circuit breaker) or a tool the project runs on (its data platform, identity service or host), as a document in docs/learn/TOPIC/ with a runnable lab and four generated diagrams. Always asks first whether the lesson is based on this repo's current implementation (then it audits the code, grades on a fit map where the subject could serve the project's features, and ends with audit task cards) or is a standalone lesson on the topic. Use when the user asks to learn, understand or be taught a concept ("teach me sharding", "what is a circuit breaker and when do I need one", "teach me our data platform and where we could use more of it"). Enforces the four-state provenance rule, the lab every number is measured from, the beginner-first section order and the house-style one-pager. Not for how a feature in this repo works; that is the how-it-works tier of root-docs.
---

# Learn — teaching material for a concept

A fifth tier under root `docs/`, beside the four the root `CLAUDE.md` defines.

The other four tiers all answer a question about **this estate's own code**:
`docs/<repo>/` describes a subsystem here, `bug-fixed/` says why something here
broke, `unresolved/` why something here is still broken, `how-it-works/` how
something built here works. **None of them can answer "what is a load balancer,
and would we want one"** — and that is the question somebody actually asks first.

This tier answers it, and it inherits everything the estate already believes
about documents: generated diagrams, a sendable one-pager, a second-language
*In plain terms* where the project writes one, and above all the refusal to state
something you have not checked.

**Read the `root-docs` skill alongside this one.** It owns the house style, the
one-pager recipe, the diagram mechanics and the supersession rules, and this tier
follows all of them. This skill owns only what is different, and the differences
are real: the subject is not ours, so *how do we know* has a different answer.

---

## 0 · Ask first — repo-anchored or standalone

**Before reading any code, writing a file or picking a topic folder, ask the
user one question** with `AskUserQuestion`:

> Is this learning based on this repo's current implementation, or a standalone
> lesson on the topic?

| Option | Mode | What changes |
|---|---|---|
| **Based on the current implementation** | *repo-anchored* | §4 anchor is mandatory and names real files. The concept is audited against the code, a **fit map** grades where the subject could serve each project feature (§22 in `references/document-format.md`), and the document **ends with a *Task cards* section** (§23): one audit card per gap found, in the current task-card format. |
| **Standalone on the topic** | *standalone* | No repo audit, no fit map and no task cards. §4 and the §11 estate anchor are left out, replaced by one line in the masthead: *Standalone lesson, not checked against this repo.* Everything else (provenance, lab, four diagrams, section order, one-pager) still applies. |

Do not guess the mode from the wording of the request. "Teach me idempotency"
could be either, and the two documents differ in the section that matters most
to the person who asked. If the user already said which (for example "based on
how our app does it"), state the mode you took in one line and skip the
question.

**Write the mode in the masthead**, beside the provenance count:
`repo-anchored · 4 audit cards · 9 fits (2 most likely)` or `standalone`.

### Repo-anchored — the audit

Audit the concept against the code **before** writing §11 onward, because the
findings shape §12 and §14 too. For each thing the concept says a correct
implementation needs, find where the repo does it, or show that it does not:

- **Look at the code, never at memory or an older document.** File and line for
  every finding, and the date it was read. A finding from a probe carries its
  command and output, the same as any `measured` claim.
- **A gap is a card; a match is a ledger row.** Where the repo already does the
  right thing, record it in the provenance ledger and the estate anchor. Only a
  gap, a risk with no mitigation, or an unverified claim becomes a card.
- **An audit that finds nothing still writes the section**, with one line: what
  was checked, on what date, and that no card was needed. An absent section and
  a clean audit must not look the same.
- **Never fix the code while writing the lesson.** The card is the output; the
  fix is a separate change, the same rule the unresolved tier follows for a
  found problem.

### Repo-anchored — the task cards

**Use the current card format, not a new one.** The live source of that format
is the project's unresolved-tier generator,
`docs/unresolved/<topic>/task-cards.build.py`, and the field list in the
`root-docs` skill's `references/task-cards.md` (Subject, Tags, Description,
Steps, Done when, Attachments, Status · Location, Assigned to, Points, Flags,
Before, After, See it for yourself, Good to know, Before pushing to
production), plus any project override in the root `CLAUDE.md`. Read them on
the day; the format moves, and a copy made from memory drifts. A project with no
generator yet starts one from that reference rather than hand-writing cards.

- **One source, both copies.** Copy the unresolved generator to
  `docs/learn/<topic>/task-cards.build.py` and adapt only what is path-bound:
  `HERE`, the document stems in `CARDS`, the tracker-row counts. Keep the
  sentinels (`task-cards:begin` / `task-cards:end`), the CSS block, the
  assertions, `BUILD_AND_START`, `ENV_VARS` and `PUSH_CHECKLIST`. Never
  hand-edit a card in the `.md` or `.html`.
- **Prefix audit card ids with `A-`** (`A-1`, `A-2`) so they can never collide
  with the unresolved tier's letters.
- **Tag every card `audit`**, plus the usual labels (`security`,
  `code change`, `settings only`, `needs a decision`, …).
- **Before** is what the audit saw, with the file, line and date. **After**
  stays the dashed placeholder until every step is done and checked, the same
  as any open card; the generator refuses otherwise.
- **The last step names the observation** that closes it (a browser, a test
  client, credentials) whenever *Done when* needs one.
- **Attachments** point at the lesson section that explains the gap, plus the
  files the fix touches.
- **Card text for a beginner, then the `humanizer` pass.** No em dashes, no
  filler. The lesson above the cards keeps the technical reasoning.
- If a card is really a live fault that belongs on the board, say so to the
  user. It may also deserve its own `unresolved/` document; the lesson's card
  is not a substitute for one.

Then run the generator and rebuild the reading assistant, and render one card
and look at it (the points table has overflowed before).

### Repo-anchored — the fit map

The audit asks whether the project does the subject right. **The fit map asks
where the subject should be doing work in this project, and how sure you are.**
It matters most for something the project already runs: the project uses a
slice of it, and nobody has mapped what the rest could carry. Full method,
statuses and failure modes: `references/fit-map.md`.

- **Inventory first.** List the project's objective and features from the root
  `CLAUDE.md`, the architecture and schema documents, `how-it-works/`,
  `unresolved/` and its cards, `docs/tasks/`, the code and `git log --all`,
  read on the day. Start from the project's needs, never from the product's
  feature list.
- **One row per feature and capability that meet, graded on one scale:**

  | Status | Means |
  |---|---|
  | **in use** | Already doing this job here (file, line, date) |
  | **most likely** | A written-down need, a capability available at the version in use, no invariant touched. Two sources |
  | **likely** | Fits a real feature, with exactly one thing unconfirmed (the need, or the version, plan or module) |
  | **possible** | Fits technically; no present need, or waits on a later decision |
  | **unlikely** | A cheaper answer already exists, or the cost outweighs the gain |
  | **ruled out** | Collides with an invariant, a deliberate absence or a recorded decision, named |

- **The status is a judgement, and it says what it rests on.** The claims
  beneath it still carry provenance tags and go in the ledger.
- **A fit is not a gap.** A `most likely` fit that answers an existing card names
  that card. One with no card goes to the user as a suggestion, and becomes an
  `A-` card (tagged `suggestion`, `needs a decision`) only if they ask.
- **Never build a fit while writing the lesson**, the same rule as the audit.

---

## 1 · Where it goes

```
docs/learn/<topic>/<concept>.md          the source of truth
docs/learn/<topic>/<concept>.html        the sendable one-pager
docs/learn/<topic>/<concept>-*.build.py  four generators
docs/learn/<topic>/lab/                  the runnable demonstration
docs/learn/<topic>/task-cards.build.py   audit cards, repo-anchored mode only (§0)
```

**Grouped by topic, like `unresolved/` and `how-it-works/`** — and topics here are
broad families of concept, not one folder per concept: `traffic/`, `data/`,
`messaging/`, `resilience/`, `delivery/`, `identity/`. A folder per concept is a
flat list with extra steps, and it destroys the one thing the grouping buys you —
**the siblings in a folder are the related concepts**, which is half of what a
learner needs and the section they never get.

**Name the file after the concept as a learner would say it**, not as a
specification would: `load-balancer.md`, not `traffic-distribution-layer.md`.

**When the subject is a product, not a pattern** (the project's data platform,
its identity service, its host), it goes in the family of the job it does here:
a data platform in `data/`, an identity service in `identity/`. Name the file
after the product. Three things shift:

- **§11's three named implementations** become the product and two alternatives
  that do the same job, so the design decisions still show.
- **The lab models the mechanism the product implements** with zero
  dependencies. Read-only probes against the project's real instance count as
  `measured` only when credentials exist; without them, say so, and the claim is
  `documented` at the version the project runs. A lab never writes to the real
  instance.
- **The fit map (§0) is the section the reader came for**, because the project
  already runs the product and only uses part of it.

**Everything for one concept lives in that folder together**, the lab included.

---

## 2 · The rule that defines the tier — provenance

`how-it-works/` asks *how do we know this runs*. Here the subject is not our
code, so the question becomes **where does this claim come from**, and a
teaching document is exactly where an unsourced claim does the most damage: the
reader has no way to catch it and will repeat it in a meeting.

**Every load-bearing claim carries one of four states, and they are never
blurred.** Full rule, the counting, and the banned phrases:
`references/provenance.md`.

| State | Means | Minimum you must write |
|---|---|---|
| **measured** | a command was run and produced this number | the command, the pasted output, the date |
| **documented** | a named tool at a named version behaves this way | tool, version, directive or API, and its default |
| **rule of thumb** | common practice, no number behind it | the words *rule of thumb*, and what would make it false |
| **depends** | genuinely varies by workload | what it depends on, and what to measure to find out |

**Count them in the masthead** — `23 of 31 claims measured` — the same way
`how-it-works/` counts measured stages. A teaching document whose every sentence
reads as established fact is the specific failure this tier exists to prevent,
and it is easy to commit because confident prose is what teaching sounds like.

---

## 3 · The lab is not optional

**Every learn document has a runnable lab beside it**, and the document's
measured numbers come from it. `references/lab.md` has the shape and the
constraints.

Without one, a learn document degrades into recitation within a paragraph — the
author reaches for a number they half-remember, and there is nothing to stop
them. The lab is what makes `measured` available at all, and it is what lets a
beginner stop believing the page and go and look.

Three constraints that are not negotiable:

- **Zero dependencies and one command.** It runs with what is already on the
  machine. No install step, no network fetch.
- **It runs the counterfactual too.** The *without* column of the comparison
  diagram needs measured cells as much as the *with* column does.
- **It never touches the estate's running stack.** Probes against real
  containers are read-only; anything that mutates runs against the lab's own
  processes on high ports.

---

## 4 · Anchor it in this estate

**Repo-anchored mode only** (§0). In standalone mode leave the anchor out and
say so in the masthead instead of implying one.

**A learn document that could have been written about anybody's system teaches
half as well.** Somewhere in the first third, the concept has to touch code the
reader can actually open.

There are two ways to anchor, and the second is the stronger one:

- **We use it** — name the file, the directive, the config. The reader goes and
  reads it.
- **We do not use it, and that is measurable** — which is the better lesson,
  because it turns an abstract pattern into a live question about their own
  stack. One estate's proxy loaded **9 `server` blocks, 3 `proxy_pass`
  directives and 0 `upstream` blocks** (`nginx -T`, run read-only inside its
  proxy container, 22 Sep 2026): there was a reverse proxy and no load balancer,
  which is the most useful first sentence a load-balancer document could have.
  Measure your own; that count is an illustration, not a fact about your stack.

Say which of the two it is, in the masthead, and never imply the estate uses
something it does not.

---

## 5 · Four diagrams, because the user is asking four questions

One generator per question — the estate's rule — and for this tier the questions
are fixed. Layout models, assertions and the two new shapes:
`references/diagrams.md`.

| Generator | Answers |
|---|---|
| `<concept>-map.build.py` | **How does it actually work?** The whole path, lanes per participant, every stage carrying its provenance colour. |
| `<concept>-without.build.py` | **What happens if I do not use it?** A paired track: the same event without the pattern, beside the same event with it, row for row. |
| `<concept>-risks.build.py` | **What does adopting it break?** A consequence tree of the failure modes you *buy*, each with its trigger, blast radius and whether a standard mitigation exists. |
| `<concept>-neighbours.build.py` | **What does it work with?** Four bands around the concept: works with · depends on · competes with · is confused with. |

Plus the rule that makes the explanation itself visual:

> **No mechanism ships without a picture.** Every `###` in *How it works* either
> names the region of the map that draws it — by box label, so the reader can
> find it — or carries its own small generated figure. State which, per
> mechanism. A mechanism with neither is not finished.

All four share **one animation toggle** through a single `localStorage` key, as
the house style requires.

---

## 6 · Section order — beginner-first, and it is not the `how-it-works/` order

The full spec is `references/document-format.md`. The order matters more here
than in any other tier, because a learner reading in document order is the only
reader this tier has.

**One deliberate conflict with the root `CLAUDE.md`, stated rather than
smuggled:** the *In plain terms* analogy sits at §6, early, not at §11. In
`how-it-works/` the analogy serves a reviewer who has already read the
mechanism; here it is the scaffold the mechanism hangs on, and a beginner who
meets the code first has nothing to attach it to. Everything else about the
analogy — one analogy only, a second-language twin paragraph for paragraph where
the project writes one, the **How that fixes it:** clause — is unchanged, and the
`root-docs` skill's `references/plain-terms.md` still governs it.

---

## 7 · Finishing checklist

- [ ] Document in `docs/learn/<topic>/`, topic folder created if new.
- [ ] **Lab runs**, one command, zero dependencies, cleans up after itself.
- [ ] **Every number in the document was pasted from a run**, not recalled.
- [ ] **Provenance ledger complete**, and the masthead count matches it.
- [ ] **No banned phrase survives** — `references/provenance.md` has the list and
      the grep.
- [ ] **Four diagrams generated**, assertions passing, each **rasterised and
      looked at** (`qlmanage -t -s 1500 -o <dir> <file>.svg`).
- [ ] **Every mechanism has a picture**, and the prose says which.
- [ ] **One-pager built** to the house style — copy the closest existing page,
      never design a second. `root-docs` → `references/one-pager.md`, plus this
      skill's `references/one-pager.md` for the deltas.
- [ ] **Mode asked and written in the masthead** (§0): repo-anchored or
      standalone.
- [ ] Repo-anchored: **estate anchor present**, honest about whether we use the
      thing, and every finding carries file, line and date.
- [ ] Repo-anchored: **fit map present** (document §22), built from a feature inventory
      read on the day, `in use` rows first, every row graded on the six-status
      scale with its evidence, every `ruled out` row naming its rule, and the
      fit count in the masthead.
- [ ] Repo-anchored: **the reply to the user names** the `most likely` fits and
      any `ruled out` row worth revisiting.
- [ ] Repo-anchored: **Task cards section at the bottom** (document §23), generated by
      `docs/learn/<topic>/task-cards.build.py` in the current card format, one
      `A-` card per gap, or a one-line clean-audit note. Generator re-run.
- [ ] Standalone: no estate anchor, no fit map, no task cards, and the masthead says
      *standalone*.
- [ ] **Doc-assistant rebuilt across every HTML page**, `--check` clean:
      ```bash
      python3 docs/tools/doc-assistant/build.py
      python3 docs/tools/doc-assistant/build.py --check   # must say 0 pages would change
      ```
      `build.py` has no per-tier setting: it indexes every `.html` under
      `docs/` (`rglob`), so a new `docs/learn/` page is picked up by the
      rebuild alone. *(Corrected 2026-09-22: an earlier line here named a
      `KINDS` map that does not exist.)*
- [ ] **Registered** — a row in the `learn` table in `docs/README.md`, a new
      `###` section for a new topic folder, and the `## learn` section itself if
      this is the first one.
- [ ] Nothing committed, in this repo or a sibling, names a `docs/` path.

---

## 8 · Writing for the reader this tier actually has

`root-docs` asks you to write for somebody **competent and unfamiliar**. Here the
reader is **capable and new** — they can read code, and they do not yet know the
vocabulary, the failure modes, or which parts of what they have read online are
true. Three habits, and the third is the one that gets dropped:

- **Define before use, and prefer the concrete definition.** *"A pool is the list
  of backends one rule can send to — here, three Node processes on ports
  19081–19083"* teaches. *"A pool is an abstraction over backend instances"* does
  not.
- **Never teach the happy path alone.** Every mechanism says what it does *and*
  what it deliberately does not do. A beginner who learns only the happy path has
  learned the thing that will hurt them.
- **Say what this document will not teach you.** Put it in the state strip, not a
  footnote. A teaching document that implies completeness is worse than a short
  one that names its edges, because the reader cannot tell where to keep reading.

Everything else — one cast throughout, real identifiers, `Why this matters`
blocks leading with the consequence, commenting every command for what it is
*for* — carries over from `root-docs` unchanged.

---

## 9 · Own it — self-awareness and the ownership mindset

A tutor explains the subject. **An owner explains the subject and then asks what
it means for the project they answer for.** In repo-anchored mode the lesson is
written from the second stance, and the fit map (§0) is where that shows.
`references/fit-map.md` has the full version. The short one:

- **Self-aware about the project.** Know its objective, features, invariants,
  deliberate absences, open cards and pending decisions before suggesting
  anything, and know what it already uses of the subject. Suggesting what the
  project already does, or what it has decided against, shows nobody looked.
- **Self-aware about yourself.** A grade is a judgement. Say what it rests on,
  what you could not check (the running version, the plan, what the project's
  credentials may do), and what would change it. This half applies in
  standalone mode too, through the provenance rule.
- **Owning the outcome.** Surface the fits unprompted and ranked; give every
  `most likely` row a next step and the role that decides; say no as readily as
  yes; point at the card that already owns a need rather than opening another.
- **Owning the limits.** A recorded decision is not yours to overturn in a
  lesson. Grade the fit `ruled out`, name the rule, and if you think it deserves
  another look, raise it with the user as its own question.
- **Close the loop in the reply.** Tell the user the `most likely` fits, any
  `ruled out` row worth revisiting, and any card that turned out to be a live
  fault.

---

## 10 · Reference index

| Reference | What it carries |
|---|---|
| `references/document-format.md` | The section order, what goes in each, and which may be short but not skipped. |
| `references/provenance.md` | The four states, the masthead count, the ledger, the banned phrases and the grep that finds them. |
| `references/diagrams.md` | The four generators — layout models, the inherited assertions and the new ones the two new shapes need. |
| `references/lab.md` | The runnable lab: shape, constraints, how its output reaches the document, and what a lab may never do. |
| `references/fit-map.md` | Repo-anchored only: the ownership stance, the feature inventory, the six fit statuses and their grading rules, the table shape, and the ways a fit map goes wrong. |
| `references/one-pager.md` | Only the deltas from the estate house style. The house style itself is `root-docs` → `references/one-pager.md`. |
| `references/worked-example.md` | One concept — the load balancer — with every rule above applied, so the abstract spec has something to be checked against. |
