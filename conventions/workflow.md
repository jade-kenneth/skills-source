# Workflow

> Reach for this document when planning or executing a feature, bug fix, enhancement, or refactor; creating a task file; updating phase checkboxes; or preparing commits and pull requests.

This file is the canonical workflow source for generated project instructions. Update it here, then regenerate `AGENTS.md`; do not maintain a second editable copy in a skill or consumer repository.

## Roles

Project work is split across two agents with fixed responsibilities; apply the sections below through the lens of whichever role you occupy.

- **Codex — the executor.** Builds against `AGENTS.md` and `Implementation Plan.md`, one phase at a time, updating phase checkboxes (`[ ]` → `[~]` → `[x]`) as work completes and passes its QA rows. Does not write to Notion.
- **Claude Code — the planner and reviewer.** Reconciles the design export into `Product Specification.md` and `Implementation Plan.md`, refines phases, reviews the executor's finished work against the Product Specification with the Fidelity QA gate, and syncs phase status to Notion during planning or review sessions. Does not implement features unless the user explicitly asks.
- **Provenance of scope:** all product planning and UI/UX originates in Claude Design and arrives as the committed `design/` export. Neither agent invents UI; ambiguity is escalated to the user.

When only one agent is present on a task, it still respects the boundary that matters most: nothing visual is rebuilt from prose, and no phase is marked complete without its validation.

## Change workflow

Apply this sequence together with the user's request and the repository instructions that govern the affected files.

### 1. Establish scope and local rules

Before editing:

1. Read the request and any linked issue, specification, logs, screenshots, or error output.
2. Read the applicable `AGENTS.md`, `CLAUDE.md`, README, contribution guides, and nested instructions.
3. Inspect the working tree so existing user changes are not overwritten or mistaken for task changes.
4. Locate the nearest implementation, tests, configuration, and comparable feature.
5. Identify the owning app or package and include another boundary only when a contract or dependency genuinely crosses it.
6. Discover the supported scripts, generated-file workflow, and validation commands from repository configuration rather than guessing them.

Ask a clarifying question only when missing information would materially change the implementation. Otherwise, state a reasonable assumption and continue. If the user requested diagnosis or review only, provide the requested evidence without implementing an unrequested fix.

Use an external tracker only when the user references one or the repository workflow requires it. Verify tracker content against the current code and require user authorization for external writes.

### 2. Diagnose or define the change

For a bug fix:

- Reproduce the failure when practical, or gather the strongest available evidence when reproduction is unavailable.
- Trace the affected control flow, data flow, and boundary conditions far enough to identify the root cause.
- Check for an existing test or nearby pattern that reveals the intended behavior.
- Fix the cause rather than only suppressing the visible symptom.

For an enhancement:

- Compare the current behavior with the requested outcome.
- Identify acceptance criteria, affected states, edge cases, and compatibility constraints.
- Find the nearest comparable implementation before introducing a new pattern or abstraction.

### 3. Plan and implement the smallest coherent change

For full-project execution after the canonical Product Specification and Implementation Plan exist, generate or reconcile the root `TASK_<project-slug>.md`. In Claude Code, use `/generate-project-tasks <project name>`. In Codex or any agent without slash-command support, read `.skills-source/commands/generate-project-tasks.md` in full and execute it directly; if `.skills-source/` is missing, run `npm run sync-skills` first. For a small standalone change outside that project tracker, use a scoped `task.md`. Keep either task file aligned with reality.

- Follow the nearest established structure, naming, data flow, hooks, modules, repositories, and error-handling patterns.
- Keep the diff focused and avoid unrelated cleanup or broad refactors.
- Preserve public behavior and compatibility outside the requested scope unless the change explicitly requires otherwise.
- Change public contracts first: SDL/schema, shared types, then generated and client code.
- For cross-app changes, implement in dependency order: shared contract → API → clients.
- Add or update tests for observable behavior when the repository has a relevant test surface.
- For user-facing changes, cover applicable loading, empty, error, success, accessibility, and responsive states.
- Do not hand-edit generated files when a generator exists. Inspect regenerated output for unrelated churn and report a failed or unavailable generator instead of fabricating output.

### 4. Validate in proportion to risk

Run the smallest relevant checks first:

1. Focused test, reproduction, or manual check for the changed behavior.
2. Affected project's lint and typecheck.
3. Affected project's broader tests and build when the change can affect compilation or bundling.
4. Workspace-wide or integration checks only when shared contracts, root configuration, or cross-system behavior changed.

Typical root commands:

```bash
npm run lint
npm run typecheck
npm run build
```

Use the corresponding Nx project target when validating one app.

Inspect unfamiliar scripts before running them. Deployment, destructive, data-mutating, production-bound, privileged, or external-write commands require explicit user authorization; their presence in CI or package scripts is not permission to execute them.

Increase validation for authentication, authorization, sensitive data, persistence, concurrency, public APIs, schemas, migrations, billing, destructive operations, and deployment configuration. Verify relevant failure paths, compatibility, and rollback or migration needs.

Do not claim a check passed unless it ran successfully. If a check cannot run, report the command, reason, and remaining risk.

### 5. Close out accurately

- Inspect the final diff and working tree for unintended or unrelated edits.
- Update task checkboxes and notes to match the actual repository state.
- Update an authorized tracker only when the user or repository workflow requires it; do not mark incomplete or unvalidated work complete.
- Update documentation or standards only when the change creates a durable rule, public contract, configuration requirement, or reusable workflow.
- Summarize what changed, what was validated, and any limitation, assumption, migration, or follow-up that remains.

## Task file format

`TASK_<project-slug>.md` is a derived detailed execution tracker: Product Specification owns product/UI behavior, Implementation Plan owns phase scope and order, and the task file owns atomic actions and evidence. Never let it become a competing specification or architecture plan. Preserve protected boilerplate primitives—including GraphQL clients and codegen, TanStack Query setup, authentication, standardized errors, repositories, common libraries, async-event infrastructure, S3, notifications, security, CI, and test foundations—and create `[BP] verify & reuse` tasks instead of replacement tasks.

Use the following compact structure for a small scoped `task.md`; `.skills-source/commands/generate-project-tasks.md` defines the richer full-project tracker format and must be read directly by agents that cannot invoke the wrapper command.

```md
# <Task title>

## Context

<Why this work is needed and the current behavior.>

## Expected outcome

<What must be true when the task is complete.>

## Scope

### In scope

- <Owned behavior or surface>

### Out of scope

- <Explicit non-goals>

## Phases

### Phase 1 — <Discovery or contract>

- [ ] <Concrete task>
- [ ] <Concrete task>
- [ ] Validate: <smallest relevant check>

### Phase 2 — <Implementation>

- [ ] <Concrete task>
- [ ] <Concrete task>
- [ ] Validate: <smallest relevant check>

### Phase 3 — <Integration and finish>

- [ ] <Regression or cross-surface check>
- [ ] Complete regression and cross-surface checks
- [ ] Record assumptions, decisions, and follow-ups

## Verification

- [ ] Lint passes for the affected project
- [ ] Typecheck passes for the affected project
- [ ] Relevant tests pass
- [ ] Expected loading, empty, error, and success states are verified

## Notes

- Assumptions:
- Decisions:
- Follow-ups:
```

Immediately follow a feature plan with UI mockups for every affected admin and mobile surface when UI is in scope.

## Phase checkbox pattern

- Use `- [ ]` for pending work.
- Use `- [x]` only after the work and its relevant validation are complete.
- Group checkboxes under ordered phase headings: `Phase 1`, `Phase 2`, and so on.
- Write one verifiable action per checkbox.
- End each implementation phase with a validation checkbox.
- Preserve incomplete items; do not mark a phase complete because most of it works.
- Add newly discovered work to the appropriate phase instead of hiding it in prose.
- Keep status honest: the task file should show the actual repository state at handoff.

## Commit style

Use Conventional Commit-style subjects:

```text
<type>(<optional scope>): <imperative summary>
```

Common types:

- `feat` — new behavior
- `fix` — bug correction
- `refactor` — structural change without intended behavior change
- `test` — test-only change
- `docs` — documentation-only change
- `chore` — maintenance or tooling

Common scopes are `web`, `mobile`, `api`, `shared`, and `workspace`. A scope is optional when the change is truly repository-wide.

Examples:

```text
feat(api): add structured request validation
fix(mobile): prevent duplicate notification registration
refactor: update application references
docs(workspace): document implementation workflow
```

Rules:

- Keep the subject imperative, specific, and concise.
- One commit should represent one coherent change.
- Do not mix unrelated apps or cleanup into the same commit.
- Use the body to explain why, contract changes, migrations, or non-obvious tradeoffs.
- Do not claim tests passed unless they were run.

## Pull request style

The boilerplate has no established PR history, so use this compatible baseline:

```md
## Summary

- <What changed>
- <Why it changed>

## Scope

- Owning app/package:
- Related task:

## Validation

- [ ] Focused tests
- [ ] Lint
- [ ] Typecheck
- [ ] Build, if applicable
- [ ] Manual UX states, if applicable

## Contract or migration notes

<GraphQL, schema, environment, data, or rollout impact. Write "None" when absent.>

## Screenshots

<Required for visible web/mobile changes; otherwise "Not applicable".>
```

Keep PRs scoped to one task. Call out generated files, contract changes, security-sensitive behavior, and follow-up work explicitly.
