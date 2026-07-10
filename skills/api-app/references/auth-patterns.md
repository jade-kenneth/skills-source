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
