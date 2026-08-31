# Carousels & Horizontal Scrollers

Covers carousels, media rails, chip/filter rows, scrollable tab strips, and any
region that scrolls horizontally. A horizontally scrolling region is a designed
component, never incidental overflow — if content overflows by accident, that is
a responsive bug (see `web-app` → `references/responsive-design.md`), not a
scroller.

---

## Scrollbar Rule — Non-Negotiable

**Hide the native scrollbar on touch surfaces. Never hide the ability to scroll.**

Mobile and tablet browsers already overlay a transient scroll indicator; a
persistent horizontal scrollbar under a carousel is platform chrome bleeding
into the design. Hide the indicator only:

```css
.scroller {
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: none;         /* Firefox */
  -ms-overflow-style: none;      /* legacy Edge */
}
.scroller::-webkit-scrollbar {   /* WebKit and Blink */
  display: none;
}
```

Tailwind: define this once as a `scrollbar-none` utility (or use the project's
existing plugin) rather than repeating the three declarations per component.

### What you must add back

Hiding the scrollbar removes the only built-in signal that more content exists.
Every touch scroller must carry at least one replacement affordance:

| Affordance | Use when |
|---|---|
| **Peek** — next item partially visible (e.g. `1.15` items per viewport) | Default choice for card and media rails |
| **Pagination dots / `n of m`** | Full-width slides, hero carousels, onboarding |
| **Edge fade or mask** | Chip rows and tab strips where a peek looks unbalanced |
| **Visible arrows** | Pointer-driven layouts; pair with peek on touch |

A hidden scrollbar with no affordance is a defect. If a rail's items happen to
align flush with the viewport edge, the region looks like a finished grid and
users never swipe.

### Where NOT to hide it

- Never hide the vertical page scrollbar on desktop web — it is the primary
  position indicator for the whole document.
- Never hide a scrollbar on a region a keyboard or low-vision user must operate
  unless equivalent visible controls exist.
- Data tables that scroll horizontally on desktop keep a visible (optionally
  styled, slim) scrollbar; the columns beyond the fold have no other signal.

On pointer-driven web, either keep a slim styled scrollbar or provide arrows.
Discoverability must never depend on an invisible scrollbar.

---

## Snap & Sizing

```css
.scroller {
  display: flex;
  gap: var(--space-3);
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--page-gutter);
}
.scroller > * {
  flex: 0 0 auto;
  scroll-snap-align: start;
}
```

- `scroll-snap-align: start` for rails; `center` only for full-width hero slides.
- Use `scroll-snap-type: x proximity` when items vary in width — `mandatory` on
  mixed widths fights the user mid-drag.
- Size items in fractional viewport units so the peek is intentional:
  `flex-basis: calc(85% - var(--space-3))` on mobile, fixed or `minmax()` widths
  from `md` up.
- Match `scroll-padding-inline` to the page gutter so a snapped item aligns with
  the surrounding content, not the container edge.
- Height: `clamp()` between breakpoints rather than a fixed px value.

---

## Required States

| State | Design |
|---|---|
| First / last item | Disable the corresponding arrow (do not hide it — the layout would shift), or design an explicit loop |
| Fewer items than visible slots | Align to the start, do not stretch items to fill |
| Exactly one item | Render as a plain block: no arrows, no dots, no snap |
| Loading | Skeleton items at the real item width, same count as a typical page |
| Empty | Standard empty state at full region width, not an empty scroll track |
| Error | Inline retry within the region; the rest of the page keeps working |

---

## Autoplay

Default to no autoplay. When the product requires it:

- Pause on hover, on focus within, and on touch.
- Provide a visible pause/play control — not just an implicit pause.
- Never autoplay under `prefers-reduced-motion: reduce`.
- Minimum 5s per slide; anything faster is unreadable.

---

## Accessibility

- The scroll container needs `tabindex="0"` and an accessible name when it has no
  focusable controls of its own, so keyboard users can scroll it with arrow keys.
- Focus must never land on an item clipped outside the visible area — scroll it
  into view on focus.
- Announce position (`Item 3 of 8`) via a live region or per-slide label.
- Arrows and dots are real `<button>`s with accessible names (`Previous`,
  `Go to slide 3`), never decorative divs.
- Under `prefers-reduced-motion: reduce`, replace smooth scrolling with an
  instant jump.

```css
@media (prefers-reduced-motion: no-preference) {
  .scroller { scroll-behavior: smooth; }
}
```

---

## Gesture Boundaries

- `overscroll-behavior-x: contain` stops a horizontal swipe from triggering
  browser back-navigation or scrolling an ancestor.
- Do not attach custom drag handlers that swallow vertical scroll — a mostly
  vertical gesture inside a horizontal rail must still scroll the page.
- Avoid nesting a horizontal scroller inside another horizontal scroller.

---

## Checklist

- [ ] Native scrollbar hidden on touch surfaces; scrolling still works
- [ ] Vertical page scrollbar untouched on desktop
- [ ] At least one discoverability affordance (peek, dots, fade, or arrows)
- [ ] Snap alignment and scroll padding match the page gutter
- [ ] First/last, single-item, few-items, loading, empty, and error states designed
- [ ] Keyboard-operable with visible focus; focused item scrolled into view
- [ ] Position announced to screen readers
- [ ] Autoplay (if any) pauses on hover/focus/touch and respects reduced motion
- [ ] `overscroll-behavior-x: contain` set; vertical page scroll not trapped
