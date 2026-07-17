# Authentication & Authorization

Auth is a dedicated module boundary (`src/modules/auth/`) with clear role separation. The in-app deep dive is `src/modules/auth/AUTHENTICATION.md` — read it before changing auth internals.

## Role separation

- **module** — wires imports, providers, exports, and runtime config
- **service** — registration, login, logout, current-user lookup, password verification, token generation
- **resolver/controller** — thin; delegates to service
- **strategy** — validates credentials/tokens and loads the authenticated user
- **guards** — enforce authentication and authorization at the transport boundary
- **decorators** — expose current user, public endpoints, role/permission metadata

## Rules

- Typed token payloads and current-user objects; no `any`.
- Load secrets and token expiration from validated runtime config; fail fast on startup.
- Password hashing and token signing stay in the service layer, not resolvers.
- For GraphQL, bridge the request into the execution context so guards and decorators work.
- Export only what other modules genuinely need (guards, service, token utilities).

## Role contracts and resource access

- Treat the established user-role enum as the canonical API authorization
  contract across SDL, generated types, guards, decorators, services, and
  persistence when a feature has the same values, permissions, and lifecycle.
  Do not introduce a renamed or overlapping feature-role enum merely to add
  domain context.
- Create a separate role-like enum only for genuinely different domain
  semantics or an independently scoped lifecycle, and document that distinction
  at the contract boundary.
- A global user role does not replace resource access. Enforce it with the
  established guard and role decorator at the transport boundary, then require
  active tenant, membership, ownership, or equivalent resource scope in the
  service/repository so the role cannot grant access to unrelated records.
- If resource rows retain denormalized role snapshots, synchronize accepted rows
  when the canonical user role changes. Keep pending invitations or other
  pre-acceptance state on their proposed role until the lifecycle makes it
  authoritative, and backfill existing accounts before deploying the new rule.
- Before merging overlapping role enums, audit every consumer. Preserve a
  distinct elevated role for platform-only or infrastructure operations so a
  feature role does not widen unrelated privileges.

## Protecting resolvers

- Protect resolvers with the GraphQL auth guard + roles guard, annotate with `@Roles(...)`, `@Public()`, and read the caller with `@CurrentUser()` (from `src/modules/auth/decorators`).
- Access + refresh tokens are JWTs handled by the strategies in `src/modules/auth/strategies`.
- REST endpoints with side effects declare auth intent at the method boundary — see `service-implementation.md` § REST endpoints.

## Health check

- Expose `GET /health` (REST) and `_health` query (GraphQL) backed by real runtime state.
- Reflect database connection readiness: `ok` when connected, `degraded` otherwise.

## Related References

- `multi-tenancy.md` — the tenant middleware runs on the same decoded JWT
- `service-implementation.md` — REST guard pairing, validation ownership
- `module-structure.md` — module boundary conventions
