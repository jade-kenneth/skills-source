---
name: defect-triage
description: Triage and resolve a reported defect in an existing production system — verify the report is real, reproduce it, find the actual cause, fix it, and prove it is resolved with evidence. Use whenever a user reports a bug, regression, incident, failing behavior, error report, alert, or production issue, or asks to work through a defect backlog. Not for building new features from a specification; use fix-and-enhance for scoped enhancements to working behavior.
---

# Defect Triage

Turn a reported defect into a verified resolution. This skill governs the path from an
uncertain report to proven fix; `fix-and-enhance` governs building or improving behavior
that already works as intended.

## The governing rule

**Every reported defect is a hypothesis, not a fact.**

A report describes what someone observed and what they concluded. The observation is
evidence; the conclusion is a guess. A meaningful share of any backlog is already fixed,
working as designed, misconfigured, a duplicate, or a different bug wearing the reported
symptom's clothes. Changing code before the hypothesis is confirmed produces a fix for a
defect that does not exist, and leaves the real one shipping.

Never skip to implementation because the fix "looks obvious." An obvious fix for an
unconfirmed defect is the most expensive kind of wrong.

## Sequence

Work these in order. Do not start a stage before the one above it has produced its output.

| # | Stage | Output that must exist before moving on |
|---|-------|------------------------------------------|
| 1 | Intake | Severity, blast radius, tenant-risk flag |
| 2 | Reproduce | A reproduction, or a documented failure to reproduce |
| 3 | Classify | One of the six verdicts below |
| 4 | Root cause | The specific line/condition, and why it produces the symptom |
| 5 | Fix | Smallest coherent change at the cause |
| 6 | Prove | Evidence block; failing-before/passing-after demonstrated |
| 7 | Close | Docs and tracker reconciled with the new behavior |

Read `references/intake-and-severity.md` before stage 1, `references/reproduction.md`
before stage 2, `references/classification.md` before stage 3, and
`references/evidence.md` before stage 6.

## The six verdicts

Stage 3 ends by assigning exactly one. Four of them close the item **without a code
change** — reaching one is a successful triage, not a failure.

1. **Confirmed** — reproduced, and the cause is in scope. Proceed to stage 4.
2. **Not reproducible** — cannot be triggered with the reported steps or any reasonable
   variation. Record exactly what was tried and what happened instead; ask for the
   missing precondition. Do not fix speculatively.
3. **Works as designed** — the behavior is intentional and documented. Cite the
   specification or convention that makes it intentional. If the design itself is wrong,
   that is a separate enhancement, not this defect.
4. **Already resolved** — current code no longer contains the defect. Identify the commit
   that fixed it and confirm the reporter's environment predates it.
5. **Different defect** — the symptom is real but the reported cause is wrong. Re-scope
   the item to the actual defect and restart at stage 1 with the corrected framing.
6. **Environmental** — configuration, data, credentials, or infrastructure, not code.
   Name the specific setting and its correct value.

State the verdict explicitly in the handoff. A silent verdict is not a verdict.

## Verification is not optional

A fix is complete when there is evidence that the defect is gone — not when the change
compiles, and not when the reasoning is sound.

**The minimum bar: the reproduction from stage 2 must fail before the change and pass
after it, and both runs must be shown.** A test that never failed against the original
code proves nothing about the defect; it only proves the test passes.

Evidence takes whichever form the defect has: a test transitioning red→green, an endpoint
response, a database query result, a log line, a monitor recovering, a screenshot of the
corrected screen. `references/evidence.md` defines the required block. The project's
generated workflow instructions define where it is recorded.

Never write "verified", "confirmed working", "should now work", or "this fixes it"
without the block. If a check could not be run, say which one and why, and state the
residual risk plainly.

## Regression scope

Before closing, answer in writing:

- **What else calls this?** Trace callers of every changed function. In a large codebase,
  navigate by search and call paths, not by reading everything.
- **What else shares this cause?** The same mistake is rarely made once. Search for the
  pattern; report sibling instances even when they are out of scope for this fix.
- **What did the old behavior protect?** Code that looks wrong sometimes absorbs a
  malformed input or a legacy record shape. Confirm nothing depended on the bug.

## Tenant isolation

In a multi-tenant system, every defect touching a data path carries an isolation
question, and it is a security question rather than a correctness one.

Before closing any defect that changes a query, filter, resolver, service method, or
repository call:

- Confirm the changed path still composes tenant scope with the caller's filter, and that
  scope is never replaced by, or sourced from, client input.
- Cover the wrong-tenant case in the evidence: a valid identifier belonging to another
  tenant must behave as not-found.
- Treat a missing tenant constraint discovered along the way as a **security defect at the
  highest severity**, regardless of the severity of the item you started on. Escalate it
  rather than folding it silently into the current fix.

Consult the project's multi-tenancy reference for the mechanics of how tenant context is
established and threaded in that codebase.

## Parallel work

When several defects are in flight at once:

- One defect per branch and per working tree. Independent agents must not share a tree.
- Before starting, list the files the fix will touch and check them against other active
  work; overlapping surfaces are worked sequentially, not concurrently.
- Never resolve another workstream's conflict on its behalf. Report the collision.
- Re-run validation after any merge or rebase. A green run against pre-merge code is
  stale evidence.

## Closeout

- Report the verdict, the root cause, the change, and the evidence.
- Update documentation whose described behavior the fix changed, in the same body of work.
- Update the tracker only when authorized, using its existing schema, and never mark an
  unvalidated item complete.
- Run the reusable-learning gate: a defect whose cause could recur in another project is a
  candidate for `project-learning-contributor`. A product-specific cause is not.

## Checklist

- [ ] Severity, blast radius, and tenant-risk recorded at intake.
- [ ] Reproduced, or the failure to reproduce documented with what was tried.
- [ ] Exactly one of the six verdicts assigned and stated.
- [ ] Root cause identified as a specific condition, not a plausible area.
- [ ] Fix addresses the cause, not the visible symptom.
- [ ] Reproduction demonstrated failing before and passing after.
- [ ] Evidence block present; unrun checks named with their residual risk.
- [ ] Callers traced and sibling instances of the pattern searched.
- [ ] Tenant scope preserved on every changed data path, wrong-tenant case covered.
- [ ] Documentation and tracker reconciled; learning gate run.
