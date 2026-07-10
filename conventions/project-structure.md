# Project Structure

> Reach for this document when deciding where new code belongs, moving files, adding a feature, or reviewing whether a change respects the boilerplate's Nx monorepo boundaries.

## Workspace map

```text
.
├── apps/
│   ├── app-web/                # Next.js admin web application
│   ├── app-api/                # NestJS GraphQL and REST API
│   └── app-mobile/             # Expo React Native application
├── packages/
│   └── shared-constants/       # Cross-app types, constants, schemas, and pure logic
├── .agents/skills/             # Agent tooling and workspace instructions
├── AGENTS.md                   # Repository-wide agent rules
├── nx.json                     # Nx plugins and task configuration
├── package.json                # Root scripts and npm workspaces
└── tsconfig.base.json          # Strict shared TypeScript baseline
```

The repository uses npm workspaces for `apps/*` and `packages/*`. Run projects through Nx and keep app-specific code inside the owning application.

## Ownership rules

- Put web UI, browser behavior, and Next.js routes in `apps/app-web`.
- Put native screens, Expo Router routes, device behavior, and NativeWind UI in `apps/app-mobile`.
- Put GraphQL SDL, resolvers, services, repositories, REST controllers, authentication, scheduling, and infrastructure adapters in `apps/app-api`.
- Put only product-neutral types, constants, schemas, and pure business logic used by two or more applications in `packages/shared-constants`.
- Do not share web UI components with React Native.
- Do not create a shared package for code used by only one app.
- Keep changes inside the owning app unless a contract or genuinely reusable rule crosses app boundaries.

## Feature organization

Follow the established structure in the affected app before creating a new pattern. Prefer feature/domain colocation over global folders containing unrelated code.

### API domain module

Each API domain belongs in `apps/app-api/src/modules/<domain>/`:

```text
<domain>/
├── <domain>.module.ts
├── <domain>.resolver.ts
├── <domain>.service.ts
├── <domain>.validation.ts       # When request/write validation is shared
└── repositories/
    ├── <domain>.repository.ts
    └── <domain>.repository.module.ts
```

Rules:

- Keep resolvers and controllers thin; delegate business behavior to services.
- Access MongoDB through the repository abstraction, never directly from a resolver or service.
- Use exactly one repository factory per `.repository.ts` file.
- Align names across the module, resolver, service, repository, tests, and GraphQL schema.
- Put reusable transport validation in a feature validation file or a shared validation pipe.
- Keep tests beside the implementation as `*.spec.ts`.

### Web and mobile features

- Follow the nearest existing feature's route, component, hook, provider, query, and form layout.
- Keep route-only components close to their route.
- Promote a component to shared app-level UI only after it is reused across features.
- Keep platform-specific implementations separate even when admin and mobile expose the same capability.
- Import genuinely shared, product-neutral contracts from `@app/shared-constants`; keep app-specific and single-consumer values in the owning app.

## GraphQL placement

- Treat SDL files as the public API source of truth.
- Put shared scalars and interfaces in a shared schema file.
- Let feature schemas extend `Query` and `Mutation`.
- Change SDL before regenerating generated TypeScript types.
- Never edit generated GraphQL files by hand.

## Agent instructions

- Treat the root `AGENTS.md` as the repository-wide authority.
- Use relevant instructions under `.agents/skills/` when the task matches them.
- Keep reusable guidance product-neutral; do not hardcode paths from another project.
- Update instructions only when a durable repository rule changes, not for one-off implementation details.

## Placement checklist

Before adding a file, ask:

- Which app owns this behavior?
- Is this platform-specific?
- Does an equivalent feature already establish the folder pattern?
- Is the code genuinely shared, pure, and free of framework dependencies?
- Will placing it here keep the change scoped and discoverable?
