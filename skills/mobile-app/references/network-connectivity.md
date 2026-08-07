# Network Connectivity

## Library

Use `@react-native-community/netinfo` for offline detection. Import the default export:

```ts
import NetInfo from '@react-native-community/netinfo';
```

---

## Subscribing to Connectivity State

`NetInfo.addEventListener` is the primary API. It fires immediately with the current state and on every change:

```ts
useEffect(() => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    const offline = state.isConnected === false;
    setIsOffline(offline);
    // animate banner in/out
  });

  return unsubscribe; // cleanup on unmount
}, []);
```

`state.isConnected` can be `null` (unknown), `true`, or `false`. Treat `null` as online to avoid false positives.

---

## NetworkErrorBanner

A non-blocking banner mounted once at the app root, above all content. Shows when offline, hides when reconnected:

```tsx
<Animated.View
  accessibilityLiveRegion="polite"
  accessibilityRole="alert"
  style={{ opacity }}
  className="absolute inset-x-0 top-0 z-50"
>
  <View className="px-4 py-2.5" style={{ backgroundColor: colors.error }}>
    <Text className="text-center text-sm font-semibold" style={{ color: colors.cardBg }}>
      No internet connection
    </Text>
  </View>
</Animated.View>
```

Use `Animated.timing` with `useNativeDriver: true` for the opacity transition (300ms). Return `null` when offline is `false` to skip the view entirely from the render tree.

---

## TanStack Query Integration

TanStack Query retries failed queries automatically. When the device comes back online `refetchOnReconnect: true` (the default) causes stale queries to refetch. No additional setup is needed — the NetInfo banner is purely visual feedback.

For features that need explicit reconnect behavior:

```ts
const queryClient = useQueryClient();

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected === true) {
      void queryClient.refetchQueries({ type: 'active', stale: true });
    }
  });
  return unsubscribe;
}, [queryClient]);
```

Only do this if the default `refetchOnReconnect` behavior is not sufficient.

---

## Cold Backends and the First Request of a Session

A backend that scales to zero when idle answers its first request in tens of seconds and every later request in well under one. The app's first pre-auth request — the one that gates the entry screen — is the request that pays this, and a plain spinner plus a short retry budget turns a recoverable wake-up into a visible failure, with the user hammering "Try again" until the server happens to be warm.

Diagnose before tuning: measure the endpoint warm (a single request from a shell). If warm latency is small, the wait is server wake-up, not a slow query — tune the client, do not "optimize" the query.

Three parts, applied together:

**1. Start the request during app bootstrap, not on screen mount.** Prefetch it alongside font loading and the session check so the instance boots behind the splash screen. Fire-and-forget — the screen's own query still owns error reporting and retries:

```ts
export function prefetchEntryList(): void {
  void queryClient.prefetchQuery({ queryKey, queryFn, staleTime, retry, retryDelay })
    .catch(() => {
      // The screen's own query surfaces failures.
    });
}
```

Pass the *same* retry options the screen query uses. Whichever of the two arrives second joins the in-flight fetch, so mismatched budgets make the effective budget depend on which one started first.

**2. Several short attempts, not one long one.** A stalled attempt learns nothing until it expires; re-probing on a fresh connection notices the moment the server finishes waking. Set a modest per-attempt timeout and let the *retry budget* be the thing that outlasts the cold start.

**3. Retry only transient failure classes.** Retry the error names that mean "never reached a working server" (service unavailable, internal error, unknown/network). Never retry validation, auth, or schema errors — they fail identically however often they are repeated, and retrying them just makes the user wait for a verdict that is already known.

```ts
retry: (failureCount, error) =>
  failureCount < MAX_RETRIES && RETRYABLE_ERROR_NAMES.has(error.name),
retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
```

**Escalate the loading copy instead of going silent.** A spinner that never changes reads as a hang. Track elapsed pending time and swap the message at a few seconds ("still loading") and again at ~10s ("this can take a moment"). Reaching the error state should mean the whole retry budget was spent, not that one attempt was slow.

```ts
export function useSlowRequestNotice(isPending: boolean): 'normal' | 'slow' | 'very-slow';
```

Reset the timer whenever the request stops being pending, and keep the stage-to-copy map next to the loading component rather than in the hook — the thresholds are generic, the wording is not.

---

## One-Shot Connectivity Check

For imperative checks before a mutation (e.g. file upload):

```ts
const state = await NetInfo.fetch();
if (!state.isConnected) {
  showToast({ type: 'error', message: 'No internet connection. Please try again.' });
  return;
}
```

---

## Rules

- Mount `NetworkErrorBanner` once at the root layout — not per-screen
- Check `state.isConnected === false` explicitly — do not use `!state.isConnected` (null is truthy-ish)
- Never block navigation or mutations just because of offline state — let TanStack Query retry handle it
- Always unsubscribe `NetInfo.addEventListener` in `useEffect` cleanup
- Use `useNativeDriver: true` on all Animated transitions in the banner
- Banner colors must come from `useThemeColors()` — no hardcoded hex
- The first pre-auth request of a session is prefetched at bootstrap, retried across several short attempts, and shows escalating loading copy — never a bare spinner that flips to an error on the first slow attempt
- Retry predicates match on transient error classes only; a retry count alone will happily re-send requests that can never succeed
