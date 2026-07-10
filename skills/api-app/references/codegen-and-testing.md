# Codegen & Testing

## GraphQL codegen (run after every schema change)

The API is schema-first: editing any `.gql` under `src/graphql/schemas/` requires regenerating types on **every** side that consumes the schema, in the same change:

```bash
cd apps/*-api    && npm run generate-graphql-types   # server interfaces → src/graphql/generated/
cd apps/*-admin  && npm run codegen                  # admin typed operations
cd apps/*-mobile && npm run codegen                  # mobile typed operations
```

- Clients point `graphql-codegen` directly at the API's `.gql` files, so the API workspace must be present locally.
- Never hand-edit generated files. If a generated type looks wrong, the SDL is wrong — fix it there and regenerate.
- A schema change is not done until both server and affected client types regenerate cleanly and typecheck.

### Contract changes affect clients

When a change alters the GraphQL contract (field added/removed/renamed, nullability change, new required argument, pagination shape change), check the client operation documents and hooks that consume it — an API-side change that compiles can still break a client operation at runtime. Coordinate the client update in the same initiative.

## Testing

- Jest, with `*.spec.ts` colocated next to the source under `src/` (`rootDir = src`).
- Run from the API workspace:

```bash
cd apps/*-api && npm test
npx jest path/to/file.spec.ts          # single file
npx jest -t "describes this case"      # by test name
```

- Validate the smallest relevant slice first: the specs for the module you touched, then broader checks.
- Test services against a mocked repository (the `Repository<XRecord>` interface makes this cheap); don't spin up a real database for unit specs.
- For tenant-owned features, include the wrong-tenant case: a valid ID from another tenant behaves as not-found.
- For scheduled work, test the idempotency path: a record whose reminder timestamp is already stamped must not re-send.

## Related References

- `graphql-schema.md` — the SDL the codegen consumes
- `multi-tenancy.md` — the wrong-tenant test case
- `scheduled-work.md` — the idempotency test case
