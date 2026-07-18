# State Management

## State Boundaries

Keep state boundaries clear.

| Layer | Where it belongs |
| --- | --- |
| Server state | Query or GraphQL caches |
| Client UI state | Components, hooks, or reducers |
| Session and auth state | Providers |

Do not duplicate the same source of truth across multiple layers unless synchronization is explicit and necessary.

## Prototype boundary

Prototype-local state demonstrates the required UI outcome; it does not select
the production owner. Do not copy mock entities, local permission flags, or
mutation results into component state, reducers, or Context when they belong to
the server or session. Map every value first, keep server records in the query
cache, and implement optimistic changes in that cache with rollback instead of a
second local source of truth.

Avoid prop drilling through 3 or more levels of intermediate components. Use context, composition, or a state-management library when state is shared broadly.

---

## Decision Guide

| Situation | Pattern |
| --- | --- |
| Simple local state | `useState` |
| Complex local state | `useReducer` |
| Shared structured state across several components | `useReducer` + Context |
| High-frequency shared state across many consumers | external store such as Zustand |

---

## When to Prefer `useReducer` Over Multiple `useState`

Prefer `useReducer` when:

- 3 or more state values update together
- The next state depends on the previous state
- Transitions are event-driven and easier to model with actions
- Update logic is becoming scattered across handlers

---

## Effect Rules

Do not create effect-driven render loops:

- Do not place hooks inside `useEffect`.
- Avoid effects that both read and write the same state dependency in a circular way.
- Prefer functional state updates when the next state depends on the previous state.
- Stabilize object and array dependencies with `useMemo`, `useRef`, or primitive dependency lists where appropriate.

---

## Related References

- `references/reducer.md` — `useReducer` patterns for complex local state
- `references/reducer-context.md` — `useReducer` + Context, split context, scaling patterns
- `references/react-patterns.md` — Provider pattern, HOC, custom hooks
