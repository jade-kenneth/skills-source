# Service Implementation

Services own all business logic: validation of business rules, orchestration of repositories and side effects, and mapping between persistence records and API types.

## Validation

- Inline small validation and normalization logic; do not create tiny helpers like `normalizeRequiredString`.
- When multiple entry points share request/body or write-model rules, centralize those rules in a feature validation module or common pipe (see `src/common/validation/`) and pass the parsed result into persistence. Do not leave unused validation helpers beside write paths, and do not rely on ad-hoc controller defaults for required body fields.
- GraphQL resolver `input` arguments must use the service-validated args decorator (`src/common/decorators/`) when SDL handles shape/nullability and the service owns business-rule validation. This keeps resolvers thin while making validation ownership visible to readers and static audits.

## File uploads & ingest

For presigned upload or file-ingest endpoints, validate more than presence:

- Require an allowed storage namespace.
- Reject traversal or absolute keys.
- Enforce a MIME/type allowlist before signing any write.
- Do not accept caller-supplied final object keys for shared folders; clients may provide upload *intent* (namespace, content type), but the **service** generates the final unique storage key and extension.

## Side-effect ordering

In multi-step workflows with side effects, perform the side effect first and only persist terminal state after it succeeds. Handle rollback or transactional boundaries explicitly when ordering cannot change.

## REST endpoints

REST endpoints that perform side effects must declare authentication intent at the method boundary. For admin-only writes, pair the JWT auth guard with the roles guard and an explicit `@Roles(...)` annotation; do not rely on request-body validation as an authorization control.

## Related References

- `auth-patterns.md` — guards, roles, and decorators referenced above
- `module-structure.md` — where services sit in the module
- `scheduled-work.md` — side-effect ordering in scheduled sweeps
- `multi-tenancy.md` — tenant checks belong in the service path too
