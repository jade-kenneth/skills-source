---
name: fix-and-enhance
description: Repository-agnostic coordinator for bug fixes and enhancements. Uses the project's generated workflow instructions, coordinates Notion-tracked work through the Notion MCP, and delegates implementation standards to the `web-app`, `mobile-app`, and `api-app` skills when their supported surfaces are affected. Use whenever a user asks to fix broken behavior, improve or polish an existing feature, add or change functionality, or implement a scoped feature.
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

## Durable guidance

Update the relevant `web-app`, `mobile-app`, or `api-app` guidance only when the change introduces a durable implementation rule for that surface. Update `conventions/workflow.md` **in the skills-source repository** when the reusable change process itself changes; never in a project's synced snapshot.

When a durable rule spans surfaces, update each affected companion skill in its canonical location (the skills-source repository). Keep reusable guidance project-neutral, adapt it to each skill's structure, and do not mirror platform-specific guidance to unrelated skills. After any upstream change, re-run the global install script (skills/commands symlinks pick it up live) and `npm run sync-skills` in affected projects so `AGENTS.md` carries the rule to the executor.

### Durable guidance — how to actually do it

**Location of the upstream repository:** `/Users/jadekennethdarunday/personal/skills-sources`
(If this path does not exist, check the current project's `CLAUDE.md` for a "skills-source" line; if still not found, ask the user for the path instead of guessing or skipping the update.)

**Procedure — propose first, never edit unprompted:**

1. **Propose.** After completing the primary task, state the candidate rule in one or two sentences, name the exact target file (e.g. `skills/api-app/SKILL.md` or `conventions/workflow.md`), and quote the text you intend to add or change. Then stop and wait.

   **If no existing file fits the finding's scope, propose creating a new one.** Do not force a rule into an unrelated skill, and do not drop it just because no file exists. A new-skill proposal must include: the folder (`skills/<skill-name>/` — this repository uses a flat skills layout), the `name` and `description` frontmatter (the description must answer "when should an agent reach for this?" — it is the trigger), and an outline of the initial content. Before proposing new, check for overlap: if an existing skill covers 70% of the scope, propose extending it instead — many small near-duplicate skills are worse than one coherent one. New conventions go to `conventions/<topic>.md` under the same rule. If the new skill is an implementation authority for a surface this coordinator routes to, the proposal must also include adding it to this skill's companion table.

2. **Wait for explicit approval.** Only proceed on a clear yes. If the user declines or does not answer, drop it — do not queue it, do not apply it later in the session without asking again.
3. **Edit upstream only.** Make the approved change — whether updating an existing file or creating a new skill/convention — in the skills-source repository at the path above. Never write durable rules into the current project's `.skills-source/`, `AGENTS.md`, or `CLAUDE.md` — those are downstream copies. A newly created skill must follow the standard shape: its own folder, a `SKILL.md` with `name` and `description` frontmatter, body written project-neutral.
4. **Commit and push** in skills-source with a message naming the skill and the rule (e.g. `api-app: propagate error envelope rule`).
5. **Propagate to the current project** if it consumes the changed guidance: run `npm run sync-skills`, then commit the regenerated `AGENTS.md`. Mention that other projects will pick the rule up via postinstall or the CI drift check. A **new** skill rides the same pipeline with no extra wiring: the global install script symlinks it for Claude Code, and the AGENTS.md generator includes it for the executor automatically.
6. **Report** the rule, the file it now lives in, and the propagation status in the final handoff.

A durable rule is one that should govern _future_ work in _other_ projects. A fix-local decision (naming in this file, a workaround for this repo's quirk) is not durable — leave it in the project and out of skills-source.

## Integration checklist

- [ ] Applicable generated workflow and repository instructions were followed.
- [ ] Relevant `web-app`, `mobile-app`, and `api-app` skills were used for affected surfaces.
- [ ] When Notion is in use, the matching item was read and authorized updates used its existing schema.
- [ ] Tracker records, companion standards, and the canonical workflow were updated only when required — and only upstream in skills-source, never in `.skills-source/` or generated `AGENTS.md`.
- [ ] Any durable rule was proposed with its exact target file and wording, and written only after explicit approval; approved rules were committed, pushed, and synced per the procedure above.
- [ ] The handoff states the result, validation, and remaining risks accurately.
