# Filtering, Sorting, Pagination & Search

List surfaces are built on the base repository in `src/libs/repository.ts` (typed `filter`/`sort`, cursor-based Relay connection pagination via `first`/`after`, and the shared page-size policy). SDL arguments must be structurally compatible with the repository types so they pass straight through.

## Filter rules

SDL `filter` arguments must be structurally compatible with `RepositoryFilter<XRecord>` from `src/libs/repository.ts`. Pass the filter through directly — no `normalizedFilter` variables, no mapping logic.

**Required signature in both layers:**

`<x>.resolver.ts`:
```ts
async xs(
  @Args('filter') filter?: RepositoryFilter<XRecord>,
  @Args('first') first?: number,
  @Args('after') after?: string,
): Promise<XConnection> {
  return this.xService.listXs(filter, first, after);
}
```

`<x>.service.ts`:
```ts
async listXs(
  filter?: RepositoryFilter<XRecord>,
  first?: number,
  after?: string,
): Promise<XConnection> {}
```

- Never use `XFilterInput` as a TypeScript parameter type in resolver or service.
- Always apply `RepositoryFilter` to the record type (`XRecord`), not the GraphQL output type (`X`).
- Non-filter controls (sort, search, pagination) are separate top-level arguments, not inside `filter`.

## Enum filter rules

Every filterable enum field gets a dedicated `XEnumFilterInput`:

```gql
input XEnumFilterInput {
  equal: XEnum
  notEqual: XEnum
  in: [XEnum!]
  notIn: [XEnum!]
}

input XFilterInput {
  xField: XEnumFilterInput
}
```

## Sorting rules

SDL `sort` arguments must be structurally compatible with `RepositorySort<XRecord>`. Pass through directly — no `normalizedSort` variables.

```gql
x(filter: XFilterInput, sort: XSortInput, first: Int, after: Cursor): XConnection!

input XSortInput {
  createdAt: SortDirection
  title: SortDirection
}
```

## Pagination rules

- Root GraphQL `Query` fields that can grow with tenant or user data must return a concrete `XConnection!`, not an unbounded `[X!]!`.
- Every cursor or offset paginated repository read must use the shared page-size policy from `src/libs/repository.ts` (`DEFAULT_PAGE_SIZE`, `MAX_PAGE_SIZE`, `clampPageSize`). Do not hand-roll local max/min page-size logic.
- Dedicated `searchByX` queries may keep their flat list shape, but their `first` argument must be clamped with `clampPageSize(first, DEFAULT_SEARCH_LIMIT)` before reaching repository search.
- Flat `[X!]!` root lists are allowed only when they are domain-bounded by a small enum/config set or are intentionally capped in the service. Add a short code comment explaining the bound.

## Search rules

No generic `search` field inside filter inputs. Implement search via the repository `search(...)` method and expose it as a dedicated query:

```gql
searchByX(search: String!, first: Int, after: Cursor): [X!]
```

## Related References

- `graphql-schema.md` — naming and layout for filter/sort inputs
- `repository-pattern.md` — the repository the filters pass into
- `multi-tenancy.md` — tenant scoping composes with filters, it never replaces them
