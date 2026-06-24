## Context

The extension already shares a Google/Supabase session across all contexts (`extension-auth`), and `ProductivityPage.tsx` already gates its entire signed-in view behind `isSignedIn` — so any UI placed inside that view automatically requires sign-in, with no extra guard needed. It already has one floating control (a sign-out button, `absolute bottom-4 right-4`) and one glass-modal precedent (`HabitFormModal.tsx`), both of which this proposal reuses rather than inventing new patterns.

`/auth/api-keys` already restricts CORS to `EXTENSION_ORIGIN` (not `*`), so no other website can call these endpoints even if it tricked a signed-in user into visiting it — that boundary is already correct and needs no change here.

## Goals / Non-Goals

**Goals:**
- Let a signed-in user generate, label, list, and revoke their own MCP keys without leaving the extension.
- Never let a plaintext key value end up somewhere it can be read back later (persisted storage, long-lived cache).
- Make revocation hard to do by accident (confirmation step), since it immediately breaks whatever automation is using that key.

**Non-Goals:**
- Any UI awareness of MCP itself (tools, transport, etc.) — this UI only manages credentials, exactly mirroring what `/auth/api-keys` already returns.
- A cap on the number of active keys per user — al-quotes doesn't enforce one; this UI doesn't add one either.
- Changing how Sign out itself behaves — it's relocated into the new menu, not modified.

## Decisions

**Single combined menu, not two separate floating buttons.**
Sign out and MCP Keys both become entries in one floating menu trigger, rather than two separate icons competing for the same corner of the page. This keeps the Productivity page's chrome to one control as more actions are added later, instead of accumulating a row of icons.

**Plaintext key reveal: shown directly, not masked-by-default.**
Decided by analogy to GitHub's personal-access-token flow: since the user's very next action is almost always "copy this and paste it somewhere else" (e.g. into Hermes Agent's config), masking-then-revealing adds a click without adding real protection — anyone able to see the screen at "masked" state can also click reveal. *(Flagged as a judgment call, not something explicitly confirmed in discussion — open to revisiting if shoulder-surfing/screen-share exposure during the reveal step turns out to matter more than the extra click.)*

**No persistence of plaintext token, anywhere.**
The token lives only in the modal's local component state, set on the create response and cleared on close/unmount. It must not pass through any zustand store that persists to `chrome.storage`, and should not be cached by whatever data-fetching layer is used for the key list (the list endpoint never returns plaintext anyway, so this only applies to the single create-response value).

**Revoke requires confirmation naming the key's label.**
Revoking is the one destructive action here — unlike generating (additive) or listing (read-only), it immediately and irreversibly cuts off whatever automation holds that key. The confirmation dialog states the label so the user isn't guessing which key they're about to kill.

## Risks / Trade-offs

- **[Risk]** This change edits the same file (`ProductivityPage.tsx`) that `redesign-productivity-glass-ui` is still actively building out → **Mitigation**: sequence this change after that one archives.
- **[Trade-off]** No enforced key limit means a user could accumulate many forgotten keys with no prompt to clean up — acceptable since revocation is always available and al-quotes' sliding expiry (30 days unused) eventually lapses anything truly abandoned.

## Migration Plan

1. Land after `redesign-productivity-glass-ui` archives.
2. Build the keys modal (list/generate/revoke) calling existing `/auth/api-keys` endpoints with the extension's existing authenticated-fetch helper (same one used for `/tasks`/`/habits`, including its 401-refresh behavior).
3. Replace the sign-out floating button with the combined menu trigger.
4. Manually verify in the actual built extension: generate → copy → list shows it → revoke → list no longer shows it; confirm via devtools that the plaintext token never appears in `chrome.storage` contents.

## Open Questions

- Masked-by-default reveal vs. immediate plaintext (see Decisions above) — open to feedback once it's actually in front of a user.
- Should the menu show a count badge if any key is close to its 30-day sliding expiry without recent use? Not designed here; would require the list endpoint response to be checked client-side against `expiresAt`.
