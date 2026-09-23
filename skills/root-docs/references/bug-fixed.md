# `docs/bug-fixed/` — a bug that was fixed

**Write one for every bug you fix, without being asked.** Fixing a bug and saying
so in chat leaves nothing behind: the next person meets the same symptom and
repeats the whole diagnosis. The document is part of finishing the fix.

## Where it goes

- `docs/bug-fixed/`, flat in a single repository. In a multi-repo estate,
  `docs/bug-fixed/<repo>/`, where `<repo>` is the checkout directory of the repo
  you **changed to fix it**. Create the folder if it does not exist.
- A fix that needed no code change — a stopped container, a stale cache — belongs
  to the repo that owns the thing you restarted or cleared.
- Spanned repos: one document under the repo you edited, the rest in `**Related:**`.
- Two genuinely separate bugs in two repos in one session: two documents,
  cross-linked.
- **Name it after the failure, not the ticket** —
  `search-endpoint-502-api-container-down.md`, not `bug-1234.md`.

## Sections, in this order

Skip any that has nothing to say. Keep it scannable — someone meeting the symptom
again should recognise it within a screen.

1. **Title** — the failure in plain words, and where it was seen.
2. **Related** — other repos the fix touched, the `unresolved/` document it closes,
   the feature document it belongs to.
3. **Fixed / Where** — two bold lines: the date, branch and kind of change; and
   which environments carried the fault, **stating explicitly which did not**.
4. **Symptom** — bullets, in the order a person meets them. Include **what looked
   healthy**, because that is what made it hard to see.
5. **Cause** — bullets, one link in the chain each, ending at the symptom. Number
   them ①②③ when there was more than one fault in a row, and **say which hid
   which**. Where a layer swallowed the error by design, say so and say why that
   design is defensible — the resilience is usually not the bug.
6. **The fix** — the actual diff, command or config change, copy-pasteable. If
   applying it needs a specific step (`up -d` rather than `restart`, a cache to
   clear), say that here. Where a change looks risky and is not, prove it with the
   file and line that makes it safe.
7. **Evidence** — a table of measured before/after facts from the real run. Never
   recalled, never assumed. With staged causes, **one column per stage**, so a
   reader can see which change moved which number.
8. **Current behaviour — why it failed** — the numbered call trace as it ran
   *before* the fix, **✗** on the step that broke, and a closing italic line
   separating the one real failure from its consequences. This is what stops the
   next person fixing a symptom.
9. **In plain terms** — required whenever the cause crossed a service boundary or
   more than one fault stacked up; skip for a self-contained one-liner. Full rule
   in `plain-terms.md`. **Reuse the analogy from the related document** rather than
   inventing a second for the same subsystem.
10. **Verify after the change** — a copy-pasteable command and its expected output,
    plus **a second command that checks the fix is not merely being masked** (a
    cache still warm, a layer still failing open).
11. **Preventing the next one** — the transferable lesson as bullets, stated
    generally enough to apply to the next case rather than only to this one. Name a
    design question the fix deliberately left open instead of implying it is settled.

## Then

- Add a row to the `bug-fixed` table in `docs/README.md`, and a section for a repo
  folder that is new.
- **If the bug had an `unresolved/` document, that document moves.** Do not leave a
  fixed problem described as open — it becomes this document, and its row moves
  from the `unresolved` table to the `bug-fixed` table. Do not leave a copy behind.
  The full four-step procedure is in `unresolved.md`.
- A document here worth **sending** to somebody gets the same HTML one-pager recipe
  as the other tiers — see `one-pager.md`. Nothing else in the repository needs one.
