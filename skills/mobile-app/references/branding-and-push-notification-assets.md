# Mobile Branding and Push Notification Assets

## What to Configure

- **App display name** — shown on the home screen and in the app switcher
- **Launcher icon** — shown on device launchers and in app stores
- **Splash screen image** — displayed during app load
- **Push notification icon** — shown in the notification tray (Android)
- **Android notification channel name** — displayed in system notification settings

## Files to Update

| File                                                                           | What to change                                                                                 |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `apps/*-mobile/app.json`                                             | `expo.name`, launcher-icon paths, `expo.plugins[expo-splash-screen].image`, `expo.plugins[expo-notifications].icon` |
| `apps/*-mobile/ios/<AppName>/Info.plist`                             | `CFBundleDisplayName`                                                                          |
| `apps/*-mobile/features/notifications/push-notifications.ts`         | Android default channel name                                                                   |
| `apps/*-mobile/features/notifications/local-notification-testing.ts` | Android local test channel name                                                                |

## Steps to Change Branding

1. Replace or add asset files in `apps/*-mobile/assets/`.
2. Update `apps/*-mobile/app.json`:
   - `expo.name` — app display name
   - `expo.icon`, or the launcher-icon fields for every shipped native target
   - `expo.plugins[expo-splash-screen].image` — path to splash image
   - `expo.plugins[expo-notifications].icon` — path to notification icon
3. Update `CFBundleDisplayName` in `apps/*-mobile/ios/<AppName>/Info.plist`.
4. Update Android notification channel names in:
   - `apps/*-mobile/features/notifications/push-notifications.ts`
   - `apps/*-mobile/features/notifications/local-notification-testing.ts`
5. Rebuild and reinstall the app to verify branding and notification behavior.

## Important Notes

- **Declare every shipped native target** — use a top-level `expo.icon` as the
  shared fallback, or configure both `expo.ios.icon` and the applicable Android
  launcher-icon fields. A platform-specific icon overrides the top-level icon for
  that platform; configuring Android alone does not configure iOS, or vice versa.
- **Keep launcher sources tracked** — when `ios/` and `android/` are generated and
  ignored, the canonical icon files belong in a tracked asset directory and the
  app config must reference them. Fix the config or source asset, then regenerate;
  do not patch generated asset catalogs because the next clean prebuild replaces
  them. For a checked-in native project that does not use Expo Prebuild, update its
  native asset catalogs through the repository's established workflow instead.
- **Apply platform-specific image rules** — an iOS PNG source should be exactly
  square, fill the canvas, and contain no rounded corners or transparent pixels;
  1024×1024 is the standard source size. Android adaptive icons are layered: the
  foreground can use transparency and must preserve the documented safe zone,
  while the background comes from its configured color or image. Do not flatten an
  adaptive foreground merely to satisfy the iOS opacity rule.
- **Verify the generated result** — resolve the public Expo config and confirm a
  non-empty effective icon for each shipped target, verify every referenced file
  exists and meets that target's dimensions/transparency rules, then run the
  repository's clean native generation/build path and inspect the installed icon on
  each target. A successful TypeScript check or JavaScript bundle does not verify
  launcher assets.
- **Android notification icons** must be simple white glyphs on a transparent background. Full-color images will render incorrectly on most devices.
- **Android notification channel metadata** is cached by the OS. If channel name changes do not appear, reinstall the app or clear app data.
- **Native folders present** — if the project includes `android/` and `ios/` directories, app name changes must be kept in sync in both the Expo config and the native files.
- **iOS** — changes to `expo.name` alone are not enough when native folders exist; `CFBundleDisplayName` in `Info.plist` must also be updated.
