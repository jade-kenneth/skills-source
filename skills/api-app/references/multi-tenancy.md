# Multi-Tenancy

One backend serves all tenants. Every tenant-owned feature must be tenant-scoped end to end — a missing `tenantId` in any layer is a data-leak bug, not a style issue.

## How tenant context is established

The tenant middleware (`src/common/middleware/tenant.middleware.ts`) decodes the JWT, looks up the tenant by its slug claim, validates the tenant is active, and sets `req.tenantId`. Resolvers read it via the `@CurrentTenant()` decorator (`src/common/decorators/`).

The platform-wide super-admin role bypasses tenant scoping — it carries no tenant slug and operates across tenants. Everyone else is always scoped.

## Threading rule

When adding a tenant-owned feature, thread `tenantId` through **resolver → service → repository**:

- The resolver reads `@CurrentTenant()` and passes `tenantId` into the service as an explicit parameter.
- The service passes it into every repository read and write for that tenant's data.
- The repository query composes `tenantId` with the caller's filter — tenant scoping is added to the filter, never replaced by it and never left to the client to supply.

## Rules

- Never accept `tenantId` from client-supplied input for tenant-owned data; it comes from the authenticated request context only.
- Every query, mutation, count, and scheduled sweep over tenant-owned collections includes the tenant scope. Cross-tenant reads are a deliberate, super-admin-only exception.
- Persist `tenantId` on every tenant-owned record at write time.
- When testing, cover the "wrong tenant" case: a valid ID belonging to another tenant must behave as not-found.

## Related References

- `auth-patterns.md` — the JWT and roles the middleware relies on
- `filtering-pagination.md` — composing tenant scope with filters
- `scheduled-work.md` — tenant scoping inside cron sweeps
