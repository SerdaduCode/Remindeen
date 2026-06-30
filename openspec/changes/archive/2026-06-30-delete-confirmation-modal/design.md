## Context

All five `window.confirm()` call sites live in modal-style components that render via `createPortal` directly onto `document.body`. The app uses a custom dark glass design (`bg-zinc-900/70`, `ring-1 ring-white/15`, `backdrop-blur-2xl`) with no Radix `Dialog` or `AlertDialog` primitive installed. Adding a nested modal would require a new Radix dependency and z-index management between two overlapping portals.

The inline approach avoids both: the existing modal shell stays on screen, the form content is conditionally replaced by a compact confirmation panel, and no new dependencies are needed.

## Goals / Non-Goals

**Goals:**
- Replace all five `window.confirm()` call sites with styled inline confirmation UI
- Keep the implementation DRY via a shared `ConfirmDeletePanel` component
- Match the existing dark glass visual language exactly
- Work correctly in browser extension sidepanel and popup contexts where `window.confirm()` may be blocked

**Non-Goals:**
- Replacing `window.confirm()` in any location outside the five identified call sites
- Adding animation/transition between form and confirm states (keep it simple)
- Using Radix `AlertDialog` or any new Radix dependency
- Any backend or API changes

## Decisions

### Inline state swap, not a nested modal

When the user clicks "Delete" (or "Revoke" / "Reset"), the modal's content area switches to a confirmation panel in place of the form content. The backdrop and modal shell remain. Pressing "Cancel" restores the form; pressing "Confirm" runs the action.

Alternative considered: nested portal modal at `z-60`. Rejected — requires installing `@radix-ui/react-dialog` or similar, adds z-index management complexity, and the UX gain over a clean inline swap is marginal.

### Shared `ConfirmDeletePanel` component

A small presentational component at `components/ui/confirm-delete-panel.tsx` receives `message`, `onConfirm`, and `onCancel` props and renders the confirmation UI. Each call site manages its own `boolean` state that toggles between showing the form and showing the panel.

```
interface ConfirmDeletePanelProps {
  message: string        // e.g. "Hapus habit ini?"
  detail?: string        // secondary line, e.g. "Aksi ini tidak dapat dibatalkan."
  confirmLabel?: string  // defaults to translation key
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}
```

Using a component (not a hook) keeps the JSX co-located with the render path, avoids render-prop complexity, and is easy to read at a glance in each modal file.

### State naming per call site

| Component | State variable | What it guards |
|---|---|---|
| `HabitFormModal` | `showDeleteConfirm: boolean` | Delete habit |
| `TaskFormModal` | `showDeleteConfirm: boolean` | Delete task |
| `TaskFormModal` | `confirmDeleteCommentId: number \| null` | Delete comment (stores the target comment id) |
| `ApiKeysModal` | `confirmRevokeKey: { id: number; label: string } \| null` | Revoke key (stores key metadata for the message) |
| `Today.tsx` | `showResetConfirm: boolean` | Reset activity logs |

### Visual design of `ConfirmDeletePanel`

The panel fills the same space as the form content (no layout shift on the modal shell). It shows:
- A warning message (bold, `text-white/90`)
- An optional detail line (`text-white/50`, smaller)
- Two buttons: `[Batal]` (ghost) and `[Hapus]` / action label (destructive red), same sizing and styling as existing modal buttons

## Risks / Trade-offs

- **State not reset if modal is closed mid-confirm** → The modal's `onClose` handler already unmounts the component, so state is automatically reset. No extra cleanup needed.
- **`confirmDeleteCommentId` vs boolean** → Using the comment id as the confirm state means re-clicking another comment's delete while one is pending would switch targets. This is acceptable since only one delete confirmation is shown at a time and the flow is sequential.
