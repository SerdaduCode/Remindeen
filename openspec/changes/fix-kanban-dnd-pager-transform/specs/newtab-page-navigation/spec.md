## MODIFIED Requirements

### Requirement: Animated page transition
Switching the active page SHALL animate with a horizontal slide transition rather than an instant cut. The transition SHALL NOT use CSS `transform` (or any CSS property that creates a new containing block for `position: fixed` descendants) on an element that wraps page content — ensuring `position: fixed` elements within a page (such as drag-and-drop overlays) are positioned relative to the viewport, not a transformed ancestor.

#### Scenario: Slide transition on page change
- **WHEN** the active page changes from Page 1 to Page 2
- **THEN** the container visually slides horizontally to reveal Page 2 instead of switching instantly
