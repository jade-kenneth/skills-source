# Native protected-resource permissions

Use this reference whenever an Expo or React Native dependency accesses the photo library, camera, microphone, location, contacts, notifications, Bluetooth, or another OS-protected resource.

## Required workflow

1. List the protected capabilities the feature actually uses.
2. Read the installed dependency's config-plugin documentation and platform permission requirements. Do not assume a runtime permission request also writes native metadata.
3. Configure native permission metadata through the supported Expo config plugin or established native configuration path.
4. Write human-readable purpose text describing the user-visible reason for each capability.
5. Apply least privilege. Do not declare or request a protected resource merely because a dependency supports it. Disable optional permissions when the plugin enables them by default and the product does not use them.
6. Handle granted, denied, restricted, and limited-library states without crashing or trapping the user.
7. Regenerate native projects through the repository's supported prebuild workflow when required. Do not hand-edit generated output as the canonical fix.
8. Build the affected native target and verify generated metadata in the native project and compiled or installed application.
9. Test the real permission flow. Lint, typecheck, and JavaScript-only tests are not sufficient evidence for native configuration.

## Expo ImagePicker example

For `expo-image-picker`, configure the supported plugin fields for photo-library and camera access when used. Configure microphone access only when the product records media with audio; otherwise disable or omit it according to the installed Expo version's documented behavior.

Verification should cover expected iOS usage-description keys, only required Android permissions, a successful native rebuild, installed-binary metadata when practical, and relevant allow/deny/limited-library behavior.

Keep permission wording product-owned. Skills define the requirement and verification method, not reusable product copy.

## Review blockers

- A protected resource is used without native purpose metadata.
- Purpose text is vague, misleading, or unrelated to the user-visible feature.
- Optional camera, microphone, location, or library access is declared without a feature need.
- The fix is verified only by lint/typecheck or JavaScript configuration inspection.
- Generated native files are manually patched while source configuration remains incorrect.
- Denial or limited access causes a crash, blank screen, or retry loop.

## Related references

- `dependency-management.md`
- `platform-patterns.md`
- `security.md`
- `error-handling.md`
