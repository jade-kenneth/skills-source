# Evidence

Stage 6. Produces: the block that makes a completion claim credible. This is the
canonical definition of the evidence block referenced by the project workflow.

## The principle

**Unverified output is worse than no output.** No output is a known gap. Unverified
output claiming to be done is a gap that stopped being tracked — it consumes the trust
that makes the next claim useful.

"Done" is a claim about observed reality. It is not a synonym for "the change is written",
"it compiles", "the reasoning is sound", or "the agent reported success".

## The two-run rule

The reproduction from stage 2 must be shown **failing before the change and passing
after**, and both runs recorded.

A test that passes after the fix but was never shown failing before it proves only that
the test passes. It does not connect the change to the defect, and it is the single most
common way an unverified fix reaches production wearing a green check.

When the before-run is genuinely impossible to reproduce at closeout — the defect required
production data, a since-corrected record, a since-fixed third-party state — say so
explicitly and name the substitute evidence. Do not present an after-only run as if it
were the pair.

## Required block

Record on the task and in the pull request:

```
## Verification

Defect:     <one line>
Verdict:    <confirmed | not reproducible | works as designed | already resolved
             | different defect | environmental>
Root cause: <the specific condition>

Before:     <command or call>
            <actual output showing the failure>

After:      <same command or call>
            <actual output showing it resolved>

Checks:     <command> — <pass/fail, counts>
            <command> — <pass/fail, counts>

Tenant:     <wrong-tenant case and its result, or "n/a — no tenant-owned path">

Not run:    <check> — <why> — <residual risk>
```

Rules for the block:

- **Paste real output.** Summarized output is a claim about output. Counts, status codes,
  and returned values are the evidence; "tests pass" is not.
- **Never record a check that did not run.** If it could not run, it belongs in `Not run`
  with its reason and the risk that leaves open. An honest gap is acceptable; a fabricated
  pass is not.
- **`Not run` is not a failure.** Blocked checks are normal. Hiding them is the problem.
- **`n/a` requires a reason.** "n/a — no tenant-owned path" is a statement someone can
  check; a bare "n/a" is not.

## Evidence by defect type

Match the evidence to what the defect actually was.

| Defect type | Evidence that counts |
|---|---|
| Logic / calculation | Test red→green with the reported inputs and the expected value |
| API contract | Request and response bodies, status codes, before and after |
| Persistence | Query results showing stored state before and after |
| Authorization | The denied case returning the correct status **and** the allowed case still working |
| Tenant isolation | Wrong-tenant identifier returns not-found; correct tenant still resolves |
| Background job / queue | Log output for a run, plus the resulting state change |
| Webhook | Replayed payload, handler result, and idempotency on redelivery |
| Race / concurrency | Concurrent execution reproducing the interleaving, then not |
| UI behavior | The interaction driven in the real app, with the corrected states |
| Performance | Measurement before and after, same input and conditions |

Two paired cases are worth stating separately because they are so often half-done:
an authorization fix that proves the denial but never re-proves the allowed path has not
been verified, and a tenant fix that proves the wrong tenant is blocked but never
re-proves the correct tenant still works has broken the feature to close the defect.

## Production verification

For a defect only observable in production, or fixed on inference rather than a local
reproduction, closeout includes a post-deploy check:

- The error stops appearing in error tracking for new events after the deploy.
- The affected monitor recovers and stays recovered.
- Log output for the affected path shows the intended behavior.
- Where the defect corrupted records, stored state is confirmed correct going forward —
  and existing bad records are either repaired or explicitly declared out of scope.

Until that check exists, the item is deployed, not verified. Say which one it is.

## Phrases that require the block

Do not write any of these without evidence directly beneath it:

> "Fixed." · "Verified." · "Confirmed working." · "This resolves the issue."
> "Tests pass." · "Should work now." · "The behavior is correct."

If the block cannot be produced, the accurate report is what was changed, what was
observed, what was not checked, and what risk remains.
