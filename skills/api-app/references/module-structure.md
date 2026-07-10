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
