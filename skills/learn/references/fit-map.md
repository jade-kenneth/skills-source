# The fit map — where the subject could work in this project

**Repo-anchored mode only** (SKILL.md §0). A standalone lesson has no project to
fit into, and says so in its masthead.

The audit asks *does our code do this right?* The fit map asks the next
question, the one the person who owns the project asks once they understand the
subject: **where in this project should it be doing work, where should it not,
and how sure am I?**

The sharpest case is a lesson on something the project **already runs**, such as a
data platform it stores its records in, the identity service in front of it, or
the host it deploys to. The project uses a slice of it, the slice was chosen
when the first feature needed it, and nobody has since mapped what the rest could
carry. A lesson that teaches the whole product and never asks that has taught
the reader a brochure.

---

## The stance: self-aware, and owning it

The fit map is written from a stance, not a template. Two halves, and a map
missing either one reads the same on the page. That is why they are written
down here.

### Self-awareness

Know three things before grading anything, and show that you know them.

1. **Know the project.** Its objective, its features, its non-negotiable rules,
   what it deliberately does not have, its open cards and task plans, and the
   decisions still pending. Read them on the day; the sources are in Step 1.
2. **Know what the project already uses of the subject.** The `in use` rows come
   first in the map. Suggesting something the project already does is the
   loudest sign that nobody looked.
3. **Know your own limits.** A grade is a judgement, not a measurement. Every row
   says what it rests on, what could not be checked (the version actually
   running, the plan or licence, which modules are enabled, what the project's
   credentials may do), and what would change the grade. The provenance rule
   still governs every claim underneath a grade.

### Ownership

Write as the person who answers for the project's outcome, not as a tutor
listing features.

- **Surface fits unprompted, ranked.** The reader asked to learn the subject.
  The owner also tells them where it matters here, before they ask.
- **Start from the project's needs, not the product's feature list.** A
  capability with no feature to serve is not a fit, however impressive it is.
- **Say no as readily as yes.** `unlikely` and `ruled out` rows belong in the map.
  An author who only ever suggests adoption is a salesperson, and the reader
  learns to discount the whole map.
- **Respect recorded decisions.** When a fit collides with a rule or a deliberate
  absence, grade it `ruled out` and name the rule. If you think the decision
  deserves another look, raise it with the user as a separate question. Never
  raise the grade to argue the point.
- **Know the board.** When a fit answers a need already on a card or in a task
  plan, point at that card. Opening a parallel one splits the history of the
  same problem.
- **Follow through.** Every `most likely` row ends in a next step and names the
  role that decides. A suggestion with no next step is an observation.
- **Do not build it.** The map is the output. No code, no setting changed, no
  field or collection created "to check it works" while writing the lesson.
  That is a separate change, the same rule the audit follows.

---

## Step 1 · The feature inventory

Before grading anything, list what the project is for and what it does, from
sources read on the day:

| Source | What it gives |
|---|---|
| Root `CLAUDE.md` / `AGENTS.md` | The objective, the invariants, what the project deliberately does not have, recorded gaps |
| Architecture and schema documents | Boundaries, the data model, recorded trade-offs, activation steps |
| `docs/how-it-works/` | Features that are built, and how far each has been measured |
| `docs/unresolved/`, their task cards, `docs/tasks/` | Needs that are recorded and not met; decisions still pending |
| The code: pages, routes, API handlers, libraries | The features as they actually exist, which beats any document |
| `git log --all` | Work in flight on branches that are not checked out |

Put the inventory in the lesson as a short table: **feature · where it lives ·
state** (built · planned · decision pending · deliberately absent). Cover the
whole project, not only the parts that already touch the subject. The best fit
is often a feature that does not use the subject yet.

## Step 2 · The capability list

The subject's capabilities, **each at the version the project actually runs**:
the tool, the version, and the feature by name, tagged `documented` as the
provenance rule requires. Where the running version, plan or enabled modules
cannot be read without credentials, say so once. Every row resting on that
unknown is capped at `likely` (see the grading rules).

## Step 3 · Match and grade

One row for each feature and capability that plausibly meet. Six statuses, in
this order, never blurred:

| Status | Means | The minimum you must write |
|---|---|---|
| **in use** | The project already uses this capability for this feature | File and line, and the date it was read |
| **most likely** | A need that is written down somewhere, answered directly by a capability available at the version in use, and touching no invariant | The need's source (document section, card id, or code), the capability's documented source, and the rules checked |
| **likely** | A real feature it fits, with exactly one thing unconfirmed: either the need is inferred rather than written down, or the capability is not confirmed on the version, plan or modules actually running | The fit, and the one check that would move it to `most likely` |
| **possible** | Fits technically, but there is no present need, or it waits on a later-phase decision | What would have to change for it to become `likely` |
| **unlikely** | Fits on paper, but the project already has a cheaper answer, or the cost outweighs the gain | The cheaper answer, or the cost |
| **ruled out** | Collides with an invariant, a deliberate absence, or a recorded decision | The rule, named as the project names it |

### Grading rules

- **`most likely` needs two sources:** the need and the capability. With one,
  the row is `likely` at best.
- **An unconfirmed version, plan or module caps the row at `likely`** until
  someone confirms it. Say what confirming it takes: the access, the page, the
  command.
- **Grade on evidence, never on enthusiasm.** "Perfect fit", "obviously",
  "a no-brainer" and "game-changer" are banned in the map. The status says it.
- **The status is a judgement, not a provenance state.** The claims beneath it
  (the capability exists at version X; the need is recorded at Y) carry their own
  provenance tags and go in the ledger like any other claim.
- **Name everything the fit would add:** a field, a collection, an environment
  variable, a setting, a permission. If the project has a rule about the order
  those land in (for example, a schema document before the code that names a
  field), the next step follows that order.
- **A fit map is dated.** When a decision lands or a card closes, rows move.
  Record each move in *Changes so far*.

## Step 4 · The table, and the notes under it

```markdown
| # | Capability | Feature it serves | Status | Why (evidence) | Cost / what it touches | Next step · who decides |
|---|---|---|---|---|---|---|
```

Order the rows by status (`in use` first, `ruled out` last), then by feature.
Under the table, write a short paragraph for:

- **Each `most likely` row:** what it would replace or add, what it costs, what
  goes wrong if it is done badly, and the first step.
- **Each `ruled out` row:** the rule, why it still holds, and whether revisiting
  it is a live question. If it is, you raised it with the user; say so.

## Where the map feeds

- **A `most likely` fit that answers a need on an existing card:** name the card
  in the row and add no new card.
- **A `most likely` fit with no card** is a suggestion, not a defect. It
  becomes an `A-` card only when the user asks for one, tagged `audit`,
  `suggestion` and `needs a decision`. Otherwise it goes to the user in the
  reply, and to the `task-phase` skill if they want a plan.
- **A gap is not a fit.** An audit gap is where the project falls short of the
  subject it already uses; a fit is where the subject could serve the project.
  One finding can be both. Say so once, in each place.
- **Count it in the masthead:**
  `repo-anchored · 3 audit cards · 9 fits (2 most likely, 1 ruled out)`.
- **Tell the user in the reply:** the `most likely` fits, and any `ruled out` row
  that looks like a decision worth revisiting.

## What gets it wrong

| Failure | What it looks like | The fix |
|---|---|---|
| The brochure | A row for every product feature, most of them `possible`, none tied to a real need | Start from the inventory, not the feature list |
| The echo | Suggesting what the project already does | Write the `in use` rows first |
| The override | Grading something the project deliberately does not have as `likely` | `ruled out`, the rule named, the question raised separately |
| The silent upgrade | Grading on the product's latest version when the project runs an older or unknown one | Cap it at `likely` and say what would confirm it |
| The empty no | `ruled out` or `unlikely` with no rule or cost named | Name the rule or the cheaper answer |
| The drive-by build | Creating the field, automation or setting "to see if it works" | The map is the output; the build is a separate change |

---

## Illustration: the shape only

A lesson on a headless data platform the project already stores its records in
(a headless CMS or backend-as-a-service, say). **The rows show the shape of a map, not findings.** File and line
references are `‹…›` placeholders, and every grade must be derived on the day
from the real inventory.

| # | Capability | Feature it serves | Status | Why (evidence) | Cost / what it touches | Next step · who decides |
|---|---|---|---|---|---|---|
| 1 | Items API with filters | Every client-scoped read | in use | `‹lib file:line›`, read `‹date›` | Nothing new | None |
| 2 | Event-triggered automation | Tell a client by email when new work is published | most likely | A schema document describes exactly this notification (`‹doc section›`); the automation feature is `documented` at `‹version›` | New tracking fields for idempotent retries; the order rule for fields applies | Confirm the running version · project lead |
| 3 | Row-level permission policies | A second isolation layer under the app's own client filter | ruled out *for now* | The project records the policy as deliberately unassigned until it is tested with a non-admin account (`‹doc section›`) | Changes what the app's token can read | An open card owns this; the question went to the user |
| 4 | Built-in dashboards | Monthly reporting for clients | unlikely | Clients never see the platform's admin app; the project's own page is the cheaper answer | A second place to maintain every chart | None |

Four rows, four statuses. Row 3 is the one that shows the stance: the
capability fits, the project decided against it for now, and the map says so
rather than arguing with the decision.
