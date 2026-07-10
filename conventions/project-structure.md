# Project Structure

> Reach for this document when deciding where new code belongs, moving files, adding a feature, or reviewing whether a change respects the boilerplate's Nx monorepo boundaries.

## Workspace map

```text
.
├── apps/
│   ├── app-admin/              # Next.js admin web application
│   ├── app-api/                # NestJS GraphQL and REST API
│   └── app-mobile/             # Expo React Native application
├── packages/
│   └── shared-constants/       # Cross-app types, constants, schemas, and pure logic
├── .claude/skills/             # Claude-facing reusable implementation standards
├── .codex/skills/              # Codex-facing reusable implementation standards
├── .agents/skills/             # Tooling and workspace skills
├── AGENTS.md                   # Repository-wide agent rules
├── nx.json                     # Nx plugins and task configuration
├── package.json                # Root scripts and npm workspaces
└── tsconfig.base.json          # Strict shared TypeScript baseline
```

The repository uses npm workspaces for `apps/*` and `packages/*`. Run projects through Nx and keep app-specific code inside the owning application.

## Ownership rules

- Put admin UI, browser behavior, and Next.js routes in `apps/app-admin`.
- Put native screens, Expo Router routes, device behavior, and NativeWind UI in `apps/app-mobile`.
- Put GraphQL SDL, resolvers, services, repositories, REST controllers, authentication, scheduling, and infrastructure adapters in `apps/app-api`.
- Put only platform-neutral types, constants, schemas, and pure business logic in `packages/shared-constants`.
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

### Admin and mobile features

- Follow the nearest existing feature's route, component, hook, provider, query, and form layout.
- Keep route-only components close to their route.
- Promote a component to shared app-level UI only after it is reused across features.
- Keep platform-specific implementations separate even when admin and mobile expose the same capability.
- Import cross-app contracts from `@app/shared-constants`; do not copy them into each app.

## GraphQL placement

- Treat SDL files as the public API source of truth.
- Put shared scalars and interfaces in a shared schema file.
- Let feature schemas extend `Query` and `Mutation`.
- Change SDL before regenerating generated TypeScript types.
- Never edit generated GraphQL files by hand.

## Agent standards

Implementation standards are mirrored under `.claude/skills` and `.codex/skills`. When a reusable rule changes:

- Update the owning app's standard.
- Mirror client-agnostic rules between web and mobile references when both apply.
- Mirror API contract rules into affected client GraphQL or caching references.
- Keep API-specific guidance synchronized between `apps/app-api/AGENTS.md` and `apps/app-api/CLAUDE.md` until a dedicated API skill exists.

## Placement checklist

Before adding a file, ask:

- Which app owns this behavior?
- Is this platform-specific?
- Does an equivalent feature already establish the folder pattern?
- Is the code genuinely shared, pure, and free of framework dependencies?
- Will placing it here keep the change scoped and discoverable?
