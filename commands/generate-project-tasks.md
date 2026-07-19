---
description: Generate or reconcile the project's detailed executable task file from the canonical Product Specification and Implementation Plan
argument-hint: [project name]
---

# /generate-project-tasks — create the detailed engineering task tracker

**Project name:** $ARGUMENTS

Create or update one repository-root task file named
`TASK_<project-slug>.md`, where `<project-slug>` is the lowercase kebab-case
form of the verified project name (for example, `TASK_dala.md`).

This command expands the canonical build documents into atomic engineering work.
It does not replace, reinterpret, or compete with them.

## 1. Load canonical context

If the project name is empty, derive it from `Product Specification.md` only
when unambiguous; otherwise ask the user.

Read, in this order:

1. root `AGENTS.md`;
2. root `Product Specification.md`;
3. root `Implementation Plan.md`;
4. existing `TASK_<project-slug>.md`, when present;
5. the actual repository tree, package scripts, configuration, nearest
   implementations, tests, and generated-file workflows needed to verify paths.

If either canonical root document is missing, stop and direct the user to
`/sync-build-docs <project name>` for an incremental design release or
`/finalize-build-docs <project name>` for a complete final release. Never use
the similarly named handoff files as substitutes.

## 2. Respect document authority

- Product Specification owns product objective, features, UI, behavior, copy,
  states, and Fidelity QA outcomes.
- Implementation Plan owns scope, dependency order, phases, architecture
  decisions, and phase status.
- AGENTS.md owns repository structure, security, data access, GraphQL, TanStack
  Query, error handling, testing, and reuse-not-rebuild rules.
- The task file owns only the detailed executable breakdown and progress of each
  atomic engineering action.

Do not invent missing features, screens, APIs, business rules, or architecture.
Mark unresolved work `⚠ blocked` with the exact decision or source needed.

Prototype implementation details are not architecture. Treat local/mock records,
component state used as persistence, inline/manual validation, hard-coded
permissions, fake delays, and simulated requests as design demonstrations only.
The task tracker must translate their observable outcomes through AGENTS.md and
the repository's established production patterns.

## 3. Protect reusable architecture

Before creating tasks, classify the relevant boilerplate code:

- **KEEP [BP]**: shared architecture and third-party integration scaffolds,
  including abstract/concrete GraphQL clients, authentication and authorization,
  GraphQL server and codegen, TanStack Query setup, standardized errors,
  repositories and Mongoose repository foundations, common modules, libraries,
  async-event infrastructure, S3, notification plumbing, validation, security,
  CI, and testing infrastructure.
- **ADAPT**: project identity, configuration, presentation, seed data, and
  extension points whose architecture stays intact.
- **REMOVE**: feature-specific vertical slices with no counterpart in the
  Product Specification.

An abstract method may be implemented by its intended concrete adapter. Do not
create tasks that replace a base client, bypass a repository abstraction,
instantiate feature-local GraphQL transports, duplicate authentication/error
handling, or rebuild another protected primitive. Remove an obsolete feature
vertically across schema, resolver/service/repository, generated operations,
query keys/hooks, UI, seed data, and tests without removing shared dependencies.

Preserve stable paths and Nx identifiers for every surviving app. Respect any
documented whole-app removal exactly as defined in the Implementation Plan.

## 4. Break the plan into executable tasks

Mirror the Implementation Plan's phase numbers, names, order, `[BP]` markers,
blocked state, and section pointers. Under each phase, create dependency-ordered
atomic tasks that:

- name the owning app/package and verified file or directory when known;
- state the concrete action using the repository's established pattern;
- reference the Product Specification section and Implementation Plan item;
- identify dependencies and whether work can run in parallel;
- include acceptance criteria observable by a reviewer or user;
- include focused tests plus relevant lint, typecheck, build, integration,
  security, accessibility, responsive, and Fidelity QA checks;
- include loading, empty, error, success, authorization, and rollback/migration
  behavior when applicable;
- use real GraphQL query/mutation/subscription names when verified and mark
  unverified operation names as decisions instead of inventing them;
- keep secrets out of the file and refer only to environment-variable names.

For every prototype-backed, data-backed screen, include atomic tasks that first
record and then implement its production mapping: architecture source; state
ownership; configured read/write operation and typed wrapper; applicable
server/application/persistence path; configured client feedback validation plus
authoritative server validation/authz; cache invalidation or optimistic rollback;
and loading/error/offline states. Use the protected GraphQL, codegen, TanStack
Query, form-schema, API, and repository foundations when they exist in the current
boilerplate; otherwise name the approved configured equivalents. UI construction
depends on these contract tasks. Never create a task to copy prototype local state
or manual validation as a temporary production implementation.

Use one checkbox for one verifiable action. Use `[ ]` for pending, `[~]` for
in progress, `[x]` only after validation passes, and `⚠ blocked` for work that
cannot start. Do not mark boilerplate-provided foundations as new work; write
`[BP] verify & reuse` tasks for them.

## 5. Reconcile instead of overwriting

When the task file already exists, reconciliation is a requirements comparison,
not a metadata refresh. Do not infer that work is unchanged merely because a
phase keeps the same name or because the previous task was marked `[x]`.

### 5.1 Build the comparison set

Before changing a checkbox, create an internal mapping for every existing and
new task to the current canonical requirements:

- Product Specification sections, behaviors, states, and Fidelity QA rows;
- Implementation Plan phase items, dependencies, and validation gates; and
- the task's acceptance criteria, evidence, implementation references, and
  active blockers.

Compare the current acceptance criteria and required behavior with the previous
task file. Compare the actual repository and test evidence as well. A previous
`[x]` is historical evidence, not proof that the task satisfies the new
requirements.

### 5.2 Classify every affected task

For each task, classify it as exactly one of the following:

| Classification | Required action |
| --- | --- |
| Unchanged | Preserve the status, evidence, decisions, and notes when current evidence still satisfies the unchanged acceptance criteria. |
| Scope or acceptance changed | Keep the historical evidence, update the acceptance criteria and references, and create the remaining work. Reopen the task as `[~]` when an existing implementation is being extended or is already underway; use `[ ]` when the changed work has not started. |
| Newly required | Add a new atomic `[ ]` task. Never mark it `[x]` based on an older related task. |
| Superseded or removed | Remove it from active work only when the current canonical documents explicitly supersede or remove it. Preserve a short history entry explaining what replaced it. |
| Blocker resolved | Remove the obsolete active blocker, preserve its history, and make the newly unblocked work `[ ]` or `[~]` according to actual evidence. |
| Still blocked | Keep `⚠ blocked` with the exact current decision or source needed. Do not retain a blocker solely because it existed in the previous tracker. |

If an old task cannot be mapped confidently to the current requirements, do not
preserve `[x]` silently. Mark it for reconciliation, split the historical work
from the remaining work, or ask for the missing decision.

### 5.3 Status and evidence rules

- Preserve `[x]` only when the current acceptance criteria are unchanged and
  repository/test evidence still validates them.
- Reopen a completed task as `[~]` when the updated requirement extends its
  implementation and the existing implementation provides a valid starting
  point or work is already underway.
- Use `[ ]` for newly required or changed work that has not started.
- Never mark changed requirements `[x]` until the updated acceptance criteria
  and required validation have passed.
- Preserve prior evidence, dates, decisions, and user notes. Add a dated
  explanation whenever a task is reopened, split, superseded, or unblocked.
- Keep completed historical work separate from the remaining acceptance
  criteria; do not erase the history to make the checkbox appear clean.

### 5.4 Reconcile blockers and phase status

Re-evaluate blockers against the updated Product Specification and
Implementation Plan. Resolve or remove blockers that were caused by superseded
designs, clarified decisions, or delivered dependencies. Keep a blocker only
when the current canonical documents and repository still show that the work
cannot start.

Recalculate phase completion after task reconciliation. A phase is complete only
when every current task and its updated acceptance criteria are validated and
the phase's Fidelity QA and validation gates are complete. Unchanged phase names
do not justify unchanged checkboxes.

### 5.5 Required reconciliation report

Append a progress-log entry that reports what actually changed. At minimum,
include the canonical documents considered, the number of tasks preserved,
reopened, added, revised, blocked, unblocked, superseded, and removed, plus a
short reason and evidence pointer for each non-trivial change. Do not write that
phase scope or checkbox state was unchanged unless the acceptance-criteria and
repository comparison found no affected requirement.

Never reset the entire file or silently discard implementation history. Report
any mismatch between task status and Implementation Plan phase status.

## Required file structure

```md
# <Project name> — Engineering Task Tracker

> Derived from Product Specification.md and Implementation Plan.md.
> Those files remain canonical; this file is the detailed execution tracker.

## Source and status
- Product Specification:
- Implementation Plan:
- Generated/reconciled:
- Current phase:

## Prototype-to-production mapping

| Screen/action | Observable prototype outcome | Architecture source | Production state owner | Read/write path | Validation/auth/error contract | Prototype-only mechanics rejected |
| --- | --- | --- | --- | --- | --- | --- |

## Architecture reuse contract
- KEEP [BP]:
- ADAPT:
- REMOVE:

## Dependency map
<short ordered list or Mermaid graph only when it materially clarifies dependencies>

## Phase 1 — <same phase name>
References: Product Specification §… · Implementation Plan Phase 1

### 1.1 <task group>
- [ ] [owner] <one concrete action>
  - Dependencies:
  - Acceptance:
  - Validate:

## Cross-phase verification
- [ ] Security and authorization
- [ ] Data and migration/seed integrity
- [ ] GraphQL/codegen and client integration
- [ ] Accessibility and responsive/platform-native behavior
- [ ] Fidelity QA
- [ ] Lint, typecheck, tests, and build

## Decisions and blockers
- ⚠ blocked:
- Decisions:
- Assumptions:

## Progress log
- <date>: <change and evidence>

## Reconciliation report
- Canonical documents compared:
- Preserved unchanged tasks:
- Reopened tasks and reasons:
- New or revised tasks:
- Resolved or retained blockers:
- Superseded/removed tasks and history pointers:
- Validation still required:
```

## Output

Write or update only the root `TASK_<project-slug>.md`. Open it for the user
and summarize the current phase, immediately executable tasks, blockers, and
protected boilerplate architecture that will be reused.
