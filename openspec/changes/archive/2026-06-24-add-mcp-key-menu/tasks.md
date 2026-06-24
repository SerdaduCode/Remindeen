## 1. Floating menu

- [x] 1.1 Replace the standalone sign-out floating button in `ProductivityPage.tsx` with a menu trigger button
- [x] 1.2 Menu offers two entries: "Sign out" (existing `signOut` handler) and "MCP Keys" (opens the keys modal)

## 2. Keys modal — list and revoke

- [x] 2.1 Build a glass modal (styled consistently with `HabitFormModal.tsx`) that fetches and lists the user's keys via `GET /auth/api-keys`
- [x] 2.2 Render `label`, `createdAt`, `lastUsedAt`, `expiresAt` per key; no plaintext/hash ever shown
- [x] 2.3 Add a revoke action per key that opens a confirmation step naming the key's label before calling `DELETE /auth/api-keys/:id`
- [x] 2.4 Refresh the list after a successful revoke

## 3. Keys modal — generate

- [x] 3.1 Add a "Generate New Key" action with an optional `label` input, calling `POST /auth/api-keys`
- [x] 3.2 On success, show the plaintext token in a dedicated reveal view with a copy-to-clipboard button and a clear "won't be shown again" warning
- [x] 3.3 Ensure the plaintext token is held only in local component state and is cleared when the reveal view closes — never written to any persisted store
- [x] 3.4 Refresh the list after a successful generate, showing the new key's metadata (without its plaintext) alongside existing keys

## 4. Verification

- [ ] 4.1 Manually verify: generate a key, copy it, confirm it appears in the list with correct metadata
- [ ] 4.2 Manually verify: revoke a key, confirm it disappears from the list
- [ ] 4.3 Manually verify via devtools/storage inspector that no plaintext key value is ever present in `chrome.storage`
- [ ] 4.4 Manually verify the menu correctly gates both actions behind sign-in (consistent with the rest of the Productivity page)
