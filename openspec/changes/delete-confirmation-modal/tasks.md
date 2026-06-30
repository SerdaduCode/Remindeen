## 1. Shared Component

- [ ] 1.1 Create `components/ui/confirm-delete-panel.tsx` with props: `message: string`, `detail?: string`, `confirmLabel?: string`, `onConfirm: () => void | Promise<void>`, `onCancel: () => void`
- [ ] 1.2 Style the panel to match the existing dark glass modal aesthetic: `text-white/90` for message, `text-white/50` for detail, ghost `[Batal]` button and destructive red `[Hapus]` button using the same sizing as existing modal buttons
- [ ] 1.3 Add i18n keys for default confirm/cancel labels if needed, or reuse existing translation keys

## 2. HabitFormModal

- [ ] 2.1 Add `showDeleteConfirm: boolean` state (default `false`) to `HabitFormModal`
- [ ] 2.2 Replace the `window.confirm(t("habit.form.delete_confirm"))` call in `handleDelete` with `setShowDeleteConfirm(true)`
- [ ] 2.3 In the modal body, conditionally render `<ConfirmDeletePanel>` when `showDeleteConfirm` is `true`, with `onConfirm` calling `onDelete()` and `onCancel` setting `showDeleteConfirm` back to `false`
- [ ] 2.4 When `showDeleteConfirm` is `true`, hide the form content (or replace it entirely with the panel)

## 3. TaskFormModal — Delete Task

- [ ] 3.1 Add `showDeleteConfirm: boolean` state (default `false`) to `TaskFormModal`
- [ ] 3.2 Replace the `window.confirm(t("kanban.form.delete_confirm"))` call in `handleDelete` with `setShowDeleteConfirm(true)`
- [ ] 3.3 Conditionally render `<ConfirmDeletePanel>` when `showDeleteConfirm` is `true`, with `onConfirm` calling `onDelete()` and `onCancel` resetting state

## 4. TaskFormModal — Delete Comment

- [ ] 4.1 Add `confirmDeleteCommentId: number | null` state (default `null`) to `TaskFormModal`
- [ ] 4.2 Replace the `window.confirm(t("kanban.form.comments_delete_confirm"))` call in `handleDeleteComment` with `setConfirmDeleteCommentId(id)`
- [ ] 4.3 Render an inline confirmation UI on the comment row (or as a panel overlay) when `confirmDeleteCommentId` matches that comment's id; `onConfirm` calls `deleteComment(id)` and resets state, `onCancel` resets to `null`

## 5. ApiKeysModal

- [ ] 5.1 Add `confirmRevokeKey: { id: number; label: string } | null` state (default `null`) to `ApiKeysModal`
- [ ] 5.2 Replace the `window.confirm(t("mcp.keys.revoke_confirm").replace("{label}", name))` call with `setConfirmRevokeKey({ id, label: name })`
- [ ] 5.3 Render `<ConfirmDeletePanel>` when `confirmRevokeKey` is not null, with the message naming the key's label; `onConfirm` calls the revoke function and resets state, `onCancel` resets to `null`

## 6. Today.tsx — Reset Activity Logs

- [ ] 6.1 Add `showResetConfirm: boolean` state (default `false`) to `Today`
- [ ] 6.2 Replace the `confirm('Are you sure you want to reset your activity logs?')` call in `resetStats` with `setShowResetConfirm(true)`
- [ ] 6.3 Render `<ConfirmDeletePanel>` when `showResetConfirm` is `true`, with `onConfirm` executing the storage clear and `onCancel` resetting to `false`
- [ ] 6.4 Position the panel within the Today widget card (not a full-screen overlay) to match the widget's compact size

## 7. Verification

- [ ] 7.1 Confirm no remaining `window.confirm()` or bare `confirm()` calls in any of the five modified files
- [ ] 7.2 Test: delete a habit → inline panel appears, cancel returns to form, confirm removes habit
- [ ] 7.3 Test: delete a task → inline panel appears, cancel returns to form, confirm removes task
- [ ] 7.4 Test: delete a comment → inline confirmation appears on the row, confirm removes comment
- [ ] 7.5 Test: revoke an API key → inline panel names the key label, confirm revokes it
- [ ] 7.6 Test: reset activity logs in Today widget → inline panel appears, confirm clears logs
