# Preview State Harness

Deterministic, development-only rendering of screen states whose triggers are
externally controlled — so fidelity QA can inspect every designed state on
demand without putting mock behavior into the production path.

## The problem this solves

A query-backed screen passes through states the developer does not control at
inspection time:

```
mount → brief loading → populated or empty
                    ↘ occasional error
```

Loading lasts milliseconds, error requires a real network failure, and empty
requires changing real data. The naive fixes — mock arrays, `isDemo` flags,
fake delays, random failure injection inside production code — trade an
inspection problem for a correctness problem: fake state can ship, and mocks
drift silently from the real schema. `common-anti-patterns.md` and the
Prototype boundary in `state-management.md` already forbid those fixes; this
reference defines the compliant alternative.

## Architecture

Two paths, one screen:

```
Release build:  Screen → query hook → data client → API        (only path that exists)
Dev build:      Screen → explicit state selector → typed fixture
```

The preview path is gated behind `__DEV__` so it is compiled out of release
builds — real users always hit the real query. State is selected explicitly
(`loading`, `error`, or a named fixture); nothing is simulated with timers or
randomness.

## Scope — any externally controlled input

Query data is the canonical case, but the same harness pattern applies to any
input the UI reacts to that cannot be produced on cue: mutation outcomes
(server rejection, conflict), pagination edges (loading-more, end-of-list,
mid-scroll failure), subscription/connection state, auth and session states,
device states (permission denied, offline), time-dependent content (fix the
clock in dev), and feature flags. Add a substitution only when a real screen
needs it — never speculatively.

## Rules

1. **Production ownership is untouched.** Server state stays owned by the
   configured data client per the Prototype boundary in
   `state-management.md`; the harness substitutes what a screen *renders* in
   dev, never what the app *stores*. It must not become a second source of
   truth.
2. **Gate the preview path behind an unmistakable development-only check.**
   Use `__DEV__` (or the platform's compile-time equivalent) so the code is
   excluded from release builds — not merely hidden. Review blocks any
   preview path reachable in a release build.
3. **Type fixtures against the generated query contract.** Declare each
   fixture with `satisfies <GeneratedQueryType>` (see `satisfies` in
   `typescript-patterns.md`) so a schema change fails the build at the stale
   fixture instead of letting the preview drift silently. Never hand-write a
   parallel type for fixture data.
4. **Select states explicitly.** The harness renders the state it is told to
   render — no fake delays to "catch" loading, no random failures. Every
   required state is addressable by name.
5. **Preserve real state interactions inside the harness.** Interactive
   transitions must still work — e.g. pressing "Try again" on the previewed
   error state transitions the preview to the populated fixture, so retry UX
   is inspectable, not just static.
6. **Keep the resolver pure and verifiable.** Implement state resolution as a
   pure function (query result + selected state + fixtures → rendered result)
   so it is unit-testable where a test runner exists; at minimum the fixture
   typing is enforced by typecheck. Verify selector behavior, canonical copy,
   and load-bearing geometry.
7. **Capture the full matrix during fidelity QA.** Every required state
   (loading, empty, error, populated, plus screen-specific ones) in both
   themes and at representative viewports, compared side-by-side with the
   design prototype.
8. **A green preview proves nothing about the backend.** Fixtures verify
   presentation-state fidelity only. Real API, wiring, and seed-data checks
   still require at least one end-to-end pass per flow against live seed
   data. Seed the database minimally to prove the pipes; use fixtures for
   the visual checks after that. Never reseed or delete live data merely to
   photograph a state.

## Reference shape

```tsx
// hooks/use-query-state-preview.ts — dev-only harness (structural, no casts)
export type PreviewableQueryResult<Data> = {
  isLoading: boolean;
  isError: boolean;
  data: Data | undefined;
  refetch: () => void;
};

// features/<feature>/<screen>-preview-fixtures.ts
export const screenPreviewFixtures = {
  populated: { /* … */ } satisfies ScreenQuery,
  empty: { /* … */ } satisfies ScreenQuery,
};

// screen component — inert unless a dev sets a preview state
const query = useScreenQuery();
const { isLoading, isError, data, refetch } = useQueryStatePreview(query, {
  fixtures: screenPreviewFixtures,
});
```

The boilerplate ships this harness (`apps/*-mobile/hooks/use-query-state-preview.ts`)
with a canonical usage on the Home screen; reuse it rather than reinventing a
per-screen mechanism.
