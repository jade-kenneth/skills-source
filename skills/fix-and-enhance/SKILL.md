---
name: fix-and-enhance
description: Repository-agnostic coordinator for bug fixes and enhancements. Uses the project's generated workflow instructions, coordinates Notion-tracked work through the Notion MCP, and delegates implementation standards to the `web-app`, `mobile-app`, and `api-app` skills when their supported surfaces are affected. Use whenever a user asks to fix broken behavior, improve or polish an existing feature, add or change functionality, or implement a scoped feature.
---

# Fix and Enhance

Coordinate fixes and enhancements across project workflow, app-specific standards, tracking, validation, and durable guidance.

## Workflow authority

Follow the current project's applicable `AGENTS.md` and `CLAUDE.md`. In the unified agent stack, their workflow is generated from `conventions/workflow.md` in the producer repository; update that source and regenerate instructions instead of maintaining a second editable workflow here.

When the synced producer is present, `.skills-source/conventions/workflow.md` is the upstream source. Do not edit generated `AGENTS.md` to change the reusable workflow.

If a project has not adopted the generated workflow yet, use this fallback sequence: inspect the request and nearest implementation, establish the root cause or expected outcome, make the smallest coherent change using local patterns, run focused validation before broader checks, inspect the final diff, and report results and remaining risks honestly.

## Companion app skills

This skill coordinates the lifecycle; companion app skills remain the implementation authority for their supported surfaces:

| Affected surface | Companion skill |
| --- | --- |
| Compatible web or admin application | `web-app` |
| Compatible mobile application | `mobile-app` |
| Compatible API or backend application | `api-app` |

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

Update the relevant `web-app`, `mobile-app`, or `api-app` guidance only when the change introduces a durable implementation rule for that surface. Update `conventions/workflow.md` when the reusable change process itself changes.

When a durable rule spans surfaces, update each affected companion skill in its canonical location. Keep reusable guidance project-neutral, adapt it to each skill's structure, and do not mirror platform-specific guidance to unrelated skills.

## Integration checklist

- [ ] Applicable generated workflow and repository instructions were followed.
- [ ] Relevant `web-app`, `mobile-app`, and `api-app` skills were used for affected surfaces.
- [ ] When Notion is in use, the matching item was read and authorized updates used its existing schema.
- [ ] Tracker records, companion standards, and the canonical workflow were updated only when required.
- [ ] The handoff states the result, validation, and remaining risks accurately.
