# Task cards — the bottom of every `unresolved/` document

**Every `unresolved/` document ends with a *Task cards* section**, in both the
`.md` and its same-basename `.html`. There is **one card per row of the
document's resolution tracker**, laid out like a user story on a team board
(Taiga, Jira, Linear) so it can be copied onto the board as-is.

The sections above the cards keep the precise technical reasoning. The cards are
for the person who picks the work up, and they don't repeat that reasoning.

Where the project's `CLAUDE.md` adds or renames a field, it wins; the rest of
this reference still applies.

## The fields

| Field | What goes in it |
|---|---|
| Subject | One plain sentence saying what gets done, 80 characters at most |
| Tags | Short labels: `security`, `before launch`, `code change`, `settings only`, `testing`, `needs a decision` (a lesson's audit cards add `audit`) |
| Description | What is wrong and what the fix does, for a reader new to the project |
| Steps | A checklist, in order, headed *n of m done*. Ticked per step through `done_steps` while the card is open |
| Done when | One sentence someone can check |
| Attachments | The source document section plus the files the task touches |
| Status · Location | `New` · `at the bottom`, until the board says otherwise |
| Assigned to | The role from the tracker row, never a person's name |
| Points | UX · Design · Front · Back · total, labelled as a first planning guess |
| Flags | Due date, team requirement, client requirement, and **blocked, with the reason** |
| Before | What happened before the fix, in plain words, with the date it was seen. Always filled in |
| After | What happens now. **Filled in only when every step is done and checked**; until then the card shows a dashed placeholder, and the generator refuses an *after* on an open card |
| See it for yourself | *You need* (access, tools, time), numbered steps a beginner can follow (where to click, which page or file, what to type), and *You should see* |
| Good to know | The crucial facts: what a term means, what is deliberately left alone, and what has **not yet been seen** |
| Before pushing to production | **Stop** (a must-fix that blocks the push, shown in red), the **environment variables** to add or change and where, what the card **depends on** (other cards, untracked files, accounts), and **heads-ups** that would surprise someone after deploying |

## Write card text for a beginner

Use plain words, and give a short explanation the first time a technical term
can't be avoided (for example: "a cookie, a small 'you're signed in' pass"). Run
the text through the `humanizer` skill where it is installed: no em dashes, no
filler, no inflated wording.

### *See it for yourself*

Assume the reader has never opened a terminal. Say where things are ("In VS Code,
use the menu View, then Terminal"), which page or file to open, and exactly what
to type. Explain every tool the first time (`curl`, `grep`, developer tools), and
what a status code means in words (404 is "not found").

**Run the steps yourself before writing *You should see*,** and write only what
you saw. Anything that needs credentials you don't have goes into *You should
see* or *Good to know* as **not yet seen**. Keep a shared opening (install, build
and start the app) once in the generator as `BUILD_AND_START`. If a port is
taken, the steps tell the reader to pick another number. Don't stop a server you
didn't start.

### *Before* and *After*

*Before* comes from the document's evidence table, with its date. *After* says
what changed in terms the reader can notice, then how it was confirmed: measured
(with the date), or confirmed by reading the code and tests only. **Never write
an *After* from the code diff alone without saying so.**

### *Before pushing to production*

Work it out from the code, not from memory: `grep -rn process.env` across the
source for every variable read, `git status` for untracked files a push would
miss, and every place the change reaches outside the app (embedded frames,
external scripts, mail links, identity-provider and database settings). Say
plainly when a card adds no variables.

Settings changed in an external console (identity provider, database, CDN) take
effect immediately and are **not** undone by a code rollback, so say so on those
cards. A change to a hosting environment variable needs a redeploy.

Above the cards, a *Before any push to production* section holds the full
variable table (`ENV_VARS`) and the shared checklist (`PUSH_CHECKLIST`). Update
both whenever a variable is added, removed or changes meaning, and re-check any
file counts in the checklist against `git status` on the day.

**A found problem becomes a `stop`, not a footnote.** If checking a card turns
up something that would break production, put it in that card's `stop`, add it
to the card's *Last checked* evidence, and tell the user. Don't quietly fix the
code while writing documentation; that's a separate change.

## One source, both copies

The cards live in `docs/unresolved/<topic>/task-cards.build.py`, which writes
them between `task-cards:begin` / `task-cards:end` sentinels in both the `.md`
and the `.html`, adds the page's nav entry, and adds the card CSS (tokens only,
no literal colours). **Never hand-edit a card in the `.md` or `.html`;** change
the generator and re-run it, then rebuild the reading assistant.

A generator typically carries:

| Name | What it holds |
|---|---|
| `CARDS` | One entry per document, one card per tracker row, with every field above |
| `evidence` + `CHECKED_ON` | The *Last checked* line on every card; the generator asserts it is present |
| `done_steps` | 1-based step numbers ticked on an **open** card |
| `BUILD_AND_START`, `ENV_VARS`, `PUSH_CHECKLIST` | The shared blocks described above |

Its assertions refuse an *After* on an open card, a card without *Last checked*,
a `done_steps` number that names no real step, and `done_steps` on a complete
card.

**A new unresolved document means a new `CARDS` entry in the same sitting**, and
closing a tracker row means updating that card's status.

```bash
python3 docs/unresolved/<topic>/task-cards.build.py
python3 docs/tools/doc-assistant/build.py && python3 docs/tools/doc-assistant/build.py --check
```

Then render one card and look at it. Tables styled with a `min-width` can run
past the card edge, and no assertion catches that.

## Checking whether a card is done

When asked to check the cards, **look at the code and the records for each
card**, never at the card's own status. Update the card's `evidence` and
`CHECKED_ON` in the generator, re-run it, and rebuild the assistant.

- **A card moves off `New` only when its *Done when* line has been observed**,
  not when code merely exists. A card whose last step needs credentials stays
  open, with that step named as not yet observed.
- **Tick steps one by one on an open card** through `done_steps`. A complete card
  ticks every step and carries no `done_steps`.
- **The steps must include the observation.** If *Done when* needs a test
  account, a browser or credentials, the last step says so. Otherwise a card can
  read *7 of 7 done* while it is still `New`.
- **A step whose result is wrong stays unticked**, even when code exists for it.
- **Check `git log --all` as well.** Work may have landed on a branch that isn't
  checked out; then the card says where it is, not that it's done.

When a `docs/tasks/` plan feeds the cards, tick its steps in the same sitting,
give each ticked or deliberately open step a one-line `>` note saying what shows
it, and update the plan's *Progress* count (see the `task-phase` skill).

A project may keep a **card → check** table in its `CLAUDE.md`: each card's
*Done when* beside the command or observation that proves it. Keep it current
when a card changes.
