# Code Style

> Reach for this document when writing or reviewing application code, naming APIs and types, handling errors, validating input, or deciding the shape of GraphQL and REST responses.

## General rules

- Use strict TypeScript and preserve the root compiler guarantees: no implicit returns, no unused locals, no fallthrough, and no unchecked overrides.
- Prefer focused, readable components and functions over clever abstractions.
- Follow the nearest established pattern before introducing a new one.
- Keep a deviation minimal and explain why it is necessary.
- Use maintained APIs and libraries; do not add or preserve deprecated approaches.
- Inline simple trim or required-field checks. Do not create tiny one-use helpers such as `normalizeRequiredString`.
- Use explicit loading, error, success, and empty states in user-facing flows.
- Keep UI copy simple and direct.

## Naming

### TypeScript and files

- `PascalCase`: classes, React components, GraphQL object/input/enum types.
- `camelCase`: variables, functions, hooks, methods, and object properties.
- `UPPER_SNAKE_CASE`: constants that represent fixed sets and GraphQL enum values.
- `kebab-case`: feature directories and general filenames.
- Use framework suffixes consistently: `*.module.ts`, `*.resolver.ts`, `*.service.ts`, `*.controller.ts`, `*.repository.ts`, `*.validation.ts`, and `*.spec.ts`.
- Use `useX` for React hooks and `XProvider` for context providers.
- Prefer descriptive domain names over generic names such as `data`, `item`, or `handler` when the meaning is not obvious.

### GraphQL

- Use singular entity type names and plural collection query names.
- Use `CreateXInput` and `UpdateXInput` for mutation inputs.
- Use `XFilterInput` for top-level filters and `XFieldFilterInput` for reusable field filters.
- Use `searchByX` for dedicated search queries.
- Expose entity identifiers as `id: ID!`; never leak MongoDB `_id`.
- Use concrete `XEdge` and `XConnection` types for paginated collections.
- Use `[Type!]!` for lists that are always present; make fields nullable only when absence is meaningful.

## Imports and formatting

- Use type-only imports when a value is not required at runtime.
- Keep imports deterministic and avoid duplicates.
- Let the repository formatter own spacing, quotes, semicolons, and wrapping.
- Do not add a second ESLint or Prettier configuration when one already exists.
- Keep framework-specific lint rules inside the relevant app rather than the root baseline.

## Validation and error handling

### API input validation

- Validate at the transport boundary and again where business rules are owned.
- Use Zod schemas for structured REST bodies and shared write rules.
- Use the service-validated GraphQL args decorator for resolver `input` arguments when SDL owns shape/nullability and the service owns business validation.
- Keep resolvers/controllers thin by passing parsed values to the service.
- Reject unknown REST body keys with strict schemas when the endpoint contract is closed.
- Validate storage namespaces, MIME allowlists, traversal, and absolute paths before signing uploads.
- Generate final storage keys server-side instead of trusting caller-supplied object keys.

### Error shape

For validation failures, return a stable machine-readable structure:

```ts
{
  message: 'Input validation failed.',
  errors: [
    {
      field: 'input.email',
      message: 'email must be a valid email address.',
    },
  ],
}
```

Rules:

- `message` summarizes the failure category.
- `errors` contains field-specific details.
- `field` uses a dotted path when nested.
- `message` is safe, specific, and written for the client; never expose stack traces or persistence details.
- Throw NestJS exceptions from API boundaries/services rather than returning ad hoc error objects.

### Client errors

- Query failures render an inline error state with a retry action.
- Mutation failures use transient toast feedback unless the error belongs to a specific field.
- Form validation appears beside the affected field.
- Render crashes use the platform's error boundary.
- Do not display raw server errors directly; map known errors to user-safe copy.
- Never swallow errors silently. Log or surface them at the correct layer.

## API response conventions

### GraphQL

GraphQL operations return typed domain payloads directly. Do not wrap successful GraphQL data in a second `{ success, data, message }` envelope because GraphQL already provides the `data` and `errors` transport envelope.

- Use explicit payload/result types when a mutation needs more than one return value.
- Keep error codes and validation details stable for client mapping.
- Keep database-specific fields out of the schema.
- Paginate collections that can grow; use concrete connection types.
- Clamp page sizes through the shared repository policy rather than local limits.

### REST

- Return the endpoint's typed result directly for successful requests unless an existing controller establishes a wrapper.
- Use NestJS HTTP exceptions for failures.
- Keep validation errors in the standard `message` plus `errors[]` structure.
- Do not mix multiple success-envelope shapes across controllers.

## Service and persistence rules

- Keep business logic in services.
- Use repositories for persistence and shared page-size/filter/sort behavior.
- Pass structurally compatible repository filters and sorts through without local normalization objects.
- Perform external side effects before persisting terminal success state.
- Make rollback or transaction boundaries explicit when operation order cannot safely change.
- Protect side-effecting REST endpoints with authentication and role guards at the method boundary.

## Tests

- Add or update colocated `*.spec.ts` tests for validation, authorization, service behavior, and regression paths.
- Test observable behavior and contract shape, not private implementation details.
- Include rejected input and authorization cases, not only the happy path.
