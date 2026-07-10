# GraphQL Schema (SDL) Authoring

The API is **schema-first**: SDL files under `src/graphql/schemas/**/*.gql` are the source of truth for the GraphQL contract, compiled to TypeScript interfaces in `src/graphql/generated/`. Resolvers import those generated interfaces — never hand-write or hand-edit GraphQL types. Change SDL first, then regenerate (see `codegen-and-testing.md`).

## SDL contract

- Shared scalars and interfaces go in a shared schema file. Feature schemas use `extend type Query` and `extend type Mutation`.
- GraphQL types describe **API meaning, not database storage**. Do not encode ORM/ODM naming into the public schema.

## ID rules

- Use `id: ID!` for entity identifiers. Never expose `_id` or other database-specific identifiers.
- Use `ID` for relation fields. Map persistence identifiers to `id` at the API boundary.

## Type design

- Entity types implement `Node` when the schema uses it. Summary/aggregate types do not.
- Use concrete edge and connection types (`XEdge`, `XConnection`), not abstract `Edge` or `Connection` directly.
- `[Type!]!` for lists that are always present. Only nullable when a value can genuinely be absent.

## Nullability contract

- SDL query output is the source of truth. If a query returns `field: Type!`, the corresponding input must also be `field: Type!`.
- Nullable inputs are only allowed when the output is nullable or the field is genuinely optional at write time (e.g. `UpdateXInput`).

## Naming standards

- PascalCase: type names, input names, enum names, edge/connection names.
- UPPER_SNAKE_CASE: enum values.
- Singular entity types, plural collection queries.
- `CreateXInput` / `UpdateXInput` for mutation inputs.
- `XFilterInput` for top-level filters, `XFieldFilterInput` for reusable field-level filters.
- `searchByX` for dedicated search queries.

## SDL file layout

Top-level declarations in this order:

1. Enums
2. Reusable filter/scalar input types
3. Main object types
4. Edge types
5. Connection types
6. Top-level filter inputs
7. Mutation input types
8. `extend type Query`
9. `extend type Mutation`

One field per line. One blank line between top-level declarations.

## Related References

- `filtering-pagination.md` — filter/sort/pagination/search argument shapes
- `codegen-and-testing.md` — regenerating types after SDL changes
- `module-structure.md` — where the resolver consuming the schema lives
