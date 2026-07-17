# Repository Pattern

All persistence goes through the repository abstraction built on `src/libs/repository.ts` (types + page-size policy), `src/libs/moongose-repository.ts` (the Mongoose implementation), and `src/libs/cursor.ts` (cursor encoding). Never call Mongoose models directly from resolvers or services.

## Factory convention

Repository files follow a strict factory pattern. Never deviate from this shape:

```ts
import { Connection, Types } from 'mongoose';
import { type XRecord } from 'src/graphql/generated/graphql'; // or define inline
import { MongooseRepository } from 'src/libs/moongose-repository';
import { Repository } from 'src/libs/repository';

export type XRecord = { /* fields */ };

export type XRepository = Repository<XRecord>;

export async function XRepositoryFactory(
  connection: Connection,
): Promise<XRepository> {
  return new MongooseRepository<XRecord>(
    connection,
    'CollectionName',
    { /* schema fields */ },
    [ /* indexes */ ],
  );
}
```

**Rules:**

- `XRepository` is always a `type` alias for `Repository<XRecord>` — never a custom `interface` with re-declared methods.
- The factory returns the `MongooseRepository` instance directly — never wrap it in a manual object literal that re-delegates each method.
- Do not import or re-export `RepositoryFilter`, `RepositoryList`, or `RepositoryQueryOptions` from the repository file; consumers import them from `src/libs/repository` directly.
- Exactly **one** `RepositoryFactory` per `.repository.ts` file. Never add a second; create a new file instead.
- `RepositoryFilter` / `RepositorySort` are always applied to the record type (`XRecord`), not the GraphQL output type.

## Record types and generated contracts

When persisted fields mirror a generated schema-first GraphQL entity, derive
`XRecord` from that generated entity instead of repeating the public field
contract by hand. Use `Pick`, `Omit`, or an intersection to model the actual
storage shape:

```ts
import { type X } from 'src/graphql/generated/graphql';

export type XRecord = Omit<X, 'computedField'> & {
  internalField: string;
};
```

- Omit resolver-computed fields and add them when mapping a record to the
  GraphQL result.
- Reuse the full generated entity only when every required field is persisted
  with the same nullability and TypeScript type.
- Keep an explicit persistence type when storage-only, security-sensitive, or
  internal fields materially differ from the public contract. Never add an
  internal field to GraphQL merely to reuse a generated type.
- Regenerate the GraphQL types before changing a derived record and run the API
  typecheck and repository/service tests so contract drift fails visibly.

## Wiring into DI

The repository is provided by a sibling `<domain>.repository.module.ts` using a token from `src/types/tokens.ts`:

```ts
@Module({
  providers: [{
    provide: TOKENS.DOMAIN_REPOSITORY,
    useFactory: DomainRepositoryFactory,
    inject: [getConnectionToken()],
  }],
  exports: [TOKENS.DOMAIN_REPOSITORY],
})
export class DomainRepositoryModule {}
```

Services inject it via `@Inject(TOKENS.DOMAIN_REPOSITORY)`. Add new tokens to `src/types/tokens.ts`, matching the existing naming pattern.

## Related References

- `module-structure.md` — where the repository module sits in the domain module
- `filtering-pagination.md` — the filter/sort/pagination types the repository consumes
- `multi-tenancy.md` — tenant-scoped repository reads/writes
