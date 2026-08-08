# Intake and Severity

Stage 1. Produces: severity, blast radius, tenant-risk flag. No code is read for the
purpose of fixing yet — only to size the problem.

## Extract the observation from the conclusion

A report mixes three things. Separate them before doing anything else.

| Part | Example | Trust |
|------|---------|-------|
| Observation | "The list is empty after I save" | High — something was seen |
| Inference | "So the save is failing" | None — a guess |
| Prescription | "The mutation needs a refetch" | None — a guess about a guess |

Carry the observation forward. Record the inference as a hypothesis to test, not as
scope. A report that contains only a prescription ("add a refetch") is missing its
observation; ask what was actually seen before accepting the item.

## Establish the facts you need

Ask for whatever is missing, but do not block on a full set — start with what you have
and note the gaps:

- **Who** — role, permissions, and tenant. The same action by different roles is
  different code.
- **When** — timestamp with timezone, and whether it is reproducible on demand or was
  seen once. A timestamp is what makes production logs searchable.
- **Where** — environment, app surface, URL or screen, app version, device or browser.
- **What was expected** — often the most revealing question, because a "defect" is
  sometimes a mismatch of expectation against intended design.
- **Correlation handles** — request id, trace id, session id, error id, entity ids.
  These convert a vague report into a searchable one.

## Severity

Rate on impact, not on how alarming the report sounds. A loud cosmetic glitch outranks
nothing; a silent wrong number outranks almost everything.

| Level | Definition |
|-------|-----------|
| **S1** | Data loss, data corruption, cross-tenant exposure, auth bypass, or total outage of a core flow. Stop other work. |
| **S2** | A core flow is broken or produces wrong output with no workaround. Money, permissions, and delivered-notification correctness live here. |
| **S3** | A flow is degraded or broken with a workaround; a non-core flow is broken. |
| **S4** | Cosmetic, copy, or minor UX friction with no functional consequence. |

Two rules override the table:

- **Silent wrongness outranks visible failure.** An error message is self-reporting; a
  wrong value that looks right is not. Wrong data displayed confidently is at least S2.
- **Anything touching tenant isolation is S1** until proven otherwise, regardless of how
  small the visible symptom is.

## Blast radius

Before fixing, size what the *fix* can break — this is separate from what the defect
affects.

1. Which surfaces call the suspect path (API, web, mobile, jobs, webhooks, scripts)?
2. Is the path on a shared contract — schema, generated types, a common library, a
   repository primitive? Shared-contract changes propagate to callers that were never
   part of the report.
3. Does it run in background work — scheduled jobs, queue consumers, event handlers?
   These fail silently and are not covered by clicking through the UI.
4. Is there persisted bad data from the defect? A code fix stops new corruption; it does
   not repair existing records. Decide explicitly whether a backfill is in scope, and say
   so either way.

Where the project provides impact-analysis or call-path tooling, use it. Otherwise search
by symbol and by the naming conventions the codebase uses for that artifact kind.

## Tenant-risk flag

Set the flag when the defect touches any query, filter, resolver, service method,
repository call, cache key, background sweep, or webhook handler that reads or writes
tenant-owned data.

A set flag means: the fix is not closeable without wrong-tenant evidence, and severity
floors at S1 if scope turns out to be missing anywhere on the path.

## Output

Record before moving to reproduction:

```
Report:      <one line, observation only>
Severity:    S<n> — <why this level>
Surfaces:    <api | web | mobile | jobs | webhooks>
Blast radius:<shared contracts and background paths the fix could reach>
Tenant risk: <yes/no — which data path>
Handles:     <request/trace/entity ids, timestamps>
Unknowns:    <what was asked for and not yet available>
```
