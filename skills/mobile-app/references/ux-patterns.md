# UX Patterns

## Lists

- Use `FlatList` or `SectionList` for any list with more than ~10 items or unknown length.
- Never `.map()` inside a `ScrollView` for long or dynamic collections — causes blank screens and jank on large datasets.
- Use `keyExtractor` returning a stable unique string — never use array index.

## Horizontal Rails and Carousels

- Use a horizontal `FlatList`, not `ScrollView` + `.map()`.
- Always set `showsHorizontalScrollIndicator={false}` — native rails never show a scrollbar.
- Because the indicator is hidden, leave a visible affordance that the rail scrolls: a peek of the next card, pagination dots, or an edge fade. A card flush with the screen edge reads as a finished row and never gets swiped.
- Derive card width from `Dimensions.get('window').width` minus gutters and peek; never hard-code a width for one reference device.
- `snapToInterval` must equal card width **plus** gap, paired with `decelerationRate="fast"`. Use `pagingEnabled` only for true full-width slides.
- Put horizontal padding on `contentContainerStyle`, never on the list, so the first and last cards scroll fully into view.
- Keep long vertical lists' indicators — hiding the indicator is a horizontal-rail rule, not a global one.

## Search Inputs

- Always debounce raw search text before passing to query variables or API triggers.
- Minimum debounce: 300ms. Use `useDebounce` or a `setTimeout`-based hook.
- Never fire a network request on every keystroke.

## Inline Flows (Create / Edit)

- Prefer modals, bottom sheets, or inline editors for create and edit flows.
- Only push to a new screen when the form is complex enough to warrant its own context (multi-step, file uploads, etc.).
- Always provide an explicit dismiss affordance (close button) — never rely only on back gesture.

## Screen States

Every screen that fetches data must handle all four states:

| State | What to show |
|---|---|
| Loading | Skeleton matching the eventual layout |
| Empty | Friendly empty state with icon + message + optional CTA |
| Error | Clear error message + retry action |
| Success | The actual content |

Never ship a screen that shows a blank view during loading or an unhandled error.

## Analytics

- Use the project's centralized analytics utility — never call a raw analytics SDK directly in a component.
- Place tracking calls at the feature level (screen mount, user action) — not scattered across low-level components.
- Never track PII (names, emails, addresses) in analytics events.
- Guard analytics initialization and event sending correctly.
- Respect consent requirements where applicable.
- Keep screen tracking and event tracking consistent.
