# Module Structure

Every domain follows **resolver → service → repository**. Resolvers stay thin (guards + decorators, delegate to the service); services own business logic; repositories own persistence.

## File layout

Each domain module lives at `src/modules/<domain>/` with:

```
<domain>.module.ts
<domain>.resolver.ts
<domain>.service.ts
repositories/
  <domain>.repository.ts       ← exactly one RepositoryFactory per file
  <domain>.repository.module.ts
```

- Names align across module / resolver / service / repository.
- The module imports its repository module, provides its service and resolver, and exports the service when other modules depend on it.
- Resolvers stay thin — delegate all business logic to the service.
- Repository access goes through the repository abstraction; never call Mongoose directly from resolvers or services.
- Use the DI token pattern from `src/types/tokens.ts`.

## Wiring template

```ts
// module
@Module({
  imports: [DomainRepositoryModule],
  providers: [DomainService, DomainResolver],
  exports: [DomainService],
})
export class DomainModule {}

// repository module
@Module({
  providers: [{
    provide: TOKENS.DOMAIN_REPOSITORY,
    useFactory: DomainRepositoryFactory,
    inject: [getConnectionToken()],
  }],
  exports: [TOKENS.DOMAIN_REPOSITORY],
})
export class DomainRepositoryModule {}

// service injection
@Injectable()
export class DomainService {
  constructor(
    @Inject(TOKENS.DOMAIN_REPOSITORY)
    private readonly repository: DomainRepository,
  ) {}
}
```

## Provider inheritance and constructor injection

Nest resolves constructor dependencies from runtime metadata on the provider
class. When a concrete provider extends an abstract base whose constructor
accepts injected collaborators, declare that constructor on every concrete
provider and forward the arguments through `super(...)`. Do not rely on an
inherited constructor to expose the concrete provider's injection contract.

```ts
abstract class BaseAdapter {
  constructor(protected readonly config: ConfigService) {}
}

@Injectable()
export class ConcreteAdapter extends BaseAdapter {
  constructor(config: ConfigService) {
    super(config);
  }
}
```

- Let the base constructor own shared `protected readonly` fields. The concrete
  constructor declares the dependency for injection and forwards it; it should
  not create a second property for the same collaborator.
- Register concrete subclasses as providers when callers select or inject those
  implementations. Do not register an abstract base merely because subclasses
  extend it.
- An abstract class can intentionally be a runtime DI token through an explicit
  custom-provider mapping such as `{ provide: BaseAdapter, useClass:
  ConcreteAdapter }`. That is a separate contract decision, not a substitute for
  making each concrete class's constructor dependencies explicit.
- Cover inherited provider behavior with a Nest testing module that resolves the
  concrete class and exercises a base method using the injected collaborator.
  When diagnosing missing injection, inspect `design:paramtypes` and any
  self-declared `@Inject()` metadata on the concrete provider.

## Cross-cutting infra (use, don't reinvent)

- **In-process events** — `@nestjs/event-emitter` for decoupled side effects within the process.
- **Async events** — the optional Kafka producer/consumer layer in `src/libs/async-event-module` (gated by env) for cross-process side effects like email.
- **Scheduling** — `@nestjs/schedule` cron jobs coordinated through the scheduler-locks module (see `scheduled-work.md`).
- **Config** — env is validated at boot by the Zod schema in `src/config/`; feature code reads validated config, never raw `process.env`.
- **Shared request infra** — middleware, guards, decorators, and validation pipes live under `src/common/`; only put code there when it is genuinely cross-domain.

## Related References

- `repository-pattern.md` — the repository half of the wiring
- `graphql-schema.md` — the contract the resolver implements
- `service-implementation.md` — what belongs in the service
- `multi-tenancy.md` — threading tenant context through the layers
