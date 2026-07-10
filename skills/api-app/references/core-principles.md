# Core Principles

The canonical non-negotiables and implementation workflow live in `SKILL.md`; this doc explains the principles behind them.

## Pattern consistency

- Follow the existing codebase structure, naming, data-flow, and module/resolver/service/repository patterns.
- Before writing anything new, find the closest existing module and mirror its shape — file names, DI wiring, method signatures, error handling.
- Deviate only when truly necessary; keep deviations minimal and document the rationale in the change.
- Do not keep deprecated APIs or libraries when a maintained alternative exists.

## Instruction priority

1. `apps/*-api/CLAUDE.md` / `AGENTS.md` — the primary standard (kept in sync with each other).
2. This skill's `SKILL.md` non-negotiables and the reference docs.
3. Established patterns already in the codebase.
4. General NestJS/GraphQL/Mongoose best practice.

When these conflict, the higher item wins. When the standard is silent, prefer the dominant existing pattern over external convention.

## Scope discipline

- Keep changes scoped to the module that owns the behavior; prefer feature-based work over broad refactors.
- Validate the smallest relevant slice first (the affected module's specs and codegen), not the whole repo.
- Concrete/project-specific values (collection names, role names, env keys) live in app source — never in this skill.

## Layering in one sentence

SDL defines the contract → generated types define the shapes → resolvers authenticate and delegate → services own business logic → repositories own persistence. Nothing skips a layer.

## Related References

- `module-structure.md` — how the layering maps to files and DI
- `graphql-schema.md` — the contract layer
- `codegen-and-testing.md` — keeping generated types and clients in sync
