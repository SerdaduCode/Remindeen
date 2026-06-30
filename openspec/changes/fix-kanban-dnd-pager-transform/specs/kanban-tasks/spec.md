## ADDED Requirements

### Requirement: Drag overlay is unaffected by ancestor visual effects
While dragging a task card, the drag overlay SHALL render visually aligned with the pointer, regardless of any CSS property on ancestor elements that would otherwise create a new containing block for `position: fixed` descendants (e.g. `transform`, `filter`, `backdrop-filter`, `perspective`, `contain: layout|paint|content|strict`, or an equivalent `will-change`). This includes the Kanban panel's glass visual treatment (which uses `backdrop-filter`) and any page-transition mechanism the board happens to be rendered inside of.

#### Scenario: Dragging inside the glass-treated Kanban panel
- **WHEN** the user drags a task card inside the Kanban panel, which uses a `backdrop-filter` blur per the glass visual treatment requirement
- **THEN** the drag overlay appears aligned with the pointer, not offset by the panel's blur

#### Scenario: Dragging during/after a page transition
- **WHEN** the user drags a task card on a page reached via the newtab Pager's slide transition
- **THEN** the drag overlay appears aligned with the pointer, not offset by the transition mechanism
