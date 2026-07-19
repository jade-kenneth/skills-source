---
name: api-app
description: "API implementation standards for apps/*-api (NestJS + Apollo GraphQL schema-first + Mongoose/MongoDB + TypeScript). USE when writing, reviewing, or refactoring any code in apps/*-api. TRIGGERS: creating modules, resolvers, services, repositories, GraphQL schema (SDL) changes, filters, sorting, pagination, search queries, mutations, guards, auth, multi-tenancy, scheduled jobs/cron, validation, file uploads, codegen, API tests. EXAMPLES: 'add a query', 'add a mutation', 'create a module', 'add a filter', 'paginate this list', 'add a field to the schema', 'write a repository', 'add a cron job', 'protect this resolver', 'add tenant scoping', 'regenerate GraphQL types'."
---

# API App Skill

This skill enforces the implementation standard for the `apps/*-api` NestJS backend. Read it fully before writing or reviewing any code in this app.

The full standard lives in `apps/*-api/CLAUDE.md` and `apps/*-api/AGENTS.md` (kept in sync). The reference docs in `.claude/skills/api-app/references/` extend them with deep implementation guides. **This file is the hub**: the non-negotiables and implementation workflow below are the canonical versions — reference docs that summarize them defer to this file, and each reference doc ends with a *Related References* section linking the docs it depends on.

> **Portability — `apps/*-api`.** This skill targets the workspace under `apps/` whose folder name ends in `-api` (the reliable cross-repo convention, alongside `*-admin` and `*-mobile`). Paths below are written as `apps/*-api/…` or relative to its `src/`; substitute the actual folder name for the repo you are in. Do not hardcode a project-specific app name back into this skill — keep it suffix-based so it stays reusable.

---

## How to use this skill

1. **Read `apps/*-api/CLAUDE.md`** (or `AGENTS.md` — they are equivalent) — the primary standard. Every rule in this skill is derived from it.
2. **Consult the relevant reference doc(s)** from the map below based on what you are doing. When a task spans concerns (e.g. a new paginated query that needs SDL, a filter input, a repository method, and tenant scoping), follow the *Related References* links at the end of each doc rather than guessing.
3. **Match existing project patterns first** before introducing anything new. Find the closest existing module and mirror its shape.
4. **After any SDL change, run codegen** on the API and on every client that consumes the schema. See `references/codegen-and-testing.md`.
5. **Before finishing, re-check the Non-negotiables** below — they apply to every change, not only the ones your reference doc mentions.

---

## Quick reference map

Use the doc that matches your task.

### Foundations

| Task                                                 | Reference                          |
| ---------------------------------------------------- | ---------------------------------- |
| Onboarding / starting point                          | `apps/*-api/CLAUDE.md`             |
| Pattern consistency, instruction priority, workflow  | `references/core-principles.md`    |
| Module layout, DI tokens, resolver/service wiring    | `references/module-structure.md`   |

### GraphQL contract

| Task                                                     | Reference                              |
| -------------------------------------------------------- | -------------------------------------- |
| SDL authoring: types, inputs, naming, nullability, IDs   | `references/graphql-schema.md`         |
| Filters, enum filters, sorting, pagination, search       | `references/filtering-pagination.md`   |
| Regenerating server + client types after schema changes  | `references/codegen-and-testing.md`    |

### Data layer

| Task                                              | Reference                            |
| ------------------------------------------------- | ------------------------------------ |
| Repository factory pattern, base repository libs  | `references/repository-pattern.md`   |
| Cursor connections, page-size policy              | `references/filtering-pagination.md` |

### Behavior & business logic

| Task                                                        | Reference                               |
| ----------------------------------------------------------- | --------------------------------------- |
| Service validation, side-effect ordering, upload validation | `references/service-implementation.md`  |
| Auth module boundary, guards, decorators, strategies        | `references/auth-patterns.md`           |
| Tenant scoping, tenant middleware, role bypass              | `references/multi-tenancy.md`           |
| Cron jobs, scheduler locks, once-only reminders             | `references/scheduled-work.md`          |

### Quality

| Task                                    | Reference                             |
| --------------------------------------- | ------------------------------------- |
| Jest specs, what to test, how to run    | `references/codegen-and-testing.md`   |
| Audit output format, severity model     | invoke `audit` skill                  |

---

## Non-negotiables (apply every time)

These override any default behavior. Grouped by concern — every group applies to any change that touches it.

### Schema & contract

- **Prototype validation is not API validation** → UI prototypes may demonstrate errors with local/manual checks, but persisted writes must enforce business rules in the service, transport shape through the established validated resolver boundary, and authorization through guards/roles. Never treat a client or prototype check as sufficient protection.
- **Schema-first** → SDL files under `src/graphql/schemas/` are the source of truth. Never hand-edit generated GraphQL types; change SDL, then regenerate on the API **and** every client. See `references/codegen-and-testing.md`.
- **IDs** → expose `id: ID!`, never `_id` or other database-specific identifiers. Map persistence IDs to `id` at the API boundary. See `references/graphql-schema.md`.
- **Nullability** → SDL query output is the source of truth; a required output field means a required input field, except genuinely optional write-time fields (`UpdateXInput`). See `references/graphql-schema.md`.
- **Growing lists** → root query fields that grow with tenant or user data return a concrete `XConnection!`, never an unbounded `[X!]!`. Flat lists only when domain-bounded or intentionally capped, with a comment stating the bound. See `references/filtering-pagination.md`.

### Layering

- **Resolver → service → repository** → resolvers stay thin (guards + decorators + delegation); business logic lives in services; data access goes through the repository abstraction — never call Mongoose directly from resolvers or services. See `references/module-structure.md`.
- **Filters pass through** → resolver and service take `RepositoryFilter<XRecord>` / `RepositorySort<XRecord>` and pass them to the repository directly — no `normalizedFilter`/`normalizedSort` mapping layers, and never a GraphQL input type as a TS parameter type. See `references/filtering-pagination.md`.
- **Repository shape** → `XRepository` is a `type` alias for `Repository<XRecord>`; the factory returns the `MongooseRepository` instance directly; exactly one factory per `.repository.ts` file. See `references/repository-pattern.md`.
- **Page sizes** → every paginated or search read clamps `first` with the shared page-size policy from `src/libs/repository.ts` (`clampPageSize`, `DEFAULT_PAGE_SIZE`, `MAX_PAGE_SIZE`) — never hand-rolled min/max logic. See `references/filtering-pagination.md`.

### Security & tenancy

- **Tenant scoping** → every tenant-owned read/write threads `tenantId` from `@CurrentTenant()` through resolver → service → repository. Only the platform-wide super-admin role bypasses it. See `references/multi-tenancy.md`.
- **Auth at the boundary** → protect GraphQL resolvers with the auth guard + roles guard and `@Roles(...)`; REST endpoints with side effects declare auth intent at the method boundary. Never rely on body validation as authorization. See `references/auth-patterns.md`.
- **Uploads** → presigned upload/file-ingest endpoints validate namespace, reject traversal/absolute keys, enforce a MIME allowlist, and the service generates the final storage key — never the caller. See `references/service-implementation.md`.
- **Media processing** → when downloading a remote object to process it, stream the unbounded body to a uniquely created temporary file and hand path-based processors the file path; never buffer it into one in-memory byte array. Clean up the task directory in `finally`, and reject a body that cannot provide a stream. See `references/service-implementation.md`.

### Side effects & scheduling

- **Side-effect ordering** → in multi-step workflows, perform the side effect first and persist terminal state only after it succeeds; handle rollback explicitly when ordering cannot change. See `references/service-implementation.md`.
- **Deleting owned objects & quota** → when a record owns an external object and contributes to a usage counter, authorize, delete the object(s) in the server-owned namespace, release the server-verified persisted size, then delete metadata and reconcile — clamp counters at zero, and give cascades the same steps. Never drop only the row. See `references/service-implementation.md`.
- **Scheduled jobs** → recurring jobs acquire the shared scheduler lock and honor the runtime scheduler-enabled flag; once-only reminders persist a dedicated timestamp field, stamped only after the side effect succeeded. See `references/scheduled-work.md`.

### Code quality

- **No tiny helpers** → inline small validation/normalization; no `normalizeRequiredString`-style micro-helpers. Centralize only genuinely shared write-model rules. See `references/service-implementation.md`.
- **Typed everything** → typed token payloads, typed current-user objects, typed records; no `any`. Env is read through the validated runtime config, never raw `process.env` in feature code.

---

## Implementation workflow

When generating or modifying code, always follow this order.

**Understand & place**

1. Match existing project patterns first — find the closest existing module and mirror it.
2. Choose the simplest implementation that fits.
3. Place code in the owning module under `src/modules/<domain>/`; shared infra goes in `src/libs/` or `src/common/` only when genuinely cross-domain.

**Contract first**

4. For any API surface change, edit the SDL under `src/graphql/schemas/` first, following `references/graphql-schema.md` (naming, layout, nullability, IDs).
5. Regenerate server types, then wire resolver → service → repository against the generated interfaces.

**Build**

6. Follow `references/module-structure.md` for module/repository-module wiring and DI tokens.
7. For list surfaces, follow `references/filtering-pagination.md` (connection types, filter/sort pass-through, page-size clamping, dedicated search queries).
8. Thread `tenantId` per `references/multi-tenancy.md` for tenant-owned data; add guards/roles per `references/auth-patterns.md`.

**Verify**

9. Re-check the Non-negotiables above.
10. Run codegen on the API and affected clients; run the affected Jest specs. See `references/codegen-and-testing.md`.
11. For security-sensitive work (auth, uploads, REST side effects), verify against `references/service-implementation.md` and `references/auth-patterns.md`.
