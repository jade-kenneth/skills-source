# Platform Patterns

## Shared-First Rule

- Default to a single shared implementation for both iOS and Android.
- Only add platform-specific logic when the interaction genuinely feels wrong on one platform, or the UX pattern is clearly different (e.g. navigation, sheets, back gesture).
- Use `process.env.EXPO_OS` for platform checks — not `Platform.OS`.

```tsx
// Correct
if (process.env.EXPO_OS === 'ios') { ... }

// Wrong
if (Platform.OS === 'ios') { ... }
```

## Platform Split Files

- Use `.ios.tsx` / `.android.tsx` only for:
  - Date pickers
  - Action sheets
  - Native modals and bottom sheets
  - Device-specific APIs (haptics, camera, NFC)
- Never split a screen or full feature into platform files — split only the diverging component.

## Expo-First

- Always check for an Expo-compatible library before adding a custom native dependency.
- Prefer: `expo-image`, `expo-audio`, `expo-video`, `expo-haptics`, `expo-camera`, etc.
- Never use removed or deprecated modules: `expo-av` (use `expo-audio`/`expo-video`), legacy `Picker`, legacy `SafeAreaView`, `AsyncStorage` from React Native core.
- Test with Expo Go first. Only create a custom build when a module requires it.

---

## React Native and Expo Rules

Apply these defaults for all mobile work:

- Keep user-facing interfaces responsive and smooth.
- Use `react-hook-form` for forms.
- Use `zod` for validation.
- Use `useFieldArray` for array-based form fields when needed.
- Add loading, empty, and error states for async UI.
- Keep components focused on one responsibility.
- Prefer composition over deeply nested conditionals.
- Follow existing project UI patterns before introducing new ones.
- Prefer inline creation and editing with modals, bottom sheets, or inline panels over pushing users through too many screens.
- Keep create and edit flows responsive and accessible across device sizes.
- Handle keyboard avoidance, safe areas, and scroll behavior correctly.

---

## Platform Compatibility Rules

Keep support aligned with the project compatibility target.

- Prefer stable, broadly supported React Native and Expo APIs.
- Guard or progressively enhance newer APIs.
- Test critical user journeys when a change affects layout, media, forms, navigation, gestures, or native APIs.
- Review package compatibility before adopting niche or native-heavy libraries.

---

## Unstable First-Render Guard

Avoid unstable assumptions in initial render:

- `Dimensions` values that are not updated when layout changes
- Browser-only globals such as `window` and `document`
- Direct storage reads in render if they can delay or destabilize UI

When device-only behavior is required:

- Defer it to `useEffect` or app initialization flows
- Keep the first render stable
- Avoid layout jumps caused by late state hydration

---

## Simulator-only native diagnostics

When a native warning appears only while using a Simulator, first determine
whether the app owns the call before changing application code or dependencies.

1. Reproduce the warning with the smallest normal interaction, and inspect the
   log's framework owner and named resource.
2. Search the app for explicit use of the related device API. A dependency's
   presence alone does not prove that the app caused a system-framework warning.
3. If normal behavior works, the warning is owned by a system framework, and the
   referenced resource is private or absent from the Simulator runtime, verify
   the affected journey on a physical device and check current vendor guidance
   before considering an app-side change.

Do not bundle, synthesize, or copy private operating-system resources into an
app. Do not remove unrelated native dependencies or suppress broad system logs
solely to hide a Simulator warning; both actions can mask useful diagnostics
without correcting the cause.
