# Reproduction

Stage 2. Produces: a reproduction, or a documented failure to reproduce. This stage is
what converts a hypothesis into a fact, and it is the stage most often skipped under time
pressure. Skipping it is how a backlog accumulates fixes for defects nobody had.

## Why it is mandatory

A reproduction gives four things nothing else gives:

1. **Proof the defect exists** in the current code, not merely in the reporter's build.
2. **A failing signal to fix against** — without it, "fixed" is an opinion.
3. **The boundary of the defect** — what triggers it and what does not, which is usually
   where the cause hides.
4. **The regression test's content** — the reproduction, encoded, is the test.

## Order of attempts

Work outward from cheapest and most controlled:

1. **A failing test.** The strongest form. Write a test that asserts the expected
   behavior and watch it fail against unmodified code. Confirm it fails *for the reported
   reason* — a test that fails because it is wrong proves nothing.
2. **A direct call** to the unit — service method, resolver, repository, pure function —
   with the reported inputs. Fastest way to isolate a layer.
3. **An endpoint or operation call** with the reported payload, as the reported role and
   tenant. Verifies transport, guards, and serialization along with logic.
4. **Database state inspection.** Read the actual stored records. Frequently reveals that
   the write path, not the read path, is at fault — or that the data was already wrong
   before the reported action.
5. **The real interface**, driven as the reporter drove it. Slowest and least precise;
   use it to confirm the end-to-end symptom once a lower layer has localized the cause.

Stop at the highest layer that reproduces, then push down until the smallest unit that
still fails is found. The smallest failing unit is where the cause lives.

## Match the reported conditions

A reproduction under different conditions is a different experiment. Match, and record
which of these you matched and which you approximated:

- Role and permissions — not an admin account when the reporter was a standard user.
- Tenant — the reporter's tenant, or an equivalent one with comparable data.
- Data shape — empty lists, single items, large sets, null optional fields, legacy
  records written before a schema change, unicode and long strings.
- Timing and ordering — concurrent requests, retries, redeliveries, out-of-order
  callbacks, expired tokens, clock skew across timezones.
- Environment — build target, feature flags, configuration values, dependency versions.

Most defects that "cannot be reproduced" are reproduced immediately once one of these is
matched properly. Before declaring not-reproducible, vary each of them deliberately.

## Reproducing without a reproduction

When the defect cannot be triggered locally — production-only data, a third-party
integration, a race that will not narrow — do not proceed on intuition. Gather the
strongest available evidence and say plainly that the cause is inferred, not confirmed:

- **Logs** around the reported timestamp, filtered by request or trace id. Follow the
  request through each layer boundary and find the first place reality diverges from
  intent.
- **Error tracking** — the exception, its stack, its frequency, its first appearance, and
  what release it started with. First-seen timestamps line up with deploys and localize
  the cause to a diff.
- **Monitors** — what recovered, what did not, and when, relative to the report.
- **Stored state** — read the affected records. What is written is the residue of what
  the code did, and it often contradicts the report.
- **The diff** — what shipped just before the first occurrence. A defect that appeared at
  a known time was usually introduced at a known time.

A fix built on inference carries that label all the way to closeout, and its evidence
must include a production-side confirmation after deploy. Say so explicitly rather than
letting the inference quietly harden into a claim.

## Recording a failure to reproduce

Not-reproducible is a real verdict and a useful one, but only when it is specific.
"Could not reproduce" is worthless; this is not:

```
Attempted:  <exact steps, role, tenant, environment, data state>
Expected:   <the reported symptom>
Observed:   <what actually happened instead>
Varied:     <conditions deliberately changed, and the result of each>
Missing:    <the precondition needed to try again>
```

Then ask the reporter for the missing precondition. Do not change code to make a defect
you never observed go away.
