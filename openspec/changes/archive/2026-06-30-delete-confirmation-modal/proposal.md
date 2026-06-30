## Why

Five places in the app call `window.confirm()` for destructive actions (deleting a habit, task, comment, API key, and resetting activity logs). Browser native dialogs are visually jarring, cannot be styled to match the app's dark glass aesthetic, and are blocked entirely in some browser extension contexts — making the confirmation silently skip. Replacing them with inline confirmation UI keeps the flow consistent and ensures the guard always runs.

## What Changes

- Replace `window.confirm()` in `HabitFormModal` (delete habit) with an inline confirmation panel that appears within the same modal when the Delete button is clicked.
- Replace `window.confirm()` in `TaskFormModal` (delete task) with the same inline pattern.
- Replace `window.confirm()` in `TaskFormModal` (delete comment) with the same inline pattern on the comment row.
- Replace `window.confirm()` in `ApiKeysModal` (revoke API key) with the same inline pattern.
- Replace `confirm()` in `Today.tsx` (reset activity logs) with the same inline pattern.
- Extract a shared `ConfirmDeletePanel` component (or hook) to keep the confirm state logic consistent across all five call sites.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `kanban-tasks`: delete-task and delete-comment confirmations no longer use `window.confirm()`; now shown inline within the task modal.
- `mcp-key-management`: revoke-key confirmation no longer uses `window.confirm()`; now shown inline within the API keys modal.
- `habit-tracking`: delete-habit confirmation no longer uses `window.confirm()`; now shown inline within the habit form modal.

## Impact

- `components/remindeen/habit/HabitFormModal.tsx` — add `showDeleteConfirm` state, render confirmation panel
- `components/remindeen/kanban/TaskFormModal.tsx` — add `showDeleteConfirm` and `confirmDeleteCommentId` states, render confirmation panels
- `components/remindeen/productivity/ApiKeysModal.tsx` — add `confirmRevokeKey` state, render confirmation panel
- `components/remindeen/sidepanel/Today.tsx` — add `showResetConfirm` state, render confirmation panel
- New shared component: `components/ui/confirm-delete-panel.tsx` (or equivalent inline pattern)
- No new dependencies, no API changes, no backend changes
