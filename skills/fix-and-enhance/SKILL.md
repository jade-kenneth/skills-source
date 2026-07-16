---
name: fix-and-enhance
description: Repository-agnostic coordinator for bug fixes and enhancements. Uses the project's generated workflow instructions, coordinates tracked work, delegates implementation standards to the matching app skills, and routes verified reusable lessons through `project-learning-contributor`. Use whenever a user asks to fix broken behavior, improve or polish an existing feature, add or change functionality, or implement a scoped feature.
---

# Fix and Enhance

Coordinate fixes and enhancements across project workflow, app-specific standards, tracking, validation, and durable guidance.

## Workflow authority

Follow the current project's applicable `AGENTS.md` and `CLAUDE.md`. In the unified agent stack, their workflow is generated from `conventions/workflow.md` in the **skills-source repository itself** — that repository is the only editable, upstream source.

`.skills-source/` in a project is a **read-only synced snapshot** of that upstream, wiped and re-cloned on every sync. Never edit anything under `.skills-source/` and never edit generated `AGENTS.md` to change the reusable workflow — both changes are lost on the next `npm run sync-skills`. To change the workflow: edit `conventions/workflow.md` in the skills-source repository, commit and push, then run `npm run sync-skills` (which regenerates `AGENTS.md`) in each consuming project and commit the regenerated `AGENTS.md`.

If a project has not adopted the generated workflow yet, use this fallback sequence: inspect the request and nearest implementation, establish the root cause or expected outcome, make the smallest coherent change using local patterns, run focused validation before broader checks, inspect the final diff, and report results and remaining risks honestly.

## Companion app skills

This skill coordinates the lifecycle; companion app skills remain the implementation authority for their supported surfaces:

| Affected surface                      | Companion skill |
| ------------------------------------- | --------------- |
| Compatible web or admin application   | `web-app`       |
| Compatible mobile application         | `mobile-app`    |
| Compatible API or backend application | `api-app`       |

Invoke every companion skill whose description and compatibility match the affected scope. Read its routed instructions and references before editing that surface.

For cross-surface changes, use all relevant companion skills and implement shared contracts in dependency order. If none matches, follow the project's generated instructions and nearest established patterns.

## Notion coordination

Use the **Notion MCP** when the request references Notion or the current project uses Notion for task tracking.

1. Search for and read the matching task before editing so its description, acceptance criteria, diagnosis, and notes inform the scope.
2. Verify the task's claims against the current code and behavior because tracker content may be stale.
3. Discover the connected database's name, properties, task types, and status values instead of assuming a schema.
4. Create or mutate a Notion item only when the user has authorized the write and the project workflow calls for it.
5. After required validation and acceptance, record the root cause and resolution and move the item to the appropriate completed state when authorized.

If the project uses another tracker, apply the same scope, verification, schema-discovery, authorization, and closeout rules through its available integration.

## Continuous reusable-learning handoff

`fix-and-enhance` owns the everyday work lifecycle. `project-learning-contributor`
owns the separate lifecycle that turns a verified result into categorized,
product-neutral guidance. Keep both skills: integrate their handoff rather than
duplicating proposal, redaction, dispatch, or promotion logic here.

After a fix or enhancement passes its required validation, always run this gate:

1. **Check durability.** A candidate qualifies when the lesson should prevent the
   same bug or improve the same implementation decision in another project and is
   supported by concrete evidence. Crashes, security corrections, framework
   integration requirements, reliability fixes, and durable architecture rules
   are common candidates.
2. **Reject local-only knowledge.** Do not contribute product behavior, feature
   requirements, branding/copy, customer details, private URLs, one-off
   workarounds, or a rule already covered adequately by the current skill.
3. **Invoke the contributor.** For a qualifying lesson, use
   `project-learning-contributor` in capture mode. Select exact target directories
   from `.skills-source/skills/`, generalize the rule, write
   `skill-contributions/<id>.json`, and run the repository validation command.
   A local review proposal may be created without a second prompt after the user
   authorized the fix/enhancement; merging it remains the user's approval to
   dispatch it externally.
4. **Do not edit the snapshot.** Never change `.skills-source/`, generated
   `AGENTS.md`, or canonical skills directly from a product repository.
5. **Report the decision.** State either the proposal path and target skill(s), or
   that no reusable lesson was captured and why.

If the locked snapshot does not yet contain `project-learning-contributor`, report
the candidate and ask for the normal skills-source/boilerplate update. Do not
recreate its schema or bypass its validation locally.

Canonical skill updates happen later through the contributor's promotion mode:
a product proposal creates or updates a skills-source review issue, then a
separate reviewed PR changes the smallest appropriate reference and eval. Never
auto-merge that PR.

A durable rule is one that should govern future work in other projects. A
fix-local decision remains in the product.
## Integration checklist

- [ ] Applicable generated workflow and repository instructions were followed.
- [ ] Relevant `web-app`, `mobile-app`, and `api-app` skills were used for affected surfaces.
- [ ] When Notion is in use, the matching item was read and authorized updates used its existing schema.
- [ ] Tracker records were updated only when required and authorized.
- [ ] After successful validation, the reusable-learning gate was run.
- [ ] A qualifying lesson was routed through `project-learning-contributor` to exact target skills; product-specific or duplicate guidance was not contributed.
- [ ] `.skills-source/` and generated `AGENTS.md` were never edited as canonical sources.
- [ ] The handoff states the result, validation, and remaining risks accurately.
