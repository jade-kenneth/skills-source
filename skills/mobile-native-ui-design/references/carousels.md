# Carousels & Horizontal Rails

Covers carousels, media rails, chip and filter rows, and any horizontally
scrolling region on a native screen.

---

## Scroll Indicator — Non-Negotiable

**Always hide the horizontal scroll indicator on mobile.** Native horizontal
rails do not show scrollbars; a visible indicator immediately reads as a ported
web layout.

```tsx
<FlatList
  horizontal
  data={items}
  showsHorizontalScrollIndicator={false}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <Card item={item} />}
/>
```

Apply the same on `ScrollView`, and use `showsVerticalScrollIndicator={false}`
only for short, non-scroll-critical vertical regions — a long vertical list keeps
its indicator, because it is the only sense of position the user has.

Hiding the indicator removes the only built-in signal that more content exists,
so the layout must supply one:

| Affordance | Use when |
|---|---|
| **Peek** — next card partially visible | Default for card and media rails |
| **Pagination dots / `n of m`** | Full-width slides and onboarding |
| **Edge fade** | Chip rows where a peek looks unbalanced |

A rail whose last visible card ends flush with the screen edge reads as a
finished row and never gets swiped. Leave a peek.

---

## Snap & Sizing

```tsx
const GUTTER = 16;
const GAP = 12;
const CARD_WIDTH = Dimensions.get('window').width - GUTTER * 2 - 24; // 24pt peek

<FlatList
  horizontal
  data={items}
  showsHorizontalScrollIndicator={false}
  snapToInterval={CARD_WIDTH + GAP}
  snapToAlignment="start"
  decelerationRate="fast"
  contentContainerStyle={{ paddingHorizontal: GUTTER, gap: GAP }}
  renderItem={({ item }) => <Card style={{ width: CARD_WIDTH }} item={item} />}
/>
```

- `snapToInterval` must equal item width **plus** gap, or the rail drifts out of
  alignment after a few items.
- `decelerationRate="fast"` with snapping; the default feels sloppy.
- `pagingEnabled` only for true full-width slides — it snaps to the screen width,
  which is wrong whenever there is a peek or gutter.
- Put horizontal padding on `contentContainerStyle`, never on the list itself, so
  the first and last items can still scroll fully into view.
- Derive the card width from the window width so the peek survives every device
  size; never hard-code a card width for one reference device.

---

## Performance

- Use `FlatList` for rails, not `ScrollView` + `.map()` — same rule as vertical
  lists.
- Set `initialNumToRender` to roughly the visible count plus one.
- Give `getItemLayout` when items are a fixed width; it makes `scrollToIndex`
  reliable for dots and deep links.
- `removeClippedSubviews` helps long media rails on Android.

---

## Required States

| State | Design |
|---|---|
| Fewer items than fit | Align to the start; do not stretch cards |
| Exactly one item | Render as a plain card — no rail chrome, no dots, no snap |
| Loading | Skeleton cards at the real card width |
| Empty | Empty state at full region width, not an empty track |
| Error | Inline retry inside the region; the rest of the screen stays usable |

---

## Gestures & Nesting

- A horizontal rail inside a vertical scroll must not trap the vertical gesture.
  Keep the rail's height tight and avoid custom pan handlers that claim both axes.
- Do not nest a horizontal rail inside another horizontal scroller.
- On iOS, a rail near the screen edge competes with the interactive pop gesture —
  leave the leading gutter clear or disable the swipe-back on that screen only
  when the product genuinely requires an edge-to-edge rail.

---

## Autoplay

Default to none. When required: pause on touch, provide a visible pause control,
respect `AccessibilityInfo.isReduceMotionEnabled()`, and never autoplay faster
than one slide per 5 seconds.

---

## Accessibility

- Each card is one accessible element (`accessible`, `accessibilityRole="button"`,
  `accessibilityLabel`), not a pile of separately focusable children.
- Announce position with an `accessibilityValue` of `{ text: 'Item 3 of 8' }`
  built from the index, or an equivalent label.
- Pagination dots need `accessibilityRole="button"` and real labels; do not ship
  them as untouchable decoration when they are tappable.
- Screen readers scroll the rail by swiping through items — verify the whole rail
  is reachable with VoiceOver and TalkBack, not just the first two cards.

---

## Checklist

- [ ] `showsHorizontalScrollIndicator={false}` on every horizontal rail
- [ ] A peek, dots, or edge fade signals that more content exists
- [ ] `snapToInterval` = item width + gap; `decelerationRate="fast"`
- [ ] Horizontal padding on `contentContainerStyle`, not the list
- [ ] Card width derived from window width, not hard-coded for one device
- [ ] `FlatList` (not `ScrollView` + map) with a stable `keyExtractor`
- [ ] Few-items, single-item, loading, empty, and error states designed
- [ ] Vertical scroll not trapped by the rail
- [ ] Item position announced; every card reachable by screen reader
- [ ] Autoplay (if any) pauses on touch and respects reduced motion
