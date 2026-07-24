# Layout & Safe Areas

## Keyboard Avoidance

- Always use `behavior="padding"` on `KeyboardAvoidingView` — both iOS and Android.
- Never use `behavior="height"` — it shrinks the container but does not scroll the focused input into view on Android, causing inputs to be hidden behind the keyboard.
- No platform branching needed: `behavior="padding"` works correctly on both platforms.

```tsx
<KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
  {children}
</KeyboardAvoidingView>
```

## Safe Areas

- Always consume safe area insets via `useSafeAreaInsets()` from `react-native-safe-area-context`.
- Never hardcode bottom spacing without including `insets.bottom`.
- Always include `insets.bottom` in bottom spacing for:
  - Custom bottom navigation bars
  - Sticky/floating action buttons
  - Bottom sheets
  - Full-screen modals
  - Scroll view content padding

```tsx
const insets = useSafeAreaInsets();

// Correct
<View style={{ paddingBottom: insets.bottom + 16 }} />

// Wrong — breaks on devices with home indicator
<View style={{ paddingBottom: 16 }} />
```

- Wrap the app root in `<SafeAreaProvider>` from `react-native-safe-area-context`.
- Use `contentInsetAdjustmentBehavior="automatic"` on `ScrollView` instead of a `<SafeAreaView>` wrapper.

### Bottom-inset ownership

- Give each bottom edge one safe-area owner. When a screen hosts a custom
  bottom-anchored surface, exclude the bottom edge from the screen wrapper and
  apply `insets.bottom` to the surface itself. Its background should reach the
  physical screen edge while its controls remain above system navigation.
- Do not absolutely position that surface inside a parent that still has bottom
  safe-area padding. The parent padding moves or changes the surface's containing
  block and can create either overlap or a differently colored gap.
- Scroll content still needs occlusion clearance for the anchored surface. Compute
  that clearance from the surface height plus the bottom inset, but do not also
  use it as outer safe-area padding on the screen wrapper.
- Apply wrapper-owned, inset-aware clearance after caller style composition, or
  keep equivalent hardcoded padding out of caller styles so it cannot override
  the computed value.
- When changing a shared wrapper's bottom-edge behavior, audit every consumer of
  its bottom slot. A bottom element in normal flow must take ownership of the
  inset itself even though it is not absolutely positioned.
- Verify bottom surfaces with Android gesture navigation and three-button
  navigation, in every supported theme. Check both unobscured controls and which
  surface background continues behind the system navigation area.
