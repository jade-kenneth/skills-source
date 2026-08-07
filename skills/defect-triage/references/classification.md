# Classification and Root Cause

Stages 3 and 4. Produces: one verdict, and — when confirmed — a named cause.

## Assigning the verdict

Exactly one of the six applies. Assign it from what reproduction actually showed, not
from what the report claimed.

### Confirmed
Reproduced against current code, and the cause is in scope. The only verdict that
proceeds to a fix.

### Not reproducible
Cannot be triggered with the reported steps or any reasonable variation of role, tenant,
data shape, timing, or environment. Requires the structured record from
`reproduction.md`. Ask for the missing precondition; do not fix speculatively.

### Works as designed
The behavior is intentional. Cite the specification, convention, or code comment that
makes it intentional — an assertion that it is intended is not a citation. If the design
is itself wrong, say so and route it as an enhancement; do not redesign under a defect
ticket.

### Already resolved
The current code no longer contains the defect. Name the commit that fixed it and confirm
the reporter's environment predates it. Common with stale backlogs — check this early,
because it costs one search and can close an item outright.

### Different defect
The symptom is real, the reported cause is wrong. This is the most valuable verdict and
the one lost by fixing what the report prescribed. Re-scope to the actual defect and
restart at intake with the corrected framing and its own severity.

### Environmental
Configuration, data, credentials, or infrastructure — not code. Name the specific setting
and its correct value. If the code should have failed more loudly instead of degrading
silently, that is a separate, usually worthwhile, defect.

## Root cause

Applies only to **Confirmed**. Produces the specific condition, not a region of code.

### The bar

A root cause names the line or condition, and explains the mechanism that turns it into
the observed symptom. If the explanation does not survive "why does that produce *this*
symptom?", it is not the cause yet.

| Not a root cause | A root cause |
|---|---|
| "The service has a bug" | "`findRecord` composes the filter with `Object.assign`, so a caller-supplied `id` overwrites the scope added a line earlier" |
| "Race condition somewhere" | "Two concurrent callbacks both read status `PENDING` before either writes, so the second overwrites the first's terminal status" |
| "Wrong data returned" | "The list query omits `isActive`, so deactivated records are returned to a caller that assumes the filter applied" |

### Method

1. **Start where reality diverges from intent.** Trace forward from a known-good input
   until a value first becomes wrong. That boundary contains the cause.
2. **Read the code, not the documentation.** Documentation drifts. Use it to navigate
   quickly, then confirm in the implementation — the code is the only source of truth
   about current behavior.
3. **Check the boundaries first.** Most defects live at layer edges: serialization,
   validation, filter composition, null and undefined handling, type coercion, cache
   keys, transaction limits, retry paths.
4. **Ask why the code was written that way.** Check history. A line that looks wrong
   sometimes absorbs a case you have not thought of, and removing it fixes one defect
   while opening another.
5. **Distinguish trigger from cause.** The input that exposes the defect is not the
   defect. Fixing the trigger — rejecting that input, special-casing that record — leaves
   the cause shipping under every other trigger.

### Symptom fixes

A change is a symptom fix, and must be rejected as a resolution, when it:

- Special-cases the reported input while the general case stays broken.
- Catches and swallows the error rather than preventing the condition.
- Adds a retry, a delay, or a refetch to mask an ordering or invalidation defect.
- Clamps, coerces, or defaults a wrong value instead of correcting its source.
- Changes the display so the wrong value is no longer visible.

Each is legitimate only as a deliberate, stated mitigation for an S1 while the real fix is
prepared — never as the resolution. Say which one it is.

## Before writing the fix

Answer these in the task record:

- **Blast radius**: which callers reach the changed code, and what else shares this cause?
- **Why now**: was this always broken, or did a specific change introduce it? A defect
  with a known introduction point usually has a matching, narrower fix.
- **Data state**: did the defect persist bad records? A code fix stops new corruption and
  repairs none of it. State whether a backfill is in scope.
- **Tenant scope**: if the tenant-risk flag is set, what proves the fixed path still
  composes tenant scope, and that a wrong-tenant identifier behaves as not-found?
