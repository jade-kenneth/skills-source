# Workflow

> Reach for this document when planning or executing a feature, bug fix, enhancement, or refactor; creating a task file; updating phase checkboxes; or preparing commits and pull requests.

## Change workflow

1. Read the request and inspect the nearest implementation before editing.
2. Identify the owning app or package and keep the change scoped there.
3. Write or update `task.md` when the work requires multiple phases, affects several layers, or benefits from an explicit handoff checklist.
4. Implement the smallest coherent slice using existing structure, naming, data flow, hooks, modules, and repositories.
5. Run the smallest relevant validation first, then expand checks only as risk requires.
6. Update checkboxes and notes to match the actual repository state.
7. Summarize what changed, what was validated, and any remaining follow-up.

Do not require an external tracker or a standards update unless the user or repository instructions explicitly require one.

## Task file format

Use `task.md` for repository-local implementation plans. Keep it actionable and tied to observable outcomes.

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

## Implementation discipline

- Inspect the nearest implementation before editing.
- Keep the change inside the app or package that owns the behavior.
- Avoid unrelated cleanup and broad refactors.
- Reuse established data flow, naming, hooks, modules, and repositories.
- Change public contracts first: SDL/schema, shared types, then generated/client code.
- For cross-app changes, implement in dependency order: shared contract → API → clients.
- Add tests alongside the changed behavior.
- Update documentation only when the change produces a durable repository rule.

## Validation order

Run the smallest relevant checks first:

1. Focused test for the changed module/component.
2. Affected project's lint and typecheck.
3. Affected project's build when the change can affect compilation or bundling.
4. Workspace-wide checks only when shared contracts or root configuration changed.

Typical root commands:

```bash
npm run lint
npm run typecheck
npm run build
```

Use the corresponding Nx project target when validating one app.

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
