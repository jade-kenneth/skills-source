---
name: mobile-native-ui-design
description: "Design and review production-grade mobile interfaces for iOS and Android, including platform adaptation, tokens, typography, color, motion, navigation, accessibility, iconography, brand, research, and handoff. Use for any mobile UI screen or component, native-feel critique, iOS-versus-Android decision, dark-mode or touch-target audit, animation or haptic specification, navigation architecture, cross-platform design system, or mobile HTML mockup. Pair with the mobile implementation skill when writing application code."
metadata:
  version: 3.4.0
license: MIT
---

# Mobile Native UI Design

Design cross-platform mobile experiences that share product identity while
respecting native iOS and Android behavior. This file is the routing hub and
non-negotiable contract; detailed guidance lives in `references/`.

## Authority and pairing

Apply instructions in this order:

1. The user's requested workflow, audience, and explicit constraints.
2. The companion `mobile-app` skill for code architecture, state, data,
   navigation implementation, performance, and repository conventions.
3. Existing application tokens, components, brand, and established patterns.
4. This skill's platform, visual, interaction, motion, and accessibility rules.

This skill owns design decisions, not application architecture. Invoke
`mobile-app` when implementation code is in scope.

## Progressive-disclosure workflow

1. Identify whether the task is design, critique, implementation guidance,
   mockup production, research, or handoff.
2. Inspect existing tokens, components, screens, platform branches, and nearby
   patterns before proposing a new visual language.
3. Read the smallest relevant references from the map below.
4. Use `references/design-system-complete.md` only when the task spans several
   design disciplines or needs the full critique and handoff framework.
5. Validate both platforms, both color modes, accessibility, interaction states,
   and reduced-motion behavior before reporting completion.

## Reference map

| Concern | Read |
| --- | --- |
| Full design system, research, critique, brand, platform tables, and handoff | `references/design-system-complete.md` |
| Visual principles and product-quality critique | `references/visual-design-principles.md` |
| Typography and dynamic-type implementation | `references/typography-implementation.md` |
| Icons and theme-aware icon color | `references/icons.md` |
| Animation and reduced motion | `references/animations.md` |
| Gradients and theme adaptation | `references/gradients.md` |
| Blur, glass, shadows, and visual effects | `references/visual-effects.md` |
| Native tabs | `references/tabs.md` |
| Toolbars and headers | `references/toolbar-and-headers.md` |
| Search | `references/search.md` |
| Controls and form inputs | `references/controls.md` |
| Form sheets and keyboard behavior | `references/form-sheet.md` |
| Native date picker fields | `references/date-picker-field.md` |
| Loading skeletons | `references/loading-skeleton.md` |
| Empty states | `references/empty-states.md` |
| Toasts and transient feedback | `references/toast-feedback.md` |
| Network banners and offline states | `references/network-banner.md` |
| Media and image behavior | `references/media.md` |
| Zoom transitions | `references/zoom-transitions.md` |
| Route organization | `references/route-structure.md` |
| Local storage choices | `references/storage.md` |
| WebGPU or Three.js surfaces | `references/webgpu-three.md` |

## Non-negotiable design contract

### Platform adaptation

- Preserve information architecture, terminology, core task flow, validation
  rules, and brand identity across platforms.
- Adapt navigation, system controls, sheets, menus, gestures, back behavior,
  typography metrics, and haptics to each platform's conventions.
- Do not copy web interaction patterns into mobile when a native control or
  navigation behavior exists.
- Make convergence or divergence explicit when it affects implementation or QA.

### Tokens and themes

- Use semantic application tokens instead of raw colors, spacing, type sizes,
  radii, or shadows.
- Design light and dark modes together. Do not treat dark mode as an inverted
  light palette or rely on pure black and white defaults.
- Verify text, icons, controls, illustrations, charts, focus states, disabled
  states, skeletons, and feedback surfaces independently in both modes.
- Preserve existing tokens and brand decisions unless the user explicitly asks
  for a design-system change.

### Interaction and state coverage

- Define default, pressed, focused, selected, disabled, loading, error, empty,
  offline, and success states when applicable.
- Use native-feeling feedback: platform-appropriate gestures, transitions,
  haptics, keyboard behavior, and back navigation.
- Keep primary actions reachable without sacrificing safe areas or obscuring
  content behind the keyboard.
- Respect reduced-motion preferences and keep essential state changes legible
  without animation.

### Accessibility floor

- Meet a minimum 44×44 pt target on iOS and 48×48 dp target on Android unless
  the existing design system provides a stricter accessible standard.
- Provide accessible names, roles, values, and state announcements for controls.
- Support dynamic type or font scaling without clipped actions or lost content.
- Never communicate validation, selection, or status through color alone.
- Verify contrast in every supported theme and preserve logical screen-reader
  and focus order where relevant.

### Visual quality

- Establish clear hierarchy before adding decoration. Spacing, typography,
  grouping, and alignment should explain the interface at a glance.
- Use depth, motion, gradients, and illustration intentionally; repeated effects
  without semantic purpose make mobile interfaces feel synthetic.
- Keep productivity and operational tools calm and scannable. Let consumer or
  expressive products carry more atmosphere when the brand supports it.
- Critique the rendered result, not just source values. Check hierarchy, density,
  platform fit, state clarity, and visual rhythm at realistic sizes.

## HTML mockups

When mobile screens must be represented in HTML, treat HTML as a presentation
medium rather than the final platform implementation:

- Translate safe areas, native bars, sheets, touch targets, theme tokens, and
  responsive device widths into their closest CSS equivalents.
- Show platform differences explicitly when they materially affect the design.
- Keep mockups self-contained unless the task provides an approved asset or
  dependency pipeline.
- State which behaviors are approximations that native implementation must replace.
- Mark the target surface with `data-prototype-surface="mobile"` and place exactly
  one `data-app-root` around the real screen. Keep device frames, desktop preview
  canvases, labels, and annotations outside that boundary.
- Treat reference device dimensions as comparison targets, never as a fixed-width
  container that ships inside the app.

## Completion checklist

- [ ] Existing application design language and tokens were inspected.
- [ ] Relevant references were read instead of loading the entire library by default.
- [ ] iOS and Android convergence/divergence decisions are explicit.
- [ ] Light and dark modes are covered.
- [ ] Applicable loading, empty, error, disabled, offline, and success states are covered.
- [ ] Touch targets, scaling, contrast, labels, and state announcements are accessible.
- [ ] Motion includes reduced-motion behavior.
- [ ] The companion `mobile-app` skill governed implementation details.
